export class LocalStorageProvider {
    constructor() {
        this.prefix = 'editor_';
    }
    
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    
    async save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.getKey(key), serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    async load(key) {
        try {
            const raw = localStorage.getItem(this.getKey(key));
            if (raw === null) return null;
            return JSON.parse(raw);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }
    
    async remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    async clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
    
    async getAll() {
        try {
            const result = {};
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const originalKey = key.replace(this.prefix, '');
                    try {
                        result[originalKey] = JSON.parse(localStorage.getItem(key));
                    } catch {
                        result[originalKey] = localStorage.getItem(key);
                    }
                }
            });
            return result;
        } catch (error) {
            console.error('Error getting all from localStorage:', error);
            return {};
        }
    }
}