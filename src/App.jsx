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
  AutoStories as AutoStoriesIcon,
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
  { id: 1, name: "Energer", symbol: "🜍", subtitle: "Calcination · docs, factures & fraude" },
  { id: 2, name: "Trust Studio", symbol: "🜔", subtitle: "Distillation · confiance, tokens & traces" },
  { id: 3, name: "Bonne Réponse", symbol: "🜛", subtitle: "Formules · assistant métier BTP" },
  { id: 4, name: "Pipelines IA", symbol: "🜁", subtitle: "Fioles · modèles, files & payloads" },
  { id: 5, name: "Analytics", symbol: "🜃", subtitle: "Rituels · usage, risques & facturation" },
  { id: 6, name: "Launch", symbol: "🝤", subtitle: "Grand Œuvre · routing, audit & workspace" }
];

const getRankTitle = (xp) => {
  if (xp >= 300) return "Grand Alchimiste 🝤";
  if (xp >= 200) return "Maître Alchimiste 🜃";
  if (xp >= 100) return "Adepte 🜛";
  if (xp >= 50) return "Apprenti 🜔";
  return "Initié 🜍";
};

const difficultyTone = (label = '') => {
  const upper = String(label).toUpperCase();
  if (upper.includes('MAÎTRE') || upper.includes('MAITRE')) {
    return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.45)' };
  }
  if (upper.includes('EXPERT')) {
    return { color: '#C084FC', bg: 'rgba(168, 85, 247, 0.16)', border: 'rgba(168, 85, 247, 0.4)' };
  }
  if (upper.includes('AVANC')) {
    return { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.16)', border: 'rgba(251, 146, 60, 0.4)' };
  }
  if (upper.includes('MOYEN')) {
    return { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.14)', border: 'rgba(251, 191, 36, 0.35)' };
  }
  if (upper.includes('FACILE')) {
    return { color: '#34D399', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)' };
  }
  return { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)' };
};

const DifficultyChip = ({ label }) => {
  const tone = difficultyTone(label);
  return (
    <Chip
      size="small"
      label={label || 'FACILE'}
      sx={{
        height: 20,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
        color: tone.color,
        bgcolor: tone.bg,
        border: `1px solid ${tone.border}`,
        '& .MuiChip-label': { px: 0.9 },
      }}
    />
  );
};

const INITIAL_QUEST = {
  id: 1,
  phase: 1,
  title: "La transmutation de la facture",
  difficulty: "FACILE",
  lesson: "Dans Energer, le statut d'un document c'est une variable texte : tu changes le contenu, le dashboard change.",
  lore: "Le vil \"PENDING\" repose dans le creuset d'Energer. Transmute-le en \"VERIFIED\" — le client pro attend l'or du badge vert.",
  objective: "Passe <code>statut</code> de <code>\"PENDING\"</code> à <code>\"VERIFIED\"</code>.",
  initialCode: `// File Energer — facture du jour\nlet statut = "PENDING";\n\nreturn statut;`,
  solutionCode: `let statut = "VERIFIED";\n\nreturn statut;`,
  hint: "Remplace \"PENDING\" par \"VERIFIED\".",
  rewardXP: 16
};

