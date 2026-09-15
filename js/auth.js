const role = selectedRole(); const form = document.querySelector('#login-form');
if (form) {
    document.querySelector('#login-role').textContent = role === 'super_admin' ? 'Super Admin' : role[0].toUpperCase() + role.slice(1);
    document.querySelector('#department').innerHTML = '<option value="">Select department</option>' + optionList(DEPARTMENTS);
    if (role === 'student') {
        setSession({ role: 'student', name: 'Guest Student' });
        location.href = link('student/student.html')
    } form.addEventListener('submit', e => {
        e.preventDefault();
        const password = document.querySelector('#password').value;
        const expected = role === 'faculty' ? 'password0123' : role === 'admin' ? 'admin0123' : 'superadmin0143';
        if (password !== expected) {
            toast('Invalid prototype credentials.');
            return
        } const name = document.querySelector('#name').value.trim() || 'Campus User';
        const department = document.querySelector('#department').value || DEPARTMENTS[0];
        setSession({ role, name, department, title: document.querySelector('#title').value });
        const targets = { faculty: 'faculty/faculty-portal.html', admin: 'admin/admin-overview.html', super_admin: 'super-admin/overview.html' };
        location.href = link(targets[role])
    })
}