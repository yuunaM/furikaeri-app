import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventContext } from '../context/EventContext';
import { dataArray } from '../context/EventContext';
import jaLocale from '@fullcalendar/core/locales/ja';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRouter } from 'next/router';
import { Chart as ChartJS, CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from "@/styles/Home.module.css";
import moment from 'moment';
import Image from 'next/image';
import Modal from 'react-modal';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

interface stampEvent {
    title: string;
    start: Date;
}

export default function Calendar() {
    const [graphData, setGraphData] = useState<dataArray[]>([]);
    const [label, setLabel] = useState<string[]>([]);
    const [events, setEvents] = useState<stampEvent[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [countStamp, setCountStamp] = useState<number>();
    const router = useRouter();

    const context = useContext(EventContext);
    if (!context) { // contextがtrueかの確認 これがないとTypescriptではエラーになる
        throw new Error('Calendar must be used within an EventProvider');
    }
    const { fetchArray, disable, btnText } = context; // 分割代入でコンテキストから各ステートを取得

    // dbからデータ取得
    useEffect(() => {
        const fetchContext = async () => {
            setGraphData(fetchArray); // グラフデータ用にステートへ登録
            setLabel(fetchArray.map(item => moment(item.date).format('YYYY-MM-DD'))); // X軸用のラベルをフォーマット

            // カレンダー表示用のスタンプをmap
            const stampEvents = fetchArray.filter(item => item.stamp).map(item => ({
                title: 'スタンプ',
                start: item.date
            }));
            setEvents(stampEvents);

            // 一定期間連続で振り返った場合はモーダルでお祝い表示
            const countStampCheck = [7, 14, 21, 30];
            countStampCheck.forEach((weeks) => {
                const today = new Date();
                const pastWeek = new Date(today);
                pastWeek.setDate(today.getDate() - weeks);

                const stampLength = fetchArray.filter(item => {
                    const itemDate = moment(item.date);
                    const itemStamp = item.stamp
                    return itemDate.isAfter(pastWeek) && itemDate.isBefore(today) && itemStamp === true;
                }).length;

                if (stampLength === weeks) {
                    setModalOpen(true);
                    setCountStamp(weeks);
                }
            });

        }
        fetchContext();
    }, [fetchArray]);


    // カレンダーにスタンプ画像表示
    const renderEventContent = () => {
        return (
            <div>
                <Image src="/stamp.svg" alt="スタンプ" width={300} height={300} layout='responsive' />
            </div>
        );
    };

    const handleAdd = () => {
        router.push('/AddData');
    }

    const handleTop = () => {
        router.push('/');
    }

    const handleClose = () => {
        setModalOpen(false);
    }


    return (
        <div className='data_area jpn_bg'>
            <Modal isOpen={modalOpen} onRequestClose={handleClose}>
                <p className='modalMessage'>今宵は振り返り連続{countStamp}日目じゃ<br />このまま続けるのじゃ</p>
                <button onClick={handleClose}>心得た</button>
            </Modal>
            <div className='cal_area'>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    locale={jaLocale}
                    eventContent={renderEventContent}
                />
            </div>
            <h3 className='cal_ttr'>心持ち</h3>
            <div className='graph_area'>
                {graphData.length > 0 ? (
                    <Line
                        data={{
                            labels: label,
                            datasets: [
                                {
                                    label: '心持ち',
                                    data: graphData.map(item => item.feeling), // y軸のデータ
                                    borderColor: '#b92638', // 線の色
                                    fill: true, // 背景色を有効
                                    backgroundColor: 'rgba(244, 156, 166, 0.2)', // 背景色の色
                                    pointRadius: 6, // ドットのサイズ
                                    pointBackgroundColor: '#b92638', // ドットの背景色
                                    pointBorderColor: '#b92638', // ドットの境界線色
                                    pointBorderWidth: 3, // ドットの境界線幅
                                },
                            ],
                        }}
                        options={{
                            plugins: {
                                legend: {
                                    display: false,
                                }
                            },
                            scales: {
                                x: {
                                    beginAtZero: true,
                                },
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        display: false // y軸のグリッドラインを非表示
                                    },
                                    ticks: {
                                        callback: function (tickValue: string | number) {
                                            // tickValueをnumber型に変換してから処理
                                            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);

                                            if (value % 1 === 0) { // 整数値のみ表示
                                                if (value === 0) return '忌まわしい';
                                                if (value === 1) return '浮かぬ顔';
                                                if (value === 2) return '平　凡';
                                                if (value === 3) return '麗しい';
                                                if (value === 4) return '良き哉';
                                                return value;
                                            }
                                            return '';
                                        }
                                    }
                                }
                            }
                        }}
                    />
                ) : (
                    <p>Loading data...</p >
                )}
            </div>
            <div className='flex'>
                <button onClick={handleAdd} className='linkBtn' disabled={disable}>{btnText}</button>
                <button onClick={handleTop} className='linkBtn'>ほーむ</button>
            </div>
            <p className='cloud set_left'><Image src='/cloud_left.png' alt='雲' width={537} height={496} /></p>
            <p className='cloud set_right'><Image src='/cloud_right.png' alt='雲' width={634} height={537} /></p>
        </div>
    );
}
