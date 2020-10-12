import { Injectable } from "@nestjs/common";
import { Cache } from "./abstract-cache";

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
export class LinkedLRUCache<V = any, K extends string | number | symbol = string> implements Cache<V, K> {

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
