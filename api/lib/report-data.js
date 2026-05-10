const {
  formatBRL,
  formatNumber,
  titleCase,
  percent,
  safeValue,
} = require('./formatters');

const REPORT_COLUMN_COUNT = 17;

function buildReportTitle({ cliente, mes, ano }) {
  return [cliente, mes, ano].filter(Boolean).join(' - ').toUpperCase();
}

function buildFileName({ cliente, mes, ano }) {
  return ['Relatório', cliente, mes, ano].filter(Boolean).join(' - ');
}

function buildCapaUpdates({ title, capaData }) {
  const fb = (capaData && capaData.fb) || {};
  const ig = (capaData && capaData.ig) || {};

  return [
    { range: 'Capa!C2', values: [[title]] },

    { range: 'Capa!E12', values: [[safeValue(fb.seguidores)]] },
    { range: 'Capa!C15', values: [[fb.segAnterior ? `${fb.segAnterior} seguidores no mês anterior` : '']] },
    { range: 'Capa!F18', values: [[fb.homens ? `${percent(fb.homens)} Homens` : '']] },
    { range: 'Capa!F22', values: [[fb.mulheres ? `${percent(fb.mulheres)} Mulheres` : '']] },
    { range: 'Capa!B33', values: [[safeValue(fb.faixa)]] },
    { range: 'Capa!D33', values: [[safeValue(fb.alcancadas)]] },
    { range: 'Capa!G33', values: [[safeValue(fb.visitas)]] },

    { range: 'Capa!N12', values: [[safeValue(ig.seguidores)]] },
    { range: 'Capa!L15', values: [[ig.segAnterior ? `${ig.segAnterior} seguidores no mês anterior` : '']] },
    { range: 'Capa!O18', values: [[ig.homens ? `${percent(ig.homens)} Homens` : '']] },
    { range: 'Capa!O22', values: [[ig.mulheres ? `${percent(ig.mulheres)} Mulheres` : '']] },
    { range: 'Capa!K33', values: [[safeValue(ig.faixa)]] },
    { range: 'Capa!M33', values: [[safeValue(ig.alcancadas)]] },
    { range: 'Capa!P33', values: [[safeValue(ig.visitas)]] },
  ];
}

function buildCampaignRows(campaignsData) {
  const rows = [];
  let lastDateKey = null;

  campaignsData.forEach((campaign, index) => {
    const currentDateKey = extractDateKey(campaign.name);

    if (index > 0 && currentDateKey !== lastDateKey) {
      rows.push(emptyReportRow());
    }

    lastDateKey = currentDateKey;
    rows.push(buildCampaignRow(campaign));
  });

  return rows;
}

function buildCampaignRow(campaign) {
  const objective = campaign.objective;
  const format = campaign.format || '';
  const isStaticEngagementFormat = /panfleto|carrossel|virtual|tabloide|post/i.test(format);

  return [
    titleCase(campaign.displayName || campaign.name),
    format,
    campaign.validity || '',
    formatBRL(campaign.budget),
    formatBRL(campaign.spent),
    formatNumber(campaign.reach),
    objective === 'Engajamento' && isStaticEngagementFormat ? formatNumber(campaign.eng) : '',
    objective === 'EngLink' || objective === 'ConvLink' ? formatNumber(campaign.links) : '',
    objective === 'Reels' ? formatNumber(campaign.views) : '',
    objective === 'Alcance' ? formatBRL(campaign.cpm) : '',
    objective === 'EngLink' || objective === 'ConvLink' ? formatBRL(campaign.cpc) : '',
    objective === 'Reels' ? formatBRL(campaign.cThru) : '',
    objective === 'Engajamento' && isStaticEngagementFormat ? formatBRL(campaign.cInt) : '',
    objective === 'Conversas' || objective === 'WhatsEng' ? formatBRL(campaign.cConv) : '',
    '',
    '',
    objective === 'Conversas' || objective === 'WhatsEng' ? formatNumber(campaign.conv) : '',
  ];
}

function extractDateKey(name = '') {
  const match = String(name).match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);

  if (!match) return 'sem-data';

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  let year = Number(match[3]);

  if (year < 100) year += 2000;

  return `${year}-${month}-${day}`;
}

function emptyReportRow() {
  return Array(REPORT_COLUMN_COUNT).fill('');
}

module.exports = {
  REPORT_COLUMN_COUNT,
  buildReportTitle,
  buildFileName,
  buildCapaUpdates,
  buildCampaignRows,
};
