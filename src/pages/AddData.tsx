import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { EventContext } from '../context/EventContext';

export default function AddData() {
    const [loading, setLoading] = useState<boolean>(false);
    const [radio, setRadio] = useState<number | null>(null);
    const [comment, setComment] = useState<string>('');
    const router = useRouter();

    const context = useContext(EventContext);
    if (!context) {
        throw new Error('Calendar must be used within an EventProvider');
    }
    const { disable, setDisable, setSubmit, btnText } = context;

    useEffect(() => {
        if (comment && radio !== null) {
            setDisable(false);
        } else {
            setDisable(true);
        }
    }, [comment, radio]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'data', 'data_doc', 'sub'), {
                comment: comment,
                feeling: radio,
                stamp: true,
                createdAt: serverTimestamp()
            });
        } finally {
            setSubmit(true);
            setLoading(false);
            setComment('');
            setRadio(0);
            router.push('/Calendars');
        }
    }

    return (
        <div className='add_wrap jpn_bg'>
            <div className='addArea'>
                <form onSubmit={handleSubmit}>
                    <div className='radio_area'>
                        <h3>今日の心持ち</h3>
                        <div className='flex'>
                            <input type='radio' id='sel1' name='feeling' value={4} onChange={(e) => setRadio(Number(e.target.value))} checked={radio === 4} />
                            <label htmlFor='sel1'><Image src='/feel_4.png' alt='良き哉' layout='responsive' width={80} height={80} />良き哉</label>
                            <input type='radio' id='sel2' name='feeling' value={3} onChange={(e) => setRadio(Number(e.target.value))} checked={radio === 3} />
                            <label htmlFor='sel2'><Image src='/feel_3.png' alt='麗しい' layout='responsive' width={80} height={80} />麗しい</label>
                            <input type='radio' id='sel3' name='feeling' value={2} onChange={(e) => setRadio(Number(e.target.value))} checked={radio === 2} />
                            <label htmlFor='sel3'><Image src='/feel_2.png' alt='凡庸' layout='responsive' width={80} height={80} />凡 庸</label>
                            <input type='radio' id='sel4' name='feeling' value={1} onChange={(e) => setRadio(Number(e.target.value))} checked={radio === 1} />
                            <label htmlFor='sel4'><Image src='/feel_1.png' alt='浮かぬ顔' layout='responsive' width={80} height={80} />浮かぬ顔</label>
                            <input type='radio' id='sel5' name='feeling' value={0} onChange={(e) => setRadio(Number(e.target.value))} checked={radio === 0} />
                            <label htmlFor='sel5'><Image src='/feel_0.png' alt='忌まわしい' layout='responsive' width={80} height={80} />忌々しい</label>
                        </div>
                    </div>
                    <div>
                        <h3>今日の振り返り</h3>
                        <textarea style={{ width: '450px', height: '200px' }} onChange={(e) => setComment(e.target.value)} placeholder='まこと由々しき事態'></textarea>
                    </div>
                    <button type='submit' className='linkBtn' disabled={disable}>{btnText}</button>
                </form>
            </div>
            <p className='cloud set_left'><Image src='/cloud_left.png' alt='雲' layout='responsive' width={537} height={496} /></p>
            <p className='cloud set_right'><Image src='/cloud_right.png' alt='雲' layout='responsive' width={634} height={537} /></p>
        </div>
    );
}