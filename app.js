/**
 * QUANTUM RUN — OPUS MAGNUM
 * Client Cockpit connecté au Backend Express / Render
 */

// Données par défaut des 6 phases
const DEFAULT_PHASES = [
  { id: 1, name: "Calcination", symbol: "🜍", subtitle: "Purification des types primitifs", questsRange: [1, 4] },
  { id: 2, name: "Distillation", symbol: "🜔", subtitle: "Calculs & pesées du fourneau", questsRange: [5, 7] },
  { id: 3, name: "Formules", symbol: "🜛", subtitle: "Incantations & fonctions magiques", questsRange: [8, 10] },
  { id: 4, name: "Les Fioles", symbol: "🜁", subtitle: "Agrégats, tableaux & réactifs", questsRange: [11, 15] },
  { id: 5, name: "Rituels", symbol: "🜃", subtitle: "Purifications, filtres & logiques", questsRange: [16, 19] },
  { id: 6, name: "Grand Œuvre", symbol: "🝤", subtitle: "La Pierre Philosophale", questsRange: [20, 22] }
];

// Fallback des 22 quêtes en cas de latence réseau
const FALLBACK_QUESTS = [
  {
    id: 1,
    phase: 1,
    title: "La Transmutation du Plomb",
    difficulty: "TRÈS SIMPLE",
    lesson: "Une variable <code>let</code> est une boîte : tu y ranges un texte entre guillemets, puis tu remplaces le contenu.",
    lore: "Le vil métal attend dans le creuset. Pour initier le Grand Œuvre, transmutez la matière vile <code>\"lead\"</code> en métal précieux <code>\"gold\"</code>.",
    objective: "Le plomb dort dans <code>metal</code> — mets <code>\"gold\"</code> à la place.",
    initialCode: `// Transmutez le plomb en or\nlet metal = "lead";\n\nconsole.log("Métal dans le creuset :", metal);\nreturn metal;`,
    solutionCode: `let metal = "gold";\n\nconsole.log("Métal dans le creuset :", metal);\nreturn metal;`,
    hint: "Remplace simplement \"lead\" par \"gold\" à la ligne 2 !",
    rewardXP: 16
  },
  {
    id: 2,
    phase: 1,
    title: "L'Âge de l'Initié",
    difficulty: "TRÈS SIMPLE",
    lesson: "Un nombre n'a jamais de guillemets : <code>20</code> c'est une quantité, <code>\"20\"</code> ce serait juste du texte.",
    lore: "Tout alchimiste doit déclarer ses années d'apprentissage pour calibrer l'Athanor.",
    objective: "L'âge est à <code>0</code> — passe-le à <code>20</code>.",
    initialCode: `// Déclarez la variable age avec le nombre 20\nlet age = 0;\n\nconsole.log("Âge de l'alchimiste :", age);\nreturn age;`,
    solutionCode: `let age = 20;\n\nconsole.log("Âge de l'alchimiste :", age);\nreturn age;`,
    hint: "Remplace 0 par 20 dans let age = 20;",
    rewardXP: 16
  },
  {
    id: 3,
    phase: 1,
    title: "L'Élixir d'Immortalité",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>true</code> et <code>false</code> sont les deux seuls interrupteurs du langage : allumé ou éteint, sans guillemets.",
    lore: "La fiole rouge confère l'immortalité. Activez le sceau de vérité booléen.",
    objective: "L'interrupteur <code>isImmortal</code> est éteint — allume-le.",
    initialCode: `// Activez l'élixir avec la valeur booléenne true\nlet isImmortal = false;\n\nconsole.log("Immortalité active :", isImmortal);\nreturn isImmortal;`,
    solutionCode: `let isImmortal = true;\n\nconsole.log("Immortalité active :", isImmortal);\nreturn isImmortal;`,
    hint: "Change false en true !",
    rewardXP: 16
  },
  {
    id: 4,
    phase: 1,
    title: "L'Eau de Vie (Aqua Vitae)",
    difficulty: "TRÈS SIMPLE",
    lesson: "Deux textes se collent avec <code>+</code> : <code>\"Aqua\" + \" \" + \"Vitae\"</code> fabrique une phrase.",
    lore: "Fusionnez les deux vapeurs sacrées pour obtenir la potion complète <code>\"Aqua Vitae\"</code>.",
    objective: "Colle <code>mot1</code> et <code>mot2</code> avec un espace dans <code>potion</code>.",
    initialCode: `let mot1 = "Aqua";\nlet mot2 = "Vitae";\n\n// Concaténez les deux mots avec un espace\nlet potion = mot1 + " " + mot2;\n\nconsole.log("Potion créée :", potion);\nreturn potion;`,
    solutionCode: `let mot1 = "Aqua";\nlet mot2 = "Vitae";\nlet potion = mot1 + " " + mot2;\n\nconsole.log("Potion créée :", potion);\nreturn potion;`,
    hint: "Le code est déjà prêt ! Clique sur Transmuter !",
    rewardXP: 16
  },
  {
    id: 5,
    phase: 2,
    title: "La Pesée du Soufre et du Sel",
    difficulty: "TRÈS SIMPLE",
    lesson: "Le <code>+</code> entre deux nombres additionne vraiment : <code>soufre + sel</code> calcule, ça ne colle pas du texte.",
    lore: "Pour stabiliser la réaction, additionnez les 10 grammes de soufre et les 5 grammes de sel.",
    objective: "Verse <code>soufre</code> et <code>sel</code> dans <code>total</code>.",
    initialCode: `let soufre = 10;\nlet sel = 5;\n\n// Calculez la somme des deux poudres\nlet total = soufre + sel;\n\nconsole.log("Masse totale :", total, "grammes");\nreturn total;`,
    solutionCode: `let soufre = 10;\nlet sel = 5;\nlet total = soufre + sel;\n\nconsole.log("Masse totale :", total, "grammes");\nreturn total;`,
    hint: "L'addition soufre + sel donne 15. Lance la transmutation !",
    rewardXP: 16
  },
  {
    id: 6,
    phase: 2,
    title: "La Flamme de l'Athanor",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>*</code> multiplie : si tu as une valeur, <code>temperature * 2</code> la double sans la réécrire à la main.",
    lore: "Le fourneau est tiède. Doublez la température actuelle pour lancer l'ébullition.",
    objective: "Double <code>temperature</code> dans <code>temperatureFinale</code>.",
    initialCode: `let temperature = 50;\n\n// Doublez la température (temperature * 2)\nlet temperatureFinale = temperature * 2;\n\nconsole.log("Température de l'Athanor :", temperatureFinale, "°C");\nreturn temperatureFinale;`,
    solutionCode: `let temperature = 50;\nlet temperatureFinale = temperature * 2;\n\nconsole.log("Température de l'Athanor :", temperatureFinale, "°C");\nreturn temperatureFinale;`,
    hint: "50 * 2 = 100°C. La formule est prête !",
    rewardXP: 16
  },
  {
    id: 7,
    phase: 2,
    title: "Le Reste Sacré (Modulo)",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>%</code> n'est pas un pourcentage : c'est le reste après une division — <code>10 % 3</code> vaut <code>1</code>.",
    lore: "L'opérateur modulo <code>%</code> donne le reste d'une division. Trouvez le reste de <code>10 % 3</code>.",
    objective: "Trouve ce qui reste quand tu partages 10 en 3, dans <code>reste</code>.",
    initialCode: `// Calculez 10 % 3\nlet reste = 10 % 3;\n\nconsole.log("Goutte restante :", reste);\nreturn reste;`,
    solutionCode: `let reste = 10 % 3;\n\nconsole.log("Goutte restante :", reste);\nreturn reste;`,
    hint: "10 divisé par 3 fait 3 avec un reste de 1 !",
    rewardXP: 16
  },
  {
    id: 8,
    phase: 3,
    title: "L'Incantation d'Éveil",
    difficulty: "TRÈS SIMPLE",
    lesson: "Une fonction est un sort réutilisable : ce que tu <code>return</code> est ce qu'elle te rend quand tu l'appelles.",
    lore: "Les alchimistes réveillent le laboratoire en prononçant le cri rituel : <code>\"Eureka!\"</code>.",
    objective: "Fais parler <code>incantation()</code> : elle doit rendre <code>\"Eureka!\"</code>.",
    initialCode: `function incantation() {\n  // Retournez "Eureka!"\n  return "Eureka!";\n}\n\nlet cri = incantation();\nconsole.log("Parole magique :", cri);\nreturn cri;`,
    solutionCode: `function incantation() {\n  return "Eureka!";\n}\n\nlet cri = incantation();\nconsole.log("Parole magique :", cri);\nreturn cri;`,
    hint: "La fonction retourne déjà \"Eureka!\". Transmute !",
    rewardXP: 16
  },
  {
    id: 9,
    phase: 3,
    title: "Le Multiplicateur d'Essence",
    difficulty: "TRÈS SIMPLE",
    lesson: "Le paramètre <code>x</code> est un trou : tu y verses n'importe quelle dose, et <code>x * 2</code> la transforme.",
    lore: "Créez un sortilège capable de doubler n'importe quelle dose de poudre magique.",
    objective: "Le sort <code>doubler(x)</code> doit rendre le double de ce qu'on lui verse.",
    initialCode: `function doubler(x) {\n  // Retournez le double de x\n  return x * 2;\n}\n\nlet resultat = doubler(21);\nconsole.log("Dose doublée :", resultat);\nreturn resultat;`,
    solutionCode: `function doubler(x) {\n  return x * 2;\n}\n\nlet resultat = doubler(21);\nconsole.log("Dose doublée :", resultat);\nreturn resultat;`,
    hint: "doubler(21) donne 42. Clique sur Transmuter !",
    rewardXP: 16
  },
  {
    id: 10,
    phase: 3,
    title: "L'Alliance des Deux Éléments",
    difficulty: "TRÈS SIMPLE",
    lesson: "Deux paramètres, c'est deux trous : <code>fusionner(a, b)</code> reçoit deux réactifs et les assemble.",
    lore: "Une fonction alchimique prend deux réactifs en paramètres et les fusionne par addition.",
    objective: "Le sort <code>fusionner</code> additionne ce qu'on lui verse.",
    initialCode: `function fusionner(a, b) {\n  // Retournez a + b\n  return a + b;\n}\n\nlet alliage = fusionner(30, 70);\nconsole.log("Alliage obtenu :", alliage);\nreturn alliage;`,
    solutionCode: `function fusionner(a, b) {\n  return a + b;\n}\n\nlet alliage = fusionner(30, 70);\nconsole.log("Alliage obtenu :", alliage);\nreturn alliage;`,
    hint: "30 + 70 = 100. Transmute le code !",
    rewardXP: 16
  },
  {
    id: 11,
    phase: 4,
    title: "L'Inventaire du Laboratoire",
    difficulty: "TRÈS SIMPLE",
    lesson: "Un tableau est une fiole : <code>.push()</code> ajoute un ingrédient à la fin, sans recréer la liste.",
    lore: "Les réactifs sont stockés dans une fiole collective (un tableau). Ajoutez le réactif <code>\"sel\"</code>.",
    objective: "Ajoute <code>\"sel\"</code> dans <code>reactifs</code>.",
    initialCode: `let reactifs = ["mercure", "soufre"];\n\n// Ajoutez "sel" au tableau (avec .push("sel"))\nreactifs.push("sel");\n\nconsole.log("Inventaire :", reactifs);\nreturn reactifs;`,
    solutionCode: `let reactifs = ["mercure", "soufre"];\nreactifs.push("sel");\n\nconsole.log("Inventaire :", reactifs);\nreturn reactifs;`,
    hint: "La méthode .push(\"sel\") ajoute l'élément à la fin !",
    rewardXP: 16
  },
  {
    id: 12,
    phase: 4,
    title: "L'Essence Primaire (Premier Index)",
    difficulty: "TRÈS SIMPLE",
    lesson: "Les listes commencent à <code>0</code> : le premier élément est <code>métaux[0]</code>, pas <code>métaux[1]</code>.",
    lore: "En JavaScript, le premier élément d'une liste se trouve à l'index <code>0</code>.",
    objective: "Sors le premier métal dans <code>premier</code>.",
    initialCode: `let métaux = ["argent", "cuivre", "fer"];\n\n// Récupérez le premier élément avec métaux[0]\nlet premier = métaux[0];\n\nconsole.log("Premier métal :", premier);\nreturn premier;`,
    solutionCode: `let métaux = ["argent", "cuivre", "fer"];\nlet premier = métaux[0];\n\nconsole.log("Premier métal :", premier);\nreturn premier;`,
    hint: "métaux[0] récupère \"argent\" !",
    rewardXP: 16
  },
  {
    id: 13,
    phase: 4,
    title: "Le Compte des Flacons",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>.length</code> compte les cases d'une liste — pas besoin de les dénombrer à la main.",
    lore: "La propriété <code>.length</code> permet de connaître le nombre d'éléments dans un tableau.",
    objective: "Compte les flacons et range le nombre dans <code>totalFlacons</code>.",
    initialCode: `let flacons = ["rubis", "saphir", "émeraude", "topaze"];\n\n// Obtenez la taille avec flacons.length\nlet totalFlacons = flacons.length;\n\nconsole.log("Nombre de flacons :", totalFlacons);\nreturn totalFlacons;`,
    solutionCode: `let flacons = ["rubis", "saphir", "émeraude", "topaze"];\nlet totalFlacons = flacons.length;\n\nconsole.log("Nombre de flacons :", totalFlacons);\nreturn totalFlacons;`,
    hint: "Le tableau contient 4 éléments !",
    rewardXP: 16
  },
  {
    id: 14,
    phase: 4,
    title: "La Fiole Philosophale (Objet)",
    difficulty: "TRÈS SIMPLE",
    lesson: "Un objet <code>{ nom, puissance }</code> est une fiche : chaque propriété a un nom et un contenu.",
    lore: "Un objet structure les propriétés d'un artefact alchimique magique.",
    objective: "Remplis la fiche <code>elixir</code> : puissance <code>100</code>.",
    initialCode: `let elixir = {\n  nom: "Potion d'Or",\n  puissance: 100\n};\n\nconsole.log("Élixir créé :", elixir.nom, "- Puissance :", elixir.puissance);\nreturn elixir;`,
    solutionCode: `let elixir = {\n  nom: "Potion d'Or",\n  puissance: 100\n};\n\nconsole.log("Élixir créé :", elixir.nom, "- Puissance :", elixir.puissance);\nreturn elixir;`,
    hint: "L'objet possède bien la propriété puissance = 100. Transmute !",
    rewardXP: 16
  },
  {
    id: 15,
    phase: 4,
    title: "Le Sceau de l'Auteur",
    difficulty: "TRÈS SIMPLE",
    lesson: "Tu changes une propriété d'objet avec un point : <code>grimoire.auteur = \"Hermès\"</code> réécrit la fiche.",
    lore: "Modifiez la propriété d'un objet existant pour signer le grimoire.",
    objective: "Signe le grimoire : l'auteur devient <code>\"Hermès\"</code>.",
    initialCode: `let grimoire = {\n  titre: "La Table d'Émeraude",\n  auteur: "Inconnu"\n};\n\n// Remplacez "Inconnu" par "Hermès"\ngrimoire.auteur = "Hermès";\n\nconsole.log("Auteur du grimoire :", grimoire.auteur);\nreturn grimoire;`,
    solutionCode: `let grimoire = {\n  titre: "La Table d'Émeraude",\n  auteur: "Hermès"\n};\n\nconsole.log("Auteur du grimoire :", grimoire.auteur);\nreturn grimoire;`,
    hint: "grimoire.auteur vaut maintenant \"Hermès\" !",
    rewardXP: 16
  },
  {
    id: 16,
    phase: 5,
    title: "La Parole Majuscule",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>.toUpperCase()</code> transforme un texte en MAJUSCULES sans toucher à l'original — ça rend une copie.",
    lore: "Pour que le sortilège résonne, convertissez la formule en lettres majuscules avec <code>.toUpperCase()</code>.",
    objective: "Fais crier <code>mot</code> en majuscules dans <code>paroleMagique</code>.",
    initialCode: `let mot = "transmutation";\n\n// Transformez le mot en MAJUSCULES\nlet paroleMagique = mot.toUpperCase();\n\nconsole.log("Incantation :", paroleMagique);\nreturn paroleMagique;`,
    solutionCode: `let mot = "transmutation";\nlet paroleMagique = mot.toUpperCase();\n\nconsole.log("Incantation :", paroleMagique);\nreturn paroleMagique;`,
    hint: "\"transmutation\".toUpperCase() donne \"TRANSMUTATION\" !",
    rewardXP: 16
  },
  {
    id: 17,
    phase: 5,
    title: "La Multiplication des Pépites (.map)",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>.map()</code> passe sur chaque élément et en fabrique un nouveau — la liste d'origine reste intacte.",
    lore: "La méthode <code>.map()</code> transforme chaque élément d'un tableau.",
    objective: "Double chaque pépite, sans toucher à la liste d'origine.",
    initialCode: `let pepites = [10, 20, 30];\n\n// Doublez chaque pépite avec .map(p => p * 2)\nlet enrichies = pepites.map(p => p * 2);\n\nconsole.log("Pépites doublées :", enrichies);\nreturn enrichies;`,
    solutionCode: `let pepites = [10, 20, 30];\nlet enrichies = pepites.map(p => p * 2);\n\nconsole.log("Pépites doublées :", enrichies);\nreturn enrichies;`,
    hint: "La fonction .map(p => p * 2) transforme parfaitement la liste !",
    rewardXP: 16
  },
  {
    id: 18,
    phase: 5,
    title: "Le Filtrage des Impuretés (.filter)",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>.filter()</code> ne garde que ce qui passe le test : le reste disparaît de la nouvelle liste.",
    lore: "La méthode <code>.filter()</code> ne conserve que les éléments respectant une condition.",
    objective: "Garde seulement ce qui est assez pur (<code>≥ 50</code>).",
    initialCode: `let puretes = [20, 80, 15, 95, 40, 60];\n\n// Filtrez pour garder >= 50\nlet nobles = puretes.filter(p => p >= 50);\n\nconsole.log("Métaux purs conservés :", nobles);\nreturn nobles;`,
    solutionCode: `let puretes = [20, 80, 15, 95, 40, 60];\nlet nobles = puretes.filter(p => p >= 50);\n\nconsole.log("Métaux purs conservés :", nobles);\nreturn nobles;`,
    hint: "Le filtre garde [80, 95, 60]. Transmute !",
    rewardXP: 16
  },
  {
    id: 19,
    phase: 5,
    title: "Le Sceau de Pureté Absolue",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>if</code> pose une question : si c'est vrai tu prends un chemin, sinon tu prends l'autre.",
    lore: "Vérifiez si l'élixir a atteint une pureté parfaite de <code>100</code> à l'aide d'une condition <code>if</code>.",
    objective: "Si c'est <code>100</code>, dis <code>\"Parfait\"</code>.",
    initialCode: `let purete = 100;\n\nfunction verifier(valeur) {\n  if (valeur === 100) {\n    return "Parfait";\n  }\n  return "Impur";\n}\n\nlet verdict = verifier(purete);\nconsole.log("Verdict :", verdict);\nreturn verdict;`,
    solutionCode: `let purete = 100;\n\nfunction verifier(valeur) {\n  if (valeur === 100) {\n    return "Parfait";\n  }\n  return "Impur";\n}\n\nlet verdict = verifier(purete);\nconsole.log("Verdict :", verdict);\nreturn verdict;`,
    hint: "La fonction renvoie \"Parfait\" car la pureté vaut 100 !",
    rewardXP: 16
  },
  {
    id: 20,
    phase: 6,
    title: "La Fusion Thermique",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>condition ? oui : non</code> est un <code>if</code> en une ligne : tu choisis une valeur selon un test.",
    lore: "L'Athanor atteint son paroxysme. Si la température est supérieure à 500, la fusion s'enclenche.",
    objective: "Si ça dépasse 500°, c'est <code>\"Fusion!\"</code> — sinon on attend.",
    initialCode: `let degres = 600;\n\nlet etat = degres >= 500 ? "Fusion!" : "En attente";\n\nconsole.log("État de l'Athanor :", etat);\nreturn etat;`,
    solutionCode: `let degres = 600;\nlet etat = degres >= 500 ? "Fusion!" : "En attente";\n\nconsole.log("État de l'Athanor :", etat);\nreturn etat;`,
    hint: "La ternaire degres >= 500 renvoie bien \"Fusion!\".",
    rewardXP: 16
  },
  {
    id: 21,
    phase: 6,
    title: "La Quintessence des Éléments",
    difficulty: "TRÈS SIMPLE",
    lesson: "<code>...</code> ouvre une liste et verse son contenu dans une autre — c'est une fusion, pas un imbriquement.",
    lore: "Rassemblez les 3 éléments primordiaux (Terre, Eau, Feu) dans un réceptacle final.",
    objective: "Verse les deux listes dans un seul réceptacle.",
    initialCode: `let el1 = ["Terre", "Eau"];\nlet el2 = ["Feu"];\n\n// Fusionnez les deux tableaux\nlet quintessence = [...el1, ...el2];\n\nconsole.log("Éléments assemblés :", quintessence);\nreturn quintessence;`,
    solutionCode: `let el1 = ["Terre", "Eau"];\nlet el2 = ["Feu"];\nlet quintessence = [...el1, ...el2];\n\nconsole.log("Éléments assemblés :", quintessence);\nreturn quintessence;`,
    hint: "Le spread operator [...el1, ...el2] assemble les 3 éléments !",
    rewardXP: 16
  },
  {
    id: 22,
    phase: 6,
    title: "La Pierre Philosophale (Opus Magnum)",
    difficulty: "TRÈS SIMPLE",
    lesson: "Un objet peut porter plusieurs vérités à la fois : un nom, un compteur, un drapeau <code>true</code>.",
    lore: "L'ultime transmutation ! Combinez l'Or, l'Immortalité et le Savoir dans l'artefact suprême.",
    objective: "Signe l'artefact : nom Pierre Philosophale, 22 transmutations, accompli.",
    initialCode: `// L'Artefact Suprême de l'Alchimiste\nconst OpusMagnum = {\n  nom: "Pierre Philosophale",\n  transmutations: 22,\n  accompli: true\n};\n\nconsole.log("✨ LA PIERRE PHILOSOPHALE EST FORGÉE ! ✨", OpusMagnum);\nreturn OpusMagnum;`,
    solutionCode: `const OpusMagnum = {\n  nom: "Pierre Philosophale",\n  transmutations: 22,\n  accompli: true\n};\n\nconsole.log("✨ LA PIERRE PHILOSOPHALE EST FORGÉE ! ✨", OpusMagnum);\nreturn OpusMagnum;`,
    hint: "Clique sur Transmuter pour accomplir le Grand Œuvre !",
    rewardXP: 16
  }
];

