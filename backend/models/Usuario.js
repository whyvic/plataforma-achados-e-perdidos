const Sequelize = require('sequelize');
const database = require('../config/database');

const Usuario = database.define('usuario', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    senha: { type: Sequelize.STRING, allowNull: false },
    turno: { type: Sequelize.STRING, allowNull: false }, // Exigido no RN05 
    perfil: { type: Sequelize.STRING, defaultValue: 'Porteiro' }
});

module.exports = Usuario;