const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa a segurança

router.get('/', ItemController.getItems);

router.post('/', ItemController.createItem);

router.delete('/:id', authMiddleware, ItemController.deleteItem);

router.put('/:id/devolucao', authMiddleware, ItemController.registrarDevolucao);

module.exports = router;