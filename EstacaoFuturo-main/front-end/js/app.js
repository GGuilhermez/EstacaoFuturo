const supabaseClient = window.supabase.createClient(
    "https://mhxottjoerdkgjwifmbb.supabase.co",
    "sb_publishable_FRHttSQA9ThcBPIjaqmhrQ_AD1LqIcl"
);

const $ = id => document.getElementById(id);

const inicio = $("inicio"), login = $("login"), dashboard = $("dashboard"), desafios = $("desafios");
const btnEntrar = $("btnEntrar"), btnVoltar = $("btnVoltar"), btnSair = $("btnSair");
const btnDesafios = $("btnDesafios"), btnNovoDesafio = $("btnNovoDesafio");
const btnVoltarPainel = $("btnVoltarPainel");
const btnCancelarDesafio = $("btnCancelarDesafio"), btnVoltarDesafios = $("btnVoltarDesafios");
const btnEditarDesafio = $("btnEditarDesafio");
const dashboardHome = $("dashboardHome"), moduloVisual = $("moduloVisual");
const moduloTitulo = $("moduloTitulo"), moduloDescricao = $("moduloDescricao");
const moduloResumo = $("moduloResumo"), listaModulo = $("listaModulo");
const buscaModulo = $("buscaModulo"), formularioModulo = $("formularioModulo");
const formModulo = $("formModulo"), moduloRotulo = $("moduloRotulo");

const formLogin = $("formLogin"), formDesafio = $("formDesafio");
const formularioDesafio = $("formularioDesafio"), listaDesafios = $("listaDesafios");
const detalhesDesafio = $("detalhesDesafio"), secretariaDesafio = $("secretariaDesafio");
const usuarioInfo = document.querySelector(".usuario-info");
const botaoAssistente = $("botaoAssistente"), assistentePainel = $("assistentePainel");
const fecharAssistente = $("fecharAssistente"), assistenteTitulo = $("assistenteTitulo");
const assistenteInstrucao = $("assistenteInstrucao");

let usuarioAtual = null;
let desafioSelecionado = null;
let editando = false;
let moduloAtual = null;

const configuracaoModulos = {
    projetos: {
        titulo: "Projetos",
        singular: "projeto",
        descricao: "Organize propostas acadêmicas ligadas aos desafios públicos.",
        campos: [
            { nome: "titulo", rotulo: "Título do projeto", tipo: "text", titulo: true },
            { nome: "desafio_id", rotulo: "Desafio relacionado", tipo: "text", dica: "Na integração, este campo poderá ser uma seleção de desafios." },
            { nome: "descricao", rotulo: "Resumo do projeto", tipo: "textarea" },
            { nome: "status", rotulo: "Status", tipo: "select", opcoes: ["Proposta", "Em análise", "Em andamento", "Concluído"] }
        ]
    },
    equipes: {
        titulo: "Equipes",
        singular: "equipe",
        descricao: "Cadastre os grupos, seus projetos e as pessoas responsáveis pela orientação.",
        campos: [
            { nome: "nome", rotulo: "Nome da equipe", tipo: "text", titulo: true },
            { nome: "projeto_id", rotulo: "Projeto relacionado", tipo: "text", dica: "Na integração, este campo poderá ser uma seleção de projetos." },
            { nome: "orientador_id", rotulo: "Orientador(a)", tipo: "text" },
            { nome: "quantidade_membros", rotulo: "Quantidade de integrantes", tipo: "number", minimo: "1" },
            { nome: "status", rotulo: "Status", tipo: "select", opcoes: ["Em formação", "Ativa", "Concluída"] }
        ]
    },
    avaliacoes: {
        titulo: "Avaliações",
        singular: "avaliação",
        descricao: "Registre notas, pareceres e o andamento das avaliações dos projetos.",
        campos: [
            { nome: "projeto_id", rotulo: "Projeto avaliado", tipo: "text", titulo: true, dica: "Na integração, este campo poderá ser uma seleção de projetos." },
            { nome: "avaliador_id", rotulo: "Avaliador(a)", tipo: "text" },
            { nome: "nota", rotulo: "Nota", tipo: "number", minimo: "0", maximo: "10", passo: "0.1" },
            { nome: "parecer", rotulo: "Parecer", tipo: "textarea" },
            { nome: "status", rotulo: "Status", tipo: "select", opcoes: ["Pendente", "Em avaliação", "Concluída"] }
        ]
    },
    etapas: {
        titulo: "Etapas",
        singular: "etapa",
        descricao: "Defina fases e prazos para acompanhar a execução de cada projeto.",
        campos: [
            { nome: "titulo", rotulo: "Nome da etapa", tipo: "text", titulo: true },
            { nome: "projeto_id", rotulo: "Projeto relacionado", tipo: "text", dica: "Na integração, este campo poderá ser uma seleção de projetos." },
            { nome: "data_inicio", rotulo: "Data de início", tipo: "date" },
            { nome: "data_fim", rotulo: "Data de conclusão prevista", tipo: "date" },
            { nome: "status", rotulo: "Status", tipo: "select", opcoes: ["Não iniciada", "Em andamento", "Concluída", "Atrasada"] }
        ]
    },
    impactos: {
        titulo: "Impactos",
        singular: "impacto",
        descricao: "Acompanhe indicadores e resultados gerados pelas soluções acadêmicas.",
        campos: [
            { nome: "indicador", rotulo: "Indicador de impacto", tipo: "text", titulo: true },
            { nome: "projeto_id", rotulo: "Projeto relacionado", tipo: "text", dica: "Na integração, este campo poderá ser uma seleção de projetos." },
            { nome: "valor", rotulo: "Resultado ou valor observado", tipo: "text" },
            { nome: "descricao", rotulo: "Descrição do impacto", tipo: "textarea" },
            { nome: "status", rotulo: "Status", tipo: "select", opcoes: ["Planejado", "Em acompanhamento", "Alcançado"] }
        ]
    }
};

