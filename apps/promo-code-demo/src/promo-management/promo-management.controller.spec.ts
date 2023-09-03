import { Test, TestingModule } from '@nestjs/testing';
import { PromoManagementController } from './promo-management.controller';
import { PromoManagementService } from './promo-management.service';

describe('PromoManagementController', () => {
  let controller: PromoManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromoManagementController],
      providers: [PromoManagementService],
    }).compile();

    controller = module.get<PromoManagementController>(
      PromoManagementController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
