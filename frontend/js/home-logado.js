/**
 * home-logado.js - Versão Final (Links Corrigidos para Produção)
 */

let todosObjetos = [];
let itemAtualId = null; 

document.addEventListener('DOMContentLoaded', function() {
    console.log("SISTEMA INICIADO: home-logado.js carregado!");
    verificarLogin();
    setupLogout();
    setupFilters();
    carregarObjetosDoBanco();
});

function verificarLogin() {
    const token = localStorage.getItem('token');
    if (!token) console.warn("Aviso: Sem token de login.");
}

// 1. BUSCAR ITENS NO BANCO (CORRETO)
async function carregarObjetosDoBanco() {
    const container = document.querySelector('.main-content');
    if(!container) return; 
    
    container.innerHTML = '<div class="loading-message">🔄 Buscando itens...</div>';

    try {
        // Link Atualizado ✅
        const response = await fetch('https://plataforma-achados-e-perdidos.onrender.com/api/items');
        if (!response.ok) throw new Error('Falha na API');

        todosObjetos = await response.json(); 
        renderizarCards(todosObjetos);
        atualizarContadores(todosObjetos);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="error-message">❌ Erro ao conectar no Backend.</div>';
    }
}

// 2. DESENHAR OS CARDS NA TELA
function renderizarCards(listaDeItens) {
    const container = document.querySelector('.main-content');
    container.innerHTML = ''; 

    if (listaDeItens.length === 0) {
        container.innerHTML = '<h3>Nenhum objeto encontrado.</h3>';
        return;
    }

    listaDeItens.forEach(item => {
        const dataFormatada = new Date(item.dataAchado).toLocaleDateString('pt-BR');
        const imagemSrc = item.foto ? item.foto : 'assets/camera-icon.svg'; 

        let corStatus = '#28a745'; 
        if (item.status === 'Devolvido') corStatus = '#6c757d'; 
        if (item.status === 'Encaminhado para doação') corStatus = '#17a2b8'; 

        const card = document.createElement('div');
        card.className = 'object-card';
        card.style.cursor = 'pointer'; 
        card.style.border = '1px solid #e0e0e0';

        card.innerHTML = `
            <div class="card-image" style="position: relative; height: 200px;">
                <span style="position: absolute; top: 10px; left: 10px; background: #ffc107; color: #000; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                    ${item.categoria || 'Outros'}
                </span>
                <img src="${imagemSrc}" alt="${item.nome}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>

            <div class="card-details" style="padding: 10px;">
                <div style="margin-bottom: 5px;">
                    <span style="background: ${corStatus}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">
                        ${item.status}
                    </span>
                </div>
                <h3>${item.nome}</h3>
                <p><strong>Local:</strong> ${item.localEncontrado}</p>
                <p>${dataFormatada}</p>
                
                <button class="btn-editar-card" style="background-color: #0056b3; color: white; border: none; padding: 10px; width: 100%; margin-top: 10px; cursor: pointer; border-radius: 5px;">
                    📝 EDITAR / DEVOLVER
                </button>
            </div>
        `;

        const acaoClique = (e) => {
            if(e) e.stopPropagation(); 
            abrirModalDetalhes(item);
        };

        const btnEditar = card.querySelector('.btn-editar-card');
        btnEditar.addEventListener('click', acaoClique);
        card.addEventListener('click', acaoClique);

        container.appendChild(card);
    });
}

// 3. ABRIR A JANELINHA (MODAL)
window.abrirModalDetalhes = function(item) {
    console.log("Abrindo modal para o ID:", item.id);
    itemAtualId = item.id; 
    
    const modal = document.getElementById('statusModal');
    
    // 1. FOTO e STATUS
    const img = document.getElementById('modal-item-image');
    if(img) img.src = item.foto || 'assets/placeholder.png';
    
    const statusSelect = document.getElementById('status-dropdown');
    if(statusSelect) statusSelect.value = item.status;

    // 2. PERGUNTA
    const inputPergunta = document.getElementById('validation-question');
    if (inputPergunta) {
        inputPergunta.value = item.perguntaValidacao || "Sem pergunta cadastrada";
        inputPergunta.disabled = true; 
    }

    // 3. RESPOSTA
    const inputResposta = document.getElementById('validation-answer');
    if (inputResposta) {
        inputResposta.value = ""; 
        inputResposta.placeholder = "Digite a resposta do aluno...";
        inputResposta.disabled = false; 
        
        inputResposta.dataset.gabarito = item.respostaValidacao || "";
    }

    modal.style.display = 'flex';
}

