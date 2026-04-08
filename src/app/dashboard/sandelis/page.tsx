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
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SandelisItem {
  id: string;
  pavadinimas: string;
  kategorija: string;
  kiekis: number;
  vienetas: string;
  vienetoKaina?: number; // ADDED PRICE PER UNIT
}

export default function SandelisPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<SandelisItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const [formPavadinimas, setFormPavadinimas] = useState("");
  const [formKategorija, setFormKategorija] = useState("Sėklos");
  const [formKiekis, setFormKiekis] = useState("");
  const [formVienetas, setFormVienetas] = useState("kg");
  const [formVienetoKaina, setFormVienetoKaina] = useState(""); // ADDED STATE
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kategorijos = ["Sėklos", "Trąšos", "Degalai", "Chemija", "Kita"]; // Added Chemija
  const vienetai = ["kg", "t", "L", "vnt", "pakuotės"];

  useEffect(() => {
    if (userData && userData.role !== "farmer") {
      router.push("/dashboard");
    }
  }, [userData, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "sandelis"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dbItems: SandelisItem[] = [];
      querySnapshot.forEach((docSnap) => {
        dbItems.push({ id: docSnap.id, ...docSnap.data() } as SandelisItem);
      });
      // Sort alphabetically
      dbItems.sort((a, b) => a.pavadinimas.localeCompare(b.pavadinimas));
      setItems(dbItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditItemId(null);
    setFormPavadinimas("");
    setFormKategorija("Sėklos");
    setFormKiekis("");
    setFormVienetas("kg");
    setFormVienetoKaina("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: SandelisItem) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setFormPavadinimas(item.pavadinimas);
    setFormKategorija(item.kategorija);
    setFormKiekis(item.kiekis.toString());
    setFormVienetas(item.vienetas);
    setFormVienetoKaina(item.vienetoKaina?.toString() || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!formPavadinimas || !formKiekis) {
      alert("Užpildykite visus privalomus laukus.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editItemId) {
        // Update
        const docRef = doc(db, "sandelis", editItemId);
        await updateDoc(docRef, {
          pavadinimas: formPavadinimas,
          kategorija: formKategorija,
          kiekis: Number(formKiekis),
          vienetas: formVienetas,
          vienetoKaina: formVienetoKaina ? Number(formVienetoKaina) : 0,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create
        await addDoc(collection(db, "sandelis"), {
          ownerId: user.uid,
          pavadinimas: formPavadinimas,
          kategorija: formKategorija,
          kiekis: Number(formKiekis),
          vienetas: formVienetas,
          vienetoKaina: formVienetoKaina ? Number(formVienetoKaina) : 0,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Klaida saugant:", error);
      alert("Nepavyko išsaugoti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ar tikrai norite ištrinti šį inventoriaus įrašą?")) {
      try {
        await deleteDoc(doc(db, "sandelis", id));
      } catch (error) {
        console.error("Nepavyko ištrinti:", error);
        alert("Įvyko klaida bandant ištrinti.");
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const groupedItems = items.reduce((acc, item) => {
    acc[item.kategorija] = acc[item.kategorija] || [];
    acc[item.kategorija].push(item);
    return acc;
  }, {} as Record<string, SandelisItem[]>);

  if (!userData || userData.role !== "farmer") {
      return <div className="p-8 text-ink font-mono text-sm opacity-50">Autentifikuojama...</div>;
  }

  return (
    <div className="space-y-12 animate-fade-in-up pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-[3.5rem] leading-none font-bold text-ink tracking-tight">Sandėlys</h1>
          <p className="mt-4 text-lg text-ink/60 font-sans max-w-lg">Visi sėklų, trąšų ir degalų likučiai bei jų finansinė vertė vienoje vietoje.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-[32px] bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 transition-all"
          >
            Sukurti įrašą
          </button>
        </div>
      </div>

      {loading ? (
          <div className="flex justify-center p-20">
              <span className="font-mono text-ink/40 animate-pulse text-sm uppercase tracking-widest">Kraunama...</span>
          </div>
      ) : items.length === 0 ? (
          <div className="bg-surface-container-low p-20 text-center rounded-[32px]">
             <h3 className="text-xl font-semibold text-ink">Sandėlis ištuštėjęs</h3>
             <p className="mt-2 text-ink/60">Sukurkite pirmąjį įrašą ir pradėkite sekti atsargas.</p>
          </div>
      ) : (
        <div className="space-y-10">
          {kategorijos.map((kat) => {
            const katItems = groupedItems[kat];
            if (!katItems || katItems.length === 0) return null;

            return (
              <div key={kat} className="animate-fade-in-up">
                <h2 className="text-xl font-bold font-sans mb-4 text-ink">{kat}</h2>
                <div className="bg-surface-container-low p-4 sm:p-6 rounded-[32px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {katItems.map((item) => (
                    <div key={item.id} className="bg-surface p-6 rounded-[24px] shadow-[0_12px_40px_rgba(26,28,25,0.02)] flex flex-col justify-between transition-all hover:-translate-y-1 relative group">
                      <div>
                        <div className="flex items-baseline justify-between mb-2">
                           <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-bold font-mono text-primary">{item.kiekis !== undefined ? item.kiekis.toFixed(2) : 0}</span>
                             <span className="text-sm font-mono text-ink/50 uppercase tracking-wider">{item.vienetas}</span>
                           </div>
                           {item.vienetoKaina && item.vienetoKaina > 0 ? (
                             <span className="text-xs font-mono font-semibold text-ink/40 bg-surface-container-low px-2 py-1 rounded">
                               {formatCurrency(item.vienetoKaina)} / {item.vienetas}
                             </span>
                           ) : null}
                        </div>
                        <h3 className="text-lg font-semibold text-ink font-sans">{item.pavadinimas}</h3>
                        
                        {item.vienetoKaina && item.vienetoKaina > 0 ? (
                          <p className="text-[0.6875rem] font-mono text-ink/50 uppercase mt-2">Viso turto vertė: {formatCurrency(item.kiekis * item.vienetoKaina)}</p>
                        ) : (
                          <p className="text-[0.6875rem] font-mono text-ink/30 uppercase mt-2">Kaina nenurodyta</p>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                           onClick={() => openEditModal(item)}
                           className="bg-surface-container-highest px-4 py-2 rounded-full text-xs font-semibold text-ink hover:bg-ink/10 transition-colors"
                        >
                          Koreguoti
                        </button>
                        <button 
                           onClick={() => handleDelete(item.id)}
                           className="bg-secondary/10 px-4 py-2 rounded-full text-xs font-semibold text-secondary hover:bg-secondary hover:text-white transition-colors"
                        >
                          Ištrinti
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-surface-container-highest/70 backdrop-blur-[24px] transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[32px] bg-surface text-left shadow-[0_24px_80px_rgba(26,28,25,0.12)] transition-all sm:my-8 sm:w-full sm:max-w-xl">
                
                <form onSubmit={handleSave} className="flex flex-col">
                  <div className="px-8 pt-8 pb-6">
                    <h3 className="text-2xl font-bold text-ink mb-6">
                      {isEditMode ? "Koreguoti likutį" : "Naujas sandėlio įrašas"}
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Pavadinimas / Prekė</label>
                        <input type="text" required value={formPavadinimas} onChange={(e) => setFormPavadinimas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans" placeholder="Pv. Karbamidas, Žieminiai kviečiai 'Skagen'" />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Turimas Kiekis</label>
                          <input type="number" step="any" required value={formKiekis} onChange={(e) => setFormKiekis(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-primary font-mono font-bold focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" placeholder="0" />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Mat. Vienetas</label>
                          <select required value={formVienetas} onChange={(e) => setFormVienetas(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-mono appearance-none uppercase">
                            {vienetai.map(v => (
                               <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Kategorija</label>
                          <select required value={formKategorija} onChange={(e) => setFormKategorija(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all font-sans appearance-none">
                            {kategorijos.map((kat) => (
                               <option key={kat} value={kat}>{kat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-widest text-ink/50 font-mono mb-2">Vieneto Kaina (€) (Neprivaloma)</label>
                          <input type="number" step="0.01" value={formVienetoKaina} onChange={(e) => setFormVienetoKaina(e.target.value)} className="block w-full rounded-[24px] bg-surface-container-highest border-0 py-4 px-5 text-ink font-mono focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[inset_0_0_0_1px_rgba(51,69,13,0.2)] transition-all" placeholder="Pvz. 50" />
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  <div className="px-8 py-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-[32px]">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex justify-center rounded-[32px] bg-surface-container-highest px-6 py-4 text-sm font-semibold text-ink/70 hover:text-ink transition-colors">
                      Atšaukti
                    </button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-[32px] bg-gradient-to-br from-primary to-primary-container px-8 py-4 text-sm font-semibold text-on-primary shadow-[0_12px_40px_rgba(51,69,13,0.3)] hover:opacity-90 disabled:opacity-50 transition-all">
                       {isSubmitting ? "Saugoma..." : "Išsaugoti likutį"}
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
