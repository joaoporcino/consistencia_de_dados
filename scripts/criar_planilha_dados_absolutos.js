const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function criarPlanilhaAbsolutos(dadosAbsolutos) {
  const workbook = new ExcelJS.Workbook();

  console.log("\nCriando a planilha de dados Absolutos")

  dadosAbsolutos.forEach((estacao) => {
    // console.log(JSON.stringify(estacao))
    const colEstacao = 0;

    let worksheet = workbook.addWorksheet("absoluto_" + estacao[0][colEstacao]);
    worksheet.addRow([
      "codEstacao",             //0
      "anoHidrologico",         //1
      "dataInicial",            //2
      "dataFinal",              //3
      "P",                      //4
      "Qgap",                   //5
      "Qmzero",                 //6
      "Qwzero",                 //7    
      "Qoutlier",               //8
      "Q",                      //9
      "QtdErros",
      "ED(%)"
    ]);

    estacao.forEach((dado) => {
      worksheet.addRow(dado);
    });
  });

  // Salve o arquivo Excel
  const filePath = gerarNomeDoArquivo("Dados_Absolutos.xlsx");


  await workbook.xlsx.writeFile(filePath);
  console.log(
    `\nArquivo Excel com ${dadosAbsolutos.length} workbooks criado em ${filePath}`
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

module.exports = { criarPlanilhaAbsolutos };
