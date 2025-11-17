# Layout Portfolio - Documentazione

## Panoramica

Sono stati implementati due layout distinti per le pagine di dettaglio del portfolio:

1. **IllustrationDetailLayout** - Per progetti di tipo "illustration"
2. **StandardProjectLayout** - Per tutti gli altri tipi di progetto (UI/UX, Brand Identity, Editorial, ecc.)

Entrambi i layout seguono i design forniti e si adattano automaticamente in base al tipo di progetto.

## Come Funziona

### Rilevamento Automatico

Il file `src/pages/portfolio/[slug].astro` verifica automaticamente il tipo di progetto:

```astro
const isIllustration = entry.data.type === "illustration";
```

Se il tipo è `"illustration"`, viene utilizzato il componente `IllustrationDetailLayout.astro` invece del layout standard.

### Componenti Dedicati

**IllustrationDetailLayout**: `src/components/portfolio/IllustrationDetailLayout.astro`
**StandardProjectLayout**: `src/components/portfolio/StandardProjectLayout.astro`

## Caratteristiche del Layout Illustrazioni

### 1. Hero Section Rosa con Decorazioni
- Sfondo rosa chiaro (`bg-pink-50`)
- Macchie organiche sfocate per effetto texture
- Emoji decorative (torte 🍰 e ciliegie 🍒) posizionate in modo casuale
- Effetto overlay semi-trasparente

### 2. Navigazione Top
- Link "Chi sono", "Portfolio" e "Contatti"
- Disposti orizzontalmente con separatori
- Stile pulito e minimalista

### 3. Badge Categoria
- Badge viola arrotondato
- Testo "Illustrazioni"
- Centrato sotto la navigazione

### 4. Immagine Principale
- Card con sfondo nero arrotondato (`rounded-3xl`)
- Aspect ratio 16:9
- Ombra pronunciata (`shadow-xl`)

### 5. Titolo Colorato
```
Illustrazioni [digitali] e [tradizionali]
```
- Parole chiave colorate (viola e rosa)
- Resto del testo in grigio scuro
- Font bold e grande (4xl-5xl)

### 6. Sezione "Stile e Tecniche"
- Sfondo rosa chiaro continuo
- Titolo con parole colorate
- Paragrafi descrittivi con parole chiave in grassetto
- Griglia di 3 immagini esempio (aspect-square)

### 7. Sezione "Riflessioni"
- Continua lo sfondo rosa
- Titolo viola
- Testo riflessivo con enfasi su parole chiave
- Include il contenuto markdown completo del progetto

### 8. CTA "Creiamo qualcosa insieme"
- Sfondo bianco
- Titolo con "insieme" in rosa
- Due card di contatto affiancate:
  - **Scrivimi**: Icona mail, link email
  - **Parliamone**: Icona link esterno, CTA per contatti
- Social media links (Instagram, LinkedIn) con stellina ✨

### 9. Footer
- Links Privacy Policy e Cookie Policy
- Design minimalista

## Caratteristiche del Layout Standard (Altri Progetti)

### 1. Hero Section Rosa con Decorazioni
- Identico al layout illustrazioni
- Sfondo rosa chiaro con decorazioni

### 2. Mockup Grande
- Sfondo beige/ambra (`bg-amber-50`)
- Card grande con ombra pronunciata
- Aspect ratio 16:9

### 3. Titolo Progetto con Highlight
- Nome cliente/progetto evidenziato in arancione
- Testo principale in grigio

### 4. Sezione "Qual è stato l'obiettivo?"
- Titolo arancione
- Griglia di 4 card numerate
- Ogni card ha:
  - Numero grande decorativo (1, 2, 3, 4)
  - Titolo colorato (blu, viola, arancione, indigo)
  - Descrizione dettagliata

### 5. Sezione "Risultato finale"
- Sfondo arancione chiaro (`bg-orange-50`)
- Layout a 2 colonne (testo + immagine)
- Testo con parole chiave evidenziate
- Immagine quadrata laterale

### 6. Sezione "Riflessioni"
- Sfondo bianco
- Titolo arancione
- Contenuto markdown completo

### 7. CTA e Footer
- Identici al layout illustrazioni
- Sfondo rosa per CTA
- Footer con copyright

## Palette Colori

### Layout Illustrazioni
- **Rosa chiaro sfondo**: `bg-pink-50`
- **Rosa accento**: `text-pink-500`, `text-pink-600`
- **Viola accento**: `text-purple-600`, `bg-purple-200`
- **Grigio testo**: `text-gray-600`, `text-gray-700`, `text-gray-800`
- **Bianco**: Per card e contrasto
- **Nero**: Per immagine principale

