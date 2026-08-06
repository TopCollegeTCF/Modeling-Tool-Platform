import { LocalStorageProvider } from './LocalStorageProvider.js';

export class StorageManager {
    constructor() {
        this.provider = new LocalStorageProvider();
        this.namespace = 'editor';
        this.cache = new Map();
    }
    
    setNamespace(namespace) {
        this.namespace = namespace;
        return this;
    }
    
    getKey(key) {
        return `${this.namespace}:${key}`;
    }
    
    async save(key, data) {
        const fullKey = this.getKey(key);
        this.cache.set(key, data);
        return this.provider.save(fullKey, data);
    }
    
    async load(key) {
        const fullKey = this.getKey(key);
        
        // Проверяем кеш
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const data = await this.provider.load(fullKey);
        if (data !== null) {
            this.cache.set(key, data);
        }
        return data;
    }
    
    async remove(key) {
        const fullKey = this.getKey(key);
        this.cache.delete(key);
        return this.provider.remove(fullKey);
    }
    
    async clear() {
        this.cache.clear();
        return this.provider.clear();
    }
    
    async loadAll(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = await this.load(key);
        }
        return results;
    }
    
    async saveAll(data) {
        const results = {};
        for (const [key, value] of Object.entries(data)) {
            results[key] = await this.save(key, value);
        }
        return results;
    }
}