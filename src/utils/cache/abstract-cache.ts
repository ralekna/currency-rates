export abstract class Cache<V = any, K = string> {
    abstract get(key: K): V | undefined;
    abstract set(key: K, value: V): void;
    abstract getSize(): number;
    abstract setMaxSize(size: number): void;
}
