// songs.ts — sample seed data. Replace with your real source / API.

import autumnLeavesXml from './autumn-leaves.xml?raw';
import allTheThingsXml from './all-the-things-you-are.xml?raw';
import summertimeXml from './summertime.xml?raw';
import mistyXml from './misty.xml?raw';
import roundMidnightXml from './round-midnight.xml?raw';
import takeTheATrainXml from './take-the-a-train.xml?raw';
import flyMeToTheMoonXml from './fly-me-to-the-moon.xml?raw';
import blueBossaXml from './blue-bossa.xml?raw';
import satinDollXml from './satin-doll.xml?raw';
import thereWillNeverXml from './there-will-never.xml?raw';
import waveXml from './wave.xml?raw';
import girlFromIpanemaXml from './girl-from-ipanema.xml?raw';
import footprintsXml from './footprints.xml?raw';
import maidenVoyageXml from './maiden-voyage.xml?raw';
import soWhatXml from './so-what.xml?raw';
// Vite: ?raw imports the file as a string. For CRA/Webpack use a fetch.

export interface Song {
  id: string;
  title: string;
  composer: string;
  key: string;          // display string e.g. "E min"
  timeSig: string;      // "4/4"
  tags: string[];
  aiGenerated?: boolean;
  createdAt: string;    // ISO date string e.g. "2025-01-01"
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
    createdAt: '2025-01-01',
    xml: autumnLeavesXml,
  },
  {
    id: 'all-the-things',
    title: 'All The Things You Are',
    composer: 'J. Kern',
    key: 'Ab maj',
    timeSig: '4/4',
    tags: ['ballad'],
    createdAt: '2025-01-10',
    xml: allTheThingsXml,
  },
  {
    id: 'summertime',
    title: 'Summertime',
    composer: 'G. Gershwin',
    key: 'A min',
    timeSig: '4/4',
    tags: ['ballad'],
    createdAt: '2025-01-20',
    xml: summertimeXml,
  },
  {
    id: 'misty',
    title: 'Misty',
    composer: 'E. Garner',
    key: 'Eb maj',
    timeSig: '4/4',
    tags: ['ballad'],
    createdAt: '2025-02-01',
    xml: mistyXml,
  },
  {
    id: 'round-midnight',
    title: 'Round Midnight',
    composer: 'T. Monk',
    key: 'Bb min',
    timeSig: '4/4',
    tags: ['bebop'],
    createdAt: '2025-02-15',
    xml: roundMidnightXml,
  },
  {
    id: 'take-the-a-train',
    title: 'Take The A Train',
    composer: 'B. Strayhorn',
    key: 'C maj',
    timeSig: '4/4',
    tags: ['swing'],
    createdAt: '2025-03-01',
    xml: takeTheATrainXml,
  },
  {
    id: 'fly-me-to-the-moon',
    title: 'Fly Me to the Moon',
    composer: 'B. Howard',
    key: 'C maj',
    timeSig: '4/4',
    tags: ['ballad'],
    createdAt: '2025-03-10',
    xml: flyMeToTheMoonXml,
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'K. Dorham',
    key: 'C min',
    timeSig: '4/4',
    tags: ['bossa'],
    createdAt: '2025-03-20',
    xml: blueBossaXml,
  },
  {
    id: 'satin-doll',
    title: 'Satin Doll',
    composer: 'D. Ellington',
    key: 'C maj',
    timeSig: '4/4',
    tags: ['swing'],
    createdAt: '2025-03-28',
    xml: satinDollXml,
  },
  {
    id: 'there-will-never',
    title: 'There Will Never Be Another You',
    composer: 'H. Warren',
    key: 'Eb maj',
    timeSig: '4/4',
    tags: ['swing'],
    createdAt: '2025-04-05',
    xml: thereWillNeverXml,
  },
  {
    id: 'wave',
    title: 'Wave',
    composer: 'A.C. Jobim',
    key: 'D maj',
    timeSig: '4/4',
    tags: ['bossa'],
    createdAt: '2026-04-10',
    xml: waveXml,
  },
  {
    id: 'girl-from-ipanema',
    title: 'The Girl from Ipanema',
    composer: 'A.C. Jobim',
    key: 'F maj',
    timeSig: '4/4',
    tags: ['bossa'],
    createdAt: '2025-04-15',
    xml: girlFromIpanemaXml,
  },
  {
    id: 'footprints',
    title: 'Footprints',
    composer: 'W. Shorter',
    key: 'C min',
    timeSig: '6/4',
    tags: ['modal'],
    createdAt: '2025-04-20',
    xml: footprintsXml,
  },
  {
    id: 'maiden-voyage',
    title: 'Maiden Voyage',
    composer: 'H. Hancock',
    key: 'D maj',
    timeSig: '4/4',
    tags: ['modal'],
    createdAt: '2025-04-25',
    xml: maidenVoyageXml,
  },
  {
    id: 'so-what',
    title: 'So What',
    composer: 'M. Davis',
    key: 'D min',
    timeSig: '4/4',
    tags: ['modal'],
    createdAt: '2025-04-28',
    xml: soWhatXml,
  },
];
