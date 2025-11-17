# Guida alla Creazione dei Contenuti Portfolio

Questa guida spiega come creare nuovi progetti portfolio utilizzando i template forniti e come strutturare correttamente i contenuti.

## 📁 Struttura dei File

I progetti portfolio si trovano in: `src/content/portfolio/`

Ogni progetto è un file Markdown (`.md`) con:
- **Frontmatter YAML** (tra `---`): metadati strutturati
- **Contenuto Markdown**: descrizione estesa del progetto

## 🎨 Tipi di Layout

Il sistema supporta due layout principali che si attivano automaticamente in base al campo `type`:

### 1. Layout Illustrazioni
- **Type**: `"illustration"`
- **Tema**: Rosa/Viola con decorazioni
- **Sezioni**: Stile e Tecniche, 3 immagini esempio, Riflessioni
- **Template**: `_template-illustration.md`

### 2. Layout Standard
- **Types**: `"ui-ux"`, `"brand-identity"`, `"editorial"`, `"web-design"`
- **Tema**: Beige/Arancione professionale
- **Sezioni**: 4 obiettivi, Risultato finale, Riflessioni
- **Template**: `_template-standard.md`

## 🚀 Come Creare un Nuovo Progetto

### Opzione 1: Usando i Template

1. **Copia il template appropriato**:
   ```bash
   # Per illustrazioni
   cp src/content/portfolio/_template-illustration.md src/content/portfolio/mio-progetto.md
   
   # Per altri progetti
   cp src/content/portfolio/_template-standard.md src/content/portfolio/mio-progetto.md
   ```

2. **Rinomina il file** usando il formato: `nome-progetto-cliente.md`
   - Usa solo lettere minuscole
   - Usa trattini al posto degli spazi
   - Esempi: `logo-design-azienda-x.md`, `web-app-startup.md`

3. **Modifica il contenuto** seguendo le istruzioni nel template

### Opzione 2: Creazione Manuale

Segui le sezioni specifiche qui sotto per il tuo tipo di progetto.

---

## 📝 Progetti Illustrazione

### Frontmatter Obbligatorio

```yaml
---
title: "Titolo Progetto"
description: "Breve descrizione (max 2 righe)"
type: "illustration"  # OBBLIGATORIO
category: "Illustrazioni"
status: "completed"
featured: true  # true se vuoi che appaia in homepage
order: 1  # Ordine di visualizzazione (più basso = prima)
client: "Nome Cliente"  # Opzionale
year: "2024"
tags: ["Tag1", "Tag2", "Tag3"]
```

### Immagini

```yaml
images:
  hero: "/images/portfolio/nome-progetto/hero.jpg"  # Immagine principale
  gallery:  # Array di immagini per galleria (opzionale)
    - "/images/portfolio/nome-progetto/img1.jpg"
    - "/images/portfolio/nome-progetto/img2.jpg"
    - "/images/portfolio/nome-progetto/img3.jpg"
```

**Nota**: Carica le immagini in `public/images/portfolio/nome-progetto/`

### Configurazione Illustrazioni

```yaml
illustration:
  subtitle: "Testo che appare sotto il titolo principale"
  styleTitle: "Stile e tecniche"  # Titolo sezione (personalizzabile)
  styleDescription:  # Array di paragrafi
    - "Primo paragrafo. Usa **grassetto** per enfasi."
    - "Secondo paragrafo con ulteriori dettagli."
    - "Terzo paragrafo conclusivo."
  exampleImages:  # Esattamente 3 immagini per la griglia
    - "/images/portfolio/nome-progetto/style-1.jpg"
    - "/images/portfolio/nome-progetto/style-2.jpg"
    - "/images/portfolio/nome-progetto/style-3.jpg"
  reflectionsTitle: "Riflessioni"  # Titolo sezione
  reflectionsContent:  # Array di paragrafi riflessivi
    - "Prima riflessione con **parole chiave** in grassetto."
    - "Seconda riflessione sul processo."
    - "Terza riflessione personale."
```

### Contenuto Markdown

Dopo il frontmatter, scrivi il contenuto esteso:

```markdown
## Il progetto

Descrizione dettagliata del progetto...

## Obiettivi

- Obiettivo 1
- Obiettivo 2
- Obiettivo 3

## Processo creativo

1. **Fase 1**: Descrizione
2. **Fase 2**: Descrizione
...

## Risultato

Conclusione e risultati...
```

---

## 🖥️ Progetti Standard (UI/UX, Brand, Editorial, Web Design)

### Frontmatter Obbligatorio

```yaml
---
title: "Titolo Progetto per Cliente"
description: "Breve descrizione (max 2 righe)"
type: "ui-ux"  # Opzioni: "ui-ux", "brand-identity", "editorial", "web-design"
category: "UI / UX Design"  # Deve corrispondere al type
status: "completed"
featured: true
order: 1
client: "Nome Cliente"  # OBBLIGATORIO per evidenziare nel titolo
year: "2024"
tags: ["Tag1", "Tag2", "Tag3"]
```

### Immagini

```yaml
images:
  hero: "/images/portfolio/nome-progetto/hero.jpg"  # Opzionale
  mockup: "/images/portfolio/nome-progetto/mockup.jpg"  # Mockup principale
  result: "/images/portfolio/nome-progetto/result.jpg"  # Immagine risultato
  gallery:  # Galleria opzionale
    - "/images/portfolio/nome-progetto/screen-1.jpg"
    - "/images/portfolio/nome-progetto/screen-2.jpg"
```

### Obiettivi (4 Card Numerate)

