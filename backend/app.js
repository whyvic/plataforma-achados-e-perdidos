require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors'); // Permite que o front-end acesse o back-end
const sequelize = require('./config/database'); // Importa a conexão do banco

// Importação das rotas (vamos criar esses arquivos na pasta routes jájá)
const itemRoutes = require('./routes/ItemRoutes');
const authRoutes = require('./routes/AuthRoutes'); 
// Se ainda não criou o authRoutes, comente a linha acima para não dar erro

const app = express();

// --- Middlewares (Configurações globais) ---
app.use(express.json()); // MUITO IMPORTANTE: Permite ler JSON no corpo das requisições
app.use(cors()); // Libera acesso externo (necessário para o Front-end)

// --- Sincronismo com o Banco de Dados ---
// Isso cria as tabelas automaticamente baseadas nos seus Models
sequelize.sync({ force: false }) 
    .then(() => {
        console.log('Banco de dados PostgreSQL sincronizado com sucesso!');
    })
    .catch(err => {
        console.error('Erro ao conectar/sincronizar banco:', err);
    });

// --- Definição das Rotas ---
app.use('/api/items', itemRoutes); // Tudo que for item vai para /api/items
// app.use('/api/auth', authRoutes); // Tudo que for login vai para /api/auth
app.use('/api/auth', authRoutes);
// Rota de teste básica
app.get('/', (req, res) => {
    res.send('API Achados e Perdidos UFC Russas - Online 🚀');
});

// --- Iniciar o Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});