# G-CORE SYSTEMS · SERVER- & PROGRAMM-STATUSFILE  
## Stand: (bitte Datum ergänzen, z. B. 18.11.2025)

Dieses Dokument beschreibt den aktuellen Stand der technischen Struktur von  
**G-Core Systems** (Server, Router, Programme, Blueprints, Uploads, OCR).  

Es ist dafür gedacht, in neue KI-Chats kopiert zu werden, damit der Assistent  
alle relevanten Infos sofort kennt.


────────────────────────────────────
1) INFRASTRUKTUR & HOSTING
────────────────────────────────────

1.1 Frontend (Webseite + Launchpad + Omni-Core)

- Hosting: **GitHub Pages**  
- Domain: **https://g-core-systems.com**
- Wichtige Dateien im Repo-Root:
  - `/index.html` → Hauptseite (Marketing / Info-Seite)
  - `/genie-host.html` → **G-CORE LAUNCHPAD** (öffentliche PWA)
  - `/gcore_host.html` → **OMNI-CORE SUITE** (Dev/Steuerkonsole)
  - `/service-worker-genie.js` → Service Worker für PWA
  - `/manifest_genie.webmanifest` → Manifest für Launchpad & (aktuell) Omni-Core
  - `/assets_icons/…` → PWA-Icons (`gcore_icon_64/128/192/256/512/1024` usw.)

- PWA:
  - Service Worker wird registriert über  
    `navigator.serviceWorker.register('/service-worker-genie.js')`
  - Manifest eingebunden über  
    `<link rel="manifest" href="/manifest_genie.webmanifest">`
  - Start-URL des Manifests: Launchpad (`/genie-host.html`)


1.2 Backend (API / Router / KI-Schnittstelle)

- VPS: Linux Ubuntu LTS, per SSH administriert  
- API-Domain: **https://api.g-core-systems.com**
- Node-Router Port intern: **3000**
- Reverse Proxy (Caddy/nginx): `443 → 3000`
- Systemdienst:
  - Service-Name: `gcore-router.service`
  - Neustart: `sudo systemctl restart gcore-router`
  - Status: `sudo systemctl status gcore-router`

- Router-Verzeichnis auf dem Server:
  - Basis: `/srv/gcore-router/`
  - Wichtige Dateien:
    - `/srv/gcore-router/index.js` (Haupt-Router / Express-App)
    - `/srv/gcore-router/package.json`
    - `/srv/gcore-router/.env` (API-Keys etc., nicht öffentlich)
    - `/srv/gcore-router/programs/` (Program-Blueprints + Registry)
    - `/srv/gcore-router/engines/` (Programm-Engines, wiederverwendbar)
    - `/srv/gcore-router/uploads/` (Datei-Uploads: Screenshots, PDFs, DOCX etc.)


────────────────────────────────────
2) API-ENDPOINTS (ROUTER)
────────────────────────────────────

2.1 Basis-URL

- **Frontend → Backend:**  
  - Aufrufe aus Launchpad & Omni-Core erfolgen an  
    `https://api.g-core-systems.com/genie`

2.2 Status-/Meta-Endpunkte (funktionieren)

- `GET /health`  
  - Liefert `{ ok: true, status: "healthy", ... }`  
  - Wird für technische Checks verwendet.

- `GET /version`  
  - Liefert z. B. `{ ok: true, version: "gcore-router-vX.X.X" }`  

- `GET /programs/list`  
  - Liefert Liste der registrierten Programme aus der Program Registry  
    (z. B. `resume-master`, spätere Programme folgen).


2.3 KI-Endpunkt

- `POST /genie`
  - Erwartet JSON, z. B.:
    ```json
    {
      "prompt": "[RESUMÉ-MASTER] Deine Anfrage ...",
      "model": "gpt-4.1-mini",
      "temperature": 0.7
    }
    ```
  - Router erkennt anhand des Prefix (`[RESUMÉ-MASTER]`), welches Programm /
    welcher Blueprint verarbeitet werden soll.


2.4 Upload-Endpunkt (für Dateien & Bilder) – DESIGN-STAND

> Hinweis: Dieser Abschnitt beschreibt den vorgesehenen Standard.  
> Ob er bereits vollständig implementiert ist, muss im Router-Code geprüft werden.

- `POST /upload`
  - Erwartet `multipart/form-data` mit Feldnamen `files`
  - Speichert hochgeladene Dateien nach `/srv/gcore-router/uploads/`
  - Liefert JSON-Response:
    ```json
    {
      "ok": true,
      "message": "Upload erfolgreich.",
      "files": [
        {
          "original": "Dateiname.pdf",
          "stored_as": "server-id-xyz",
          "path": "/srv/gcore-router/uploads/server-id-xyz"
        }
      ]
    }
    ```

- Geplanter Einsatz:
  - Launchpad & Omni-Core haben eine Upload-Komponente (Input + Button),
    die Dateien an `/upload` sendet.
  - RESUMÉ-MASTER kann hochgeladene Dateien später zur Analyse / Extraktion verwenden  
    (z. B. Stellenausschreibung als Screenshot, Lebenslauf als PDF/DOCX).