```yaml
objectives:
  - title: "Titolo Obiettivo 1"
    color: "blue"  # Opzioni: blue, purple, orange, indigo
    description: "Descrizione dettagliata dell'obiettivo 1. Spiega il processo, le decisioni prese, gli strumenti utilizzati."
  - title: "Titolo Obiettivo 2"
    color: "purple"
    description: "Descrizione obiettivo 2..."
  - title: "Titolo Obiettivo 3"
    color: "orange"
    description: "Descrizione obiettivo 3..."
  - title: "Titolo Obiettivo 4"
    color: "indigo"
    description: "Descrizione obiettivo 4..."
```

**Suggerimenti per i 4 obiettivi**:
1. Analisi / Research
2. Palette / Brand / Stile
3. Wireframe / Struttura
4. UI Design / Implementazione

### Risultato Finale

```yaml
results:
  title: "Risultato finale"  # Personalizzabile
  paragraphs:  # Array di paragrafi
    - "Primo paragrafo con **parole chiave** in grassetto."
    - "Secondo paragrafo. Usa **blu elettrico** per colorare specifiche parole."
    - "Terzo paragrafo con dettagli tecnici."
    - "Quarto paragrafo conclusivo con menzione di **mockup animati**."
  figmaLink: "https://www.figma.com/file/your-project"  # Opzionale
```

**Formattazione speciale**:
- `**testo**` → grassetto nero
- `**blu elettrico**` → grassetto blu (caso speciale)

### Riflessioni

```yaml
reflections:
  title: "Riflessioni"  # Personalizzabile
  content:  # Array di paragrafi
    - "Prima riflessione con **concetti chiave** evidenziati."
    - "Seconda riflessione personale sul progetto."
```

### Contenuto Markdown

```markdown
## Il progetto

Chi è il cliente, qual era l'esigenza...

## Processo di lavoro

1. **Discovery**: Descrizione
2. **Wireframing**: Descrizione
3. **Design**: Descrizione
...

## Tecnologie e strumenti

- Figma
- Adobe Suite
- Design System
...
```

---

## 🎯 Best Practices

### Nomi File
- ✅ `web-design-recovery-data.md`
- ✅ `illustrazioni-botaniche.md`
- ❌ `Progetto Nuovo.md` (no spazi, no maiuscole)
- ❌ `progetto_test.md` (usa trattini, non underscore)

### Immagini
- Organizza in cartelle: `public/images/portfolio/nome-progetto/`
- Formati supportati: `.jpg`, `.png`, `.webp`
- Ottimizza le immagini prima del caricamento
- Nomi suggeriti:
  - `hero.jpg` - Immagine principale
  - `mockup.jpg` - Mockup principale
  - `result.jpg` - Immagine risultato
  - `style-1.jpg`, `style-2.jpg`, `style-3.jpg` - Esempi stile
  - `screen-1.jpg`, `screen-2.jpg` - Screenshot

### Testi
- Usa **grassetto** (`**testo**`) per enfatizzare parole chiave
- Mantieni paragrafi brevi e leggibili (3-4 righe max)
- Usa elenchi puntati per liste
- Numera i passaggi nei processi

### Order e Featured
- `order`: Numero progressivo (1, 2, 3...) - più basso appare prima
- `featured: true` - Appare in homepage nella sezione progetti in evidenza
- Consiglio: Featured solo per i 3-4 progetti migliori

---

## 🔧 Campi Opzionali vs Obbligatori

### Sempre Obbligatori
- `title`
- `description`
- `type`
- `category`
- `status`

### Raccomandati
- `client` (per progetti standard)
- `year`
- `tags`
- `featured`
- `order`

### Opzionali
- `images.*` (ma altamente raccomandato!)
- `illustration.*` (se type = "illustration")
- `objectives` (se type ≠ "illustration")
- `results`
- `reflections`
- `link` (per progetti con sito live)

---

## ❓ FAQ

**Q: Cosa succede se non specifico le immagini?**
A: Verranno mostrati dei placeholder grigi con il nome del progetto.

**Q: Posso mescolare i campi dei due layout?**
A: No, usa `illustration.*` solo per type="illustration", e `objectives`, `results` per gli altri.

**Q: Quante immagini nella gallery?**
A: Quante vuoi! L'array è dinamico.

**Q: Posso avere meno di 4 obiettivi?**
A: Sì, ma il design è ottimizzato per esattamente 4. Con meno potrebbero esserci spazi vuoti.

**Q: Come faccio il grassetto nei paragrafi YAML?**
A: Usa `**testo**` direttamente nel YAML. Viene convertito automaticamente in HTML.

**Q: I file `_template-*.md` vengono pubblicati?**
A: No, i file che iniziano con `_` vengono ignorati dal sistema.

---

## 🚀 Checklist Pre-Pubblicazione

Prima di pubblicare un nuovo progetto:

- [ ] Nome file in formato corretto (minuscole, trattini)
- [ ] Tutti i campi obbligatori compilati
- [ ] Immagini caricate in `public/images/portfolio/nome-progetto/`
- [ ] Path immagini corretti nel frontmatter
- [ ] Testi controllati per typo e formattazione
- [ ] Tag rilevanti aggiunti
- [ ] Order configurato correttamente
- [ ] Build testato localmente: `npm run build`
- [ ] Preview verificato: `npm run dev`

---

## 📚 Esempi Completi

Vedi i file esistenti per riferimento:
- `illustrazioni.md` - Esempio completo layout illustrazioni
- `ui-ux-design.md` - Esempio completo layout standard

---

## 🆘 Supporto

Se hai problemi:
1. Verifica la console durante `npm run build`
2. Controlla la sintassi YAML (indentazione corretta!)
3. Verifica che i path delle immagini siano corretti
4. Consulta `PORTFOLIO_LAYOUTS.md` per dettagli tecnici

---

**Ultimo aggiornamento**: Dicembre 2024