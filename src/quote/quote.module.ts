import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { CACHE_SIZE } from "./currency-rates.service";
import { QuoteController } from "./quote.controller";

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [QuoteController],
    providers: [],
})
export class QuoteModule {}