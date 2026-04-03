"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Role } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker"); // numatytoji reikšmė
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Saugome papildomus vartotojo duomenis Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
        });
        
        router.push("/");
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
         setError("Šis el. paštas jau naudojamas.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
         setError("Neteisingi prisijungimo duomenys.");
      } else {
         setError("Įvyko klaida: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            {isLogin ? "Prisijungti" : "Sukurti paskyrą"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Arba{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              {isLogin ? "užsiregistruoti sistemoje" : "prisijungti prie esamos paskyros"}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email-address">
                El. pašto adresas
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm transition-shadow"
                placeholder="vardas@pavyzdys.lt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Slaptažodis
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <span className="block text-sm font-medium text-gray-700 mb-2">Pasirinkite savo vaidmenį:</span>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={role === "farmer"}
                    onChange={() => setRole("farmer")}
                    className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-gray-900 font-medium text-sm">Aš esu Ūkininkas</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="worker"
                    checked={role === "worker"}
                    onChange={() => setRole("worker")}
                    className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-gray-900 font-medium text-sm">Aš esu Darbuotojas</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kraunama...
                </span>
              ) : isLogin ? (
                "Prisijungti"
              ) : (
                "Sukurti paskyrą"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
