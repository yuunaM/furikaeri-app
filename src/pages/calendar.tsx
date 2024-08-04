import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import jaLocale from '@fullcalendar/core/locales/ja';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRouter } from 'next/router';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from "@/styles/Home.module.css";
import moment from 'moment';
import Image from 'next/image';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

interface dataArray {
    comment: string;
    feeling: number;
    stamp: boolean;
    date: Date;
}

interface stampEvent {
    title: string;
    start: Date;
}

export default function Calendar() {
    const [graphData, setGraphData] = useState<dataArray[]>([]);
    const [label, setLabel] = useState<string[]>([]);
    const [events, setEvents] = useState<stampEvent[]>([]);
    const [disable, setDisable] = useState<boolean>(false);
    const [btnText, setBtnText] = useState<string>('振り返る');
    const router = useRouter();

    // const context = useContext(EventContext); // コンテキストの値を'context'に代入
    // if (!context) { // contextがtrueかの確認 これがないとTypescriptはエラーになる
    //     throw new Error('Calendar must be used within an EventProvider');
    // }
    // const { events, setEvents } = context; // 分割代入でコンテキストから'events','setEvents'を取得

    // dbからデータ取得
    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'data'));
                const groupData = querySnapshot.docs.map((doc) => {
                    return {
                        comment: doc.data().comment,
                        feeling: doc.data().feeling,
                        stamp: doc.data().stamp,
                        date: doc.data().createdAt.toDate()
                    }
                });

                const sortedData = dateSortData(groupData);
                setGraphData(sortedData); // グラフデータ用にステートへ登録
                setLabel(sortedData.map(item => moment(item.date).format('YYYY-MM-DD'))); // X軸用のラベルをフォーマット

                // カレンダー表示用のスタンプをmap
                const stampEvents = sortedData.filter(item => item.stamp).map(item => ({
                    title: 'スタンプ',
                    start: item.date
                }));
                setEvents(stampEvents);

                // 振り返りが済んでいるかの確認
                const today = new Date();
                const todayData = moment(today).format('YYYY-MM-DD');

                const lastDay = groupData[groupData.length - 1].date
                const lastData = moment(lastDay).format('YYYY-MM-DD');

                if (todayData === lastData) { // 振り返り済みならボタンのdisabledをtrue
                    setDisable(true);
                    setBtnText('本日振り返り済み');
                }

            } catch (error) {
                console.error('Error fetching profit data: ', error);
            }
        }
        fetchData();
    }, []);

    // 日付順にソート
    const dateSortData = (data: dataArray[]) => {
        const sortData = data.sort((a, b) => {
            const dateA = moment(a.date);
            const dateB = moment(b.date);
            return dateA.diff(dateB);
        });
        return sortData;
    }

    // カレンダーにスタンプ画像表示
    const renderEventContent = () => {
        return (
            <div>
                <Image src="/stamp.png" alt="スタンプ" width={100} height={100} style={{ width: '100%', height: '100%' }} />
            </div>
        );
    };

    const handleAdd = () => {
        router.push('/AddData');
    }

    const handleTop = () => {
        router.push('/');
    }


    return (
        <div className='data_area jpn_bg'>
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
            <p className='cloud set_left'><Image src='/cloud_left.png' alt='雲' layout='responsive' width={537} height={496} /></p>
            <p className='cloud set_right'><Image src='/cloud_right.png' alt='雲' layout='responsive' width={634} height={537} /></p>
        </div>
    );
}
