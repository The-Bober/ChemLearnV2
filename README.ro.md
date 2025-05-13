
# ChemLearn - Documentație Structură Proiect

## Cuprins
1.  [Introducere](#introducere)
2.  [Structura Generală a Proiectului](#structura-generală-a-proiectului)
    *   [Directorul Rădăcină](#directorul-rădăcină)
    *   [src/](#src)
        *   [src/ai/](#srcai)
        *   [src/app/](#srcapp)
        *   [src/components/](#srccomponents)
        *   [src/contexts/](#srccontexts)
        *   [src/hooks/](#srchooks)
        *   [src/lib/](#srclib)
        *   [src/services/](#srcservices)
        *   [src/types/](#srctypes)
3.  [Fluxuri Principale](#fluxuri-principale)
    *   [Autentificare și Înregistrare](#autentificare-și-înregistrare)
    *   [Navigare Utilizator](#navigare-utilizator)
    *   [Administrare Conținut](#administrare-conținut)
    *   [Generare Quiz-uri cu AI](#generare-quiz-uri-cu-ai)
4.  [Tehnologii Folosite](#tehnologii-folosite)
5.  [Variabile de Mediu](#variabile-de-mediu)
6.  [Concluzii](#concluzii)

## 1. Introducere

ChemLearn este o aplicație web interactivă destinată învățării chimiei. Utilizatorii pot explora prelegeri, parcurge lecții detaliate și își pot testa cunoștințele prin quiz-uri. Administratorii au la dispoziție un panou dedicat pentru gestionarea conținutului educațional, inclusiv posibilitatea de a genera întrebări pentru quiz-uri cu ajutorul inteligenței artificiale.

Acest document descrie structura proiectului, modulele principale și tehnologiile utilizate.

## 2. Structura Generală a Proiectului

Proiectul este organizat într-o manieră modulară pentru a facilita dezvoltarea, mentenanța și scalabilitatea.

### Directorul Rădăcină

La rădăcina proiectului se găsesc fișierele de configurare principale:

*   `.env`: Stochează variabilele de mediu (chei API Firebase, etc.). **Acest fișier nu este inclus în repository-ul Git.**
*   `.vscode/settings.json`: Configurații specifice pentru editorul Visual Studio Code.
*   `components.json`: Configurația pentru biblioteca de componente ShadCN UI.
*   `next.config.ts`: Fișierul de configurare pentru Next.js (setări pentru TypeScript, ESLint, imagini externe).
*   `package.json`: Definește metadatele proiectului, dependențele (bibliotecile externe) și scripturile NPM (ex: `dev`, `build`, `start`).
*   `README.md`: Documentația principală a proiectului (în engleză).
*   `README.ro.md`: Această documentație (în română).
*   `tailwind.config.ts`: Configurația pentru Tailwind CSS (temă, culori, plugin-uri).
*   `tsconfig.json`: Configurația pentru compilatorul TypeScript (opțiuni de compilare, căi).

### src/

Directorul `src` conține codul sursă principal al aplicației.

#### src/ai/

Acest director conține logica legată de funcționalitățile de inteligență artificială, implementate cu Genkit.

*   `genkit.ts`: Fișierul de configurare și inițializare globală pentru `ai` object-ul Genkit, specificând modelul default și plugin-urile (ex: Google AI).
*   `dev.ts`: Punct de intrare pentru serverul de dezvoltare Genkit (`genkit start`). Importă fluxurile definite.
*   `flows/`: Definește fluxurile Genkit, care orchestrează interacțiunile cu modelele AI.
    *   `generate-quiz-questions.ts`: Un flux care primește conținutul unei lecții și generează un set de întrebări pentru quiz, împreună cu opțiuni și răspunsul corect. Definește schemele Zod pentru input și output.

#### src/app/

Acest director utilizează Next.js App Router pentru definirea rutelor și paginilor aplicației.

*   `layout.tsx`: Layout-ul rădăcină al aplicației. Definește structura HTML de bază, încorporează provider-ii globali (`ThemeProvider` pentru temă, `AuthProvider` pentru autentificare) și include `Toaster` pentru notificări.
*   `globals.css`: Fișier CSS global. Include directivele Tailwind CSS și definește variabilele CSS pentru tema ShadCN UI (culori de fundal, text, primare, secundare, etc., atât pentru modul light cât și dark).
*   `page.tsx`: Pagina principală (landing page) a aplicației.
*   `login/page.tsx`: Pagina de autentificare a utilizatorilor.
*   `signup/page.tsx`: Pagina de înregistrare pentru utilizatori noi.
*   `quizzes/page.tsx`: Pagina publică unde utilizatorii pot vedea și accesa toate quiz-urile disponibile.

*   **`(app)/`**: Un grup de rute destinat utilizatorilor autentificați.
    *   `layout.tsx`: Layout-ul specific pentru secțiunea principală a aplicației (după autentificare). Include bara laterală (Sidebar), antetul (Header) și zona de conținut principală. Gestionează redirecționarea utilizatorilor neautentificați.
    *   `page.tsx`: O pagină de redirectare către `/learn` pentru ruta `/`.
    *   `learn/`: Secțiunea principală de învățare.
        *   `page.tsx`: Dashboard-ul de învățare, afișează prelegeri recomandate și acțiuni rapide.
        *   `lectures/`: Pagini legate de prelegeri.
            *   `page.tsx`: Afișează o listă cu toate prelegerile disponibile.
            *   `[lectureId]/page.tsx`: Afișează detaliile unei prelegeri specifice și lista lecțiilor asociate.
        *   `lessons/`: Pagini legate de lecții.
            *   `[lessonId]/page.tsx`: Afișează conținutul unei lecții specifice, navigare către lecția anterioară/următoare și un link către quiz-ul asociat (dacă există).
        *   `quizzes/`: Pagini legate de quiz-uri.
            *   `[quizId]/take/page.tsx`: Pagina unde utilizatorul poate efectiv parcurge și răspunde la întrebările unui quiz. Include logica de timer și de submitere a răspunsurilor.

*   **`admin/`**: Un grup de rute destinat administratorilor.
    *   `layout.tsx`: Layout-ul specific pentru panoul de administrare. Similar cu cel din `(app)/`, dar cu o bară laterală și navigație specifică administratorilor. Gestionează accesul restricționat doar pentru admini.
    *   `page.tsx`: Dashboard-ul de administrare. Afișează statistici (număr total de prelegeri, lecții, quiz-uri) și activități recente.
    *   `lectures/`: Pagini pentru gestionarea prelegerilor (CRUD - Create, Read, Update, Delete).
        *   `page.tsx`: Afișează un tabel cu toate prelegerile și permite adăugarea uneia noi.
        *   `new/page.tsx`: Formular pentru crearea unei prelegeri noi.
        *   `[lectureId]/edit/page.tsx`: Formular pentru editarea unei prelegeri existente.
    *   `lessons/`: Pagini pentru gestionarea lecțiilor.
        *   `page.tsx`: Afișează un tabel cu toate lecțiile.
        *   `new/page.tsx`: Formular pentru crearea unei lecții noi, inclusiv asocierea cu o prelegere.
        *   `[lessonId]/edit/page.tsx`: Formular pentru editarea unei lecții existente.
    *   `quizzes/`: Pagini pentru gestionarea quiz-urilor.
        *   `page.tsx`: Afișează un tabel cu toate quiz-urile.
        *   `new/page.tsx`: Formular pentru crearea unui quiz nou, inclusiv asocierea cu o lecție/prelegere și adăugarea manuală sau generarea AI a întrebărilor.
        *   `[quizId]/edit/page.tsx`: Formular pentru editarea unui quiz existent.

#### src/components/

Acest director conține componente React reutilizabile, împărțite în subdirectoare pentru o mai bună organizare.

*   `ui/`: Componente de interfață utilizator, majoritatea provenind din biblioteca ShadCN UI (ex: `Button`, `Card`, `Input`, `Dialog`, `Sidebar`, `Table`, etc.). Acestea sunt stilizate cu Tailwind CSS și sunt personalizabile prin `globals.css`.
*   `admin/`: Componente specifice panoului de administrare.
    *   `admin-nav.tsx`: Componenta de navigație pentru bara laterală a administratorului.
    *   `lectures/lecture-form.tsx`, `lectures/lectures-table.tsx`: Formular și tabel pentru gestionarea prelegerilor.
    *   `lessons/lesson-form.tsx`, `lessons/lessons-table.tsx`: Formular și tabel pentru gestionarea lecțiilor.
    *   `quizzes/quiz-form.tsx`, `quizzes/quizzes-table.tsx`, `quizzes/question-form.tsx`: Componente pentru gestionarea quiz-urilor și a întrebărilor acestora.
*   `learn/`: Componente specifice secțiunii de învățare.
    *   `lesson-content-renderer.tsx`: Responsabilă cu afișarea diferitelor tipuri de conținut dintr-o lecție (text, imagine, formulă, video).
    *   `quiz-taker.tsx`: Componenta principală pentru interfața de parcurgere a unui quiz, inclusiv timer, afișarea întrebărilor, selectarea răspunsurilor, submiterea și afișarea rezultatelor.
*   `logo.tsx`: Componenta pentru afișarea logo-ului aplicației.
*   `main-nav.tsx`: Componenta de navigație principală pentru utilizatori.
*   `mode-toggle.tsx`: Buton pentru comutarea între tema light și dark.
*   `theme-provider.tsx`: Provider pentru managementul temei (light/dark/system).
*   `user-nav.tsx`: Meniul drop-down pentru utilizatorul autentificat (afișează avatar, email, număr de quiz-uri completate, opțiuni de profil și logout) sau butoane de Login/Sign Up dacă utilizatorul nu este autentificat.

#### src/contexts/

Acest director conține React Context API-uri pentru managementul stării globale.

*   `auth-context.tsx`: Gestionează starea de autentificare a utilizatorului (inclusiv informații despre utilizator, statusul de admin), funcțiile de `signIn`, `signUp`, `signOut`, gestionarea erorilor de autentificare, și numărul de quiz-uri completate de utilizator. Interacționează cu Firebase Authentication și Firestore pentru a persista și recupera datele utilizatorilor.

#### src/hooks/

Acest director conține hook-uri custom React.

*   `use-mobile.tsx`: Un hook care detectează dacă aplicația este vizualizată pe un dispozitiv mobil (bazat pe lățimea ecranului).
*   `use-toast.ts`: Un hook pentru afișarea notificărilor (toast messages) în interfață, utilizat pentru a informa utilizatorul despre succesul sau eșecul operațiunilor.

#### src/lib/

Acest director conține biblioteci și funcții utilitare.

*   `constants.ts`: Definește constante globale utilizate în aplicație, cum ar fi `APP_NAME`.
*   `firebase.ts`: Centralizează configurarea și inițializarea Firebase SDK (Authentication și Firestore). Exportă instanțele `auth` și `db` pentru a fi utilizate în alte părți ale aplicației.
*   `utils.ts`: Conține funcții utilitare generale, cum ar fi `cn` (o funcție helper pentru a combina clase Tailwind CSS condiționat, preluată din ShadCN UI).

#### src/services/

Acest director conține module care gestionează logica de business și interacțiunea cu backend-ul (Firebase Firestore). Fiecare serviciu este responsabil pentru operațiunile CRUD (Create, Read, Update, Delete) pe o anumită colecție din Firestore și adesea include și funcții de logare a activităților.

*   `activityService.ts`: Responsabil pentru logarea activităților utilizatorilor și administratorilor (ex: crearea unei prelegeri, completarea unui quiz) și pentru recuperarea activităților recente pentru afișarea în dashboard-ul de admin.
*   `lectureService.ts`: Gestionează prelegerile. Include funcții pentru a obține toate prelegerile, o prelegere după ID, a adăuga, actualiza și șterge prelegeri. La ștergerea unei prelegeri, se ocupă și de ștergerea în cascadă a lecțiilor și quiz-urilor asociate.
*   `lessonService.ts`: Gestionează lecțiile. Include funcții pentru a obține lecțiile unei anumite prelegeri, o lecție după ID, a adăuga, actualiza și șterge lecții. La ștergerea unei lecții, șterge și quiz-urile asociate. De asemenea, oferă o funcție pentru a obține toate lecțiile într-un format îmbogățit (cu titlul prelegerii asociate) pentru tabelul din admin.
*   `quizService.ts`: Gestionează quiz-urile. Include funcții pentru a obține un quiz după ID, după ID-ul lecției sau al prelegerii, a adăuga, actualiza și șterge quiz-uri. Oferă o funcție pentru a obține toate quiz-urile într-un format îmbogățit (cu titlul și tipul entității asociate). De asemenea, include logica pentru înregistrarea completării unui quiz de către un utilizator și pentru a obține numărul de quiz-uri completate de un utilizator.

#### src/types/

Acest director conține definițiile TypeScript pentru interfețele și tipurile de date utilizate în întreaga aplicație.

*   `index.ts`: Fișierul principal care exportă toate tipurile definite, cum ar fi `Lecture`, `Lesson`, `LessonContentBlock`, `Quiz`, `Question`, `UserQuizCompletion`, `Activity`, și tipurile pentru datele de formular (`LectureFormData`, `LessonFormData`, `QuizFormData`). Acest lucru asigură consistența și siguranța tipurilor în cod.

## 3. Fluxuri Principale

### Autentificare și Înregistrare
1.  Utilizatorul accesează `/login` sau `/signup`.
2.  Formularele din `LoginPage` sau `SignUpPage` colectează datele.
3.  `AuthContext` (`signIn` sau `signUp`) comunică cu Firebase Authentication.
4.  La succes, datele utilizatorului (inclusiv rolul de admin, dacă e cazul) sunt stocate în `AuthContext` și, pentru utilizatorii noi, se creează un document în colecția `users` din Firestore.
5.  Utilizatorul este redirecționat către `/learn` sau pagina solicitată inițial.
6.  Layout-urile (`(app)/layout.tsx`, `admin/layout.tsx`) verifică starea de autentificare și rolul pentru a permite sau restricționa accesul.

### Navigare Utilizator
1.  După autentificare, utilizatorul ajunge pe `/learn`.
2.  Poate naviga la `/learn/lectures` pentru a vedea toate prelegerile.
3.  Selectând o prelegere, ajunge la `/learn/lectures/[lectureId]` unde vede detalii și lecțiile.
4.  Selectând o lecție, ajunge la `/learn/lessons/[lessonId]` pentru a parcurge conținutul.
5.  Dacă lecția are un quiz, poate naviga la `/learn/quizzes/[quizId]/take`.
6.  Componenta `QuizTaker` gestionează parcurgerea quiz-ului, timer-ul și submiterea.
7.  La submitere, `quizService.logQuizCompletion` salvează rezultatul, iar `AuthContext` actualizează numărul de quiz-uri completate.
8.  Utilizatorul poate vedea lista tuturor quiz-urilor pe `/quizzes`.

### Administrare Conținut
1.  Un utilizator admin accesează `/admin`.
2.  Poate naviga la secțiunile de gestionare pentru prelegeri, lecții sau quiz-uri.
3.  **Prelegeri (`/admin/lectures`)**:
    *   Tabelul (`LecturesTable`) afișează prelegerile.
    *   Butonul "Add New Lecture" duce la `/admin/lectures/new`.
    *   `LectureForm` gestionează crearea/editarea, folosind `lectureService` (`addLecture`, `updateLecture`).
    *   Acțiunile de ștergere (`deleteLecture`) sunt, de asemenea, gestionate prin `lectureService`.
4.  **Lecții (`/admin/lessons`)**:
    *   Similar cu prelegerile, folosind `LessonsTable`, `LessonForm` și `lessonService`.
    *   Formularul de lecții permite asocierea cu o prelegere existentă.
5.  **Quiz-uri (`/admin/quizzes`)**:
    *   Similar, folosind `QuizzesTable`, `QuizForm` (care include `QuestionForm`) și `quizService`.
    *   `QuizForm` permite asocierea cu o lecție sau prelegere și adăugarea/editarea întrebărilor.
    *   Există opțiunea de a genera întrebări folosind AI prin `generateQuizQuestions` flow din `src/ai/`.

### Generare Quiz-uri cu AI
1.  În formularul de creare/editare quiz (`QuizForm`), administratorul poate alege o lecție asociată.
2.  Dacă o lecție este selectată și are conținut text, butonul "Generate with AI" devine activ.
3.  La click, `QuizForm` apelează funcția `generateQuizQuestions` (din `src/ai/flows/generate-quiz-questions.ts`).
4.  Această funcție trimite conținutul lecției către modelul GenAI (configurat în `src/ai/genkit.ts`).
5.  Modelul returnează întrebări, opțiuni și răspunsuri corecte, conform schemei definite.
6.  `QuizForm` adaugă aceste întrebări generate în starea formularului, permițând administratorului să le revizuiască și salveze.

## 4. Tehnologii Folosite

*   **Next.js 15+**: Framework React pentru aplicații web full-stack, utilizând App Router, Server Components și Server Actions.
*   **TypeScript**: Superset al JavaScript care adaugă tipare statică pentru o mai bună calitate și mentenanță a codului.
*   **React**: Bibliotecă JavaScript pentru construirea interfețelor utilizator.
*   **Firebase**: Platformă Google pentru dezvoltarea aplicațiilor mobile și web.
    *   **Firebase Authentication**: Pentru gestionarea autentificării utilizatorilor.
    *   **Cloud Firestore**: Bază de date NoSQL, orientată pe documente, pentru stocarea datelor aplicației (prelegeri, lecții, quiz-uri, utilizatori, activități).
*   **Tailwind CSS**: Framework CSS "utility-first" pentru stilizarea rapidă și consistentă a interfeței.
*   **ShadCN UI**: Colecție de componente UI reutilizabile, construite peste Radix UI și Tailwind CSS, care pot fi copiate și personalizate în proiect.
*   **Genkit (Google AI)**: Toolkit pentru dezvoltarea aplicațiilor bazate pe AI, utilizat aici pentru generarea de întrebări pentru quiz-uri.
*   **Lucide React**: Bibliotecă de iconițe SVG.
*   **React Hook Form**: Bibliotecă pentru gestionarea formularelor în React.
*   **Zod**: Bibliotecă pentru validarea schemelor de date, utilizată pentru validarea input-urilor de formular și a datelor din fluxurile AI.
*   **date-fns**: Bibliotecă pentru manipularea și formatarea datelor calendaristice.
*   **uuid**: Pentru generarea de ID-uri unice.

## 5. Variabile de Mediu

Aplicația necesită configurarea următoarelor variabile de mediu într-un fișier `.env` la rădăcina proiectului:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Adresa de email a contului care va fi considerat administrator implicit
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Cheia API pentru Google AI (Gemini) utilizată de Genkit
GOOGLE_API_KEY=your_google_ai_api_key
```

**Notă:** Asigurați-vă că înlocuiți `your_...` cu valorile corespunzătoare din consola Firebase și Google AI Studio.

## 6. Concluzii

Structura proiectului ChemLearn este gândită pentru a fi scalabilă și ușor de întreținut. Separarea clară a responsabilităților între componente, servicii, contexte și module AI permite dezvoltarea independentă a diferitelor părți ale aplicației. Utilizarea TypeScript și a validării cu Zod contribuie la robustețea codului, în timp ce Next.js și Firebase oferă o platformă solidă pentru dezvoltare și deployment.
