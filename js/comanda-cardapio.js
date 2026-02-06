import { supabase } from "./supabase.js";

/* =======================
   ESTADO
======================= */
let produtos = [];
let categorias = [];
let categoriaAtual = "Todos";
let comandaId = null;

/* =======================
   ELEMENTOS
======================= */
const listaProdutos = document.getElementById("lista-produtos");
const categoriasEl = document.getElementById("categorias");
const mesaInfo = document.getElementById("mesa-info");

/* =======================
   START
======================= */
async function iniciar() {
  const params = new URLSearchParams(window.location.search);
  comandaId = params.get("comanda");

  if (!comandaId) {
    alert("Comanda não encontrada");
    return;
  }

  mesaInfo.innerText = `Mesa • Comanda #${comandaId}`;

  await carregarCategorias();
  await carregarProdutos();
  renderizarCategorias();
  renderizarProdutos();
}

iniciar();

/* =======================
   BUSCAR DADOS
======================= */
async function carregarCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  categorias = data || [];
}

async function carregarProdutos() {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  produtos = data || [];
}

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
    : produtos.filter(p => {
        if (!p.categoria) return false;

        const catProduto = p.categoria.toLowerCase().trim();
        const catAtual = categoriaAtual.toLowerCase().trim();

        return catProduto.includes(catAtual);
      });


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
      <button class="btn btn-add">Adicionar</button>
    `;

    div.querySelector("button").onclick = () => {
      adicionarNaComanda(p);
    };

    listaProdutos.appendChild(div);
  });
}

/* =======================
   COMANDA (SALVA DIRETO NO BANCO)
======================= */
async function adicionarNaComanda(produto) {
  const { error } = await supabase
    .from("itens_comanda")
    .insert([
      {
        comanda_id: comandaId,
        produto_nome: produto.nome,
        quantidade: 1,
        preco: produto.preco
      }
    ]);

  if (error) {
    console.error(error);
    alert("Erro ao adicionar item");
    return;
  }

  console.log("Item adicionado na comanda");
}
