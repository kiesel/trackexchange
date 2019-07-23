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

  public duration(): number {
    return this.tracks.map(t => t.duration()).reduce((prev, next) => prev + next, 0);
  }

  public travelDistance(): number {
    return this.tracks.map(t => t.travelDistance()).reduce((prev, next) => prev + next, 0);
  }

  public toString() {
    return `GPX Tracks: \n${this.tracks.map(track => track.toString())}`;
  }
}

export class Track {
  public segments: TrackSegment[] = [];
  constructor(public name: string, public time: Date) {}

  public duration(): number {
    return this.segments.map(s => s.duration()).reduce((prev, next) => prev + next, 0);
  }

  public travelDistance(): number {
    return this.segments.map(s => s.travelDistance()).reduce((prev, next) => prev + next, 0);
  }

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
