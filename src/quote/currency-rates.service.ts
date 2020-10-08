import { Injectable } from "@nestjs/common";
import { LRUCache } from "src/utils/cache";

@Injectable()
export class CurrencyRatesService {

    #cache: LRUCache = new LRUCache<Promise<string>>(parseInt(process.env.RATES_CACHE_SIZE) || 2);

    async getRate(baseCurrency: string, quoteCurrency: string, amount: string): Promise<string> {
        let value = this.#cache.get(baseCurrency);
        if (value) {
            return value;
        } else {
            let newValue = Promise.resolve(String(Date.now()));
            this.#cache.set(baseCurrency, newValue);
            return newValue;
        }
    }

}

export const CACHE_SIZE = 'CACHE_SIZE';