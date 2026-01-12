require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const sequelize = require('./config/database'); 

const itemRoutes = require('./routes/ItemRoutes');
const authRoutes = require('./routes/AuthRoutes'); 

const app = express();

// Aumentamos o limite para 50MB (suficiente para fotos grandes)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// --- Sincronismo com o Banco de Dados ---
// MUDANÇA AQUI: { alter: true } vai criar as colunas que faltam (recebedorNome, etc)
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log('✅ Banco de dados ATUALIZADO (Colunas novas criadas)!');
    })
    .catch(err => {
        console.error('Erro ao conectar/sincronizar banco:', err);
    });

app.use('/api/items', itemRoutes); 
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API Achados e Perdidos UFC Russas - Online 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});