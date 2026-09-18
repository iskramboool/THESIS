// COMMON.JS - Shared JavaScript functions for the Campus Locate system
// This file contains utility functions, data management, and common UI components

// DATABASE: API base configuration - in production, set this to your actual API endpoint
const ROOT = document.body.dataset.root || '';
const API_BASE = document.body.dataset.apiBase || '/api';

// DATABASE: API fetch function - all production reads and writes should use authenticated server endpoints
async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    return response.status === 204 ? null : response.json();
}

// Format current date according to specified options
function systemDateLabel(options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) {
    return new Intl.DateTimeFormat(undefined, options).format(new Date());
}

// DATABASE: Static configuration - in production, these should be fetched from database
const DEPARTMENTS = ['Engineering Department', 'Computer Science Department', 'Psychology Department', 'Nursing Department', 'Education Department', 'Business Administration Department', 'Hotel Management Department'];
const TITLES = ['Full-time Instructor', 'Part-time Instructor', 'Program Chairperson'];
const COURSES = ['Computer Engineering (CPE)', 'Electrical Engineering (EE)', 'Electronics and Communication Engineering (ECE)'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
const ROOMS = ['101', '108', '110', '114', '118', '120', '201', '204', '206', '210', '214', '218', '301', '305', '310', '314', '318', '322', '401', '402', '406', '410', '414', '418'];
const ROOM_TYPES = {
    '101': 'laboratory', '108': 'classroom', '110': 'office', '114': 'classroom', '118': 'classroom', '120': 'canteen',
    '201': 'classroom', '204': 'laboratory', '206': 'classroom', '210': 'office', '214': 'classroom', '218': 'library',
    '301': 'classroom', '305': 'laboratory', '310': 'classroom', '314': 'office', '318': 'classroom', '322': 'gymnasium',
    '401': 'classroom', '402': 'laboratory', '406': 'classroom', '410': 'office', '414': 'classroom', '418': 'library'
};

// DATABASE: Sample schedule data - in production, this would be fetched from database tables
const SAMPLE = [{ id: 1, faculty: 'Dr. Elena Rivera', department: 'Engineering Department', title: 'Full-time Instructor', subject: 'Computer Programming 1', code: 'CP101', room: '204', year: 'First Year', days: ['Monday', 'Wednesday'], start: '09:00', end: '10:30', status: 'approved' }, { id: 2, faculty: 'Prof. Javier Reyes', department: 'Engineering Department', title: 'Program Chairperson', subject: 'Systems Analysis', code: 'SA201', room: '310', year: 'Second Year', days: ['Tuesday', 'Thursday'], start: '11:00', end: '12:30', status: 'pending' }, { id: 3, faculty: 'Ms. Mia Lim', department: 'Engineering Department', title: 'Part-time Instructor', subject: 'Calculus II', code: 'MATH202', room: '108', year: 'Second Year', days: ['Monday', 'Tuesday', 'Wednesday'], start: '13:00', end: '14:30', status: 'approved' }];

// DATABASE: Schedule data management - in production, replace localStorage with database queries
function getSchedules() { return JSON.parse(localStorage.getItem('schedules') || 'null') || SAMPLE }
function saveSchedules(data) { localStorage.setItem('schedules', JSON.stringify(data)); window.dispatchEvent(new StorageEvent('storage', { key: 'schedules' })) }

// DATABASE: Session management - in production, use secure server-side sessions with JWT tokens
function getSession() { return JSON.parse(localStorage.getItem('session') || 'null') }
function setSession(session) { localStorage.setItem('session', JSON.stringify(session)) }

// HTML escape function to prevent XSS attacks
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])) }

// DATABASE: QR attendance validation - in production, validate against database with proper authentication
function getValidQrAttendance() {
    const record = JSON.parse(localStorage.getItem('qrAttendance') || 'null');
    if (!record || Date.now() >= Number(record.expiresAt)) { localStorage.removeItem('qrAttendance'); return null }
    return record
}

