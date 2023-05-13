"use client"
import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef,useEffect, useState, useMemo } from 'react';

import './page.css';
import {fetchRegionData, getLocation} from '../../func/common';
import { Provider,useSelector,useDispatch } from "react-redux";
import store from "@/redux/store";
import userSlice from "@/redux/userSlice";
import eqkListSlice from "@/redux/eqkListSlice";
import regionSlice from "@/redux/regionSlice";
import SelectForm from "@/components/SelectForm";
import menuSlice from "@/redux/menuSlice";
import BasicMarker from "@/components/BasicMarker";
import BasicCircle from "@/components/BasicCircle";
import AdvancedMarker from "@/components/AdvancedMarker";

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
  const ref = useRef();
  const currentMenu = useSelector((state)=>{return state.menu.currentMenu})

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
    {map && user && currentMenu==='near'&& <Earthquakes map={map}/>}
    {map && user && currentMenu==='dong' &&<DongEarthquakes map={map}/>}
    </div>)
}

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
    <ul className="side-nav-menu">    
      <li 
      className="side-nav-item"
        style={{textAlign:'center'}}
        onClick={() => setMenuOpen(true)}
        >
          <div><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style={{fill:'rgba(0, 0, 0, 1)'}}><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg></div>
      </li>
      {menuOpen && 
      <div className="side-nav-detail">
        <div className="side-nav-detail-header">
          <div className="side-nav-close-btn" onClick={() => setMenuOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style={{fill:'rgba(0, 0, 0, 1)'}}><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
          </div>
        
        </div>
        <ul>
          <li className="side-nav-detail-item"  onClick={() => {setContentOpen('menu1');setMenuOpen(false);dispatch(menuSlice.actions.changeMenuNear())}}><div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill:"rgba(112, 112, 112, 1)"}}><path d="M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z"></path><path d="M11.42 21.814a.998.998 0 0 0 1.16 0C12.884 21.599 20.029 16.44 20 10c0-4.411-3.589-8-8-8S4 5.589 4 9.995c-.029 6.445 7.116 11.604 7.42 11.819zM12 4c3.309 0 6 2.691 6 6.005.021 4.438-4.388 8.423-6 9.73-1.611-1.308-6.021-5.294-6-9.735 0-3.309 2.691-6 6-6z"></path></svg></div><div>근처 지진 찾기</div></li>
          <li className="side-nav-detail-item" onClick={() => {setContentOpen('menu2');setMenuOpen(false);dispatch(menuSlice.actions.changeMenuDong())}}><div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill:"rgba(112, 112, 112, 1)"}}><path d="m21.447 6.105-6-3a1 1 0 0 0-.895 0L9 5.882 3.447 3.105A1 1 0 0 0 2 4v13c0 .379.214.725.553.895l6 3a1 1 0 0 0 .895 0L15 18.118l5.553 2.776a.992.992 0 0 0 .972-.043c.295-.183.475-.504.475-.851V7c0-.379-.214-.725-.553-.895zM10 7.618l4-2v10.764l-4 2V7.618zm-6-2 4 2v10.764l-4-2V5.618zm16 12.764-4-2V5.618l4 2v10.764z"></path></svg></div><div>지역별 지진 찾기</div></li>
        </ul>
        
      </div>}
    </ul>
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
      {user && <BasicCircle map={map} center={user.position} distance={user.distance_meter}/>}
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