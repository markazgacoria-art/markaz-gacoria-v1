// Vercel Serverless Function: Secured API Gateway Proxy to Google Apps Script
const GAS_URL = process.env.GAS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbyiJ9RAUq75VHFBBnLRpswRoCFVMHy_ppyL1Q8nGLqVO5_yIFO5Dc88zPadTnKLQcpP/exec';

const ALLOWED_EXACT_ORIGINS = new Set([
  'https://dogostudio.vercel.app',
  'https://dogostudio-v1.vercel.app',
  'https://markaz-gacoria-v1.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const ALLOWED_ACTIONS = new Set([
  'ping', 'loginUser', 'verifyLoginOtp', 'resendLoginOtp', 'getPublicOwnerContact',
  'logoutUser', 'syncUserSession',
  'requestRegistrationOtp', 'confirmRegistrationWithOtp', 'requestPasswordResetOtp',
  'confirmPasswordResetWithOtp', 'requestPasswordReset', 'getUsersData', 'approveUser',
  'unfreezeUser', 'unsuspendUser', 'updateUserPermissions', 'deleteUser', 'updateUserProfile',
  'updateMyProfileAndPassword', 'submitUserKyc', 'scanKtpWithGemini', 'reviewUserKyc',
  'getOwnerSecurityConfig', 'saveOwnerSecurityConfig',
  'getActivityLogs', 'getDashboardSummary', 'quickUpdateUpload',
  'getCalendarSchedule', 'getMasterDropdowns', 'getEmailOptions', 'getChannelsData',
  'saveChannel', 'uploadChannelAsset', 'uploadStudioFile', 'getProtectedDriveImage',
  'deleteChannel', 'getEmailsData', 'getEmailDetailByAddressOrId', 'saveEmail', 'deleteEmail',
  'getAdSenseData', 'saveAdSense', 'deleteAdSense', 'getFinanceData', 'saveFinanceTransaction',
  'deleteFinance', 'addFinanceCategory', 'getMateriList', 'saveMateriItem', 'deleteMateriItem',
  'getToolsList', 'saveToolItem', 'deleteToolItem', 'getTrashBinData', 'restoreTrashItem',
  'permanentDeleteTrashItem', 'submitManualWorkLog', 'getWorkReportsData', 'deleteWorkLogItem',
  'setupDailyWorkRecapTrigger', 'saveOwnerRecapConfig', 'triggerManualDailyRecapNow'
]);

function isAllowedOrigin(origin) {
  if (!origin) return true; // Same-origin fetch without Origin header or server healthcheck
  if (ALLOWED_EXACT_ORIGINS.has(origin)) return true;
  if (/^https:\/\/markaz-gacoria-v1-[a-z0-9]+-markazgacoria-art\.vercel\.app$/i.test(origin)) return true;
  return false;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Vary', 'Origin');

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Origin tidak diizinkan mengakses DoGo Studio API Gateway.'
    });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Metode tidak diizinkan. Gunakan POST.'
    });
  }

  try {
    let parsedBody;
    if (typeof req.body === 'string') {
      parsedBody = JSON.parse(req.body || '{}');
    } else {
      parsedBody = req.body || {};
    }

    const action = (parsedBody && typeof parsedBody.action === 'string') ? parsedBody.action.trim() : '';
    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return res.status(400).json({
        success: false,
        message: 'Aksi API tidak valid atau tidak terdaftar.'
      });
    }

    const bodyStr = JSON.stringify(parsedBody);
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
        message: 'Respon dari Google Apps Script belum berupa JSON aktif. Pastikan code.gs versi terbaru sudah di-deploy di Google Apps Script.',
        raw: responseText.slice(0, 200)
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
