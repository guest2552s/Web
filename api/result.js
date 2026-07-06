// api/result.js
// Vercel serverless function. Receives ?token=... from the browser,
// forwards it to Judge0 using the secret key stored in an environment
// variable, and returns the current status/result.

const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing "token" query param' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing RAPIDAPI_KEY env var' });
  }

  try {
    const judgeResp = await fetch(
      `https://${JUDGE0_HOST}/submissions/${token}?base64_encoded=false`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': JUDGE0_HOST,
        },
      }
    );

    const data = await judgeResp.json();

    if (!judgeResp.ok) {
      return res.status(judgeResp.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
