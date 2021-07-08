import React from 'react';

import { bungieUrl } from 'src/lib/destinyUtils';

export default function BungieImage({ src, ...props }) {
  const style = {
    backgroundImage: `url(${bungieUrl(src)})`
  };

  return <div style={style} {...props} />;
}
