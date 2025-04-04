class Cache {
  constructor(ttl = 5 * 60 * 1000, storageKey = 'app_cache') { // Default TTL: 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Only load non-expired items
        const now = Date.now();
        Object.entries(data).forEach(([key, value]) => {
          if (now - value.timestamp <= this.ttl) {
            this.cache.set(key, value);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    this.saveToStorage();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.ttl;
    if (isExpired) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    this.saveToStorage();
  }

  // Invalidate cache for keys matching the pattern
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let totalItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    this.cache.forEach((item, key) => {
      totalItems++;
      if (now - item.timestamp > this.ttl) {
        expiredItems++;
      }
      totalSize += JSON.stringify(item).length;
    });

    return {
      totalItems,
      expiredItems,
      totalSize,
      ttl: this.ttl
    };
  }
}

export default Cache; 