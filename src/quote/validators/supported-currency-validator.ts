import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
  
@ValidatorConstraint({ name: 'isSupportedCurrency', async: true })
@Injectable()
export class IsSupportedCurrency implements ValidatorConstraintInterface {
    private supportedCurrencies: string[];
    constructor(private readonly configService: ConfigService) {
    }

    async validate(text: string, validationArguments: ValidationArguments) {
        this.supportedCurrencies = this.supportedCurrencies || this.configService.get('SUPPORTED_CURRENCIES').split(',');
        return this.supportedCurrencies.includes(text);
    }
}