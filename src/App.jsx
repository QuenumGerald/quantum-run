import React, { useState, useEffect, useRef } from 'react';
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
  const [mobileTab, setMobileTab] = useState(0); // 0: Code, 1: Grimoire, 2: Copilote ORBIT

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

  const handleScroll = (e) => {
    if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
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
    addTerminal('sys', `Quête #${q.id} active : ${q.title}`);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const addTerminal = (type, text) => {
    setTerminalLogs(prev => [...prev, { type, text }]);
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

        setSnackbar({ open: true, message: '✨ Transmutation réussie !', severity: 'success' });
        triggerSagaGeneration(activeQuest.id);
      } else {
        synth.playError();
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

  return (
    <Box sx={{ minHeight: '100vh', pb: 6, bgcolor: '#0D0D0D' }}>
      
      {/* HEADER AVEC DESIGN TOKENS ET OPENAI APPS SDK UI */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#171717', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.5, minHeight: 56 }}>
            
            {/* Branding OpenAI Apps Compatible */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'transparent', color: '#10A37F', border: '1px solid rgba(16, 163, 127, 0.4)', width: 32, height: 32, fontSize: 16 }}>
                🜔
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: '#ECECEC', fontSize: 15 }}>
                QUANTUM RUN
              </Typography>

              {/* Badges de statut OpenAI Apps SDK */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <OpenAIBadge color={serverOnline ? "success" : "secondary"}>
                  {serverOnline ? `${latency}ms` : "OFFLINE"}
                </OpenAIBadge>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <OpenAIBadge color="primary">
                  {modelName}
                </OpenAIBadge>
              </Box>
            </Box>

            {/* Statistiques & Profil avec OpenAI UI Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <OpenAIBadge color="warning">
                🪙 {gold} XP
              </OpenAIBadge>
              <OpenAIBadge color="secondary">
                {getRankTitle(gold)}
              </OpenAIBadge>

              <OpenAIButton
                variant="soft"
                color="secondary"
                size="sm"
                onClick={() => setAccountModalOpen(true)}
              >
                <Person style={{ width: 14, height: 14 }} />
                {currentUser?.username || "Compte"}
              </OpenAIButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, px: { xs: 1.5, sm: 3 } }}>
        
        {/* BARRE DES PHASES (SCROLL HORIZONTAL TOUCH SUR MOBILE) */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
          {phases.map((ph) => {
            const isCurrent = activeQuest.phase === ph.id;
            return (
              <Paper
                key={ph.id}
                elevation={0}
                onClick={() => {
                  const firstInPhase = quests.find(q => q.phase === ph.id);
                  if (firstInPhase) selectQuest(firstInPhase);
                }}
                sx={{
                  flexShrink: 0,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isCurrent ? '#10A37F' : 'rgba(255, 255, 255, 0.12)',
                  bgcolor: isCurrent ? 'rgba(16, 163, 127, 0.18)' : '#171717',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: '#10A37F' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: isCurrent ? '#1ADA9D' : '#ECECEC', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {ph.symbol} {ph.name}
                </Typography>
              </Paper>
            );
          })}
        </Box>

        {/* BARRE DE NAVIGATION ONGLETS (EXCLUSIF MOBILE XS / SM / MD) */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, gap: 0.5, mb: 2, bgcolor: '#171717', p: 0.5, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <OpenAIButton
            fullWidth
            size="sm"
            variant={mobileTab === 0 ? "solid" : "ghost"}
            color={mobileTab === 0 ? "primary" : "secondary"}
            onClick={() => setMobileTab(0)}
          >
            ⚡ Exercice & Code
          </OpenAIButton>
          <OpenAIButton
            fullWidth
            size="sm"
            variant={mobileTab === 1 ? "solid" : "ghost"}
            color={mobileTab === 1 ? "primary" : "secondary"}
            onClick={() => setMobileTab(1)}
          >
            📜 Quêtes ({clearedQuests.length}/{quests.length})
          </OpenAIButton>
          <OpenAIButton
            fullWidth
            size="sm"
            variant={mobileTab === 2 ? "solid" : "ghost"}
            color={mobileTab === 2 ? "primary" : "secondary"}
            onClick={() => setMobileTab(2)}
          >
            💬 Copilote
          </OpenAIButton>
        </Box>

        {/* COCKPIT PRINCIPAL */}
        <Grid container spacing={2.5}>
          
          {/* COLONNE GAUCHE : QUÊTE & ÉDITEUR (AFFICHÉ SUR MOBILE QUAND mobileTab === 0, OU SUR DESKTOP) */}
          <Grid item xs={12} lg={8} sx={{ display: { xs: mobileTab === 0 ? 'block' : 'none', lg: 'block' } }}>
            
            {/* CARTE DE QUÊTE */}
            <Card sx={{ mb: 2, bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ECECEC', fontSize: { xs: 15, sm: 17 } }}>
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
                      {isForging ? "Forge..." : "Forger (IA)"}
                    </OpenAIButton>
                    <IconButton
                      size="small"
                      disabled={activeQuest.id <= 1}
                      onClick={() => {
                        const idx = quests.findIndex(q => q.id === activeQuest.id);
                        if (idx > 0) selectQuest(quests[idx - 1]);
                      }}
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
                    >
                      <NavigateNext fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Récit Lore */}
                {activeQuest.lore && (
                  <Box sx={{ mb: 1.5, p: 1.2, bgcolor: 'rgba(16, 163, 127, 0.08)', borderRadius: 1, border: '1px solid rgba(16, 163, 127, 0.2)' }}>
                    <Typography variant="body2" sx={{ color: '#B4B4B4', fontStyle: 'italic', fontSize: 13, lineHeight: 1.5 }}>
                      📜 {activeQuest.lore}
                    </Typography>
                  </Box>
                )}

                {/* Objectif Direct */}
                <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#212121', borderLeft: '3px solid #10A37F', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#10A37F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.3 }}>
                    Objectif du Rituel
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ECECEC', fontWeight: 500, fontSize: 13 }} dangerouslySetInnerHTML={{ __html: activeQuest.objective }} />
                </Paper>

              </CardContent>
            </Card>

            {/* ÉDITEUR DE CODE */}
            <Card sx={{ mb: 2, overflow: 'hidden', bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.8, bgcolor: '#212121', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', flexWrap: 'wrap', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science sx={{ fontSize: 14, color: '#10A37F' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#B4B4B4', fontSize: 11 }}>
                    creuset.js
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => setCode(activeQuest.initialCode)}>
                    <Refresh style={{ width: 12, height: 12 }} /> Reset
                  </OpenAIButton>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => addTerminal('sys', `💡 Indice : ${activeQuest.hint}`)}>
                    <Lightbulb style={{ width: 12, height: 12 }} /> Indice
                  </OpenAIButton>
                  <OpenAIButton size="sm" variant="ghost" color="secondary" onClick={() => setCode(activeQuest.solutionCode)}>
                    <VpnKey style={{ width: 12, height: 12 }} /> Solution
                  </OpenAIButton>
                </Box>
              </Box>

              {/* Workspace Code (Adapté Clavier Tactile Mobile) */}
              <Box sx={{ display: 'flex', minHeight: 180, maxHeight: 320, bgcolor: '#0D0D0D' }}>
                <Box
                  ref={gutterRef}
                  sx={{
                    width: 36,
                    py: 1.5,
                    px: 0.8,
                    textAlign: 'right',
                    color: '#676767',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
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
                  spellCheck="false"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    padding: '12px 14px',
                    color: '#ECECEC',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre',
                    tabSize: 2,
                    overflowY: 'auto',
                    touchAction: 'manipulation',
                  }}
                />
              </Box>

              {/* Action Bar avec OpenAIButton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: '#212121', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <Typography variant="caption" sx={{ color: '#B4B4B4', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, display: { xs: 'none', sm: 'block' } }}>
                  Ctrl + Entrée
                </Typography>
                <OpenAIButton
                  color="primary"
                  size="md"
                  fullWidth
                  onClick={handleTransmute}
                  style={{ minHeight: 42 }}
                >
                  TRANSMUTER <PlayArrow style={{ width: 16, height: 16 }} />
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

              <Box ref={terminalRef} sx={{ p: 1.5, maxHeight: 130, minHeight: 80, overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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

          {/* COLONNE DROITE : SIDEBAR & ORBIT (GESTION TOUCH & TABS MOBILE) */}
          <Grid item xs={12} lg={4} sx={{ display: { xs: (mobileTab === 1 || mobileTab === 2) ? 'block' : 'none', lg: 'block' } }}>
            
            {/* GRIMOIRE DES QUÊTES (AFFICHÉ SUR MOBILE QUAND mobileTab === 1, OU SUR DESKTOP) */}
            <Card sx={{ mb: 2, bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)', display: { xs: mobileTab === 1 ? 'block' : 'none', lg: 'block' } }}>
              <CardHeader
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: '#ECECEC' }}>Grimoire des Quêtes ({clearedQuests.length}/{quests.length})</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
              />
              <List sx={{ maxHeight: { xs: 350, lg: 220 }, overflowY: 'auto', p: 0.5 }}>
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

            {/* ASSISTANT ORBIT (AFFICHÉ SUR MOBILE QUAND mobileTab === 2, OU SUR DESKTOP) */}
            <Card sx={{ bgcolor: '#171717', border: '1px solid rgba(255, 255, 255, 0.12)', display: { xs: mobileTab === 2 ? 'block' : 'none', lg: 'block' } }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'transparent', color: '#10A37F', border: '1px solid rgba(16, 163, 127, 0.4)', width: 26, height: 26 }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>}
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: '#ECECEC' }}>ORBIT (ChatGPT Apps SDK)</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
              />
              <CardContent sx={{ p: 1.5 }}>
                <Box ref={chatScrollRef} sx={{ maxHeight: { xs: 260, lg: 150 }, minHeight: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1 }}>
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

      {/* MODAL PARCOURS ALCHIMISTE & MULTI-APPAREILS */}
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
                  <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#ECECEC', fontSize: 13 }}>
                    {currentUser.syncKey}
                  </Typography>
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

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontSize: 12 }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

    </Box>
  );
}
