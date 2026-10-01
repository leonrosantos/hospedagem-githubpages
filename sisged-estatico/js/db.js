const DB = {
    instrutores: [
        { id: 1, nome: "Carlos Andrade", area: "Programação", email: "carlos.andrade@netnucleo.edu" },
        { id: 2, nome: "Fernanda Lima", area: "Design", email: "fernanda.lima@netnucleo.edu" },
        { id: 3, nome: "Rodrigo Souza", area: "Redes", email: "rodrigo.souza@netnucleo.edu" }
    ],
    salas: [
        { id: 1, nome: "Sala 01", capacidade: 25, tipo: "Teórica" },
        { id: 2, nome: "Sala 02", capacidade: 20, tipo: "Laboratório" },
        { id: 3, nome: "Sala 03", capacidade: 30, tipo: "Teórica" }
    ],
    modalidades: [
        { id: 1, nome: "Presencial" },
        { id: 2, nome: "EAD" },
        { id: 3, nome: "Híbrido" }
    ],
    areas: [
        { id: 1, nome: "Tecnologia da Informação" },
        { id: 2, nome: "Administração" },
        { id: 3, nome: "Design Gráfico" }
    ],
    cursos: [
        { id: 1, nome: "Desenvolvimento Web", area: "Tecnologia da Informação", cargaHoraria: 160 },
        { id: 2, nome: "Gestão de Projetos", area: "Administração", cargaHoraria: 80 }
    ],
    turmas: [
        { id: 1, nome: "DW-2026/1", curso: "Desenvolvimento Web", instrutor: "Carlos Andrade", sala: "Sala 02", turno: "Noite" },
        { id: 2, nome: "GP-2026/1", curso: "Gestão de Projetos", instrutor: "Fernanda Lima", sala: "Sala 01", turno: "Manhã" }
    ],
    feriados: [
        { id: 1, data: "2026-09-07", descricao: "Independência do Brasil" },
        { id: 2, data: "2026-11-02", descricao: "Finados" }
    ],
    atividades: [
        { id: 1, nome: "Prova Bimestral", turma: "DW-2026/1", data: "2026-09-15" }
    ],
    alunos: [
        { matricula: "2026001", nome: "Ana Beatriz Souza", turma: "DW-2026/1" },
        { matricula: "2026002", nome: "João Pedro Martins", turma: "GP-2026/1" },
        { matricula: "2026003", nome: "Larissa Costa", turma: "DW-2026/1" }
    ],
    ocorrencias: [
        { id: 1, turma: "DW-2026/1", data: "2026-08-10", descricao: "Ausência coletiva por falta de energia" }
    ],
    disciplinas: [
        { id: 1, nome: "HTML e CSS" },
        { id: 2, nome: "JavaScript" },
        { id: 3, nome: "Gestão Ágil" }
    ],
    telefonica: [
        { nome: "Secretaria", ramal: "1001" },
        { nome: "Coordenação Pedagógica", ramal: "1002" },
        { nome: "TI / Suporte", ramal: "1003" }
    ]
};

const Sessao = {
    CHAVE: "netnucleo_usuario",

    salvar(usuario) {
        sessionStorage.setItem(this.CHAVE, JSON.stringify(usuario));
    },

    obter() {
        const dados = sessionStorage.getItem(this.CHAVE);
        return dados ? JSON.parse(dados) : null;
    },

    limpar() {
        sessionStorage.removeItem(this.CHAVE);
    },

    exigirLogin() {
        const usuario = this.obter();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        // Se a senha ainda é a padrão, não deixa usar o resto do site
        // até trocar (a API também bloqueia isso, isso aqui é só pra
        // já mandar a pessoa pro lugar certo sem esperar dar erro).
        const paginaAtual = window.location.pathname.split("/").pop();
        if (usuario.deveTrocarSenha && paginaAtual !== "trocar-senha.html") {
            window.location.href = "trocar-senha.html";
            return;
        }

        restringirMenuPorTipo(usuario);
    }
};

// Páginas de administração que Aluno e Instrutor não podem acessar.
const PAGINAS_SOMENTE_ADMIN = ["cadastro.html", "movimentacao.html"];

