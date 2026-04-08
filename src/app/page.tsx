"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user || !mounted) {
    return null;
  }

  return (
    <div className="bg-surface text-ink min-h-screen flex flex-col font-sans">
      {/* TopNavBar */}
      <nav className="w-full h-16 flex items-center px-6 top-0 sticky bg-surface/90 backdrop-blur-md z-50 border-b border-surface-container-highest/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <span className="text-xl font-bold tracking-tight text-primary">Agro-Tech</span>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-8 items-center font-medium text-sm">
              <a className="text-primary font-semibold hover:opacity-80 transition-opacity" href="#">Pradžia</a>
              <a 
                className="text-ink/60 hover:opacity-80 transition-opacity cursor-pointer" 
                onClick={() => router.push('/login')}
              >
                Prisijungti
              </a>
              <a className="text-ink/60 hover:opacity-80 transition-opacity" href="#">Pagalba</a>
            </div>
            <button className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-150">help_outline</button>
          </div>
        </div>
      </nav>

      {/* Main Content: Role Selection */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-20 max-w-7xl mx-auto w-full animate-fade-in-up">
        <header className="text-center mb-16 max-w-2xl">
          <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-secondary font-bold mb-4 block font-mono">Sveiki atvykę į Ūkio Draugą</span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-primary mb-6 leading-[1.1]">Pasirinkite savo vaidmenį</h1>
          <p className="text-ink/60 text-lg font-medium leading-relaxed">
            Pradėkite valdyti savo ūkio procesus su moderniausia žemės ūkio technologijų platforma.
          </p>
        </header>

        {/* Bento-style Role Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Role Card: Farmer */}
          <div 
             onClick={() => router.push('/login?role=farmer')}
             className="group relative bg-surface-container-lowest rounded-[32px] p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,28,25,0.06)] hover:-translate-y-1 cursor-pointer border border-surface-container-highest/20 hover:border-primary/20"
          >
            <div className="absolute -top-4 -right-4 w-40 h-40 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
              <span className="material-symbols-outlined text-[10rem] text-primary">agriculture</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-10 shadow-inner">
                <span className="material-symbols-outlined text-on-primary text-3xl">psychiatry</span>
              </div>
              <h2 className="text-2xl font-bold text-ink mb-3">Ūkininkas</h2>
              <p className="text-ink/60 text-sm font-medium mb-8 leading-relaxed">Valdykite savo pasėlius, stebėkite dirvožemio būklę ir optimizuokite išteklių naudojimą realiu laiku.</p>
            </div>
            <div className="flex items-center justify-between relative z-10 mt-auto">
              <span className="font-mono text-[10px] text-secondary font-bold tracking-widest uppercase bg-secondary/10 px-3 py-1 rounded-full">FARM-01</span>
              <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Role Card: Employee */}
          <div 
            onClick={() => router.push('/login?role=worker')}
            className="group relative bg-surface-container-lowest rounded-[32px] p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,28,25,0.06)] hover:-translate-y-1 cursor-pointer border border-surface-container-highest/20 hover:border-secondary/20"
          >
            <div className="absolute -top-4 -right-4 w-40 h-40 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
              <span className="material-symbols-outlined text-[10rem] text-secondary">groups</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-10 shadow-inner">
                <span className="material-symbols-outlined text-secondary text-3xl">badge</span>
              </div>
              <h2 className="text-2xl font-bold text-ink mb-3">Darbuotojas</h2>
              <p className="text-ink/60 text-sm font-medium mb-8 leading-relaxed">Gaukite užduotis, fiksuokite atliktus darbus ir stebėkite savo darbo valandų suvestines vienoje vietoje.</p>
            </div>
            <div className="flex items-center justify-between relative z-10 mt-auto">
              <span className="font-mono text-[10px] text-secondary font-bold tracking-widest uppercase bg-secondary/10 px-3 py-1 rounded-full">EMP-02</span>
              <span className="material-symbols-outlined text-secondary group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Role Card: Collective Farm */}
          <div 
            onClick={() => router.push('/login?role=company')}
            className="group relative bg-surface-container-lowest rounded-[32px] p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,28,25,0.06)] hover:-translate-y-1 cursor-pointer border border-surface-container-highest/20 hover:border-ink/20"
          >
            <div className="absolute -top-4 -right-4 w-40 h-40 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
              <span className="material-symbols-outlined text-[10rem] text-ink">business</span>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-surface-container-highest rounded-2xl flex items-center justify-center mb-10 shadow-inner">
                <span className="material-symbols-outlined text-ink text-3xl">corporate_fare</span>
              </div>
              <h2 className="text-2xl font-bold text-ink mb-3">Ž.Ū. Bendrovė</h2>
              <p className="text-ink/60 text-sm font-medium mb-8 leading-relaxed">Plataus masto operacijų valdymas, technikos parko kontrolė ir kompleksinė analitika didelėms įmonėms.</p>
            </div>
            <div className="flex items-center justify-between relative z-10 mt-auto">
              <span className="font-mono text-[10px] text-ink/50 font-bold tracking-widest uppercase bg-surface-container/50 px-3 py-1 rounded-full">CORP-03</span>
              <span className="material-symbols-outlined text-ink group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <section className="mt-24 w-full rounded-[40px] bg-surface-container-lowest overflow-hidden flex flex-col md:flex-row items-center border border-surface-container-highest/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="md:w-1/2 p-10 md:p-16">
            <span className="font-mono text-[10px] tracking-widest text-secondary uppercase font-bold mb-4 block">Sistemos statusas</span>
            <h3 className="text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight tracking-tight">Pasiruošę pradėti skaitmeninę transformaciją?</h3>
            <p className="text-ink/60 text-base mb-10 leading-relaxed font-medium">Prisijunkite prie daugiau nei 2,500 ūkių, kurie jau naudoja Ūkio Draugo dirbtinio intelekto įrankius savo kasdienėje veikloje.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => router.push('/login')} className="bg-primary text-on-primary px-8 py-4 rounded-[32px] font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-[0_8px_20px_rgba(51,69,13,0.2)]">Sukurti paskyrą</button>
              <button className="bg-transparent border-2 border-surface-container-highest/50 text-ink px-8 py-4 rounded-[32px] font-bold text-sm transition-all hover:bg-surface-container-low hover:border-surface-container-highest active:scale-95">Sužinoti daugiau</button>
            </div>
          </div>
          <div 
            className="md:w-1/2 h-80 md:h-[500px] w-full bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1628183182836-8e5cd4962cb1?q=80&w=2072&auto=format&fit=crop')" }}
          >
          </div>
        </section>
      </main>

      {/* Spacer for BottomNavBar */}
      <div className="h-24 md:h-8"></div>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 w-full z-50 h-20 rounded-t-[32px] bg-surface/90 backdrop-blur-xl shadow-[0_-12px_40px_rgba(26,28,25,0.06)] md:hidden border-t border-surface-container-highest/20">
        <div className="flex justify-around items-center w-full px-6 pb-2 h-full">
          <div className="flex flex-col items-center justify-center text-ink/70 hover:bg-surface-container-low rounded-full transition-all cursor-pointer p-2">
            <span className="material-symbols-outlined">home</span>
            <span className="font-mono text-[10px] tracking-widest uppercase mt-1">Pradžia</span>
          </div>
          <div 
             onClick={() => router.push('/login')}
             className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-[20px] px-6 py-2.5 transition-all cursor-pointer shadow-[0_4px_12px_rgba(51,69,13,0.3)]"
          >
            <span className="material-symbols-outlined text-lg mb-0.5">person_add</span>
            <span className="font-mono text-[10px] tracking-widest uppercase mt-0.5 font-bold">Paskyra</span>
          </div>
          <div className="flex flex-col items-center justify-center text-ink/70 hover:bg-surface-container-low rounded-full transition-all cursor-pointer p-2">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-mono text-[10px] tracking-widest uppercase mt-1">Pagalba</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
