import React, {useEffect, useRef, useState } from 'react';
//import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import { Form, FormControl, OverlayTrigger, Tooltip} from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';

import jsn from "./dataset/world.geojson.txt"
import csvjson from "./dataset/csvjson.json"
import fakedata from "./dataset/fakedata.json"
import male from "./image/Homme.png"
import female from "./image/femme.png"

import {ToggleButtonGroup,ToggleButton} from 'react-bootstrap';



const App = () => {
  //const [expression, setExpression] = useState('$[city="Chicago"]');
  const [birthDate, setBirthDate] = useState(2000);
  const [country, setCountry] = useState('English');
  const [extra, setExtra] = useState(false);
  const [ value, setValue ] = useState(0); 


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
                (d) => {
                  if (d.properties.meanMen && typeof d.properties.meanMen === 'number') {
                    return "Men coverage: " + d.properties.meanMen.toFixed(2) + "%";
                  } else {
                    return "No data collected for this country";
                  }
                },
                (d) => {return(d.properties.meanMen ==="" ? " " : "Women coverage : " + (100 - d.properties.meanMen).toFixed(2) + "%")},
                " ",
                (d) => {return(d.properties.meanMen ==="" ? " " : "------------- Details -------------")},
                " ",
                (d) => {
                  if (d.properties.meanMen === "" || !d.properties.birthDate) {
                    return "No data available for this country";
                  } else {
                    return "Men: " + d.properties.birthDate[0];
                  }
                },
                (d) => {
                  if (d.properties.meanMen === "" || !d.properties.birthDate) {
                    return "No data available for this country";
                  } else {
                    return "Women: " + d.properties.birthDate[1];
                  }
                }
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
    <div >  
      <h1 style={{textAlign:"center",marginTop:40}}>{extra ? "Extrapolation of gender coverage of personalities born before "+birthDate+" (in "+country+" Wikipedia)" :"Gender coverage of personalities born before "+birthDate+" (in "+country+" Wikipedia)"}</h1>
      <div style={{display: 'flex', justifyContent: 'space-between',marginTop:40}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <button style={{margin:25,padding:10,marginLeft:60,marginTop:100}} onClick={() => setExtra(!extra)}>
            <img style={{width: 100}} src={male} alt="Symbole Masculin" />
          </button>
          <button style={{margin:25,padding:10,marginLeft:60}} onClick={() => setExtra(!extra)}>
            <img style={{width: 100}} src={female} alt="Symbole féminin" />
          </button>
        </div>
        {true && (
          <div style={{width:"83%"}} ref={svg}></div>
        )}
      </div>
      
      <Form style={{display: 'flex', justifyContent: 'center'}}>
        <Form.Label>Personalités nées avant : {birthDate}</Form.Label> 
      </Form>
      <Form style={{display: 'flex', justifyContent: 'center'}}>
        <Form.Range style={{width:700}} value={birthDate} min={0} max={2000} step={100} tooltip="on" onChange={(e) => setBirthDate(e.target.value)} title={birthDate}/>
      </Form>

      <ToggleButtonGroup style={{display: 'flex', justifyContent: 'center', marginTop:25}} type="radio" name="options" defaultValue={1}>
        <ToggleButton style={{marginRight:25}} variant="primary" id="tbg-radio-1" value={1} onChange={() => setExtra(!extra)}>
          Vue Classique
        </ToggleButton>
        <ToggleButton style={{marginRight:25}} id="tbg-radio-2" value={2} checked={extra} onChange={() => setExtra(!extra)}>
          Vue Extrapolé
        </ToggleButton>
        <ToggleButton style={{marginRight:25}} id="tbg-radio-3" value={3} onChange={() => setExtra(!extra)}x>
          ????
        </ToggleButton>
      </ToggleButtonGroup>
    </div>  
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