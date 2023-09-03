import { Body, Controller, Get } from '@nestjs/common';
import { PromoValidationService } from './promo-validation.service';
import {
  PromoCodeVerificationData,
  PromoCodeVerificationResult,
  PromoVerificationUserInfo,
} from '../utils/model';
import { Observable } from 'rxjs';

@Controller('promo-valid')
export class PromoValidationController {
  constructor(
    private readonly promoValidationService: PromoValidationService
  ) {}
  @Get()
  verifyPromoCodeWithUserInfo(
    @Body() body: PromoCodeVerificationData
  ): Observable<PromoCodeVerificationResult> {
    return this.promoValidationService.verifyPromoCodeWithUserInfo(body);
  }
}
