// ======================================================
// MESP CLÍNICA MÉDICA
// PAINEL DE CHAMADAS
// ======================================================


// ======================================================
// VARIÁVEIS
// ======================================================

let ultimaChamadaExibida = null;

let somAtivado = false;

let vozesDisponiveis = [];


// ======================================================
// CARREGAR VOZES DO COMPUTADOR
// ======================================================

function carregarVozes() {

    vozesDisponiveis =
        window.speechSynthesis.getVoices();


    const selecionarVoz =
        document.getElementById(
            "selecionarVoz"
        );


    if (!selecionarVoz) {

        return;
    }


    // SALVAR VOZ QUE ESTAVA SELECIONADA

    const vozAnterior =
        selecionarVoz.value;


    selecionarVoz.innerHTML =
        "";


    // ==============================================
    // PROCURAR VOZES EM PORTUGUÊS
    // ==============================================

    const vozesPortugues =
        vozesDisponiveis.filter(

            voz =>

                voz.lang
                    .toLowerCase()
                    .startsWith("pt")

        );


    // ==============================================
    // SE EXISTIR VOZ EM PORTUGUÊS
    // MOSTRAR SOMENTE ELAS
    // ==============================================

    const listaDeVozes =

        vozesPortugues.length > 0

            ? vozesPortugues

            : vozesDisponiveis;


    // ==============================================
    // NENHUMA VOZ
    // ==============================================

    if (listaDeVozes.length === 0) {

        const opcao =
            document.createElement(
                "option"
            );


        opcao.textContent =
            "Nenhuma voz encontrada";


        selecionarVoz.appendChild(
            opcao
        );


        return;
    }


    // ==============================================
    // COLOCAR VOZES NO SELECT
    // ==============================================

    listaDeVozes.forEach(

        voz => {

            const opcao =
                document.createElement(
                    "option"
                );


            opcao.value =
                voz.name;


            opcao.textContent =
                `${voz.name} - ${voz.lang}`;


            selecionarVoz.appendChild(
                opcao
            );

        }

    );


    // ==============================================
    // RESTAURAR VOZ ESCOLHIDA
    // ==============================================

    const existeVozAnterior =
        listaDeVozes.some(

            voz =>
                voz.name ===
                vozAnterior

        );


    if (existeVozAnterior) {

        selecionarVoz.value =
            vozAnterior;
    }

}


// ======================================================
// EVENTO DE CARREGAMENTO DAS VOZES
// ======================================================

if (
    "speechSynthesis" in window
) {

    window.speechSynthesis.onvoiceschanged =
        carregarVozes;


    carregarVozes();
}


// ======================================================
// PEGAR VOZ ESCOLHIDA
// ======================================================

function pegarVozSelecionada() {

    const selecionarVoz =
        document.getElementById(
            "selecionarVoz"
        );


    if (!selecionarVoz) {

        return null;
    }


    const nomeVoz =
        selecionarVoz.value;


    return vozesDisponiveis.find(

        voz =>
            voz.name ===
            nomeVoz

    ) || null;
}


// ======================================================
// CRIAR FALA
// ======================================================

function criarMensagem(texto) {

    const mensagem =
        new SpeechSynthesisUtterance(
            texto
        );


    // PORTUGUÊS BRASIL

    mensagem.lang =
        "pt-BR";


    // VELOCIDADE
    // 1 = normal
    // 0.85 = um pouco mais devagar

    mensagem.rate =
        0.85;


    // TOM
    // 1 = normal

    mensagem.pitch =
        1;


    // VOLUME

    mensagem.volume =
        1;


    // PEGAR VOZ ESCOLHIDA

    const voz =
        pegarVozSelecionada();


    if (voz) {

        mensagem.voice =
            voz;


        mensagem.lang =
            voz.lang;
    }


    return mensagem;
}


// ======================================================
// TESTAR VOZ
// ======================================================

function testarVoz() {

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Este navegador não suporta voz."
        );

        return;
    }


    window.speechSynthesis.cancel();


    const mensagem =
        criarMensagem(

            "Olá. Esta é a voz selecionada para o sistema de chamadas da MESP."

        );


    window.speechSynthesis.speak(
        mensagem
    );
}


// ======================================================
// ATIVAR SOM
// ======================================================

function ativarSom() {

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Este navegador não suporta voz."
        );

        return;
    }


    somAtivado =
        true;


    const botao =
        document.getElementById(
            "btnSom"
        );


    botao.textContent =
        "🔊 SOM ATIVADO";


    botao.classList.add(
        "ativo"
    );


    // FALAR PARA CONFIRMAR

    window.speechSynthesis.cancel();


    const mensagem =
        criarMensagem(
            "Som ativado."
        );


    window.speechSynthesis.speak(
        mensagem
    );
}


// ======================================================
// FALAR CHAMADA
// ======================================================

