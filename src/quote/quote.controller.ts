import { Controller, Get, Query } from "@nestjs/common";
import { CurrencyRatesService } from "./currency-rates.service";

@Controller('/quote')
export class QuoteController {

    constructor(private readonly currencyRatesService: CurrencyRatesService) {}

    @Get()
    async getQuote(@Query('base_currency') baseCurrency: string, @Query('quote_currency') quoteCurrency: string, @Query('base_amount') baseAmountString: string) {
        let exchangeRate = await this.currencyRatesService.getRate(baseCurrency, quoteCurrency, baseAmountString);
        return {
            // exchange_rate,
            // quote_amount
        }
    }
}