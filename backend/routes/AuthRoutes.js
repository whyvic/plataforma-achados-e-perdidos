const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Rota de Login (Recebe email e senha -> Devolve o Token)
router.post('/login', AuthController.login);

// Opcional: Rota para criar o primeiro porteiro (se não for inserir direto no banco)
router.post('/register', AuthController.register); 

module.exports = router;