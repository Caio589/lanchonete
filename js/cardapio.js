import { buscarProdutos, buscarCategorias } from "./data.js";

console.log("CARDÁPIO INICIADO");

/* =======================
   CONFIG
======================= */
const WHATSAPP_NUMERO = "5511963266825"; // <-- SEU WHATSAPP AQUI

/* =======================
   ELEMENTOS
======================= */
const listaProdutos = document.getElementById("lista-produtos");
const categoriasEl = document.getElementById("categorias");
const pedidoEl = document.getElementById("meu-pedido");
const totalPedidoEl = document.getElementById("total-pedido");

const entregaSelect = document.getElementById("entrega");
const pagamentoSelect = document.getElementById("pagamento");
const trocoInput = document.getElementById("troco");

const nomeInput = document.getElementById("nomeCliente");
const telefoneInput = document.getElementById("telefoneCliente");
const enderecoInput = document.getElementById("enderecoCliente");

/* =======================
   ESTADO
======================= */
let produtos = [];
let carrinho = [];
let categoriaAtual = "Todos";
let frete = 0;

/* =======================
   START
======================= */
async function iniciar() {
  produtos = await buscarProdutos();
  const categorias = await buscarCategorias();
  renderizarCategorias(categorias);
  renderizarProdutos();
  renderizarCarrinho();
}
iniciar();

/* =======================
   CATEGORIAS
======================= */
function renderizarCategorias(categorias) {
  categoriasEl.innerHTML = "";
  criarBotaoCategoria("Todos");

  categorias.forEach(c => criarBotaoCategoria(c.nome));
}

function criarBotaoCategoria(nome) {
  const btn = document.createElement("button");
  btn.className = "btn btn-add";
  btn.innerText = nome;
  btn.onclick = () => {
    categoriaAtual = nome;
    renderizarProdutos();
  };
  categoriasEl.appendChild(btn);
}

/* =======================
   PRODUTOS
======================= */
function renderizarProdutos() {
  listaProdutos.innerHTML = "";

  const filtrados =
    categoriaAtual === "Todos"
      ? produtos
      : produtos.filter(
          p =>
            p.categoria &&
            p.categoria.toLowerCase() === categoriaAtual.toLowerCase()
        );

  filtrados.forEach(p => {
    if (p.preco == null) return;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>
      <strong>R$ ${Number(p.preco).toFixed(2)}</strong>
      <button class="btn btn-add">+ Adicionar</button>
    `;

    div.querySelector("button").onclick = () =>
      addCarrinho(p.nome, Number(p.preco));

    listaProdutos.appendChild(div);
  });
}

/* =======================
   CARRINHO
======================= */
function addCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  renderizarCarrinho();
}

function renderizarCarrinho() {
  pedidoEl.innerHTML = "";
  let subtotal = 0;

  carrinho.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerText = `${index + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}`;
    pedidoEl.appendChild(div);
    subtotal += item.preco;
  });

  frete = entregaSelect.value === "fora" ? 7 : 0;

  if (frete > 0) {
    const freteDiv = document.createElement("div");
    freteDiv.innerText = `🚚 Frete: R$ ${frete.toFixed(2)}`;
    pedidoEl.appendChild(freteDiv);
  }

  totalPedidoEl.innerText = `R$ ${(subtotal + frete).toFixed(2)}`;
}

/* =======================
   WHATSAPP
======================= */
window.enviarPedido = function () {
  if (carrinho.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  const nome = nomeInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const endereco = enderecoInput.value.trim();
  const pagamento = pagamentoSelect.value;
  const troco = trocoInput.value;

  if (!nome || !telefone || !pagamento) {
    alert("Preencha nome, telefone e pagamento");
    return;
  }

  if (entregaSelect.value !== "retirada" && !endereco) {
    alert("Informe o endereço");
    return;
  }

  if (pagamento === "dinheiro" && !troco) {
    alert("Informe o troco");
    return;
  }

  let mensagem =
    "🍔🍕 *PEDIDO – DanBurgers* 🍕🍔\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    `👤 *Cliente:* ${nome}\n` +
    `📞 *Telefone:* ${telefone}\n` +
    `📍 *Entrega:* ${
      entregaSelect.value === "fora"
        ? "Fora da cidade"
        : entregaSelect.value === "cidade"
        ? "Na cidade"
        : "Retirada no local"
    }\n`;

  if (entregaSelect.value !== "retirada") {
    mensagem += `🏠 *Endereço:* ${endereco}\n`;
  }

  mensagem += `\n💳 *Pagamento:* ${
    pagamento === "dinheiro"
      ? "Dinheiro"
      : pagamento === "pix"
      ? "Pix"
      : "Cartão"
  }\n`;

  if (pagamento === "dinheiro") {
    mensagem += `💵 *Troco para:* R$ ${Number(troco).toFixed(2)}\n`;
  }

  mensagem += `\n🛒 *Itens do pedido:*\n`;

  let subtotal = 0;
  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}\n`;
    subtotal += item.preco;
  });

  mensagem += `\n`;
  mensagem += frete > 0
    ? `🚚 *Frete:* R$ ${frete.toFixed(2)}\n`
    : `🚚 *Frete:* Grátis\n`;

  mensagem += `💰 *Total:* R$ ${(subtotal + frete).toFixed(2)}\n`;
  mensagem += "🔥 *DanBurgers agradece!*";

  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
    mensagem
  )}`;
  window.open(url, "_blank");
};
