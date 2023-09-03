import { Injectable } from '@nestjs/common';
import {
  Promo,
  PromoCreateResult,
  PromoCreation,
  PromoListItem,
  Promos,
} from '../utils/model';
import { Observable, of } from 'rxjs';
import { getUuid } from '../utils/utils';

@Injectable()
export class PromoManagementService {
  private promos: Promos = {};

  getPromos(): Observable<PromoListItem[]> {
    const allPromos = Object.keys(this.promos).map((promoName) => {
      const promoItem = new PromoListItem();
      promoItem.avantage = this.promos[promoName].avantage;
      promoItem.name = this.promos[promoName].name;
      promoItem.restrictions = this.promos[promoName].restrictions;

      return promoItem;
    });
    return of(allPromos);
  }

  addNewPromo(promo: PromoCreation): Observable<PromoCreateResult> {
    const promoCreationResult = new PromoCreateResult();
    try {
      if (this.isValidPromo(promo)) {
        this.promos[promo.name] = { ...{ _id: getUuid() }, ...promo };
        promoCreationResult.status = 'accepted';
      } else {
        promoCreationResult.status = 'denied';
        promoCreationResult.reason = 'Not valid promo';
      }
    } catch (error) {
      promoCreationResult.status = 'denied';
      promoCreationResult.reason = ''; // @todo work on the error messages
    }

    return of(promoCreationResult);
  }

  deletePromo(name: string): Observable<boolean> {
    if (this.promos[name]) {
      delete this.promos[name];
    }
    return of(true);
  }

  getPromoByName(name: string) {
    return this.promos[name];
  }

  //@todo improve more check
  isValidPromo(promo: PromoCreation) {
    if (
      promo.hasOwnProperty('name') &&
      promo.hasOwnProperty('avantage') &&
      promo.hasOwnProperty('restrictions')
    ) {
      if (promo.restrictions.length > 0 && !this.promos[promo.name]) {
        return true;
      }
    }
    return false;
  }
}
