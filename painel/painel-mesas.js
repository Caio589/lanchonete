import { supabase } from "./supabase.js";

const listaComandas = document.getElementById("lista-comandas");

/* =======================
   CARREGAR COMANDAS
======================= */
async function carregarComandas() {
  const { data, error } = await supabase
    .from("comandas")
    .select("*")
    .eq("status", "aberta")
    .order("created_at");

  if (error) {
    console.error(error);
    return;
  }

  renderizarComandas(data);
}

function renderizarComandas(comandas) {
  listaComandas.innerHTML = "";

  if (comandas.length === 0) {
    listaComandas.innerHTML = "<p>Nenhuma comanda aberta</p>";
    return;
  }

  comandas.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>Mesa ${c.mesa}</h3>
      <button class="btn">Ver itens</button>
      <div id="itens-${c.id}"></div>
    `;

    div.querySelector("button").onclick = () => {
      carregarItens(c.id);
    };

    listaComandas.appendChild(div);
  });
}

/* =======================
   ITENS DA COMANDA
======================= */
async function carregarItens(comandaId) {
  const { data, error } = await supabase
    .from("itens_comanda")
    .select("*")
    .eq("comanda_id", comandaId)
    .order("created_at");

  if (error) {
    console.error(error);
    return;
  }

  const div = document.getElementById(`itens-${comandaId}`);
  div.innerHTML = "";

  data.forEach(i => {
    div.innerHTML += `• ${i.nome} — R$ ${Number(i.preco).toFixed(2)}<br>`;
  });
}

/* =======================
   REALTIME (AO VIVO)
======================= */
supabase
  .channel("itens-comanda")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "itens_comanda"
    },
    payload => {
      console.log("Novo item:", payload.new);
      carregarComandas();
    }
  )
  .subscribe();

/* START */
carregarComandas();
