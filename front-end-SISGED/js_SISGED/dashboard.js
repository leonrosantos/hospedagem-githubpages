document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();

    const usuario = Sessao.obter();
    if (!usuario) return;

    const titulo = document.querySelector(".welcome h1");
    if (titulo) titulo.textContent = `Olá, ${usuario.nome}!`;

    const nomeTopo = document.querySelector(".user-info strong");
    const tipoTopo = document.querySelector(".user-info span");
    if (nomeTopo) nomeTopo.textContent = usuario.nome;
    if (tipoTopo) tipoTopo.textContent = usuario.tipo;

    const destinos = ["consultas.html", "consultas.html", "consultas.html", "relatorios.html"];
    document.querySelectorAll(".card a").forEach((link, indice) => {
        if (destinos[indice]) link.setAttribute("href", destinos[indice]);
    });

    // Botão "Sair" (caso exista um elemento .logout na página)
    document.querySelector(".logout")?.addEventListener("click", () => Sessao.limpar());
});