const registrosDemonstracao = Object.fromEntries(
    Object.keys(configuracaoModulos).map(nome => [nome, []])
);

const instrucoesAssistente = {
    "Início": "Acompanhe o resumo do sistema: quantidade de desafios, projetos e equipes, além do fluxo geral das iniciativas.",
    "Desafios": "Consulte os desafios públicos cadastrados. Para incluir um, acesse Desafios e use “Novo desafio” para preencher as informações solicitadas.",
    "Projetos": "Use esta área para organizar as propostas acadêmicas criadas a partir dos desafios públicos e acompanhar sua evolução.",
    "Equipes": "Reúna os participantes e orientadores envolvidos em cada projeto para facilitar a colaboração e a divisão de responsabilidades.",
    "Avaliações": "Acompanhe as avaliações das propostas e dos projetos, considerando os critérios definidos para cada iniciativa.",
    "Etapas": "Consulte as fases do trabalho para entender o que já foi concluído e quais são os próximos passos do projeto.",
    "Impactos": "Registre e acompanhe os resultados das soluções, observando os benefícios gerados para a comunidade."
};

botaoAssistente.onclick = () => {
    const estaAberto = botaoAssistente.getAttribute("aria-expanded") === "true";
    assistentePainel.hidden = estaAberto;
    botaoAssistente.setAttribute("aria-expanded", String(!estaAberto));
    botaoAssistente.setAttribute("aria-label", estaAberto ? "Abrir assistente virtual" : "Fechar assistente virtual");
};

fecharAssistente.onclick = () => {
    assistentePainel.hidden = true;
    botaoAssistente.setAttribute("aria-expanded", "false");
    botaoAssistente.setAttribute("aria-label", "Abrir assistente virtual");
    botaoAssistente.focus();
};

document.querySelectorAll("[data-assistente-topico]").forEach(opcao => {
    opcao.onclick = () => {
        const topico = opcao.dataset.assistenteTopico;
        assistenteTitulo.textContent = topico;
        assistenteInstrucao.textContent = instrucoesAssistente[topico];
        document.querySelectorAll("[data-assistente-topico]").forEach(item => {
            item.setAttribute("aria-pressed", String(item === opcao));
        });
    };
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !assistentePainel.hidden) {
        fecharAssistente.click();
    }
});

btnEntrar.onclick = () => {
    inicio.classList.remove("ativa");
    login.classList.add("ativa");
};

btnVoltar.onclick = () => {
    login.classList.remove("ativa");
    inicio.classList.add("ativa");
};

formLogin.onsubmit = async e => {
    e.preventDefault();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: $("email").value,
        password: $("senha").value
    });

    if (error) return alert("Erro ao entrar: " + error.message);

    const { data: usuario, error: erroUsuario } = await supabaseClient
        .from("usuarios")
        .select("nome, perfil")
        .eq("id", data.user.id)
        .single();

    if (erroUsuario) return alert("Não foi possível carregar o perfil.");

    usuarioAtual = data.user;
    usuarioInfo.textContent = `${usuario.nome} • ${usuario.perfil}`;
    login.classList.remove("ativa");
    dashboard.classList.add("ativa");
};

