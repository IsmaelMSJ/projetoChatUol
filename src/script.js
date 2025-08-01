let ultimoDestinatario = "Todos";  
let ultimaVisibilidade = "message"; 
let usuariosAtivos = [];

const user = { name: '' };

async function EntrarNoChat() {
  while (true) {
    let nomeUsuario = prompt("Digite seu nome para entrar no chat:");
    if (!nomeUsuario || nomeUsuario.trim() === "") {
      alert("O nome não pode ficar vazio!");
      continue;
    }

    nomeUsuario = nomeUsuario.trim();

    try {
      console.log("Tentando entrar com nome:", nomeUsuario);
      await axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/9f2e965b-0213-4077-aca2-df0a8f1220f7", { name: nomeUsuario });
      user.name = nomeUsuario;
      break; 
    } catch (error) {
      alert("Nome já está em uso, tente outro.");
    }
  }

  BuscarMensagens();
  BuscarUsuarios();

  setInterval(() => {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status/9f2e965b-0213-4077-aca2-df0a8f1220f7", { name: user.name })
      .catch(() => {
        alert("Você foi desconectado. Recarregue a página para entrar novamente.");
        window.location.reload();
      });
  }, 5000);
}



function SendMessage() {
  const input = document.querySelector(".chat");
  const texto = input.value.trim();
  if (texto === "") return;

  const mensagem = {
    from: user.name,
    to: ultimoDestinatario,
    text: texto,
    type: ultimaVisibilidade
  };

  axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/9f2e965b-0213-4077-aca2-df0a8f1220f7", mensagem)
    .then(() => {
      input.value = "";
      BuscarMensagens();
    });
}

function submitMessage() {
  SendMessage();
}

function BuscarMensagens() {
  axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/9f2e965b-0213-4077-aca2-df0a8f1220f7")
    .then(res => {
      RenderizarMensagens(res.data);
    });
}

function RenderizarMensagens(mensagens) {
  const container = document.querySelector(".container");
  container.innerHTML = "";

  mensagens.forEach(msg => {
    let template = "";

    if (msg.type === "status") {

      template = `
        <div class="grey-message">
          <h2 class="date">(${msg.time})</h2>
          <div class="text-message-chat">
            <p><strong>${msg.from}</strong> ${msg.text}</p>
          </div>
        </div>
      `;
    } 
    else if (msg.type === "message") {
  
      template = `
        <div class="white-message">
          <h2 class="date">(${msg.time})</h2>
          <div class="text-message-chat">
            <p><strong>${msg.from}</strong> para <strong>${msg.to}</strong>: ${msg.text}</p>
          </div>
        </div>
      `;
    } 
    else if (msg.type === "private_message") {
  
      if (msg.to === user.name || msg.from === user.name) {
        template = `
          <div class="red-message">
            <h2 class="date">(${msg.time})</h2>
            <div class="text-message-chat">
              <p><strong>${msg.from}</strong> reservadamente para <strong>${msg.to}</strong>: ${msg.text}</p>
            </div>
          </div>
        `;
      } else {
        return;
      }
    }

    container.innerHTML += template;
  });

  container.scrollTop = container.scrollHeight;
}



function BuscarUsuarios() {
  axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/9f2e965b-0213-4077-aca2-df0a8f1220f7")
    .then(res => {
      usuariosAtivos = res.data;
      console.log("Usuários recebidos:", usuariosAtivos); // <== VER AQUI
      RenderizarUsuarios(usuariosAtivos);
    });
}

function RenderizarUsuarios(lista) {
  const container = document.querySelector(".contacts-list");
  if (!container) return; 

  container.innerHTML = "";

  container.innerHTML += `
    <div class="receiver" onclick="SelectReceiver(this)">
      <ion-icon name="people"></ion-icon>
      <p>Todos</p>
      <div class="mark not-hidden"><img src="src/img/Vector.png" alt=""></div>
    </div>
  `;

  lista.forEach(usuario => {
    if (usuario.name === user.name) return;

    container.innerHTML += `
      <div class="receiver" onclick="SelectReceiver(this)">
        <ion-icon name="person-circle"></ion-icon>
        <p>${usuario.name}</p>
        <div class="mark hidden"><img src="src/img/Vector.png" alt=""></div>
      </div>
    `;
  });
}

function SelectReceiver(elemento) {
  const selecionado = document.querySelector(".receiver .mark.not-hidden");
  if (selecionado) {
    selecionado.classList.remove("not-hidden");
    selecionado.classList.add("hidden");
  }

  const marcador = elemento.querySelector(".mark");
  marcador.classList.remove("hidden");
  marcador.classList.add("not-hidden");

  const nome = elemento.querySelector("p").innerText;
  ultimoDestinatario = nome;

  AtualizarStatusChat();
}

function SelectVisibility(elemento) {
  const selecionado = document.querySelector(".visibility .mark.not-hidden");
  if (selecionado) {
    selecionado.classList.remove("not-hidden");
    selecionado.classList.add("hidden");
  }

  const marcador = elemento.querySelector(".mark");
  marcador.classList.remove("hidden");
  marcador.classList.add("not-hidden");

  const nome = elemento.querySelector("p").innerText.toLowerCase();

  if (nome === "reservadamente") {
    ultimaVisibilidade = "private_message";
  } else {
    ultimaVisibilidade = "message";
  }

  AtualizarStatusChat();
}

function AtualizarStatusChat() {
  const statusChat = document.querySelector(".status-chat");
  const textoVisibilidade = ultimaVisibilidade === "private_message" ? "privadamente" : "publicamente";
  const destinatario = ultimoDestinatario || "Todos";

  statusChat.innerText = `Enviando para ${destinatario} (${textoVisibilidade})`;
}


function AbrirMenu() {
  const shadow = document.querySelector('.shadow');
  shadow.classList.remove('hidden');
  setTimeout(() => shadow.classList.add('menu-visivel'), 10);
}

function FecharMenu() {
  const shadow = document.querySelector('.shadow');
  shadow.classList.remove('menu-visivel');
  shadow.addEventListener('transitionend', () => {
    shadow.classList.add('hidden');
  }, { once: true });
}

function FecharSeClickFora(event) {
  const shadow = document.querySelector('.shadow');
  if (event.target === shadow) {
    FecharMenu();
  }
}


EntrarNoChat();


setInterval(BuscarUsuarios, 10000);
setInterval(BuscarMensagens, 3000);
