import { supabase } from "../js/supabase.js";

const listaComandas = document.getElementById("lista-comandas");

/* ==========================
   CARREGAR COMANDAS ABERTAS
========================== */
async function carregarComandas() {
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
    listaComandas.innerHTML = "<p>Nenhuma comanda aberta</p>";
    return;
  }

  data.forEach(comanda => {
    const div = document.createElement("div");
    div.className = "comanda";

    div.innerHTML = `
      <strong>Mesa ${comanda.mesa_numero}</strong><br>
      <button onclick="imprimirComanda('${comanda.id}', ${comanda.mesa_numero})">
        🖨️ Imprimir Comanda
      </button>
    `;

    listaComandas.appendChild(div);
  });
}

/* ==========================
   IMPRIMIR COMANDA
========================== */
window.imprimirComanda = async function (comandaId, mesaNumero) {
  const { data: itens, error } = await supabase
    .from("itens_comanda")
    .select("*")
    .eq("comanda_id", comandaId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar itens:", error);
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
    const qtd = Number(item.qtd || 1);
    const preco = Number(item.preco);
    const subtotal = preco * qtd;
    total += subtotal;

    html += `
      ${item.nome} x${qtd}<br>
      R$ ${subtotal.toFixed(2)}<br>
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

/* ==========================
   ATUALIZA AUTOMÁTICA
========================== */
carregarComandas();
setInterval(carregarComandas, 3000);
