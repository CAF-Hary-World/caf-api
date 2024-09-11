import { Body, Controller, HttpCode, Patch, Query } from '@nestjs/common';
import { SignupService } from './signup.service';
import { Prisma } from '@prisma/client';
import { handleErrors } from 'src/handles/errors';

@Controller('signup')
export class SignupController {
  constructor(private readonly signUpService: SignupService) {}

  @Patch()
  @HttpCode(204)
  async signup(
    @Body()
    data: Prisma.UserUpdateInput &
      Prisma.OwnerUpdateInput &
      Prisma.ResidentUpdateInput,
    @Query() { id, residentId }: { id: string; residentId: string },
  ) {
    try {
      if (residentId)
        return await this.signUpService.activatedResident({
          ...data,
          id,
          residentId,
        });
      return await this.signUpService.activatedOwner({ data });
    } catch (error) {
      console.error(error.message);

      handleErrors(error);
    }
  }
}
