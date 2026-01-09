const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const authMiddleware = require('../middleware/authMiddleware'); // Vamos falar disso jájá

// Rotas Públicas (Estudantes)
router.get('/', ItemController.getItems);       // Listar todos (ou filtrar)
router.post('/', ItemController.createItem);      // Cadastrar um novo

// Rotas Privadas (Porteiros) - Note o 'authMiddleware' protegendo a rota
router.put('/:id/devolver', authMiddleware, ItemController.registrarDevolucao); 

module.exports = router;