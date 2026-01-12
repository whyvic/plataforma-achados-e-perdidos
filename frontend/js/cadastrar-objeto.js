/**
 * Sistema de cadastro de objetos - Conectado ao Backend Node.js
 */

let processandoCadastro = false;

// Mapeamento para garantir que o texto fique bonito no banco
const categoriaMap = {
    'garrafas': 'Garrafas',
    'cartoes': 'Cartões',
    'chaveiros': 'Chaveiros',
    'eletronicos': 'Eletrônicos',
    'roupas-acessorios': 'Roupas e acessórios',
    'outros': 'Outros',
    '': 'Outros'
};

const localMap = {
    'sala-aula': 'Sala de Aula',
    'laboratorio': 'Laboratório',
    'ru': 'RU',
    'hall': 'Hall',
    'biblioteca': 'Biblioteca',
    'outros': 'Outros',
    '': 'Outros'
};

/**
 * Navega para a página inicial
 */
function goToHome() {
    window.location.href = 'home.html';
}

/**
 * Função auxiliar para converter Imagem em Base64
 * Isso é necessário para salvar a foto no banco de dados
 */
const converterImagemParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

/**
 * Função Principal: Cadastrar Objeto no Backend
 */
async function cadastrarObjeto() {
    if (processandoCadastro) return;
    processandoCadastro = true;
    
    // Feedback visual no botão
    const btnCadastrar = document.getElementById('btn-cadastrar');
    const textoOriginal = btnCadastrar ? btnCadastrar.innerHTML : 'Cadastrar';
    if (btnCadastrar) {
        btnCadastrar.disabled = true;
        btnCadastrar.innerHTML = 'Salvando...';
    }

    try {
        // 1. Coleta dos dados do HTML
        const nomeCompleto = document.getElementById('nome-completo')?.value?.trim() || 'Anônimo';
        const matricula = document.getElementById('matricula')?.value?.trim() || 'S/M';
        
        const nomeObjeto = document.getElementById('nome-objeto')?.value?.trim();
        const categoriaVal = document.getElementById('categoria')?.value;
        const localVal = document.getElementById('local-encontrado')?.value;
        const detalhesLocal = document.getElementById('detalhes-local')?.value?.trim() || '';
        
        const pergunta = document.getElementById('pergunta')?.value?.trim() || 'Qual a cor/detalhe?';
        const resposta = document.getElementById('resposta')?.value?.trim() || 'Não informado';

        const inputFoto = document.getElementById('foto-objeto');
        const arquivoFoto = inputFoto?.files[0];

        // 2. Validação simples
        if (!nomeObjeto) {
            alert('Por favor, informe o nome do objeto.');
            throw new Error('Nome obrigatório');
        }

        // 3. Preparar a Imagem (se houver)
        let fotoBase64 = null;
        if (arquivoFoto) {
            // Limite de tamanho simples (opcional, para não pesar o banco)
            if (arquivoFoto.size > 5 * 1024 * 1024) { // 5MB
                alert('A imagem é muito grande. Escolha uma menor que 5MB.');
                throw new Error('Imagem muito grande');
            }
            fotoBase64 = await converterImagemParaBase64(arquivoFoto);
        }

        // 4. Montar o objeto para o Backend
        // O banco espera: nome, categoria, descricao, localEncontrado, dataAchado, foto, perguntaValidacao, respostaValidacao
        const payload = {
            nome: nomeObjeto,
            categoria: categoriaMap[categoriaVal] || 'Outros',
            localEncontrado: localMap[localVal] || 'Outros',
            // Juntamos os dados pessoais na descrição, pois o banco não tem colunas separadas para "quem achou"
            descricao: `Encontrado por: ${nomeCompleto} (${matricula}). Detalhes: ${detalhesLocal}`,
            dataAchado: new Date(), // Data de agora
            foto: fotoBase64, // A string gigante da imagem ou null
            perguntaValidacao: pergunta,
            respostaValidacao: resposta
        };

        // 5. Enviar para a API
        const response = await fetch('https://plataforma-achados-e-perdidos.onrender.com/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // SUCESSO! Mostra o modal (Toast)
            mostrarToastSucesso();
            limparFormulario();
        } else {
            const erro = await response.json();
            alert('Erro ao cadastrar: ' + (erro.message || 'Erro desconhecido'));
        }

    } catch (error) {
        console.error('Erro no cadastro:', error);
        if (error.message !== 'Nome obrigatório' && error.message !== 'Imagem muito grande') {
            alert('Erro de conexão com o servidor. Verifique se o Backend está rodando.');
        }
    } finally {
        processandoCadastro = false;
        if (btnCadastrar) {
            btnCadastrar.disabled = false;
            btnCadastrar.innerHTML = textoOriginal;
        }
    }
}

/**
 * Mostra toast de sucesso (Mantive sua lógica original de UI)
 */
function mostrarToastSucesso() {
    const toastOverlay = document.getElementById('toast-overlay');
    if (toastOverlay) {
        toastOverlay.style.display = 'flex';
    }
}

/**
 * Limpa o formulário após cadastro
 */
function limparFormulario() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => input.value = '');
}

/**
 * Configurações de Eventos (Clicks, etc)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Botão Cadastrar
    const btnCadastrar = document.getElementById('btn-cadastrar');
    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', function(e) {
            e.preventDefault();
            cadastrarObjeto();
        });
    }

    // Botão Fechar do Toast
    const toastClose = document.getElementById('toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', () => {
            document.getElementById('toast-overlay').style.display = 'none';
        });
    }

    // Botão "Entregue" (Ação final do Toast)
    const btnEntregue = document.getElementById('btn-entregue');
    if (btnEntregue) {
        btnEntregue.addEventListener('click', function() {
            document.getElementById('toast-overlay').style.display = 'none';
            // Redireciona para a Home para ver o item novo na lista
            goToHome();
        });
    }

    // Navegação do Header
    const homeBtn = document.querySelector('.nav-item');
    if (homeBtn) {
        homeBtn.addEventListener('click', goToHome);
    }
});