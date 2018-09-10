import React from 'react';
import { get } from 'lodash';

export default function Triumphs({ profile }) {
  const score = get(profile, 'profile.profileRecords.data.score');
  const records = Object.entries(
    get(profile, 'profile.profileRecords.data.records', {})
  );

  return (
    <div>
      <h2>Records</h2>

      <p>Triumph score: {score}</p>
      <ul>
        {records.map(([hash, record]) => (
          <li>
            {hash}: {record.state}
          </li>
        ))}
      </ul>
    </div>
  );
}