btnDesafios.onclick = async () => {
    dashboardHome.hidden = false;
    moduloVisual.hidden = true;
    dashboard.classList.remove("ativa");
    desafios.classList.add("ativa");
    atualizarMenuAtivo("desafios");
    formularioDesafio.style.display = "none";
    detalhesDesafio.style.display = "none";
    listaDesafios.style.display = "grid";
    await carregarSecretarias();
    await carregarDesafios();
};

btnVoltarPainel.onclick = () => {
    desafios.classList.remove("ativa");
    dashboard.classList.add("ativa");
    atualizarMenuAtivo("inicio");
};

function abrirModulo(nome) {
    const configuracao = configuracaoModulos[nome];
    if (!configuracao) return;

    moduloAtual = nome;
    dashboardHome.hidden = true;
    moduloVisual.hidden = false;
    moduloRotulo.textContent = "Gestão";
    moduloTitulo.textContent = configuracao.titulo;
    moduloDescricao.textContent = configuracao.descricao;
    $("listaModuloTitulo").textContent = `${configuracao.titulo} cadastrados`;
    $("formularioModuloTitulo").textContent = `Adicionar ${configuracao.singular}`;
    buscaModulo.value = "";
    formularioModulo.hidden = true;
    construirFormularioModulo(configuracao);
    atualizarModulo();
    atualizarMenuAtivo(nome);
}

function atualizarMenuAtivo(identificador) {
    document.querySelectorAll(".sidebar .menu-item").forEach(botao => {
        const ativo = botao.dataset.modulo === identificador ||
            botao.dataset.tela === identificador;
        botao.classList.toggle("ativo", ativo);
        if (ativo) botao.setAttribute("aria-current", "page");
        else botao.removeAttribute("aria-current");
    });
}

function construirFormularioModulo(configuracao) {
    formModulo.replaceChildren();

    configuracao.campos.forEach(campo => {
        const grupo = document.createElement("div");
        grupo.className = `campo${campo.tipo === "textarea" ? " campo-largo" : ""}`;

        const label = document.createElement("label");
        const idCampo = `modulo-${campo.nome}`;
        label.htmlFor = idCampo;
        label.textContent = campo.rotulo;

        let entrada;
        if (campo.tipo === "textarea") {
            entrada = document.createElement("textarea");
            entrada.rows = 3;
        } else if (campo.tipo === "select") {
            entrada = document.createElement("select");
            const opcaoInicial = document.createElement("option");
            opcaoInicial.value = "";
            opcaoInicial.textContent = "Selecione";
            entrada.appendChild(opcaoInicial);
            campo.opcoes.forEach(valor => {
                const opcao = document.createElement("option");
                opcao.value = valor;
                opcao.textContent = valor;
                entrada.appendChild(opcao);
            });
        } else {
            entrada = document.createElement("input");
            entrada.type = campo.tipo;
            if (campo.minimo) entrada.min = campo.minimo;
            if (campo.maximo) entrada.max = campo.maximo;
            if (campo.passo) entrada.step = campo.passo;
        }

        entrada.id = idCampo;
        entrada.name = campo.nome;
        entrada.required = campo.tipo !== "textarea" || campo.nome !== "parecer";

        grupo.append(label, entrada);
        if (campo.dica) {
            const dica = document.createElement("small");
            dica.className = "dica-campo";
            dica.textContent = campo.dica;
            grupo.appendChild(dica);
        }
        formModulo.appendChild(grupo);
    });

    const acoes = document.createElement("div");
    acoes.className = "acoes-formulario campo-largo";
    const salvar = document.createElement("button");
    salvar.type = "submit";
    salvar.textContent = "Salvar registro";
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.className = "botao-secundario";
    cancelar.textContent = "Cancelar";
    cancelar.addEventListener("click", fecharFormularioModulo);
    acoes.append(salvar, cancelar);
    formModulo.appendChild(acoes);
}

function fecharFormularioModulo() {
    formularioModulo.hidden = true;
    formModulo.reset();
}

