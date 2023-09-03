import { Test, TestingModule } from '@nestjs/testing';
import { PromoValidationService } from './promo-validation.service';
import { PromoManagementService } from '../promo-management/promo-management.service';
import { WeatherService } from '../utils/weather.service';
import { Weather } from '../utils/model';
import { of } from 'rxjs';

describe('promo-validation service', () => {
  let validationService: PromoValidationService;
  let promoManagementService: PromoManagementService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoValidationService,
        PromoManagementService,
        {
          provide: WeatherService,
          useValue: {
            getWeatherByCityName: () => of({} as Weather),
          },
        },
      ],
    }).compile();
    validationService = module.get<PromoValidationService>(
      PromoValidationService
    );
    promoManagementService = module.get<PromoManagementService>(
      PromoManagementService
    );
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });

  it('verify a simple promo code', () => {
    promoManagementService
      .addNewPromo({
        name: 'senior',
        avantage: { percent: 20 },
        restrictions: [
          {
            '@age': {
              gt: 60,
            },
          },
        ],
      })
      .subscribe((data) => {
        if (data.status == 'accepted') {
          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senior',
              arguments: {
                age: 75,
              },
            })
            .subscribe((data) => {
              expect(data.status).toBe('accepted');
              expect(data.avantage.percent).toBe(20);
            });
          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senior',
              arguments: {
                age: 25,
              },
            })
            .subscribe((data) => {
              expect(data.status).toBe('denied');
            });
        }
      });
  });

  it('verify a "or" promo code', () => {
    promoManagementService
      .addNewPromo({
        name: 'senior-petit',
        avantage: { percent: 20 },
        restrictions: [
          {
            '@or': [
              {
                '@age': {
                  gt: 60,
                },
              },
              {
                '@age': {
                  lt: 10,
                },
              },
            ],
          },
        ],
      })
      .subscribe((data) => {
        if (data.status == 'accepted') {
          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senior-petit',
              arguments: {
                age: 75,
              },
            })
            .subscribe((data) => {
              expect(data.status).toBe('accepted');
              expect(data.avantage.percent).toBe(20);
            });

          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senior-petit',
              arguments: {
                age: 5,
              },
            })
            .subscribe((data) => {
              expect(data.status).toBe('accepted');
              expect(data.avantage.percent).toBe(20);
            });

          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senior-petit',
              arguments: {
                age: 55,
              },
            })
            .subscribe((data) => {
              expect(data.status).toBe('denied');
            });
        }
      });
  });

  it('verify a "and" promocode', () => {
    promoManagementService
      .addNewPromo({
        name: 'senir-woman',
        avantage: { percent: 20 },
        restrictions: [
          {
            '@and': [
              {
                '@age': {
                  gt: 60,
                },
              },
              {
                '@age': {
                  lt: 70,
                },
              },
              {
                '@gender': {
                  is: 'woman',
                },
              },
            ],
          },
        ],
      })
      .subscribe((data) => {
        if (data.status === 'accepted') {
          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senir-woman',
              arguments: {
                age: 55,
              },
            })
            .subscribe((data) => {
              expect(data.status).toBe('denied');
            });

          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senir-woman',
              arguments: {
                age: 65,
                gender: 'man',
              } as any,
            })
            .subscribe((data) => {
              expect(data.status).toBe('denied');
            });

          validationService
            .verifyPromoCodeWithUserInfo({
              promocode_name: 'senir-woman',
              arguments: {
                age: 65,
                gender: 'woman',
              } as any,
            })
            .subscribe((data) => {
              expect(data.status).toBe('accepted');
            });
        }
      });
  });
});
