const fs = require("fs");

function criarDadosResumidos(dados, dataHidrologica, amcr) {
  let dadosAnuais = [];
  let dadosMensais = [];

  dados.forEach((estacao) => {
    estacao = estacao.map((dadoDiario) => {
      return {
        id: dadoDiario[0],
        codEstacao: dadoDiario[1],
        consistencia: dadoDiario[2],
        tipoMedicao: dadoDiario[3],
        precipitacaoMaxMensal: dadoDiario[4],
        precipitacaoTotalMensal: dadoDiario[5],
        data: dadoDiario[6],
        dia: dadoDiario[7],
        ano: dadoDiario[8],
        anoHidrologico: dadoDiario[9],
        mes: dadoDiario[10],
        precipitacao: dadoDiario[11],
        status: dadoDiario[12],
        divisivelPor7: dadoDiario[13],
        divisivelPor25: dadoDiario[14],
        divisivelPor10: dadoDiario[15],
        statusCorrigido: dadoDiario[16],
        amcr: dadoDiario[17],
        percentilSerie: dadoDiario[18],
        outilier: dadoDiario[19],
        statusErrado: dadoDiario[20],
        seqRepetida: dadoDiario[21],
        outlierMensal: dadoDiario[22],
        errosDetectados: dadoDiario[23],
      };
    });

    estacao.sort((a, b) => b.data - a.data);

    let objPrecipDiaSemana = {};
    let estacaoResumoMensal = {};
    let estacaoResumoAnual = [];
    let dadoDiarioAnterior = null;
    let maiorQtdDiasIguais = 0;
    let comparadorQtdDiasIguais = 0;
    let contadorDiasIguais = 0;
    let preciptacoesRepetidas = [];
    let precipitacaoTotal;
    let precipitacaoMaxima;
    let maiorDiasEmBranco = 0;
    let contadorDiasEmBranco = 0;

    estacao.forEach((dadoDiario, index) => {
      let mes = dadoDiario.mes;
      let ano = dadoDiario.anoHidrologico;
      let diaDaSemana = dadoDiario.data.getDay();

      //Verifica precipitações repetidas em sequencia
      if (
        dadoDiarioAnterior &&
        dadoDiario.precipitacao > 0 &&
        dadoDiarioAnterior.precipitacao > 0
      ) {
        if (dadoDiario.precipitacao === dadoDiarioAnterior.precipitacao) {
          contadorDiasIguais =
            comparadorQtdDiasIguais === 0
              ? contadorDiasIguais === 0
                ? 2
                : contadorDiasIguais + 2
              : contadorDiasIguais + 1;
          comparadorQtdDiasIguais =
            comparadorQtdDiasIguais === 0 ? 2 : comparadorQtdDiasIguais + 1;

          if (!preciptacoesRepetidas.includes(dadoDiario.precipitacao)) {
            preciptacoesRepetidas.push(dadoDiario.precipitacao);
          }
          if (comparadorQtdDiasIguais > maiorQtdDiasIguais) {
            maiorQtdDiasIguais = comparadorQtdDiasIguais;
          }
        } else {
          comparadorQtdDiasIguais = 0;
        }
      }

      //Verifica o maior comprimento de dados em branco
      if (dadoDiario && dadoDiario.statusCorrigido === 0) {
        contadorDiasEmBranco = contadorDiasEmBranco + 1;
        maiorDiasEmBranco =
          maiorDiasEmBranco > contadorDiasEmBranco
            ? maiorDiasEmBranco
            : contadorDiasEmBranco;
      } else {
        contadorDiasEmBranco = 0;
      }

      //Cria um novo parametro com o ano
      if (!estacaoResumoMensal[ano]) {
        estacaoResumoMensal[ano] = {};
      }

      //Cria um novo parametro de mes
      if (!estacaoResumoMensal[ano][mes]) {
        precipitacaoTotal = dadoDiario.precipitacao
          ? dadoDiario.precipitacao
          : 0;
        precipitacaoMaxima = dadoDiario.precipitacao
          ? dadoDiario.precipitacao
          : 0;
        preciptacoesRepetidas = [];

        contadorDiasIguais = 0;
        maiorQtdDiasIguais = 0;
        comparadorQtdDiasIguais = 0;
        maiorDiasEmBranco = dadoDiario.statusCorrigido === 0 ? 1 : 0;

        estacaoResumoMensal[ano][mes] = {
          codEstacao: dadoDiario.codEstacao,
          qtdDiasMes: calcularQtdDiasMes(ano, mes),
          qtdDiasChuvosos: dadoDiario.precipitacao >= 0 ? 1 : 0,
          qtdDadosComPercentil: dadoDiario.percentilSerie === null ? 0 : 1,
          qtdOutliers: dadoDiario.outlier ? 1 : 0,
          qtdDiasSete: dadoDiario.multiploSete ? 1 : 0,
          qtdDiasVinteCinco: dadoDiario.multiploVinteCinco ? 1 : 0,
          qtdDiasDez: dadoDiario.multiploDez ? 1 : 0,
          qtdDadosBranco: dadoDiario.statusCorrigido === 0 ? 1 : 0,
          qtdDadosReais: dadoDiario.statusCorrigido === 1 ? 1 : 0,
          qtdDadosEstimados: dadoDiario.statusCorrigido === 2 ? 1 : 0,
          qtdDadosDuvidoso: dadoDiario.statusCorrigido === 3 ? 1 : 0,
          qtdDadosAcumulado: dadoDiario.statusCorrigido === 4 ? 1 : 0,
          qtdDiasDadosRepetidos: contadorDiasIguais,
          maiorSequenciaDiasDadosRepetidos: maiorQtdDiasIguais,
          precipitacoesRepetidas: "",
          precipitacaoTotal: precipitacaoTotal,
          precipitacaoMaxima: precipitacaoMaxima,
          precipitacaoZero: dadoDiario.precipitacao === 0 ? 1 : 0,
          maiorDiasEmBranco: maiorDiasEmBranco,
          qtdOutliersMensal: dadoDiario.outlierMensal ? 1 : 0,
          qtdAmcr: dadoDiario.amcr ? 1 : 0,
          qtdStatusErrado: dadoDiario.statusErrado ? 1 : 0,
          qtdErrosDetectados: dadoDiario.errosDetectados ? 1 : 0,
        };
      } else {
        let codEstacao = estacaoResumoMensal[ano][mes].codEstacao;
        let qtdDiasMes = estacaoResumoMensal[ano][mes].qtdDiasMes;
        let qtdDiasChuvosos =
          dadoDiario.precipitacao >= 0
            ? estacaoResumoMensal[ano][mes].qtdDiasChuvosos + 1
            : estacaoResumoMensal[ano][mes].qtdDiasChuvosos;
        let qtdDadosComPercentil =
          dadoDiario.percentilSerie !== null
            ? estacaoResumoMensal[ano][mes].qtdDadosComPercentil + 1
            : estacaoResumoMensal[ano][mes].qtdDadosComPercentil;
        let qtdOutliers =
          dadoDiario.outlier === true
            ? estacaoResumoMensal[ano][mes].qtdOutliers + 1
            : estacaoResumoMensal[ano][mes].qtdOutliers;
        let qtdDiasSete =
          dadoDiario.multiploSete === true
            ? estacaoResumoMensal[ano][mes].qtdDiasSete + 1
            : estacaoResumoMensal[ano][mes].qtdDiasSete;
        let qtdDiasVinteCinco =
          dadoDiario.multiploVinteCinco === true
            ? estacaoResumoMensal[ano][mes].qtdDiasVinteCinco + 1
            : estacaoResumoMensal[ano][mes].qtdDiasVinteCinco;
        let qtdDiasDez =
          dadoDiario.multiploDez === true
            ? estacaoResumoMensal[ano][mes].qtdDiasDez + 1
            : estacaoResumoMensal[ano][mes].qtdDiasDez;
        let qtdDadosBranco =
          dadoDiario.statusCorrigido === 0
            ? estacaoResumoMensal[ano][mes].qtdDadosBranco + 1
            : estacaoResumoMensal[ano][mes].qtdDadosBranco;
        let qtdDadosReais =
          dadoDiario.statusCorrigido === 1
            ? estacaoResumoMensal[ano][mes].qtdDadosReais + 1
            : estacaoResumoMensal[ano][mes].qtdDadosReais;
        let qtdDadosEstimados =
          dadoDiario.statusCorrigido === 2
            ? estacaoResumoMensal[ano][mes].qtdDadosEstimados + 1
            : estacaoResumoMensal[ano][mes].qtdDadosEstimados;
        let qtdDadosDuvidoso =
          dadoDiario.statusCorrigido === 3
            ? estacaoResumoMensal[ano][mes].qtdDadosDuvidoso + 1
            : estacaoResumoMensal[ano][mes].qtdDadosDuvidoso;
        let qtdDadosAcumulado =
          dadoDiario.statusCorrigido === 4
            ? estacaoResumoMensal[ano][mes].qtdDadosAcumulado + 1
            : estacaoResumoMensal[ano][mes].qtdDadosAcumulado;
        let qtdDiasDadosRepetidos = contadorDiasIguais;
        let maiorSequenciaDiasDadosRepetidos = maiorQtdDiasIguais;
        let precipitacoesRepetidas = preciptacoesRepetidas.join(", ");
        let precipitacaoTotal = dadoDiario.precipitacao
          ? estacaoResumoMensal[ano][mes].precipitacaoTotal +
            dadoDiario.precipitacao
          : estacaoResumoMensal[ano][mes].precipitacaoTotal;
        let precipitacaoMaxima =
          estacaoResumoMensal[ano][mes].precipitacaoMaxima >
          dadoDiario.precipitacao
            ? estacaoResumoMensal[ano][mes].precipitacaoMaxima
            : dadoDiario.precipitacao;
        let precipitacaoZero =
          dadoDiario.precipitacao === 0
            ? estacaoResumoMensal[ano][mes].precipitacaoZero + 1
            : estacaoResumoMensal[ano][mes].precipitacaoZero;
        let qtdOutliersMensal = dadoDiario.outliersMensal
          ? estacaoResumoMensal[ano][mes].qtdOutliersMensal + 1
          : estacaoResumoMensal[ano][mes].qtdOutliersMensal;
        let qtdAmcr = dadoDiario.qtdAmcr
          ? estacaoResumoMensal[ano][mes].qtdAmcr + 1
          : estacaoResumoMensal[ano][mes].qtdAmcr;
        let qtdStatusErrado = dadoDiario.statusErrado
          ? estacaoResumoMensal[ano][mes].qtdStatusErrado + 1
          : estacaoResumoMensal[ano][mes].qtdStatusErrado;
        let qtdErrosDetectados = dadoDiario.errosDetectados
          ? estacaoResumoMensal[ano][mes].qtdErrosDetectados + 1
          : estacaoResumoMensal[ano][mes].qtdErrosDetectados;

        estacaoResumoMensal[ano][mes] = {
          codEstacao,
          qtdDiasMes,
          qtdDiasChuvosos,
          qtdDadosComPercentil,
          qtdOutliers,
          qtdDiasSete,
          qtdDiasVinteCinco,
          qtdDiasDez,
          qtdDadosBranco,
          qtdDadosReais,
          qtdDadosEstimados,
          qtdDadosDuvidoso,
          qtdDadosAcumulado,
          qtdDiasDadosRepetidos,
          maiorSequenciaDiasDadosRepetidos,
          precipitacoesRepetidas,
          precipitacaoTotal,
          precipitacaoMaxima,
          precipitacaoZero,
          maiorDiasEmBranco,
          qtdOutliersMensal,
          qtdAmcr,
          qtdStatusErrado,
          qtdErrosDetectados,
        };
      }

      dadoDiarioAnterior = dadoDiario;
    });

    let resultado = [];

    //Transformar objeto em vetor mensal e anual
    for (const ano in estacaoResumoMensal) {
      let codEstacao;
      let dataIni = new Date(ano, dataHidrologica.mes - 1, dataHidrologica.dia);
      let dataFim =
        dataHidrologica.mes === "01" && dataHidrologica.dia === "01"
          ? new Date(ano, 11, 31)
          : new Date(
              parseInt(ano) + 1,
              dataHidrologica.mes - 1,
              dataIni.getDate() - 1
            );
      let qtdDiasMes = 0;
      let qtdDiasChuvosos = 0;
      let qtdDadosComPercentil = 0;
      let qtdOutliers = 0;
      let qtdDiasSete = 0;
      let qtdDiasVinteCinco = 0;
      let qtdDiasDez = 0;
      let qtdDadosBranco = 0;
      let qtdDadosReais = 0;
      let qtdDadosEstimados = 0;
      let qtdDadosDuvidoso = 0;
      let qtdDadosAcumulado = 0;
      let qtdDiasDadosRepetidos = 0;
      let maiorSequenciaDiasDadosRepetidos = 0;
      let precipitacoesRepetidas = "";
      let precipitacaoTotal = 0;
      let precipitacaoMax = 0;
      let precipitacaoZero = 0;
      let maiorDiasEmBranco = 0;
      let qtdMeses = 0;
      let qtdMesesZero = 0;
      let qtdOutliersMensal = 0;
      let qtdAmcr = 0;
      let qtdStatusErrado = 0;
      let qtdErrosDetectados = 0;

      let array;

      for (const mes in estacaoResumoMensal[ano]) {
        const item = estacaoResumoMensal[ano][mes];
        array = [
          item.codEstacao,
          parseFloat(ano),
          parseFloat(mes),
          item.qtdDiasMes,
          item.qtdDiasChuvosos,
          item.qtdDadosComPercentil,
          item.qtdOutliers,
          item.qtdDiasSete,
          item.qtdDiasVinteCinco,
          item.qtdDiasDez,
          item.qtdDadosBranco,
          item.qtdDadosReais,
          item.qtdDadosEstimados,
          item.qtdDadosDuvidoso,
          item.qtdDadosAcumulado,
          item.qtdDiasDadosRepetidos,
          item.maiorSequenciaDiasDadosRepetidos,
          item.precipitacoesRepetidas,
          item.precipitacaoTotal,
          item.precipitacaoMaxima,
          item.precipitacaoZero,
          item.maiorDiasEmBranco,
          item.qtdOutliersMensal,
          item.qtdAmcr,
          item.qtdStatusErrado,
          item.qtdErrosDetectados,
        ];
        resultado.push(array);

        array = [
          (codEstacao = item.codEstacao),
          parseFloat(ano),
          dataIni,
          dataFim,
          (qtdDiasMes = qtdDiasMes + item.qtdDiasMes),
          calcularQtdDiasAno(ano),
          (qtdDiasChuvosos = qtdDiasChuvosos + item.qtdDiasChuvosos),
          (qtdDadosComPercentil =
            qtdDadosComPercentil + item.qtdDadosComPercentil),
          (qtdOutliers = qtdOutliers + item.qtdOutliers),
          (qtdDiasSete = qtdDiasSete + item.qtdDiasSete),
          (qtdDiasVinteCinco = qtdDiasVinteCinco + item.qtdDiasVinteCinco),
          (qtdDiasDez = qtdDiasDez + item.qtdDiasDez),
          (qtdDadosBranco = qtdDadosBranco + item.qtdDadosBranco),
          (qtdDadosReais = qtdDadosReais + item.qtdDadosReais),
          (qtdDadosEstimados = qtdDadosEstimados + item.qtdDadosEstimados),
          (qtdDadosDuvidoso = qtdDadosDuvidoso + item.qtdDadosDuvidoso),
          (qtdDadosAcumulado = qtdDadosAcumulado + item.qtdDadosAcumulado),
          (qtdDiasDadosRepetidos =
            qtdDiasDadosRepetidos + item.qtdDiasDadosRepetidos),
          (maiorSequenciaDiasDadosRepetidos =
            maiorSequenciaDiasDadosRepetidos <
            item.maiorSequenciaDiasDadosRepetidos
              ? item.maiorSequenciaDiasDadosRepetidos
              : maiorSequenciaDiasDadosRepetidos),
          (precipitacoesRepetidas = item.precipitacoesRepetidas
            ? precipitacoesRepetidas.concat(", ", item.precipitacoesRepetidas)
            : precipitacoesRepetidas),
          (precipitacaoTotal = precipitacaoTotal + item.precipitacaoTotal),
          (precipitacaoMax =
            item.precipitacaoMax && precipitacaoMax < item.precipitacaoMax
              ? item.precipitacaoMax
              : precipitacaoMax),
          (precipitacaoZero = precipitacaoZero + item.precipitacaoZero),
          (maiorDiasEmBranco =
            maiorDiasEmBranco > item.maiorDiasEmBranco
              ? maiorDiasEmBranco
              : item.maiorDiasEmBranco),
          (qtdMeses = qtdMeses + 1),
          (qtdMesesZero =
            item.precipitacaoZero === item.qtdDiasMes
              ? qtdMesesZero + 1
              : qtdMesesZero),
          (qtdOutliersMensal = qtdOutliersMensal + item.qtdOutliersMensal),
          (qtdAmcr = qtdAmcr + item.qtdAmcr),
          (qtdStatusErrado = qtdStatusErrado + item.qtdStatusErrado),
          (qtdErrosDetectados = qtdStatusErrado + item.qtdStatusErrado),
        ];

        precipitacoesRepetidas.concat(item.preciptacoesRepetidas);
        let teste = item.precipitacoesRepetidas;
      }

      estacaoResumoAnual.push(array);
    }

    estacaoResumoMensal = resultado;

    dadosMensais.push(estacaoResumoMensal);
    dadosAnuais.push(estacaoResumoAnual);
  });

  return { dadosMensais: dadosMensais, dadosAnuais: dadosAnuais };
}

function calcularQtdDiasMes(ano, mes) {
  if ((ano, mes)) {
    let data = new Date(ano, mes, 1);
    data.setDate(data.getDate() - 1);
    let dia = data.getDate();

    return dia;
  }
}

function calcularQtdDiasAno(ano) {
  // Um ano bissexto é divisível por 4, exceto anos divisíveis por 100, a menos que também sejam divisíveis por 400.
  let verifica = (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;

  return verifica ? 366 : 365;
}

function numeroDiasNoAno(ano) {
  return eBissexto(ano) ? 366 : 365;
}

module.exports = { criarDadosResumidos };