function restringirMenuPorTipo(usuario) {
    const ehAdministrador = usuario.tipo === "Administrador";

    // Esconde os links do menu que levam a páginas administrativas.
    if (!ehAdministrador) {
        document.querySelectorAll("nav a, #net-menu a").forEach(link => {
            const destino = (link.getAttribute("href") || "").toLowerCase();
            if (PAGINAS_SOMENTE_ADMIN.includes(destino)) {
                link.style.display = "none";
            }
        });
    }

    // Se a pessoa tentar acessar a página administrativa direto pela
    // URL (sem passar pelo menu), manda de volta pro dashboard.
    const paginaAtual = window.location.pathname.split("/").pop();
    if (!ehAdministrador && PAGINAS_SOMENTE_ADMIN.includes(paginaAtual)) {
        window.location.href = "dashboard.html";
    }
}

function preencherTopbar() {
    const usuario = Sessao.obter();
    if (!usuario) return;

    const nomeEl = document.querySelector(".user-info strong");
    const tipoEl = document.querySelector(".user-info span");

    if (nomeEl && !nomeEl.id) nomeEl.textContent = usuario.nome;
    if (tipoEl && !tipoEl.id) tipoEl.textContent = usuario.tipo;
}

// ============================================================
// API LOCAL — versão estática do SISGED
// ------------------------------------------------------------
// No projeto original, o front-end conversa com uma API Laravel
// (/api/v1/...) que grava tudo no MySQL. Aqui não existe servidor:
// este bloco imita as mesmas rotas, com os mesmos nomes de campos,
// as mesmas regras de validação e as mesmas permissões, mas guarda
// os dados no localStorage do navegador.
//
// Assim os outros arquivos JS continuam chamando apiFetch("/cursos")
// exatamente como antes.
//
// ATENÇÃO: isto é uma simulação para demonstração. As senhas ficam
// em texto puro no navegador e não há segurança de verdade.
// ============================================================

const CHAVE_BANCO_LOCAL = "sisged_banco_v1";