// Audio FX
class AudioEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  }
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }
  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }
}

const audio = new AudioEngine();

// État Client
class StateStore {
  constructor() {
    this.key = 'quantum_run_cockpit_state';
    this.data = this.read();
  }
  read() {
    try {
      const s = localStorage.getItem(this.key);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      currentQuestId: 1,
      clearedQuests: [],
      gold: 0,
      streak: 3,
      userCodes: {}
    };
  }
  persist() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }
  isCleared(id) {
    return this.data.clearedQuests.includes(id);
  }
  markCleared(id, xp) {
    if (!this.data.clearedQuests.includes(id)) {
      this.data.clearedQuests.push(id);
      this.data.gold += xp;
      this.persist();
      return true;
    }
    return false;
  }
  saveCode(id, code) {
    this.data.userCodes[id] = code;
    this.persist();
  }
  getCode(id, def) {
    return this.data.userCodes[id] || def;
  }
  getRank() {
    const n = this.data.clearedQuests.length;
    if (n >= 22) return "Grand Maître";
    if (n >= 18) return "Adepte Suprême";
    if (n >= 12) return "Magister";
    if (n >= 7) return "Alchimiste";
    if (n >= 3) return "Initié";
    return "Néophyte";
  }
}

// Cockpit App
class QuantumCockpit {
  constructor() {
    this.store = new StateStore();
    this.phases = DEFAULT_PHASES;
    this.quests = FALLBACK_QUESTS;
    this.activeQuest = this.quests[0];

    this.cacheElements();
    this.attachEvents();
    this.initBackendConnection();
    this.render();
  }

