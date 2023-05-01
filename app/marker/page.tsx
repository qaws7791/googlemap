"use client"
import { Wrapper } from "@googlemaps/react-wrapper";
import { ThreeJSOverlayView } from "@googlemaps/three";
import { useRef,useEffect, useState } from 'react';
import {CatmullRomCurve3,MeshBasicMaterial} from 'three';
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { BoxGeometry, MathUtils, Mesh, MeshMatcapMaterial } from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRoot} from 'react-dom/client'

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: {lng: -122.343787,
    lat: 47.607465},
  zoom: 14,
  heading: 45,
  tilt: 67,
}

interface RouteProps {
  lng: number,
  lat: number
}

interface EqkProps {
  num: number,
  time: number,
  mag: number,
  depth: number | '-',
  maxLevel: string,
  lat: number,
  lon: number,
  loc: string
}

export default function Home() {
  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY} version="beta" libraries={['marker']}>
    <MapComponent />
  </Wrapper>
  )
}

function MapComponent() {
  const [map,setMap] = useState();
  const [user,setUser] = useState()
  const ref = useRef();



    useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));

  },[]);

  return (<div>
    <div id="map" ref={ref}></div>
    {map && <UserPosition map={map} user={user} setUser={setUser} />}
    {map && user && <Earthquakes map={map} user={user} />}
    </div>)
}

function UserPosition({map,user,setUser}) {
  

  const getLocation = () => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation,showError);
    } else {
      console.log("Geolocation is not supported by this browser")
    }
  };

  const setLocation = (position) => {
    setUser({
      position: {
      lat: position.coords.latitude,
      lng: position.coords.longitude
      }
    })
  };

  const showError = (error) => {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.")
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break;
    }
  }

  useEffect(() => {
    getLocation()
  },[])

  useEffect(() => {
    if(user && user.position) {
      map.setCenter({
        lng:user.position.lng,
        lat:user.position.lat},
        20)
    }
  },[user])

  return(
    <>
      {user && <Marker map={map} position={user.position}>
        <div className="marker">
          <h2>위치</h2>
        </div>
      </Marker>}
      {user && <Circle map={map} center={user.position}/>}
    </>
  )
}

function Earthquakes({map ,user}) {
  const [data, setData] = useState();
  const [highlight,setHighlight] = useState();

  const fetchData = async () => {
    const url = 'https://mgl7p2xkek.execute-api.ap-northeast-2.amazonaws.com/default/near?';
    // fetch(url)
    //   .then(res => res.json())
    //   .then(json => {
    //     setEqkList([...json])
    // })

    try {
      const res = await fetch(url + new URLSearchParams({
        lat: user.position.lat,
        lng: user.position.lng,
        distance: '10000',
      }));
      const json =await res.json()
      setData([...json])
    } catch (error) {
      console.log('fetch error: ',error)
    }
  }

  useEffect(() => {
    fetchData();
  },[])

  useEffect(() => {
    console.log('highlight: ',highlight)
  },[highlight])

  const onMouseEnter = (id) => {
    setHighlight(id);
    console.log('mouseEnter: ', id)
  }

  const onMouseLeave = () => {
    setHighlight(null)
  }

  return (
    <>
    {data&& data.map((eqk) => (
      <Marker 
      key={eqk._id} 
      map={map} 
      position={{lat:eqk.location.coordinates[1],lng:eqk.location.coordinates[0]}}
      highlight={highlight}
      setHighlight={setHighlight}
      >
      <div 
        className={`marker ${highlight === eqk._id ? "highlight": ""}`}
        onMouseEnter={()=> onMouseEnter(eqk._id)}
        onMouseLeave={() => onMouseLeave()}

      >
        <h2>{eqk.size}</h2>
        {highlight === eqk._id ? (
          <div className="eqk-detail">
            <p>`{eqk.location.coordinates[1]},{eqk.location.coordinates[0]}`</p>
            <p>{new Date(eqk.time).toLocaleString()}</p>
            <p>{eqk.name}</p>
          </div>
        ): null}
      </div>
    </Marker>
    ))}
    </>
  )
}


function Marker({map,children, position,highlight,setHighlight}) {
  const markerRef = useRef();
  const rootRef = useRef();



  useEffect(() => {
    if(!rootRef.current) {
      const container = document.createElement("div");
      rootRef.current = createRoot(container);

      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: container
      })
      markerRef.current.addListener("click",()=> {
        console.log('click')
      })


    }
  },[]);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
  }, [map, position, children])
}

function Circle({map,center}) {
  const circleRef = useRef();

  useEffect(() => {
    console.log(center)
    circleRef.current = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map:map,
      center: center,
      radius: 10000,
    })
  },[]);




}