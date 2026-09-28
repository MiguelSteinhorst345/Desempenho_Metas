if (localStorage.getItem('tema') === 'dark') {
    document.documentElement.classList.add('dark');
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('alterartema');
    if (!btn) return;

    btn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const ativo = document.documentElement.classList.contains('dark');
        localStorage.setItem('tema', ativo ? 'dark' : 'light');
    });
});

// Sincroniza entre abas abertas ao mesmo tempo
window.addEventListener('storage', (e) => {
    if (e.key === 'tema') {
        document.documentElement.classList.toggle('dark', e.newValue === 'dark');
    }
});