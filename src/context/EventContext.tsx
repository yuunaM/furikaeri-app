import React, { createContext, useEffect, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import moment from 'moment';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

// interface Event { // ステート'events'配列の型定義 => { title: 'スタンプ', start: now }
//     title: string;
//     start: Date;
// }

// export interface EventContextType {
//     events: Event[]; // Eventの型を'events'に反映
//     setEvents: Dispatch<SetStateAction<Event[]>>; // 状態更新関数'setEvents'の型定義 この場合はEvent型
// }

// // createContextを使ってコンテキストを作成し型宣言 'EventContextType'もしくは'undefined'の型になる 初期値は'undefined' 
// export const EventContext = createContext<EventContextType | undefined>(undefined);

// // EventProvider関数の定義
// // このコンポーネントは引数'children'を受け取り、型は'ReactNode'
// // 'children'とはEventProvider内に含まれる子要素
// export const EventProvider = ({ children }: { children: ReactNode }) => {
//     const [events, setEvents] = useState<Event[]>([]); // 全体で共有したいステート 型はEvent型で初期値は空配列

//     return (
//         <EventContext.Provider value={{ events, setEvents }}> {/* 'events','setEvents'を共有 */}
//             {children}
//         </EventContext.Provider>
//     );
// };

export interface dataArray {
    comment: string;
    feeling: number;
    stamp: boolean;
    date: Date;
}

export interface EventContextType {
    fetchArray: dataArray[] // 状態用の型定義
    disable: boolean;
    setDisable: Dispatch<SetStateAction<boolean>> // 更新関数用の型定義
    setSubmit: Dispatch<SetStateAction<boolean>>
    btnText: string;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
    const [fetchArray, setFetchArray] = useState<dataArray[]>([]);
    const [submit, setSubmit] = useState<boolean>(false);
    const [disable, setDisable] = useState<boolean>(false);
    const [btnText, setBtnText] = useState<string>('振り返る');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'data', 'data_doc', 'sub'));
                const groupData = querySnapshot.docs.map((doc) => {

                    const createdAt = doc.data().createdAt ? doc.data().createdAt.toDate() : null;

                    if (createdAt === null) {
                        console.warn('Skipping document with null createdAt field:', doc.id);
                        return null; // nullを返して後でフィルターで除外
                    }

                    return {
                        comment: doc.data().comment,
                        feeling: doc.data().feeling,
                        stamp: doc.data().stamp,
                        date: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
                    }
                }).filter(item => item !== null);

                const sortedData = dateSortData(groupData);
                setFetchArray(sortedData);

            } catch (error) {
                console.error('Error fetching profit data: ', error);
            }
        }
        fetchData();
    }, [submit]); // AddDataへ共有したsetSubmitからの更新を依存配列に設定。
    // 依存配列はuseEffect内で更新・または間接的に更新されるステートを設定すると無限ループしてしまう。
    // 以前はfetchArrayを設定していたためuseEffectが無限ループしFirestoreの読み取り限度に達してしまった。


    // 日付順にソート
    const dateSortData = (data: dataArray[]) => {
        const sortData = data.sort((a, b) => {
            const dateA = moment(a.date);
            const dateB = moment(b.date);
            return dateA.diff(dateB);
        });
        return sortData;
    }


    useEffect(() => {
        if (fetchArray.length !== 0) {
            const today = new Date();
            const todayData = moment(today).format('YYYY-MM-DD');

            const lastDay = fetchArray[fetchArray.length - 1].date
            const lastData = moment(lastDay).format('YYYY-MM-DD');

            // 振り返りが済んでいるかの確認
            if (todayData === lastData) { // 振り返り済みならボタンのdisabledをtrue
                setDisable(true);
                setBtnText('本日振り返り済み');
            } else if (todayData !== lastData) {
                setBtnText('振り返る');
            }

        }
    }, [fetchArray]);


    return (
        <EventContext.Provider value={{ fetchArray, disable, setDisable, setSubmit, btnText }}> {/* 状態を共有 */}
            {children}
        </EventContext.Provider>
    );
}

