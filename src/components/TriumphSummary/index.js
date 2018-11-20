import React from 'react';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

export default function TriumphSummary({ record }) {
  return (
    <div className={s.recordSummary}>
      {record.displayProperties.icon && (
        <div className={s.recordAccessory}>
          <div className={s.iconWrapper}>
            <BungieImage
              className={s.icon}
              src={record.displayProperties.icon}
            />
          </div>
        </div>
      )}

      <div className={s.recordMain}>
        <a
          className={s.link}
          href={`https://data.destinysets.com/i/Record:${record.hash}`}
          target="_blank"
        >
          {record.displayProperties.name}
        </a>
        <br />
        <small className={s.desc}>{record.displayProperties.description}</small>
      </div>
    </div>
  );
}
