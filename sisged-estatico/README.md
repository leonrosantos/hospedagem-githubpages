# SISGED — versão sem JavaScript

HTML + CSS puros. **Nenhum arquivo `.js`.** Abra `index.html` (ou `dashboard.html`) direto no navegador, sem servidor.

## O que continua funcionando (só com CSS)
- Navegação entre as páginas e os menus laterais (Consultas, Cadastro, Movimentação, Utilitários): cada item é um botão de rádio escondido + `label`, e o CSS (`:has()`) mostra o painel marcado.
- **Consulta de Horário (aulas):** filtros por data, instrutor e sala funcionam, inclusive combinados; "Limpar filtros" é um `<button type="reset">`.
- **Relatórios:** escolher o tipo mostra o relatório; o filtro de turma funciona; "Limpar Filtros" também.
- Tabelas de consulta, cadastros existentes, syslog, lista telefônica, perfil e dashboard.
- Modo escuro: automático, segue o tema do sistema/navegador (`prefers-color-scheme`).

## O que não dá para fazer sem JavaScript
- **Login e troca de senha:** removidos. O site abre direto como administrador (`login.html` e `trocar-senha.html` saíram).
- **Salvar dados:** Cadastro, Movimentação, Parâmetros e Troca de senha mostram o formulário desativado, só como ilustração. Também não há botão Excluir nem Aprovar/Recusar.
- Busca por texto (filtrar tabelas, buscar aluno), botão "Exportar PDF" (use Ctrl+P) e VLibras.
- Os dados exibidos são os de exemplo, fixos no HTML.

Requer um navegador recente (Chrome/Edge 105+, Safari 15.4+, Firefox 121+) por causa do `:has()`.
