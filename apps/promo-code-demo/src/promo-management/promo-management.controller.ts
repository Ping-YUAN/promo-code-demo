import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PromoManagementService } from './promo-management.service';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import {
  PromoCreateResult,
  PromoCreation,
  PromoListItem,
} from '../utils/model';

@Controller('promo-management')
export class PromoManagementController {
  constructor(
    private readonly promoManagementService: PromoManagementService
  ) {}

  @Get()
  getPromos(): Observable<PromoListItem[]> {
    return this.promoManagementService.getPromos();
  }

  @Post()
  addPromo(@Body() promo: PromoCreation): Observable<PromoCreateResult> {
    return this.promoManagementService.addNewPromo(promo);
  }

  @Delete(':name')
  deletePromo(@Param('name') promoName: string) {
    this.promoManagementService.deletePromo(promoName);
  }
}
