# Refactoring: Firebase Admin SDK + API Astro

Questo documento descrive il refactoring effettuato per utilizzare Firebase Admin SDK sul server e API Astro invece di Firebase SDK diretto nel frontend.

## ✅ Completato

### 1. Firebase Admin SDK
- ✅ Installato `firebase-admin`
- ✅ Creato `src/lib/firebase/admin.ts` con configurazione Admin SDK
- ✅ Usa Application Default Credentials (ADC) su App Hosting

### 2. API Endpoints Astro

#### Autenticazione (`/api/auth/`)
- ✅ `POST /api/auth/login` - Login con email/password
- ✅ `POST /api/auth/google` - Login con Google (riceve ID token)
- ✅ `GET /api/auth/user` - Ottieni utente corrente
- ✅ `POST /api/auth/logout` - Logout

#### Portfolio (`/api/portfolio/`)
- ✅ `GET /api/portfolio` - Lista tutti gli item (opzionale: `?published=true`)
- ✅ `GET /api/portfolio/[slug]` - Ottieni item per slug
- ✅ `POST /api/portfolio` - Crea nuovo item
- ✅ `PUT /api/portfolio/[slug]` - Aggiorna item
- ✅ `DELETE /api/portfolio/[slug]` - Elimina item

#### Blog (`/api/blog/`)
- ✅ `GET /api/blog` - Lista tutti i post (opzionale: `?published=true`)
- ✅ `GET /api/blog/[slug]` - Ottieni post per slug
- ✅ `POST /api/blog` - Crea nuovo post
- ✅ `PUT /api/blog/[slug]` - Aggiorna post
- ✅ `DELETE /api/blog/[slug]` - Elimina post

#### Pagine (`/api/pages/`)
- ✅ `GET /api/pages` - Lista tutte le pagine (opzionale: `?published=true`)
- ✅ `GET /api/pages/[slug]` - Ottieni pagina per slug
- ✅ `POST /api/pages` - Crea nuova pagina
- ✅ `PUT /api/pages/[slug]` - Aggiorna pagina
- ✅ `DELETE /api/pages/[slug]` - Elimina pagina

#### Categorie Blog (`/api/blog-categories/`)
- ✅ `GET /api/blog-categories` - Lista tutte le categorie
- ✅ `POST /api/blog-categories` - Crea nuova categoria
- ✅ `PUT /api/blog-categories/[slug]` - Aggiorna categoria
- ✅ `DELETE /api/blog-categories/[slug]` - Elimina categoria

#### Storage (`/api/storage/`)
- ✅ `GET /api/storage/list` - Lista file (opzionale: `?folder=xxx&maxResults=100`)
- ✅ `POST /api/storage/upload` - Upload file multipli
- ✅ `DELETE /api/storage/delete` - Elimina file

### 3. Service Layer Frontend

Creati service in `src/services/`:
- ✅ `api.ts` - Base API service con gestione autenticazione
- ✅ `auth.service.ts` - Service per autenticazione
- ✅ `portfolio.service.ts` - Service per portfolio
- ✅ `blog.service.ts` - Service per blog e categorie
- ✅ `pages.service.ts` - Service per pagine
- ✅ `storage.service.ts` - Service per storage

### 4. Componenti Aggiornati
- ✅ `Login.tsx` - Usa `authService` invece di Firebase SDK diretto
- ✅ `Layout.tsx` - Usa `authService` per verificare autenticazione
- ✅ `Navbar.tsx` - Usa `authService` per logout
- ✅ `authStore.ts` - Aggiornato per usare `authService`

### 5. Helper Google Auth
- ✅ `src/lib/firebase/google-auth.ts` - Helper per ottenere ID token da Google usando Firebase SDK client-side (necessario solo per login Google)

## ✅ Refactoring Completato!

Tutti i componenti sono stati aggiornati per usare i service invece di Firebase SDK diretto:

