import Dexie from 'dexie';

const db = new Dexie('friendgame');
db.version(1).stores({
  pgcr: '&key, data',
});

export function getPGCR(key) {
  return db.pgcr.get(key);
}

export function savePGCR(key, data) {
  return db.pgcr.put({ key, data });
}
