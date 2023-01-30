import React, {useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg'
import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import test from "./test.svg"

const App = () => {
  const [dataTest, setData] = useState([
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Mike', age: 25, city: 'Los Angeles' },
    { name: 'Sara', age: 35, city: 'Chicago' },
    { name: 'Jane', age: 40, city: 'New York' }
  ]);
  const [expression, setExpression] = useState('$[city="Chicago"]');
  const [chart, setChart]  = useState();
  var s = new XMLSerializer();
  //viewof nbreaks = Inputs.range([3, 9], { label: "nbreaks", step: 1, value: 7 })

  const handleFilter = e => {
    e.preventDefault();
    jsonata(expression).evaluate(dataTest).then(element => {
      setData([element])
    })
  };

  const handleChange = e => {
    setExpression(e.target.value);
  };

  const drawChart = (world,data) => {
    setChart( // TROUVER UN MOYEN D INSERER LE SVG
      bertin.draw({
        params: { projection: geoEckert3() },
        layers: [
          {
            type: "layer",
            geojson: bertin.merge(world, "ISO3", data, "id"),
            fill: {
              type: "choro",
              values: "gdppc",
              //nbreaks: nbreaks,
              //method: method,
              //pal: pal,
              //colors: pal,
              leg_round: -2,
              leg_title: `GDP per inh (in $)`,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: ["$name", "$gdppc", "(current US$)"]
          },
          { type: "graticule" },
          { type: "outline" }
        ]
      })
    )
  }

  useEffect(() => {
    d3.json("https://raw.githubusercontent.com/neocarto/bertin/main/data/world.geojson").then((json) => {
      d3.csv(
        "https://raw.githubusercontent.com/neocarto/bertin/main/data/data.csv",
        d3.autoType
      ).then((csv) => {
          drawChart(json,csv);
      })
    })
  },[expression])

  return (
    <><div> 
      <form onSubmit={handleFilter}>
        <input
          type='text'
          placeholder='$[city="Chicago"]'
          onChange={handleChange} />
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
          {dataTest.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>{item.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      {<ReactSVG src={test} />}
    </>
  );
};

export default App;
