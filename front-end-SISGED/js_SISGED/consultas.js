// ========================================
// Consultas com dados MOCK (ainda não conectadas à API real)
// ========================================
const CONFIG_CONSULTAS_MOCK = {
    instrutor: {
        titulo: "Consulta de Instrutor",
        colunas: ["Nome", "Área", "E-mail"],
        linhas: () => DB.instrutores.map(i => [i.nome, i.area, i.email])
    },
    "instrutor-calendario": {
        titulo: "Calendário do Instrutor",
        colunas: ["Instrutor", "Turma", "Turno"],
        linhas: () => DB.turmas.map(t => [t.instrutor, t.nome, t.turno])
    },
    sala: {
        titulo: "Consulta de Sala",
        colunas: ["Sala", "Capacidade", "Tipo"],
        linhas: () => DB.salas.map(s => [s.nome, s.capacidade, s.tipo])
    },
    "sala-calendario": {
        titulo: "Calendário de Sala",
        colunas: ["Sala", "Turma", "Turno"],
        linhas: () => DB.turmas.map(t => [t.sala, t.nome, t.turno])
    },
    "materias-turma": {
        titulo: "Matérias por Turma",
        colunas: ["Turma", "Curso", "Disciplina"],
        linhas: () => DB.turmas.map(t => [t.nome, t.curso, DB.disciplinas[0]?.nome ?? "—"])
    },
    "materias-lancar": {
        titulo: "Matérias a Lançar",
        colunas: ["Turma", "Disciplina", "Situação"],
        linhas: () => DB.turmas.map(t => [t.nome, DB.disciplinas[1]?.nome ?? "—", "Pendente"])
    },
    programacao: {
        titulo: "Programação de Turmas",
        colunas: ["Turma", "Curso", "Início", "Turno"],
        linhas: () => DB.turmas.map(t => [t.nome, t.curso, "—", t.turno])
    },
    ocorrencias: {
        titulo: "Ocorrências",
        colunas: ["Turma", "Data", "Descrição"],
        linhas: () => DB.ocorrencias.map(o => [o.turma, formatarData(o.data), o.descricao])
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();
    preencherTopbar();

    const botoes = document.querySelectorAll(".consulta-menu");
    const area = document.getElementById("areaConsulta");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");

            if (botao.dataset.consulta === "horario") {
                renderizarConsultaAulas(area);
            } else {
                renderizarConsultaMock(botao.dataset.consulta, area);
            }
        });
    });
});

// ========================================
// Consulta de AULAS (dados reais da API), com filtro combinado
// por data + instrutor + sala.
// ========================================
async function renderizarConsultaAulas(area) {
    area.innerHTML = `<p>Carregando aulas...</p>`;

    let instrutores = [];
    let salas = [];

    try {
        [instrutores, salas] = await Promise.all([
            apiFetch("/instrutores?per_page=100").then(r => r.data ?? r),
            apiFetch("/salas?per_page=100").then(r => r.data ?? r)
        ]);
    } catch (erro) {
        // Se não conseguir carregar os filtros, a consulta ainda
        // funciona, só fica sem as opções nos selects.
    }

    area.innerHTML = `
        <div class="consulta-header">
            <h2>Consulta de Aulas</h2>
            <div class="consulta-filtro">
                <input type="date" id="filtroData" title="Filtrar por data">

                <select id="filtroInstrutor">
                    <option value="">Todos os instrutores</option>
                    ${instrutores.map(i => `<option value="${i.idInstrutor}">${i.nomeInstrutor}</option>`).join("")}
                </select>

                <select id="filtroSala">
                    <option value="">Todas as salas</option>
                    ${salas.map(s => `<option value="${s.idSala}">${s.nomeSala}</option>`).join("")}
                </select>

                <button type="button" id="btnLimparFiltros" class="btn-secundario">Limpar filtros</button>
            </div>
        </div>
        <table class="consulta-tabela" id="tabelaConsulta">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Turma</th>
                    <th>Instrutor(es)</th>
                    <th>Sala(s)</th>
                    <th>Tipo</th>
                </tr>
            </thead>
            <tbody id="corpoTabelaAulas">
                <tr><td colspan="6">Carregando...</td></tr>
            </tbody>
        </table>
    `;

    document.getElementById("filtroData").addEventListener("change", () => buscarAulasFiltradas());
    document.getElementById("filtroInstrutor").addEventListener("change", () => buscarAulasFiltradas());
    document.getElementById("filtroSala").addEventListener("change", () => buscarAulasFiltradas());
    document.getElementById("btnLimparFiltros").addEventListener("click", () => {
        document.getElementById("filtroData").value = "";
        document.getElementById("filtroInstrutor").value = "";
        document.getElementById("filtroSala").value = "";
        buscarAulasFiltradas();
    });

    buscarAulasFiltradas();
}

