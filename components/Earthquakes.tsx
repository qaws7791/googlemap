import eqkListSlice from "@/redux/eqkListSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdvancedMarker from "./AdvancedMarker";

function Earthquakes({map}) {
  const user = useSelector((state)=> {return state.user})
  const eqkList = useSelector((state)=> {return state.eqkList.eqkList})

  const [highlight,setHighlight] = useState();
  const dispatch = useDispatch();


  const fetchData = async () => {
    const url = 'https://mgl7p2xkek.execute-api.ap-northeast-2.amazonaws.com/default/near?';

    try {
      const res = await fetch(url + new URLSearchParams({
        lat: user.position.lat,
        lng: user.position.lng,
        distance: user.distance_meter,
      }));
      const json =await res.json()
      dispatch(eqkListSlice.actions.setEqks([...json]))
      console.log('fetch success')
    } catch (error) {
      console.log('fetch error: ',error)
    }
  }

  useEffect(() => {
    console.log(eqkList.length)
  },[eqkList])

  useEffect(() => {
    fetchData();
  },[user])

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
    {eqkList && eqkList.map((eqk) => (
      <AdvancedMarker
      key={eqk._id} 
      map={map} 
      position={{lat:eqk.location.coordinates[1],lng:eqk.location.coordinates[0]}}
      highlight={highlight}
      setHighlight={setHighlight}
      >
        <div 
            className={`marker ${highlight === eqk._id ? "highlight": ""}`}
            onMouseEnter={()=> onMouseEnter(eqk._id)}
            onMouseLeave={() => onMouseLeave()}>
          <h2 className="marker-title">{eqk.size}</h2>
          {highlight === eqk._id ? (<div className="marker-content">
            <p className="marker-name">
              {eqk.name.split(' ').slice(0,2)}
            </p>
            <p className="marker-subname">
              {eqk.name.split(' ').slice(2)}
            </p>
            <p className="marker-loc"><span>{eqk.location.coordinates[1]},{eqk.location.coordinates[0]}</span></p>
            <p className="marker-date">-{new Date(eqk.time).toLocaleString()}</p>
          </div>): null}
          
        </div>
    </AdvancedMarker>
    ))}
    </>
  )
}

export default Earthquakes;