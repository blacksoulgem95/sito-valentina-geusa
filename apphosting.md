# Firebase App Hosting - Guida alla Configurazione

Questa guida spiega come configurare e deployare il sito Valentina Geusa su **Firebase App Hosting**.

## 📋 Prerequisiti

1. **Firebase CLI** installato e aggiornato (versione 13.15.4 o successiva):
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

2. **Autenticazione Firebase**:
   ```bash
   firebase login
   ```

3. **Progetto Firebase** configurato:
   ```bash
   firebase use sito-valentina-geusa
   ```

## 🚀 Setup Iniziale

### 1. Inizializza App Hosting

Esegui il comando per creare il file di configurazione base:

```bash
firebase init apphosting
```

Questo comando:
- Crea il file `apphosting.yaml` (se non esiste già)
- Ti guida nella configurazione iniziale del backend

### 2. Crea il Backend App Hosting

**Opzione A: Tramite Console Firebase**
1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto `sito-valentina-geusa`
3. Dal menu **Build**, seleziona **App Hosting**
4. Clicca su **Crea backend** (o **Inizia** se è il primo backend)
5. Segui la procedura guidata per:
   - Scegliere una **regione** (es: `europe-west4`)
   - Configurare la **connessione GitHub** (collega il repository)
   - Impostare la **directory principale dell'app** (default: `/`)
   - Impostare il **ramo live** (es: `main`)
   - Abilitare/disabilitare **deploy automatici**

**Opzione B: Tramite CLI**
```bash
firebase apphosting:backends:create --project sito-valentina-geusa
```

## 🔐 Configurazione Variabili d'Ambiente

### Variabili Firebase (PUBLIC_)

**Perché sono necessarie anche su App Hosting?**

Anche se App Hosting è parte dello stesso progetto Firebase, le variabili d'ambiente Firebase sono **necessarie** perché:

1. **Client-side (Browser)**: Il browser deve connettersi direttamente a Firebase per:
   - Autenticazione (login/logout nel CMS)
   - Firestore (lettura dati pubblici)
   - Storage (upload/download file)

2. **Server-side (SSR)**: L'app usa Firebase SDK standard (non Admin SDK) anche lato server per leggere i dati durante il rendering SSR.

3. **Build-time**: Alcune configurazioni potrebbero essere necessarie durante il build.

**Nota**: In futuro, potresti semplificare usando Firebase Admin SDK per il server-side, che usa Application Default Credentials e non richiede variabili d'ambiente. Ma questo richiederebbe una refactor del codice server-side.

Le variabili Firebase con prefisso `PUBLIC_` sono accessibili sia lato client che server. Possono essere configurate direttamente in `apphosting.yaml` o tramite la console.

**Metodo 1: File `apphosting.yaml` (per sviluppo/test)**
Modifica il file `apphosting.yaml` e sostituisci i valori placeholder:

```yaml
env:
  - variable: PUBLIC_FIREBASE_API_KEY
    value: AIzaSyC...  # La tua API key reale
    availability:
      - BUILD
      - RUNTIME
```

**Metodo 2: Console Firebase (raccomandato per produzione)**
1. Vai su Firebase Console > App Hosting > [Nome Backend] > Settings
2. Sezione **Environment variables**
3. Aggiungi tutte le variabili `PUBLIC_FIREBASE_*` con i valori reali

### Secret per Mailgun (Raccomandato)

Le credenziali Mailgun sono sensibili e dovrebbero essere archiviate come **Secret** in Cloud Secret Manager.

#### Passo 1: Crea i Secret

Usa il comando CLI per creare i secret:

```bash
# Crea il secret per il dominio Mailgun
firebase apphosting:secrets:set mailgun-domain --project sito-valentina-geusa
# Inserisci il valore quando richiesto (es: mg.yourdomain.com)

# Crea il secret per l'API key Mailgun
firebase apphosting:secrets:set mailgun-api-key --project sito-valentina-geusa
# Inserisci il valore quando richiesto (es: key-xxxxxxxxxxxxx)

# Crea il secret per l'email di contatto
firebase apphosting:secrets:set contact-email --project sito-valentina-geusa
# Inserisci il valore quando richiesto (es: valentinageusadesign@gmail.com)
```

Il comando ti chiederà automaticamente se vuoi aggiungere il riferimento al secret in `apphosting.yaml`.

#### Passo 2: Aggiorna `apphosting.yaml`

Dopo aver creato i secret, aggiorna `apphosting.yaml` per utilizzarli:

```yaml
env:
  # ... variabili Firebase ...
  
  # Secret Mailgun
  - variable: MAILGUN_DOMAIN
    secret: mailgun-domain
    availability:
      - RUNTIME
  
  - variable: MAILGUN_API_KEY
    secret: mailgun-api-key
    availability:
      - RUNTIME
  
  - variable: CONTACT_EMAIL
    secret: contact-email
    availability:
      - RUNTIME
```

#### Passo 3: Concedi Accesso (se necessario)

Se hai creato i secret manualmente nella console Cloud Secret Manager, concedi l'accesso al backend:

```bash
firebase apphosting:secrets:grantaccess mailgun-domain --project sito-valentina-geusa
firebase apphosting:secrets:grantaccess mailgun-api-key --project sito-valentina-geusa
firebase apphosting:secrets:grantaccess contact-email --project sito-valentina-geusa
```

