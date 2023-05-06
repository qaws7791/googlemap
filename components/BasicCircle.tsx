import { useEffect, useRef } from "react";

function BasicCircle({map,center,distance}) {
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
      radius: distance,
    })
    console.log(circleRef.current)
  },[]);

  useEffect(() => {
    circleRef.current.setCenter(center)
    circleRef.current.setMap(map)
    circleRef.current.setRadius(distance)

  },[map,center,distance])
}

export default BasicCircle;