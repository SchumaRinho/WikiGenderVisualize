import React, {useEffect, useRef, useState } from 'react';
//import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import './App.css';

import { Box, Grommet, RangeInput, RadioButtonGroup } from 'grommet';
import { deepMerge } from 'grommet/utils';
import { grommet } from 'grommet/themes';

import jsn from "./dataset/world.geojson.txt"
import csvjson from "./dataset/csvjson.json"
import fakedata from "./dataset/fakedata.json"
import male from "./image/Homme.png"
import female from "./image/femme.png"



const App = () => {
  const [birthDate, setBirthDate] = useState(2000);
  const [country, setCountry] = useState('English');
  const [extra, setExtra] = useState(false);
  const [value, setValue ] = useState("Vue Classique"); 


  const svg = useRef(null);
  var s = new XMLSerializer();

  const handleChangeOption = (event) => {
    setCountry(event.target.value);
  };

  const drawChart = (world,data) => {
    return(
      bertin.draw({
        params: { projection: geoEckert3(), background:"#ADD8F7"},
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
        ]
      })
    )
  }

  const drawChartExtra = (world,data) => {
    return(
      bertin.draw({
        
        params: { projection: geoEckert3(), background:"#ADD8F7" },
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
    <Grommet theme={customTheme}>
      <Box fill pad="large">
          <h1>{extra ? "Extrapolation of gender coverage of personalities born before "+birthDate+" (in "+country+" Wikipedia)" :"Gender coverage of personalities born before "+birthDate+" (in "+country+" Wikipedia)"}</h1>
          <div class="divContainer">
            <div class="divLeft" style={{flex:0.1}}>
              <button style={{marginTop:100}} onClick={() => setExtra(!extra)}>
                <img src={male} alt="Symbole Masculin" />
              </button>
              <button onClick={() => setExtra(!extra)}>
                <img src={female} alt="Symbole féminin" />
              </button>
            </div>
            {true && (
              <div class="divRight" ref={svg}></div>
            )}
          </div>
          <div class="divContainer">
            <div class="divLeft" style={{flex:0.13}}>
              <p>  </p>
            </div>
            <div class="divRight" style={{flexDirection:"column"}}>
              <div class="divUnderMap">
                <p>Personalities born before : {birthDate}</p> 
              </div>
              <div class="divUnderMap">
                <RangeInput color="#C48E76" style={{width:700}} value={birthDate} min={0} max={2000} step={100} onChange={(e) => setBirthDate(e.target.value)}/>
              </div>
              <div class="divUnderMap">
                <RadioButtonGroup name="radio-group" gap="large" direction="row" options={['Vue Classique', 'Vue Extrapolé', '???']} value={value} onChange={event => setValue(event.target.value)}/>
              </div>
            </div>
          </div>    
      </Box> 
    </Grommet>
  );
};

const customTheme= deepMerge(grommet,{
  global:{
    font:{
      size:'16px',
    },
    colors:{
      brand:"#F8AE70",
      background:"#ADD8F7",
    }
  }
})

export default App;