// api/submit.js
// Vercel serverless function. Receives { code, stdin } from the browser,
// forwards it to Judge0 using the secret key stored in an environment
// variable (never sent to the browser), and returns the submission token.

const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';
const CPP_LANGUAGE_ID = 54; // C++ (GCC 9.2.0)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, stdin } = req.body || {};

  if (!code) {
    return res.status(400).json({ error: 'Missing "code" in request body' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing RAPIDAPI_KEY env var' });
  }

  try {
    const judgeResp = await fetch(
      `https://${JUDGE0_HOST}/submissions?base64_encoded=false&wait=false`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': JUDGE0_HOST,
        },
        body: JSON.stringify({
          language_id: CPP_LANGUAGE_ID,
          source_code: code,
          stdin: stdin || '',
        }),
      }
    );

    const data = await judgeResp.json();

    if (!judgeResp.ok) {
      return res.status(judgeResp.status).json({ error: data });
    }

    return res.status(200).json(data); // { token: "..." }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
