require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const vm = require('vm');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(path.join(__dirname)));
}

// ==========================================================================
// PHASES ET QUÊTES QUANTUM OF TRUST (SAAS IA POUR LES PROS)
// ==========================================================================
const PHASES = [
  { id: 1, name: "Energer", symbol: "🜍", subtitle: "Calcination · docs, factures & fraude" },
  { id: 2, name: "Trust Studio", symbol: "🜔", subtitle: "Distillation · confiance, tokens & traces" },
  { id: 3, name: "Bonne Réponse", symbol: "🜛", subtitle: "Formules · assistant métier BTP" },
  { id: 4, name: "Pipelines IA", symbol: "🜁", subtitle: "Fioles · modèles, files & payloads" },
  { id: 5, name: "Analytics", symbol: "🜃", subtitle: "Rituels · usage, risques & facturation" },
  { id: 6, name: "Launch", symbol: "🝤", subtitle: "Grand Œuvre · routing, audit & workspace" }
];

const QUESTS = [
  {
    id: 1,
    phase: 1,
    title: "La transmutation de la facture",
    difficulty: "FACILE",
    lesson: "Dans Energer, le statut d'un document c'est une variable texte : tu changes le contenu, le dashboard change.",
    lore: "Le vil <code>\"PENDING\"</code> repose dans le creuset d'Energer. Transmute-le en <code>\"VERIFIED\"</code> — le client pro attend l'or du badge vert.",
    objective: "Passe <code>statut</code> de <code>\"PENDING\"</code> à <code>\"VERIFIED\"</code>.",
    initialCode: `// File Energer — facture du jour\nlet statut = "PENDING";\n\nreturn statut;`,
    solutionCode: `let statut = "VERIFIED";\n\nreturn statut;`,
    hint: "Remplace \"PENDING\" par \"VERIFIED\".",
    rewardXP: 16,
    check: (res, ctx) => res === "VERIFIED" || ctx.statut === "VERIFIED"
  },
  {
    id: 2,
    phase: 1,
    title: "Les sièges de l'athanor",
    difficulty: "FACILE",
    lesson: "Un quota SaaS (sièges, crédits, tokens) c'est un nombre, sans guillemets.",
    lore: "L'athanor du workspace affiche 0 siège. Douze adeptes attendent d'entrer sur le plan Pro.",
    objective: "Les <code>sieges</code> sont à <code>0</code> — mets-les à <code>12</code>.",
    initialCode: `// Sièges du workspace Pro\nlet sieges = 0;\n\nreturn sieges;`,
    solutionCode: `let sieges = 12;\n\nreturn sieges;`,
    hint: "Remplace 0 par 12.",
    rewardXP: 16,
    check: (res, ctx) => res === 12 || ctx.sieges === 12
  },
  {
    id: 3,
    phase: 1,
    title: "Le sceau de fraude",
    difficulty: "FACILE",
    lesson: "<code>true</code> / <code>false</code> c'est le même interrupteur qu'une alerte IA ou qu'un flag de revue humaine.",
    lore: "Energer a senti l'impureté entre devis et facture. Le sceau d'alerte est encore froid — allume-le.",
    objective: "Allume <code>anomalieDetectee</code>.",
    initialCode: `// Flag fraude Energer\nlet anomalieDetectee = false;\n\nreturn anomalieDetectee;`,
    solutionCode: `let anomalieDetectee = true;\n\nreturn anomalieDetectee;`,
    hint: "Passe false à true.",
    rewardXP: 16,
    check: (res, ctx) => res === true || ctx.anomalieDetectee === true
  },
  {
    id: 4,
    phase: 1,
    title: "Le sceau documentaire",
    difficulty: "FACILE",
    lesson: "Coller un préfixe et une année avec <code>+</code>, c'est l'ID qu'Energer pose sur chaque justificatif.",
    lore: "Forge le sceau <code>DOC-2024</code> : préfixe et année fusionnent dans le coffre d'Energer.",
    objective: "Colle <code>prefixe</code> et <code>annee</code> dans <code>refDocument</code>.",
    initialCode: `let prefixe = "DOC-";\nlet annee = 2024;\n\n// Référence unique Energer\nlet refDocument = "";\n\nreturn refDocument;`,
    solutionCode: `let prefixe = "DOC-";\nlet annee = 2024;\nlet refDocument = prefixe + annee;\n\nreturn refDocument;`,
    hint: "Utilise prefixe + annee.",
    rewardXP: 16,
    check: (res, ctx) => res === "DOC-2024" || ctx.refDocument === "DOC-2024"
  },
  {
    id: 5,
    phase: 2,
    title: "L'alliage de confiance",
    difficulty: "MOYEN",
    lesson: "Dans Trust Studio, <code>+</code> additionne deux notes IA : pertinence + sécurité, jamais du texte.",
    lore: "Deux poudres dans l'athanor de Trust Studio : 50 de pertinence, 45 de sécurité. Allie-les pour le badge.",
    objective: "Verse <code>pertinence</code> et <code>securite</code> dans <code>confiance</code>.",
    initialCode: `let pertinence = 50;\nlet securite = 45;\n\n// Score Trust Studio\nlet confiance = 0;\n\nreturn confiance;`,
    solutionCode: `let pertinence = 50;\nlet securite = 45;\nlet confiance = pertinence + securite;\n\nreturn confiance;`,
    hint: "Additionne pertinence + securite.",
    rewardXP: 16,
    check: (res, ctx) => res === 95 || ctx.confiance === 95
  },
  {
    id: 6,
    phase: 2,
    title: "La flamme des tokens",
    difficulty: "MOYEN",
    lesson: "<code>limite * 2</code> c'est le geste du plan Pro : tu doubles le quota sans réécrire le chiffre.",
    lore: "Le fourneau LLM est trop timide. Double la flamme : 1000 tokens deviennent 2000 pour le plan Pro.",
    objective: "Double <code>limiteTokens</code> dans <code>nouvelleLimite</code>.",
    initialCode: `let limiteTokens = 1000;\n\n// Nouveau plafond LLM\nlet nouvelleLimite = 0;\n\nreturn nouvelleLimite;`,
    solutionCode: `let limiteTokens = 1000;\nlet nouvelleLimite = limiteTokens * 2;\n\nreturn nouvelleLimite;`,
    hint: "Utilise limiteTokens * 2.",
    rewardXP: 16,
    check: (res, ctx) => res === 2000 || ctx.nouvelleLimite === 2000
  },
  {
    id: 7,
    phase: 2,
    title: "Le reste du fourneau",
    difficulty: "MOYEN",
    lesson: "<code>%</code> sert à répartir les appels IA : ce qui reste après la division, c'est l'instance qui prend la requête.",
    lore: "Dix gouttes, trois cornues. Trust Studio verse le reste dans le nœud qui doit recevoir la 10e requête.",
    objective: "Range <code>10 % 3</code> dans <code>noeud</code>.",
    initialCode: `let requetes = 10;\nlet noeuds = 3;\n\n// Index du nœud qui reçoit la requête\nlet noeud = 0;\n\nreturn noeud;`,
    solutionCode: `let requetes = 10;\nlet noeuds = 3;\nlet noeud = requetes % noeuds;\n\nreturn noeud;`,
    hint: "Écris requetes % noeuds (ça vaut 1).",
    rewardXP: 16,
    check: (res, ctx) => res === 1 || ctx.noeud === 1
  },
  {
    id: 8,
    phase: 3,
    title: "Le sceau de conformité",
    difficulty: "MOYEN",
    lesson: "Une fonction, c'est un helper du SaaS : La Bonne Réponse l'appelle, elle rend toujours le même verdict.",
    lore: "Le devis a passé le crible. La Bonne Réponse doit apposer le sceau <code>CONFORME</code> — un sort, pas une phrase recopiée.",
    objective: "Fais rendre <code>\"CONFORME\"</code> à <code>verifierConformite()</code>.",
    initialCode: `function verifierConformite() {\n  // Verdict La Bonne Réponse\n  return "";\n}\n\nreturn verifierConformite();`,
    solutionCode: `function verifierConformite() {\n  return "CONFORME";\n}\n\nreturn verifierConformite();`,
    hint: "Met return \"CONFORME\"; dans la fonction.",
    rewardXP: 16,
    check: (res) => res === "CONFORME"
  },
  {
    id: 9,
    phase: 3,
    title: "Le doubleur d'essence",
    difficulty: "MOYEN",
    lesson: "Un helper avec paramètre, c'est un micro-service : tu verses n'importe quel volume, la règle tokens reste la même.",
    lore: "Un mot verse deux tokens d'essence. Trust Studio veut un seul sortilège pour tout l'athanor.",
    objective: "<code>estimerTokens(x)</code> rend le double de <code>x</code>.",
    initialCode: `function estimerTokens(x) {\n  // 1 mot ≈ 2 tokens\n  return 0;\n}\n\nreturn estimerTokens(21);`,
    solutionCode: `function estimerTokens(x) {\n  return x * 2;\n}\n\nreturn estimerTokens(21);`,
    hint: "Fais return x * 2;",
    rewardXP: 16,
    check: (res, ctx) => res === 42 || (typeof ctx.estimerTokens === 'function' && ctx.estimerTokens(10) === 20)
  },
  {
    id: 10,
    phase: 3,
    title: "L'alliance du rapport",
    difficulty: "MOYEN",
    lesson: "Deux paramètres, c'est deux champs du rapport : le helper les assemble pour le client pro.",
    lore: "Allie le modèle et le devis : <code>Claude-3.5 -> Devis #884</code> — le grimoire que l'artisan recevra.",
    objective: "<code>formerRapport(modele, devis)</code> rend <code>modele + \" -> \" + devis</code>.",
    initialCode: `function formerRapport(modele, devis) {\n  // Ex: Claude-3.5 -> Devis #884\n  return "";\n}\n\nreturn formerRapport("Claude-3.5", "Devis #884");`,
    solutionCode: `function formerRapport(modele, devis) {\n  return modele + " -> " + devis;\n}\n\nreturn formerRapport("Claude-3.5", "Devis #884");`,
    hint: "Retourne modele + \" -> \" + devis.",
    rewardXP: 16,
    check: (res) => res === "Claude-3.5 -> Devis #884"
  },
  {
    id: 11,
    phase: 4,
    title: "Claude dans la fiole",
    difficulty: "AVANCÉ",
    lesson: "Un tableau c'est le catalogue de modèles : <code>.push()</code> ajoute un LLM, sans recréer la liste.",
    lore: "Le client Pro réclame Claude. Verse-le dans la fiole du routeur, à côté de GPT et Gemini.",
    objective: "Ajoute <code>\"claude-3-5-sonnet\"</code> dans <code>modeles</code>.",
    initialCode: `let modeles = ["gpt-4o", "gemini-3.6-flash"];\n\n// Ajoute Claude au routeur\n\nreturn modeles;`,
    solutionCode: `let modeles = ["gpt-4o", "gemini-3.6-flash"];\nmodeles.push("claude-3-5-sonnet");\n\nreturn modeles;`,
    hint: "Écris modeles.push(\"claude-3-5-sonnet\");",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.includes("claude-3-5-sonnet") && res.length === 3
  },
  {
    id: 12,
    phase: 4,
    title: "Le compte des fioles",
    difficulty: "AVANCÉ",
    lesson: "<code>.length</code> c'est le compteur de la file d'analyse : pas besoin de compter les PDF à la main.",
    lore: "Combien de fioles PDF dorment dans la file d'Energer ? L'athanor sait déjà compter.",
    objective: "Range le nombre de <code>file</code> dans <code>enAttente</code>.",
    initialCode: `let file = ["Devis_01.pdf", "Facture_88.pdf", "Justificatif_03.pdf", "Attestation.pdf"];\n\n// Compteur file Energer\nlet enAttente = 0;\n\nreturn enAttente;`,
    solutionCode: `let file = ["Devis_01.pdf", "Facture_88.pdf", "Justificatif_03.pdf", "Attestation.pdf"];\nlet enAttente = file.length;\n\nreturn enAttente;`,
    hint: "Utilise file.length.",
    rewardXP: 16,
    check: (res) => res === 4
  },
  {
    id: 13,
    phase: 4,
    title: "L'essence urgente",
    difficulty: "AVANCÉ",
    lesson: "Les listes commencent à <code>0</code> : le premier PDF de la file Energer c'est <code>file[0]</code>.",
    lore: "L'essence primaire de la file : la facture urgente, pas le devis. Elle trône à l'index 0 du creuset.",
    objective: "Sors le premier document dans <code>prioritaire</code>.",
    initialCode: `let file = ["Facture_Urgente.pdf", "Devis_Standard.pdf", "Avoir.pdf"];\n\n// Doc à traiter maintenant\nlet prioritaire = "";\n\nreturn prioritaire;`,
    solutionCode: `let file = ["Facture_Urgente.pdf", "Devis_Standard.pdf", "Avoir.pdf"];\nlet prioritaire = file[0];\n\nreturn prioritaire;`,
    hint: "Écris file[0].",
    rewardXP: 16,
    check: (res) => res === "Facture_Urgente.pdf"
  },
  {
    id: 14,
    phase: 4,
    title: "Le dernier sceau de trace",
    difficulty: "AVANCÉ",
    lesson: "Le dernier événement Trust Studio est à l'index <code>longueur - 1</code> — ici 3 logs, donc <code>[2]</code>.",
    lore: "L'audit veut le dernier sceau de la trace, pas le premier souffle du prompt.",
    objective: "Range le dernier log dans <code>dernier</code>.",
    initialCode: `let traces = ["PROMPT_SENT", "RESPONSE_RECEIVED", "CONFIDENCE_CHECKED"];\n\n// Dernier jalon Trust Studio\nlet dernier = "";\n\nreturn dernier;`,
    solutionCode: `let traces = ["PROMPT_SENT", "RESPONSE_RECEIVED", "CONFIDENCE_CHECKED"];\nlet dernier = traces[2];\n\nreturn dernier;`,
    hint: "Écris traces[2].",
    rewardXP: 16,
    check: (res) => res === "CONFIDENCE_CHECKED"
  },
  {
    id: 15,
    phase: 4,
    title: "La fiche du Grand Appel",
    difficulty: "AVANCÉ",
    lesson: "Un objet <code>{ model, tokens }</code> c'est la ligne qu'on envoie à l'API et qu'on stocke en base.",
    lore: "Avant de taxer l'athanor, Trust Studio grave la fiche : quel modèle, combien d'essence.",
    objective: "Fiche : model <code>\"gemini-3.6-flash\"</code>, tokens <code>150</code>.",
    initialCode: `// Payload LLM\nlet payload = {\n  model: "",\n  tokens: 0\n};\n\nreturn payload;`,
    solutionCode: `let payload = {\n  model: "gemini-3.6-flash",\n  tokens: 150\n};\n\nreturn payload;`,
    hint: "Met model: \"gemini-3.6-flash\", tokens: 150.",
    rewardXP: 16,
    check: (res) => typeof res === 'object' && res.model === "gemini-3.6-flash" && res.tokens === 150
  },
  {
    id: 16,
    phase: 5,
    title: "Le rite de revue",
    difficulty: "AVANCÉ",
    lesson: "<code>if</code> c'est la règle Trust Studio : sous le seuil de confiance, un humain relit.",
    lore: "La matière n'est qu'à 0.55. Sous 0.70, le rite exige un œil humain — pas de transmutation automatique.",
    objective: "Si <code>score < 0.70</code>, dis <code>\"HUMAN_REVIEW\"</code> — sinon <code>\"AUTO_APPROVED\"</code>.",
    initialCode: `let score = 0.55;\n\nfunction routerConfiance(s) {\n  // if (s < 0.70)\n  return "AUTO_APPROVED";\n}\n\nreturn routerConfiance(score);`,
    solutionCode: `let score = 0.55;\n\nfunction routerConfiance(s) {\n  if (s < 0.70) {\n    return "HUMAN_REVIEW";\n  }\n  return "AUTO_APPROVED";\n}\n\nreturn routerConfiance(score);`,
    hint: "Si s < 0.70 renvoie \"HUMAN_REVIEW\".",
    rewardXP: 16,
    check: (res) => res === "HUMAN_REVIEW"
  },
  {
    id: 17,
    phase: 5,
    title: "La multiplication des pépites",
    difficulty: "EXPERT",
    lesson: "<code>.map()</code> applique une règle à chaque appel — ici x2 sur les batches de tokens, la liste d'origine reste intacte.",
    lore: "Week-end : chaque pépite de tokens double dans l'athanor. Un seul passage de <code>.map()</code>, toute la coulée.",
    objective: "Double chaque batch, sans toucher à la liste d'origine.",
    initialCode: `let batches = [10, 20, 30];\n\n// Majoration week-end\nlet factures = [];\n\nreturn factures;`,
    solutionCode: `let batches = [10, 20, 30];\nlet factures = batches.map(b => b * 2);\n\nreturn factures;`,
    hint: "Écris batches.map(b => b * 2).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res[0] === 20 && res[1] === 40 && res[2] === 60
  },
  {
    id: 18,
    phase: 5,
    title: "Le filtrage des impuretés",
    difficulty: "EXPERT",
    lesson: "<code>.filter()</code> c'est le tri Energer : tu ne gardes que les scores de fraude qui passent le seuil.",
    lore: "Energer ne garde que les impuretés à 50 ou plus. Le reste retombe au fond du creuset.",
    objective: "Garde seulement les risques <code>≥ 50</code>.",
    initialCode: `let risques = [20, 80, 15, 95, 40, 60];\n\n// Alertes fraude Energer\nlet alertes = [];\n\nreturn alertes;`,
    solutionCode: `let risques = [20, 80, 15, 95, 40, 60];\nlet alertes = risques.filter(r => r >= 50);\n\nreturn alertes;`,
    hint: "Écris risques.filter(r => r >= 50).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.every(x => x >= 50)
  },
  {
    id: 19,
    phase: 5,
    title: "La distillation du mois",
    difficulty: "EXPERT",
    lesson: "<code>.reduce()</code> écrase les appels du mois en un seul chiffre — le total qu'on facture au workspace.",
    lore: "Trois coulées cette semaine. Distille-les en une seule essence — c'est ce que billing verse.",
    objective: "Fais le total des tokens dans <code>conso</code>.",
    initialCode: `let tokens = [10, 20, 30];\n\n// Facturation mensuelle\nlet conso = 0;\n\nreturn conso;`,
    solutionCode: `let tokens = [10, 20, 30];\nlet conso = tokens.reduce((a, b) => a + b, 0);\n\nreturn conso;`,
    hint: "Écris tokens.reduce((a, b) => a + b, 0).",
    rewardXP: 16,
    check: (res) => res === 60
  },
  {
    id: 20,
    phase: 6,
    title: "La fusion automatique",
    difficulty: "EXPERT",
    lesson: "<code>condition ? oui : non</code> c'est le routing Express : une ligne pour envoyer ou bloquer la réponse IA.",
    lore: "La matière vibre à 0.90. Dès 0.80, l'athanor fusionne tout seul — sinon on retient le Grand Œuvre.",
    objective: "Si <code>confiance >= 0.8</code>, c'est <code>\"APPLICABLE\"</code> — sinon <code>\"REJETÉ\"</code>.",
    initialCode: `let confiance = 0.9;\n\n// Décision API\nlet decision = "";\n\nreturn decision;`,
    solutionCode: `let confiance = 0.9;\nlet decision = confiance >= 0.8 ? "APPLICABLE" : "REJETÉ";\n\nreturn decision;`,
    hint: "Utilise confiance >= 0.8 ? \"APPLICABLE\" : \"REJETÉ\".",
    rewardXP: 16,
    check: (res) => res === "APPLICABLE"
  },
  {
    id: 21,
    phase: 6,
    title: "L'alliage des deux grimoires",
    difficulty: "EXPERT",
    lesson: "<code>...</code> verse une liste dans une autre : logs Energer + Trust Studio, une seule timeline.",
    lore: "Deux grimoires, un seul livre. Verse Energer et Trust Studio dans la même cornue d'audit.",
    objective: "Fusionne les deux journaux dans <code>audit</code>.",
    initialCode: `let logsEnerger = ["FRAUD_CHECK_OK"];\nlet logsTrust = ["TRACE_STORED", "METRICS_SENT"];\n\n// Timeline unique\nlet audit = [];\n\nreturn audit;`,
    solutionCode: `let logsEnerger = ["FRAUD_CHECK_OK"];\nlet logsTrust = ["TRACE_STORED", "METRICS_SENT"];\nlet audit = [...logsEnerger, ...logsTrust];\n\nreturn audit;`,
    hint: "Utilise [...logsEnerger, ...logsTrust].",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.includes("METRICS_SENT")
  },
  {
    id: 22,
    phase: 6,
    title: "Le Grand Œuvre Quantum of Trust",
    difficulty: "EXPERT",
    lesson: "Un objet de livrable porte plusieurs vérités : l'entreprise, le produit, la stack, un drapeau <code>true</code>.",
    lore: "L'heure du Grand Œuvre. Signe l'athanor : Quantum of Trust, Trust Studio, <code>pret: true</code>.",
    objective: "Signe : entreprise Quantum of Trust, produit Trust Intelligence Studio, <code>pret: true</code>.",
    initialCode: `// Workspace Pro\nconst workspace = {\n  entreprise: "",\n  produit: "",\n  pret: false\n};\n\nreturn workspace;`,
    solutionCode: `const workspace = {\n  entreprise: "Quantum of Trust",\n  produit: "Trust Intelligence Studio",\n  pret: true\n};\n\nreturn workspace;`,
    hint: "Met entreprise: \"Quantum of Trust\", produit: \"Trust Intelligence Studio\", pret: true.",
    rewardXP: 25,
    check: (res) => typeof res === 'object' && res.entreprise === "Quantum of Trust" && res.pret === true
  }
];

