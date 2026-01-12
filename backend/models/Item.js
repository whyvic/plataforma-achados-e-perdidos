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
    },
    descricao: { type: Sequelize.TEXT, allowNull: false },
    localEncontrado: { type: Sequelize.STRING, allowNull: false },
    dataAchado: { type: Sequelize.DATE, allowNull: false },
    foto: { type: Sequelize.TEXT }, 
    perguntaValidacao: { type: Sequelize.STRING, allowNull: false }, 
    respostaValidacao: { type: Sequelize.STRING, allowNull: false },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'Encontrado' 
    },
    recebedorNome: { type: Sequelize.STRING },
    recebedorMatricula: { type: Sequelize.STRING },
    porteiroResponsavel: { type: Sequelize.STRING }
});

module.exports = Item;