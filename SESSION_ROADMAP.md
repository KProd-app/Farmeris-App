# „Farmeris“ Projekto Tęsinio Gairės (Roadmap)

Šis failas skirtas išsaugoti informaciją tarp sesijų. Atidarius šį failą naujoje sesijoje, DI asistentas iškart žinos projekto kontekstą, kas jau padaryta ir nuo ko reikia pradėti.

## 🏆 Ką jau pasiekėme (Dabartinis statusas)
1. **GIS Sistemos Integracija:** Sėkmingai integruotas interaktyvus žemėlapis (su `react-leaflet` ir `Leaflet-Geoman`), leidžiantis braižyti laukų plotus (poligonus).
2. **Koordinatės ir Hektarai:** Sukurta logika, kuri automatiškai apskaičiuoja nupiešto lauko plotą ir paverčia jį hektarais. Valdymas pritaikytas patogiam naudojimui mobiliuosiuose įrenginiuose (100dvh App mode).
3. **Valstybės Kadastro Duomenys:** Sukurtas unikalus "Next.js API Proxy" tunelis (`/api/cadastre`), kuris apeina `Geoportal.lt` CORS apsaugas. Ūkininkas gali dinamiškai atvaizduoti:
   - Sklypų ribas
   - Kadastro blokus
   - Kadastro vietoves
   - Inžinerinius tinklus (kanalizaciją, elektrą, šilumos trasas)

> **Dabartinė problema:** Duomenys šiuo metu išlaikomi tik UI lauko būsenoje. Perkovus puslapį, laukai dingsta.

---

## 🎯 Kito Etapo Užduotys (Nuo čia pradėsime)

### 1. Duomenų Bazių (DB) Integracija ir Saugumas (Firebase)
- Visi nupiešti poligonų (laukų) atvaizdavimai – vektorinės koordinatės ir išsami informacija (pavadinimas, kultūra, plotas) – privalo būti saugiai išsaugoti *Firestore* ar kitoje parinktoje DB.
- Reikalinga sukurti patikimą sinchronizacijos logiką (GET atidarius aplikaciją, POST sukuriant, DELETE trinant).

### 2. „Multi-Tenant“ (Vartotojų Profilių) Architektūra
- Šiuo metu aplikacija neturi stipraus naudotojų atskyrimo profilio lygmenyje. 
- **Tikslas:** Sukurti logiką, kad kiekvienas prie sistemos prisijungęs vartotojas (Ūkininkas) iš DB gautų **TIK SAVO** suvestus laukus, sandėlio informaciją ir darbus.
- Duomenų struktūra turi turėti `userId` pririšimą prie kiekvieno lauko ar darbo įrašo.

### 3. Išsami vartotojo sąsajos (UI) Transformacija
- Pritaikysime dizainą prie esminių DB pasikeitimų (pakrovimo indikatoriai, tušti DB „Empty States“).
- Atnaujinsime modulių (Darbo, Sandėlio) dizainus, kad jie vientisai sutaptų su nauja, labai vizualia GIS navigacijos koncepcija.

---
*Sesija išsaugota ir baigta sėkmingai.* Pailsėk, ir kai būsi pasiruošęs, tiesiog paskirk „Atidaryk SESSION_ROADMAP.md ir pradėkime kito etapo darbus“.*
