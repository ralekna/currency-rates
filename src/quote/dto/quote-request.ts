import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsNumberString } from "class-validator";

export class QuoteRequest {
    
    base_currency: string;

    quote_currency: string;

    @IsNumberString()
    base_amount: string;
}