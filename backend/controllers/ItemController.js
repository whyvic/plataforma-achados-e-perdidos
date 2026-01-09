// controlador para lidar com as operacoes relacionadas aos itens que estão guardados no achados
const Item = require('../models/Item');

// RN01: Qualquer pessoa pode cadastrar (Público) [cite: 32]
// RF01: Cadastro completo [cite: 34]
exports.createItem = async (req, res) => {
    try {
        const { nome, categoria, descricao, localEncontrado, dataAchado, foto, perguntaValidacao, respostaValidacao } = req.body;
        
        const newItem = await Item.create({
            nome, categoria, descricao, localEncontrado, dataAchado, foto, perguntaValidacao, respostaValidacao
        });

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Erro ao cadastrar item", error });
    }
};

// RF02: Consulta pública [cite: 34]
// RF03: Filtros (Categoria, Local, Palavra-chave) [cite: 34]
exports.getItems = async (req, res) => {
    try {
        const { categoria, local, busca } = req.query;
        let query = { status: 'Encontrado' }; // Por padrão, só mostra o que não foi devolvido

        if (categoria) query.categoria = categoria;
        if (local) query.localEncontrado = { $regex: local, $options: 'i' };
        if (busca) {
            query.$or = [
                { nome: { $regex: busca, $options: 'i' } },
                { descricao: { $regex: busca, $options: 'i' } }
            ];
        }

        const items = await Item.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar itens" });
    }
};

// RN02: Devolução mediada pela portaria [cite: 32]
// RF07: Registro de devolução [cite: 35]
exports.registrarDevolucao = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomeRecebedor, matriculaRecebedor } = req.body;
        
        // O porteiro vem do middleware de autenticação (req.user)
        const porteiroResponsavel = req.user.nome; 

        const item = await Item.findByIdAndUpdate(id, {
            status: 'Devolvido',
            dadosDevolucao: {
                nomeRecebedor,
                matriculaRecebedor,
                porteiroResponsavel,
                dataDevolucao: new Date()
            }
        }, { new: true });

        if (!item) return res.status(404).json({ message: "Item não encontrado" });

        res.json({ message: "Devolução registrada com sucesso", item });
    } catch (error) {
        res.status(500).json({ message: "Erro na devolução" });
    }
};

// RF08: Histórico para porteiros (vê tudo, inclusive devolvidos) [cite: 35]
exports.getHistorico = async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar histórico" });
    }
};