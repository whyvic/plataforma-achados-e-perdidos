/**
 * Sistema de pesquisa e filtros para objetos perdidos/encontrados
 * Gerencia carregamento de dados, renderização e filtros da aplicação
 */

let allCards = [];
let allItems = [];
let filteredItems = [];
let currentSearchTerm = '';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Inicializa a aplicação configurando eventos e carregando dados
 */
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    loadItemsFromAPI();
    setupSearchEvents();
    setupFilterEvents();
});

/**
 * Configura eventos de navegação do header
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
            // Já na página home - sem ação necessária
        });
    }
    
    if (navItems[1]) {
        const cadastrarBtn = navItems[1];
        cadastrarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cadastrar-objeto.html';
        });
        cadastrarBtn.style.cursor = 'pointer';
    }
}

/**
 * Carrega itens da API ou dados de exemplo como fallback
 * Integra com localStorage para objetos cadastrados localmente
 */
async function loadItemsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        if (response.ok) {
            allItems = await response.json();
        } else {
            loadExampleData();
        }
    } catch (error) {
        console.error('Erro de conexão com a API:', error);
        loadExampleData();
    }
    
    loadObjectsFromLocalStorage();
    renderItems(allItems);
    updateFilterCounts();
}

/**
 * Carrega objetos cadastrados localmente evitando duplicatas
 */
function loadObjectsFromLocalStorage() {
    try {
        const objetosLocais = JSON.parse(localStorage.getItem('objetosEncontrados')) || [];
        
        if (objetosLocais.length > 0) {
            const objetosNovos = objetosLocais.filter(objetoLocal => {
                const jaExiste = allItems.some(itemExistente => {
                    return itemExistente.id === objetoLocal.id || 
                           (itemExistente.nome === objetoLocal.nome && 
                            itemExistente.categoria === objetoLocal.categoria && 
                            itemExistente.localEncontrado === objetoLocal.localEncontrado);
                });
                return !jaExiste;
            });
            
            if (objetosNovos.length > 0) {
                allItems = [...allItems, ...objetosNovos];
                updateFilterCounts();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar objetos do localStorage:', error);
    }
}

/**
 * Carrega dados de exemplo para demonstração da aplicação
 * Utilizado como fallback quando a API não está disponível
 */
function loadExampleData() {
    allItems = [
        {
            id: 1,
            nome: "Garrafa Térmica Rosa",
            categoria: "Garrafas",
            descricao: "Garrafa térmica de cor rosa, marca Goldentec",
            localEncontrado: "Sala 10, Bloco 2",
            dataAchado: "2026-01-10T10:21:00.000Z",
            status: "Encontrado",
            foto: "assets/garrafa-termica-tampa.png"
        },
        {
            id: 2,
            nome: "Cartão do RU",
            categoria: "Cartões",
            descricao: "Cartão do Restaurante Universitário",
            localEncontrado: "Biblioteca Central",
            dataAchado: "2026-01-11T11:24:00.000Z",
            status: "Encontrado",
            foto: "assets/cartao_ru_gr.png"
        },
        {
            id: 3,
            nome: "Fone de Ouvido Bluetooth",
            categoria: "Eletrônicos",
            descricao: "Fone de ouvido sem fio, cor preta",
            localEncontrado: "Laboratório de Informática",
            dataAchado: "2026-01-08T16:30:00.000Z",
            status: "Encontrado",
            foto: "assets/fone.jpg"
        },
        {
            id: 4,
            nome: "Óculos de Grau",
            categoria: "Outros",
            descricao: "Óculos de grau com armação preta",
            localEncontrado: "Sala 8, Bloco 2",
            dataAchado: "2026-01-06T13:20:00.000Z",
            status: "Encontrado",
            foto: "assets/oculos_grau.jpg"
        }
    ];
    
    loadObjectsFromLocalStorage();
    renderItems(allItems);
    updateFilterCounts();
}

/**
 * Renderiza lista de itens na interface em formato de grid
 * @param {Array} items - Array de objetos para renderizar
 */
function renderItems(items) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }

    const existingCards = mainContent.querySelectorAll('.cards-row, div[style*="text-align: center"]');
    existingCards.forEach(element => element.remove());

    if (items.length === 0) {
        const noItemsMessage = document.createElement('div');
        noItemsMessage.style.cssText = 'text-align: center; padding: 50px; color: #666; font-family: Arial, sans-serif;';
        noItemsMessage.innerHTML = 'Nenhum objeto encontrado';
        noItemsMessage.classList.add('no-items-message');
        mainContent.appendChild(noItemsMessage);
        allCards = [];
        return;
    }

    const idsUnicos = new Set(items.map(item => item.id));
    if (items.length !== idsUnicos.size) {
        console.error('Duplicatas detectadas na renderização!');
    }

    let currentRow = null;
    items.forEach((item, index) => {
        if (index % 3 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'cards-row';
            mainContent.appendChild(currentRow);
        }

        const card = createCardElement(item);
        currentRow.appendChild(card);
    });

    allCards = document.querySelectorAll('.object-card');
}

