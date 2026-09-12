const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const navLight = document.createElement('span');
navLight.className = 'nav-light';
navLight.setAttribute('aria-hidden', 'true');
nav?.append(navLight);
const positionNavLight = () => {
  const active = navLinks.find(link => link.classList.contains('active'));
  const visible = active && nav?.getClientRects().length;
  navLight.style.opacity = visible ? '1' : '0';
  if (!visible) return;
  navLight.style.width = `${active.offsetWidth}px`;
  navLight.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop + active.offsetHeight + 7}px)`;
};

const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 16);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
  scheduleActiveSection();
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
}));

// Old shared links must not force a partial mobile layout or change the product.
const normalizeLegacyMobileView = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.get('view') !== 'mobile') return;
  url.searchParams.delete('view');
  window.history.replaceState(window.history.state, '', url);
};
normalizeLegacyMobileView();
window.addEventListener('popstate', normalizeLegacyMobileView);

const productDialogs = new Map(
  [...document.querySelectorAll('[data-product-dialog]')].map((dialog) => [dialog.dataset.productDialog, dialog])
);

const setActiveNav = (sectionId) => {
  const sectionOwners = { zielgruppen: 'loesungen', entwicklung: 'unternehmen', sicherheit: 'unternehmen', kontakt: 'projektanfrage' };
  const mappedSection = ['tagesanker', 'story-forge'].includes(sectionId) ? 'apps' : (sectionOwners[sectionId] || sectionId);
  navLinks.forEach((link) => {
    const active = !link.classList.contains('button') && link.getAttribute('href') === `#${mappedSection}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  positionNavLight();
};

const closeProduct = (dialog, updateHistory = true) => {
  if (!dialog?.open) return;
  dialog.close();
  document.body.classList.remove('product-dialog-open');
  if (updateHistory && ['#tagesanker', '#story-forge'].includes(window.location.hash)) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#apps`);
  }
  scheduleActiveSection();
};

const openProduct = (productId, updateHistory = true) => {
  const dialog = productDialogs.get(productId);
  if (!dialog) return;
  productDialogs.forEach((candidate) => {
    if (candidate !== dialog && candidate.open) closeProduct(candidate, false);
  });
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('product-dialog-open');
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.hash = productId;
    window.history.replaceState(null, '', url);
  }
  setActiveNav('apps');
};

document.querySelectorAll('[data-product-open]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openProduct(trigger.dataset.productOpen);
  });
});

productDialogs.forEach((dialog) => {
  dialog.querySelectorAll('[data-product-close]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      closeProduct(dialog);
    });
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProduct(dialog);
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeProduct(dialog);
  });
});