### Layout Standard
- **Rosa chiaro**: `bg-pink-50` (hero)
- **Beige/Ambra**: `bg-amber-50` (mockup section)
- **Arancione**: `text-orange-400`, `text-orange-500`, `bg-orange-50`
- **Blu elettrico**: `text-blue-600`, `bg-blue-100`
- **Viola**: `text-purple-600`, `bg-purple-100`
- **Indigo**: `text-indigo-600`, `bg-indigo-100`
- **Grigio**: Per testi principali

## File Coinvolti

1. **`src/pages/portfolio/[slug].astro`**
   - Gestisce il routing e la selezione del layout
   - Condizionalmente renderizza `IllustrationDetailLayout` o `StandardProjectLayout`

2. **`src/components/portfolio/IllustrationDetailLayout.astro`**
   - Layout completo specifico per illustrazioni
   - Tema rosa/viola con decorazioni

3. **`src/components/portfolio/StandardProjectLayout.astro`**
   - Layout per UI/UX, Brand Identity, Editorial, ecc.
   - Tema beige/arancione con struttura a sezioni

4. **`src/content/portfolio/`**
   - File markdown per ogni progetto
   - Campo `type` determina quale layout usare

## Come Aggiungere Nuovi Progetti

### Progetto Illustrazione

1. Crea un file markdown in `src/content/portfolio/`
2. Imposta nel frontmatter:
   ```yaml
   type: "illustration"
   category: "Illustrazioni"
   ```
3. Il layout `IllustrationDetailLayout` verrà applicato automaticamente

### Altri Tipi di Progetto

1. Crea un file markdown in `src/content/portfolio/`
2. Imposta nel frontmatter:
   ```yaml
   type: "ui-ux"  # oppure "brand-identity", "editorial", "web-design", ecc.
   category: "UI / UX Design"
   client: "Nome Cliente"
   ```
3. Il layout `StandardProjectLayout` verrà applicato automaticamente

## Personalizzazioni Future

### Aggiungere Immagini Reali

**IllustrationDetailLayout.astro**:
- **Immagine principale** (linea ~53): Sostituisci il placeholder con `<img>` tag
- **Griglia 3 immagini** (linea ~103-127): Sostituisci i gradient placeholder con immagini reali

**StandardProjectLayout.astro**:
- **Mockup principale** (linea ~96): Sostituisci con immagine del progetto
- **Immagine risultato** (linea ~289): Sostituisci con screenshot/mockup finale
- Le 4 card obiettivo possono avere icone personalizzate

### Modificare Testi Statici

I testi hardcoded possono essere spostati nel file markdown o resi configurabili tramite frontmatter.

**Per Illustrazioni**:
```yaml
---
title: "Serie Illustrazioni Botaniche"
type: "illustration"
style_description: "Il mio stile si basa su linee spontanee..."
reflections: "I miei lavori rappresentano..."
---
```

**Per Altri Progetti**:
```yaml
---
title: "Web Design per Recovery Data"
type: "ui-ux"
client: "Recovery Data"
objectives:
  - title: "Analisi del progetto"
    description: "Studio dei flussi..."
  - title: "Palette"
    description: "Selezione colori..."
---
```

### Aggiungere Layout Aggiuntivi

Se serve un terzo tipo di layout (es. per progetti video o fotografia):

1. Crea un nuovo componente in `src/components/portfolio/` (es. `VideoProjectLayout.astro`)
2. Aggiungi una condizione in `[slug].astro`:
   ```astro
   const isIllustration = entry.data.type === "illustration";
   const isVideo = entry.data.type === "video";

   {isIllustration ? (
       <IllustrationDetailLayout ... />
   ) : isVideo ? (
       <VideoProjectLayout ... />
   ) : (
       <StandardProjectLayout ... />
   )}
   ```

## Testing

Entrambi i layout sono stati testati e funzionano correttamente. Per verificare:

```bash
npm run dev
```

Pagine da testare:
- **Illustrazioni**: `http://localhost:4321/portfolio/illustrazioni`
- **UI/UX**: `http://localhost:4321/portfolio/ui-ux-design`
- **Altri progetti**: `http://localhost:4321/portfolio/[nome-progetto]`

## Note Tecniche

- Utilizza Tailwind CSS per tutti gli stili
- Responsive design con breakpoint `md:` per tablet/desktop
- Icons da `lucide-astro`
- Nessuna dipendenza JavaScript lato client
- 100% static site generation (SSG)

## Estensioni Consigliate

### Funzionalità
- Aggiungere campo `images[]` nel frontmatter per gallerie dinamiche
- Implementare lightbox per ingrandire le immagini
- Aggiungere animazioni scroll reveal (Intersection Observer)
- Sistema di filtri per tipo di progetto

### Contenuto Dinamico
- Integrare CMS headless (Contentful, Sanity, Strapi)
- Campo `objectives[]` configurabile per le 4 card
- Gallery immagini da frontmatter invece di placeholder
- Video embed per progetti multimediali

### Performance
- Lazy loading immagini
- Ottimizzazione immagini con Astro Image
- Preload font critici
- Critical CSS inline