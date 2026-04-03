"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
// @ts-ignore
import * as esri from 'esri-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import * as turf from '@turf/turf';

interface MapEditorProps {
  onPolygonCreated: (geoJson: any, areaHectares: number) => void;
  initialGeoData?: any;
}

export default function MapEditor({ onPolygonCreated, initialGeoData }: MapEditorProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [showKadastras, setShowKadastras] = useState(false);

  // Default center point: Lietuva, Kaunas roughly
  const center: [number, number] = [55.2530, 23.9736];
  const zoom = 7;

  useEffect(() => {
    // Fix leaflet marker icons issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    // Initialize Geoman Controls
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: true,
      drawCircle: false,
      drawText: false,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });

    // Language
    (map.pm as any).setLang('custom', {
      tooltips: {
        placeMarker: 'Pabėkite piešti lauką',
        firstVertex: 'Paspauskite pradėti poligoną',
        continueLine: 'Spauskite norėdami tęsti',
        finishLine: 'Spauskite atgal norint grįžti',
        finishPoly: 'Suverkite paskutinį tašką užbaigimui',
        finishRect: 'Tempkite stačiakampį',
      },
      actions: {
        finish: 'Baigti',
        cancel: 'Atšaukti',
        removeLastVertex: 'Grįžti atgal',
      },
      buttonTooltips: {
        drawPolygon: 'Braižyti dirbamą lauką',
        editMode: 'Koreguoti ribas',
        removalMode: 'Ištrinti plotą',
      }
    });

    // Handle polygon creation
    map.on('pm:create', (e) => {
      const layer = e.layer;
      
      // Jeigu jau turime nupieštą lauką, istrinam seną atiduodant per parametrus, 
      // leisti naudotojui tureti tik Viena plotą per lauko editinimą.
      const layers = featureGroupRef.current?.getLayers() || [];
      layers.forEach(l => {
          if (l !== layer) {
              l.remove();
          }
      });
      featureGroupRef.current?.addLayer(layer);

      calculateAndExport(layer);

      // Kadangi sukuriamas Layer'is, turim klausytis ir jo edito eventu
      layer.on('pm:edit', () => {
         calculateAndExport(layer);
      });
    });

    map.on('pm:remove', () => {
      onPolygonCreated(null, 0); // Isvalyta
    });

    return () => {
      if (map) {
        map.pm.removeControls();
        map.off('pm:create');
        map.off('pm:remove');
      }
    }
  }, [map, onPolygonCreated]);

  // Handle Geoportal ArcGIS Dynamic Map Layer (since WMS endpoint blocks CORS)
  useEffect(() => {
    if (!map || !showKadastras) return;

    const dynamicLayer = esri.dynamicMapLayer({
      url: "https://www.geoportal.lt/mapproxy/rc_kadastro_zemelapis/MapServer",
      opacity: 0.8,
      layers: [15, 21, 27, 33]
    });

    dynamicLayer.addTo(map);

    return () => {
      map.removeLayer(dynamicLayer);
    };
  }, [map, showKadastras]);

  // Jei turim initialGeoData (redaguojant) nupiesiame ji.
  useEffect(() => {
    if (!map || !initialGeoData || !featureGroupRef.current) return;
    
    // Panaikinam senus
    featureGroupRef.current.clearLayers();
    
    const geoJsonLayer = L.geoJSON(initialGeoData, {
      style: {
         color: '#65a30d',
         weight: 3,
         fillOpacity: 0.3
      }
    });

    const activeLayer = geoJsonLayer.getLayers()[0];
    if (activeLayer) {
        featureGroupRef.current.addLayer(activeLayer);
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50], maxZoom: 16 });
        
        // Prikabiname edit eventus po pradinio uzkrovimo
        activeLayer.on('pm:edit', () => {
            calculateAndExport(activeLayer);
        });
    }

  }, [initialGeoData, map]);


  const calculateAndExport = (layer: any) => {
    let geojson = layer.toGeoJSON();
    
    // Panaudojant turf apskaičiuojame area (M2) ir sukonvertuojam į Ha
    const plotoKvadratiniaisMetrais = turf.area(geojson);
    const hektarai = plotoKvadratiniaisMetrais / 10000;
    
    // Apvalinamas iki dviejų skaičių po kablelio
    const roundedHektarai = Math.round(hektarai * 100) / 100;
    
    onPolygonCreated(geojson, roundedHektarai);
  };


  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; ESRI'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        
        {/* Layer for storing our drawn lines */}
        <FeatureGroup ref={featureGroupRef}>
        </FeatureGroup>
      </MapContainer>

      {/* Kadastro UI Toggle */}
      <div className="absolute top-4 right-[60px] z-[400] bg-surface rounded-[16px] shadow-sm ring-1 ring-surface-container-highest p-3 flex items-center gap-3">
         <input 
            type="checkbox" 
            id="kadastrasToggle"
            checked={showKadastras}
            onChange={(e) => setShowKadastras(e.target.checked)} 
            className="w-5 h-5 rounded border-surface-container-highest text-primary focus:ring-primary cursor-pointer transition-all"
         />
         <label htmlFor="kadastrasToggle" className="text-sm font-semibold text-ink cursor-pointer select-none font-sans uppercase tracking-widest text-[0.6875rem]">
            Kadastro Ribos
         </label>
      </div>

      {/* Crosshair Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-[400]">
        <div className="w-1 h-4 bg-white rounded-full mx-auto mb-1"></div>
        <div className="flex items-center gap-1">
           <div className="w-4 h-1 bg-white rounded-full"></div>
           <div className="w-1 h-1 bg-primary rounded-full"></div>
           <div className="w-4 h-1 bg-white rounded-full"></div>
        </div>
        <div className="w-1 h-4 bg-white rounded-full mx-auto mt-1"></div>
      </div>
    </div>
  );
}
