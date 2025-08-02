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
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        return false; // user exists
    }
    users.push({ email, password, name, profile, isSSO });
    saveUsers(users);
    setCurrentUser(email);
    return true;
}

export function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) return false;

    if (user.isSSO) {
        setCurrentUser(email);
        return true; // no password needed for SSO
    }

    if (user.password === password) {
        setCurrentUser(email);
        return true;
    }
    return false;
}
