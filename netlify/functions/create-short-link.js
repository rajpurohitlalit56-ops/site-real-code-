/* ---------------------------------------------------------
   create-short-link.js
   Admin panel se ek raw/direct download link aata hai, yeh
   function use ShrinkMe.io API se short (ad) link banwa ke
   wapas bhejta hai. Buyer isi short link pe click karega,
   kuch ads dekhega, aur end mein asli PDF tak pahunchega.

   REQUIRED ENV VAR (Netlify → Site settings → Environment):
   - SHRINKME_API_KEY : ShrinkMe.io account ke "API" page se
                          milega (shrinkme.io/member/tools/api)
   - ADMIN_PASSWORD   : already existing hai, isi se reuse hota hai
--------------------------------------------------------- */

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { password, url } = body;

    // Password check — sirf admin hi short link bana sake
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Galat password' }) };
    }

    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: 'URL required' }) };
    }

    const apiKey = process.env.SHRINKME_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SHRINKME_API_KEY env var set nahi hai' }),
      };
    }

    const apiUrl = `https://shrinkme.io/api?api=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(url)}`;

    const res = await fetch(apiUrl);
    const result = await res.json();

    // ShrinkMe API normally { status: "success", shortenedUrl: "..." }
    // ya error hone par { status: "error", message: "..." } bhejta hai
    if (result.status === 'success' && result.shortenedUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, shortUrl: result.shortenedUrl }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ShrinkMe fail hua: ' + (result.message || JSON.stringify(result)) }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