  cacheElements() {
    // Header
    this.serverBadge = document.querySelector('#serverBadge');
    this.serverStatusText = document.querySelector('#serverStatusText');
    this.serverLatency = document.querySelector('#serverLatency');
    this.hudRank = document.querySelector('#hudRank');
    this.hudGold = document.querySelector('#hudGold');
    this.hudProgress = document.querySelector('#hudProgress');
    this.hudStreak = document.querySelector('#hudStreak');

    // Reactor
    this.reactorPhaseNum = document.querySelector('#reactorPhaseNum');
    this.reactorGlyph = document.querySelector('#reactorGlyph');
    this.reactorPhaseTitle = document.querySelector('#reactorPhaseTitle');
    this.reactorPhaseDesc = document.querySelector('#reactorPhaseDesc');
    this.globalPctText = document.querySelector('#globalPctText');
    this.globalGaugeBar = document.querySelector('#globalGaugeBar');

    // Chambers
    this.chambersGrid = document.querySelector('#chambersGrid');
    this.chambersStatusText = document.querySelector('#chambersStatusText');

    // Quest Card
    this.questIdTag = document.querySelector('#questIdTag');
    this.questDifficultyTag = document.querySelector('#questDifficultyTag');
    this.questXpTag = document.querySelector('#questXpTag');
    this.questHeading = document.querySelector('#questHeading');
    this.questLessonText = document.querySelector('#questLessonText');
    this.questLoreText = document.querySelector('#questLoreText');
    this.questObjectiveText = document.querySelector('#questObjectiveText');
    this.prevBtn = document.querySelector('#prevBtn');
    this.nextBtn = document.querySelector('#nextBtn');

    // Boutons de Forge IA
    this.btnForgeAi = document.querySelector('#btnForgeAi');
    this.btnForgeAiGrimoire = document.querySelector('#btnForgeAiGrimoire');

    // IDE
    this.editorLines = document.querySelector('#editorLines');
    this.editorTextarea = document.querySelector('#editorTextarea');
    this.btnReset = document.querySelector('#btnReset');
    this.btnHint = document.querySelector('#btnHint');
    this.btnSolution = document.querySelector('#btnSolution');
    this.btnTransmute = document.querySelector('#btnTransmute');

    // Terminal
    this.terminalStream = document.querySelector('#terminalStream');
    this.consoleExecTime = document.querySelector('#consoleExecTime');
    this.btnClearTerminal = document.querySelector('#btnClearTerminal');

    // Homunculus
    this.homunculusStream = document.querySelector('#homunculusStream');
    this.chatPromptForm = document.querySelector('#chatPromptForm');
    this.chatPromptInput = document.querySelector('#chatPromptInput');

    // Grimoire
    this.grimoireProgressText = document.querySelector('#grimoireProgressText');
    this.grimoireListWrap = document.querySelector('#grimoireListWrap');

    // Modal
    this.celebrationModal = document.querySelector('#celebrationModal');
    this.btnCloseModal = document.querySelector('#btnCloseModal');
    this.finalXpNumber = document.querySelector('#finalXpNumber');
  }

