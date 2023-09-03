import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { Weather } from './model';
import { of } from 'rxjs';
import { HttpModule, HttpService } from '@nestjs/axios';

describe('weather service', () => {
  let service: WeatherService;
  let httpCallCount = 0;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: (value) => {
              if (httpCallCount == 0) {
                httpCallCount++;
                return of({
                  data: [
                    {
                      name: 'Paris',
                      lat: 56,
                      lon: 12,
                      country: 'France',
                      state: 'Il-de-france',
                    },
                  ],
                });
              }
              if (httpCallCount == 1) {
                httpCallCount++;
                return of({
                  data: {
                    weather: [{ main: 'Clear' }],
                    main: { temp: 30 },
                  },
                });
              }
            },
          },
        },
      ],
    }).compile();
    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get cached weather by city name', () => {
    service.getWeatherByCityName('Lyon').subscribe((data) => {
      expect(data.lat).toBe(45.7578137);
    });
  });

  it('should get new weather from api', () => {
    service.getWeatherByCityName('Paris').subscribe((data) => {
      expect(data.lat).toBe(56);
      expect(data.weather.temp).toBe(30);
      expect(data.weather.main.toLowerCase()).toBe('clear');
    });
  });
});
