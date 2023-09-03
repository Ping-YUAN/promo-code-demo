export class PromoAvantage {
  percent: number;
}

export class PromoCreation {
  name: string;
  avantage: PromoAvantage;
  restrictions: any[];
}

export class PromoListItem extends PromoCreation {}

export class PromoCreateResult {
  status: 'accepted' | 'denied';
  reason: string;
}

export class Promo extends PromoCreation {
  _id: string;
}

export class Promos {
  [promoName: string]: Promo;
}

export class PromoUserCity {
  town: string;
}

export class PromoVerificationUserInfo {
  age?: number;
  date?: string;
  meteo?: PromoUserCity;
}

export class PromoCodeVerificationData {
  promocode_name: string;
  arguments: PromoVerificationUserInfo; // user info
}

export class PromoCodeVerificationResult {
  promocode_name: string;
  status: 'accepted' | 'denied';
  avantage?: PromoAvantage;
  reason?: string;
}

export class PromoRestrictionItemVerficationResult {
  result: boolean;
  reason?: string;
}

export const OrOperation = '@or';
export const AndOperation = '@and';
export const PromoRestrictionItemPrefix = '@';

export const NumberOperationType = 'number';
export const DateOperationType = 'date';
export const WeatherOperationType = 'weather';
export const StringOperationType = 'string';

export class Weather {
  city: string;
  lat: number;
  lon: number;
  county: string;
  state: string;
  weather: {
    main: string;
    temp: number;
  };
}

export class Weathers {
  [cityName: string]: Weather;
}
