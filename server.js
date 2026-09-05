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
  { id: 1, name: "Calcination", symbol: "🜍", subtitle: "CRM, statuts & données brutes" },
  { id: 2, name: "Distillation", symbol: "🜔", subtitle: "Prix, stocks & calculs métier" },
  { id: 3, name: "Formules", symbol: "🜛", subtitle: "Helpers qu'on réutilise en équipe" },
  { id: 4, name: "Fioles", symbol: "🜁", subtitle: "Paniers, tickets & fiches produit" },
  { id: 5, name: "Rituels", symbol: "🜃", subtitle: "Nettoyer et transformer des données" },
  { id: 6, name: "Grand Œuvre", symbol: "🝤", subtitle: "Décider et livrer" }
];

const QUESTS = [
  {
    id: 1,
    phase: 1,
    title: "Le statut du prospect",
    difficulty: "FACILE",
    lesson: "Au CRM, un statut client c'est une variable texte : tu changes le contenu, la fiche change.",
    lore: "Léa a signé. Dans Salesforce le statut est encore <code>\"prospect\"</code> — l'équipe attend le bon badge.",
    objective: "Passe <code>statut</code> de <code>\"prospect\"</code> à <code>\"client\"</code>.",
    initialCode: `// Fiche CRM du jour\nlet statut = "prospect";\n\nreturn statut;`,
    solutionCode: `let statut = "client";\n\nreturn statut;`,
    hint: "Remplace \"prospect\" par \"client\".",
    rewardXP: 16,
    check: (res, ctx) => res === "client" || ctx.statut === "client"
  },
  {
    id: 2,
    phase: 1,
    title: "Le stock à corriger",
    difficulty: "FACILE",
    lesson: "Un stock, un prix, un délai : en prod ce sont des nombres, sans guillemets.",
    lore: "L'inventaire affiche 0 alors que 12 casques sont rentrés ce matin. Corrige avant le brief logistique.",
    objective: "Le <code>stock</code> est à <code>0</code> — mets-le à <code>12</code>.",
    initialCode: `// Quantité réelle en entrepôt\nlet stock = 0;\n\nreturn stock;`,
    solutionCode: `let stock = 12;\n\nreturn stock;`,
    hint: "Remplace 0 par 12.",
    rewardXP: 16,
    check: (res, ctx) => res === 12 || ctx.stock === 12
  },
  {
    id: 3,
    phase: 1,
    title: "L'email vérifié",
    difficulty: "FACILE",
    lesson: "<code>true</code> / <code>false</code> c'est le même interrupteur qu'un feature flag ou qu'un email vérifié.",
    lore: "Le user a cliqué le lien de confirmation. Le compte reste bloqué tant que le flag est éteint.",
    objective: "Allume <code>emailVerifie</code>.",
    initialCode: `// Flag du compte\nlet emailVerifie = false;\n\nreturn emailVerifie;`,
    solutionCode: `let emailVerifie = true;\n\nreturn emailVerifie;`,
    hint: "Passe false à true.",
    rewardXP: 16,
    check: (res, ctx) => res === true || ctx.emailVerifie === true
  },
  {
    id: 4,
    phase: 1,
    title: "Le nom sur le badge",
    difficulty: "FACILE",
    lesson: "Prénom + nom, c'est le même <code>+</code> que pour un email de bienvenue ou un badge Slack.",
    lore: "Le badge de la new hire est vide. Colle prénom et nom pour le slack-bot d'onboarding.",
    objective: "Colle <code>prenom</code> et <code>nom</code> avec un espace dans <code>affichage</code>.",
    initialCode: `let prenom = "Léa";\nlet nom = "Martin";\n\n// Nom affiché sur le badge\nlet affichage = "";\n\nreturn affichage;`,
    solutionCode: `let prenom = "Léa";\nlet nom = "Martin";\nlet affichage = prenom + " " + nom;\n\nreturn affichage;`,
    hint: "Utilise prenom + \" \" + nom.",
    rewardXP: 16,
    check: (res, ctx) => res === "Léa Martin" || ctx.affichage === "Léa Martin"
  },
  {
    id: 5,
    phase: 2,
    title: "Le total de la commande",
    difficulty: "MOYEN",
    lesson: "En caisse, <code>+</code> entre deux nombres additionne : prix + frais, jamais du texte.",
    lore: "Le panier affiche 10€ + 5€ de livraison. Le total checkout est encore à 0.",
    objective: "Verse <code>prix</code> et <code>frais</code> dans <code>total</code>.",
    initialCode: `let prix = 10;\nlet frais = 5;\n\n// Total à encaisser\nlet total = 0;\n\nreturn total;`,
    solutionCode: `let prix = 10;\nlet frais = 5;\nlet total = prix + frais;\n\nreturn total;`,
    hint: "Additionne prix + frais.",
    rewardXP: 16,
    check: (res, ctx) => res === 15 || ctx.total === 15
  },
  {
    id: 6,
    phase: 2,
    title: "La ligne de facture",
    difficulty: "MOYEN",
    lesson: "<code>prixUnitaire * quantite</code> c'est la ligne de facture que tu calcules tous les jours.",
    lore: "Deux licences à 50€. La ligne doit sortir toute seule, sans réécrire 100 à la main.",
    objective: "Calcule la ligne dans <code>ligne</code>.",
    initialCode: `let prixUnitaire = 50;\nlet quantite = 2;\n\n// Montant de la ligne\nlet ligne = 0;\n\nreturn ligne;`,
    solutionCode: `let prixUnitaire = 50;\nlet quantite = 2;\nlet ligne = prixUnitaire * quantite;\n\nreturn ligne;`,
    hint: "Utilise prixUnitaire * quantite.",
    rewardXP: 16,
    check: (res, ctx) => res === 100 || ctx.ligne === 100
  },
  {
    id: 7,
    phase: 2,
    title: "Le reste de pagination",
    difficulty: "MOYEN",
    lesson: "<code>%</code> sert en prod à paginer : ce qui ne rentre pas dans la page.",
    lore: "10 tickets, 3 par page. Combien débordent sur une page incomplète ?",
    objective: "Range le reste de <code>10 % 3</code> dans <code>reste</code>.",
    initialCode: `let tickets = 10;\nlet parPage = 3;\n\n// Tickets qui dépassent la dernière page pleine\nlet reste = 0;\n\nreturn reste;`,
    solutionCode: `let tickets = 10;\nlet parPage = 3;\nlet reste = tickets % parPage;\n\nreturn reste;`,
    hint: "Écris tickets % parPage (ça vaut 1).",
    rewardXP: 16,
    check: (res, ctx) => res === 1 || ctx.reste === 1
  },
  {
    id: 8,
    phase: 3,
    title: "Le message de bienvenue",
    difficulty: "MOYEN",
    lesson: "Une fonction, c'est un helper d'équipe : tu l'appelles, elle te rend toujours le même type de résultat.",
    lore: "Le bot d'onboarding doit toujours dire la même phrase. Factorise-la, ne la recopie pas partout.",
    objective: "Fais rendre <code>\"Bienvenue !\"</code> à <code>messageBienvenue()</code>.",
    initialCode: `function messageBienvenue() {\n  // Phrase du bot\n  return "";\n}\n\nreturn messageBienvenue();`,
    solutionCode: `function messageBienvenue() {\n  return "Bienvenue !";\n}\n\nreturn messageBienvenue();`,
    hint: "Met return \"Bienvenue !\"; dans la fonction.",
    rewardXP: 16,
    check: (res) => res === "Bienvenue !"
  },
  {
    id: 9,
    phase: 3,
    title: "Les heures majorées",
    difficulty: "MOYEN",
    lesson: "Un helper avec paramètre, c'est un micro-service : tu verses n'importe quelle dose, la règle reste la même.",
    lore: "Les heures sup sont payées double. Un seul helper doit servir pour tout le planning.",
    objective: "<code>heuresSup(x)</code> rend le double de <code>x</code>.",
    initialCode: `function heuresSup(x) {\n  // Majoration 200%\n  return 0;\n}\n\nreturn heuresSup(21);`,
    solutionCode: `function heuresSup(x) {\n  return x * 2;\n}\n\nreturn heuresSup(21);`,
    hint: "Fais return x * 2;",
    rewardXP: 16,
    check: (res, ctx) => res === 42 || (typeof ctx.heuresSup === 'function' && ctx.heuresSup(10) === 20)
  },
  {
    id: 10,
    phase: 3,
    title: "L'étiquette produit",
    difficulty: "MOYEN",
    lesson: "Deux paramètres, c'est deux champs d'un formulaire : le helper les assemble pour l'étiquette.",
    lore: "L'entrepôt imprime \"Tee-shirt / M\". Un helper unique pour toutes les tailles.",
    objective: "<code>etiquette(produit, taille)</code> rend <code>produit + \" / \" + taille</code>.",
    initialCode: `function etiquette(produit, taille) {\n  // Ex: Tee-shirt / M\n  return "";\n}\n\nreturn etiquette("Tee-shirt", "M");`,
    solutionCode: `function etiquette(produit, taille) {\n  return produit + " / " + taille;\n}\n\nreturn etiquette("Tee-shirt", "M");`,
    hint: "Retourne produit + \" / \" + taille.",
    rewardXP: 16,
    check: (res) => res === "Tee-shirt / M"
  },
  {
    id: 11,
    phase: 4,
    title: "L'article dans le panier",
    difficulty: "AVANCÉ",
    lesson: "Un tableau c'est un panier : <code>.push()</code> ajoute une ligne, sans recréer la liste.",
    lore: "Le client clique \"Ajouter un écran\". La ligne doit atterrir à la fin du panier.",
    objective: "Ajoute <code>\"Écran\"</code> dans <code>panier</code>.",
    initialCode: `let panier = ["Souris", "Clavier"];\n\n// Ajoute l'écran\n\nreturn panier;`,
    solutionCode: `let panier = ["Souris", "Clavier"];\npanier.push("Écran");\n\nreturn panier;`,
    hint: "Écris panier.push(\"Écran\");",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.includes("Écran") && res.length === 3
  },
  {
    id: 12,
    phase: 4,
    title: "Les tickets ouverts",
    difficulty: "AVANCÉ",
    lesson: "<code>.length</code> c'est le compteur du board Jira : pas besoin de compter à la main.",
    lore: "Le daily demande combien de tickets sont encore ouverts. La liste est déjà là.",
    objective: "Range le nombre de <code>tickets</code> dans <code>ouverts</code>.",
    initialCode: `let tickets = ["Login", "Paiement", "Export", "Mentions"];\n\n// Compteur du daily\nlet ouverts = 0;\n\nreturn ouverts;`,
    solutionCode: `let tickets = ["Login", "Paiement", "Export", "Mentions"];\nlet ouverts = tickets.length;\n\nreturn ouverts;`,
    hint: "Utilise tickets.length.",
    rewardXP: 16,
    check: (res) => res === 4
  },
  {
    id: 13,
    phase: 4,
    title: "Le ticket en haut de pile",
    difficulty: "AVANCÉ",
    lesson: "Les listes commencent à <code>0</code> : le premier ticket du backlog c'est <code>backlog[0]</code>.",
    lore: "Le PO veut le ticket le plus haut du backlog, pas le deuxième.",
    objective: "Sors le premier ticket dans <code>prioritaire</code>.",
    initialCode: `let backlog = ["Paiement", "Export", "Mentions"];\n\n// Ticket à prendre maintenant\nlet prioritaire = "";\n\nreturn prioritaire;`,
    solutionCode: `let backlog = ["Paiement", "Export", "Mentions"];\nlet prioritaire = backlog[0];\n\nreturn prioritaire;`,
    hint: "Écris backlog[0].",
    rewardXP: 16,
    check: (res) => res === "Paiement"
  },
  {
    id: 14,
    phase: 4,
    title: "Le dernier message client",
    difficulty: "AVANCÉ",
    lesson: "Le dernier élément est à l'index <code>longueur - 1</code> — ici le 3e message, donc <code>[2]</code>.",
    lore: "Le support doit citer le dernier message du thread, pas le premier.",
    objective: "Range le dernier message dans <code>dernier</code>.",
    initialCode: `let thread = ["Bonjour", "Toujours bloqué", "Merci c'est bon"];\n\n// Dernier message du client\nlet dernier = "";\n\nreturn dernier;`,
    solutionCode: `let thread = ["Bonjour", "Toujours bloqué", "Merci c'est bon"];\nlet dernier = thread[2];\n\nreturn dernier;`,
    hint: "Écris thread[2].",
    rewardXP: 16,
    check: (res) => res === "Merci c'est bon"
  },
  {
    id: 15,
    phase: 4,
    title: "La fiche produit",
    difficulty: "AVANCÉ",
    lesson: "Un objet <code>{ nom, prix }</code> c'est une fiche produit : chaque champ a un nom, comme en base.",
    lore: "La card boutique est vide. Remplis le nom et le prix avant la mise en ligne.",
    objective: "Fiche : nom <code>\"Casque\"</code>, prix <code>100</code>.",
    initialCode: `// Fiche catalogue\nlet produit = {\n  nom: "",\n  prix: 0\n};\n\nreturn produit;`,
    solutionCode: `let produit = {\n  nom: "Casque",\n  prix: 100\n};\n\nreturn produit;`,
    hint: "Met nom: \"Casque\", prix: 100.",
    rewardXP: 16,
    check: (res) => typeof res === 'object' && res.nom === "Casque" && res.prix === 100
  },
  {
    id: 16,
    phase: 5,
    title: "Payé ou relance",
    difficulty: "AVANCÉ",
    lesson: "<code>if</code> c'est la règle métier : si le reste à payer est 0, on clôture, sinon on relance.",
    lore: "Le cron du soir doit taguer les factures. Zéro dû = Payé.",
    objective: "Si <code>resteAPayer === 0</code>, dis <code>\"Payé\"</code> — sinon <code>\"Relance\"</code>.",
    initialCode: `let resteAPayer = 0;\n\nfunction statutPaiement(montant) {\n  // if (montant === 0)\n  return "Relance";\n}\n\nreturn statutPaiement(resteAPayer);`,
    solutionCode: `let resteAPayer = 0;\n\nfunction statutPaiement(montant) {\n  if (montant === 0) {\n    return "Payé";\n  }\n  return "Relance";\n}\n\nreturn statutPaiement(resteAPayer);`,
    hint: "Si montant === 0 renvoie \"Payé\".",
    rewardXP: 16,
    check: (res) => res === "Payé"
  },
  {
    id: 17,
    phase: 5,
    title: "La promo week-end",
    difficulty: "EXPERT",
    lesson: "<code>.map()</code> applique une règle à chaque ligne d'un export — la liste d'origine reste intacte.",
    lore: "Marketing double tous les points fidélité le week-end. Un passage, toutes les cartes.",
    objective: "Double chaque solde, sans toucher à la liste d'origine.",
    initialCode: `let points = [10, 20, 30];\n\n// Promo x2\nlet bonus = [];\n\nreturn bonus;`,
    solutionCode: `let points = [10, 20, 30];\nlet bonus = points.map(p => p * 2);\n\nreturn bonus;`,
    hint: "Écris points.map(p => p * 2).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res[0] === 20 && res[1] === 40 && res[2] === 60
  },
  {
    id: 18,
    phase: 5,
    title: "Les commandes livrables",
    difficulty: "EXPERT",
    lesson: "<code>.filter()</code> c'est le tri d'un export : tu ne gardes que les lignes qui passent la règle.",
    lore: "On ne prépare que les commandes à 50€ et plus. Le reste attend.",
    objective: "Garde seulement les montants <code>≥ 50</code>.",
    initialCode: `let commandes = [20, 80, 15, 95, 40, 60];\n\n// Commandes à préparer\nlet livrables = [];\n\nreturn livrables;`,
    solutionCode: `let commandes = [20, 80, 15, 95, 40, 60];\nlet livrables = commandes.filter(c => c >= 50);\n\nreturn livrables;`,
    hint: "Écris commandes.filter(c => c >= 50).",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.every(x => x >= 50)
  },
  {
    id: 19,
    phase: 5,
    title: "Le chiffre du jour",
    difficulty: "EXPERT",
    lesson: "<code>.reduce()</code> écrase un export en un seul chiffre — ici le CA, en partant de <code>0</code>.",
    lore: "Trois ventes dans la journée. Le dashboard veut un seul total, pas trois lignes.",
    objective: "Fais le total des ventes dans <code>ca</code>.",
    initialCode: `let ventes = [10, 20, 30];\n\n// Chiffre d'affaires\nlet ca = 0;\n\nreturn ca;`,
    solutionCode: `let ventes = [10, 20, 30];\nlet ca = ventes.reduce((a, b) => a + b, 0);\n\nreturn ca;`,
    hint: "Écris ventes.reduce((a, b) => a + b, 0).",
    rewardXP: 16,
    check: (res) => res === 60
  },
  {
    id: 20,
    phase: 6,
    title: "File d'attente prioritaire",
    difficulty: "EXPERT",
    lesson: "<code>condition ? oui : non</code> c'est le badge d'un ticket : une ligne pour choisir le statut.",
    lore: "Plus de 500 tickets ouverts : on passe le board en Prioritaire pour le weekend duty.",
    objective: "Si <code>ouverts >= 500</code>, c'est <code>\"Prioritaire\"</code> — sinon <code>\"Normal\"</code>.",
    initialCode: `let ouverts = 600;\n\n// Badge du board\nlet priorite = "";\n\nreturn priorite;`,
    solutionCode: `let ouverts = 600;\nlet priorite = ouverts >= 500 ? "Prioritaire" : "Normal";\n\nreturn priorite;`,
    hint: "Utilise ouverts >= 500 ? \"Prioritaire\" : \"Normal\".",
    rewardXP: 16,
    check: (res) => res === "Prioritaire"
  },
  {
    id: 21,
    phase: 6,
    title: "La fusion des deux squads",
    difficulty: "EXPERT",
    lesson: "<code>...</code> verse une liste dans une autre : fusion d'équipes, pas une liste dans une liste.",
    lore: "Frontend et backend passent sur le même board pour le launch. Une seule roster.",
    objective: "Fusionne les deux squads dans <code>equipe</code>.",
    initialCode: `let frontend = ["Léa", "Sam"];\nlet backend = ["Noa"];\n\n// Roster unique\nlet equipe = [];\n\nreturn equipe;`,
    solutionCode: `let frontend = ["Léa", "Sam"];\nlet backend = ["Noa"];\nlet equipe = [...frontend, ...backend];\n\nreturn equipe;`,
    hint: "Utilise [...frontend, ...backend].",
    rewardXP: 16,
    check: (res) => Array.isArray(res) && res.length === 3 && res.includes("Noa")
  },
  {
    id: 22,
    phase: 6,
    title: "Le livrable de sprint",
    difficulty: "EXPERT",
    lesson: "Un objet de livrable porte plusieurs vérités : un nom, un compteur, un drapeau <code>true</code>.",
    lore: "La demo client est dans une heure. Signe la release : nom, 22 tickets, prêt.",
    objective: "Signe : nom <code>Release 1.0</code>, 22 tickets, <code>pret: true</code>.",
    initialCode: `// Livrable du sprint\nconst release = {\n  nom: "",\n  tickets: 0,\n  pret: false\n};\n\nreturn release;`,
    solutionCode: `const release = {\n  nom: "Release 1.0",\n  tickets: 22,\n  pret: true\n};\n\nreturn release;`,
    hint: "Met nom: \"Release 1.0\", tickets: 22, pret: true.",
    rewardXP: 25,
    check: (res) => typeof res === 'object' && res.nom === "Release 1.0" && res.pret === true
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
  const prompt = `Tu génères une micro-quête JavaScript TRÈS SIMPLE, directement utile au boulot (CRM, facture, panier, ticket, email, stock, badge, sprint).
INTERDIT : alchimie, plomb, or, creuset, potions, syntaxe gratuite sans cas métier.
INTERDIT : recopier la quête précédente (« ${prevTitle} »).
RÈGLE : initialCode est un TROU à compléter. Ne mets JAMAIS la solution dedans.
RÈGLE : "lesson" = UNE phrase mentor : le concept JS + pourquoi on s'en sert en prod.
RÈGLE : noms de variables parlants (statut, panier, facture, ticket, email, stock, prenom).
"objective" en tutoiement, sans "Déclarez / Complétez / Calculez".

Réponds STRICTEMENT en JSON :
{
  "title": "Titre métier (ex: La relance de facture)",
  "storyContinuity": "",
  "lesson": "Une phrase : concept + usage pro (ex: * sert à faire une ligne de facture : prixUnitaire * quantite).",
  "lore": "1-2 phrases de contexte bureau (équipe, client, ticket), pas un cours.",
  "objective": "Action courte (ex: Double la quantité pour le réassort week-end.).",
  "initialCode": "let quantite = 25;\\n\\n// Double la quantité ici\\nlet resultat = 0;\\n\\nreturn resultat;",
  "solutionCode": "let quantite = 25;\\nlet resultat = quantite * 2;\\nreturn resultat;",
  "hint": "Utilise quantite * 2."
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
      title: geminiData.title || `Ticket #${questId} : cas métier`,
      difficulty: "FORGÉE PAR GMI ✨",
      lesson: geminiData.lesson || "En prod, tu changes une valeur métier, puis tu la rends avec return — c'est le même geste qu'un helper d'équipe.",
      lore: geminiData.lore || "Un nouveau cas vient d'arriver sur le board.",
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
    title: `Réassort week-end #${questId}`,
    difficulty: "AUTOMATIQUE",
    lesson: "<code>*</code> sert à une ligne de commande : <code>quantite * 2</code> double le réassort sans réécrire le chiffre.",
    lore: "Le week-end double les ventes. Prépare le réassort avant 18h.",
    objective: `Double la quantité <code>25</code> dans <code>resultat</code>.`,
    initialCode: `let quantite = 25;\n\n// Réassort week-end\nlet resultat = 0;\n\nreturn resultat;`,
    solutionCode: `let quantite = 25;\nlet resultat = quantite * 2;\n\nreturn resultat;`,
    hint: "Fais quantite * 2.",
    rewardXP: 20,
    isGenerated: true,
    check: () => true
  };

  generatedQuests.set(proceduralQuest.id, proceduralQuest);
  const { check, ...sanitized } = proceduralQuest;
  res.json({
    success: true,
    quest: sanitized,
    source: "Cas métier (Saga Continue)"
  });
});

// Endpoint Copilote ORBIT IA (Gemini 3.6 Flash)
async function callGeminiForOrbitChat({ message, quest, geminiKey }) {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || process.env.GMI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const prompt = `Tu es ORBIT, copilote d'une équipe produit. Tu apprends le JS comme on le parle au boulot.
1 phrase de principe (concept + usage pro), puis l'action. Pas de "exercice / consigne / déclarez". Pas d'alchimie.
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
