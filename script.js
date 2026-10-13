
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

// =====================================
// CONFIGURAÇÃO FIREBASE
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyCBmvdtsKTa8FtuIZi1DhG5pUrz4F-qoPw",
  authDomain: "mesp-clinica.firebaseapp.com",
  projectId: "mesp-clinica",
  storageBucket: "mesp-clinica.firebasestorage.app",
  messagingSenderId: "625078094146",
  appId: "1:625078094146:web:1b297b0852a12f9134a0db",
  measurementId: "G-BZWTQEJG5L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =====================================
// DADOS
// =====================================

let pacientes = [];
let historico = [];
let ouvintes = [];

const $ = id => document.getElementById(id);

const horaAtual = () =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

const dataAtual = () =>
  new Date().toLocaleDateString("pt-BR");

function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = String(texto ?? "");
  return elemento.innerHTML;
}

function mostrarErro(erro) {
  console.error(erro);

  alert(
    "Não foi possível concluir a operação. " +
    "Verifique a internet e as permissões do Firebase."
  );
}

// =====================================
// LOGIN
// =====================================

async function entrarSistema() {
  $("erroLogin").textContent = "";

  const email = $("email").value.trim();
  const senha = $("senha").value;

  if (!email || !senha) {
    $("erroLogin").textContent =
      "Digite seu e-mail e sua senha.";
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );
  } catch (erro) {
    console.error(erro);

    $("erroLogin").textContent =
      "Não foi possível entrar. Confira o e-mail, " +
      "a senha e a autorização da conta.";
  }
}

async function sairSistema() {
  try {
    await signOut(auth);
  } catch (erro) {
    mostrarErro(erro);
  }
}

// =====================================
// SINCRONIZAÇÃO EM TEMPO REAL
// =====================================

function pararSincronizacao() {
  ouvintes.forEach(parar => parar());
  ouvintes = [];
}

function iniciarSincronizacao() {
  pararSincronizacao();

  const ouvirPacientes = onSnapshot(
    collection(db, "pacientes"),

    resultado => {
      pacientes = resultado.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      pacientes.sort(
        (a, b) =>
          (a.criadoEmMs || 0) -
          (b.criadoEmMs || 0)
      );

      atualizarSistema();
    },

    mostrarErro
  );

  const ouvirHistorico = onSnapshot(
    collection(db, "historico"),

    resultado => {
      historico = resultado.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      historico.sort(
        (a, b) =>
          (b.finalizadoEmMs || 0) -
          (a.finalizadoEmMs || 0)
      );

      mostrarHistorico();
      atualizarPainel();
    },

    mostrarErro
  );

  ouvintes.push(
    ouvirPacientes,
    ouvirHistorico
  );
}

onAuthStateChanged(auth, usuario => {
  const autorizado =
    !!usuario &&
    usuario.emailVerified &&
    usuario.email?.toLowerCase() ===
      "santoslucas0109@gmail.com";

  $("telaLogin").classList.toggle(
    "escondido",
    autorizado
  );

  $("sistema").classList.toggle(
    "escondido",
    !autorizado
  );

  pararSincronizacao();

  if (autorizado) {
    iniciarSincronizacao();
  } else {
    pacientes = [];
    historico = [];
    atualizarSistema();
    mostrarHistorico();

    if (usuario) {
      $("erroLogin").textContent =
        "Esta conta precisa ter o e-mail verificado " +
        "e estar autorizada.";

      signOut(auth).catch(console.error);
    }
  }
});

// =====================================
// ADICIONAR PACIENTE
// =====================================

async function adicionarPaciente() {
  const campo = $("nomePaciente");
  const nome = campo.value.trim();

  if (!nome) {
    alert("Digite o nome do paciente.");
    return;
  }

  try {
    await addDoc(
      collection(db, "pacientes"),
      {
        nome: nome,
        status: "recepcao",
        data: dataAtual(),
        chegada: horaAtual(),
        entradaTriagem: null,
        entradaMedico: null,
        finalizado: null,
        pressaoSistolica: null,
        pressaoDiastolica: null,
        criadoEmMs: Date.now(),
        criadoEm: serverTimestamp()
      }
    );

    campo.value = "";
    campo.focus();

  } catch (erro) {
    mostrarErro(erro);
  }
}

// =====================================
// LOCALIZAR PACIENTE
// =====================================

