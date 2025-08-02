// userService.js

export function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

export function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

export function getCurrentUser() {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return null;
    return getUsers().find(u => u.email === email) || null;
}

export function setCurrentUser(email) {
    localStorage.setItem('currentUserEmail', email);
}

export function logout() {
    localStorage.removeItem('currentUserEmail');
}
export function register({ email, password, name, profile = {}, isSSO = false }) {
    const normalizeEmail = (e) => e.trim().toLowerCase();
    const normalizedEmail = normalizeEmail(email);

    const users = getUsers();
    if (users.some(u => normalizeEmail(u.email) === normalizedEmail)) {
        return false; // user exists
    }

    users.push({ email: normalizedEmail, password, name, profile, isSSO });
    saveUsers(users);
    setCurrentUser(normalizedEmail);
    return true;
}

export function login(email, password) {
    const normalizeEmail = (e) => e.trim().toLowerCase();

    const users = getUsers();
    const user = users.find(u => normalizeEmail(u.email) === normalizeEmail(email));

    if (!user) return false;

    if (user.isSSO) {
        setCurrentUser(user.email);
        return true; // no password needed for SSO
    }

    if (user.password === password) {
        setCurrentUser(user.email);
        return true;
    }

    return false;
}
