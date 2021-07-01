export type Timestamp =  Date | { seconds: number, nanoseconds: number };

export interface CacheTimeSeriesEntry {
  hit: number;
  miss: number;
  hitCharacters: number;
  missCharacters: number;
  time: Timestamp;
  cacheCollectionName: string;
}
