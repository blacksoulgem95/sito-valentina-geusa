# Agent.md - Linee Guida Operative

## Panoramica del Progetto

Questo documento definisce le linee guida operative, architetturali e stilistiche per un agente AI che contribuisce al progetto **sito-valentina-geusa**, un'applicazione Astro con design system basato su Tailwind CSS v4.

### Stack Tecnologico
- **Framework**: Astro 5.15.3
- **Styling**: Tailwind CSS v4.1.16
- **Icons**: Lucide Astro
- **Build Tool**: Vite con plugin Tailwind

## Struttura del Progetto

```
src/
├── assets/                 # Risorse statiche (immagini, font)
├── components/            # Componenti principali dell'app
│   ├── ui/               # Componenti UI riutilizzabili
│   ├── portfolio/        # Componenti specifici per portfolio
│   ├── Header.astro      # Header dell'applicazione
│   ├── Footer.astro      # Footer dell'applicazione
│   └── Hero.astro        # Sezione hero
├── content/              # Contenuti gestiti da Astro Content
├── layouts/              # Layout templates
├── pages/                # Route e pagine
└── styles/               # Sistema di stili centralizzato
    ├── components/       # Stili per componenti specifici
    ├── fonts/           # Font e tipografia
    ├── global.css       # Stili globali e configurazione theme
    └── variables.css    # Variabili CSS
```

## Principi di Sviluppo

### 1. Componentizzazione
- **SEMPRE** verificare l'esistenza di componenti esistenti prima di crearne di nuovi
- Privilegiare la composizione rispetto all'ereditarietà
- Mantenere i componenti atomici e riutilizzabili
- Seguire il pattern "single responsibility"

### 2. Convenzioni di Naming

#### File e Directory
- **Componenti**: PascalCase (`Card.astro`, `FormGroup.astro`)
- **Pages**: kebab-case (`about-me.astro`, `contact-form.astro`)
- **Stili**: kebab-case (`card.css`, `form-elements.css`)
- **Assets**: kebab-case descrittivo (`hero-bg-image.jpg`)

#### Classi CSS
- **Componenti base**: `.card`, `.button`, `.form-group`
- **Varianti**: `.card-bordered`, `.button-primary`, `.form-compact`
- **Stati**: `.card-loading`, `.button-disabled`, `.form-error`
- **Utility**: Seguire Tailwind CSS v4 naming

### 3. Organizzazione dei Componenti

#### src/components/ui/
Componenti UI generici e riutilizzabili:
```
ui/
├── Card.astro          # Sistema di card modulare
├── Form.astro          # Form container
├── FormGroup.astro     # Gruppo di elementi form
├── Input.astro         # Input fields
├── Select.astro        # Select dropdown
├── Textarea.astro      # Text area
├── Checkbox.astro      # Checkbox component
├── Section.astro       # Section wrapper
└── Ellipses.astro      # Decorative element
```

#### src/components/
Componenti specifici dell'applicazione e layout principali.

#### src/components/portfolio/
Componenti specifici per la sezione portfolio.

## Sistema di Design e Stili

### Configurazione Theme (src/styles/global.css)

```css
@theme {
    --color-primary: #ffc1e8;        /* Rosa principale */
    --color-secondary: #c89eff;      /* Viola secondario */
    --color-tertiary: #fff1df;       /* Beige terziario */
    --color-primary-dark: #ff62c2;   /* Rosa scuro */
    --default-font-family: "Poppins", sans-serif;
    --color-gray: rgba(0, 0, 0, 0.5);
}
```

### Principi di Styling

1. **Tailwind CSS v4 First**: Utilizzare sempre le utility di Tailwind CSS v4 come base
2. **Custom CSS per Componenti**: Creare classi custom solo per componenti complessi in `src/styles/components/`
3. **Design System Consistency**: Rispettare sempre i colori, spacing e tipografia definiti nel theme
4. **Responsive Design**: Mobile-first approach con breakpoint standard

### Pattern di Colori Approvati

