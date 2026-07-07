// Fix #3: the original app never fetched AQI. Open-Meteo publishes it on a
// separate air-quality host from the main forecast API, so it needs its own call.
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface AirQualityResponse {
  current: {
    us_aqi: number | null;
  };
}

export async function fetchAirQuality(latitude: number, longitude: number): Promise<number | undefined> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'us_aqi',
  });
  const res = await fetch(`${AIR_QUALITY_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Air quality fetch failed: ${res.status}`);
  const data: AirQualityResponse = await res.json();
  return data.current.us_aqi ?? undefined;
}
