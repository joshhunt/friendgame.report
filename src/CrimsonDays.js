import React from 'react';

import './CrimsonDays.css';

export default function CrimsonDays({ data: { fireteamPlayers } }) {
  const topPlayer = fireteamPlayers[0];

  if (!topPlayer) {
    return null;
  }

  const { displayName, iconPath } = topPlayer.destinyUserInfo;

  return (
    <div className="crimsonDays">
      <h3 className="crimsonHeading">It&apos;s a match!</h3>

      <div className="crimsonPlayer">
        <img
          className="crimsonIcon"
          src={`https://bungie.net${iconPath}`}
          alt=""
        />
        <div className="crimsonName">{displayName}</div>
      </div>

      <p className="crimsonP">
        Looks like you only have eyes for one player during{' '}
        <span>Crimson Days</span>, and it's <span>{displayName}</span>.
        You&apos;ve played{' '}
        <span>{topPlayer.$count} matches of Crimson Doubles</span> with them
        this year!
      </p>
    </div>
  );
}
