import { XmlDocument, XmlElement } from 'xmldoc';

export class Gpx {
  public tracks: Track[] = [];

  public addTrack(track: Track) {
    this.tracks.push(track);
  }
}

export class Track {
  private segments: TrackSegment[] = [];
  constructor(private name: string, private time: Date) {}

  public addSegment(segment: TrackSegment) {
    this.segments.push(segment);
  }
}

export class TrackSegment {
  private points: TrackPoint[] = [];

  public addPoint(point: TrackPoint) {
    this.points.push(point);
  }
}

export class TrackPoint {
  constructor(private lat: string, private lon: string, private ele: number, private time: Date) {}
}

export class GpxReader {
  public static fromDocument(doc: XmlDocument): Gpx {
    const gpx = doc.firstChild;
    if (!gpx) {
      throw new Error('Missing root element');
    }

    const ret = new Gpx();
    doc.children
      .filter(child => child.type === 'element' && child.name === 'trk')
      .forEach((track: XmlElement) => {
        ret.addTrack(GpxReader.readTrack(track));
      });
    return ret;
  }

  public static readTrack(element: XmlElement) {
    const name = element.children
      .filter(child => child.type === 'element' && child.name === 'name')
      .map((element: XmlElement) => element.val)
      .pop();
    const time = element.children
      .filter(child => child.type === 'element' && child.name === 'time')
      .map((element: XmlElement) => new Date(element.val))
      .pop();

    if (!name || !time) {
      throw new Error('Unnamed / untimed track');
    }

    const ret = new Track(name, time);
    element.children
      .filter(child => child.type === 'element' && child.name === 'trkseg')
      .forEach((segment: XmlElement) => ret.addSegment(GpxReader.readSegment(segment)));
    return ret;
  }

  public static readSegment(element: XmlElement) {
    const ret = new TrackSegment();
    element.children
      .filter(child => child.type === 'element' && child.name === 'trkpt')
      .forEach((element: XmlElement) => ret.addPoint(GpxReader.readPoint(element)));
    return ret;
  }

  public static readPoint(element: XmlElement) {
    const lat = element.attr.lat;
    const lon = element.attr.lon;
    const ele = GpxReader.readValue(element, 'ele');
    const time = GpxReader.readValue(element, 'time');

    return new TrackPoint(lat, lon, Number(ele), new Date(time));
  }

  private static readValue(element: XmlElement, name: string): string {
    const elements = element.children
      .filter(child => child.type === 'element' && child.name === name)
      .map((element: XmlElement) => element.val);
    if (elements.length != 1) {
      throw new Error(`Did not find single element named "${name}`);
    }
    return elements[0];
  }
}