function buscarPaciente(id) {
  return pacientes.find(
    paciente => paciente.id === id
  );
}

// =====================================
// ALTERAR DADOS
// =====================================

async function alterarPaciente(id, dados) {
  try {
    await updateDoc(
      doc(db, "pacientes", id),
      dados
    );

    return true;
  } catch (erro) {
    mostrarErro(erro);
    return false;
  }
}

// =====================================
// RECEPÇÃO -> TRIAGEM
// =====================================

async function enviarTriagem(id) {
  if (!buscarPaciente(id)) return;

  await alterarPaciente(id, {
    status: "triagem",
    entradaTriagem: horaAtual()
  });
}

// =====================================
// PRESSÃO ARTERIAL
// =====================================

function lerPressao(id) {
  const campoSistolica =
    $("pressaoSistolica-" + id);

  const campoDiastolica =
    $("pressaoDiastolica-" + id);

  if (
    !campoSistolica ||
    !campoDiastolica ||
    !campoSistolica.value ||
    !campoDiastolica.value
  ) {
    alert(
      "Digite a pressão sistólica e a diastólica."
    );

    return null;
  }

  const sistolica = Number(
    campoSistolica.value
  );

  const diastolica = Number(
    campoDiastolica.value
  );

  if (
    !Number.isInteger(sistolica) ||
    !Number.isInteger(diastolica) ||
    sistolica < 40 ||
    sistolica > 300 ||
    diastolica < 20 ||
    diastolica > 200
  ) {
    alert(
      "Confira os valores da pressão arterial."
    );

    return null;
  }

  return {
    pressaoSistolica: sistolica,
    pressaoDiastolica: diastolica
  };
}

async function salvarPressao(id) {
  const pressao = lerPressao(id);

  if (!pressao) return false;

  return await alterarPaciente(
    id,
    pressao
  );
}

// =====================================
// TRIAGEM -> MÉDICO
// =====================================

async function enviarMedico(id) {
  const pressao = lerPressao(id);

  if (!pressao) return;

  await alterarPaciente(id, {
    ...pressao,
    status: "medico",
    entradaMedico: horaAtual()
  });
}

// =====================================
// VOLTAR PARA RECEPÇÃO
// =====================================

async function voltarRecepcao(id) {
  await alterarPaciente(id, {
    status: "recepcao",
    entradaTriagem: null,
    entradaMedico: null,
    pressaoSistolica: null,
    pressaoDiastolica: null
  });
}

// =====================================
// VOLTAR PARA TRIAGEM
// =====================================

async function voltarTriagem(id) {
  await alterarPaciente(id, {
    status: "triagem",
    entradaMedico: null
  });
}

// =====================================
// EXCLUIR PACIENTE
// =====================================

async function excluirPaciente(id) {
  const paciente = buscarPaciente(id);

  if (!paciente) return;

  const confirmar = confirm(
    `Remover ${paciente.nome} da fila?`
  );

  if (!confirmar) return;

  try {
    await deleteDoc(
      doc(db, "pacientes", id)
    );
  } catch (erro) {
    mostrarErro(erro);
  }
}

// =====================================
// FINALIZAR ATENDIMENTO
// =====================================

async function finalizarPaciente(id) {
  const paciente = buscarPaciente(id);

  if (!paciente) return;

  const confirmar = confirm(
    `Finalizar atendimento de ${paciente.nome}?`
  );

  if (!confirmar) return;

  try {
    await addDoc(
      collection(db, "historico"),
      {
        ...paciente,
        pacienteId: id,
        finalizado: horaAtual(),
        finalizadoEmMs: Date.now()
      }
    );

    await deleteDoc(
      doc(db, "pacientes", id)
    );

  } catch (erro) {
    mostrarErro(erro);
  }
}

// =====================================
// CHAMADAS DA TV
// =====================================

async function chamarPaciente(id, destino) {
  const paciente = buscarPaciente(id);

  if (!paciente) return;

  try {
    await addDoc(
      collection(db, "chamadas"),
      {
        pacienteId: id,
        nome: paciente.nome,
        destino: destino,
        horario: horaAtual(),
        data: dataAtual(),
        criadoEmMs: Date.now(),
        criadoEm: serverTimestamp()
      }
    );

  } catch (erro) {
    mostrarErro(erro);
  }
}

