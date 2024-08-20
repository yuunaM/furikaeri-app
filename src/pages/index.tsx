import React, { useContext } from 'react';
import Image from 'next/image';
import { EventContext } from '../context/EventContext';
import { useRouter } from 'next/router';
import styles from "@/styles/Home.module.css";

export default function Home() {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('Calendar must be used within an EventProvider');
    }
    const { disable, btnText } = context;
    const router = useRouter();

    const handleAdd = () => {
        router.push('/AddData');
    }

    const handleCal = () => {
        router.push('/Calendars');
    }


    return (
        <div className='top jpn_bg'>
            <p className='mizuhiki'><Image src='/mizuhiki.svg' alt='水引' layout='responsive' width={1800} height={200} /></p>
            <div className='flex'>
                <p className='img_wrap'><Image src='/top-img.png' className='top-img' alt='見返り美人' layout='responsive' width={200} height={500} /></p>
                <div>
                    <div className='catch'>
                        <h1>FURIKAERI<br />BIJIN</h1>
                        <p className='sub_catch'>1日を振り返れる人は美しい</p>
                    </div>
                    <div className='btn_wrap'>
                        <button onClick={handleAdd} className='linkBtn' disabled={disable}>{btnText}</button>
                        <button onClick={handleCal} className='linkBtn'>暦を見る</button>
                    </div>
                </div>
            </div>
            <p className='cloud set_left'><Image src='/cloud_left.png' alt='雲' width={537} height={496} /></p>
            <p className='cloud set_right'><Image src='/cloud_right.png' alt='雲' width={634} height={537} /></p>
        </div>
    );
}
