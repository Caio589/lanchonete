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
  if (window.modalFinalizacaoAberto) return;

  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .in("status", ["novo", "impresso"])
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

/* ===== IMPRESSÃO DELIVERY (AJUSTE REAL PARA TM-T20) ===== */
async function imprimirPedido(pedido) {
  let itens = [];

  if (pedido.itens && pedido.itens.length > 0) {
    itens = typeof pedido.itens === "string"
      ? JSON.parse(pedido.itens)
      : pedido.itens;
  }

  if (!itens || itens.length === 0) {
    console.warn("Pedido sem itens:", pedido.id);
    return;
  }

  let html = `
    <div style="
      width:80mm;
      font-family: monospace;
      font-size:28px;        /* 🔥 AQUI resolve o problema */
      font-weight:900;       /* 🔥 mais escuro */
      line-height:1.7;
      color:#000;
    ">
      <div style="text-align:center; font-size:32px; font-weight:900;">
        DanBurgers
      </div>

      <div style="text-align:center; font-size:22px;">
        ${new Date(pedido.created_at).toLocaleString("pt-BR")}
      </div>

      <hr>

      <strong>📦 DELIVERY</strong><br>
      Pedido #${pedido.id}<br>
      Cliente: ${pedido.cliente || "-"}<br>
      Telefone: ${pedido.telefone || "-"}<br>
      Endereço: ${pedido.endereco || "-"}<br>

      <hr>

      <strong>ITENS</strong><br>
  `;

  itens.forEach(item => {
    const qtd = item.quantidade || item.qtd || 1;
    html += `
      ${item.nome} x${qtd}<br>
      R$ ${(Number(item.preco) * qtd).toFixed(2)}<br><br>
    `;
  });

  html += `
      <hr>
      <div style="font-size:32px; font-weight:900;">
        TOTAL: R$ ${Number(pedido.total).toFixed(2)}
      </div>

      <div style="font-size:24px;">
        Pagamento: ${pedido.pagamento || "-"}
      </div>
  `;

  if (pedido.pagamento === "dinheiro" && pedido.troco) {
    html += `
      <div style="font-size:24px;">
        Troco para: R$ ${Number(pedido.troco).toFixed(2)}
      </div>
    `;
  }

  html += `
      <hr>
      <div style="text-align:center; font-size:22px;">
        Obrigado pela preferência ❤️
      </div>
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

setInterval(() => {
  if (!window.modalFinalizacaoAberto) {
    carregarPedidos();
  }
}, 3000);
