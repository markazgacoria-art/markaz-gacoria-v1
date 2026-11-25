// Vercel Serverless Function: API Gateway Proxy to Google Apps Script
const GAS_URL = process.env.GAS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbyiJ9RAUq75VHFBBnLRpswRoCFVMHy_ppyL1Q8nGLqVO5_yIFO5Dc88zPadTnKLQcpP/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const gasResponse = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: bodyStr,
      redirect: 'follow'
    });

    const responseText = await gasResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      data = {
        success: false,
        message: 'Respon dari Google Apps Script belum berupa JSON aktif. Silakan deploy versi terbaru code.gs di Google Apps Script.',
        raw: responseText.slice(0, 300)
      };
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghubungi backend Google Apps Script: ' + error.message
    });
  }
}