// REGISTRE DES QUÊTES DYNAMIQUES & COMPTES
const generatedQuests = new Map();
const USERS_FILE = (process.env.VERCEL || process.env.TMPDIR)
  ? path.join('/tmp', 'data_users.json')
  : path.join(__dirname, 'data_users.json');

function loadUsersData() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Erreur lecture USERS_FILE :", e.message);
  }
  return {};
}

function saveUsersData(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.warn("Erreur écriture USERS_FILE :", e.message);
  }
}

// Connexion / Création instantanée de compte & Multi-Appareils
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: "Nom d'alchimiste ou Code de Sync requis." });
  }

  const inputStr = username.trim();
  const users = loadUsersData();

  // Recherche directe par nom de compte ou par syncKey
  let foundUser = users[inputStr];

  if (!foundUser) {
    // Chercher par syncKey (insensible à la casse)
    const matchedKey = Object.keys(users).find(u => users[u].syncKey && users[u].syncKey.toLowerCase() === inputStr.toLowerCase());
    if (matchedKey) {
      foundUser = users[matchedKey];
    }
  }

  if (!foundUser) {
    const codePin = Math.floor(1000 + Math.random() * 9000).toString();
    foundUser = {
      username: inputStr,
      syncKey: `${inputStr}#${codePin}`,
      clearedQuests: [],
      gold: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users[inputStr] = foundUser;
    saveUsersData(users);
  } else if (!foundUser.syncKey) {
    const codePin = Math.floor(1000 + Math.random() * 9000).toString();
    foundUser.syncKey = `${foundUser.username}#${codePin}`;
    users[foundUser.username] = foundUser;
    saveUsersData(users);
  }

  res.json({
    success: true,
    user: foundUser
  });
});

