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

// Helpers for Calendar View
function getCalendarDays(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  // Get first day of month (0 = Sunday, we want 1 = Monday to be first, so some offset is nice, but let's stick to standard JS for simplicity 0=Sun)
  const firstDay = date.getDay();
  // Padding for previous month
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
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formLaukasId, setFormLaukasId] = useState("");
  const [formWorkerId, setFormWorkerId] = useState(""); // Default tuščia (priskirta sau)
  const [formData, setFormData] = useState("");
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
      const data = snap.docs.map(doc => ({ id: doc.id, pavadinimas: doc.data().pavadinimas }));
      setLaukaiList(data);
    };

    const fetchDarbuotojai = async () => {
      const q = query(collection(db, "users"), where("role", "==", "worker"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ uid: doc.id, email: doc.data().email }));
      setDarbuotojaiList(data);
    };

    fetchLaukai();
    fetchDarbuotojai();

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!formLaukasId) {
      alert("Prašome pasirinkti Lauką.");
      return;
    }

    setIsSubmitting(true);
    try {
      const pasirinktasLaukas = laukaiList.find(l => l.id === formLaukasId)?.pavadinimas || "Nežinomas laukas";
      
      // SOLO FARMER: Jei nepasirinkta kam priskirti, tuomet ūkininkas priskiria sau.
      const isAssignedToSelf = !formWorkerId || formWorkerId === user.uid;
      const actualWorkerId = isAssignedToSelf ? user.uid : formWorkerId;
      const actualWorkerEmail = isAssignedToSelf ? userData?.email : darbuotojaiList.find(d => d.uid === formWorkerId)?.email;

      await addDoc(collection(db, "darbai"), {
        farmerId: user.uid,
        pavadinimas: formPavadinimas,
        laukasId: formLaukasId,
        laukoPavadinimas: pasirinktasLaukas,
        assignedWorkerId: actualWorkerId,
        assignedWorkerEmail: actualWorkerEmail || "Aš (Asmeninis)",
        data: formData,
        statusas: "Planuojama",
        createdAt: serverTimestamp()
      });
      
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
      return <div className="p-8 text-ink font-mono text-sm opacity-50">Autentifikuojama seansą...</div>;
  }

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const monthNames = ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"];

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    else if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      
      {/* Header Be Linijų, Daug Erdvės */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-[3.5rem] leading-none font-bold text-ink tracking-tight">Darbai</h1>
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Planuokite savo ūkio užduotis, sėją ir technikų eismą.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Tab */}
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
                <div className="bg-surface-container-low p-4 sm:p-8 rounded-[32px] flex flex-col gap-4">
                  {darbai.map((darbas) => (
                    <div key={darbas.id} className="bg-surface px-6 py-5 rounded-[24px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:-translate-y-0.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           {/* Agro-Chip pvz */}
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.6875rem] font-medium tracking-wide uppercase font-sans ${darbas.statusas === 'Atlikta' ? 'bg-surface-container-highest text-ink/60' : 'bg-secondary-container text-on-secondary-container'}`}>
                              {darbas.statusas}
                           </span>
                           <time dateTime={darbas.data} className="font-mono text-[0.875rem] text-ink/50">
                              {darbas.data}
                           </time>
                        </div>
                        <h3 className="text-xl font-semibold text-ink">{darbas.pavadinimas}</h3>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-1 font-mono text-[0.875rem]">
                        <p className="text-ink/60">Laukas: <span className="text-ink">{darbas.laukoPavadinimas}</span></p>
                        <p className="text-ink/60">Vykdo: <span className="text-ink">{darbas.assignedWorkerEmail}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </>
        ) : (
          <div className="bg-surface-container-low p-6 sm:p-10 rounded-[32px]">
            {/* Calendar View */}
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

      {/* Glassmorphism Modalas */}
      {isModalOpen && (
        <div className="relative z-50">
          {/* Backdrop Blur effect for "The Digital Agronomist" style */}
          <div className="fixed inset-0 bg-surface-container-highest/70 backdrop-blur-[24px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[32px] bg-surface text-left shadow-[0_24px_80px_rgba(26,28,25,0.12)] transition-all sm:my-8 sm:w-full sm:max-w-xl">
                
                <form onSubmit={handleCreateTask} className="flex flex-col">
                  <div className="px-8 pt-8 pb-6">
                    <h3 className="text-2xl font-bold text-ink mb-6">Nauja užduotis</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Pavadinimas</label>
                        <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans" placeholder="Pv. Kukurūzų sėjimas" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Laukas</label>
                          <select required value={formLaukasId} onChange={(e) => setFormLaukasId(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                            <option value="" disabled>-- Laukas --</option>
                            {laukaiList.map(l => (
                               <option key={l.id} value={l.id}>{l.pavadinimas}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Įvykdymo Data</label>
                          <input type="date" required value={formData} onChange={(e) => setFormData(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink font-mono focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" />
                        </div>
                      </div>

                      <div>
                        {/* SOLO FARMER Pakeitimas: neprivalomas delegavimas */}
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Deleguoti (Neprivaloma)</label>
                        <select value={formWorkerId} onChange={(e) => setFormWorkerId(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                          <option value="">Aš (Asmeninė užduotis)</option>
                          {darbuotojaiList.map(w => (
                             <option key={w.uid} value={w.uid}>{w.email}</option>
                          ))}
                        </select>
                        <p className="text-[0.6875rem] mt-2 text-ink/40 font-mono">Palikite &quot;Aš&quot; jei darote pats.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Signature Gradient Footer */}
                  <div className="px-8 py-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-[32px]">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex justify-center rounded-[32px] bg-surface-container-highest px-6 py-4 text-sm font-semibold text-ink/70 hover:text-ink transition-colors">
                      Atšaukti
                    </button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-[32px] bg-gradient-to-br from-primary to-primary-container px-8 py-4 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 disabled:opacity-50 transition-all">
                       {isSubmitting ? "Saugoma..." : "Išsaugoti Darbą"}
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
