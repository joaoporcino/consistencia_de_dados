function calcularParametrosBasicos(dados, tipoDeDados, amcr) {
  const colNivelConsistencia = 2;
  const colData = 6;
  let dadosFiltrados;

  //Filtra os dados de acordo com o Nivel de Consistência (b: brutos, c: consistidos, a: ambos)
  if (tipoDeDados === "b") {
    dadosFiltrados = dados.map((estacao) => {
      return estacao.filter((dado) => dado[colNivelConsistencia] === 1);
    });
  } else if (tipoDeDados === "c") {
    dadosFiltrados = dados.map((estacao) => {
      return estacao.filter((dado) => dado[colNivelConsistencia] === 2);
    });
  } else if (tipoDeDados === "a") {
    let contagemPorData = {};

    dadosFiltrados = dados.map((estacao) => {
      estacao.forEach((item) => {
        const data = item[colData];
        if (contagemPorData[data]) {
          contagemPorData[data].push(item);
        } else {
          contagemPorData[data] = [item];
        }
      });

      // Segunda iteração: Filtrar os dados com base nas condições
      let dadosEstacaoFiltrados = estacao.filter((item) => {
        const data = item[colData];
        const tipoDeConsistencia = item[colNivelConsistencia];

        if (contagemPorData[data].length > 1) {
          // Se houver mais de um com a mesma data, verifique o tipoDeConsistencia
          return tipoDeConsistencia === 2;
        } else {
          // Se houver apenas um com a mesma data, mantenha-o
          return true;
        }
      });

      return dadosEstacaoFiltrados;
    });
  } else {
    throw "Opção inválida";
  }

  //Criar status corrigido - 16
  dadosFiltrados = statusCorrigido(dadosFiltrados);

  //Verificar AMCR - 17
  dadosFiltrados = verificaAMCR(dadosFiltrados, amcr);

  //Calcula os percentis anuais e da série histórica - 18
  dadosFiltrados = calcularPercentisSerie(dadosFiltrados);

  //Identifica os outliers - 19
  dadosFiltrados = calcularOutliers(dadosFiltrados);

  //Identifica precipitacao em branco e se o status é em branco - 20
  dadosFiltrados = deviaSerAcumulado(dadosFiltrados);

  //Identifica os falsos "Acumulados" - 21
  dadosFiltrados = sequenciaRepetida(dadosFiltrados);

  //Identifica os outliers mensais da serie - 22
  dadosFiltrados = calcularOutliersMensais(dadosFiltrados);

  //Identifica erros detectados - 23
  dadosFiltrados = identificarErros(dadosFiltrados);

  return dadosFiltrados;
}

function statusCorrigido(dados) {
  dados = dados.map((estacao) => {
    const colPrecipitacao = 11;
    const colStatus = 12;
    const statusAcumulado = 4;

    let statusAtual;
    let statusAnterior;
    let precipitacaoAtual;
    let precipitacaoAnterior;

    estacao = estacao.map((dadoDiario) => {
      precipitacaoAtual = dadoDiario[colPrecipitacao];
      statusAtual = dadoDiario[colStatus];

      if (
        statusAnterior &&
        statusAnterior === statusAcumulado &&
        (precipitacaoAnterior === 0 || precipitacaoAnterior === null) &&
        statusAtual !== statusAcumulado &&
        precipitacaoAtual >= 0
      ) {
        dadoDiario.push(statusAcumulado);
      } else {
        dadoDiario.push(statusAtual);
      }

      precipitacaoAnterior = precipitacaoAtual;
      statusAnterior = statusAtual;

      return dadoDiario;
    });

    return estacao;
  });

  return dados;
}

function verificaAMCR(dados, amcr) {
  dados = dados.map((estacao) => {
    const colCodEstacao = 1;
    const colPMP = 3;
    const colPrecipitacao = 11;
    const codEstacao = estacao[0][colCodEstacao];

    let [pmpEstacao] = amcr.filter((est) => est[colCodEstacao] === codEstacao);
    pmpEstacao = pmpEstacao[colPMP];

    estacao = estacao.map((dadoDiario) => {
      let precipitacao = dadoDiario[colPrecipitacao];
      if (precipitacao > pmpEstacao) {
        dadoDiario.push(true);
      } else {
        dadoDiario.push(false);
      }

      return dadoDiario;
    });

    return estacao;
  });

  return dados;
}

