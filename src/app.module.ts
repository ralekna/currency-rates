import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuoteModule } from './quote/quote.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // validating if all required options comes from environmental variables
      validationSchema: Joi.object({
        RATES_CACHE_SIZE: Joi.number().greater(-1).default(2),
        SUPPORTED_CURRENCIES: Joi.string().pattern(/^(?:[A-Z]{3}(?:,[A-Z]{3})*)$/).required(),
        QUOTES_SERVICE_PATH: Joi.string().uri().required()
      })
    }),
    QuoteModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
