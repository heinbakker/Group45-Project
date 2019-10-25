import React, { useState, useRef } from 'react';
import Select from 'react-select/async';
import axios from 'axios';

import Query from './Query';
import './App.css';

const loadOptions = inputValue =>
  new Promise(async resolve => {
    const res = await axios.get('http://localhost:5000/stations', {
      params: { keyword: inputValue }
    });
    console.log(res.data);
    resolve(
      res.data.matches.map(entry => ({
        label: entry.stopname,
        value: entry.id
      }))
    );
  });

const formatOptionLabel = ({ label }, { inputValue }) => {
  const start = label.toLowerCase().indexOf(inputValue.toLowerCase());
  const end = start + inputValue.length;
  return (
    <span>
      {label.slice(0, start)}
      <span className="bold">{label.slice(start, end)}</span>
      {label.slice(end)}
    </span>
  );
};

function App() {
  const [source, setSource] = useState(null);
  const [des, setDes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(null);
  const weather = useRef({}).current;
  const [_, setX] = useState('x');
  const handleSelect = async (op, type) => {
    if (!op) return;
    if (type === 'source') {
      setSource(op.value);
    } else {
      setDes(op.value);
    }
    if ((type === 'source' && des) || (type === 'des' && source)) {
      setLoading(false);
      const res = await axios.get('http://localhost:5000/direction', {
        params: {
          source: type === 'source' ? op.value : source,
          des: type === 'des' ? op.value : des
        }
      });
      setList(res.data.path);
      console.log(res.data.path);
      setLoading(false);
      res.data.path.forEach(p => {
        getWeather(p);
      });
    }
  };
  async function getWeather(p) {
    const res = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          appid: '88a177f0df5ddb7a66ca55cf245ad992',
          lat: p.lat,
          lon: p.lon,
          units: 'metric'
        }
      }
    );
    weather[p.station_id] =  res.data;
    setX(Math.random());
  }
  
  /*if (list) {
    for (const p of list) {
      if (!weather[p.station_id]) {
        getWeather(p);
        break;
      }
    }
  }*/
  return (
    <div className="container">
      <div className="select-container">
        <Select
          onChange={op => handleSelect(op, 'source')}
          placeholder="Source"
          className="select"
          cacheOptions
          isClearable
          defaultOptions
          loadOptions={loadOptions}
          formatOptionLabel={formatOptionLabel}
        />
        <Select
          onChange={op => handleSelect(op, 'des')}
          placeholder="Destination"
          className="select"
          isClearable
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          formatOptionLabel={formatOptionLabel}
        />
      </div>
      {list &&
        (list.length ? (
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Weather</th>
                <th>Train</th>
                <th>Hops</th>
              </tr>
            </thead>
            <tbody>
              {list.map(x => {
                const w = weather[x.station_id];
                return (
                  <tr key={x.station + x.train}>
                    <td>{x.station}</td>
                    <td>
                      {w
                        ? `${w.main.temp}°C, ${w.weather[0].description}`
                        : '--'}
                    </td>
                    <td>{x.train}</td>
                    <td>{x.hops}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          !loading && <span> No path from selected source to destination </span>
        ))}
        <Query />
    </div>
  );
}

export default App;
