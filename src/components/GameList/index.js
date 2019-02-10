import React from 'react';
import cx from 'classnames';

import Game from 'src/components/Game';

import s from './styles.styl';

export default function GameList({ className, title, sessions, ownProfile }) {
  return (
    <div className={cx(s.root, className)}>
      <div className={s.top}>
        <h3 className={s.title}>{title || 'Games together'}</h3>
      </div>

      <div className={s.list}>
        {sessions.map((pgcr, index) => {
          return (
            <Game
              className={s.game}
              pgcr={pgcr}
              key={index}
              ownProfile={ownProfile}
            />
          );
        })}
      </div>
    </div>
  );
}
