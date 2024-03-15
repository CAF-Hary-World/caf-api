import { Test, TestingModule } from '@nestjs/testing';
import { VisitantService } from './visitant.service';

describe('VisitantService', () => {
  let service: VisitantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitantService],
    }).compile();

    service = module.get<VisitantService>(VisitantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
