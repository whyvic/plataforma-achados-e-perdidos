const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs'); // Para criptografar a senha
const jwt = require('jsonwebtoken'); // Para gerar o token

// --- Método de Registo (Cria um novo Porteiro) ---
// Atende a RN05: Apenas porteiros realizam cadastro informando nome e turno.
exports.register = async (req, res) => {
    try {
        const { nome, email, senha, turno } = req.body;

        // 1. Verifica se o usuário já existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ message: "Email já cadastrado." });
        }

        // 2. Criptografa a senha (Segurança básica)
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // 3. Cria o usuário no banco
        const novoUsuario = await Usuario.create({
            nome,
            email,
            senha: senhaCriptografada,
            turno, // Obrigatório segundo RN05
            perfil: 'Porteiro' // Define o perfil automaticamente
        });

        res.status(201).json({ 
            message: "Porteiro cadastrado com sucesso!",
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao registrar usuário." });
    }
};

// --- Método de Login (Autenticação) ---
// Gera o token que permitirá ao porteiro acessar as rotas de devolução.
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Busca o usuário pelo email
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(400).json({ message: "Credenciais inválidas." });
        }

        // 2. Verifica se a senha bate com a criptografada no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ message: "Credenciais inválidas." });
        }

        // 3. Gera o Token JWT
        // O token guarda o ID e o Nome, e expira em 1 dia
        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login realizado com sucesso!",
            token: token, // O Frontend vai guardar isso para usar depois
            usuario: {
                nome: usuario.nome,
                perfil: usuario.perfil
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao fazer login." });
    }
};