/**
 * Cria elemento de card para um item
 * @param {Object} item - Objeto a ser renderizado
 * @returns {HTMLElement} Elemento div do card
 */
function createCardElement(item) {
    const card = document.createElement('div');
    card.className = 'object-card';
    card.dataset.category = item.categoria?.toLowerCase() || '';
    card.dataset.location = item.localEncontrado?.toLowerCase() || '';
    card.dataset.status = item.status?.toLowerCase() || 'encontrado';
    
    const categoryClass = getCategoryClass(item.categoria);
    const statusClass = getStatusClass(item.status);
    
    const isLoggedPage = window.location.pathname.includes('logado');
    const cardContentClass = isLoggedPage ? 'card-content' : 'card-info';
    
    card.innerHTML = `
        <div class="card-image ${categoryClass.bgClass}">
            ${item.foto ? `<img src="${item.foto}" alt="${item.nome}" class="item-photo" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">` : `<div class="placeholder-icon">📦</div>`}
            <div class="category-tag ${categoryClass.tagClass}">
                ${isLoggedPage ? `<span>${item.categoria || 'Outros'}</span>` : (item.categoria || 'Outros')}
            </div>
        </div>
        <div class="${cardContentClass}">
            ${isLoggedPage ? `
                <div class="status-tag ${statusClass}">
                    <span>${item.status || 'Encontrado'}</span>
                </div>
            ` : ''}
            <h4>${item.nome || 'Item sem nome'}</h4>
            <div class="card-details">
                <p>Encontrado: ${item.localEncontrado || 'Local não informado'}</p>
                <p>Data: ${formatDate(item.dataAchado || item.createdAt)}</p>
                ${item.descricao ? `<p>Descrição: ${item.descricao}</p>` : ''}
            </div>
        </div>
    `;
    
    if (isLoggedPage) {
        card.addEventListener('click', () => {
            openStatusModal(item);
        });
        card.style.cursor = 'pointer';
    }
    
    return card;
}

/**
 * Obtém classes CSS baseadas na categoria do item
 * @param {string} categoria - Categoria do item
 * @returns {Object} Objeto com classes de background e tag
 */
function getCategoryClass(categoria) {
    const categoryMap = {
        'garrafas': { bgClass: 'garrafa-bg', tagClass: 'garrafa-tag' },
        'cartões': { bgClass: 'cartao-bg', tagClass: 'cartoes-tag' },
        'chaveiros': { bgClass: 'chaves-bg', tagClass: 'chaveiros-tag' },
        'eletrônicos': { bgClass: 'eletronico-bg', tagClass: 'eletronicos-tag' },
        'chaves': { bgClass: 'chaves-bg', tagClass: 'chaveiros-tag' },
        'cartão': { bgClass: 'cartao-bg', tagClass: 'cartoes-tag' },
        'garrafa': { bgClass: 'garrafa-bg', tagClass: 'garrafa-tag' }
    };
    
    const key = categoria?.toLowerCase() || 'outros';
    return categoryMap[key] || { bgClass: 'outros-bg', tagClass: 'outros-tag' };
}

/**
 * Obtém classe CSS baseada no status do item
 * @param {string} status - Status do item
 * @returns {string} Classe CSS do status
 */
function getStatusClass(status) {
    const statusMap = {
        'encontrado': 'encontrado-tag',
        'devolvido': 'devolvido-tag',
        'encaminhado para doação': 'doacao-tag'
    };
    
    return statusMap[status?.toLowerCase()] || 'encontrado-tag';
}

/**
 * Formatar data para exibição em formato brasileiro
 * @param {string} dateString - String da data
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

/**
 * Atualiza contadores dos filtros na interface
 */
function updateFilterCounts() {
    const categoryCounts = {};
    const locationCounts = {};
    const statusCounts = {};
    
    allItems.forEach(item => {
        const category = item.categoria || 'Outros';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        
        const location = extractMainLocation(item.localEncontrado || 'Não informado');
        locationCounts[location] = (locationCounts[location] || 0) + 1;
        
        const status = item.status || 'Encontrado';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    updateFilterCountsUI(categoryCounts, locationCounts, statusCounts);
}

/**
 * Extrai localização principal de uma descrição completa
 * @param {string} fullLocation - Localização completa
 * @returns {string} Localização principal categorizada
 */
function extractMainLocation(fullLocation) {
    const locationMap = {
        'sala': 'Sala de Aula',
        'laboratório': 'Laboratório', 
        'lab': 'Laboratório',
        'biblioteca': 'Biblioteca',
        'cantina': 'Cantina',
        'ru': 'RU',
        'auditório': 'Auditório',
        'hall': 'Hall de entrada',
        'pátio': 'Pátio',
        'estacionamento': 'Estacionamento'
    };
    
    const location = fullLocation.toLowerCase();
    for (const [key, value] of Object.entries(locationMap)) {
        if (location.includes(key)) {
            return value;
        }
    }
    return 'Outros locais';
}

/**
 * Configura eventos de pesquisa
 */
function setupSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * Manipula entrada de pesquisa
 */
function handleSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    if (searchInput.value.trim()) {
        if (clearBtn) clearBtn.style.display = 'block';
        performSearch();
    } else {
        if (clearBtn) clearBtn.style.display = 'none';
        clearSearch();
    }
}

/**
 * Executa pesquisa baseada no termo inserido
 */
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    currentSearchTerm = searchTerm;
    
    if (!searchTerm) {
        showAllItems();
        return;
    }
    
    const filteredItems = allItems.filter(item => {
        const title = item.nome?.toLowerCase() || '';
        const description = item.descricao?.toLowerCase() || '';
        const location = item.localEncontrado?.toLowerCase() || '';
        
        return title.includes(searchTerm) || 
               description.includes(searchTerm) || 
               location.includes(searchTerm);
    });
    
    renderItems(filteredItems);
    updateResultsDisplay();
}

/**
 * Limpa pesquisa e mostra todos os itens
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    currentSearchTerm = '';
    showAllItems();
}

/**
 * Mostra todos os itens disponíveis
 */
function showAllItems() {
    renderItems(allItems);
    updateResultsDisplay();
}

/**
 * Aplica todos os filtros selecionados
 */
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value?.toLowerCase() || '';
    const categoryFilters = getCheckedValues('categoria');
    const locationFilters = getCheckedValues('lugar');
    const statusFilters = getCheckedValues('status');
    
    if (!allItems || allItems.length === 0) {
        console.error('allItems não está definido ou vazio!');
        return;
    }
    
    let filteredItems = [...allItems];
    
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => {
            const matches = item.nome.toLowerCase().includes(searchTerm) ||
                           item.descricao.toLowerCase().includes(searchTerm);
            return matches;
        });
    }
    
    if (categoryFilters.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const itemCategory = (item.categoria || '').toLowerCase();
            const matches = categoryFilters.some(filter => {
                const filterLower = filter.toLowerCase();
                return itemCategory === filterLower || 
                       itemCategory.includes(filterLower) || 
                       filterLower.includes(itemCategory);
            });
            return matches;
        });
    }
    
    if (locationFilters.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const itemLocation = (item.localEncontrado || '').toLowerCase();
            const matches = locationFilters.some(filter => {
                const filterLower = filter.toLowerCase();
                
                if (filterLower === 'sala de aula' && itemLocation.includes('sala')) return true;
                if (filterLower === 'laboratório' && (itemLocation.includes('lab') || itemLocation.includes('laboratório'))) return true;
                if (filterLower === 'biblioteca' && itemLocation.includes('biblioteca')) return true;
                if (filterLower === 'cantina' && itemLocation.includes('cantina')) return true;
                if (filterLower === 'ru' && itemLocation.toLowerCase().includes('ru')) return true;
                if (filterLower === 'hall' && itemLocation.includes('hall')) return true;
                if (filterLower === 'estacionamento' && itemLocation.includes('estacionamento')) return true;
                
                return itemLocation.includes(filterLower) || filterLower.includes(itemLocation);
            });
            return matches;
        });
    }
    
    if (statusFilters.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const itemStatus = (item.status || '').toLowerCase();
            const matches = statusFilters.some(filter => {
                const filterLower = filter.toLowerCase();
                return itemStatus === filterLower || 
                       itemStatus.includes(filterLower) || 
                       filterLower.includes(itemStatus);
            });
            return matches;
        });
    }
    
    if (currentSearchTerm) {
        filteredItems = filteredItems.filter(item => {
            const title = (item.nome || '').toLowerCase();
            const description = (item.descricao || '').toLowerCase();
            const location = (item.localEncontrado || '').toLowerCase();
            
            return title.includes(currentSearchTerm) || 
                   description.includes(currentSearchTerm) || 
                   location.includes(currentSearchTerm);
        });
    }
    
    renderItems(filteredItems);
    updateResultsDisplay();
}

/**
 * Atualiza display dos resultados da pesquisa/filtros
 */
function updateResultsDisplay() {
    const visibleCards = document.querySelectorAll('.object-card');
    
    const resultsCounter = document.getElementById('results-counter');
    if (resultsCounter) {
        resultsCounter.textContent = `${visibleCards.length} objeto(s) encontrado(s)`;
    }
}

/**
 * Atualiza interface dos contadores de filtro
 * @param {Object} categoryCounts - Contadores de categoria
 * @param {Object} locationCounts - Contadores de localização
 * @param {Object} statusCounts - Contadores de status
 */
function updateFilterCountsUI(categoryCounts, locationCounts, statusCounts) {
    updateCategoryCounters(categoryCounts);
    updateLocationCounters(locationCounts);
    updateStatusCounters(statusCounts);
}

/**
 * Atualiza contadores de categoria na interface
 * @param {Object} counts - Contadores por categoria
 */
function updateCategoryCounters(counts) {
    const categoryElements = document.querySelectorAll('.category-name, .filter-info span:first-child');
    
    categoryElements.forEach(element => {
        const categoryName = element.textContent.trim();
        let count = 0;
        
        Object.keys(counts).forEach(countKey => {
            if (categoryName.toLowerCase().includes(countKey.toLowerCase()) || 
                countKey.toLowerCase().includes(categoryName.toLowerCase())) {
                count += counts[countKey] || 0;
            }
        });
        
        const countElement = element.parentElement.querySelector('.category-count, .count');
        if (countElement) {
            countElement.textContent = `(${count})`;
        }
    });
}

/**
 * Atualiza contadores de localização na interface
 * @param {Object} counts - Contadores por localização
 */
function updateLocationCounters(counts) {
    const locationElements = document.querySelectorAll('.filter-section:nth-child(3) .filter-info span:first-child, .filter-section:nth-child(3) .category-name');
    
    locationElements.forEach(element => {
        const locationName = element.textContent.trim();
        let count = 0;
        
        Object.keys(counts).forEach(countKey => {
            if (locationName.toLowerCase().includes(countKey.toLowerCase()) || 
                countKey.toLowerCase().includes(locationName.toLowerCase())) {
                count += counts[countKey] || 0;
            }
        });
        
        const countElement = element.parentElement.querySelector('.category-count, .count');
        if (countElement) {
            countElement.textContent = `(${count})`;
        }
    });
}

/**
 * Atualiza contadores de status na interface
 * @param {Object} counts - Contadores por status
 */
function updateStatusCounters(counts) {
    const statusMap = {
        'encontrado': counts['Encontrado'] || 0,
        'devolvido': counts['Devolvido'] || 0,  
        'encaminhado para doação': counts['Encaminhado para doação'] || 0
    };
    
    const statusSelectors = [
        '.filter-section .filter-item label[for^="status-"] .category-count',
        '.filter-section .filter-item label[for^="status-"] .count'
    ];
    
    statusSelectors.forEach(selector => {
        const statusElements = document.querySelectorAll(selector);
        
        statusElements.forEach(countElement => {
            const label = countElement.closest('label');
            if (label) {
                const statusId = label.getAttribute('for');
                let count = 0;
                
                if (statusId === 'status-encontrado') {
                    count = statusMap['encontrado'];
                } else if (statusId === 'status-devolvido') {
                    count = statusMap['devolvido'];  
                } else if (statusId === 'status-doacao') {
                    count = statusMap['encaminhado para doação'];
                }
                
                countElement.textContent = `(${count})`;
            }
        });
    });
}

/**
 * Abre modal de status para edição de item (página do porteiro)
 * @param {Object} item - Item para editar
 */
function openStatusModal(item) {
    const modal = document.getElementById('statusModal');
    
    if (!modal) {
        console.error('Modal não encontrado no DOM!');
        alert('Erro: Modal não encontrado');
        return;
    }
    
    const modalImage = document.getElementById('modal-item-image');
    const validationQuestion = document.getElementById('validation-question');
    const validationAnswer = document.getElementById('validation-answer');
    const statusDropdown = document.getElementById('status-dropdown');
    
    window.currentModalItem = item;
    
    if (modalImage) {
        if (item.foto) {
            modalImage.src = item.foto;
            modalImage.alt = item.nome || 'Objeto';
            modalImage.style.display = 'block';
        } else {
            modalImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVWMTI1TTc1IDEwMEgxMjUiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K';
            modalImage.alt = 'Sem imagem';
            modalImage.style.display = 'block';
        }
    }
    
    if (validationQuestion) {
        validationQuestion.value = item.perguntaValidacao || '';
    }
    
    if (validationAnswer) {
        validationAnswer.value = item.respostaValidacao || '';
    }
    
    if (statusDropdown) {
        statusDropdown.value = item.status || 'Encontrado';
    }
    
    modal.style.display = 'flex';
}

/**
 * Fecha modal de status
 */
function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.currentModalItem = null;
}

/**
 * Salva alterações do item editado no modal
 */
function saveItemChanges() {
    const item = window.currentModalItem;
    if (!item) {
        console.error('Nenhum item selecionado para salvar');
        return;
    }
    
    const validationQuestion = document.getElementById('validation-question')?.value || '';
    const validationAnswer = document.getElementById('validation-answer')?.value || '';
    const newStatus = document.getElementById('status-dropdown')?.value || item.status;
    
    const itemIndex = allItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
        allItems[itemIndex].perguntaValidacao = validationQuestion;
        allItems[itemIndex].respostaValidacao = validationAnswer;
        allItems[itemIndex].status = newStatus;
        
        updateLocalStorageItem(allItems[itemIndex]);
    }
    
    renderItems(allItems);
    updateFilterCounts();
    closeStatusModal();
    showSaveToast();
}

/**
 * Exclui item selecionado
 */
function deleteItem() {
    const item = window.currentModalItem;
    if (!item) {
        console.error('Nenhum item selecionado para excluir');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir "${item.nome}"?`)) {
        return;
    }
    
    const itemIndex = allItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
        allItems.splice(itemIndex, 1);
        removeFromLocalStorage(item.id);
    }
    
    renderItems(allItems);
    updateFilterCounts();
    closeStatusModal();
    showDeleteToast();
}

