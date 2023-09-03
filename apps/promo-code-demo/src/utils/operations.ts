import {
  PromoRestrictionItemVerficationResult,
  PromoVerificationUserInfo,
  Weather,
} from './model';
import {
  GeneralOperationErrorFunctions,
  GeneralOperationFunctions,
} from './utils';

export class Operation {
  protected userProperty: string;
  protected restrictionItem: any;
  protected userInfo: PromoVerificationUserInfo;
  constructor(
    userProperty: string,
    restrictionItem: any,
    user: PromoVerificationUserInfo
  ) {
    this.userProperty = userProperty;
    this.restrictionItem = restrictionItem;
    this.userInfo = user;
  }
  getResult() {}
}

export class WeatherOperation extends Operation {
  private weather: Weather;
  constructor(
    userProperty: string,
    restrictionItem: any,
    user: PromoVerificationUserInfo,
    weather: Weather
  ) {
    super(userProperty, restrictionItem, user);
    this.weather = weather;
  }
  getResult(): PromoRestrictionItemVerficationResult {
    const operations = Object.keys(this.restrictionItem);
    return operations.reduce(
      (previous, current) => {
        if (current == 'is') {
          const result =
            previous.result &&
            GeneralOperationFunctions[current](
              this.weather.weather.main,
              this.restrictionItem[current]
            );
          return {
            result: result,
            reason:
              previous.result == true && !result
                ? previous.reason +
                  GeneralOperationErrorFunctions[current](
                    this.userProperty,
                    this.restrictionItem[current]
                  )
                : previous.reason,
          };
        } else {
          const property = current;
          const operations = Object.keys(this.restrictionItem[property]);
          return operations.reduce(
            (previous, curerntOp) => {
              const result =
                previous.result &&
                GeneralOperationFunctions[curerntOp](
                  this.weather.weather[property],
                  this.restrictionItem[property][curerntOp]
                );

              return {
                result: result,
                reason:
                  previous.result == true && !result
                    ? previous.reason +
                      GeneralOperationErrorFunctions[curerntOp](
                        property,
                        this.restrictionItem[property][curerntOp]
                      )
                    : previous.reason,
              };
            },
            {
              result: true,
              reason: '',
            } as PromoRestrictionItemVerficationResult
          );
        }
      },
      {
        result: true,
        reason: '',
      } as PromoRestrictionItemVerficationResult
    );
  }
}
