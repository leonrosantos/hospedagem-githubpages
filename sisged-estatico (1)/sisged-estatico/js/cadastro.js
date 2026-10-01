const CONFIG_CADASTROS = {
    cursos: {
        titulo: "Cursos",
        api: true,
        endpoint: "/cursos",
        idField: "idCurso",
        campos: [
            { id: "nomeCurso", label: "Nome do curso", tipo: "text" },
            { id: "modalidadeCurso", label: "Modalidade", tipo: "text" },
            { id: "cargahorariaCurso", label: "Carga horária (h)", tipo: "number" }
        ]
    },
    instrutores: {
        titulo: "Instrutores",
        api: true,
        endpoint: "/instrutores",
        idField: "idInstrutor",
        campos: [
            { id: "nomeInstrutor", label: "Nome completo", tipo: "text" },
            { id: "cpfInstrutor", label: "CPF (somente números)", tipo: "text" },
            { id: "emailInstrutor", label: "E-mail", tipo: "email" },
            { id: "telefoneInstrutor", label: "Telefone", tipo: "text" },
            { id: "areaInstrutor", label: "Área", tipo: "text" }
        ]
    },
    salas: {
        titulo: "Salas",
        api: true,
        endpoint: "/salas",
        idField: "idSala",
        campos: [
            { id: "nomeSala", label: "Nome da sala", tipo: "text" },
            { id: "capacidadeSala", label: "Capacidade", tipo: "number" },
            { id: "tipoAula", label: "Tipo", tipo: "text" },
            { id: "blocoandarAula", label: "Bloco/Andar", tipo: "text" }
        ]
    },
    modalidades: {
        titulo: "Modalidades",
        campos: [{ id: "nome", label: "Nome da modalidade", tipo: "text" }]
    },
    areas: {
        titulo: "Áreas",
        campos: [{ id: "nome", label: "Nome da área", tipo: "text" }]
    },
    turmas: {
        titulo: "Turmas",
        api: true,
        endpoint: "/turmas",
        idField: "idTurma",
        campos: [
            { id: "codigoTurma", label: "Código da turma", tipo: "number" },
            { id: "turnoTurma", label: "Turno", tipo: "text" },
            { id: "datainicioTurma", label: "Data de início", tipo: "date" },
            { id: "datafimTurma", label: "Data de fim", tipo: "date" }
        ]
    },
    feriados: {
        titulo: "Feriados",
        campos: [
            { id: "data", label: "Data", tipo: "date" },
            { id: "descricao", label: "Descrição", tipo: "text" }
        ]
    },
    atividades: {
        titulo: "Atividades",
        campos: [
            { id: "nome", label: "Nome da atividade", tipo: "text" },
            { id: "turma", label: "Turma", tipo: "text" },
            { id: "data", label: "Data", tipo: "date" }
        ]
    }
};

const CHAVE_STORAGE_CADASTRO = "netnucleo_cadastros";

document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();
    preencherTopbar();

    const botoes = document.querySelectorAll(".cad-menu");
    const area = document.getElementById("areaCadastro");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            renderizarCadastro(botao.dataset.cadastro, area);
        });
    });
});

function obterDadosStorage() {
    const dados = localStorage.getItem(CHAVE_STORAGE_CADASTRO);
    return dados ? JSON.parse(dados) : {};
}

function salvarDadosStorage(dados) {
    localStorage.setItem(CHAVE_STORAGE_CADASTRO, JSON.stringify(dados));
}

function obterRegistrosLocais(tipo) {
    const storage = obterDadosStorage();
    if (storage[tipo]) return storage[tipo];
    return (DB[tipo] || []).slice();
}

async function carregarRegistros(tipo, config) {
    if (config.api) {
        const resposta = await apiFetch(config.endpoint);
        return (resposta && resposta.data) ? resposta.data : [];
    }
    return obterRegistrosLocais(tipo);
}

