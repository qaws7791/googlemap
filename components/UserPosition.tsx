import { getLocation } from "@/func/common";
import userSlice from "@/redux/userSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BasicMarker from "./BasicMarker";
import BasicCircle from "./BasicCircle";

function UserPosition({map}) {
  const user = useSelector((state)=> {return state.user})
  const dispatch = useDispatch();
  
  const setLocation = async () => {
    const {latitude, longitude} = await getLocation();
    dispatch(userSlice.actions.changePosition({
      lat: latitude,
      lng: longitude
      }))

  };

  useEffect(() => {
    setLocation()
  },[])

  useEffect(() => {
    if(user && user.position) {
      map.setCenter({
        lng:user.position.lng,
        lat:user.position.lat},
        20)
    }
  },[user])

  return(
    <>
      {user && <BasicMarker map={map} position={user.position}/>}
      {user && <BasicCircle map={map} center={user.position} distance={user.distance_meter}/>}
    </>
  )
}

export default UserPosition;