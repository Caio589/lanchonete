import { buscarProdutos, buscarCategorias } from "./data.js";

console.log("CARDÁPIO INICIADO");

/* ======================
   ELEMENTOS
====================== */
const listaProdutos = document.getElementById("lista-produtos");
const categoriasEl = document.getElementById("categorias");
const pedidoEl = document.getElementById("meu-pedido");
const totalEl = document.getElementById("total-pedido");

const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const enderecoInput = document.getElementById("endereco");
const entregaSelect = document.getElementById("entrega");
const pagamentoSelect = document.getElementById("pagamento");
const trocoInput = document.getElementById("troco");

/* ======================
   ESTADO
====================== */
let produtos = [];
let categoriaAtual = "Todos";
let carrinho = [];
let frete = 0;

/* ======================
   START
====================== */
async function iniciar() {
  produtos = await buscarProdutos();
  const categorias = await buscarCategorias();

  renderizarCategorias(categorias);
  renderizarProdutos();
  renderizarCarrinho();
}
iniciar();

/* ======================
   LISTENERS (TEMPO REAL)
====================== */
if (entregaSelect) entregaSelect.addEventListener("change", renderizarCarrinho);

if (pagamentoSelect) {
  pagamentoSelect.addEventListener("change", () => {
    if (pagamentoSelect.value === "dinheiro") {
      trocoInput.style.display = "block";
    } else {
      trocoInput.style.display = "none";
      trocoInput.value = "";
    }
    renderizarCarrinho();
  });
}

[trocoInput, nomeInput, telefoneInput, enderecoInput]
  .forEach(el => el && el.addEventListener("input", renderizarCarrinho));

/* ======================
   CATEGORIAS
====================== */
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

/* ======================
   PRODUTOS
====================== */
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

/* ======================
   CARRINHO / RESUMO
====================== */
function addCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  renderizarCarrinho();
}

function renderizarCarrinho() {
  if (!pedidoEl || !totalEl) {
    console.warn("Resumo do pedido não encontrado no HTML");
    return;
  }

  pedidoEl.innerHTML = "";
  let subtotal = 0;

  carrinho.forEach((item, i) => {
    const div = document.createElement("div");
    div.innerText = `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}`;
    pedidoEl.appendChild(div);
    subtotal += item.preco;
  });

  frete = entregaSelect && entregaSelect.value === "fora" ? 7 : 0;

  if (frete > 0) {
    const f = document.createElement("div");
    f.innerText = `🚚 Frete — R$ ${frete.toFixed(2)}`;
    pedidoEl.appendChild(f);
  }

  if (pagamentoSelect?.value === "dinheiro" && trocoInput?.value) {
    const t = document.createElement("div");
    t.innerText = `💵 Troco para — R$ ${Number(trocoInput.value).toFixed(2)}`;
    pedidoEl.appendChild(t);
  }

  const total = subtotal + frete;
  totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;
}

/* ======================
   WHATSAPP
====================== */
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
  const entrega = entregaSelect.value;

  let texto =
`🍔🍕 *PEDIDO – DanBurgers* 🍕🍔
━━━━━━━━━━━━━━━━━━

👤 *Cliente:* ${nome || "-"}
📞 *Telefone:* ${telefone || "-"}
📍 *Entrega:* ${entrega === "fora" ? "Fora da cidade" : "Retirada no local"}

${endereco ? `🏠 *Endereço:* ${endereco}\n` : ""}💳 *Pagamento:* ${pagamento === "dinheiro" ? "Dinheiro" : pagamento}
${pagamento === "dinheiro" && troco ? `💵 *Troco para:* R$ ${Number(troco).toFixed(2)}\n` : ""}
🛒 *Itens do pedido:*
`;

  let subtotal = 0;

  carrinho.forEach((item, i) => {
    texto += `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}\n`;
    subtotal += item.preco;
  });

  const total = subtotal + frete;

  texto += `
🚚 *Frete:* ${frete > 0 ? `R$ ${frete.toFixed(2)}` : "Grátis"}
💰 *Total:* R$ ${total.toFixed(2)}
🔥 *DanBurgers agradece!*`;

  const whatsapp = "5511963266825"; // SEU NÚMERO
  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`, "_blank");
};
