import { XmlDocument, XmlElement } from 'xmldoc';

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat1 - lat2);
  const dLon = deg2rad(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000; // Distance in m
}

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

  public get first(): TrackPoint {
    if (!this.points.length) {
      throw new Error('Segment contains no waypoints');
    }
    return this.points[0];
  }

  public get last(): TrackPoint {
    if (!this.points.length) {
      throw new Error('Segment contains no waypoints');
    }
    return this.points[this.points.length - 1];
  }

  public duration(): number {
    return this.last.time.getTime() - this.first.time.getTime();
  }

  public airlineDistance(): number {
    return this.last.distanceFrom(this.first);
  }

  public travelDistance(): number {
    let dist = 0;

    let previous = this.first;
    this.points.slice(1).forEach(next => {
      dist += next.distanceFrom(previous);
      previous = next;
    });

    return dist;
  }

  public toString() {
    return `    Segment\n${this.points.map(pt => pt.toString()).join('\n')}\n`;
  }
}

export class TrackPoint {
  constructor(public lat: number, public lon: number, public ele: number, public time: Date) {}

  public distanceFrom(pt: TrackPoint): number {
    return haversineDistance(this.lat, this.lon, pt.lat, pt.lon);
  }

  public toString() {
    return `      Point ${this.lat} ${this.lon} ${this.ele}`;
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
    const lat = element.attr.lat.trim();
    const lon = element.attr.lon.trim();
    const ele = GpxReader.readValue(element, 'ele');
    const time = GpxReader.readValue(element, 'time');

    return new TrackPoint(Number(lat), Number(lon), Number(ele), new Date(time));
  }

  private static readValue(element: XmlElement, name: string): string {
    const elements = element.children
      .filter(child => child.type === 'element' && child.name === name)
      .map((element: XmlElement) => element.val);
    if (elements.length != 1) {
      throw new Error(`Did not find single element named "${name}`);
    }
    return elements[0].trim();
  }
}
