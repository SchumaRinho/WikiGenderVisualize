import React, { useState } from 'react';
import jsonata from 'jsonata';

const App = () => {
  const [data, setData] = useState([
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Mike', age: 25, city: 'Los Angeles' },
    { name: 'Sara', age: 35, city: 'Chicago' },
    { name: 'Jane', age: 40, city: 'New York' }
  ]);
  const [expression, setExpression] = useState('$[city="Chicago"]');

  const handleFilter = e => {
    e.preventDefault();
    jsonata(expression).evaluate(data).then(element => {
      setData([element])
    })
  };

  const handleChange = e => {
    setExpression(e.target.value);
  };
  return (
    <div>
      <form onSubmit={handleFilter}>
        <input
          type='text'
          placeholder='$[city="Chicago"]'
          onChange={handleChange}
        />
        <button type='submit'>Filter</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>{item.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
