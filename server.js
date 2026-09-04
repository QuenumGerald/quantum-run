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
// PHASES ET QUÊTES QUANTUM OF TRUST (FULL STACK BUILDER IA & SAAS)
// ==========================================================================
const PHASES = [
  { id: 1, name: "Energer (Docs & Fraude)", symbol: "📄", subtitle: "Analyse de Factures & Détection d'Anomalies" },
  { id: 2, name: "Trust Studio (Supervision)", symbol: "🛡️", subtitle: "Metrics, Confiance & Traçabilité LLM" },
  { id: 3, name: "La Bonne Réponse (BTP)", symbol: "🏗️", subtitle: "Conformité de Devis & Assistant Métier" },
  { id: 4, name: "Pipelines & APIs IA", symbol: "🤖", subtitle: "Intégrations OpenAI/Claude/Gemini & Prompts" },
  { id: 5, name: "Full Stack Analytics", symbol: "📊", subtitle: "Traitement de Données, Aggregations & Arrays" },
  { id: 6, name: "Builder Suprême", symbol: "🚀", subtitle: "Architecture SaaS & Quantum of Trust" }
];

const QUESTS = [
  {
    id: 1,
    phase: 1,
    title: "Validation de Facture (Energer)",
    difficulty: "FACILE",
    lore: "Bienvenue chez Quantum of Trust ! La plateforme Energer analyse automatiquement les factures clients pour détecter les incohérences. Initialisez le statut du document vérifié.",
    objective: "Changez la valeur de la variable <code>status</code> pour <code>\"VERIFIED\"</code>.",
    initialCode: `// Validez le statut de la facture Energer\nlet status = "PENDING";\n\nreturn status;`,
    solutionCode: `let status = "VERIFIED";\n\nreturn status;`,
    hint: "Remplace \"PENDING\" par \"VERIFIED\".",
    rewardXP: 16,
    check: (res, ctx) => res === "VERIFIED" || ctx.status === "VERIFIED"
  },
  {
    id: 2,
    phase: 1,
    title: "Calcul du Montant TTC (+20% TVA)",
    difficulty: "FACILE",
    lore: "Energer vérifie les taxes sur les devis d'entreprises. Ajoutez 20% de TVA au montant HT de 100€.",
    objective: "Calculez le montant TTC (<code>100 * 1.20</code>) dans la variable <code>montantTTC</code>.",
    initialCode: `let montantHT = 100;\n\n// Calculez le montant TTC avec 20% de TVA\nlet montantTTC = 0;\n\nreturn montantTTC;`,
    solutionCode: `let montantHT = 100;\nlet montantTTC = montantHT * 1.20;\n\nreturn montantTTC;`,
    hint: "Multiplie montantHT * 1.20.",
    rewardXP: 16,
    check: (res, ctx) => res === 120 || ctx.montantTTC === 120
  },
  {
    id: 3,
    phase: 1,
    title: "Détection d'Anomalie Financière",
    difficulty: "FACILE",
    lore: "Une alerte Energer est déclenchée si la différence entre le devis et la facture dépasse le seuil toléré. Signalez l'anomalie.",
    objective: "Passez la variable <code>anomalieDetectee</code> à <code>true</code>.",
    initialCode: `// Activez le drapeau d'anomalie Energer\nlet anomalieDetectee = false;\n\nreturn anomalieDetectee;`,
    solutionCode: `let anomalieDetectee = true;\n\nreturn anomalieDetectee;`,
    hint: "Change false par true.",
    rewardXP: 16,
    check: (res, ctx) => res === true || ctx.anomalieDetectee === true
  },
  {
    id: 4,
    phase: 1,
    title: "Sceau de Référence Documentaire",
    difficulty: "FACILE",
    lore: "Formatez l'identifiant unique du justificatif client en assemblant le préfixe et l'année.",
    objective: "Concaténez <code>prefixe</code> (\"DOC-\") et <code>annee</code> (2024) dans <code>refDocument</code>.",
    initialCode: `let prefixe = "DOC-";\nlet annee = 2024;\n\n// Assemblez prefixe et annee\nlet refDocument = "";\n\nreturn refDocument;`,
    solutionCode: `let prefixe = "DOC-";\nlet annee = 2024;\nlet refDocument = prefixe + annee;\n\nreturn refDocument;`,
    hint: "Utilise prefixe + annee !",
    rewardXP: 16,
    check: (res, ctx) => res === "DOC-2024" || ctx.refDocument === "DOC-2024"
  },
  {
    id: 5,
    phase: 2,
    title: "Calcul du Score de Confiance (Trust Studio)",
    difficulty: "MOYEN",
    lore: "Trust Intelligence Studio permet aux entreprises de mesurer le niveau de confiance d'une réponse d'IA. Additionnez les deux scores partiels.",
    objective: "Additionnez <code>scorePertinence</code> (0.50) et <code>scoreSecurite</code> (0.45) dans <code>confidenceScore</code>.",
    initialCode: `let scorePertinence = 0.50;\nlet scoreSecurite = 0.45;\n\n// Additionnez les deux scores\nlet confidenceScore = 0;\n\nreturn confidenceScore;`,
    solutionCode: `let scorePertinence = 0.50;\nlet scoreSecurite = 0.45;\nlet confidenceScore = scorePertinence + scoreSecurite;\n\nreturn confidenceScore;`,
    hint: "Fais scorePertinence + scoreSecurite !",
    rewardXP: 16,
    check: (res, ctx) => res === 0.95 || ctx.confidenceScore === 0.95
  },
  {
    id: 6,
    phase: 2,
    title: "Supervision du Quota de Tokens LLM",
    difficulty: "MOYEN",
    lore: "Ajustez le plafond de consommation de tokens autorisé pour une requête vers l'API Gemini ou Claude en doublant la valeur actuelle.",
    objective: "Multipliez <code>limitTokens</code> (1000) par 2 dans <code>nouvelleLimite</code>.",
    initialCode: `let limitTokens = 1000;\n\n// Doubler la limite de tokens\nlet nouvelleLimite = 0;\n\nreturn nouvelleLimite;`,
    solutionCode: `let limitTokens = 1000;\nlet nouvelleLimite = limitTokens * 2;\n\nreturn nouvelleLimite;`,
    hint: "Multiplie limitTokens * 2 !",
    rewardXP: 16,
    check: (res, ctx) => res === 2000 || ctx.nouvelleLimite === 2000
  },
  {
    id: 7,
    phase: 2,
    title: "Load-Balancing de Clusters (Modulo)",
    difficulty: "MOYEN",
    lore: "Dans Trust Intelligence Studio, répartissez la charge des requêtes sur les 3 instances du proxy IA en calculant le reste de 10 / 3.",
    objective: "Calculez <code>10 % 3</code> dans la variable <code>serveurIndex</code>.",
    initialCode: `// Calculez le reste de 10 divisé par 3\nlet serveurIndex = 0;\n\nreturn serveurIndex;`,
    solutionCode: `let serveurIndex = 10 % 3;\n\nreturn serveurIndex;`,
    hint: "Écris 10 % 3 (le reste vaut 1).",
    rewardXP: 16,
    check: (res, ctx) => res === 1 || ctx.serveurIndex === 1
  },
  {
    id: 8,
    phase: 3,
    title: "Conformité de Devis BTP (La Bonne Réponse)",
    difficulty: "MOYEN",
    lore: "La Bonne Réponse vérifie automatiquement si un devis du bâtiment respecte les normes réglementaires.",
    objective: "Complétez la fonction <code>verifierConformite()</code> pour qu'elle retourne <code>\"CONFORME\"</code>.",
    initialCode: `function verifierConformite() {\n  // Retournez le statut conforme\n  return "";\n}\n\nreturn verifierConformite();`,
    solutionCode: `function verifierConformite() {\n  return "CONFORME";\n}\n\nreturn verifierConformite();`,
    hint: "Met return \"CONFORME\"; dans la fonction.",
    rewardXP: 16,
    check: (res) => res === "CONFORME"
  },
  {
    id: 9,
    phase: 3,
    title: "Calculateur de Surface de Chantier BTP",
    difficulty: "MOYEN",
    lore: "Développez une fonction pour aider les artisans BTP à calculer la surface totale à rénover.",
    objective: "Complétez la fonction <code>calculerSurface(l, L)</code> pour qu'elle retourne <code>l * L</code>.",
    initialCode: `function calculerSurface(l, L) {\n  // Retournez l * L\n  return 0;\n}\n\nreturn calculerSurface(10, 5);`,
    solutionCode: `function calculerSurface(l, L) {\n  return l * L;\n}\n\nreturn calculerSurface(10, 5);`,
    hint: "Fais return l * L; dans la fonction.",
    rewardXP: 16,
    check: (res, ctx) => res === 50 || (typeof ctx.calculerSurface === 'function' && ctx.calculerSurface(4, 5) === 20)
  },
  {
    id: 10,
    phase: 3,
    title: "Formatage du Rapport IA BTP",
    difficulty: "MOYEN",
    lore: "Associez le nom du modèle d'IA et la référence du devis analysé pour le rapport client.",
    objective: "Complétez la fonction <code>formerRapport(modele, devis)</code> pour retourner <code>modele + \" -> \" + devis</code>.",
    initialCode: `function formerRapport(modele, devis) {\n  // Associez modele et devis séparés par " -> "\n  return "";\n}\n\nreturn formerRapport("Claude-3.5", "Devis #884");`,
    solutionCode: `function formerRapport(modele, devis) {\n  return modele + " -> " + devis;\n}\n\nreturn formerRapport("Claude-3.5", "Devis #884");`,
    hint: "Retourne modele + \" -> \" + devis.",
    rewardXP: 16,
    check: (res) => res === "Claude-3.5 -> Devis #884"
  },
  {
    id: 11,
    phase: 4,
    title: "Enregistrement de Modèle IA (.push)",
    difficulty: "AVANCÉ",
    lore: "Ajoutez le modèle <code>\"claude-3-5-sonnet\"</code> au registre des LLM supervisés par Trust Studio.",
    objective: "Ajoutez <code>\"claude-3-5-sonnet\"</code> au tableau <code>modeles</code> avec <code>.push()</code>.",
    initialCode: `let modeles = ["gpt-4o", "gemini-3.6-flash"];\n\n// Ajoutez "claude-3-5-sonnet" au tableau\n\nreturn modeles;`,
    solutionCode: `let modeles = ["gpt-4o", "gemini-3.6-flash"];\nmodeles.push("claude-3-5-sonnet");\n\nreturn modeles;`,
    hint: "Écris modeles.push(\"claude-3-5-sonnet\");",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.includes("claude-3-5-sonnet") && res.length === 3
  },
  {
    id: 12,
    phase: 4,
    title: "Dénombrement de la File Energer (.length)",
    difficulty: "AVANCÉ",
    lore: "Mesurez le nombre exact de documents en attente dans la file d'analyse Energer avec la propriété <code>.length</code>.",
    objective: "Stockez la longueur du tableau <code>queue</code> dans la variable <code>nombreDocs</code>.",
    initialCode: `let queue = ["Devis_01.pdf", "Facture_88.pdf", "Justificatif_03.pdf", "Attestation.pdf"];\n\n// Comptez le nombre de documents\nlet nombreDocs = 0;\n\nreturn nombreDocs;`,
    solutionCode: `let queue = ["Devis_01.pdf", "Facture_88.pdf", "Justificatif_03.pdf", "Attestation.pdf"];\nlet nombreDocs = queue.length;\n\nreturn nombreDocs;`,
    hint: "Utilise queue.length.",
    rewardXP: 16,
    check: (res) => res === 4
  },
  {
    id: 13,
    phase: 4,
    title: "Extraction du Premier Document Urgent",
    difficulty: "AVANCÉ",
    lore: "Extrayez le tout premier justificatif de la file de traitement Energer à l'index <code>0</code>.",
    objective: "Stockez le premier élément de <code>queue</code> dans la variable <code>prioritaire</code>.",
    initialCode: `let queue = ["Facture_Urgente.pdf", "Devis_Standard.pdf"];\n\n// Récupérez l'élément à l'index 0\nlet prioritaire = "";\n\nreturn prioritaire;`,
    solutionCode: `let queue = ["Facture_Urgente.pdf", "Devis_Standard.pdf"];\nlet prioritaire = queue[0];\n\nreturn prioritaire;`,
    hint: "Écris queue[0].",
    rewardXP: 16,
    check: (res) => res === "Facture_Urgente.pdf"
  },
  {
    id: 14,
    phase: 4,
    title: "Dernier Log d'Audit de Sécurité",
    difficulty: "AVANCÉ",
    lore: "Extrayez le dernier événement de traçabilité d'une réponse IA à l'index <code>2</code>.",
    objective: "Stockez le dernier log dans la variable <code>dernierLog</code>.",
    initialCode: `let logs = ["PROMPT_SENT", "RESPONSE_RECEIVED", "CONFIDENCE_CHECKED"];\n\n// Récupérez l'élément à l'index 2\nlet dernierLog = "";\n\nreturn dernierLog;`,
    solutionCode: `let logs = ["PROMPT_SENT", "RESPONSE_RECEIVED", "CONFIDENCE_CHECKED"];\nlet dernierLog = logs[2];\n\nreturn dernierLog;`,
    hint: "Écris logs[2].",
    rewardXP: 16,
    check: (res) => res === "CONFIDENCE_CHECKED"
  },
  {
    id: 15,
    phase: 4,
    title: "Structure du Payload LLM (Objet)",
    difficulty: "AVANCÉ",
    lore: "Définissez un objet de métriques de requête IA pour l’enregistrement en base PostgreSQL.",
    objective: "Créez l'objet <code>payload</code> avec <code>model: \"gemini-3.6-flash\"</code> et <code>tokens: 150</code>.",
    initialCode: `// Complétez l'objet payload\nlet payload = {\n  model: "",\n  tokens: 0\n};\n\nreturn payload;`,
    solutionCode: `let payload = {\n  model: "gemini-3.6-flash",\n  tokens: 150\n};\n\nreturn payload;`,
    hint: "Met model: \"gemini-3.6-flash\", tokens: 150.",
    rewardXP: 16,
    check: (res) => typeof res === 'object' && res.model === "gemini-3.6-flash" && res.tokens === 150
  },
  {
    id: 16,
    phase: 5,
    title: "Filtre de Sécurité IF (Confiance Seuil)",
    difficulty: "AVANCÉ",
    lore: "Dans Trust Studio, si le score de confiance est inférieur à 0.70, le système déclenche une alerte de révision humaine.",
    objective: "Si <code>score < 0.70</code>, retournez <code>\"HUMAN_REVIEW\"</code>, sinon <code>\"AUTO_APPROVED\"</code>.",
    initialCode: `let score = 0.55;\n\nfunction analyser(s) {\n  // Écrivez le if (s < 0.70)\n  return "AUTO_APPROVED";\n}\n\nreturn analyser(score);`,
    solutionCode: `let score = 0.55;\n\nfunction analyser(s) {\n  if (s < 0.70) {\n    return "HUMAN_REVIEW";\n  }\n  return "AUTO_APPROVED";\n}\n\nreturn analyser(score);`,
    hint: "Si s < 0.70 renvoie \"HUMAN_REVIEW\".",
    rewardXP: 16,
    check: (res) => res === "HUMAN_REVIEW"
  },
  {
    id: 17,
    phase: 5,
    title: "Normalisation des Devis BTP (.map)",
    difficulty: "EXPERT",
    lore: "La méthode <code>.map()</code> permet d'appliquer les frais de gestion (+10%) à chaque sous-total de devis.",
    objective: "Multipliez chaque montant <code>[100, 200, 300]</code> par 1.10 pour obtenir <code>[110, 220, 330]</code>.",
    initialCode: `let montants = [100, 200, 300];\n\n// Appliquez 1.10 à chaque élément avec .map(m => m * 1.10)\nlet ajustés = [];\n\nreturn ajustés;`,
    solutionCode: `let montants = [100, 200, 300];\nlet ajustés = montants.map(m => m * 1.10);\n\nreturn ajustés;`,
    hint: "Écris montants.map(m => m * 1.10).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && Math.round(res[0]) === 110 && Math.round(res[1]) === 220 && Math.round(res[2]) === 330
  },
  {
    id: 18,
    phase: 5,
    title: "Filtrage des Risques de Fraude (.filter)",
    difficulty: "EXPERT",
    lore: "Dans Energer, la méthode <code>.filter()</code> n'isole que les scores de risque élevés (<code>>= 80</code>).",
    objective: "Ne gardez que les risques de fraude supérieurs ou égaux à 80.",
    initialCode: `let risques = [20, 85, 40, 92, 15, 80];\n\n// Filtrez pour garder >= 80\nlet alertes = [];\n\nreturn alertes;`,
    solutionCode: `let risques = [20, 85, 40, 92, 15, 80];\nlet alertes = risques.filter(r => r >= 80);\n\nreturn alertes;`,
    hint: "Écris risques.filter(r => r >= 80).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.includes(85) && res.includes(92) && res.includes(80)
  },
  {
    id: 19,
    phase: 5,
    title: "Total des Tokens Consommés (.reduce)",
    difficulty: "EXPERT",
    lore: "Calculez la consommation totale de tokens sur l'ensemble des requêtes LLM du mois pour la facturation SaaS.",
    objective: "Calculez la somme du tableau <code>tokens</code> avec <code>.reduce((a, b) => a + b, 0)</code>.",
    initialCode: `let tokens = [500, 1200, 800];\n\n// Additionnez les tokens avec .reduce\nlet totalTokens = 0;\n\nreturn totalTokens;`,
    solutionCode: `let tokens = [500, 1200, 800];\nlet totalTokens = tokens.reduce((a, b) => a + b, 0);\n\nreturn totalTokens;`,
    hint: "Écris tokens.reduce((a, b) => a + b, 0).",
    rewardXP: 16,
    check: (res) => res === 2500
  },
  {
    id: 20,
    phase: 6,
    title: "Décision de Routing Express (Ternaire)",
    difficulty: "EXPERT",
    lore: "Si le score de confiance est supérieur ou égal à 0.8, validez automatiquement l'analyse d'IA dans l'API Express/NestJS.",
    objective: "Retournez <code>\"APPLICABLE\"</code> si <code>confiance >= 0.8</code>, sinon <code>\"REJETÉ\"</code>.",
    initialCode: `let confiance = 0.9;\n\n// Écrivez l'expression ternaire (confiance >= 0.8 ? "APPLICABLE" : "REJETÉ")\nlet decision = "";\n\nreturn decision;`,
    solutionCode: `let confiance = 0.9;\nlet decision = confiance >= 0.8 ? "APPLICABLE" : "REJETÉ";\n\nreturn decision;`,
    hint: "Utilise confiance >= 0.8 ? \"APPLICABLE\" : \"REJETÉ\".",
    rewardXP: 16,
    check: (res) => res === "APPLICABLE"
  },
  {
    id: 21,
    phase: 6,
    title: "Agrégation des Logs SaaS (Spread Operator)",
    difficulty: "EXPERT",
    lore: "Rassemblez les journaux d'événements Energer et Trust Studio dans une vue d'ensemble unifiée avec l'opérateur spread <code>...</code>.",
    objective: "Fusionnez les deux tableaux avec <code>[...logsEnerger, ...logsTrust]</code>.",
    initialCode: `let logsEnerger = ["FRAUD_CHECK_OK"];\nlet logsTrust = ["TRACE_STORED", "METRICS_SENT"];\n\n// Fusionnez les deux tableaux avec ...\nlet logsSysteme = [];\n\nreturn logsSysteme;`,
    solutionCode: `let logsEnerger = ["FRAUD_CHECK_OK"];\nlet logsTrust = ["TRACE_STORED", "METRICS_SENT"];\nlet logsSysteme = [...logsEnerger, ...logsTrust];\n\nreturn logsSysteme;`,
    hint: "Utilise [...logsEnerger, ...logsTrust].",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res[0] === "FRAUD_CHECK_OK"
  },
  {
    id: 22,
    phase: 6,
    title: "Le Système Global Quantum of Trust (Opus Magnum)",
    difficulty: "EXPERT",
    lore: "Félicitations Builder ! Vous maîtrisez les composants fondamentaux des solutions SaaS d'IA de Quantum of Trust (Energer, Trust Intelligence Studio, La Bonne Réponse).",
    objective: "Complétez l'objet <code>{ entreprise: \"Quantum of Trust\", produit: \"Trust Intelligence Studio\", stack: \"TypeScript & Node.js\", recrute: true }</code>.",
    initialCode: `// Complétez le Système Suprême Quantum of Trust\nconst QuantumSystem = {\n  entreprise: "",\n  produit: "",\n  stack: "",\n  recrute: false\n};\n\nreturn QuantumSystem;`,
    solutionCode: `const QuantumSystem = {\n  entreprise: "Quantum of Trust",\n  produit: "Trust Intelligence Studio",\n  stack: "TypeScript & Node.js",\n  recrute: true\n};\n\nreturn QuantumSystem;`,
    hint: "Met entreprise: \"Quantum of Trust\", produit: \"Trust Intelligence Studio\", stack: \"TypeScript & Node.js\", recrute: true.",
    rewardXP: 25,
    check: (res) => typeof res === 'object' && res.entreprise === "Quantum of Trust" && res.recrute === true
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

  const prompt = `Génère un exercice JavaScript/TypeScript immersif pour un Développeur Full Stack Builder chez Quantum of Trust (startup SaaS IA à Marseille).
Les thèmes des produits sont : 
- Energer : Analyse intelligente de factures/devis et détection d'anomalies ou fraudes documentaires.
- Trust Intelligence Studio : Supervision de modèles d'IA, mesure de score de confiance (confidenceScore), traçabilité des réponses et metrics tokens.
- La Bonne Réponse : Assistant SaaS BTP, vérification de conformité réglementaire de devis du bâtiment.

RÈGLE OBLIGATOIRE : initialCode DOIT ÊTRE UN EXERCICE À TROUS À COMPLÉTER PAR LE JOUEUR. Ne mets JAMAIS la solution dans initialCode !

Réponds STRICTEMENT en JSON :
{
  "title": "Titre professionnel (ex: Contrôle de Fraude Devis Energer)",
  "storyContinuity": "",
  "lore": "Un court récit de mise en situation concrète chez Quantum of Trust (1-2 phrases).",
  "objective": "Consigne d'exercice précise (ex: Calculez le score de risque avec la TVA).",
  "initialCode": "let HT = 200;\\n\\n// Calculez le TTC avec 20% de TVA\\nlet TTC = 0;\\n\\nreturn TTC;",
  "solutionCode": "let HT = 200;\\nlet TTC = HT * 1.20;\\nreturn TTC;",
  "hint": "Utilise HT * 1.20."
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
      title: geminiData.title || `Chapitre #${questId} : Quantum of Trust Analytics`,
      difficulty: "FORGÉE PAR GMI ✨",
      lore: geminiData.lore || "Une nouvelle fonctionnalité SaaS IA à concevoir chez Quantum of Trust.",
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
    title: `SaaS Feature #${questId}`,
    difficulty: "AUTOMATIQUE",
    lore: "Superviser les métriques de confiance du modèle dans Trust Intelligence Studio.",
    objective: `Multipliez la métrique de confiance <code>0.45</code> par 2.`,
    initialCode: `let score = 0.45;\n\n// Doublez le score de confiance\nlet resultat = 0;\n\nreturn resultat;`,
    solutionCode: `let score = 0.45;\nlet resultat = score * 2;\n\nreturn resultat;`,
    hint: "Fais score * 2 !",
    rewardXP: 20,
    isGenerated: true,
    check: () => true
  };

  generatedQuests.set(proceduralQuest.id, proceduralQuest);
  const { check, ...sanitized } = proceduralQuest;
  res.json({
    success: true,
    quest: sanitized,
    source: "Athanor Alchimique (Saga Continue)"
  });
});

// Endpoint Copilote ORBIT IA (Gemini 3.6 Flash)
async function callGeminiForOrbitChat({ message, quest, geminiKey }) {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || process.env.GMI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const prompt = `Tu es ORBIT, le Tech Lead Copilote chez Quantum of Trust (startup SaaS IA à Marseille). Tu accompagnes le nouveau Développeur Full Stack sur les produits Energer, Trust Intelligence Studio et La Bonne Réponse.
Quête actuelle #${quest?.id || 1} : "${quest?.title || 'Quête'}".
Objectif : "${quest?.objective || 'Transmuter'}".
Indice : "${quest?.hint || 'Vérifie le code'}".

Question du développeur : "${message}"

Réponds de manière très concise (2 phrases max), encourageante, et directement liée aux enjeux de Quantum of Trust (TypeScript, Node.js, React, IA).`;

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