// Sauvegarde de progression
app.post('/api/user/save-progress', (req, res) => {
  const { username, clearedQuests, gold } = req.body || {};
  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Utilisateur inconnu." });
  }

  const cleanName = username.trim();
  const users = loadUsersData();

  if (!users[cleanName]) {
    users[cleanName] = {
      username: cleanName,
      clearedQuests: [],
      gold: 0,
      createdAt: new Date().toISOString()
    };
  }

  if (Array.isArray(clearedQuests)) {
    users[cleanName].clearedQuests = clearedQuests;
  }
  if (typeof gold === 'number') {
    users[cleanName].gold = gold;
  }
  users[cleanName].updatedAt = new Date().toISOString();

  saveUsersData(users);

  res.json({
    success: true,
    user: users[cleanName]
  });
});

// Profil
app.get('/api/user/profile', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: "Nom d'utilisateur manquant." });
  }

  const users = loadUsersData();
  const user = users[username.trim()];

  if (!user) {
    return res.status(404).json({ error: "Alchimiste introuvable." });
  }

  res.json({
    success: true,
    user
  });
});

// Health check Render
app.get('/api/health', (req, res) => {
  const usersCount = Object.keys(loadUsersData()).length;
  res.json({
    status: "ok",
    service: "quantum-run-backend",
    geminiModel: GEMINI_MODEL,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GMI_API_KEY),
    usersCount,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Récupérer les phases et quêtes
app.get('/api/quests', (req, res) => {
  const sanitizedStatic = QUESTS.map(({ check, ...rest }) => rest);
  const sanitizedGenerated = Array.from(generatedQuests.values()).map(({ check, ...rest }) => rest);
  res.json({
    phases: PHASES,
    quests: [...sanitizedStatic, ...sanitizedGenerated]
  });
});

// Moteur de Saga Continue Gemini 3.6 Flash
const geminiCache = new Map();
let lastGeminiCallTime = 0;
const MIN_GEMINI_INTERVAL_MS = 2000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiForSaga({ previousQuest, phase, geminiKey }) {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || process.env.GMI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) return null;

  const cacheKey = `p${phase}_prev${previousQuest?.id || 0}`;
  if (geminiCache.has(cacheKey)) {
    return geminiCache.get(cacheKey);
  }

  const now = Date.now();
  const timeSinceLastCall = now - lastGeminiCallTime;
  if (timeSinceLastCall < MIN_GEMINI_INTERVAL_MS) {
    await sleep(MIN_GEMINI_INTERVAL_MS - timeSinceLastCall);
  }

  const prevTitle = previousQuest?.title || "aucune";
  const prompt = `Tu génères une micro-quête JavaScript TRÈS SIMPLE dans le SaaS IA pro Quantum of Trust, avec UNE TOUCHE d'alchimie (creuset, athanor, sceau, transmutation, fiole) — jamais de l'alchimie à la place du cas métier.
Produits : Energer (docs, factures, fraude), Trust Studio (confiance LLM, tokens, traces), La Bonne Réponse (assistant BTP, devis), Pipelines IA (modèles, prompts, API), Analytics (usage, risques), Launch (workspace Pro).
INTERDIT : e-commerce générique, panier, stock magasin, tickets Jira hors produit, syntaxe gratuite, alchimie sans produit.
INTERDIT : recopier la quête précédente (« ${prevTitle} »).
RÈGLE : initialCode est un TROU. Ne mets JAMAIS la solution dedans.
RÈGLE : "lesson" = UNE phrase concrète : concept JS + usage dans le SaaS (pas de métaphore à la place de l'explication).
RÈGLE : "lore" = 1-2 phrases produit + une image alchimique légère.
RÈGLE : variables parlantes (statut, tokens, confiance, file, modele, payload, sieges, credits).
"objective" en tutoiement, sans "Déclarez / Complétez / Calculez".

Réponds STRICTEMENT en JSON :
{
  "title": "Titre avec une touche (ex: La flamme des tokens)",
  "storyContinuity": "",
  "lesson": "Une phrase : concept + usage SaaS (ex: * double un plafond de tokens : limite * 2).",
  "lore": "Contexte produit + touche alchimique (ex: Le fourneau LLM est trop timide. Double la flamme du plan Pro.).",
  "objective": "Action courte (ex: Double le plafond de tokens dans nouvelleLimite.).",
  "initialCode": "let limiteTokens = 25;\\n\\n// Double le plafond\\nlet resultat = 0;\\n\\nreturn resultat;",
  "solutionCode": "let limiteTokens = 25;\\nlet resultat = limiteTokens * 2;\\nreturn resultat;",
  "hint": "Utilise limiteTokens * 2."
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    lastGeminiCallTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        geminiCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Erreur Gemini API :", err.message);
  }

  return null;
}

// Endpoint de Génération de la Quête Suivante
app.post('/api/quests/generate-saga', async (req, res) => {
  const { previousQuestId, phase, userGeminiKey } = req.body || {};
  const prevQuest = QUESTS.find(q => q.id === Number(previousQuestId)) || generatedQuests.get(Number(previousQuestId));
  const questId = QUESTS.length + generatedQuests.size + 1;
  const nextPhase = phase || (prevQuest ? Math.min(6, prevQuest.phase + (questId % 3 === 0 ? 1 : 0)) : 1);

  const geminiData = await callGeminiForSaga({
    previousQuest: prevQuest,
    phase: nextPhase,
    geminiKey: userGeminiKey
  });

  if (geminiData) {
    const newQuest = {
      id: questId,
      phase: nextPhase,
      title: geminiData.title || `Cas workspace #${questId}`,
      difficulty: "FORGÉE PAR GMI ✨",
      lesson: geminiData.lesson || "Dans un SaaS IA, tu changes une valeur métier, puis tu la rends avec return — même geste qu'un helper du workspace.",
      lore: geminiData.lore || "Un nouveau cas arrive sur le workspace Quantum of Trust.",
      objective: geminiData.objective,
      initialCode: geminiData.initialCode,
      solutionCode: geminiData.solutionCode,
      hint: geminiData.hint,
      rewardXP: 25,
      isGenerated: true,
      check: () => true
    };

    generatedQuests.set(newQuest.id, newQuest);
    const { check, ...sanitized } = newQuest;
    return res.json({
      success: true,
      quest: sanitized,
      source: `Google Gemini (${GEMINI_MODEL})`
    });
  }

  // Fallback Procédural autonome
  const proceduralQuest = {
    id: questId,
    phase: nextPhase,
    title: `La flamme des tokens #${questId}`,
    difficulty: "AUTOMATIQUE",
    lesson: "<code>*</code> sert à un plafond SaaS : <code>limiteTokens * 2</code> double le quota du workspace Pro.",
    lore: "Le fourneau LLM est trop timide. Le plan Pro double la flamme Gemini pour le rush de fin de mois.",
    objective: `Double le plafond de <code>25</code> tokens dans <code>resultat</code>.`,
    initialCode: `let limiteTokens = 25;\n\n// Nouveau plafond workspace\nlet resultat = 0;\n\nreturn resultat;`,
    solutionCode: `let limiteTokens = 25;\nlet resultat = limiteTokens * 2;\n\nreturn resultat;`,
    hint: "Fais limiteTokens * 2.",
    rewardXP: 20,
    isGenerated: true,
    check: () => true
  };

  generatedQuests.set(proceduralQuest.id, proceduralQuest);
  const { check, ...sanitized } = proceduralQuest;
  res.json({
    success: true,
    quest: sanitized,
    source: "Quantum of Trust (Saga Continue)"
  });
});

