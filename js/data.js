import { supabase } from "./supabase.js";

export async function buscarProdutos() {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }

  return data || [];
}

export async function buscarCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }

  return data || [];
}