// Guided original captures: presentation controls never simulate app actions.
const tagesankerCaptures = {
  today: { image: 'assets_products/tagesanker-heute-20260912.png', alt: 'Originalaufnahme Heute mit Privat, Beruf und dem Einstieg Gemeinsam planen', count: '01 / 02',
    details: [
      ['Bereiche', 11.5, 'Privates und Berufliches. Klar getrennt.', 'Zwei Bereiche halten persönliche Vorhaben und berufliche Aufgaben auseinander. Der gewählte Bereich bleibt oben sichtbar.'],
      ['Gemeinsam', 20, 'Von deinem Tag zur gemeinsamen Planung.', 'Der Einstieg Gemeinsam planen führt direkt zur Abstimmung mit anderen. Welche Inhalte geteilt werden, wird erst dort bewusst festgelegt.'],
      ['Navigation', 57.29, 'Vier Wege durch deinen Alltag.', 'Heute, Eingang, Kalender und Routinen bleiben über die untere Navigation erreichbar. Weitere Funktionen liegen im Mehr-Menü.']
    ] },
  calendar: { image: 'assets_products/tagesanker-kalender-20260912.png', alt: 'Originalaufnahme Kalender mit sechs Ansichten, Optionen für Quellen und leerer Wochenübersicht', count: '02 / 02',
    details: [
      ['Ansichten', 19.8, 'Die Perspektive wechselt. Der Plan bleibt.', 'Tag, 3 Tage, Woche, Monat, Agenda und Planung lassen sich direkt auswählen. So wird aus einem Tagesdetail ein größerer Überblick.'],
      ['Quellen', 40, 'Zusammenhänge mit bewusst gewählten Quellen.', 'Unter Optionen lassen sich zusätzliche Kalenderquellen auswählen. Die Anzeige benennt ihre Grenzen: keine geladenen Einträge bedeutet nicht automatisch freie Zeit.'],
      ['Zeiträume', 46.2, 'Orientierung bis zum einzelnen Tag.', 'Zeitraum und Wochentage machen den gezeigten Ausschnitt nachvollziehbar. Die Originalaufnahme zeigt eine Woche ohne geladene Termine.']
    ] }
};
document.querySelectorAll('[data-ta-showcase]').forEach((showcase) => {
  const image = showcase.querySelector('[data-ta-image]');
  const frame = showcase.querySelector('[data-ta-window]');
  const original = showcase.querySelector('[data-ta-original]');
  const full = showcase.querySelector('[data-ta-full]');
  const views = [...showcase.querySelectorAll('[data-ta-view]')];
  const details = [...showcase.querySelectorAll('[data-ta-detail]')];
  const error = showcase.querySelector('[data-ta-error]');
  let active = 'today';
  let request = 0;
  let animation;
  const render = (key, index) => {
    const capture = tagesankerCaptures[key];
    const detail = capture.details[index];
    active = key;
    image.src = capture.image;
    image.alt = capture.alt;
    original.href = capture.image;
    original.setAttribute('aria-label', `Vollständige Originalaufnahme ${key === 'today' ? 'Heute' : 'Kalender'} in neuem Tab öffnen`);
    frame.style.setProperty('--ta-crop', String(detail[1]));
    showcase.querySelector('[data-ta-count]').textContent = capture.count;
    showcase.querySelector('[data-ta-index]').textContent = String(index + 1).padStart(2, '0');
    showcase.querySelector('[data-ta-title]').textContent = detail[2];
    showcase.querySelector('[data-ta-description]').textContent = detail[3];
    views.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.taView === key)));
    details.forEach((button, i) => {
      button.querySelector('b').textContent = capture.details[i][0];
      button.setAttribute('aria-pressed', String(i === index));
    });
    error.hidden = true;
  };
  const select = async (key, index) => {
    const capture = tagesankerCaptures[key];
    if (!capture || !Number.isInteger(index) || !capture.details[index]) return;
    const current = ++request;
    if (key !== active) {
      const candidate = new Image();
      candidate.src = capture.image;
      try { await candidate.decode(); } catch {
        if (request === current) error.hidden = false;
        return;
      }
    }
    if (request !== current) return;
    render(key, index);
    animation?.cancel();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && image.animate) {
      animation = image.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
    }
  };
  views.forEach(button => button.addEventListener('click', () => select(button.dataset.taView, 0)));
  details.forEach(button => button.addEventListener('click', () => select(active, Number(button.dataset.taDetail))));
  [views, details].forEach(group => group.forEach((button, index) => button.addEventListener('keydown', event => {
    const offset = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: group.length - 1 - index }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const target = group[(index + offset + group.length) % group.length];
    target.focus();
    target.click();
  })));
  full.addEventListener('click', () => {
    const expanded = showcase.classList.toggle('is-full');
    full.setAttribute('aria-pressed', String(expanded));
    full.textContent = expanded ? 'Detailansicht' : 'Gesamtansicht';
    showcase.querySelector('[data-ta-framing]').textContent = expanded ? 'Vollständige Originalaufnahme' : 'Vergrößerter Originalausschnitt';
  });
  render('today', 0);
  showcase.classList.add('is-enhanced');
  showcase.querySelector('[data-ta-framing]').textContent = 'Vergrößerter Originalausschnitt';
  showcase.querySelectorAll('[data-ta-controls]').forEach(control => { control.hidden = false; });
});

