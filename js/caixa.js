import { supabase } from "../js/supabase.js";

let caixaAtual = null;

/* =======================
   START
======================= */
verificarCaixaAberto();

async function verificarCaixaAberto() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("caixa")
    .select("*")
    .eq("data", hoje)
    .eq("status", "aberto")
    .single();

  if (data) {
    caixaAtual = data;
    mostrarCaixaAberto();
    carregarTotais();
  }
}

/* =======================
   ABRIR CAIXA
======================= */
window.abrirCaixa = async function () {
  const valorInicial = Number(document.getElementById("valor-inicial").value);

  if (!valorInicial) {
    alert("Informe o valor inicial");
    return;
  }

  const hoje = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("caixa")
    .insert([
      {
        data: hoje,
        valor_inicial: valorInicial,
        status: "aberto"
      }
    ])
    .select()
    .single();

  if (error) {
    alert("Erro ao abrir caixa");
    console.error(error);
    return;
  }

  caixaAtual = data;
  mostrarCaixaAberto();
};

/* =======================
   MOSTRAR CAIXA
======================= */
function mostrarCaixaAberto() {
  document.getElementById("abrir-caixa").style.display = "none";
  document.getElementById("caixa-aberto").style.display = "block";
  document.getElementById("valorInicial").innerText =
    Number(caixaAtual.valor_inicial).toFixed(2);
}

/* =======================
   DESPESA
======================= */
window.adicionarDespesa = async function () {
  const descricao = document.getElementById("descricao-despesa").value;
  const valor = Number(document.getElementById("valor-despesa").value);

  if (!descricao || !valor) {
    alert("Informe descrição e valor");
    return;
  }

  await supabase.from("movimentacoes_caixa").insert([
    {
      caixa_id: caixaAtual.id,
      tipo: "saida",
      origem: "despesa",
      descricao,
      valor
    }
  ]);

  document.getElementById("descricao-despesa").value = "";
  document.getElementById("valor-despesa").value = "";

  carregarTotais();
};

/* =======================
   TOTAIS
======================= */
async function carregarTotais() {
  const { data } = await supabase
    .from("movimentacoes_caixa")
    .select("tipo, valor")
    .eq("caixa_id", caixaAtual.id);

  let entradas = 0;
  let saidas = 0;

  data.forEach(m => {
    if (m.tipo === "entrada") entradas += Number(m.valor);
    if (m.tipo === "saida") saidas += Number(m.valor);
  });

  document.getElementById("totalEntradas").innerText = entradas.toFixed(2);
  document.getElementById("totalSaidas").innerText = saidas.toFixed(2);
}

/* =======================
   FECHAR CAIXA
======================= */
window.fecharCaixa = async function () {
  const totalEntradas =
    Number(document.getElementById("totalEntradas").innerText);
  const totalSaidas =
    Number(document.getElementById("totalSaidas").innerText);

  const valorFinal =
    Number(caixaAtual.valor_inicial) + totalEntradas - totalSaidas;

  await supabase
    .from("caixa")
    .update({
      valor_final: valorFinal,
      status: "fechado"
    })
    .eq("id", caixaAtual.id);

  alert(`Caixa fechado. Saldo final: R$ ${valorFinal.toFixed(2)}`);
  location.reload();
};