// ---------- Dados iniciais (seed) ----------
function criarBancoInicial() {
    return {
        administradores: [
            { idAdministrador: 1, usuarioAdministrador: "admin", emailAdministrador: "admin@sisged.com", senhaAdministrador: "admin123" }
        ],
        alunos: [
            { idAluno: 1, nomeAluno: "Ana Beatriz Souza", cpfAluno: 20000000001, emailAluno: "ana.souza@sisged.com", telefoneAluno: 31900000011, senhaAluno: "Aluno@123", deve_trocar_senha: true },
            { idAluno: 2, nomeAluno: "João Pedro Martins", cpfAluno: 20000000002, emailAluno: "joao.martins@sisged.com", telefoneAluno: 31900000012, senhaAluno: "Aluno@123", deve_trocar_senha: true },
            { idAluno: 3, nomeAluno: "Larissa Costa", cpfAluno: 20000000003, emailAluno: "larissa.costa@sisged.com", telefoneAluno: 31900000013, senhaAluno: "Aluno@123", deve_trocar_senha: true }
        ],
        instrutores: [
            { idInstrutor: 1, Aula_idAula: null, nomeInstrutor: "Carlos Andrade", cpfInstrutor: 10000000001, emailInstrutor: "carlos.andrade@netnucleo.edu", telefoneInstrutor: 31900000001, areaInstrutor: "Programação", statusInstrutor: 1, senhaInstrutor: "Instrutor@123", deve_trocar_senha: true },
            { idInstrutor: 2, Aula_idAula: null, nomeInstrutor: "Fernanda Lima", cpfInstrutor: 10000000002, emailInstrutor: "fernanda.lima@netnucleo.edu", telefoneInstrutor: 31900000002, areaInstrutor: "Design", statusInstrutor: 1, senhaInstrutor: "Instrutor@123", deve_trocar_senha: true },
            { idInstrutor: 3, Aula_idAula: null, nomeInstrutor: "Rodrigo Souza", cpfInstrutor: 10000000003, emailInstrutor: "rodrigo.souza@netnucleo.edu", telefoneInstrutor: 31900000003, areaInstrutor: "Redes", statusInstrutor: 1, senhaInstrutor: "Instrutor@123", deve_trocar_senha: true }
        ],
        salas: [
            { idSala: 1, Aula_idAula: null, nomeSala: "Sala 01", capacidadeSala: 25, tipoAula: "Teórica", blocoandarAula: "Bloco A - 1º andar" },
            { idSala: 2, Aula_idAula: null, nomeSala: "Sala 02", capacidadeSala: 20, tipoAula: "Laboratório", blocoandarAula: "Bloco B - Térreo" },
            { idSala: 3, Aula_idAula: null, nomeSala: "Sala 03", capacidadeSala: 30, tipoAula: "Teórica", blocoandarAula: "Bloco A - 2º andar" }
        ],
        turmas: [
            { idTurma: 1, codigoTurma: 1001, turnoTurma: "Noite", datainicioTurma: "2026-02-02", datafimTurma: "2026-12-18" },
            { idTurma: 2, codigoTurma: 1002, turnoTurma: "Manhã", datainicioTurma: "2026-02-02", datafimTurma: "2026-12-18" }
        ],
        cursos: [
            { idCurso: 1, Turma_idTurma: 1, nomeCurso: "Desenvolvimento Web", modalidadeCurso: "Presencial", cargahorariaCurso: 160, nivelCurso: 1 },
            { idCurso: 2, Turma_idTurma: 2, nomeCurso: "Gestão de Projetos", modalidadeCurso: "Híbrido", cargahorariaCurso: 80, nivelCurso: 1 }
        ],
        materias: [
            { idMateria: 1, siglaMateria: "HTML", nomeMateria: "HTML e CSS", cargahorariaMateria: "40:00:00", ementaMateria: "Estrutura e estilo de páginas web." },
            { idMateria: 2, siglaMateria: "JS", nomeMateria: "JavaScript", cargahorariaMateria: "60:00:00", ementaMateria: "Lógica de programação no navegador." },
            { idMateria: 3, siglaMateria: "AGL", nomeMateria: "Gestão Ágil", cargahorariaMateria: "30:00:00", ementaMateria: "Scrum, Kanban e práticas ágeis." },
            { idMateria: 4, siglaMateria: "RED", nomeMateria: "Redes de Computadores", cargahorariaMateria: "40:00:00", ementaMateria: "Fundamentos de redes e protocolos." }
        ],
        aulas: [
            { idAula: 1, Administrador_idAdministrador: 1, Aluno_idAluno: null, Materia_idMateria: 2, Turma_idTurma: 1, dataAula: "2026-09-15", horarioinicioAula: "19:00:00", horariofimAula: "22:00:00", duracaoAula: "03:00:00", tipoAula: "Laboratório", statusAula: 1, instrutorIds: [1], salaIds: [2] },
            { idAula: 2, Administrador_idAdministrador: 1, Aluno_idAluno: null, Materia_idMateria: 3, Turma_idTurma: 2, dataAula: "2026-09-16", horarioinicioAula: "08:00:00", horariofimAula: "12:00:00", duracaoAula: "04:00:00", tipoAula: "Teórica", statusAula: 1, instrutorIds: [2], salaIds: [1] },
            { idAula: 3, Administrador_idAdministrador: 1, Aluno_idAluno: null, Materia_idMateria: 1, Turma_idTurma: 1, dataAula: "2026-09-17", horarioinicioAula: "19:00:00", horariofimAula: "22:00:00", duracaoAula: "03:00:00", tipoAula: "Laboratório", statusAula: 1, instrutorIds: [1], salaIds: [2] },
            { idAula: 4, Administrador_idAdministrador: 1, Aluno_idAluno: null, Materia_idMateria: 2, Turma_idTurma: 1, dataAula: "2026-09-22", horarioinicioAula: "19:00:00", horariofimAula: "22:00:00", duracaoAula: "03:00:00", tipoAula: "Laboratório", statusAula: 1, instrutorIds: [1], salaIds: [2] },
            { idAula: 5, Administrador_idAdministrador: 1, Aluno_idAluno: null, Materia_idMateria: 3, Turma_idTurma: 2, dataAula: "2026-10-01", horarioinicioAula: "08:00:00", horariofimAula: "12:00:00", duracaoAula: "04:00:00", tipoAula: "Teórica", statusAula: 1, instrutorIds: [2], salaIds: [1] },
            { idAula: 6, Administrador_idAdministrador: 1, Aluno_idAluno: null, Materia_idMateria: 4, Turma_idTurma: 1, dataAula: "2026-10-05", horarioinicioAula: "19:00:00", horariofimAula: "22:00:00", duracaoAula: "03:00:00", tipoAula: "Teórica", statusAula: 1, instrutorIds: [3], salaIds: [3] }
        ]
    };
}

// ---------- Leitura/gravação no localStorage ----------
// Se o navegador bloquear o localStorage, os dados ficam só em
// memória (somem ao recarregar a página, mas o site não quebra).
let _bancoEmMemoria = null;

function lerBanco() {
    try {
        const bruto = localStorage.getItem(CHAVE_BANCO_LOCAL);
        if (bruto) return JSON.parse(bruto);
        const inicial = criarBancoInicial();
        localStorage.setItem(CHAVE_BANCO_LOCAL, JSON.stringify(inicial));
        return inicial;
    } catch (erro) {
        if (!_bancoEmMemoria) _bancoEmMemoria = criarBancoInicial();
        return _bancoEmMemoria;
    }
}

