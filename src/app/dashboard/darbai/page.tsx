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
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Laukas {
  id: string;
  pavadinimas: string;
  plotas: number;
}

interface Darbuotojas {
  uid: string;
  email: string;
}

interface SandelisItem {
  id: string;
  pavadinimas: string;
  vienetas: string;
  vienetoKaina?: number;
}

interface SandelioSanaudos {
  sandelisItemId: string;
  pavadinimas: string;
  kiekis: number;
  vienetas: string;
  vienetoKaina: number; // to calculate total price at completion
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
  sandelioSanaudos?: SandelioSanaudos;
}

function getCalendarDays(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  const firstDay = date.getDay();
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    days.push(null);
  }
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function DarbaiPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const [darbai, setDarbai] = useState<Darbas[]>([]);
  const [laukaiList, setLaukaiList] = useState<Laukas[]>([]);
  const [darbuotojaiList, setDarbuotojaiList] = useState<Darbuotojas[]>([]);
  const [sandelioList, setSandelioList] = useState<SandelisItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formLaukasId, setFormLaukasId] = useState("");
  const [formWorkerId, setFormWorkerId] = useState(""); 
  const [formData, setFormData] = useState("");
  
  // Sandelio info
  const [formSandelioId, setFormSandelioId] = useState("");
  const [formNorma, setFormNorma] = useState(""); // per hectare
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar State
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    if (userData && userData.role !== "farmer") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  useEffect(() => {
    if (!user) return;

    const fetchLaukai = async () => {
      const q = query(collection(db, "laukai"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, pavadinimas: doc.data().pavadinimas, plotas: doc.data().plotas || 0 }));
      setLaukaiList(data);
    };

    const fetchDarbuotojai = async () => {
      const q = query(collection(db, "users"), where("role", "==", "worker"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ uid: doc.id, email: doc.data().email }));
      setDarbuotojaiList(data);
    };

    const fetchSandelis = async () => {
      const q = query(collection(db, "sandelis"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, pavadinimas: doc.data().pavadinimas, vienetas: doc.data().vienetas, vienetoKaina: doc.data().vienetoKaina || 0 }));
      setSandelioList(data);
    };

    fetchLaukai();
    fetchDarbuotojai();
    fetchSandelis();

    const qTask = query(collection(db, "darbai"), where("farmerId", "==", user.uid));
    const unsubscribe = onSnapshot(qTask, (querySnapshot) => {
      const darbaiData: Darbas[] = [];
      querySnapshot.forEach((doc) => {
        darbaiData.push({ id: doc.id, ...doc.data() } as Darbas);
      });
      darbaiData.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      setDarbai(darbaiData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const pasirinktasLaukasObj = laukaiList.find(l => l.id === formLaukasId);
  const pasirinktasSandelisObj = sandelioList.find(s => s.id === formSandelioId);
  
  const paskaiciuotasKiekis = (pasirinktasLaukasObj && formNorma) 
    ? (pasirinktasLaukasObj.plotas * Number(formNorma)).toFixed(2)
    : "0.00";

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!formLaukasId) {
      alert("Prašome pasirinkti Lauką.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isAssignedToSelf = !formWorkerId || formWorkerId === user.uid;
      const actualWorkerId = isAssignedToSelf ? user.uid : formWorkerId;
      const actualWorkerEmail = isAssignedToSelf ? userData?.email : darbuotojaiList.find(d => d.uid === formWorkerId)?.email;
  
      let sanaudos: SandelioSanaudos | null = null;
      if (pasirinktasSandelisObj && paskaiciuotasKiekis !== "0.00") {
        sanaudos = {
          sandelisItemId: pasirinktasSandelisObj.id,
          pavadinimas: pasirinktasSandelisObj.pavadinimas,
          kiekis: Number(paskaiciuotasKiekis),
          vienetas: pasirinktasSandelisObj.vienetas,
          vienetoKaina: pasirinktasSandelisObj.vienetoKaina || 0
        };
      }

      await addDoc(collection(db, "darbai"), {
        farmerId: user.uid,
        pavadinimas: formPavadinimas,
        laukasId: formLaukasId,
        laukoPavadinimas: pasirinktasLaukasObj?.pavadinimas || "Nežinomas laukas",
        assignedWorkerId: actualWorkerId,
        assignedWorkerEmail: actualWorkerEmail || "Aš (Asmeninis)",
        data: formData,
        statusas: "Planuojama",
        createdAt: serverTimestamp(),
        sandelioSanaudos: sanaudos
      });
      
      setFormPavadinimas("");
      setFormLaukasId("");
      setFormWorkerId("");
      setFormData("");
      setFormSandelioId("");
      setFormNorma("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Nepavyko sukurti užduoties:", error);
      alert("Klaida kuriant užduotį.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (task: Darbas) => {
    if (!user) return;
    if (confirm("Ar tikrai norite pažymėti šią užduotį kaip atliktą? (Tai nuskaičiuos resursus iš sandėlio ir pridės išlaidą)")) {
      try {
         const batch = writeBatch(db);
         
         // 1. Update task
         const taskRef = doc(db, "darbai", task.id);
         batch.update(taskRef, { statusas: "Atlikta" });

         // 2. Perform Sandėlis deduction and Finansai log if applicable
         if (task.sandelioSanaudos) {
            const sanaudos = task.sandelioSanaudos;
            
            // Deduct inventory
            const sandelisRef = doc(db, "sandelis", sanaudos.sandelisItemId);
            batch.update(sandelisRef, { kiekis: increment(-sanaudos.kiekis) });
            
            // Log to finansai if it has a price
            if (sanaudos.vienetoKaina > 0) {
               const finansaiRef = doc(collection(db, "finansai"));
               batch.set(finansaiRef, {
                 ownerId: user.uid,
                 pavadinimas: `Sunaudotos medžiagos: ${task.pavadinimas} (${sanaudos.pavadinimas})`,
                 tipas: "Išlaidos",
                 kategorija: "Sėklos/Trąšos",
                 suma: Number((sanaudos.kiekis * sanaudos.vienetoKaina).toFixed(2)),
                 data: new Date().toISOString().split('T')[0],
                 createdAt: serverTimestamp()
               });
            }
         }

         await batch.commit();
      } catch (e) {
         console.error("Klaida baigiant darbą", e);
         alert("Įvyko klaida atnaujinant duomenis.");
      }
    }
  };

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    else if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  if (!userData || userData.role !== "farmer") {
      return <div className="p-8 text-ink font-mono text-sm opacity-50">Autentifikuojama...</div>;
  }

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const monthNames = ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"];

  const aktyvusDarbai = darbai.filter(d => d.statusas !== "Atlikta");
  const istorijaDarbai = darbai.filter(d => d.statusas === "Atlikta");

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-[3.5rem] leading-none font-bold text-ink tracking-tight">Darbai</h1>
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Planuokite savo ūkio užduotis, sėją ir technikų eismą.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-highest p-1 rounded-[24px]">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-5 py-2.5 rounded-[20px] text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-surface shadow-[0_4px_16px_rgba(26,28,25,0.06)] text-ink' : 'text-ink/60 hover:text-ink'}`}
            >
              Sąrašas
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-5 py-2.5 rounded-[20px] text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-surface shadow-[0_4px_16px_rgba(26,28,25,0.06)] text-ink' : 'text-ink/60 hover:text-ink'}`}
            >
              Kalendorius
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-[32px] bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 transition-all ml-2"
          >
            Sukurti užduotį
          </button>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center p-20">
              <span className="font-mono text-ink/40 animate-pulse text-sm uppercase tracking-widest">Kraunama...</span>
          </div>
      ) : (
        viewMode === 'list' ? (
          <>
            {darbai.length === 0 ? (
                <div className="bg-surface-container-low p-20 text-center rounded-[32px]">
                   <h3 className="text-xl font-semibold text-ink">Nėra jokių planų</h3>
                   <p className="mt-2 text-ink/60">Gamtos ritmas laukia. Sukurkite pirmąją užduotį.</p>
                </div>
            ) : (
              <div className="space-y-12">
                <div>
                   <h2 className="text-xl font-bold font-sans mb-6 text-ink">Aktyvūs Darbai</h2>
                   <div className="bg-surface-container-low p-4 sm:p-8 rounded-[32px] flex flex-col gap-4">
                     {aktyvusDarbai.map((darbas) => (
                       <div key={darbas.id} className="bg-surface px-6 py-6 rounded-[24px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:-translate-y-0.5 group">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[0.6875rem] font-bold tracking-widest uppercase font-sans bg-secondary-container text-on-secondary-container">
                                 {darbas.statusas}
                              </span>
                              <time dateTime={darbas.data} className="font-mono text-[0.875rem] text-ink/50 bg-surface-container-low px-2 py-1 rounded-md">
                                 {darbas.data}
                              </time>
                           </div>
                           <h3 className="text-xl font-bold text-ink mb-1">{darbas.pavadinimas}</h3>
                           
                           {darbas.sandelioSanaudos && (
                              <p className="text-xs text-ink/40 font-mono mt-1">Numatoma išeiga: {darbas.sandelioSanaudos.kiekis} {darbas.sandelioSanaudos.vienetas} ({darbas.sandelioSanaudos.pavadinimas})</p>
                           )}
                         </div>
                         
                         <div className="flex flex-col sm:items-end gap-1 font-mono text-[0.875rem]">
                           <p className="text-ink/60">Laukas: <span className="text-ink font-bold">{darbas.laukoPavadinimas}</span></p>
                           <p className="text-ink/60">Vykdo: <span className="text-ink font-bold">{darbas.assignedWorkerEmail}</span></p>
                           
                           <button onClick={() => handleCompleteTask(darbas)} className="mt-3 w-full sm:w-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-xs px-4 py-2 rounded-full font-bold uppercase tracking-widest hover:bg-primary/90">
                              Užbaigti Darbą
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {istorijaDarbai.length > 0 && (
                   <div>
                      <h2 className="text-xl font-bold font-sans mb-6 text-ink/40">Istorija</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {istorijaDarbai.map(darbas => (
                           <div key={darbas.id} className="bg-surface-container-lowest p-6 rounded-[24px] border border-surface-container-highest/30 opacity-60">
                             <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-container-highest px-2 py-1 rounded text-ink/50">Atlikta</span>
                               <span className="text-xs font-mono text-ink/50">{darbas.data}</span>
                             </div>
                             <h4 className="font-bold text-ink/60 line-through decoration-ink/20">{darbas.pavadinimas}</h4>
                           </div>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-surface-container-low p-6 sm:p-10 rounded-[32px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-sans">{monthNames[currentMonth]} <span className="font-mono font-normal opacity-50">{currentYear}</span></h2>
              <div className="flex gap-2">
                 <button onClick={() => changeMonth(-1)} className="p-3 bg-surface rounded-full shadow-[0_4px_16px_rgba(26,28,25,0.04)] hover:bg-surface-container-highest transition-colors">←</button>
                 <button onClick={() => changeMonth(1)} className="p-3 bg-surface rounded-full shadow-[0_4px_16px_rgba(26,28,25,0.04)] hover:bg-surface-container-highest transition-colors">→</button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'].map(d => (
                <div key={d} className="text-center font-mono text-[0.6875rem] uppercase tracking-widest text-ink/40 pb-4">{d}</div>
              ))}
              
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="h-24 sm:h-32 opacity-0"></div>;
                
                const dateStr = date.toISOString().split('T')[0];
                const dayTasks = darbai.filter(d => d.data === dateStr);
                const isToday = dateStr === today.toISOString().split('T')[0];

                return (
                  <div key={dateStr} className={`h-24 sm:h-32 p-2 sm:p-3 rounded-[16px] flex flex-col ${isToday ? 'bg-primary-container/10 ring-1 ring-primary/20' : 'bg-surface'}`}>
                    <span className={`font-mono text-sm ${isToday ? 'text-primary font-bold' : 'text-ink/60'}`}>{date.getDate()}</span>
                    <div className="mt-auto flex flex-col gap-1 overflow-hidden">
                      {dayTasks.map(t => (
                         <div key={t.id} className={`text-[10px] sm:text-xs truncate px-1.5 py-0.5 rounded ${t.statusas === 'Atlikta' ? 'bg-surface-container-highest text-ink/40' : 'bg-secondary-container/80 text-on-secondary-container'}`}>
                           {t.pavadinimas}
                         </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-surface-container-highest/70 backdrop-blur-[24px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[32px] bg-surface text-left shadow-[0_24px_80px_rgba(26,28,25,0.12)] transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                
                <form onSubmit={handleCreateTask} className="flex flex-col">
                  <div className="px-8 pt-8 pb-6 bg-surface">
                    <h3 className="text-2xl font-bold text-ink mb-6">Nauja užduotis</h3>
                    
                    {/* Bazinė Informacija */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Pavadinimas</label>
                          <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans" placeholder="Pv. Kukurūzų sėjimas" />
                        </div>

                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Pasirinkite Lauką</label>
                          <select required value={formLaukasId} onChange={(e) => setFormLaukasId(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                            <option value="" disabled>-- Visi laukai --</option>
                            {laukaiList.map(l => (
                               <option key={l.id} value={l.id}>{l.pavadinimas} ({l.plotas} ha)</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Įvykdymo Data</label>
                          <input type="date" required value={formData} onChange={(e) => setFormData(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink font-mono focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sandėlio Susiejimas */}
                  <div className="px-8 py-6 bg-surface-container-low border-y border-surface-container-highest/20 relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                     <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70 font-mono mb-4">Išeiga iš sandėlio (Neprivaloma)</h4>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Susieti su preke</label>
                          <select value={formSandelioId} onChange={(e) => setFormSandelioId(e.target.value)} className="block w-full rounded-[24px] bg-surface border border-surface-container-highest py-3 px-5 text-ink focus:ring-0 focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                            <option value="">Nepriskirta (Tik darbas)</option>
                            {sandelioList.map(s => (
                               <option key={s.id} value={s.id}>{s.pavadinimas} (Likutis: {s.vienetas})</option>
                            ))}
                          </select>
                        </div>

                        {formSandelioId && (
                           <div>
                             <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2 flex justify-between">
                               <span>Norma 1 Hektarui</span>
                               <span className="text-primary font-bold">{pasirinktasSandelisObj?.vienetas}/ha</span>
                             </label>
                             <input type="number" step="any" value={formNorma} onChange={(e) => setFormNorma(e.target.value)} className="block w-full rounded-[24px] bg-surface border border-surface-container-highest py-3 px-5 text-primary text-xl font-bold focus:ring-0 focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-mono" placeholder="0" />
                           </div>
                        )}
                     </div>

                     {formSandelioId && pasirinktasLaukasObj && formNorma && (
                        <div className="mt-4 p-4 rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-between relative z-10 animate-fade-in-up">
                           <div>
                             <span className="block text-[10px] uppercase tracking-widest font-mono text-primary/70 font-semibold mb-1">Apskaičiuota ERP Išeiga {pasirinktasLaukasObj.plotas} ha laukui</span>
                             <span className="block text-lg font-bold font-sans text-primary">Automatiškai nuskaičiuos užbaigus</span>
                           </div>
                           <div className="text-right">
                             <span className="text-2xl font-mono font-bold text-primary">{paskaiciuotasKiekis}</span>
                             <span className="text-sm font-mono text-primary/50 ml-1">{pasirinktasSandelisObj?.vienetas}</span>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Delegavimas ir Užbaigimas */}
                  <div className="px-8 pt-6 pb-6 bg-surface">
                     <div className="mb-8">
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Deleguoti komandai (Neprivaloma)</label>
                        <select value={formWorkerId} onChange={(e) => setFormWorkerId(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                          <option value="">Aš pats (Asmeninė užduotis)</option>
                          {darbuotojaiList.map(w => (
                             <option key={w.uid} value={w.uid}>{w.email}</option>
                          ))}
                        </select>
                     </div>

                     <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-[32px]">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex justify-center rounded-[32px] bg-surface-container-highest px-6 py-4 text-sm font-semibold text-ink/70 hover:text-ink transition-colors">
                         Atšaukti
                       </button>
                       <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-[32px] bg-gradient-to-br from-primary to-primary-container px-8 py-4 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 disabled:opacity-50 transition-all">
                          {isSubmitting ? "Saugoma..." : "Išsaugoti Darbą"}
                       </button>
                     </div>
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
