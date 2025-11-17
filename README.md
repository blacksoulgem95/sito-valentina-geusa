# Sito Valentina Geusa - Portfolio

Portfolio personale di Valentina Geusa, designer e illustratrice.

## 🎨 Sistema Portfolio Dinamico

Il sito implementa un sistema avanzato di portfolio con **due layout personalizzati** che si attivano automaticamente in base al tipo di progetto:

### Layout Illustrazioni
- **Tema**: Rosa/Viola con decorazioni
- **Attivazione**: `type: "illustration"`
- **Sezioni**: Stile e tecniche, 3 immagini esempio, Riflessioni
- **Design**: Creativo e artistico con elementi decorativi

### Layout Standard
- **Tema**: Beige/Arancione professionale
- **Attivazione**: `type: "ui-ux"`, `"brand-identity"`, `"editorial"`, `"web-design"`
- **Sezioni**: 4 obiettivi numerati, Risultato finale con immagine, Riflessioni
- **Design**: Strutturato e business-oriented

## 📁 Struttura Progetto

```text
/
├── public/
│   └── images/
│       └── portfolio/          # Immagini dei progetti
├── src/
│   ├── components/
│   │   └── portfolio/
│   │       ├── IllustrationDetailLayout.astro
│   │       └── StandardProjectLayout.astro
│   ├── content/
│   │   └── portfolio/          # File markdown progetti
│   │       ├── _template-illustration.md
│   │       ├── _template-standard.md
│   │       ├── illustrazioni.md
│   │       └── ui-ux-design.md
│   ├── layouts/
│   └── pages/
│       └── portfolio/
│           ├── index.astro     # Lista progetti
│           └── [slug].astro    # Dettaglio progetto
├── CONTENT_GUIDE.md            # 📖 Guida creazione contenuti
├── PORTFOLIO_LAYOUTS.md        # 📖 Documentazione tecnica
└── package.json
```

## 🚀 Quick Start

```sh
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Preview della build
npm run preview
```

## 📝 Creare un Nuovo Progetto

### 1. Usa i Template

```bash
# Per illustrazioni
cp src/content/portfolio/_template-illustration.md src/content/portfolio/mio-progetto.md

# Per altri progetti (UI/UX, Brand, Editorial)
cp src/content/portfolio/_template-standard.md src/content/portfolio/mio-progetto.md
```

### 2. Carica le Immagini

Metti le immagini in: `public/images/portfolio/nome-progetto/`

### 3. Compila i Dati

Modifica il file markdown seguendo il template e la **[Guida Contenuti](CONTENT_GUIDE.md)**

### 4. Testa

```sh
npm run dev
# Visita: http://localhost:4321/portfolio/mio-progetto
```

## 📚 Documentazione

- **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)** - Guida completa per creare contenuti portfolio
  - Template e struttura file
  - Campi obbligatori e opzionali
  - Best practices
  - Esempi completi
  - FAQ

- **[PORTFOLIO_LAYOUTS.md](PORTFOLIO_LAYOUTS.md)** - Documentazione tecnica dei layout
  - Architettura del sistema
  - Caratteristiche di ogni layout
  - Palette colori
  - Personalizzazioni avanzate

## 🎯 Features

- ✅ Due layout completamente diversi per tipologie di progetto
- ✅ Contenuti 100% dinamici caricati da markdown
- ✅ Sistema di immagini flessibile
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO-ready con metadati configurabili
- ✅ Static Site Generation (performance ottimali)
- ✅ Tailwind CSS per styling
- ✅ Template pronti per nuovi progetti

## 🛠️ Tech Stack

- **Framework**: Astro 4.x
- **Styling**: Tailwind CSS
- **Content**: Markdown + YAML frontmatter
- **Icons**: Lucide Astro
- **Deploy**: Firebase Hosting

## 📦 Comandi Utili

| Comando | Azione |
| :-- | :-- |
| `npm install` | Installa dipendenze |
| `npm run dev` | Server dev su `localhost:4321` |
| `npm run build` | Build produzione in `./dist/` |
| `npm run preview` | Preview della build locale |
| `npm run astro check` | Verifica errori TypeScript |

## 🔧 Configurazione Portfolio

I progetti sono definiti in `src/content/portfolio/` come file markdown.

**Frontmatter minimo**:
```yaml
---
title: "Nome Progetto"
description: "Breve descrizione"
type: "illustration"  # o "ui-ux", "brand-identity", "editorial", "web-design"
category: "Illustrazioni"
status: "completed"
featured: true
order: 1
---
```

**Vedi [CONTENT_GUIDE.md](CONTENT_GUIDE.md) per dettagli completi.**

## 🎨 Personalizzazione

### Colori
Modifica: `src/styles/variables.css`

### Layout Portfolio
Modifica:
- `src/components/portfolio/IllustrationDetailLayout.astro`
- `src/components/portfolio/StandardProjectLayout.astro`

### Schema Contenuti
Modifica: `src/content/config.ts`

## 🚀 Deploy

```sh
# Build
npm run build

# Deploy su Firebase
firebase deploy
```

## 📄 License

© 2024 Valentina Geusa - All rights reserved

---

**Ultimo aggiornamento**: Dicembre 2024
