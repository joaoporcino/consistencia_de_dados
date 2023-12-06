async function desejaTratarQuaisDados(rl) {
  return new Promise((resolve, reject) => {
    rl.question(
      "\nDeseja tratar os dados Brutos, Consistidos ou Ambos? (b/c/a):",
      (resposta) => {
        console.log("\nIniciado a criação da planilha de dados básicos!")
        resolve(resposta)
      })
  });
}

module.exports = { desejaTratarQuaisDados };
