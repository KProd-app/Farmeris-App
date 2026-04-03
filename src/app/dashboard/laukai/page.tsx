"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

interface Laukas {
  id: string;
  pavadinimas: string;
  plotas: number;
  kultura: string;
  geoData?: any; // Naujas laukas GPS integracijai ateityje
  createdAt?: any;
}

export default function LaukaiPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [laukai, setLaukai] = useState<Laukas[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modalo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formPlotas, setFormPlotas] = useState("");
  const [formKultura, setFormKultura] = useState("");
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

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "laukai"), {
        ownerId: user.uid,
        pavadinimas: formPavadinimas,
        plotas: parseFloat(formPlotas),
        kultura: formKultura,
        geoData: null, // Pamatai žemėlapio braižymui vėliau
        createdAt: serverTimestamp()
      });
      
      setFormPavadinimas("");
      setFormPlotas("");
      setFormKultura("");
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
        alert("Įvyko klaida.");
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
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Jūsų dirbamos žemės plotai, kultūros ir būsimas GPS žemėlapis.</p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-[32px] bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 transition-all"
          >
            Pridėti Lauką
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
             <p className="mt-2 text-ink/60">Pirmiausia pridėkite lauką, kurį dirbate ar planuojate dirbti.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {laukai.map((laukas) => (
            <div key={laukas.id} className="bg-surface rounded-[32px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] overflow-hidden flex flex-col group">
              
              {/* GIS Žemėlapio Placeholderis */}
              <div className="h-48 bg-surface-container-highest relative flex items-center justify-center overflow-hidden">
                {/* Tinklo ornamentas iliustruojantis grid/map */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--color-surface-container-lowest) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.2 }}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                   <div className="p-3 bg-white/50 backdrop-blur-md rounded-full shadow-sm mb-2 text-primary">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                   </div>
                   <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Gps integracija ruošiama</span>
                </div>
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
                       <span className="font-mono text-xs uppercase tracking-widest text-ink/40">Hektarai</span>
                    </div>
                 </div>

                 {/* Mygtukai / Veiksmai */}
                 <div className="flex justify-end pt-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                       onClick={() => handleDelete(laukas.id)}
                       className="bg-secondary/10 px-6 py-2.5 rounded-[20px] text-xs font-bold font-mono tracking-widest uppercase text-secondary hover:bg-secondary hover:text-white transition-colors"
                    >
                      Ištrinti Lauką
                    </button>
                 </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pridėjimo Modalas */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-surface-container-highest/70 backdrop-blur-[24px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[32px] bg-surface text-left shadow-[0_24px_80px_rgba(26,28,25,0.12)] transition-all sm:my-8 sm:w-full sm:max-w-xl">
                
                <form onSubmit={handleAddField} className="flex flex-col">
                  <div className="px-8 pt-8 pb-6">
                    <h3 className="text-2xl font-bold text-ink mb-6">Pridėti žemės sklypą</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Pavadinimas</label>
                        <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans" placeholder="Pvz. Prie tvenkinio" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Plotas (ha)</label>
                          <input type="number" step="0.01" min="0" required value={formPlotas} onChange={(e) => setFormPlotas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink font-mono focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" placeholder="0.00" />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Auganti Kultūra</label>
                          <input type="text" required value={formKultura} onChange={(e) => setFormKultura(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink font-sans focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" placeholder="Pvz. Rugiai" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-8 py-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-[32px]">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex justify-center rounded-[32px] bg-surface-container-highest px-6 py-4 text-sm font-semibold text-ink/70 hover:text-ink transition-colors">
                      Atšaukti
                    </button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-[32px] bg-gradient-to-br from-primary to-primary-container px-8 py-4 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 disabled:opacity-50 transition-all">
                       {isSubmitting ? "Saugoma..." : "Išsaugoti"}
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
