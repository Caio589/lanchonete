import { supabase } from "./supabase.js"

document.addEventListener("DOMContentLoaded", () => {

  const listaCategorias = document.getElementById("lista-categorias")
  const listaProdutos = document.getElementById("lista-produtos")
  const selectCategoria = document.getElementById("categoriaProduto")

  const campoPrecoNormal = document.getElementById("campo-preco-normal")
  const campoPizza = document.getElementById("campo-pizza")

  const btnCriarCategoria = document.getElementById("btnCriarCategoria")
  const btnCriarProduto = document.getElementById("btnCriarProduto")

  /* =========================
     CATEGORIAS
  ========================= */
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
            <button class="btn editar" data-id="${c.id}" data-nome="${c.nome}">✏️</button>
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

    /* ✏️ EDITAR CATEGORIA */
    document.querySelectorAll("#lista-categorias .editar").forEach(btn => {
      btn.onclick = async () => {
        const novoNome = prompt("Editar categoria:", btn.dataset.nome)
        if (!novoNome) return

        const { error } = await supabase
          .from("categorias")
          .update({ nome: novoNome })
          .eq("id", btn.dataset.id)

        if (error) {
          alert("Erro ao editar categoria")
          console.error(error)
          return
        }

        carregarCategorias()
        carregarProdutos()
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

  /* =========================
     MOSTRAR CAMPOS PIZZA
  ========================= */
  selectCategoria.addEventListener("change", () => {
    if (selectCategoria.value.toLowerCase().includes("pizza")) {
      campoPrecoNormal.style.display = "none"
      campoPizza.style.display = "block"
    } else {
      campoPrecoNormal.style.display = "block"
      campoPizza.style.display = "none"
    }
  })

  /* =========================
     PRODUTOS
  ========================= */
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
            <button class="btn editar" data-id="${p.id}">✏️</button>
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

    /* ✏️ EDITAR PRODUTO */
    document.querySelectorAll("#lista-produtos .editar").forEach(btn => {
      btn.onclick = async () => {
        const { data, error } = await supabase
          .from("produtos")
          .select("*")
          .eq("id", btn.dataset.id)
          .single()

        if (error || !data) {
          alert("Erro ao carregar produto")
          return
        }

        document.getElementById("nomeProduto").value = data.nome
        document.getElementById("descricaoProduto").value = data.descricao || ""
        selectCategoria.value = data.categoria
        selectCategoria.dispatchEvent(new Event("change"))

        if (data.categoria.toLowerCase().includes("pizza")) {
          document.getElementById("precoP").value = data.preco_p
          document.getElementById("precoM").value = data.preco_m
          document.getElementById("precoG").value = data.preco_g
        } else {
          document.getElementById("precoProduto").value = data.preco
        }

        btnCriarProduto.dataset.editando = data.id
        btnCriarProduto.innerText = "Salvar alterações"
      }
    })
  }

  /* =========================
     CRIAR / EDITAR PRODUTO
  ========================= */
  btnCriarProduto.onclick = async () => {
    const produtoId = btnCriarProduto.dataset.editando || null

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

    if (categoria.toLowerCase().includes("pizza")) {
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

    if (produtoId) {
      await supabase.from("produtos").update(dados).eq("id", produtoId)
      delete btnCriarProduto.dataset.editando
      btnCriarProduto.innerText = "Criar Produto"
    } else {
      await supabase.from("produtos").insert([dados])
    }

    document.getElementById("nomeProduto").value = ""
    document.getElementById("descricaoProduto").value = ""
    document.getElementById("precoProduto").value = ""
    document.getElementById("precoP").value = ""
    document.getElementById("precoM").value = ""
    document.getElementById("precoG").value = ""

    carregarProdutos()
  }

  /* START */
  carregarCategorias()
  carregarProdutos()
})
