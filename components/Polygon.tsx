import { useEffect, useRef } from "react";


function Polygon({map, path,center}) {
  const polygonRef = useRef();
  console.log(path)
  useEffect(()=>{
    console.log('new polygon')
      polygonRef.current = new google.maps.Polygon({
          paths: path,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
        })
        polygonRef.current.setMap(map);
        map.setCenter(path[0])
        return ()=> { 
          console.log('remove polygon');
          polygonRef.current.setMap(null)}
  },[]);

  useEffect(()=> {
      if(path && polygonRef) {
        console.log('path changed')
          polygonRef.current.setPaths(path)
          map.setCenter(center)
          map.setZoom(16)
      }
      console.log(polygonRef)
  },[path])

  return null;
}

export default Polygon;