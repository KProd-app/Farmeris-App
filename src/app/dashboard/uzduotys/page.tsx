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

    // Uzės užklausa atsakinga už konkrečiam darbuotojui priskirtas užduotis
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
    return <div className="p-8 text-gray-500">Tikrinamos teisės...</div>;
  }

  // Atskiriame užduotis pagal statusą lengvesniam rūšiavimui
  const aktyviosUzduotys = uzduotys.filter(u => u.statusas !== "Atlikta");
  const atliktosUzduotys = uzduotys.filter(u => u.statusas === "Atlikta");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900">Mano Užduotys</h1>
        <p className="mt-1 text-sm text-gray-500">Čia matote visus jums deleguotus darbus.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
           <div className="flex flex-col items-center">
               <svg className="animate-spin h-8 w-8 text-emerald-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="text-gray-500 text-sm">Kraunama...</span>
           </div>
        </div>
      ) : uzduotys.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Atsipūskite!</h3>
            <p className="mt-1 text-sm text-gray-500">Šiuo metu neturite jokių priskirtų užduočių.</p>
          </div>
      ) : (
          <div className="space-y-8">
            
            {/* AKTYVIOS UŽDUOTYS */}
            {aktyviosUzduotys.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-emerald-800 mb-4 border-l-4 border-emerald-500 pl-3">Laukiančios Užduotys</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {aktyviosUzduotys.map(uzduotis => (
                    <div key={uzduotis.id} className="bg-white overflow-hidden shadow rounded-xl border border-emerald-100/50 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                           <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                             {uzduotis.statusas}
                           </span>
                           <span className="text-xs text-gray-500 font-medium">Iki: <time dateTime={uzduotis.data}>{uzduotis.data}</time></span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{uzduotis.pavadinimas}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                          <svg className="mr-1.5 h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{uzduotis.laukoPavadinimas}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-100">
                        <button
                          onClick={() => handleCompleteTask(uzduotis.id)}
                          className="w-full inline-flex justify-center items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Pažymėti kaip atliktą
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
                <h2 className="text-base font-semibold text-gray-500 mb-4 border-l-4 border-gray-300 pl-3">Atliktos Užduotys (Istorija)</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {atliktosUzduotys.map(uzduotis => (
                    <div key={uzduotis.id} className="bg-gray-50 overflow-hidden shadow-sm rounded-xl border border-gray-200 opacity-75">
                      <div className="px-4 py-5 sm:p-5">
                        <div className="flex items-center justify-between mb-2">
                           <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                             {uzduotis.statusas}
                           </span>
                           <span className="text-xs text-gray-400">Atlikta</span>
                        </div>
                        <h3 className="text-md font-medium text-gray-700 line-through decoration-gray-400">{uzduotis.pavadinimas}</h3>
                        <p className="text-sm text-gray-500 mt-1">{uzduotis.laukoPavadinimas}</p>
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
