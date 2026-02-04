import { supabase } from "./supabase.js"

document.addEventListener("DOMContentLoaded", () => {

  const listaCategorias = document.getElementById("lista-categorias")
  const listaProdutos = document.getElementById("lista-produtos")
  const selectCategoria = document.getElementById("categoriaProduto")

  const campoPrecoNormal = document.getElementById("campo-preco-normal")
  const campoPizza = document.getElementById("campo-pizza")

  const btnCriarCategoria = document.getElementById("btnCriarCategoria")
  const btnCriarProduto = document.getElementById("btnCriarProduto")

  // =========================
  // CATEGORIAS
  // =========================
  async function carregarCategorias() {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    listaCategorias.innerHTML = ""
    selectCategoria.innerHTML = `<option value="">Selecione a categoria</option>`

    data.forEach(c => {
      listaCategorias.innerHTML += `
        <div class="card">
          <b>${c.nome}</b>
          <div class="acoes">
            <button class="btn excluir" data-id="${c.id}">🗑️</button>
          </div>
        </div>
      `
      selectCategoria.innerHTML += `<option value="${c.nome}">${c.nome}</option>`
    })

    document.querySelectorAll("#lista-categorias .excluir").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Excluir categoria?")) return
        await supabase.from("categorias").delete().eq("id", btn.dataset.id)
        carregarCategorias()
      }
    })
  }

  btnCriarCategoria.onclick = async () => {
    const nome = document.getElementById("novaCategoria").value.trim()
    if (!nome) {
      alert("Digite o nome da categoria")
      return
    }

    const { error } = await supabase
      .from("categorias")
      .insert([{ nome, ativo: true }])

    if (error) {
      console.error(error)
      alert("Erro ao criar categoria")
      return
    }

    document.getElementById("novaCategoria").value = ""
    carregarCategorias()
  }

  // =========================
  // MOSTRAR CAMPOS PIZZA
  // =========================
  selectCategoria.addEventListener("change", () => {
    if (selectCategoria.value.toLowerCase() === "pizza") {
      campoPrecoNormal.style.display = "none"
      campoPizza.style.display = "block"
    } else {
      campoPrecoNormal.style.display = "block"
      campoPizza.style.display = "none"
    }
  })

  // =========================
  // PRODUTOS
  // =========================
  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    listaProdutos.innerHTML = ""

    data.forEach(p => {
      listaProdutos.innerHTML += `
        <div class="card">
          <b>${p.nome}</b> — ${p.categoria}
          <div class="acoes">
            <button class="btn excluir" data-id="${p.id}">🗑️</button>
          </div>
        </div>
      `
    })

    document.querySelectorAll("#lista-produtos .excluir").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Excluir produto?")) return
        await supabase.from("produtos").delete().eq("id", btn.dataset.id)
        carregarProdutos()
      }
    })
  }

  // =========================
  // CRIAR PRODUTO (BLINDADO)
  // =========================
  btnCriarProduto.onclick = async () => {
    const nome = document.getElementById("nomeProduto").value.trim()
    const descricao = document.getElementById("descricaoProduto").value.trim()
    const categoria = selectCategoria.value

    const preco = document.getElementById("precoProduto").value
    const precoP = document.getElementById("precoP").value
    const precoM = document.getElementById("precoM").value
    const precoG = document.getElementById("precoG").value

    if (!nome || !categoria) {
      alert("Preencha nome e categoria")
      return
    }

    let dados = {
      nome,
      descricao: descricao || null,
      categoria,
      ativo: true
    }

    if (categoria.toLowerCase() === "pizza") {
      if (!precoP || !precoM || !precoG) {
        alert("Pizza precisa de preços P / M / G")
        return
      }

      dados.preco = null
      dados.preco_p = Number(precoP)
      dados.preco_m = Number(precoM)
      dados.preco_g = Number(precoG)

    } else {
      if (!preco) {
        alert("Preencha o preço")
        return
      }

      dados.preco = Number(preco)
      dados.preco_p = null
      dados.preco_m = null
      dados.preco_g = null
    }

    const { error } = await supabase
      .from("produtos")
      .insert([dados])

    if (error) {
      console.error("ERRO AO INSERIR:", error)
      alert("Erro ao salvar produto")
      return
    }

    // limpar campos
    document.getElementById("nomeProduto").value = ""
    document.getElementById("descricaoProduto").value = ""
    document.getElementById("precoProduto").value = ""
    document.getElementById("precoP").value = ""
    document.getElementById("precoM").value = ""
    document.getElementById("precoG").value = ""

    carregarProdutos()
  }

  // START
  carregarCategorias()
  carregarProdutos()
})
