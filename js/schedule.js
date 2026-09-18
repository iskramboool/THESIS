document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#schedule-form');
    if (!form) return;
    document.querySelectorAll('.set-time-btn').forEach(button => {
        button.onclick = () => {
            const input = document.querySelector(`#${button.dataset.timeInput}`);
            if (!input.value) {
                toast('Choose a time first.');
                input.focus();
                return;
            }
            const label = input.closest('.field').querySelector('label').textContent;
            toast(`${label} set to ${input.value}.`);
        };
    });
    form.addEventListener('submit', e => {
        e.preventDefault();
        const selectedCourses = [...form.course.selectedOptions].map(option => option.value).filter(Boolean);
        if (!selectedCourses.length) {
            toast('Select at least one course.');
            return;
        }
        const selected = [...document.querySelectorAll('input[name="days"]:checked')].map(x => x.value);
        if (!selected.length) {
            toast('Select at least one teaching day.');
            return
        } 
        const start = form.start.value, end = form.end.value;
        if (start >= end || start < '07:00' || end > '21:00') {
            toast('Schedule time must be between 07:00 AM and 09:00 PM.');
            return
        } 
        const data = getSchedules();
        const conflict = data.find(s => s.room === form.room.value && s.days.some(day => selected.includes(day)) && start < s.end && end > s.start);
        if (conflict) {
            toast('Schedule conflict detected. Choose another room or time.');
            return
        } data.push({ id: Date.now(), faculty: getSession()?.name || 'Faculty user', department: getSession()?.department || 'Engineering Department', title: getSession()?.title || 'Full-time Instructor', courses: selectedCourses, course: selectedCourses[0], subject: form.subject.value, code: form.code.value, room: form.room.value, year: form.year.value, days: selected, start, end, status: 'pending', submittedAt: new Date().toISOString() });
        saveSchedules(data);
        toast('Schedule submitted for Admin approval.');
        form.reset();
        const session = getSession();
        renderScheduleTable(document.querySelector('#schedule-table'), session?.department, 'ALL', session?.name);
    })
});