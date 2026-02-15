import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const RecyclingMap = () => {
  const [position, setPosition] = useState(null);
  const [centers, setCenters] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("RecyclingMap mounted");

    if (!navigator.geolocation) {
      console.log("Geolocation NOT supported");
      setError("Geolocation not supported");
      return;
    }

    console.log("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Location SUCCESS:", pos);

        const userLocation = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];

        console.log("User location:", userLocation);

        setPosition(userLocation);

        console.log("Fetching nearby centers...");

        fetch(
          `http://localhost:5000/nearby-centers?lat=${userLocation[0]}&lng=${userLocation[1]}`
        )
          .then((res) => {
            console.log("Fetch response:", res);
            return res.json();
          })
          .then((data) => {
            console.log("Centers data:", data);
            setCenters(data);
          })
          .catch((err) => {
            console.error("Fetch ERROR:", err);
            setError("Failed to fetch recycling centers");
          });
      },
      (err) => {
        console.error("Geolocation ERROR:", err);
        setError("Location permission denied or unavailable");
      }
    );
  }, []);

  if (error) {
    return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  }

  if (!position) {
    return <p style={{ padding: "20px" }}>Getting your location...</p>;
  }

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>

        {centers.map((center, index) => (
          <Marker key={index} position={[center.lat, center.lng]}>
            <Popup>
              <strong>{center.name}</strong>
              <br />
              {center.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RecyclingMap;
