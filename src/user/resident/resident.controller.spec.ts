import { Test, TestingModule } from '@nestjs/testing';
import { ResidentController } from './resident.controller';

describe('ResidentController', () => {
  let controller: ResidentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidentController],
    }).compile();

    controller = module.get<ResidentController>(ResidentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
