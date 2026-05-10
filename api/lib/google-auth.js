const { google } = require('googleapis');
const { requireEnv } = require('./env');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

function parseServiceAccountCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    const raw = Buffer
      .from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, 'base64')
      .toString('utf8');

    return JSON.parse(raw);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  const clientEmail = requireEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = requireEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
    .replace(/\\n/g, '\n');

  return {
    client_email: clientEmail,
    private_key: privateKey,
  };
}

function createGoogleAuthClient() {
  const credentials = parseServiceAccountCredentials();

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Credenciais da Service Account inválidas.');
  }

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });
}

function createGoogleClients() {
  const auth = createGoogleAuthClient();

  return {
    auth,
    drive: google.drive({ version: 'v3', auth }),
    sheets: google.sheets({ version: 'v4', auth }),
  };
}

module.exports = {
  createGoogleClients,
};
