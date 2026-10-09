// ======================================================
// MESP - SISTEMA PRINCIPAL
// ======================================================


// ======================================================
// CONFIGURAÇÃO
// ======================================================

const SENHA_SISTEMA =
    "mesp123";


// ======================================================
// DADOS
// ======================================================

let pacientes =
    JSON.parse(
        localStorage.getItem(
            "mespPacientes"
        )
    ) || [];


let historico =
    JSON.parse(
        localStorage.getItem(
            "mespHistorico"
        )
    ) || [];


// ======================================================
// LOGIN
// ======================================================

function entrarSistema() {

    const campo =
        document.getElementById(
            "senha"
        );


    const erro =
        document.getElementById(
            "erroLogin"
        );


    if (
        campo.value !==
        SENHA_SISTEMA
    ) {

        erro.textContent =
            "Senha incorreta.";


        campo.value =
            "";


        campo.focus();


        return;
    }


    erro.textContent =
        "";


    document
        .getElementById(
            "telaLogin"
        )
        .classList
        .add(
            "escondido"
        );


    document
        .getElementById(
            "sistema"
        )
        .classList
        .remove(
            "escondido"
        );


    sessionStorage.setItem(
        "mespLogado",
        "sim"
    );


    atualizarSistema();
}


// ======================================================
// SAIR
// ======================================================

function sairSistema() {

    sessionStorage.removeItem(
        "mespLogado"
    );


    document
        .getElementById(
            "sistema"
        )
        .classList
        .add(
            "escondido"
        );


    document
        .getElementById(
            "telaLogin"
        )
        .classList
        .remove(
            "escondido"
        );


    document
        .getElementById(
            "senha"
        )
        .value =
        "";
}


// ======================================================
// SALVAR
// ======================================================

function salvar() {

    localStorage.setItem(
        "mespPacientes",
        JSON.stringify(
            pacientes
        )
    );


    localStorage.setItem(
        "mespHistorico",
        JSON.stringify(
            historico
        )
    );
}


// ======================================================
// HORA
// ======================================================

function horaAtual() {

    return new Date()
        .toLocaleTimeString(
            "pt-BR",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );
}


// ======================================================
// DATA
// ======================================================

function dataAtual() {

    return new Date()
        .toLocaleDateString(
            "pt-BR"
        );
}


// ======================================================
// SEGURANÇA
// ======================================================

function escaparHTML(
    texto
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto ?? "";


    return div.innerHTML;
}


// ======================================================
// ADICIONAR PACIENTE
// ======================================================

function adicionarPaciente() {

    const campo =
        document.getElementById(
            "nomePaciente"
        );


    const nome =
        campo.value.trim();


    if (!nome) {

        alert(
            "Digite o nome do paciente."
        );


        campo.focus();


        return;
    }


    const paciente = {

        id:
            Date.now(),

        nome:
            nome,

        status:
            "recepcao",

        data:
            dataAtual(),

        chegada:
            horaAtual(),

        entradaTriagem:
            null,

        entradaMedico:
            null,

        finalizado:
            null,

        pressaoSistolica:
            null,

        pressaoDiastolica:
            null

    };


    pacientes.push(
        paciente
    );


    salvar();


    atualizarSistema();


    campo.value =
        "";


    campo.focus();
}


// ======================================================
// RECEPÇÃO -> TRIAGEM
// ======================================================

function enviarTriagem(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    paciente.status =
        "triagem";


    paciente.entradaTriagem =
        horaAtual();


    salvar();


    atualizarSistema();
}


// ======================================================
// SALVAR PRESSÃO
// ======================================================

