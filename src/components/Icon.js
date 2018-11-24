import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(
  require('@fortawesome/fontawesome-free-brands/faPlaystation'),
  require('@fortawesome/fontawesome-free-brands/faXbox'),
  require('@fortawesome/fontawesome-free-brands/faWindows'),

  require('@fortawesome/pro-light-svg-icons/faBook').faBook,
  require('@fortawesome/pro-light-svg-icons/faThLarge').faThLarge,
  require('@fortawesome/pro-light-svg-icons/faShoppingBasket').faShoppingBasket,
  require('@fortawesome/pro-regular-svg-icons/faPlus').faPlus,
  require('@fortawesome/pro-regular-svg-icons/faEye').faEye,
  require('@fortawesome/pro-regular-svg-icons/faEyeSlash').faEyeSlash,
  require('@fortawesome/pro-regular-svg-icons/faSync').faSync,
  require('@fortawesome/pro-regular-svg-icons/faCheck').faCheck,
  require('@fortawesome/pro-regular-svg-icons/faTimes').faTimes,
  require('@fortawesome/pro-regular-svg-icons/faExternalLinkSquareAlt')
    .faExternalLinkSquareAlt
);

export default function Icon({ icon, name, brand, light, solid, ...props }) {
  let prefix = 'far';

  if (brand) {
    prefix = 'fab';
  } else if (light) {
    prefix = 'fal';
  } else if (solid) {
    prefix = 'fas';
  }

  return <FontAwesomeIcon icon={[prefix, icon || name]} {...props} />;
}

const PLATFORM_ICON = {
  1: 'xbox',
  2: 'playstation',
  4: 'windows'
};

export function PlatformIcon({ membershipType, ...props }) {
  return <Icon name={PLATFORM_ICON[membershipType]} brand {...props} />;
}