// Endpoint Copilote ORBIT IA (Gemini 3.6 Flash)
async function callGeminiForOrbitChat({ message, quest, geminiKey }) {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || process.env.GMI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const prompt = `Tu es ORBIT, Homunculus et copilote du SaaS IA Quantum of Trust (Energer, Trust Studio, La Bonne Réponse).
Tu parles comme un mentor produit, avec une touche d'alchimie (creuset, athanor, sceau) — jamais à la place du geste métier.
1 phrase de principe (concept JS + usage SaaS), puis l'action. Pas de "exercice / consigne / déclarez".
Quête actuelle #${quest?.id || 1} : "${quest?.title || 'Quête'}".
Micro-cours : "${quest?.lesson || ''}".
À faire : "${quest?.objective || 'Coder'}".
Indice : "${quest?.hint || 'Vérifie le code'}".

Question : "${message}"

Réponds en 2 phrases max, concret, utile. Si on demande de l'aide, commence par le principe.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) return rawText.trim();
    }
  } catch (err) {}
  return null;
}

app.post('/api/orbit/chat', async (req, res) => {
  const { message, questId, userGeminiKey } = req.body || {};
  const quest = QUESTS.find(q => q.id === Number(questId)) || generatedQuests.get(Number(questId)) || QUESTS[0];

  const aiReply = await callGeminiForOrbitChat({ message, quest, geminiKey: userGeminiKey });

  if (aiReply) {
    return res.json({
      reply: aiReply,
      source: `Google Gemini (${GEMINI_MODEL})`,
      timestamp: new Date().toISOString()
    });
  }

  const lower = (message || '').toLowerCase();
  let reply = `Conseil pour ${quest.title} : ${quest.hint}`;
  if (lower.includes('indice') || lower.includes('aide')) {
    reply = `💡 Conseil : ${quest.hint}`;
  }

  res.json({
    reply,
    source: "Athanor Core",
    timestamp: new Date().toISOString()
  });
});

// Transmutation & Validation Sandbox VM
app.post('/api/transmute', (req, res) => {
  const { questId, code } = req.body;
  const quest = QUESTS.find(q => q.id === Number(questId)) || generatedQuests.get(Number(questId));

  if (!quest) {
    return res.status(404).json({ success: false, error: "Quête introuvable." });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: "Le creuset est vide !" });
  }

  const capturedLogs = [];
  const customConsole = {
    log: (...args) => capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    error: (...args) => capturedLogs.push('ERROR: ' + args.join(' ')),
    warn: (...args) => capturedLogs.push('WARN: ' + args.join(' '))
  };

  const sandboxContext = {
    console: customConsole,
    Math,
    String,
    Number,
    Array,
    Object,
    Boolean,
    parseInt,
    parseFloat,
    Date
  };

  const context = vm.createContext(sandboxContext);

  try {
    const wrappedCode = `(function() {\n${code}\n})()`;
    const script = new vm.Script(wrappedCode);

    const startTime = performance.now();
    const result = script.runInContext(context, { timeout: 1000 });
    const durationMs = performance.now() - startTime;

    const isSuccess = quest.check ? quest.check(result, sandboxContext) : true;

    if (isSuccess) {
      res.json({
        success: true,
        result,
        logs: capturedLogs,
        executionTimeMs: Math.round(durationMs * 100) / 100,
        rewardXP: quest.rewardXP || 16,
        message: `✨ Transmutation validée ! (+${quest.rewardXP || 16} XP)`
      });
    } else {
      res.json({
        success: false,
        result,
        logs: capturedLogs,
        executionTimeMs: Math.round(durationMs * 100) / 100,
        error: `La transmutation n'a pas atteint la pureté attendue. Indice : ${quest.hint}`
      });
    }
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      logs: capturedLogs,
      executionTimeMs: 0,
      message: `❌ Erreur du fourneau serveur : ${err.message}`
    });
  }
});

// SPA Fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

// Lancement du serveur (Si exécuté directement, ex: Node/Render)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`⚗️  QUANTUM RUN — SERVEUR BACKEND ACTIF`);
    console.log(`🚀 Port d'écoute : http://localhost:${PORT}`);
    console.log(`🧠 Modèle IA : Google Gemini (${GEMINI_MODEL})`);
    console.log(`🔑 Clé API Gemini configurée : ${Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GMI_API_KEY) ? 'OUI' : 'NON'}`);
    console.log(`📡 Prêt pour déploiement sur Vercel & Render`);
    console.log(`==================================================\n`);
  });
}

module.exports = app;
