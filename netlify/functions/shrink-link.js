exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { password, url, alias } = body;

    // Password check — sirf admin hi shorten kar sake (upload-image.js jaisa hi pattern)
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Galat password' }),
      };
    }

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Original PDF link required' }),
      };
    }

    const apiKey = process.env.SHRINKME_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SHRINKME_API_KEY set nahi hai Netlify env mein' }),
      };
    }

    // shrinkme.io ka documented API format:
    // https://shrinkme.io/api?api=API_TOKEN&url=DESTINATION&alias=CustomAlias (alias optional)
    let apiUrl = `https://shrinkme.io/api?api=${apiKey}&url=${encodeURIComponent(url)}`;
    if (alias) {
      apiUrl += `&alias=${encodeURIComponent(alias)}`;
    }

    const res = await fetch(apiUrl);
    const result = await res.json();

    // Response: { "status": "success", "shortenedUrl": "https://shrinkme.io/xxxxx" }
    // ya error hone par: { "status": "error", "message": "..." }
    if (result.status !== 'success' || !result.shortenedUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.message || 'shrinkme.io se link shorten nahi ho paya' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, shortUrl: result.shortenedUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
