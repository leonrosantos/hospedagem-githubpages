document.addEventListener("DOMContentLoaded", () => {
    // Só faz sentido chegar aqui logado. Se não tiver sessão, manda pro login.
    Sessao.exigirLogin();

    const form = document.getElementById("formTrocarSenha");
    if (!form) return;

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const senhaAtual = document.getElementById("senhaAtual").value.trim();
        const novaSenha = document.getElementById("novaSenha").value.trim();
        const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            alert("Preencha todos os campos.");
            return;
        }

        if (novaSenha.length < 8) {
            alert("A nova senha precisa ter pelo menos 8 caracteres.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            alert("A confirmação não é igual à nova senha.");
            return;
        }

        const botao = form.querySelector(".btn-login");
        botao.disabled = true;
        botao.textContent = "Salvando...";

        try {
            await apiFetch("/auth/trocar-senha", {
                method: "POST",
                body: JSON.stringify({
                    senha_atual: senhaAtual,
                    nova_senha: novaSenha
                })
            });

            // Atualiza a sessão local pra não cair de novo nessa tela.
            const usuario = Sessao.obter();
            if (usuario) {
                usuario.deveTrocarSenha = false;
                Sessao.salvar(usuario);
            }

            alert("Senha alterada com sucesso!");
            window.location.href = "dashboard.html";

        } catch (erro) {
            alert(erro.message || "Não foi possível trocar a senha.");
        } finally {
            botao.disabled = false;
            botao.textContent = "Trocar senha e continuar";
        }
    });
});
