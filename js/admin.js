document.querySelectorAll('[data-approve]').
    forEach(b => b.onclick = () => {
        const data = getSchedules();
        const item = data.find(s => s.id === Number(b.dataset.approve));
        if (item) {
            item.status = 'approved'; saveSchedules(data);
            location.reload()
        }
    });
document.querySelectorAll('[data-reject]').forEach(b => b.onclick = () => {
    const data = getSchedules();
    const item = data.find(s => s.id === Number(b.dataset.reject));
    if (item) {
        item.status = 'rejected';
        saveSchedules(data);
        location.reload()
    }
})