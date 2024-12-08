import { Logger } from '@nestjs/common';
import cloudinary from 'cloudinary';

type LOCATION = 'Avatar' | 'Documents' | 'Logo';

type RESOURCE =
  | 'Parcels'
  | 'Visitants'
  | 'Owners'
  | 'Residents'
  | 'Services'
  | 'Client';

const logger = new Logger('IMAGE');

export function getImageId({ imageUrl }: { imageUrl: string }) {
  return imageUrl.split('/').pop().split('.')[0];
}

export async function deleteImageByUrl({
  imageUrl,
  location,
  resource,
}: {
  imageUrl: string;
  location: LOCATION;
  resource: RESOURCE;
}) {
  try {
    await cloudinary.v2.api.delete_resources([
      `${location}/${resource}/${getImageId({ imageUrl })}`,
    ]);
    logger.debug(`IMAGE ${getImageId({ imageUrl })} DELETED WITH SUCCESS`);
  } catch (error) {
    logger.debug(`IMAGE ${getImageId({ imageUrl })} NOT DELETED`);
  }
}

export async function deleteImagesByUrl({
  imageUrls,
  location,
  resource,
}: {
  imageUrls: Array<string>;
  location: LOCATION;
  resource: RESOURCE;
}) {
  try {
    const resourcesPaths = imageUrls.map(
      (imageUrl) => `${location}/${resource}/${getImageId({ imageUrl })}`,
    );

    await cloudinary.v2.api.delete_resources(resourcesPaths);
    logger.debug(`IMAGES DELETED WITH SUCCESS`);
  } catch (error) {
    logger.debug(`IMAGES NOT DELETED`);
  }
}
