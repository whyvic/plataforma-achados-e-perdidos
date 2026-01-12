/**
 * Sistema de toast/notificações
 */

/**
 * Carrega o componente toast dinamicamente
 * @returns {Promise<void>}
 */
async function loadToast() {
    const container = document.getElementById('toast-placeholder');
    if (!container) {
        console.error('Elemento #toast-placeholder não encontrado.');
        return;
    }
    try {
        const response = await fetch('components/toast.html');
        if (!response.ok) throw new Error('Erro ao carregar toast.html');
        container.innerHTML = await response.text();
    } catch (error) {
        console.error('Falha ao carregar o toast:', error);
    }
}

/**
 * Exibe o toast na tela
 * @returns {void}
 */
function showToast() {
    const overlay = document.getElementById('toast-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        
        const closeBtn = document.getElementById('toast-close-btn');
        const actionBtn = document.getElementById('toast-action-btn');
        
        if(closeBtn) closeBtn.onclick = hideToast;
        
        if(actionBtn) actionBtn.onclick = () => {
            hideToast();
            window.location.href = 'home.html';
        };
    } else {
        console.error('Elemento #toast-overlay não encontrado no DOM.');
    }
}

/**
 * Oculta o toast da tela
 * @returns {void}
 */
function hideToast() {
    const overlay = document.getElementById('toast-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}