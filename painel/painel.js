import { supabase } from "../js/supabase.js";

const lista = document.getElementById("lista-pedidos");
const som = document.getElementById("som-pedido");

let pedidosImpressos = new Set();

/* BUSCA PEDIDOS NOVOS */
async function carregarPedidos() {
  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .eq("status", "novo")
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido novo</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(pedido => {
    if (!pedidosImpressos.has(pedido.id)) {
      pedidosImpressos.add(pedido.id);
      tocarSom();
      imprimirPedido(pedido);
    }

    const div = document.createElement("div");
    div.className = "pedido";
    div.innerHTML = `
      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente}<br>
      Total: R$ ${pedido.total.toFixed(2)}
    `;
    lista.appendChild(div);
  });
}

/* SOM */
function tocarSom() {
  if (som) {
    som.currentTime = 0;
    som.play().catch(() => {});
  }
}

/* IMPRIME AUTOMÁTICO */
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
}

/* ATUALIZA A CADA 3s */
carregarPedidos();
setInterval(carregarPedidos, 3000);