function salvarPressao(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return false;
    }


    const campoSistolica =
        document.getElementById(
            `pressaoSistolica-${id}`
        );


    const campoDiastolica =
        document.getElementById(
            `pressaoDiastolica-${id}`
        );


    if (
        !campoSistolica ||
        !campoDiastolica
    ) {

        return false;
    }


    const sistolica =
        Number(
            campoSistolica.value
        );


    const diastolica =
        Number(
            campoDiastolica.value
        );


    // ==============================================
    // CAMPOS VAZIOS
    // ==============================================

    if (
        campoSistolica.value === "" ||
        campoDiastolica.value === ""
    ) {

        alert(
            "Digite a pressão sistólica e a diastólica."
        );


        campoSistolica.focus();


        return false;
    }


    // ==============================================
    // VERIFICAR NÚMEROS
    // ==============================================

    if (
        !Number.isFinite(
            sistolica
        )
        ||
        !Number.isFinite(
            diastolica
        )
    ) {

        alert(
            "Digite valores válidos para a pressão arterial."
        );


        return false;
    }


    // ==============================================
    // VALIDAÇÃO DE ENTRADA
    //
    // Estes limites servem para evitar erros
    // de digitação no sistema, não para fazer
    // diagnóstico médico.
    // ==============================================

    if (
        sistolica < 40 ||
        sistolica > 300
    ) {

        alert(
            "Confira o valor da pressão sistólica."
        );


        campoSistolica.focus();


        return false;
    }


    if (
        diastolica < 20 ||
        diastolica > 200
    ) {

        alert(
            "Confira o valor da pressão diastólica."
        );


        campoDiastolica.focus();


        return false;
    }


    // ==============================================
    // SALVAR
    // ==============================================

    paciente.pressaoSistolica =
        Math.round(
            sistolica
        );


    paciente.pressaoDiastolica =
        Math.round(
            diastolica
        );


    salvar();


    return true;
}


// ======================================================
// TRIAGEM -> MÉDICO
// ======================================================

function enviarMedico(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    // PRIMEIRO SALVAR PRESSÃO

    if (
        !salvarPressao(id)
    ) {

        return;
    }


    paciente.status =
        "medico";


    paciente.entradaMedico =
        horaAtual();


    salvar();


    atualizarSistema();
}


// ======================================================
// VOLTAR PARA RECEPÇÃO
// ======================================================

function voltarRecepcao(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    paciente.status =
        "recepcao";


    paciente.entradaTriagem =
        null;


    paciente.entradaMedico =
        null;


    paciente.pressaoSistolica =
        null;


    paciente.pressaoDiastolica =
        null;


    salvar();


    atualizarSistema();
}


// ======================================================
// VOLTAR PARA TRIAGEM
// ======================================================

function voltarTriagem(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    paciente.status =
        "triagem";


    paciente.entradaMedico =
        null;


    salvar();


    atualizarSistema();
}


// ======================================================
// EXCLUIR PACIENTE
// ======================================================

function excluirPaciente(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    const confirmar =
        confirm(

            `Remover ${paciente.nome} da fila?`

        );


    if (!confirmar) {

        return;
    }


    pacientes =
        pacientes.filter(
            p =>
                p.id !== id
        );


    salvar();


    atualizarSistema();
}


// ======================================================
// FINALIZAR
// ======================================================

function finalizarPaciente(
    id
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    const confirmar =
        confirm(

            `Finalizar atendimento de ${paciente.nome}?`

        );


    if (!confirmar) {

        return;
    }


    paciente.finalizado =
        horaAtual();


    historico.unshift({

        ...paciente

    });


    pacientes =
        pacientes.filter(
            p =>
                p.id !== id
        );


    salvar();


    atualizarSistema();


    mostrarHistorico();
}


// ======================================================
// CHAMADA DA TV
// ======================================================

function chamarPaciente(
    id,
    destino
) {

    const paciente =
        pacientes.find(
            p =>
                p.id === id
        );


    if (!paciente) {

        return;
    }


    const chamada = {

        id:
            Date.now(),

        pacienteId:
            paciente.id,

        nome:
            paciente.nome,

        destino:
            destino,

        horario:
            horaAtual(),

        data:
            dataAtual()

    };


    // CHAMADA ATUAL

    localStorage.setItem(

        "mespChamadaAtual",

        JSON.stringify(
            chamada
        )

    );


    // HISTÓRICO DAS CHAMADAS

    let chamadas =
        JSON.parse(

            localStorage.getItem(
                "mespChamadas"
            )

        ) || [];


    chamadas.unshift(
        chamada
    );


    // GUARDAR SOMENTE AS 30 ÚLTIMAS

    chamadas =
        chamadas.slice(
            0,
            30
        );


    localStorage.setItem(

        "mespChamadas",

        JSON.stringify(
            chamadas
        )

    );
}


