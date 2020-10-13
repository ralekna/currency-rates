import * as Joi from "@hapi/joi";
import { HttpModule, HttpService, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { Cache, LinkedLRUCache } from "../utils/cache";
import { AppModule } from "../app.module";
import { CurrencyRatesService, exchangeResponseSchema } from "./currency-rates.service";
import { QuoteModule } from "./quote.module";
import { ModuleRef } from "@nestjs/core";

describe(`CurrencyRatesService`, () => {

    let moduleRef: TestingModule;
    let currencyRatesService: CurrencyRatesService;
    let httpsServiceSpy: jest.SpyInstance;

    beforeEach(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [HttpModule, AppModule, QuoteModule], // yes, I do agree that it's not a fully isolated unit test but it's doable
            controllers: [CurrencyRatesService],
            providers: [
                {
                    provide: 'AXIOS_INSTANCE_TOKEN',
                    useValue: {get() {}}
                }, 
                HttpService,
                {
                    provide: Cache,
                    useFactory: (): Cache => {
                        return new LinkedLRUCache(2);
                    }
                },
                {
                    provide: 'SUPPORTED_CURRENCIES',
                    useValue: ['USD', 'EUR', 'GBP', 'ILS']
                },
                Logger
            ]

        }).compile();

        currencyRatesService = moduleRef.get(CurrencyRatesService);
    });

    afterEach(() => {
        httpsServiceSpy?.mockRestore();
    });

    const validResponse = {
        "rates": {
            "USD":0.2954699121,
            "GBP":0.2268750157
        },
        "base":"ILS",
        "date":"2020-10-12"
    };

    const invalidResponse = {
        "rates": {
            "USD":0.2954699121,
            "GB":0.2268750157
        },
        "base":"ILS",
        "date":"020-10-12"
    };

    it('should validate response from 3rd party currency exchange', () => {


        expect(Joi.attempt(validResponse, exchangeResponseSchema)).toEqual(validResponse);
        expect(() => Joi.attempt(invalidResponse, exchangeResponseSchema)).toThrow();
    });

    it('should retrieve rating and hit cache second time', async () => {

        const httpService = moduleRef.get(HttpService);
        httpsServiceSpy = jest.spyOn(httpService, 'get')
            .mockImplementation((url: string) => of({data: validResponse, status: null, statusText: null, headers: null, config: null}));

        expect(currencyRatesService.getRate('ILS', 'USD', '100')).resolves.toEqual(['0.295', '30']);
        expect(currencyRatesService.getRate('ILS', 'USD', '100')).resolves.toEqual(['0.295', '30']);
        expect(httpsServiceSpy).toHaveBeenCalledTimes(1);
    });

    it('should not fetch rates on silly requests', async () => {

        const httpService = moduleRef.get(HttpService);
        httpsServiceSpy = jest.spyOn(httpService, 'get')
            .mockImplementation((url: string) => of({data: validResponse, status: null, statusText: null, headers: null, config: null}));

        expect(currencyRatesService.getRate('ILS', 'ILS', '100')).resolves.toEqual(['1', '100']);
        expect(httpsServiceSpy).toHaveBeenCalledTimes(0);

    });

    it('should throw erro on incorrect response from 3rd party service', async () => {

        const httpService = moduleRef.get(HttpService);
        httpsServiceSpy = jest.spyOn(httpService, 'get')
            .mockImplementation((url: string) => of({data: invalidResponse, status: null, statusText: null, headers: null, config: null}));

        expect(currencyRatesService.getRate('ILS', 'LTL', '100')).rejects.toThrow();
    });
});