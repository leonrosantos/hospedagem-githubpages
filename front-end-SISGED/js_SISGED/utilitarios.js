const SYSLOG_MOCK = [
    { data: "2026-08-20 08:12", usuario: "carlos.andrade", acao: "Login realizado" },
    { data: "2026-08-20 09:45", usuario: "fernanda.lima", acao: "Cadastro de turma criado" },
    { data: "2026-08-19 17:30", usuario: "rodrigo.souza", acao: "Relatório exportado" }
];

const LIBERACAO_MOCK = [
    { id: 1, usuario: "joao.martins", situacao: "Aguardando liberação" },
    { id: 2, usuario: "larissa.costa", situacao: "Aguardando liberação" }
];

document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();
    preencherTopbar();
    const area = document.getElementById("areaUtilitarios");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            renderizarUtilitario(botao.dataset.util, area);
        });
    });
});

function renderizarUtilitario(tipo, area) {
    if (!area) return;

    const renderizadores = {
        parametros: renderParametros,
        syslog: renderSyslog,
        liberacao: renderLiberacao,
        senha: renderTrocaSenha,
        telefonica: renderTelefonica
    };

    renderizadores[tipo]?.(area);
}

function renderParametros(area) {
    area.innerHTML = `
        <h2>Parâmetros do Sistema</h2>
        <form class="util-form" id="formParametros">
            <div class="form-group">
                <label for="nomeSistema">Nome do sistema</label>
                <input type="text" id="nomeSistema" value="NetNúcleo">
            </div>
            <div class="form-group">
                <label for="tempoSessao">Tempo de sessão (minutos)</label>
                <input type="number" id="tempoSessao" value="30" min="5">
            </div>
            <button type="submit" class="btn-salvar">Salvar parâmetros</button>
        </form>
        <p id="msgParametros" style="display:none; color:#2ecc71;">Parâmetros salvos com sucesso.</p>
    `;

    document.getElementById("formParametros").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const msg = document.getElementById("msgParametros");
        msg.style.display = "block";
        setTimeout(() => msg.style.display = "none", 3000);
    });
}

function renderSyslog(area) {
    area.innerHTML = `
        <h2>Syslog</h2>
        <table class="util-tabela">
            <thead><tr><th>Data</th><th>Usuário</th><th>Ação</th></tr></thead>
            <tbody>
                ${SYSLOG_MOCK.map(l => `<tr><td>${l.data}</td><td>${l.usuario}</td><td>${l.acao}</td></tr>`).join("")}
            </tbody>
        </table>
    `;
}

function renderLiberacao(area) {
    area.innerHTML = `
        <h2>Liberação de Usuários</h2>
        <table class="util-tabela" id="tabelaLiberacao">
            <thead><tr><th>Usuário</th><th>Situação</th><th>Ações</th></tr></thead>
            <tbody>
                ${LIBERACAO_MOCK.map(u => `
                    <tr data-id="${u.id}">
                        <td>${u.usuario}</td>
                        <td>${u.situacao}</td>
                        <td>
                            <button type="button" class="btn-aprovar" data-id="${u.id}">Aprovar</button>
                            <button type="button" class="btn-recusar" data-id="${u.id}">Recusar</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    area.querySelectorAll(".btn-aprovar, .btn-recusar").forEach(botao => {
        botao.addEventListener("click", () => {
            const linha = botao.closest("tr");
            const aprovado = botao.classList.contains("btn-aprovar");
            linha.querySelector("td:nth-child(2)").textContent = aprovado ? "Liberado" : "Recusado";
            linha.querySelectorAll("button").forEach(b => b.disabled = true);
        });
    });
}

function renderTrocaSenha(area) {
    area.innerHTML = `
        <h2>Troca de Senha</h2>
        <form class="util-form" id="formSenha">
            <div class="form-group">
                <label for="senhaAtual">Senha atual</label>
                <input type="password" id="senhaAtual" required>
            </div>
            <div class="form-group">
                <label for="senhaNova">Nova senha</label>
                <input type="password" id="senhaNova" required minlength="6">
            </div>
            <div class="form-group">
                <label for="senhaConfirma">Confirmar nova senha</label>
                <input type="password" id="senhaConfirma" required minlength="6">
            </div>
            <button type="submit" class="btn-salvar">Alterar senha</button>
        </form>
        <p id="msgSenha" style="display:none;"></p>
    `;

    document.getElementById("formSenha").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const nova = document.getElementById("senhaNova").value;
        const confirma = document.getElementById("senhaConfirma").value;
        const msg = document.getElementById("msgSenha");

        if (nova !== confirma) {
            msg.textContent = "As senhas não coincidem.";
            msg.style.color = "#e74c3c";
        } else {
            msg.textContent = "Senha alterada com sucesso.";
            msg.style.color = "#2ecc71";
            evento.target.reset();
        }
        msg.style.display = "block";
    });
}

function renderTelefonica(area) {
    area.innerHTML = `
        <h2>Lista Telefônica</h2>
        <input type="search" id="filtroTelefonica" placeholder="Buscar por nome...">
        <table class="util-tabela" id="tabelaTelefonica">
            <thead><tr><th>Nome</th><th>Ramal</th></tr></thead>
            <tbody>
                ${DB.telefonica.map(t => `<tr><td>${t.nome}</td><td>${t.ramal}</td></tr>`).join("")}
            </tbody>
        </table>
    `;

    document.getElementById("filtroTelefonica").addEventListener("input", (evento) => {
        const termo = evento.target.value.toLowerCase();
        document.querySelectorAll("#tabelaTelefonica tbody tr").forEach(tr => {
            tr.style.display = tr.textContent.toLowerCase().includes(termo) ? "" : "none";
        });
    });
}
