import { useEffect,useRef } from "react";

function BasicMarker({map, position}) {
  const markerRef = useRef();



  useEffect(() => {
      if(!map || markerRef.current) return;
      markerRef.current = new google.maps.Marker({
        map
      })

      return () => {
        markerRef.current.map = null;
      }
  },[]);

  useEffect(() => {

    markerRef.current.setPosition(position)
    
  }, [map, position])
}

export default BasicMarker;