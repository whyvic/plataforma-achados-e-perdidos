/**
 * Sistema de cadastro de usuários com Integração ao Backend
 */

/**
 * Navega para a página inicial
 */
function navigateToHome() {
    window.location.href = 'home.html';
}

/**
 * Valida se o email tem formato válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida entrada em tempo real (Efeito visual)
 */
function validateInput(input) {
    if (input.value.trim() !== '') {
        input.style.color = '#000000';
    } else {
        input.style.color = 'rgba(0, 0, 0, 0.5)';
    }
}

/**
 * Valida SIAPE (apenas números) - Visual apenas, pois não vai pro banco agora
 */
function validateSiape(input) {
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length > 7) {
        input.value = input.value.substring(0, 7);
    }
}

/**
 * Formata nome (primeira letra maiúscula)
 */
function formatName(input) {
    const words = input.value.toLowerCase().split(' ');
    const formattedWords = words.map(word => {
        if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    });
    input.value = formattedWords.join(' ');
}

/**
 * --- FUNÇÃO PRINCIPAL: REALIZA O CADASTRO NO BACKEND ---
 */
async function performRegister() {
    // 1. Pegar os elementos do HTML
    const nomeInput = document.getElementById('nomeInput');
    const emailInput = document.getElementById('emailInput');
    // const siapeInput = document.getElementById('siapeInput'); (Ignorado no envio, banco não tem coluna)
    const senhaInput = document.getElementById('senhaInput');
    const confirmarSenhaInput = document.getElementById('confirmarSenhaInput');

    // 2. Pegar os valores
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    // 3. Validações Básicas
    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Por favor, insira um email válido.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        confirmarSenhaInput.value = "";
        confirmarSenhaInput.focus();
        return;
    }

    // Feedback visual (Botão carregando)
    const btn = document.querySelector('.cadastrar-btn');
    const originalText = btn ? btn.innerHTML : 'Criar Conta';
    if (btn) {
        btn.innerHTML = 'Criando conta...';
        btn.disabled = true;
    }

    try {
        // 4. Enviar para o Backend
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha,
                // IMPORTANTE: 'turno' é obrigatório no seu banco, enviamos fixo para funcionar
                turno: 'Integral' 
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Conta criada com sucesso! Faça login para continuar.");
            window.location.href = 'login.html';
        } else {
            alert(data.message || "Erro ao criar conta.");
        }

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão. Verifique se o Backend (node app.js) está rodando.");
    } finally {
        // Restaura o botão
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

/**
 * Configura efeitos visuais nos campos de input
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
 */
function setupFormAnimation() {
    const cadastroFormContainer = document.querySelector('.cadastro-form-container');
    if (cadastroFormContainer) {
        cadastroFormContainer.style.opacity = '0';
        cadastroFormContainer.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            cadastroFormContainer.style.opacity = '1';
            cadastroFormContainer.style.transform = 'translateY(0)';
            cadastroFormContainer.style.transition = 'all 0.5s ease';
        }, 100);
    }
}

/**
 * Inicialização do sistema de cadastro
 */
document.addEventListener('DOMContentLoaded', function() {
    const nomeInput = document.getElementById('nomeInput');
    const siapeInput = document.getElementById('siapeInput');
    const emailInput = document.getElementById('emailInput');
    const senhaInput = document.getElementById('senhaInput');
    const confirmarSenhaInput = document.getElementById('confirmarSenhaInput');
    const cadastrarBtn = document.querySelector('.cadastrar-btn');
    
    // Lista de inputs para navegação com Enter
    const inputs = [nomeInput, emailInput, siapeInput, senhaInput, confirmarSenhaInput];
    
    inputs.forEach((input, index) => {
        if (input) {
            // Efeito visual de cor do texto
            input.addEventListener('input', function() {
                validateInput(this);
            });
            
            // Navegação com Enter
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    if (index < inputs.length - 1) {
                        // Foca no próximo campo
                        if(inputs[index + 1]) inputs[index + 1].focus();
                    } else {
                        // Se for o último, tenta registrar
                        performRegister();
                    }
                }
            });
        }
    });
    
    // Botão de cadastrar
    if (cadastrarBtn) {
        cadastrarBtn.addEventListener('click', performRegister);
    }
    
    // Máscara para SIAPE
    if (siapeInput) {
        siapeInput.addEventListener('input', function() {
            validateSiape(this);
        });
    }
    
    // Formatação automática do Nome
    if (nomeInput) {
        nomeInput.addEventListener('blur', function() {
            formatName(this);
        });
    }
    
    // Inicializa efeitos visuais
    setupInputEffects();
    setupFormAnimation();
});