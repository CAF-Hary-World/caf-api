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
  providerInMemory,
  providersInMemory,
  servicesPermissionsInMemory,
  parcelsInMemory,
  parcelInMemory,
  placesWithBookingsInMemory,
  placesWithoutBookingsInMemory,
  placeWithoutBookingsInMemory,
  bookingInMemory,
  bookingsInMemory,
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

export function resetProvider() {
  providerInMemory.clear();
  providersInMemory.clear();
}

export function resetServicePermission() {
  servicesPermissionsInMemory.clear();
}

export function resetParcels() {
  parcelsInMemory.clear();
}

export function resetParcel() {
  parcelInMemory.clear();
}

export function resetPlace() {
  placesWithBookingsInMemory.clear();
  placesWithBookingsInMemory.clear();
  placeWithoutBookingsInMemory.clear();
  placesWithoutBookingsInMemory.clear();
}

export function resetBooking() {
  bookingInMemory.clear();
  bookingsInMemory.clear();
}
