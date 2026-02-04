/* ======================
   PAINEL – DANBURGERS
====================== */

const listaPedidosEl = document.getElementById("lista-pedidos");
const cupom = document.getElementById("cupom");
const cupomConteudo = document.getElementById("cupom-conteudo");

let pedidoAtual = null;

/* ======================
   CARREGAR PEDIDOS
====================== */
async function carregarPedidos() {
  try {
    const res = await fetch("/api/pedidos");
    if (!res.ok) throw new Error("Erro ao buscar pedidos");

    const pedidos = await res.json();

    listaPedidosEl.innerHTML = "";

    pedidos.forEach(p => {
      const div = document.createElement("div");
      div.className = "pedido";
      div.innerHTML = `
        <strong>${p.cliente}</strong><br>
        Total: R$ ${Number(p.total).toFixed(2)}<br>
        <small>Status: ${p.status}</small>
      `;

      div.onclick = () => selecionarPedido(p);
      listaPedidosEl.appendChild(div);
    });
  } catch (e) {
    console.error("Erro ao carregar pedidos:", e);
  }
}

/* ======================
   SELECIONAR PEDIDO
====================== */
function selecionarPedido(pedido) {
  pedidoAtual = pedido;
  renderizarCupom(pedido);
}

/* ======================
   CUPOM
====================== */
function renderizarCupom(p) {
  let texto = `
PEDIDO – DanBurgers
-------------------

Cliente: ${p.cliente}
Telefone: ${p.telefone}
Entrega: ${p.entrega}
`;

  if (p.endereco) texto += `Endereço: ${p.endereco}\n`;

  texto += `
Pagamento: ${p.pagamento}
`;

  if (p.troco !== null && p.troco !== undefined) {
    texto += `Troco para: R$ ${Number(p.troco).toFixed(2)}\n`;
  }

  texto += `
Itens:
`;

  if (Array.isArray(p.itens)) {
    p.itens.forEach((i, idx) => {
      texto += `${idx + 1}. ${i.nome} - R$ ${Number(i.preco).toFixed(2)}\n`;
    });
  }

  texto += `
Total: R$ ${Number(p.total).toFixed(2)}

DanBurgers agradece!
`;

  cupomConteudo.innerHTML = texto.replace(/\n/g, "<br>");
  cupom.style.display = "block";
}

/* ======================
   IMPRIMIR
====================== */
window.imprimirPedido = function () {
  if (!pedidoAtual) {
    alert("Selecione um pedido");
    return;
  }

  // Delay obrigatório para impressora térmica
  setTimeout(() => {
    window.print();
  }, 300);
};

/* ======================
   RELATÓRIO DIÁRIO
====================== */
window.relatorioDiario = async function () {
  try {
    const res = await fetch("/api/relatorio/diario");
    if (!res.ok) throw new Error("Erro no relatório diário");

    const dados = await res.json();

    alert(
      `Relatório Diário\nPedidos: ${dados.quantidade}\nTotal: R$ ${Number(
        dados.total
      ).toFixed(2)}`
    );
  } catch (e) {
    console.error(e);
    alert("Erro ao gerar relatório diário");
  }
};

/* ======================
   RELATÓRIO MENSAL
====================== */
window.relatorioMensal = async function () {
  try {
    const res = await fetch("/api/relatorio/mensal");
    if (!res.ok) throw new Error("Erro no relatório mensal");

    const dados = await res.json();

    alert(
      `Relatório Mensal\nPedidos: ${dados.quantidade}\nTotal: R$ ${Number(
        dados.total
      ).toFixed(2)}`
    );
  } catch (e) {
    console.error(e);
    alert("Erro ao gerar relatório mensal");
  }
};

/* ======================
   START
====================== */
carregarPedidos();
setInterval(carregarPedidos, 5000);
