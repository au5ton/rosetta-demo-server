import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useFirestore, useFirestoreCollectionData, useFirestoreDocData } from 'reactfire'
//import { useWindowSize } from 'react-use'
import { CacheTimeSeriesEntry } from '../lib/firebaseCommon';
import { Timestamp } from '../lib/firebaseFront'

const Green = (props: { children: React.ReactNode }) => <span style={{ color: '#318551', fontWeight: 'bold' }}>{props.children}</span>
const Purple = (props: { children: React.ReactNode }) => <span style={{ color: '#504d7e', fontWeight: 'bold' }}>{props.children}</span>

export default function Example() {
  // const { width: viewportWidth } = useWindowSize(900);
  // const transformedViewportWidth = viewportWidth < 1000 ? 900 : viewportWidth - 100; 
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
    .map(({ hit, miss, hitCharacters, missCharacters, time, cacheCollectionName }) => ({
      hit,
      miss,
      hitCharacters,
      missCharacters,
      cacheCollectionName,
      time: time instanceof Date ?
        time.toLocaleString()
        :
        new Timestamp(time.seconds, time.nanoseconds).toDate().toLocaleString()
    })); 
  console.log(transformed)

  const handleClickSeries = async () => {
    await fetch('/api/clearTimeSeries')
  }
  const handleClickCache = async () => {
    await fetch(`/api/clearCache?collection=${filter}`)
  }

  const totalHit = transformed.map(e => e.hit).reduce((prev, curr) => prev + curr, 0);
  const totalMiss = transformed.map(e => e.miss).reduce((prev, curr) => prev + curr, 0);
  const totalRequest = totalHit + totalMiss;
  const percHit = Math.round((totalHit / totalRequest) * 100 * 10e1) / 100;
  const percMiss = Math.round((totalMiss / totalRequest) * 100 * 10e1) / 100;

  const totalHitCharacters = transformed.map(e => e.hitCharacters).reduce((prev, curr) => prev + curr, 0);
  const totalMissCharacters = transformed.map(e => e.missCharacters).reduce((prev, curr) => prev + curr, 0);
  const totalCharacters = totalHitCharacters + totalMissCharacters;
  const percCharHit = Math.round((totalHitCharacters / totalCharacters) * 100 * 10e1) / 100;
  const percCharMiss = Math.round((totalMissCharacters / totalCharacters) * 100 * 10e1) / 100;

  // broke

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
      <li><strong>By element:</strong></li>
      <ul>
        <li>total nodes hit: {totalHit}</li>
        <li>total nodes missed: {totalMiss}</li>
        <li>total nodes translated: {totalRequest}</li>
        <li>% of nodes hit: {percHit}</li>
        <li>% of nodes missed: {percMiss}</li>
        <li>
          <strong>Meaning</strong>
          <p>{totalRequest.toLocaleString()} <u>elements</u> were translated. 
          Of that, <Green>{totalHit.toLocaleString()} ({percHit}%)</Green> <strong>had</strong> already been translated before (free to translate).
          <Purple> {totalMiss.toLocaleString()} ({percMiss}%)</Purple> <strong>had not</strong> been translated before (paid to translate).</p>
        </li>
      </ul>      
      <hr style={{ maxWidth: 60, marginLeft: 0 }} />
      <li><strong>By character:</strong></li>
      <ul>
        <li>total characters in hits: {totalHitCharacters}</li>
        <li>total characters in misses: {totalMissCharacters}</li>
        <li>total characters translated: {totalCharacters}</li>
        <li>% of characters hit: {percCharHit}</li>
        <li>% of characters missed: {percCharMiss}</li>
        <li>
        <strong>Meaning</strong>
          <p>{totalCharacters.toLocaleString()} <u>characters</u> were translated. 
          Of that, <Green>{totalHitCharacters.toLocaleString()} ({percCharHit}%)</Green> <strong>had</strong> already been translated before (free to translate). 
          <Purple> {totalMissCharacters.toLocaleString()} ({percCharMiss}%)</Purple> <strong>had not</strong> been translated before (paid to translate).</p>
        </li>
      </ul>
    </ul>
    <AreaChart
      width={1100}
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
      <YAxis label="Characters" width={130} />
      <Tooltip />
      <Legend verticalAlign="top" height={36}/>
      <Area type="linear" dataKey="hitCharacters" name="Hit characters" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
      <Area type="linear" dataKey="missCharacters" name="Missed characters" stackId="1" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  </>
  );
}
