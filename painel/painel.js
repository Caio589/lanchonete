import { supabase } from "../js/supabase.js";

const lista = document.getElementById("lista-pedidos");

/* CARREGA PEDIDOS NOVOS */
async function carregarPedidos() {
  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .eq("status", "novo")
    .order("created_at", { ascending: true });

  lista.innerHTML = "";

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido novo</p>";
    return;
  }

  data.forEach(pedido => {
    const div = document.createElement("div");
    div.className = "pedido";
    div.innerHTML = `
      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente}<br>
      Total: R$ ${pedido.total.toFixed(2)}<br>
      <button>🖨️ Imprimir</button>
    `;

    div.querySelector("button").onclick = () => imprimirPedido(pedido);
    lista.appendChild(div);
  });
}

/* IMPRIME O PEDIDO */
async function imprimirPedido(pedido) {
  let texto = `
Pedido #${pedido.id}
Cliente: ${pedido.cliente}
Telefone: ${pedido.telefone}

`;

  pedido.itens.forEach(item => {
    texto += `${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
  });

  texto += `
-------------------------
Total: R$ ${pedido.total.toFixed(2)}
`;

  const cupom = document.getElementById("cupom");
  const conteudo = document.getElementById("cupom-conteudo");

  conteudo.innerHTML = texto.replace(/\n/g, "<br>");
  cupom.style.display = "block";

  window.print();

  cupom.style.display = "none";

  /* MARCA COMO IMPRESSO */
  await supabase
    .from("pedidos")
    .update({ status: "impresso" })
    .eq("id", pedido.id);

  carregarPedidos();
}

/* ATUALIZA A CADA 3s */
carregarPedidos();
setInterval(carregarPedidos, 3000);