async function renderizarCadastro(tipo, area) {
    const config = CONFIG_CADASTROS[tipo];
    if (!config || !area) return;

    area.innerHTML = `<p>Carregando...</p>`;

    let registros = [];
    let erroCarregar = "";

    try {
        registros = await carregarRegistros(tipo, config);
    } catch (erro) {
        erroCarregar = "Não foi possível carregar os dados do servidor.";
    }

    area.innerHTML = `
        <div class="cadastro-header">
            <h2>${config.titulo}</h2>
        </div>

        ${erroCarregar ? `<p class="erro-campo" style="color:#e74c3c;">${erroCarregar}</p>` : ""}
        <div id="mensagemCadastro"></div>

        <form class="cadastro-form" id="formCadastro">
            ${config.campos.map(c => `
                <div class="form-group">
                    <label for="campo_${c.id}">${c.label}</label>
                    <input type="${c.tipo}" id="campo_${c.id}" name="${c.id}" required>
                </div>
            `).join("")}
            <button type="submit" class="btn-salvar">Adicionar</button>
        </form>

        <table class="cadastro-tabela" id="tabelaCadastro">
            <thead>
                <tr>
                    ${config.campos.map(c => `<th>${c.label}</th>`).join("")}
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${gerarLinhasTabela(registros, config)}
            </tbody>
        </table>
    `;

    document.getElementById("formCadastro").addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const botaoSalvar = evento.target.querySelector(".btn-salvar");
        const formData = new FormData(evento.target);
        const novoRegistro = {};
        config.campos.forEach(c => novoRegistro[c.id] = formData.get(c.id));

        const mensagemDiv = document.getElementById("mensagemCadastro");
        mensagemDiv.innerHTML = "";

        if (config.api) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = "Salvando...";
            try {
                await apiFetch(config.endpoint, {
                    method: "POST",
                    body: JSON.stringify(novoRegistro)
                });
                renderizarCadastro(tipo, area);
            } catch (erro) {
                const dados = erro.dados;
                let texto = (dados && dados.message) || "Erro ao salvar. Confira os dados e tente de novo.";
                if (dados && dados.errors) {
                    texto = Object.values(dados.errors).flat().join(" ");
                }
                mensagemDiv.innerHTML = `<p class="erro-campo" style="color:#e74c3c;">${texto}</p>`;
                botaoSalvar.disabled = false;
                botaoSalvar.textContent = "Adicionar";
            }
            return;
        }

        novoRegistro.id = Date.now();
        const storage = obterDadosStorage();
        const listaAtual = obterRegistrosLocais(tipo);
        listaAtual.push(novoRegistro);
        storage[tipo] = listaAtual;
        salvarDadosStorage(storage);

        renderizarCadastro(tipo, area);
    });

    area.querySelectorAll(".btn-excluir").forEach(botao => {
        botao.addEventListener("click", async () => {
            if (config.api) {
                const id = botao.dataset.id;
                try {
                    await apiFetch(`${config.endpoint}/${id}`, { method: "DELETE" });
                    renderizarCadastro(tipo, area);
                } catch (erro) {
                    alert("Não foi possível excluir esse registro.");
                }
                return;
            }

            const id = Number(botao.dataset.id);
            const storage = obterDadosStorage();
            const listaAtual = obterRegistrosLocais(tipo).filter(r => r.id !== id);
            storage[tipo] = listaAtual;
            salvarDadosStorage(storage);
            renderizarCadastro(tipo, area);
        });
    });
}

function gerarLinhasTabela(registros, config) {
    if (!registros.length) {
        return `<tr><td colspan="${config.campos.length + 1}">Nenhum registro cadastrado.</td></tr>`;
    }
    const idKey = config.api ? config.idField : "id";
    return registros.map(registro => `
        <tr>
            ${config.campos.map(c => `<td>${registro[c.id] ?? "—"}</td>`).join("")}
            <td><button type="button" class="btn-excluir" data-id="${registro[idKey]}">Excluir</button></td>
        </tr>
    `).join("");
}