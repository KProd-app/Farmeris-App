"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Darbas {
  id: string;
  pavadinimas: string;
  laukoPavadinimas: string;
  data: string;
  statusas: string;
  farmerId: string;
}

export default function UzduotysPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [uzduotys, setUzduotys] = useState<Darbas[]>([]);
  const [loading, setLoading] = useState(true);

  // Apsauga (RBAC) - tik "worker" rolei
  useEffect(() => {
    if (userData && userData.role !== "worker") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  // Duomenų nuskaitymas
  useEffect(() => {
    if (!user) return;

    // Užklausos atsakomybė tik priskirtam darbuotojui
    const q = query(
      collection(db, "darbai"), 
      where("assignedWorkerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const gautosUzduotys: Darbas[] = [];
      querySnapshot.forEach((doc) => {
        gautosUzduotys.push({
          id: doc.id,
          ...doc.data()
        } as Darbas);
      });
      
      // Rūšiuoti pagal datą
      gautosUzduotys.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      setUzduotys(gautosUzduotys);
      setLoading(false);
    }, (error) => {
      console.error("Klaida gaunant užduotis:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Funkcija užbaigti užduotį
  const handleCompleteTask = async (taskId: string) => {
    if(confirm("Ar tikrai norite pažymėti šią užduotį kaip atliktą?")) {
      try {
        await updateDoc(doc(db, "darbai", taskId), {
          statusas: "Atlikta"
        });
      } catch (error) {
        console.error("Klaida atnaujinant užduoties statusą:", error);
        alert("Įvyko klaida.");
      }
    }
  };

  if (!userData || userData.role !== "worker") {
    return <div className="p-8 text-ink font-mono text-sm opacity-50">Tikrinamos teisės...</div>;
  }

  // Atskiriame užduotis pagal statusą lengvesniam rūšiavimui
  const aktyviosUzduotys = uzduotys.filter(u => u.statusas !== "Atlikta");
  const atliktosUzduotys = uzduotys.filter(u => u.statusas === "Atlikta");

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-[3.5rem] leading-none font-bold text-ink tracking-tight">Mano Darbai</h1>
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Čia matote visus jums deleguotus darbus.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
            <span className="font-mono text-ink/40 animate-pulse text-sm uppercase tracking-widest">Ieškoma užduočių...</span>
        </div>
      ) : uzduotys.length === 0 ? (
          <div className="bg-surface-container-low p-20 text-center rounded-[32px]">
             <h3 className="text-xl font-semibold text-ink">Atsipūskite!</h3>
             <p className="mt-2 text-ink/60">Šiuo metu neturite jokių priskirtų užduočių.</p>
          </div>
      ) : (
          <div className="space-y-12">
            
            {/* AKTYVIOS UŽDUOTYS */}
            {aktyviosUzduotys.length > 0 && (
              <div>
                <h2 className="text-xl font-bold font-sans mb-6 text-ink">Laukiančios Užduotys</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aktyviosUzduotys.map(uzduotis => (
                    <div key={uzduotis.id} className="bg-surface p-6 rounded-[32px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] flex flex-col justify-between transition-all hover:-translate-y-1 group">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-widest uppercase font-sans bg-secondary-container text-on-secondary-container">
                             {uzduotis.statusas}
                           </span>
                           <time dateTime={uzduotis.data} className="text-xs text-ink/50 font-mono font-medium">Iki: {uzduotis.data}</time>
                        </div>
                        <h3 className="text-2xl font-bold text-ink tracking-tight mb-2">{uzduotis.pavadinimas}</h3>
                        <div className="flex items-center text-sm text-ink/60 mt-3 bg-surface-container-lowest p-3 rounded-[16px] border border-surface-container-highest/20 font-mono">
                          <svg className="mr-2 h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{uzduotis.laukoPavadinimas}</span>
                        </div>
                      </div>
                      
                      <div className="mt-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCompleteTask(uzduotis.id)}
                          className="w-full inline-flex justify-center items-center rounded-[32px] bg-primary px-4 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 transition-all font-sans"
                        >
                          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Užbaigti darbą
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATLIKTOS UŽDUOTYS */}
            {atliktosUzduotys.length > 0 && (
              <div>
                <h2 className="text-xl font-bold font-sans mb-6 text-ink/40">Atliktos Užduotys (Istorija)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {atliktosUzduotys.map(uzduotis => (
                    <div key={uzduotis.id} className="bg-surface-container-lowest p-6 rounded-[32px] border border-surface-container-highest/20 opacity-70">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-widest uppercase font-sans bg-surface-container-highest text-ink/50">
                             {uzduotis.statusas}
                           </span>
                           <span className="text-xs text-ink/40 font-mono font-medium">Atlikta</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink/60 tracking-tight line-through decoration-ink/20">{uzduotis.pavadinimas}</h3>
                        <p className="text-sm font-mono text-ink/40 mt-2">{uzduotis.laukoPavadinimas}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
      )}
    </div>
  );
}