function gravarBanco(banco) {
    try {
        localStorage.setItem(CHAVE_BANCO_LOCAL, JSON.stringify(banco));
    } catch (erro) {
        _bancoEmMemoria = banco;
    }
}

// Útil para voltar aos dados de exemplo: rode resetarBancoLocal() no
// console do navegador.
function resetarBancoLocal() {
    try { localStorage.removeItem(CHAVE_BANCO_LOCAL); } catch (erro) { /* ignora */ }
    _bancoEmMemoria = null;
    Sessao.limpar();
    window.location.href = "login.html";
}

// ---------- Regras de validação (espelham as FormRequests do Laravel) ----------
const RECURSOS_LOCAIS = {
    administradores: {
        id: "idAdministrador",
        leitura: ["administrador"],
        regras: {
            usuarioAdministrador: "required|string|max:50|unique:administradores,usuarioAdministrador",
            emailAdministrador: "required|email|max:100|unique:administradores,emailAdministrador",
            senhaAdministrador: "required|string|min:8"
        }
    },
    alunos: {
        id: "idAluno",
        leitura: ["administrador"],
        regras: {
            nomeAluno: "required|string|max:100",
            cpfAluno: "required|integer|digits:11|unique:alunos,cpfAluno",
            emailAluno: "required|email|max:100|unique:alunos,emailAluno",
            telefoneAluno: "nullable|integer",
            senhaAluno: "sometimes|string|min:8"
        }
    },
    cursos: {
        id: "idCurso",
        leitura: ["administrador"],
        regras: {
            Turma_idTurma: "nullable|integer|exists:turmas,idTurma",
            nomeCurso: "required|string|max:100",
            modalidadeCurso: "nullable|string|max:50",
            cargahorariaCurso: "nullable|integer",
            nivelCurso: "nullable|integer"
        }
    },
    materias: {
        id: "idMateria",
        leitura: ["administrador"],
        regras: {
            siglaMateria: "nullable|string|max:20",
            nomeMateria: "required|string|max:100",
            cargahorariaMateria: "nullable|date_format:H:i:s",
            ementaMateria: "nullable|string|max:255"
        }
    },
    aulas: {
        id: "idAula",
        leitura: ["administrador", "aluno", "instrutor"],
        regras: {
            Administrador_idAdministrador: "nullable|integer|exists:administradores,idAdministrador",
            Aluno_idAluno: "nullable|integer|exists:alunos,idAluno",
            Materia_idMateria: "nullable|integer|exists:materias,idMateria",
            Turma_idTurma: "nullable|integer|exists:turmas,idTurma",
            dataAula: "required|date",
            horarioinicioAula: "nullable|date_format:H:i:s",
            horariofimAula: "nullable|date_format:H:i:s|after:horarioinicioAula",
            duracaoAula: "nullable|date_format:H:i:s",
            tipoAula: "nullable|string|max:50",
            statusAula: "nullable|boolean"
        }
    },
    instrutores: {
        id: "idInstrutor",
        leitura: ["administrador", "aluno", "instrutor"],
        regras: {
            Aula_idAula: "nullable|integer|exists:aulas,idAula",
            nomeInstrutor: "required|string|max:100",
            cpfInstrutor: "required|integer|digits:11|unique:instrutores,cpfInstrutor",
            emailInstrutor: "required|email|max:100|unique:instrutores,emailInstrutor",
            telefoneInstrutor: "nullable|integer",
            areaInstrutor: "nullable|string|max:50",
            statusInstrutor: "nullable|boolean",
            senhaInstrutor: "sometimes|string|min:8"
        }
    },
    salas: {
        id: "idSala",
        leitura: ["administrador", "aluno", "instrutor"],
        regras: {
            Aula_idAula: "nullable|integer|exists:aulas,idAula",
            nomeSala: "required|string|max:50",
            capacidadeSala: "nullable|integer|min:1",
            tipoAula: "nullable|string|max:50",
            blocoandarAula: "nullable|string|max:50"
        }
    },
    turmas: {
        id: "idTurma",
        leitura: ["administrador", "aluno", "instrutor"],
        regras: {
            codigoTurma: "required|integer|unique:turmas,codigoTurma",
            turnoTurma: "required|string|max:50",
            datainicioTurma: "nullable|date",
            datafimTurma: "nullable|date|after_or_equal:datainicioTurma"
        }
    }
};

