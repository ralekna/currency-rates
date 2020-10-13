import { IsNumberString, Validate } from "class-validator";
import { IsSupportedCurrency } from "../validators/supported-currency-validator";

export class QuoteRequest {
    
    @Validate(IsSupportedCurrency, {message: 'Unsupported currency'})
    base_currency: string;

    @Validate(IsSupportedCurrency, {message: 'Unsupported currency'})
    quote_currency: string;

    @IsNumberString()
    base_amount: string;
}
