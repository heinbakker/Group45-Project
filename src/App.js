import React, { useState, useRef } from 'react';
import Select from 'react-select/async';
import axios from 'axios';

import './App.css';

const loadOptions = inputValue =>
  new Promise(async resolve => {
    const res = await axios.get('http://localhost:5000/states', {
      params: { keyword: inputValue }
    });
    resolve(
      res.data.matches.map(entry => ({
        label: entry,
        value: entry
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
  const [queryState, setState] = useState({
    state: '',
    aff: false,
    students: false,
    lat: false,
    long: false,
    abstract: false,
    home: false
  });

  const { state, aff, students, lat, long, abstract, home } = queryState;

  const [aboutState, setAboutState] = useState('');

  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleChange(field, value) {
    const newState = { ...queryState, [field]: value };
    setState(newState);

    if (!newState.state) return;

    setLoading(true);
    const res = await axios.get('http://localhost:5000/query', {
      params: newState
    });
    setResult(
      res.data.universities.results.bindings.map(x => {
        const item = {};
        Object.keys(x).forEach(k => (item[k] = x[k].value));
        item.university = decodeURIComponent(
          (item.university || 'x#xx').split('#')[1]
        )
          .split('_')
          .join(' ');
        console.log(item);
        return item;
      })
    );
    setAboutState(res.data.aboutState.results.bindings[0].abstract.value);
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="select-container">
        <Select
          onChange={op => op && handleChange('state', op.value)}
          placeholder="State"
          className="select"
          cacheOptions
          isClearable
          defaultOptions
          loadOptions={loadOptions}
          formatOptionLabel={formatOptionLabel}
        />
      </div>
      <div className="checkboxes first">
        <div className="checkbox">
          <input
            type="checkbox"
            checked={aff}
            onChange={e => handleChange('aff', e.target.checked)}
          />
          <label>Religious Affiliation</label>
          <br />
        </div>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={students}
            onChange={e => handleChange('students', e.target.checked)}
          />
          <label>Student Enrollment</label>
          <br />
        </div>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={lat}
            onChange={e => handleChange('lat', e.target.checked)}
          />
          <label>Latitude</label>
          <br />
        </div>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={long}
            onChange={e => handleChange('long', e.target.checked)}
          />
          <label>Longitude</label>
          <br />
        </div>
      </div>

      <h3>Information from DBPedia</h3>
      <div className="checkboxes">
        <div className="checkbox">
          <input
            type="checkbox"
            checked={abstract}
            onChange={e => handleChange('abstract', e.target.checked)}
          />
          <label>About State</label>
          <br />
        </div>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={home}
            onChange={e => handleChange('home', e.target.checked)}
          />
          <label>University Homepage</label>
          <br />
        </div>
      </div>
      {result.length > 0 && !loading ? (
        <>
          <table>
            <thead>
              <tr>
                <th scope="row">University</th>
                {aff && <th>Religious Affiliation</th>}
                {students && <th>Student Enrollment</th>}
                {lat && <th>Latitude</th>}
                {long && <th>Longitude</th>}
                {home && <th>Homepage</th>}
              </tr>
            </thead>
            <tbody>
              {result.map(x => (
                <tr key={x.university}>
                  <td>{x.university}</td>
                  {aff && <td>{x.aff}</td>}
                  {students && <td>{x.students}</td>}
                  {lat && <td>{x.lat}</td>}
                  {long && <td>{x.long}</td>}
                  {home && (
                    <td>
                      <a href={x.home}>{x.home}</a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {abstract && (
            <div className="about">
              <h2>About State</h2>
              <p>{aboutState}</p>
            </div>
          )}
        </>
      ) : loading ? (
        <h3>Loading...</h3>
      ) : null}
    </div>
  );
}

export default App;
