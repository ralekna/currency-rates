import * as Joi from "@hapi/joi";
import { exchangeResponseSchema } from "./currency-rates.service";

describe(`CurrencyRatesService`, () => {
    it('should validate response from 3rd party currency exchange', () => {

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

        expect(Joi.attempt(validResponse, exchangeResponseSchema)).toEqual(validResponse);
        expect(() => Joi.attempt(invalidResponse, exchangeResponseSchema)).toThrow();
    });
});