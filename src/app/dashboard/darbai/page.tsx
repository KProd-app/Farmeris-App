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
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Laukas {
  id: string;
  pavadinimas: string;
}

interface Darbuotojas {
  uid: string;
  email: string;
}

interface Darbas {
  id: string;
  pavadinimas: string;
  laukasId: string;
  laukoPavadinimas: string;
  assignedWorkerId: string;
  assignedWorkerEmail: string;
  data: string;
  statusas: string;
  createdAt: any;
}

export default function DarbaiPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  // Esami darbai
  const [darbai, setDarbai] = useState<Darbas[]>([]);
  
  // Parsekamos reikšmės skirtos Select Formoms
  const [laukaiList, setLaukaiList] = useState<Laukas[]>([]);
  const [darbuotojaiList, setDarbuotojaiList] = useState<Darbuotojas[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Formos būsena
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formLaukasId, setFormLaukasId] = useState("");
  const [formWorkerId, setFormWorkerId] = useState("");
  const [formData, setFormData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RBAC Apsauga
  useEffect(() => {
    if (userData && userData.role !== "farmer") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  // Duomenų nuskaitymas: Darbai, Darbuotojai, Laukai
  useEffect(() => {
    if (!user) return;

    // 1. Gauname laukus formos Select langeliui
    const fetchLaukai = async () => {
      const q = query(collection(db, "laukai"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, pavadinimas: doc.data().pavadinimas }));
      setLaukaiList(data);
    };

    // 2. Gauname visus darbuotojus (Dabar: Globalus. Ateityje - pagal sutarčių/priskyrimų sistemą)
    const fetchDarbuotojai = async () => {
      const q = query(collection(db, "users"), where("role", "==", "worker"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ uid: doc.id, email: doc.data().email }));
      setDarbuotojaiList(data);
    };

    fetchLaukai();
    fetchDarbuotojai();

    // 3. Klausomės užduočių pokyčių
    const qTask = query(collection(db, "darbai"), where("farmerId", "==", user.uid));
    const unsubscribe = onSnapshot(qTask, (querySnapshot) => {
      const darbaiData: Darbas[] = [];
      querySnapshot.forEach((doc) => {
        darbaiData.push({
          id: doc.id,
          ...doc.data()
        } as Darbas);
      });
      // Rūšiuoti pagal datą (naujausi viršuje)
      darbaiData.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      setDarbai(darbaiData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!formLaukasId || !formWorkerId) {
      alert("Prašome pasirinkti Lauką ir Darbuotoją.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Surandame priskirto lauko bei darbuotojo pavadinimus atvaizdavimui
      const pasirinktasLaukas = laukaiList.find(l => l.id === formLaukasId)?.pavadinimas || "Nežinomas laukas";
      const pasirinktasDarbuotojas = darbuotojaiList.find(d => d.uid === formWorkerId)?.email || "Nežinomas el. paštas";

      await addDoc(collection(db, "darbai"), {
        farmerId: user.uid,
        pavadinimas: formPavadinimas,
        laukasId: formLaukasId,
        laukoPavadinimas: pasirinktasLaukas,
        assignedWorkerId: formWorkerId,
        assignedWorkerEmail: pasirinktasDarbuotojas,
        data: formData,
        statusas: "Planuojama",
        createdAt: serverTimestamp()
      });
      
      // Išvalome ir uždarome
      setFormPavadinimas("");
      setFormLaukasId("");
      setFormWorkerId("");
      setFormData("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Nepavyko sukurti užduoties:", error);
      alert("Klaida kuriant užduotį.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData || userData.role !== "farmer") {
      return <div className="p-8 text-gray-500">Tikrinamos teisės...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ūkio Darbai ir Užduotys</h1>
          <p className="mt-1 text-sm text-gray-500">Paskirstykite konkrečius darbus savo darbuotojams laukuose.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Sukurti užduotį
        </button>
      </div>

      {loading ? (
          <div className="bg-white p-8 rounded-lg shadow border border-gray-100 flex justify-center">
              <span className="text-gray-500 animate-pulse">Kraunamas sąrašas...</span>
          </div>
      ) : darbai.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow border border-gray-100">
             <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
             </svg>
             <h3 className="mt-2 text-sm font-semibold text-gray-900">Užduočių kol kas nėra</h3>
             <p className="mt-1 text-sm text-gray-500">Spustelėkite viršuje „Sukurti užduotį“, kad pradėtumėte eismo kontrolę.</p>
          </div>
      ) : (
          <div className="overflow-hidden bg-white shadow sm:rounded-md border border-gray-100">
            <ul role="list" className="divide-y divide-gray-200">
              {darbai.map((darbas) => (
                <li key={darbas.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-emerald-600">{darbas.pavadinimas}</p>
                      <div className="ml-2 flex flex-shrink-0">
                        <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${darbas.statusas === 'Atlikta' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {darbas.statusas}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Laukas: {darbas.laukoPavadinimas}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Kam: {darbas.assignedWorkerEmail}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.75 2a.75.75 0 011.5 0v1.5h5.5V2a.75.75 0 011.5 0v1.5h1.25A2.25 2.25 0 0117.75 5.75v10.5A2.25 2.25 0 0115.5 18.5h-11A2.25 2.25 0 012.25 16.25V5.75A2.25 2.25 0 014.5 3.5h1.25V2zM16.25 5.75h-12v10.5c0 .414.336.75.75.75h11a.75.75 0 00.75-.75V5.75z" clipRule="evenodd" />
                        </svg>
                        <p>Atlikti iki: <time dateTime={darbas.data}>{darbas.data}</time></p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
      )}

      {/* Užduoties kūrimo modalas */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                <form onSubmit={handleCreateTask}>
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div>
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4 border-b pb-2">Priskirti naują darbą</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Užduoties pavadinimas</label>
                          <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm" placeholder="Pv. Kukurūzų sėjimas" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Laukas</label>
                          <select required value={formLaukasId} onChange={(e) => setFormLaukasId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm">
                            <option value="" disabled>-- Pasirinkite lauką --</option>
                            {laukaiList.map(l => (
                               <option key={l.id} value={l.id}>{l.pavadinimas}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Priskirtas Darbuotojas</label>
                          <select required value={formWorkerId} onChange={(e) => setFormWorkerId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm">
                            <option value="" disabled>-- Pasirinkite darbuotoją --</option>
                            {darbuotojaiList.map(w => (
                               <option key={w.uid} value={w.uid}>{w.email}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Įvykdymo Data</label>
                          <input type="date" required value={formData} onChange={(e) => setFormData(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Statusas</label>
                          <input type="text" disabled value="Planuojama" className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 py-2 px-3 shadow-sm sm:text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" disabled={isSubmitting} className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto disabled:opacity-70">
                       {isSubmitting ? "Saugoma..." : "Patvirtinti ir priskirti"}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
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
