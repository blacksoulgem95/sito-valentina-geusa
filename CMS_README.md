# CMS Amministrativo - Valentina Geusa

CMS completo e autenticato con Firebase, accessibile alla route `/vgadm`.

## 🚀 Funzionalità

### Autenticazione
- ✅ Firebase Authentication (email/password)
- ✅ Google Sign-in opzionale
- ✅ Tutte le rotte sotto `/vgadm` protette con redirect al login se non autenticato

### Gestione Contenuti
- ✅ **Portfolio** - CRUD completo con slug come document ID
- ✅ **Blog** - CRUD completo con categorie e tag
- ✅ **Categorie Blog** - Gestione separata delle categorie
- ✅ **Pagine Statiche** - CRUD completo per pagine personalizzate

### Editor Markdown
- ✅ Monaco Editor (editor di VS Code)
- ✅ Anteprima markdown in tempo reale
- ✅ Toolbar con pulsante "Inserisci immagine"
- ✅ Componente ImagePickerModal riutilizzabile

### Gestione File
- ✅ Upload multiplo con drag & drop
- ✅ Organizzazione in cartelle (blog/, portfolio/, etc.)
- ✅ Visualizzazione thumbnail per immagini
- ✅ Copia URL con un click
- ✅ Eliminazione con conferma
- ✅ Ricerca e filtro per cartella

### Validazione Slug
- ✅ Auto-generazione slug da title (kebab-case)
- ✅ Validazione formato slug in tempo reale
- ✅ Controllo unicità slug nella collezione
- ✅ Anteprima URL finale mentre si modifica lo slug
- ✅ Impedisce salvataggio se slug duplicato

## 📁 Struttura Firestore

### Collections

#### `portfolio`
- Document ID = slug (es: `come-ho-creato-il-mio-portfolio`)
- Campi: `title`, `body`, `published`, `publishedAt`, `updatedAt`, `featuredImage`, `seoTitle`, `seoDescription`

#### `blog`
- Document ID = slug
- Campi: `title`, `body`, `published`, `publishedAt`, `updatedAt`, `featuredImage`, `categories[]`, `tags[]`, `seoTitle`, `seoDescription`

#### `blog_categories`
- Document ID = slug
- Campi: `name`, `slug`

#### `pages`
- Document ID = slug
- Campi: `title`, `body`, `published`, `publishedAt`, `updatedAt`, `seoTitle`, `seoDescription`

## 🔧 Configurazione

### 1. Variabili d'Ambiente

Crea un file `.env` nella root del progetto con:

```env
PUBLIC_FIREBASE_API_KEY=your_api_key_here
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Console Setup

1. Abilita **Authentication** con:
   - Email/Password provider
   - Google Sign-in (opzionale)

2. Crea le **Firestore Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo utenti autenticati possono leggere/scrivere
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Crea le **Storage Security Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo utenti autenticati possono leggere/scrivere
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Installazione Dipendenze

Le dipendenze sono già installate:
- `firebase` - Firebase SDK v9
- `react` + `react-dom` - React 18
- `react-router-dom` - Routing
- `zustand` - State management
- `@monaco-editor/react` - Monaco Editor
- `react-markdown` - Markdown rendering
- `react-hot-toast` - Toast notifications
- `@headlessui/react` + `@heroicons/react` - UI components

## 📝 Utilizzo

### Accesso al CMS

1. Vai su `/vgadm/login`
2. Accedi con email/password o Google
3. Vieni reindirizzato alla dashboard

### Creare un nuovo Portfolio

1. Vai su **Portfolio** → **Nuovo**
2. Compila il titolo (lo slug viene auto-generato)
3. Modifica lo slug se necessario (viene validato in tempo reale)
4. Scrivi il contenuto nell'editor markdown
5. Aggiungi immagine principale (opzionale)
6. Imposta SEO fields (opzionale)
7. Seleziona "Pubblicato" per pubblicare immediatamente
8. Clicca **Salva**

### Inserire un'Immagine nell'Editor

1. Nell'editor markdown, clicca **Inserisci immagine**
2. Seleziona un'immagine dalla griglia
3. L'immagine viene inserita come `![alt text](url)`
4. Modifica il testo alternativo se necessario

### Gestire i File

1. Vai su **File**
2. Carica file con drag & drop o click
3. Organizza in cartelle (es: "blog", "portfolio")
4. Cerca file per nome
5. Filtra per cartella
6. Copia URL con un click
7. Elimina file con conferma

## 🎨 Tecnologie

- **Framework**: Astro + React 18 + TypeScript
- **UI**: Tailwind CSS + Headless UI
- **Routing**: React Router
- **State**: Zustand
- **Firebase**: SDK v9 (modulare)
- **Editor**: Monaco Editor
- **Markdown**: react-markdown

## 🔒 Sicurezza

- Tutte le route `/vgadm/*` sono protette
- Redirect automatico al login se non autenticato
- Firestore e Storage rules richiedono autenticazione
- Validazione lato client e server (via Firestore rules)

## 📌 Note Importanti

- Lo **slug è l'ID del documento** in Firestore
- Questo garantisce URL univoci e puliti
- Lo slug deve essere unico nella collezione
- La validazione avviene in tempo reale prima del salvataggio
- I file possono essere organizzati in cartelle usando il prefisso nel path

## 🐛 Troubleshooting

### Errore "Firebase not initialized"
- Verifica che le variabili d'ambiente siano configurate correttamente
- Assicurati che il file `.env` sia nella root del progetto

### Errore "Permission denied"
- Verifica le Firestore e Storage rules
- Assicurati di essere autenticato

### Monaco Editor non si carica
- Verifica che `@monaco-editor/react` sia installato
- Controlla la console del browser per errori

### Slug già esistente
- Lo slug deve essere unico nella collezione
- Modifica lo slug o elimina il documento esistente
