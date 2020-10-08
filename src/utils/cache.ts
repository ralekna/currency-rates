class ListNode<V> {
    constructor(public value: V) {}
    next: ListNode<V> | null;
    prev: ListNode<V> | null;
}

export class DoublyLinkedList<V = any> {

    #head: ListNode<V> | null;
    #tail: ListNode<V> | null;
    #size: number = 0;

    unshift(value: V): ListNode<V> {
        let newNode = new ListNode(value);
        if (this.#head) {
            newNode.prev = this.#head;
            this.#head.next = newNode;
            this.#head = newNode;
        } else {
            this.#head = this.#tail = newNode;
        }
        this.#size += 1;
        return newNode;
    }
    
    pop(): ListNode<V> | undefined {
        const tail = this.#tail;
        if (tail) {
            if (tail === this.#head) {
                this.#tail = this.#head = null;
            } else {
                tail.next.prev = null;
                this.#tail = tail.next;
            }
            tail.next = tail.prev = null;
            this.#size -= 1;
            return tail;
        }
    }

    moveToTop(node: ListNode<V>): void {
        if (this.#head === node) {
            return;
        } else {
            const currentHead = this.#head;
            if (node === this.#tail) {
                this.#tail = node.next;
            }
            node.next.prev = node.prev?.next;
            node.prev = currentHead;
            node.next = null;
            this.#head = node;
        }

    }

    getSize(): number {
        return this.#size;
    }

    getEntries() {
        let node = this.#head;
        const entriesAsArray = [];
        while(node) {
            entriesAsArray.push(node.value);
            node = node.prev;
        }
        return entriesAsArray;
    }

}

export class LRUCache<V = any, K = string> {

    #list = new DoublyLinkedList();
    #mapByKey = new Map<K, ListNode<V>>();
    #mapByNode = new Map<ListNode<V>, K>();
    #maxSize: number;

    constructor(size: number) {
        this.#maxSize = size;
    }

    get(key: K): V | undefined {
        let node = this.#mapByKey.get(key);
        if (node) {
            this.#list.moveToTop(node);
            return node.value;
        }
    }

    set(key: K, value: V): void {
        let node = this.#mapByKey.get(key);
        if (node) {
            this.#list.moveToTop(node);
            node.value = value;
        } else {
            let node = this.#list.unshift(value);
            this.#mapByKey.set(key, node);
            this.#mapByNode.set(node, key);
            if (this.#list.getSize() > this.#maxSize) {
                let removedNode = this.#list.pop();
                this.#mapByKey.delete(this.#mapByNode.get(removedNode));
                this.#mapByNode.delete(removedNode);
            }
        }
    }

    getSize(): number {
        return this.#list.getSize();
    }
}