// ======================================================
// CHAMAR SALA
// ======================================================

function chamarSala(
    id
) {

    const select =
        document.getElementById(
            `sala-${id}`
        );


    if (!select) {

        return;
    }


    chamarPaciente(

        id,

        select.value

    );
}


// ======================================================
// NAVEGAÇÃO
// ======================================================

function abrirTela(
    tela
) {

    const telas = [

        "recepcao",

        "triagem",

        "medico",

        "historico"

    ];


    telas.forEach(

        nome => {

            document
                .getElementById(
                    nome
                )
                .classList
                .add(
                    "escondida"
                );

        }

    );


    document
        .getElementById(
            tela
        )
        .classList
        .remove(
            "escondida"
        );


    // REMOVER ATIVO DOS BOTÕES

    document
        .querySelectorAll(
            ".menu-btn"
        )
        .forEach(

            botao => {

                botao
                    .classList
                    .remove(
                        "ativo"
                    );

            }

        );


    const mapa = {

        recepcao:
            "btnRecepcao",

        triagem:
            "btnTriagem",

        medico:
            "btnMedico",

        historico:
            "btnHistorico"

    };


    document
        .getElementById(
            mapa[tela]
        )
        .classList
        .add(
            "ativo"
        );


    if (
        tela ===
        "historico"
    ) {

        mostrarHistorico();
    }
}


// ======================================================
// MOSTRAR PRESSÃO
// ======================================================

function formatarPressao(
    paciente
) {

    if (
        paciente.pressaoSistolica == null ||
        paciente.pressaoDiastolica == null
    ) {

        return "Não registrada";
    }


    return (
        `${paciente.pressaoSistolica}` +
        `/` +
        `${paciente.pressaoDiastolica}` +
        ` mmHg`
    );
}


// ======================================================
// CRIAR CARD
// ======================================================