// Quais campos de senha existem em cada tipo de usuário.
const CAMPO_SENHA_POR_TIPO = {
    administrador: { tabela: "administradores", id: "idAdministrador", senha: "senhaAdministrador" },
    aluno: { tabela: "alunos", id: "idAluno", senha: "senhaAluno" },
    instrutor: { tabela: "instrutores", id: "idInstrutor", senha: "senhaInstrutor" }
};

function normalizarHora(valor) {
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(valor).trim());
    if (!m) return null;
    return `${m[1].padStart(2, "0")}:${m[2]}:${m[3] || "00"}`;
}

function dataValida(valor) {
    return /^\d{4}-\d{2}-\d{2}/.test(String(valor)) && !isNaN(Date.parse(valor));
}

// Valida os dados de acordo com as regras. Em atualização (parcial)
// só valida os campos que vieram, como o "sometimes" do Laravel.
function validarDados(banco, regras, dados, opcoes = {}) {
    const erros = {};
    const limpos = {};

    for (const campo of Object.keys(regras)) {
        const lista = regras[campo].split("|");
        const veio = Object.prototype.hasOwnProperty.call(dados, campo);

        if (!veio && (opcoes.parcial || lista.includes("sometimes"))) continue;

        let valor = dados[campo];
        const vazio = valor === undefined || valor === null || (typeof valor === "string" && valor.trim() === "");

        if (vazio) {
            if (lista.includes("required")) {
                erros[campo] = [`O campo ${campo} é obrigatório.`];
            } else {
                limpos[campo] = null;
            }
            continue;
        }

        const mensagens = [];
        const ehInteiro = lista.includes("integer");

        if (ehInteiro) {
            if (/^-?\d+$/.test(String(valor).trim())) {
                valor = Number(valor);
            } else {
                mensagens.push(`O campo ${campo} deve ser um número inteiro.`);
            }
        } else if (lista.includes("boolean")) {
            if ([true, false, 0, 1, "0", "1"].includes(valor)) {
                valor = (valor === true || valor === 1 || valor === "1") ? 1 : 0;
            } else {
                mensagens.push(`O campo ${campo} deve ser verdadeiro ou falso.`);
            }
        } else if (typeof valor === "string") {
            valor = valor.trim();
        }

        if (lista.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor))) {
            mensagens.push(`O campo ${campo} deve ser um e-mail válido.`);
        }

        if (lista.includes("date") && !dataValida(valor)) {
            mensagens.push(`O campo ${campo} deve ser uma data válida.`);
        }

        for (const regra of lista) {
            const i = regra.indexOf(":");
            const nome = i < 0 ? regra : regra.slice(0, i);
            const arg = i < 0 ? "" : regra.slice(i + 1);

            if (nome === "max") {
                const limite = Number(arg);
                if (ehInteiro ? valor > limite : String(valor).length > limite) {
                    mensagens.push(ehInteiro
                        ? `O campo ${campo} não pode ser maior que ${limite}.`
                        : `O campo ${campo} não pode ter mais de ${limite} caracteres.`);
                }
            }

            if (nome === "min") {
                const limite = Number(arg);
                if (ehInteiro ? valor < limite : String(valor).length < limite) {
                    mensagens.push(ehInteiro
                        ? `O campo ${campo} deve ser no mínimo ${limite}.`
                        : `O campo ${campo} deve ter pelo menos ${limite} caracteres.`);
                }
            }

            if (nome === "digits" && String(valor).length !== Number(arg)) {
                mensagens.push(`O campo ${campo} deve ter ${arg} dígitos.`);
            }

            if (nome === "unique") {
                const [tabela, coluna] = arg.split(",");
                const idTabela = RECURSOS_LOCAIS[tabela].id;
                const repetido = (banco[tabela] || []).some(r =>
                    String(r[coluna]) === String(valor) && r[idTabela] !== opcoes.ignorarId
                );
                if (repetido) mensagens.push(`O valor informado em ${campo} já está em uso.`);
            }

            if (nome === "exists") {
                const [tabela, coluna] = arg.split(",");
                const existe = (banco[tabela] || []).some(r => String(r[coluna]) === String(valor));
                if (!existe) mensagens.push(`O valor informado em ${campo} não existe.`);
            }

            if (nome === "date_format") {
                const hora = normalizarHora(valor);
                if (hora) valor = hora;
                else mensagens.push(`O campo ${campo} deve estar no formato HH:MM:SS.`);
            }

            if (nome === "after_or_equal" && dataValida(valor) && dataValida(dados[arg])) {
                if (String(valor) < String(dados[arg])) {
                    mensagens.push(`O campo ${campo} deve ser uma data igual ou posterior a ${arg}.`);
                }
            }

            if (nome === "after" && dados[arg]) {
                const outra = normalizarHora(dados[arg]);
                const esta = normalizarHora(valor);
                if (outra && esta && esta <= outra) {
                    mensagens.push(`O campo ${campo} deve ser posterior a ${arg}.`);
                }
            }
        }

        if (mensagens.length) erros[campo] = mensagens;
        else limpos[campo] = valor;
    }

    return { erros: Object.keys(erros).length ? erros : null, dados: limpos };
}