#### Colori Principali
- `--color-primary` (#ffc1e8): Accenti principali, CTA, elementi interattivi
- `--color-secondary` (#c89eff): Elementi secondari, hover states
- `--color-tertiary` (#fff1df): Backgrounds, sezioni alternative
- `--color-primary-dark` (#ff62c2): Hover states, elementi attivi

#### Utilizzo dei Colori
```css
/* Backgrounds */
.bg-primary { background: rgba(255, 193, 232, 0.1); }
.bg-secondary { background: rgba(200, 158, 255, 0.1); }
.bg-tertiary { background: rgba(255, 241, 223, 0.3); }

/* Gradienti approvati */
.bg-gradient {
    background: linear-gradient(135deg, 
        rgba(255, 193, 232, 0.1) 0%, 
        rgba(200, 158, 255, 0.1) 100%);
}
```

## Linee Guida per l'Agente

### Prima di Creare un Nuovo Componente

1. **Verifica esistenza**:
   ```bash
   # Controlla se esiste già un componente simile
   find src/components -name "*.astro" | grep -i "nome_componente"
   ```

2. **Analizza componenti esistenti**:
   - Esamina `src/components/ui/Card.astro` per pattern di props e styling
   - Verifica gli stili associati in `src/styles/components/`
   - Controlla la consistenza con il design system

3. **Valuta estensione vs creazione**:
   - Se un componente simile esiste, estendilo con nuove props
   - Se è troppo diverso, crea un nuovo componente atomico

### Processo di Creazione Componente

#### 1. Struttura del Componente Astro
```astro
---
// Props interface con TypeScript
interface Props {
    class?: string;                    // Sempre includere per estensibilità
    variant?: 'default' | 'primary';  // Varianti predefinite
    size?: 'normal' | 'compact';      // Sizing options
    disabled?: boolean;                // Stati comuni
}

const {
    class: className,
    variant = 'default',
    size = 'normal',
    disabled = false,
} = Astro.props;

// Logica per costruzione classi CSS
const componentClasses = [
    'component-base',                  // Classe base
    variant !== 'default' && `component-${variant}`,
    size !== 'normal' && `component-${size}`,
    disabled && 'component-disabled',
    className,                         // Classi custom
].filter(Boolean);
---

<div class:list={componentClasses}>
    <slot />
    <!-- Slot nominati se necessario -->
    <slot name="header" />
    <slot name="footer" />
</div>
```

#### 2. File CSS Associato
Creare sempre il file CSS in `src/styles/components/nome-componente.css`:

```css
/* ==========================================
   COMPONENT NAME - Base & Variants
   ========================================== */

:root {
    --component-padding: 1rem;
    --component-border-radius: 25px;
}

/* Base Component */
.component-base {
    padding: var(--component-padding);
    border-radius: var(--component-border-radius);
    transition: all 0.3s ease-in-out;
}

/* Variants */
.component-primary {
    background: var(--color-primary);
    color: white;
}

.component-compact {
    padding: calc(var(--component-padding) * 0.75);
}

/* States */
.component-disabled {
    opacity: 0.5;
    pointer-events: none;
}
```

#### 3. Aggiornare l'Index
Aggiungere sempre l'import in `src/styles/components/index.css`:

```css
@import "./nuovo-componente.css";
```

### Best Practices per Props

#### Props Standard da Includere Sempre
```typescript
interface Props {
    class?: string;          // Estensibilità CSS
    id?: string;             // Identificazione DOM
    'data-testid'?: string;  // Testing
}
```

#### Props per Componenti Interattivi
```typescript
interface InteractiveProps extends Props {
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
}
```

#### Props per Componenti di Layout
```typescript
interface LayoutProps extends Props {
    variant?: string;
    size?: 'compact' | 'normal' | 'spacious';
    fullWidth?: boolean;
}
```

### Modelli di Estensione Componenti

#### Estensione tramite Props
```astro
---
// Estendere Card.astro esistente
interface ExtendedCardProps {
    // Eredita tutte le props di Card
    // Aggiunge nuove funzionalità
    animationDelay?: number;
    customIcon?: string;
}
---

<!-- Usa Card con props aggiuntive -->
<Card variant="bordered" class="extended-card">
    {customIcon && <Icon name={customIcon} />}
    <slot />
</Card>
```

#### Composizione di Componenti
```astro
---
// Nuovo componente che compone esistenti
---

<Section class="portfolio-showcase">
    <Card variant="shadow" type="profile">
        <slot name="avatar" slot="avatar" />
        <slot name="content" slot="body" />
    </Card>
</Section>
```

## Esempi Pratici

### Esempio 1: Componente Form Complesso

```astro
---
// src/components/ui/ContactForm.astro
interface Props {
    class?: string;
    action?: string;
    method?: 'GET' | 'POST';
    showSuccess?: boolean;
}

const {
    class: className,
    action = '/api/contact',
    method = 'POST',
    showSuccess = false,
} = Astro.props;

const formClasses = [
    'contact-form',
    showSuccess && 'form-success-state',
    className,
].filter(Boolean);
---

<Form class:list={formClasses} action={action} method={method}>
    <FormGroup>
        <Input 
            type="text" 
            name="name" 
            placeholder="Il tuo nome"
            required 
        />
    </FormGroup>
    
    <FormGroup>
        <Input 
            type="email" 
            name="email" 
            placeholder="La tua email"
            required 
        />
    </FormGroup>
    
    <FormGroup>
        <Textarea 
            name="message"
            placeholder="Il tuo messaggio"
            rows="5"
            required
        />
    </FormGroup>
    
    <div class="form-actions">
        <button type="submit" class="btn btn-primary">
            Invia Messaggio
        </button>
    </div>
    
    {showSuccess && (
        <div class="form-success-message">
            <p>Messaggio inviato con successo!</p>
        </div>
    )}
</Form>
```

### Esempio 2: Estensione Card per Portfolio

```astro
---
// src/components/portfolio/ProjectCard.astro
import { Card } from '../ui/Card.astro';

interface Props {
    title: string;
    description: string;
    image: string;
    tags: string[];
    link?: string;
    featured?: boolean;
}

const {
    title,
    description,
    image,
    tags,
    link,
    featured = false,
} = Astro.props;

const cardVariant = featured ? 'shadow-xl' : 'hover';
const cardColor = featured ? 'gradient' : 'default';
---

<Card 
    variant={cardVariant}
    color={cardColor}
    type="default"
    image={image}
    imageAlt={title}
    badge={featured ? 'In Evidenza' : undefined}
    class="project-card"
>
    <div slot="header" class="project-header">
        <h3 class="project-title">{title}</h3>
        <div class="project-tags">
            {tags.map(tag => (
                <span class="tag">{tag}</span>
            ))}
        </div>
    </div>
    
    <div slot="body">
        <p class="project-description">{description}</p>
    </div>
    
    {link && (
        <div slot="footer" class="project-actions">
            <a href={link} class="btn btn-primary">
                Visualizza Progetto
            </a>
        </div>
    )}
</Card>
```

### Esempio 3: CSS Component-Specific

```css
/* src/styles/components/project-card.css */
.project-card {
    max-width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.project-header {
    margin-bottom: 1rem;
}

.project-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
}

.project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.project-tags .tag {
    background: rgba(255, 193, 232, 0.2);
    color: var(--color-primary-dark);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 193, 232, 0.3);
}

.project-description {
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.6;
    margin-bottom: auto;
}

.project-actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 193, 232, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
    .project-card {
        max-width: 100%;
    }
    
    .project-title {
        font-size: 1.125rem;
    }
}
```

## Anti-Pattern da Evitare

### ❌ CSS Inline
```astro
<!-- SBAGLIATO -->
<div style="background: #ffc1e8; padding: 20px;">
    Contenuto
</div>
```

### ❌ Duplicazione Componenti
```astro
<!-- SBAGLIATO: Creare CardSpecial quando Card esiste già -->
<div class="card-special">
    <!-- Stessa logica di Card.astro -->
</div>
```

### ❌ Stili Dispersi
```css
/* SBAGLIATO: CSS sparso in file non organizzati */
.random-component { ... }
```

### ❌ Props Non Tipizzate
```astro
---
// SBAGLIATO: Props senza interface
const { title, description, random } = Astro.props;
---
```

## Pattern da Preferire

### ✅ Utility-First con Tailwind
```astro
<div class="bg-white rounded-[25px] p-6 shadow-lg hover:shadow-xl transition-all duration-300">
    Contenuto
</div>
```

### ✅ Composizione Componenti
```astro
<Section>
    <Card variant="bordered">
        <FormGroup>
            <Input type="email" />
        </FormGroup>
    </Card>
</Section>
```

### ✅ Props Interface Completa
```astro
---
interface Props {
    title: string;
    description?: string;
    variant?: 'default' | 'primary';
    class?: string;
}
---
```

### ✅ CSS Organizzato
```css
/* File dedicato per ogni componente */
/* Naming consistente */
/* Variabili CSS per personalizzazione */
```

## Documentazione e Manutenzione

### Quando Documentare

1. **Nuovo componente**: Sempre documentare API e utilizzo
2. **Cambio breaking**: Documentare migrazione
3. **Pattern complesso**: Aggiungere esempi d'uso

### Formato Documentazione Componente

```markdown
## ComponentName

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Variante visuale |
| class | string | undefined | Classi CSS aggiuntive |

### Esempi
```astro
<ComponentName variant="primary" class="custom-spacing">
    Contenuto
</ComponentName>
```

### Stili Personalizzabili
- `--component-padding`: Padding interno
- `--component-border-radius`: Raggio del bordo
```

## Checklist Pre-Commit

Prima di fare commit, verificare:

- [ ] **Componenti**: Seguono la struttura standard con interface Props
- [ ] **Stili**: Sono centralizzati in `src/styles/components/`
- [ ] **Naming**: Segue le convenzioni stabilite
- [ ] **Riutilizzo**: Non duplica funzionalità esistenti
- [ ] **Responsività**: Funziona su tutti i dispositivi
- [ ] **Accessibilità**: Rispetta standard WCAG base
- [ ] **Performance**: Non introduce regressioni
- [ ] **Documentazione**: Componenti complessi sono documentati

## Comandi Utili

### Sviluppo
```bash
# Avvio dev server
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview
```

### Ricerca nel Codice
```bash
# Trova componenti simili
find src/components -name "*.astro" | grep -i "keyword"

# Cerca utilizzo di una classe CSS
grep -r "class-name" src/

# Trova componenti che utilizzano uno specifico prop
grep -r "propName" src/components/
```

### Validazione
```bash
# Check TypeScript
npx astro check

# Lint CSS (se configurato)
npm run lint:css
```

---

## Conclusione

Questo documento rappresenta le linee guida complete per contribuire efficacemente al progetto. L'obiettivo è mantenere:

- **Consistenza**: Stesso approccio in tutto il codebase
- **Riusabilità**: Componenti modulari e componibili
- **Manutenibilità**: Codice facile da estendere e modificare
- **Performance**: Soluzioni ottimizzate e scalabili
- **Developer Experience**: Sviluppo fluido e piacevole

Seguendo queste linee guida, l'agente AI contribuirà a mantenere alta la qualità del codice e l'efficienza del processo di sviluppo.