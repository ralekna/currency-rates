import { Injectable } from "@nestjs/common";

export interface Cache<V = any, K = string> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    getSize(): number;
    setMaxSize(size: number): void;
}

class HashedListNode<K, V> {
    constructor(public key: K, public value: V) {}
    next: HashedListNode<K, V> | null;
    prev: HashedListNode<K, V> | null;
    recycle(value: V): HashedListNode<K, V> {
        this.value = value;
        return this;
    }
}

@Injectable()
export class LRUCache<V = any, K extends string | number | symbol = string> implements Cache<V, K> {

    #head: HashedListNode<K, V> | null;
    #tail: HashedListNode<K, V> | null;
    #map: Map<K, HashedListNode<K, V>> = new Map();
    #maxSize: number;
    
    constructor(maxSize: number) {
        this.#maxSize = maxSize;
    }

    set(key: K, value: V): void {
        const existingNode = this.#map.get(key);
        if (existingNode) {
            this.delete(existingNode);
        }
        
        if (this.#maxSize > 0 && this.#map.size === this.#maxSize) {
            this.delete(this.#tail);
        }

        if (this.#maxSize > 0) {

            const newNode = existingNode ? existingNode.recycle(value) : new HashedListNode(key, value);

            if (!this.#map.size || this.#maxSize === 1) {
                this.#head = this.#tail = newNode;
            } else {
                const previousHeadNode = this.#head;
                this.#head = newNode;
                previousHeadNode.prev = newNode;
                newNode.next = previousHeadNode;
            }
            this.#map.set(key, newNode);
        }
    }

    private delete(node: HashedListNode<K, V>, doNotDeleteFromMap: boolean = false): HashedListNode<K, V> | undefined {
        if (node.next) {
            if (node.prev) {
                node.prev.next = node.next;
                node.next.prev = node.prev;
            } else {
                this.#head = node.next;
            }
        } else {
            this.#tail = node.prev;
        }
        if (!doNotDeleteFromMap) {
            this.#map.delete(node.key);
        }
        
        return node;
    }

    get(key: K): V | undefined {
        const node = this.#map.get(key);
        if (node) {
            this.moveToStart(node);
            return node.value;
        }
    }

    private moveToStart(node: HashedListNode<K, V>): void {
        if (node !== this.#head) {
            this.delete(node, true);
            const previousHeadNode = this.#head;
            this.#head = previousHeadNode.prev = node;
            node.next = previousHeadNode;
        }
    }

    getSize(): number {
        return this.#map.size;
    }

    setMaxSize(maxSize: number) {
        this.#maxSize = Math.max(0, maxSize);
        if (this.#maxSize > 0) {
            while(this.#map.size > this.#maxSize) {
                this.delete(this.#tail);
            }
        } else {
            this.#head = this.#tail = null;
            this.#map.clear();
        }
        
    }
}

const without = item => arrayItem => arrayItem !== item;

/**
 * I like minimalism of this implementation but it has significantly slower performance because of array recreation
 * @deprecated
 */
@Injectable()
export class LRUCache2<V = any, K extends string | number | symbol = string> implements Cache<V, K> {

    #maxSize: number;
    #list: Array<[K, V]> = [];
    #map: Map<K, [K, V]> = new Map();

    constructor(size: number) {
        this.#maxSize = size;
    }
    
    get(key: K): V | undefined {
        const keyValPair = this.#map.get(key);
        if (keyValPair) {
            if (this.#list[0] !== keyValPair) {
                this.#list = [keyValPair, ...this.#list.filter(without(keyValPair))];
            }
            return keyValPair[1];
        }
    }

    set(key: K, value: any): void {
        if (this.#maxSize <= 0) {
            return;
        }
        const keyValPair: [K, V] = [key, value];
        if (!this.#map.get(key)) {
            const lastItemKey = this.#list[this.#maxSize - 1]?.[0];
            this.#list = [keyValPair, ...this.#list.slice(0, this.#maxSize - 1)];
            if (lastItemKey) {
                this.#map.delete(lastItemKey);
            }
        } else {
            this.#list = [keyValPair, ...this.#list.filter(without(this.#map.get(key)))];
        }
        this.#map.set(key, keyValPair);
    }

    getSize(): number {
        return this.#list.length;
    }

    setMaxSize(maxSize: number): void {
        this.#maxSize = Math.max(0, maxSize);
        if (this.#maxSize < this.#list.length) {
            this.#list.slice(this.#maxSize).forEach(([key]) => this.#map.delete(key));
            this.#list = this.#list.slice(0, this.#maxSize);
        }
    }
}