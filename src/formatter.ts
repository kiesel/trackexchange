export class Unit {
  public static Millisecond = 1;
  public static Second = 1000;
  public static Minute = 60 * Unit.Second;
  public static Hour = 60 * Unit.Minute;
  public static Day = 24 * Unit.Hour;

  public static Meter = 1;
  public static Kilometer = 1000;
}

export class Formatter {
  public static formatDistance(dist: number) {
    if (dist >= Unit.Kilometer) {
      return (dist / Unit.Kilometer).toFixed(2) + ' km';
    }
    return dist.toFixed(0) + ' m';
  }

  public static formatDuration(duration: number) {
    let out = '';
    if (duration > Unit.Hour) {
      out += `${Math.floor(duration / Unit.Hour).toFixed(0)}h `;
      duration = duration % Unit.Hour;
    }

    if (duration >= Unit.Minute) {
      out += `${Math.floor(duration / Unit.Minute).toFixed(0)}m `;
      duration %= Unit.Minute;
    }

    out += `${(duration / Unit.Second).toFixed(0)}s`;
    return out;
  }

  public static formatSpeed(s: number) {
    return `${s.toFixed(2)} km/h`;
  }
}
