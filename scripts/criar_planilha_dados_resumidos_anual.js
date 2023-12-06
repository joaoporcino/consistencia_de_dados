const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function criarPlanilhaResumoAnual(dadosBasicos) {
  const workbook = new ExcelJS.Workbook();

  console.log("\nCriando a planilha de dados Resumidos")

  dadosBasicos.forEach((estacao) => {
    // console.log(JSON.stringify(estacao))
    const colEstacao = 0;

    let worksheet = workbook.addWorksheet("anual_" + estacao[0][colEstacao]);
    worksheet.addRow([
      "codEstacao",                   //0
      "anoHidrologico",               //1
      "dataInicial",                  //2
      "dataFinal",                    //3
      "qtdDiasOperacional",           //4
      "qtdDiasAno",                   //5
      "qtdDiasChuvosos",              //6
      "qtdDadosComPercentil",         //7    
      "qtdOutliers",                  //8
      "qtdMult7",                     //9
      "qtdMult25",                    //10
      "qtdMult10",                    //11
      "qtdDadosBrancos",              //12
      "qtdDadosReais",                //13
      "qtdDadosEstimados",            //14
      "qtdDadosDuvidosos",            //15
      "qtdDadosAcumulados",           //16
      "qtdDiasDadosRepetidos",        //17
      "maiorSeqDadosRepetidos",       //18
      "precipitacoesRepetidas",       //19
      "precipitacaoTotal",            //20
      "precipitacaoMax",              //21
      "precipitacaoZero",             //22
      "maiorDiasEmBranco",            //23
      "qtdMes",                       //24
      "qtdMesPrecZero",               //25
      "qtdOutlierMensal",             //26
      "qtdAmcr",                      //27
      "qtdStatusErrado",              //28
      "qtdErrosDetectados",           //29
    ]);

    estacao.forEach((dado) => {
      worksheet.addRow(dado);
    });
  });

  // Salve o arquivo Excel
  const filePath = gerarNomeDoArquivo("Dados_Resumidos_Anual.xlsx");


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

module.exports = { criarPlanilhaResumoAnual };
