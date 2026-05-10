function requireEnv(name) {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return String(value).trim();
}

function optionalEnv(name, fallback = '') {
  const value = process.env[name];
  return value ? String(value).trim() : fallback;
}

module.exports = {
  requireEnv,
  optionalEnv,
};
