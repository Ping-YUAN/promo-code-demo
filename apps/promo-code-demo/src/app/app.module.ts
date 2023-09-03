import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PromoManagementController } from '../promo-management/promo-management.controller';
import { PromoValidationController } from '../promo-validation/promo-validation.controller';
import { PromoManagementService } from '../promo-management/promo-management.service';
import { PromoValidationService } from '../promo-validation/promo-validation.service';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from '../utils/weather.service';

@Module({
  imports: [HttpModule],
  controllers: [
    AppController,
    PromoManagementController,
    PromoValidationController,
  ],
  providers: [
    AppService,
    PromoManagementService,
    PromoValidationService,
    WeatherService,
  ],
})
export class AppModule {}
