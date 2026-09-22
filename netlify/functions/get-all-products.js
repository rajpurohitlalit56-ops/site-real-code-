const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const snap = await db.collection('catalog_products').get();
    const items = [];
    snap.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Browser/CDN can reuse this response for 60s without asking Firestore
        // again, and can serve a stale copy for up to 5 more minutes while it
        // quietly refreshes in the background. Admin edits still show up
        // within about a minute, but repeat visits and page-to-page
        // navigation (index -> product_page -> back) stop re-hitting
        // Firestore on every single load.
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
      body: JSON.stringify(items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
