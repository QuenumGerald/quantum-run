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
// BASE DE DONNÃ‰ES DES QUÃŠTES ALCHIMIQUES CÃ”TÃ‰ SERVEUR
// ==========================================================================
const PHASES = [
  { id: 1, name: "Calcination", symbol: "ðŸœ�", subtitle: "Purification des types primitifs", questsRange: [1, 4] },
  { id: 2, name: "Distillation", symbol: "ðŸœ”", subtitle: "Calculs & pesÃ©es du fourneau", questsRange: [5, 7] },
  { id: 3, name: "Formules", symbol: "ðŸœ›", subtitle: "Incantations & fonctions magiques", questsRange: [8, 10] },
  { id: 4, name: "Les Fioles", symbol: "ðŸœ�", subtitle: "AgrÃ©gats, tableaux & rÃ©actifs", questsRange: [11, 15] },
  { id: 5, name: "Rituels", symbol: "ðŸœƒ", subtitle: "Purifications, filtres & logiques", questsRange: [16, 19] },
  { id: 6, name: "Grand Å’uvre", symbol: "ðŸ�¤", subtitle: "La Pierre Philosophale", questsRange: [20, 22] }
];

const QUESTS = [
  {
    id: 1,
    phase: 1,
    title: "La Transmutation du Plomb",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Le vil mÃ©tal attend dans le creuset. Pour initier le Grand Å’uvre, transmutez la matiÃ¨re vile <code>\"lead\"</code> en mÃ©tal prÃ©cieux <code>\"gold\"</code>.",
    objective: "Changez la valeur de la variable <code>metal</code> pour <code>\"gold\"</code>.",
    initialCode: `// Transmutez le plomb en or\nlet metal = "lead";\n\nconsole.log("MÃ©tal dans le creuset :", metal);\nreturn metal;`,
    solutionCode: `let metal = "gold";\n\nconsole.log("MÃ©tal dans le creuset :", metal);\nreturn metal;`,
    hint: "Remplace simplement \"lead\" par \"gold\" Ã  la ligne 2 !",
    rewardXP: 16,
    check: (res, ctx) => res === "gold" || ctx.metal === "gold"
  },
  {
    id: 2,
    phase: 1,
    title: "L'Ã‚ge de l'InitiÃ©",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Tout alchimiste doit dÃ©clarer ses annÃ©es d'apprentissage pour calibrer l'Athanor.",
    objective: "DÃ©clarez une variable <code>age</code> Ã©gale au nombre <code>20</code>.",
    initialCode: `// DÃ©clarez la variable age avec le nombre 20\nlet age = 0;\n\nconsole.log("Ã‚ge de l'alchimiste :", age);\nreturn age;`,
    solutionCode: `let age = 20;\n\nconsole.log("Ã‚ge de l'alchimiste :", age);\nreturn age;`,
    hint: "Remplace 0 par 20 dans let age = 20;",
    rewardXP: 16,
    check: (res, ctx) => res === 20 || ctx.age === 20
  },
  {
    id: 3,
    phase: 1,
    title: "L'Ã‰lixir d'ImmortalitÃ©",
    difficulty: "TRÃˆS SIMPLE",
    lore: "La fiole rouge confÃ¨re l'immortalitÃ©. Activez le sceau de vÃ©ritÃ© boolÃ©en.",
    objective: "Mettez la variable <code>isImmortal</code> Ã  <code>true</code>.",
    initialCode: `// Activez l'Ã©lixir avec la valeur boolÃ©enne true\nlet isImmortal = false;\n\nconsole.log("ImmortalitÃ© active :", isImmortal);\nreturn isImmortal;`,
    solutionCode: `let isImmortal = true;\n\nconsole.log("ImmortalitÃ© active :", isImmortal);\nreturn isImmortal;`,
    hint: "Change false en true !",
    rewardXP: 16,
    check: (res, ctx) => res === true || ctx.isImmortal === true
  },
  {
    id: 4,
    phase: 1,
    title: "L'Eau de Vie (Aqua Vitae)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Fusionnez les deux vapeurs sacrÃ©es pour obtenir la potion complÃ¨te <code>\"Aqua Vitae\"</code>.",
    objective: "ConcatÃ©nez les deux mots pour que <code>potion</code> vaille <code>\"Aqua Vitae\"</code>.",
    initialCode: `let mot1 = "Aqua";\nlet mot2 = "Vitae";\n\n// ConcatÃ©nez les deux mots avec un espace\nlet potion = mot1 + " " + mot2;\n\nconsole.log("Potion crÃ©Ã©e :", potion);\nreturn potion;`,
    solutionCode: `let mot1 = "Aqua";\nlet mot2 = "Vitae";\nlet potion = mot1 + " " + mot2;\n\nconsole.log("Potion crÃ©Ã©e :", potion);\nreturn potion;`,
    hint: "Le code est dÃ©jÃ  prÃªt ! Il suffit de cliquer sur Transmuter !",
    rewardXP: 16,
    check: (res, ctx) => res === "Aqua Vitae" || ctx.potion === "Aqua Vitae"
  },
  {
    id: 5,
    phase: 2,
    title: "La PesÃ©e du Soufre et du Sel",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Pour stabiliser la rÃ©action, additionnez les 10 grammes de soufre et les 5 grammes de sel.",
    objective: "Faites la somme de <code>soufre</code> et <code>sel</code> dans la variable <code>total</code>.",
    initialCode: `let soufre = 10;\nlet sel = 5;\n\n// Calculez la somme des deux poudres\nlet total = soufre + sel;\n\nconsole.log("Masse totale :", total, "grammes");\nreturn total;`,
    solutionCode: `let soufre = 10;\nlet sel = 5;\nlet total = soufre + sel;\n\nconsole.log("Masse totale :", total, "grammes");\nreturn total;`,
    hint: "L'addition soufre + sel donne 15. Lance la transmutation !",
    rewardXP: 16,
    check: (res, ctx) => res === 15 || ctx.total === 15
  },
  {
    id: 6,
    phase: 2,
    title: "La Flamme de l'Athanor",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Le fourneau est tiÃ¨de. Doublez la tempÃ©rature actuelle pour lancer l'Ã©bullition.",
    objective: "Multipliez <code>temperature</code> par <code>2</code>.",
    initialCode: `let temperature = 50;\n\n// Doublez la tempÃ©rature (temperature * 2)\nlet temperatureFinale = temperature * 2;\n\nconsole.log("TempÃ©rature de l'Athanor :", temperatureFinale, "Â°C");\nreturn temperatureFinale;`,
    solutionCode: `let temperature = 50;\nlet temperatureFinale = temperature * 2;\n\nconsole.log("TempÃ©rature de l'Athanor :", temperatureFinale, "Â°C");\nreturn temperatureFinale;`,
    hint: "50 * 2 = 100Â°C. La formule est prÃªte !",
    rewardXP: 16,
    check: (res, ctx) => res === 100 || ctx.temperatureFinale === 100
  },
  {
    id: 7,
    phase: 2,
    title: "Le Reste SacrÃ© (Modulo)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "L'opÃ©rateur modulo <code>%</code> donne le reste d'une division. Trouvez le reste de <code>10 % 3</code>.",
    objective: "Calculez <code>10 % 3</code> dans la variable <code>reste</code> (doit valoir 1).",
    initialCode: `// Calculez 10 % 3\nlet reste = 10 % 3;\n\nconsole.log("Goutte restante :", reste);\nreturn reste;`,
    solutionCode: `let reste = 10 % 3;\n\nconsole.log("Goutte restante :", reste);\nreturn reste;`,
    hint: "10 divisÃ© par 3 fait 3 avec un reste de 1 !",
    rewardXP: 16,
    check: (res, ctx) => res === 1 || ctx.reste === 1
  },
  {
    id: 8,
    phase: 3,
    title: "L'Incantation d'Ã‰veil",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Les alchimistes rÃ©veillent le laboratoire en prononÃ§ant le cri rituel : <code>\"Eureka!\"</code>.",
    objective: "ComplÃ©tez la fonction pour qu'elle retourne <code>\"Eureka!\"</code>.",
    initialCode: `function incantation() {\n  // Retournez "Eureka!"\n  return "Eureka!";\n}\n\nlet cri = incantation();\nconsole.log("Parole magique :", cri);\nreturn cri;`,
    solutionCode: `function incantation() {\n  return "Eureka!";\n}\n\nlet cri = incantation();\nconsole.log("Parole magique :", cri);\nreturn cri;`,
    hint: "La fonction retourne dÃ©jÃ  \"Eureka!\". Transmute !",
    rewardXP: 16,
    check: (res, ctx) => res === "Eureka!" || (typeof ctx.incantation === 'function' && ctx.incantation() === "Eureka!")
  },
  {
    id: 9,
    phase: 3,
    title: "Le Multiplicateur d'Essence",
    difficulty: "TRÃˆS SIMPLE",
    lore: "CrÃ©ez un sortilÃ¨ge capable de doubler n'importe quelle dose de poudre magique.",
    objective: "ComplÃ©tez la fonction <code>doubler(x)</code> pour qu'elle retourne <code>x * 2</code>.",
    initialCode: `function doubler(x) {\n  // Retournez le double de x\n  return x * 2;\n}\n\nlet resultat = doubler(21);\nconsole.log("Dose doublÃ©e :", resultat);\nreturn resultat;`,
    solutionCode: `function doubler(x) {\n  return x * 2;\n}\n\nlet resultat = doubler(21);\nconsole.log("Dose doublÃ©e :", resultat);\nreturn resultat;`,
    hint: "doubler(21) donne 42. Clique sur Transmuter !",
    rewardXP: 16,
    check: (res, ctx) => res === 42 || (typeof ctx.doubler === 'function' && ctx.doubler(5) === 10)
  },
  {
    id: 10,
    phase: 3,
    title: "L'Alliance des Deux Ã‰lÃ©ments",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Une fonction alchimique prend deux rÃ©actifs en paramÃ¨tres et les fusionne par addition.",
    objective: "Ã‰crivez une fonction <code>fusionner(a, b)</code> qui retourne <code>a + b</code>.",
    initialCode: `function fusionner(a, b) {\n  // Retournez a + b\n  return a + b;\n}\n\nlet alliage = fusionner(30, 70);\nconsole.log("Alliage obtenu :", alliage);\nreturn alliage;`,
    solutionCode: `function fusionner(a, b) {\n  return a + b;\n}\n\nlet alliage = fusionner(30, 70);\nconsole.log("Alliage obtenu :", alliage);\nreturn alliage;`,
    hint: "30 + 70 = 100. Transmute le code pour valider !",
    rewardXP: 16,
    check: (res, ctx) => res === 100 || (typeof ctx.fusionner === 'function' && ctx.fusionner(2, 3) === 5)
  },
  {
    id: 11,
    phase: 4,
    title: "L'Inventaire du Laboratoire",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Les rÃ©actifs sont stockÃ©s dans une fiole collective (un tableau). Ajoutez le rÃ©actif <code>\"sel\"</code>.",
    objective: "Ajoutez <code>\"sel\"</code> au tableau <code>reactifs</code>.",
    initialCode: `let reactifs = ["mercure", "soufre"];\n\n// Ajoutez "sel" au tableau (avec .push("sel"))\nreactifs.push("sel");\n\nconsole.log("Inventaire :", reactifs);\nreturn reactifs;`,
    solutionCode: `let reactifs = ["mercure", "soufre"];\nreactifs.push("sel");\n\nconsole.log("Inventaire :", reactifs);\nreturn reactifs;`,
    hint: "La mÃ©thode .push(\"sel\") ajoute l'Ã©lÃ©ment Ã  la fin !",
    rewardXP: 16,
    check: (res, ctx) => Array.isArray(res) && res.includes("sel") && res.length === 3
  },
  {
    id: 12,
    phase: 4,
    title: "L'Essence Primaire (Premier Index)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "En JavaScript, le premier Ã©lÃ©ment d'une liste se trouve Ã  l'index <code>0</code>.",
    objective: "Extrayez le premier Ã©lÃ©ment du tableau dans <code>premier</code>.",
    initialCode: `let mÃ©taux = ["argent", "cuivre", "fer"];\n\n// RÃ©cupÃ©rez le premier Ã©lÃ©ment avec mÃ©taux[0]\nlet premier = mÃ©taux[0];\n\nconsole.log("Premier mÃ©tal :", premier);\nreturn premier;`,
    solutionCode: `let mÃ©taux = ["argent", "cuivre", "fer"];\nlet premier = mÃ©taux[0];\n\nconsole.log("Premier mÃ©tal :", premier);\nreturn premier;`,
    hint: "mÃ©taux[0] rÃ©cupÃ¨re \"argent\" !",
    rewardXP: 16,
    check: (res, ctx) => res === "argent" || ctx.premier === "argent"
  },
  {
    id: 13,
    phase: 4,
    title: "Le Compte des Flacons",
    difficulty: "TRÃˆS SIMPLE",
    lore: "La propriÃ©tÃ© <code>.length</code> permet de connaÃ®tre le nombre d'Ã©lÃ©ments dans un tableau.",
    objective: "Mesurez la taille du tableau avec <code>flacons.length</code>.",
    initialCode: `let flacons = ["rubis", "saphir", "Ã©meraude", "topaze"];\n\n// Obtenez la taille avec flacons.length\nlet totalFlacons = flacons.length;\n\nconsole.log("Nombre de flacons :", totalFlacons);\nreturn totalFlacons;`,
    solutionCode: `let flacons = ["rubis", "saphir", "Ã©meraude", "topaze"];\nlet totalFlacons = flacons.length;\n\nconsole.log("Nombre de flacons :", totalFlacons);\nreturn totalFlacons;`,
    hint: "Le tableau contient 4 Ã©lÃ©ments !",
    rewardXP: 16,
    check: (res, ctx) => res === 4 || ctx.totalFlacons === 4
  },
  {
    id: 14,
    phase: 4,
    title: "La Fiole Philosophale (Objet)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Un objet structure les propriÃ©tÃ©s d'un artefact alchimique magique.",
    objective: "CrÃ©ez un objet <code>elixir</code> avec <code>puissance: 100</code>.",
    initialCode: `let elixir = {\n  nom: "Potion d'Or",\n  puissance: 100\n};\n\nconsole.log("Ã‰lixir crÃ©Ã© :", elixir.nom, "- Puissance :", elixir.puissance);\nreturn elixir;`,
    solutionCode: `let elixir = {\n  nom: "Potion d'Or",\n  puissance: 100\n};\n\nconsole.log("Ã‰lixir crÃ©Ã© :", elixir.nom, "- Puissance :", elixir.puissance);\nreturn elixir;`,
    hint: "L'objet possÃ¨de bien la propriÃ©tÃ© puissance = 100. Transmute !",
    rewardXP: 16,
    check: (res, ctx) => typeof res === 'object' && res.puissance === 100
  },
  {
    id: 15,
    phase: 4,
    title: "Le Sceau de l'Auteur",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Modifiez la propriÃ©tÃ© d'un objet existant pour signer le grimoire.",
    objective: "DÃ©finissez la propriÃ©tÃ© <code>grimoire.auteur = \"HermÃ¨s\"</code>.",
    initialCode: `let grimoire = {\n  titre: "La Table d'Ã‰meraude",\n  auteur: "Inconnu"\n};\n\n// Remplacez \"Inconnu\" par \"HermÃ¨s\"\ngrimoire.auteur = "HermÃ¨s";\n\nconsole.log("Auteur du grimoire :", grimoire.auteur);\nreturn grimoire;`,
    solutionCode: `let grimoire = {\n  titre: "La Table d'Ã‰meraude",\n  auteur: "HermÃ¨s"\n};\n\nconsole.log("Auteur du grimoire :", grimoire.auteur);\nreturn grimoire;`,
    hint: "grimoire.auteur vaut maintenant \"HermÃ¨s\" !",
    rewardXP: 16,
    check: (res, ctx) => typeof res === 'object' && res.auteur === "HermÃ¨s"
  },
  {
    id: 16,
    phase: 5,
    title: "La Parole Majuscule",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Pour que le sortilÃ¨ge rÃ©sonne, convertissez la formule en lettres majuscules avec <code>.toUpperCase()</code>.",
    objective: "Appliquez <code>.toUpperCase()</code> sur la variable <code>mot</code>.",
    initialCode: `let mot = "transmutation";\n\n// Transformez le mot en MAJUSCULES\nlet paroleMagique = mot.toUpperCase();\n\nconsole.log("Incantation :", paroleMagique);\nreturn paroleMagique;`,
    solutionCode: `let mot = "transmutation";\nlet paroleMagique = mot.toUpperCase();\n\nconsole.log("Incantation :", paroleMagique);\nreturn paroleMagique;`,
    hint: "\"transmutation\".toUpperCase() donne \"TRANSMUTATION\" !",
    rewardXP: 16,
    check: (res, ctx) => res === "TRANSMUTATION" || ctx.paroleMagique === "TRANSMUTATION"
  },
  {
    id: 17,
    phase: 5,
    title: "La Multiplication des PÃ©pites (.map)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "La méthode <code>.map()</code> transforme chaque élément d'un tableau.",
    objective: "Doublez la valeur de chaque pépite <code>[10, 20, 30]</code> pour obtenir <code>[20, 40, 60]</code>.",
    initialCode: `let pepites = [10, 20, 30];\n\n// Doublez chaque pépite avec .map(p => p * 2)\nlet enrichies = [];\n\nconsole.log("Pépites doublées :", enrichies);\nreturn enrichies;`,
    solutionCode: `let pepites = [10, 20, 30];\nlet enrichies = pepites.map(p => p * 2);\n\nconsole.log("PÃ©pites doublÃ©es :", enrichies);\nreturn enrichies;`,
    hint: "Ã‰cris pepites.map(p => p * 2) pour enrichies !",
    rewardXP: 16,
    check: (res, ctx) => Array.isArray(res) && res[0] === 20 && res[1] === 40 && res[2] === 60
  },
  {
    id: 18,
    phase: 5,
    title: "Le Filtrage des ImpuretÃ©s (.filter)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "La mÃ©thode <code>.filter()</code> ne conserve que les Ã©lÃ©ments respectant une condition.",
    objective: "Ne gardez que les mÃ©taux dont la puretÃ© est supÃ©rieure ou Ã©gale Ã  50 (<code>p >= 50</code>).",
    initialCode: `let puretes = [20, 80, 15, 95, 40, 60];\n\n// Filtrez pour garder >= 50\nlet nobles = [];\n\nconsole.log("MÃ©taux purs conservÃ©s :", nobles);\nreturn nobles;`,
    solutionCode: `let puretes = [20, 80, 15, 95, 40, 60];\nlet nobles = puretes.filter(p => p >= 50);\n\nconsole.log("MÃ©taux purs conservÃ©s :", nobles);\nreturn nobles;`,
    hint: "Ã‰cris puretes.filter(p => p >= 50) !",
    rewardXP: 16,
    check: (res, ctx) => Array.isArray(res) && res.length === 3 && res.every(x => x >= 50)
  },
  {
    id: 19,
    phase: 5,
    title: "Le Sceau de PuretÃ© Absolue",
    difficulty: "TRÃˆS SIMPLE",
    lore: "VÃ©rifiez si l'Ã©lixir a atteint une puretÃ© parfaite de <code>100</code> Ã  l'aide d'une condition <code>if</code>.",
    objective: "Si <code>purete === 100</code>, retournez <code>\"Parfait\"</code>.",
    initialCode: `let purete = 100;\n\nfunction verifier(valeur) {\n  // Ã‰crivez la condition if (valeur === 100)\n  return "Impur";\n}\n\nlet verdict = verifier(purete);\nconsole.log("Verdict :", verdict);\nreturn verdict;`,
    solutionCode: `let purete = 100;\n\nfunction verifier(valeur) {\n  if (valeur === 100) {\n    return "Parfait";\n  }\n  return "Impur";\n}\n\nlet verdict = verifier(purete);\nconsole.log("Verdict :", verdict);\nreturn verdict;`,
    hint: "Si valeur === 100 renvoie \"Parfait\" !",
    rewardXP: 16,
    check: (res, ctx) => res === "Parfait"
  },
  {
    id: 20,
    phase: 6,
    title: "La Fusion Thermique",
    difficulty: "TRÃˆS SIMPLE",
    lore: "L'Athanor atteint son paroxysme. Si la tempÃ©rature est supÃ©rieure Ã  500, la fusion s'enclenche.",
    objective: "Ã‰crivez une condition qui retourne <code>\"Fusion!\"</code> si <code>degres >= 500</code>.",
    initialCode: `let degres = 600;\n\n// DÃ©terminez l'Ã©tat ("Fusion!" si degres >= 500)\nlet etat = "";\n\nconsole.log("Ã‰tat de l'Athanor :", etat);\nreturn etat;`,
    solutionCode: `let degres = 600;\nlet etat = degres >= 500 ? "Fusion!" : "En attente";\n\nconsole.log("Ã‰tat de l'Athanor :", etat);\nreturn etat;`,
    hint: "Utilise degres >= 500 ? \"Fusion!\" : \"En attente\"",
    rewardXP: 16,
    check: (res, ctx) => res === "Fusion!"
  },
  {
    id: 21,
    phase: 6,
    title: "La Quintessence des Ã‰lÃ©ments",
    difficulty: "TRÃˆS SIMPLE",
    lore: "Rassemblez les 3 Ã©lÃ©ments primordiaux (Terre, Eau, Feu) dans un rÃ©ceptacle final.",
    objective: "Fusionnez les Ã©lÃ©ments avec <code>[...el1, ...el2]</code>.",
    initialCode: `let el1 = ["Terre", "Eau"];\nlet el2 = ["Feu"];\n\n// Fusionnez les deux tableaux avec [...el1, ...el2]\nlet quintessence = [];\n\nconsole.log("Ã‰lÃ©ments assemblÃ©s :", quintessence);\nreturn quintessence;`,
    solutionCode: `let el1 = ["Terre", "Eau"];\nlet el2 = ["Feu"];\nlet quintessence = [...el1, ...el2];\n\nconsole.log("Ã‰lÃ©ments assemblÃ©s :", quintessence);\nreturn quintessence;`,
    hint: "Le spread operator [...el1, ...el2] assemble les 3 Ã©lÃ©ments !",
    rewardXP: 16,
    check: (res, ctx) => Array.isArray(res) && res.length === 3 && res.includes("Feu")
  },
  {
    id: 22,
    phase: 6,
    title: "La Pierre Philosophale (Opus Magnum)",
    difficulty: "TRÃˆS SIMPLE",
    lore: "L'ultime transmutation ! Combinez l'Or, l'ImmortalitÃ© et le Savoir dans l'artefact suprÃªme.",
    objective: "ComplÃ©tez l'objet <code>{ nom: \"Pierre Philosophale\", transmutations: 22, accompli: true }</code>.",
    initialCode: `// L'Artefact SuprÃªme de l'Alchimiste\nconst OpusMagnum = {\n  nom: "",\n  transmutations: 0,\n  accompli: false\n};\n\nconsole.log("âœ¨ LA PIERRE PHILOSOPHALE EST FORGÃ‰E ! âœ¨", OpusMagnum);\nreturn OpusMagnum;`,
    solutionCode: `const OpusMagnum = {\n  nom: "Pierre Philosophale",\n  transmutations: 22,\n  accompli: true\n};\n\nconsole.log("âœ¨ LA PIERRE PHILOSOPHALE EST FORGÃ‰E ! âœ¨", OpusMagnum);\nreturn OpusMagnum;`,
    hint: "Mets nom: \"Pierre Philosophale\", transmutations: 22, accompli: true !",
    rewardXP: 16,
    check: (res, ctx) => typeof res === 'object' && res.nom === "Pierre Philosophale" && res.accompli === true
  }
];

