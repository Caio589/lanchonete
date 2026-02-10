no caso esse ta certo vc so precisa adicionar o x pq ele ja funciona finalizarv pedido so coloca o x pfv           const comandaAtual = localStorage.getItem("comandaAtual");

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

          if (catAtual === "pizza") {
            return catProduto.includes("pizza");
          }

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
   PIZZA (1 E 2 SABORES)
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

  // 1 sabor
  botoes[0].onclick = () => addCarrinho(`${p.nome} (P)`, Number(p.preco_p));
  botoes[1].onclick = () => addCarrinho(`${p.nome} (M)`, Number(p.preco_m));
  botoes[2].onclick = () => addCarrinho(`${p.nome} (G)`, Number(p.preco_g));

  // 2 sabores
  botoes[3].onclick = () => escolherSegundoSabor(p, "p");
  botoes[4].onclick = () => escolherSegundoSabor(p, "m");
  botoes[5].onclick = () => escolherSegundoSabor(p, "g");

  listaProdutos.appendChild(div);
}

/* =======================
   CARRINHO
======================= */
async function addCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  renderizarCarrinho();

  // salva no banco ligado à comanda
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
  resumoEl.innerHTML += `
    ${i + 1}️⃣ ${item.nome} — R$ ${item.preco.toFixed(2)}
    <button
      style="border:none;background:none;cursor:pointer"
      onclick="carrinho.splice(${i}, 1); renderizarCarrinho();"
    >
      ❌
    </button>
    <br>
  `;
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
   2 SABORES (ESCOLHA)
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

  /* ===== MONTA WHATSAPP ===== */
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

  /* ===== WHATSAPP ===== */
  const whatsapp = "5577981184890"; // seu número
 window.location.href = `https://wa.me/${whatsapp}?text=${mensagem}`;

  /* ===== PAINEL / SUPABASE ===== */
  await supabase.from("pedidos").insert([
    {
      cliente: nome,
      telefone,
      entrega: entregaSelect.value,
      endereco,
      pagamento,
      troco: pagamento === "dinheiro" ? Number(troco) : null,
      itens: carrinho,
      total: totalPedido,
      status: "novo"
    }
  ]);

  carrinho = [];
  renderizarCarrinho();
};     nao muda nada alem do combinado pfv e me manda pronto 