// ---------- Apresentação dos registros (esconde senhas, monta aulas) ----------
function publico(registro) {
    const copia = { ...registro };
    Object.keys(copia).forEach(chave => {
        if (chave.startsWith("senha") || chave === "deve_trocar_senha") delete copia[chave];
    });
    return copia;
}

function apresentarAula(banco, aula) {
    const turma = banco.turmas.find(t => t.idTurma === aula.Turma_idTurma);
    const { instrutorIds, salaIds, ...base } = aula;
    return {
        ...base,
        turma: turma ? turma.codigoTurma : null,
        instrutores: (instrutorIds || [])
            .map(id => banco.instrutores.find(i => i.idInstrutor === id))
            .filter(Boolean).map(i => i.nomeInstrutor),
        salas: (salaIds || [])
            .map(id => banco.salas.find(s => s.idSala === id))
            .filter(Boolean).map(s => s.nomeSala)
    };
}

function apresentar(banco, recurso, registro) {
    return recurso === "aulas" ? apresentarAula(banco, registro) : publico(registro);
}

function listaDeInteiros(valor) {
    return Array.isArray(valor) ? valor.map(Number).filter(Number.isInteger) : [];
}

// ---------- Autenticação por "token" local ----------
function gerarTokenLocal(tipo, id) {
    return "local." + btoa(`${tipo}:${id}:${Date.now()}`);
}

function autenticarToken(banco, token) {
    if (!token || !token.startsWith("local.")) return null;
    try {
        const [tipo, id] = atob(token.slice(6)).split(":");
        const conf = CAMPO_SENHA_POR_TIPO[tipo];
        if (!conf) return null;
        const registro = banco[conf.tabela].find(r => r[conf.id] === Number(id));
        return registro ? { tipo, registro, conf } : null;
    } catch (erro) {
        return null;
    }
}

