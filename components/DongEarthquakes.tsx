import regionSlice from "@/redux/regionSlice"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import AdvancedMarker from "./AdvancedMarker"
import Polygon from "./Polygon"

function DongEarthquakes({map}) {
  const user = useSelector((state)=> {return state.user})
  const eqkList = useSelector((state)=> {return state.region.eqkList})
  const region = useSelector((state)=> {return state.region.region})
  const regionCenter = useSelector((state)=> {return state.region.center})
  const [highlight,setHighlight] = useState();
  const dispatch = useDispatch();
  const path = useMemo(()=> region[0] ? region[0].geometry.coordinates[0][0].map((item)=> {return({lng:item[0],lat:item[1]})}) : null,[region])


  const fetchData = async () => {
    const url = 'https://mgl7p2xkek.execute-api.ap-northeast-2.amazonaws.com/default/mongodb-find-dong-earthquake?';

    try {
      const res = await fetch(url + new URLSearchParams({
        emd_cd: region[0].properties.emd_cd,
      }));
      const json =await res.json()
      dispatch(regionSlice.actions.setEqkList([...json]))
      console.log('fetch success')
    } catch (error) {
      console.log('fetch error: ',error)
    }
  }

  useEffect(() => {
    console.log(eqkList.length)
  },[eqkList])

  useEffect(() => {
    if(region){
      fetchData();
    }
  },[region])

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
    {region[0] && <Polygon map={map} center={regionCenter} path={path}/>} 
    </>
  )
}

export default DongEarthquakes;