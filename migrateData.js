const admin = require('firebase-admin');

// 古いFirebaseプロジェクトのサービスアカウントキー
const oldServiceAccount = require('./oldServiceAccountKey.json');
// 新しいFirebaseプロジェクトのサービスアカウントキー
const newServiceAccount = require('./newServiceAccountKey.json');

// 古いFirestoreの初期化
const oldApp = admin.initializeApp({
    credential: admin.credential.cert(oldServiceAccount)
}, 'oldApp');
const oldDb = oldApp.firestore();

// 新しいFirestoreの初期化
const newApp = admin.initializeApp({
    credential: admin.credential.cert(newServiceAccount)
}, 'newApp');
const newDb = newApp.firestore();

async function migrateData() {
    try {
        const oldCollectionRef = oldDb.collection('data');
        const oldCollectionSnapshot = await oldCollectionRef.get();

        for (const doc of oldCollectionSnapshot.docs) {
            const docData = doc.data();

            // 新しいFirestoreにドキュメントを追加
            const newDocRef = newDb.collection('data').doc(doc.id);
            await newDocRef.set(docData);

            // サブコレクションの移行
            const oldSubCollectionRef = oldCollectionRef.doc(doc.id).collection('sub');
            const oldSubCollectionSnapshot = await oldSubCollectionRef.get();

            for (const subDoc of oldSubCollectionSnapshot.docs) {
                const subDocData = subDoc.data();
                const newSubDocRef = newDocRef.collection('sub').doc(subDoc.id);
                await newSubDocRef.set(subDocData);
            }

            console.log(`Migrated document ${doc.id} successfully.`);
        }
        console.log('Data migration completed successfully.');

    } catch (error) {
        console.error('Error during data migration:', error);
    }
}

migrateData();
