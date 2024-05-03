import { Test, TestingModule } from '@nestjs/testing';
import { JustificationController } from './justification.controller';

describe('JustificationController', () => {
  let controller: JustificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JustificationController],
    }).compile();

    controller = module.get<JustificationController>(JustificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
