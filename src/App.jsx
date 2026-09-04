import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar,
  CircularProgress,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Divider,
  Collapse,
  LinearProgress,
  Chip,
} from '@mui/material';

// Composants officiels OpenAI Apps SDK UI
import { Badge as OpenAIBadge } from '@openai/apps-sdk-ui/components/Badge';
import { Button as OpenAIButton } from '@openai/apps-sdk-ui/components/Button';
import { ShimmerText } from '@openai/apps-sdk-ui/components/ShimmerText';

import {
  AutoAwesome,
  PlayArrow,
  Refresh,
  Lightbulb,
  VpnKey,
  Send,
  CheckCircle,
  RadioButtonUnchecked,
  Terminal as TerminalIcon,
  SmartToy,
  Science,
  Bolt,
  Person,
  NavigateNext,
  NavigateBefore,
  ContentCopy,
  Check,
  ExpandMore,
  ExpandLess,
  Code as CodeIcon,
  MenuBook as MenuBookIcon,
  Chat as ChatIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';

class AudioSynth {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
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
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
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
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

const synth = new AudioSynth();

const DEFAULT_PHASES = [
  { id: 1, name: "Energer", symbol: "📄" },
  { id: 2, name: "Trust Studio", symbol: "🛡️" },
  { id: 3, name: "La Bonne Réponse", symbol: "🏗️" },
  { id: 4, name: "APIs & LLM", symbol: "🤖" },
  { id: 5, name: "Analytics", symbol: "📊" },
  { id: 6, name: "Builder Suprême", symbol: "🚀" }
];

const getRankTitle = (xp) => {
  if (xp >= 300) return "Senior AI Builder 🚀";
  if (xp >= 200) return "Master Architect 🛡️";
  if (xp >= 100) return "Full Stack Engineer 💻";
  if (xp >= 50) return "SaaS Developer 📄";
  return "Junior Builder 🏗️";
};

const INITIAL_QUEST = {
  id: 1,
  phase: 1,
  title: "Validation de Facture (Energer)",
  difficulty: "FACILE",
  lore: "Bienvenue chez Quantum of Trust ! La plateforme Energer analyse automatiquement les factures clients pour détecter les incohérences. Initialisez le statut du document vérifié.",
  objective: "Changez la valeur de la variable <code>status</code> pour <code>\"VERIFIED\"</code>.",
  initialCode: `// Validez le statut de la facture Energer\nlet status = "PENDING";\n\nreturn status;`,
  solutionCode: `let status = "VERIFIED";\n\nreturn status;`,
  hint: "Remplace \"PENDING\" par \"VERIFIED\".",
  rewardXP: 16
};

export default function App() {
  const [quests, setQuests] = useState([INITIAL_QUEST]);
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [activeQuest, setActiveQuest] = useState(INITIAL_QUEST);
  const [code, setCode] = useState(INITIAL_QUEST.initialCode);
  const [clearedQuests, setClearedQuests] = useState([]);
  const [gold, setGold] = useState(0);
  // Mobile Tab : 0 = Éditeur, 1 = Quêtes, 2 = Copilote, 3 = Profil
  const [mobileTab, setMobileTab] = useState(0);

  // Ergonomie mobile : Récit accordéon, copie et enchaînement
  const [loreOpen, setLoreOpen] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState(null);

  // Compte et parcours alchimiste
  const [currentUser, setCurrentUser] = useState(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  const [serverOnline, setServerOnline] = useState(false);
  const [latency, setLatency] = useState(12);
  const [modelName, setModelName] = useState('GEMINI 3.6 FLASH');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'sys', text: 'Console initialisée avec OpenAI Apps SDK UI.' }
  ]);
  const [execTime, setExecTime] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Bienvenue chez Quantum of Trust ! Je suis ORBIT, votre Tech Lead Copilote. Posez-moi vos questions sur Energer, Trust Studio, La Bonne Réponse ou vos exercices.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isForging, setIsForging] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const terminalRef = useRef(null);
  const chatScrollRef = useRef(null);
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const phaseScrollRef = useRef(null);

  const handleScroll = (e) => {
    if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
  };

  const triggerHaptic = (pattern = [30]) => {
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const savedName = localStorage.getItem('quantum_run_username') || 'Alchimiste-1';
    setUsernameInput(savedName);
    loginUser(savedName);
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalLogs]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  const loginUser = async (nameToLogin) => {
    if (!nameToLogin || !nameToLogin.trim()) return;
    const cleanName = nameToLogin.trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setClearedQuests(data.user.clearedQuests || []);
        setGold(data.user.gold || 0);
        localStorage.setItem('quantum_run_username', cleanName);
        addTerminal('sys', `Compte actif : ${cleanName}`);
      }
    } catch (e) {}
    fetchServerStatus();
  };

  const saveProgressOnServer = async (updatedCleared, updatedGold) => {
    if (!currentUser) return;
    try {
      await fetch('/api/user/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          clearedQuests: updatedCleared,
          gold: updatedGold
        })
      });
    } catch (e) {}
  };

  const fetchServerStatus = async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const health = await res.json();
        setServerOnline(true);
        setLatency(Math.round(performance.now() - t0));
        if (health.geminiModel) setModelName(health.geminiModel.toUpperCase());
        if (health.hasGeminiKey) setHasApiKey(true);

        const qRes = await fetch('/api/quests');
        if (qRes.ok) {
          const data = await qRes.json();
          if (data.quests && data.quests.length > 0) {
            setQuests(data.quests);
            setActiveQuest(data.quests[0]);
            setCode(data.quests[0].initialCode);
          }
          if (data.phases) setPhases(data.phases);
        }
      }
    } catch (err) {
      setServerOnline(false);
    }
  };

  const selectQuest = (q) => {
    setActiveQuest(q);
    setCode(q.initialCode);
    setMobileTab(0); // Bascule automatiquement sur l'onglet Éditeur sur mobile
    setLastSuccess(null);
    addTerminal('sys', `Quête #${q.id} active : ${q.title}`);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const addTerminal = (type, text) => {
    setTerminalLogs(prev => [...prev, { type, text }]);
  };

  // Insertion intelligente de symboles et puces de code au curseur
  const insertAtCursor = (textToInsert, offset = 0) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? code.length;
    const end = textarea.selectionEnd ?? code.length;
    const newCode = code.substring(0, start) + textToInsert + code.substring(end);
    setCode(newCode);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = start + textToInsert.length + offset;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 10);
  };

  // Puces intelligentes extraites automatiquement de la quête active
  const quickTokens = useMemo(() => {
    const set = new Set();
    const rawText = `${activeQuest.objective || ''} ${activeQuest.solutionCode || ''} ${activeQuest.initialCode || ''}`;
    
    // Extraction des balises <code>...</code>
    const codeMatches = (activeQuest.objective || '').match(/<code>([^<]+)<\/code>/g) || [];
    codeMatches.forEach(m => {
      const clean = m.replace(/<\/?code>/g, '').replace(/"/g, '').trim();
      if (clean && clean.length <= 18) set.add(clean);
    });

    // Extraction des littéraux entre guillemets
    const quoteMatches = rawText.match(/"([^"]+)"/g) || [];
    quoteMatches.forEach(m => {
      const clean = m.replace(/"/g, '').trim();
      if (clean && clean.length <= 18) set.add(clean);
    });

    // Mots-clés courants en JavaScript
    ['status', 'true', 'false', 'return', '120', 'montantTTC', 'anomalieDetectee', 'refDocument', 'confidenceScore'].forEach(kw => {
      if (rawText.includes(kw)) set.add(kw);
    });

    return Array.from(set).slice(0, 5);
  }, [activeQuest]);

  const copySyncKey = async () => {
    if (!currentUser?.syncKey) return;
    try {
      await navigator.clipboard.writeText(currentUser.syncKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
      setSnackbar({ open: true, message: 'Code multi-appareils copié ! 📲', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: currentUser.syncKey, severity: 'info' });
    }
  };

  const handleTransmute = async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/transmute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: activeQuest.id, code })
      });
      const duration = (performance.now() - t0).toFixed(1);
      setExecTime(`${duration} ms`);

      const data = await res.json();
      if (data.success) {
        synth.playSuccess();
        triggerHaptic([40, 30, 60]);
        addTerminal('ok', `[OK] Validé en ${duration}ms — Résultat: ${JSON.stringify(data.result)}`);
        
        let updatedCleared = clearedQuests;
        let updatedGold = gold;

        if (!clearedQuests.includes(activeQuest.id)) {
          updatedCleared = [...clearedQuests, activeQuest.id];
          updatedGold = gold + (activeQuest.rewardXP || 16);
          setClearedQuests(updatedCleared);
          setGold(updatedGold);
          
          saveProgressOnServer(updatedCleared, updatedGold);
        }

        setLastSuccess({
          id: activeQuest.id,
          title: activeQuest.title,
          rewardXP: activeQuest.rewardXP || 16
        });

        setSnackbar({ open: true, message: '✨ Transmutation réussie !', severity: 'success' });
        triggerSagaGeneration(activeQuest.id);
      } else {
        synth.playError();
        triggerHaptic([80, 40, 80]);
        setLastSuccess(null);
        addTerminal('fail', `[ERREUR] ${data.error || 'Validation échouée'}`);
        setSnackbar({ open: true, message: 'Formule incorrecte.', severity: 'error' });
      }
    } catch (err) {
      synth.playError();
      addTerminal('fail', `[ERREUR RESEAU] ${err.message}`);
    }
  };

  const triggerSagaGeneration = async (completedId) => {
    setIsForging(true);
    addTerminal('sys', 'Forge du chapitre suivant...');
    try {
      const res = await fetch('/api/quests/generate-saga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousQuestId: completedId })
      });
      const data = await res.json();
      if (data.success && data.quest) {
        setQuests(prev => {
          if (prev.some(q => q.id === data.quest.id)) return prev;
          return [...prev, data.quest];
        });
        addTerminal('ok', `✨ Chapitre #${data.quest.id} forgé : ${data.quest.title}`);
        selectQuest(data.quest);
      }
    } catch (err) {} finally {
      setIsForging(false);
    }
  };

  const handleManualForge = async () => {
    setIsForging(true);
    try {
      const res = await fetch('/api/quests/generate-saga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousQuestId: activeQuest.id, phase: activeQuest.phase })
      });
      const data = await res.json();
      if (data.success && data.quest) {
        setQuests(prev => [...prev, data.quest]);
        selectQuest(data.quest);
        setSnackbar({ open: true, message: 'Nouvelle quête créée !', severity: 'info' });
      }
    } catch (err) {} finally {
      setIsForging(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);

    try {
      const res = await fetch('/api/orbit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, questId: activeQuest.id })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: `Indice : ${activeQuest.hint}` }]);
    }
  };

  const lineCount = (code.match(/\n/g) || []).length + 1;
  const linesArray = Array.from({ length: Math.max(lineCount, 6) }, (_, i) => i + 1);

  const getRank = () => {
    const count = clearedQuests.length;
    if (count >= 22) return "Grand Maître";
    if (count >= 15) return "Magister";
    if (count >= 10) return "Adepte";
    if (count >= 5) return "Initié";
    return "Néophyte";
  };

  const filteredQuests = phaseFilter
    ? quests.filter(q => q.phase === phaseFilter)
    : quests;

  return (
    <Box sx={{ minHeight: '100dvh', pb: { xs: 10, lg: 5 }, bgcolor: '#0D0D0D' }}>
      
      {/* HEADER ULTRA-RESPONSIVE ADAPTÉ SMARTPHONES & DESKTOP */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#171717', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', zIndex: 1000 }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 0.8, sm: 0.5 }, minHeight: { xs: 48, sm: 56 }, px: { xs: 0.5, sm: 2 } }}>
            
            {/* Branding & Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Avatar sx={{ bgcolor: 'transparent', color: '#10A37F', border: '1px solid rgba(16, 163, 127, 0.4)', width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, fontSize: { xs: 14, sm: 16 } }}>
                🜔
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.04em', color: '#ECECEC', fontSize: { xs: 13, sm: 15 } }}>
                QUANTUM RUN
              </Typography>

              {/* Statut Serveur Minimaliste sur Mobile */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: serverOnline ? '#10A37F' : '#EF4444',
                    boxShadow: serverOnline ? '0 0 8px #10A37F' : 'none',
                    display: { xs: 'block', sm: 'none' }
                  }}
                />
                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <OpenAIBadge color={serverOnline ? "success" : "secondary"}>
                    {serverOnline ? `${latency}ms` : "OFFLINE"}
                  </OpenAIBadge>
                </Box>
              </Box>

              {/* Modèle IA (visible sur tablette & desktop) */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <OpenAIBadge color="primary">
                  {modelName}
                </OpenAIBadge>
              </Box>
            </Box>

            {/* Statistiques & Bouton Profil / Synchro */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1 } }}>
              <OpenAIBadge color="warning">
                🪙 {gold} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>XP</Box>
              </OpenAIBadge>

              {/* Titre de Rang (masqué sur très petit écran pour éviter tout débordement) */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <OpenAIBadge color="secondary">
                  {getRankTitle(gold)}
                </OpenAIBadge>
              </Box>

              {/* Bouton Compte / Profil */}
              <OpenAIButton
                variant="soft"
                color="secondary"
                size="sm"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1200) {
                    setMobileTab(3);
                  } else {
                    setAccountModalOpen(true);
                  }
                }}
              >
                <Person style={{ width: 14, height: 14 }} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {currentUser?.username || "Compte"}
                </Box>
              </OpenAIButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 3 } }}>
        
        {/* BARRE DES PHASES (SCROLL HORIZONTAL TOUCH MOMENTUM) */}
        <Box
          ref={phaseScrollRef}
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 1,
            mb: { xs: 1.5, sm: 2 },
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {phases.map((ph) => {
            const isCurrent = activeQuest.phase === ph.id;
            return (
              <Paper
                key={ph.id}
                elevation={0}
                onClick={() => {
                  const firstInPhase = quests.find(q => q.phase === ph.id);
                  if (firstInPhase) selectQuest(firstInPhase);
                  setPhaseFilter(ph.id);
                }}
                sx={{
                  flexShrink: 0,
                  cursor: 'pointer',
                  px: { xs: 1.2, sm: 1.5 },
                  py: { xs: 0.6, sm: 0.8 },
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isCurrent ? '#10A37F' : 'rgba(255, 255, 255, 0.12)',
                  bgcolor: isCurrent ? 'rgba(16, 163, 127, 0.18)' : '#171717',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: isCurrent ? '#1ADA9D' : '#ECECEC', fontSize: { xs: 11, sm: 12 }, whiteSpace: 'nowrap' }}>
                  {ph.symbol} {ph.name}
                </Typography>
              </Paper>
            );
          })}
        </Box>

        {/* COCKPIT PRINCIPAL */}
        <Grid container spacing={2.5}>
          
          {/* ========================================================================= */}
          {/* COLONNE GAUCHE : ÉDITEUR DE CODE ET CONSOLE                                */}
          {/* ========================================================================= */}
          <Grid
            item
            xs={12}
            lg={8}
            sx={{
              display: {
                xs: mobileTab === 0 ? 'block' : 'none',
                lg: 'block'
              }
            }}
          >
            
            {/* CARTE DE QUÊTE AVEC LORE RÉPONDANT SUR MOBILE */}
            <Card sx={{ mb: 2, bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                
                {/* Entête Quête : Titre, XP et Boutons Précédent / Suivant */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ECECEC', fontSize: { xs: 14, sm: 17 } }}>
                      #{activeQuest.id} {activeQuest.title}
                    </Typography>
                    <OpenAIBadge color="primary">
                      +{activeQuest.rewardXP || 16} XP
                    </OpenAIBadge>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <OpenAIButton
                      variant="soft"
                      color="primary"
                      size="sm"
                      onClick={handleManualForge}
                      disabled={isForging}
                    >
                      {isForging ? <CircularProgress size={12} /> : <AutoAwesome style={{ width: 14, height: 14 }} />}
                      {isForging ? "Forge..." : "Forger"}
                    </OpenAIButton>
                    <IconButton
                      size="small"
                      disabled={activeQuest.id <= 1}
                      onClick={() => {
                        const idx = quests.findIndex(q => q.id === activeQuest.id);
                        if (idx > 0) selectQuest(quests[idx - 1]);
                      }}
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <NavigateBefore fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={activeQuest.id >= quests[quests.length - 1]?.id}
                      onClick={() => {
                        const idx = quests.findIndex(q => q.id === activeQuest.id);
                        if (idx < quests.length - 1) selectQuest(quests[idx + 1]);
                      }}
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <NavigateNext fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Récit Lore (Rétractable sur smartphone pour économiser la hauteur d'écran) */}
                {activeQuest.lore && (
                  <Box sx={{ mb: 1.2 }}>
                    {/* Bouton accordéon mobile */}
                    <Box
                      onClick={() => setLoreOpen(prev => !prev)}
                      sx={{
                        display: { xs: 'flex', sm: 'none' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        mb: loreOpen ? 0.8 : 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#1ADA9D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        📜 Histoire & Contexte {loreOpen ? '(masquer)' : '(dérouler)'}
                      </Typography>
                      {loreOpen ? <ExpandLess fontSize="small" sx={{ color: '#1ADA9D' }} /> : <ExpandMore fontSize="small" sx={{ color: '#1ADA9D' }} />}
                    </Box>

                    {/* Contenu rétractable sur mobile */}
                    <Collapse in={loreOpen} sx={{ display: { xs: 'block', sm: 'none' } }}>
                      <Box sx={{ p: 1, bgcolor: 'rgba(16, 163, 127, 0.08)', borderRadius: 1, border: '1px solid rgba(16, 163, 127, 0.2)' }}>
                        <Typography variant="body2" sx={{ color: '#B4B4B4', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.45 }}>
                          📜 {activeQuest.lore}
                        </Typography>
                      </Box>
                    </Collapse>

                    {/* Visible directement sur tablette & desktop */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, p: 1.2, bgcolor: 'rgba(16, 163, 127, 0.08)', borderRadius: 1, border: '1px solid rgba(16, 163, 127, 0.2)' }}>
                      <Typography variant="body2" sx={{ color: '#B4B4B4', fontStyle: 'italic', fontSize: 13, lineHeight: 1.5 }}>
                        📜 {activeQuest.lore}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Objectif Direct et Précis */}
                <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.2 }, bgcolor: '#212121', borderLeft: '3px solid #10A37F', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#10A37F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.2, fontSize: 11 }}>
                    Objectif du Rituel
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ECECEC', fontWeight: 500, fontSize: { xs: 12.5, sm: 13 } }} dangerouslySetInnerHTML={{ __html: activeQuest.objective }} />
                </Paper>

              </CardContent>
            </Card>

            {/* BANNIÈRE DE FÉLICITATIONS IMMÉDIATE APRÈS TRANSMUTATION */}
            {lastSuccess && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(16, 163, 127, 0.15)',
                  border: '1px solid #10A37F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#10A37F', fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#ECECEC', fontWeight: 700, fontSize: 13 }}>
                      ✨ Quête #{lastSuccess.id} réussie ! (+{lastSuccess.rewardXP} XP)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1ADA9D', fontSize: 11 }}>
                      Formule alchimique validée avec succès.
                    </Typography>
                  </Box>
                </Box>

                {activeQuest.id < quests[quests.length - 1]?.id && (
                  <OpenAIButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      const idx = quests.findIndex(q => q.id === activeQuest.id);
                      if (idx < quests.length - 1) {
                        selectQuest(quests[idx + 1]);
                      }
                    }}
                  >
                    Quête Suivante <NavigateNext style={{ width: 14, height: 14 }} />
                  </OpenAIButton>
                )}
              </Paper>
            )}

            {/* ÉDITEUR DE CODE AVEC CLAVIER D'ACCESSOIRES TACTILE */}
            <Card sx={{ mb: 2, overflow: 'hidden', bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              
              {/* Barre de titre du fichier & Actions Rapides */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.8, bgcolor: '#212121', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', flexWrap: 'wrap', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science sx={{ fontSize: 14, color: '#10A37F' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#B4B4B4', fontSize: 11 }}>
                    creuset.js
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => setCode(activeQuest.initialCode)}>
                    <Refresh style={{ width: 12, height: 12 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Reset</Box>
                  </OpenAIButton>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => addTerminal('sys', `💡 Indice : ${activeQuest.hint}`)}>
                    <Lightbulb style={{ width: 12, height: 12 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Indice</Box>
                  </OpenAIButton>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => setCode(activeQuest.solutionCode)}>
                    <VpnKey style={{ width: 12, height: 12 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Solution</Box>
                  </OpenAIButton>
                </Box>
              </Box>

              {/* BARRE D'ACCESSOIRES TOUCH DÉVELOPPEUR (GAME-CHANGER POUR SMARTPHONES) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1,
                  py: 0.6,
                  bgcolor: '#1E1E1E',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', mr: 0.3, flexShrink: 0 }}>
                  Touches :
                </Typography>
                {[
                  { label: 'TAB', insert: '  ' },
                  { label: '" "', insert: '""', offset: -1 },
                  { label: "' '", insert: "''", offset: -1 },
                  { label: '=', insert: ' = ' },
                  { label: ';', insert: ';' },
                  { label: '( )', insert: '()', offset: -1 },
                  { label: '{ }', insert: '{}', offset: -1 },
                  { label: '[ ]', insert: '[]', offset: -1 },
                  { label: '.', insert: '.' },
                  { label: '+', insert: ' + ' },
                  { label: '-', insert: ' - ' },
                  { label: '*', insert: ' * ' },
                  { label: '!', insert: '!' },
                  { label: 'return', insert: 'return ' },
                ].map((keyItem, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    onClick={() => insertAtCursor(keyItem.insert, keyItem.offset || 0)}
                    sx={{
                      flexShrink: 0,
                      px: 0.9,
                      py: 0.4,
                      borderRadius: 1,
                      bgcolor: '#2A2A2A',
                      color: '#ECECEC',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      userSelect: 'none',
                      '&:active': { bgcolor: '#10A37F', color: '#FFF' },
                    }}
                  >
                    {keyItem.label}
                  </Paper>
                ))}

                {/* Puces intelligentes déduites du contexte de l'exercice */}
                {quickTokens.map((token, i) => (
                  <Paper
                    key={`token-${i}`}
                    elevation={0}
                    onClick={() => insertAtCursor(token)}
                    sx={{
                      flexShrink: 0,
                      px: 1,
                      py: 0.4,
                      borderRadius: 1,
                      bgcolor: 'rgba(16, 163, 127, 0.2)',
                      color: '#1ADA9D',
                      border: '1px solid rgba(16, 163, 127, 0.4)',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11.5,
                      fontWeight: 700,
                      userSelect: 'none',
                      '&:active': { bgcolor: '#10A37F', color: '#FFF' },
                    }}
                  >
                    +{token}
                  </Paper>
                ))}
              </Box>

              {/* Workspace Code (Anti-Zoom iOS Safari & Clavier Tactile) */}
              <Box sx={{ display: 'flex', minHeight: { xs: 170, sm: 200 }, maxHeight: { xs: 260, sm: 320 }, bgcolor: '#0D0D0D' }}>
                <Box
                  ref={gutterRef}
                  sx={{
                    width: { xs: 28, sm: 36 },
                    py: 1.2,
                    px: { xs: 0.4, sm: 0.8 },
                    textAlign: 'right',
                    color: '#676767',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: { xs: 12, sm: 13 },
                    lineHeight: 1.6,
                    userSelect: 'none',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    overflowY: 'hidden',
                  }}
                >
                  {linesArray.map(n => <div key={n}>{n}</div>)}
                </Box>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleScroll}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleTransmute();
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    padding: '10px 12px',
                    color: '#ECECEC',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '16px', // Empêche strictement le zoom automatique iOS Safari !
                    lineHeight: 1.6,
                    whiteSpace: 'pre',
                    tabSize: 2,
                    overflowY: 'auto',
                    touchAction: 'manipulation',
                  }}
                />
              </Box>

              {/* Barre d'Action avec Bouton Transmuter Large Tactile */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 1.2 }, bgcolor: '#212121', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <Typography variant="caption" sx={{ color: '#B4B4B4', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, display: { xs: 'none', sm: 'block' } }}>
                  Ctrl + Entrée
                </Typography>
                <OpenAIButton
                  color="primary"
                  size="md"
                  fullWidth
                  onClick={handleTransmute}
                  style={{ minHeight: 44 }}
                >
                  ⚡ TRANSMUTER <PlayArrow style={{ width: 16, height: 16 }} />
                </OpenAIButton>
              </Box>
            </Card>

            {/* TERMINAL CONSOLE */}
            <Paper elevation={0} sx={{ bgcolor: '#0D0D0D', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.6, bgcolor: '#212121', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: 14, color: '#10A37F' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#B4B4B4', fontSize: 11 }}>
                    CONSOLE
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#B4B4B4', fontSize: 11 }}>
                  {execTime}
                </Typography>
              </Box>

              <Box ref={terminalRef} sx={{ p: 1.5, maxHeight: { xs: 140, sm: 130 }, minHeight: 70, overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {terminalLogs.map((log, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      color: log.type === 'ok' ? '#10A37F' : log.type === 'fail' ? '#EF4444' : '#B4B4B4',
                    }}
                  >
                    {log.text}
                  </Box>
                ))}
              </Box>
            </Paper>

          </Grid>

          {/* ========================================================================= */}
          {/* VUE MOBILE DÉDIÉE : ONGLETS QUÊTES (1), COPILOTE (2), PROFIL (3)           */}
          {/* ========================================================================= */}

          {/* ONGLET QUÊTES MOBILE PLEIN ÉCRAN */}
          <Grid
            item
            xs={12}
            sx={{
              display: {
                xs: mobileTab === 1 ? 'block' : 'none',
                lg: 'none'
              }
            }}
          >
            {/* Progression Globale */}
            <Card sx={{ mb: 2, bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ECECEC' }}>
                    Progression Alchimique
                  </Typography>
                  <OpenAIBadge color="primary">
                    {clearedQuests.length} / {quests.length} ({Math.round((clearedQuests.length / quests.length) * 100)}%)
                  </OpenAIBadge>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={quests.length > 0 ? (clearedQuests.length / quests.length) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#262626',
                    '& .MuiLinearProgress-bar': { bgcolor: '#10A37F' }
                  }}
                />
              </CardContent>
            </Card>

            {/* Filtres de Phase */}
            <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.5, '&::-webkit-scrollbar': { display: 'none' } }}>
              <Chip
                label="Toutes"
                size="small"
                onClick={() => setPhaseFilter(null)}
                sx={{
                  bgcolor: phaseFilter === null ? '#10A37F' : '#212121',
                  color: phaseFilter === null ? '#FFF' : '#B4B4B4',
                  fontWeight: 600,
                }}
              />
              {phases.map(ph => (
                <Chip
                  key={ph.id}
                  label={`${ph.symbol} ${ph.name}`}
                  size="small"
                  onClick={() => setPhaseFilter(ph.id)}
                  sx={{
                    bgcolor: phaseFilter === ph.id ? '#10A37F' : '#212121',
                    color: phaseFilter === ph.id ? '#FFF' : '#B4B4B4',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>

            {/* Liste Complète des Quêtes en Format Carte Tactile */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredQuests.map(q => {
                const isCleared = clearedQuests.includes(q.id);
                const isCurrent = q.id === activeQuest.id;
                return (
                  <Paper
                    key={q.id}
                    elevation={0}
                    onClick={() => selectQuest(q)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isCurrent ? '#10A37F' : 'rgba(255, 255, 255, 0.12)',
                      bgcolor: isCurrent ? 'rgba(16, 163, 127, 0.12)' : '#171717',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:active': { bgcolor: 'rgba(16, 163, 127, 0.2)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {isCleared ? (
                        <CheckCircle sx={{ color: '#10A37F', fontSize: 20 }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ color: '#676767', fontSize: 20 }} />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#1ADA9D' : '#ECECEC', fontSize: 13 }}>
                          #{q.id} {q.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#888', fontSize: 11 }}>
                          Phase {q.phase} • {q.difficulty || 'FACILE'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OpenAIBadge color="primary">
                        +{q.rewardXP || 16} XP
                      </OpenAIBadge>
                      <NavigateNext sx={{ color: '#676767', fontSize: 18 }} />
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Grid>

          {/* ONGLET COPILOTE ORBIT PLEIN ÉCRAN */}
          <Grid
            item
            xs={12}
            sx={{
              display: {
                xs: mobileTab === 2 ? 'block' : 'none',
                lg: 'none'
              }
            }}
          >
            <Card sx={{ bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)', minHeight: 'calc(100dvh - 200px)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'transparent', color: '#10A37F', border: '1px solid rgba(16, 163, 127, 0.4)', width: 28, height: 28 }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>}
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: '#ECECEC' }}>ORBIT Copilote</Typography>}
                subheader={<Typography variant="caption" sx={{ color: '#10A37F', fontSize: 11 }}>{modelName} • Prêt à vous guider</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
              />
              <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                
                {/* Messages de Chat Pleine Hauteur */}
                <Box
                  ref={chatScrollRef}
                  sx={{
                    flex: 1,
                    maxHeight: 'calc(100dvh - 310px)',
                    minHeight: 260,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  {chatMessages.map((m, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        maxWidth: '88%',
                        alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                        bgcolor: m.sender === 'user' ? 'rgba(16, 163, 127, 0.25)' : '#212121',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: 13, color: '#ECECEC', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: m.text }} />
                    </Paper>
                  ))}
                </Box>

                {/* Suggestions Rapides de Questions en 1 Tap */}
                <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 1, mb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                  {[
                    "💡 Donne-moi un indice",
                    "🎯 Quel est l'objectif ?",
                    "⚡ Montre la syntaxe",
                    "🔍 Explique la solution",
                  ].map((sug, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => {
                        setChatMessages(prev => [...prev, { sender: 'user', text: sug }]);
                        fetch('/api/orbit/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: sug, questId: activeQuest.id, code })
                        })
                          .then(res => res.json())
                          .then(data => {
                            setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
                          })
                          .catch(() => {
                            setChatMessages(prev => [...prev, { sender: 'bot', text: `Indice pour #${activeQuest.id} : ${activeQuest.hint}` }]);
                          });
                      }}
                      sx={{
                        flexShrink: 0,
                        px: 1,
                        py: 0.4,
                        bgcolor: '#262626',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        cursor: 'pointer',
                        fontSize: 11.5,
                        color: '#ECECEC',
                        '&:active': { bgcolor: '#10A37F' }
                      }}
                    >
                      {sug}
                    </Paper>
                  ))}
                </Box>

                {/* Zone de Saisie Chat */}
                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Posez une question sur le code…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    sx={{
                      bgcolor: '#0D0D0D',
                      borderRadius: 1.5,
                      '& input': { fontSize: '16px', py: 1, color: '#ECECEC' } // 16px empêche le zoom iOS
                    }}
                  />
                  <IconButton color="primary" type="submit" sx={{ p: 1.2, bgcolor: '#10A37F', color: '#FFF', '&:hover': { bgcolor: '#1ADA9D' } }}>
                    <Send sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

              </CardContent>
            </Card>
          </Grid>

          {/* ONGLET PROFIL & SYNCHRONISATION MULTI-APPAREILS PLEIN ÉCRAN */}
          <Grid
            item
            xs={12}
            sx={{
              display: {
                xs: mobileTab === 3 ? 'block' : 'none',
                lg: 'none'
              }
            }}
          >
            <Card sx={{ mb: 2, bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#10A37F', color: '#FFF', width: 44, height: 44, fontSize: 22 }}>🧙‍♂️</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ECECEC' }}>
                      {currentUser?.username || "Alchimiste"}
                    </Typography>
                    <OpenAIBadge color="primary">
                      {getRankTitle(gold)}
                    </OpenAIBadge>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Code de Synchronisation Multi-Appareils avec 1-Tap Copy */}
                {currentUser?.syncKey && (
                  <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(16, 163, 127, 0.1)', border: '1px solid rgba(16, 163, 127, 0.3)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#1ADA9D', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      📲 VOTRE CODE MULTI-APPAREILS :
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#ECECEC', fontSize: 15, mb: 1 }}>
                      {currentUser.syncKey}
                    </Typography>

                    <OpenAIButton
                      color={copySuccess ? "success" : "primary"}
                      variant="solid"
                      size="sm"
                      fullWidth
                      onClick={copySyncKey}
                    >
                      {copySuccess ? <Check style={{ width: 14, height: 14 }} /> : <ContentCopy style={{ width: 14, height: 14 }} />}
                      {copySuccess ? "Code copié !" : "Copier le Code de Synchronisation"}
                    </OpenAIButton>

                    <Typography variant="caption" sx={{ color: '#B4B4B4', fontSize: 11, display: 'block', mt: 1 }}>
                      Collez ce code sur un autre téléphone, tablette ou PC pour reprendre instantanément votre progression alchimique !
                    </Typography>
                  </Paper>
                )}

                {/* Charger un Compte ou un Code Existant */}
                <Typography variant="caption" sx={{ color: '#B4B4B4', mb: 0.5, display: 'block' }}>
                  🔑 Charger un autre compte ou code :
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Ex: Paracelse ou PARACELSE#4829..."
                    sx={{ bgcolor: '#0D0D0D', borderRadius: 1, '& input': { fontSize: '16px', py: 0.8, color: '#ECECEC' } }}
                  />
                  <OpenAIButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      loginUser(usernameInput);
                      setSnackbar({ open: true, message: 'Compte chargé !', severity: 'success' });
                    }}
                  >
                    Charger
                  </OpenAIButton>
                </Box>

                {/* Statistiques Détaillées */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Quêtes Complétées :</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#ECECEC' }}>
                      {clearedQuests.length} / {quests.length}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Expérience :</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#D4AF37', fontFamily: "'JetBrains Mono', monospace" }}>
                      {gold} XP
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Synchronisation Cloud :</Typography>
                    <OpenAIBadge color="success">Connecté ☁️</OpenAIBadge>
                  </Box>
                </Box>

              </CardContent>
            </Card>
          </Grid>

          {/* ========================================================================= */}
          {/* COLONNE DROITE : SIDEBAR CLASSIQUE VISIBLE SUR DESKTOP (LG)                */}
          {/* ========================================================================= */}
          <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
            
            {/* GRIMOIRE DES QUÊTES (DESKTOP) */}
            <Card sx={{ mb: 2, bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <CardHeader
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: '#ECECEC' }}>Grimoire des Quêtes ({clearedQuests.length}/{quests.length})</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
              />
              <List sx={{ maxHeight: 220, overflowY: 'auto', p: 0.5 }}>
                {quests.map((q) => {
                  const isCleared = clearedQuests.includes(q.id);
                  const isCurrent = q.id === activeQuest.id;
                  return (
                    <ListItemButton
                      key={q.id}
                      selected={isCurrent}
                      onClick={() => selectQuest(q)}
                      sx={{
                        borderRadius: 1,
                        py: 0.8,
                        px: 1,
                        mb: 0.3,
                        bgcolor: isCurrent ? 'rgba(16, 163, 127, 0.15)' : 'transparent',
                        '&.Mui-selected': { bgcolor: 'rgba(16, 163, 127, 0.2)' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 26 }}>
                        {isCleared ? <CheckCircle color="primary" sx={{ fontSize: 16 }} /> : <RadioButtonUnchecked sx={{ fontSize: 16, color: '#676767' }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#1ADA9D' : '#ECECEC', fontSize: 12 }}>
                            #{q.id} {q.title}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Card>

            {/* ASSISTANT ORBIT (DESKTOP) */}
            <Card sx={{ bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'transparent', color: '#10A37F', border: '1px solid rgba(16, 163, 127, 0.4)', width: 26, height: 26 }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>}
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: '#ECECEC' }}>ORBIT (ChatGPT Apps SDK)</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
              />
              <CardContent sx={{ p: 1.5 }}>
                <Box ref={chatScrollRef} sx={{ maxHeight: 150, minHeight: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1 }}>
                  {chatMessages.map((m, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        p: 1,
                        maxWidth: '92%',
                        alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                        bgcolor: m.sender === 'user' ? 'rgba(16, 163, 127, 0.2)' : '#212121',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: 12, color: '#ECECEC' }} dangerouslySetInnerHTML={{ __html: m.text }} />
                    </Paper>
                  ))}
                </Box>

                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 0.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Question…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    sx={{ bgcolor: '#0D0D0D', borderRadius: 1, '& input': { fontSize: 13, py: 0.8, color: '#ECECEC' } }}
                  />
                  <IconButton color="primary" type="submit" size="small" sx={{ p: 1 }}>
                    <Send sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

          </Grid>

        </Grid>

      </Container>

      {/* ========================================================================= */}
      {/* BARRE DE NAVIGATION FIXE BASSE (DOCK MOBILE TACTILE EXCLUSIF < LG)          */}
      {/* ========================================================================= */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          display: { xs: 'flex', lg: 'none' },
          justifyContent: 'space-around',
          alignItems: 'center',
          bgcolor: 'rgba(23, 23, 23, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          pb: 'max(8px, env(safe-area-inset-bottom, 8px))',
          pt: 1,
          px: 1,
        }}
      >
        {[
          { id: 0, label: 'Éditeur', icon: <CodeIcon sx={{ fontSize: 22 }} /> },
          {
            id: 1,
            label: 'Quêtes',
            icon: <MenuBookIcon sx={{ fontSize: 22 }} />,
            badge: `${clearedQuests.length}/${quests.length}`
          },
          { id: 2, label: 'Copilote', icon: <ChatIcon sx={{ fontSize: 22 }} /> },
          { id: 3, label: 'Profil', icon: <AccountCircleIcon sx={{ fontSize: 22 }} /> },
        ].map((tab) => {
          const isActive = mobileTab === tab.id;
          return (
            <Box
              key={tab.id}
              onClick={() => {
                setMobileTab(tab.id);
                triggerHaptic([20]);
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flex: 1,
                py: 0.4,
                borderRadius: 2,
                color: isActive ? '#10A37F' : '#888',
                transition: 'all 0.15s ease',
                position: 'relative',
                '&:active': { transform: 'scale(0.92)' },
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tab.icon}
                {tab.badge && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -12,
                      bgcolor: '#10A37F',
                      color: '#FFF',
                      fontSize: 9,
                      fontWeight: 700,
                      px: 0.5,
                      py: 0.1,
                      borderRadius: 2,
                    }}
                  >
                    {tab.badge}
                  </Box>
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10.5,
                  fontWeight: isActive ? 700 : 500,
                  mt: 0.3,
                  color: isActive ? '#1ADA9D' : '#888',
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Paper>

      {/* MODAL PARCOURS ALCHIMISTE & MULTI-APPAREILS (POUR DESKTOP) */}
      <Dialog open={accountModalOpen} onClose={() => setAccountModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2.5 }}>
          <Avatar sx={{ bgcolor: '#10A37F', color: '#FFF', width: 32, height: 32 }}>🧙‍♂️</Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: '#ECECEC' }}>
            Compte & Synchro Multi-Appareils
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#B4B4B4', mb: 0.5, display: 'block' }}>
                🔑 Nom de compte ou Code de Synchronisation :
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ex: Paracelse ou PARACELSE#4829..."
                  sx={{ bgcolor: '#0D0D0D', borderRadius: 1, '& input': { fontSize: 13, py: 0.8, color: '#ECECEC' } }}
                />
                <OpenAIButton
                  color="primary"
                  size="sm"
                  onClick={() => {
                    loginUser(usernameInput);
                    setAccountModalOpen(false);
                  }}
                >
                  Charger
                </OpenAIButton>
              </Box>

              {currentUser?.syncKey && (
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'rgba(16, 163, 127, 0.1)', border: '1px solid rgba(16, 163, 127, 0.3)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#1ADA9D', fontWeight: 600, display: 'block', mb: 0.3 }}>
                    📲 Votre Code Multi-Appareils :
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#ECECEC', fontSize: 13, mb: 1 }}>
                    {currentUser.syncKey}
                  </Typography>
                  <OpenAIButton
                    color="primary"
                    size="sm"
                    variant="soft"
                    fullWidth
                    onClick={copySyncKey}
                  >
                    {copySuccess ? <Check style={{ width: 14, height: 14 }} /> : <ContentCopy style={{ width: 14, height: 14 }} />}
                    {copySuccess ? "Code copié !" : "Copier le code"}
                  </OpenAIButton>
                  <Typography variant="caption" sx={{ color: '#B4B4B4', fontSize: 11, display: 'block', mt: 0.5 }}>
                    Entrez ce code ou votre nom sur votre téléphone, tablette ou un autre PC pour synchroniser instantanément toute votre progression !
                  </Typography>
                </Paper>
              )}
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Rang Alchimique :</Typography>
                <OpenAIBadge color="primary">{getRankTitle(gold)}</OpenAIBadge>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Quêtes Complétées :</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#ECECEC' }}>
                  {clearedQuests.length} / {quests.length}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Expérience Accumulée :</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#D4AF37', fontFamily: "'JetBrains Mono', monospace" }}>
                  {gold} XP
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#B4B4B4' }}>Sauvegarde Cloud :</Typography>
                <OpenAIBadge color="success">Synchronisé ☁️</OpenAIBadge>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <OpenAIButton variant="ghost" color="secondary" onClick={() => setAccountModalOpen(false)}>
            Fermer
          </OpenAIButton>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR DE NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 70, lg: 24 } }}
      >
        <MuiAlert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontSize: 12 }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

    </Box>
  );
}
