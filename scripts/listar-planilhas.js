const fs = require('fs');
const path = require('path');
const program = require('commander');

// Função para listar as planilhas Excel no diretório atual
function listarPlanilhas() {
  const diretorioAtual = process.cwd();
  const extensoesSuportadas = ['.xlsx', '.xls'];
  const planilhasEncontradas = [];

  fs.readdirSync(diretorioAtual).forEach((nomeArquivo) => {
    const extensao = path.extname(nomeArquivo).toLowerCase();

    if (extensoesSuportadas.includes(extensao) && !nomeArquivo.startsWith('~$')) {
      planilhasEncontradas.push(nomeArquivo);
    }
  });

  console.log('Planilhas Excel encontradas no diretório atual:');
  planilhasEncontradas.forEach((planilha) => {
    console.log(planilha);
  });
}


