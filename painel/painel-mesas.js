import { supabase } from "../js/supabase.js";

const listaComandas = document.getElementById("lista-comandas");

/* BUSCAR COMANDAS ABERTAS */
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

  if (!data || data.length === 0) {
    listaComandas.innerHTML = "<p>Nenhuma comanda aberta</p>";
    return;
  }

  listaComandas.innerHTML = "";

  data.forEach(comanda => {
    const div = document.createElement("div");
    div.className = "comanda";

    div.innerHTML = `
      <strong>🍽️ Mesa ${comanda.mesa_numero}</strong><br>
      Comanda: ${comanda.id}<br><br>
      <button onclick="imprimirComanda('${comanda.id}', ${comanda.mesa_numero})">
        🖨️ Imprimir Comanda
      </button>
    `;

    listaComandas.appendChild(div);
  });
}

/* IMPRIMIR COMANDA */
window.imprimirComanda = async function (comandaId, mesaNumero) {
  const { data: itens, error } = await supabase
    .from("itens_comanda")
    .select("*")
    .eq("comanda_id", comandaId)
    .order("created_at");

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
    const subtotal = Number(item.preco) * Number(item.quantidade || 1);
    total += subtotal;

    html += `${item.nome} x${item.quantidade || 1} - R$ ${subtotal.toFixed(
      2
    )}<br>`;
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

/* ATUALIZA */
carregarComandas();
setInterval(carregarComandas, 3000);
