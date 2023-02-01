import React, {useEffect, useRef, useState } from 'react';
import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";

import jsn from "./dataset/world.geojson.txt"
import csvjson from "./dataset/csvjson.json"


const App = () => {
  const [dataTest, setData] = useState([
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Mike', age: 25, city: 'Los Angeles' },
    { name: 'Sara', age: 35, city: 'Chicago' },
    { name: 'Jane', age: 40, city: 'New York' }
  ]);
  const [expression, setExpression] = useState('$[city="Chicago"]');
  const svg = useRef(null);
  var s = new XMLSerializer();

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
    return(
      bertin.draw({
        params: { projection: geoEckert3() },
        layers: [
          {
            type: "layer",
            geojson: bertin.merge(world, "ISO3", data, "id"),
            fill: {
              type: "choro",
              values: "pop",
              nbreaks: 10,
              method: "quantile", 
              //pal: pal,
              colors: "Spectral",
              leg_round: -2,
              leg_title: `GDP per inh (in $)`,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: ["$name", "$pop", "(current US$)"]
          },
          { type: "graticule" },
          { type: "outline" }
        ]
      })
    )
  }

  useEffect(() => {
    csvjson.columns=["id","name","region","pop","gdp","gdppc","year"];
    /*d3.csv(
      data,
      d3.autoType
    ).then((coucou) => {areArraysEqual(coucou,csvjson) coucou.forEach(element => console.log(element["<!DOCTYPE html>"]))})*/

    d3.json(jsn).then((json) => {
        const chart = drawChart(json,csvjson);
        if(svg.current.firstChild == null)
          svg.current.appendChild(chart)
        else{
          svg.current.removeChild(document.querySelector("svg"))
          svg.current.appendChild(chart)
        }
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
    <div ref={svg}></div>
      {/*<ReactSVG src={test} />*/}
    </>
  );
};

export default App;
