const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Acesso negado. Token não fornecido." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Adiciona dados do porteiro na requisição
        next();
    } catch (error) {
        res.status(400).json({ message: "Token inválido." });
    }
};