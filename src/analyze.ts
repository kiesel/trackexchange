import * as fs from 'fs';
import { XmlDocument } from 'xmldoc';
import * as yargs from 'yargs';
import { promisify } from 'util';
import { TrackSegment, TrackPoint } from './gpx';
import Table from 'cli-table';
import { GpxReader } from './gpx-reader';
import { Formatter } from './formatter';

const readFile = promisify(fs.readFile);

async function analyze(file: string) {
  const data = await readFile(file);

  const doc = new XmlDocument(data.toString());
  const gpx = GpxReader.fromDocument(doc);

  const t = new Table({
    head: [
      'Segment#',
      '#',
      'Time',
      'Latitude',
      'Longitude',
      'Elevation',
      'DeltaT',
      'Distance',
      'Speed',
    ],
    // colWidths: [10, 5, 10, 10, 10, 8],
    style: { compact: true },
  });

  let segNo = 0;
  gpx.tracks.forEach(tracks => {
    tracks.segments.forEach(segments => {
      segNo++;

      let lastPt: TrackPoint | undefined;
      segments.points.forEach((pt, index) => {
        let deltaT: number = 0;
        let dist: number = 0;
        let speed: number = 0;

        if (lastPt) {
          deltaT = (pt.time.getTime() - lastPt.time.getTime()) / 1000;
          dist = pt.distanceFrom(lastPt);
          speed = ((pt.distanceFrom(lastPt) / deltaT) * 60 * 60) / 1000;
        }

        t.push([
          segNo,
          index + 1,
          pt.time.toISOString(),
          pt.lat,
          pt.lon,
          pt.ele,
          Formatter.formatDuration(deltaT),
          Formatter.formatDistance(dist),
          Formatter.formatSpeed(speed),
        ]);
        lastPt = pt;
      });
    });
  });
  t.push([
    '',
    '',
    '',
    '',
    '',
    '',
    Formatter.formatDuration(gpx.duration()),
    Formatter.formatDistance(gpx.travelDistance()),
    Formatter.formatSpeed(gpx.travelDistance() / 1000 / (gpx.duration() * 60 * 60)),
  ]);

  console.log(t.toString());
  gpx.tracks.forEach(t => {
    console.log(
      `Travel total duration: ${Math.floor(t.duration() / 60000)}m ${(t.duration() % 60000) /
        1000}s`,
    );
    console.log(`Travel total distance: ${(t.travelDistance() / 1000).toFixed(2)} km`);
    console.log(
      `Average speed: ${(((t.travelDistance() / (t.duration() / 1000)) * 60 * 60) / 1000).toFixed(
        2,
      )} km/h`,
    );
  });
}

yargs.usage('$0 <command>').command(
  'analyze',
  'Analyze and output stats from a given .gpx file',
  (args: yargs.Argv) =>
    args.option('file', { type: 'string', describe: 'File to read from', optional: false }),
  (args: yargs.Arguments) => {
    if (typeof args.file !== 'string') {
      throw new Error('Missing arg file');
    }
    analyze(args.file)
      .then((resolved: any) => console.log('Done'))
      .catch(err => console.error(err));
  },
).argv;
