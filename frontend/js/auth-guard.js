/**
 * Sistema de proteção de autenticação
 * Verifica se o usuário está logado antes de permitir acesso às páginas protegidas
 */

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - True se estiver logado, false caso contrário
 */
function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Obtém o nome do usuário logado
 * @returns {string|null} - Nome do usuário ou null se não estiver logado
 */
function getLoggedUser() {
    return localStorage.getItem('userName');
}

/**
 * Protege a página atual - redireciona para login se não estiver autenticado
 * @param {boolean} redirectToLogin - Se deve redirecionar para login (padrão: true)
 * @returns {boolean} - True se está autenticado, false caso contrário
 */
function protectPage(redirectToLogin = true) {
    if (!isAuthenticated()) {
        if (redirectToLogin) {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

/**
 * Realiza logout do sistema
 * @param {boolean} redirectToLogin - Se deve redirecionar para login (padrão: true)
 */
function logout(redirectToLogin = true) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    
    if (redirectToLogin) {
        window.location.href = 'login.html';
    }
}

/**
 * Inicializa proteção de páginas automaticamente
 * Chamada automaticamente quando o script é carregado
 */
(function initPageProtection() {
    // Lista de páginas que requerem autenticação
    const protectedPages = [
        'home-logado.html',
        'cadastrar-objeto.html'
    ];
    
    // Obtém o nome da página atual
    const currentPage = window.location.pathname.split('/').pop();
    
    // Verifica se a página atual precisa de proteção
    if (protectedPages.includes(currentPage)) {
        protectPage(true);
    }
    
    // Para home.html, permite acesso mas limita funcionalidades
    if (currentPage === 'home.html') {
        // Usuário pode ver a página mas com funcionalidades limitadas
        // O sistema já trata isso no frontend
    }
})();