function falarChamada(chamada) {

    if (!somAtivado) {

        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    // ==============================================
    // TEXTO FALADO
    //
    // EXEMPLO:
    //
    // Lucas Silva. Sala 2.
    // ==============================================

    const texto =

        `${chamada.nome}. ${chamada.destino}.`;


    const mensagem =
        criarMensagem(
            texto
        );


    // CANCELAR VOZ ANTERIOR

    window.speechSynthesis.cancel();


    // FALAR NOVA CHAMADA

    window.speechSynthesis.speak(
        mensagem
    );
}


// ======================================================
// RELÓGIO
// ======================================================

function atualizarRelogio() {

    const agora =
        new Date();


    const relogio =
        document.getElementById(
            "relogio"
        );


    const data =
        document.getElementById(
            "data"
        );


    if (relogio) {

        relogio.textContent =

            agora.toLocaleTimeString(

                "pt-BR",

                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }

            );

    }


    if (data) {

        data.textContent =

            agora.toLocaleDateString(

                "pt-BR",

                {

                    weekday:
                        "long",

                    day:
                        "2-digit",

                    month:
                        "long"

                }

            );

    }

}


// ======================================================
// SEGURANÇA DO TEXTO
// ======================================================

function escaparHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto ?? "";


    return div.innerHTML;
}


// ======================================================
// CARREGAR DADOS
// ======================================================

function carregarPainel() {

    let chamada =
        null;


    let chamadas =
        [];


    try {

        chamada =
            JSON.parse(

                localStorage.getItem(
                    "mespChamadaAtual"
                )

            );


        chamadas =
            JSON.parse(

                localStorage.getItem(
                    "mespChamadas"
                )

            ) || [];

    }

    catch (erro) {

        console.error(
            "Erro ao carregar chamadas:",
            erro
        );

    }


    mostrarChamada(
        chamada
    );


    mostrarUltimasChamadas(
        chamadas
    );

}


// ======================================================
// MOSTRAR CHAMADA PRINCIPAL
// ======================================================

function mostrarChamada(chamada) {

    const aguardando =
        document.getElementById(
            "aguardando"
        );


    const areaChamada =
        document.getElementById(
            "chamada"
        );


    if (!aguardando || !areaChamada) {

        return;
    }


    // ==============================================
    // SEM CHAMADA
    // ==============================================

    if (!chamada) {

        aguardando
            .classList
            .remove(
                "escondido"
            );


        areaChamada
            .classList
            .add(
                "escondido"
            );


        return;
    }


    // ==============================================
    // MOSTRAR CHAMADA
    // ==============================================

    aguardando
        .classList
        .add(
            "escondido"
        );


    areaChamada
        .classList
        .remove(
            "escondido"
        );


    // NOME

    document
        .getElementById(
            "nomeChamada"
        )
        .textContent =
        chamada.nome;


    // DESTINO

    document
        .getElementById(
            "destinoChamada"
        )
        .textContent =
        chamada.destino;


    // HORÁRIO

    document
        .getElementById(
            "horarioChamada"
        )
        .textContent =

        chamada.horario

            ? `Chamada às ${chamada.horario}`

            : "";


    // ==============================================
    // VERIFICAR SE É UMA NOVA CHAMADA
    // ==============================================

    if (
        String(
            ultimaChamadaExibida
        )
        !==
        String(
            chamada.id
        )
    ) {


        ultimaChamadaExibida =
            chamada.id;


        // ==========================================
        // ANIMAÇÃO
        // ==========================================

        areaChamada
            .classList
            .remove(
                "animar"
            );


        void areaChamada.offsetWidth;


        areaChamada
            .classList
            .add(
                "animar"
            );


        // ==========================================
        // VOZ
        // ==========================================

        falarChamada(
            chamada
        );

    }

}


// ======================================================
// ÚLTIMAS CHAMADAS
// ======================================================

function mostrarUltimasChamadas(
    chamadas
) {

    const lista =
        document.getElementById(
            "listaChamadas"
        );


    if (!lista) {

        return;
    }


    if (
        !chamadas ||
        chamadas.length === 0
    ) {

        lista.innerHTML = `

            <div class="sem-chamadas">

                Nenhuma chamada realizada.

            </div>

        `;


        return;
    }


    const ultimas =
        chamadas.slice(
            0,
            5
        );


    lista.innerHTML =

        ultimas
            .map(

                chamada => `

                    <div class="item-chamada">

                        <strong>

                            ${escaparHTML(
                                chamada.nome
                            )}

                            <span class="destino-lista">

                                -

                                ${escaparHTML(
                                    chamada.destino
                                )}

                            </span>

                        </strong>


                        <div class="item-chamada-info">

                            <span>

                                ${escaparHTML(
                                    chamada.data || ""
                                )}

                            </span>


                            <span>

                                ${escaparHTML(
                                    chamada.horario || ""
                                )}

                            </span>

                        </div>

                    </div>

                `

            )
            .join("");

}


// ======================================================
// DETECTAR ALTERAÇÃO DO SISTEMA PRINCIPAL
// ======================================================

window.addEventListener(

    "storage",

    function(event) {


        if (

            event.key ===
                "mespChamadaAtual"

            ||

            event.key ===
                "mespChamadas"

        ) {

            carregarPainel();

        }

    }

);


// ======================================================
// VERIFICAÇÃO AUTOMÁTICA
// ======================================================

// Mesmo se o evento "storage" falhar,
// o painel verifica novas chamadas
// a cada meio segundo.

setInterval(

    carregarPainel,

    500

);


// ======================================================
// INICIAR RELÓGIO
// ======================================================

atualizarRelogio();


setInterval(

    atualizarRelogio,

    1000

);


// ======================================================
// CARREGAR VOZES NOVAMENTE
// ======================================================

setTimeout(

    carregarVozes,

    500

);


setTimeout(

    carregarVozes,

    1500

);


// ======================================================
// INICIAR PAINEL
// ======================================================

carregarPainel();