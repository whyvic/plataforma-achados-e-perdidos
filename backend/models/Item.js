const Sequelize = require('sequelize');
const database = require('../config/database');

const Item = database.define('item', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: { type: Sequelize.STRING, allowNull: false },
    categoria: { 
        type: Sequelize.STRING, 
        allowNull: false 
        // Categorias conforme protótipo: Garrafas, Cartões, Chaveiros etc. [cite: 55-66]
    },
    descricao: { type: Sequelize.TEXT, allowNull: false },
    localEncontrado: { type: Sequelize.STRING, allowNull: false },
    dataAchado: { type: Sequelize.DATE, allowNull: false },
    foto: { type: Sequelize.TEXT }, // Guardaremos URL ou Base64
    perguntaValidacao: { type: Sequelize.STRING, allowNull: false }, // RF05 [cite: 35]
    respostaValidacao: { type: Sequelize.STRING, allowNull: false },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'Encontrado' // RF06: Encontrado, Devolvido, Doação [cite: 35]
    },
    // Dados de quem recebeu (para RF07 - Registro de Devolução)
    recebedorNome: { type: Sequelize.STRING },
    recebedorMatricula: { type: Sequelize.STRING },
    porteiroResponsavel: { type: Sequelize.STRING }
});

module.exports = Item;