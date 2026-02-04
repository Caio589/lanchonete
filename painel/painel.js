/* =======================
   PAINEL – DANBURGERS
======================= */

/* ELEMENTOS */
const listaPedidosEl = document.getElementById("lista-pedidos");
const cupom = document.getElementById("cupom");
const cupomConteudo = document.getElementById("cupom-conteudo");

/* ESTADO */
let pedidoAtual = null;

/* =======================
   BUSCAR PEDIDOS
======================= */
async function carregarPedidos() {
  try {
    const res = await fetch("/api/pedidos"); // mantém sua rota
    const pedidos = await res.json();

    listaPedidosEl.innerHTML = "";

    pedidos.forEach(pedido => {
      const div = document.createElement("div");
      div.className = "pedido-card";
      div.innerHTML = `
        <strong>Pedido #${pedido.id}</strong><br>
        ${pedido.cliente}<br>
        <span>R$ ${Number(pedido.total).toFixed(2)}</span><br>
        <small class="novo">${pedido.status}</small>
      `;

      div.onclick = () => selecionarPedido(pedido, div);
      listaPedidosEl.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao carregar pedidos", err);
  }
}

/* =======================
   SELECIONAR PEDIDO
======================= */
function selecionarPedido(pedido, card) {
  pedidoAtual = pedido;

  document
    .querySelectorAll(".pedido-card")
    .forEach(c => c.classList.remove("ativo"));

  card.classList.add("ativo");

  renderizarCupom(pedido);
}

/* =======================
   CUPOM
======================= */
function renderizarCupom(pedido) {
  let html = `
🍔🍕 PEDIDO – DanBurgers 🍕🍔
━━━━━━━━━━━━━━━━━━

Cliente: ${pedido.cliente}
Telefone: ${pedido.telefone}
Entrega: ${pedido.entrega}
`;

  if (pedido.endereco) {
    html += `Endereço: ${pedido.endereco}\n`;
  }

  html += `
Pagamento: ${pedido.pagamento}
`;

  if (pedido.troco) {
    html += `Troco para: R$ ${Number(pedido.troco).toFixed(2)}\n`;
  }

  html += `
Itens:
`;

  pedido.itens.forEach((item, i) => {
    html += `${i + 1}. ${item.nome} - R$ ${Number(item.preco).toFixed(2)}\n`;
  });

  html += `
Frete: R$ ${Number(pedido.frete || 0).toFixed(2)}
Total: R$ ${Number(pedido.total).toFixed(2)}

DanBurgers agradece!
`;

  cupomConteudo.innerHTML = html.replace(/\n/g, "<br>");
}

/* =======================
   IMPRIMIR (CORRIGIDO)
======================= */
window.imprimirPedido = function () {
  if (!pedidoAtual) {
    alert("Selecione um pedido primeiro");
    return;
  }

  cupom.style.display = "block";

  /* DELAY OBRIGATÓRIO PRA TÉRMICA */
  setTimeout(() => {
    window.print();

    /* opcional: esconder depois */
    setTimeout(() => {
      cupom.style.display = "block";
    }, 500);
  }, 300);
};

/* =======================
   INICIAR
======================= */
carregarPedidos();

/* ATUALIZA A CADA 5s */
setInterval(carregarPedidos, 5000);
