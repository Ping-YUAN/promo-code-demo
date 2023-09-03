import { Test, TestingModule } from '@nestjs/testing';
import { PromoValidationController } from './promo-validation.controller';
import { PromoValidationService } from './promo-validation.service';
import { PromoManagementService } from '../promo-management/promo-management.service';
import { WeatherService } from '../utils/weather.service';
import { of } from 'rxjs';
import { Weather } from '../utils/model';

describe('PromoValidController', () => {
  let controller: PromoValidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromoValidationController],
      providers: [PromoValidationService, PromoManagementService, {
        provide: WeatherService,
        useValue: {
          getWeatherByCityName: () => of({} as Weather)
        }
      }],
    }).compile();

    controller = module.get<PromoValidationController>(
      PromoValidationController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