// ==========================================================================
// REGISTRE DES QUÃŠTES (STATIQUES + GÃ‰NÃ‰RÃ‰ES DYNAMIQUEMENT PAR L'IA)
// ==========================================================================
const generatedQuests = new Map();

// Helper de gÃ©nÃ©ration procÃ©durale d'Alchimie NumÃ©rique
function generateProceduralQuest(customPhase) {
  const questId = QUESTS.length + generatedQuests.size + 1;
  const phaseNum = customPhase || (Math.floor(Math.random() * 6) + 1);
  const phase = PHASES.find(p => p.id === phaseNum) || PHASES[0];

  const templates = [
    // Template 1: MÃ©taux & Nombres
    {
      phase: 1,
      metal: ["mercure", "argent", "cuivre", "platine", "mithril"][Math.floor(Math.random() * 5)],
      val: Math.floor(Math.random() * 80) + 20,
      make: (m, v) => ({
        title: `La Fixation du ${m.charAt(0).toUpperCase() + m.slice(1)}`,
        lore: `L'essence volatile de <code>"${m}"</code> doit Ãªtre dosÃ©e Ã  exactement <code>${v}</code> unitÃ©s pour stabiliser l'Ã©lixir.`,
        objective: `DÃ©clarez la variable <code>quantite</code> Ã©gale Ã  <code>${v}</code>.`,
        initialCode: `// Fixez la quantitÃ© de ${m}\nlet quantite = 0;\n\nconsole.log("${m} fixÃ© :", quantite);\nreturn quantite;`,
        solutionCode: `let quantite = ${v};\n\nconsole.log("${m} fixÃ© :", quantite);\nreturn quantite;`,
        hint: `Change 0 par ${v} dans let quantite = ${v};`,
        check: (res, ctx) => res === v || ctx.quantite === v
      })
    },
    // Template 2: Fusion de rÃ©actifs (Somme)
    {
      phase: 2,
      a: Math.floor(Math.random() * 50) + 10,
      b: Math.floor(Math.random() * 50) + 10,
      substance: ["Cristal de Sel", "Poudre d'Ambre", "Vapeur de Mercure", "Ã‰clat d'Or"][Math.floor(Math.random() * 4)],
      make: (a, b, s) => ({
        title: `L'Harmonie du ${s}`,
        lore: `Combinez <code>${a}</code> grains et <code>${b}</code> grains de ${s} pour atteindre la masse d'activation.`,
        objective: `Calculez la somme <code>${a} + ${b}</code> dans la variable <code>masse</code> (doit valoir ${a + b}).`,
        initialCode: `let dose1 = ${a};\nlet dose2 = ${b};\n\n// Faites la somme des deux doses\nlet masse = dose1 + dose2;\n\nconsole.log("Masse totale :", masse);\nreturn masse;`,
        solutionCode: `let dose1 = ${a};\nlet dose2 = ${b};\nlet masse = dose1 + dose2;\n\nconsole.log("Masse totale :", masse);\nreturn masse;`,
        hint: `Additionne simplement ${a} et ${b} ! La somme donne ${a + b}.`,
        check: (res, ctx) => res === (a + b) || ctx.masse === (a + b)
      })
    },
    // Template 3: Incantation (Fonction)
    {
      phase: 3,
      multiplier: [3, 4, 5][Math.floor(Math.random() * 3)],
      make: (m) => ({
        title: `L'Incantation de Multiplication x${m}`,
        lore: `Forgez une fonction magique capable de multiplier n'importe quelle dose par <code>${m}</code>.`,
        objective: `CrÃ©ez une fonction <code>amplifier(x)</code> qui retourne <code>x * ${m}</code>.`,
        initialCode: `function amplifier(x) {\n  // Retournez x * ${m}\n  return x * ${m};\n}\n\nlet test = amplifier(10);\nconsole.log("Dose amplifiÃ©e :", test);\nreturn test;`,
        solutionCode: `function amplifier(x) {\n  return x * ${m};\n}\n\nlet test = amplifier(10);\nconsole.log("Dose amplifiÃ©e :", test);\nreturn test;`,
        hint: `Retourne x * ${m} Ã  l'intÃ©rieur de la fonction !`,
        check: (res, ctx) => res === (10 * m) || (typeof ctx.amplifier === 'function' && ctx.amplifier(2) === (2 * m))
      })
    },
    // Template 4: Fiole & Collections
    {
      phase: 4,
      el: ["Rubis", "Saphir", "Diamant", "Opale", "Obsidienne"][Math.floor(Math.random() * 5)],
      make: (el) => ({
        title: `L'Extraction du ${el}`,
        lore: `Une prÃ©cieuse pierre de <code>"${el}"</code> doit Ãªtre ajoutÃ©e au coffre d'ingrÃ©dients.`,
        objective: `Ajoutez <code>"${el}"</code> au tableau <code>gemmes</code> avec <code>.push("${el}")</code>.`,
        initialCode: `let gemmes = ["Quartz", "AmÃ©thyste"];\n\n// Ajoutez "${el}" Ã  la fin\ngemmes.push("${el}");\n\nconsole.log("Coffre de gemmes :", gemmes);\nreturn gemmes;`,
        solutionCode: `let gemmes = ["Quartz", "AmÃ©thyste"];\ngemmes.push("${el}");\n\nconsole.log("Coffre de gemmes :", gemmes);\nreturn gemmes;`,
        hint: `La mÃ©thode gemmes.push("${el}") fait exactement le travail !`,
        check: (res, ctx) => Array.isArray(res) && res.includes(el)
      })
    },
    // Template 5: Purification (.filter ou .map)
    {
      phase: 5,
      threshold: [30, 40, 50, 60][Math.floor(Math.random() * 4)],
      make: (th) => ({
        title: `La Purification du Creuset (Seuil > ${th})`,
        lore: `Ã‰liminez les scories impures : ne conservez que les essences dont la force est supÃ©rieure Ã  <code>${th}</code>.`,
        objective: `Filtrez le tableau <code>essences</code> avec <code>.filter(x => x > ${th})</code>.`,
        initialCode: `let essences = [15, ${th + 10}, 20, ${th + 25}, 10];\n\n// Ne gardez que les valeurs > ${th}\nlet pures = essences.filter(x => x > ${th});\n\nconsole.log("Essences pures :", pures);\nreturn pures;`,
        solutionCode: `let essences = [15, ${th + 10}, 20, ${th + 25}, 10];\nlet pures = essences.filter(x => x > ${th});\n\nconsole.log("Essences pures :", pures);\nreturn pures;`,
        hint: `Utilise essences.filter(x => x > ${th}) pour garder uniquement les grandes valeurs !`,
        check: (res, ctx) => Array.isArray(res) && res.length === 2 && res.every(x => x > th)
      })
    },
    // Template 6: Artefact du Grand Å’uvre
    {
      phase: 6,
      artefact: ["Sceptre d'HermÃ¨s", "Miroir d'Astronomie", "Athanor CÃ©leste", "ClÃ© de la Quintessence"][Math.floor(Math.random() * 4)],
      pwr: Math.floor(Math.random() * 400) + 600,
      make: (art, pwr) => ({
        title: `La Forge du ${art}`,
        lore: `Combinez la gÃ©omÃ©trie sacrÃ©e dans un artefact ultime de puissance <code>${pwr}</code>.`,
        objective: `Retournez un objet avec <code>nom: "${art}"</code> et <code>puissance: ${pwr}</code>.`,
        initialCode: `let artefact = {\n  nom: "${art}",\n  puissance: ${pwr},\n  forge: true\n};\n\nconsole.log("Artefact sacrÃ© crÃ©Ã© :", artefact);\nreturn artefact;`,
        solutionCode: `let artefact = {\n  nom: "${art}",\n  puissance: ${pwr},\n  forge: true\n};\n\nconsole.log("Artefact sacrÃ© crÃ©Ã© :", artefact);\nreturn artefact;`,
        hint: `L'objet contient dÃ©jÃ  les propriÃ©tÃ©s requises ! Transmute le code.`,
        check: (res, ctx) => typeof res === 'object' && res.nom === art && res.puissance === pwr
      })
    }
  ];

  // Choisir un template correspondant Ã  la phase ou alÃ©atoire
  const tpl = templates.find(t => t.phase === phaseNum) || templates[Math.floor(Math.random() * templates.length)];
  let questData;
  if (tpl.phase === 1) questData = tpl.make(tpl.metal, tpl.val);
  else if (tpl.phase === 2) questData = tpl.make(tpl.a, tpl.b, tpl.substance);
  else if (tpl.phase === 3) questData = tpl.make(tpl.multiplier);
  else if (tpl.phase === 4) questData = tpl.make(tpl.el);
  else if (tpl.phase === 5) questData = tpl.make(tpl.threshold);
  else questData = tpl.make(tpl.artefact, tpl.pwr);

  const quest = {
    id: questId,
    phase: phase.id,
    title: questData.title,
    difficulty: "GÃ‰NÃ‰RÃ‰E PAR IA âœ¨",
    lore: questData.lore,
    objective: questData.objective,
    initialCode: questData.initialCode,
    solutionCode: questData.solutionCode,
    hint: questData.hint,
    rewardXP: 20,
    isGenerated: true,
    check: questData.check
  };

  generatedQuests.set(quest.id, quest);
  return quest;
}


