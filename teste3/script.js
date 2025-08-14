// ===== Navegação mobile =====
function toggleMenu(){
  const el = document.getElementById('navLinks');
  el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
}

// ===== Progresso (localStorage) =====
const STORAGE_KEY = 'ciep316_progresso_v2';
const secoes = ['inicio','logica','exemplos','exercicios','playground','htmlcss','fe-be','linguagens','glossario','recursos'];

function carregarProgresso(){
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  document.querySelectorAll('[data-section]').forEach(chk => {
    const sec = chk.getAttribute('data-section');
    chk.checked = !!saved[sec];
  });
  atualizarBarra();
}

function salvarProgresso(){
  const data = {};
  document.querySelectorAll('[data-section]').forEach(chk => {
    const sec = chk.getAttribute('data-section');
    data[sec] = chk.checked;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  atualizarBarra();
}

function atualizarBarra(){
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const total = document.querySelectorAll('[data-section]').length;
  const done = Object.values(data).filter(Boolean).length;
  const pct = Math.round((done/total)*100) || 0;
  const bar = document.getElementById('progressBar');
  const info = document.getElementById('progressInfo');
  if(bar) bar.style.width = pct + '%';
  if(info) info.textContent = pct + '% concluído';
}

function toggleConcluida(el){
  salvarProgresso();
}
function marcarSecao(id){
  const input = document.querySelector(`[data-section="${id}"]`);
  if(input){ input.checked = true; salvarProgresso(); }
}

// ===== PDF =====
function imprimirPDF(){
  window.print();
}

// ===== Quizzes =====
function verificarQuiz(id){
  const wrap = document.querySelector(`.quiz[data-id="${id}"]`);
  if(!wrap) return;
  const correta = wrap.getAttribute('data-answer');
  const sel = wrap.querySelector(`input[name="${id}"]:checked`);
  const fb = wrap.querySelector('.feedback');
  if(!sel){ fb.textContent = 'Escolha uma alternativa.'; fb.style.color = '#f59e0b'; return; }
  if(sel.value === correta){ fb.textContent = '✅ Resposta correta!'; fb.style.color = '#34d399'; }
  else { fb.textContent = '❌ Não foi dessa vez. Tente de novo!'; fb.style.color = '#ef4444'; }
}

// ===== Exercícios mini (3.x) =====
function exMedia(){
  const n1 = parseFloat(document.getElementById('m1').value||0);
  const n2 = parseFloat(document.getElementById('m2').value||0);
  const n3 = parseFloat(document.getElementById('m3').value||0);
  const media = (n1+n2+n3)/3;
  let status = 'Reprovado';
  if(media>=7) status = 'Aprovado';
  else if(media>=5) status = 'Recuperação';
  document.getElementById('mout').textContent = `Média: ${media.toFixed(2)} → ${status}`;
}
function exVogais(){
  const s = (document.getElementById('palavra').value||'').toLowerCase();
  const count = (s.match(/[aeiouáéíóúâêôãõ]/g)||[]).length;
  document.getElementById('vout').textContent = `Vogais: ${count}`;
}
function exMaior(){
  const raw = document.getElementById('lista').value||'';
  const nums = raw.split(',').map(x=>parseFloat(x)).filter(n=>!isNaN(n));
  const max = nums.length? Math.max(...nums) : '—';
  document.getElementById('lout').textContent = `Maior: ${max}`;
}

// ===== Playground =====
let mode = 'js';
function setMode(m){
  mode = m;
  renderInputs();
}

function renderInputs(){
  const inDiv = document.getElementById('inputs');
  if(!inDiv) return;
  if(mode==='js'){
    inDiv.innerHTML = `
      <label class="pill">Editor JavaScript</label>
      <textarea id="codeJS" rows="12" spellcheck="false" style="width:100%">console.clear();\nconsole.log('Olá, CIEP-316!');</textarea>
      <div class="muted">A saída aparecerá no quadro ao lado (Console).</div>
    `;
  } else if(mode==='htmlcss'){
    inDiv.innerHTML = `
      <label class="pill">HTML</label>
      <textarea id="codeHTML" rows="6" spellcheck="false" style="width:100%"><!DOCTYPE html>\n<html><body><h1>Meu título</h1><p>Minha página.</p></body></html></textarea>
      <label class="pill">CSS</label>
      <textarea id="codeCSS" rows="6" spellcheck="false" style="width:100%">body{font-family:sans-serif;padding:10px} h1{color:purple}</textarea>
    `;
  } else {
    inDiv.innerHTML = `
      <label class="pill">HTML</label>
      <textarea id="codeHTML" rows="6" spellcheck="false" style="width:100%"><h1>Card</h1><div class='card'>Olá, mundo!</div></textarea>
      <label class="pill">CSS</label>
      <textarea id="codeCSS" rows="6" spellcheck="false" style="width:100%">.card{padding:12px;border:1px solid #ddd;border-radius:10px}</textarea>
      <label class="pill">JavaScript</label>
      <textarea id="codeJS" rows="6" spellcheck="false" style="width:100%">console.log('Pronto!');</textarea>
    `;
  }
}

function limparSaida(){
  const iframe = document.getElementById('output');
  if(!iframe) return;
  iframe.srcdoc = '<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;padding:10px"><em>Saída limpa.</em></body></html>';
}

function runCode(){
  const iframe = document.getElementById('output');
  if(!iframe) return;

  if(mode==='js'){
    const js = document.getElementById('codeJS').value;
    const html = `<!DOCTYPE html><html><body style="font-family:ui-monospace,monospace;white-space:pre-wrap;padding:10px"><h3>Console</h3><div id='log'></div><script>
      (function(){
        const logDiv = document.getElementById('log');
        function print(tag, args){
          const p = document.createElement('div');
          p.textContent = tag + ' ' + Array.from(args).map(x=>typeof x==='object'? JSON.stringify(x): String(x)).join(' ');
          logDiv.appendChild(p);
        }
        console.clear = function(){ logDiv.innerHTML = '' };
        ['log','warn','error'].forEach(fn=>{
          const orig = console[fn];
          console[fn] = function(){ print(fn.toUpperCase()+':', arguments); orig.apply(console, arguments); };
        });
        try{ ${js} }catch(e){ print('ERRO:', [e.message]); }
      })();
    <\/script></body></html>`;
    iframe.srcdoc = html;
  }
  else if(mode==='htmlcss'){
    const html = document.getElementById('codeHTML').value;
    const css = document.getElementById('codeCSS').value;
    iframe.srcdoc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;
  }
  else {
    const html = document.getElementById('codeHTML').value;
    const css = document.getElementById('codeCSS').value;
    const js = document.getElementById('codeJS').value;
    iframe.srcdoc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>try{${js}}catch(e){alert(e.message)}<\/script></body></html>`;
  }
}

// Carregar exemplos no Playground
function carregarExemplo(nome){
  const examples = {
    ola: { mode: 'js', js: "console.clear();\nconsole.log('Olá, CIEP-316!');\nlet nome='Ana';\nconsole.log('Bem-vinda,', nome);" },
    tabuada: { mode: 'js', js: "let n=7;\nfor(let i=1;i<=10;i++){ console.log(`${n} x ${i} = ${n*i}`); }" },
    cardhtml: { mode: 'full', html: "<div class='box'><h2>Meu Card</h2><p>Texto do card.</p></div>", css: ".box{border:1px solid #ddd;padding:12px;border-radius:10px;max-width:260px}", js: "console.log('Card carregado');" },
    converter: { mode: 'js', js: "let c=30; let f=c*9/5+32; console.log(c,'°C =',f,'°F');" },
    parimpar: { mode: 'js', js: "let n=7; if(n%2===0) console.log('par'); else console.log('ímpar');" },
    fizzbuzz: { mode: 'js', js: "for(let i=1;i<=100;i++){ let out=''; if(i%3===0) out+='Fizz'; if(i%5===0) out+='Buzz'; console.log(out||i); }" },
    palindromo: { mode: 'js', js: "function ehPalindromo(s){ s=s.toLowerCase().replace(/[^a-z0-9]/g,''); return s===s.split('').reverse().join(''); }\nconsole.log(ehPalindromo('arara')); console.log(ehPalindromo('casa'));" },
    minisite: { mode: 'htmlcss', html: "<header><nav><a href='#'>Início</a> | <a href='#sobre'>Sobre</a></nav></header><main><h1>Meu site</h1><p>Bem-vindo!</p></main>", css: "body{font-family:sans-serif} header{background:#0ea5e9;color:white;padding:8px} nav a{color:white}" },
    grid: { mode: 'htmlcss', html: "<div class='grid'><div class='card'>A</div><div class='card'>B</div><div class='card'>C</div></div>", css: ".grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}.card{border:1px solid #e5e7eb;padding:10px;border-radius:10px}@media(max-width:700px){.grid{grid-template-columns:1fr}}" }
  };

  const ex = examples[nome];
  if(!ex) return;
  setMode(ex.mode);
  setTimeout(()=>{
    if(ex.js && document.getElementById('codeJS')) document.getElementById('codeJS').value = ex.js;
    if(ex.html && document.getElementById('codeHTML')) document.getElementById('codeHTML').value = ex.html;
    if(ex.css && document.getElementById('codeCSS')) document.getElementById('codeCSS').value = ex.css;
  }, 0);
}

// ===== Inicialização =====
window.addEventListener('DOMContentLoaded', ()=>{
  carregarProgresso();
  renderInputs();
  limparSaida();
});
