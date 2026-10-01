# SISGED — versão estática

Mesmo site do SISGED (login, dashboard, consultas, cadastro, movimentação, relatórios, perfil, utilitários), mas **sem servidor**: nada de PHP, Laravel, MySQL ou `php artisan serve`. São só arquivos HTML, CSS e JS.

## Como abrir

- **Mais simples:** dê dois cliques em `index.html` (ou `login.html`). Funciona direto no navegador.
- **Ou, com um servidor local qualquer** (opcional): dentro da pasta, rode `python -m http.server 8000` e abra `http://localhost:8000`.
- **Para publicar:** é só subir a pasta inteira no GitHub Pages, Netlify, etc.

## Logins de exemplo

| Tipo          | E-mail                          | Senha          |
|---------------|---------------------------------|----------------|
| Administrador | `admin@sisged.com`              | `admin123`     |
| Instrutor     | `carlos.andrade@netnucleo.edu`  | `Instrutor@123`|
| Aluno         | `ana.souza@sisged.com`          | `Aluno@123`    |

- Aluno e instrutor entram com a **senha padrão** e são mandados para a tela de troca de senha no primeiro acesso (mínimo de 8 caracteres), igual ao sistema original.
- A senha do administrador do banco original está criptografada (bcrypt) e não dá para recuperá-la, por isso `admin123` é uma senha nova, só para esta versão de demonstração.
- Instrutores e alunos criados no Cadastro também começam com a senha padrão (`Instrutor@123` / `Aluno@123`).

## Como os dados funcionam

O site original chama a API `/api/v1/...`. Aqui o arquivo `js/db.js` faz o papel dessa API dentro do navegador: mesmas rotas, mesmos nomes de campos, mesmas validações (CPF com 11 dígitos, e-mail único, código de turma único, data fim ≥ data início…) e mesmas permissões (aluno e instrutor só consultam; só o administrador cadastra e exclui).

- Os dados ficam no **localStorage do navegador**: o que você cadastra continua lá ao fechar e abrir de novo, mas só naquele navegador/computador.
- Para voltar aos dados de exemplo, abra o console do navegador (F12) e rode `resetarBancoLocal()`.
- O restante (modalidades, áreas, feriados, atividades, movimentações, tema escuro) já usava localStorage no código original e continua igual.

## O que mudou em relação ao repositório

- Pasta reorganizada: `css/`, `js/`, `img/`, com caminhos relativos (antes eram caminhos absolutos como `/sisged-api/public/css/...`, que só funcionam dentro do Laravel).
- `js/db.js`: agora contém a API local descrita acima. `apiFetch` mantém a mesma assinatura, então `cadastro.js`, `consultas.js` etc. quase não mudaram.
- `js/script.js`: o login chama a API local em vez de `fetch`.
- Correções de bugs que quebrariam a versão estática:
  - `movimentacao.js` e `utilitarios.js` usavam a variável `botoes` sem declará-la (os menus laterais não funcionavam).
  - `perfil.js` mostrava `undefined` no usuário e no e-mail.
  - `cadastro.html` tinha um botão "Instrutores" duplicado e sem fechamento.
  - `index.html` apontava para caminhos que não existem; agora só redireciona para `login.html`.
  - Senha atual errada na troca de senha não derruba mais a sessão (o `apiFetch` tratava o 401 como sessão expirada).
- Na consulta de aulas, a resposta agora traz turma, instrutores e salas (a `AulaResource` do Laravel só devolve IDs, então essas colunas apareciam como "—").

## Limitações

- É uma simulação para demonstração: as senhas ficam em texto puro no navegador e **não há segurança real**. Não use com dados reais.
- Não há limite de tentativas de login (o original tinha `throttle:5,1`).
- O VLibras (acessibilidade em Libras) e a fonte do Google carregam da internet; offline o site funciona, só sem eles.
- Não vieram para cá: banco de dados (`database/`), migrations, Swagger e o PDF de arquitetura — nada disso é necessário sem back-end.
