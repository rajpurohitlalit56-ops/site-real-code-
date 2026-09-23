/* ---------------------------------------------------------
   PDF ko GitHub repo mein push karta hai (jaise images ImgBB
   par jaati hain, waise hi PDFs yahan GitHub par jaati hain)
   aur uska raw.githubusercontent.com link wapas karta hai.

   REQUIRED ENV VARS (Netlify → Site settings → Environment):
   - GITHUB_TOKEN        : GitHub Personal Access Token
                            (Settings → Developer settings → Fine-grained
                             tokens → is repo ke liye "Contents: Read & write"
                             permission ke saath banao)
   - GITHUB_OWNER        : GitHub username/org, jaise "myusername"
   - GITHUB_REPO         : Repo ka naam jahan PDFs store hongi
   - GITHUB_BRANCH       : (optional) default "main"
   - GITHUB_PDF_PATH     : (optional) folder prefix, default "pdfs"

   ⚠️ IMPORTANT LIMITATION:
   Netlify Functions (AWS Lambda ke upar chalte hain) ka synchronous
   request/response body size limit ~6 MB hota hai. Ek 10 MB ki PDF
   base64 mein encode hone par ~13-14 MB ban jaati hai — yeh is
   function tak pahunchne se PEHLE hi fail ho sakta hai (413 error
   ya function timeout). Isliye:
   - Chhoti/medium PDFs (~4 MB tak) ke liye yeh reliably kaam karega.
   - Bade PDFs (8-10 MB) ke liye agar issue aaye, to Firebase Storage
     (jo already project mein configured hai) ek better option hoga,
     kyunki wahan client seedha upload kar sakta hai bina Netlify
     function ke through bheje.
--------------------------------------------------------- */

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { password, pdfBase64, filename } = body;

    // Password check — sirf admin hi upload kar sake
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Galat password' }),
      };
    }

    if (!pdfBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'PDF data required' }),
      };
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const folder = (process.env.GITHUB_PDF_PATH || 'pdfs').replace(/^\/|\/$/g, '');

    if (!token || !owner || !repo) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GitHub env vars set nahi hain (GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO)' }),
      };
    }

    // Rough size check — base64 length se asli byte size nikalo
    const approxBytes = Math.floor((pdfBase64.length * 3) / 4);
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (approxBytes > MAX_BYTES) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'PDF 10 MB se badi hai' }),
      };
    }

    // Unique filename banao taaki purani file overwrite na ho
    const safeName = (filename || 'book.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}_${safeName}`;

    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add PDF: ${safeName}`,
          content: pdfBase64,
          branch: branch,
        }),
      }
    );

    const ghResult = await ghRes.json();

    if (!ghRes.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GitHub upload fail hua: ' + (ghResult.message || 'unknown error') }),
      };
    }

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url: rawUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