function chamarSala(id) {
  const select = $("sala-" + id);

  if (!select) return;

  chamarPaciente(
    id,
    select.value
  );
}

// =====================================
// ABRIR TELAS
// =====================================

function abrirTela(tela) {
  const telas = [
    "recepcao",
    "triagem",
    "medico",
    "historico"
  ];

  telas.forEach(nome => {
    $(nome).classList.add("escondida");
  });

  $(tela).classList.remove("escondida");

  document
    .querySelectorAll(".menu-btn")
    .forEach(botao => {
      botao.classList.remove("ativo");
    });

  const botoes = {
    recepcao: "btnRecepcao",
    triagem: "btnTriagem",
    medico: "btnMedico",
    historico: "btnHistorico"
  };

  $(botoes[tela]).classList.add("ativo");

  if (tela === "historico") {
    mostrarHistorico();
  }
}

// =====================================
// FORMATAR PRESSÃO
// =====================================

function formatarPressao(paciente) {
  if (
    paciente.pressaoSistolica == null ||
    paciente.pressaoDiastolica == null
  ) {
    return "Não registrada";
  }

  return (
    paciente.pressaoSistolica +
    "/" +
    paciente.pressaoDiastolica +
    " mmHg"
  );
}

// =====================================
// CRIAR CARD DO PACIENTE
// =====================================

