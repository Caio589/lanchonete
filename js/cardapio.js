const comandaAtual = localStorage.getItem("comandaAtual");

if (!comandaAtual) {
  alert("Comanda não encontrada");
}

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
          if (catAtual === "pizza") return catProduto.includes("pizza");
          return catProduto === catAtual;
        });

  if (filtrados.length === 0) {
    listaProdutos.innerHTML = "<p>Nenhum produto encontrado</p>";
    return;
  }

  filtrados.forEach(p => {
    if (p.categoria && p.categoria.toLowerCase().includes("pizza")) {
      renderizarPizza(p);
    } else {
      renderizarProduto(p);
    }
  });
}

/* =======================
   PRODUTO NORMAL
======================= */
function renderizarProduto(p) {
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
}

/* =======================
   PIZZA
======================= */
function renderizarPizza(p) {
  if (p.preco_p == null || p.preco_m == null || p.preco_g == null) return;

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <h3>${p.nome}</h3>
    <p>${p.descricao || ""}</p>

    <strong>1 sabor</strong><br>
    <button class="btn btn-add">P — R$ ${Number(p.preco_p).toFixed(2)}</button>
    <button class="btn btn-add">M — R$ ${Number(p.preco_m).toFixed(2)}</button>
    <button class="btn btn-add">G — R$ ${Number(p.preco_g).toFixed(2)}</button>

    <hr>

    <strong>2 sabores</strong><br>
    <button class="btn btn-add">P (2 sabores)</button>
    <button class="btn btn-add">M (2 sabores)</button>
    <button class="btn btn-add">G (2 sabores)</button>
  `;

  const botoes = div.querySelectorAll("button");

  botoes[0].onclick = () => addCarrinho(`${p.nome} (P)`, Number(p.preco_p));
  botoes[1].onclick = () => addCarrinho(`${p.nome} (M)`, Number(p.preco_m));
  botoes[2].onclick = () => addCarrinho(`${p.nome} (G)`, Number(p.preco_g));

  botoes[3].onclick = () => escolherSegundoSabor(p, "p");
  botoes[4].onclick = () => escolherSegundoSabor(p, "m");
  botoes[5].onclick = () => escolherSegundoSabor(p, "g");

  listaProdutos.appendChild(div);
}

/* =======================
   CARRINHO (COM REMOVER)
======================= */
async function addCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  renderizarCarrinho();

  await supabase.from("itens_comanda").insert([
    {
      comanda_id: comandaAtual,
      produto_nome: nome,
      quantidade: 1,
      preco: preco
    }
  ]);
}

function renderizarCarrinho() {
  resumoEl.innerHTML = "";
  let subtotal = 0;

  carrinho.forEach((item, i) => {
    const linha = document.createElement("div");
    linha.style.display = "flex";
    linha.style.justifyContent = "space-between";
    linha.style.alignItems = "center";
    linha.style.marginBottom = "6px";

    const texto = document.createElement("span");
    texto.innerText = `${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}`;

    const btn = document.createElement("button");
    btn.innerText = "❌";
    btn.style.background = "#c0392b";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.padding = "2px 6px";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", () => {
      carrinho.splice(i, 1);
      renderizarCarrinho();
    });

    linha.appendChild(texto);
    linha.appendChild(btn);
    resumoEl.appendChild(linha);

    subtotal += item.preco;
  });

  frete = entregaSelect.value === "fora" ? 7 : 0;

  const freteDiv = document.createElement("div");
  freteDiv.style.marginTop = "10px";
  freteDiv.innerText =
    frete > 0 ? `🚗 Frete: R$ ${frete.toFixed(2)}` : `🚚 Frete: Grátis`;

  resumoEl.appendChild(freteDiv);

  totalEl.innerText = `Total: R$ ${(subtotal + frete).toFixed(2)}`;
}

/* =======================
   EVENTOS
======================= */
entregaSelect.addEventListener("change", renderizarCarrinho);

pagamentoSelect.addEventListener("change", () => {
  trocoInput.style.display =
    pagamentoSelect.value === "dinheiro" ? "block" : "none";
  if (pagamentoSelect.value !== "dinheiro") trocoInput.value = "";
});

/* =======================
   2 SABORES
======================= */
function escolherSegundoSabor(pizza1, tamanho) {
  const sabores = produtos.filter(
    p => p.categoria && p.categoria.toLowerCase().includes("pizza")
  );

  let lista = sabores.map((p, i) => `${i + 1} - ${p.nome}`).join("\n");
  const escolha = prompt(`Escolha o segundo sabor:\n\n${lista}`);
  const index = Number(escolha) - 1;

  if (!sabores[index]) {
    alert("Sabor inválido");
    return;
  }

  const pizza2 = sabores[index];
  const preco1 = Number(pizza1[`preco_${tamanho}`]);
  const preco2 = Number(pizza2[`preco_${tamanho}`]);
  const precoFinal = Math.max(preco1, preco2);

  addCarrinho(
    `Pizza ${pizza1.nome} + ${pizza2.nome} (${tamanho.toUpperCase()})`,
    precoFinal
  );
}
