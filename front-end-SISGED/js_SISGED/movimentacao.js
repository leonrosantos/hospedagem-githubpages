const CONFIG_MOVIMENTACOES = {
    aula: {
        titulo: "Lançamento de Aula",
        campos: [
            { id: "turma", label: "Turma", tipo: "text" },
            { id: "data", label: "Data", tipo: "date" },
            { id: "conteudo", label: "Conteúdo ministrado", tipo: "text" }
        ]
    },
    atividade: {
        titulo: "Lançamento de Atividades",
        campos: [
            { id: "turma", label: "Turma", tipo: "text" },
            { id: "atividade", label: "Atividade", tipo: "text" },
            { id: "data", label: "Data", tipo: "date" }
        ]
    },
    programacao: {
        titulo: "Programação de Turmas",
        campos: [
            { id: "turma", label: "Turma", tipo: "text" },
            { id: "inicio", label: "Data de início", tipo: "date" },
            { id: "turno", label: "Turno", tipo: "text" }
        ]
    },
    ocorrencia: {
        titulo: "Ocorrências",
        campos: [
            { id: "turma", label: "Turma", tipo: "text" },
            { id: "data", label: "Data", tipo: "date" },
            { id: "descricao", label: "Descrição", tipo: "text" }
        ]
    }
};

const CHAVE_STORAGE_MOV = "netnucleo_movimentacoes";

document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();
    preencherTopbar();
    const area = document.getElementById("areaMovimentacao");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            renderizarMovimentacao(botao.dataset.mov, area);
        });
    });
});

function obterMovStorage() {
    const dados = localStorage.getItem(CHAVE_STORAGE_MOV);
    return dados ? JSON.parse(dados) : {};
}

function salvarMovStorage(dados) {
    localStorage.setItem(CHAVE_STORAGE_MOV, JSON.stringify(dados));
}

function renderizarMovimentacao(tipo, area) {
    const config = CONFIG_MOVIMENTACOES[tipo];
    if (!config || !area) return;

    const storage = obterMovStorage();
    const registros = storage[tipo] || [];

    area.innerHTML = `
        <div class="movimentacao-header">
            <h2>${config.titulo}</h2>
        </div>

        <form class="movimentacao-form" id="formMovimentacao">
            ${config.campos.map(c => `
                <div class="form-group">
                    <label for="mov_${c.id}">${c.label}</label>
                    <input type="${c.tipo}" id="mov_${c.id}" name="${c.id}" required>
                </div>
            `).join("")}
            <button type="submit" class="btn-lancar">Lançar</button>
        </form>

        <table class="movimentacao-tabela" id="tabelaMovimentacao">
            <thead>
                <tr>${config.campos.map(c => `<th>${c.label}</th>`).join("")}</tr>
            </thead>
            <tbody>
                ${registros.length
                    ? registros.map(r => `<tr>${config.campos.map(c => `<td>${r[c.id] ?? "—"}</td>`).join("")}</tr>`).join("")
                    : `<tr><td colspan="${config.campos.length}">Nenhum lançamento realizado.</td></tr>`}
            </tbody>
        </table>
    `;

    document.getElementById("formMovimentacao").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const formData = new FormData(evento.target);
        const novoRegistro = {};
        config.campos.forEach(c => novoRegistro[c.id] = formData.get(c.id));

        const storageAtual = obterMovStorage();
        const listaAtual = storageAtual[tipo] || [];
        listaAtual.push(novoRegistro);
        storageAtual[tipo] = listaAtual;
        salvarMovStorage(storageAtual);

        renderizarMovimentacao(tipo, area);
    });
}
