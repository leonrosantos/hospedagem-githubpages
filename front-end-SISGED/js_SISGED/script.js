function mostrarSenha() {
    const campoSenha = document.getElementById("senha");
    const tipoAtual = campoSenha.getAttribute("type");
    campoSenha.setAttribute("type", tipoAtual === "password" ? "text" : "password");
}

// Configuração de cada tipo de login: qual rota chamar, quais nomes de
// campo a API espera, e como ler nome/objeto da resposta.
const CONFIG_LOGIN = {
    administrador: {
        rota: "/auth/administrador/login",
        campoEmail: "emailAdministrador",
        campoSenha: "senhaAdministrador",
        chaveResposta: "administrador",
        campoNome: "usuarioAdministrador",
        label: "Administrador"
    },
    aluno: {
        rota: "/auth/aluno/login",
        campoEmail: "emailAluno",
        campoSenha: "senhaAluno",
        chaveResposta: "aluno",
        campoNome: "nomeAluno",
        label: "Aluno"
    },
    instrutor: {
        rota: "/auth/instrutor/login",
        campoEmail: "emailInstrutor",
        campoSenha: "senhaInstrutor",
        chaveResposta: "instrutor",
        campoNome: "nomeInstrutor",
        label: "Instrutor"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-form");
    if (!form) return;

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const tipoUsuario = document.getElementById("tipoUsuario").value;
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        limparErros(form);
        let valido = true;

        if (!email) {
            exibirErro("email", "Informe seu e-mail.");
            valido = false;
        }
        if (!senha) {
            exibirErro("senha", "Informe sua senha.");
            valido = false;
        }

        if (!valido) return;

        const config = CONFIG_LOGIN[tipoUsuario];
        const botao = form.querySelector(".btn-login");
        botao.disabled = true;
        botao.textContent = "Entrando...";

        try {
            const corpo = {
                [config.campoEmail]: email,
                [config.campoSenha]: senha
            };

            const resposta = await fetch(API_BASE + config.rota, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(corpo)
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                exibirErro("senha", dados.message || "E-mail ou senha inválidos.");
                return;
            }

            const usuarioApi = dados[config.chaveResposta];

            Sessao.salvar({
                nome: usuarioApi[config.campoNome],
                email,
                tipo: config.label,
                token: dados.token,
                deveTrocarSenha: !!dados.deve_trocar_senha,
                ultimoAcesso: new Date().toLocaleString("pt-BR")
            });

            // Se a senha ainda é a padrão, manda direto pra tela de
            // troca de senha, antes de liberar qualquer outra página.
            window.location.href = dados.deve_trocar_senha
                ? "trocar-senha.html"
                : "dashboard.html";

        } catch (erro) {
            exibirErro("senha", "Não foi possível conectar ao servidor.");
        } finally {
            botao.disabled = false;
            botao.textContent = "Entrar no Sistema";
        }
    });
});

function exibirErro(idCampo, mensagem) {
    const campo = document.getElementById(idCampo);
    const grupo = campo.closest(".form-group");

    const erro = document.createElement("span");
    erro.className = "erro-campo";
    erro.textContent = mensagem;
    erro.style.color = "#e74c3c";
    erro.style.fontSize = "0.85rem";
    erro.style.display = "block";
    erro.style.marginTop = "4px";

    grupo.appendChild(erro);
    campo.setAttribute("aria-invalid", "true");
}

function limparErros(form) {
    form.querySelectorAll(".erro-campo").forEach(el => el.remove());
    form.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
}