const featureContent = {
  tagesanker: {
    focus: ['01', 'Dein Alltag, übersichtlich', 'Erst festhalten. Dann bewusst einordnen.', 'Aufgaben zunächst ohne Termin im Eingang sammeln und später planen. Meine Top 3 hebt bis zu drei wichtige offene Aufgaben hervor. Eigene Vorlagen für Titel, Notiz und Aufwand sparen wiederholte Eingaben. Privat und Beruf bleiben getrennte Bereiche – ohne verpflichtenden Tagesstart oder Tagesabschluss.', 'Meine Top 3', 'Eigene Vorlagen'],
    together: ['02', 'Gemeinsam planen', 'Verbunden planen. Selbst entscheiden.', 'Mit gezielt eingeladenen Personen Vorschläge austauschen, gemeinsame Termine planen oder Frei/Belegt-Zeiten freigeben. Diese drei Funktionen bleiben getrennt: Ein empfangener Vorschlag wird erst durch ausdrückliche Übernahme zur privaten Aufgabe. Persönliche Änderungen daran bleiben privat; der Übertragungsstatus bleibt sichtbar.', 'Vorschläge & gemeinsame Termine', 'Frei/Belegt nach Freigabe'],
    routine: ['03', 'Routinen und Terminserien', 'Wiederkehrend ist nicht immer dasselbe.', 'Routinen folgen einem Plan oder leiten die nächste Fälligkeit aus der Erledigung ab. Terminserien bilden dagegen feste Kalenderfolgen ab: Ändere einen Termin, diesen und folgende oder die gesamte Serie – mit Prüfung des Geltungsbereichs vor dem Speichern. Serien bleiben derzeit lokal, ohne Erinnerungen, Gerätekalenderbindung oder Gemeinsam-Synchronisation.', 'Routinen nach Plan oder Erledigung', 'Serien mit gezielten Ausnahmen'],
    context: ['04', 'Kalender mit Perspektive', 'Vom einzelnen Tag zum größeren Zusammenhang.', 'Tag, 3 Tage, Woche, Monat, Agenda und Planung zeigen jeweils einen anderen Ausschnitt. Planung bezieht auch Aufgaben ohne Termin ein. Gerätekalender und gemeinsame Termine lassen sich als zusätzliche Quellen einblenden. Hinweise auf Überschneidungen und unvollständig geladene Quellen helfen beim Einordnen; Termine werden nicht automatisch verschoben.', 'Sechs Kalenderansichten', 'Quellen bewusst auswählen'],
    control: ['05', 'Deine App, deine Einstellungen', 'Die Planung passt sich deinem Alltag an.', 'Startansicht, Design, Textgröße, Wochenbeginn und Vorgaben für neue Einträge lassen sich anpassen. Gültige Einstellungen werden automatisch gespeichert; bestehende Aufgaben werden durch neue Planungsvorgaben nicht verändert. App-Sperre und passwortgeschützte Sicherungsdateien ergänzen die lokale Aufgabenverwaltung.', 'Anpassbare Darstellung', 'Verschlüsselte Sicherung']
  },
  'story-forge': {
    world: ['01', 'Eigener Kanon', 'Aus eigenen Ideen wird eine spielbare Welt.', 'In der Werkstatt lassen sich Welt, Figuren, Orte, Fraktionen und Hintergrundwissen selbst gestalten oder mit KI ausarbeiten. Einzelne Felder und ganze Entwürfe bleiben bearbeitbar. Erst die bestätigte Übernahme macht daraus gespeicherte Inhalte.', 'Eigene Inhalte & KI-Entwürfe', 'Prüfen vor Übernehmen'],
    consequence: ['02', 'Entscheidungen mit Folgen', 'Deine Spielweise. Eine Geschichte mit Konsequenzen.', 'Classic, Hybrid und Narrativ setzen unterschiedliche Schwerpunkte zwischen Regeln und Erzählung. Handlungen knüpfen an den gespeicherten Spielstand an: Ressourcen, Inventar und Aufenthaltsorte werden weitergeführt; Aufgabenfortschritt ist an Ereignisse gebunden.', 'Classic, Hybrid & Narrativ', 'Fortschritt durch Ereignisse'],
    chronicle: ['03', 'Chronik und Weltwissen', 'Nicht jede Figur weiß, was du weißt.', 'Die Chronik hält Erlebnisse und ihre Herkunft fest. Figurenwissen, Berichte, Gerüchte und bestätigte Erkenntnisse werden unterschieden. So bleiben Entdeckungen und Geheimnisse Teil des Spiels – statt zu einem allwissenden Erzählertext zu verschmelzen.', 'Wissen mit Herkunft', 'Figurenwissen & Geheimnisse'],
    ai: ['04', 'Eigene KI-Verbindung', 'Freie Erzählung trifft auf klare Spielregeln.', 'Die KI entwickelt Vorschläge für den nächsten Verlauf. Spielrelevante Änderungen werden vor der Übernahme gegen Regeln und gespeicherte Inhalte geprüft. Freie KI-Erzählungen benötigen eine eigene API-Verbindung; Anbieter, Modell und Nutzungslimits bleiben bewusst wählbar.', 'Eigene API-Verbindung', 'Prüfung vor Zustandsänderung']
  }
};

