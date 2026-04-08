# „Farmeris“ Projekto Tęsinio Gairės (Roadmap)

Šis failas skirtas išsaugoti informaciją tarp sesijų. Atidarius šį failą naujoje sesijoje, DI asistentas iškart žinos projekto kontekstą, kas jau padaryta ir nuo ko reikia pradėti.

## 🏆 Ką jau pasiekėme (Dabartinis statusas)

1. **Vartotojų Profilių ir Bazių Architektūra:** Įdiegta Firebase Firestore integracija su multi-tenant apsauga (Firestore rules), leidžianti atskirti vartotojus (`userId` lygmenyje). Parduotas "Company", "Farmer" ir "Worker" rolinio modeliavimo funkcionalumas.
2. **Autentifikacijos Tolina:** Visiškai perrašytas Prisijungimo ir Registracijos dizainas apjungtas į vieną modulį. Padarytas modernus prioritizavimas Prisijungimui ir užkoduotas tiesioginis (Vardo ir Pavardės) formos talpinimas į DB (`users` kolekciją) išsaugant naujus naudotojus.
3. **Pagrindinio „Dashboard“ Dizaino Atnaujinimas (UI Transformation):**
   - Sukurtas itin modernus „Digital Agronomist“ ir „Glassmorphism“ dizaino stiliaus Sidebar ir Top Header (`layout.tsx`).
   - Apžvalgos puslapis (`page.tsx`) paverstas į interaktyvų apžvalginį „Bento-Grid“ stiliaus „Dashboard“, talpinantį Pasėlių būsenų progresą, atnaujintą orų logiką ir aktyvių užduočių stebėjimo lentelę.
4. **GIS Sistemos Pagrindai:** Įveikta `react-leaflet`, plotų ir perimetrų geometrija su „Next.js API Proxy“ tuneliu (`/api/cadastre`) apeinančiu *Geoportal.lt* CORS blokus.

---

## 🎯 Kito Etapo Užduotys (Nuo čia pradėsime kitoje sesijoje)

### 1. Funkcionalumų sujungimas (API integracija su nauju UI)
- Šioje sesijoje sumontuotas įspūdingas „Dashboard“ šiuo metu naudoja itin daug kieto (dummy) kodo (pvz., pranešimai apie drėgmę, suplanuoti darbai, laukų ataskaitos, orai).
- **Tikslas:** Pajungti (wire-up) naują UI vizualą prie realių Firestore kolekcijų.
   - Vietoj įkoduotų orų, naudosime „meteo.lt“ ar išorinį API palaikymą.
   - Aktyvių darbų lentelė ims informaciją realiu laiku iš `/dashboard/darbai` konteksto.
   - Integruoti pilnai GIS laukus (polygon) į pagrindinio ekranio apžvalgą (Preview mini žemėlapis).

### 2. Vidinių modulių pritaikymas naujam moduliui (UI Matching)
- Esami puslapiai (`Sandėlis`, `Darbuotojai/Užduotys`, `Laukai / Braižymas`) vizualiai pasiliko standartiniame lygyje. Reikia modifikuoti šiuos polapių UI, pritaikant prie apvalių rėmų ir permatomo prabangesnio dizaino.

---
*Sesija išsaugota! Kai norėsite tęsti darbus, atidarykite šį failą (SESSION_ROADMAP.md) ir perskaitę būsime paruošti pradėti sujunginėti pilną sistemą!*
