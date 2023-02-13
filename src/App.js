import React, { useEffect, useRef, useState } from 'react';
//import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import './App.css';

import { Box, Grommet, RangeInput, Tip, Button } from 'grommet';
import { deepMerge } from 'grommet/utils';
import { grommet } from 'grommet/themes';

import jsn from "./dataset/world.geojson.txt"
import extrajson from "./dataset/csvjson.json"
import realjson from "./dataset/overallData.json"
import male from "./image/Homme.png"
import female from "./image/femme.png"



const App = () => {
  const [birthDate, setBirthDate] = useState(2000);
  const [country, setCountry] = useState('English');
  const [reverseViz, setReverseViz] = useState(false);
  //const [value, setValue ] = useState("Vue Classique"); 
  //const [extra, setExtra] = useState(false);
  const svg = useRef(null);

  /*const handleChangeOption = (event) => {
    setCountry(event.target.value);
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
        params: { projection: geoEckert3(), background:"#ADD8F7"},
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
                (d) => {
                  if (d.properties.meanGender && typeof d.properties.meanGender === 'number') {
                    return "Men coverage: " + Math.abs(menCoverage - d.properties.meanGender).toFixed(2) + "%";
                  } else {
                    return "No data collected for this country";
                  }
                },
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
        ]
      })
    )
  }

  /*const drawChartExtra = (world,data) => {
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
              leg_title: `Men coverage (in %)`,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: ["$name","$pop"]
          },
        ]
      })
    )
  }*/

  useEffect(() => {
    let dataViz;
    
    realjson.forEach(element => {
      if(element[birthDate][ + reverseViz] === 0)
        element.meanGender = ""
      else
        element.meanGender = (element[birthDate][ + reverseViz]/(element[birthDate][ + reverseViz]+element[birthDate][ + !reverseViz]))*100
    })
    dataViz = realjson

    //if(extra)
    //  dataViz = extrajson
    d3.json(jsn).then((json) => {
        let chart
        chart = drawChart(json,dataViz);        
        //if(extra)
        //  chart = drawChartExtra(json,dataViz)
        if(svg.current.firstChild == null)
          svg.current.appendChild(chart)
        else{
          svg.current.removeChild(document.querySelector("svg"))
          svg.current.appendChild(chart)
        }
  })
  
  },[birthDate,/*extra,*/reverseViz])

  return (
    <Grommet theme={customTheme}>
      <Box fill pad="large">
      <h1>{birthDate < 0 ? "Personalities's gender coverage born B.C (in "+country+" Wikipedia)" : "Personalities's gender coverage born in "+birthDate+" (in "+country+" Wikipedia)"}</h1>
          <div class="divContainer">
            <div class="divLeft" style={{flex:0.1}}>
              <Button style={{width:145, height:145, marginTop:100, backgroundColor:"#E6EAFF"}} margin="small" label={<img src={male} alt="Symbole Masculin" />} onClick={() => setReverseViz(false)}/>
              <Button style={{width:145, height:145, backgroundColor:"#E6EAFF"}} margin="small" label={<img src={female} alt="Symbole féminin" />} onClick={() => setReverseViz(true)}/>
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
                <p>Timeline of personalities birth date </p> 
              </div>
              <div class="divUnderMap">
                <Tip plain content={birthDate}>
                  <RangeInput color="#C48E76" style={{width:700}} value={birthDate} min={0} max={2000} step={100} onChange={(e) => setBirthDate(e.target.value)} />
                </Tip>
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
      buttonBackground:"white",
    }
  }
})

export default App;
/*

      <div class="divUnderMap">
        <RadioButtonGroup name="radio-group" gap="large" direction="row" options={['Vue Classique', 'Vue Extrapolé', '???']} value={value} onChange={event => setValue(event.target.value)}/>
      </div>

      {birthDate < 0 ? 
      <h1 style={{textAlign:"center",marginTop:40}}>{extra ? "Extrapolation of personalities's gender coverage born B.C (in "+country+" Wikipedia)" : "Personalities's gender coverage born B.C (in "+country+" Wikipedia)"}</h1>
       : <h1 style={{textAlign:"center",marginTop:40}}>{extra ? "Extrapolation of personalities's gender coverage born in "+birthDate+" (in "+country+" Wikipedia)" :"Personalities's gender coverage born in "+birthDate+" (in "+country+" Wikipedia)"}</h1>}

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