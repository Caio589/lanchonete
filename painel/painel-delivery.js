import { supabase } from "../js/supabase.js";

async function carregarItensComanda(comandaId) {
  const { data, error } = await supabase
    .from("itens_comanda")
    .select("*")
    .eq("comanda_id", comandaId)
    .order("created_at");

  if (error) {
    console.error(error);
    return;
  }

  console.log("ITENS DA COMANDA:", data);
}

const lista = document.getElementById("lista-pedidos");
const botaoSom = document.getElementById("ativar-som");

let pedidosImpressos = new Set();

/* ===== SOM (WEB AUDIO API) ===== */
let audioContext = null;
let somLiberado = false;

/* LIBERAR SOM (1 CLIQUE) */
botaoSom.onclick = () => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  somLiberado = true;
  botaoSom.innerText = "🔔 Som ativado";
  botaoSom.disabled = true;

  // Beep de confirmação
  tocarSom();
};

/* TOCAR SOM */
function tocarSom() {
  if (!somLiberado || !audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.25);
}

/* BUSCA PEDIDOS NOVOS */
async function carregarPedidos() {
  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .eq("status", "novo")
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido novo</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(pedido => {
    if (!pedidosImpressos.has(pedido.id)) {
      pedidosImpressos.add(pedido.id);
      tocarSom();
      imprimirPedido(pedido);
    }

    const div = document.createElement("div");
    div.className = "pedido";
    div.innerHTML = `
      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente}<br>
      Total: R$ ${pedido.total.toFixed(2)}
    `;
    lista.appendChild(div);
  });
}

/* IMPRIMIR AUTOMÁTICO */
async function imprimirPedido(pedido) {
  let texto = `
Pedido #${pedido.id}
Cliente: ${pedido.cliente}
Telefone: ${pedido.telefone}

`;

  pedido.itens.forEach(item => {
    texto += `${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
  });

  texto += `
-------------------------
Total: R$ ${pedido.total.toFixed(2)}
`;

  const cupom = document.getElementById("cupom");
  const conteudo = document.getElementById("cupom-conteudo");

  conteudo.innerHTML = texto.replace(/\n/g, "<br>");
  cupom.style.display = "block";

  window.print();

  cupom.style.display = "none";

  /* MARCA COMO IMPRESSO */
  await supabase
    .from("pedidos")
    .update({ status: "impresso" })
    .eq("id", pedido.id);
}

/* ATUALIZA A CADA 3s */
carregarPedidos();
setInterval(carregarPedidos, 3000);
