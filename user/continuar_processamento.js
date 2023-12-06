// funcoes.js

async function continuarProcessamento(rl) {
  return new Promise((resolve, reject) => {
    rl.question("\nPode iniciar o processamento? (y/n):", (resposta) => {
      resolve(resposta);
    });
  });
}

module.exports = { continuarProcessamento };
