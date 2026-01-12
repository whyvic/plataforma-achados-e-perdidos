// Arquivo: backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Tenta pegar o token do cabeçalho
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    // O header vem como "Bearer SEU_TOKEN_AQUI", separamos as partes
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: "Token mal formatado" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ message: "Token mal formatado" });
    }

    // 2. Verifica se o token é válido
    jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_super_secreto', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido" });
        }

        // 3. Salva os dados do usuário na requisição para usar depois
        req.user = {
            id: decoded.id,
            nome: decoded.nome,     // Importante para salvar quem devolveu
            perfil: decoded.perfil  // Importante para bloquear alunos
        };
        
        return next();
    });
};