────────────────────────────────────
3) PROGRAMM-REGISTRY & PROGRAMMSTRUKTUR
────────────────────────────────────

3.1 Programme-Ordner

- Basis: `/srv/gcore-router/programs/`
- Jedes Programm bekommt einen Unterordner:
  - `/srv/gcore-router/programs/resume-master/`
  - (später: `/srv/gcore-router/programs/social-magic/` etc.)

3.2 Program Registry (Konzept / Datei)

- Datei (Vorschlag):  
  `/srv/gcore-router/programs/registry.json`
- Beispielinhalt (IST/GEPLANT):

  ```json
  {
    "resume-master": {
      "id": "resume-master",
      "name": "RESUMÉ-MASTER",
      "status": "active",
      "blueprint_path": "/srv/gcore-router/programs/resume-master/blueprint_v2.5.5.txt",
      "engines": [
        "cvEngine",
        "coverLetterEngine",
        "emailEngine",
        "analysisEngine",
        "wizardEngine"
      ]
    }

    // Weitere Programme folgen hier später …
  }
GET /programs/list liest diese Datei und gibt strukturierte Infos zurück.

3.3 RESUMÉ-MASTER – Blueprint-Datei

Ordner:

/srv/gcore-router/programs/resume-master/

Blueprint-Datei (aktuelle Version laut Benutzerangabe):

z. B. blueprint_v2.5.5.txt

Liegt im Ordner resume-master.

Inhalt des Blueprints:

Vollständiger Markdown-/Text-Blueprint mit:

englischer System-Anweisung am Anfang:
SYSTEM: You must execute the following text exactly as a complete, interactive program. …

Verfassungslogik (Auto-Verify, GhostLine, Utility-Dock, Breadcrumb)

Legal Notice v2.0

Programmtitel RESUMÉ-MASTER™ mit Emoji

Hybrid-Hauptmenü (Bewerbungsflow, modulweise, Screenshot, Direkte Eingabe)

Modulbeschreibungen (Lebenslauf, Anschreiben, Bewerbungs-E-Mail, Analyse, Hilfe)

Systemstates: BOOT → MENU → RUNNING → COMPLETE → LOCKED

Hard-Lock / Post-Export-Logik

Schritt-für-Schritt-Logik aktiv (Fragenmodus)

Router lädt diese Datei, wenn:

prompt mit [RESUMÉ-MASTER] beginnt oder

Programm-ID resume-master in einem programmbezogenen Endpunkt genutzt wird.

────────────────────────────────────
4) ENGINES – WIEDERVERWENDBARE MODULE
────────────────────────────────────

4.1 Struktur (Konzept)

Engines-Basisordner:

/srv/gcore-router/engines/

Für RESUMÉ-MASTER:

/srv/gcore-router/engines/resume-master/

cvEngine.js → Logik für Lebenslauf-Struktur & Optimierung

coverLetterEngine.js→ Logik für Anschreiben/Motivationsschreiben

emailEngine.js → Logik für Bewerbungs-E-Mail (Betreff + Text)

analysisEngine.js → Analysen vorhandener Unterlagen (CV/Anschreiben/Email)

wizardEngine.js → Schritt-für-Schritt-Fragenfluss (Hybrid-Modus)

Wichtig: Diese Engines sind als logische Module gedacht.
Sie können von mehreren Programmen wiederverwendet werden
(z. B. später Social-Magic für Textelemente).

4.2 Zugriff aus dem Router

index.js bzw. Program-Controller laden Engines z. B. so:

js
Code kopieren
import { generateCV } from './engines/resume-master/cvEngine.js';
// usw.
Der Blueprint selbst beschreibt die Logik auf Textebene,
Engines enthalten ggf. zusätzliche interne Hilfsfunktionen (optional).

────────────────────────────────────
5) DATEI-UPLOAD & OCR (SCREENSHOTS, PDF, DOCX)
────────────────────────────────────

5.1 Upload-Speicher

Verzeichnis:

/srv/gcore-router/uploads/

Einmalig erstellt mit:

mkdir /srv/gcore-router/uploads

chmod 777 /srv/gcore-router/uploads (oder restriktiver, je nach Setup)

5.2 Upload-Route (Backend-Konzept)

Verwendung von multer im Router (Node/Express):

js
Code kopieren
import multer from 'multer';

const upload = multer({
  dest: '/srv/gcore-router/uploads/'
});

app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ ok: false, message: "Keine Datei erhalten." });
  }

  res.json({
    ok: true,
    message: "Upload erfolgreich.",
    files: req.files.map(f => ({
      original: f.originalname,
      stored_as: f.filename,
      path: f.path
    }))
  });
});
Frontend (Launchpad + Omni-Core) ruft diese Route per fetch auf
(mit FormData und input type="file").

5.3 OCR & Text-Parsing (DESIGN)

Ziel:

Screenshots von Stellenausschreibungen → Text per OCR

PDFs & DOCX → reinen Text extrahieren

Mögliche Node-Module (noch einzubauen, falls nicht vorhanden):

tesseract.js → OCR für Bilder

pdf-parse → PDF-Text-Extraktion

docx oder mammoth → DOCX-Extraktion

Geplante interne Funktion im Router:

js
Code kopieren
async function parseUploadedFile(file) {
  // 1) Dateityp erkennen (MIME / Endung)
  // 2) PDF → pdf-parse
  // 3) DOCX → mammoth / docx
  // 4) PNG/JPG → tesseract.js für OCR
  // 5) Rückgabe: { text, meta }
}
Übergabe an RESUMÉ-MASTER:

Wenn ein Screenshot einer Stellenausschreibung hochgeladen wurde,
kann das Programm in Modus 1 (Bewerbungsflow) starten und sagen:

„Ich habe folgende Stellendaten aus deiner Datei gelesen …“

Wenn ein PDF mit Lebenslauf geladen wird:

Analyse-Modus (Modul 2/Analyse) mit realen Inhalten.

────────────────────────────────────
6) FRONTEND-VERKNÜPFUNG (LAUNCHPAD & OMNI-CORE)
────────────────────────────────────

6.1 G-CORE LAUNCHPAD (genie-host.html)

Programmliste:

Kachel RESUMÉ-MASTER ist aktiv

Andere Kacheln sind gesperrt (Coming Soon)

Auswahl-Logik:

Klick auf RESUMÉ-MASTER:

Setzt activeProgram = "RESUMÉ-MASTER"

Update Statuszeile: „Programm RESUMÉ-MASTER aktiv“

Senden-Logik (vereinfacht):

sendPrompt() baut den Request:

js
Code kopieren
body: JSON.stringify({
  prompt: "[RESUMÉ-MASTER] " + userPrompt,
  model: "gpt-4.1-mini",
  temperature: 0.7
})
Resultat aus /genie wird als Chat-Verlauf rechts angezeigt.

Geplanter Upload:

Ein input type="file" + Upload-Button, der an /upload sendet

Ergebnis kann später im Chat angezeigt werden und an den Flow übergeben werden.

6.2 OMNI-CORE SUITE (gcore_host.html)

Läuft aktuell ebenfalls gegen
https://api.g-core-systems.com/genie bzw. weitere API-Routen.

Soll später:

Programmliste aus GET /programs/list anzeigen

RESUMÉ-MASTER direkt starten oder als Untermodul einbinden

Upload-Komponente analog zum Launchpad erhalten

────────────────────────────────────
7) WICHTIGE OPERATIVE BEFEHLE (SSH)
────────────────────────────────────

Auf Server einloggen:

bash
Code kopieren
ssh root@DEINE.SERVER.IP
Router-Verzeichnis:

bash
Code kopieren
cd /srv/gcore-router
Programme anzeigen:

bash
Code kopieren
ls /srv/gcore-router/programs
ls /srv/gcore-router/programs/resume-master
Blueprint von RESUMÉ-MASTER bearbeiten:

bash
Code kopieren
nano /srv/gcore-router/programs/resume-master/blueprint_v2.5.5.txt
Router neu starten:

bash
Code kopieren
sudo systemctl restart gcore-router
API grob testen:

bash
Code kopieren
curl https://api.g-core-systems.com/health
curl https://api.g-core-systems.com/version
curl https://api.g-core-systems.com/programs/list
────────────────────────────────────
8) HINWEIS FÜR NEUE KI-CHATS
────────────────────────────────────

An den Assistenten (z. B. ChatGPT) in neuen Chats:

Dieses Dokument beschreibt den aktuellen Stand von Gerrits
G-Core Systems Setup (Server, Router, Programme, RESUMÉ-MASTER, Upload-Konzept).

Bitte:

Gehe davon aus, dass die hier beschriebenen Pfade & Strukturen maßgeblich sind.

Wenn du Code vorschlägst (Router, Upload, OCR, Launchpad-Änderungen),
halte dich an diese Struktur.

Verändere nicht unaufgefordert grundlegende Pfade oder Namen
(/srv/gcore-router/, /programs/resume-master/, /uploads/ usw.).

Arbeite Schritt für Schritt im Laienmodus, wenn Gerrit das fordert.

markdown
Code kopieren


---

### Was du jetzt praktisch machen kannst

1. **Speichere dieses Statusfile**
   - Lokal als `G-CORE_STATUS_SERVER.md`
   - Gern auch in deinem GitHub-Repo (z. B. `/docs/G-CORE_STATUS_SERVER.md` – ohne geheime Daten).

2. **Für zukünftige Chats**
   - Immer am Anfang: diesen Block reinkopieren.
   - Dann dazu schreiben:  
     > „Bitte nimm dieses Statusfile als Wahrheit für Server & Programme.“