/**
 * Mostra toast de sucesso ao salvar item
 */
function showSaveToast() {
    const toastHTML = `
        <div id="save-toast-overlay" class="toast-overlay" style="display: flex;">
            <div class="toast-modal">
                <header class="toast-header">
                    <span class="toast-title">Status do produto</span>
                    <button class="toast-close-btn" onclick="closeSaveToast()">&times;</button>
                </header>
                <main class="toast-content">
                    <h1>Sucesso!</h1>
                    <p>Seu produto foi salvo com sucesso</p>
                </main>
                <footer class="toast-footer">
                    <button class="btn-toast-action" onclick="closeSaveToast()">
                        <span class="check-icon"></span>
                        OK
                    </button>
                </footer>
            </div>
        </div>
    `;
    
    const existingToast = document.getElementById('save-toast-overlay');
    if (existingToast) {
        existingToast.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', toastHTML);
}

/**
 * Mostra toast de sucesso ao excluir item
 */
function showDeleteToast() {
    const toastHTML = `
        <div id="delete-toast-overlay" class="toast-overlay" style="display: flex;">
            <div class="toast-modal">
                <header class="toast-header">
                    <span class="toast-title">Exclusão do produto</span>
                    <button class="toast-close-btn" onclick="closeDeleteToast()">&times;</button>
                </header>
                <main class="toast-content">
                    <h1>Sucesso!</h1>
                    <p>Seu produto foi excluído com sucesso</p>
                </main>
                <footer class="toast-footer">
                    <button class="btn-toast-action" onclick="closeDeleteToast()">
                        <span class="check-icon"></span>
                        OK
                    </button>
                </footer>
            </div>
        </div>
    `;
    
    const existingToast = document.getElementById('delete-toast-overlay');
    if (existingToast) {
        existingToast.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', toastHTML);
}

/**
 * Fecha toast de salvamento
 */
function closeSaveToast() {
    const toast = document.getElementById('save-toast-overlay');
    if (toast) {
        toast.remove();
    }
}

/**
 * Fecha toast de exclusão
 */
function closeDeleteToast() {
    const toast = document.getElementById('delete-toast-overlay');
    if (toast) {
        toast.remove();
    }
}

window.openStatusModal = openStatusModal;
window.closeStatusModal = closeStatusModal;
window.saveItemChanges = saveItemChanges;
window.deleteItem = deleteItem;
window.closeSaveToast = closeSaveToast;
window.closeDeleteToast = closeDeleteToast;

/**
 * Atualiza item no localStorage
 * @param {Object} updatedItem - Item atualizado
 */
function updateLocalStorageItem(updatedItem) {
    try {
        let objetosLocais = JSON.parse(localStorage.getItem('objetosEncontrados')) || [];
        const localIndex = objetosLocais.findIndex(obj => obj.id === updatedItem.id);
        
        if (localIndex !== -1) {
            objetosLocais[localIndex] = { ...objetosLocais[localIndex], ...updatedItem };
            localStorage.setItem('objetosEncontrados', JSON.stringify(objetosLocais));
        }
    } catch (error) {
        console.error('Erro ao atualizar item no localStorage:', error);
    }
}

/**
 * Remove item do localStorage
 * @param {number|string} itemId - ID do item a ser removido
 */
function removeFromLocalStorage(itemId) {
    try {
        let objetosLocais = JSON.parse(localStorage.getItem('objetosEncontrados')) || [];
        objetosLocais = objetosLocais.filter(obj => obj.id !== itemId);
        localStorage.setItem('objetosEncontrados', JSON.stringify(objetosLocais));
    } catch (error) {
        console.error('Erro ao remover item do localStorage:', error);
    }
}

/**
 * Configura eventos de filtro para checkboxes e itens
 */
function setupFilterEvents() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    const filterItems = document.querySelectorAll('.filter-item');
    
    filterItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('.filter-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    applyFilters();
                }
            }
        });
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyFilters();
        });
    }
}

/**
 * Obtém valores selecionados de um grupo de filtros
 * @param {string} filterName - Nome do grupo de filtros
 * @returns {Array} Array com valores selecionados
 */
function getCheckedValues(filterName) {
    const values = [];
    
    const checkboxes = document.querySelectorAll(`input[name="${filterName}"]:checked`);
    
    const allCheckboxes = document.querySelectorAll(`input[name="${filterName}"]`);
    
    if (checkboxes.length > 0) {
        const checkedValues = Array.from(checkboxes).map(cb => cb.value);
        return checkedValues;
    }
    
    return values;
}

/**
 * Alterna visibilidade da sidebar mobile
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

/**
 * Fecha sidebar mobile
 */
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

/**
 * Foca no campo de pesquisa (compatibilidade)
 */
function openSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    }
}