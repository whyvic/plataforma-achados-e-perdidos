/**
 * Sistema de autenticação e gerenciamento de header
 */

/**
 * Carrega o header dinamicamente em um container específico
 * @param {string} containerSelector - O seletor CSS do elemento onde o header será injetado
 * @returns {Promise<void>}
 */
async function loadHeader(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container do header não encontrado: ${containerSelector}`);
        return;
    }

    try {
        const response = await fetch('../components/header.html');
        if (!response.ok) {
            throw new Error(`Erro ao carregar o header: ${response.statusText}`);
        }
        const headerHTML = await response.text();
        container.innerHTML = headerHTML;
        
        setupLogoutButton();
    } catch (error) {
        console.error('Falha ao carregar o header:', error);
    }
}

/**
 * Configura o evento de clique para o botão de logout
 * @returns {void}
 */
function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    } else {
        console.error('Botão de logout não encontrado no header carregado.');
    }
}
