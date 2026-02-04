import { supabase } from "./supabase.js";
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
    : produtos.filter(p => {
        if (!p.categoria) return false;

        const catProduto = p.categoria.toLowerCase().trim();
        const catAtual = categoriaAtual.toLowerCase().trim();

        // aceita "pizza", "pizzas", "pizza tradicional" etc
        if (catAtual === "pizza") {
          return catProduto.includes("pizza");
        }

        return catProduto === catAtual;
      });

  if (filtrados.length === 0) {
    listaProdutos.innerHTML = "<p>Nenhum produto encontrado</p>";
    return;
  }

 if (p.categoria.toLowerCase() === "pizza") {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h3>${p.nome}</h3>
    <p>${p.descricao || ""}</p>

    <button class="btn btn-add">🍕 P</button>
    <button class="btn btn-add">🍕 M</button>
    <button class="btn btn-add">🍕 G</button>

    <button class="btn btn-add">🍕 2 Sabores</button>
  `;

  const btns = div.querySelectorAll("button");

  btns[0].onclick = () => addCarrinho(`${p.nome} (P)`, p.preco_p);
  btns[1].onclick = () => addCarrinho(`${p.nome} (M)`, p.preco_m);
  btns[2].onclick = () => addCarrinho(`${p.nome} (G)`, p.preco_g);

  btns[3].onclick = () => abrirPizzaDoisSabores("m");

  listaProdutos.appendChild(div);
  return;
}
   
/* ===== PIZZA ===== */
function renderizarPizza(p) {
  const precoP = Number(p.preco_p);
  const precoM = Number(p.preco_m);
  const precoG = Number(p.preco_g);

  if (isNaN(precoP) || isNaN(precoM) || isNaN(precoG)) return;

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h3>${p.nome}</h3>
    <p>${p.descricao || ""}</p>

    <button class="btn btn-add">🍕 P — R$ ${precoP.toFixed(2)}</button>
    <button class="btn btn-add">🍕 M — R$ ${precoM.toFixed(2)}</button>
    <button class="btn btn-add">🍕 G — R$ ${precoG.toFixed(2)}</button>
  `;

  const botoes = div.querySelectorAll("button");
  botoes[0].onclick = () => addCarrinho(`${p.nome} (P)`, precoP);
  botoes[1].onclick = () => addCarrinho(`${p.nome} (M)`, precoM);
  botoes[2].onclick = () => addCarrinho(`${p.nome} (G)`, precoG);

  listaProdutos.appendChild(div);
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

  carrinho.forEach((item, i) => {
    resumoEl.innerHTML += `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(
      2
    )}<br>`;
    subtotal += item.preco;
  });

  frete = entregaSelect.value === "fora" ? 7 : 0;

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
   ENVIAR PEDIDO
======================= */
window.enviarPedido = async function () {
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
  carrinho.forEach(i => (subtotal += i.preco));
  const totalPedido = subtotal + frete;

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
  });

  mensagem += `%0A`;
  mensagem +=
    frete > 0
      ? `🚗 *Frete:* R$ ${frete.toFixed(2)}`
      : `🚚 *Frete:* Grátis`;

  mensagem += `%0A💰 *Total:* R$ ${totalPedido.toFixed(2)}`;
  mensagem += `%0A🔥 *DanBurgers agradece!*`;

  const whatsapp = "5577981184890";
  window.open(`https://wa.me/${whatsapp}?text=${mensagem}`, "_blank");

  await supabase.from("pedidos").insert([
    {
      cliente: nome,
      telefone: telefone,
      entrega: entregaSelect.value,
      endereco: endereco,
      pagamento: pagamento,
      troco: pagamento === "dinheiro" ? Number(troco) : null,
      itens: carrinho,
      total: totalPedido,
      status: "novo"
    }
  ]);

  carrinho = [];

   function abrirPizzaDoisSabores(tamanho) {
  const sabores = produtos.filter(
    p => p.categoria && p.categoria.toLowerCase() === "pizza"
  );

  if (sabores.length < 2) {
    alert("Cadastre pelo menos 2 sabores de pizza");
    return;
  }

  let lista = "Escolha o PRIMEIRO sabor:\n\n";
  sabores.forEach((s, i) => {
    lista += `${i + 1} - ${s.nome}\n`;
  });

  const s1 = prompt(lista);
  if (!s1 || !sabores[s1 - 1]) return;

  let lista2 = "Escolha o SEGUNDO sabor:\n\n";
  sabores.forEach((s, i) => {
    if (i !== s1 - 1) lista2 += `${i + 1} - ${s.nome}\n`;
  });

  const s2 = prompt(lista2);
  if (!s2 || !sabores[s2 - 1]) return;

  const sabor1 = sabores[s1 - 1];
  const sabor2 = sabores[s2 - 1];

  const preco1 = sabor1[`preco_${tamanho}`];
  const preco2 = sabor2[`preco_${tamanho}`];

  const precoFinal = Math.max(preco1, preco2);

  addCarrinho(
    `Pizza 2 sabores (${tamanho.toUpperCase()}): ${sabor1.nome} + ${sabor2.nome}`,
    precoFinal
  );
}
  renderizarCarrinho();
};
