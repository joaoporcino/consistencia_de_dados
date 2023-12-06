function calcularParametrosAbsolutos(dadosAnuais, dadosBasicos, amcr) {
  let dadosAbsolutos = []
  let dadosAnuaisAbsolutos = []

  dadosAnuais.forEach((estacao) => {
    dadosAnuaisAbsolutos = []

    estacao.forEach((dadoAnual) => {
      const colCodEstacao = 0;
      const colAnoHidrologico = 1
      const colDataInicial = 2
      const colDataFinal = 3
      const colDiasOperacional = 4;
      const colDiasAno = 5;
      const colAnosComChuva = 6;
      const colDadosEmBranco = 12;
      const colDadosReais = 13;
      const colDadosEstimados = 14;
      const colDadosDuvidosos = 15;
      const colDadosAcumulados = 16;
      const colMaiorDiasEmBranco = 23;
      const colQtdMes = 24;
      const colQtdMesZero = 25;
      const colOutlierMensal = 26
      const colQtdErros = 29

      const codEstacao = dadoAnual[colCodEstacao]
      const anoHidrologico = dadoAnual[colAnoHidrologico]

      const n =
        dadoAnual[colDadosReais] +
        dadoAnual[colDadosEstimados] +
        dadoAnual[colDadosDuvidosos] +
        dadoAnual[colDadosAcumulados];

      let parametroP = (dadoAnual[colAnosComChuva] / dadoAnual[colDiasAno])*100;
      let parametroQgap =
        100 -
        100 * (
          (2 * dadoAnual[colDadosEmBranco] + dadoAnual[colMaiorDiasEmBranco])) /
          n; //n é dias que teve leitura, mesmo que zero
      let parametroQmzero = 100 - 100 * (dadoAnual[colQtdMesZero] / dadoAnual[colQtdMes]);
      let parametroQwzero = calcularQwzero(dadosBasicos, amcr, codEstacao, anoHidrologico);
      let parametroQoutlier = (dadoAnual[colDiasOperacional] - dadoAnual[colOutlierMensal]) / dadoAnual[colDiasOperacional] * 100
      let ed = dadoAnual[colDiasOperacional] / dadoAnual[colAnosComChuva]

      let parametrosAbsolutos = (
        parametroP + 
        parametroQgap + 
        parametroQmzero + 
        parametroQwzero + 
        parametroQoutlier
      ) / 5

      dadosAnuaisAbsolutos.push([
        codEstacao,
        anoHidrologico,
        dadoAnual[colDataInicial],
        dadoAnual[colDataFinal],
        parseFloat(parametroP.toFixed(2)),
        parseFloat(parametroQgap.toFixed(2)),
        parseFloat(parametroQmzero.toFixed(2)),
        parseFloat(parametroQwzero.toFixed(2)),
        parseFloat(parametroQoutlier.toFixed(2)),
        parseFloat(parametrosAbsolutos.toFixed(2)),
        dadoAnual[colQtdErros],
        ed
      ]);
    });

    dadosAbsolutos.push(dadosAnuaisAbsolutos)
  });

  return dadosAbsolutos;
}

function calcularQwzero(dadosBasicos, amcr, codEstacao, anoHidrologico) {
  let colData = 6;
  let colPrecipitacao = 11;
  let colCodEstacaoDB = 1;
  let colAnoHidrologicoDB = 9;

  let media
  let desvioPadrao
  let cv
  let objPrecipDiaSemana = {}

  let [dadosEstacao] = dadosBasicos.filter(estacao => estacao[0][colCodEstacaoDB] === codEstacao)
  let dadosAnuais = dadosEstacao.filter(dadosDiarios => dadosDiarios[colAnoHidrologicoDB] === anoHidrologico)

  dadosAnuais.forEach(dadoDiario => {
    let diaDaSemana = dadoDiario[colData].getDay()

    if (dadoDiario[colPrecipitacao] && dadoDiario[colPrecipitacao] > 0) {
      if (!objPrecipDiaSemana[diaDaSemana]) {
        objPrecipDiaSemana[diaDaSemana] = 1;
      } else {
        objPrecipDiaSemana[diaDaSemana] = objPrecipDiaSemana[diaDaSemana] + 1;
      }
    }
  })
  
  //Calcular medias desvio padrao e cv por dia da semana
  let qtdDiasPorSemana = []
  for (const precipitacao in objPrecipDiaSemana) {
    qtdDiasPorSemana.push(objPrecipDiaSemana[precipitacao]);
  }

  media = calcularMedia(qtdDiasPorSemana);
  desvioPadrao = calcularDesvioPadrao(qtdDiasPorSemana, media);
  cv = desvioPadrao / media;

  return (100 - 100*cv)

}

function calcularMedia(vetor) {
  if (vetor.length === 0) {
    return NaN; // Retorne NaN se o vetor estiver vazio
  }

  // Use reduce para somar todos os elementos do vetor
  let soma = vetor.reduce((acumulador, elemento) => acumulador + elemento, 0);

  // Calcule a média dividindo a soma pelo número de elementos
  return soma / vetor.length;
}

function calcularDesvioPadrao(vetor, media) {
  if (vetor.length === 0) {
    return NaN; // Retorne NaN se o vetor estiver vazio
  }

  // Use reduce para calcular a soma dos quadrados das diferenças
  let somaQuadradosDiferencas = vetor.reduce((acumulador, elemento) => {
    let diferenca = elemento - media;
    return acumulador + diferenca * diferenca;
  }, 0);

  // Calcule a variância dividindo a soma pelo número de elementos
  let variancia = somaQuadradosDiferencas / vetor.length;

  // Calcule o desvio padrão tirando a raiz quadrada da variância
  let desvioPadrao = Math.sqrt(variancia);

  return desvioPadrao;
}

module.exports = { calcularParametrosAbsolutos };
