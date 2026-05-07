// songs.ts — sample seed data. Replace with your real source / API.

import autumnLeavesXml from './autumn-leaves.xml?raw';
// Vite: ?raw imports the file as a string. For CRA/Webpack use a fetch.

export interface Song {
  id: string;
  title: string;
  composer: string;
  key: string;          // display string e.g. "E min"
  timeSig: string;      // "4/4"
  tags: string[];
  aiGenerated?: boolean;
  xml: string;          // MusicXML
}

export const SONGS: Song[] = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    composer: 'J. Kosma',
    key: 'E min',
    timeSig: '4/4',
    tags: ['ballad'],
    aiGenerated: true,
    xml: autumnLeavesXml,
  },
];
