import React, { useState } from 'react';
import axios from 'axios';

import './Query.css';

export default () => {
  const [url, setUrl] = useState('http://127.0.0.1:3032/test');
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setData(null);
    setStatus('loading');
    try {
      const res = await axios.get('http://localhost:5000/query', {
        params: { url, query }
      });
      console.log(res.data);
      setData(res.data);
      setStatus('');
    } catch (e) {
      setStatus('invalid');
    }
  }
  return (
    <div id="query">
      <h2>Query</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={url}
          placeholder="URL"
          onChange={e => setUrl(e.target.value)}
        />
        <textarea
          value={query}
          placeholder="Query"
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      {data && (
        <table>
          <thead>
            <tr>
              {data.head.vars.map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.results.bindings.map(r => (
              <tr key={r[Object.keys(r)[0]].value}>
                {data.head.vars.map(h => (
                  <td key={h}>{r[h].value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {status === 'invalid' && <div className="status">Invalid Query</div>}
      {status === 'loading' && <div className="status">Loading...</div>}
    </div>
  );
};
