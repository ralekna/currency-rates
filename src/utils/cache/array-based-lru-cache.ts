import { Injectable } from "@nestjs/common";
import { Cache } from "./abstract-cache";

const without = (item: any) => (arrayItem: any) => arrayItem !== item;

/**
 * I like minimalism of this implementation but it has significantly slower performance because of array recreation
 * @deprecated
 */
@Injectable()
export class ArrayBasedLRUCache<V = any, K extends string | number | symbol = string> implements Cache<V, K> {

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
