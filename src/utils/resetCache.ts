import {
  userInMemory,
  usersInMemory,
  ownerInMemory,
  ownersInMemory,
  visitantInMemory,
  visitantsInMemory,
  residentsInMemory,
  residentInMemory,
} from 'src/libs/memory-cache';

export function resetUsers() {
  userInMemory.clear();
  usersInMemory.clear();
  ownerInMemory.clear();
  ownersInMemory.clear();
  visitantInMemory.clear();
  visitantsInMemory.clear();
  residentsInMemory.clear();
  residentInMemory.clear();
}
