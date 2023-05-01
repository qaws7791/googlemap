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

  const fetchData = async () => {
    const url = 'https://mgl7p2xkek.execute-api.ap-northeast-2.amazonaws.com/default/mongodb-to-response';
    // fetch(url)
    //   .then(res => res.json())
    //   .then(json => {
    //     setEqkList([...json])
    // })

    try {
      const res = await fetch(url);
      const json =await res.json()
      setEqkList([...json])
    } catch (error) {
      console.log('fetch error: ',error)
    }
  }

  useEffect(() => {
    console.log(eqkList)
  },[eqkList])

  useEffect(() => {
    fetchData();
  },[])
  return (<div className="eqkList">
    <table className="eqkTable">
      <thead>
        <tr>
          <th>발생시각</th>
          <th>규모</th>
          <th>깊이</th>
          <th>최대진도</th>
          <th>위도</th>
          <th>경도</th>
          <th>위치</th>
          <th>맵</th>
          <th>자세히</th>
        </tr>
      </thead>
      <tbody>
      {eqkList.map((eqk)=> {
        return(<tr key={eqk._id}>
          <td>{eqk.time}</td>
          <td>{eqk.size}</td>
          <td>{eqk.depth}</td>
          <td>{eqk.max}</td>
          <td>{eqk.location.coordinates[1]}</td>
          <td>{eqk.location.coordinates[0]}</td>
          <td>{eqk.name}</td>
          <td>{eqk.mapUrl === '-' ? '-' : <a href={eqk.mapUrl} target='_blank'>맵</a>}</td>
          <td>{eqk.detailUrl === '-' ? '-' : <a href={eqk.detailUrl} target='_blank'>자세히</a>}</td>
          <td><button onClick={()=>setEarthquake(eqk)}>보기</button></td>
        </tr>)
      })}
      </tbody>
    </table>
  </div>)
}


function Animation({map,earthquake,mapref}) {
  const overlay = useRef();
  const markerRef = useRef();

  useEffect(() => {
    console.log(earthquake)
    map.setCenter({lng:earthquake.location.coordinates[0],lat:earthquake.location.coordinates[1]},20)

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
      markerRef.current.position.copy({...overlay.current.latLngAltitudeToVector3({
        lng:earthquake.location.coordinates[0],
        lat:earthquake.location.coordinates[1]
      }),z:300})
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