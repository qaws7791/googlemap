export function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

export const fetchRegionData = async (url, params) => {
  const URLparams = new URLSearchParams(params);
  try {
    const res = await fetch(url + URLparams);
    const json = await res.json();
    console.log("fetch success");
    return json.response.result;
  } catch (error) {
    console.log("fetch error: ", error);
  }
};
