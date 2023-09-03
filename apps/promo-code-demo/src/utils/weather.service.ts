import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, map, of, switchMap } from 'rxjs';
import { Weather } from './model';

@Injectable()
export class WeatherService {
  private cachedWeather = {
    Lyon: {
      city: 'Lyon',
      lat: 45.7578137,
      lon: 4.8320114,
      state: 'Auvergne-Rhône-Alpes',
      weather: { main: 'clear', temp: 30.84 },
    },
  };
  private apiKey = '';

  constructor(private httpService: HttpService) {
    this.apiKey = process.env.WEATHER_API_KEY;
  }

  getWeatherByCityName(cityName: string): Observable<Weather> {
    if (this.cachedWeather[cityName]) {
      return of(this.cachedWeather[cityName]);
    } else {
      const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${this.apiKey}`;
      return this.httpService.get(cityUrl).pipe(
        map((data) => {
          return data.data[0];
        }),
        map((data) => {
          const cityWeather = new Weather();
          cityWeather.city = data.name;
          cityWeather.lat = data.lat;
          cityWeather.lon = data.lon;
          cityWeather.county = data.county;
          cityWeather.state = data.state;
          return cityWeather;
        }),
        switchMap((data) => {
          const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&appid=${this.apiKey}&units=metric`;
          return this.httpService.get(weatherUrl).pipe(
            map((weatherData) => weatherData.data),
            map((weatherData) => {
              data.weather = {
                main: weatherData.weather[0].main.toLowerCase(),
                temp: weatherData.main.temp,
              };
              this.cachedWeather[data.city] = data;
              return data;
            })
          );
        })
      );
    }
  }
}
