import { Test, TestingModule } from '@nestjs/testing';
import { OwnerVisitantService } from './visitant.service';

describe('OwnerVisitantService', () => {
  let service: OwnerVisitantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnerVisitantService],
    }).compile();

    service = module.get<OwnerVisitantService>(OwnerVisitantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
