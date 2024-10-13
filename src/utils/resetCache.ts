import {
  userInMemory,
  usersInMemory,
  ownerInMemory,
  ownersInMemory,
  visitantInMemory,
  visitantsInMemory,
  residentsInMemory,
  residentInMemory,
  adminInMemory,
  adminsInMemory,
  serviceInMemory,
  servicesInMemory,
} from 'src/libs/memory-cache';

export function resetUsers() {
  userInMemory.clear();
  usersInMemory.clear();
  ownerInMemory.clear();
  ownersInMemory.clear();
  adminInMemory.clear();
  adminsInMemory.clear();
  visitantInMemory.clear();
  visitantsInMemory.clear();
  residentsInMemory.clear();
  residentInMemory.clear();
}

export function resetService() {
  serviceInMemory.clear();
  servicesInMemory.clear();
}
