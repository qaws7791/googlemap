"use client"
import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef,useEffect, useState } from 'react';
import { createRoot} from 'react-dom/client'
import './page.css';
import {fetchRegionData, getLocation} from '../../func/common';
import { Provider,useSelector,useDispatch } from "react-redux";
import store from "@/redux/store";
import userSlice from "@/redux/userSlice";
import eqkListSlice from "@/redux/eqkListSlice";
import regionSlice from "@/redux/regionSlice";
import SelectForm from "@/components/SelectForm";

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
  const region = useSelector((state)=> {return state.region.region})
  const regionCenter = useSelector((state)=> {return state.region.center})
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
    {map && region[0] && <Polygon map={map} center={regionCenter} path={region[0].geometry.coordinates[0][0].map((item)=> {return({lng:item[0],lat:item[1]})})}/>}
    </div>)
}

function Polygon({map, path,center}) {
    const polygonRef = useRef();
    console.log(path)
    useEffect(()=>{
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
          return ()=> { polygon.setMap(null)}
    },[]);

    useEffect(()=> {
        if(path && polygonRef) {
            polygonRef.current.setPaths(path)
            map.setCenter(center)
            map.setZoom(16)
        }
        console.log(polygonRef)
    },[path])

}



function SideNav() {
  const [menuOpen,setMenuOpen] = useState(false);
  const [contentOpen,setContentOpen] = useState('');
  const user = useSelector((state)=> {return state.user})
  const eqkList = useSelector((state)=> {return state.eqkList.eqkList})
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
          <div>
            <button onClick={setLocation}>현재 위치 가져오기</button>
            <p>반경 설정</p>
            <input type="radio" id="small" name="distance" value="10" checked={radio ==='10'} onChange={handleInputChange}/>
            <label htmlFor="small">10km</label>
            <input type="radio" id="medium" name="distance" value="50" checked={radio ==='50'} onChange={handleInputChange}/>
            <label htmlFor="medium">50km</label>
            <input type="radio" id="large" name="distance" value="100" checked={radio ==='100'} onChange={handleInputChange}/>
            <label htmlFor="large">100km</label>
            <button onClick={() =>     dispatch(userSlice.actions.changeDistance(+radio*1000))}>확인</button>
          </div>
          <div>
            {eqkList && eqkList.map((eqk,index) => (<p key={eqk._id}>{index}. {eqk.name}</p>))}
          </div>
        </div>}
      {contentOpen === 'menu2' && <p><SearchForm /></p>}

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
      {user && <BasicMarker map={map} position={user.position}>
      </BasicMarker>}
      {user && <Circle map={map} center={user.position} distance={user.distance_meter}/>}
    </>
  )
}

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
    </Marker>
    ))}
    </>
  )
}


function Marker({map,children, position}) {
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
}

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
// 시도 데이터 로드 -> 첫 번째 시도 자동 선택
// 시도 선택 -> 시군구 데이터 로드
// 시군구 데이터 로드 -> 첫 번째 시군구 자동 선택
// 시군구 선택 -> 읍면동 데이터 로드
// 읍면동 데이터 로드 -> 첫 번쨰 읍면동 자동 선택
// 읍면동 데이터 선택 -> 선택된 읍면동 geometry 로드

const params = {
    key: "1C93755A-99C1-302B-81E4-5A1B6573C41A",
    domain: "http://localhost:3000/search",
    service: "data",
    version: "2.0",
    request: "getfeature",
    format: "json",
    size: "1000",
    page: "1",
    geometry: "false",
    attribute: "true",
    crs: "EPSG:4326",
    geomfilter:
      "BOX(122.77143441739624,  32.689674111652815,  133.16466627619113,  42.0516845871052)",
    data: "LT_C_ADSIDO_INFO",
  };


function SearchForm() {
    const [sido,setSido] = useState([]);
    const [selectedSido, setSelectedSido] = useState();
    const [sigoon,setSigoon] = useState([]);
    const [selectedSigoon, setSelectedSigoon] = useState();
    const [dong,setdong] = useState([]);
    const [selectedDong, setSelectedDong] = useState();
    const dispatch = useDispatch();

    const getSido = async () => {
      const data = await fetchRegionData('req/data?',params);
      if(data) {
        const sidoData = data.featureCollection.features.map(sido=>{ return ( { value:sido.properties.ctprvn_cd,name:sido.properties.ctp_kor_nm})} )
        setSido(sidoData)
        setSelectedSido(sidoData[0].value)
      }
    }
  
    const getSigoon = async () => {
      const data = await fetchRegionData('req/data?',{...params,data:'LT_C_ADSIGG_INFO',attrfilter:`sig_cd:like:${selectedSido}`});
      if(data) {
        const sigoonData = data.featureCollection.features.map(sigoon=>{ return ( { value:sigoon.properties.sig_cd,name:sigoon.properties.sig_kor_nm})} )
        setSigoon(sigoonData)
        setSelectedSigoon(sigoonData[0].value)
      }
    }
  
    const getDong = async () => {
      const data = await fetchRegionData('req/data?',{...params,data:'LT_C_ADEMD_INFO',attrfilter:`emd_cd:like:${selectedSigoon}`});
      if(data) {
        const dongData = data.featureCollection.features.map(dong=>{ return ( { value:dong.properties.emd_cd,name:dong.properties.emd_kor_nm})} )
        setdong(dongData)
        setSelectedDong(dongData[0].value)
      }
    }
  
    const getDongGeometry = async () => {
      const data = await fetchRegionData('req/data?',{...params,geometry:'true',data:'LT_C_ADEMD_INFO',attrfilter:`emd_cd:like:${selectedDong}`});
      if(data) {
        dispatch(regionSlice.actions.setRegion(data.featureCollection.features))
        const bbox = data.featureCollection.bbox
        dispatch(regionSlice.actions.setCenter({lng: (bbox[2]+bbox[0])/2, lat: (bbox[3]+bbox[1]) / 2}))
        console.log(data)
      }
    }
  
  
    useEffect(() => {
        getSido();
    }, []);
  
    useEffect(() => {
      if(selectedSido) {
        getSigoon();
      }
    },[selectedSido])
  
    useEffect(() => {
      if(selectedSigoon) {
        getDong();
      }
    },[selectedSigoon])
  
    useEffect(() => {
      if(selectedDong) {
        getDongGeometry()
      }
    },[selectedDong])
  
    return (
      <div> 
        <SelectForm title={'시도를 선택하세요.'} data={sido} selected={selectedSido} setSelected={setSelectedSido}/>
        <SelectForm title={'시군구를 선택하세요.'} data={sigoon} selected={selectedSigoon} setSelected={setSelectedSigoon}/>
        <SelectForm title={'읍면동을 선택하세요.'}  data={dong} selected={selectedDong} setSelected={setSelectedDong}/>
      </div>
  
    )
  }