// funcoes.js

async function definirDataHidrologica(rl) {
  return new Promise((resolve, reject) => {
    rl.question("Deseja trabalhar com ano hidrológico? (y/n): ", async (resposta) => {
      if (
        resposta === "y" ||
        resposta === "Y" ||
        resposta === "s" ||
        resposta === "S"
      ) {
        rl.question("Mes: ", (mes) => {
          rl.question("Dia: ", (dia) => {
            resolve({ dia, mes });
          });
        });
      } else {
        console.log("\nO ano hidrológico será considerado igual ao civil!\n");
        setTimeout(() => {
          resolve({ dia: "01", mes: "01" });
        }, 1000);
      }
    });
  });
}

module.exports = { definirDataHidrologica };
