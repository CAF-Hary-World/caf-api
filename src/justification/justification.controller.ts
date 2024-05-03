import { Controller } from '@nestjs/common';
import { JustificationService } from './justification.service';

@Controller('justification')
export class JustificationController {
  constructor(private justificationService: JustificationService) {}
}
