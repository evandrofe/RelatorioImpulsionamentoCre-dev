const { Readable } = require('stream');

const GOOGLE_SHEETS_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';
const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function copyTemplateToSpreadsheet({ drive, templateId, outputFolderId, name }) {
  const template = await drive.files.get({
    fileId: templateId,
    fields: 'id,name,mimeType',
    supportsAllDrives: true,
  });

  if (template.data.mimeType === GOOGLE_SHEETS_MIME_TYPE) {
    const copied = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name,
        parents: [outputFolderId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    return copied.data.id;
  }

  const xlsx = await drive.files.get(
    {
      fileId: templateId,
      alt: 'media',
      supportsAllDrives: true,
    },
    { responseType: 'arraybuffer' },
  );

  const uploaded = await drive.files.create({
    requestBody: {
      name,
      mimeType: GOOGLE_SHEETS_MIME_TYPE,
      parents: [outputFolderId],
    },
    media: {
      mimeType: XLSX_MIME_TYPE,
      body: Readable.from(Buffer.from(xlsx.data)),
    },
    fields: 'id',
    supportsAllDrives: true,
  });

  return uploaded.data.id;
}

module.exports = {
  copyTemplateToSpreadsheet,
};
