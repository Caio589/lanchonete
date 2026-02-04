import { buscarProdutos, buscarCategorias } from "./data.js";

console.log("CARDÁPIO INICIADO");

/* =======================
   ELEMENTOS
======================= */
const listaProdutos = document.getElementById("lista-produtos");
const categoriasEl = document.getElementById("categorias");

const pedidoEl = document.getElementById("meu-pedido");
const totalPedidoEl = document.getElementById("total-pedido");

const nomeInput = document.getElementById("nomeCliente");
const telefoneInput = document.getElementById("telefoneCliente");

const entregaSelect = document.getElementById("entrega");
const enderecoInput = document.getElementById("enderecoCliente");

const pagamentoSelect = document.getElementById("pagamento");
const trocoInput = document.getElementById("troco");

/* =======================
   ESTADO
======================= */
let produtos = [];
let categorias = [];
let carrinho = [];
let categoriaAtual = "Todos";
let frete = 0;

/* =======================
   START
======================= */
async function iniciar() {
  produtos = await buscarProdutos();
  categorias = await buscarCategorias();

  renderizarCategorias();
  renderizarProdutos();
  renderizarCarrinho();
}

iniciar();

/* =======================
   CATEGORIAS
======================= */
function renderizarCategorias() {
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
      <button class="btn btn-add">+ Adicionar</button>
    `;

    div.querySelector("button").onclick = () => {
      addCarrinho(p.nome, Number(p.preco));
    };

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
  if (!pedidoEl || !totalPedidoEl) return;

  pedidoEl.innerHTML = "";
  let subtotal = 0;

  carrinho.forEach((item, i) => {
    const linha = document.createElement("div");
    linha.innerText = `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}`;
    pedidoEl.appendChild(linha);
    subtotal += item.preco;
  });

  frete = entregaSelect.value === "fora" ? 7 : 0;

  if (frete > 0) {
    const freteDiv = document.createElement("div");
    freteDiv.innerText = `🚚 Frete: R$ ${frete.toFixed(2)}`;
    pedidoEl.appendChild(freteDiv);
  }

  const total = subtotal + frete;
  totalPedidoEl.innerText = `R$ ${total.toFixed(2)}`;
}

/* =======================
   ENTREGA / PAGAMENTO
======================= */
entregaSelect.addEventListener("change", renderizarCarrinho);

pagamentoSelect.addEventListener("change", () => {
  if (pagamentoSelect.value === "dinheiro") {
    trocoInput.style.display = "block";
  } else {
    trocoInput.style.display = "none";
    trocoInput.value = "";
  }
});

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
    "🍔🍕 *PEDIDO – DanBurgers* 🍕🍔%0A" +
    "━━━━━━━━━━━━━━━━━━%0A%0A" +
    `👤 *Cliente:* ${nome}%0A` +
    `📞 *Telefone:* ${telefone}%0A` +
    `📍 *Entrega:* ${
      entregaSelect.value === "fora"
        ? "Fora da cidade"
        : "Retirada no local"
    }%0A`;

  if (entregaSelect.value !== "retirada") {
    mensagem += `🏠 *Endereço:* ${endereco}%0A`;
  }

  mensagem += `%0A💳 *Pagamento:* ${
    pagamento === "dinheiro" ? "Dinheiro" : pagamento
  }%0A`;

  if (pagamento === "dinheiro") {
    mensagem += `💵 *Troco para:* R$ ${Number(troco).toFixed(2)}%0A`;
  }

  mensagem += `%0A🛒 *Itens do pedido:*%0A`;

  let subtotal = 0;
  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}%0A`;
    subtotal += item.preco;
  });

  mensagem += `%0A`;
  mensagem += frete > 0
    ? `🚚 *Frete:* R$ ${frete.toFixed(2)}`
    : `🚚 *Frete:* Grátis`;

  mensagem += `%0A💰 *Total:* R$ ${(subtotal + frete).toFixed(2)}`;
  mensagem += `%0A🔥 *DanBurgers agradece!*`;

  const url = `https://wa.me/55SEUNUMEROAQUI?text=${mensagem}`;
  window.open(url, "_blank");
};