document.querySelectorAll('[data-feature-explorer]').forEach((explorer) => {
  const productId = explorer.dataset.featureExplorer;
  const tabs = [...explorer.querySelectorAll('[data-feature-key]')];
  const stage = explorer.querySelector('.explorer-stage');
  const tabList = explorer.querySelector('[role="tablist"]');
  stage.id = `${productId}-feature-panel`;
  stage.setAttribute('role', 'tabpanel');
  tabList.setAttribute('aria-orientation', 'vertical');
  const accordion = document.createElement('div');
  accordion.className = 'feature-accordion';
  tabs.forEach((tab, index) => {
    tab.id = `${productId}-feature-${tab.dataset.featureKey}`;
    tab.setAttribute('aria-controls', stage.id);
    const details = document.createElement('details');
    details.name = `${productId}-features`;
    details.open = index === 0;
    const summary = document.createElement('summary');
    summary.append(...[...tab.children].map(child => child.cloneNode(true)));
    const panel = stage.cloneNode(true);
    panel.removeAttribute('id');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-live');
    panel.className = 'accordion-content';
    const content = featureContent[productId][tab.dataset.featureKey];
    ['number', 'kicker', 'title', 'copy', 'proof-a', 'proof-b'].forEach((field, fieldIndex) => {
      const target = panel.querySelector(`[data-feature-${field}]`);
      target.textContent = content[fieldIndex];
      target.removeAttribute(`data-feature-${field}`);
    });
    panel.querySelector('.explorer-number')?.remove();
    details.append(summary, panel);
    accordion.append(details);
    summary.addEventListener('click', () => requestAnimationFrame(() => {
      if (details.open) summary.scrollIntoView({ block: 'start', behavior: 'instant' });
    }));
  });
  explorer.append(accordion);
  const selectFeature = (key, moveFocus = false, animate = true) => {
    const content = featureContent[productId]?.[key];
    if (!content) return;
    const update = () => {
      tabs.forEach((tab) => {
        const selected = tab.dataset.featureKey === key;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected) stage.setAttribute('aria-labelledby', tab.id);
        if (selected && moveFocus) tab.focus();
      });
      ['number', 'kicker', 'title', 'copy', 'proof-a', 'proof-b'].forEach((field, index) => {
        const target = explorer.querySelector(`[data-feature-${field}]`);
        if (target) target.textContent = content[index];
      });
    };
    update();
    if (animate && !reducedMotion && stage.animate) {
      stage.getAnimations().forEach(animation => animation.cancel());
      stage.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectFeature(tab.dataset.featureKey));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let targetIndex = index;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) targetIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = tabs.length - 1;
      selectFeature(tabs[targetIndex].dataset.featureKey, true);
    });
  });
  if (tabs.length) selectFeature(tabs[0].dataset.featureKey, false, false);
});

