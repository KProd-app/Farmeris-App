"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData, user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Link Definitions
  const farmerLinks = [
    { name: "Apžvalga", href: "/dashboard", icon: "dashboard" },
    { name: "Mano Laukai", href: "/dashboard/laukai", icon: "map" },
    { name: "Kalendorius", href: "/dashboard/darbai", icon: "assignment" },
    { name: "Sandėlys", href: "/dashboard/sandelis", icon: "inventory_2" },
    { name: "Finansai", href: "/dashboard/finansai", icon: "account_balance" },
  ];

  const workerLinks = [
    { name: "Apžvalga", href: "/dashboard", icon: "dashboard" },
    { name: "Mano Užduotys", href: "/dashboard/uzduotys", icon: "assignment" },
  ];
  
  const companyLinks = [
    { name: "Apžvalga", href: "/dashboard", icon: "dashboard" },
    { name: "Visi Laukai", href: "/dashboard/laukai", icon: "map" },
    { name: "Personalas", href: "/dashboard/personalas", icon: "groups" },
    { name: "Technika", href: "/dashboard/technika", icon: "agriculture" },
    { name: "Analitika", href: "/dashboard/analitika", icon: "finance" },
  ];

  let links = farmerLinks;
  if(userData?.role === "worker") links = workerLinks;
  else if(userData?.role === "company") links = companyLinks;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Klaida atsijungiant:", error);
    }
  };
  
  // Format user name initials / display
  const userDisplayName = userData?.firstName 
    ? `${userData.firstName} ${userData.lastName ? userData.lastName[0] + '.' : ''}`
    : userData?.email?.split('@')[0] || "Vartotojas";
    
  const roleDisplay = userData?.role === "farmer" ? "Ūkininkas" 
                    : userData?.role === "company" ? "Bendrovė"
                    : "Darbuotojas";

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-surface overflow-hidden font-sans text-on-surface">
        
        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-surface-container-highest/70 backdrop-blur-md transition-opacity lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-low flex flex-col py-8 shadow-[4px_0_40px_rgba(26,28,25,0.03)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex-shrink-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          <div className="px-8 mb-8 flex justify-between items-center cursor-pointer">
            <div>
              <h1 className="font-sans font-black text-primary text-2xl tracking-tighter">Ūkio Draugas</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">Skaitmeninis Agronomas</p>
            </div>
            {/* Close button for mobile */}
            <button className="lg:hidden text-ink/60 hover:bg-surface-container-highest p-1 rounded-full transition-all" onClick={() => setMobileMenuOpen(false)}>
               <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 space-y-1 mt-4 overflow-y-auto w-full">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-8 py-3.5 transition-all duration-300 group rounded-r-full ${
                    isActive 
                      ? "text-primary font-bold bg-surface-container-highest/60 shadow-sm" 
                      : "text-on-surface-variant/80 font-medium hover:translate-x-2"
                  }`}
                >
                  <span className={`material-symbols-outlined mr-4 transition-all ${isActive ? "text-primary" : "text-on-surface-variant/60 group-hover:text-primary"}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {link.icon}
                  </span>
                  <span className="font-mono text-[13px] tracking-tight">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-6 pt-4 mt-auto">
            {/* Action button */}
            <button className="w-full py-3.5 bg-primary text-on-primary rounded-[16px] font-bold text-sm flex items-center justify-center gap-2 mb-8 shadow-[0_4px_16px_rgba(51,69,13,0.3)] hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-base">add</span>
              Naujas Įrašas
            </button>
          </div>

          <div className="px-8 pt-6 border-t border-outline-variant/20 flex flex-col gap-4">
               <a className="flex items-center text-on-surface-variant opacity-70 text-xs font-semibold hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-sm mr-3">help</span>
                  Pagalba
               </a>
               <button onClick={handleLogout} className="flex items-center text-error border-transparent opacity-80 hover:opacity-100 font-semibold cursor-pointer text-xs w-full text-left transition-opacity">
                  <span className="material-symbols-outlined text-[15px] mr-3">logout</span>
                  Atsijungti
               </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Bar */}
          <header className="w-full sticky top-0 z-30 bg-surface/80 backdrop-blur-2xl flex justify-between items-center px-6 md:px-8 py-4 border-b border-surface-container-highest/20 shadow-[0_4px_24px_rgba(26,28,25,0.02)]">
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-on-surface-variant focus:outline-none p-2 -ml-2 mr-4 bg-surface-container-low rounded-full shadow-sm active:scale-90 transition-transform flex-shrink-0"
            >
              <MenuIcon />
            </button>

            {/* Global Search Bar */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">search</span>
                <input 
                  className="w-full bg-surface-container border border-transparent rounded-[16px] py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white placeholder:text-on-surface-variant/50 transition-all outline-none font-medium shadow-inner" 
                  placeholder="Ieškoti laukų, užduočių, inventoriaus..." 
                  type="text"
                />
              </div>
            </div>

            {/* Profile & Notifications */}
            <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors active:scale-95" title="Pranešimai">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors active:scale-95 hidden sm:block" title="Nustatymai">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3 pl-3 sm:pl-5 sm:border-l border-outline-variant/30">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-primary tracking-tight leading-tight mb-0.5">{userDisplayName}</p>
                  <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-widest leading-none font-semibold opacity-70">{roleDisplay}</p>
                </div>
                {/* Fallback avatar generator utilizing initials if needed */}
                <div className="flex-shrink-0 w-10 h-10 rounded-[12px] bg-primary-container text-on-primary-container flex justify-center items-center font-bold border border-primary/10 shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all text-sm font-mono">
                   {userData?.firstName ? userData.firstName[0].toUpperCase() : (user?.email?.[0].toUpperCase() || "A")}
                </div>
              </div>
            </div>
          </header>

          {/* Sub-view rendering canvas */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
             {children}
          </div>
          
        </main>
      </div>
    </ProtectedRoute>
  );
}
