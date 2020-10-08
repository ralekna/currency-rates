import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { QuoteModule } from '../src/quote/quote.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [QuoteModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/quote (GET)', () => {
    return request(app.getHttpServer())
      .get('/quote?base_currency=USD&quote_currency=ILS&base_amount=1')
      .expect(200)
      .expect({
        base_currency: "USD",
        quote_currency: "ILS",
        base_amount: "1"
      });
  });
});
