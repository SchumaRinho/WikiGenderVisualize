import React, {useEffect, useRef, useState } from 'react';
//import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import { Form, FormControl} from 'react-bootstrap';

import jsn from "./dataset/world.geojson.txt"
import extrajson from "./dataset/csvjson.json"
import realjson from "./dataset/fakedata.json"

const App = () => {
  //const [expression, setExpression] = useState('$[city="Chicago"]');
  const [birthDate, setBirthDate] = useState(2000);
  const [country, setCountry] = useState('English');
  const [extra, setExtra] = useState(false);
  const [reverseViz, setReverseViz] = useState(false);


  const svg = useRef(null);

  /*const handleChangeOption = (event) => {
    setCountry(event.target.value);
  };*/

  /*const handleFilter = e => {
    e.preventDefault();
    jsonata(expression).evaluate(dataTest).then(element => {
      setData([element])
    })
  };*/

  const drawChart = (world,data) => {
    let menCoverage = 0
    let womenCoverage = 100
    let legend = "Men coverage (in %)"
    if(reverseViz){
      legend = "Women coverage (in %)"
      menCoverage = 100
      womenCoverage = 0
    }
    return(
      bertin.draw({
        params: { projection: geoEckert3() },
        layers: [
          {
            type: "layer",
            geojson: bertin.merge(world, "ISO3", data, "id"),
            fill: {
              type: "choro",
              values: "meanGender",
              nbreaks: 5,
              method: "geometric", 
              colors: "YlGnBu",
              leg_round: 0,
              leg_title: legend,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: {
              fields: [
                "$name",
                " ",
                (d) => {return(d.properties.meanGender ==="" ? "No data collected for this country" : "Men coverage : " + Math.abs(menCoverage - d.properties.meanGender).toFixed(2) + "%")},
                (d) => {return(d.properties.meanGender ==="" ? " " : "Women coverage : " + (Math.abs(womenCoverage - d.properties.meanGender).toFixed(2) + "%"))},
                " ",
                (d) => {return(d.properties.meanGender ==="" ? " " : "------------- Details -------------")},
                " ",
                (d) => {return(d.properties.meanGender ==="" ? " " : "Men : " + d.properties[birthDate][0])}, 
                (d) => {return(d.properties.meanGender ==="" ? " " : "Women : " + d.properties[birthDate][1])}
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
              leg_title: `Men coverage (in %)`,
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
      realjson.forEach(element => {
        if(element[birthDate][ + reverseViz] === 0)
          element.meanGender = ""
        else
          element.meanGender = (element[birthDate][ + reverseViz]/(element[birthDate][ + reverseViz]+element[birthDate][ + !reverseViz]))*100
      })
      dataViz = realjson
    }
    else
      dataViz = extrajson
    d3.json(jsn).then((json) => {
        let chart
        if(!extra){
          chart = drawChart(json,dataViz);
        }
        else
          chart = drawChartExtra(json,dataViz)
        if(svg.current.firstChild == null)
          svg.current.appendChild(chart)
        else{
          svg.current.removeChild(document.querySelector("svg"))
          svg.current.appendChild(chart)
        }
  })
  
  },[birthDate,extra,reverseViz])

  return (
    <>
    <Form>
      <Form.Check 
        type="switch"
        id="custom-switch"
        label="Extrapolation mod"
        onChange={() => setExtra(!extra)}
      />
    </Form>
    <Form>
      <Form.Check 
        type="switch"
        id="custom-switch"
        label="Men vizualisation mod"
        checked={reverseViz ? false : true}
        onChange={() => setReverseViz(false)}
      />
      <Form.Check 
        type="switch"
        id="custom-switch"
        label="Women vizualisation mod"
        checked={reverseViz ? true : false}
        onChange={() => setReverseViz(true)}
      />
    </Form>
    <Form>
      <Form.Group>
        <Form.Label>Personalités nées avant : </Form.Label> 
        <FormControl
          type="range"
          value={birthDate}
          min={-100}
          max={2000}
          step={100}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </Form.Group>
    </Form>
    {birthDate < 0 ? 
      <h1>{extra ? "Extrapolation of personalities's gender coverage born B.C (in "+country+" Wikipedia)" : "Personalities's gender coverage born B.C (in "+country+" Wikipedia)"}</h1>
       : <h1>{extra ? "Extrapolation of personalities's gender coverage born in "+birthDate+" (in "+country+" Wikipedia)" :"Personalities's gender coverage born in "+birthDate+" (in "+country+" Wikipedia)"}</h1>}
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