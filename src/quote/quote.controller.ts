import { BadGatewayException, Controller, Get, Inject, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { CurrencyRatesService } from "./currency-rates.service";

@Controller('quote')
export class QuoteController {

    constructor(
        private readonly currencyRatesService: CurrencyRatesService
    ) {}

    @Get()
    async getQuote(@Res() response: Response, @Query('base_currency') baseCurrency: string, @Query('quote_currency') quoteCurrency: string, @Query('base_amount') baseAmountString: string) {

        let [exchangeRate, quoteAmount] = await this.currencyRatesService.getRate(baseCurrency, quoteCurrency, baseAmountString);
        response.set('Content-Type', 'application/json');
        // Writing response as string because native JSON serializers doesn't support extremely long numbers. 
        // Note that client must also have a custom JSON parser supporting such long numbers (been there, done that).
        response.send(`{"exchange_rate": ${exchangeRate}, "quote_amount": ${quoteAmount}}`);
    }
}