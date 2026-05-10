async function fillReportSpreadsheet({
  sheets,
  spreadsheetId,
  capaUpdates,
  campaignRows,
}) {
  await updateCapa({ sheets, spreadsheetId, capaUpdates });

  const { sheetId, raioXRowIndex, placeholderCount } = await getReportSheetStructure({
    sheets,
    spreadsheetId,
  });

  await resizeCampaignArea({
    sheets,
    spreadsheetId,
    sheetId,
    raioXRowIndex,
    placeholderCount,
    campaignRowCount: campaignRows.length,
  });

  await clearCampaignArea({
    sheets,
    spreadsheetId,
    rowCount: Math.max(placeholderCount, campaignRows.length),
  });

  await updateCampaignRows({
    sheets,
    spreadsheetId,
    campaignRows,
  });
}

async function updateCapa({ sheets, spreadsheetId, capaUpdates }) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: capaUpdates,
    },
  });
}

async function getReportSheetStructure({ sheets, spreadsheetId }) {
  const [existingData, metadata] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Relatório!A1:Q150',
      valueRenderOption: 'FORMATTED_VALUE',
    }),
    sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets(properties(sheetId,title))',
    }),
  ]);

  const rows = existingData.data.values || [];
  const raioXRowIndex = findRaioXRowIndex(rows);

  if (raioXRowIndex < 0) {
    throw new Error('A linha "RAIO-X" não foi encontrada na aba "Relatório".');
  }

  const reportSheet = (metadata.data.sheets || []).find(
    sheet => sheet.properties && sheet.properties.title === 'Relatório',
  );

  if (!reportSheet) {
    throw new Error('A aba "Relatório" não foi encontrada.');
  }

  return {
    sheetId: reportSheet.properties.sheetId,
    raioXRowIndex,
    placeholderCount: Math.max(raioXRowIndex - 2, 0),
  };
}

function findRaioXRowIndex(rows) {
  return rows.findIndex(row => String((row && row[0]) || '').trim().includes('RAIO-X'));
}

async function resizeCampaignArea({
  sheets,
  spreadsheetId,
  sheetId,
  raioXRowIndex,
  placeholderCount,
  campaignRowCount,
}) {
  const diff = campaignRowCount - placeholderCount;
  const requests = [];

  if (diff > 0) {
    requests.push({
      insertDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: raioXRowIndex,
          endIndex: raioXRowIndex + diff,
        },
        inheritFromBefore: true,
      },
    });
  }

  if (diff < 0) {
    const deleteStart = 2 + campaignRowCount;
    const deleteEnd = raioXRowIndex;

    if (deleteEnd > deleteStart) {
      requests.push({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: deleteStart,
            endIndex: deleteEnd,
          },
        },
      });
    }
  }

  if (!requests.length) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

async function clearCampaignArea({ sheets, spreadsheetId, rowCount }) {
  if (rowCount <= 0) return;

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `Relatório!A3:Q${rowCount + 2}`,
  });
}

async function updateCampaignRows({ sheets, spreadsheetId, campaignRows }) {
  if (!campaignRows.length) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Relatório!A3:Q${campaignRows.length + 2}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: campaignRows,
    },
  });
}

module.exports = {
  fillReportSpreadsheet,
};
