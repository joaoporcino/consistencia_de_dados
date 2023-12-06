const Table = require("cli-table");

let table = new Table({
  head: ["", "Estacoes", "Data", "Consistencia", "Prec. Max."],
});

function precipitacaoMaximas(dados) {
  const colCodEstacao = 1;
  const colPrecipitacao = 11;
  const colData = 6;
  const colConsistencia = 2;
  let objPrecipitacaoMaxima = [];

  dados.forEach((estacao, index) => {
    const codEstacao = estacao[0][colCodEstacao];
    let precipitacaoMaxima = 0;
    let data
    let nivelConsistencia

    estacao.forEach((dadosDiarios) => {
      let precipitacao = dadosDiarios[colPrecipitacao];

      if (precipitacao > precipitacaoMaxima) {
        precipitacaoMaxima = precipitacao
        data = formatarData(dadosDiarios[colData])
        nivelConsistencia = dadosDiarios[colConsistencia]
      }

    });

    table.push([index + 1, codEstacao, data, nivelConsistencia, precipitacaoMaxima.toFixed(2)]);
    objPrecipitacaoMaxima.push([index + 1, codEstacao, precipitacaoMaxima.toFixed(2)]);
  });

  console.log("\nSegue as precipiatacoes maximas por estacao:\n");

  console.log(table.toString());

  return objPrecipitacaoMaxima;
}

function formatarData(data) {
  if (data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
  
    return `${dia}/${mes}/${ano}`;
  }
}

module.exports = { precipitacaoMaximas };
