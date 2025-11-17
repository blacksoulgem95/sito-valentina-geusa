# Gestione Portfolio

Questa documentazione spiega come gestire i contenuti del portfolio dinamico del sito.

## Struttura del Portfolio

Il portfolio è organizzato in **4 tipi principali** di progetti:

1. **UI / UX Design** (`ui-ux`) - Sfondo secondario
2. **Brand Identity** (`brand-identity`) - Sfondo secondario
3. **Editorial Design** (`editorial`) - Sfondo secondario
4. **Illustrazioni** (`illustration`) - Sfondo primario (rosa)

Ogni tipo può contenere **multipli progetti**.

## Dove si trovano i progetti?

I progetti sono in: `src/content/portfolio/`

Ogni progetto è un file Markdown (`.md`) con metadati in formato YAML.

## Schema di un Progetto

```yaml
---
title: "Titolo del Progetto"
description: "Breve descrizione (1-2 righe)"
type: "ui-ux" | "brand-identity" | "editorial" | "illustration"
category: "Nome Categoria Visualizzato"
status: "completed" | "in-progress"
featured: true | false
order: 1
client: "Nome Cliente" (opzionale)
year: "2024" (opzionale)
tags: ["Tag1", "Tag2", "Tag3"] (opzionale)
link: "https://url-progetto.com" (opzionale)
---

Contenuto dettagliato del progetto in Markdown...
```

### Campi Obbligatori

| Campo | Descrizione | Valori |
|-------|-------------|--------|
| `title` | Titolo del progetto | Testo libero |
| `description` | Descrizione breve per card | Max 2 righe |
| `type` | Tipo di progetto | `ui-ux`, `brand-identity`, `editorial`, `illustration` |
| `category` | Nome categoria visualizzato | Testo libero |
| `status` | Stato progetto | `completed`, `in-progress` |
| `order` | Ordine visualizzazione | Numero (1, 2, 3...) |

### Campi Opzionali

| Campo | Descrizione | Esempio |
|-------|-------------|---------|
| `client` | Nome del cliente | "TechStart" |
| `year` | Anno realizzazione | "2024" |
| `tags` | Array di tag | ["Mobile", "UI Design"] |
| `link` | Link esterno al progetto | "https://..." |
| `featured` | Progetto in evidenza | true/false |

## Come Aggiungere un Nuovo Progetto

### 1. Crea il file

Vai in `src/content/portfolio/` e crea un nuovo file `.md`:

```bash
src/content/portfolio/mio-nuovo-progetto.md
```

### 2. Aggiungi i metadati

```markdown
---
title: "E-commerce Fashion"
description: "Redesign completo di un negozio online di moda"
type: "ui-ux"
category: "UI / UX Design"
status: "completed"
featured: true
order: 10
client: "Fashion Brand"
year: "2024"
tags: ["E-commerce", "Web Design", "UX"]
---
```

### 3. Scrivi il contenuto

Dopo i metadati, scrivi la descrizione dettagliata in Markdown:

```markdown
## Il Progetto

Descrizione generale del progetto...

## Obiettivi

- Obiettivo 1
- Obiettivo 2

## Processo

Spiega il processo seguito...

## Risultati

Risultati ottenuti...
```

### 4. Salva e rebuilda

Il progetto apparirà automaticamente nella pagina `/portfolio` e avrà una pagina dettaglio su `/portfolio/mio-nuovo-progetto`.

## Tipi di Progetto e Colori

| Tipo | Slug | Categoria | Colore Badge | Sfondo Dettaglio |
|------|------|-----------|--------------|------------------|
| UI/UX Design | `ui-ux` | "UI / UX Design" | Rosa | Secondario |
| Brand Identity | `brand-identity` | "Brand Identity" | Verde | Secondario |
| Editorial Design | `editorial` | "Editorial Design" | Viola | Secondario |
| Illustrazioni | `illustration` | "Illustrazioni" | Giallo | **Primario** (rosa) |

## Ordinamento Progetti

I progetti sono ordinati per il campo `order` (dal più basso al più alto) **dentro ogni sezione**.

**Esempio:**
```yaml
# Primo progetto UI/UX
order: 1

# Secondo progetto UI/UX
order: 2

# Terzo progetto UI/UX
order: 3
```

## Progetti Attualmente nel Portfolio

### UI / UX Design (2 progetti)
1. **Interfaccia App Mobile** - order: 1
2. **E-commerce Redesign** - order: 2

### Brand Identity (2 progetti)
3. **Brand Identity Caffetteria** - order: 3
4. **Startup Tech Branding** - order: 4

### Editorial Design (2 progetti)
5. **Rivista di Lifestyle** - order: 5
6. **Design di Libro d'Arte** - order: 6

### Illustrazioni (2 progetti)
7. **Serie Illustrazioni Botaniche** - order: 7
8. **Character Design per Animazione** - order: 8

## Modificare un Progetto

1. Apri il file `.md` del progetto in `src/content/portfolio/`
2. Modifica i metadati o il contenuto
3. Salva il file
4. Esegui `npm run build` per rigenerare il sito

## Eliminare un Progetto

Semplicemente elimina il file `.md` corrispondente dalla cartella `src/content/portfolio/`.

## Pagine Generate

Il portfolio genera automaticamente:

- `/portfolio` - Pagina principale con tutti i progetti raggruppati per tipo
- `/portfolio/[slug]` - Pagina di dettaglio per ogni progetto

Esempio: `/portfolio/ui-ux-design` mostra il progetto "Interfaccia App Mobile".

## Note Importanti

⚠️ **Non creare file che non siano progetti** nella cartella `src/content/portfolio/`
- Il sistema interpreta TUTTI i `.md` come progetti
- La documentazione va messa fuori dalla cartella

✅ **Best Practices:**
- Usa nomi file descrittivi e in kebab-case: `ecommerce-redesign.md`
- Mantieni le descrizioni brevi nelle card (max 2 righe)
- Usa il contenuto Markdown per i dettagli completi
- Tieni l'`order` consistente e incrementale

## Esempi Completi

### Esempio UI/UX

```markdown
---
title: "Dashboard Analytics"
description: "Dashboard moderna per analisi dati business"
type: "ui-ux"
category: "UI / UX Design"
status: "completed"
featured: true
order: 3
client: "DataCorp"
year: "2024"
tags: ["Dashboard", "Data Viz", "B2B"]
link: "https://datacorp.example.com"
---

## Il Progetto

Progettazione di una dashboard completa...
```

### Esempio Illustrazioni

```markdown
---
title: "Serie Illustrazioni Food"
description: "Collezione di illustrazioni gastronomiche"
type: "illustration"
category: "Illustrazioni"
status: "in-progress"
order: 9
client: "Restaurant Magazine"
year: "2024"
tags: ["Food", "Digital Art", "Editorial"]
---

## Il Progetto

Serie di illustrazioni per magazine gastronomico...
```

## Supporto

Per domande o problemi: valentinageusadesign@gmail.com