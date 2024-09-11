import { Controller, Get, Param } from '@nestjs/common';
import { ResidentService } from './resident.service';
import { handleErrors } from 'src/handles/errors';

@Controller('residents/:id/:residentId')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  @Get()
  async getResident(
    @Param() { id, residentId }: { id: string; residentId: string },
  ) {
    try {
      return await this.residentService.getResident({ id, residentId });
    } catch (error) {
      handleErrors(error);
    }
  }
}
