import { buscarProdutos, buscarCategorias } from "./data.js";

console.log("CARDÁPIO INICIADO");

/* ELEMENTOS */
const listaProdutos = document.getElementById("lista-produtos");
const categoriasEl = document.getElementById("categorias");
const pedidoEl = document.getElementById("meu-pedido");
const totalEl = document.getElementById("total-pedido");

/* ESTADO */
let produtos = [];
let categoriaAtual = "Todos";
let carrinho = [];

/* START */
async function iniciar() {
  produtos = await buscarProdutos();
  const categorias = await buscarCategorias();

  renderizarCategorias(categorias);
  renderizarProdutos();
  renderizarCarrinho();
}

/* CATEGORIAS */
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

/* PRODUTOS */
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

  if (filtrados.length === 0) {
    listaProdutos.innerHTML = "<p>Nenhum produto encontrado</p>";
    return;
  }

  filtrados.forEach(p => {
    if (p.preco == null) return;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>
      <strong>R$ ${Number(p.preco).toFixed(2)}</strong>
      <button class="btn btn-add">➕ Adicionar</button>
    `;

    div.querySelector("button").onclick = () => {
      addCarrinho(p.nome, Number(p.preco));
    };

    listaProdutos.appendChild(div);
  });
}

/* CARRINHO */
function addCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  renderizarCarrinho();
}

function renderizarCarrinho() {
  if (!pedidoEl) return;

  pedidoEl.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, i) => {
    const div = document.createElement("div");
    div.innerText = `${i + 1}. ${item.nome} — R$ ${item.preco.toFixed(2)}`;
    pedidoEl.appendChild(div);
    total += item.preco;
  });

  if (totalEl) {
    totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;
  }
}

/* FINALIZAR PEDIDO (WHATSAPP) */
window.enviarPedido = function () {
  if (carrinho.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  let texto = "*🍔 PEDIDO – DanBurgers 🍔*\n\n";
  let total = 0;

  carrinho.forEach((item, i) => {
    texto += `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}\n`;
    total += item.preco;
  });

  texto += `\n💰 *Total:* R$ ${total.toFixed(2)}`;
  texto += `\n\n📍 Pedido feito pelo cardápio digital`;

  const telefone = "5511963266825"; // seu WhatsApp
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;

  window.open(url, "_blank");
};

iniciar();
