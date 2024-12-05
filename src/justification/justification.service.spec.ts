import { Test, TestingModule } from '@nestjs/testing';
import { JustificationService } from './justification.service';

describe('JustificationService', () => {
  let service: JustificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JustificationService],
    }).compile();

    service = module.get<JustificationService>(JustificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
