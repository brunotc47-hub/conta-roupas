// Dados do aplicativo
let roupas = JSON.parse(localStorage.getItem('roupas')) || [];

// Elementos do DOM
const form = document.getElementById('roupa-form');
const tipoInput = document.getElementById('tipo');
const corInput = document.getElementById('cor');
const tamanhoInput = document.getElementById('tamanho');
const quantidadeInput = document.getElementById('quantidade');
const localInput = document.getElementById('local');
const descricaoInput = document.getElementById('descricao');
const roupasList = document.getElementById('roupas-list');
const searchInput = document.getElementById('search');
const filterTipo = document.getElementById('filter-tipo');
const filterLocal = document.getElementById('filter-local');
const totalRoupas = document.getElementById('total-roupas');
const totalTipos = document.getElementById('total-tipos');
const totalCores = document.getElementById('total-cores');
const totalLocais = document.getElementById('total-locais');
const btnLimparTudo = document.getElementById('btn-limpar-tudo');

// Event Listeners
form.addEventListener('submit', adicionarRoupa);
searchInput.addEventListener('input', filtrarRoupas);
filterTipo.addEventListener('change', filtrarRoupas);
filterLocal.addEventListener('change', filtrarRoupas);
btnLimparTudo.addEventListener('click', limparTudo);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    renderizarRoupas();
    atualizarEstatisticas();
    atualizarFiltros();
});

// Adicionar roupa
function adicionarRoupa(e) {
    e.preventDefault();

    const tipo = tipoInput.value;
    const cor = corInput.value.trim();
    const tamanho = tamanhoInput.value;
    const quantidade = parseInt(quantidadeInput.value);
    const local = localInput.value;
    const descricao = descricaoInput.value.trim();

    if (!tipo || !cor || !tamanho || !local || quantidade <= 0) {
        alert('⚠️ Preencha todos os campos obrigatórios!');
        return;
    }

    // Verificar se já existe
    const roupa = roupas.find(r => 
        r.tipo === tipo && 
        r.cor.toLowerCase() === cor.toLowerCase() && 
        r.tamanho === tamanho &&
        r.local === local
    );

    if (roupa) {
        roupa.quantidade += quantidade;
        roupa.descricao = descricao || roupa.descricao;
    } else {
        roupas.push({
            id: Date.now(),
            tipo,
            cor,
            tamanho,
            quantidade,
            local,
            descricao,
            data: new Date().toLocaleDateString('pt-BR')
        });
    }

    salvarDados();
    renderizarRoupas();
    atualizarEstatisticas();
    atualizarFiltros();
    form.reset();
    quantidadeInput.value = '1';
    
    mostrarNotificacao('✅ Roupa adicionada com sucesso!');
}

