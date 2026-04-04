"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Dinamiškai krauname MapEditor (be Server-Side Rendering)
const MapEditor = dynamic(() => import("@/components/MapEditor"), { 
  ssr: false,
  loading: () => (
     <div className="h-full w-full bg-surface-container-highest animate-pulse rounded-[32px] flex items-center justify-center font-mono text-sm uppercase tracking-widest text-ink/40">
        Kraunamas Žemėlapio Palydovas...
     </div>
  )
});

interface Laukas {
  id: string;
  pavadinimas: string;
  plotas: number;
  kultura: string;
  geoData?: any; 
  createdAt?: any;
}

export default function LaukaiPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [laukai, setLaukai] = useState<Laukas[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modalas formos / žemėlapio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formPlotas, setFormPlotas] = useState(""); // readonly, apskaičiuotas automatiškai
  const [formKultura, setFormKultura] = useState("");
  const [formGeoData, setFormGeoData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData && userData.role !== "farmer") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "laukai"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Laukas[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Laukas);
      });
      data.sort((a, b) => a.pavadinimas.localeCompare(b.pavadinimas));
      setLaukai(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePolygonChange = (geoJson: any, areaHa: number) => {
    setFormGeoData(geoJson);
    setFormPlotas(areaHa > 0 ? areaHa.toString() : "");
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!formPlotas || formPlotas === "0") {
      alert("Prašome nubrėžti lauko poligoną žemėlapyje. Iš jo bus apskaičiuojamas plotas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "laukai"), {
        ownerId: user.uid,
        pavadinimas: formPavadinimas,
        plotas: parseFloat(formPlotas),
        kultura: formKultura,
        geoData: formGeoData,
        createdAt: serverTimestamp()
      });
      
      setFormPavadinimas("");
      setFormPlotas("");
      setFormKultura("");
      setFormGeoData(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Nepavyko pridėti lauko:", error);
      alert("Įvyko klaida pridedant lauką.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ar tikrai norite ištrinti šį lauką? Atkurti nebus įmanoma.")) {
      try {
        await deleteDoc(doc(db, "laukai", id));
      } catch (error) {
        console.error("Nepavyko ištrinti:", error);
      }
    }
  };

  if (!userData || userData.role !== "farmer") {
    return <div className="p-8 text-ink font-mono text-sm opacity-50">Autentifikuojama...</div>;
  }

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      
      {/* Header Be Linijų */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-[3.5rem] leading-none font-bold text-ink tracking-tight">Laukai</h1>
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Žymėkite dirbamos žemės plotus naudodami palydovinį GPS fiksatorių.</p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-[32px] bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 transition-all font-sans"
          >
            Pridėti Lauką Žemėlapyje
          </button>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center p-20">
              <span className="font-mono text-ink/40 animate-pulse text-sm uppercase tracking-widest">Kraunama...</span>
          </div>
      ) : laukai.length === 0 ? (
          <div className="bg-surface-container-low p-20 text-center rounded-[32px]">
             <h3 className="text-xl font-semibold text-ink">Laukų dar nėra</h3>
             <p className="mt-2 text-ink/60">Sukonfigūruokite savo pirmąjį plotą apibrėždami jį palydoviniame žemėlapyje.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {laukai.map((laukas) => (
            <div key={laukas.id} className="bg-surface rounded-[32px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] overflow-hidden flex flex-col group">
              
              {/* Žemėlapio Thumbnail Blokas */}
              <div className="h-48 bg-surface-container-lowest relative flex items-center justify-center overflow-hidden border-b border-surface-container-highest/50">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--color-surface-container-high) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.1 }}></div>
                
                {laukas.geoData ? (
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="p-4 bg-primary/10 rounded-full shadow-[0_4px_16px_rgba(51,69,13,0.1)] mb-3 text-primary animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21A10.012 10.012 0 0022 12a10.012 10.012 0 00-10-9.9m0 18.9A10.012 10.012 0 012 12a10.012 10.012 0 0110-9.9m0 18.9V12m0-8.9L12 12m-6 3h12" />
                        </svg>
                     </div>
                     <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary px-3 py-1 bg-primary/5 rounded-full ring-1 ring-primary/20">GIS Plotas Aktyvus</span>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="p-3 bg-white/50 backdrop-blur-md rounded-full mb-2 text-ink/30">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                       </svg>
                     </div>
                     <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/20">Nėra GPS koordinačių</span>
                  </div>
                )}
              </div>

              {/* Turinio Blokas */}
              <div className="p-8 flex flex-col gap-6">
                 <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-ink">{laukas.pavadinimas}</h3>
                      <p className="text-sm text-ink/60 mt-1 uppercase tracking-widest font-mono">{laukas.kultura}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="font-mono text-2xl font-bold text-primary">{laukas.plotas}</span>
                       <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/40">Hektarai</span>
                    </div>
                 </div>

                 {/* Mygtukai / Veiksmai */}
                 <div className="flex justify-end pt-4 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                       onClick={() => handleDelete(laukas.id)}
                       className="bg-secondary/10 px-6 py-2.5 rounded-[20px] text-xs font-bold font-mono tracking-widest uppercase text-secondary hover:bg-secondary hover:text-white transition-colors"
                    >
                      Ištrinti
                    </button>
                 </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Plačiaformatis Modalas Kombinuotas su Žemėlapiu */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-surface-container-highest/90 backdrop-blur-[32px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-0 z-10 flex items-center justify-center p-0 lg:p-4">
              <div className="relative transform overflow-hidden bg-surface text-left shadow-[0_48px_100px_rgba(26,28,25,0.2)] transition-all flex flex-col lg:flex-row w-full lg:max-w-[1400px] h-[100dvh] lg:h-[90vh] lg:rounded-[40px]">
                
                {/* 60% Ploto - Palydovinis Žemėlapis */}
                <div className="flex-1 lg:w-2/3 p-0 lg:p-8 flex flex-col min-h-[50vh]">
                   {/* Pridedame nedidelį mygtuką "Uždaryti" mobiliajai versijai virš žemėlapio */}
                   <button onClick={() => setIsModalOpen(false)} className="lg:hidden absolute top-4 left-4 z-[400] bg-surface rounded-full p-2 shadow-sm ring-1 ring-surface-container-highest">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-ink"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                   
                   <div className="flex-1 w-full lg:rounded-[32px] overflow-hidden bg-surface-container-lowest ring-1 ring-surface-container-highest/20 shadow-inner">
                      <MapEditor onPolygonCreated={handlePolygonChange} />
                   </div>
                </div>

                {/* 40% Ploto - Formos Duomenys */}
                <div className="w-full lg:w-1/3 bg-surface-container-lowest flex flex-col order-last border-t lg:border-t-0 lg:border-l border-surface-container-highest/50 h-[45vh] lg:h-auto z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
                   <form onSubmit={handleAddField} className="flex flex-col h-full">
                      <div className="flex-1 p-8 overflow-y-auto">
                        <h3 className="text-[2.5rem] leading-none tracking-tight font-bold text-ink mb-2">Naujas Laukas</h3>
                        <p className="text-ink/60 font-sans mb-10">Naudojantis įrankiu pieškite daugiakampį ant palydovo vaizdo.</p>
                        
                        <div className="space-y-8">
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Lauko Pavadinimas</label>
                            <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-5 px-6 text-xl text-ink font-sans focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.3)] transition-all placeholder:text-ink/30" placeholder="Pvz. Šiaurės dirva" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Auginama Kultūra</label>
                            <input type="text" required value={formKultura} onChange={(e) => setFormKultura(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-6 text-ink font-sans focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.3)] transition-all placeholder:text-ink/30" placeholder="Pvz. Rapsai" />
                          </div>

                          <div className="bg-primary/5 p-6 rounded-[24px] border border-primary/10">
                            <label className="block text-xs font-medium uppercase tracking-widest text-primary/70 font-mono mb-2 flex items-center justify-between">
                               <span>Suskaičiuotas Plotas</span>
                               {formPlotas ? (
                                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse">Skaičiuojama iš GIS</span>
                               ) : null}
                            </label>
                            <div className="flex items-baseline gap-2">
                               <input type="text" readOnly value={formPlotas} className="block w-full bg-transparent border-0 p-0 text-[3rem] font-bold text-primary font-mono focus:ring-0 placeholder:text-primary/20 pointer-events-none" placeholder="0.00" />
                               <span className="text-lg font-mono font-bold text-primary/50">ha</span>
                            </div>
                            <p className="text-[0.6875rem] font-mono text-ink/40 mt-1 uppercase">Duomenys sinchronizuojami su vektoriniu plotu</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mygtukai Apačioje */}
                      <div className="p-8 pt-0 flex flex-col gap-3 mt-auto">
                        <button type="submit" disabled={isSubmitting || !formPlotas || formPlotas === "0"} className="w-full inline-flex items-center justify-center rounded-[32px] bg-gradient-to-br from-primary to-primary-container px-6 py-5 text-lg font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 disabled:opacity-30 transition-all font-sans">
                           {isSubmitting ? "Saugoma į debesį..." : "Išsaugoti GIS Lauką"}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full inline-flex justify-center rounded-[32px] bg-transparent px-6 py-4 text-sm font-bold text-ink/40 hover:text-ink transition-colors font-mono tracking-widest uppercase">
                          Atšaukti Procesą
                        </button>
                      </div>
                   </form>
                </div>

              </div>
          </div>
        </div>
      )}

    </div>
  );
}
