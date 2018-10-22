import React from 'react';

import tableStyles from 'app/components/Table/styles.styl';
import GameRow from './GameRow';

export default function GamesTable({ games }) {
  return (
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <td>game</td>
          <td>date</td>
          <td>links</td>
          <td>pgcr</td>
        </tr>
      </thead>

      <tbody>{games.map(game => <GameRow game={game} />)}</tbody>
    </table>
  );
}
