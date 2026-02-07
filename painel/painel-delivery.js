import { supabase } from "../js/supabase.js";

const lista = document.getElementById("lista-pedidos");

let pedidosImpressos = new Set();

/* ===== SOM (WEB AUDIO API) ===== */
let audioContext = null;
let somLiberado = false;

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

/* BUSCA PEDIDOS */
async function carregarPedidos() {
  // ⭐ NÃO atualiza se o modal estiver aberto
  if (window.modalFinalizacaoAberto) return;

  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .in("status", ["novo", "impresso"]) // ⭐ mantém visível até pagar
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido pendente</p>";
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
      Cliente: ${pedido.cliente || "Mesa"}<br>
      Total: R$ ${Number(pedido.total).toFixed(2)}<br><br>

      <button onclick="abrirFinalizacaoVenda({
        tipo: 'delivery',
        id: '${pedido.id}',
        total: ${Number(pedido.total)},
        descricao: 'Delivery ${pedido.cliente || pedido.id}'
      })">
        💰 Finalizar venda
      </button>
    `;

    lista.appendChild(div);
  });
}

/* ===== IMPRESSÃO (MANTIDA) ===== */
async function imprimirPedido(pedido) {
  let itens = [];

  if (pedido.itens && pedido.itens.length > 0) {
    itens = typeof pedido.itens === "string"
      ? JSON.parse(pedido.itens)
      : pedido.itens;
  }

  if ((!itens || itens.length === 0) && pedido.comanda_id) {
    const { data } = await supabase
      .from("itens_comanda")
      .select("nome, preco, quantidade")
      .eq("comanda_id", pedido.comanda_id);

    if (data) itens = data;
  }

  if (!itens || itens.length === 0) {
    console.warn("Pedido sem itens:", pedido.id);
    return;
  }

  let html = `
    <div style="font-family: monospace; width: 280px">
      <h3>DanBurgers</h3>
      <hr>

      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente || "Mesa"}<br>
      Telefone: ${pedido.telefone || "-"}<br><br>

      <strong>Itens:</strong><br>
  `;

  itens.forEach(item => {
    html += `${item.nome} x${item.quantidade || 1} - R$ ${Number(item.preco).toFixed(2)}<br>`;
  });

  html += `
      <hr>
      <strong>Total: R$ ${Number(pedido.total).toFixed(2)}</strong>
    </div>
  `;

  const area = document.getElementById("area-impressao");
  area.innerHTML = html;

  window.print();

  await supabase
    .from("pedidos")
    .update({ status: "impresso" })
    .eq("id", pedido.id);
}

/* INICIAR */
carregarPedidos();

// ⭐ INTERVALO SEGURO
setInterval(() => {
  if (!window.modalFinalizacaoAberto) {
    carregarPedidos();
  }
}, 3000);
