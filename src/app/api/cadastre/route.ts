import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract standard WMS parameters appended by Leaflet WMSTileLayer
  const bbox = searchParams.get('bbox') || searchParams.get('BBOX');
  const width = searchParams.get('width') || searchParams.get('WIDTH') || '256';
  const height = searchParams.get('height') || searchParams.get('HEIGHT') || '256';

  if (!bbox) {
    return new NextResponse('Missing bbox parameter', { status: 400 });
  }

  // Handle dynamic layers request
  const requestedLayers = searchParams.get('layers') || '15,21,27,33';

  // Geoportal MapServer export endpoint parameters
  const targetUrl = `https://www.geoportal.lt/mapproxy/rc_kadastro_zemelapis/MapServer/export?bbox=${bbox}&bboxSR=3857&layers=show:${requestedLayers}&size=${width},${height}&imageSR=3857&format=png&transparent=true&f=image`;

  try {
    const response = await fetch(targetUrl, {
       headers: {
         'Referer': 'https://www.geoportal.lt/',
         'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
       }
    });
    
    if (!response.ok) {
        return new NextResponse(`Geoportal Error: ${response.status}`, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    
    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    // Cache heavily since cadastre rarely changes day by day
    headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    // Allow any origin
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(buffer, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error("Cadastre Proxy Error:", error);
    return new NextResponse('Internal Proxy Error', { status: 500 });
  }
}