const codeInlineSx = {
  '& code': {
    fontFamily: "'JetBrains Mono', monospace",
    bgcolor: 'rgba(16, 185, 129, 0.16)',
    color: '#6EE7B7',
    px: 0.55,
    py: '1px',
    borderRadius: '4px',
    fontSize: '0.92em',
    fontWeight: 600,
  },
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
  const [readyQuest, setReadyQuest] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState(null);
  const activeQuestIdRef = useRef(INITIAL_QUEST.id);

  // Compte et parcours alchimiste
  const [currentUser, setCurrentUser] = useState(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  const [serverOnline, setServerOnline] = useState(false);
  const [latency, setLatency] = useState(12);
  const [modelName, setModelName] = useState('GEMINI 3.6 FLASH');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'sys', text: 'Console de l\'Athanor initialisée avec succès.' }
  ]);
  const [execTime, setExecTime] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Salut. Je suis ORBIT, Homunculus de Quantum of Trust. On apprend le JS dans le creuset du SaaS IA : Energer, Trust Studio, La Bonne Réponse. Lis le principe, puis transmutes.' }
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
    activeQuestIdRef.current = q.id;
    setCode(q.initialCode);
    setMobileTab(0); // Bascule automatiquement sur l'onglet Éditeur sur mobile
    setLastSuccess(null);
    setLoreOpen(false);
    setReadyQuest((pending) => (pending && pending.id === q.id ? null : pending));
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
    const rawText = `${activeQuest.lesson || ''} ${activeQuest.objective || ''} ${activeQuest.solutionCode || ''} ${activeQuest.initialCode || ''}`;
    
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

    // Mots-clés courants alchimiques et JavaScript
    ['statut', 'PENDING', 'VERIFIED', 'true', 'false', 'tokens', 'confiance', 'modeles', 'file', 'sieges', 'return'].forEach(kw => {
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

  const ingestGeneratedQuest = (quest) => {
    setQuests(prev => {
      if (prev.some(q => q.id === quest.id)) return prev;
      return [...prev, quest];
    });
    setReadyQuest(quest);
    addTerminal('ok', `Nouveau défi prêt dans le grimoire : #${quest.id} ${quest.title}`);
    setSnackbar({ open: true, message: `Nouveau défi prêt : ${quest.title}`, severity: 'info' });
  };

  const triggerSagaGeneration = async (completedId) => {
    setIsForging(true);
    addTerminal('sys', 'Préparation du prochain cas métier...');
    try {
      const res = await fetch('/api/quests/generate-saga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousQuestId: completedId })
      });
      const data = await res.json();
      if (data.success && data.quest) {
        ingestGeneratedQuest(data.quest);
      }
    } catch (err) {} finally {
      setIsForging(false);
    }
  };

  const handleManualForge = async () => {
    const forgedFromId = activeQuest.id;
    setIsForging(true);
    try {
      const res = await fetch('/api/quests/generate-saga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousQuestId: activeQuest.id, phase: activeQuest.phase })
      });
      const data = await res.json();
      if (data.success && data.quest) {
        if (activeQuestIdRef.current === forgedFromId) {
          setQuests(prev => (prev.some(q => q.id === data.quest.id) ? prev : [...prev, data.quest]));
          selectQuest(data.quest);
          setSnackbar({ open: true, message: 'Nouveau cas métier ouvert.', severity: 'info' });
        } else {
          ingestGeneratedQuest(data.quest);
        }
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
      setChatMessages(prev => [...prev, { sender: 'bot', text: activeQuest.lesson ? `Le principe : ${activeQuest.lesson.replace(/<\/?code>/g, '')} — ${activeQuest.hint}` : `Indice : ${activeQuest.hint}` }]);
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

  const orderedQuests = useMemo(
    () => [...quests].sort((a, b) => a.id - b.id),
    [quests]
  );
  const filteredQuests = phaseFilter
    ? orderedQuests.filter(q => q.phase === phaseFilter)
    : orderedQuests;

  return (
    <Box sx={{ minHeight: '100dvh', pb: { xs: 10, lg: 5 }, bgcolor: '#05070A', color: '#F8FAFC' }}>
      
      {/* HEADER ULTRA-RESPONSIVE CYBER-ALCHIMIQUE SMARTPHONES & DESKTOP */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(12, 16, 26, 0.95)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', backdropFilter: 'blur(16px)', zIndex: 1000 }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 0.8, sm: 0.5 }, minHeight: { xs: 48, sm: 56 }, px: { xs: 0.5, sm: 2 } }}>
            
            {/* Branding & Status Alchimique */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Avatar sx={{
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                width: { xs: 30, sm: 34 },
                height: { xs: 30, sm: 34 },
                fontSize: { xs: 16, sm: 18 },
                boxShadow: '0 0 14px rgba(245, 158, 11, 0.3)'
              }}>
                🜔
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 900, letterSpacing: '0.06em', color: '#FBBF24', fontSize: { xs: 13, sm: 15 }, lineHeight: 1.1 }}>
                  QUANTUM RUN
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "'Cinzel', serif", color: '#94A3B8', fontSize: { xs: 8.5, sm: 9.5 }, letterSpacing: '0.12em', textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
                  Opus Magnum · SaaS IA pour les pros
                </Typography>
              </Box>

              {/* Statut Athanor Ping Minimaliste sur Mobile */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: { xs: 0.5, sm: 1 } }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: serverOnline ? '#10B981' : '#EF4444',
                    boxShadow: serverOnline ? '0 0 8px #10B981' : 'none',
                    display: { xs: 'block', sm: 'none' }
                  }}
                />
                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <OpenAIBadge color={serverOnline ? "success" : "secondary"}>
                    {serverOnline ? `${latency}ms Athanor` : "ATHANOR ÉTEINT"}
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

            {/* Statistiques Or Alchimique & Bouton Arcanes / Synchro */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1 } }}>
              <OpenAIBadge color="warning">
                🪙 {gold} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>XP Or</Box>
              </OpenAIBadge>

              {/* Titre de Rang Alchimique */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <OpenAIBadge color="secondary">
                  {getRankTitle(gold)}
                </OpenAIBadge>
              </Box>

              {/* Bouton Sceau / Profil */}
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
                  {currentUser?.username || "Alchimiste"}
                </Box>
              </OpenAIButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 3 } }}>
        
        {/* BARRE DES CHAMBRES ALCHIMIQUES (SCROLL HORIZONTAL TOUCH MOMENTUM) */}
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
                  borderColor: isCurrent ? '#F59E0B' : 'rgba(245, 158, 11, 0.18)',
                  bgcolor: isCurrent ? 'rgba(245, 158, 11, 0.16)' : '#0C101A',
                  boxShadow: isCurrent ? '0 0 14px rgba(245, 158, 11, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: isCurrent ? '#FBBF24' : '#94A3B8', fontSize: { xs: 11, sm: 12 }, whiteSpace: 'nowrap' }}>
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
            <Card sx={{ mb: 2, bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                
                {/* Entête Rituel : Titre Alchimique, XP Or et Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#F8FAFC', fontSize: { xs: 14, sm: 17 } }}>
                      #{activeQuest.id} {activeQuest.title}
                    </Typography>
                    <DifficultyChip label={activeQuest.difficulty || 'FACILE'} />
                    <OpenAIBadge color="warning">
                      +{activeQuest.rewardXP || 16} XP Or
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
                      {isForging ? <CircularProgress size={12} sx={{ color: '#F59E0B' }} /> : <AutoAwesome style={{ width: 14, height: 14 }} />}
                      {isForging ? "Forge..." : "Forger (IA)"}
                    </OpenAIButton>
                    <IconButton
                      size="small"
                      disabled={activeQuest.id <= 1}
                      onClick={() => {
                        const idx = orderedQuests.findIndex(q => q.id === activeQuest.id);
                        if (idx > 0) selectQuest(orderedQuests[idx - 1]);
                      }}
                      sx={{ p: { xs: 0.5, sm: 1 }, color: '#94A3B8' }}
                    >
                      <NavigateBefore fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={activeQuest.id >= orderedQuests[orderedQuests.length - 1]?.id}
                      onClick={() => {
                        const idx = orderedQuests.findIndex(q => q.id === activeQuest.id);
                        if (idx < orderedQuests.length - 1) selectQuest(orderedQuests[idx + 1]);
                      }}
                      sx={{ p: { xs: 0.5, sm: 1 }, color: '#94A3B8' }}
                    >
                      <NavigateNext fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Micro-cours : le principe AVANT le défi */}
                {activeQuest.lesson && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.15, sm: 1.35 },
                      mb: 1.2,
                      bgcolor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderLeft: '3px solid #10B981',
                      borderRadius: 1,
                      boxShadow: '0 0 18px rgba(16, 185, 129, 0.08)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'Cinzel', serif",
                        color: '#34D399',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                        mb: 0.45,
                        fontSize: 11,
                      }}
                    >
                      <AutoStoriesIcon sx={{ fontSize: 14, color: '#34D399' }} />
                      Le principe
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#E2E8F0', fontWeight: 500, fontSize: { xs: 13, sm: 14 }, lineHeight: 1.55, ...codeInlineSx }}
                      dangerouslySetInnerHTML={{ __html: activeQuest.lesson }}
                    />
                  </Paper>
                )}

                {/* Récit de l'Athanor (Rétractable sur smartphone pour économiser la hauteur d'écran) */}
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
                        bgcolor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        mb: loreOpen ? 0.8 : 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#FBBF24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        📜 Récit de l'Athanor {loreOpen ? '(masquer)' : '(dérouler)'}
                      </Typography>
                      {loreOpen ? <ExpandLess fontSize="small" sx={{ color: '#FBBF24' }} /> : <ExpandMore fontSize="small" sx={{ color: '#FBBF24' }} />}
                    </Box>

                    {/* Contenu rétractable sur mobile */}
                    <Collapse in={loreOpen} sx={{ display: { xs: 'block', sm: 'none' } }}>
                      <Box sx={{ p: 1.2, bgcolor: 'rgba(245, 158, 11, 0.06)', borderRadius: 1, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <Typography variant="body2" sx={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.5 }}>
                          {activeQuest.lore}
                        </Typography>
                      </Box>
                    </Collapse>

                    {/* Visible directement sur tablette & desktop */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, p: 1.2, bgcolor: 'rgba(245, 158, 11, 0.06)', borderRadius: 1, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic', fontSize: 13, lineHeight: 1.55 }}>
                        {activeQuest.lore}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Action à jouer — après le principe */}
                <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.2 }, bgcolor: '#070A10', borderLeft: '3px solid #F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: "'Cinzel', serif", color: '#F59E0B', fontWeight: 700, letterSpacing: '0.06em', display: 'block', mb: 0.3, fontSize: 11 }}>
                    À toi
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 500, fontSize: { xs: 12.5, sm: 13 }, ...codeInlineSx }} dangerouslySetInnerHTML={{ __html: activeQuest.objective }} />
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
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #F59E0B',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#F59E0B', fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontFamily: "'Cinzel', serif", color: '#FBBF24', fontWeight: 700, fontSize: 13 }}>
                      Cas validé — +{lastSuccess.rewardXP} XP
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10B981', fontSize: 11 }}>
                      Cas validé. Tu viens de faire le même geste qu'en prod.
                    </Typography>
                  </Box>
                </Box>

                {(readyQuest || activeQuest.id < quests[quests.length - 1]?.id) && (
                  <OpenAIButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      if (readyQuest) {
                        selectQuest(readyQuest);
                        return;
                      }
                      const idx = quests.findIndex(q => q.id === activeQuest.id);
                      if (idx < quests.length - 1) {
                        selectQuest(quests[idx + 1]);
                      }
                    }}
                  >
                    Cas suivant <NavigateNext style={{ width: 14, height: 14 }} />
                  </OpenAIButton>
                )}
              </Paper>
            )}

            {readyQuest && readyQuest.id !== activeQuest.id && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.3,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700, letterSpacing: '0.06em', display: 'block' }}>
                    Prêt dans le grimoire — on ne t'a pas interrompu
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600 }}>
                    #{readyQuest.id} {readyQuest.title}
                  </Typography>
                </Box>
                <OpenAIButton color="secondary" size="sm" onClick={() => selectQuest(readyQuest)}>
                  Ouvrir quand tu veux <NavigateNext style={{ width: 14, height: 14 }} />
                </OpenAIButton>
              </Paper>
            )}

            {/* ÉDITEUR DE CODE AVEC CLAVIER D'ACCESSOIRES TACTILE */}
            <Card sx={{ mb: 2, overflow: 'hidden', bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              
              {/* Barre de titre du creuset & Actions Rapides */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.8, bgcolor: 'rgba(12, 16, 26, 0.8)', borderBottom: '1px solid rgba(245, 158, 11, 0.15)', flexWrap: 'wrap', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science sx={{ fontSize: 15, color: '#F59E0B' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#CBD5E1', fontSize: 11.5, fontWeight: 600 }}>
                    creuset.js · Athanor
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => setCode(activeQuest.initialCode)}>
                    <Refresh style={{ width: 12, height: 12 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Réinitialiser</Box>
                  </OpenAIButton>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => addTerminal('sys', `💡 Grimoire : ${activeQuest.hint}`)}>
                    <Lightbulb style={{ width: 12, height: 12 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Indice</Box>
                  </OpenAIButton>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => setCode(activeQuest.solutionCode)}>
                    <VpnKey style={{ width: 12, height: 12 }} /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Solution</Box>
                  </OpenAIButton>
                </Box>
              </Box>

              {/* BARRE D'ACCESSOIRES TOUCH DÉVELOPPEUR */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1,
                  py: 0.6,
                  bgcolor: '#080C14',
                  borderBottom: '1px solid rgba(245, 158, 11, 0.12)',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', mr: 0.3, flexShrink: 0 }}>
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
                      bgcolor: '#101726',
                      color: '#F8FAFC',
                      border: '1px solid rgba(245, 158, 11, 0.18)',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      userSelect: 'none',
                      '&:active': { bgcolor: '#F59E0B', color: '#05070A' },
                    }}
                  >
                    {keyItem.label}
                  </Paper>
                ))}

                {/* Puces intelligentes alchimiques déduites du contexte de l'athanor */}
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
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34D399',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11.5,
                      fontWeight: 700,
                      userSelect: 'none',
                      '&:active': { bgcolor: '#10B981', color: '#05070A' },
                    }}
                  >
                    +{token}
                  </Paper>
                ))}
              </Box>

              {/* Workspace Code (Anti-Zoom iOS Safari & Clavier Tactile) */}
              <Box sx={{ display: 'flex', minHeight: { xs: 170, sm: 200 }, maxHeight: { xs: 260, sm: 320 }, bgcolor: '#05070A' }}>
                <Box
                  ref={gutterRef}
                  sx={{
                    width: { xs: 28, sm: 36 },
                    py: 1.2,
                    px: { xs: 0.4, sm: 0.8 },
                    textAlign: 'right',
                    color: '#64748B',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: { xs: 12, sm: 13 },
                    lineHeight: 1.6,
                    userSelect: 'none',
                    borderRight: '1px solid rgba(245, 158, 11, 0.12)',
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
                    color: '#F8FAFC',
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

              {/* Barre d'Action avec Bouton Transmuter Alchimique */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 1.2 }, bgcolor: 'rgba(12, 16, 26, 0.8)', borderTop: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, display: { xs: 'none', sm: 'block' } }}>
                  Ctrl + Entrée · Transmutation instantanée
                </Typography>
                <OpenAIButton
                  color="primary"
                  size="md"
                  fullWidth
                  onClick={handleTransmute}
                  style={{ minHeight: 46 }}
                >
                  ⚗️ TRANSMUTER LA MATIÈRE <PlayArrow style={{ width: 16, height: 16 }} />
                </OpenAIButton>
              </Box>
            </Card>

            {/* CONSOLE DE L'ATHANOR */}
            <Paper elevation={0} sx={{ bgcolor: '#05070A', borderRadius: 2, border: '1px solid rgba(245, 158, 11, 0.2)', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.6, bgcolor: '#0C101A', borderBottom: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#FBBF24', fontSize: 11 }}>
                    CONSOLE DE L'ATHANOR
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontSize: 11 }}>
                  {execTime}
                </Typography>
              </Box>

              <Box ref={terminalRef} sx={{ p: 1.5, maxHeight: { xs: 140, sm: 130 }, minHeight: 70, overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {terminalLogs.map((log, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      color: log.type === 'ok' ? '#10B981' : log.type === 'fail' ? '#EF4444' : '#F59E0B',
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

          {/* ONGLET GRIMOIRE DES QUÊTES MOBILE PLEIN ÉCRAN */}
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
            {/* Progression Alchimique Globale */}
            <Card sx={{ mb: 2, bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#FBBF24' }}>
                    Progression du Grand Œuvre
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
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #F59E0B 0%, #10B981 100%)'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Filtres de Chambres Alchimiques */}
            <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.5, '&::-webkit-scrollbar': { display: 'none' } }}>
              <Chip
                label="Tous les produits"
                size="small"
                onClick={() => setPhaseFilter(null)}
                sx={{
                  bgcolor: phaseFilter === null ? '#F59E0B' : '#0C101A',
                  color: phaseFilter === null ? '#05070A' : '#94A3B8',
                  fontWeight: 700,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              />
              {phases.map(ph => (
                <Chip
                  key={ph.id}
                  label={`${ph.symbol} ${ph.name}`}
                  size="small"
                  onClick={() => setPhaseFilter(ph.id)}
                  sx={{
                    bgcolor: phaseFilter === ph.id ? '#F59E0B' : '#0C101A',
                    color: phaseFilter === ph.id ? '#05070A' : '#94A3B8',
                    fontWeight: 700,
                    border: '1px solid rgba(245, 158, 11, 0.3)',
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
                      borderColor: isCurrent ? '#F59E0B' : 'rgba(245, 158, 11, 0.15)',
                      bgcolor: isCurrent ? 'rgba(245, 158, 11, 0.15)' : '#0C101A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:active': { bgcolor: 'rgba(245, 158, 11, 0.25)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {isCleared ? (
                        <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ color: '#64748B', fontSize: 20 }} />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: "'Cinzel', serif", fontWeight: isCurrent ? 700 : 600, color: isCurrent ? '#FBBF24' : '#F8FAFC', fontSize: 13 }}>
                          #{q.id} {q.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.25, flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>
                            {phases.find(p => p.id === q.phase)?.name || 'Produit'}
                            {q.isGenerated ? ' • nouveau' : ''}
                            {readyQuest && readyQuest.id === q.id ? ' • prêt' : ''}
                          </Typography>
                          <DifficultyChip label={q.difficulty || 'FACILE'} />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OpenAIBadge color="warning">
                        +{q.rewardXP || 16} XP Or
                      </OpenAIBadge>
                      <NavigateNext sx={{ color: '#64748B', fontSize: 18 }} />
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Grid>

          {/* ONGLET HOMUNCULUS ORBIT PLEIN ÉCRAN */}
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
            <Card sx={{ bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)', minHeight: 'calc(100dvh - 200px)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)', width: 30, height: 30, fontSize: 16 }}>🔮</Avatar>}
                title={<Typography variant="subtitle2" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: '#FBBF24' }}>ORBIT · Homunculus Alchimiste</Typography>}
                subheader={<Typography variant="caption" sx={{ color: '#10B981', fontSize: 11 }}>{modelName} • Connaissance de l'Athanor</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(245, 158, 11, 0.15)' }}
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
                        bgcolor: m.sender === 'user' ? 'rgba(245, 158, 11, 0.18)' : '#070A10',
                        border: '1px solid',
                        borderColor: m.sender === 'user' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.15)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: 13, color: '#F8FAFC', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: m.text }} />
                    </Paper>
                  ))}
                </Box>

                {/* Suggestions Rapides Hermétiques en 1 Tap */}
                <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 1, mb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                  {[
                    "Explique-moi le principe",
                    "Je bloque, aide-moi sans spoiler",
                    "Montre-moi juste un indice",
                    "Pourquoi ça marche comme ça ?",
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
                        bgcolor: '#101726',
                        borderRadius: 2,
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        cursor: 'pointer',
                        fontSize: 11.5,
                        color: '#F8FAFC',
                        '&:active': { bgcolor: '#F59E0B', color: '#05070A' }
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
                    placeholder="Consulter l'Homunculus ORBIT…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    sx={{
                      bgcolor: '#05070A',
                      borderRadius: 1.5,
                      '& input': { fontSize: '16px', py: 1, color: '#F8FAFC' } // 16px empêche le zoom iOS
                    }}
                  />
                  <IconButton color="primary" type="submit" sx={{ p: 1.2, bgcolor: '#F59E0B', color: '#05070A', '&:hover': { bgcolor: '#FBBF24' } }}>
                    <Send sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

              </CardContent>
            </Card>
          </Grid>

          {/* ONGLET ARCANES & SYNCHRONISATION MULTI-APPAREILS PLEIN ÉCRAN */}
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
            <Card sx={{ mb: 2, bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', border: '1px solid #F59E0B', width: 44, height: 44, fontSize: 22 }}>🧙‍♂️</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#FBBF24' }}>
                      {currentUser?.username || "Alchimiste"}
                    </Typography>
                    <OpenAIBadge color="secondary">
                      {getRankTitle(gold)}
                    </OpenAIBadge>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: 'rgba(245, 158, 11, 0.15)' }} />

                {/* Sceau de Synchronisation Multi-Appareils avec 1-Tap Copy */}
                {currentUser?.syncKey && (
                  <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#FBBF24', fontWeight: 700, display: 'block', mb: 0.5, fontFamily: "'Cinzel', serif" }}>
                      📲 VOTRE SCEAU HERMÉTIQUE MULTI-APPAREILS :
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#F8FAFC', fontSize: 15, mb: 1 }}>
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
                      {copySuccess ? "Sceau copié !" : "Copier le Sceau Alchimique"}
                    </OpenAIButton>

                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, display: 'block', mt: 1 }}>
                      Transférez ce sceau sur votre smartphone, tablette ou PC pour reprendre instantanément votre creuset et vos transmutations !
                    </Typography>
                  </Paper>
                )}

                {/* Charger un Compte ou un Sceau Existant */}
                <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block' }}>
                  🔑 Charger un autre sceau alchimique :
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Ex: Paracelse ou PARACELSE#4829..."
                    sx={{ bgcolor: '#05070A', borderRadius: 1, '& input': { fontSize: '16px', py: 0.8, color: '#F8FAFC' } }}
                  />
                  <OpenAIButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      loginUser(usernameInput);
                      setSnackbar({ open: true, message: 'Sceau alchimique chargé !', severity: 'success' });
                    }}
                  >
                    Invoquer
                  </OpenAIButton>
                </Box>

                {/* Statistiques Détaillées */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>Rituels Accomplys :</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#F8FAFC' }}>
                      {clearedQuests.length} / {quests.length}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>Or Alchimique :</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#FBBF24', fontFamily: "'JetBrains Mono', monospace" }}>
                      {gold} XP
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>Sauvegarde Astrale :</Typography>
                    <OpenAIBadge color="success">Synchronisé ☁️</OpenAIBadge>
                  </Box>
                </Box>

              </CardContent>
            </Card>
          </Grid>

          {/* ========================================================================= */}
          {/* COLONNE DROITE : SIDEBAR CLASSIQUE VISIBLE SUR DESKTOP (LG)                */}
          {/* ========================================================================= */}
          <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
            
            {/* GRIMOIRE DU GRAND ŒUVRE (DESKTOP) */}
            <Card sx={{ mb: 2, bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardHeader
                title={<Typography variant="subtitle2" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: '#FBBF24' }}>Grimoire Quantum of Trust ({clearedQuests.length}/{quests.length})</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(245, 158, 11, 0.15)' }}
              />
              <List sx={{ maxHeight: 220, overflowY: 'auto', p: 0.5 }}>
                {orderedQuests.map((q) => {
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
                        bgcolor: isCurrent ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                        '&.Mui-selected': { bgcolor: 'rgba(245, 158, 11, 0.2)' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 26 }}>
                        {isCleared ? <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} /> : <RadioButtonUnchecked sx={{ fontSize: 16, color: '#64748B' }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#FBBF24' : (readyQuest && readyQuest.id === q.id ? '#34D399' : '#F8FAFC'), fontSize: 12 }}>
                            #{q.id} {q.title}{q.isGenerated ? ' · nouveau' : ''}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: difficultyTone(q.difficulty).color, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                            {q.difficulty || 'FACILE'} · +{q.rewardXP || 16} XP
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Card>

            {/* HOMUNCULUS ORBIT (DESKTOP) */}
            <Card sx={{ bgcolor: '#0C101A', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)', width: 26, height: 26, fontSize: 14 }}>🔮</Avatar>}
                title={<Typography variant="subtitle2" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: '#FBBF24' }}>ORBIT · Homunculus Alchimiste</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(245, 158, 11, 0.15)' }}
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
                        bgcolor: m.sender === 'user' ? 'rgba(245, 158, 11, 0.18)' : '#070A10',
                        border: '1px solid',
                        borderColor: m.sender === 'user' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.15)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: 12, color: '#F8FAFC' }} dangerouslySetInnerHTML={{ __html: m.text }} />
                    </Paper>
                  ))}
                </Box>

                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 0.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Question à ORBIT…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    sx={{ bgcolor: '#05070A', borderRadius: 1, '& input': { fontSize: 13, py: 0.8, color: '#F8FAFC' } }}
                  />
                  <IconButton color="primary" type="submit" size="small" sx={{ p: 1, bgcolor: '#F59E0B', color: '#05070A', '&:hover': { bgcolor: '#FBBF24' } }}>
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
          bgcolor: 'rgba(9, 13, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(245, 158, 11, 0.25)',
          pb: 'max(8px, env(safe-area-inset-bottom, 8px))',
          pt: 1,
          px: 1,
        }}
      >
        {[
          { id: 0, label: 'Creuset', icon: <Science sx={{ fontSize: 22 }} /> },
          {
            id: 1,
            label: 'Grimoire',
            icon: <MenuBookIcon sx={{ fontSize: 22 }} />,
            badge: `${clearedQuests.length}/${quests.length}`
          },
          { id: 2, label: 'Homunculus', icon: <SmartToy sx={{ fontSize: 22 }} /> },
          { id: 3, label: 'Arcanes', icon: <AccountCircleIcon sx={{ fontSize: 22 }} /> },
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
                color: isActive ? '#F59E0B' : '#64748B',
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
                      bgcolor: '#F59E0B',
                      color: '#05070A',
                      fontSize: 9,
                      fontWeight: 800,
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
                  color: isActive ? '#FBBF24' : '#64748B',
                  fontFamily: isActive ? "'Cinzel', serif" : 'inherit',
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2.5, bgcolor: '#0C101A' }}>
          <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', border: '1px solid #F59E0B', width: 32, height: 32 }}>🧙‍♂️</Avatar>
          <Typography variant="h6" sx={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: '#FBBF24' }}>
            Sceau & Arcanes de l'Alchimiste
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, bgcolor: '#0C101A' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block' }}>
                🔑 Nom de compte ou Sceau Alchimique :
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ex: Paracelse ou PARACELSE#4829..."
                  sx={{ bgcolor: '#05070A', borderRadius: 1, '& input': { fontSize: 13, py: 0.8, color: '#F8FAFC' } }}
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
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#FBBF24', fontWeight: 600, display: 'block', mb: 0.3, fontFamily: "'Cinzel', serif" }}>
                    📲 Sceau Hermétique Multi-Appareils :
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#F8FAFC', fontSize: 13, mb: 1 }}>
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
                    {copySuccess ? "Sceau copié !" : "Copier le sceau"}
                  </OpenAIButton>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, display: 'block', mt: 0.5 }}>
                    Entrez ce sceau sur votre smartphone ou tablette pour reprendre instantanément votre progression alchimique !
                  </Typography>
                </Paper>
              )}
            </Box>

            <Divider sx={{ my: 0.5, borderColor: 'rgba(245, 158, 11, 0.15)' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Rang Alchimique :</Typography>
                <OpenAIBadge color="secondary">{getRankTitle(gold)}</OpenAIBadge>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Rituels Accomplys :</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#F8FAFC' }}>
                  {clearedQuests.length} / {quests.length}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Or Alchimique (XP) :</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FBBF24', fontFamily: "'JetBrains Mono', monospace" }}>
                  {gold} XP
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Sauvegarde Astrale :</Typography>
                <OpenAIBadge color="success">Synchronisé ☁️</OpenAIBadge>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, bgcolor: '#0C101A', borderTop: '1px solid rgba(245, 158, 11, 0.15)' }}>
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
