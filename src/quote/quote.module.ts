import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cache, LinkedLRUCache } from "src/utils/cache";
import { CurrencyRatesService } from "./currency-rates.service";
import { QuoteController } from "./quote.controller";

// Provide cache implementation for DI
const cacheFactory = {
    provide: Cache,
    useFactory: (configService: ConfigService): Cache => {
        const cacheSize = parseInt(configService.get<string>('RATES_CACHE_SIZE'));
        return new LinkedLRUCache(cacheSize);
    },
    inject: [ConfigService]
};

const supportedCurrencies = {
    provide: 'SUPPORTED_CURRENCIES',
    useFactory: (configService: ConfigService): string[] => {
        return configService.get<string>('SUPPORTED_CURRENCIES')?.split(',');
    },
    inject: [ConfigService]
};

@Module({
    imports: [],
    controllers: [QuoteController],
    providers: [cacheFactory, supportedCurrencies, CurrencyRatesService]
})
export class QuoteModule {}
