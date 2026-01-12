/**
 * Sistema de autenticação de login
 */

/**
 * Navega para a página inicial
 * @returns {void}
 */
function navigateToHome() {
    window.location.href = 'home.html';
}

/**
 * Navega para o cadastro de objeto
 * @returns {void}
 */
function navigateToCadastro() {
    window.location.href = 'cadastrar-objeto.html';
}

/**
 * Navega para o registro/cadastro de usuário
 * @returns {void}
 */
function navigateToRegister() {
    window.location.href = 'cadastro.html';
}

/**
 * Valida entrada em tempo real
 * @param {HTMLInputElement} input - Campo de input a ser validado
 * @returns {void}
 */
function validateInput(input) {
    if (input.value.trim() !== '') {
        input.style.color = '#000000';
    } else {
        input.style.color = 'rgba(0, 0, 0, 0.5)';
    }
}

/**
 * Realiza o processo de login
 * @returns {void}
 */
async function performLogin() {
    const loginInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    
    // Pega os valores e remove espaços em branco
    const loginValue = loginInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    
    if (!loginValue || !passwordValue) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Muda o texto do botão para dar feedback visual
    const loginBtn = document.querySelector('.login-btn');
    const originalBtnText = loginBtn.innerHTML;
    loginBtn.innerHTML = 'Entrando...';
    loginBtn.disabled = true;

    try {
        // --- CONEXÃO REAL COM SEU BACKEND ---
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginValue, 
                senha: passwordValue
            })
        });

        const data = await response.json();

        if (response.ok) {
            // LOGIN COM SUCESSO!
            
            // 1. Salva que está logado
            localStorage.setItem('isLoggedIn', 'true');
            
            // 2. Salva o Token (IMPORTANTE para as rotas protegidas depois)
            localStorage.setItem('token', data.token);

            // 3. Salva o nome do usuário (seu backend manda dentro de data.usuario.nome)
            if (data.usuario && data.usuario.nome) {
                localStorage.setItem('userName', data.usuario.nome);
            } else {
                localStorage.setItem('userName', loginValue);
            }
            
            // 4. Redireciona para a home
            window.location.href = 'home-logado.html';

        } else {
            // ERRO (Senha errada ou usuário não existe)
            alert(data.message || 'Erro ao fazer login.');
        }

    } catch (error) {
        console.error('Erro técnico:', error);
        alert('Erro de conexão. Verifique se o servidor (backend) está rodando na porta 3000.');
    } finally {
        // Restaura o botão ao estado original
        loginBtn.innerHTML = originalBtnText;
        loginBtn.disabled = false;
    }
}

/**
 * Configura efeitos visuais nos campos de input
 * @returns {void}
 */
function setupInputEffects() {
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(field => {
        const input = field.querySelector('input');
        
        if (input) {
            input.addEventListener('focus', function() {
                field.style.background = '#CECECE';
                field.style.boxShadow = '0px 0px 5px rgba(0, 58, 101, 0.3)';
                field.style.transition = 'all 0.3s ease';
            });
            
            input.addEventListener('blur', function() {
                field.style.background = '#D9D9D9';
                field.style.boxShadow = 'none';
            });
        }
    });
}

/**
 * Configura animação de entrada do formulário
 * @returns {void}
 */
function setupFormAnimation() {
    const loginFormContainer = document.querySelector('.login-form-container');
    if (loginFormContainer) {
        loginFormContainer.style.opacity = '0';
        loginFormContainer.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            loginFormContainer.style.opacity = '1';
            loginFormContainer.style.transform = 'translateY(0)';
            loginFormContainer.style.transition = 'all 0.5s ease';
        }, 100);
    }
}

/**
 * Inicialização do sistema de login
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', function() {
    const loginInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            performLogin();
        });
    }
    
    if (loginInput) {
        loginInput.addEventListener('input', function() {
            validateInput(this);
        });
        
        loginInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                passwordInput.focus();
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validateInput(this);
        });
        
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                performLogin();
            }
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(event) {
            event.preventDefault();
            performLogin();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(event) {
            event.preventDefault();
            navigateToRegister();
        });
    }
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            if (index === 0) {
                navigateToHome();
            } else if (index === 1) {
                navigateToCadastro();
            }
        });
    });
    
    setupInputEffects();
    setupFormAnimation();
});
