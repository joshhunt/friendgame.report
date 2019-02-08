import React from 'react';

import Game from 'src/components/Game';

import s from './styles.styl';

export default function GameList({ pgcrs, ownProfile }) {
  return (
    <div className={s.root}>
      <div className={s.top}>
        <h3 className={s.title}>Games together</h3>
      </div>

      <div className={s.list}>
        {pgcrs.map((pgcr, index) => {
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
