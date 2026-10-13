
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
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

const $ = id => document.getElementById(id);

// =====================================
// VARIÁVEIS
// =====================================

let ultimaChamadaExibida = null;
let somAtivado = false;
let vozesDisponiveis = [];
let pararOuvir = null;
let primeiraLeitura = true;

// =====================================
// STATUS DO PAINEL
// =====================================

function informarStatus(texto) {
  const espera = $("aguardando");

  if (espera) {
    const titulo = espera.querySelector("h2");

    if (titulo) {
      titulo.textContent = texto;
    }
  }
}

// =====================================
// CARREGAR VOZES
// =====================================

function carregarVozes() {
  if (!("speechSynthesis" in window)) return;

  vozesDisponiveis =
    window.speechSynthesis.getVoices();

  const seletor = $("selecionarVoz");

  if (!seletor) return;

  const anterior = seletor.value;

  const portugues = vozesDisponiveis.filter(
    voz => voz.lang.toLowerCase().startsWith("pt")
  );

  const lista = portugues.length
    ? portugues
    : vozesDisponiveis;

  seletor.replaceChildren();

  if (!lista.length) {
    seletor.add(
      new Option("Nenhuma voz encontrada", "")
    );
    return;
  }

  lista.forEach(voz => {
    seletor.add(
      new Option(
        `${voz.name} - ${voz.lang}`,
        voz.name
      )
    );
  });

  if (lista.some(voz => voz.name === anterior)) {
    seletor.value = anterior;
  }
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged =
    carregarVozes;

  carregarVozes();

  setTimeout(carregarVozes, 500);
  setTimeout(carregarVozes, 1500);
}

// =====================================
// CONFIGURAR FALA
// =====================================

function criarMensagem(texto) {
  const mensagem =
    new SpeechSynthesisUtterance(texto);

  mensagem.lang = "pt-BR";
  mensagem.rate = 0.85;
  mensagem.pitch = 1;
  mensagem.volume = 1;

  const selecionada = $("selecionarVoz")?.value;

  const voz = vozesDisponiveis.find(
    v => v.name === selecionada
  );

  if (voz) {
    mensagem.voice = voz;
    mensagem.lang = voz.lang;
  }

  return mensagem;
}

// =====================================
// TESTAR VOZ
// =====================================

function testarVoz() {
  if (!("speechSynthesis" in window)) {
    alert("Este navegador não suporta voz.");
    return;
  }

  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(
    criarMensagem(
      "Olá. Esta é a voz selecionada para o sistema de chamadas da MESP."
    )
  );
}

// =====================================
// ATIVAR SOM
// =====================================

function ativarSom() {
  if (!("speechSynthesis" in window)) {
    alert("Este navegador não suporta voz.");
    return;
  }

  somAtivado = true;

  const botao = $("btnSom");

  if (botao) {
    botao.textContent = "🔊 SOM ATIVADO";
    botao.classList.add("ativo");
  }

  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(
    criarMensagem("Som ativado.")
  );
}

// =====================================
// FALAR CHAMADA
// =====================================

function falarChamada(chamada) {
  if (
    !somAtivado ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(
    criarMensagem(
      `${chamada.nome}. ${chamada.destino}.`
    )
  );
}

// =====================================
// RELÓGIO
// =====================================

function atualizarRelogio() {
  const agora = new Date();

  if ($("relogio")) {
    $("relogio").textContent =
      agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });
  }

  if ($("data")) {
    $("data").textContent =
      agora.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long"
      });
  }
}

// =====================================
// MOSTRAR CHAMADA PRINCIPAL
// =====================================

function mostrarChamada(chamada, anunciar = false) {
  const aguardando = $("aguardando");
  const area = $("chamada");

  if (!aguardando || !area) return;

  aguardando.classList.toggle(
    "escondido",
    !!chamada
  );

  area.classList.toggle(
    "escondido",
    !chamada
  );

  if (!chamada) return;

  $("nomeChamada").textContent =
    chamada.nome || "";

  $("destinoChamada").textContent =
    chamada.destino || "";

  $("horarioChamada").textContent =
    chamada.horario
      ? `Chamada às ${chamada.horario}`
      : "";

  // Nova chamada: animação e voz

  if (ultimaChamadaExibida !== chamada.id) {
    ultimaChamadaExibida = chamada.id;

    area.classList.remove("animar");

    void area.offsetWidth;

    area.classList.add("animar");

    if (anunciar) {
      falarChamada(chamada);
    }
  }
}

// =====================================
// ÚLTIMAS CINCO CHAMADAS
// =====================================

function mostrarUltimasChamadas(chamadas) {
  const lista = $("listaChamadas");

  if (!lista) return;

  lista.replaceChildren();

  if (!chamadas.length) {
    const vazio = document.createElement("div");

    vazio.className = "sem-chamadas";
    vazio.textContent =
      "Nenhuma chamada realizada.";

    lista.appendChild(vazio);
    return;
  }

  chamadas.slice(0, 5).forEach(chamada => {
    const item = document.createElement("div");
    item.className = "item-chamada";

    const titulo = document.createElement("strong");

    titulo.append(
      document.createTextNode(chamada.nome || "")
    );

    const destino = document.createElement("span");

    destino.className = "destino-lista";
    destino.textContent =
      ` - ${chamada.destino || ""}`;

    titulo.appendChild(destino);

    const info = document.createElement("div");
    info.className = "item-chamada-info";

    const data = document.createElement("span");
    data.textContent = chamada.data || "";

    const hora = document.createElement("span");
    hora.textContent = chamada.horario || "";

    info.append(data, hora);

    item.append(titulo, info);
    lista.appendChild(item);
  });
}

// =====================================
// FIREBASE - CHAMADAS EM TEMPO REAL
// =====================================

onAuthStateChanged(auth, usuario => {

  // Encerrar conexão anterior, se existir

  if (pararOuvir) {
    pararOuvir();
    pararOuvir = null;
  }

  // Verificar autorização

  const autorizado =
    !!usuario &&
    usuario.emailVerified &&
    usuario.email?.toLowerCase() ===
      "santoslucas0109@gmail.com";

  if (!autorizado) {
    ultimaChamadaExibida = null;

    mostrarChamada(null);
    mostrarUltimasChamadas([]);

    informarStatus(
      "Acesso restrito. Entre primeiro no sistema MESP neste navegador."
    );

    return;
  }

  informarStatus("Aguardando próxima chamada");

  primeiraLeitura = true;

  // Buscar as cinco chamadas mais recentes

  const consulta = query(
    collection(db, "chamadas"),
    orderBy("criadoEmMs", "desc"),
    limit(5)
  );

  // Receber novas chamadas automaticamente

  pararOuvir = onSnapshot(
    consulta,

    resultado => {
      const chamadas = resultado.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );

      const atual = chamadas[0] || null;

      mostrarUltimasChamadas(chamadas);

      // Não anunciar chamada antiga ao abrir a TV
      mostrarChamada(
        atual,
        !primeiraLeitura
      );

      primeiraLeitura = false;
    },

    erro => {
      console.error(
        "Erro ao ouvir chamadas:",
        erro
      );

      mostrarChamada(null);

      informarStatus(
        "Não foi possível carregar as chamadas. Verifique as permissões do Firebase."
      );
    }
  );
});

// =====================================
// INICIAR RELÓGIO
// =====================================

atualizarRelogio();

setInterval(
  atualizarRelogio,
  1000
);

// =====================================
// DISPONIBILIZAR BOTÕES DO HTML
// =====================================

Object.assign(window, {
  testarVoz,
  ativarSom
});