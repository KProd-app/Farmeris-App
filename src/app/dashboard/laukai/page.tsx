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

// Duomenų bazės įrašo interfeisas
interface Laukas {
  id: string;
  pavadinimas: string;
  plotas: number;
  kultura: string;
  createdAt?: any;
}

export default function LaukaiPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [laukai, setLaukai] = useState<Laukas[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modalinio lango būsenos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formPlotas, setFormPlotas] = useState("");
  const [formKultura, setFormKultura] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Apsauga (RBAC) - tik "farmer" rolei
  useEffect(() => {
    if (userData && userData.role !== "farmer") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  // 2. Duomenų nuskaitymas realiu laiku
  useEffect(() => {
    if (!user) return;

    // Uzės užklausa, atrenkanti tik šio ūkininko laukus
    const q = query(
      collection(db, "laukai"), 
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const laukaiData: Laukas[] = [];
      querySnapshot.forEach((doc) => {
        laukaiData.push({
          id: doc.id,
          ...doc.data()
        } as Laukas);
      });
      // Jei norime išrūšiuoti, galime padaryti kliento pusėje
      laukaiData.sort((a, b) => a.pavadinimas.localeCompare(b.pavadinimas));
      setLaukai(laukaiData);
      setLoading(false);
    }, (error) => {
      console.error("Klaida gaunant laukus:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Lauko pridėjimo logika
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
        createdAt: serverTimestamp()
      });
      
      // Išvalome formą
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

  // 4. Lauko trynimo logika
  const handleDelete = async (id: string) => {
    if (confirm("Ar tikrai norite ištrinti šį lauką? Atkurti nebus įmanoma.")) {
      try {
        await deleteDoc(doc(db, "laukai", id));
      } catch (error) {
        console.error("Nepavyko ištrinti lauko:", error);
        alert("Įvyko klaida trinant lauką.");
      }
    }
  };

  // Neleidžiame renderinti puslapio, jei kraunasi arba jei neturi rolės
  if (!userData || userData.role !== "farmer") {
    return <div className="p-8 text-gray-500 animate-pulse">Tikrinamos teisės...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mano Laukai</h1>
          <p className="mt-1 text-sm text-gray-500">Valdykite savo ūkio žemės ūkio technikos ir kultūrų plotus.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Pridėti naują lauką
        </button>
      </div>

      {/* Laukų sąrašas / lentelė */}
      <div className="bg-white px-4 py-5 sm:p-6 shadow sm:rounded-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center p-8">
             <div className="flex flex-col items-center">
                 <svg className="animate-spin h-8 w-8 text-emerald-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <span className="text-gray-500 text-sm">Kraunami laukai...</span>
             </div>
          </div>
        ) : laukai.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nėra sukurtų laukų</h3>
            <p className="mt-1 text-sm text-gray-500">Pradėkite pridėdami savo pirmąjį žemės ūkio plotą.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center rounded-md bg-emerald-60 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                Pridėti lauką
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Pavadinimas
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Plotas (ha)
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Kultūra
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 w-24">
                    <span className="sr-only">Veiksmai</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {laukai.map((laukas) => (
                  <tr key={laukas.id} className="hover:bg-gray-50 group">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {laukas.pavadinimas}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {laukas.plotas} ha
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {laukas.kultura}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button
                        onClick={() => handleDelete(laukas.id)}
                        className="text-red-500 hover:text-red-700 rounded p-1 hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100"
                        title="Ištrinti lauką"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modalinis langas */}
      {isModalOpen && (
        <div className="relative z-50">
          {/* Fonas */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                <form onSubmit={handleAddField}>
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                          Pridėti naują lauką
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label htmlFor="pavadinimas" className="block text-sm font-medium text-gray-700">Pavadinimas</label>
                            <input
                              type="text"
                              required
                              id="pavadinimas"
                              value={formPavadinimas}
                              onChange={(e) => setFormPavadinimas(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border py-2 px-3 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                              placeholder="Pvz. Vakarinis laukas"
                            />
                          </div>
                          <div>
                            <label htmlFor="plotas" className="block text-sm font-medium text-gray-700">Plotas (ha)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              id="plotas"
                              value={formPlotas}
                              onChange={(e) => setFormPlotas(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border py-2 px-3 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                              placeholder="Spauskite arba veskite skaičių"
                            />
                          </div>
                          <div>
                            <label htmlFor="kultura" className="block text-sm font-medium text-gray-700">Kultūra</label>
                            <input
                              type="text"
                              required
                              id="kultura"
                              value={formKultura}
                              onChange={(e) => setFormKultura(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border py-2 px-3 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                              placeholder="Pvz. Žieminiai kviečiai"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto disabled:opacity-70"
                    >
                      {isSubmitting ? "Išsaugoma..." : "Išsaugoti"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Atšaukti
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
