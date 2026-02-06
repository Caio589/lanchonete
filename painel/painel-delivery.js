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
  let html = `
    <div style="font-family: monospace; width: 280px">
      <h3>DanBurgers</h3>
      <hr>

      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente}<br>
      Telefone: ${pedido.telefone}<br><br>

      <strong>Itens:</strong><br>
  `;

  pedido.itens.forEach(item => {
    html += `${item.nome} - R$ ${item.preco.toFixed(2)}<br>`;
  });

  html += `
      <hr>
      <strong>Total: R$ ${pedido.total.toFixed(2)}</strong>
    </div>
  `;

  const area = document.getElementById("area-impressao");
  area.innerHTML = html;

  window.print();

  // marca como impresso
  await supabase
    .from("pedidos")
    .update({ status: "impresso" })
    .eq("id", pedido.id);
}

/* ATUALIZA A CADA 3s */
carregarPedidos();
setInterval(carregarPedidos, 3000);
