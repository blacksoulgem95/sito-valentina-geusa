#!/usr/bin/env node

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

// Per ottenere __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Font Downloader CLI
 *
 * Questo script scarica i font da un file CSS contenente dichiarazioni @font-face
 * e aggiorna automaticamente i percorsi per puntare ai file locali scaricati.
 *
 * Usage: node font-downloader.js <css-file-path>
 *
 * Esempio:
 *   node font-downloader.js fonts.css
 *
 * Il file CSS verrà aggiornato con i percorsi locali dei font scaricati.
 */

class FontDownloader {
  constructor(cssFilePath) {
    // Percorso del file CSS da processare
    this.cssFilePath = cssFilePath;

    // Directory di base dove salvare i font: src/assets/fonts/
    this.baseDir = path.join(process.cwd(), "src", "assets", "fonts");

    // Set per tenere traccia dei file già scaricati (evita duplicati)
    this.downloadedFiles = new Set();

    // Array per memorizzare le sostituzioni URL da fare nel CSS
    this.urlReplacements = [];
  }

  /**
   * Metodo principale che coordina l'intero processo:
   * 1. Legge il file CSS
   * 2. Estrae le dichiarazioni @font-face
   * 3. Scarica i font
   * 4. Aggiorna il CSS con i percorsi locali
   */
  async run() {
    try {
      console.log("🔍 Lettura del file CSS:", this.cssFilePath);

      // Legge il contenuto del file CSS
      const cssContent = fs.readFileSync(this.cssFilePath, "utf-8");

      console.log("📋 Parsing delle dichiarazioni @font-face...");

      // Estrae tutte le dichiarazioni @font-face dal CSS
      const fontFaces = this.parseFontFaces(cssContent);

      console.log(`✅ Trovate ${fontFaces.length} dichiarazioni di font\n`);

      // Contatori per il report finale
      let downloaded = 0;
      let skipped = 0;

      // Scarica ogni font trovato
      for (const fontFace of fontFaces) {
        const result = await this.downloadFont(fontFace);
        if (result === "downloaded") downloaded++;
        else if (result === "skipped") skipped++;
      }

      // Aggiorna il file CSS con i percorsi locali
      console.log("\n📝 Aggiornamento del file CSS con i percorsi locali...");
      this.updateCssFile(cssContent);

      // Report finale
      console.log("\n🎉 Download completato!");
      console.log(`   Scaricati: ${downloaded}`);
      console.log(`   Saltati (già esistenti): ${skipped}`);
      console.log(`   Falliti: ${fontFaces.length - downloaded - skipped}`);
      console.log(`\n✅ File CSS aggiornato: ${this.cssFilePath}`);
    } catch (error) {
      console.error("❌ Errore:", error.message);
      process.exit(1);
    }
  }

  /**
   * Parsing del CSS per estrarre tutte le dichiarazioni @font-face
   *
   * @param {string} cssContent - Il contenuto del file CSS
   * @returns {Array} Array di oggetti con le informazioni di ogni font
   */
  parseFontFaces(cssContent) {
    const fontFaces = [];

    // Regex per trovare tutti i blocchi @font-face { ... }
    const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;

    let match;

    // Itera su tutte le dichiarazioni @font-face trovate
    while ((match = fontFaceRegex.exec(cssContent)) !== null) {
      const declaration = match[1];

      // Estrae il nome della famiglia di font (es: 'Poppins')
      const familyMatch = declaration.match(/font-family:\s*['"]([^'"]+)['"]/);
      const fontFamily = familyMatch ? familyMatch[1] : "Unknown";

      // Estrae il peso del font (es: 100, 400, 700)
      const weightMatch = declaration.match(/font-weight:\s*(\d+)/);
      const fontWeight = weightMatch ? weightMatch[1] : "400";

      // Estrae lo stile del font (normal, italic, etc.)
      const styleMatch = declaration.match(/font-style:\s*(\w+)/);
      const fontStyle = styleMatch ? styleMatch[1] : "normal";

      // Estrae l'URL del font da scaricare
      const urlMatch = declaration.match(/url\(([^)]+)\)/);
      if (urlMatch) {
        const url = urlMatch[1].trim();

        fontFaces.push({
          fontFamily,
          fontWeight,
          fontStyle,
          url,
        });
      }
    }

