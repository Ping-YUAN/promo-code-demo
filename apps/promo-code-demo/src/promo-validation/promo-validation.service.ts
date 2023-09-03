import { Injectable } from '@nestjs/common';
import {
  AndOperation,
  DateOperationType,
  OrOperation,
  PromoCodeVerificationData,
  PromoCodeVerificationResult,
  PromoRestrictionItemVerficationResult,
  PromoVerificationUserInfo,
  StringOperationType,
  WeatherOperationType,
} from '../utils/model';
import { Observable, combineLatest, map, of } from 'rxjs';
import { PromoManagementService } from '../promo-management/promo-management.service';
import { WeatherService } from '../utils/weather.service';
import {
  GeneralOperationErrorFunctions,
  GeneralOperationFunctions,
  getPromoItemType,
  getVerificationLeafResult,
} from '../utils/utils';
import { WeatherOperation } from '../utils/operations';

@Injectable()
export class PromoValidationService {
  constructor(
    private readonly promoManagementService: PromoManagementService,
    private readonly weatherService: WeatherService
  ) {}

  verifyPromoCodeWithUserInfo(
    promoCodeVerificationData: PromoCodeVerificationData
  ): Observable<PromoCodeVerificationResult> {
    const targetPromo = this.promoManagementService.getPromoByName(
      promoCodeVerificationData.promocode_name
    );
    if (!targetPromo) {
      const noPromoResult = new PromoCodeVerificationResult();
      noPromoResult.promocode_name = promoCodeVerificationData.promocode_name;
      noPromoResult.status = 'denied';
      noPromoResult.reason = "Promo doesn't exist";

      return of(noPromoResult);
    }

    const promoRestrictionObservable = targetPromo.restrictions.map((item) => {
      return this.verifyPromoCodeRestrictionItem(
        item,
        promoCodeVerificationData.arguments
      );
    });

    return combineLatest(promoRestrictionObservable).pipe(
      map((data) => {
        const result = data.reduce(
          (previous, current) => {
            return {
              result: previous.result && current.result,
              reason: previous.reason
                ? previous.reason + ', ' + current.reason
                : current.reason,
            };
          },
          {
            result: true,
            reason: '',
          }
        );

        return result;
      }),
      map((data) => {
        const promoResult = new PromoCodeVerificationResult();
        promoResult.promocode_name = promoCodeVerificationData.promocode_name;

        if (data.result) {
          promoResult.avantage = targetPromo.avantage;
          promoResult.status = 'accepted';
        } else {
          promoResult.status = 'denied';
          promoResult.reason = data.reason;
        }

        return promoResult;
      })
    );
  }

  verifyPromoCodeRestrictionItem(
    restrictionItem: any,
    user: PromoVerificationUserInfo
  ): Observable<PromoRestrictionItemVerficationResult> {
    const key = Object.keys(restrictionItem)[0].toLowerCase();

    switch (key) {
      case OrOperation: {
        return this.verifyOrOperation(restrictionItem[key], user);
      }

      case AndOperation: {
        return this.verifyAndOperation(restrictionItem[key], user);
      }

      default: {
        return this.verifyLeafOperation(restrictionItem[key], user, key);
      }
    }
  }

  verifyOrOperation(
    restrictionItem: any,
    user: PromoVerificationUserInfo
  ): Observable<PromoRestrictionItemVerficationResult> {
    const orRestictionObserable: Observable<PromoRestrictionItemVerficationResult>[] =
      restrictionItem.map((item) => {
        return this.verifyPromoCodeRestrictionItem(item, user);
      });

    return combineLatest(orRestictionObserable).pipe(
      map((data) => {
        return data.reduce(
          (previous, current) => {
            const result = previous.result || current.result;
            return {
              result: result,
              reason: !result
                ? previous.reason
                  ? previous.reason + ', ' + current.reason
                  : current.reason
                : '',
            };
          },
          {
            result: false,
            reason: '',
          }
        );
      })
    );
  }
  verifyAndOperation(
    restrictionItem: any,
    user: PromoVerificationUserInfo
  ): Observable<PromoRestrictionItemVerficationResult> {
    const andRestictionObserable: Observable<PromoRestrictionItemVerficationResult>[] =
      restrictionItem.map((item) => {
        return this.verifyPromoCodeRestrictionItem(item, user);
      });
    return combineLatest(andRestictionObserable).pipe(
      map((data) => {
        return data.reduce(
          (previous, current) => {
            const result = previous.result && current.result;
            return {
              result: result,
              reason: previous.reason + !result ? current.reason : '',
            };
          },
          {
            result: true,
            reason: '',
          } as PromoRestrictionItemVerficationResult
        );
      })
    );
  }
  verifyLeafOperation(
    restrictionItem: any,
    user: PromoVerificationUserInfo,
    key: string
  ): Observable<PromoRestrictionItemVerficationResult> {
    // working on the different spec promo type
    const userProperty = key.replace('@', '');
    const operations = Object.keys(restrictionItem);

    const operationType = getPromoItemType(
      userProperty,
      operations[0],
      restrictionItem[operations[0]]
    );
    switch (operationType) {
      case WeatherOperationType: {
        return this.weatherService.getWeatherByCityName(user.meteo.town).pipe(
          map((data) => {
            const weatherOperation = new WeatherOperation(
              userProperty,
              restrictionItem,
              user,
              data
            );
            const result = weatherOperation.getResult();
            return result;
          })
        );
      }
      case DateOperationType: {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        const result = operations.reduce(
          (previous, current) => {
            const result =
              previous.result &&
              GeneralOperationFunctions[current](
                new Date(todayString),
                new Date(restrictionItem[current])
              );

            return {
              result: result,
              reason:
                previous.result && !result
                  ? previous.reason +
                    GeneralOperationErrorFunctions[current](
                      userProperty,
                      restrictionItem[current]
                    )
                  : previous.reason,
            };
          },
          {
            result: true,
            reason: '',
          } as PromoRestrictionItemVerficationResult
        );

        return of(result);
      }

      default: {
        // number operation here
        // operations, user property, value of user, value of restrictions,

        return of(
          getVerificationLeafResult(
            operations,
            userProperty,
            user[userProperty],
            restrictionItem
          )
        );
      }
    }
  }
}
