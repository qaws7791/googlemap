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

const mapOptions = {
  mapId: '5f9c1c0db664c52d',
  center: {lng: -122.343787,
    lat: 47.607465},
  zoom: 15,
  heading: 45,
  tilt: 67,
}

export default function Home() {
  return (
    <Wrapper apiKey={'AIzaSyAL-RpPj9UzyX_qAUMANn1-wJyUj5atXQc'}>
    <MapComponent />
  </Wrapper>
  )
}

function MapComponent() {
  const [map,setMap] = useState();
  const [route,setRoute] = useState()
  const ref = useRef();
  const overlay = useRef();

    useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));
    
  },[]);

  return (<div>
    <div id="map" ref={ref}></div>
    {map && <Direction setRoute={setRoute}/>}
    {map && route && <Animation map={map} route={route} mapref={ref}/>}
    </div>)
}

function Animation({map,route,mapref}) {
  const overlay = useRef();
  const trackRef = useRef();

  useEffect(() => {
    map.setCenter(route[Math.floor(route.length/2)],17)

    if(!overlay.current) {
      overlay.current = new ThreeJSOverlayView({
        map
      })
    }
    console.log(route)
    const points = route.map((p) => overlay.current.latLngAltitudeToVector3(p))
    console.log(points)
    const curve = new CatmullRomCurve3(points);
    if(trackRef.current) {
      overlay.current.scene.remove(trackRef.current)
    }
    trackRef.current = createTrackFromCurve(curve)

    const box = new Mesh(
      new BoxGeometry(100, 500, 100),
      new MeshBasicMaterial({color: 0xff0000})
    );
    const pos = overlay.current.latLngAltitudeToVector3(mapOptions.center);
    box.position.copy(pos);
    console.log(pos)
    console.log(map)
    console.log(overlay.current)
    console.log(overlay.current.latLngAltitudeToVector3(mapOptions.center))
    // add box mesh to the scene
    overlay.current.scene.add(box);
    overlay.current.scene.add(trackRef.current)
    console.log(trackRef.current)

      console.log(overlay.current)

    console.log(mapref.current.offsetheight)
    console.log()

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


// function MyMapComponent() {
//   const [map,setMap] = useState();
//   const [route,setRoute] = useState()
//   const ref = useRef();

//   useEffect(() => {
//     setMap(new window.google.maps.Map(ref.current, mapOptions));
//   },[]);

//   return (
//     <div className="main">
//       <div ref={ref} id="map" />
//       {map && <Direction setRoute={setRoute}/>}
//       {map && route && <Animation map={map} route={route}/>}
//     </div>
//   );
// }

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


// function Animation({map, route}){
//   const overlayRef = useRef();
//   const trackRef = useRef();

//   useEffect(() => {
//     map.setCenter(route[Math.floor(route.length/2)],17)

//     if(!overlayRef.current) {
//       overlayRef.current = new ThreeJSOverlayView({anchor: mapOptions.center})
//       overlayRef.current.setMap(map);
//     }

//     const scene = overlayRef.current.scene;
//     const points = route.map((p) => overlayRef.current.latLngAltitudeToVector3(p))
//     console.log(points)
//     const curve = new CatmullRomCurve3(points);
//     if(trackRef.current) {
//       scene.remove(trackRef.current)
//     }
//     trackRef.current = createTrackFromCurve(curve)
//     console.log(curve)
//     scene.add(trackRef.current);

//     overlayRef.current.update = () => {
//       overlayRef.current.getViewportSize()
//     }

//     overlayRef.current.requestRedraw();
//   },[route])

//   return null;
// }

function createTrackFromCurve(curve) {
  const points = curve.getSpacedPoints(curve.points.length * 10);
  const positions = points.map((point) => point.toArray()).flat();

  return new Line2(
    new LineGeometry().setPositions(positions),
    new LineMaterial({
      color: 0xffb703,
      linewidth: 8,
    })
  );
}