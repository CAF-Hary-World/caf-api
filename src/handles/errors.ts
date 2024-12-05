import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handleErrors(error: unknown) {
  console.error('Controller error = ', error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const fieldTartget = error.meta?.target;
    throw new ConflictException(fieldTartget[0]);
  }

  // If the error is already an HttpException, just rethrow it
  if (error instanceof HttpException) {
    throw error;
  }

  // Otherwise, throw a generic error or add more context if needed
  throw new HttpException(
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Um erro inesperado ocorreu no servidor!',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
