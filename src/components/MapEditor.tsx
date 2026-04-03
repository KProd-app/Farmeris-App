"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, FeatureGroup, Polygon } from 'react-leaflet';
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
  
  // GIS Layer States
  const [showSklypai, setShowSklypai] = useState(false);
  const [showInzineriniai, setShowInzineriniai] = useState(false);
  const [showKadastroBlokai, setShowKadastroBlokai] = useState(false);
  const [showKadastroVietoves, setShowKadastroVietoves] = useState(false);

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

  const activeLayers = [];
  if (showSklypai) activeLayers.push("15,21,27,33");
  if (showKadastroBlokai) activeLayers.push("13,19,25,31");
  if (showKadastroVietoves) activeLayers.push("14,20,26,32");
  if (showInzineriniai) activeLayers.push("16,17,22,23,28,29,34,35");
  const activeLayersStr = activeLayers.join(",");

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
        
        {/* Miestų ir gatvių pavadinimai */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        
        {activeLayersStr.length > 0 && (
          <WMSTileLayer
            key={activeLayersStr}
            url="/api/cadastre"
            layers={activeLayersStr}
            format="image/png"
            transparent={true}
            version="1.3.0"
            opacity={0.8}
          />
        )}
        
        {/* Layer for storing our drawn lines */}
        <FeatureGroup ref={featureGroupRef}>
        </FeatureGroup>
      </MapContainer>

      {/* Kadastro UI Toggle Panel */}
      <div className="absolute top-4 right-[60px] z-[400] bg-surface rounded-[16px] shadow-sm ring-1 ring-surface-container-highest p-3 flex flex-col gap-3">
         
         <div className="flex items-center gap-3">
            <input type="checkbox" id="toggleSklypai" checked={showSklypai} onChange={(e) => setShowSklypai(e.target.checked)} className="w-[18px] h-[18px] rounded border-surface-container-highest text-primary cursor-pointer transition-all" />
            <label htmlFor="toggleSklypai" className="text-xs font-semibold text-ink cursor-pointer select-none">Sklypų Ribos</label>
         </div>

         <div className="flex items-center gap-3">
            <input type="checkbox" id="toggleInz" checked={showInzineriniai} onChange={(e) => setShowInzineriniai(e.target.checked)} className="w-[18px] h-[18px] rounded border-surface-container-highest text-primary cursor-pointer transition-all" />
            <label htmlFor="toggleInz" className="text-xs font-semibold text-ink cursor-pointer select-none">Inž. Tinklai (Drenažas)</label>
         </div>

         <div className="flex items-center gap-3">
            <input type="checkbox" id="toggleBlokai" checked={showKadastroBlokai} onChange={(e) => setShowKadastroBlokai(e.target.checked)} className="w-[18px] h-[18px] rounded border-surface-container-highest text-primary cursor-pointer transition-all" />
            <label htmlFor="toggleBlokai" className="text-xs font-semibold text-ink cursor-pointer select-none">Kadastro Blokai</label>
         </div>

         <div className="flex items-center gap-3">
            <input type="checkbox" id="toggleVietoves" checked={showKadastroVietoves} onChange={(e) => setShowKadastroVietoves(e.target.checked)} className="w-[18px] h-[18px] rounded border-surface-container-highest text-primary cursor-pointer transition-all" />
            <label htmlFor="toggleVietoves" className="text-xs font-semibold text-ink cursor-pointer select-none">Kadastro Vietovės</label>
         </div>

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
