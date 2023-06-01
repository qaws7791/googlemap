import { getLocation } from "@/func/common";
import userSlice from "@/redux/userSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DongSearchForms from "./DongSearchForms";
import menuSlice from "@/redux/menuSlice";

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
      {contentOpen === 'menu2' && <p><DongSearchForms /></p>}

    </div>}
  </div>)
}

export default SideNav;