    return fontFaces;
  }

  /**
   * Scarica un singolo font e lo salva nella struttura di directory appropriata
   *
   * @param {Object} fontFace - Oggetto contenente le info del font
   * @returns {string} Risultato: "downloaded", "skipped", o "failed"
   */
  async downloadFont(fontFace) {
    const { fontFamily, fontWeight, fontStyle, url } = fontFace;

    // Crea un nome directory sicuro (rimuove spazi e caratteri speciali)
    // Es: "Poppins" -> "poppins", "Open Sans" -> "open-sans"
    const safeFontName = fontFamily
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .toLowerCase();

    // Estrae il nome del file dall'URL
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];

    // Crea un nome file descrittivo che include peso e stile
    // Es: "poppins-italic-700.woff2"
    const ext = path.extname(filename);
    const descriptiveFilename = `${safeFontName}-${fontStyle}-${fontWeight}${ext}`;

    // Crea la directory di destinazione: src/assets/fonts/{fontname}/
    const targetDir = path.join(this.baseDir, safeFontName);
    const targetPath = path.join(targetDir, descriptiveFilename);

    // Calcola il percorso relativo dal file CSS ai font scaricati
    const cssDir = path.dirname(path.resolve(this.cssFilePath));
    const relativePath = path.relative(cssDir, targetPath).replace(/\\/g, "/");

    // Memorizza la sostituzione URL per aggiornare il CSS successivamente
    this.urlReplacements.push({
      oldUrl: url,
      newUrl: relativePath,
    });

    // Se il file esiste già, salta il download
    if (fs.existsSync(targetPath)) {
      console.log(`⏭️  Saltato: ${descriptiveFilename} (già esistente)`);
      return "skipped";
    }

    // Crea la directory se non esiste
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
      console.log(`⬇️  Download: ${descriptiveFilename}`);

      // Esegue il download del file
      await this.downloadFile(url, targetPath);

      console.log(
        `   ✓ Salvato in: ${path.relative(process.cwd(), targetPath)}`,
      );
      return "downloaded";
    } catch (error) {
      console.error(
        `   ✗ Fallito download di ${descriptiveFilename}:`,
        error.message,
      );
      return "failed";
    }
  }

  /**
   * Scarica un file da un URL e lo salva localmente
   * Gestisce redirect HTTP e timeout
   *
   * @param {string} url - URL del file da scaricare
   * @param {string} targetPath - Percorso locale dove salvare il file
   * @returns {Promise} Promise che si risolve quando il download è completo
   */
  downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
      // Seleziona il protocollo appropriato (http o https)
      const protocol = url.startsWith("https") ? https : http;

      const request = protocol.get(url, (response) => {
        // Gestisce i redirect HTTP (301, 302)
        if (response.statusCode === 301 || response.statusCode === 302) {
          this.downloadFile(response.headers.location, targetPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        // Verifica che la risposta sia OK (200)
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        // Crea uno stream per scrivere il file
        const fileStream = fs.createWriteStream(targetPath);

        // Pipe della risposta HTTP direttamente nel file
        response.pipe(fileStream);

        // Quando il download è completato
        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });

        // Se c'è un errore durante la scrittura
        fileStream.on("error", (error) => {
          fs.unlink(targetPath, () => {}); // Elimina il file parziale
          reject(error);
        });
      });

      // Gestisce errori di rete
      request.on("error", (error) => {
        reject(error);
      });

      // Timeout di 30 secondi per il download
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  /**
   * Aggiorna il file CSS sostituendo gli URL remoti con i percorsi locali
   * Crea anche un backup del file originale
   *
   * @param {string} originalContent - Contenuto originale del CSS
   */
  updateCssFile(originalContent) {
    let updatedContent = originalContent;

    // Sostituisce tutti gli URL remoti con i percorsi locali
    for (const replacement of this.urlReplacements) {
      // Cerca l'URL sia con che senza apici/virgolette
      const pattern = new RegExp(
        `url\\(\\s*${this.escapeRegex(replacement.oldUrl)}\\s*\\)`,
        "g",
      );
      updatedContent = updatedContent.replace(
        pattern,
        `url("${replacement.newUrl}")`,
      );
    }

    // Crea un backup del file originale
    const backupPath = this.cssFilePath + ".backup";
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, originalContent, "utf-8");
      console.log(`   💾 Backup creato: ${backupPath}`);
    }

    // Scrive il file CSS aggiornato
    fs.writeFileSync(this.cssFilePath, updatedContent, "utf-8");
  }

  /**
   * Escape dei caratteri speciali per usarli in una regex
   *
   * @param {string} string - Stringa da escapare
   * @returns {string} Stringa con caratteri speciali escapati
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

// ============================================================================
// Entry Point CLI
// ============================================================================

// Ottiene gli argomenti dalla linea di comando (esclude node e script name)
const args = process.argv.slice(2);

// Se non ci sono argomenti, mostra l'help
if (args.length === 0) {
  console.log("Font Downloader CLI");
  console.log("");
  console.log(
    "Scarica i font da un file CSS e aggiorna i percorsi con quelli locali.",
  );
  console.log("");
  console.log("Usage: node font-downloader.js <css-file-path>");
  console.log("");
  console.log("Esempio:");
  console.log("  node font-downloader.js fonts.css");
  console.log("");
  console.log("I font verranno scaricati in:");
  console.log("  src/assets/fonts/{fontname}/{filename.ext}");
  console.log("");
  console.log(
    "Il file CSS verrà aggiornato automaticamente con i percorsi locali.",
  );
  console.log("Verrà creato un backup con estensione .backup");
  process.exit(1);
}

const cssFilePath = args[0];

// Verifica che il file esista
if (!fs.existsSync(cssFilePath)) {
  console.error(`❌ Errore: File non trovato: ${cssFilePath}`);
  process.exit(1);
}

// Crea l'istanza del downloader ed esegue il processo
const downloader = new FontDownloader(cssFilePath);
downloader.run().catch((error) => {
  console.error("❌ Errore fatale:", error);
  process.exit(1);
});

// Esporta la classe per permettere l'uso come modulo
export default FontDownloader;
