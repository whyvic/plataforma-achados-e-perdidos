/**
 * Sistema da página inicial (home)
 */

/**
 * Configura a navegação da página
 * @returns {void}
 */
function setupNavigation() {
    const navLogin = document.querySelector('.nav-login');
    if (navLogin) {
        navLogin.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    const navItems = document.querySelectorAll('.nav-item');
    
    if (navItems[0]) {
        navItems[0].addEventListener('click', function() {
            // Já estamos na home
        });
    }
    
    if (navItems[1]) {
        const cadastrarBtn = navItems[1];
        
        cadastrarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cadastrar-objeto.html';
        });
        
        cadastrarBtn.style.cursor = 'pointer';
    } else {
        console.error('Botão Cadastrar objeto não encontrado!');
    }
    
    setupModalEvents();
}

/**
 * Configura eventos do modal
 * @returns {void}
 */
function setupModalEvents() {
    const modal = document.getElementById('modal-objeto-perdido');
    const closeBtn = document.querySelector('.close');
    const excluirBtn = document.querySelector('.excluir');
    const salvarBtn = document.querySelector('.salvar');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    if (excluirBtn) {
        excluirBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    if (salvarBtn) {
        salvarBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
}

/**
 * Abre o modal para um item específico
 * @param {Object} item - Item a ser exibido no modal
 * @returns {void}
 */
function openModal(item) {
    const modal = document.getElementById('modal-objeto-perdido');
    modal.style.display = 'flex';
}

/**
 * Busca os itens da API e os renderiza na tela
 * @returns {Promise<void>}
 */
async function fetchAndRenderItems() {
    const itemsGrid = document.getElementById('items-grid');
    if (!itemsGrid) {
        console.error('Elemento da grade de itens não encontrado.');
        return;
    }

    try {
        // Simulação de dados para desenvolvimento sem backend
        const items = [
            {
                id: 1,
                nome: 'Garrafa Térmica Azul',
                localEncontrado: 'Biblioteca Central, mesa 3',
                dataHora: '2026-01-10T09:30:00'
            },
            {
                id: 2,
                nome: 'Chaves com Chaveiro do Star Wars',
                localEncontrado: 'Bloco 5, corredor principal',
                dataHora: '2026-01-10T14:00:00'
            },
            {
                id: 3,
                nome: 'Livro Cálculo Vol. 1',
                localEncontrado: 'Sala 201',
                dataHora: '2026-01-09T18:15:00'
            },
            {
                id: 4,
                nome: 'Fone de Ouvido Bluetooth Branco',
                localEncontrado: 'Cantina',
                dataHora: '2026-01-09T12:45:00'
            }
        ];

        renderItems(items);
    } catch (error) {
        console.error('Erro ao buscar e renderizar objetos:', error);
        itemsGrid.innerHTML = '<p>Não foi possível carregar os objetos. Tente novamente mais tarde.</p>';
    }
}

/**
 * Renderiza a lista de itens na grade
 * @param {Array} items - A lista de objetos a serem renderizados
 * @returns {void}
 */
function renderItems(items) {
    const itemsGrid = document.getElementById('items-grid');
    itemsGrid.innerHTML = '';

    if (items.length === 0) {
        itemsGrid.innerHTML = '<p>Nenhum objeto encontrado no momento.</p>';
        return;
    }

    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        const dataHora = new Date(item.dataHora);
        const dataFormatada = dataHora.toLocaleDateString('pt-BR');
        const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        itemDiv.innerHTML = `
            <p>${item.nome}</p>
            <p>Encontrado: ${item.localEncontrado}</p>
            <p>Data e horário: ${dataFormatada} às ${horaFormatada}</p>
        `;

        itemDiv.onclick = () => openModal(item);
        itemsGrid.appendChild(itemDiv);
    });
}

/**
 * Configura interatividade dos cards
 * @returns {void}
 */
function setupCardInteractivity() {
    const objectCards = document.querySelectorAll('.object-card');
    
    objectCards.forEach(card => {
        card.addEventListener('click', function() {
            // Ação ao clicar no card
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Configura interatividade dos checkboxes de filtro
 * @returns {void}
 */
function setupFilterInteractivity() {
    const checkboxes = document.querySelectorAll('.checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            this.classList.toggle('checked');
        });
    });
}

/**
 * Inicialização da página home
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupCardInteractivity();
    setupFilterInteractivity();
});
