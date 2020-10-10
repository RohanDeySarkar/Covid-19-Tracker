import React, {useState, useEffect} from 'react';
import './App.css';

import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";

import "leaflet/dist/leaflet.css";

import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';

import {sortData, prettyPrintStat} from './util';


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setInputCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((res) => 
      res.json()
    )
    .then((data) => {
      setCountryInfo(data);
    });
  }, [])

  useEffect(() => {
    const getCountriesData = async() => {
      fetch("https://disease.sh/v3/covid-19/countries")
      .then((res) => 
        res.json()
      )
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));

        let sortedData = sortData(data);

        setCountries(countries);
        setMapCountries(data);
        setTableData(sortedData);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url = countryCode === "worldwide" ?
    "https://disease.sh/v3/covid-19/all"
    :
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((res) => 
        res.json()
      )
      .then((data) => {
        setInputCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Meter</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              // show the val on the select container
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox 
            onClick={() => setCasesType("cases")}
            title="Coronavirus Cases Today"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox 
            onClick={() => setCasesType("recovered")}
            title="Recovered Today"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox 
            onClick={() => setCasesType("deaths")}
            title="Deaths Today"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        <Map 
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table
              countries={tableData}
            />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph
              casesType={casesType}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
