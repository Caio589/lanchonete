console.log("COMANDA.JS CARREGOU");

import { supabase } from "../js/supabase.js";

document.getElementById("nova-comanda").onclick = criarComanda;

async function criarComanda() {
  const mesa = localStorage.getItem("mesaAtual");

  if (!mesa) {
    alert("Mesa não encontrada");
    return;
  }

  const { data, error } = await supabase
    .from("comandas")
    .insert([
      {
        mesa_numero: Number(mesa),
        status: "aberta"
      }
    ])
    .select()
    .single();

  if (error) {
    alert("Erro ao criar comanda");
    console.error(error);
    return;
  }

  // salva a comanda criada
  localStorage.setItem("comandaAtual", data.id);

  // 👉 VAI PARA O CARDÁPIO DA MESA
  window.location.href = `comanda-cardapio.html?comanda=${data.id}`;
}
