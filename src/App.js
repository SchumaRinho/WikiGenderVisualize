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
  //const [expression, setExpression] = useState('$[city="Chicago"]');
  const [birthDate, setBirthDate] = useState(2000);
  const [country, setCountry] = useState('English');
  const [extra, setExtra] = useState(false);


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
              nbreaks: 5,
              method: "geometric", 
              colors: "YlGnBu",
              leg_round: 0,
              leg_title: `Men coverage (in %)`,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: {
              fields: [
                "$name",
                " ",
                (d) => {return(d.properties.meanMen ==="" ? "No data collected for this country" : "Men coverage : " + d.properties.meanMen.toFixed(2) + "%")},
                (d) => {return(d.properties.meanMen ==="" ? " " : "Women coverage : " + (100 - d.properties.meanMen).toFixed(2) + "%")},
                " ",
                (d) => {return(d.properties.meanMen ==="" ? " " : "------------- Details -------------")},
                " ",
                (d) => {return(d.properties.meanMen ==="" ? " " : "Men : " + d.properties[birthDate][0])}, 
                (d) => {return(d.properties.meanMen ==="" ? " " : "Women : " + d.properties[birthDate][1])}
              ],
              fill: "#add8f7",
              fontSize:[20,15,15,15,15,15,15,15,15],
              col: ["black", "black", "#213f77", "#be34b6","black","black","black","#213f77", "#be34b6"],
              fillOpacity: 0.7
          }
          },
          { type: "graticule" },
          { type: "outline" }
        ]
      })
    )
  }

  const drawChartExtra = (world,data) => {
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
              method: "geometric", 
              colors: "Spectral",
              leg_round: 0,
              leg_title: `men in %`,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: ["$name","$pop"]
          },
          { type: "graticule" },
          { type: "outline" }
        ]
      })
    )
  }

  useEffect(() => {
    let dataViz;
    if(!extra){
      fakedata.forEach(element => {
        if(element[birthDate][0] == 0)
          element.meanMen = ""
        else
          element.meanMen = (element[birthDate][0]/(element[birthDate][0]+element[birthDate][1]))*100
      })
      dataViz = fakedata
    }
    else
      dataViz = csvjson
    d3.json(jsn).then((json) => {
        let chart
        if(!extra)
          chart = drawChart(json,dataViz);
        else
          chart = drawChartExtra(json,dataViz)
        if(svg.current.firstChild == null)
          svg.current.appendChild(chart)
        else{
          svg.current.removeChild(document.querySelector("svg"))
          svg.current.appendChild(chart)
        }
  })
  
  },[birthDate,extra])

  return (
    <>
    <Form>
      <Form.Check 
        type="switch"
        id="custom-switch"
        label="Extrapolation mod"
        checked={extra}
        onChange={() => setExtra(!extra)}
      />
    </Form>
    <Form>
      <Form.Group>
        <Form.Label>Personalités nées avant : </Form.Label> 
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
    <h1>{extra ? "Extrapolation of gender coverage of personalities born in "+birthDate+" (in "+country+" Wikipedia)" :"Gender coverage of personalities born in "+birthDate+" (in "+country+" Wikipedia)"}</h1>
    <div ref={svg}></div>
    </>
  );
};

export default App;


/*
 <Form>
      <Form.Group>
        <Form.Label>Select</Form.Label>
        <Form.Control as="select" value={country} onChange={handleChangeOption}>
          <option>English</option>
          <option>French</option>
          <option>Spanish</option>
        </Form.Control>
      </Form.Group>
    </Form>*/