function atualizarModulo() {
    if (!moduloAtual) return;

    const configuracao = configuracaoModulos[moduloAtual];
    const registros = registrosDemonstracao[moduloAtual];
    const consulta = buscaModulo.value.trim().toLocaleLowerCase("pt-BR");
    const filtrados = registros.filter(registro =>
        Object.values(registro).join(" ").toLocaleLowerCase("pt-BR").includes(consulta)
    );

    moduloResumo.replaceChildren();
    const ativos = registros.filter(registro =>
        !["Concluído", "Concluída", "Alcançado"].includes(registro.status)
    ).length;
    [
        { rotulo: "Total cadastrados", valor: registros.length },
        { rotulo: "Em acompanhamento", valor: ativos }
    ].forEach(item => {
        const cartao = document.createElement("div");
        cartao.className = "indicador-modulo";
        const rotulo = document.createElement("span");
        rotulo.textContent = item.rotulo;
        const valor = document.createElement("strong");
        valor.textContent = item.valor;
        cartao.append(rotulo, valor);
        moduloResumo.appendChild(cartao);
    });

    listaModulo.replaceChildren();
    if (filtrados.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "vazio-modulo";
        const titulo = document.createElement("h3");
        titulo.textContent = consulta ? "Nenhum resultado encontrado" : "Ainda não há registros";
        const texto = document.createElement("p");
        texto.textContent = consulta
            ? "Tente buscar por outro termo."
            : `Use “Adicionar” para incluir o primeiro registro de ${configuracao.titulo.toLowerCase()}.`;
        vazio.append(titulo, texto);
        listaModulo.appendChild(vazio);
        return;
    }

    filtrados.forEach(registro => {
        const cartao = document.createElement("article");
        cartao.className = "registro-modulo";
        const cabecalho = document.createElement("div");
        cabecalho.className = "registro-modulo-cabecalho";
        const titulo = document.createElement("h3");
        const campoTitulo = configuracao.campos.find(campo => campo.titulo) || configuracao.campos[0];
        titulo.textContent = registro[campoTitulo.nome] || configuracao.titulo;
        cabecalho.appendChild(titulo);

        if (registro.status) {
            const status = document.createElement("span");
            status.className = "status-modulo";
            status.textContent = registro.status;
            cabecalho.appendChild(status);
        }
        cartao.appendChild(cabecalho);

        const detalhes = document.createElement("dl");
        detalhes.className = "registro-modulo-detalhes";
        configuracao.campos.forEach(campo => {
            const valor = registro[campo.nome];
            if (!valor || campo.titulo || campo.nome === "status") return;
            const linha = document.createElement("div");
            const rotulo = document.createElement("dt");
            rotulo.textContent = campo.rotulo;
            const conteudo = document.createElement("dd");
            conteudo.textContent = valor;
            linha.append(rotulo, conteudo);
            detalhes.appendChild(linha);
        });
        cartao.appendChild(detalhes);
        listaModulo.appendChild(cartao);
    });
}

document.querySelectorAll("[data-modulo]").forEach(botao => {
    botao.addEventListener("click", () => abrirModulo(botao.dataset.modulo));
});

document.querySelector('[data-tela="inicio"]').addEventListener("click", () => {
    moduloVisual.hidden = true;
    dashboardHome.hidden = false;
    atualizarMenuAtivo("inicio");
});

$("btnVoltarInicioModulo").addEventListener("click", () => {
    moduloVisual.hidden = true;
    dashboardHome.hidden = false;
    atualizarMenuAtivo("inicio");
});

$("btnNovoRegistro").addEventListener("click", () => {
    formularioModulo.hidden = false;
    formModulo.reset();
    formModulo.querySelector("input, select, textarea")?.focus();
});

$("btnCancelarModulo").addEventListener("click", fecharFormularioModulo);
buscaModulo.addEventListener("input", atualizarModulo);

formModulo.addEventListener("submit", evento => {
    evento.preventDefault();
    if (!moduloAtual) return;

    const registro = Object.fromEntries(new FormData(formModulo).entries());
    registrosDemonstracao[moduloAtual].unshift(registro);
    fecharFormularioModulo();
    atualizarModulo();
});

btnNovoDesafio.onclick = () => {
    editando = false;
    desafioSelecionado = null;
    formDesafio.reset();
    document.querySelector("#formularioDesafio h3").textContent = "Cadastrar desafio";
    listaDesafios.style.display = "none";
    detalhesDesafio.style.display = "none";
    formularioDesafio.style.display = "block";
};

btnCancelarDesafio.onclick = () => {
    formularioDesafio.style.display = "none";
    listaDesafios.style.display = "grid";
    formDesafio.reset();
};

