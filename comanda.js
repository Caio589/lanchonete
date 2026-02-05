console.log("COMANDA.JS CARREGOU");

import { supabase } from "./supabase.js";

document.getElementById("nova-comanda").onclick = criarComanda;

async function criarComanda() {
  const mesa = localStorage.getItem("mesaAtual");

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

  localStorage.setItem("comandaAtual", data.id);
  window.location.href = "cardapio-mesa.html";
}
