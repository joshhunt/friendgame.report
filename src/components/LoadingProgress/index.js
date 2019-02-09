import React from 'react';
import cx from 'classnames';

import s from './styles.styl';

const percent = (v, t) => {
  const p = v / t;
  return isNaN(p) ? 0 : Math.floor(p * 100);
};

export default function LoadingProgress({ progress, total }) {
  return (
    <div className={cx(s.root, { [s.complete]: progress === total })}>
      <div
        className={s.progressBg}
        style={{ width: `${percent(progress, total)}%` }}
      />
    </div>
  );
}
