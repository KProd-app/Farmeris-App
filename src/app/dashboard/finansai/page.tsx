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
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Irasas {
  id: string;
  pavadinimas: string;
  tipas: "Pajamos" | "Išlaidos";
  kategorija: string;
  suma: number;
  data: string;
}

export default function FinansaiPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [irasai, setIrasai] = useState<Irasas[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [balansas, setBalansas] = useState(0);
  const [pajamosTotal, setPajamosTotal] = useState(0);
  const [islaidosTotal, setIslaidosTotal] = useState(0);

  // Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formTipas, setFormTipas] = useState<"Pajamos" | "Išlaidos">("Išlaidos");
  const [formKategorija, setFormKategorija] = useState("");
  const [formSuma, setFormSuma] = useState("");
  const [formData, setFormData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pajamuKategorijos = ["Derliaus pardavimas", "Subsidijos", "Nuoma", "Kita"];
  const istaiduKategorijos = ["Sėklos", "Trąšos", "Chemija", "Degalai", "Technikos remontas", "Atlyginimai", "Mokesčiai", "Kita"];

  useEffect(() => {
    if (userData && userData.role !== "farmer") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "finansai"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Irasas[] = [];
      let p_total = 0;
      let i_total = 0;

      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as Irasas;
        data.push(item);
        if (item.tipas === "Pajamos") {
          p_total += item.suma;
        } else {
          i_total += item.suma;
        }
      });

      // Rikiuoti nuo naujausio iki seniausio
      data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      setIrasai(data);
      setPajamosTotal(p_total);
      setIslaidosTotal(i_total);
      setBalansas(p_total - i_total);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const openForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(today);
    setFormTipas("Išlaidos");
    setFormKategorija("Degalai");
    setFormPavadinimas("");
    setFormSuma("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!formPavadinimas || !formSuma || !formData) {
      alert("Užpildykite visus laukus.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "finansai"), {
        ownerId: user.uid,
        pavadinimas: formPavadinimas,
        tipas: formTipas,
        kategorija: formKategorija,
        suma: Number(formSuma),
        data: formData,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Klaida:", error);
      alert("Nepavyko įtraukti įrašo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ar tikrai ištrinti šį finansinį įrašą?")) {
      await deleteDoc(doc(db, "finansai", id));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  if (!userData || userData.role !== "farmer") {
      return <div className="p-8 text-ink font-mono text-sm opacity-50">Autentifikuojama...</div>;
  }

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      
      {/* Header Be Linijų */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-[3.5rem] leading-none font-bold text-ink tracking-tight">Finansai</h1>
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Bendra ūkio pajamų ir išlaidų apskaita eurais (€).</p>
        </div>

        <div>
          <button
            onClick={openForm}
            className="inline-flex items-center justify-center rounded-[32px] bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 transition-all"
          >
            Pridėti įrašą
          </button>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center p-20">
              <span className="font-mono text-ink/40 animate-pulse text-sm uppercase tracking-widest">Skaičiuojama...</span>
          </div>
      ) : (
        <>
          {/* Svarbiausių rodiklių (KPI) blokai */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-surface-container-low p-6 rounded-[32px] flex flex-col justify-center">
               <span className="text-sm font-bold uppercase tracking-widest text-ink/50 font-sans mb-2">Pasipelnymas / Nuostolis</span>
               <span className={`text-[2rem] sm:text-[2.5rem] font-bold font-mono tracking-tight ${balansas >= 0 ? 'text-primary' : 'text-red-600'}`}>
                 {formatCurrency(balansas)}
               </span>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-[32px] flex flex-col justify-center">
               <span className="text-sm font-bold uppercase tracking-widest text-ink/50 font-sans mb-2">Visos Pajamos</span>
               <span className="text-2xl font-bold font-mono text-ink tracking-tight">
                 {formatCurrency(pajamosTotal)}
               </span>
            </div>

            <div className="bg-surface-container-low p-6 rounded-[32px] flex flex-col justify-center">
               <span className="text-sm font-bold uppercase tracking-widest text-ink/50 font-sans mb-2">Visos Išlaidos</span>
               <span className="text-2xl font-bold font-mono text-secondary tracking-tight">
                 {formatCurrency(islaidosTotal)}
               </span>
            </div>
          </div>

          {/* Išrašas / Lentelė */}
          <div>
            <h2 className="text-xl font-bold font-sans mb-6 text-ink">Paskutiniai atsiskaitymai</h2>
            
            {irasai.length === 0 ? (
                <div className="bg-surface-container-low p-16 text-center rounded-[32px]">
                   <h3 className="text-xl font-semibold text-ink">Tuščia</h3>
                   <p className="mt-2 text-ink/60">Jūsų finansų knyga kol kas tuščia.</p>
                </div>
            ) : (
                <div className="bg-surface rounded-[32px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans whitespace-nowrap">
                      <thead className="bg-surface-container-lowest text-xs uppercase tracking-widest font-mono text-ink/40">
                        <tr>
                          <th className="px-6 py-5 font-medium">Data</th>
                          <th className="px-6 py-5 font-medium">Pavadinimas</th>
                          <th className="px-6 py-5 font-medium">Kategorija</th>
                          <th className="px-6 py-5 font-medium text-right">Suma</th>
                          <th className="px-6 py-5 font-medium w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-lowest">
                        {irasai.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="px-6 py-5 font-mono text-sm text-ink/60">
                              {item.data}
                            </td>
                            <td className="px-6 py-5 font-semibold text-ink">
                              {item.pavadinimas}
                              <div className="sm:hidden mt-1 flex gap-2 items-center">
                                 <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.tipas === 'Pajamos' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-700'}`}>
                                    {item.tipas}
                                 </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-container-highest text-ink/70">
                                {item.kategorija}
                              </span>
                            </td>
                            <td className={`px-6 py-5 font-mono font-bold text-right ${item.tipas === 'Pajamos' ? 'text-primary' : 'text-ink'}`}>
                              {item.tipas === 'Pajamos' ? '+' : '-'}{formatCurrency(item.suma)}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button onClick={() => handleDelete(item.id)} className="text-secondary/50 hover:text-secondary transition-colors font-semibold text-xs uppercase tracking-widest">
                                Trinti
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            )}
          </div>
        </>
      )}

      {/* Pridėjimo Modalas */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-surface-container-highest/70 backdrop-blur-[24px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[32px] bg-surface text-left shadow-[0_24px_80px_rgba(26,28,25,0.12)] transition-all sm:my-8 sm:w-full sm:max-w-xl">
                
                <form onSubmit={handleSave} className="flex flex-col">
                  <div className="px-8 pt-8 pb-6">
                    <h3 className="text-2xl font-bold text-ink mb-6">Naujas įrašas</h3>
                    
                    <div className="space-y-6">
                      
                      {/* Tipas (Radio Toggle) */}
                      <div className="flex bg-surface-container-highest p-1 rounded-[24px]">
                        <button 
                          type="button"
                          onClick={() => { setFormTipas('Pajamos'); setFormKategorija(pajamuKategorijos[0]) }}
                          className={`flex-1 px-5 py-3 rounded-[20px] text-sm font-medium transition-all ${formTipas === 'Pajamos' ? 'bg-surface shadow-[0_4px_16px_rgba(26,28,25,0.06)] text-primary' : 'text-ink/60 hover:text-ink'}`}
                        >
                          Pajamos (+)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setFormTipas('Išlaidos'); setFormKategorija(istaiduKategorijos[0]) }}
                          className={`flex-1 px-5 py-3 rounded-[20px] text-sm font-medium transition-all ${formTipas === 'Išlaidos' ? 'bg-surface shadow-[0_4px_16px_rgba(26,28,25,0.06)] text-red-600' : 'text-ink/60 hover:text-ink'}`}
                        >
                          Išlaidos (-)
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Aprašymas</label>
                        <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans" placeholder="Pv. Traktoriaus tepalai" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Kategorija</label>
                          <select required value={formKategorija} onChange={(e) => setFormKategorija(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                            {(formTipas === 'Pajamos' ? pajamuKategorijos : istaiduKategorijos).map(kat => (
                               <option key={kat} value={kat}>{kat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Data</label>
                          <input type="date" required value={formData} onChange={(e) => setFormData(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink font-mono focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Suma (€)</label>
                        <div className="relative">
                           <input type="number" step="0.01" required value={formSuma} onChange={(e) => setFormSuma(e.target.value)} className={`block w-full rounded-[24px] bg-surface-container-highest border-0 py-5 pl-12 pr-5 text-2xl font-mono focus:ring-0 focus:bg-surface-container-lowest ${formTipas === 'Pajamos' ? 'text-primary' : 'text-red-600'} transition-all`} placeholder="0.00" />
                           <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-mono ${formTipas === 'Pajamos' ? 'text-primary' : 'text-red-600'}`}>€</span>
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
