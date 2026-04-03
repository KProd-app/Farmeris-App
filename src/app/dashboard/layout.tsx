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

  const farmerLinks = [
    { name: "Apžvalga", href: "/dashboard", icon: HomeIcon },
    { name: "Mano Laukai", href: "/dashboard/laukai", icon: FieldsIcon },
    { name: "Darbai", href: "/dashboard/darbai", icon: TasksIcon },
    { name: "Darbuotojai", href: "/dashboard/workers", icon: WorkersIcon },
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
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        {/* Mobiliojo ekrano užtemdymas */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Šoninis Meniu (Sidebar) */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${customMobileSlide(mobileMenuOpen)} flex flex-col`}>
          {/* Logo / Pavadinimas */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-emerald-50 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-xl font-bold tracking-wider text-emerald-800">
              Farmeris
            </span>
          </div>

          {/* Navigacijos Nuorodos */}
          <nav className="flex-1 px-4 py-6 text-sm text-gray-700 font-medium space-y-1 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className={`${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"}`}>
                    <link.icon />
                  </div>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Vartotojo Profilis ir Atsijungimas */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start gap-3 flex-col w-full">
               <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                    {user?.email}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 capitalize bg-emerald-100/50 px-2 py-0.5 rounded-full self-start mt-1 border border-emerald-200">
                    {userData?.role === "farmer" ? "Ūkininkas" : "Darbuotojas"}
                  </span>
               </div>
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent rounded-md transition-colors"
               >
                 <LogoutIcon />
                 Atsijungti
               </button>
            </div>
          </div>
        </div>

        {/* Pagrindinis turinys */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobili antraštė */}
          <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-gray-500 focus:outline-none focus:text-gray-700 p-2 -ml-2"
            >
              <MenuIcon />
            </button>
            <span className="text-lg font-bold text-emerald-800">Farmeris</span>
            <div className="w-8"></div> {/* Tuščia vieta simetrijai */}
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100/50 p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
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
