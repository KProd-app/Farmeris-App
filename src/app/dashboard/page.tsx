"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { userData } = useAuth();
  
  if (!userData) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isWorker = userData.role === "worker";

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in-up">
      
      {/* Page Title & Date Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] mb-2 block">Sveiki sugrįžę</span>
          <h2 className="text-4xl sm:text-5xl font-black text-primary tracking-tight">Apžvalga</h2>
        </div>
        <div className="bg-surface-container-low px-4 py-2 rounded-[16px] flex items-center gap-3 shadow-sm border border-outline-variant/10">
          <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
          <span className="font-mono text-[13px] font-semibold tracking-tight">
             {new Date().toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>

      {isWorker ? (
        // --- DARBUOTOJO VAIZDAS ---
        <div className="space-y-6 mt-8">
           <h3 className="text-xl font-bold text-primary mb-8">Šiandienos Užduotys</h3>
           <div className="bg-surface-container-low p-8 rounded-[24px] border border-outline-variant/10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">assignment_turned_in</span>
              </div>
              <h4 className="text-lg font-bold text-primary">Nėra naujų užduočių</h4>
              <p className="text-sm text-on-surface-variant/60 mt-2 max-w-md">Šiandien Jums nėra priskirtų naujų darbų. Galite pailsėti arba pasitikrinti su ūkio valdytoju.</p>
           </div>
        </div>
      ) : (
        // --- ŪKININKO / ĮMONĖS VAIZDAS (Bento Grid) ---
        <>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Total Fields */}
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-[24px] flex flex-col justify-between hover:bg-surface-container transition-colors group cursor-default shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-3xl">potted_plant</span>
                <span className="text-[10px] font-bold text-primary bg-primary-fixed-dim/30 px-2 py-1 rounded-full">+2 Nauji</span>
              </div>
              <div className="mt-8">
                <p className="font-mono text-4xl font-bold text-primary">12</p>
                <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">Visi Laukai</p>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-[24px] flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-secondary text-3xl">assignment_late</span>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full ring-2 ring-surface-container-low bg-amber-200 flex items-center justify-center justify-center font-bold text-[10px] text-amber-800">T</div>
                  <div className="w-6 h-6 rounded-full ring-2 ring-surface-container-low bg-blue-200 flex items-center justify-center justify-center font-bold text-[10px] text-blue-800">L</div>
                </div>
              </div>
              <div className="mt-8">
                <p className="font-mono text-4xl font-bold text-primary">04</p>
                <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">Aktyvūs Darbai</p>
              </div>
            </div>

            {/* Workforce */}
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-[24px] flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-primary text-3xl">sensors</span>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Gyvai</span>
                </div>
              </div>
              <div className="mt-8">
                <p className="font-mono text-4xl font-bold text-primary">06</p>
                <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">Personalas</p>
              </div>
            </div>

            {/* Soil Stats (Highlighted) */}
            <div className="bg-primary-container p-6 sm:p-8 rounded-[24px] text-on-primary-container relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 opacity-[0.07]">
                <span className="material-symbols-outlined text-9xl">water_drop</span>
              </div>
              <div className="flex justify-between items-start relative z-10">
                <span className="material-symbols-outlined text-3xl">opacity</span>
                <span className="font-mono text-[10px] font-bold border border-white/20 px-2.5 py-1 rounded-full bg-white/5">Optimalus</span>
              </div>
              <div className="mt-8 relative z-10">
                <p className="font-mono text-4xl font-bold">65<span className="text-xl font-sans font-medium text-white/80">%</span></p>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Drėgmės Vidurkis</p>
              </div>
            </div>
            
          </div>

          {/* Main Grid: Health & Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
            
            {/* Crop Health Overview (Bento 2/3) */}
            <div className="lg:col-span-2 bg-surface-container-low p-6 sm:p-8 rounded-[24px] border border-outline-variant/5 relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold text-primary tracking-tight">Pasėlių Būklė</h3>
                <button className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all group p-2 -mr-2">
                   Pilna ataskaita <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
              
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {/* Wheat Item */}
                <div className="bg-surface p-5 sm:p-6 rounded-[20px] group hover:shadow-md transition-all border border-transparent hover:border-outline-variant/10 cursor-pointer">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4 border border-transparent">
                      <div className="hidden sm:flex w-14 h-14 rounded-[16px] bg-primary-fixed-dim/20 items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-primary text-[28px]">grass</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-primary text-[15px]">Žieminiai Kviečiai</h4>
                        <p className="text-[10px] sm:text-[11px] font-mono text-on-surface-variant/60 uppercase tracking-widest mt-0.5">Sektorius 4-A • 42 Hektarai</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-2xl font-black text-primary">88%</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">Puiku</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: '88%' }}></div>
                  </div>
                </div>

                {/* Rapeseed Item */}
                <div className="bg-surface p-5 sm:p-6 rounded-[20px] group hover:shadow-md transition-all border border-transparent hover:border-error/10 cursor-pointer">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4 border border-transparent">
                      <div className="hidden sm:flex w-14 h-14 rounded-[16px] bg-secondary-fixed/30 items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-secondary text-[28px]">filter_vintage</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-primary text-[15px]">Rapsai</h4>
                        <p className="text-[10px] sm:text-[11px] font-mono text-on-surface-variant/60 uppercase tracking-widest mt-0.5">Sektorius 2-C • 18 Hektarų</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-2xl font-black text-secondary">74%</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-secondary-fixed-variant uppercase tracking-tighter bg-secondary-fixed/50 px-2 py-0.5 rounded-md mt-1 inline-block">Stebėjimas</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000 delay-300 ease-out" style={{ width: '74%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather & Environment (Bento 1/3) */}
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-[24px] flex flex-col border border-outline-variant/5 shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-8 tracking-tight">Klimato Sąlygos</h3>
              
              <div className="flex-1 flex flex-col space-y-6">
                <div className="flex items-center justify-between bg-surface p-5 rounded-[20px] shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-[60px] h-[60px] rounded-[18px] bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-[36px] text-amber-500 drop-shadow-sm">sunny</span>
                    </div>
                    <div>
                      <p className="font-mono text-4xl font-black text-primary tracking-tighter">
                        22<span className="text-[20px] font-sans font-medium text-on-surface-variant/40 ml-0.5">°C</span>
                      </p>
                      <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-widest mt-1">Giedra</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-highest/50 p-4 rounded-[16px] border border-outline-variant/5">
                    <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                       <span className="material-symbols-outlined text-[14px]">air</span> Vėjas
                    </p>
                    <p className="font-mono text-lg font-bold">4.2 <span className="text-[10px] font-sans text-on-surface-variant/60">m/s</span></p>
                  </div>
                  <div className="bg-surface-container-highest/50 p-4 rounded-[16px] border border-outline-variant/5">
                    <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">compress</span> Slėgis
                    </p>
                    <p className="font-mono text-lg font-bold">1012 <span className="text-[10px] font-sans text-on-surface-variant/60">hPa</span></p>
                  </div>
                </div>
                
                <div className="space-y-3 flex-1 flex flex-col justify-end pt-4 border-t border-outline-variant/10">
                  <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest pl-1 mb-1">Apžvalga (3 Dienų)</p>
                  <div className="flex justify-between items-center bg-surface/80 p-3.5 rounded-[12px] hover:bg-white transition-colors cursor-default">
                    <span className="text-[13px] font-semibold text-primary">Penktadienis</span>
                    <span className="material-symbols-outlined text-primary text-[18px]">cloud</span>
                    <span className="font-mono text-[13px] font-bold text-on-surface-variant">19° <span className="text-on-surface-variant/40 font-normal">/ 12°</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-surface/80 p-3.5 rounded-[12px] hover:bg-white transition-colors cursor-default">
                    <span className="text-[13px] font-semibold text-primary">Šeštadienis</span>
                    <span className="material-symbols-outlined text-blue-500 text-[18px]">rainy</span>
                    <span className="font-mono text-[13px] font-bold text-on-surface-variant">14° <span className="text-on-surface-variant/40 font-normal">/ 8°</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task List & Recent Observations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
            
            {/* Active Tasks Table (2/3) */}
            <div className="lg:col-span-2 bg-surface-container-low p-6 sm:p-8 rounded-[24px] border border-outline-variant/5 flex flex-col">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-primary tracking-tight">Aktyvios Operacijos</h3>
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Lauko darbai</span>
                  <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider hidden sm:block">Priežiūra</span>
                </div>
              </div>
              
              <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0 flex-1">
                <table className="w-full text-left border-separate border-spacing-y-2 min-w-[500px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                      <th className="pb-3 pl-4">Užduotis</th>
                      <th className="pb-3">Statusas</th>
                      <th className="pb-3 hidden sm:table-cell">Vykdytojas</th>
                      <th className="pb-3 text-right pr-4">Terminas</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="bg-surface group hover:bg-white transition-all shadow-sm hover:shadow-md cursor-pointer">
                      <td className="py-4 pl-4 rounded-l-[16px] border-y border-l border-outline-variant/5">
                        <div className="flex items-center gap-3.5">
                          <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed-dim/10 rounded-[12px] group-hover:bg-primary-fixed-dim/20 transition-colors">sprinkler</span>
                          <p className="font-bold text-[14px]">Drėkinimo patikra - Sektorius 4</p>
                        </div>
                      </td>
                      <td className="py-4 border-y border-outline-variant/5">
                        <span className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-[8px] uppercase tracking-wider">Vykdoma</span>
                      </td>
                      <td className="py-4 border-y border-outline-variant/5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-[10px] bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">T</div>
                          <span className="text-[13px] font-semibold text-on-surface-variant">Tomas V.</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 rounded-r-[16px] text-right border-y border-r border-outline-variant/5">
                        <p className="font-mono text-[12px] font-bold text-primary bg-surface-container-highest/50 inline-block px-2 py-1 rounded-md">14:30</p>
                      </td>
                    </tr>

                    <tr className="bg-surface group hover:bg-white transition-all shadow-sm hover:shadow-md cursor-pointer">
                      <td className="py-4 pl-4 rounded-l-[16px] border-y border-l border-outline-variant/5">
                        <div className="flex items-center gap-3.5">
                          <span className="material-symbols-outlined text-secondary p-2 bg-secondary-fixed/20 rounded-[12px] group-hover:bg-secondary-fixed/40 transition-colors">bug_report</span>
                          <p className="font-bold text-[14px]">Kenkėjų prevencija - 2-C</p>
                        </div>
                      </td>
                      <td className="py-4 border-y border-outline-variant/5">
                        <span className="bg-amber-100/50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-[8px] uppercase tracking-wider">Suplanuota</span>
                      </td>
                      <td className="py-4 border-y border-outline-variant/5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-[10px] bg-secondary/10 flex items-center justify-center font-bold text-xs text-secondary">L</div>
                          <span className="text-[13px] font-semibold text-on-surface-variant">Lina G.</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 rounded-r-[16px] text-right border-y border-r border-outline-variant/5">
                        <p className="font-mono text-[12px] font-bold text-primary opacity-80">RYTOJ</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Field Map Insights (1/3) */}
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-[24px] border border-outline-variant/5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-primary tracking-tight">Laukų Žemėlapis</h3>
                 <span className="material-symbols-outlined text-on-surface-variant/30">explore</span>
              </div>
              
              <div className="relative w-full h-[180px] rounded-[16px] overflow-hidden mb-6 group bg-surface-container-highest">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-80" 
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2656&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-[11px] font-bold text-primary uppercase shadow-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform hover:bg-white tracking-widest mt-4">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    Atidaryti
                  </span>
                </div>
                <div className="absolute bottom-3 left-4">
                  <span className="text-white text-[10px] font-mono font-bold tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">LIVE MAP</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4 p-4 bg-surface rounded-[16px] border border-outline-variant/5 shadow-sm hover:border-outline-variant/20 transition-colors">
                  <div className="w-[42px] h-[42px] rounded-[12px] bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-secondary text-[20px]">priority_high</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary leading-tight">Azoto trūkumo rizika</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-1 leading-relaxed">1-B pasėliuose fiksuojamas lapijos geltonavimas.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