  attachEvents() {
    this.prevBtn.onclick = () => {
      audio.playClick();
      this.selectQuest(this.activeQuest.id - 1);
    };

    this.nextBtn.onclick = () => {
      audio.playClick();
      this.selectQuest(this.activeQuest.id + 1);
    };

    this.btnTransmute.onclick = () => this.executeTransmutation();
    this.btnReset.onclick = () => this.resetCode();
    this.btnHint.onclick = () => this.askHint();
    this.btnSolution.onclick = () => this.revealSolution();
    this.btnClearTerminal.onclick = () => this.clearConsole();

    // Boutons de Forge IA Infinie
    if (this.btnForgeAi) {
      this.btnForgeAi.onclick = () => this.forgeNewAiQuest();
    }
    if (this.btnForgeAiGrimoire) {
      this.btnForgeAiGrimoire.onclick = () => this.forgeNewAiQuest();
    }

    // Raccourcis clavier dans l'IDE
    this.editorTextarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.executeTransmutation();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.editorTextarea.selectionStart;
        const end = this.editorTextarea.selectionEnd;
        this.editorTextarea.value = this.editorTextarea.value.substring(0, start) + "  " + this.editorTextarea.value.substring(end);
        this.editorTextarea.selectionStart = this.editorTextarea.selectionEnd = start + 2;
        this.syncLineNumbers();
      }
    });

    this.editorTextarea.addEventListener('input', () => {
      this.syncLineNumbers();
      this.store.saveCode(this.activeQuest.id, this.editorTextarea.value);
    });

    this.editorTextarea.addEventListener('scroll', () => {
      this.editorLines.scrollTop = this.editorTextarea.scrollTop;
    });

    // Chat
    this.chatPromptForm.onsubmit = (e) => {
      e.preventDefault();
      this.sendChatMessage(this.chatPromptInput.value.trim());
    };

    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        audio.playClick();
        const q = btn.dataset.query;
        if (q === 'indice') this.askHint();
        if (q === 'solution') this.revealSolution();
        if (q === 'backend') this.checkBackendStatusMessage();
      };
    });

    this.btnCloseModal.onclick = () => {
      this.celebrationModal.classList.add('hidden');
    };
  }

  async initBackendConnection() {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const ping = Math.round(performance.now() - t0);
      this.serverStatusText.textContent = "SERVEUR NODE.JS CONNECTÉ";
      this.serverLatency.textContent = `${ping}ms`;

      // Charger les quêtes du serveur
      const qRes = await fetch('/api/quests');
      if (qRes.ok) {
        const payload = await qRes.json();
        if (payload.quests && payload.quests.length) {
          this.quests = payload.quests;
        }
        if (payload.phases) {
          this.phases = payload.phases;
        }
        this.render();
      }
    } catch (e) {
      this.serverStatusText.textContent = "MODE LOCAL AUTONOME";
      this.serverLatency.textContent = "0ms";
    }
  }

  render() {
    const curId = this.store.data.currentQuestId || 1;
    this.activeQuest = this.quests.find(q => q.id === curId) || this.quests[0];

    this.renderHUD();
    this.renderReactor();
    this.renderChambers();
    this.renderGrimoire();
    this.loadActiveQuest(this.activeQuest);
  }

  renderHUD() {
    const cleared = this.store.data.clearedQuests.length;
    const total = this.quests.length;

    this.hudRank.textContent = this.store.getRank();
    this.hudGold.textContent = this.store.data.gold;
    this.hudProgress.textContent = `${cleared} / ${total}`;
    this.hudStreak.textContent = this.store.data.streak;
  }

  renderReactor() {
    const cleared = this.store.data.clearedQuests.length;
    const total = this.quests.length;
    const pct = Math.round((cleared / total) * 100);

    const phase = this.phases.find(p => p.id === this.activeQuest.phase) || this.phases[0];
    this.reactorPhaseNum.textContent = `PHASE ${phase.id} / ${this.phases.length}`;
    this.reactorGlyph.textContent = phase.symbol;
    this.reactorPhaseTitle.textContent = `Phase ${phase.id} : ${phase.name}`;
    this.reactorPhaseDesc.textContent = phase.subtitle;

    this.globalPctText.textContent = `${pct}%`;
    this.globalGaugeBar.style.width = `${pct}%`;
    this.chambersStatusText.textContent = `Chambre ${phase.id} active · ${phase.name}`;
  }

  renderChambers() {
    this.chambersGrid.innerHTML = '';
    this.phases.forEach(phase => {
      const isCurrent = this.activeQuest.phase === phase.id;
      const questsOfPhase = this.quests.filter(q => q.phase === phase.id);
      const clearedOfPhase = questsOfPhase.filter(q => this.store.isCleared(q.id)).length;
      const isCleared = clearedOfPhase === questsOfPhase.length;

      const tile = document.createElement('div');
      tile.className = `chamber-tile ${isCurrent ? 'active' : ''} ${isCleared ? 'cleared' : ''}`;
      tile.innerHTML = `
        <div class="tile-top">
          <span class="tile-symbol">${phase.symbol}</span>
          <span class="tile-num">0${phase.id}</span>
        </div>
        <div class="tile-name">${phase.name}</div>
        <div class="tile-count">${clearedOfPhase} / ${questsOfPhase.length} transmutées</div>
      `;

      tile.onclick = () => {
        audio.playClick();
        if (questsOfPhase[0]) {
          this.selectQuest(questsOfPhase[0].id);
        }
      };

      this.chambersGrid.appendChild(tile);
    });
  }

  renderGrimoire() {
    this.grimoireListWrap.innerHTML = '';
    const cleared = this.store.data.clearedQuests.length;
    this.grimoireProgressText.textContent = `${cleared} / ${this.quests.length} complétées`;

    this.quests.forEach(q => {
      const isCleared = this.store.isCleared(q.id);
      const isActive = q.id === this.activeQuest.id;

      const item = document.createElement('div');
      item.className = `g-item ${isActive ? 'active' : ''} ${isCleared ? 'cleared' : ''}`;
      item.innerHTML = `
        <div class="g-meta-left">
          <span class="g-index">#${String(q.id).padStart(2, '0')}</span>
          <span class="g-name">${q.title}</span>
        </div>
        <span class="g-tick">${isCleared ? '✓' : '○'}</span>
      `;

      item.onclick = () => {
        audio.playClick();
        this.selectQuest(q.id);
      };

      this.grimoireListWrap.appendChild(item);
    });
  }

  loadActiveQuest(quest) {
    this.activeQuest = quest;
    this.store.data.currentQuestId = quest.id;
    this.store.persist();

    this.questIdTag.textContent = `QUÊTE ${String(quest.id).padStart(2, '0')} / ${this.quests.length}`;
    this.questDifficultyTag.textContent = quest.difficulty;
    this.questXpTag.textContent = `+${quest.rewardXP} XP OR`;
    this.questHeading.textContent = quest.title;
    if (this.questLessonText) {
      this.questLessonText.innerHTML = quest.lesson || "En JavaScript, tu changes une valeur, puis tu la rends avec return — c'est ça, une transmutation.";
    }
    this.questLoreText.innerHTML = quest.lore;
    this.questObjectiveText.innerHTML = quest.objective;

    this.prevBtn.disabled = quest.id <= 1;
    this.nextBtn.disabled = quest.id >= this.quests.length;

    const savedCode = this.store.getCode(quest.id, quest.initialCode);
    this.editorTextarea.value = savedCode;
    this.syncLineNumbers();

    this.renderHUD();
    this.renderReactor();
    this.renderChambers();
    this.renderGrimoire();
  }

  selectQuest(id) {
    const target = this.quests.find(q => q.id === id);
    if (target) {
      this.loadActiveQuest(target);
    }
  }

  syncLineNumbers() {
    const count = this.editorTextarea.value.split('\n').length;
    let out = '';
    for (let i = 1; i <= Math.max(count, 5); i++) {
      out += `${i}<br>`;
    }
    this.editorLines.innerHTML = out;
  }

  resetCode() {
    audio.playClick();
    this.editorTextarea.value = this.activeQuest.initialCode;
    this.store.saveCode(this.activeQuest.id, this.activeQuest.initialCode);
    this.syncLineNumbers();
    this.writeTerminalLine('line-sys', '↺ Creuset réinitialisé avec la formule originelle.');
  }

  revealSolution() {
    audio.playClick();
    this.editorTextarea.value = this.activeQuest.solutionCode;
    this.store.saveCode(this.activeQuest.id, this.activeQuest.solutionCode);
    this.syncLineNumbers();
    this.writeTerminalLine('line-sys', '🔑 Solution insérée. Cliquez sur TRANSMUTER pour valider.');
    this.sayHomunculus('J\'ai inséré la formule exacte dans le creuset. Clique sur <strong>Transmuter</strong> !');
  }

  askHint() {
    audio.playClick();
    this.sayHomunculus(`💡 <strong>Indice :</strong> ${this.activeQuest.hint}`);
  }

  checkBackendStatusMessage() {
    this.sayHomunculus(`📡 <strong>Serveur Node.js actif :</strong> Écoute sur le port <code>${window.location.port || 80}</code>, prêt pour le déploiement gratuit sur Render via <code>render.yaml</code> !`);
  }

  async executeTransmutation() {
    const code = this.editorTextarea.value;
    this.consoleExecTime.textContent = "Exécution...";
    this.writeTerminalLine('line-sys', `⚡ Envoi au serveur pour transmutation...`);

    try {
      // Appel API backend
      const res = await fetch('/api/transmute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: this.activeQuest.id,
          code: code
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      this.consoleExecTime.textContent = `${data.executionTimeMs || 10}ms`;

      // Afficher les logs
      if (data.logs && data.logs.length) {
        data.logs.forEach(l => this.writeTerminalLine('line-log', `[LOG] ${l}`));
      }

      if (data.success) {
        audio.playSuccess();
        this.writeTerminalLine('line-ok', data.message);
        this.store.markCleared(this.activeQuest.id, data.rewardXP || this.activeQuest.rewardXP);
        this.render();

        this.sayHomunculus(`✨ <strong>Transmutation réussie !</strong> Le creuset s'illumine.`);

        // L'HISTOIRE CONTINUE AUTOMATIQUEMENT VIA GMI
        this.autoAdvanceSaga();
      } else {
        audio.playError();
        this.writeTerminalLine('line-fail', data.message || "La formule a échoué.");
        this.sayHomunculus(`⚠️ ${this.activeQuest.hint}`);
      }

    } catch (e) {
      // Fallback local en cas de déconnexion
      this.executeLocalFallback(code);
    }
  }

  async autoAdvanceSaga() {
    const sagaLabel = document.querySelector('#sagaAutoLabel');
    if (sagaLabel) {
      sagaLabel.textContent = "Incantation du Chapitre Suivant (GMI)... ✨";
    }
    this.writeTerminalLine('line-sys', `📖 L'histoire continue : l'Athanor et Gemini (GMI) forgent le prochain chapitre...`);

    try {
      const res = await fetch('/api/quests/generate-saga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousQuestId: this.activeQuest.id,
          phase: this.activeQuest.phase
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.quest) {
          if (!this.quests.some(q => q.id === data.quest.id)) {
            this.quests.push(data.quest);
          }
          this.renderChambers();
          this.renderGrimoire();

          this.writeTerminalLine('line-ok', `Nouveau cas prêt dans le grimoire : #${data.quest.id} "${data.quest.title}" — on ne t'interrompt pas.`);
          this.sayHomunculus(`Nouveau cas métier prêt : <em>${data.quest.title}</em>. Ouvre-le quand tu veux, on reste sur l'exercice en cours.`);
          return;
        }
      }
    } catch (err) {
      console.warn("Auto-advance saga error:", err);
    } finally {
      if (sagaLabel) {
        sagaLabel.textContent = "Saga Continue Active (GMI)";
      }
    }

    // Fallback si pas de réponse réseau
    if (this.activeQuest.id < this.quests.length) {
      setTimeout(() => this.selectQuest(this.activeQuest.id + 1), 900);
    }
  }

  executeLocalFallback(code) {
    const t0 = performance.now();
    const captured = [];
    const orig = console.log;
    console.log = (...a) => captured.push(a.join(' '));

    try {
      const runner = new Function(code);
      const res = runner();
      console.log = orig;
      const ms = Math.round(performance.now() - t0);
      this.consoleExecTime.textContent = `${ms}ms (local)`;

      captured.forEach(l => this.writeTerminalLine('line-log', `[LOG] ${l}`));

      audio.playSuccess();
      this.writeTerminalLine('line-ok', `✨ Transmutation locale validée ! (+${this.activeQuest.rewardXP} XP)`);
      this.store.markCleared(this.activeQuest.id, this.activeQuest.rewardXP);
      this.render();

      if (this.store.data.clearedQuests.length === this.quests.length) {
        setTimeout(() => this.showVictory(), 500);
      } else if (this.activeQuest.id < this.quests.length) {
        setTimeout(() => this.selectQuest(this.activeQuest.id + 1), 1200);
      }
    } catch (err) {
      console.log = orig;
      audio.playError();
      this.writeTerminalLine('line-fail', `❌ Erreur : ${err.message}`);
    }
  }

  writeTerminalLine(type, text) {
    const line = document.createElement('div');
    line.className = `stream-line ${type}`;
    line.innerHTML = `<span class="stream-prefix">⚗️</span> <span class="stream-text">${text}</span>`;
    this.terminalStream.appendChild(line);
    this.terminalStream.scrollTop = this.terminalStream.scrollHeight;
  }

  clearConsole() {
    this.terminalStream.innerHTML = '';
    this.writeTerminalLine('line-sys', 'Console effacée.');
  }

  sayHomunculus(html) {
    const bubble = document.createElement('div');
    bubble.className = 'dialogue-bubble bot';
    bubble.innerHTML = html;
    this.homunculusStream.appendChild(bubble);
    this.homunculusStream.scrollTop = this.homunculusStream.scrollHeight;
  }

  sayUser(text) {
    const bubble = document.createElement('div');
    bubble.className = 'dialogue-bubble user';
    bubble.textContent = text;
    this.homunculusStream.appendChild(bubble);
    this.homunculusStream.scrollTop = this.homunculusStream.scrollHeight;
  }

  async sendChatMessage(msg) {
    if (!msg) return;
    this.sayUser(msg);
    this.chatPromptInput.value = '';

    try {
      const res = await fetch('/api/orbit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, questId: this.activeQuest.id })
      });
      if (res.ok) {
        const data = await res.json();
        this.sayHomunculus(data.reply);
        return;
      }
    } catch (e) {}

    // Fallback dialogue
    setTimeout(() => {
      this.sayHomunculus(`Apprenti, pour <em>${this.activeQuest.title}</em> : ${this.activeQuest.hint}`);
    }, 200);
  }

  async forgeNewAiQuest() {
    audio.playClick();
    if (this.btnForgeAi) {
      this.btnForgeAi.classList.add('generating');
      this.btnForgeAi.querySelector('span:last-child').textContent = "FORGE EN COURS...";
    }
    this.writeTerminalLine('line-sys', '🌌 Incantation en cours : Forger une quête alchimique infinie via LLM...');

    try {
      const res = await fetch('/api/quests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: this.activeQuest.phase })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.success && data.quest) {
        audio.playSuccess();
        // Ajouter la quête générée au registre
        this.quests.push(data.quest);
        this.renderChambers();
        this.renderGrimoire();
        this.selectQuest(data.quest.id);

        this.writeTerminalLine('line-ok', `✨ Quête #${data.quest.id} forgée avec succès (${data.source || 'IA / Athanor'}) !`);
        this.sayHomunculus(`🌌 <strong>Quête #${data.quest.id} Forgée !</strong> J'ai créé une épreuve unique : <em>${data.quest.title}</em>.`);
      } else {
        throw new Error("Réponse de forge invalide");
      }
    } catch (e) {
      audio.playError();
      this.writeTerminalLine('line-fail', `❌ Échec de la forge : ${e.message}`);
      this.sayHomunculus(`⚠️ Le souffle de l'Athanor a vacillé. Réessaie dans un instant !`);
    } finally {
      if (this.btnForgeAi) {
        this.btnForgeAi.classList.remove('generating');
        this.btnForgeAi.querySelector('span:last-child').textContent = "FORGER QUÊTE (IA)";
      }
    }
  }

  showVictory() {
    audio.playSuccess();
    this.finalXpNumber.textContent = this.store.data.gold;
    this.celebrationModal.classList.remove('hidden');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  window.cockpit = new QuantumCockpit();
});
