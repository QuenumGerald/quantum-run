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
  Button,
  IconButton,
  Tooltip,
  Chip,
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
  Alert,
  Paper,
  Divider,
} from '@mui/material';

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
  PersonAdd,
  EmojiEvents,
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
  { id: 1, name: "Calcination", symbol: "🜍" },
  { id: 2, name: "Distillation", symbol: "🜔" },
  { id: 3, name: "Formules", symbol: "🜛" },
  { id: 4, name: "Fioles", symbol: "🜁" },
  { id: 5, name: "Rituels", symbol: "🜃" },
  { id: 6, name: "Grand Œuvre", symbol: "🝤" }
];

const INITIAL_QUEST = {
  id: 1,
  phase: 1,
  title: "Transmutation du Plomb",
  difficulty: "FACILE",
  lore: "Transmutez le plomb en or pur.",
  objective: "Changez la valeur de <code>metal</code> pour <code>\"gold\"</code>.",
  initialCode: `// Transmutez le plomb en or\nlet metal = "lead";\n\nreturn metal;`,
  solutionCode: `let metal = "gold";\n\nreturn metal;`,
  hint: "Remplace \"lead\" par \"gold\".",
  rewardXP: 16
};

export default function App() {
  const [quests, setQuests] = useState([INITIAL_QUEST]);
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [activeQuest, setActiveQuest] = useState(INITIAL_QUEST);
  const [code, setCode] = useState(INITIAL_QUEST.initialCode);
  const [clearedQuests, setClearedQuests] = useState([]);
  const [gold, setGold] = useState(0);

  // Gestion Compte & Parcours
  const [currentUser, setCurrentUser] = useState(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  const [serverOnline, setServerOnline] = useState(false);
  const [latency, setLatency] = useState(12);
  const [modelName, setModelName] = useState('GEMINI 3.6 FLASH');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'sys', text: 'Console initialisée.' }
  ]);
  const [execTime, setExecTime] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'ORBIT à votre service. Posez une question ou transmutez votre code.' }
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

  // Restauration ou création instantanée de compte
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
    addTerminal('sys', `Quête #${q.id} active : ${q.title}`);
    
    // Autofocus et défilement fluide vers l'éditeur
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
    <Box sx={{ minHeight: '100vh', pb: 6, bgcolor: 'background.default' }}>
      
      {/* APP BAR HEADER SOMBRE & ÉPURÉ */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#0B0D13', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.5, minHeight: 56 }}>
            
            {/* Branding Minimaliste */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'transparent', color: 'primary.main', border: '1px solid rgba(212, 175, 55, 0.3)', width: 32, height: 32, fontSize: 16 }}>
                🜔
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: '#fff', fontSize: 15 }}>
                QUANTUM RUN
              </Typography>

              <Chip
                icon={<Bolt sx={{ fontSize: 14 }} />}
                label={serverOnline ? `${latency}ms` : "OFFLINE"}
                color={serverOnline ? "secondary" : "default"}
                size="small"
                variant="outlined"
                sx={{ ml: 1, height: 24, fontSize: 11 }}
              />

              <Tooltip title={hasApiKey ? "Clé API Gemini configurée" : "Mode autonome actif"}>
                <Chip
                  icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                  label={modelName}
                  color="primary"
                  size="small"
                  variant="outlined"
                  sx={{ height: 24, fontSize: 11, display: { xs: 'none', md: 'inline-flex' } }}
                />
              </Tooltip>
            </Box>

            {/* Profil Alchimiste & Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'transparent' }}>🪙</Avatar>}
                label={`${gold} XP`}
                variant="outlined"
                size="small"
                sx={{ height: 28, fontSize: 12, borderColor: 'rgba(255, 255, 255, 0.1)' }}
              />

              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Person sx={{ fontSize: 16 }} />}
                onClick={() => setAccountModalOpen(true)}
                sx={{ height: 28, fontSize: 11, borderRadius: 1 }}
              >
                {currentUser?.username || "Compte"}
              </Button>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2.5 }}>
        
        {/* GRILLE DES PHASES ÉPURÉE */}
        <Grid container spacing={1} sx={{ mb: 2.5 }}>
          {phases.map((ph) => {
            const isCurrent = activeQuest.phase === ph.id;
            return (
              <Grid item xs={4} sm={2} key={ph.id}>
                <Card
                  onClick={() => {
                    const firstInPhase = quests.find(q => q.phase === ph.id);
                    if (firstInPhase) selectQuest(firstInPhase);
                  }}
                  sx={{
                    cursor: 'pointer',
                    borderColor: isCurrent ? 'primary.main' : 'rgba(255, 255, 255, 0.06)',
                    bgcolor: isCurrent ? 'rgba(212, 175, 55, 0.08)' : '#0D0E15',
                    p: 1,
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: isCurrent ? 'primary.light' : 'text.primary', fontSize: 12 }}>
                    {ph.symbol} {ph.name}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* COCKPIT PRINCIPAL */}
        <Grid container spacing={2.5}>
          
          {/* COLONNE GAUCHE : QUÊTE & ÉDITEUR */}
          <Grid item xs={12} lg={8}>
            
            {/* CARTE DE QUÊTE ÉPURÉE */}
            <Card sx={{ mb: 2, bgcolor: '#0D0E15' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                
                {/* En-tête Quête */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: 17 }}>
                      #{activeQuest.id} {activeQuest.title}
                    </Typography>
                    <Chip label={`+${activeQuest.rewardXP || 16} XP`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.light' }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={isForging ? <CircularProgress size={12} /> : <AutoAwesome />}
                      onClick={handleManualForge}
                      disabled={isForging}
                      sx={{ height: 28, fontSize: 11 }}
                    >
                      Forger (IA)
                    </Button>
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

                {/* Objectif Direct */}
                <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#12151F', borderLeft: '3px solid #D4AF37', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#F1F5F9', fontWeight: 500, fontSize: 13 }} dangerouslySetInnerHTML={{ __html: activeQuest.objective }} />
                </Paper>

              </CardContent>
            </Card>

            {/* ÉDITEUR DE CODE SOBRE */}
            <Card sx={{ mb: 2, overflow: 'hidden', bgcolor: '#0D0E15' }}>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.8, bgcolor: '#090A0F', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science sx={{ fontSize: 14, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary', fontSize: 11 }}>
                    creuset.js
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button size="small" variant="text" startIcon={<Refresh sx={{ fontSize: 14 }} />} onClick={() => setCode(activeQuest.initialCode)} sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Reset
                  </Button>
                  <Button size="small" variant="text" startIcon={<Lightbulb sx={{ fontSize: 14 }} />} onClick={() => addTerminal('sys', `💡 Indice : ${activeQuest.hint}`)} sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Indice
                  </Button>
                  <Button size="small" variant="text" startIcon={<VpnKey sx={{ fontSize: 14 }} />} onClick={() => setCode(activeQuest.solutionCode)} sx={{ fontSize: 11, color: 'text.secondary' }}>
                    Solution
                  </Button>
                </Box>
              </Box>

              {/* Zone d'édition */}
              <Box sx={{ display: 'flex', minHeight: 180, maxHeight: 300, bgcolor: '#060709' }}>
                <Box
                  ref={gutterRef}
                  sx={{
                    width: 40,
                    py: 1.5,
                    px: 1,
                    textAlign: 'right',
                    color: '#334155',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                    userSelect: 'none',
                    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
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
                    color: '#F1F5F9',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre',
                    tabSize: 2,
                    overflowY: 'auto',
                  }}
                />
              </Box>

              {/* Action Bar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: '#090A0F', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  Ctrl + Entrée
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  endIcon={<PlayArrow />}
                  onClick={handleTransmute}
                  sx={{ px: 2.5, fontWeight: 700 }}
                >
                  TRANSMUTER
                </Button>
              </Box>
            </Card>

            {/* TERMINAL ATHANOR */}
            <Paper elevation={0} sx={{ bgcolor: '#060709', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 0.6, bgcolor: '#0D0E15', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'text.secondary', fontSize: 11 }}>
                    CONSOLE
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary', fontSize: 11 }}>
                  {execTime}
                </Typography>
              </Box>

              <Box ref={terminalRef} sx={{ p: 1.5, maxHeight: 130, minHeight: 80, overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {terminalLogs.map((log, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      color: log.type === 'ok' ? '#10B981' : log.type === 'fail' ? '#F43F5E' : 'text.secondary',
                    }}
                  >
                    {log.text}
                  </Box>
                ))}
              </Box>
            </Paper>

          </Grid>

          {/* COLONNE DROITE : SIDEBAR QUÊTES & ASSISTANT */}
          <Grid item xs={12} lg={4}>
            
            {/* GRIMOIRE DES QUÊTES */}
            <Card sx={{ mb: 2, bgcolor: '#0D0E15' }}>
              <CardHeader
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>Grimoire des Quêtes ({clearedQuests.length}/{quests.length})</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
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
                        py: 0.6,
                        px: 1,
                        mb: 0.3,
                        bgcolor: isCurrent ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        '&.Mui-selected': { bgcolor: 'rgba(212, 175, 55, 0.12)' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 26 }}>
                        {isCleared ? <CheckCircle color="secondary" sx={{ fontSize: 16 }} /> : <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.secondary' }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'primary.light' : 'text.primary', fontSize: 12 }}>
                            #{q.id} {q.title}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Card>

            {/* ASSISTANT ORBIT */}
            <Card sx={{ bgcolor: '#0D0E15' }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'transparent', color: 'info.main', border: '1px solid rgba(56, 189, 248, 0.3)', width: 26, height: 26 }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>}
                title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>ORBIT</Typography>}
                sx={{ p: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
              />
              <CardContent sx={{ p: 1.5 }}>
                <Box ref={chatScrollRef} sx={{ maxHeight: 150, minHeight: 80, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1 }}>
                  {chatMessages.map((m, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        p: 1,
                        maxWidth: '92%',
                        alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                        bgcolor: m.sender === 'user' ? 'rgba(16, 185, 129, 0.1)' : '#12151F',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: m.text }} />
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
                    sx={{ bgcolor: '#060709', borderRadius: 1, '& input': { fontSize: 12, py: 0.8 } }}
                  />
                  <IconButton color="primary" type="submit" size="small">
                    <Send sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

          </Grid>

        </Grid>

      </Container>

      {/* MODAL COMPTE & PARCOURS ALCHIMISTE */}
      <Dialog open={accountModalOpen} onClose={() => setAccountModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: '#000', width: 32, height: 32 }}>🧙‍♂️</Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
            Parcours de l'Alchimiste
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Nom d'alchimiste (sauvegarde automatique sur le serveur) :
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ex: Paracelse, Flamel..."
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => {
                    loginUser(usernameInput);
                    setAccountModalOpen(false);
                  }}
                >
                  Changer
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Statistiques du Parcours */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Rang Alchimique :</Typography>
                <Chip label={getRank()} color="primary" size="small" sx={{ fontWeight: 700 }} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Quêtes Complétées :</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {clearedQuests.length} / {quests.length}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pépites d'Or Récoltées :</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light', fontFamily: "'JetBrains Mono', monospace" }}>
                  {gold} XP
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sauvegarde Serveur :</Typography>
                <Chip label="Synchronisé ☁️" color="secondary" size="small" variant="outlined" />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setAccountModalOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR ALERT */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontSize: 12 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
