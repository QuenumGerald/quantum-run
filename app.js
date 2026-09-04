const modal=document.querySelector('#modal');
const state=JSON.parse(localStorage.getItem('quantum-run')||'{"xp":240,"streak":3,"mastered":12}');
document.querySelector('#streak').textContent=state.streak; document.querySelector('#mastered').textContent=state.mastered;
document.querySelector('#progressText').textContent=Math.round(state.mastered/50*100)+'%'; document.querySelector('#progressBar').style.width=Math.round(state.mastered/50*100)+'%';
document.querySelector('#startBtn').onclick=()=>modal.classList.remove('hidden');
document.querySelector('#close').onclick=()=>modal.classList.add('hidden');
document.querySelector('#playBtn').onclick=()=>modal.classList.remove('hidden');
document.querySelector('#roomCode').onclick=()=>modal.classList.remove('hidden');
document.querySelector('#chatForm').onsubmit=(event)=>{event.preventDefault();const input=document.querySelector('#chatInput');const text=input.value.trim();if(!text)return;const body=document.querySelector('#chatBody');body.insertAdjacentHTML('beforeend',`<div class="chat-msg user">${text.replace(/[<>&]/g,'')}</div>`);input.value='';setTimeout(()=>body.insertAdjacentHTML('beforeend','<div class="chat-msg bot">Je peux t’aider à raisonner, mais je ne vais pas te donner la réponse immédiatement. Commence par identifier le type de donnée et le contrat attendu.</div>'),350)};
document.querySelectorAll('[data-filter]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.track').forEach(x=>x.classList.remove('active'));btn.classList.add('active');});
document.querySelectorAll('.answers button').forEach(btn=>btn.onclick=()=>{
  const feedback=document.querySelector('#feedback');
  if(btn.dataset.correct){feedback.textContent='✓ Exact. Le tableau reste typé string[]. +16 XP'; btn.style.borderColor='#baff63'; state.xp+=16;state.mastered=Math.min(50,state.mastered+1);localStorage.setItem('quantum-run',JSON.stringify(state));document.querySelector('#mastered').textContent=state.mastered;document.querySelector('#progressText').textContent=Math.round(state.mastered/50*100)+'%';document.querySelector('#progressBar').style.width=Math.round(state.mastered/50*100)+'%';}
  else {feedback.textContent='Pas cette fois. Cette carte reviendra demain.'; btn.style.borderColor='#ff6b6b';}
});
