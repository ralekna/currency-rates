import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { QuoteModule } from '../src/quote/quote.module';
import { AppModule } from '../src/app.module';

describe('QuoteController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, QuoteModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/quote (GET) should return same amount without hitting 3rd party service', () => {
    return request(app.getHttpServer())
      .get('/quote?base_currency=USD&quote_currency=USD&base_amount=100')
      .expect(200)
      .expect({
        exchange_rate: "1",
        quote_amount: "100"
      });
  });

  it('/quote (GET) should return amount with rate from hitting 3rd party service', () => {
    return request(app.getHttpServer())
      .get('/quote?base_currency=USD&quote_currency=EUR&base_amount=100')
      .expect(200)
      .expect({
        exchange_rate: "1",
        quote_amount: "100"
      });
  });
});