function calcularPercentisSerie(dados) {
  const colPrecipitacao = 11;
  const colStatusCorrigido = 16;

  //Calcula os percentis da série histórica
  dados = dados.map((estacao) => {
    estacao.sort((a, b) => a[colPrecipitacao] - b[colPrecipitacao]);

    listaFiltrada = estacao.filter((dadoDiario) => {
      let verificacao = dadoDiario[colStatusCorrigido] === 1; //Real
      verificacao = verificacao || dadoDiario[colStatusCorrigido] === 2; //Estimado
      verificacao = verificacao || dadoDiario[colStatusCorrigido] === 3; //Duvidoso
      verificacao = verificacao && dadoDiario[colPrecipitacao] > 0;

      return verificacao;
    });

    let contador = 0;
    return estacao.map((dadoDiario) => {
      if (
        dadoDiario[colStatusCorrigido] >= 1 &&
        dadoDiario[colStatusCorrigido] <= 3 &&
        dadoDiario[colPrecipitacao] > 0
      ) {
        contador = contador + 1;
        dadoDiario.push(contador / listaFiltrada.length);
        return dadoDiario;
      } else {
        dadoDiario.push(null);
        return dadoDiario;
      }
    });
  });

  return dados;
}

function calcularOutliers(dados) {
  const colData = 6;
  const colAnoHidrologico = 9;
  const colPrecipitacao = 11;

  dados = dados.map((estacao) => {
    let dadosPercentisAnuais = [];
    let maximosAnuais = {};

    let objAnos = {};

    estacao.forEach((dadoDiario) => {
      let anoHidrologico = dadoDiario[colAnoHidrologico];

      if (objAnos[anoHidrologico]) {
        // objAnos[anoHidrologico].push(dadoDiario)
        maximosAnuais[anoHidrologico] =
          maximosAnuais[anoHidrologico] > dadoDiario[colPrecipitacao]
            ? maximosAnuais[anoHidrologico]
            : dadoDiario[colPrecipitacao];
      } else {
        // objAnos[anoHidrologico] = [dadoDiario]
        maximosAnuais[anoHidrologico] = dadoDiario[colPrecipitacao]
          ? dadoDiario[colPrecipitacao]
          : 0;
      }
    });

    //Calcular Outlier da serie histórica a partir das maiores precipitacoes anuais
    let matrizMaximosAnuais = [];
    for (const dado in maximosAnuais) {
      matrizMaximosAnuais.push(maximosAnuais[dado]);
    }

    const percentil25 = calcularPosicaoPercentil(matrizMaximosAnuais, 25);
    const percentil75 = calcularPosicaoPercentil(matrizMaximosAnuais, 75);

    const outlier = percentil75 + 1.5 * (percentil75 - percentil25);

    //Verifica outliers
    estacao = estacao.map((dadoDiario) => {
      if (dadoDiario[colPrecipitacao] > outlier) {
        dadoDiario.push(true);
      } else {
        dadoDiario.push(false);
      }

      return dadoDiario;
    });

    return estacao;
  });

  return dados;
}

function deviaSerAcumulado(dados) {
  dados = dados.map((estacao) => {
    const colPrecipitacao = 11;
    const colStatus = 12;
    const statusAcumulado = 4;

    let statusAtual;
    let statusAnterior;
    let precipitacaoAtual;
    let precipitacaoAnterior;

    estacao = estacao.map((dadoDiario) => {
      precipitacaoAtual = dadoDiario[colPrecipitacao];
      statusAtual = dadoDiario[colStatus];

      if (
        statusAnterior &&
        statusAnterior === statusAcumulado &&
        (precipitacaoAnterior === 0 || precipitacaoAnterior === null) &&
        statusAtual !== statusAcumulado &&
        precipitacaoAtual >= 0
      ) {
        dadoDiario.push(true);
      } else {
        dadoDiario.push(false);
      }

      precipitacaoAnterior = precipitacaoAtual;
      statusAnterior = statusAtual;

      return dadoDiario;
    });

    return estacao;
  });

  return dados;
}

