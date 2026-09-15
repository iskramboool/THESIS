const ROOT = document.body.dataset.root || '';
const DEPARTMENTS = ['Engineering Department', 'Computer Science Department', 'Psychology Department', 'Nursing Department', 'Education Department', 'Business Administration Department', 'Hotel Management Department'];
const TITLES = ['Full-time Instructor', 'Part-time Instructor', 'Program Chairperson'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
const ROOMS = ['101', '108', '110', '114', '118', '120', '201', '204', '206', '210', '214', '218', '301', '305', '310', '314', '318', '322', '401', '402', '406', '410', '414', '418'];
const SAMPLE = [{ id: 1, faculty: 'Dr. Elena Rivera', department: 'Engineering Department', title: 'Full-time Instructor', subject: 'Computer Programming 1', code: 'CP101', room: '204', year: 'First Year', days: ['Monday', 'Wednesday'], start: '09:00', end: '10:30', status: 'approved' }, { id: 2, faculty: 'Prof. Javier Reyes', department: 'Engineering Department', title: 'Program Chairperson', subject: 'Systems Analysis', code: 'SA201', room: '310', year: 'Second Year', days: ['Tuesday', 'Thursday'], start: '11:00', end: '12:30', status: 'pending' }, { id: 3, faculty: 'Ms. Mia Lim', department: 'Engineering Department', title: 'Part-time Instructor', subject: 'Calculus II', code: 'MATH202', room: '108', year: 'Second Year', days: ['Monday', 'Tuesday', 'Wednesday'], start: '13:00', end: '14:30', status: 'approved' }];
function getSchedules() { return JSON.parse(localStorage.getItem('schedules') || 'null') || SAMPLE } function saveSchedules(data) { localStorage.setItem('schedules', JSON.stringify(data)) } function getSession() { return JSON.parse(localStorage.getItem('session') || 'null') } function setSession(session) { localStorage.setItem('session', JSON.stringify(session)) } function toast(message) {
    const el = document.querySelector('.toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2300)
} function link(path) { return ROOT + path } function selectedRole() { return localStorage.getItem('selectedRole') || 'student' } function optionList(values, selected = '') { return values.map(v => `<option ${v === selected ? 'selected' : ''}>${v}</option>`).join('') } function navFor(role) {
    if (role === 'student') return [['Map', 'map/map.html', '⌖'], ['Faculty Schedules', 'schedules/schedules.html', '◷']];
    if (role === 'faculty') return [['Map', 'map/map.html', '⌖'], ['Faculty Portal', 'faculty/faculty-portal.html', '▣'], ['Faculty Schedules', 'schedules/schedules.html', '◷']];
    if (role === 'admin') return [['Map', 'map/map.html', '⌖'], ['Faculty', 'admin/admin-faculty.html', '♙'], ['Faculty Schedules', 'admin/admin-schedule.html', '◷'], ['Admin Overview', 'admin/admin-overview.html', '▦'], ['Attendance', 'admin/admin-attendance.html', '✓']];
    return [['Rooms', 'super-admin/rooms.html', '▤'], ['Overview', 'super-admin/overview.html', '▦'], ['Classroom Verification', 'super-admin/classroom-verification.html', '⌂'], ['Attendance', 'super-admin/attendance.html', '✓']]
} function shell(page, title) {
    const session = getSession(), role = session?.role || selectedRole();
    const nav = navFor(role);
    document.querySelector('#app').innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark"><i></i><i></i><i></i><i></i></div><div><strong>campus<span>locate</span></strong><small>SMART SCHOOL MAP</small></div></div><div class="role-card"><strong>${session?.name || 'Guest viewer'}</strong><span>${role.replace('_', ' ')}${session?.department ? ' · ' + session.department : ''}</span></div><nav><p class="nav-label">Workspace</p>${nav.map(n => `<a class="nav-link ${page === n[0] ? 'active' : ''}" href="${link(n[1])}"><b>${n[2]}</b>${n[0]}</a>`).join('')}</nav><div class="sidebar-bottom"><a href="${link('index.html')}" data-logout>↪ Sign out</a></div></aside><main class="content"><header class="topbar"><button class="menu-toggle" aria-label="Menu">☰</button><div class="breadcrumb">Workspace <b>/</b> <strong>${title}</strong></div><div class="top-avatar">${(session?.name || 'GU').slice(0, 2).toUpperCase()}</div></header><div class="page-content"></div></main></div><div class="toast"></div>`;
    document.querySelector('[data-logout]').addEventListener('click', () => {
        localStorage.removeItem('session');
        localStorage.removeItem('selectedRole')
    })
} function renderPage(page, title, html) {
    shell(page, title);
    document.querySelector('.page-content').innerHTML = html
} function requireRole(allowed) {
    const session = getSession();
    if (!session || !allowed.includes(session.role)) {
        location.href = link('login.html');
        return false
    } return true
} function renderScheduleTable(container, department = 'Engineering Department', year = 'ALL') {
    const data = getSchedules().filter(s => s.department === department && (year === 'ALL' || s.year === year));
    container.innerHTML = data.length ? `<div class="table-wrap"><table class="hour-table"><thead><tr><th>Schedule / Time</th>${DAYS.map(d => `<th>${d.slice(0, 3)}</th>`).join('')}</tr></thead><tbody>${HOURS.map((hour, i) => `<tr><td>${hour} – ${HOURS[i + 1] || '09:00 PM'}</td>${DAYS.map(day => {
        const item = data.find(s => s.days.includes(day) && Number(s.start.slice(0, 2)) <= Number(hour.slice(0, 2)) && Number(s.end.slice(0, 2)) > Number(hour.slice(0, 2)));
        return `<td>${item ? `<div class="schedule-block"><strong>${item.code}</strong><br>${item.faculty}<br>Rm ${item.room}</div>` : ''}</td>`
    }).join('')}</tr>`).join('')}</tbody></table></div>` : '<div class="empty">No schedule data available for this department.</div>'
} function mapMarkup() { return `<div class="map-shell"><div class="card-header" style="padding:18px 20px 0"><div><h2>Building A · Live campus map</h2><p>Select a floor and room to inspect current presence.</p></div><span class="badge active">Live sensor feed</span></div><div class="floor-tabs">${[1, 2, 3, 4].map(f => `<button class="floor-tab ${f === 1 ? 'active' : ''}" data-floor="${f}">${f}F · Floor ${f}</button>`).join('')}</div><div class="map-canvas" id="map-canvas"></div></div>` } function renderMap() {
    const canvas = document.querySelector('#map-canvas'), rooms = ROOMS.filter(r => r.startsWith(String(window.currentFloor || 1))); canvas.innerHTML = rooms.map((r, i) => `<button class="map-room ${i % 4 === 0 ? 'present' : ''} ${i % 5 === 0 ? 'active' : ''}" style="left:${7 + (i % 3) * 25}%;top:${10 + Math.floor(i / 3) * 40}%" data-room="${r}"><strong>Room ${r}</strong>${i % 4 === 0 ? 'Present' : 'Active sensor'}</button>`).join(''); document.querySelectorAll('.floor-tab').forEach(t => t.onclick = () => {
        window.currentFloor = Number(t.dataset.floor);
        document.querySelectorAll('.floor-tab').forEach(x => x.classList.toggle('active', x === t));
        renderMap()
    })
}