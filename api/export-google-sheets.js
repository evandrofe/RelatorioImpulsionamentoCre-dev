const { createGoogleClients } = require('./lib/google-auth');
const { requireEnv } = require('./lib/env');
const { assertPost, validateExportPayload } = require('./lib/validators');
const { copyTemplateToSpreadsheet } = require('./lib/google-drive-service');
const { fillReportSpreadsheet } = require('./lib/google-sheets-report-service');
const {
  buildReportTitle,
  buildFileName,
  buildCapaUpdates,
  buildCampaignRows,
} = require('./lib/report-data');

module.exports = async function handler(req, res) {
  try {
    assertPost(req);

    const payload = validateExportPayload(req.body);
    const templateId = requireEnv('GOOGLE_SHEETS_TEMPLATE_ID');
    const outputFolderId = requireEnv('GOOGLE_DRIVE_OUTPUT_FOLDER_ID');

    const { drive, sheets } = createGoogleClients();

    const fileName = buildFileName(payload);
    const title = buildReportTitle(payload);

    const spreadsheetId = await copyTemplateToSpreadsheet({
      drive,
      templateId,
      outputFolderId,
      name: fileName,
    });

    await fillReportSpreadsheet({
      sheets,
      spreadsheetId,
      capaUpdates: buildCapaUpdates({
        title,
        capaData: payload.capaData,
      }),
      campaignRows: buildCampaignRows(payload.campaignsData),
    });

    return res.status(200).json({
      success: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    console.error('Erro export Google Sheets:', {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    });

    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Erro inesperado ao exportar relatório.',
    });
  }
};
