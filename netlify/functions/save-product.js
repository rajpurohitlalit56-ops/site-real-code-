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
    const body = JSON.parse(event.body);
    const {
      password, id, category, name, icon, price,
      by, desc, duration, demoHref, cardImage, qr, channelId,
      bannerImage, planBadge, overview, fullDescription, demoMedia, topics,
      previewImages, examTags, author, publisher, pagesCount, language,
      ratingText, downloadsText, fileSize, downloadLink, oldPrice, pdfLink,
      visibility
    } = body;

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Galat password' }) };
    }

    if (!id || !name) {
      return { statusCode: 400, body: JSON.stringify({ error: 'id aur name zaroori hain' }) };
    }

    const productData = {
      category: category === 'book' ? 'book' : 'batch',
      name: name,
      icon: icon || '📗',
      price: price ? Number(price) : 0,
      by: by || '',
      desc: desc || '',
      duration: duration || '',
      demoHref: demoHref || '',
      cardImage: cardImage || '',
      qr: qr || '',
      channelId: category === 'batch' ? (channelId || '') : '',

      /* PUBLIC/PRIVATE — default hamesha public, sirf explicitly "private" bhejne par hi private banega */
      visibility: visibility === 'private' ? 'private' : 'public',

      bannerImage: bannerImage || '',
      planBadge: planBadge || '',
      overview: overview || '',
      fullDescription: fullDescription || '',
      demoMedia: demoMedia || '',
      topics: topics || '',

      previewImages: previewImages || '',
      examTags: examTags || '',
      author: author || '',
      publisher: publisher || '',
      pagesCount: pagesCount ? Number(pagesCount) : 0,
      language: language || '',
      ratingText: ratingText || '',
      downloadsText: downloadsText || '',
      fileSize: fileSize || '',
      downloadLink: downloadLink || '',
      oldPrice: oldPrice ? Number(oldPrice) : 0,
      pdfLink: pdfLink || '',

      updatedAt: new Date().toISOString(),
    };

    await db.collection('catalog_products').doc(id).set(productData, { merge: true });

    return { statusCode: 200, body: JSON.stringify({ success: true, id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};