function criarCard(
    paciente,
    numero,
    setor
) {

    const nome =
        escaparHTML(
            paciente.nome
        );


    let horarios = `

        <span>

            Chegada:

            <strong>

                ${paciente.chegada || "--:--"}

            </strong>

        </span>

    `;


    if (
        paciente.entradaTriagem
    ) {

        horarios += `

            <span>

                Triagem:

                <strong>

                    ${paciente.entradaTriagem}

                </strong>

            </span>

        `;
    }


    if (
        paciente.entradaMedico
    ) {

        horarios += `

            <span>

                Médico:

                <strong>

                    ${paciente.entradaMedico}

                </strong>

            </span>

        `;
    }


    let botoes =
        "";


    let informacoesExtras =
        "";


    // ==================================================
    // RECEPÇÃO
    // ==================================================

    if (
        setor ===
        "recepcao"
    ) {

        botoes = `

            <button
                class="btn btn-avancar"
                onclick="enviarTriagem(${paciente.id})"
            >

                Enviar para triagem →

            </button>


            <button
                class="btn btn-excluir"
                onclick="excluirPaciente(${paciente.id})"
            >

                Excluir

            </button>

        `;
    }


    // ==================================================
    // TRIAGEM
    // ==================================================

    if (
        setor ===
        "triagem"
    ) {

        informacoesExtras = `

            <div class="campo-pressao">

                <label>

                    🩺 Pressão arterial

                </label>


                <div class="pressao-inputs">


                    <!-- SISTÓLICA -->

                    <input
                        type="number"
                        id="pressaoSistolica-${paciente.id}"
                        placeholder="120"
                        min="40"
                        max="300"
                        step="1"
                        value="${
                            paciente.pressaoSistolica ?? ""
                        }"
                    >


                    <span class="barra">

                        /

                    </span>


                    <!-- DIASTÓLICA -->

                    <input
                        type="number"
                        id="pressaoDiastolica-${paciente.id}"
                        placeholder="80"
                        min="20"
                        max="200"
                        step="1"
                        value="${
                            paciente.pressaoDiastolica ?? ""
                        }"
                    >


                    <span class="unidade">

                        mmHg

                    </span>

                </div>

            </div>

        `;


        botoes = `

            <button
                class="btn btn-voltar"
                onclick="voltarRecepcao(${paciente.id})"
            >

                ← Voltar

            </button>


            <button
                class="btn btn-chamar"
                onclick="chamarPaciente(${paciente.id}, 'TRIAGEM')"
            >

                📢 Chamar

            </button>


            <button
                class="btn btn-avancar"
                onclick="enviarMedico(${paciente.id})"
            >

                Enviar para médico →

            </button>

        `;
    }


    // ==================================================
    // MÉDICO
    // ==================================================

    if (
        setor ===
        "medico"
    ) {

        informacoesExtras = `

            <div class="pressao-medico">

                <span>

                    🩺 Pressão registrada

                </span>

                <strong>

                    ${formatarPressao(paciente)}

                </strong>

            </div>

        `;


        botoes = `

            <button
                class="btn btn-voltar"
                onclick="voltarTriagem(${paciente.id})"
            >

                ← Voltar

            </button>


            <select
                id="sala-${paciente.id}"
                class="select-sala"
            >

                <option value="SALA 1">
                    Sala 1
                </option>

                <option value="SALA 2">
                    Sala 2
                </option>

                <option value="SALA 3">
                    Sala 3
                </option>

                <option value="SALA 4">
                    Sala 4
                </option>

                <option value="SALA 5">
                    Sala 5
                </option>

            </select>


            <button
                class="btn btn-chamar"
                onclick="chamarSala(${paciente.id})"
            >

                📢 Chamar

            </button>


            <button
                class="btn btn-finalizar"
                onclick="finalizarPaciente(${paciente.id})"
            >

                ✓ Finalizar

            </button>

        `;
    }


    // ==================================================
    // RETORNAR CARD
    // ==================================================

    return `

        <div class="paciente">

            <div class="paciente-conteudo">


                <div class="paciente-info">


                    <div class="numero">

                        ${numero}

                    </div>


                    <div>

                        <div class="nome">

                            ${nome}

                        </div>


                        <div class="horarios">

                            ${horarios}

                        </div>

                    </div>


                </div>


                ${informacoesExtras}


            </div>


            <div class="acoes">

                ${botoes}

            </div>


        </div>

    `;
}


// ======================================================
// ATUALIZAR LISTA
// ======================================================

function atualizarLista(
    setor,
    listaId,
    contadorId
) {

    const fila =
        pacientes.filter(
            p =>
                p.status === setor
        );


    document
        .getElementById(
            contadorId
        )
        .textContent =
        fila.length;


    const lista =
        document.getElementById(
            listaId
        );


    if (
        fila.length === 0
    ) {

        lista.innerHTML = `

            <div class="vazio">

                <strong>

                    Nenhum paciente aguardando

                </strong>

                A fila está vazia.

            </div>

        `;


        return;
    }


    lista.innerHTML =

        fila.map(

            (
                paciente,
                index
            ) =>

                criarCard(

                    paciente,

                    index + 1,

                    setor

                )

        ).join("");
}


// ======================================================
// HISTÓRICO
// ======================================================

