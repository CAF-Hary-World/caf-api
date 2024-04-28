import { Test, TestingModule } from '@nestjs/testing';
import { VisitantController } from './visitant.controller';

describe('VisitantController', () => {
  let controller: VisitantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitantController],
    }).compile();

    controller = module.get<VisitantController>(VisitantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
