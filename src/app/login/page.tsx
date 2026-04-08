"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Role } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role>((roleParam as Role) || "farmer"); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Jei atvyko iš "Landing" su konkrečia role (pvz. url?role=farmer), 
    // išsaugome rolę ateičiai (sukurti paskyrai), bet neperjungiame į registraciją automatiškai - prioritetas Prisijungimas.
    if (roleParam) {
      setRole(roleParam as Role);
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Saugome papildomus vartotojo duomenis Firestore (taip pat įtraukiame Vardą ir Pavardę)
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          firstName: firstName,
          lastName: lastName,
        });
        
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
         setError("Šis el. pašto adresas jau naudojamas. Išbandykite prisijungti.");
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
    <div className="bg-surface text-ink min-h-screen flex flex-col font-sans">
      {/* TopNavBar */}
      <header className="w-full h-16 flex items-center px-6 top-0 sticky bg-surface/90 backdrop-blur-md z-50 border-b border-surface-container-highest/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <div className="text-xl font-bold tracking-tight text-primary cursor-pointer" onClick={() => router.push("/")}>Agro-Tech</div>
          <nav className="hidden md:flex gap-8 font-medium text-sm">
            <a onClick={() => router.push("/")} className="text-ink/60 hover:opacity-80 transition-opacity cursor-pointer">Pradžia</a>
            <a className="text-primary font-semibold hover:opacity-80 transition-opacity cursor-pointer">Prisijungti</a>
            <a className="text-ink/60 hover:opacity-80 transition-opacity cursor-pointer">Pagalba</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary cursor-pointer">help_outline</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden animate-fade-in-up">
        {/* Background organic image */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-[0.03] md:opacity-[0.07] pointer-events-none">
          <img 
            className="object-cover w-full h-full grayscale sepia" 
            alt="wheat field" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs_EOnmrqv2XmR_AAs8UJiaeUStK4rx5sSkYeAnNQYSjy07WJ9dXrjG1ium1q5u4u8BhhrwPaXO6NxD1BP6DhCKHoFHm7u3VxrGw4Tjoe9p8sz--6B-PN80jvRDqPDP_LAd7BaoVVnTGPGvVfPMhBg0KezN3l33xRo72Z3_VP1LD9yjuyhfOckEpASpuv_uncZyt81unEKO3noxnyTPKlG_p8rtU590fZcTm4sj8T2-OUviXvYFUWJrSqus-QUAPU-TiJx9hjouCs"
          />
        </div>

        <div className="w-full max-w-md z-10">
          
          {/* Brand Anchor */}
          <div className="mb-10 text-center md:text-left">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-secondary mb-2 whitespace-nowrap">
              {isLogin ? "Sveiki sugrįžę" : "Pasiruošę Pradėti?"}
            </p>
            <h1 className="text-4xl sm:text-[2.5rem] font-bold tracking-tight text-primary mb-2 leading-none whitespace-nowrap">Ūkio Draugas</h1>
            <p className="text-ink/60 font-medium text-sm sm:text-base">Jūsų skaitmeninis agronomas laukia.</p>
          </div>

          {/* Login / Register Form */}
          <form 
            onSubmit={handleSubmit} 
            className="bg-surface-container-lowest p-6 sm:p-10 rounded-[32px] shadow-[0_12px_40px_rgba(26,28,25,0.04)] border border-surface-container-highest/30 space-y-6"
          >
            <div className="space-y-4">
              
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                  <div className="group">
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-ink/50 mb-2 ml-1">Vardas</label>
                    <input 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      className="w-full h-14 px-5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none text-ink placeholder-ink/30 shadow-inner" 
                      placeholder="Jonas" 
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-ink/50 mb-2 ml-1">Pavardė</label>
                    <input 
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      className="w-full h-14 px-5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none text-ink placeholder-ink/30 shadow-inner" 
                      placeholder="Jonaitis" 
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-ink/50 mb-2 ml-1">El. Paštas</label>
                <div className="relative">
                  <input 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full h-14 px-5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none text-ink placeholder-ink/30 shadow-inner" 
                    placeholder="vardas@pavyzdys.lt" 
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-ink/50 mb-2 ml-1">Slaptažodis</label>
                <div className="relative">
                  <input 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full h-14 px-5 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all outline-none text-ink placeholder-ink/30 shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              {/* Roles selection block - only shown if Registering */}
              {!isLogin && (
                <div className="group animate-fade-in-up">
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-secondary mb-2 ml-1 mt-6">Kuo būsite šioje platformoje?</label>
                  <div className="flex gap-2 w-full h-14 bg-surface-container rounded-xl p-1 shadow-inner">
                    <button 
                      type="button" 
                      onClick={() => setRole("farmer")} 
                      className={`flex-1 rounded-lg text-xs font-bold transition-all ${role === "farmer" ? "bg-white text-primary shadow-sm" : "text-ink/50 hover:text-ink/80"}`}
                    >
                      Ūkininkas
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRole("worker")} 
                      className={`flex-1 rounded-lg text-xs font-bold transition-all ${role === "worker" ? "bg-white text-secondary shadow-sm" : "text-ink/50 hover:text-ink/80"}`}
                    >
                      Darbuotojas
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRole("company")} 
                      className={`flex-1 rounded-lg text-xs font-bold transition-all ${role === "company" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink/80"}`}
                    >
                      Įmonė
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container text-xs p-4 rounded-xl border border-error/20 font-medium">
                {error}
              </div>
            )}

            {isLogin && (
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 cursor-pointer group">
                   <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container cursor-pointer" />
                   <span className="text-xs font-medium text-ink/60 group-hover:text-primary transition-colors">Prisiminti mane</span>
                 </label>
                 <a className="text-xs font-semibold text-secondary hover:underline underline-offset-4 cursor-pointer">Pamiršote slaptažodį?</a>
               </div>
            )}

            <button 
               type="submit"
               disabled={loading}
               className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-[16px] font-bold tracking-tight active:scale-95 transition-all shadow-[0_8px_20px_rgba(51,69,13,0.3)] hover:opacity-95 disabled:opacity-70 flex justify-center items-center"
            >
               {loading ? "Kraunama..." : (isLogin ? "Prisijungti" : "Sukurti Paskyrą")}
            </button>

            <div className="relative py-2 hidden">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-container-highest"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-ink/40 bg-surface-container-lowest px-4">Arba</div>
            </div>

            <button type="button" className="hidden w-full h-14 bg-surface-bright border border-surface-container-highest text-ink rounded-xl font-semibold items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-surface-container-lowest shadow-sm">
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
               </svg>
               Prisijungti su Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-ink/70">
            {isLogin ? "Neturite paskyros?" : "Jau turite paskyrą?"} {" "}
            <a 
              className="text-primary font-bold hover:underline cursor-pointer transition-colors" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
            >
              {isLogin ? "Registruotis" : "Prisijungti"}
            </a>
          </p>
        </div>
      </main>

      <div className="h-24 md:h-12"></div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 h-20 rounded-t-[32px] bg-surface/90 backdrop-blur-xl shadow-[0_-12px_40px_rgba(26,28,25,0.06)] flex justify-around items-center px-6 pb-2 border-t border-surface-container-highest/20">
        <a onClick={() => router.push("/")} className="flex flex-col items-center justify-center text-ink/70 hover:bg-surface-container-low rounded-full transition-all p-3 active:scale-90 duration-200 cursor-pointer">
          <span className="material-symbols-outlined mb-1 text-lg">home</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">Pradžia</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-primary text-white rounded-[20px] px-6 py-2 active:scale-90 duration-200 cursor-pointer shadow-[0_4px_12px_rgba(51,69,13,0.3)]">
          <span className="material-symbols-outlined mb-1 text-lg">person</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-center">Paskyra</span>
        </a>
        <a className="flex flex-col items-center justify-center text-ink/70 hover:bg-surface-container-low rounded-full transition-all p-3 active:scale-90 duration-200 cursor-pointer">
          <span className="material-symbols-outlined mb-1 text-lg">support_agent</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">Pagalba</span>
        </a>
      </nav>
    </div>
  );
}

// Būtinas React Suspense eksportas dėl useSearchParams naudojimo server component konteineryje
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