function mostrarHistorico() {

    const tabela =
        document.getElementById(
            "tabelaHistorico"
        );


    const vazio =
        document.getElementById(
            "historicoVazio"
        );


    const pesquisa =
        document.getElementById(
            "pesquisaHistorico"
        );


    const texto =

        pesquisa

            ? pesquisa
                .value
                .trim()
                .toLowerCase()

            : "";


    const resultados =
        historico.filter(

            paciente =>

                paciente.nome
                    .toLowerCase()
                    .includes(
                        texto
                    )

        );


    if (
        resultados.length === 0
    ) {

        tabela.innerHTML =
            "";


        vazio
            .classList
            .remove(
                "escondido"
            );


        return;
    }


    vazio
        .classList
        .add(
            "escondido"
        );


    tabela.innerHTML =

        resultados.map(

            paciente => `

                <tr>

                    <td>

                        <strong>

                            ${escaparHTML(
                                paciente.nome
                            )}

                        </strong>

                    </td>


                    <td>

                        ${paciente.chegada || "-"}

                    </td>


                    <td>

                        ${paciente.entradaTriagem || "-"}

                    </td>


                    <td>

                        ${formatarPressao(paciente)}

                    </td>


                    <td>

                        ${paciente.entradaMedico || "-"}

                    </td>


                    <td>

                        ${paciente.finalizado || "-"}

                    </td>


                    <td>

                        ${paciente.data || "-"}

                    </td>

                </tr>

            `

        ).join("");
}


// ======================================================
// DASHBOARD
// ======================================================

function atualizarPainel() {

    const recepcao =
        pacientes.filter(
            p =>
                p.status ===
                "recepcao"
        ).length;


    const triagem =
        pacientes.filter(
            p =>
                p.status ===
                "triagem"
        ).length;


    const medico =
        pacientes.filter(
            p =>
                p.status ===
                "medico"
        ).length;


    const hoje =
        dataAtual();


    const atendidos =
        historico.filter(
            p =>
                p.data ===
                hoje
        ).length;


    document
        .getElementById(
            "painelRecepcao"
        )
        .textContent =
        recepcao;


    document
        .getElementById(
            "painelTriagem"
        )
        .textContent =
        triagem;


    document
        .getElementById(
            "painelMedico"
        )
        .textContent =
        medico;


    document
        .getElementById(
            "painelAtendidos"
        )
        .textContent =
        atendidos;


    document
        .getElementById(
            "badgeRecepcao"
        )
        .textContent =
        recepcao;


    document
        .getElementById(
            "badgeTriagem"
        )
        .textContent =
        triagem;


    document
        .getElementById(
            "badgeMedico"
        )
        .textContent =
        medico;
}


// ======================================================
// ATUALIZAR SISTEMA
// ======================================================

function atualizarSistema() {

    atualizarLista(

        "recepcao",

        "listaRecepcao",

        "contadorRecepcao"

    );


    atualizarLista(

        "triagem",

        "listaTriagem",

        "contadorTriagem"

    );


    atualizarLista(

        "medico",

        "listaMedico",

        "contadorMedico"

    );


    atualizarPainel();
}


// ======================================================
// MOSTRAR DATA
// ======================================================

function mostrarData() {

    document
        .getElementById(
            "dataAtual"
        )
        .textContent =

        new Date()
            .toLocaleDateString(

                "pt-BR",

                {

                    weekday:
                        "long",

                    day:
                        "2-digit",

                    month:
                        "long",

                    year:
                        "numeric"

                }

            );
}


// ======================================================
// ENTER - PACIENTE
// ======================================================

document
    .getElementById(
        "nomePaciente"
    )
    .addEventListener(

        "keydown",

        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                adicionarPaciente();

            }

        }

    );


// ======================================================
// ENTER - LOGIN
// ======================================================

document
    .getElementById(
        "senha"
    )
    .addEventListener(

        "keydown",

        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                entrarSistema();

            }

        }

    );


// ======================================================
// INICIAR
// ======================================================

mostrarData();


atualizarSistema();


mostrarHistorico();


// ======================================================
// RESTAURAR LOGIN
// ======================================================

if (

    sessionStorage.getItem(
        "mespLogado"
    )

    ===

    "sim"

) {

    document
        .getElementById(
            "telaLogin"
        )
        .classList
        .add(
            "escondido"
        );


    document
        .getElementById(
            "sistema"
        )
        .classList
        .remove(
            "escondido"
        );
}