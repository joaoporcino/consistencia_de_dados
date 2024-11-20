class DadoMensal {
  constructor(id, data, dia, precipitacao, status, nivelConsistencia) {
    this.id = id;
    this.data = data;
    this.dia = dia;
    this.precipitacao = precipitacao;
    this.status = status;
    this.nivelConsistencia = nivelConsistencia;
  }
}

class DadoAnual {
  constructor(
    mes,
    nivelConsistencia,
    tipoMedicao,
    prepMaxMensal,
    prepTotal,
    dadosMensais
  ) {
    this.mes = mes;
    this.nivelConsistencia = nivelConsistencia;
    this.tipoMedicao = tipoMedicao;
    this.prepMaxMensal = prepMaxMensal;
    this.prepTotal = prepTotal;
    this.dadosMensais = dadosMensais.map(
      (dadosMensal) =>
        new DadoMensal(
          dadosMensal.id,
          dadosMensal.dia,
          dadosMensal.precipitacao,
          dadosMensal.status,
          dadosMensal.nivelConsistencia
        )
    );
  }
}

class DadosEstacao {
  constructor(ano, anoHidrologico, prepMaxAnual, prepTotal, dadosAnuais) {
    this.ano = ano;
    this.anoHidrologico = anoHidrologico;
    this.prepMaxAnual = prepMaxAnual;
    this.prepTotal = prepTotal;
    this.dadosAnuais = dadosAnuais.map(
      (dadosAnual) =>
        new DadoAnual(
          dadosAnual.mes,
          dadosAnual.prepMaxMensal,
          dadosAnual.prepTotal,
          dadosAnual.dadosMensais
        )
    );
  }
}

class Estacao {
  constructor(codEstacao, dadosEstacao) {
    this.codEstacao = codEstacao;
    this.dadosEstacao = dadosEstacao.map(
      (dadosEstacao) =>
        new DadosEstacao(
          dadosEstacao.ano,
          dadosEstacao.prepMaxAnual,
          dadosEstacao.prepTotal,
          dadosEstacao.dadosAnuais
        )
    );
  }
}

module.exports = {
  DadoMensal,
  DadoAnual,
  DadosEstacao,
  Estacao,
};
