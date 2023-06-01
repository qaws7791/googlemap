"use client"
import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef,useEffect, useState } from 'react';

import './page.css';
import { Provider,useSelector } from "react-redux";
import store from "@/redux/store";
import UserPosition from "@/components/UserPosition";
import Earthquakes from "@/components/Earthquakes";
import DongEarthquakes from "@/components/DongEarthquakes";
import SideNav from "@/components/SideNav";

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: {
    lng: -122.343787,
    lat: 47.607465},
  zoom: 14,
  heading: 45,
  tilt: 67,

}


export default function Home() {
  return (
    <Provider store={store}>
      <Wrapper apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY} version="beta" libraries={['marker']}>
        <MapComponent />
      </Wrapper>
    </Provider>

  )
}

function MapComponent() {
  const [map,setMap] = useState();
  const user = useSelector((state)=> {return state.user})
  const region = useSelector((state)=> {return state.region.region})
  const ref = useRef();
  const currentMenu = useSelector((state)=>{return state.menu.currentMenu})

    useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, {...mapOptions,mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },}));

  },[]);


  return (
    <div className="main">
      <SideNav/>
      <div id="map" ref={ref}></div>
      <div></div>
      {map && <UserPosition map={map}/>}
      {map && user && currentMenu==='near'&& <Earthquakes map={map}/>}
      {map && user && currentMenu==='dong' &&<DongEarthquakes map={map}/>}
    </div>)
}