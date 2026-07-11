# Painel ADM - Gerenciador de Keys

Sistema de gerenciamento de keys de acesso para o Gerador de Mensagens de Carinho.

## 🚀 Como usar no GitHub Pages

1. **Faça um fork ou clone este repositório**
2. **Ative GitHub Pages** nas configurações do repositório
3. **Acesse** `https://seu-usuario.github.io/painel-adm-github`

## ✨ Funcionalidades

- ✅ Gerar keys (1 a 100 por vez)
- ✅ Ativar keys (começa a contar 30 dias)
- ✅ Pausar keys (tempo fica congelado)
- ✅ Retomar keys (continua de onde parou)
- ✅ Excluir keys
- ✅ Filtrar por status
- ✅ Buscar por número
- ✅ Estatísticas em tempo real
- ✅ Tema dark profissional

## 📁 Estrutura

```
painel-adm-github/
├── index.html      # Página principal
├── app.js          # Lógica do Firebase
└── README.md       # Este arquivo
```

## 🔧 Configuração

As credenciais do Firebase já estão configuradas no arquivo `app.js`. Se você quiser usar seu próprio projeto Firebase:

1. Abra `app.js`
2. Localize a seção `firebaseConfig`
3. Substitua pelas suas credenciais

## 📊 Banco de Dados

As keys são armazenadas no Firestore com a seguinte estrutura:

```javascript
{
  key: "1234-5678-9012-3456",
  status: "inactive|active|paused|expired",
  durationDays: 30,
  createdAt: timestamp,
  activatedAt: timestamp,
  expiresAt: timestamp,
  pausedAt: timestamp,
  remainingMs: number
}
```

## 🔐 Regras do Firestore

Aplique estas regras no seu Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /keys/{keyId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📝 Licença

MIT
