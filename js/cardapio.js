import { buscarProdutos, buscarCategorias } from "./data.js";

/* =======================
   ELEMENTOS DO HTML
======================= */
const listaProdutos = document.getElementById("lista-produtos");
const categoriasEl = document.getElementById("categorias");

const resumoEl = document.getElementById("resumo");
const totalEl = document.getElementById("total");

const nomeInput = document.getElementById("nomeCliente");
const telefoneInput = document.getElementById("telefoneCliente");
const enderecoInput = document.getElementById("enderecoCliente");

const entregaSelect = document.getElementById("entrega");
const pagamentoSelect = document.getElementById("pagamento");
const trocoInput = document.getElementById("troco");

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
  resumoEl.innerHTML = "";
  let subtotal = 0;

  carrinho.forEach((item, index) => {
    resumoEl.innerHTML += `
      ${index + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}<br>
    `;
    subtotal += item.preco;
  });

  // FRETE
  if (entregaSelect.value === "fora") {
    frete = 7;
  } else {
    frete = 0;
  }

  resumoEl.innerHTML += "<br>";
  resumoEl.innerHTML +=
    frete > 0
      ? `🚗 Frete: R$ ${frete.toFixed(2)}`
      : `🚚 Frete: Grátis`;

  totalEl.innerText = `Total: R$ ${(subtotal + frete).toFixed(2)}`;
}

/* =======================
   EVENTOS
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

  let subtotal = 0;
  let mensagem =
    "🍔🍕 *PEDIDO – DanBurgers* 🍕🍔%0A" +
    "━━━━━━━━━━━━━━━━━━%0A%0A" +
    `👤 *Cliente:* ${nome}%0A` +
    `📞 *Telefone:* ${telefone}%0A` +
    `📍 *Entrega:* ${
      entregaSelect.value === "fora"
        ? "Fora da cidade"
        : entregaSelect.value === "cidade"
        ? "Na cidade"
        : "Retirada no local"
    }%0A`;

  if (entregaSelect.value !== "retirada") {
    mensagem += `🏠 *Endereço:* ${endereco}%0A`;
  }

  mensagem += `%0A💳 *Pagamento:* ${
    pagamento === "pix"
      ? "Pix"
      : pagamento === "cartao"
      ? "Cartão"
      : "Dinheiro"
  }%0A`;

  if (pagamento === "dinheiro") {
    mensagem += `💵 *Troco para:* R$ ${Number(troco).toFixed(2)}%0A`;
  }

  mensagem += `%0A🛒 *Itens do pedido:*%0A`;

  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}%0A`;
    subtotal += item.preco;
  });

  mensagem += `%0A`;
  mensagem +=
    frete > 0
      ? `🚗 *Frete:* R$ ${frete.toFixed(2)}`
      : `🚚 *Frete:* Grátis`;

  mensagem += `%0A💰 *Total:* R$ ${(subtotal + frete).toFixed(2)}`;
  mensagem += `%0A🔥 *DanBurgers agradece!*`;

  const whatsapp = "5511963266825"; // SEU NÚMERO
   
   imprimirPedido(mensagem);

  window.open(`https://wa.me/${whatsapp}?text=${mensagem}`, "_blank");
};

function imprimirPedido(mensagem) {
  const cupom = document.getElementById("cupom");
  const conteudo = document.getElementById("cupom-conteudo");

  if (!cupom || !conteudo) {
    console.warn("Cupom não encontrado no HTML");
    return;
  }

  // Converte o texto do WhatsApp em HTML para impressão
  conteudo.innerHTML = mensagem
    .replace(/\n/g, "<br>")
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>");

  cupom.style.display = "block";

  setTimeout(() => {
    window.print();
    cupom.style.display = "none";
  }, 300);
}
