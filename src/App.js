import React, { useEffect, useRef, useState } from 'react';
//import jsonata from 'jsonata';
import * as d3 from "d3";
import * as bertin from "bertin";
import {geoEckert3} from "d3-geo-projection";
import './App.css';

import { Box, Grommet, RangeInput, Tip, Button, Menu } from 'grommet';
import { deepMerge } from 'grommet/utils';
import { grommet } from 'grommet/themes';

import jsn from "./dataset/world.geojson.txt"
import politicianJSON from "./dataset/politicanData.json"
import artistJSON from "./dataset/artistData.json"
import overallJSON from "./dataset/overallData.json"
import male from "./image/Homme.png"
import female from "./image/femme.png"



const App = () => {
  const [birthDate, setBirthDate] = useState(2000);
  const [reverseViz, setReverseViz] = useState(false);
  //const [value, setValue ] = useState("Vue Classique"); 
  const [occupation, setOccupation] = useState("All");
  const svg = useRef(null);

  /*const handleChangeOption = (event) => {
    setCountry(event.target.value);
  };*/

  const drawChart = (world,data) => {
    let classification = ""
    let menCoverage = 0
    let womenCoverage = 100
    let legend = "Men coverage (in %)"

    if(birthDate <= 1300)
      classification = "geometric"
    else
      classification = "jenks"

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
              nbreaks: 9,
              method: classification, 
              colors: "YlGnBu",
              leg_round: 0,
              leg_title: legend,
              leg_x: 100,
              leg_y: 200
            },
            tooltip: {
              fields: [
                "$NAMEfr",
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
                (d) => {return(d.properties.meanGender ==="" ? " " : "Women : " + d.properties[birthDate][1])},
                (d) => {return(d.properties.meanGender ==="" || (d.properties[birthDate][2] == undefined) ? " " : "Transgenre : " + d.properties[birthDate][2])},
                (d) => {return(d.properties.meanGender ==="" || (d.properties[birthDate][3] == undefined)? " " : "No-Binary : " + d.properties[birthDate][3])}
              ],
              fill: "#add8f7",
              fontSize:[20,15,15,15,15,15,15,15,15,15,15],
              col: ["black", "black", "#213f77", "#be34b6","black","black","black","#213f77", "#be34b6","#cc6600","#cc6600"],
              fillOpacity: 0.7
          }
          },
        ]
      })
    )
  }

  useEffect(() => {
    let dataViz;

    if(occupation === "All"){
      overallJSON.forEach(element => {
        if(element[birthDate][ + reverseViz] === 0)
          element.meanGender = ""
        else
          element.meanGender = (element[birthDate][ + reverseViz]/(element[birthDate][ + reverseViz]+element[birthDate][ + !reverseViz]))*100
      })
      dataViz = overallJSON
    }

    else if(occupation === "Artist"){
      artistJSON.forEach(element => {
        if(element[birthDate][ + reverseViz] === 0)
          element.meanGender = ""
        else
          element.meanGender = (element[birthDate][ + reverseViz]/(element[birthDate][ + reverseViz]+element[birthDate][ + !reverseViz]))*100
      })
      dataViz = artistJSON
    }

    else if(occupation === "Politician"){
      politicianJSON.forEach(element => {
        if(element[birthDate][ + reverseViz] === 0)
          element.meanGender = ""
        else
          element.meanGender = (element[birthDate][ + reverseViz]/(element[birthDate][ + reverseViz]+element[birthDate][ + !reverseViz]))*100
      })
      dataViz = politicianJSON
    }
    d3.json(jsn).then((json) => {
        let chart
        chart = drawChart(json,dataViz);        
        if(svg.current.firstChild == null)
          svg.current.appendChild(chart)
        else{
          svg.current.removeChild(document.querySelector("svg"))
          svg.current.appendChild(chart)
        }
  })
  
  },[birthDate,occupation,reverseViz])

  return (
    <Grommet theme={customTheme}>
      <Box fill pad="large">
      <h1>{birthDate === 0 ? "Personalities's gender coverage born B.C in Wikipedia" : "Personalities's gender coverage born in "+birthDate+" in Wikipedia"}</h1>
        {occupation === "All" ? [] :(<h2>Only {occupation}</h2>)}
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
              <div class="divUnderMap">
                <Menu
                  label="What do you want to see ?"
                  items={[
                    { label: 'All', onClick: () => {setOccupation("All")} },
                    { label: 'Artist', onClick: () => {setOccupation("Artist")} },
                    { label: 'Politician', onClick: () => {setOccupation("Politician")} },
                  ]}
                />              
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
        /div>

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