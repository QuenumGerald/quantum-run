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
// PHASES ET QUÊTES ALCHIMIQUES (UTF-8 PROPRE & INTERACTIF)
// ==========================================================================
const PHASES = [
  { id: 1, name: "Calcination", symbol: "🜍", subtitle: "Types primitifs & Réactifs de base" },
  { id: 2, name: "Distillation", symbol: "🜔", subtitle: "Calculs & Pesées de l'Athanor" },
  { id: 3, name: "Formules", symbol: "🜛", subtitle: "Incantations & Fonctions magiques" },
  { id: 4, name: "Fioles", symbol: "🜁", subtitle: "Tableaux, Agrégats & Gemmes" },
  { id: 5, name: "Rituels", symbol: "🜃", subtitle: "Filtres, Transformations & Logique" },
  { id: 6, name: "Grand Œuvre", symbol: "🝤", subtitle: "La Pierre Philosophale Suprême" }
];

const QUESTS = [
  {
    id: 1,
    phase: 1,
    title: "La Transmutation du Plomb",
    difficulty: "FACILE",
    lore: "Le vil métal repose au fond du creuset. Pour initier le Grand Œuvre, changez la matière vile <code>\"lead\"</code> en métal précieux <code>\"gold\"</code>.",
    objective: "Changez la valeur de la variable <code>metal</code> pour <code>\"gold\"</code>.",
    initialCode: `// Transmutez le plomb en or\nlet metal = "lead";\n\nreturn metal;`,
    solutionCode: `let metal = "gold";\n\nreturn metal;`,
    hint: "Remplace simplement \"lead\" par \"gold\".",
    rewardXP: 16,
    check: (res, ctx) => res === "gold" || ctx.metal === "gold"
  },
  {
    id: 2,
    phase: 1,
    title: "L'Âge de l'Initié",
    difficulty: "FACILE",
    lore: "Tout alchimiste doit déclarer ses années d'apprentissage pour calibrer le fourneau de l'Athanor.",
    objective: "Déclarez la variable <code>age</code> égale au nombre <code>20</code>.",
    initialCode: `// Calibrez l'âge à 20\nlet age = 0;\n\nreturn age;`,
    solutionCode: `let age = 20;\n\nreturn age;`,
    hint: "Remplace 0 par 20 dans let age = 20;",
    rewardXP: 16,
    check: (res, ctx) => res === 20 || ctx.age === 20
  },
  {
    id: 3,
    phase: 1,
    title: "L'Élixir d'Immortalité",
    difficulty: "FACILE",
    lore: "La fiole rouge confère l'immortalité. Activez le sceau de vérité booléenne en passant la variable à vrai.",
    objective: "Mettez la variable <code>isImmortal</code> à <code>true</code>.",
    initialCode: `// Activez le sceau d'immortalité\nlet isImmortal = false;\n\nreturn isImmortal;`,
    solutionCode: `let isImmortal = true;\n\nreturn isImmortal;`,
    hint: "Changez false par true.",
    rewardXP: 16,
    check: (res, ctx) => res === true || ctx.isImmortal === true
  },
  {
    id: 4,
    phase: 1,
    title: "La Potion Aqua Vitae",
    difficulty: "FACILE",
    lore: "Fusionnez les deux vapeurs sacrées <code>\"Aqua\"</code> et <code>\"Vitae\"</code> séparées par un espace.",
    objective: "Concaténez les variables pour obtenir <code>\"Aqua Vitae\"</code>.",
    initialCode: `let mot1 = "Aqua";\nlet mot2 = "Vitae";\n\n// Assemblez mot1 et mot2 avec un espace\nlet potion = "";\n\nreturn potion;`,
    solutionCode: `let mot1 = "Aqua";\nlet mot2 = "Vitae";\nlet potion = mot1 + " " + mot2;\n\nreturn potion;`,
    hint: "Utilise mot1 + \" \" + mot2 !",
    rewardXP: 16,
    check: (res, ctx) => res === "Aqua Vitae" || ctx.potion === "Aqua Vitae"
  },
  {
    id: 5,
    phase: 2,
    title: "La Pesée du Soufre et du Sel",
    difficulty: "MOYEN",
    lore: "Pour stabiliser la réaction, additionnez les 10g de soufre et les 5g de sel dans le réceptacle.",
    objective: "Additionnez <code>soufre</code> (10) et <code>sel</code> (5) dans <code>masseTotale</code>.",
    initialCode: `let soufre = 10;\nlet sel = 5;\n\n// Faites la somme des deux réactifs\nlet masseTotale = 0;\n\nreturn masseTotale;`,
    solutionCode: `let soufre = 10;\nlet sel = 5;\nlet masseTotale = soufre + sel;\n\nreturn masseTotale;`,
    hint: "Additionne soufre + sel !",
    rewardXP: 16,
    check: (res, ctx) => res === 15 || ctx.masseTotale === 15
  },
  {
    id: 6,
    phase: 2,
    title: "L'Ébullition Doublée",
    difficulty: "MOYEN",
    lore: "Le fourneau est à 50°C. Doublez la température actuelle pour atteindre le point d'ébullition rituel.",
    objective: "Multipliez <code>temperature</code> par 2 dans <code>temperatureFinale</code>.",
    initialCode: `let temperature = 50;\n\n// Doublez la température (50 * 2)\nlet temperatureFinale = 0;\n\nreturn temperatureFinale;`,
    solutionCode: `let temperature = 50;\nlet temperatureFinale = temperature * 2;\n\nreturn temperatureFinale;`,
    hint: "Utilise temperature * 2 !",
    rewardXP: 16,
    check: (res, ctx) => res === 100 || ctx.temperatureFinale === 100
  },
  {
    id: 7,
    phase: 2,
    title: "Le Reste Sacré (Modulo)",
    difficulty: "MOYEN",
    lore: "L'opérateur modulo <code>%</code> extrait le reste d'une division rituelle. Obtenez le reste de 10 divisé par 3.",
    objective: "Calculez <code>10 % 3</code> dans la variable <code>reste</code>.",
    initialCode: `// Obtenez le reste de 10 divisé par 3\nlet reste = 0;\n\nreturn reste;`,
    solutionCode: `let reste = 10 % 3;\n\nreturn reste;`,
    hint: "Écris 10 % 3 (le reste vaut 1).",
    rewardXP: 16,
    check: (res, ctx) => res === 1 || ctx.reste === 1
  },
  {
    id: 8,
    phase: 3,
    title: "L'Incantation d'Éveil",
    difficulty: "MOYEN",
    lore: "Les adeptes réveillent le laboratoire en prononçant le cri magique <code>\"Eureka!\"</code>.",
    objective: "Complétez la fonction <code>reveiller()</code> pour qu'elle retourne <code>\"Eureka!\"</code>.",
    initialCode: `function reveiller() {\n  // Écrivez le retour du cri rituel\n  return "";\n}\n\nreturn reveiller();`,
    solutionCode: `function reveiller() {\n  return "Eureka!";\n}\n\nreturn reveiller();`,
    hint: "Met return \"Eureka!\"; dans la fonction.",
    rewardXP: 16,
    check: (res) => res === "Eureka!"
  },
  {
    id: 9,
    phase: 3,
    title: "Le Sortilège d'Amplification",
    difficulty: "MOYEN",
    lore: "Forgez un sortilège universel capable de doubler n'importe quelle dose de poudre d'étoile.",
    objective: "Complétez la fonction <code>doubler(x)</code> pour qu'elle retourne <code>x * 2</code>.",
    initialCode: `function doubler(x) {\n  // Retournez le double de x\n  return 0;\n}\n\nreturn doubler(21);`,
    solutionCode: `function doubler(x) {\n  return x * 2;\n}\n\nreturn doubler(21);`,
    hint: "Fais return x * 2; dans la fonction.",
    rewardXP: 16,
    check: (res, ctx) => res === 42 || (typeof ctx.doubler === 'function' && ctx.doubler(10) === 20)
  },
  {
    id: 10,
    phase: 3,
    title: "L'Alliance des Deux Éléments",
    difficulty: "MOYEN",
    lore: "Associez le nom de deux éléments alchimiques avec un symbole d'union <code>\" + \"</code>.",
    objective: "Complétez la fonction <code>allier(a, b)</code> pour qu'elle retourne <code>a + \" + \" + b</code>.",
    initialCode: `function allier(a, b) {\n  // Associez a et b séparés par " + "\n  return "";\n}\n\nreturn allier("Or", "Argent");`,
    solutionCode: `function allier(a, b) {\n  return a + " + " + b;\n}\n\nreturn allier("Or", "Argent");`,
    hint: "Retourne a + \" + \" + b.",
    rewardXP: 16,
    check: (res) => res === "Or + Argent"
  },
  {
    id: 11,
    phase: 4,
    title: "La Fiole d'Ingrédients (.push)",
    difficulty: "AVANCÉ",
    lore: "Un précieux grain de <code>\"Rubis\"</code> doit être ajouté à la fiole d'ingrédients existants.",
    objective: "Ajoutez <code>\"Rubis\"</code> à la fiole avec <code>fiole.push(\"Rubis\")</code>.",
    initialCode: `let fiole = ["Quartz", "Saphir"];\n\n// Ajoutez "Rubis" à la fiole\n\nreturn fiole;`,
    solutionCode: `let fiole = ["Quartz", "Saphir"];\nfiole.push("Rubis");\n\nreturn fiole;`,
    hint: "Écris fiole.push(\"Rubis\");",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.includes("Rubis") && res.length === 3
  },
  {
    id: 12,
    phase: 4,
    title: "Le Dénombrement des Réactifs (.length)",
    difficulty: "AVANCÉ",
    lore: "Mesurez le nombre exact d'ingrédients présents dans l'athanor à l'aide de la propriété <code>.length</code>.",
    objective: "Stockez la longueur du tableau <code>reactifs</code> dans la variable <code>compte</code>.",
    initialCode: `let reactifs = ["Mercure", "Soufre", "Sel", "Or"];\n\n// Comptez le nombre de réactifs\nlet compte = 0;\n\nreturn compte;`,
    solutionCode: `let reactifs = ["Mercure", "Soufre", "Sel", "Or"];\nlet compte = reactifs.length;\n\nreturn compte;`,
    hint: "Utilise reactifs.length.",
    rewardXP: 16,
    check: (res) => res === 4
  },
  {
    id: 13,
    phase: 4,
    title: "L'Extraction du Premier Métal",
    difficulty: "AVANCÉ",
    lore: "Extrayez le tout premier élément du coffre alchimique à l'index <code>0</code>.",
    objective: "Stockez le premier élément de <code>coffre</code> dans la variable <code>premier</code>.",
    initialCode: `let coffre = ["Or", "Argent", "Cuivre"];\n\n// Récupérez l'élément à l'index 0\nlet premier = "";\n\nreturn premier;`,
    solutionCode: `let coffre = ["Or", "Argent", "Cuivre"];\nlet premier = coffre[0];\n\nreturn premier;`,
    hint: "Écris coffre[0].",
    rewardXP: 16,
    check: (res) => res === "Or"
  },
  {
    id: 14,
    phase: 4,
    title: "Le Sceau du Dernier Élément",
    difficulty: "AVANCÉ",
    lore: "Extrayez le dernier élément de la collection <code>[\"Feu\", \"Eau\", \"Air\"]</code> à l'index <code>2</code>.",
    objective: "Stockez le dernier élément dans la variable <code>dernier</code>.",
    initialCode: `let elements = ["Feu", "Eau", "Air"];\n\n// Récupérez l'élément à l'index 2\nlet dernier = "";\n\nreturn dernier;`,
    solutionCode: `let elements = ["Feu", "Eau", "Air"];\nlet dernier = elements[2];\n\nreturn dernier;`,
    hint: "Écris elements[2].",
    rewardXP: 16,
    check: (res) => res === "Air"
  },
  {
    id: 15,
    phase: 4,
    title: "Le Répertoire Alchimique (Objet)",
    difficulty: "AVANCÉ",
    lore: "Définissez un objet d'artefact avec son nom et sa valeur en carats.",
    objective: "Créez l'objet <code>artefact</code> avec <code>nom: \"Émeraude\"</code> et <code>valeur: 100</code>.",
    initialCode: `// Complétez l'objet artefact\nlet artefact = {\n  nom: "",\n  valeur: 0\n};\n\nreturn artefact;`,
    solutionCode: `let artefact = {\n  nom: "Émeraude",\n  valeur: 100\n};\n\nreturn artefact;`,
    hint: "Met nom: \"Émeraude\", valeur: 100.",
    rewardXP: 16,
    check: (res) => typeof res === 'object' && res.nom === "Émeraude" && res.valeur === 100
  },
  {
    id: 16,
    phase: 5,
    title: "Le Rituel de Vérification (Condition IF)",
    difficulty: "AVANCÉ",
    lore: "Si la pureté est égale à 100, la réaction est parfaite.",
    objective: "Si <code>purete === 100</code>, retournez <code>\"Succès\"</code>, sinon <code>\"Échec\"</code>.",
    initialCode: `let purete = 100;\n\nfunction tester(valeur) {\n  // Écrivez le if (valeur === 100)\n  return "Échec";\n}\n\nreturn tester(purete);`,
    solutionCode: `let purete = 100;\n\nfunction tester(valeur) {\n  if (valeur === 100) {\n    return "Succès";\n  }\n  return "Échec";\n}\n\nreturn tester(purete);`,
    hint: "Si valeur === 100 renvoie \"Succès\".",
    rewardXP: 16,
    check: (res) => res === "Succès"
  },
  {
    id: 17,
    phase: 5,
    title: "La Multiplication des Pépites (.map)",
    difficulty: "EXPERT",
    lore: "La méthode <code>.map()</code> transforme chaque élément d'un tableau.",
    objective: "Doublez la valeur de chaque pépite <code>[10, 20, 30]</code> pour obtenir <code>[20, 40, 60]</code>.",
    initialCode: `let pepites = [10, 20, 30];\n\n// Doublez chaque pépite avec .map(p => p * 2)\nlet enrichies = [];\n\nreturn enrichies;`,
    solutionCode: `let pepites = [10, 20, 30];\nlet enrichies = pepites.map(p => p * 2);\n\nreturn enrichies;`,
    hint: "Écris pepites.map(p => p * 2).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res[0] === 20 && res[1] === 40 && res[2] === 60
  },
  {
    id: 18,
    phase: 5,
    title: "Le Filtrage des Impuretés (.filter)",
    difficulty: "EXPERT",
    lore: "La méthode <code>.filter()</code> ne conserve que les éléments respectant une condition.",
    objective: "Ne gardez que les métaux dont la pureté est supérieure ou égale à 50 (<code>p >= 50</code>).",
    initialCode: `let puretes = [20, 80, 15, 95, 40, 60];\n\n// Filtrez pour garder >= 50\nlet nobles = [];\n\nreturn nobles;`,
    solutionCode: `let puretes = [20, 80, 15, 95, 40, 60];\nlet nobles = puretes.filter(p => p >= 50);\n\nreturn nobles;`,
    hint: "Écris puretes.filter(p => p >= 50).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.every(x => x >= 50)
  },
  {
    id: 19,
    phase: 5,
    title: "La Somme des Réactifs (.reduce)",
    difficulty: "EXPERT",
    lore: "Additionnez toute la masse des métaux purs <code>[10, 20, 30]</code> pour obtenir la masse totale <code>60</code>.",
    objective: "Calculez la somme du tableau avec <code>.reduce((a, b) => a + b, 0)</code>.",
    initialCode: `let masses = [10, 20, 30];\n\n// Additionnez les masses\nlet somme = 0;\n\nreturn somme;`,
    solutionCode: `let masses = [10, 20, 30];\nlet somme = masses.reduce((a, b) => a + b, 0);\n\nreturn somme;`,
    hint: "Écris masses.reduce((a, b) => a + b, 0).",
    rewardXP: 16,
    check: (res) => res === 60
  },
  {
    id: 20,
    phase: 6,
    title: "La Fusion Thermique (Ternaire)",
    difficulty: "EXPERT",
    lore: "Si la température est supérieure ou égale à 500, la fusion s'enclenche.",
    objective: "Retournez <code>\"Fusion!\"</code> si <code>degres >= 500</code>, sinon <code>\"En attente\"</code>.",
    initialCode: `let degres = 600;\n\n// Écrivez l'expression ternaire (degres >= 500 ? "Fusion!" : "En attente")\nlet etat = "";\n\nreturn etat;`,
    solutionCode: `let degres = 600;\nlet etat = degres >= 500 ? "Fusion!" : "En attente";\n\nreturn etat;`,
    hint: "Utilise degres >= 500 ? \"Fusion!\" : \"En attente\".",
    rewardXP: 16,
    check: (res) => res === "Fusion!"
  },
  {
    id: 21,
    phase: 6,
    title: "La Quintessence des Éléments (Spread)",
    difficulty: "EXPERT",
    lore: "Rassemblez les 3 éléments primordiaux dans un réceptacle unique avec l'opérateur spread <code>...</code>.",
    objective: "Fusionnez les deux tableaux avec <code>[...el1, ...el2]</code>.",
    initialCode: `let el1 = ["Terre", "Eau"];\nlet el2 = ["Feu"];\n\n// Fusionnez les deux tableaux\nlet quintessence = [];\n\nreturn quintessence;`,
    solutionCode: `let el1 = ["Terre", "Eau"];\nlet el2 = ["Feu"];\nlet quintessence = [...el1, ...el2];\n\nreturn quintessence;`,
    hint: "Utilise [...el1, ...el2].",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.includes("Feu")
  },
  {
    id: 22,
    phase: 6,
    title: "La Pierre Philosophale (Opus Magnum)",
    difficulty: "EXPERT",
    lore: "L'ultime transmutation ! Forgez l'artefact suprême de l'Alchimiste du Code.",
    objective: "Complétez l'objet <code>{ nom: \"Pierre Philosophale\", transmutations: 22, accompli: true }</code>.",
    initialCode: `// Complétez l'Artefact Suprême\nconst OpusMagnum = {\n  nom: "",\n  transmutations: 0,\n  accompli: false\n};\n\nreturn OpusMagnum;`,
    solutionCode: `const OpusMagnum = {\n  nom: "Pierre Philosophale",\n  transmutations: 22,\n  accompli: true\n};\n\nreturn OpusMagnum;`,
    hint: "Met nom: \"Pierre Philosophale\", transmutations: 22, accompli: true.",
    rewardXP: 25,
    check: (res) => typeof res === 'object' && res.nom === "Pierre Philosophale" && res.accompli === true
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

  const prompt = `Génère une micro-quête JavaScript TRÈS SIMPLE à trous sur l'alchimie du code.
RÈGLE OBLIGATOIRE : initialCode DOIT ÊTRE UN EXERCICE À COMPLÉTER PAR LE JOUEUR (ex: let mercure = 50; return mercure;). Ne mets JAMAIS la solution dans initialCode !

Réponds STRICTEMENT en JSON :
{
  "title": "Titre captivant (ex: L'Éveil du Mercure Volatil)",
  "storyContinuity": "",
  "lore": "Un court récit alchimique captivant et immersif (1-2 phrases).",
  "objective": "Consigne très simple (ex: Multipliez la variable mercure par 2).",
  "initialCode": "let mercure = 50;\\n\\n// Multipliez mercure par 2 ici\\n\\nreturn mercure;",
  "solutionCode": "let mercure = 50;\\nmercure = mercure * 2;\\nreturn mercure;",
  "hint": "Utilise * 2 pour doubler la valeur."
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
      title: geminiData.title || `Chapitre #${questId} : Les Secrets de l'Athanor`,
      difficulty: "FORGÉE PAR GMI ✨",
      lore: geminiData.lore || "Une nouvelle transmutation alchimique commence.",
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
    title: `La Transmutation #${questId}`,
    difficulty: "AUTOMATIQUE",
    lore: "L'Athanor exige une nouvelle pesée d'ingrédients.",
    objective: `Multipliez la quantité <code>25</code> par 2.`,
    initialCode: `let dose = 25;\n\n// Doublez la dose\nlet resultat = 0;\n\nreturn resultat;`,
    solutionCode: `let dose = 25;\nlet resultat = dose * 2;\n\nreturn resultat;`,
    hint: "Fais dose * 2 !",
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

  const prompt = `Tu es ORBIT, l'Homunculus Alchimique et copilote IA de l'alchimiste dans le Grand Œuvre du Code.
Quête actuelle #${quest?.id || 1} : "${quest?.title || 'Quête'}".
Objectif : "${quest?.objective || 'Transmuter'}".
Indice : "${quest?.hint || 'Vérifie le code'}".

Question de l'alchimiste : "${message}"

Réponds de manière concise (2 phrases max), bienveillante, mystique et très utile pour l'alchimiste.`;

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
