import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useFirestore, useFirestoreCollectionData, useFirestoreDocData } from 'reactfire'
import { CacheTimeSeriesEntry } from '../lib/firebaseCommon';
import { Timestamp } from '../lib/firebaseFront'

export default function Example() {
  const filter_options = [
    '*',
    'v2_cache',
    'v3_cache',
    'legacy_cache',
    'msft_cache',
  ];
  const [filter, setFilter] = useState<string>('*')

  const query = useFirestore().collection('cache_series').orderBy('time', 'asc')

  // subscribe to a document for realtime updates. just one line!
  const { status, data } = useFirestoreCollectionData<CacheTimeSeriesEntry>(query)
  const transformed = status !== 'success' ? [] : data
    .filter(e => filter === '*' ? true : e.cacheCollectionName === filter)
    .map(({ hit, miss, time, cacheCollectionName }) => ({
      hit,
      miss,
      cacheCollectionName,
      time: time instanceof Date ?
        time.valueOf()
        :
        new Timestamp(time.seconds, time.nanoseconds).toDate()
    })); 
  //console.log(transformed)

  const handleClickSeries = async () => {
    await fetch('/api/clearTimeSeries')
  }
  const handleClickCache = async () => {
    await fetch(`/api/clearCache?collection=${filter}`)
  }

  const totalHits = transformed.map(e => e.hit).reduce((prev, curr) => prev + curr, 0);
  
  const totalMiss = transformed.map(e => e.miss).reduce((prev, curr) => prev + curr, 0);
  
  const totalRequest = totalHits + totalMiss
  const hitMissRatio = totalHits / totalMiss
  const missHitRatio = totalMiss / totalHits

  return (
  <>
    <h1>Cache Hit/Miss time series</h1>

    <label>
      Filter:
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        {
          filter_options.map(e => <option key={e} value={e}>{e}</option>)
        }
      </select>
    </label>
    <button onClick={handleClickSeries}>Clear series</button>
    <button onClick={handleClickCache}>Clear cache for current filter</button>
    <ul>
      <li>total hits: {totalHits}</li>
      <li>total misses: {totalMiss}</li>
      <li>total translations: {totalRequest}</li>
      <li>hit/miss ratio: {hitMissRatio}</li>
      <li>miss/hit ratio: {missHitRatio}</li>
    </ul>
    <AreaChart
      width={900}
      height={600}
      data={transformed}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" label="Time" height={60} />
      <YAxis label="Requests" width={110} />
      <Tooltip />
      <Area type="monotone" dataKey="hit" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
      <Area type="monotone" dataKey="miss" stackId="1" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  </>
  );
}
