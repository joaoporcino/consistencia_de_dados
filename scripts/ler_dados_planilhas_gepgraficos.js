const fs = require("fs");
const ExcelJS = require("exceljs");
const path = require("path");

async function lerPlanilhasExcelDadoGeografico(istaNomesPlanilhas) {
  console.log("\nLendo a planilha de dados Geográficos!");
  const diretorio = process.cwd();
  const arquivos = fs.readdirSync(diretorio);

  let matriz = [];
  let dadosGeograficos = [];

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

      if (!dadosGeograficos.length) {
        dadosGeograficos = instanciarObjetos(matriz, dataHidrologica);
      } else {
        dadosGeograficos.concat(instanciarObjetos(matriz, dataHidrologica));
      }

      matriz = [];
    }
  }

  return dadosGeograficos;
}

function instanciarObjetos(matriz) {
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
}

module.exports = { lerPlanilhasExcelDadoGeografico };
