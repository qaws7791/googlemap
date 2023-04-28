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
  zoom: 15,
  heading: 45,
  tilt: 67,
}

interface RouteProps {
  lng: number,
  lat: number
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
    {map && route && <Animation map={map} route={route} mapref={ref}/>}
    </div>)
}

function Animation({map,route,mapref}) {
  const overlay = useRef();
  const trackRef = useRef();
  const markerRef = useRef();

  useEffect(() => {
    map.setCenter(route[Math.floor(route.length/2)],17)

    if(!overlay.current) {
      overlay.current = new ThreeJSOverlayView({
        map
      })
    }

    console.log(route)

    //경로 만들기. 좌표 -> threejs 점 -> threejs 커브
    const points = route.map((p) => overlay.current.latLngAltitudeToVector3(p))
    console.log(points)
    const curve = new CatmullRomCurve3(points,false,'catmullrom',0.1);
    if(trackRef.current) {
      overlay.current.scene.remove(trackRef.current)
    }
    trackRef.current = createTrackFromCurve(curve)

    //박스 만들기
    const box = new Mesh(
      new BoxGeometry(100, 500, 100),
      new MeshBasicMaterial({color: 0xff0000})
    );
    const pos = overlay.current.latLngAltitudeToVector3(mapOptions.center);
    box.position.copy(pos);

    //모델 추가
    loadGLTFModel().then(model => {
      console.log(model)
      if(markerRef.current) {
        overlay.current.scene.remove(markerRef.current);
      }
      markerRef.current = model;
      markerRef.current.position.copy({...points[0],z:300})
      console.log(markerRef.current)
      overlay.current.scene.add(markerRef.current)

    })
    
    // 장면에 요소를 추가
    overlay.current.scene.add(box);
    overlay.current.scene.add(trackRef.current)
    overlay.current.scene.add(markerRef.current)

    //애니메이션 실행
    const animate = () => {

      box.rotateY(MathUtils.degToRad(0.1));
      trackRef.current.material.resolution.copy(
        {
          x: mapref.current.offsetWidth, 
          y:mapref.current.offsetHeight,
          height:mapref.current.offsetHeight,
          width:mapref.current.offsetWidth
        }
      );
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },[route])
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

async function  fetchDirections(origin, destination, setRoute) {
  const [ originResults, destinationResults ] = await Promise.all([
    getGeocode({address: origin}),
    getGeocode({address: destination})
  ])

  const [originLoc, destinationLoc] = await Promise.all([
    getLatLng(originResults[0]),
    getLatLng(destinationResults[0])
  ]);
  console.log(originLoc,destinationLoc)

  const service = new google.maps.DirectionsService();
  service.route({
    origin: originLoc,
    destination: destinationLoc,
    travelMode: google.maps.TravelMode.DRIVING,
  },
  (result,status) => {
    if(status === 'OK' && result) {
      const route = result.routes[0].overview_path.map(path=> ({
        lat: path.lat(),
        lng: path.lng()
      }))
      setRoute(route)
      console.log(route)
    }
  })
}


function createTrackFromCurve(curve) {
  const points = curve.getSpacedPoints(curve.points.length * 50);
  const positions = points.map((point) => point.toArray()).flat();

  return new Line2(
    new LineGeometry().setPositions(positions),
    new LineMaterial({
      color: 0xff0000,
      linewidth: 6,
    })
  );
}

async function loadGLTFModel() {
  const loader = new GLTFLoader();
  const object = await loader.loadAsync('/map_pointer_3d_icon/scene.gltf');
  const scene = object.scene;
  scene.scale.setScalar(100);
  scene.rotation.set(Math.PI / 2,0,0)

  return scene;
}