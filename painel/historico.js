import { supabase } from "../js/supabase.js";

window.carregarHistoricoCaixa = async function () {
  const lista = document.getElementById("lista-historico");

  const { data, error } = await supabase
    .from("historico_caixa")
    .select("*")
    .order("data", { ascending: false });

  if (error) {
    lista.innerHTML = "<p>Erro ao carregar histórico</p>";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum caixa fechado ainda</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(caixa => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <strong>📅 ${new Date(caixa.data).toLocaleDateString("pt-BR")}</strong><br>
      Valor inicial: R$ ${Number(caixa.valor_inicial).toFixed(2)}<br>
      Entradas: R$ ${Number(caixa.total_entradas).toFixed(2)}<br>
      Saídas: R$ ${Number(caixa.total_saidas).toFixed(2)}<br>
      <strong>Saldo final: R$ ${Number(caixa.valor_final).toFixed(2)}</strong><br><br>

      <button onclick="gerarPDFCaixa({
        data: '${new Date(caixa.data).toLocaleDateString("pt-BR")}',
        valor_inicial: '${Number(caixa.valor_inicial).toFixed(2)}',
        total_entradas: '${Number(caixa.total_entradas).toFixed(2)}',
        total_saidas: '${Number(caixa.total_saidas).toFixed(2)}',
        dinheiro: '${Number(caixa.dinheiro).toFixed(2)}',
        pix: '${Number(caixa.pix).toFixed(2)}',
        cartao: '${Number(caixa.cartao).toFixed(2)}',
        troco: '${Number(caixa.troco).toFixed(2)}',
        valor_final: '${Number(caixa.valor_final).toFixed(2)}'
      })">
        📄 Baixar PDF
      </button>
    `;

    lista.appendChild(div);
  });
};
