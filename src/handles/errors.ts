import { HttpException, HttpStatus } from '@nestjs/common';

export function handleErrors(error: unknown) {
  console.error('Controller error = ', error);

  // If the error is already an HttpException, just rethrow it
  if (error instanceof HttpException) {
    throw error;
  }

  // Otherwise, throw a generic error or add more context if needed
  throw new HttpException(
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'An unexpected error occurred while blocking the visitant',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
