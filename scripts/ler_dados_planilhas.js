const fs = require("fs");
const ExcelJS = require("exceljs");
const path = require("path");

const {
  DadoMensal,
  DadoAnual,
  DadosEstacao,
  Estacao,
} = require("../classes/dados_pluviometricos.js");

async function lerPlanilhasExcel(dataHidrologica, listaNomesPlanilhas) {
  console.log("\nProcesso iniciado!");
  const diretorio = process.cwd();
  const arquivos = fs.readdirSync(diretorio);

  let matriz = [];
  let dadosPluviometricos = [];

  for (const arquivo of arquivos) {
    if (
      arquivo.endsWith(".xlsx") &&
      !arquivo.startsWith("~$") &&
      listaNomesPlanilhas.includes(arquivo)
    ) {
      const caminhoDoArquivo = path.join(diretorio, arquivo);
      const workbook = new ExcelJS.Workbook();

      try {
        await workbook.xlsx.readFile(caminhoDoArquivo);
        workbook.eachSheet((worksheet) => {
          console.log(`\nLendo planilha: ${worksheet.name}`);

          worksheet.eachRow((row, rowNumber) => {
            matriz.push(row.values);
          });
        });
      } catch (error) {
        console.error(`Erro ao ler arquivo ${arquivo}: ${error.message}`);
      }

      if (!dadosPluviometricos.length) {
        dadosPluviometricos = instanciarObjetos(matriz, dataHidrologica);
      } else {
        dadosPluviometricos.concat(instanciarObjetos(matriz, dataHidrologica));
      }

      matriz = [];
    }
  }

  return dadosPluviometricos;
}

function instanciarObjetos(matriz, dataHidrologica) {
  let colCodEstacao;
  let colNivelConsistencia;
  let colData;
  let colTipoMedicao;
  let colPrepMaxMensal;
  let colPrepTotal;
  let colPrecipitacao;
  let colStatus;

  let dadosDiarios = [];
  let inicioDosDados;
  // let dadosAnuais = [];
  let dadosEstacao = [];
  let estacaoAtual;
  let estacaoAnterior;
  // let mes;
  // let anoAtual;
  // let anoHidrologicoAtual;
  // let anoHidrologicoProx;
  // let precipitacaoMax = 0;
  // let precipitacaoTotal = 0;
  let tamanho = matriz.lenght;

  for (let i = 0; i <= 10; i++) {
    let row = matriz[i];

    if (verificarInicioDosDados(row)) {
      inicioDosDados = i + 1;

      colCodEstacao = row.indexOf("EstacaoCodigo");
      colNivelConsistencia = row.indexOf("NivelConsistencia");
      colData = row.indexOf("Data");
      colTipoMedicao = row.indexOf("TipoMedicaoChuvas");
      colPrepMaxMensal = row.indexOf("Maxima");
      colPrepTotal = row.indexOf("Total");
      colPrecipitacao = row.indexOf("Chuva01");
      colStatus = row.indexOf("Chuva01Status");

      break;
    }
  }

  matriz = matriz.slice(inicioDosDados);

  //Monta a matriz diária
  matriz.forEach((row, index) => {
    let data = new Date(row[colData]);
    let dataAtual = new Date(row[colData]);

    estacaoAtual = row[colCodEstacao];

    for (var i = 0; i <= 31; i++) {
      let verificar;
      if (i !== 0) {
        verificar = verificaDataNoMes(data, i);
      } else {
        verificar = true;
      }

      let precipitacao = row[colPrecipitacao + i];
      precipitacao =
        typeof precipitacao === "number"
          ? parseFloat(precipitacao.toFixed(2))
          : null;

      if (verificar) {
        dadosDiarios.push([
          generateUniqueId(), //[00] id
          row[colCodEstacao], //[01] CodEstacao
          row[colNivelConsistencia], //[02] Consistencia
          row[colTipoMedicao], //[03] TipoMedicao
          row[colPrepMaxMensal], //[04] PrecipitacaoMaxMensal
          row[colPrepTotal], //[05] PrecipitacaoTotalMensal
          dataAtual, //[06] Data
          i + 1, //[07] Dia
          gerarAno(dataAtual), //[08] Ano
          gerarAnoHidrologico(dataAtual, dataHidrologica), //[09] AnoHidrologico
          gerarMes(dataAtual, i + 1), //[10] Mes
          precipitacao, //[11] Precipitacao
          row[colStatus + i], //[12] Status
          divisivelPor(row[colPrecipitacao + i], 7), //[13] Divisivel por 7
          divisivelPor(row[colPrecipitacao + i], 25), //[14] Divisivel por 25
          divisivelPor(row[colPrecipitacao + i], 10), //[15] Divisivel por 10
        ]);
      }

      dataAtual = addDia(dataAtual, 1);
    }

    if (!!estacaoAnterior && estacaoAnterior !== estacaoAtual) {
      dadosEstacao.push(dadosDiarios);
      dadosDiarios = [];
    }

    estacaoAnterior = row[colCodEstacao];
  });

  dadosEstacao.push(dadosDiarios);

  return dadosEstacao;
}

function verificarInicioDosDados(row) {
  let cabecalho = [
    "EstacaoCodigo",
    "NivelConsistencia",
    "Data",
    "TipoMedicaoChuvas",
    "Maxima",
    "Total",
    "DiaMaxima",
    "NumDiasDeChuva",
    "Chuva01",
    "Chuva01Status",
  ];

  return cabecalho.every((elemento) => row.includes(elemento));
}

function indiceColuna(row) {}

function verificaDataNoMes(data, numero) {
  // Verifique se a data é válida
  if (!isValidDate(data)) {
    return false;
  }

  // Converta a data para um objeto Date
  let dataObj = new Date(data);
  dataObj.setDate(dataObj.getDate() + 1);

  // Verifique se a data resultante após adicionar o número de dias ainda está no mesmo mês
  let dataResultado = new Date(data);
  dataResultado.setDate(dataResultado.getDate() + numero + 1);

  return dataResultado.getMonth() === dataObj.getMonth();
}

function addDia(data, colDia) {
  // Data de exemplo
  var date = new Date(data); // Substitua pela sua data
  date.setDate(data.getDate() + colDia);
  return date;
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

function generateUniqueId() {
  const randomPart = Math.random().toString(36).substr(2, 9); // Parte aleatória
  const timestampPart = Date.now().toString(36); // Parte com base na data/hora atual
  return randomPart + timestampPart;
}

function gerarAnoHidrologico(data, dataHidrologica) {
  let ano = data.getFullYear();
  let mes = data.getMonth() + 2;
  let dia = data.getDate();

  let dataHidro = new Date(ano, dataHidrologica.mes - 1, dataHidrologica.dia);

  if (dia === 31 && mes === 13) {
    return ano + 1;
  } else if (data < dataHidro) {
    return ano - 1;
  } else {
    return ano;
  }
}

function divisivelPor(precipitacao, numero) {
  if (precipitacao && precipitacao > 0 && numero) {
    return precipitacao % numero === 0;
  }

  return false;
}

function gerarAno(data) {
  dia = data.getDate();
  mes = data.getMonth();

  if (dia === 31 && mes === 11) {
    return data.getFullYear() + 1;
  } else {
    return data.getFullYear();
  }
}

function gerarMes(data, dia) {
  let mes;
  if (dia === 1) {
    mes = data.getMonth() + 2;
  } else {
    mes = data.getMonth() + 1;
  }

  if (mes > 12) {
    return mes - 12;
  } else {
    return mes;
  }
}

module.exports = { lerPlanilhasExcel };
