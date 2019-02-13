import React from 'react';
import cx from 'classnames';

import s from './styles.styl';

export default function Toggle({
  className,
  label,
  name,
  value,
  choices,
  onChange
}) {
  return (
    <div className={cx(className, s.root)}>
      {label}

      {choices.map(choice => (
        <div key={choice.id} className={s.radio}>
          <label>
            <input
              value={choice.id}
              type="radio"
              name={name}
              checked={value === choice.id}
              onChange={onChange}
            />
            <div className={s.radioBg} />
            <div className={s.radioLabel}>{choice.label}</div>
          </label>
        </div>
      ))}
    </div>
  );
}
