document.getElementById('f').addEventListener('submit', e => {
    e.preventDefault();
    const n = document.getElementById('n').value.trim() || 'Agente';
    const r = document.getElementById('r').value;
    const m = document.getElementById('m').value.trim() || 'Ajudar pessoas.';
    document.getElementById('out').textContent = `${n} | ${r} | ${m}`
});