// Variáveis globais
let db = null;
let allKeys = [];
let currentFilter = 'all';

// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC_8ET--x3S0RFfEd_BsxN14COLiR0XJRQ",
    authDomain: "gerador-de-key-de-romance.firebaseapp.com",
    projectId: "gerador-de-key-de-romance",
    storageBucket: "gerador-de-key-de-romance.firebasestorage.app",
    messagingSenderId: "797723028748",
    appId: "1:797723028748:web:cceb6f266ce5fa6986ad29",
    measurementId: "G-FV46Z6W0K3",
};

// Inicializar Firebase quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log('Firebase inicializado com sucesso');
        loadKeys();
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        showToast('Erro ao conectar com Firebase', true);
    }
});

// Gerar chave aleatória
function generateRandomKey() {
    return Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    ).join('-');
}

// Abrir modal
function openGenerateModal() {
    document.getElementById('generateModal').classList.add('active');
}

// Fechar modal
function closeGenerateModal() {
    document.getElementById('generateModal').classList.remove('active');
}

// Gerar keys
async function generateKeys() {
    if (!db) {
        showToast('Firebase não está inicializado. Aguarde alguns segundos.', true);
        return;
    }

    const quantity = parseInt(document.getElementById('quantityInput').value);
    
    try {
        for (let i = 0; i < quantity; i++) {
            const key = generateRandomKey();
            await db.collection('keys').add({
                key: key,
                status: 'inactive',
                durationDays: 30,
                createdAt: firebase.firestore.Timestamp.now(),
                activatedAt: null,
                expiresAt: null,
                pausedAt: null,
                remainingMs: null,
            });
        }
        showToast(`${quantity} key(s) gerada(s) com sucesso!`);
        closeGenerateModal();
        document.getElementById('quantityInput').value = '1';
        loadKeys();
    } catch (error) {
        showToast('Erro ao gerar keys: ' + error.message, true);
        console.error(error);
    }
}

// Carregar keys
async function loadKeys() {
    if (!db) return;
    
    try {
        const snapshot = await db.collection('keys').orderBy('createdAt', 'desc').get();
        allKeys = [];
        snapshot.forEach(doc => {
            allKeys.push({ id: doc.id, ...doc.data() });
        });
        updateStats();
        renderKeys();
    } catch (error) {
        console.error('Erro ao carregar keys:', error);
    }
}

// Atualizar estatísticas
function updateStats() {
    const stats = {
        total: allKeys.length,
        active: allKeys.filter(k => k.status === 'active').length,
        inactive: allKeys.filter(k => k.status === 'inactive').length,
        paused: allKeys.filter(k => k.status === 'paused').length,
        expired: allKeys.filter(k => k.status === 'expired').length,
    };

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-active').textContent = stats.active;
    document.getElementById('stat-inactive').textContent = stats.inactive;
    document.getElementById('stat-paused').textContent = stats.paused;
    document.getElementById('stat-expired').textContent = stats.expired;
}

// Renderizar keys
function renderKeys() {
    const container = document.getElementById('keysContainer');
    let filtered = allKeys;

    if (currentFilter !== 'all') {
        filtered = allKeys.filter(k => k.status === currentFilter);
    }

    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(k => k.key.includes(searchTerm));
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔑</div>
                <p>Nenhuma key encontrada.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(key => {
        let createdDate = 'N/A';
        let activatedDate = '';
        let expiresDate = '';

        if (key.createdAt) {
            const date = key.createdAt.toDate ? key.createdAt.toDate() : new Date(key.createdAt);
            createdDate = date.toLocaleDateString('pt-BR');
        }

        if (key.activatedAt) {
            const date = key.activatedAt.toDate ? key.activatedAt.toDate() : new Date(key.activatedAt);
            activatedDate = ` • Ativada em ${date.toLocaleDateString('pt-BR')}`;
        }

        if (key.expiresAt) {
            const date = key.expiresAt.toDate ? key.expiresAt.toDate() : new Date(key.expiresAt);
            expiresDate = ` • Expira em ${date.toLocaleDateString('pt-BR')}`;
        }

        let details = `Criada em ${createdDate}${activatedDate}${expiresDate}`;

        let actions = '';
        if (key.status === 'inactive') {
            actions = `<button class="action-btn btn-activate" onclick="activateKey('${key.id}')">Ativar</button>`;
        } else if (key.status === 'active') {
            actions = `<button class="action-btn btn-pause" onclick="pauseKey('${key.id}')">Pausar</button>`;
        } else if (key.status === 'paused') {
            actions = `<button class="action-btn btn-activate" onclick="resumeKey('${key.id}')">Retomar</button>`;
        }
        actions += `<button class="action-btn btn-delete" onclick="deleteKey('${key.id}')">Excluir</button>`;

        return `
            <div class="key-item">
                <div class="key-info">
                    <div class="key-number">${key.key}</div>
                    <div class="key-details">${details}</div>
                </div>
                <span class="key-status status-${key.status}">${key.status.toUpperCase()}</span>
                <div class="key-actions">
                    ${actions}
                </div>
            </div>
        `;
    }).join('');
}

// Ativar key
async function activateKey(keyId) {
    if (!db) return;
    
    try {
        const now = firebase.firestore.Timestamp.now();
        const expiresAt = new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('keys').doc(keyId).update({
            status: 'active',
            activatedAt: now,
            expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
        });
        showToast('Key ativada com sucesso!');
        loadKeys();
    } catch (error) {
        showToast('Erro ao ativar key: ' + error.message, true);
    }
}

// Pausar key
async function pauseKey(keyId) {
    if (!db) return;
    
    try {
        const key = allKeys.find(k => k.id === keyId);
        const expiresDate = key.expiresAt.toDate ? key.expiresAt.toDate() : new Date(key.expiresAt);
        const remainingMs = expiresDate - new Date();
        
        await db.collection('keys').doc(keyId).update({
            status: 'paused',
            pausedAt: firebase.firestore.Timestamp.now(),
            remainingMs: remainingMs,
        });
        showToast('Key pausada com sucesso!');
        loadKeys();
    } catch (error) {
        showToast('Erro ao pausar key: ' + error.message, true);
    }
}

// Retomar key
async function resumeKey(keyId) {
    if (!db) return;
    
    try {
        const key = allKeys.find(k => k.id === keyId);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + key.remainingMs);
        
        await db.collection('keys').doc(keyId).update({
            status: 'active',
            expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
            pausedAt: null,
            remainingMs: null,
        });
        showToast('Key retomada com sucesso!');
        loadKeys();
    } catch (error) {
        showToast('Erro ao retomar key: ' + error.message, true);
    }
}

// Excluir key
async function deleteKey(keyId) {
    if (!db) return;
    
    if (!confirm('Tem certeza que deseja excluir esta key?')) return;
    try {
        await db.collection('keys').doc(keyId).delete();
        showToast('Key excluída com sucesso!');
        loadKeys();
    } catch (error) {
        showToast('Erro ao excluir key: ' + error.message, true);
    }
}

// Filtrar keys
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderKeys();
}

// Buscar keys
function filterKeys() {
    renderKeys();
}

// Toast
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
