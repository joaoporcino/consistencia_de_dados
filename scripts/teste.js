const fs = require("fs");
const ExcelJS = require("exceljs");
const path = require("path");

const {
  DadoMensal,
  DadoAnual,
  DadosEstacao,
  Estacao,
} = require("../classes/dados_pluviometricos.js");

async function lerPlanilhasExcel(dataHidrologica) {
  const diretorio = process.cwd();
  const arquivos = fs.readdirSync(diretorio);

  let matriz = [];
  let dadosPluviometricos = [];

  for (const arquivo of arquivos) {
    if (arquivo.endsWith(".xlsx")) {
      const caminhoDoArquivo = path.join(diretorio, arquivo);
      const workbook = new ExcelJS.Workbook();

      try {
        await workbook.xlsx.readFile(caminhoDoArquivo);
        workbook.eachSheet((worksheet) => {
          console.log(`Lendo planilha: ${worksheet.name}`);

          worksheet.eachRow((row, rowNumber) => {
            const valoresDaLinha = row.values;
            if (rowNumber > 13) matriz.push(valoresDaLinha);
          });
        });
      } catch (error) {
        console.error(`Erro ao ler arquivo ${arquivo}: ${error.message}`);
      }
    }

    dadosPluviometricos.push(instanciarObjetos(matriz, dataHidrologica));
    matriz = []
  }

  return dadosPluviometricos
}

function instanciarObjetos(matriz, dataHidrologica) {
  const colCodEstacao = 1;
  const colNivelConsistencia = 2;
  const colData = 3;
  const colTipoMedicao = 4;
  const colPrepMaxMensal = 5;
  const colPrepTotal = 6;
  const colDia = 14;
  const colStatus = 45;

  let dadosMensais = [];
  let dadosAnuais = [];
  let dadosEstacao = [];
  let estacao;
  let mes;
  let anoAtual;
  let anoHidrologicoAtual;
  let anoHidrologicoProx;
  let precipitacaoMax = 0;
  let precipitacaoTotal = 0;
  let tamanho = matriz.lenght

  matriz.forEach((row, index) => {
    let data = new Date(row[colData]);
    anoAtual = data.getFullYear();
    anoHidrologicoAtual = gerarAnoHidrologico(data, dataHidrologica);
    mes = data.getMonth() + 2; //Na data 01 do mês ele considera o mês anterior, e o javascript considera Janeiro = 0
    estacao = row[colCodEstacao];

    for (var i = 0; i <= 31; i++) {
      let verificar;
      if (i !== 0) {
        verificar = verificaDataNoMes(data, i);
      } else {
        verificar = true;
      }

      if (verificar) {
        dadosMensais.push({
          id: generateUniqueId(),
          data: addDia(data, i), //data,
          dia: i + 1,
          precipitacao: row[colDia + i],
          status: row[colStatus + i],
          nivelConsistencia: row[colNivelConsistencia],
        });

        if (precipitacaoMax < row[colDia + i]) {
          precipitacaoMax = row[colDia + i]
        }

        precipitacaoTotal = precipitacaoTotal + row[colDia + i]

      }
    }

    dadosAnuais.push({
      'mes': mes,
      'nivelConsistencia': row[colNivelConsistencia],
      'tipoMedicao': row[colTipoMedicao],
      'prepMaxMensal': row[colPrepMaxMensal],
      'prepTotal': row[colPrepTotal],
      'dadosMensais': dadosMensais,
    });

    if (anoHidrologicoAtual !== anoHidrologicoProx) {
      dadosEstacao.push({
        'ano': anoAtual,
        'anoHidrologico': anoHidrologicoAtual,
        'prepMaxAnual': precipitacaoMax,
        'prepTotal': precipitacaoTotal,
        'dadosAnuais': dadosAnuais,
      });

      dadosAnuais = [];
      precipitacaoMax = 0;
      precipitacaoTotal = 0;
    } else if (index === tamanho) {
      dadosEstacao.push({
        'ano': ano,
        'anoHidrologico': anoHidrologicoAtual,
        'prepMaxAnual': precipitacaoMax,
        'prepTotal': precipitacaoTotal,
        'dadosAnuais': dadosAnuais,
      });
    }

    anoHidrologicoProx = anoHidrologicoAtual;
    dadosMensais = [];
  });

  return dadosEstacao;
}

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

  if (data < dataHidro) {
    return ano - 1;
  } else {
    return ano;
  }
}

module.exports = { lerPlanilhasExcel };
