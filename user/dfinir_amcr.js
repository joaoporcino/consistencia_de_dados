async function definirAMCR(rl) {
  return new Promise((resolve, reject) => {
    rl.question("\nDeseja definir um altura máxima de chuva de referência (AMCR) por estação? (y/n):", (resposta) => {
      if (resposta === "n") {
        rl.question("\nQual valor da AMCR total?:", (resposta) => {
          resolve(resposta);
        });
      } else {
        resolve(resposta);
      }
    });
  });
}

module.exports = { definirAMCR };
