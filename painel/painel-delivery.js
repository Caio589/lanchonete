import { supabase } from "../js/supabase.js";

const lista = document.getElementById("lista-pedidos");

let pedidosImpressos = new Set();

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

/* IMPRIMIR */
async function imprimirPedido(pedido) {
  let itens = pedido.itens;

  // ✅ CORREÇÃO CRÍTICA
  if (typeof itens === "string") {
    try {
      itens = JSON.parse(itens);
    } catch (e) {
      console.error("Erro ao converter itens:", e);
      itens = [];
    }
  }

  let html = `
    <div style="font-family: monospace; width: 280px">
      <h3>DanBurgers</h3>
      <hr>

      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente}<br>
      Telefone: ${pedido.telefone}<br><br>

      <strong>Itens:</strong><br>
  `;

  itens.forEach(item => {
    html += `${item.nome} - R$ ${Number(item.preco).toFixed(2)}<br>`;
  });

  html += `
      <hr>
      <strong>Total: R$ ${pedido.total.toFixed(2)}</strong>
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

/* ATUALIZA */
carregarPedidos();
setInterval(carregarPedidos, 3000);
