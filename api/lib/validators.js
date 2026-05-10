function assertPost(req) {
  if (req.method !== 'POST') {
    const error = new Error('Método não permitido.');
    error.statusCode = 405;
    throw error;
  }
}

function validateExportPayload(body = {}) {
  const campaignsData = Array.isArray(body.campaignsData) ? body.campaignsData : [];

  if (!body.cliente || !String(body.cliente).trim()) {
    throwBadRequest('Cliente é obrigatório.');
  }

  if (!campaignsData.length) {
    throwBadRequest('Nenhuma campanha enviada para exportação.');
  }

  return {
    cliente: String(body.cliente).trim(),
    mes: body.mes ? String(body.mes).trim() : '',
    ano: body.ano ? String(body.ano).trim() : '',
    campaignsData,
    capaData: body.capaData || { fb: {}, ig: {} },
  };
}

function throwBadRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

module.exports = {
  assertPost,
  validateExportPayload,
};
