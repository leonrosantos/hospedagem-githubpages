// ========================================
// SISGED - Modo Escuro
// Aplica o tema salvo assim que a página carrega
// e controla o botão de alternância na topbar.
// ========================================

(function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("sisged-theme");
    if (temaSalvo === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    criarBotaoAlternar();
});

function criarBotaoAlternar() {
    if (document.getElementById("btnAlternarTema")) return;

    // O site tem duas estruturas de topbar diferentes entre as
    // páginas (.user-area em algumas, #net-user em outras). Tenta as
    // duas, e por último cai no <header> como último recurso.
    const userArea = document.querySelector(".user-area");
    const netUser = document.getElementById("net-user");
    const header = document.querySelector("header");

    const botao = document.createElement("button");
    botao.id = "btnAlternarTema";
    botao.className = "theme-toggle";
    botao.type = "button";
    atualizarTextoBotao(botao);

    botao.addEventListener("click", (evento) => {
        evento.preventDefault();
        const estaEscuro = document.documentElement.getAttribute("data-theme") === "dark";

        if (estaEscuro) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("sisged-theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("sisged-theme", "dark");
        }

        atualizarTextoBotao(botao);
    });

    if (userArea) {
        userArea.prepend(botao);
    } else if (netUser && netUser.parentElement) {
        netUser.parentElement.insertBefore(botao, netUser);
    } else if (header) {
        header.appendChild(botao);
    }
}

function atualizarTextoBotao(botao) {
    const estaEscuro = document.documentElement.getAttribute("data-theme") === "dark";
    botao.textContent = estaEscuro ? "☀️ Claro" : "🌙 Escuro";
}
