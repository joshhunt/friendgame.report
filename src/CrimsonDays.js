import React from 'react';

export default function CrimsonDays({ thisPlayer, data: { fireteamPlayers } }) {
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
        Looks like <span>{thisPlayer.displayName}</span> only has eyes for one
        player during <span>Crimson Days</span>, and it&apos;s{' '}
        <span>{displayName}</span>! They&apos;ve played{' '}
        <span>{topPlayer.$count} matches</span> of <span>Crimson Doubles</span>{' '}
        with them this year.
      </p>
    </div>
  );
}
