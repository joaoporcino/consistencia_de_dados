const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function criarPlanilhaResumoMensal(dadosBasicos) {
  const workbook = new ExcelJS.Workbook();

  console.log("\nCriando a panilha de dados Resumidos")

  dadosBasicos.forEach((estacao) => {
    // console.log(JSON.stringify(estacao))
    const colEstacao = 0;

    let worksheet = workbook.addWorksheet("mensal_" + estacao[0][colEstacao]);
    worksheet.addRow([
      "CodEstacao",
      "anoHidrologico",
      "mes",
      "qtdDiaMes",
      "qtdDiasChuvosos",
      "qtdDadosComPercentil",
      "qtdOutliers",
      "qtdMult7",
      "qtdMult25",
      "qtdMult10",
      "qtdDadosBranco",
      "qtdDadosReais",
      "qtdDadosEstimados",
      "qtdDadosDuvidosos",
      "qtdDadosAcumulados",
      "qtdDiasDadosRepetidos",
      "maiorSeqDadosRepetidos",
      "precipitacoesRepetidas",
      "precipitacaoTotal",
      "precipitacaoMax",
      "precipitacaoZero",
      "maiorDiasEmBranco",
      "qtdOutlierMensal",
      "qtdAmcr",
      "qtdStatusErrado",
      "qtdErrosDetectados",
    ]);

    estacao.forEach((dado) => {
      worksheet.addRow(dado);
    });
  });

  // Salve o arquivo Excel
  const filePath = gerarNomeDoArquivo("Dados_Resumidos_Mensal.xlsx");


  await workbook.xlsx.writeFile(filePath);
  console.log(
    `\nArquivo Excel com ${dadosBasicos.length} workbooks criado em ${filePath}`
  );
}

function gerarNomeDoArquivo(nomeDoArquivo) {
  // Verifica se o arquivo com o nome existe no diretório atual.
  if (fs.existsSync(nomeDoArquivo)) {
    // O arquivo com o nome existe. Vamos acrescentar (2) ao nome.
    const extensao = path.extname(nomeDoArquivo);
    const nomeBase = path.basename(nomeDoArquivo, extensao);
    let novoNome = nomeBase + " (2)" + extensao;

    // Verificar se o novo nome também já existe.
    while (fs.existsSync(novoNome)) {
      const numero = parseInt(novoNome.match(/\(\d+\)/)[0].match(/\d+/)[0]);
      novoNome = novoNome.replace(`(${numero})`, `(${numero + 1})`);
    }

    return novoNome;
  }
  return nomeDoArquivo; // O arquivo com o nome original não existe.
}

module.exports = { criarPlanilhaResumoMensal };
