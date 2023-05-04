function SelectForm({title,data,selected,setSelected}) {
  
  const handleSelect = (e) => {
    setSelected(e.target.value);
  };

  console.log(data)

  return (
    <div className="App">
      <h3>{title}</h3>
      <div>
        {data && <select onChange={handleSelect} value={selected}>
          {data.map((item) => (
            <option value={item.value} key={item.value}>
              {item.name}
            </option>
          ))}
        </select>}
        
        <hr />
        <p>
          선택된 지역 코드: <b>{selected}</b>
        </p>
      </div>
    </div>
  );
}
export default SelectForm;