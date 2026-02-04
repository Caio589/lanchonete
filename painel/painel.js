import { supabase } from "../js/supabase.js";

const lista = document.getElementById("lista-pedidos");
const botaoSom = document.getElementById("ativar-som");

let pedidosImpressos = new Set();

/* ===== SOM ===== */
let audioContext = null;
let somLiberado = false;

botaoSom.onclick = () => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  somLiberado = true;
  botaoSom.innerText = "🔔 Som ativado";
  botaoSom.disabled = true;
  tocarSom();
};

function tocarSom() {
  if (!somLiberado || !audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, audioContext.currentTime);
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + 0.25);
}

/* ===== PEDIDOS ===== */
async function carregarPedidos() {
  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .in("status", ["novo", "preparando"])
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(pedido => {
    const div = document.createElement("div");
    div.className = "pedido";

    div.innerHTML = `
      <strong>Pedido #${pedido.id}</strong><br>
      Cliente: ${pedido.cliente}<br>
      Total: R$ ${pedido.total.toFixed(2)}<br>
      Status: ${pedido.status}
    `;

    if (pedido.status === "novo" && !pedidosImpressos.has(pedido.id)) {
      pedidosImpressos.add(pedido.id);
      tocarSom();
      imprimirPedido(pedido);
    }

    const btnFinalizar = document.createElement("button");
    btnFinalizar.innerText = "✅ Finalizar pedido";
    btnFinalizar.onclick = async () => {
      await supabase
        .from("pedidos")
        .update({ status: "finalizado" })
        .eq("id", pedido.id);

      div.remove();
    };

    div.appendChild(document.createElement("br"));
    div.appendChild(btnFinalizar);
    lista.appendChild(div);
  });
}

/* ===== IMPRESSÃO ===== */
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

  await supabase
    .from("pedidos")
    .update({ status: "preparando" })
    .eq("id", pedido.id);
}

/* ===== RELATÓRIO MENSAL ===== */
async function gerarRelatorioMensal() {
  const inicio = new Date();
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date();
  fim.setMonth(fim.getMonth() + 1);
  fim.setDate(0);
  fim.setHours(23, 59, 59, 999);

  const { data } = await supabase
    .from("pedidos")
    .select("total")
    .eq("status", "finalizado")
    .gte("created_at", inicio.toISOString())
    .lte("created_at", fim.toISOString());

  let total = 0;
  data.forEach(p => total += p.total);

  alert(`
📊 RELATÓRIO MENSAL
Pedidos: ${data.length}
Faturamento: R$ ${total.toFixed(2)}
Ticket médio: R$ ${(total / data.length || 0).toFixed(2)}
`);
}

window.gerarRelatorioMensal = gerarRelatorioMensal;

/* LOOP */
carregarPedidos();
setInterval(carregarPedidos, 3000);
