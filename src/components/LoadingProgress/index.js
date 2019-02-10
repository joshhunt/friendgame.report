import React from 'react';
import cx from 'classnames';

import s from './styles.styl';

const percent = p => {
  return isNaN(p) ? 0 : Math.floor(p * 100);
};

export default function LoadingProgress({ progress }) {
  return (
    <div className={cx(s.root, { [s.complete]: progress === 1 })}>
      <div
        className={s.progressBg}
        style={{ width: `${percent(progress)}%` }}
      />
    </div>
  );
}
