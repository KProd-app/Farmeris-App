"use client";

import React, { useEffect, useState } from "react";

interface WeatherWidgetProps {
  lat?: number | null;
  lon?: number | null;
  compact?: boolean;
}

// Matematinė "Haversine" formulė atstumui tarp taškų sferoje apskaičiuoti
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Žemės spindulys (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function WeatherWidget({ lat, lon, compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [placeName, setPlaceName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat === null || lon === null || lat === undefined || lon === undefined) {
      setLoading(false);
      return;
    }

    const fetchMeteoWeather = async () => {
      try {
        setError(false);
        // 1. Gaukime visas meteo.lt vietoves
        const placesRes = await fetch("https://api.meteo.lt/v1/places");
        if (!placesRes.ok) throw new Error("Failed to fetch places");
        const places = await placesRes.json();

        // 2. Surandame arčiausią stotį pagal lauko Google koordinates
        let closestPlace = places[0];
        let minDistance = Infinity;

        for (const p of places) {
           if (p.coordinates) {
              const dist = getDistanceFromLatLonInKm(lat, lon, p.coordinates.latitude, p.coordinates.longitude);
              if (dist < minDistance) {
                 minDistance = dist;
                 closestPlace = p;
              }
           }
        }
        
        setPlaceName(closestPlace.name);

        // 3. Ištraukiame orus tai konkrečiai arčiausiai vietovei
        const forecastRes = await fetch(`https://api.meteo.lt/v1/places/${closestPlace.code}/forecasts/long-term`);
        if (!forecastRes.ok) throw new Error("Failed to fetch forecasts");
        const forecastObj = await forecastRes.json();

        // 4. Parinkime pačią naujausią dabarties valandos prognozę
        const nowUtcMs = Date.now();
        
        let nearestForecast = forecastObj.forecastTimestamps[0];
        let smallestDiff = Infinity;

        for (const timestamp of forecastObj.forecastTimestamps) {
           // Meteo.lt pateikia "2023-10-10 15:00:00" formatą
           const forecastTimeMs = new Date(timestamp.forecastTimeUtc + "Z").getTime(); 
           const diff = Math.abs(forecastTimeMs - nowUtcMs);
           
           if (diff < smallestDiff) {
               smallestDiff = diff;
               nearestForecast = timestamp;
           }
        }

        if (nearestForecast) {
           setWeather({
              temperature_2m: nearestForecast.airTemperature,
              wind_speed_10m: nearestForecast.windSpeed,
              precipitation: nearestForecast.totalPrecipitation
           });
        }

      } catch (err) {
        console.error("Nepavyko nuskaityti Meteo.lt orų:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMeteoWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-full px-4 py-2 animate-pulse w-max">
        <span className="text-[10px] uppercase tracking-widest font-mono text-ink/40">Siejama su meteo.lt...</span>
      </div>
    );
  }

  if (error || !weather) {
    // Jei meteo blokuoja CORS ar failina, tiesiog nerodome skydelio, kad negadintų UI
    return null; 
  }

  return (
    <div className={`flex flex-col gap-1 items-end animate-fade-in-up`}>
      {/* Informacinė juostelė rodanti iš kokios meteo stoties imami duomenys */}
      {!compact && placeName && (
         <span className="text-[8px] font-mono text-ink/40 uppercase tracking-widest bg-surface-container-lowest/50 px-2 py-0.5 rounded-full mr-2">
            Meteo.lt • ~{placeName}
         </span>
      )}
      
      <div className={`flex items-center gap-3 bg-surface/80 backdrop-blur-[12px] border border-surface-container-highest/30 shadow-[0_8px_32px_rgba(26,28,25,0.06)] rounded-full w-max ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}>
        <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
          <span className="text-secondary/80 text-sm drop-shadow-sm">🌡️</span>
          <span className={`${compact ? "text-xs" : "text-sm"} font-mono font-bold text-ink`}>{weather.temperature_2m}°C</span>
        </div>
        
        <div className="w-[1px] h-3 bg-ink/10"></div>
        
        <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
          <span className="text-ink/40 text-sm drop-shadow-sm">💨</span>
          <span className={`${compact ? "text-xs" : "text-sm"} font-mono font-bold text-ink`}>{weather.wind_speed_10m} <span className="text-[8px] sm:text-[10px] text-ink/40 uppercase tracking-wider">m/s</span></span>
        </div> {/* Note that Meteo.lt wind speed is usually m/s instead of km/h */}
        
        {(weather.precipitation > 0) && (
          <>
            <div className="w-[1px] h-3 bg-ink/10"></div>
            <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <span className="text-primary/70 text-sm drop-shadow-sm">💧</span>
              <span className={`${compact ? "text-xs" : "text-sm"} font-mono font-bold text-ink`}>{weather.precipitation} <span className="text-[8px] sm:text-[10px] text-ink/40 uppercase tracking-wider">mm</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
