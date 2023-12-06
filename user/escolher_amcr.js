const Table = require("cli-table");

let table = new Table({
  head: ["", "Estacoes", "Prec. Max.", "ACMR"],
});

async function escolherAMCR(rl, precipitacaoMaxima, respostaPMP) {
  for (const estacao of precipitacaoMaxima) {
    const colCodEstacao = 1;
    const codigoEstacao = estacao[colCodEstacao];

    if (respostaPMP === 'y') {
        const pmpEscolhido = await promptPMP(rl, codigoEstacao);
        estacao.push(pmpEscolhido);
    } else {
        estacao.push(respostaPMP);
    }

    table.push(estacao)
  }

  console.log(table.toString())

  return precipitacaoMaxima;
}

function promptPMP(rl, codigoEstacao) {
  return new Promise((resolve, reject) => {
    rl.question(`\nAltura de chuva máxima de referência (AMCRF) da estação ${codigoEstacao}: `, (resposta) => {
      resolve(resposta);
    });
  });
}

module.exports = { escolherAMCR };
