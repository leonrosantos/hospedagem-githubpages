document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();
    preencherTopbar();

    preencherSelect("tipo-relatorio", [
        "Frequência por turma", "Desempenho por aluno", "Ocorrências", "Programação de turmas"
    ]);
    preencherSelect("turma", DB.turmas.map(t => t.nome));
    preencherSelect("disciplina", DB.disciplinas.map(d => d.nome), "Todas as Disciplinas");
    preencherSelect("periodo", ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"]);

    document.querySelector(".generate-button").addEventListener("click", gerarRelatorio);
    document.querySelector(".clear-button").addEventListener("click", limparFiltros);
    document.querySelector(".export-button").addEventListener("click", exportarPdf);
});

function preencherSelect(id, itens, textoPrimeiraOpcao) {
    const select = document.getElementById(id);
    if (!select) return;

    itens.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });

    if (textoPrimeiraOpcao) select.options[0].textContent = textoPrimeiraOpcao;
}

function gerarRelatorio() {
    const tipo = document.getElementById("tipo-relatorio").value;
    const nomeBusca = document.getElementById("aluno").value.trim().toLowerCase();
    const resultado = document.querySelector(".report-result");

    if (!tipo) {
        resultado.innerHTML = `
            <div class="result-icon">││</div>
            <h2>Selecione um tipo de relatório</h2>
            <p>É necessário escolher o tipo de relatório antes de gerar.</p>
        `;
        return;
    }

    const alunos = DB.alunos.filter(a =>
        !nomeBusca || a.nome.toLowerCase().includes(nomeBusca) || a.matricula.includes(nomeBusca)
    );

    resultado.innerHTML = `
        <h2>${tipo}</h2>
        <table class="relatorio-tabela">
            <thead><tr><th>Matrícula</th><th>Aluno</th><th>Turma</th></tr></thead>
            <tbody>
                ${alunos.length
                    ? alunos.map(a => `<tr><td>${a.matricula}</td><td>${a.nome}</td><td>${a.turma}</td></tr>`).join("")
                    : `<tr><td colspan="3">Nenhum aluno encontrado para os filtros selecionados.</td></tr>`}
            </tbody>
        </table>
    `;
}

function limparFiltros() {
    document.querySelectorAll(".report-filters select").forEach(select => select.selectedIndex = 0);
    document.getElementById("aluno").value = "";

    document.querySelector(".report-result").innerHTML = `
        <div class="result-icon">││</div>
        <h2>Nenhum relatório gerado</h2>
        <p>Selecione os filtros acima e clique em "Gerar Relatório" para visualizar os resultados.</p>
    `;
}

function exportarPdf() {
    window.print();
}
