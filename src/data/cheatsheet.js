// Ściąga (Cheat Sheet) – krótkie wyjaśnienia najważniejszych pojęć.
export const CHEATSHEET = [
  {
    id: 'basics',
    title: 'Budowa programu',
    icon: 'FileCode2',
    items: [
      {
        title: 'Dlaczego piszemy using namespace std;?',
        text: 'Elementy biblioteki standardowej C++ (cout, cin, string, endl…) leżą w **przestrzeni nazw** `std` – to jak „nazwisko rodowe”, które odróżnia je od innych elementów o tych samych nazwach. Bez tej linijki trzeba by pisać pełne nazwy: `std::cout`, `std::string`. Linijka `using namespace std;` mówi kompilatorowi: „szukaj nazw także w std”, dzięki czemu kod jest krótszy i czytelniejszy. W tym środowisku jest ona obowiązkowa w każdym programie.',
        code: `#include <iostream>
using namespace std;   // teraz wystarczy cout zamiast std::cout

int main() {
    cout << "Krocej i czytelniej!" << endl;
    return 0;
}`,
      },
      {
        title: 'Co robi średnik ;?',
        text: 'Średnik kończy **instrukcję** – tak jak kropka kończy zdanie. Kompilator nie patrzy na nowe linie, tylko na średniki, dlatego jego brak to najczęstszy błąd początkujących. Średnika **nie** stawiamy po nawiasach `if (...)`, `for (...)`, `while (...)` ani po `}` zamykającym funkcję – ale **stawiamy** po `}` kończącym definicję klasy lub struktury.',
        code: `int x = 5;          // srednik konczy instrukcje
if (x > 3) {        // tu bez srednika!
    x++;
}
class A { };        // po klasie - srednik obowiazkowy`,
      },
      {
        title: '#include – dołączanie bibliotek',
        text: 'Dyrektywa `#include` wkleja do programu gotową bibliotekę. Najczęściej używane: `<iostream>` (cout, cin), `<string>` (napisy), `<cmath>` (sqrt, pow), `<iomanip>` (setw, setprecision), `<vector>`, `<algorithm>` (sort).',
      },
      {
        title: 'Funkcja main i return 0',
        text: 'Wykonanie każdego programu zaczyna się od funkcji `int main()`. Instrukcja `return 0;` kończy program i informuje system, że wszystko poszło dobrze (inna liczba oznacza błąd).',
      },
      {
        title: 'Komentarze',
        text: 'Komentarze są ignorowane przez kompilator i służą do opisywania kodu. `// komentarz` do końca linii, `/* ... */` – komentarz wielolinijkowy. Skrót w edytorze: **Ctrl + /**.',
      },
    ],
  },
  {
    id: 'vars',
    title: 'Zmienne i typy',
    icon: 'Box',
    items: [
      {
        title: 'Zmienna lokalna a globalna',
        text: 'Zmienna **lokalna** jest zadeklarowana wewnątrz funkcji lub bloku `{ }` – istnieje tylko tam i znika po jego zakończeniu. Zmienna **globalna** jest zadeklarowana poza wszystkimi funkcjami – widać ją w całym programie i automatycznie ma wartość 0. Zmienne globalne łatwo przypadkiem zmienić w innej części programu, dlatego lepiej przekazywać dane przez parametry funkcji.',
        code: `int licznik = 0;        // globalna - widoczna wszedzie

void zwieksz() {
    licznik++;          // dziala - globalna
    int pomocnicza = 1; // lokalna - tylko w tej funkcji
}

int main() {
    zwieksz();
    cout << licznik;    // 1
    // cout << pomocnicza;  // BLAD - tu jej nie ma
}`,
      },
      {
        title: 'Podstawowe typy danych',
        text: '`int` – liczby całkowite (ok. ±2 mld), `long long` – bardzo duże całkowite, `double` – liczby rzeczywiste, `char` – jeden znak w apostrofach `\'a\'`, `string` – tekst w cudzysłowie `"abc"`, `bool` – `true` / `false`.',
      },
      {
        title: 'Stałe – const',
        text: 'Słowo `const` tworzy stałą – wartości nie można później zmienić. Używamy go np. dla rozmiarów tablic: `const int N = 100;`. Próba zmiany stałej kończy się błędem kompilacji.',
      },
      {
        title: 'Inicjalizacja zmiennych',
        text: 'Zmienna lokalna bez wartości początkowej (`int x;`) w prawdziwym C++ zawiera **przypadkowe śmieci** z pamięci. Zawsze nadawaj wartość, zanim zaczniesz z niej korzystać, np. `int suma = 0;`.',
      },
    ],
  },
  {
    id: 'ops',
    title: 'Operatory',
    icon: 'Calculator',
    items: [
      {
        title: '= a ==',
        text: '`=` to **przypisanie** (włóż wartość do zmiennej), `==` to **porównanie** (czy są równe?). Zapis `if (x = 5)` jest błędem logicznym – zawsze będzie prawdziwy. Środowisko ostrzeże Cię przed nim.',
      },
      {
        title: 'Dzielenie całkowite i modulo',
        text: 'Gdy obie liczby są typu int, wynik dzielenia jest obcinany: `7 / 2 == 3`. Aby dostać `3.5`, użyj `7 / 2.0` lub `(double)a / b`. Operator `%` zwraca resztę: `7 % 2 == 1` – działa tylko dla liczb całkowitych.',
      },
      {
        title: 'i++ a ++i',
        text: 'Oba zwiększają zmienną o 1. Różnica jest tylko w wyrażeniach: `i++` zwraca starą wartość, a `++i` nową. `int a = 5; int b = a++;` → b = 5, a = 6. `int c = ++a;` → c = 7, a = 7.',
      },
      {
        title: 'Skrócone przypisania',
        text: '`x += 3` to `x = x + 3`. Analogicznie: `-=`, `*=`, `/=`, `%=`.',
      },
      {
        title: 'Operatory logiczne',
        text: '`&&` (i) – prawda, gdy oba warunki prawdziwe. `||` (lub) – prawda, gdy choć jeden prawdziwy. `!` (nie) – odwraca wartość. Przykład: `if (wiek >= 13 && wiek <= 19)` – nastolatek.',
      },
    ],
  },
  {
    id: 'io',
    title: 'Wejście i wyjście',
    icon: 'ArrowLeftRight',
    items: [
      {
        title: 'cout i cin',
        text: '`cout << x` – wypisz (strzałki w stronę cout), `cin >> x` – wczytaj (strzałki w stronę zmiennej). Można łączyć: `cin >> a >> b;`, `cout << a << " " << b;`.',
      },
      {
        title: 'endl a "\\n"',
        text: 'Oba przenoszą kursor do nowej linii. `endl` dodatkowo opróżnia bufor wyjścia (wymusza natychmiastowe wypisanie), więc jest odrobinę wolniejsze. W szkolnych programach można używać zamiennie.',
      },
      {
        title: 'getline – całe zdanie',
        text: '`cin >> s` wczytuje jedno słowo (do spacji). `getline(cin, s)` wczytuje całą linię. Uwaga: po `cin >> liczba` w buforze zostaje znak Enter – przed `getline` wywołaj `cin.ignore();`.',
      },
      {
        title: 'Formatowanie liczb',
        text: 'Biblioteka `<iomanip>`: `cout << fixed << setprecision(2) << x;` wypisze x z dokładnie 2 miejscami po przecinku. `setw(5)` ustawia szerokość następnej wypisywanej wartości (przydatne w tabelach).',
      },
      {
        title: 'Polskie znaki',
        text: 'W wielu konsolach (np. w Windows) polskie litery w `cout` wyświetlają się niepoprawnie, dlatego w zadaniach piszemy bez ogonków: „Srednia”, „Dlugosc”.',
      },
    ],
  },
  {
    id: 'memory',
    title: 'Referencje i wskaźniki',
    icon: 'MemoryStick',
    items: [
      {
        title: 'Referencja &',
        text: 'Referencja to **inna nazwa** tej samej zmiennej. `int &r = x;` – od teraz r i x to to samo miejsce w pamięci. W parametrach funkcji (`void f(int &x)`) pozwala funkcji zmieniać zmienne z main.',
      },
      {
        title: 'Wskaźnik *',
        text: 'Wskaźnik przechowuje **adres** zmiennej. `int *p = &x;` – p wskazuje na x. `*p` – wartość pod adresem (dereferencja). Wskaźnik może zmieniać, na co wskazuje, i może być pusty (`nullptr`); referencja – nie.',
      },
      {
        title: 'new i delete',
        text: '`new` rezerwuje pamięć podczas działania programu (na tzw. stercie), `delete` ją zwalnia. Dla tablic: `int *t = new int[n];` … `delete[] t;`. Brak delete = wyciek pamięci.',
      },
    ],
  },
  {
    id: 'oop',
    title: 'Klasy i obiekty',
    icon: 'Boxes',
    items: [
      {
        title: 'Klasa a obiekt',
        text: 'Klasa to projekt (np. „Samochód”: kolor, prędkość, metoda jedź()). Obiekt to konkretny egzemplarz zbudowany według projektu (`Samochod mojeAuto;`).',
      },
      {
        title: 'public, private, protected',
        text: '`private` – dostęp tylko z metod tej klasy; `public` – dostęp z każdego miejsca; `protected` – jak private, ale dostępne też w klasach dziedziczących. Domyślnie w `class` wszystko jest private, w `struct` – public.',
      },
      {
        title: 'Konstruktor i destruktor',
        text: 'Konstruktor (nazwa jak klasa, bez typu) wywołuje się przy tworzeniu obiektu i ustawia jego pola. Destruktor `~Nazwa()` wywołuje się, gdy obiekt znika (np. na końcu bloku `{ }`).',
      },
      {
        title: 'Kropka a strzałka',
        text: 'Zwykły obiekt: `obiekt.metoda()`. Wskaźnik na obiekt: `wsk->metoda()` (to skrót od `(*wsk).metoda()`).',
      },
    ],
  },
  {
    id: 'errors',
    title: 'Częste błędy',
    icon: 'Bug',
    items: [
      { title: 'Brak średnika', text: 'Komunikat „brakuje średnika” wskazuje zwykle linię **przed** miejscem, w którym kompilator się zorientował. Sprawdź koniec poprzedniej linii.' },
      { title: 'Wielkość liter', text: 'C++ rozróżnia wielkość liter: `Cout`, `Main`, `String` to nie to samo co `cout`, `main`, `string`.' },
      { title: 'Apostrofy i cudzysłów', text: '`\'a\'` to jeden znak (char), `"a"` to napis (string). `"tekst"` w apostrofach to błąd.' },
      { title: 'Wyjście poza tablicę', text: 'Tablica `int t[5]` ma indeksy 0–4. Pętla `for (int i = 0; i <= 5; i++)` wyjdzie poza tablicę – użyj `<` zamiast `<=`.' },
      { title: 'Nieskończona pętla', text: 'Jeśli program „wisi”, sprawdź, czy warunek pętli kiedyś stanie się fałszywy i czy nie zapomniałeś o `i++`. Przycisk **Stop** przerywa program.' },
      { title: 'Średnik po if/for', text: '`if (x > 0);` albo `for (...);` – średnik kończy instrukcję, więc blok `{ }` poniżej wykona się zawsze (lub tylko raz).' },
    ],
  },
];
