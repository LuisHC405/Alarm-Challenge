const express = require('express');

function createApiRouter() {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.status(200).json({
      message: 'API Alarm Challenge online',
      version: '2.0.0',
      rule: 'O alarme so desliga quando o desafio estiver correto.',
      endpoints: {
        'POST /alarm/start': 'Inicia o alarme e gera um desafio',
        'GET /alarm/status': 'Mostra o estado atual do alarme',
        'GET /alarm/question': 'Mostra a questao atual',
        'POST /alarm/answer': 'Valida a resposta enviada',
      },
    });
  });

  return router;
}

module.exports = {
  createApiRouter,
};
