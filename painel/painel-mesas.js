console.log("JS DA COMANDA CARREGADO");

import { supabase } from "../js/supabase.js";

const listaComandas = document.getElementById("lista-comandas");

/* =========================
   CARREGAR COMANDAS ABERTAS
========================= */
async function carregarComandas() {
  // ⭐ NÃO atualiza se o modal estiver aberto
  if (window.modalFinalizacaoAberto) return;

  const { data, error } = await supabase
    .from("comandas")
    .select("*")
    .eq("status", "aberta")
    .order("mesa_numero", { ascending: true });

  if (error) {
    console.error("Erro ao buscar comandas:", error);
    return;
  }

  listaComandas.innerHTML = "";

  if (!data || data.length === 0) {
    listaComandas.innerHTML = "<p>Nenhuma mesa aberta</p>";
    return;
  }

  for (const comanda of data) {
    const { data: itens } = await supabase
      .from("itens_comanda")
      .select("preco, qtd")
      .eq("comanda_id", comanda.id);

    let total = 0;
    if (itens) {
      itens.forEach(item => {
        total += Number(item.preco) * Number(item.qtd || 1);
      });
    }

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>🍽️ Mesa ${comanda.mesa_numero}</strong><br>
      <strong>Total: R$ ${total.toFixed(2)}</strong><br><br>

      <button onclick="verItens('${comanda.id}')">
        👀 Ver itens
      </button>

      <button onclick="imprimirComanda('${comanda.id}', ${comanda.mesa_numero})">
        🖨️ Imprimir
      </button>

      <button onclick="abrirFinalizacaoVenda({
        tipo: 'mesa',
        id: '${comanda.id}',
        total: ${total},
        descricao: 'Mesa ${comanda.mesa_numero}'
      })">
        💰 Finalizar venda
      </button>

      <button onclick="fecharMesa('${comanda.id}')">
        ✅ Fechar Mesa
      </button>
    `;

    listaComandas.appendChild(div);
  }
}

/* =========================
   VER ITENS DA COMANDA
========================= */
window.verItens = async function (comandaId) {
  const { data, error } = await supabase
    .from("itens_comanda")
    .select("*")
    .eq("comanda_id", comandaId)
    .order("created_at");

  if (error) {
    alert("Erro ao buscar itens");
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    alert("Nenhum item nesta comanda");
    return;
  }

  let texto = "🧾 ITENS DA COMANDA:\n\n";

  data.forEach(item => {
    texto += `${item.nome} x${item.qtd} — R$ ${Number(item.preco).toFixed(2)}\n`;
  });

  alert(texto);
};

/* =========================
   IMPRIMIR COMANDA
========================= */
window.imprimirComanda = async function (comandaId, mesaNumero) {
  const { data: itens, error } = await supabase
    .from("itens_comanda")
    .select("*")
    .eq("comanda_id", comandaId)
    .order("created_at");

  if (error) {
    alert("Erro ao imprimir");
    console.error(error);
    return;
  }

  let total = 0;

  let html = `
    <div style="font-family: monospace; width: 280px">
      <h3>DanBurgers</h3>
      <strong>Mesa ${mesaNumero}</strong>
      <hr>
  `;

  itens.forEach(item => {
    const subtotal = Number(item.preco) * Number(item.qtd || 1);
    total += subtotal;

    html += `
      ${item.nome} x${item.qtd || 1}<br>
      R$ ${subtotal.toFixed(2)}<br><br>
    `;
  });

  html += `
      <hr>
      <strong>Total: R$ ${total.toFixed(2)}</strong>
    </div>
  `;

  const area = document.getElementById("area-impressao");
  area.innerHTML = html;

  window.print();
};

/* =========================
   FECHAR MESA (MANTIDO)
========================= */
window.fecharMesa = async function () {
  alert(
    "⚠️ Para fechar a mesa, é obrigatório finalizar a venda.\n\n" +
    "Use o botão 💰 Finalizar venda."
  );
};


/* =========================
   INICIAR
========================= */
carregarComandas();

// ⭐ INTERVALO SEGURO (NÃO ATUALIZA COM MODAL ABERTO)
setInterval(() => {
  if (!window.modalFinalizacaoAberto) {
    carregarComandas();
  }
}, 3000);
