import React, { useEffect, useState, useContext } from 'react';
import { auth } from '../config/firebase';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { EventContext } from '../context/EventContext';
import { useRouter } from 'next/router';
import styles from "@/styles/Home.module.css";
import Modal from 'react-modal';

export default function Home() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const auth = getAuth();
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('Calendar must be used within an EventProvider');
    }
    const { disable, btnText } = context;
    const router = useRouter();

    const handleAdd = () => {
        router.push('/AddData');
    }

    // 認証
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setModalOpen(true);
            } else {
                setModalOpen(false);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created:", userCredential.user);
        } catch (error) {
            console.error("Error logging in: ", error);
        }
    }

    const handleClose = () => {
        setModalOpen(false);
    }


    return (
        <div className='top jpn_bg'>
            <Modal isOpen={modalOpen} onRequestClose={handleClose} >
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>email</label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='email'
                        />
                    </div>
                    <div>
                        <label>password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='password'
                        />
                    </div>
                    <button type='submit' >Sign UP</button>
                </form>
            </Modal>
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
                        <Link href='/Calendar' className='linkBtn'>暦を見る</Link>
                    </div>
                </div>
            </div>
            <p className='cloud set_left'><Image src='/cloud_left.png' alt='雲' width={537} height={496} /></p>
            <p className='cloud set_right'><Image src='/cloud_right.png' alt='雲' width={634} height={537} /></p>
        </div>
    );
}
