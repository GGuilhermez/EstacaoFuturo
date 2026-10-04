const supabaseClient = window.supabase.createClient(
    "https://mhxottjoerdkgjwifmbb.supabase.co",
    "sb_publishable_FRHttSQA9ThcBPIjaqmhrQ_AD1LqIcl"
);

console.log("Supabase carregado!");

const inicio = document.getElementById("inicio");
const login = document.getElementById("login");
const dashboard = document.getElementById("dashboard");
const desafios = document.getElementById("desafios");

const btnEntrar = document.getElementById("btnEntrar");
const btnVoltar = document.getElementById("btnVoltar");
const btnSair = document.getElementById("btnSair");
const btnDesafios = document.getElementById("btnDesafios");
const btnNovoDesafio = document.getElementById("btnNovoDesafio");
const btnCancelarDesafio = document.getElementById("btnCancelarDesafio");

const formLogin = document.getElementById("formLogin");
const formDesafio = document.getElementById("formDesafio");

const usuarioInfo = document.querySelector(".usuario-info");

const formularioDesafio = document.getElementById("formularioDesafio");
const listaDesafios = document.getElementById("listaDesafios");

const secretariaDesafio = document.getElementById("secretariaDesafio");

let usuarioAtual = null;

btnEntrar.addEventListener("click", () => {
    inicio.classList.remove("ativa");
    login.classList.add("ativa");
});

btnVoltar.addEventListener("click", () => {
    login.classList.remove("ativa");
    inicio.classList.add("ativa");
});

formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        alert("Erro ao entrar: " + error.message);
        return;
    }

    console.log("Usuário conectado:", data.user);

    const { data: usuario, error: erroUsuario } = await supabaseClient
        .from("usuarios")
        .select("nome, perfil")
        .eq("id", data.user.id)
        .single();

    if (erroUsuario) {
        console.error("Erro ao buscar perfil:", erroUsuario);
        alert("Login realizado, mas não foi possível carregar o perfil.");
        return;
    }

    usuarioAtual = data.user;

    usuarioInfo.textContent = `${usuario.nome} • ${usuario.perfil}`;

    login.classList.remove("ativa");
    dashboard.classList.add("ativa");
});

btnDesafios.addEventListener("click", async () => {
    dashboard.classList.remove("ativa");
    desafios.classList.add("ativa");

    await carregarSecretarias();
    await carregarDesafios();
});

btnNovoDesafio.addEventListener("click", () => {
    formularioDesafio.style.display = "block";
});

btnCancelarDesafio.addEventListener("click", () => {
    formularioDesafio.style.display = "none";
    formDesafio.reset();
});

async function carregarSecretarias() {
    const { data, error } = await supabaseClient
        .from("secretarias")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

    if (error) {
        console.error("Erro ao carregar secretarias:", error);
        alert("Não foi possível carregar as secretarias.");
        return;
    }

    secretariaDesafio.innerHTML = '<option value="">Selecione uma secretaria</option>';

    data.forEach((secretaria) => {
        const option = document.createElement("option");

        option.value = secretaria.id;
        option.textContent = secretaria.nome;

        secretariaDesafio.appendChild(option);
    });
}

formDesafio.addEventListener("submit", async (event) => {
    event.preventDefault();

    const titulo = document.getElementById("tituloDesafio").value;
    const descricao = document.getElementById("descricaoDesafio").value;
    const problema = document.getElementById("problemaDesafio").value;
    const objetivo = document.getElementById("objetivoDesafio").value;
    const secretariaId = secretariaDesafio.value;

    const { data: userData } = await supabaseClient.auth.getUser();

    if (!userData.user) {
        alert("Usuário não está autenticado.");
        return;
    }

    const { error } = await supabaseClient
        .from("desafios")
        .insert({
            titulo: titulo,
            descricao: descricao,
            problema: problema,
            objetivo: objetivo,
            secretaria_id: secretariaId,
            criado_por: userData.user.id
        });

    if (error) {
        console.error("Erro ao cadastrar desafio:", error);
        alert("Erro ao cadastrar desafio: " + error.message);
        return;
    }

    alert("Desafio cadastrado com sucesso!");

    formDesafio.reset();
    formularioDesafio.style.display = "none";

    await carregarDesafios();
});

async function carregarDesafios() {
    const { data, error } = await supabaseClient
        .from("desafios")
        .select(`
            id,
            titulo,
            descricao,
            problema,
            objetivo,
            status,
            secretarias (
                nome
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao carregar desafios:", error);
        listaDesafios.innerHTML = "<p>Não foi possível carregar os desafios.</p>";
        return;
    }

    listaDesafios.innerHTML = "";

    if (data.length === 0) {
        listaDesafios.innerHTML = `
            <h3>Desafios cadastrados</h3>
            <p>Nenhum desafio cadastrado.</p>
        `;
        return;
    }

    const tituloLista = document.createElement("h3");
    tituloLista.textContent = "Desafios cadastrados";

    listaDesafios.appendChild(tituloLista);

    data.forEach((desafio) => {
        const card = document.createElement("div");

        card.classList.add("resumo-card");

        card.innerHTML = `
            <span>${desafio.status}</span>
            <h3>${desafio.titulo}</h3>
            <p>${desafio.descricao}</p>
            <small>Secretaria: ${desafio.secretarias?.nome || "Não informada"}</small>
        `;

        listaDesafios.appendChild(card);
    });
}

btnSair.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();

    usuarioAtual = null;

    dashboard.classList.remove("ativa");
    desafios.classList.remove("ativa");
    inicio.classList.add("ativa");
});