// ---------- Roteador ----------
const LocalAPI = {
    requisitar(metodo, caminho, corpo, token) {
        const banco = lerBanco();
        const [rota, queryString = ""] = caminho.split("?");
        const consulta = new URLSearchParams(queryString);
        const partes = rota.replace(/^\/+|\/+$/g, "").split("/");
        const resp = (status, dados) => ({ status, dados });
        corpo = corpo || {};

        // ----- Login (público) -----
        if (partes[0] === "auth" && partes[2] === "login" && metodo === "POST") {
            return this.login(banco, partes[1], corpo, resp);
        }

        // ----- Daqui pra baixo precisa estar autenticado -----
        const auth = autenticarToken(banco, token);
        if (!auth) return resp(401, { message: "Unauthenticated." });

        if (partes[0] === "auth" && partes[1] === "logout" && metodo === "POST") {
            return resp(200, { message: "Logout realizado com sucesso" });
        }

        if (partes[0] === "auth" && partes[1] === "trocar-senha" && metodo === "POST") {
            return this.trocarSenha(banco, auth, corpo, resp);
        }

        // ----- Bloqueio de quem ainda está com a senha padrão -----
        if (auth.registro.deve_trocar_senha) {
            return resp(403, {
                message: "Você precisa trocar sua senha padrão antes de continuar.",
                deve_trocar_senha: true
            });
        }

        // ----- Rotas específicas por tipo de usuário -----
        if (partes[0] === "aluno" && partes[1] === "cursos" && metodo === "GET") {
            if (auth.tipo !== "aluno") return resp(403, { message: "Acesso não autorizado para este tipo de usuário" });
            return resp(200, banco.cursos.map(c => ({ idCurso: c.idCurso, nomeCurso: c.nomeCurso })));
        }

        if (partes[0] === "instrutor" && partes[1] === "minhas-aulas" && metodo === "GET") {
            if (auth.tipo !== "instrutor") return resp(403, { message: "Acesso não autorizado para este tipo de usuário" });
            const minhas = banco.aulas
                .filter(a => (a.instrutorIds || []).includes(auth.registro.idInstrutor))
                .sort((a, b) => String(b.dataAula).localeCompare(String(a.dataAula)));
            return resp(200, { data: minhas.map(a => apresentarAula(banco, a)) });
        }

        // ----- CRUD dos recursos -----
        const recurso = partes[0];
        const config = RECURSOS_LOCAIS[recurso];
        if (!config) return resp(404, { message: "Rota não encontrada." });

        const idParam = partes[1] !== undefined ? Number(partes[1]) : null;
        const ehLeitura = metodo === "GET";

        if (ehLeitura && !config.leitura.includes(auth.tipo)) {
            return resp(403, { message: "Acesso não autorizado para este tipo de usuário" });
        }
        if (!ehLeitura && auth.tipo !== "administrador") {
            return resp(403, { message: "Acesso não autorizado para este tipo de usuário" });
        }

        const tabela = banco[recurso];

        // GET /recurso
        if (ehLeitura && idParam === null) {
            return resp(200, { data: this.listar(banco, recurso, config, consulta) });
        }

        // GET /recurso/{id}
        if (ehLeitura) {
            const item = tabela.find(r => r[config.id] === idParam);
            if (!item) return resp(404, { message: "Registro não encontrado." });
            return resp(200, { data: apresentar(banco, recurso, item) });
        }

        // POST /recurso
        if (metodo === "POST" && idParam === null) {
            const { erros, dados } = validarDados(banco, config.regras, corpo);
            if (erros) return resp(422, { message: "Dados inválidos.", errors: erros });

            const novo = { [config.id]: proximoId(tabela, config.id), ...dados };

            if (recurso === "alunos") {
                novo.senhaAluno = dados.senhaAluno || "Aluno@123";
                novo.deve_trocar_senha = true;
            }
            if (recurso === "instrutores") {
                novo.senhaInstrutor = dados.senhaInstrutor || "Instrutor@123";
                novo.deve_trocar_senha = true;
                if (novo.statusInstrutor === null || novo.statusInstrutor === undefined) novo.statusInstrutor = 1;
            }
            if (recurso === "aulas") {
                novo.instrutorIds = listaDeInteiros(corpo.instrutorIds);
                novo.salaIds = listaDeInteiros(corpo.salaIds);
                if (novo.statusAula === null || novo.statusAula === undefined) novo.statusAula = 1;
            }
            if (recurso === "administradores") {
                // senha já validada (mín. 8 caracteres)
            }

            tabela.push(novo);
            gravarBanco(banco);
            return resp(201, { data: apresentar(banco, recurso, novo) });
        }

        // PUT/PATCH /recurso/{id}
        if ((metodo === "PUT" || metodo === "PATCH") && idParam !== null) {
            const item = tabela.find(r => r[config.id] === idParam);
            if (!item) return resp(404, { message: "Registro não encontrado." });

            const { erros, dados } = validarDados(banco, config.regras, corpo, { parcial: true, ignorarId: idParam });
            if (erros) return resp(422, { message: "Dados inválidos.", errors: erros });

            Object.assign(item, dados);
            if (recurso === "aulas") {
                if (corpo.instrutorIds !== undefined) item.instrutorIds = listaDeInteiros(corpo.instrutorIds);
                if (corpo.salaIds !== undefined) item.salaIds = listaDeInteiros(corpo.salaIds);
            }
            if (dados.senhaAluno || dados.senhaInstrutor) item.deve_trocar_senha = false;

            gravarBanco(banco);
            return resp(200, { data: apresentar(banco, recurso, item) });
        }

        // DELETE /recurso/{id}
        if (metodo === "DELETE" && idParam !== null) {
            const indice = tabela.findIndex(r => r[config.id] === idParam);
            if (indice < 0) return resp(404, { message: "Registro não encontrado." });
            tabela.splice(indice, 1);
            gravarBanco(banco);
            return resp(204, null);
        }

        return resp(405, { message: "Método não permitido." });
    },

    login(banco, tipo, corpo, resp) {
        const conf = CAMPO_SENHA_POR_TIPO[tipo];
        if (!conf) return resp(404, { message: "Rota não encontrada." });

        const nomeTipo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const campoEmail = `email${nomeTipo}`;
        const campoSenha = `senha${nomeTipo}`;

        const erros = {};
        const email = String(corpo[campoEmail] || "").trim();
        const senha = corpo[campoSenha];

        if (!email) erros[campoEmail] = [`O campo ${campoEmail} é obrigatório.`];
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros[campoEmail] = [`O campo ${campoEmail} deve ser um e-mail válido.`];
        if (!senha) erros[campoSenha] = [`O campo ${campoSenha} é obrigatório.`];
        if (Object.keys(erros).length) return resp(422, { errors: erros });

        const usuario = banco[conf.tabela].find(r =>
            String(r[campoEmail]).toLowerCase() === email.toLowerCase()
        );

        if (!usuario || usuario[conf.senha] !== senha) {
            return resp(401, { message: "Credenciais inválidas" });
        }

        const resposta = {
            tipo,
            token: gerarTokenLocal(tipo, usuario[conf.id]),
            [tipo]: publico(usuario)
        };
        // Só aluno e instrutor têm "deve_trocar_senha" (administrador não).
        if (tipo !== "administrador") resposta.deve_trocar_senha = !!usuario.deve_trocar_senha;

        return resp(200, resposta);
    },

    trocarSenha(banco, auth, corpo, resp) {
        const erros = {};
        if (!corpo.senha_atual) erros.senha_atual = ["O campo senha_atual é obrigatório."];
        if (!corpo.nova_senha) erros.nova_senha = ["O campo nova_senha é obrigatório."];
        else if (String(corpo.nova_senha).length < 8) erros.nova_senha = ["O campo nova_senha deve ter pelo menos 8 caracteres."];
        if (Object.keys(erros).length) return resp(422, { errors: erros });

        const usuario = auth.registro;
        if (usuario[auth.conf.senha] !== corpo.senha_atual) {
            // O Laravel responde 401 aqui, mas o apiFetch trata 401 como
            // "sessão expirada" e derrubaria a pessoa para o login. Por
            // isso a versão estática usa 422 (erro de validação).
            return resp(422, { message: "Senha atual incorreta" });
        }

        usuario[auth.conf.senha] = corpo.nova_senha;
        if (auth.tipo !== "administrador") usuario.deve_trocar_senha = false;
        gravarBanco(banco);

        return resp(200, { message: "Senha alterada com sucesso" });
    },

    listar(banco, recurso, config, consulta) {
        let lista = banco[recurso].slice();

        if (recurso === "aulas") {
            const data = consulta.get("data");
            const instrutorId = consulta.get("instrutor_id");
            const salaId = consulta.get("sala_id");

            if (data) lista = lista.filter(a => String(a.dataAula).slice(0, 10) === data);
            if (instrutorId) lista = lista.filter(a => (a.instrutorIds || []).includes(Number(instrutorId)));
            if (salaId) lista = lista.filter(a => (a.salaIds || []).includes(Number(salaId)));

            lista.sort((a, b) => String(b.dataAula).localeCompare(String(a.dataAula)));
        }

        const porPagina = Number(consulta.get("per_page")) || 100;
        return lista.slice(0, porPagina).map(r => apresentar(banco, recurso, r));
    }
};

