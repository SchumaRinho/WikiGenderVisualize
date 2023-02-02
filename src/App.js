import React, {useEffect, useRef, useState } from 'react';
//import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import { Form, FormControl} from 'react-bootstrap';

import jsn from "./dataset/world.geojson.txt"
import csvjson from "./dataset/csvjson.json"
import fakedata from "./dataset/fakedata.json"



const App = () => {
  const [expression, setExpression] = useState('$[city="Chicago"]');
  const [birthDate, setBirthDate] = useState(2000);
  const [country, setCountry] = useState('English');

  const svg = useRef(null);
  var s = new XMLSerializer();

  const handleChangeOption = (event) => {
    setCountry(event.target.value);
  };

  /*const handleFilter = e => {
    e.preventDefault();
    jsonata(expression).evaluate(dataTest).then(element => {
      setData([element])
    })
  };

  const handleChange = e => {
    setExpression(e.target.value);
  };*/

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
              values: "meanMen",
              nbreaks: 10,
              method: "geometric", 
              colors: "Spectral",
              leg_round: -2,
              leg_title: `men in %`,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: ["$name" /*(d) => d.properties[birthDate][0]*/]
          },
          { type: "graticule" },
          { type: "outline" }
        ]
      })
    )
  }

  useEffect(() => {
    /*jsonata("[*].id").evaluate(csvjson).then(element => {
      console.log(element)
    })*/
    //fakedata.columns=["id","name","0","100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600","1700","1800","1900","2000"]
    fakedata.forEach(element => element.meanMen = (element[birthDate][0]/(element[birthDate][0]+element[birthDate][1]))*100)
    console.log(fakedata)
    csvjson.columns=["id","name","region","pop","gdp","gdppc","year"];
    /*d3.csv(
      data,
      d3.autoType
    ).then((coucou) => {areArraysEqual(coucou,csvjson) coucou.forEach(element => console.log(element["<!DOCTYPE html>"]))})*/

    d3.json(jsn).then((json) => {
        const chart = drawChart(json,fakedata);
        if(svg.current.firstChild == null)
          svg.current.appendChild(chart)
        else{
          svg.current.removeChild(document.querySelector("svg"))
          svg.current.appendChild(chart)
        }
  })
  
  },[expression])

  return (
    <>
    <div>
    <Form>
      <Form.Group>
        <Form.Label>Personalités nées avant : {birthDate}</Form.Label>
        <FormControl
          type="range"
          value={birthDate}
          min={0}
          max={2000}
          step={100}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </Form.Group>
    </Form>
    <Form>
      <Form.Group>
        <Form.Label>Select</Form.Label>
        <Form.Control as="select" value={country} onChange={handleChangeOption}>
          <option>English</option>
          <option>French</option>
          <option>Spanish</option>
        </Form.Control>
      </Form.Group>
    </Form>
    {country}
    </div>
    <div ref={svg}></div>
    </>
  );
};

export default App;
