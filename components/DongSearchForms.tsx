import { fetchRegionData } from "@/func/common";
import regionSlice from "@/redux/regionSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import SelectForm from "./SelectForm";

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

// 시도 데이터 로드 -> 첫 번째 시도 자동 선택
// 시도 선택 -> 시군구 데이터 로드
// 시군구 데이터 로드 -> 첫 번째 시군구 자동 선택
// 시군구 선택 -> 읍면동 데이터 로드
// 읍면동 데이터 로드 -> 첫 번쨰 읍면동 자동 선택
// 읍면동 데이터 선택 -> 선택된 읍면동 geometry 로드


function DongSearchForms() {
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

export default DongSearchForms;