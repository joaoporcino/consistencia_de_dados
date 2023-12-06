// Importe os módulos necessários
const readline = require('readline');

const {definirDataHidrologica} = require('./user/definir_data_hidrlogica.js')
const {listarPlanilhas} = require('./scripts/verificar_planilhas.js')
const {escolherPlanilhasComDadosDeChuva} = require('./user/escolher_planilhas.js')
const {filtrarListaDePlanilhas} = require('./scripts/filtrar_lista_de_planilhas.js')
const {continuarProcessamento} = require('./user/continuar_processamento.js')
const {lerPlanilhasExcel} = require('./scripts/ler_dados_planilhas.js')
const {precipitacaoMaximas} = require('./scripts/precipitacoes_maximas.js')
const {definirAMCR} = require('./user/dfinir_amcr.js')
const {escolherAMCR} = require('./user/escolher_amcr.js')
const {desejaTratarQuaisDados} = require('./user/deseja_tratar_quais_dados.js')
const {calcularParametrosBasicos} = require('./scripts/calcular_parametros_basicos.js')
const {criarPlanilhaComDadosBasicos} = require('./scripts/criar_planilha_dados_basicos.js')
const {criarDadosResumidos} = require('./scripts/criar_dados_resumidos.js')
const {criarPlanilhaResumoMensal} = require('./scripts/criar_planilha_dados_resumidos_mensal.js')
const {criarPlanilhaResumoAnual} = require('./scripts/criar_planilha_dados_resumidos_anual.js')
const {calcularParametrosAbsolutos} = require('./scripts/calcular_parametros_absolutos.js')
const {criarPlanilhaAbsolutos} = require('./scripts/criar_planilha_dados_absolutos.js')
// const {escolherPlanilhasComDadosDeCoordenadas} = require('./user/escolher_planilha_coordenada.js')
// const {lerPlanilhasExcelDadoGeografico} = require('./scripts/ler_dados_planilhas_gepgraficos.js')


// Crie uma interface de leitura para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// Função principal que inicia a CLI
async function main() {
  console.log('\nOla, esta é um CLI para analise de consistencia de dados do pluviométricos do HidroWeb a partir de uma metodologia estudada no trabalho de conclusão de curso.\n');

  try {
    // Solicita a data hidrologica
    const dataHidrologica = await definirDataHidrologica(rl);

    // Confirma se há planilhas no diretório
    let planilhasEncontradas = listarPlanilhas()

    if (planilhasEncontradas instanceof Error) {
        console.log('Não há planilhas nesse diretório, o processo será finalizado!')
        process.exit(1)
    }

    //Escolher a planilha
    const planilhasEscolhidas = await escolherPlanilhasComDadosDeChuva(rl);

    //Filtrar lista de plainlhas
    planilhasEncontradas = filtrarListaDePlanilhas(planilhasEscolhidas, planilhasEncontradas)

    // Ler os dados das planilhas
    const dadosPluviometricos = await lerPlanilhasExcel(dataHidrologica, planilhasEncontradas)

    // Verificar precipitação máximas por estacao
    const precipitacaoMaxima = precipitacaoMaximas(dadosPluviometricos)

    // Definir se PMP total ou por estacao
    const respostaAMCR = await definirAMCR(rl)

    // Escolher os PMP's
    const amcr = await escolherAMCR(rl, precipitacaoMaxima, respostaAMCR);

    // Confirmar os tipos de dados a serem tratados
    const tipoDeDados = await desejaTratarQuaisDados(rl)

    // Calcular parametros básicos
    const dadosBasicos = calcularParametrosBasicos(dadosPluviometricos, tipoDeDados, amcr)

    // Criar planilha com Dados Basicos
    // await criarPlanilhaComDadosBasicos(dadosBasicos)

    // Criar dados resumidos
    const {dadosMensais, dadosAnuais} = criarDadosResumidos(dadosBasicos, dataHidrologica)

    // Criar planilha de Dados Resumidos Mensais
    // await criarPlanilhaResumoMensal(dadosMensais)

    // Criar planilha de Dados Resumidos Anuais
    // await criarPlanilhaResumoAnual(dadosAnuais)

    // Calcular parametros absolutos
    const dadosAbsolutos = calcularParametrosAbsolutos(dadosAnuais, dadosBasicos, amcr)

    // Criar planilha de Dados Absolutos
    await criarPlanilhaAbsolutos(dadosAbsolutos)

    // Confirma se há planilhas no diretório
    // listarPlanilhas()

    // Escolher planilha com coordenadas
    // const planilhaEscolhida = await escolherPlanilhasComDadosDeCoordenadas(rl);

    //Filtrar lista de plainlhas
    // planilhasEncontradas = filtrarListaDePlanilhas(planilhaEscolhida, planilhasEncontradas)

    // Ler os dados das planilhas
    // const dadosGeograficos = await lerPlanilhasExcelDadoGeografico(planilhasEncontradas)

    // Encerre a CLI
    console.log('\nA CLI foi encerrada.');
    process.exit(0);
  } catch (error) {
    console.error('\nOcorreu um erro:', error);
    process.exit(1);
  }
}

// Inicie a função principal
main();
