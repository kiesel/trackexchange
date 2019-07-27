import { describe } from 'mocha';
import { expect } from 'chai';
import { Formatter } from '../src/formatter';

describe('Formatter', () => {
  describe('with distance', () => {
    it('formats in meters', () => {
      expect(Formatter.formatDistance(1)).to.be.equal('1 m');
    });
    it('formats 0 meters', () => {
      expect(Formatter.formatDistance(0)).to.be.equal('0 m');
    });
    it('formats 1000 meters as km', () => {
      expect(Formatter.formatDistance(1000)).to.be.equal('1.00 km');
    });
  });

  describe('with speed', () => {
    it('formats speed in decimal', () => {
      expect(Formatter.formatSpeed(5)).to.be.equal('5.00 km/h');
    });
    it('formats zero speed', () => {
      expect(Formatter.formatSpeed(0)).to.be.equal('0.00 km/h');
    });
  });

  describe('with duration', () => {
    it('formats zero duration', () => {
      expect(Formatter.formatDuration(0)).to.be.equal('0s');
    });
    it('formats below minute duration', () => {
      expect(Formatter.formatDuration(59000)).to.be.equal('59s');
    });
    it('formats over minute duration', () => {
      expect(Formatter.formatDuration(65000)).to.be.equal('1m 5s');
    });
    it('formats over ten minute duration', () => {
      expect(Formatter.formatDuration(605000)).to.be.equal('10m 5s');
    });
    it('formats over ten minute duration', () => {
      expect(Formatter.formatDuration(3605000)).to.be.equal('1h 5s');
    });
    it('formats over ten minute duration', () => {
      expect(Formatter.formatDuration(3665000)).to.be.equal('1h 1m 5s');
    });
  });
});