// Toast notification function for user feedback
function toast(message) {
    const el = document.querySelector('.toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2300)
}

// Generate relative path links
function link(path) { return ROOT + path }

// Get selected user role from localStorage
function selectedRole() { return localStorage.getItem('selectedRole') || 'student' }

// Generate HTML option list for select elements
function optionList(values, selected = '') { return values.map(v => `<option value="${escapeHtml(v)}" ${v === selected ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('') }

// DATABASE: Navigation structure - in production, this could be dynamic based on user permissions from database
function navFor(role) {
    if (role === 'student') return [['Map', 'map/map.html', '⌖'], ['Faculty Schedule', 'schedules/schedules.html', '◷']];
    if (role === 'faculty') return [['Faculty Portal', 'faculty/faculty-portal.html', '▣'], ['Map', 'map/map.html', '⌖'], ['Faculty Schedule', 'schedules/schedules.html', '◷']];
    if (role === 'admin') return [['Map', 'map/map.html', '⌖'], ['Faculty Schedule', 'schedules/schedules.html', '◷'], ['Admin Portal', 'admin/admin-portal.html', '♙'], ['Admin Overview', 'admin/admin-overview.html', '▦']];
    return [['Rooms', 'super-admin/rooms.html', '▤'], ['System Status', 'super-admin/classroom-verification.html', '⌂'], ['Overview', 'super-admin/overview.html', '▦']]
} function shell(page, title) {
    const session = getSession(), role = session?.role || selectedRole();
    const nav = navFor(role);
    const currentUrl = location.href;
    const lastPage = sessionStorage.getItem('lastContentPage');
    sessionStorage.setItem('lastContentPage', currentUrl);
    const displayName = role === 'student' ? 'Guest' : (session?.name || 'Guest viewer');
    const roleLabel = role === 'student' ? 'Student' : role.replace('_', ' ');
    document.querySelector('#app').innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark"><i></i><i></i><i></i><i></i></div><div class="brand-copy"><strong>campus<span>locate</span></strong><small>SMART SCHOOL MAP</small></div><button class="sidebar-toggle" aria-label="Collapse sidebar" type="button">←</button></div><div class="role-card"><strong>${escapeHtml(displayName)}</strong><span>${roleLabel}${session?.department ? ' · ' + escapeHtml(session.department) : ''}</span></div><nav><p class="nav-label">Workspace</p>${nav.map(n => `<a class="nav-link" href="${link(n[1])}" title="${escapeHtml(n[0])}"><b>${n[2]}</b><span class="nav-text">${escapeHtml(n[0])}</span></a>`).join('')}</nav><div class="sidebar-bottom"><a href="${link('index.html')}" data-logout>↪ <span class="signout-text">Sign out</span></a></div></aside><main class="content"><header class="topbar"><div class="breadcrumb">Workspace <b>/</b> <strong>${title}</strong></div><div class="topbar-actions"><button class="back-button" type="button" ${lastPage && lastPage !== currentUrl ? '' : 'disabled'}>← Back</button><div class="top-avatar">${(session?.name || 'GU').slice(0, 2).toUpperCase()}</div></div></header><nav class="mobile-nav-row" aria-label="Mobile navigation">${nav.map(n => `<a class="mobile-nav-link ${page === n[0] ? 'active' : ''}" href="${link(n[1])}"><b>${n[2]}</b><span>${escapeHtml(n[0])}</span></a>`).join('')}</nav><div class="page-content"></div></main></div><div class="toast"></div>`;
    document.querySelector('.back-button').addEventListener('click', () => {
        if (lastPage && lastPage !== currentUrl) location.href = lastPage;
    });
    document.querySelector('[data-logout]').addEventListener('click', () => {
        localStorage.removeItem('session');
        localStorage.removeItem('selectedRole')
    });
    document.querySelector('.sidebar-toggle').addEventListener('click', event => {
        const shell = document.querySelector('.app-shell');
        const sidebar = document.querySelector('.sidebar');
        const collapsed = shell.classList.toggle('sidebar-collapsed');
        sidebar.classList.toggle('collapsed', collapsed);
        sidebar.setAttribute('aria-expanded', String(!collapsed));
        event.currentTarget.textContent = collapsed ? '→' : '←';
        event.currentTarget.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    });
    document.querySelector('.sidebar').addEventListener('click', event => { if (event.target.closest('.nav-link')) document.querySelector('.app-shell').classList.remove('sidebar-open') })
} function renderPage(page, title, html) {
    shell(page, title);
    document.querySelector('.page-content').innerHTML = html
} function requireRole(allowed) {
    const session = getSession();
    if (!session || !allowed.includes(session.role)) {
        location.href = link('login.html');
        return false
    } return true
} 

// DATABASE: Render schedule table with real-time presence data
// In production, fetch schedule data from database with current time and day filtering
function renderScheduleTable(container, department = 'Engineering Department', year = 'ALL', facultyName = '', course = 'ALL') {
    const data = getSchedules().filter(s => 
        s.department === department && 
        (!facultyName || s.faculty === facultyName) && 
        (facultyName ? true : s.status === 'present') && 
        (year === 'ALL' || s.year === year) &&
        (course === 'ALL' || (s.courses || [s.course]).includes(course))
    );
    
    // Generate time slots from 07:00 AM to 09:00 PM
    const timeSlots = [];
    for (let hour = 7; hour <= 21; hour++) {
        const displayHour = hour <= 12 ? hour : hour - 12;
        const ampm = hour < 12 ? 'AM' : hour === 12 ? 'PM' : 'PM';
        const timeString = `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
        timeSlots.push(timeString);
    }
    
    container.innerHTML = `<div class="table-wrap">
            <table class="hour-table">
                <thead>
                    <tr>
                        <th>Schedule / Time</th>
                        ${DAYS.map(d => `<th>${d.slice(0, 3)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${timeSlots.map((timeSlot, i) => {
                        const hour = i + 7; // 7 to 21
                        const time24 = `${String(hour).padStart(2, '0')}:00`;
                        
                        return `<tr>
                            <td>${timeSlot}</td>
                            ${DAYS.map(day => {
                                const item = data.find(s => 
                                    s.days.includes(day) && 
                                    Number(s.start.slice(0, 2)) <= hour && 
                                    Number(s.end.slice(0, 2)) > hour
                                );
                                
                                if (item) {
                                    // Check if this is a half-hour slot
                                    const startMinutes = Number(item.start.slice(3, 5));
                                    const isHalfHour = startMinutes === 30;
                                    const heightClass = isHalfHour ? 'half-height' : 'full-height';
                                    
                                    return `<td>
                                        <div class="schedule-block ${heightClass}">
                                            <strong>${escapeHtml(item.code)}</strong><br>
                                            ${escapeHtml(item.faculty)}<br>
                                            Rm ${escapeHtml(item.room)}
                                        </div>
                                    </td>`;
                                }
                                return '<td></td>';
                            }).join('')}
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
} 

// DATABASE: Generate map markup with search functionality and live statistics
// In production, fetch real-time faculty count and room occupancy from database
function mapMarkup() { 
    const searchOptions = [...new Set([...ROOMS.map(room => `Room ${room}`), ...getSchedules().map(schedule => schedule.faculty)])]; 
    return `<div class="page-heading">
                <div>
                    <p class="eyebrow">${systemDateLabel({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} | Live updates</p>
                    <h1>Find your way around the Campus</h1>
                    <p class="subheading">Interactive campus map with real-time room and faculty location tracking</p>
                </div>
            </div>
            <div class="card map-controls">
                <div class="field">
                    <label for="map-search">Faculty and room locator</label>
                    <input id="map-search" type="search" list="map-search-options" placeholder="Search instructor or room..." autocomplete="off">
                    <datalist id="map-search-options">${searchOptions.map(option => `<option value="${escapeHtml(option)}"></option>`).join('')}</datalist>
                    <small class="search-hint">Try a room number such as 204 or a faculty name.</small>
                </div>
                <div class="field">
                    <label for="room-type-filter">Room type</label>
                    <select id="room-type-filter">
                        <option value="all">All room types</option>
                        <option value="laboratory">Laboratories</option>
                        <option value="office">Offices</option>
                        <option value="gymnasium">Gymnasium</option>
                        <option value="classroom">Rooms/Classrooms</option>
                        <option value="library">Library</option>
                        <option value="canteen">Canteen</option>
                    </select>
                </div>
            </div>
            <div class="map-stats">
                <div class="stat-item">
                    <span>Faculty on Campus</span>
                    <strong>${getSchedules().filter(s => s.status === 'present').length}</strong>
                </div>
                <div class="stat-item">
                    <span>Active classrooms</span>
                    <strong>${getSchedules().filter(s => s.status === 'present').length}</strong>
                </div>
            </div>
            <div class="map-shell">
                <div class="card-header" style="padding:18px 20px 0">
                    <div>
                        <h2>Building A · Live campus map</h2>
                        <p>Select a floor and room to inspect current presence.</p>
                    </div>
                    <span class="badge active">Live sensor feed</span>
                </div>
                <div class="floor-tabs">${[1, 2, 3, 4].map(f => `<button class="floor-tab ${f === 1 ? 'active' : ''}" data-floor="${f}">${f}F · Floor ${f}</button>`).join('')}</div>
                <div class="map-canvas" id="map-canvas">
                    <span class="map-wing north-wing">North Wing</span>
                    <span class="map-wing south-wing">South Wing</span>
                    <span class="you-are-here">You&apos;re here · 4F</span>
                </div>
            </div>
            <div class="color-legend">
                <div class="legend-item"><span class="legend-color occupied"></span><span>Occupied</span></div>
                <div class="legend-item"><span class="legend-color not-occupied"></span><span>Not Occupied</span></div>
            </div>
            <div class="map-modal-backdrop" id="map-modal" hidden>
                <section class="map-modal" role="dialog" aria-modal="true" aria-labelledby="map-modal-title">
                    <button class="map-modal-close" id="map-modal-close" type="button" aria-label="Close details">×</button>
                    <div id="map-modal-content"></div>
                </section>
            </div>`; 
}
// DATABASE: Locate search result on map - in production, use database queries for real-time location data
function locateMapResult(query) {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return;
    
    // Check if searching for a room
    const room = ROOMS.find(item => item.toLowerCase() === normalized || `room ${item}` === normalized);
    
    // Check if searching for a faculty member
    const schedules = getSchedules();
    const facultySchedule = schedules.find(item => item.faculty.toLowerCase().includes(normalized) && item.status === 'present');
    const facultyRecord = schedules.find(item => item.faculty.toLowerCase().includes(normalized));
    const savedStatuses = JSON.parse(localStorage.getItem('facultyPresence') || '{}');
    const destination = room || facultySchedule?.room;

    if (!destination && facultyRecord && savedStatuses[facultyRecord.faculty] === 'present') {
        showFacultyPopup(facultyRecord.faculty);
        return;
    }
    if (!destination) return;

    window.selectedFacultyName = facultySchedule?.faculty || '';
    
    // Switch to the correct floor
    window.currentFloor = Number(destination.charAt(0));
    renderMap();
    
    // Highlight and scroll to the target room
    const target = document.querySelector(`[data-room="${destination}"]`);
    if (!target) return;
    target.classList.add('highlighted');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.click();
}

function applyRoomTypeFilter() {
    const filter = document.querySelector('#room-type-filter')?.value || 'all';
    document.querySelectorAll('.map-room').forEach(room => {
        room.hidden = false;
        room.classList.toggle('type-highlighted', filter !== 'all' && room.dataset.roomType === filter);
        room.classList.toggle('type-dimmed', filter !== 'all' && room.dataset.roomType !== filter);
    });
}
// DATABASE: Get room faculty details with current occupancy status
// In production, fetch only approved schedules active for this room and current time from database
function roomFacultyDetails(room) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
    
    const assignments = getSchedules().filter(schedule =>
        schedule.room === room && (schedule.status === 'present' || schedule.status === 'approved')
    );
    
    if (!assignments.length) return '<p>No active faculty or users are scheduled in this room right now.</p>';
    
    return `<p><strong>Status: Occupied</strong></p>
            <p><strong>Active users in this room:</strong></p>
            <div class="room-faculty-list">
                ${assignments.map(schedule => `
                    <div class="room-faculty-item">
                        <strong>${escapeHtml(schedule.faculty)}</strong>
                        <span>${escapeHtml(schedule.subject)} · ${escapeHtml(schedule.start)} – ${escapeHtml(schedule.end)}</span>
                        <a href="../schedules/schedules.html?faculty=${encodeURIComponent(schedule.faculty)}">View faculty schedule</a>
                    </div>
                `).join('')}
            </div>`;
}

function facultyPresenceDetails(facultyName = '') {
    // DATABASE: Replace these derived values with current attendance and active schedule records
    if (!facultyName) return '<p>Search for a faculty member to view their current location.</p>';
    
    const faculty = [...new Map(getSchedules().filter(schedule => schedule.faculty === facultyName).map(schedule => [schedule.faculty, schedule])).values()];
    if (!faculty.length) return '<p>Faculty member not found.</p>';
    
    return faculty.map(person => {
        // DATABASE: In production, get real-time attendance status from database
        const savedStatuses = JSON.parse(localStorage.getItem('facultyPresence') || '{}');
        const currentSchedule = getSchedules().find(s => s.faculty === person.faculty && s.status === 'present');
        
        let status, details;
        if (currentSchedule) {
            // Faculty is currently teaching
            status = 'In Session';
            details = `Room ${escapeHtml(currentSchedule.room)} · ${escapeHtml(currentSchedule.subject)} · ${escapeHtml(currentSchedule.start)}–${escapeHtml(currentSchedule.end)}`;
        } else if (savedStatuses[person.faculty] === 'present') {
            // Faculty is on campus but not currently teaching
            status = 'Present';
            details = 'Location: Faculty';
        } else {
            // Faculty is not present today
            status = 'Not Present';
            details = 'This faculty member is not on campus today';
        }
        
        const statusClass = status.toLowerCase().replace(' ', '-');
        return `<div class="faculty-presence-item">
                    <strong>${escapeHtml(person.faculty)}</strong>
                    <span class="presence-status ${statusClass}">${escapeHtml(status)}</span>
                    <small>${details}</small>
                </div>`;
    }).join('');
}

function roomTypeLabel(room) {
    const type = ROOM_TYPES[room] || 'classroom';
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function showMapPopup(content) {
    const modal = document.querySelector('#map-modal');
    const modalContent = document.querySelector('#map-modal-content');
    if (!modal || !modalContent) return;
    modalContent.innerHTML = content;
    modal.hidden = false;
}

function showFacultyPopup(facultyName) {
    const record = getSchedules().find(schedule => schedule.faculty === facultyName);
    if (!record) return;
    const activeSchedule = getSchedules().find(schedule => schedule.faculty === facultyName && schedule.status === 'present');
    const savedStatuses = JSON.parse(localStorage.getItem('facultyPresence') || '{}');
    if (activeSchedule) {
        window.currentFloor = Number(activeSchedule.room.charAt(0));
        renderMap();
        const target = document.querySelector(`[data-room="${activeSchedule.room}"]`);
        target?.classList.add('highlighted');
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showRoomPopup(activeSchedule.room);
        return;
    }
    if (savedStatuses[facultyName] !== 'present') return;
    showMapPopup(`<div class="popup-kicker">Faculty information</div><h2 id="map-modal-title">${escapeHtml(facultyName)}</h2><span class="popup-status present">Present</span><p class="popup-location">Location: Faculty | Floor 4</p><a class="popup-link" href="../schedules/schedules.html?faculty=${encodeURIComponent(facultyName)}">View faculty schedule</a>`);
}

function showRoomPopup(room) {
    const occupied = getSchedules().some(schedule => schedule.room === room && (schedule.status === 'present' || schedule.status === 'approved'));
    const floor = room.charAt(0);
    showMapPopup(`<div class="popup-kicker">Room details</div><h2 id="map-modal-title">Room ${escapeHtml(room)}</h2><div class="popup-meta"><span>${roomTypeLabel(room)}</span><span>Floor ${floor}</span><span class="popup-status ${occupied ? 'occupied' : 'available'}">${occupied ? 'Occupied' : 'Not occupied'}</span></div><div class="popup-section">${occupied ? roomFacultyDetails(room) : '<p>No active faculty or users are using this room right now.</p>'}</div>`);
}

function renderMap() {
    // DATABASE: This function renders the interactive map - in production, fetch real-time room occupancy from database
    const canvas = document.querySelector('#map-canvas');
    const rooms = ROOMS.filter(room => room.startsWith(String(window.currentFloor || 1)));
    
    // Clear existing rooms
    canvas.querySelectorAll('.map-room').forEach(room => room.remove());
    
    // Render rooms for current floor
    rooms.forEach((room, index) => {
        const button = document.createElement('button');
        
        // DATABASE: Check real-time occupancy status from database
        const hasApprovedSchedule = getSchedules().some(schedule => 
            schedule.room === room && 
            (schedule.status === 'present' || schedule.status === 'approved')
        );
        
        button.className = `map-room ${hasApprovedSchedule ? 'occupied' : ''}`;
        button.dataset.roomType = ROOM_TYPES[room] || 'classroom';
        button.style.left = `${7 + (index % 3) * 25}%`;
        button.style.top = `${18 + Math.floor(index / 3) * 30}%`;
        button.dataset.room = room;
        button.innerHTML = `<strong>Room ${escapeHtml(room)}</strong>`;
        
        // Interactive room click handler
        button.onclick = () => {
            const occupied = button.classList.contains('occupied');
            document.querySelectorAll('.map-room').forEach(item => item.classList.remove('highlighted'));
            button.classList.add('highlighted');
            showRoomPopup(room);
        };
        
        canvas.appendChild(button);
    });

    applyRoomTypeFilter();
    
    // Floor tab switching
    document.querySelectorAll('.floor-tab').forEach(tab => tab.classList.toggle('active', Number(tab.dataset.floor) === Number(window.currentFloor || 1)));
    document.querySelectorAll('.floor-tab').forEach(tab => tab.onclick = () => {
        window.currentFloor = Number(tab.dataset.floor);
        document.querySelectorAll('.floor-tab').forEach(item => item.classList.toggle('active', item === tab));
        renderMap();
    });
    
    // Search functionality
    const searchInput = document.querySelector('#map-search');
    if (searchInput) {
        const submitSearch = force => {
            const query = searchInput.value.trim();
            if (query.length < 2) return;
            const exactSuggestion = ROOMS.includes(query) || ROOMS.includes(query.replace(/^room\s+/i, '')) || getSchedules().some(schedule => schedule.faculty.toLowerCase() === query.toLowerCase());
            if (!force && !exactSuggestion) return;
            locateMapResult(query);
        };
        searchInput.onchange = () => submitSearch(false);
        searchInput.onkeydown = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitSearch(true);
            }
        };
    }
    
    // Room type filter
    const roomTypeFilter = document.querySelector('#room-type-filter');
    if (roomTypeFilter) roomTypeFilter.onchange = applyRoomTypeFilter;

    const modalClose = document.querySelector('#map-modal-close');
    if (modalClose) modalClose.onclick = () => { document.querySelector('#map-modal').hidden = true };
    const modal = document.querySelector('#map-modal');
    if (modal) modal.onclick = event => { if (event.target.id === 'map-modal') event.currentTarget.hidden = true };
}