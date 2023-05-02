"use client"
import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef,useEffect, useState } from 'react';
import { createRoot} from 'react-dom/client'
import './page.css';
import {getLocation} from '../../func/common';
import { Provider,useSelector,useDispatch } from "react-redux";
import store from "@/redux/store";
import userSlice from "@/redux/userSlice";

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: {lng: -122.343787,
    lat: 47.607465},
  zoom: 14,
  heading: 45,
  tilt: 67,

}


export default function Home() {
  return (
    <Provider store={store}>
      <Wrapper apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY} version="beta" libraries={['marker']}>
        <MapComponent />
      </Wrapper>
    </Provider>

  )
}

function MapComponent() {
  const [map,setMap] = useState();
  const user = useSelector((state)=> {return state.user})
  const ref = useRef();



    useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, {...mapOptions,mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },}));

  },[]);

  return (<div className="main">
    <SideNav/>
    <div id="map" ref={ref}></div>
    <div></div>
    {map && <UserPosition map={map}/>}
    {map && user && <Earthquakes map={map}/>}
    </div>)
}

function SideNav() {
  const [menuOpen,setMenuOpen] = useState(false);
  const [contentOpen,setContentOpen] = useState('');
  const user = useSelector((state)=> {return state.user})
  const dispatch = useDispatch();
  const [radio,setRadio] = useState('10');

  const handleInputChange = (e) => {
    setRadio(e.target.value);
  };

  const setLocation = async () => {
    const {latitude, longitude} = await getLocation();
    dispatch(userSlice.actions.changePosition({
      lat: latitude,
      lng: longitude
      }))

  };

  return(
  <div className="side-nav">
    <div className="side-nav-menu">    
      <div 
        style={{textAlign:'center'}}
        onClick={() => setMenuOpen(true)}
        ><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style={{fill:'rgba(0, 0, 0, 1)'}}><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg>
      </div>
      {menuOpen && 
      <div className="side-nav-detail">
        <div onClick={() => setMenuOpen(false)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style={{fill:'rgba(0, 0, 0, 1)'}}><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
        </div>
        <ul>
          <li onClick={() => {setContentOpen('menu1');setMenuOpen(false)}}>menu1</li>
          <li onClick={() => {setContentOpen('menu2');setMenuOpen(false)}}>menu2</li>
        </ul>
        
      </div>}
    </div>
{contentOpen &&     <div className="side-nav-content">
      <div onClick={() => setContentOpen('')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style={{fill:'rgba(0, 0, 0, 1)'}}><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
      </div>
      {contentOpen === 'menu1' && 
        <div>
          <button onClick={setLocation}>현재 위치 가져오기</button>
          <input type="radio" id="small" name="distance" value="10" checked={radio ==='10'} onChange={handleInputChange}/>
          <label htmlFor="small">10km</label>
          <input type="radio" id="medium" name="distance" value="50" checked={radio ==='50'} onChange={handleInputChange}/>
          <label htmlFor="medium">50km</label>
          <input type="radio" id="large" name="distance" value="100" checked={radio ==='100'} onChange={handleInputChange}/>
          <label htmlFor="large">100km</label>
          <button onClick={() =>     dispatch(userSlice.actions.changeDistance(+radio*1000))}>확인</button>
        </div>}
      {contentOpen === 'menu2' && <p>menu2</p>}

    </div>}
  </div>)
}

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
      {user && <Marker map={map} position={user.position}>
        <div className="marker">
          <h2>위치</h2>
        </div>
      </Marker>}
      {user && <Circle map={map} center={user.position} distance={user.distance_meter}/>}
    </>
  )
}

function Earthquakes({map}) {
  const user = useSelector((state)=> {return state.user})
  const [data, setData] = useState();
  const [highlight,setHighlight] = useState();


  const fetchData = async () => {
    const url = 'https://mgl7p2xkek.execute-api.ap-northeast-2.amazonaws.com/default/near?';

    try {
      const res = await fetch(url + new URLSearchParams({
        lat: user.position.lat,
        lng: user.position.lng,
        distance: user.distance_meter,
      }));
      const json =await res.json()
      setData([...json])
      console.log('fetch success')
    } catch (error) {
      console.log('fetch error: ',error)
    }
  }

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
    {data&& data.map((eqk) => (
      <Marker 
      key={eqk._id} 
      map={map} 
      position={{lat:eqk.location.coordinates[1],lng:eqk.location.coordinates[0]}}
      highlight={highlight}
      setHighlight={setHighlight}
      >
      <div 
        className={`marker ${highlight === eqk._id ? "highlight": ""}`}
        onMouseEnter={()=> onMouseEnter(eqk._id)}
        onMouseLeave={() => onMouseLeave()}

      >
        <h2>{eqk.size}</h2>
        {highlight === eqk._id ? (
          <div className="eqk-detail">
            <p>`{eqk.location.coordinates[1]},{eqk.location.coordinates[0]}`</p>
            <p>{new Date(eqk.time).toLocaleString()}</p>
            <p>{eqk.name}</p>
          </div>
        ): null}
      </div>
    </Marker>
    ))}
    </>
  )
}


function Marker({map,children, position,highlight,setHighlight}) {
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


    }
  },[]);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
  }, [map, position, children])
}

function Circle({map,center,distance}) {
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