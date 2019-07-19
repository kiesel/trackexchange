import * as fs from 'fs';
import { XmlDocument } from 'xmldoc';
import * as yargs from 'yargs';
import { promisify } from 'util';
import { GpxReader } from './gpx';

const readFile = promisify(fs.readFile);

async function analyze(file: string) {
  const data = await readFile(file);

  const doc = new XmlDocument(data.toString());
  const gpx = GpxReader.fromDocument(doc);
  console.log(gpx, gpx.tracks);
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
