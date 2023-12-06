function filtrarListaDePlanilhas(string, array) {
  const elementos = string.split(","); // Divide a string nos separadores de vírgula
  const resultado = [];

  elementos.forEach((elemento) => {
    if (elemento.includes("-")) {
      const [inicio, fim] = elemento.split("-").map(Number); // Divide o intervalo e converte para número
      resultado.push(...array.slice(inicio - 1, fim)); // Adiciona o intervalo ao resultado
    } else {
      resultado.push(array[parseInt(elemento) - 1]); // Adiciona o elemento único ao resultado
    }
  });

  return resultado;
}

module.exports = {filtrarListaDePlanilhas}