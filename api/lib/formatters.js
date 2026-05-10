function onlyPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function formatBRL(value) {
  if (!onlyPositiveNumber(value)) return '';

  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatNumber(value) {
  if (!onlyPositiveNumber(value)) return '';

  return value.toLocaleString('pt-BR');
}

function titleCase(value) {
  if (!value) return '';

  return String(value)
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, char => char.toUpperCase());
}

function percent(value) {
  const text = String(value || '').trim();

  if (!text) return '';

  return text.endsWith('%') ? text : `${text}%`;
}

function safeValue(value) {
  return value || '';
}

module.exports = {
  formatBRL,
  formatNumber,
  titleCase,
  percent,
  safeValue,
};