// Renderizar roupas
function renderizarRoupas(roupasParaRender = roupas) {
    if (roupasParaRender.length === 0) {
        roupasList.innerHTML = '<p class="empty-message">Nenhuma roupa encontrada 👕</p>';
        return;
    }

    roupasList.innerHTML = roupasParaRender.map(roupa => `
        <div class="roupa-card" onclick="selecionarRoupa(${roupa.id})">
            <div class="roupa-info">
                <div class="roupa-tipo">${roupa.tipo}</div>
                <div class="roupa-detalhes">
                    <strong>Cor:</strong> ${roupa.cor}
                </div>
                <div class="roupa-detalhes">
                    <strong>Tamanho:</strong> ${roupa.tamanho}
                </div>
                <div class="roupa-detalhes">
                    <strong>Local:</strong> ${roupa.local}
                </div>
                ${roupa.descricao ? `<div class="roupa-detalhes"><strong>📝</strong> ${roupa.descricao}</div>` : ''}
                <div class="roupa-detalhes" style="font-size: 0.8rem; color: #999;">
                    ${roupa.data}
                </div>
            </div>
            <div class="roupa-quantidade" title="Clique para aumentar">${roupa.quantidade}</div>
            <div class="roupa-actions">
                <button class="btn-mais" onclick="aumentarQuantidade(${roupa.id}); event.stopPropagation();">➕</button>
                <button class="btn-menos" onclick="diminuirQuantidade(${roupa.id}); event.stopPropagation();">➖</button>
                <button class="btn-delete" onclick="deletarRoupa(${roupa.id}); event.stopPropagation();">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Selecionar roupa (ao clicar no card)
function selecionarRoupa(id) {
    const roupa = roupas.find(r => r.id === id);
    if (roupa) {
        mostrarDetalheRoupa(roupa);
    }
}

// Mostrar detalhes da roupa
function mostrarDetalheRoupa(roupa) {
    const mensagem = `
👕 ${roupa.tipo}
🎨 Cor: ${roupa.cor}
📏 Tamanho: ${roupa.tamanho}
📦 Quantidade: ${roupa.quantidade}
🏠 Local: ${roupa.local}
${roupa.descricao ? `📝 ${roupa.descricao}` : ''}
📅 ${roupa.data}
    `;
    alert(mensagem);
}

// Aumentar quantidade
function aumentarQuantidade(id) {
    const roupa = roupas.find(r => r.id === id);
    if (roupa) {
        roupa.quantidade++;
        salvarDados();
        renderizarRoupas();
        atualizarEstatisticas();
        mostrarNotificacao(`➕ ${roupa.tipo} agora tem ${roupa.quantidade}`);
    }
}

// Diminuir quantidade
function diminuirQuantidade(id) {
    const roupa = roupas.find(r => r.id === id);
    if (roupa && roupa.quantidade > 1) {
        roupa.quantidade--;
        salvarDados();
        renderizarRoupas();
        atualizarEstatisticas();
        mostrarNotificacao(`➖ ${roupa.tipo} agora tem ${roupa.quantidade}`);
    } else if (roupa && roupa.quantidade === 1) {
        if (confirm('Deletar esta roupa?')) {
            deletarRoupa(id);
        }
    }
}

// Deletar roupa
function deletarRoupa(id) {
    const roupa = roupas.find(r => r.id === id);
    if (confirm(`🗑️ Tem certeza que quer deletar ${roupa.tipo}?`)) {
        roupas = roupas.filter(r => r.id !== id);
        salvarDados();
        renderizarRoupas();
        atualizarEstatisticas();
        atualizarFiltros();
        mostrarNotificacao('🗑️ Roupa removida!');
    }
}

// Filtrar roupas
function filtrarRoupas() {
    const searchTerm = searchInput.value.toLowerCase();
    const tipoSelecionado = filterTipo.value;
    const localSelecionado = filterLocal.value;
    
    const roupasFiltradas = roupas.filter(roupa => {
        const matchSearch = 
            roupa.tipo.toLowerCase().includes(searchTerm) ||
            roupa.cor.toLowerCase().includes(searchTerm) ||
            roupa.tamanho.toLowerCase().includes(searchTerm) ||
            (roupa.descricao && roupa.descricao.toLowerCase().includes(searchTerm));
        
        const matchTipo = tipoSelecionado === '' || roupa.tipo === tipoSelecionado;
        const matchLocal = localSelecionado === '' || roupa.local === localSelecionado;

        return matchSearch && matchTipo && matchLocal;
    });

    renderizarRoupas(roupasFiltradas);
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const total = roupas.reduce((sum, r) => sum + r.quantidade, 0);
    const tipos = new Set(roupas.map(r => r.tipo)).size;
    const cores = new Set(roupas.map(r => r.cor.toLowerCase())).size;
    const locais = new Set(roupas.map(r => r.local)).size;

    totalRoupas.textContent = total;
    totalTipos.textContent = tipos;
    totalCores.textContent = cores;
    totalLocais.textContent = locais;
}

// Atualizar opções de filtro
function atualizarFiltros() {
    // Filtro de tipos
    const tipos = [...new Set(roupas.map(r => r.tipo))].sort();
    const htmlTipos = tipos.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('');
    filterTipo.innerHTML = '<option value="">Todos os Tipos</option>' + htmlTipos;

    // Filtro de locais
    const locais = [...new Set(roupas.map(r => r.local))].sort();
    const htmlLocais = locais.map(local => `<option value="${local}">${local}</option>`).join('');
    filterLocal.innerHTML = '<option value="">Todos os Locais</option>' + htmlLocais;
}

// Limpar tudo
function limparTudo() {
    if (confirm('⚠️ Tem CERTEZA que quer deletar TODAS as roupas? Isso não pode ser desfeito!')) {
        if (confirm('🔴 CONFIRMAÇÃO FINAL: Deletar tudo mesmo?')) {
            roupas = [];
            salvarDados();
            renderizarRoupas();
            atualizarEstatisticas();
            atualizarFiltros();
            mostrarNotificacao('🗑️ Todas as roupas foram deletadas!');
        }
    }
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
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 2000);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);