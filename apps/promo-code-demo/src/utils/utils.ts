import { v4 as uuid } from 'uuid';
import {
  DateOperationType,
  PromoRestrictionItemVerficationResult,
  WeatherOperationType,
} from './model';

export function getUuid() {
  return uuid();
}

export const GeneralOperationFunctions = {
  eq: (val1, val2) => val1 == val2,
  lt: (val1, val2) => val1 < val2,
  gt: (val1, val2) => val1 > val2,
  is: (val1, val2) => val1.toLowerCase() == val2.toLowerCase(),
  after: (date1, date2) => {
    const dateStamp1 = new Date(date1);
    const dateStamp2 = new Date(date2);
    return date2 < date1;
  },
  before: (date1, date2) => {
    const dateStamp1 = new Date(date1);
    const dateStamp2 = new Date(date2);
    return date2 > date1;
  },
};

export const GeneralOperationErrorFunctions = {
  eq: (key, value) => `${key} is not ${value}`,
  lt: (key, value) => `${key} is not less than ${value}`,
  gt: (key, value) => `${key} is not greater than ${value}`,
  is: (key, value) => `${key} is not ${value}`,
  after: (key, value) => `${key} is before ${value}`,
  before: (key, value) => `${key} is after ${value}`,
};

export const GeneralOperationKeys = Object.keys(GeneralOperationFunctions);
function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regEx) != null;
}
export function getPromoItemType(
  propertyName: string,
  operation: string,
  operationValue: any
): string {
  //complex promo checking first
  if (propertyName === 'meteo') return WeatherOperationType;
  if (
    operationValue &&
    typeof operationValue === 'string' &&
    isValidDate(operationValue)
  )
    return DateOperationType;

  // basic type
  return '';
}

export function getVerificationLeafResult(
  operations,
  property,
  userValue,
  restrictionItem
): PromoRestrictionItemVerficationResult {
  return operations.reduce(
    (previous, current) => {
      const result =
        previous.result &&
        GeneralOperationFunctions[current](userValue, restrictionItem[current]);
      return {
        result: result,
        reason:
          previous.result == true && !result
            ? previous.reason +
              GeneralOperationErrorFunctions[current](
                property,
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
}
