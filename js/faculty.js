if (document.querySelector('#faculty-schedule-table')) {
    const session = getSession();
    const mine = getSchedules().filter(s => s.faculty === session?.name);
    document.querySelector('#faculty-schedule-table').innerHTML = mine.length ? mine.map(s => `<tr><td>${s.subject}<br><small>${s.code}</small></td><td>${s.room}</td><td>${s.days.join(', ')}</td><td>${s.start} – ${s.end}</td><td><span class="badge ${s.status}">${s.status}</span></td></tr>`).join('') : '<tr><td colspan="5" class="empty">No schedules submitted yet.</td></tr>'
}