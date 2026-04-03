"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, userData } = useAuth();
  
  // Jei duomenys dar kraunasi, rodomas minimalus krovimas
  if (!userData) {
    return <div className="text-gray-500 animate-pulse">Kraunama aplinka...</div>;
  }

  const isFarmer = userData.role === "farmer";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Antraštė */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Sveiki, {user?.email?.split('@')[0]}
          </h1>
          <p className="mt-1 flex items-center text-sm text-gray-500">
            Džiaugiamės matydami jus prisijungus.
          </p>
        </div>
      </div>

      {isFarmer ? (
        // --- ŪKININKO VAIZDAS ---
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-emerald-800">Ūkio Apžvalga</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Widget 1 */}
            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Iš viso laukų</dt>
                      <dd className="text-lg font-bold text-gray-900 line-clamp-1">
                        12
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Aktyvūs darbai</dt>
                      <dd className="text-lg font-bold text-gray-900 line-clamp-1">
                        4
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3 */}
            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Darbuotojų skaičius</dt>
                      <dd className="text-lg font-bold text-gray-900 line-clamp-1">
                        6
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        // --- DARBUOTOJO VAIZDAS ---
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-emerald-800">Šiandienos užduotys</h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nėra jokių užduočių</h3>
              <p className="mt-1 text-sm text-gray-500">Šiandien Jums nėra priskirtų naujų darbų.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