async function buscarAulasFiltradas() {
    const corpo = document.getElementById("corpoTabelaAulas");
    if (!corpo) return;

    const data = document.getElementById("filtroData").value;
    const instrutorId = document.getElementById("filtroInstrutor").value;
    const salaId = document.getElementById("filtroSala").value;

    const parametros = new URLSearchParams();
    if (data) parametros.set("data", data);
    if (instrutorId) parametros.set("instrutor_id", instrutorId);
    if (salaId) parametros.set("sala_id", salaId);

    corpo.innerHTML = `<tr><td colspan="6">Buscando...</td></tr>`;

    try {
        const resposta = await apiFetch("/aulas?" + parametros.toString());
        const aulas = resposta.data ?? resposta;

        if (!aulas.length) {
            corpo.innerHTML = `<tr><td colspan="6">Nenhuma aula encontrada com esses filtros.</td></tr>`;
            return;
        }

        corpo.innerHTML = aulas.map(a => `
            <tr>
                <td>${formatarData(a.dataAula)}</td>
                <td>${(a.horarioinicioAula ?? "—")} - ${(a.horariofimAula ?? "—")}</td>
                <td>${a.turma ?? "—"}</td>
                <td>${(a.instrutores ?? []).join(", ") || "—"}</td>
                <td>${(a.salas ?? []).join(", ") || "—"}</td>
                <td>${a.tipoAula ?? "—"}</td>
            </tr>
        `).join("");

    } catch (erro) {
        corpo.innerHTML = `<tr><td colspan="6">Não foi possível carregar as aulas.</td></tr>`;
    }
}

// ========================================
// Consultas antigas (dados mock), sem mudanças de comportamento
// ========================================
function renderizarConsultaMock(tipo, area) {
    const config = CONFIG_CONSULTAS_MOCK[tipo];
    if (!config) return;

    const linhas = config.linhas();

    area.innerHTML = `
        <div class="consulta-header">
            <h2>${config.titulo}</h2>
            <div class="consulta-filtro">
                <input type="search" id="filtroConsulta" placeholder="Filtrar resultados...">
            </div>
        </div>
        <table class="consulta-tabela" id="tabelaConsulta">
            <thead>
                <tr>${config.colunas.map(c => `<th>${c}</th>`).join("")}</tr>
            </thead>
            <tbody>
                ${linhas.length
                    ? linhas.map(linha => `<tr>${linha.map(v => `<td>${v}</td>`).join("")}</tr>`).join("")
                    : `<tr><td colspan="${config.colunas.length}">Nenhum registro encontrado.</td></tr>`}
            </tbody>
        </table>
    `;

    document.getElementById("filtroConsulta").addEventListener("input", (e) => {
        const termo = e.target.value.trim().toLowerCase();
        document.querySelectorAll("#tabelaConsulta tbody tr").forEach(tr => {
            tr.style.display = tr.textContent.toLowerCase().includes(termo) ? "" : "none";
        });
    });
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}
