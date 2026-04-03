"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Paprastos SVG ikonos
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const FieldsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TasksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const FinanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WorkersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData, user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Solo Farmer Links added here
  const farmerLinks = [
    { name: "Apžvalga", href: "/dashboard", icon: HomeIcon },
    { name: "Mano Laukai", href: "/dashboard/laukai", icon: FieldsIcon },
    { name: "Kalendorius", href: "/dashboard/darbai", icon: TasksIcon },
    { name: "Sandėlys", href: "/dashboard/sandelis", icon: InventoryIcon },
    { name: "Finansai", href: "/dashboard/finansai", icon: FinanceIcon },
  ];

  const workerLinks = [
    { name: "Apžvalga", href: "/dashboard", icon: HomeIcon },
    { name: "Mano Užduotys", href: "/dashboard/uzduotys", icon: TasksIcon },
  ];

  const links = userData?.role === "farmer" ? farmerLinks : workerLinks;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Klaida atsijungiant:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-surface overflow-hidden font-sans">
        {/* Mobiliojo ekrano užtemdymas - Glassmorphism fallback */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-20 bg-surface-container-highest/70 backdrop-blur-md transition-opacity lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Šoninis Meniu (Sidebar) - The Digital Agronomist aesthetic */}
        <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-surface-container-lowest shadow-[4px_0_40px_rgba(26,28,25,0.03)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${customMobileSlide(mobileMenuOpen)}`}>
          
          {/* Logo / Pavadinimas */}
          <div className="flex items-center justify-center py-10 px-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-[16px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-ink">
                Farmeris
              </span>
            </div>
          </div>

          {/* Navigacijos Nuorodos (Erdvios, apvalios formos) */}
          <nav className="flex-1 px-6 py-2 text-[0.9375rem] text-ink font-medium space-y-2 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-[20px] transition-all group ${
                    isActive 
                      ? "bg-surface-container-highest shadow-[0_4px_16px_rgba(26,28,25,0.04)] text-ink" 
                      : "text-ink/60 hover:text-ink hover:bg-surface"
                  }`}
                >
                  <div className={`${isActive ? "text-primary" : "text-ink/40 group-hover:text-primary/70"}`}>
                    <link.icon />
                  </div>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Vartotojo Profilis ir Atsijungimas */}
          <div className="p-6 mt-auto">
            <div className="bg-surface p-4 rounded-[24px] flex flex-col gap-4 shadow-[0_4px_16px_rgba(26,28,25,0.02)]">
               <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink truncate font-mono">
                    {user?.email}
                  </span>
                  <span className="text-[0.6875rem] font-bold tracking-widest uppercase text-primary bg-primary/10 px-2.5 py-1.5 rounded-full self-start mt-2 font-sans">
                    {userData?.role === "farmer" ? "Ūkininkas" : "Pagalbininkas"}
                  </span>
               </div>
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-secondary hover:bg-secondary/10 rounded-[16px] transition-colors font-medium border border-transparent"
               >
                 <LogoutIcon />
                 Atsijungti
               </button>
            </div>
          </div>
        </div>

        {/* Pagrindinis turinys */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface relative">
          
          {/* Mobili antraštė */}
          <header className="flex items-center justify-between h-20 px-6 bg-surface-container-highest/50 backdrop-blur-md lg:hidden absolute top-0 left-0 right-0 z-10">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-ink/60 focus:outline-none p-2 -ml-2 bg-white rounded-full shadow-sm"
            >
              <MenuIcon />
            </button>
            <span className="text-lg font-bold text-ink tracking-tight">Farmeris</span>
            <div className="w-10"></div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto pt-24 lg:pt-8 p-4 md:p-8 lg:p-12">
            <div className="w-full max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Pagalbinė funkcija mobiliojo meniu atvaizdavimui
function customMobileSlide(isOpen: boolean) {
  return isOpen ? "translate-x-0" : "-translate-x-full";
}
