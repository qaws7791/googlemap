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

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: {lng: -122.343787,
    lat: 47.607465},
  zoom: 18,
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
    <Wrapper apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY}>
    <MapComponent />
  </Wrapper>
  )
}

function MapComponent() {
  const [map,setMap] = useState();
  const [route,setRoute] = useState<RouteProps[]>()
  const [earthquake,setEarthquake]=useState<EqkProps>()
  const ref = useRef();
  const overlay = useRef();



    useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));
    setRoute([
      {lng:127.11227377269273,lat:37.39472345624831},
      {lng:127.11273699016535,lat:37.39470891137642},
      {lng:127.11275943405961,lat:37.39376294953177},
      {lng:127.10966524621578,lat:37.3937396926337},
      {lng:127.10967214334856,lat:37.399840028043634},
      {lng:127.10374249170327,lat:37.39984028415526},
      {lng:127.10371917998,lat:37.400849311369676},
      ])
    
  },[]);

  return (<div>
    <div id="map" ref={ref}></div>
    {/* {map && <Direction setRoute={setRoute}/>} */}
    {map && <Earthquake map={map} setEarthquake={setEarthquake}/>}
    {map && earthquake && <Animation map={map} earthquake={earthquake} mapref={ref}/>}
    </div>)
}



function Earthquake ({map,setEarthquake}) {
  const [eqkList,setEqkList] = useState<EqkProps[]>([]);
  useEffect(() => {
    setEqkList([
      {
        num:24,
        time:1689045900,
        mag:2.6,
        depth:14,
        maxLevel:'Ⅰ',
        lat:33.09,
        lon:125.42,
        loc:'제주 서귀포시 서쪽 108km 해역'
      },
      {
        num:11,
        time:1684871340,
        mag:2.5,
        depth:8,
        maxLevel:'Ⅳ',
        lat:34.67,
        lon:127.36,
        loc:'전남 고흥군 북동쪽 11km 지역'
      }
    ])
  },[])
  return (<div className="eqkList">
<table className="eqkTable">
      <thead>
        <tr>
          <th>번호</th>
          <th>발생시각</th>
          <th>규모</th>
          <th>깊이</th>
          <th>최대진도</th>
          <th>위도</th>
          <th>경도</th>
          <th>위치</th>
          <th>보기</th>
        </tr>
      </thead>
      <tbody>
      {eqkList.map((eqk)=> {
        return(<tr key={eqk.num}>
          <td>{eqk.num}</td>
          <td>{eqk.time}</td>
          <td>{eqk.mag}</td>
          <td>{eqk.depth}</td>
          <td>{eqk.maxLevel}</td>
          <td>{eqk.lat}</td>
          <td>{eqk.lon}</td>
          <td>{eqk.loc}</td>
          <td><button onClick={()=>setEarthquake(eqk)}>보기</button></td>
        </tr>)
      })}
      </tbody>
    </table>
  </div>)
}

function Direction({setRoute}) {
  const [origin] = useState('27 Front St Toronto')
  const [destination] = useState('75 Yonge Street Toronto')

  useEffect(() => {
    fetchDirections(origin, destination,setRoute)
  },[origin,destination])

  return (<div className="directions">
  <h2>Directions</h2>
  <h3>Origin</h3>
  <p>{origin}</p>
  <h3>Destination</h3>
  <p>{destination}</p>
</div>)
    
}

function Animation({map,earthquake,mapref}) {
  const overlay = useRef();
  const markerRef = useRef();

  useEffect(() => {
    console.log(earthquake)
    map.setCenter({lng:earthquake.lon,lat:earthquake.lat},20)

    if(!overlay.current) {
      overlay.current = new ThreeJSOverlayView({
        map
      })
    }



    //모델 추가
    loadGLTFModel().then(model => {
      console.log(model)
      if(markerRef.current) {
        overlay.current.scene.remove(markerRef.current);
      }
      markerRef.current = model;
      markerRef.current.position.copy({...overlay.current.latLngAltitudeToVector3({lng:earthquake.lon,lat:earthquake.lat}),z:300})
      console.log(markerRef.current)
      overlay.current.scene.add(markerRef.current)

    })
    
    // 장면에 요소를 추가
    overlay.current.scene.add(markerRef.current)
    console.log(map)
    console.log(overlay.current)
    //애니메이션 실행
    // overlay.current.update = () => {
    //   if(markerRef.current) {
    //     markerRef.current.scale.setScalar(10000 - map.zoom*495)
    //     markerRef.current.rotation.set(Math.PI / 2,markerRef.current.rotation.y+=0.01,0)
    //   }

    //   overlay.current.requestRedraw()
    // }
    let { tilt, heading, zoom } = mapOptions;
    const animate = () => {


     if(map) {
      if(heading<=360) {
        heading +=0.05
       } else {
        heading = 0
       }
      map.moveCamera({ tilt, heading });
     }
      
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },[earthquake])
}






async function loadGLTFModel() {
  const loader = new GLTFLoader();
  const object = await loader.loadAsync('/fin/scene.gltf');
  const scene = object.scene;
  scene.scale.setScalar(100);
  scene.rotation.set(Math.PI / 2,0,0)

  return scene;
}