// ==========================================================================
// GESTION DES COMPTES ET PARCOURS ALCHIMIQUES (BDD JSON PERSISTANTE)
// ==========================================================================
const USERS_FILE = path.join(__dirname, 'data_users.json');

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

// Connexion / Création instantanée de compte alchimiste
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: "Nom d'alchimiste requis." });
  }

  const cleanName = username.trim();
  const users = loadUsersData();

  if (!users[cleanName]) {
    users[cleanName] = {
      username: cleanName,
      clearedQuests: [],
      gold: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveUsersData(users);
  }

  res.json({
    success: true,
    user: users[cleanName]
  });
});

// Sauvegarder la progression de l'alchimiste
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

// Consulter le profil et le parcours d'un alchimiste
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

// Health check Render & Télémétrie
app.get('/api/health', (req, res) => {
  const usersCount = Object.keys(loadUsersData()).length;
  res.json({
    status: "ok",
    service: "quantum-run-backend",
    geminiModel: GEMINI_MODEL,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GMI_API_KEY),
    usersCount,
    rateLimitProtection: {
      minIntervalMs: MIN_GEMINI_INTERVAL_MS,
      cachedQuestsCount: geminiCache.size,
      rateLimitEventsCount: rateLimitHitCount,
      lastRateLimitTimestamp
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// RÃ©cupÃ©rer les phases et quÃªtes
app.get('/api/quests', (req, res) => {
  // On renvoie les quÃªtes statiques + les quÃªtes gÃ©nÃ©rÃ©es
  const sanitizedStatic = QUESTS.map(({ check, ...rest }) => rest);
  const sanitizedGenerated = Array.from(generatedQuests.values()).map(({ check, ...rest }) => rest);
  res.json({
    phases: PHASES,
    quests: [...sanitizedStatic, ...sanitizedGenerated]
  });
});

// ==========================================================================
// MOTEUR DE SAGA CONTINUE AVEC GOOGLE GEMINI (GMI) & ATHANOR
// GESTION AUTOMATIQUE DES LIMITES DE REQUÃŠTES (RATE LIMITING & QUOTAS 429)
// ==========================================================================

const geminiCache = new Map();
let lastGeminiCallTime = 0;
const MIN_GEMINI_INTERVAL_MS = 2500; // Espacement minimal de 2.5s pour respecter le tier gratuit/standard (max 15-20 RPM)
let rateLimitHitCount = 0;
let lastRateLimitTimestamp = null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiForSaga({ previousQuest, phase, geminiKey }) {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || process.env.GMI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return null;
  }

  // 1. VÃ©rification du Cache en mÃ©moire
  const cacheKey = `p${phase}_prev${previousQuest?.id || 0}`;
  if (geminiCache.has(cacheKey)) {
    console.log(`âš¡ [Cache Gemini Hit] QuÃªte servie depuis le cache local (${cacheKey})`);
    return geminiCache.get(cacheKey);
  }

  // 2. Throttling anti-burst (espacement minimal de 2.5s pour Ã©viter l'erreur 429)
  const now = Date.now();
  const timeSinceLastCall = now - lastGeminiCallTime;
  if (timeSinceLastCall < MIN_GEMINI_INTERVAL_MS) {
    const waitTime = MIN_GEMINI_INTERVAL_MS - timeSinceLastCall;
    console.log(`â�±ï¸� [Rate Limit Protection] Pause de ${waitTime}ms pour respecter le quota API Gemini...`);
    await sleep(waitTime);
  }

  const prompt = `Génère une micro-quête JavaScript TRÈS SIMPLE à trous sur l'alchimie du code.
RÈGLE OBLIGATOIRE : initialCode DOIT ÊTRE UN EXERCICE À COMPLÉTER PAR LE JOUEUR (ex: let mercure = 50; return mercure;). Ne mets JAMAIS la solution dans initialCode !

Réponds STRICTEMENT en JSON :
{
  "title": "Titre très court",
  "storyContinuity": "",
  "lore": "Description ultracourte.",
  "objective": "Consigne très simple (ex: Multipliez la variable mercure par 2).",
  "initialCode": "let mercure = 50;\\n\\n// Multipliez mercure par 2 ici\\n\\nreturn mercure;",
  "solutionCode": "let mercure = 50;\\nmercure = mercure * 2;\\nreturn mercure;",
  "hint": "Utilise * 2 pour doubler la valeur."
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // 3. Tentatives avec Exponential Backoff (3 retries max en cas de 429 / 503)
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    lastGeminiCallTime = Date.now();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          // Sauvegarder dans le cache local
          geminiCache.set(cacheKey, parsed);
          return parsed;
        }
      } else if (response.status === 429 || response.status === 503) {
        rateLimitHitCount++;
        lastRateLimitTimestamp = new Date().toISOString();
        const backoffMs = attempt * 1500;
        console.warn(`âš ï¸� [Gemini Rate Limit 429/503] Tentative ${attempt}/${maxRetries} - Pause de ${backoffMs}ms...`);
        await sleep(backoffMs);
      } else {
        const errText = await response.text();
        console.warn(`RÃ©ponse Gemini API non-ok (statut ${response.status}) :`, errText);
        break;
      }
    } catch (err) {
      console.warn(`Erreur rÃ©seau Gemini (Tentative ${attempt}/${maxRetries}) :`, err.message);
      await sleep(1000);
    }
  }

  console.warn("âš ï¸� Basculement fluide vers le Moteur ProcÃ©dural Athanor suite aux limites d'API.");
  return null;
}

// Endpoint de GÃ©nÃ©ration de la QuÃªte Suivante (Saga Continue LLM / Gemini)
app.post('/api/quests/generate-saga', async (req, res) => {
  const { previousQuestId, phase, userGeminiKey } = req.body || {};
  const prevQuest = QUESTS.find(q => q.id === Number(previousQuestId)) || generatedQuests.get(Number(previousQuestId));
  const questId = QUESTS.length + generatedQuests.size + 1;
  const nextPhase = phase || (prevQuest ? Math.min(6, prevQuest.phase + (questId % 3 === 0 ? 1 : 0)) : 1);

  // 1. Tenter l'appel Ã  Google Gemini (GMI)
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
      difficulty: "FORGÃ‰E PAR GMI âœ¨",
      lore: `${geminiData.storyContinuity ? `<em>${geminiData.storyContinuity}</em><br><br>` : ''}${geminiData.lore}`,
      objective: geminiData.objective,
      initialCode: geminiData.initialCode,
      solutionCode: geminiData.solutionCode,
      hint: geminiData.hint,
      rewardXP: 25,
      isGenerated: true,
      storyChapter: questId,
      check: (result) => true // Auto-validation permissive pour les quÃªtes LLM
    };

    generatedQuests.set(newQuest.id, newQuest);
    const { check, ...sanitized } = newQuest;
    return res.json({
      success: true,
      quest: sanitized,
      source: `Google Gemini (${GEMINI_MODEL})`
    });
  }

  // 2. Moteur ProcÃ©dural de Saga Alchimique Continue (Fallback autonome sans clÃ©)
  const proceduralQuest = generateProceduralQuest(nextPhase);
  const { check, ...sanitized } = proceduralQuest;
  res.json({
    success: true,
    quest: sanitized,
    source: "Athanor Alchimique (Saga Continue)"
  });
});

// Endpoint de GÃ©nÃ©ration Infinie Manuel (compatibilitÃ©)
app.post('/api/quests/generate', async (req, res) => {
  const { phase, userGeminiKey } = req.body || {};
  const geminiData = await callGeminiForSaga({ previousQuest: null, phase, geminiKey: userGeminiKey });

  if (geminiData) {
    const questId = QUESTS.length + generatedQuests.size + 1;
    const newQuest = {
      id: questId,
      phase: phase || 1,
      title: geminiData.title,
      difficulty: "FORGÃ‰E PAR GMI âœ¨",
      lore: geminiData.lore,
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
    return res.json({ success: true, quest: sanitized, source: `Google Gemini (${GEMINI_MODEL})` });
  }

  const newQuest = generateProceduralQuest(phase);
  const { check, ...sanitized } = newQuest;
  res.json({ success: true, quest: sanitized, source: "Athanor Alchimique" });
});

// ExÃ©cuter et valider le code cÃ´tÃ© serveur
app.post('/api/transmute', (req, res) => {
  const { questId, code } = req.body;
  const quest = QUESTS.find(q => q.id === Number(questId)) || generatedQuests.get(Number(questId));

  if (!quest) {
    return res.status(404).json({ success: false, message: "QuÃªte introuvable" });
  }

  const startTime = process.hrtime.bigint();
  const capturedLogs = [];

  // Sandbox d'exÃ©cution sÃ©curisÃ©e
  const sandbox = {
    console: {
      log: (...args) => {
        capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      }
    }
  };

  vm.createContext(sandbox);

  try {
    const wrappedCode = `(function() {\n${code}\n})()`;
    const script = new vm.Script(wrappedCode);
    const result = script.runInContext(sandbox, { timeout: 1500 });

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    // Contexte des variables globales dÃ©finies dans le sandbox
    const isValid = quest.check(result, sandbox);

    res.json({
      success: isValid,
      result: typeof result === 'object' ? result : String(result),
      logs: capturedLogs,
      executionTimeMs: Math.round(durationMs * 100) / 100,
      rewardXP: isValid ? quest.rewardXP : 0,
      message: isValid
        ? `âœ¨ Transmutation validÃ©e par le serveur ! (+${quest.rewardXP} XP)`
        : "âš ï¸� Formule incomplÃ¨te. VÃ©rifiez la consigne et rÃ©essayez."
    });

  } catch (err) {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    res.json({
      success: false,
      error: err.message,
      logs: capturedLogs,
      executionTimeMs: Math.round(durationMs * 100) / 100,
      message: `â�Œ Erreur du fourneau serveur : ${err.message}`
    });
  }
});

// Fonction d'assistance conversationnelle ORBIT via Gemini 3.6 Flash
async function callGeminiForOrbitChat({ message, quest, geminiKey }) {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || process.env.GMI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) return null;

  const prompt = `Tu es ORBIT, l'Homunculus Alchimique et copilote IA de l'alchimiste.
L'adepte travaille actuellement sur la quÃªte #${quest?.id || 1} : "${quest?.title || 'QuÃªte Alchimique'}".
Objectif de la quÃªte : "${quest?.objective || 'Transmuter la matiÃ¨re'}".
Indice de la quÃªte : "${quest?.hint || 'VÃ©rifie la syntaxe'}".

Question / Message de l'alchimiste : "${message}"

Consigne : RÃ©ponds avec bienveillance de faÃ§on TRÃˆS CONCISE (1 Ã  2 phrases max, 30 mots maximum). Ne donne la solution complÃ¨te que si l'utilisateur la demande explicitement.`;

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
      if (rawText) {
        return rawText.trim();
      }
    } else {
      console.warn("RÃ©ponse Gemini Chat non-ok :", response.status);
    }
  } catch (err) {
    console.warn("Erreur lors de l'appel Gemini Chat :", err.message);
  }
  return null;
}

// Endpoint Copilote ORBIT IA (propulsÃ© par Gemini 3.6 Flash)
app.post('/api/orbit/chat', async (req, res) => {
  const { message, questId, userGeminiKey } = req.body || {};
  const quest = QUESTS.find(q => q.id === Number(questId)) || generatedQuests.get(Number(questId)) || QUESTS[0];

  // 1. Tenter la rÃ©ponse Gemini 3.6 Flash
  const aiReply = await callGeminiForOrbitChat({
    message,
    quest,
    geminiKey: userGeminiKey
  });

  if (aiReply) {
    return res.json({
      reply: aiReply,
      source: `Google Gemini (${GEMINI_MODEL})`,
      timestamp: new Date().toISOString()
    });
  }

  // 2. Fallback local de secours
  const lower = (message || '').toLowerCase();
  let reply = "";

  if (lower.includes('indice') || lower.includes('aide') || lower.includes('bloqu') || lower.includes('comment')) {
    reply = `ðŸ’¡ <strong>Conseil de l'Homunculus :</strong> ${quest.hint}`;
  } else if (lower.includes('solution') || lower.includes('reponse') || lower.includes('code')) {
    reply = `ðŸ”‘ Clique sur le bouton <strong>Solution</strong> pour charger la formule exacte dans le creuset.`;
  } else if (lower.includes('qui es-tu') || lower.includes('orbit')) {
    reply = `Je suis <strong>ORBIT</strong>, l'intelligence alchimique du creuset propulsÃ©e par Gemini 3.6 Flash !`;
  } else {
    reply = `Conseil pour <em>${quest.title}</em> : ${quest.hint}`;
  }

  res.json({
    reply,
    source: "Athanor Core",
    timestamp: new Date().toISOString()
  });
});

// SPA Fallback pour React MUI (si dist/index.html est prÃ©sent)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

// Lancement du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`âš—ï¸�  QUANTUM RUN â€” SERVEUR BACKEND ACTIF`);
  console.log(`ðŸš€ Port d'Ã©coute : http://localhost:${PORT}`);
  console.log(`ðŸ§  ModÃ¨le IA : Google Gemini (${GEMINI_MODEL})`);
  console.log(`ðŸ”‘ ClÃ© API Gemini configurÃ©e : ${Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GMI_API_KEY) ? 'OUI' : 'NON (Mode Fallback Athanor actif)'}`);
  console.log(`ðŸ“¡ PrÃªt pour dÃ©ploiement gratuit sur Render`);
  console.log(`==================================================\n`);
});
