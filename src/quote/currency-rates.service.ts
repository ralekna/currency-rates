import { BadGatewayException, HttpService, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "../utils/cache";
import { Money } from "bigint-money";
import * as Joi from "@hapi/joi";
import { without } from "../utils/array-utils";

export type ExchangeResponse = {
    rates: Record<string, number>,
    base: string,
    date: string
};

type Rates = Record<string, Money>;

export const exchangeResponseSchema = Joi.object<ExchangeResponse>({
    rates: Joi.object().pattern(/^[A-Z]{3}$/, Joi.number()),
    base: Joi.string().regex(/^[A-Z]{3}$/),
    date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

@Injectable()
export class CurrencyRatesService {

    private readonly currencyExchangeServiceUrl: string;

    constructor(
        private cache: Cache<Promise<Rates>, string>,
        private readonly configService: ConfigService,
        private httpService: HttpService,
        @Inject('SUPPORTED_CURRENCIES') private supportedCurrencies: string[],
        private logger: Logger
    ) {
        this.currencyExchangeServiceUrl = this.configService.get('QUOTES_SERVICE_PATH');
        this.logger.setContext('CurrencyRatesService');
    }

    async getRate(baseCurrency: string, quoteCurrency: string, amount: string): Promise<[string /* exchange rate */, string /* quote amount */]> {
        if (baseCurrency === quoteCurrency) { // sure, lemme do some countin' for ya...
            return ['1', amount]; // here we go buddy!
        }

        let rates = this.cache.get(baseCurrency);
        if (!rates) {
            rates = this.fetchRates(baseCurrency)
                .then(
                    ({rates}: ExchangeResponse) => 
                        Object.entries(rates)
                            .reduce((store, [currency, rate]) => ({...store, [currency]: new Money(String(rate), currency)}), {})
                );

            this.cache.set(baseCurrency, rates);
        }
        return rates.then(({[quoteCurrency]: rate}) => [
            rate.toFixed(3), 
            rate.multiply(amount).toFixed(0)]
        );
    }

    private async fetchRates(baseCurrency: string): Promise<ExchangeResponse> {
        const url = `${this.currencyExchangeServiceUrl}?base=${baseCurrency}&symbols=${this.supportedCurrencies.filter(without(baseCurrency)).join(',')}`;
        this.logger.log(`Attemting to retrieve rate: ${url}`);

        return this.httpService.get(url).toPromise()
            .then(({data}) => Joi.attempt(data, exchangeResponseSchema))
            .catch(error => {
                this.logger.error(error);
                throw new BadGatewayException('Failed to retrieve rate from 3rd party service');
            });
    }
}
