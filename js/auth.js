// AUTH.JS - Authentication and account management
// This file handles user login, signup, and session management

// DATABASE: User authentication - in production, use secure server-side authentication with JWT tokens
const role = selectedRole(); const form = document.querySelector('#login-form');
if (form) {
    document.querySelector('#login-role').textContent = role === 'super_admin' ? 'Super Admin' : role[0].toUpperCase() + role.slice(1);
    document.querySelector('#department').innerHTML = '<option value="">Select department</option>' + optionList(DEPARTMENTS);
    const signup = new URLSearchParams(location.search).get('signup') === '1';
    const verificationField = document.querySelector('.verification-field');
    const confirmField = document.querySelector('.confirm-field');
    const titleField = document.querySelector('#title').closest('.field');
    const departmentField = document.querySelector('#department').closest('.field');
    const authSwitch = document.querySelector('.auth-switch');
    const authTitle = document.querySelector('#auth-title');
    const authDescription = document.querySelector('#auth-description');
    
    // DATABASE: User data management - in production, store users in database with proper encryption
    const users = () => JSON.parse(localStorage.getItem('users') || '[]');
    const saveUsers = data => localStorage.setItem('users', JSON.stringify(data));
    
    // DATABASE: Password hashing - replace this browser-only fallback with bcrypt/Argon2id on the server
    const hashPassword = async password => {
        const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    };
    
    // DATABASE: Role-based security passwords - in production, these should be environment variables
    const verification = { faculty: 'password0123', admin: 'admin0123', super_admin: 'superadmin0143' };
    
    // Toggle between signup and login modes
    const setMode = isSignup => {
        verificationField.hidden = !isSignup;
        confirmField.hidden = !isSignup;
        titleField.hidden = role === 'student' || role === 'super_admin';
        departmentField.hidden = role === 'super_admin';
        authSwitch.hidden = role === 'student';
        authTitle.textContent = isSignup ? 'Create account' : 'Welcome back';
        authDescription.innerHTML = isSignup ? `Register as <strong>${role === 'super_admin' ? 'Super Admin' : role[0].toUpperCase() + role.slice(1)}</strong>.` : `Sign in as <strong id="login-role">${role === 'super_admin' ? 'Super Admin' : role[0].toUpperCase() + role.slice(1)}</strong> to continue.`;
        form.querySelector('button[type="submit"]').textContent = isSignup ? 'Create account' : 'Sign in securely';
        authSwitch.textContent = isSignup ? 'Use an existing account' : 'Create account instead';
        form.dataset.signup = isSignup ? 'true' : 'false';
    };
    setMode(signup);
    authSwitch.onclick = () => setMode(form.dataset.signup !== 'true');
    
    // Handle student role (no login required)
    if (role === 'student') {
        setSession({ role: 'student', name: 'Guest Student' });
        location.href = link('map/map.html')
    }
    
    // Form submission handler
    form.addEventListener('submit', e => {
        e.preventDefault();
        (async () => {
            const password = document.querySelector('#password').value;
            const name = document.querySelector('#name').value.trim();
            const department = document.querySelector('#department').value || DEPARTMENTS[0];
            const title = document.querySelector('#title').value;
            let accountList = users();
            
            // Handle account creation
            if (form.dataset.signup === 'true') {
                if (document.querySelector('#verification').value !== verification[role]) return toast('Security verification failed.');
                if (!name || password.length < 8 || password !== document.querySelector('#confirm-password').value) return toast('Enter matching passwords with at least 8 characters.');
                
                // DATABASE: Insert new user into database with proper validation
                const account = { 
                    id: crypto.randomUUID(), 
                    role, 
                    name, 
                    department: role === 'super_admin' ? 'N/A' : department, 
                    title: role === 'super_admin' ? 'Super Admin' : title, 
                    passwordHash: await hashPassword(password), 
                    createdAt: new Date().toISOString() 
                };
                accountList = accountList.filter(user => user.name !== name || user.role !== role); 
                accountList.push(account); 
                saveUsers(accountList);
                
                // DATABASE: Auto-add new faculty to admin faculty list
                // In production, this would be handled by database triggers or backend logic
                if (role === 'faculty') {
                    const schedules = getSchedules();
                    // Add a placeholder schedule entry to make faculty visible in admin list
                    schedules.push({
                        id: Date.now(),
                        faculty: name,
                        department: department,
                        title: title,
                        subject: 'Not assigned',
                        code: 'N/A',
                        room: 'TBD',
                        year: 'ALL',
                        days: [],
                        start: '00:00',
                        end: '00:00',
                        status: 'pending',
                        submittedAt: new Date().toISOString()
                    });
                    saveSchedules(schedules);
                }
                
                toast('Account created. You can now sign in.'); 
                setMode(false); 
                form.reset(); 
                return;
            }
            
            // Handle login
            const account = accountList.find(user => user.role === role && user.name.toLowerCase() === name.toLowerCase());
            if (!account || account.passwordHash !== await hashPassword(password)) return toast('Invalid account credentials.');
            
            // DATABASE: Set secure session with JWT token in production
            setSession({ role, name: account.name, department: account.department, title: account.title, userId: account.id });
            const targets = { faculty: 'faculty/faculty-portal.html', admin: 'admin/admin-overview.html', super_admin: 'super-admin/overview.html' };
            location.href = link(targets[role]);
        })();
    })
}