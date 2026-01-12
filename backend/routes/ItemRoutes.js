const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa a segurança

// 1. Rota Pública: Qualquer um pode listar os itens
router.get('/', ItemController.getItems);

// 2. Rota Pública: Qualquer um pode criar (cadastrar objeto achado)
router.post('/', ItemController.createItem);

// 3. Rota PROTEGIDA: Apenas logados podem excluir
router.delete('/:id', authMiddleware, ItemController.deleteItem);

// 4. Rota PROTEGIDA: Apenas logados podem registrar devolução
// (ESSA É A LINHA QUE DEVIA ESTAR FALTANDO OU ERRADA)
router.put('/:id/devolucao', authMiddleware, ItemController.registrarDevolucao);

module.exports = router;