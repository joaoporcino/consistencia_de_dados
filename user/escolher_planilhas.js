async function escolherPlanilhasComDadosDeChuva(rl) {
    return new Promise((resolve, reject) => {
        rl.question(
            '\nEscolha as planilhas com dados de chuva (separar por virgula, ou "-"): ',
            (resposta => {
                resolve(resposta)
            })
        )
    })
}

module.exports = {escolherPlanilhasComDadosDeChuva}