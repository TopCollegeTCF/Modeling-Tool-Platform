const API_URL = window.location.origin;

export class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.onAuthChange = null;
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            if (this.onAuthChange) this.onAuthChange(true);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async register(username, email, password) {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            const data = await response.json();
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            if (this.onAuthChange) this.onAuthChange(true);
            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (this.onAuthChange) this.onAuthChange(false);
    }

    getAuthHeader() {
        return { 'Authorization': `Bearer ${this.token}` };
    }
}