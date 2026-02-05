import { supabase } from "./supabase.js";

// pega a mesa escolhida
const mesa = localStorage.getItem("mesaAtual");

if (!mesa) {
  alert("Mesa não selecionada");
  window.location.href = "mesas.html";
}

// botão nova comanda
document.getElementById("nova-comanda").onclick = criarComanda;

async function criarComanda() {
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

  // salva a comanda atual
  localStorage.setItem("comandaAtual", data.id);

  // vai para o cardápio da mesa
  window.location.href = "cardapio-mesa.html";
}
