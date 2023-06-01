import { useEffect, useRef } from "react";
import { createRoot} from 'react-dom/client'

function AdvancedMarker({map,children, position}) {
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
      return () => {
        markerRef.current.map = null;
      }

    }
  },[]);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
    
  }, [map, position, children])
  return null
}

export default AdvancedMarker;