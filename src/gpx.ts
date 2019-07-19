import { XmlDocument, XmlElement } from 'xmldoc';

export class Gpx {
  public tracks: Track[] = [];

  public toString() {
    return `GPX Tracks: \n${this.tracks.map(track => track.toString())}`;
  }
}

export class Track {
  public segments: TrackSegment[] = [];
  constructor(public name: string, public time: Date) {}

  public toString() {
    return `  Track ${this.name} @ ${this.time}:\n${this.segments.map(segment =>
      segment.toString(),
    )}\n`;
  }
}

export class TrackSegment {
  public points: TrackPoint[] = [];

  public toString() {
    return `    Segment\n${this.points.map(pt => pt.toString())}\n`;
  }
}

export class TrackPoint {
  constructor(public lat: string, public lon: string, public ele: number, public time: Date) {}

  public toString() {
    return `      Point ${this.lat} ${this.lon} ${this.ele}\n`;
  }
}

export class GpxReader {
  public static fromDocument(doc: XmlDocument): Gpx {
    const gpx = doc.firstChild;
    if (!gpx) {
      throw new Error('Missing root element');
    }

    const ret = new Gpx();
    ret.tracks = doc.children
      .filter(child => child.type === 'element' && child.name === 'trk')
      .map((track: XmlElement) => GpxReader.readTrack(track));
    return ret;
  }

  public static readTrack(element: XmlElement) {
    const name = GpxReader.readValue(element, 'name');
    const time = GpxReader.readValue(element, 'time');

    const ret = new Track(name, new Date(time));
    ret.segments = element.children
      .filter(child => child.type === 'element' && child.name === 'trkseg')
      .map((segment: XmlElement) => GpxReader.readSegment(segment));
    return ret;
  }

  public static readSegment(element: XmlElement) {
    const ret = new TrackSegment();
    ret.points = element.children
      .filter(child => child.type === 'element' && child.name === 'trkpt')
      .map((element: XmlElement) => GpxReader.readPoint(element));
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