## 📝 Configurazione `apphosting.yaml`

Il file `apphosting.yaml` nella root del progetto contiene la configurazione completa. Ecco le sezioni principali:

### Impostazioni Cloud Run

```yaml
runConfig:
  cpu: 1                    # CPU per istanza
  memoryMiB: 1024           # Memoria (1 GiB)
  minInstances: 0          # Istanze minime (0 = scale-to-zero)
  maxInstances: 10         # Istanze massime
  concurrency: 80           # Richieste simultanee per istanza
```

**Note importanti:**
- **CPU e Memoria**: Più di 4 GiB richiedono almeno 2 CPU
- **minInstances**: 0 permette scale-to-zero (risparmio costi), >0 mantiene istanze sempre attive
- **maxInstances**: Limita i costi massimi
- **concurrency**: Valore ottimale dipende dalla tua app

### Variabili d'Ambiente

```yaml
env:
  - variable: NOME_VARIABILE
    value: valore_diretto        # Per valori non sensibili
    # oppure
    secret: nome-secret          # Per valori sensibili
    availability:
      - BUILD                    # Disponibile durante il build
      - RUNTIME                  # Disponibile durante l'esecuzione
```

### Script Personalizzati (Opzionale)

App Hosting rileva automaticamente Astro, ma puoi sovrascrivere:

```yaml
scripts:
  buildCommand: npm run build
  runCommand: node dist/server/entry.mjs
```

## 🔄 Deploy

### Deploy Automatico

Se hai abilitato i deploy automatici, ogni push sul ramo `main` (o ramo configurato) triggera automaticamente un nuovo deploy.

### Deploy Manuale

**Tramite CLI:**
```bash
firebase apphosting:backends:deploy BACKEND_ID --project sito-valentina-geusa
```

**Tramite Console:**
1. Vai su Firebase Console > App Hosting > [Nome Backend]
2. Clicca su **Deploy** o **Redeploy**

## 🧪 Test Locale

Prima di fare il deploy, puoi testare localmente:

```bash
# Build locale
npm run build

# Preview locale
npm run preview
```

## 📊 Monitoraggio

### Log

Visualizza i log del backend:

**Console:**
1. Firebase Console > App Hosting > [Nome Backend] > Logs

**CLI:**
```bash
firebase apphosting:backends:logs BACKEND_ID --project sito-valentina-geusa
```

### Metriche

Monitora le performance nella sezione **Metrics** del backend nella console Firebase.

## 🔧 Troubleshooting

### Errore: "Firebase not initialized"
- Verifica che tutte le variabili `PUBLIC_FIREBASE_*` siano configurate correttamente
- Controlla che siano disponibili in `RUNTIME`

### Errore: "Mailgun credentials mancanti"
- Verifica che i secret siano creati in Cloud Secret Manager
- Controlla che i nomi dei secret in `apphosting.yaml` corrispondano a quelli creati
- Verifica che il backend abbia accesso ai secret

### Errore: "Permission denied" sui secret
- Esegui: `firebase apphosting:secrets:grantaccess SECRET_NAME`

### Build fallisce
- Controlla i log del build nella console
- Verifica che tutte le dipendenze siano in `package.json`
- Assicurati che il comando di build funzioni localmente

### App non si avvia
- Verifica il comando `runCommand` in `apphosting.yaml`
- Controlla i log runtime per errori
- Verifica che il file `dist/server/entry.mjs` esista dopo il build

## 📚 Risorse

- [Documentazione Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Configurazione App Hosting](https://firebase.google.com/docs/app-hosting/configure)
- [Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)

## ✅ Checklist Pre-Deploy

Prima di fare il deploy in produzione, verifica:

- [ ] Tutte le variabili `PUBLIC_FIREBASE_*` sono configurate con valori reali
- [ ] I secret Mailgun sono creati e referenziati correttamente
- [ ] Il file `apphosting.yaml` è committato nel repository
- [ ] Il backend è collegato al repository GitHub corretto
- [ ] Il ramo live è configurato correttamente
- [ ] Le impostazioni Cloud Run sono appropriate per il traffico previsto
- [ ] Hai testato il build localmente (`npm run build`)
- [ ] Hai testato l'app localmente (`npm run preview`)

## 🎯 Best Practices

1. **Usa Secret Manager** per tutte le credenziali sensibili (Mailgun, API keys, etc.)
2. **Non committare** valori reali in `apphosting.yaml` - usa placeholder o secret
3. **Configura minInstances: 0** per risparmiare costi se il traffico è basso
4. **Monitora i log** regolarmente per identificare problemi
5. **Testa localmente** prima di ogni deploy importante
6. **Usa canali di preview** per testare le modifiche prima di pubblicarle

## 🔄 Aggiornare le Configurazioni

Dopo aver modificato `apphosting.yaml` o le variabili d'ambiente:

1. **Commit e push** le modifiche al repository
2. Se i deploy automatici sono abilitati, il deploy parte automaticamente
3. Altrimenti, esegui un deploy manuale

Per aggiornare i secret:
```bash
firebase apphosting:secrets:set SECRET_NAME --project sito-valentina-geusa
```
Il nuovo valore sarà disponibile al prossimo deploy.
