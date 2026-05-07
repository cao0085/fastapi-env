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
  {
    id: 'all-the-things',
    title: 'All The Things You Are',
    composer: 'J. Kern',
    key: 'Ab maj',
    timeSig: '4/4',
    tags: ['ballad'],
    xml: allTheThingsXml,
  },
  {
    id: 'summertime',
    title: 'Summertime',
    composer: 'G. Gershwin',
    key: 'A min',
    timeSig: '4/4',
    tags: ['ballad'],
    xml: summertimeXml,
  },
  {
    id: 'misty',
    title: 'Misty',
    composer: 'E. Garner',
    key: 'Eb maj',
    timeSig: '4/4',
    tags: ['ballad'],
    xml: mistyXml,
  },
  {
    id: 'round-midnight',
    title: 'Round Midnight',
    composer: 'T. Monk',
    key: 'Bb min',
    timeSig: '4/4',
    tags: ['bebop'],
    xml: roundMidnightXml,
  },
  {
    id: 'take-the-a-train',
    title: 'Take The A Train',
    composer: 'B. Strayhorn',
    key: 'C maj',
    timeSig: '4/4',
    tags: ['swing'],
    xml: takeTheATrainXml,
  },
  {
    id: 'fly-me-to-the-moon',
    title: 'Fly Me to the Moon',
    composer: 'B. Howard',
    key: 'C maj',
    timeSig: '4/4',
    tags: ['ballad'],
    xml: flyMeToTheMoonXml,
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'K. Dorham',
    key: 'C min',
    timeSig: '4/4',
    tags: ['bossa'],
    xml: blueBossaXml,
  },
  {
    id: 'satin-doll',
    title: 'Satin Doll',
    composer: 'D. Ellington',
    key: 'C maj',
    timeSig: '4/4',
    tags: ['swing'],
    xml: satinDollXml,
  },
  {
    id: 'there-will-never',
    title: 'There Will Never Be Another You',
    composer: 'H. Warren',
    key: 'Eb maj',
    timeSig: '4/4',
    tags: ['swing'],
    xml: thereWillNeverXml,
  },
  {
    id: 'wave',
    title: 'Wave',
    composer: 'A.C. Jobim',
    key: 'D maj',
    timeSig: '4/4',
    tags: ['bossa'],
    xml: waveXml,
  },
  {
    id: 'girl-from-ipanema',
    title: 'The Girl from Ipanema',
    composer: 'A.C. Jobim',
    key: 'F maj',
    timeSig: '4/4',
    tags: ['bossa'],
    xml: girlFromIpanemaXml,
  },
  {
    id: 'footprints',
    title: 'Footprints',
    composer: 'W. Shorter',
    key: 'C min',
    timeSig: '6/4',
    tags: ['modal'],
    xml: footprintsXml,
  },
  {
    id: 'maiden-voyage',
    title: 'Maiden Voyage',
    composer: 'H. Hancock',
    key: 'D maj',
    timeSig: '4/4',
    tags: ['modal'],
    xml: maidenVoyageXml,
  },
  {
    id: 'so-what',
    title: 'So What',
    composer: 'M. Davis',
    key: 'D min',
    timeSig: '4/4',
    tags: ['modal'],
    xml: soWhatXml,
  },
];
