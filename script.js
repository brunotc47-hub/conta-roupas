// Dados do aplicativo
let roupas = JSON.parse(localStorage.getItem('roupas')) || [];

// Elementos do DOM
const form = document.getElementById('roupa-form');
const tipoInput = document.getElementById('tipo');
const corInput = document.getElementById('cor');
const tamanhoInput = document.getElementById('tamanho');
const quantidadeInput = document.getElementById('quantidade');
const roupasList = document.getElementById('roupas-list');
const searchInput = document.getElementById('search');
const totalRoupas = document.getElementById('total-roupas');
const totalTipos = document.getElementById('total-tipos');
const totalCores = document.getElementById('total-cores');

// Event Listeners
form.addEventListener('submit', adicionarRoupa);
searchInput.addEventListener('input', filtrarRoupas);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    renderizarRoupas();
    atualizarEstatisticas();
});

// Adicionar roupa
function adicionarRoupa(e) {
    e.preventDefault();

    const tipo = tipoInput.value;
    const cor = corInput.value.trim();
    const tamanho = tamanhoInput.value;
    const quantidade = parseInt(quantidadeInput.value);

    if (!tipo || !cor || !tamanho || quantidade <= 0) {
        alert('Preencha todos os campos!');
        return;
    }

    // Verificar se já existe
    const roupa = roupas.find(r => 
        r.tipo === tipo && 
        r.cor.toLowerCase() === cor.toLowerCase() && 
        r.tamanho === tamanho
    );

    if (roupa) {
        roupa.quantidade += quantidade;
    } else {
        roupas.push({
            id: Date.now(),
            tipo,
            cor,
            tamanho,
            quantidade,
            data: new Date().toLocaleDateString('pt-BR')
        });
    }

    salvarDados();
    renderizarRoupas();
    atualizarEstatisticas();
    form.reset();
    quantidadeInput.value = '1';
    
    mostrarNotificacao('✅ Roupa adicionada!');
}

// Renderizar roupas
function renderizarRoupas(roupasParaRender = roupas) {
    if (roupasParaRender.length === 0) {
        roupasList.innerHTML = '<p class="empty-message">Nenhuma roupa ainda 👕</p>';
        return;
    }

    roupasList.innerHTML = roupasParaRender.map(roupa => `
        <div class="roupa-card">
            <div class="roupa-info">
                <div class="roupa-tipo">${roupa.tipo}</div>
                <div class="roupa-detalhes">
                    <strong>${roupa.cor}</strong> - ${roupa.tamanho}
                </div>
                <div class="roupa-detalhes">${roupa.data}</div>
            </div>
            <div class="roupa-quantidade">${roupa.quantidade}</div>
            <button class="btn-delete" onclick="deletarRoupa(${roupa.id})">🗑️</button>
        </div>
    `).join('');
}

// Deletar roupa
function deletarRoupa(id) {
    if (confirm('Deletar esta roupa?')) {
        roupas = roupas.filter(r => r.id !== id);
        salvarDados();
        renderizarRoupas();
        atualizarEstatisticas();
        mostrarNotificacao('🗑️ Roupa removida!');
    }
}

// Filtrar roupas
function filtrarRoupas() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const roupasFiltradas = roupas.filter(roupa => {
        return roupa.tipo.toLowerCase().includes(searchTerm) ||
               roupa.cor.toLowerCase().includes(searchTerm) ||
               roupa.tamanho.toLowerCase().includes(searchTerm);
    });

    renderizarRoupas(roupasFiltradas);
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const total = roupas.reduce((sum, r) => sum + r.quantidade, 0);
    const tipos = new Set(roupas.map(r => r.tipo)).size;
    const cores = new Set(roupas.map(r => r.cor.toLowerCase())).size;

    totalRoupas.textContent = total;
    totalTipos.textContent = tipos;
    totalCores.textContent = cores;
}

// Salvar dados
function salvarDados() {
    localStorage.setItem('roupas', JSON.stringify(roupas));
}

// Notificação
function mostrarNotificacao(mensagem) {
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    `;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.remove();
    }, 2000);
}