window.closeStatusModal = function() {
    document.getElementById('statusModal').style.display = 'none';
}

// 4. SALVAR ALTERAÇÃO
async function saveItemChanges() {
    const idItem = itemAtualId;
    
    const select = document.getElementById('status-dropdown');
    const novoStatus = select ? select.value : null;
    const token = localStorage.getItem('token'); 

    if (!idItem) return alert("Erro: ID do item perdido. Feche a janelinha e abra de novo.");
    if (!novoStatus) return alert("Erro: Selecione um status.");
    if (!token) return alert("Erro: Você não está logado.");

    let nome = "N/A", mat = "N/A";
    
    // --- LÓGICA DE VALIDAÇÃO ---
    if (novoStatus === 'Devolvido') {
        const campoResposta = document.getElementById('validation-answer');
        const respostaDigitada = campoResposta.value.trim().toLowerCase(); 
        const respostaCerta = (campoResposta.dataset.gabarito || "").trim().toLowerCase(); 

        console.log("Comparando:", respostaDigitada, "vs", respostaCerta);

        if (respostaDigitada !== respostaCerta) {
            return alert("❌ RESPOSTA INCORRETA!\nO objeto não pode ser devolvido se a validação falhar.");
        }

        alert("✅ Resposta Correta! Prossiga com a devolução.");
        
        nome = prompt("Quem está retirando? (Nome Completo)");
        if(!nome) return; 
        
        mat = prompt("Qual o SIAPE ou Matrícula?");
        if(!mat) return;
    } 
    else if (novoStatus === 'Encaminhado para doação') {
        nome = prompt("Para qual instituição foi doado?");
        if(!nome) return;
    }

    // Envia para o Backend
    try {
        // --- AQUI ESTAVA O ERRO! CORRIGIDO PARA URL DO RENDER ---
        const res = await fetch(`https://plataforma-achados-e-perdidos.onrender.com/api/items/${idItem}/devolucao`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ novoStatus, nomeRecebedor: nome, matriculaRecebedor: mat })
        });

        if (res.ok) {
            alert("Sucesso! Status atualizado. ✅");
            closeStatusModal();
            carregarObjetosDoBanco(); 
        } else {
            const erro = await res.json();
            alert("Erro do servidor: " + (erro.message || "Falha desconhecida"));
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão com o servidor.");
    }
}

// 5. EXCLUIR ITEM
async function deleteItem() {
    const idItem = itemAtualId; 
    const token = localStorage.getItem('token'); 

    if (!idItem) return alert("Erro: ID não encontrado");

    if (confirm("Tem certeza que deseja apagar este item para sempre?")) {
        try {
            // --- AQUI TAMBÉM PRECISAVA CORRIGIR ---
            const res = await fetch(`https://plataforma-achados-e-perdidos.onrender.com/api/items/${idItem}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                alert("Item apagado! 🗑️");
                closeStatusModal();
                carregarObjetosDoBanco();
            } else {
                alert("Erro ao apagar. Verifique suas permissões.");
            }
        } catch (e) {
            alert("Erro de conexão ao tentar apagar.");
        }
    }
}

// 6. FILTROS E LOGOUT
function setupLogout() {
    const btn = document.querySelector('.logout-btn');
    if(btn) {
        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
        });
    }
}

function setupFilters() {
    const checks = document.querySelectorAll('.filter-checkbox');
    checks.forEach(c => c.addEventListener('change', () => carregarObjetosDoBanco()));
}

function atualizarContadores(itens) {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(cb => {
        const tipo = cb.name;
        const valor = cb.value;
        const qtd = itens.filter(i => {
            if (tipo === 'categoria') return i.categoria === valor;
            if (tipo === 'lugar') return i.localEncontrado === valor;
            if (tipo === 'status') return i.status === valor;
            return false;
        }).length;
        
        const label = cb.nextElementSibling;
        if(label) {
            const span = label.querySelector('.category-count') || label.querySelector('.count');
            if(span) span.textContent = `(${qtd})`;
        }
    });
}