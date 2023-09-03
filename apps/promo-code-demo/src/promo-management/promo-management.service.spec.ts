import { Test, TestingModule } from '@nestjs/testing';
import { PromoManagementService } from './promo-management.service';
import { getUuid } from '../utils/utils';
import exp from 'constants';

export const MOCK_PROMO = {
  name: 'WeatherCode',
  avantage: { percent: 20 },
  restrictions: [
    {
      '@date': {
        after: '2019-01-01',
        before: '2020-06-30',
      },
    },
    {
      '@or': [
        {
          '@age': {
            eq: 40,
          },
        },
        {
          '@and': [
            {
              '@age': {
                lt: 30,
                gt: 15,
              },
            },
            {
              '@meteo': {
                is: 'clear',
                temp: {
                  gt: '15', // Celsius here.
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
describe('promo-management service', () => {
  let service: PromoManagementService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromoManagementService],
    }).compile();
    service = module.get<PromoManagementService>(PromoManagementService);
  });

  afterEach(() => {
    service['promos'] = {};
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    service.getPromos().subscribe((data) => {
      expect(data.length).toBe(0);
    });
  });

  it('add new promo', () => {
    service.addNewPromo(MOCK_PROMO).subscribe((data) => {
      expect(data.status).toBe('accepted');
      expect(service.getPromoByName(MOCK_PROMO.name)).toBeTruthy();
    });
  });

  it('delete promo', () => {
    service['promos'][MOCK_PROMO.name] = {
      ...MOCK_PROMO,
      ...{ _id: getUuid() },
    };

    service.deletePromo(MOCK_PROMO.name).subscribe((data) => {
      expect(data).toBeTruthy();
      expect(service.getPromoByName(MOCK_PROMO.name)).toBeFalsy();
    });
  });

  it('is valid promo', () => {
    expect(
      service.isValidPromo({
        name: 'x',
        avantage: {} as any,
      } as any)
    ).toBeFalsy();

    expect(
      service.isValidPromo({
        name: 'x',
        avantage: {} as any,
        restrictions: [{}],
      } as any)
    ).toBeTruthy();
  });
});