function sequenciaRepetida(dados) {
  const colData = 6;
  const colPrecipitacao = 11;
  const colStatus = 12;
  const colSeqRepetida = 21;

  let statusAtual;
  let statusAnterior;
  let precipitacaoPosterior;
  let precipitacaoAtual;
  let encontrouAcumulado = false;

  dados = dados.map((estacao) => {
    estacao.sort((a, b) => a[colData] - b[colData]);

    for (let post = 0; post < estacao.length - 1; post++) {
      let ant = post + 1;

      precipitacaoAtual = estacao[ant][colPrecipitacao];
      precipitacaoPosterior = !!estacao[post][colPrecipitacao]
        ? estacao[post][colPrecipitacao]
        : null;

      if (
        precipitacaoPosterior &&
        precipitacaoAtual === precipitacaoPosterior &&
        precipitacaoAtual > 0
      ) {
        if (!estacao[ant][colSeqRepetida]) {
          estacao[ant].push(true);
        }

        estacao[post].push(true);
      } else {
        if (!estacao[ant][colSeqRepetida]) {
          estacao[ant].push(false);
        }
      }
    }

    return estacao;
  });

  return dados;
}

function calcularPosicaoPercentil(array, percentil, col) {
  // Passo 1: Ordene o array
  let arrayOrdenado;
  if (col) {
    arrayOrdenado = array.sort((a, b) => a[col] - b[col]);
  } else {
    arrayOrdenado = array.sort((a, b) => a - b);
  }

  // Passo 2: Calcule a posição do percentil
  const tamanhoArray = arrayOrdenado.length;
  const posicaoPercentil = (percentil / 100) * (tamanhoArray - 1);

  // Passo 3: Arredonde a posição, se necessário
  const posicaoArredondada = Math.round(posicaoPercentil);

  return arrayOrdenado[posicaoArredondada];
}

function calcularOutliersMensais(dadosFiltrados) {
  dadosFiltrados = dadosFiltrados.map((estacao) => {
    let colMes = 10;
    let colPrecipitacao = 11;
    let colStatus = 12;
    let objMesSerie = {};

    estacao.forEach((dadoDiario) => {
      let mes = dadoDiario[colMes];

      if (dadoDiario[colPrecipitacao] > 0 && dadoDiario[colStatus] !== 4) {
        if (!objMesSerie[mes]) {
          objMesSerie[mes] = [dadoDiario[colPrecipitacao]];
        } else {
          objMesSerie[mes].push(dadoDiario[colPrecipitacao]);
        }
      }
    });

    for (const ano in objMesSerie) {
      const percentil25 = calcularPosicaoPercentil(objMesSerie[ano], 25);
      const percentil75 = calcularPosicaoPercentil(objMesSerie[ano], 75);

      const outlier = percentil75 + 3 * (percentil75 - percentil25);

      objMesSerie[ano] = outlier;
    }

    estacao = estacao.map((dadoDiario) => {
      if (
        dadoDiario[colPrecipitacao] > objMesSerie[dadoDiario[colMes]] &&
        dadoDiario[colStatus] !== 4
      ) {
        dadoDiario.push(true);
      } else {
        dadoDiario.push(false);
      }

      return dadoDiario;
    });

    return estacao;
  });

  return dadosFiltrados;
}

function identificarErros(dados) {
  const colDiv7 = 13;
  const colDiv25 = 14;
  const colDiv10 = 15;
  const colAMCR = 17;
  const colDadoRepetido = 21;

  dados = dados.map((estacao) => {
    estacao = estacao.map((dadoDiario) => {
      let valida = dadoDiario[colDiv7];
      valida = dadoDiario[colDiv25] || valida;
      valida = dadoDiario[colDiv10] || valida;
      valida = dadoDiario[colAMCR] || valida;
      valida = dadoDiario[colDadoRepetido] || valida;

      dadoDiario.push(valida);

      return dadoDiario;
    });

    return estacao;
  });

  return dados;
}

module.exports = { calcularParametrosBasicos };