function criarCard(paciente, numero, setor) {
  const id = JSON.stringify(paciente.id);

  const nome = escaparHTML(
    paciente.nome
  );

  let informacoesExtras = "";
  let botoes = "";

  // RECEPÇÃO
  if (setor === "recepcao") {
    botoes = `
      <button
        class="btn btn-avancar"
        onclick='enviarTriagem(${id})'
      >
        Enviar para triagem →
      </button>

      <button
        class="btn btn-excluir"
        onclick='excluirPaciente(${id})'
      >
        Excluir
      </button>
    `;
  }

  // TRIAGEM
  if (setor === "triagem") {
    informacoesExtras = `
      <div class="campo-pressao">
        <label>🩺 Pressão arterial</label>

        <div class="pressao-inputs">
          <input
            type="number"
            id="pressaoSistolica-${paciente.id}"
            placeholder="120"
            min="40"
            max="300"
            step="1"
            value="${paciente.pressaoSistolica ?? ""}"
          >

          <span class="barra">/</span>

          <input
            type="number"
            id="pressaoDiastolica-${paciente.id}"
            placeholder="80"
            min="20"
            max="200"
            step="1"
            value="${paciente.pressaoDiastolica ?? ""}"
          >

          <span class="unidade">mmHg</span>
        </div>
      </div>
    `;

    botoes = `
      <button
        class="btn btn-voltar"
        onclick='voltarRecepcao(${id})'
      >
        ← Voltar
      </button>

      <button
        class="btn btn-chamar"
        onclick='chamarPaciente(${id}, "TRIAGEM")'
      >
        📢 Chamar
      </button>

      <button
        class="btn btn-avancar"
        onclick='enviarMedico(${id})'
      >
        Enviar para médico →
      </button>
    `;
  }

  // MÉDICO
  if (setor === "medico") {
    informacoesExtras = `
      <div class="pressao-medico">
        <span>🩺 Pressão registrada</span>
        <strong>${formatarPressao(paciente)}</strong>
      </div>
    `;

    const salas = [1, 2, 3, 4, 5]
      .map(numeroSala => `
        <option value="SALA ${numeroSala}">
          Sala ${numeroSala}
        </option>
      `)
      .join("");

    botoes = `
      <button
        class="btn btn-voltar"
        onclick='voltarTriagem(${id})'
      >
        ← Voltar
      </button>

      <select
        id="sala-${paciente.id}"
        class="select-sala"
      >
        ${salas}
      </select>

      <button
        class="btn btn-chamar"
        onclick='chamarSala(${id})'
      >
        📢 Chamar
      </button>

      <button
        class="btn btn-finalizar"
        onclick='finalizarPaciente(${id})'
      >
        ✓ Finalizar
      </button>
    `;
  }

  const chegada = escaparHTML(
    paciente.chegada || "--:--"
  );

  const triagem = paciente.entradaTriagem
    ? `
      <span>
        Triagem:
        <strong>
          ${escaparHTML(paciente.entradaTriagem)}
        </strong>
      </span>
    `
    : "";

  const medico = paciente.entradaMedico
    ? `
      <span>
        Médico:
        <strong>
          ${escaparHTML(paciente.entradaMedico)}
        </strong>
      </span>
    `
    : "";

  return `
    <div class="paciente">
      <div class="paciente-conteudo">

        <div class="paciente-info">
          <div class="numero">${numero}</div>

          <div>
            <div class="nome">${nome}</div>

            <div class="horarios">
              <span>
                Chegada:
                <strong>${chegada}</strong>
              </span>

              ${triagem}
              ${medico}
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

// =====================================
// ATUALIZAR FILAS
// =====================================

function atualizarLista(
  setor,
  listaId,
  contadorId
) {
  const fila = pacientes.filter(
    paciente => paciente.status === setor
  );

  $(contadorId).textContent = fila.length;

  if (fila.length === 0) {
    $(listaId).innerHTML = `
      <div class="vazio">
        <strong>Nenhum paciente aguardando</strong>
        A fila está vazia.
      </div>
    `;

    return;
  }

  $(listaId).innerHTML = fila
    .map((paciente, indice) =>
      criarCard(
        paciente,
        indice + 1,
        setor
      )
    )
    .join("");
}

// =====================================
// HISTÓRICO
// =====================================

function mostrarHistorico() {
  const pesquisa = (
    $("pesquisaHistorico")?.value || ""
  )
    .trim()
    .toLowerCase();

  const resultados = historico.filter(
    paciente =>
      (paciente.nome || "")
        .toLowerCase()
        .includes(pesquisa)
  );

  $("historicoVazio").classList.toggle(
    "escondido",
    resultados.length > 0
  );

  $("tabelaHistorico").innerHTML =
    resultados
      .map(paciente => `
        <tr>
          <td>
            <strong>
              ${escaparHTML(paciente.nome)}
            </strong>
          </td>

          <td>
            ${escaparHTML(paciente.chegada || "-")}
          </td>

          <td>
            ${escaparHTML(paciente.entradaTriagem || "-")}
          </td>

          <td>
            ${formatarPressao(paciente)}
          </td>

          <td>
            ${escaparHTML(paciente.entradaMedico || "-")}
          </td>

          <td>
            ${escaparHTML(paciente.finalizado || "-")}
          </td>

          <td>
            ${escaparHTML(paciente.data || "-")}
          </td>
        </tr>
      `)
      .join("");
}

// =====================================
// DASHBOARD
// =====================================

function atualizarPainel() {
  const contar = setor =>
    pacientes.filter(
      paciente => paciente.status === setor
    ).length;

  const setores = [
    ["recepcao", "Recepcao"],
    ["triagem", "Triagem"],
    ["medico", "Medico"]
  ];

  setores.forEach(([setor, nome]) => {
    $("painel" + nome).textContent =
      contar(setor);

    $("badge" + nome).textContent =
      contar(setor);
  });

  $("painelAtendidos").textContent =
    historico.filter(
      paciente => paciente.data === dataAtual()
    ).length;
}

// =====================================
// ATUALIZAR SISTEMA
// =====================================

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

// =====================================
// DATA
// =====================================

$("dataAtual").textContent =
  new Date().toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

// =====================================
// TECLA ENTER
// =====================================

$("nomePaciente").addEventListener(
  "keydown",
  evento => {
    if (evento.key === "Enter") {
      adicionarPaciente();
    }
  }
);

$("senha").addEventListener(
  "keydown",
  evento => {
    if (evento.key === "Enter") {
      entrarSistema();
    }
  }
);

$("email").addEventListener(
  "keydown",
  evento => {
    if (evento.key === "Enter") {
      entrarSistema();
    }
  }
);

// =====================================
// FUNÇÕES DOS BOTÕES HTML
// =====================================

Object.assign(window, {
  entrarSistema,
  sairSistema,
  adicionarPaciente,
  enviarTriagem,
  salvarPressao,
  enviarMedico,
  voltarRecepcao,
  voltarTriagem,
  excluirPaciente,
  finalizarPaciente,
  chamarPaciente,
  chamarSala,
  abrirTela,
  mostrarHistorico
});

// =====================================
// INICIALIZAÇÃO
// =====================================

atualizarSistema();
mostrarHistorico();
