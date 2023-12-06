async function escolherPlanilhasComDadosDeCoordenadas(rl) {
    return new Promise((resolve, reject) => {
        rl.question(
            '\nEscolha as planilhas com dados de coordenadas (separar por virgula, ou "-"): ',
            (resposta => {
                resolve(resposta)
            })
        )
    })
}

module.exports = {escolherPlanilhasComDadosDeCoordenadas}