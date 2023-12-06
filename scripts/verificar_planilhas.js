const fs = require("fs");
const path = require("path");
const Table = require("cli-table");

let table = new Table({
  head: ["", "Planilhas"],
});

function listarPlanilhas() {
  const diretorioAtual = process.cwd();
  const extensoesSuportadas = [".xlsx", ".xls"];
  const planilhasEncontradas = [];

  fs.readdirSync(diretorioAtual).forEach((nomeArquivo) => {
    const extensao = path.extname(nomeArquivo).toLowerCase();

    if (extensoesSuportadas.includes(extensao)) {
      planilhasEncontradas.push(nomeArquivo);
    }
  });

  if (planilhasEncontradas.length) {
    console.log("Planilhas Excel encontradas no diretório atual:");
    planilhasEncontradas.forEach((planilha, index) => {
      table.push([index + 1, planilha]);
    });

    console.log(table.toString());
    return planilhasEncontradas
  } else {
    return error
  }
}

module.exports = { listarPlanilhas };