#### Portfolio
- ✅ `PortfolioList.tsx` - Usa `portfolioService.getAll()` e `delete()`
- ✅ `PortfolioForm.tsx` - Usa `portfolioService.create()`, `update()`, `checkSlugExists()`

#### Blog
- ✅ `BlogList.tsx` - Usa `blogService.getAllPosts()` e `deletePost()`
- ✅ `BlogForm.tsx` - Usa `blogService.createPost()`, `updatePost()`, `checkSlugExists()`
- ✅ `BlogCategories.tsx` - Usa `blogCategoryService.getAll()`, `create()`, `update()`, `delete()`

#### Pagine
- ✅ `PagesList.tsx` - Usa `pagesService.getAll()` e `delete()`
- ✅ `PagesForm.tsx` - Usa `pagesService.create()`, `update()`, `checkSlugExists()`

#### Storage
- ✅ `FilesManager.tsx` - Usa `storageService.listFiles()`, `uploadFiles()`, `deleteFile()`
- ✅ `ImagePickerModal.tsx` - Usa `storageService.listFiles()`

## 📝 Note Importanti

### Autenticazione

1. **Token Storage**: I token vengono salvati in `localStorage` con chiave `auth_token`
2. **Login Google**: Richiede ancora Firebase SDK client-side per ottenere l'ID token da Google, poi viene passato all'API
3. **Verifica Token**: L'API verifica il token usando Firebase Admin SDK

### Variabili d'Ambiente

Con questo refactoring:
- ✅ Le variabili `PUBLIC_FIREBASE_*` sono ancora necessarie per:
  - Login Google (Firebase SDK client-side)
  - Eventuali altri usi client-side
- ✅ Firebase Admin SDK usa Application Default Credentials (ADC) su App Hosting, quindi **NON** richiede variabili d'ambiente aggiuntive

### Migrazione Componenti

Per migrare un componente:

1. Importa il service appropriato:
   ```typescript
   import { portfolioService } from '@/services/portfolio.service';
   ```

2. Sostituisci le chiamate Firebase SDK con chiamate al service:
   ```typescript
   // Prima
   const items = await getDocuments(portfolioCollection);
   
   // Dopo
   const items = await portfolioService.getAll();
   ```

3. Gestisci gli errori (i service lanciano Error con messaggi descrittivi)

4. Aggiorna i tipi se necessario (i service usano interfacce TypeScript)

## 🚀 Vantaggi del Refactoring

1. **Sicurezza**: Le credenziali Firebase non sono più esposte al client
2. **Controllo**: Tutte le operazioni passano attraverso API server-side
3. **Flessibilità**: Più facile aggiungere validazione, logging, rate limiting
4. **Testabilità**: Più facile testare le API separatamente
5. **Scalabilità**: Possibilità di aggiungere cache, CDN, etc.

## 🔧 Configurazione App Hosting

Dopo questo refactoring, `apphosting.yaml` può essere semplificato:
- Le variabili `PUBLIC_FIREBASE_*` sono ancora necessarie per login Google
- Firebase Admin SDK usa ADC automaticamente su App Hosting
- Non servono variabili aggiuntive per Admin SDK

## 📚 Esempi di Utilizzo

### Esempio: Creare un Portfolio Item

```typescript
import { portfolioService } from '@/services/portfolio.service';

const newItem = {
  slug: 'my-project',
  title: 'My Project',
  body: '# Content',
  published: true,
  // ... altri campi
};

await portfolioService.create(newItem);
```

### Esempio: Upload File

```typescript
import { storageService } from '@/services/storage.service';

const files = [file1, file2]; // File objects
const result = await storageService.uploadFiles(files, 'portfolio');
console.log(result.files); // Array di StorageFile
```

## ⚠️ Breaking Changes

- I componenti che usano direttamente Firebase SDK devono essere aggiornati
- L'autenticazione ora usa token invece di sessioni Firebase dirette
- Alcuni metodi potrebbero avere signature diverse
