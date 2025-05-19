import { memo, useEffect, useState } from "react";
import styles from "./AddressSelect.module.css";

function AddressSelect({ onChange }) {
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [wardList, setWardList] = useState([]);

  const [province, setProvince] = useState({});
  const [district, setDistrict] = useState({});
  const [ward, setWard] = useState({});
  const [address, setAddress] = useState("");


  useEffect(() => {
    onChange({ province, district, ward, address });
  }, [province, district, ward, address, onChange]);


  useEffect(() => {
    const fetchProvince = async () => {
      const result = await fetch("https://vapi.vnappmob.com/api/v2/province/");
      const { results } = await result.json();
      const convert = results.map(province => { 
        return {
          provinceId: province?.province_id, 
          provinceName: province?.province_name, 
        }
       })
      setProvinceList(convert);
      setProvince(convert[0])
    };

    fetchProvince();
  }, []);

  useEffect(() => {
    const fetchDistrict = async () => {
      const result = await fetch(`https://vapi.vnappmob.com/api/v2/province/district/${province?.provinceId}`);
      const { results } = await result.json();
      const convert = results.map(district => { 
        return {
          districtId: district?.district_id, 
          districtName: district?.district_name, 
        }
       })
       setDistrictList(convert)
       setDistrict(convert[0])
    };

    if (province && province?.provinceId) fetchDistrict()
  }, [province]);

  useEffect(() => {
    const fetchWard = async () => {
      const result = await fetch(`https://vapi.vnappmob.com/api/v2/province/ward/${district?.districtId}`);
      const { results } = await result.json();
      const convert = results.map(ward => { 
        return {
          wardId: ward?.ward_id,
          wardName: ward?.ward_name, 
        }
       })
      setWardList(convert);
      setWard(convert[0])
    };
    if (district && district?.districtId) fetchWard()
  }, [district]);

  const handleChangeProvince = (e) => {
    const index = e.target.selectedIndex;
    setProvince({ provinceId: e.target.value, provinceName: e.target[index].text });
  };

  const handleChangeDistrict = (e) => {
    const index = e.target.selectedIndex;
    setDistrict({ districtId: e.target.value, districtName: e.target[index].text });
  };

  const handleChangeWard = (e) => {
    const index = e.target.selectedIndex;
    setWard({ wardId: e.target.value, wardName: e.target[index].text });
  };

  return (
    <div>
      <div className={styles.boxSelect}>
        <select
          className="form-select"
          value={province && province?.provinceId}
          onChange={handleChangeProvince}
        >
          {provinceList && provinceList?.length > 0 &&
            provinceList.map((province) => (
              <option key={province?.provinceId} value={province?.provinceId}>
                {province?.provinceName}
              </option>
            ))}
        </select>

        <select
          className="form-select"
          value={district && district?.districtId}
          onChange={handleChangeDistrict}
        >
          {districtList && districtList?.length > 0 &&
            districtList.map((district) => (
              <option key={district?.districtId} value={district?.districtId}>
                {district?.districtName}
              </option>
            ))}
        </select>
        <select
          className="form-select"
          value={ward && ward?.wardId}
          onChange={handleChangeWard}
        >
          {wardList.length > 0 &&
            wardList.map((ward) => (
              <option key={ward?.wardId} value={ward?.wardId}>
               {ward?.wardName}
              </option>
            ))}
        </select>
      </div>
      <div className={`form-group ${styles.addressDetail}`}>
        <input
          required
          type="text"
          name="newAddress"
          className="form-control"
          placeholder="Địa chỉ: Số nhà, tên đường, ấp"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
    </div>
  );
}

export default memo(AddressSelect);