function proximoId(tabela, campoId) {
    return tabela.reduce((maior, r) => Math.max(maior, r[campoId] || 0), 0) + 1;
}

// ---------- apiFetch: mesma assinatura da versão com servidor ----------
async function apiFetch(caminho, opcoes = {}) {
    const sessao = Sessao.obter();
    const metodo = (opcoes.method || "GET").toUpperCase();

    let corpo = null;
    if (opcoes.body) {
        try { corpo = JSON.parse(opcoes.body); } catch (erro) { corpo = null; }
    }

    const resposta = LocalAPI.requisitar(metodo, caminho, corpo, sessao && sessao.token);

    if (resposta.status === 401) {
        Sessao.limpar();
        window.location.href = "login.html";
        return;
    }

    if (resposta.status >= 400) {
        const erro = new Error((resposta.dados && resposta.dados.message) || "Erro na requisição");
        erro.dados = resposta.dados;
        erro.status = resposta.status;
        throw erro;
    }

    return resposta.dados;
}

// Versão para rotas públicas (login): não redireciona em caso de 401,
// só devolve o resultado para a tela tratar a mensagem de erro.
async function apiPublico(caminho, opcoes = {}) {
    const metodo = (opcoes.method || "GET").toUpperCase();

    let corpo = null;
    if (opcoes.body) {
        try { corpo = JSON.parse(opcoes.body); } catch (erro) { corpo = null; }
    }

    const resposta = LocalAPI.requisitar(metodo, caminho, corpo, null);
    return { ok: resposta.status < 400, status: resposta.status, dados: resposta.dados };
}
