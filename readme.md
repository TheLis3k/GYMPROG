🏋️ GYMPROGress - Aplikacja do Śledzenia Postępów Treningowych
https://img.shields.io/badge/React-18.2-blue
https://img.shields.io/badge/Node.js-20+-green
https://img.shields.io/badge/SQLite-3-lightgrey
https://img.shields.io/badge/PWA-Enabled-orange

📖 Opis Projektu
GYMPROGress to progresywna aplikacja webowa (PWA) do zarządzania treningami siłowymi. Umożliwia tworzenie spersonalizowanych planów treningowych, śledzenie postępów za pomocą kolorowego systemu progresu oraz wizualizację danych treningowych.

✨ Główne Funkcje
🗓️ Elastyczne plany treningowe - Tworzenie planów z dowolną liczbą dni i ćwiczeń

📊 System progresji - Kolorowy system śledzenia postępów (zielony/czerwony/żółty)

⏱️ Timer przerw - Odliczanie czasu między seriami z powiadomieniami dźwiękowymi

😊 Ocena trudności - System emoji do oceny intensywności treningu

📈 Wizualizacja danych - Wykresy progresu i podsumowania

🔗 Eksport/Import - Udostępnianie planów przez linki

👥 Rankingi - Leaderboardy dla użytkowników

📱 PWA - Pełna obsługa offline i instalacja na urządzenia

🚀 Szybki Start
Wymagania Wstępne
Node.js 20+

npm lub yarn

Instalacja
Sklonuj repozytorium:

bash
git clone https://github.com/twoja-nazwa/gymprogress.git
cd gymprogress
Zainstaluj zależności:

bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
Skonfiguruj środowisko:

bash
# Skopiuj plik środowiskowy
cp .env.example .env
# Edytuj zmienne w .env
Uruchom aplikację:

bash
# Frontend (dev mode)
cd client
npm run dev

# Backend
cd ../server
npm run dev

🗃️ Struktura Bazy Danych
Aplikacja używa SQLite z następującymi tabelami:

users - Dane użytkowników

workout_plans - Plany treningowe

workout_days - Dni treningowe

exercises - Ćwiczenia

exercise_logs - Historia wykonywanych ćwiczeń

🔌 API Endpoints
Plany Treningowe
GET /api/workout-plans - Pobierz wszystkie plany

POST /api/workout-plans - Utwórz nowy plan

GET /api/workout-plans/:id - Pobierz szczegóły planu

Dni Treningowe
POST /api/workout-days - Dodaj dzień treningowy

Ćwiczenia
POST /api/exercises - Dodaj ćwiczenie

GET /api/exercises/:day_id - Pobierz ćwiczenia dnia

Logi Ćwiczeń
POST /api/exercise-logs - Zapisz wyniki ćwiczenia

🛠️ Rozwój
Struktura Projektu

gymprogress/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Komponenty React
│   │   ├── hooks/          # Własne hooki
│   │   ├── utils/          # Narzędzia
│   │   └── styles/         # Style CSS Modules
│   └── public/             # Zasoby publiczne
├── server/                 # Backend Node.js
│   ├── models/            # Modele bazy danych
│   ├── routes/            # Endpointy API
│   ├── middleware/        # Middleware
│   └── database/          # Konfiguracja bazy
└── shared/                # Wspólne narzędzia

Skrypty NPM
json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}

🤝 Wkład w Rozwój
Zforkuj projekt

Utwórz branch dla funkcji (git checkout -b feature/nowa-funkcja)

Commit zmian (git commit -m 'Dodaj nową funkcję')

Push do brancha (git push origin feature/nowa-funkcja)

Otwórz Pull Request

📄 Licencja
Ten projekt jest objęty licencją MIT. Szczegóły w pliku LICENSE.

📞 Kontakt
Masz pytania? Utwórz issue lub skontaktuj się przez email: ksawery2k19@gmail.com