const scenarioTabs = [...document.querySelectorAll('[data-scenario-tab]')];
const navigator = document.querySelector('[data-system-navigator]');
const navigatorWorkspace = document.getElementById('navigator-workspace');
const factorButtons = [...document.querySelectorAll('[data-navigator-factor]')];
const navigatorLines = [...document.querySelectorAll('[data-navigator-line]')];
const resultNodes = [...document.querySelectorAll('[data-navigator-result-node]')];
const navigatorCanvas = document.querySelector('.navigator-canvas');
const navigatorViewport = document.querySelector('.navigator-viewport');
let navigatorLineFrame = 0;
const scheduleNavigatorLines = () => {
  if (navigatorLineFrame || !navigatorCanvas) return;
  navigatorLineFrame = requestAnimationFrame(() => {
    navigatorLineFrame = 0;
    const svg = navigatorCanvas.querySelector('svg');
    const bounds = svg.getBoundingClientRect();
    const core = navigatorCanvas.querySelector('.navigator-core').getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const connect = (line, from, to) => {
      const x1 = from.right - bounds.left, y1 = (from.top + from.bottom) / 2 - bounds.top;
      const x2 = to.left - bounds.left, y2 = (to.top + to.bottom) / 2 - bounds.top;
      const mid = (x1 + x2) / 2;
      line.setAttribute('d', `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
    };
    navigatorLines.forEach((line, index) => connect(line, factorButtons[index].getBoundingClientRect(), core));
    navigatorCanvas.querySelectorAll('.result-line').forEach((line, index) => connect(line, core, resultNodes[index].parentElement.getBoundingClientRect()));
    const hint = document.querySelector('[data-navigator-scroll-hint]');
    if (hint) hint.hidden = navigatorViewport.scrollWidth <= navigatorViewport.clientWidth + 1;
  });
};
if (navigatorCanvas && 'ResizeObserver' in window) {
  const navigatorResize = new ResizeObserver(scheduleNavigatorLines);
  [navigatorCanvas, navigatorViewport, ...factorButtons].forEach(element => navigatorResize.observe(element));
}
window.addEventListener('resize', scheduleNavigatorLines);
document.fonts?.ready.then(scheduleNavigatorLines);

const navigatorScenarios = {
  case: {
    mapTitle: 'Komplexe Fallsteuerung',
    core: 'Digitale Fallakte',
    title: 'Komplexe Fallsteuerung in der rechtlichen Betreuung',
    summary: 'Viele Beteiligte, Fristen, Dokumente und Entscheidungen werden in einem nachvollziehbaren Zusammenhang betrachtet.',
    factors: ['Gericht & Beschlüsse', 'Ärzte & Einrichtungen', 'Behörden & Leistungsträger', 'Banken & Verträge', 'Fristen & Wiedervorlagen'],
    rules: [
      { requires: [0, 4], short: 'Beschluss und Frist', text: 'Ein neuer Beschluss kann eine laufende Frist verändern.' },
      { requires: [2, 4], short: 'Nachweis und Frist', text: 'Eine Frist kann von einem noch fehlenden behördlichen Nachweis abhängen.' },
      { requires: [2, 3], short: 'Freigabe vor Versand', text: 'Vor einer externen Übermittlung kann eine Prüfung oder Freigabe nötig sein.' },
      { requires: [1, 2], short: 'Bedarf und Leistung', text: 'Eine gesundheitliche Veränderung kann einen laufenden Leistungsantrag berühren.' },
      { requires: [0, 3], short: 'Befugnis und Vertrag', text: 'Ein Vertrag kann von Umfang und Fortbestand einer Befugnis abhängen.' }
    ],
    decision: 'Der Betreuer prüft, wägt ab und entscheidet.',
    path: ['Information erfassen', 'Beziehungen erkennen', 'Entwurf vorbereiten', 'Betreuer entscheidet']
  },
  operations: {
    mapTitle: 'Betriebsabläufe',
    core: 'Operative Steuerung',
    title: 'Auftragssteuerung über mehrere Betriebsbereiche',
    summary: 'Kundenanforderung, Einkauf, Kapazität, Qualität und Terminlage werden gemeinsam betrachtet.',
    factors: ['Kundenauftrag & Änderungen', 'Material & Lieferanten', 'Team & Kapazitäten', 'Qualität & Freigaben', 'Budget & Nachträge'],
    rules: [
      { requires: [0, 1], short: 'Auftrag und Material', text: 'Eine Kundenänderung kann Materialbedarf und Liefertermin zugleich verschieben.' },
      { requires: [1, 2], short: 'Lieferung und Kapazität', text: 'Ein Lieferverzug kann ein Arbeitspaket blockieren und Kapazität an anderer Stelle freisetzen.' },
      { requires: [0, 4], short: 'Änderung und Nachtrag', text: 'Ein geänderter Umfang kann eine neue Kosten- oder Nachtragsfreigabe erfordern.' },
      { requires: [2, 3], short: 'Besetzung und Qualität', text: 'Eine alternative Besetzung kann zusätzliche Qualitätssicherung notwendig machen.' },
      { requires: [3, 4], short: 'Prüfung und Budget', text: 'Eine zusätzliche Prüfung kann Kosten und verbindliche Zusagen beeinflussen.' }
    ],
    decision: 'Verantwortliche vergleichen die Optionen und geben verbindlich frei.',
    path: ['Änderung erfassen', 'Auswirkungen erkennen', 'Optionen vergleichen', 'Verantwortliche geben frei']
  },
  family: {
    mapTitle: 'Familie & Pflege',
    core: 'Familien\u00ADkoordination',
    title: 'Familien- und Pflegekoordination ohne Informationsverlust',
    summary: 'Gesundheit, Termine, Zuständigkeiten und Alltag mehrerer Personen werden behutsam zusammengeführt.',
    factors: ['Praxis & Pflegedienst', 'Schule & Betreuung', 'Termine & Transporte', 'Medikation & Versorgung', 'Absprachen in der Familie'],
    rules: [
      { requires: [0, 2], short: 'Termin und Begleitung', text: 'Ein neuer Behandlungstermin kann Begleitung und Transport gleichzeitig betreffen.' },
      { requires: [1, 2], short: 'Betreuung und Abholung', text: 'Zwei Termine können sich überschneiden und eine Vertretung für die Abholung erfordern.' },
      { requires: [0, 3], short: 'Änderung und Versorgung', text: 'Eine medizinische Änderung kann Auswirkungen auf die tägliche Versorgung haben.' },
      { requires: [2, 4], short: 'Termin und Abstimmung', text: 'Eine Terminänderung kann mehrere Familienmitglieder gleichzeitig betreffen.' },
      { requires: [3, 4], short: 'Versorgung und Rechte', text: 'Neue Informationen dürfen nur mit den dafür vorgesehenen Personen geteilt werden.' }
    ],
    decision: 'Die Familie entscheidet gemeinsam und wahrt persönliche Grenzen.',
    path: ['Änderung erfassen', 'Betroffene erkennen', 'Abstimmung vorschlagen', 'Familie entscheidet']
  }
};

const activeFactors = Object.fromEntries(Object.keys(navigatorScenarios).map((key) => [key, new Set([0, 1, 2, 3, 4])]));
let activeScenario = 'case';

const setText = (selector, value) => {
  const target = document.querySelector(selector);
  if (target) target.textContent = value;
};

const renderNavigator = () => {
  if (!navigator) return;
  const scenario = navigatorScenarios[activeScenario];
  const selected = activeFactors[activeScenario];
  const matches = scenario.rules.filter((rule) => rule.requires.every((index) => selected.has(index)));
  const relationshipCount = selected.size < 2 ? 0 : (selected.size * (selected.size - 1)) / 2;

  factorButtons.forEach((button, index) => {
    const pressed = selected.has(index);
    button.setAttribute('aria-pressed', String(pressed));
    button.querySelector('span').textContent = scenario.factors[index];
    button.querySelector('small').textContent = pressed ? 'einbezogen' : 'ausgeblendet';
  });
  navigatorLines.forEach((line, index) => line.classList.toggle('is-muted', !selected.has(index)));

  const fallback = selected.size
    ? [{ short: 'Weitere Verbindung', text: 'Weitere Zusammenhänge werden sichtbar, sobald zusätzliche Faktoren einbezogen werden.' }]
    : [{ short: 'Keine Auswahl', text: 'Wählen Sie mindestens zwei Faktoren, um mögliche Beziehungen sichtbar zu machen.' }];
  const visibleFindings = [...matches, ...fallback, ...fallback, ...fallback].slice(0, 3);
  resultNodes.forEach((node, index) => {
    node.textContent = visibleFindings[index].short;
    node.parentElement.classList.toggle('is-muted', index >= matches.length);
  });

  setText('[data-navigator-map-title]', scenario.mapTitle);
  setText('[data-navigator-count]', relationshipCount);
  setText('[data-navigator-core]', scenario.core);
  setText('[data-navigator-title]', scenario.title);
  setText('[data-navigator-summary]', scenario.summary);
  setText('[data-navigator-decision]', scenario.decision);
  scenario.path.forEach((step, index) => setText(`[data-navigator-path="${index}"]`, step));

  const findingList = document.querySelector('[data-navigator-findings]');
  if (findingList) {
    findingList.replaceChildren(...visibleFindings.map((finding) => {
      const item = document.createElement('li');
      item.textContent = finding.text;
      return item;
    }));
  }
  navigatorWorkspace?.setAttribute('aria-labelledby', `tab-${activeScenario}`);
  scheduleNavigatorLines();
};

const selectScenario = (key, moveFocus = false, animate = true) => {
  if (!navigatorScenarios[key]) return;
  const update = () => {
    activeScenario = key;
    scenarioTabs.forEach((tab) => {
      const selected = tab.dataset.scenarioTab === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    renderNavigator();
  };

  if (animate && !reducedMotion && document.startViewTransition) {
    const transition = document.startViewTransition(update);
    transition.ready.catch(error => {
      if (error.name !== 'AbortError') console.error(error);
    });
  } else {
    update();
  }
};

scenarioTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScenario(tab.dataset.scenarioTab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let targetIndex = index;
    if (event.key === 'ArrowLeft') targetIndex = (index - 1 + scenarioTabs.length) % scenarioTabs.length;
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % scenarioTabs.length;
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = scenarioTabs.length - 1;
    selectScenario(scenarioTabs[targetIndex].dataset.scenarioTab, true);
  });
});

if (scenarioTabs.length) selectScenario(scenarioTabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.scenarioTab || scenarioTabs[0].dataset.scenarioTab, false, false);

factorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.navigatorFactor);
    const selected = activeFactors[activeScenario];
    if (selected.has(index)) selected.delete(index);
    else selected.add(index);
    renderNavigator();
  });
});

document.querySelector('[data-navigator-reset]')?.addEventListener('click', () => {
  activeFactors[activeScenario] = new Set([0, 1, 2, 3, 4]);
  renderNavigator();
});

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll('main section[id]')];
// One reading line and all section positions: observer callbacks contain only deltas,
// so they cannot reliably identify the current section during long or reverse scrolls.
const updateActiveSection = () => {
  if ([...productDialogs.values()].some((dialog) => dialog.open)) {
    setActiveNav('apps');
    return;
  }
  const readingLine = (header?.getBoundingClientRect().bottom || 78) + Math.min(120, innerHeight * .15);
  let active = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= readingLine) active = section;
    else break;
  }
  setActiveNav(active?.id || 'start');
};
let navFrame = 0;
function scheduleActiveSection() {
  if (navFrame) return;
  navFrame = requestAnimationFrame(() => {
    navFrame = 0;
    updateActiveSection();
  });
}
window.addEventListener('scroll', scheduleActiveSection, { passive: true });
window.addEventListener('resize', scheduleActiveSection);
window.addEventListener('load', scheduleActiveSection);
document.fonts?.ready.then(scheduleActiveSection);
if ('ResizeObserver' in window) new ResizeObserver(scheduleActiveSection).observe(document.querySelector('main'));
scheduleActiveSection();

const openProductFromHash = () => {
  const productId = window.location.hash.slice(1);
  if (productDialogs.has(productId)) openProduct(productId, false);
};
openProductFromHash();
window.addEventListener('hashchange', openProductFromHash);

document.querySelectorAll('[data-dialog-open]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById(trigger.dataset.dialogOpen)?.showModal();
  });
});

document.querySelectorAll('.legal-dialog').forEach((dialog) => {
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector('[data-project-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = `Projektanfrage: ${data.get('type')}`;
  const body = [
    'Guten Tag,',
    '',
    'ich möchte folgende Projektanfrage an G-Core Systems richten:',
    '',
    `Name: ${data.get('name')}`,
    `E-Mail: ${data.get('email')}`,
    `Anfrage als: ${data.get('audience')}`,
    `Art der Anfrage: ${data.get('type')}`,
    `Gewünschter Zeitraum: ${data.get('timeline') || 'nicht angegeben'}`,
    `Budgetrahmen: ${data.get('budget') || 'nicht angegeben'}`,
    '',
    'Aufgabe oder Idee:',
    String(data.get('description')),
    '',
    'Mit freundlichen Grüßen',
    String(data.get('name'))
  ].join('\n');
  window.location.href = `mailto:hello@g-core-systems.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
