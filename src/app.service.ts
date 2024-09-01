import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getHello() {
    const MERCHANT_ID = 'ec437879';
    const PUBLIC_KEY = '5f9713f391317d4aefa6e63161d1414a48cc2688';

    const req_time = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);

    const transactionDetails = {
      tran_id: `${req_time}`,
      amount: '1.50',
      payment_option: 'abapay',
      // firstname: 'Rithe',
      // lastname: 'Thoeun',
      // email: 'thoeun.rithe@gmail.com',
      phone: '0719411199',
      items: Buffer.from(
        JSON.stringify([
          { name: 'test', quantity: '1', price: '1.00' },
          { name: 'test2', quantity: '1', price: '2.00' },
        ]),
      ).toString('base64'),
      currency: 'USD',
      type: 'purchase',
      shipping: 'pay',
    };

    // Prepare necessary parameters

    const {
      tran_id,
      amount,
      payment_option,
      // firstname,
      // lastname,
      // email,
      phone,
      items,
      currency,
      type,
    } = transactionDetails;

    // Generate the string to hash
    const hashString =
      req_time +
      MERCHANT_ID +
      tran_id +
      amount +
      items +
      // firstname +
      // lastname +
      // email +
      phone +
      type +
      payment_option +
      currency;

    // Create the hash using HMAC SHA-512 and Base64 encoding
    const hash = crypto
      .createHmac('sha512', PUBLIC_KEY)
      .update(hashString)
      .digest('base64');

    // Create form data object to send
    const formData = {
      req_time,
      merchant_id: MERCHANT_ID,
      tran_id,
      // firstname,
      // lastname,
      // email,
      phone,
      amount,
      type,
      payment_option,
      items,
      currency: 'USD',
      hash,
    };
    try {
      // Send POST request to PayWay
      const response = await firstValueFrom(
        this.httpService.post(
          `https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        ),
      );
      // console.log(response.request);
      return `https://checkout-sandbox.payway.com.kh${response.request.path}`;
    } catch (error) {
      console.error('Error creating transaction:', error.message);
      throw new Error('Failed to create transaction');
    }
  }
}
