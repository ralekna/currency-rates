import { LinkedLRUCache } from "./linked-lru-cache";

describe('LinkedLRUCache', () => {

    it('should add items', () => {
        const cache = new LinkedLRUCache(3);
        cache.set('one', 1);
        cache.set('two', 2);
        cache.set('three', 3);
        expect(cache.getSize()).toEqual(3);
    });

    it('should not add items if cache size is zero', () => {
        const cache = new LinkedLRUCache(0);
        cache.set('one', 1);
        expect(cache.get('one')).toBeUndefined();
    });

    it('should remove least recent item when maximum size is reached', () => {
        const cache = new LinkedLRUCache(3);
        cache.set('one', 1);
        cache.set('two', 2);
        cache.set('three', 3);
        cache.set('four', 4);
        expect(cache.getSize()).toEqual(3);
        expect(cache.get('one')).toBeUndefined();
    });

    it('should prioritize recently accessed items', () => {
        const cache = new LinkedLRUCache(3);
        cache.set('one', 1);
        cache.set('two', 2);
        cache.set('three', 3);
        cache.get('one');
        cache.set('four', 4);
        expect(cache.getSize()).toEqual(3);
        expect(cache.get('one')).not.toBeUndefined();
        expect(cache.get('two')).toBeUndefined();
    });

    it('should remove least recent elemnets from cache when setMaxSize lowers availabe size', () => {
        const cache = new LinkedLRUCache(4);
        cache.set('one', 1);
        cache.set('two', 2);
        cache.set('three', 3);
        cache.set('four', 4);
        expect(cache.getSize()).toEqual(4);
        cache.setMaxSize(3);
        expect(cache.get('one')).toBeUndefined();
        expect(cache.get('two')).toBeDefined();
    });

    it('should get performance stats', () => {
        const cache = new LinkedLRUCache(3);
        console.log('LinkedLRUCache');
        console.time();
        for (let i = 0; i < 10000; i++) {
            cache.set('one', 1);
            cache.set('two', 2);
            cache.set('three', 3);
            cache.set('four', 4);
            cache.get('two');
            cache.set('five', 5);
        }
        console.timeEnd();
        expect(true).toBe(true);
    });

    it('should get performance stats with large storage', () => {
        const cache = new LinkedLRUCache(300);
        console.log('LinkedLRUCache large');
        console.time();
        for (let i = 0; i < 100000; i++) {
            let num = i % 163;
            cache.set(String(num), num);
            num++;
            cache.set(String(num), num);
            num++;
            cache.set(String(num), num);
            cache.get(String(num-2));
        }
        console.timeEnd();
        expect(true).toBe(true);
    });
});
