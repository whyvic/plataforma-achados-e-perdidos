const Item = require('../models/Item');

// 1. LISTAR ITENS (Todo mundo pode ver)
exports.getItems = async (req, res) => {
    try {
        const items = await Item.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar itens" });
    }
};

// 2. CRIAR ITEM (Todo mundo pode criar)
exports.createItem = async (req, res) => {
    try {
        const newItem = await Item.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar item" });
    }
};

// 3. ATUALIZAR STATUS (Só Porteiro pode!)
exports.registrarDevolucao = async (req, res) => {
    try {
        // --- VERIFICAÇÃO DE SEGURANÇA ---
        // Se o usuário não existe ou NÃO for Porteiro/Admin, bloqueia.
        if (!req.user || (req.user.perfil !== 'Porteiro' && req.user.perfil !== 'Admin')) {
            return res.status(403).json({ message: "⛔ Acesso negado! Apenas porteiros podem mudar status." });
        }

        const { id } = req.params;
        const { nomeRecebedor, matriculaRecebedor, novoStatus } = req.body;
        
        const item = await Item.findByPk(id);

        if (!item) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        // Atualiza
        item.status = novoStatus || 'Devolvido';
        item.recebedorNome = nomeRecebedor; 
        item.recebedorMatricula = matriculaRecebedor;
        item.porteiroResponsavel = req.user.nome; // Grava quem fez a baixa
        
        await item.save();

        res.json({ message: "Status atualizado com sucesso!", item });

    } catch (error) {
        console.error("Erro no servidor:", error);
        res.status(500).json({ message: "Erro interno ao salvar." });
    }
};

// 4. EXCLUIR ITEM (Só Porteiro pode!)
exports.deleteItem = async (req, res) => {
    try {
        // --- VERIFICAÇÃO DE SEGURANÇA ---
        if (!req.user || (req.user.perfil !== 'Porteiro' && req.user.perfil !== 'Admin')) {
            return res.status(403).json({ message: "⛔ Acesso negado! Apenas porteiros podem excluir itens." });
        }

        const { id } = req.params;
        const item = await Item.findByPk(id);

        if (!item) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        await item.destroy();
        res.json({ message: "Item excluído com sucesso!" });

    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir item" });
    }
};