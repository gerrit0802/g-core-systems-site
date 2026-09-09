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

const mobileViewRequested = new URLSearchParams(window.location.search).get('view') === 'mobile';
if (mobileViewRequested) document.documentElement.classList.add('force-mobile-view');

document.querySelector('[data-mobile-view-switch]')?.addEventListener('click', (event) => {
  event.preventDefault();
  document.documentElement.classList.add('force-mobile-view');
  const currentDialog = productDialogs?.get('tagesanker');
  if (currentDialog?.open) closeProduct(currentDialog, false);
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'mobile');
  url.hash = 'tagesanker';
  window.history.replaceState(null, '', url);
  document.getElementById('tagesanker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

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

const featureContent = {
  tagesanker: {
    focus: ['01', 'Fokus statt Dauerliste', 'Der nächste sinnvolle Schritt bleibt sichtbar.', 'Der Jetzt-Modus reduziert die sichtbare Komplexität bewusst. Die Top 3 geben Orientierung, ohne den gesamten Tag gleichzeitig in den Vordergrund zu drängen.', 'Eine nächste Handlung', 'Bewusste Priorisierung'],
    together: ['02', 'Gemeinsam planen', 'Aus einem Vorschlag wird eine bewusste Zusage.', 'Mit ausgewählten Personen verbinden, Planungsvorschläge austauschen und selbst über die Übernahme als eigene Aufgabe entscheiden. Ablehnung und Annahmestatus halten Absprachen nachvollziehbar. Private Aufgaben und persönliche Änderungen werden nicht automatisch geteilt.', 'Einladung und Planungsvorschläge', 'Private Übernahme nach Zustimmung'],
    routine: ['03', 'Wiederkehrendes verlässlich tragen', 'Routinen müssen nicht jeden Tag neu geplant werden.', 'Wiederkehrende Verpflichtungen bleiben im richtigen Rhythmus sichtbar. Erinnerungen unterstützen, ohne den gesamten Tagesplan zu dominieren.', 'Routinen und Erinnerungen', 'Tagesabschluss mit Rückweg'],
    context: ['04', 'Bereiche bewusst trennen', 'Privates und Berufliches bleiben unterscheidbar.', 'Getrennte Bereiche schaffen Übersicht. Eine optionale Kalenderverknüpfung kann relevante Termine einbeziehen, ohne den Fokusgedanken aufzugeben.', 'Privat und Beruf', 'Optionale Kalenderverknüpfung'],
    control: ['05', 'Kontrolle bleibt beim Nutzer', 'Persönliche Struktur braucht verlässliche Grenzen.', 'App-Sperre, Widget und verschlüsselte Sicherung ergänzen die tägliche Nutzung. Der Nutzer entscheidet, welche Funktionen und Verbindungen aktiv sind.', 'Verschlüsselte Sicherung', 'Widget und App-Sperre']
  },
  'story-forge': {
    world: ['01', 'Eigener Kanon', 'Die Welt besteht aus mehr als einer Kulisse.', 'Figuren, Schauplätze, Regeln, Inventar und Wissen bleiben miteinander verbunden und bilden die Grundlage für die nächste Szene.', 'Beständige Weltzustände', 'Verbundene Spielsysteme'],
    consequence: ['02', 'Entscheidungen mit Folgen', 'Handlungen verändern, was danach möglich ist.', 'Aufgaben, Beziehungen, Ressourcen und Wege reagieren auf Entscheidungen. Folgen bleiben nicht nur Text, sondern werden in den verbundenen Systemen sichtbar.', 'Fortlaufende Konsequenzen', 'Aufgaben, Reise und Handel'],
    chronicle: ['03', 'Chronik und Weltwissen', 'Die Welt erinnert sich nachvollziehbar.', 'Chronik und Weltwissen halten fest, was geschehen ist und welche Informationen Figuren besitzen. So kann die Geschichte konsistent fortgeführt werden.', 'Nachvollziehbare Chronik', 'Wissen im Kontext'],
    ai: ['04', 'Eigene KI-Verbindung', 'Freie Erzählung bleibt bewusst konfigurierbar.', 'Für freie KI-Erzählungen wird eine eigene API-Verbindung zu einem unterstützten Anbieter benötigt. Ohne sie bleibt ein begrenzter lokaler Modus mit festen Handlungen verfügbar.', 'Eigene API-Verbindung', 'Begrenzter lokaler Modus']
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
    core: 'Familienkoordination',
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
  const visibleFindings = [...matches, ...fallback, ...fallback].slice(0, 3);
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
  window.location.href = `mailto:info@g-core-systems.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