async function carregarSecretarias() {
    const { data, error } = await supabaseClient
        .from("secretarias")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

    if (error) return alert("Não foi possível carregar as secretarias.");

    secretariaDesafio.innerHTML = '<option value="">Selecione uma secretaria</option>';

    data.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = s.nome;
        secretariaDesafio.appendChild(option);
    });
}

formDesafio.onsubmit = async e => {
    e.preventDefault();

    const dados = {
        titulo: $("tituloDesafio").value,
        descricao: $("descricaoDesafio").value,
        problema: $("problemaDesafio").value,
        objetivo: $("objetivoDesafio").value,
        secretaria_id: secretariaDesafio.value
    };

    let error;

    if (editando) {
        ({ error } = await supabaseClient
            .from("desafios")
            .update(dados)
            .eq("id", desafioSelecionado.id));
    } else {
        const { data: userData } = await supabaseClient.auth.getUser();

        if (!userData.user) return alert("Usuário não está autenticado.");

        ({ error } = await supabaseClient
            .from("desafios")
            .insert({
                ...dados,
                criado_por: userData.user.id
            }));
    }

    if (error) return alert("Erro ao salvar: " + error.message);

    alert(editando ? "Desafio atualizado com sucesso!" : "Desafio cadastrado com sucesso!");

    formDesafio.reset();
    editando = false;
    desafioSelecionado = null;
    formularioDesafio.style.display = "none";
    listaDesafios.style.display = "grid";
    await carregarDesafios();
};

async function carregarDesafios() {
    const { data, error } = await supabaseClient
        .from("desafios")
        .select(`
            id, titulo, descricao, problema, objetivo,
            status, created_at, secretaria_id,
            secretarias(nome)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        listaDesafios.innerHTML = "<p>Não foi possível carregar os desafios.</p>";
        return;
    }

    listaDesafios.innerHTML = "<h3>Desafios cadastrados</h3>";

    if (!data.length) {
        listaDesafios.innerHTML += "<p>Nenhum desafio cadastrado.</p>";
        return;
    }

    data.forEach(desafio => {
        const card = document.createElement("div");
        card.className = "resumo-card";
        card.innerHTML = `
            <span>${formatarStatus(desafio.status)}</span>
            <h3>${desafio.titulo}</h3>
            <p>${desafio.descricao}</p>
            <small>Secretaria: ${desafio.secretarias?.nome || "Não informada"}</small>
        `;
        card.onclick = () => abrirDetalhesDesafio(desafio);
        listaDesafios.appendChild(card);
    });
}

function abrirDetalhesDesafio(desafio) {
    desafioSelecionado = desafio;
    listaDesafios.style.display = "none";
    formularioDesafio.style.display = "none";
    detalhesDesafio.style.display = "block";

    $("detalhesTitulo").textContent = desafio.titulo;
    $("detalhesStatus").textContent = formatarStatus(desafio.status);
    $("detalhesSecretaria").textContent = desafio.secretarias?.nome || "Não informada";
    $("detalhesDescricao").textContent = desafio.descricao;
    $("detalhesProblema").textContent = desafio.problema;
    $("detalhesObjetivo").textContent = desafio.objetivo;
    $("detalhesData").textContent = new Date(desafio.created_at).toLocaleDateString("pt-BR");
}

btnEditarDesafio.onclick = () => {
    if (!desafioSelecionado) return;

    editando = true;
    detalhesDesafio.style.display = "none";
    formularioDesafio.style.display = "block";

    document.querySelector("#formularioDesafio h3").textContent = "Editar desafio";

    $("tituloDesafio").value = desafioSelecionado.titulo;
    $("descricaoDesafio").value = desafioSelecionado.descricao;
    $("problemaDesafio").value = desafioSelecionado.problema;
    $("objetivoDesafio").value = desafioSelecionado.objetivo;
    secretariaDesafio.value = desafioSelecionado.secretaria_id;
};

btnVoltarDesafios.onclick = () => {
    detalhesDesafio.style.display = "none";
    listaDesafios.style.display = "grid";
    carregarDesafios();
};

function formatarStatus(status) {
    return {
        RASCUNHO: "Rascunho",
        ABERTO: "Aberto",
        ENCERRADO: "Encerrado",
        ARQUIVADO: "Arquivado"
    }[status] || status;
}

btnSair.onclick = async () => {
    await supabaseClient.auth.signOut();
    usuarioAtual = null;
    dashboard.classList.remove("ativa");
    desafios.classList.remove("ativa");
    moduloVisual.hidden = true;
    dashboardHome.hidden = false;
    atualizarMenuAtivo("inicio");
    inicio.classList.add("ativa");
};