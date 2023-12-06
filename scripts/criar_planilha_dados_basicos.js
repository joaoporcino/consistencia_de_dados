const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function criarPlanilhaComDadosBasicos(dadosBasicos) {
  const workbook = new ExcelJS.Workbook();

  console.log('\nCriando planilha com dados básicos')

  dadosBasicos.forEach((estacao) => {
    const colEstacao = 1;

    let worksheet = workbook.addWorksheet("chuva_" + estacao[0][colEstacao]);

    worksheet.addRow([
      "id",                           //0
      "CodEstacao",                   //1
      "Consistencia",                 //2
      "TipoMedicao",                  //3
      "PrecipitacaoMaxMensal",        //4
      "PrecipitacaoTotalMensal",      //5
      "Data",                         //6
      "Dia",                          //7
      "Ano",                          //8
      "AnoHidrologico",               //9
      "Mes",                          //10
      "Precipitacao",                 //11
      "Status",                       //12
      "Divisivel7",                   //13
      "Divisivel25",                  //14
      "Divisivel10",                  //15
      "statusCorrigido",              //16
      "AMCR",                         //17
      "PercentilSerie",               //18
      "Outlier",                      //19
      "StatusErrado",                 //20
      "SequenciaRepetida",            //21
      "OutlierMensal",                //22
      "ErrosDetectados",              //23
    ]);

    estacao.forEach((dado) => {
      worksheet.addRow(dado);
    });
  });

  // Salve o arquivo Excel
  const filePath = gerarNomeDoArquivo("Dados_Basicos.xlsx");


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

module.exports = { criarPlanilhaComDadosBasicos };
