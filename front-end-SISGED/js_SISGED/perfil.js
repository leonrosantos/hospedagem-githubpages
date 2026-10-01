document.addEventListener("DOMContentLoaded", () => {
    Sessao.exigirLogin();

    const usuario = Sessao.obter();
    if (!usuario) return;

    document.getElementById("nomeTopo").textContent = usuario.nome;
    document.getElementById("tipoTopo").textContent = usuario.tipo;

    document.getElementById("avatar").textContent = usuario.nome.charAt(0).toUpperCase();
    document.getElementById("nomeUsuario").textContent = usuario.nome;
    document.getElementById("cargoUsuario").textContent = usuario.tipo;

    document.getElementById("nome").textContent = usuario.nome;
    document.getElementById("usuario").textContent = usuario.usuario;
    document.getElementById("email").textContent = `${usuario.usuario}@netnucleo.edu`;
    document.getElementById("telefone").textContent = "—";

    document.getElementById("tipoUsuario").textContent = usuario.tipo;
    document.getElementById("unidade").textContent = usuario.unidade;
    document.getElementById("ultimoAcesso").textContent = usuario.ultimoAcesso;

    document.querySelector(".btn-sair")?.addEventListener("click", () => Sessao.limpar());
});
