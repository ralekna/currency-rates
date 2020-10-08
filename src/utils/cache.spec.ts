import { DoublyLinkedList, LRUCache } from "./cache";

describe('Cache', () => {

    describe('DoublyLinkedList', () => {

        it('should add entries to linked list', () => {
            const list = new DoublyLinkedList();
            list.unshift(1);
            list.unshift(2);
            list.unshift(3);
            expect(list.getEntries()).toEqual([3,2,1]);
        });

        it('should remove entry from linked list', () => {
            const list = new DoublyLinkedList();
            list.unshift(1);
            list.unshift(2);
            list.unshift(3);
            list.pop();
            expect(list.getEntries()).toEqual([3,2]);
        });

        it('should get size of list', () => {
            const list = new DoublyLinkedList();
            list.unshift(1);
            list.unshift(2);
            list.unshift(3);
            list.pop();
            expect(list.getSize()).toEqual(2);
        });

        it('should move entry to beginning of linked list', () => {
            const list = new DoublyLinkedList();
            const item = list.unshift(1);
            list.unshift(2);
            list.unshift(3);
            list.moveToTop(item);
            expect(list.getEntries()).toEqual([1,3,2]);
        });
    });

    describe('LRUCache', () => {

        it('should add items', () => {
            const cache = new LRUCache(3);
            cache.set('one', 1);
            cache.set('two', 2);
            cache.set('three', 3);
            expect(cache.getSize()).toEqual(3);
        });

        it('should remove least recent item when maximum size is reached', () => {
            const cache = new LRUCache(3);
            cache.set('one', 1);
            cache.set('two', 2);
            cache.set('three', 3);
            cache.set('four', 4);
            expect(cache.getSize()).toEqual(3);
            expect(cache.get('one')).toBeUndefined();
        });

        it('should prioritize recently accessed items', () => {
            const cache = new LRUCache(3);
            cache.set('one', 1);
            cache.set('two', 2);
            cache.set('three', 3);
            cache.get('one');
            cache.set('four', 4);
            expect(cache.getSize()).toEqual(3);
            expect(cache.get('one')).not.toBeUndefined();
            expect(cache.get('two')).toBeUndefined();
        });
    });
})
