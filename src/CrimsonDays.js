import React from 'react';

import Player from './Player';
import './CrimsonDays.css';

export default function CrimsonDays({ data: { fireteamPlayers } }) {
  const topPlayer = fireteamPlayers[0];

  if (!topPlayer) {
    return null;
  }

  return (
    <div className="crimsonDays">
      <div className="crimsonHeader">Crimson Days</div>
      <h3>its a match!</h3>
      <div className="crimsonPlayer">
        <Player player={topPlayer} />
      </div>
      <p>lipsim text to fill this one out</p>
      <img className="crimsonBgImage" src="https://i.imgur.com/w3EE6C4.png" />
    </div>
  );
}
