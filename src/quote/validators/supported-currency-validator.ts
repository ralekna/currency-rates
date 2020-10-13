import { Inject, Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
  
@ValidatorConstraint({ name: 'isSupportedCurrency', async: true })
@Injectable()
export class IsSupportedCurrency implements ValidatorConstraintInterface {
    constructor(@Inject('SUPPORTED_CURRENCIES') private supportedCurrencies: string[]) {}
    async validate(text: string, validationArguments: ValidationArguments) {
        return this.supportedCurrencies.includes(text);
    }
}