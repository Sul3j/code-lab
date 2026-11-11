// Tematy 9–16 kursu. Każdy kod zawiera `using namespace std;`.
import { starter } from './template.js';
import { LEGACY, legacyTask } from './legacy.js';

// szablon do zadania z getline (zawiera using namespace std)
const DEFAULT_TEMPLATE_GETLINE = `#include <iostream>
#include <string>
using namespace std;

int main() {
    string tekst;
    // wczytaj linie i zamien litery na wielkie
    return 0;
}
`;

export const course2 = [
  // ─────────────── 9 ───────────────
  {
    id: 'k09',
    title: 'Tablice dynamiczne i wektory',
    subtitle: 'new[], delete[], vector',
    icon: 'Layers',
    practice: true,
    theory: [
      { type: 'p', text: 'Rozmiar tablicy statycznej musi być znany z góry. Gdy liczbę elementów podaje użytkownik, tworzymy **tablicę dynamiczną** operatorem `new[]` – a po użyciu zwalniamy ją przez `delete[]` (z nawiasami!).' },
      { type: 'code', code: `int n;
cin >> n;
int *tab = new int[n];     // tablica n liczb na stercie
for (int i = 0; i < n; i++) tab[i] = i * i;
delete[] tab;              // zwolnienie calej tablicy` },
      { type: 'warn', text: 'Tablicę z `new[]` zwalniamy przez `delete[]`, a nie samo `delete`. Zapomniane `delete[]` to wyciek pamięci.' },
      { type: 'h', text: 'vector – tablica, która sama rośnie' },
      { type: 'p', text: 'Klasa **vector** z biblioteki `<vector>` to wygodniejsza tablica dynamiczna: sama zarządza pamięcią, zna swój rozmiar i potrafi się powiększać. W nowoczesnym C++ to podstawowy wybór.' },
      { type: 'table', head: ['Operacja', 'Opis'], rows: [
        ['vector<int> v;', 'pusty wektor liczb całkowitych'],
        ['vector<int> v(5, 0);', '5 elementów o wartości 0'],
        ['vector<int> v = {3, 1, 2};', 'wektor z listy wartości'],
        ['v.push_back(x)', 'dodaj element na koniec'],
        ['v.pop_back()', 'usuń ostatni element'],
        ['v.size()', 'liczba elementów'],
        ['v[i] / v.at(i)', 'dostęp do elementu (at sprawdza zakres)'],
        ['v.empty() / v.clear()', 'czy pusty / usuń wszystko'],
        ['sort(v.begin(), v.end())', 'sortowanie (biblioteka <algorithm>)'],
      ] },
      { type: 'tip', text: 'Wektor wektorów to macierz o dowolnych wymiarach: `vector<vector<int>> m(w, vector<int>(k, 0));`' },
    ],
    example: {
      title: 'Tablica dynamiczna kontra vector',
      description: 'Ten sam problem rozwiązany dwa razy: ręcznie z new[]/delete[] oraz wektorem.',
      code: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n = 5;
    int *kwadraty = new int[n];
    for (int i = 0; i < n; i++) kwadraty[i] = (i + 1) * (i + 1);
    cout << "Tablica dynamiczna: ";
    for (int i = 0; i < n; i++) cout << kwadraty[i] << " ";
    cout << endl;
    delete[] kwadraty;

    vector<int> v = {7, 3, 9};
    v.push_back(1);
    v.push_back(5);
    sort(v.begin(), v.end());
    cout << "Wektor posortowany (" << v.size() << " el.): ";
    for (int i = 0; i < v.size(); i++) cout << v[i] << " ";
    cout << endl;

    v.pop_back();
    cout << "Po pop_back ostatni to " << v.back() << endl;
    return 0;
}
`,
    },
    tasks: [
      legacyTask('m8t3'),
      {
        id: 'k09t2',
        title: 'Zbieraj aż do zera',
        difficulty: 2,
        description: 'Wczytuj liczby całkowite do wektora `vector<int>`, aż użytkownik poda `0` (zera nie dodawaj). Następnie wypisz liczbę elementów, ich sumę oraz elementy w odwrotnej kolejności (w jednej linii):',
        expectedOutput: 'Ilosc: 3\nSuma: 12\n7 3 2',
        exampleInput: '2 3 7 0',
        starter: starter({ includes: ['vector'], body: '    vector<int> v;\n    // Twoj kod tutaj\n' }),
        hints: [
          'Pętla: `int x; cin >> x; while (x != 0) { v.push_back(x); cin >> x; }`',
          'Rozmiar: `v.size()`.',
          'Od końca: `for (int i = v.size() - 1; i >= 0; i--)`.',
        ],
        checks: [
          { pattern: 'vector\\s*<\\s*int\\s*>', message: 'Użyj wektora vector<int>.' },
          { pattern: 'push_back', message: 'Dodawaj elementy metodą push_back.' },
        ],
        solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<int> v;
    int x;
    cin >> x;
    while (x != 0) {
        v.push_back(x);
        cin >> x;
    }
    int suma = 0;
    for (int i = 0; i < v.size(); i++) suma += v[i];
    cout << "Ilosc: " << v.size() << endl;
    cout << "Suma: " << suma << endl;
    for (int i = v.size() - 1; i >= 0; i--) {
        cout << v[i] << " ";
    }
    cout << endl;
    return 0;
}
`,
        tests: [
          { input: '2 3 7 0', expected: 'Ilosc: 3\nSuma: 12\n7 3 2' },
          { input: '5\n0', expected: 'Ilosc: 1\nSuma: 5\n5' },
          { input: '-1 -2 10 4 0', expected: 'Ilosc: 4\nSuma: 11\n4 10 -2 -1' },
        ],
      },
    ],
  },

  // ─────────────── 10 ───────────────
  {
    id: 'k10',
    title: 'Pętla foreach',
    subtitle: 'for (typ x : kolekcja), auto, referencja',
    icon: 'RefreshCw',
    practice: true,
    theory: [
      { type: 'p', text: 'Pętla **foreach** (zakresowa pętla for, C++11) przechodzi po wszystkich elementach tablicy, wektora lub napisu – bez licznika i bez ryzyka wyjścia poza zakres.' },
      { type: 'code', code: `int t[] = {4, 8, 15, 16, 23, 42};
for (int x : t) {
    cout << x << " ";
}
// czytamy: "dla kazdego x z t"` },
      { type: 'h', text: 'Kopia czy referencja?' },
      { type: 'list', items: [
        '`for (int x : v)` – `x` jest **kopią** elementu; zmiana `x` nie zmienia wektora.',
        '`for (int &x : v)` – `x` jest **referencją** do elementu; `x *= 2` podwaja elementy wektora.',
        '`for (const string &s : imiona)` – referencja tylko do odczytu: bez kopiowania dużych obiektów i bez ryzyka zmiany.',
        '`for (auto x : v)` – kompilator sam dobiera typ elementu.',
      ] },
      { type: 'code', code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {1, 2, 3};
    for (int &x : v) x *= 10;      // zmienia elementy
    for (auto x : v) cout << x << " ";
    cout << endl;

    string s = "kot";
    for (char c : s) cout << c << "-";
    cout << endl;
    return 0;
}` },
      { type: 'tip', text: 'Foreach nie podaje numeru elementu. Jeśli potrzebujesz indeksu (np. „element nr 3”), użyj zwykłej pętli for.' },
    ],
    example: {
      title: 'Statystyki ocen',
      description: 'Foreach do sumowania, szukania maksimum i modyfikacji elementów przez referencję.',
      code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<int> oceny = {4, 5, 3, 6, 4, 5};

    int suma = 0, najlepsza = 0;
    for (int o : oceny) {
        suma += o;
        if (o > najlepsza) najlepsza = o;
    }
    cout << "Srednia: " << (double)suma / oceny.size() << endl;
    cout << "Najlepsza: " << najlepsza << endl;

    for (int &o : oceny) {
        if (o < 6) o++;        // podnosimy kazda ocene (referencja!)
    }
    cout << "Po podwyzce: ";
    for (auto o : oceny) cout << o << " ";
    cout << endl;

    string imiona[3] = {"Ala", "Ola", "Ela"};
    for (const string &imie : imiona) {
        cout << "Czesc, " << imie << "!" << endl;
    }
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'k10t1',
        title: 'Parzyste w wektorze',
        difficulty: 1,
        description: 'Wczytaj `n` i `n` liczb do wektora. Używając **pętli foreach**, policz liczby parzyste i ich sumę. Wypisz:',
        expectedOutput: 'Parzyste: 3, suma: 12',
        exampleInput: '5\n1 2 4 5 6',
        starter: starter({ includes: ['vector'], body: '    int n;\n    cin >> n;\n    vector<int> v(n);\n    for (int i = 0; i < n; i++) cin >> v[i];\n    // policz parzyste petla foreach\n' }),
        hints: [
          'Pętla foreach: `for (int x : v) { ... }`',
          'Warunek parzystości: `x % 2 == 0`.',
        ],
        checks: [{ pattern: 'for\\s*\\([^;()]*:[^;]*\\)', message: 'Użyj pętli foreach: for (int x : v).' }],
        solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    int ile = 0, suma = 0;
    for (int x : v) {
        if (x % 2 == 0) {
            ile++;
            suma += x;
        }
    }
    cout << "Parzyste: " << ile << ", suma: " << suma << endl;
    return 0;
}
`,
        tests: [
          { input: '5\n1 2 4 5 6', expected: 'Parzyste: 3, suma: 12' },
          { input: '3\n1 3 5', expected: 'Parzyste: 0, suma: 0' },
          { input: '4\n-2 0 10 7', expected: 'Parzyste: 3, suma: 8' },
        ],
      },
      {
        id: 'k10t2',
        title: 'KRZYCZĄCY TEKST',
        difficulty: 2,
        description: 'Wczytaj całą linię tekstu (`getline`). Za pomocą **pętli foreach z referencją** (`for (char &c : tekst)`) zamień wszystkie litery na wielkie i wypisz tekst.',
        expectedOutput: 'ALA MA KOTA!',
        exampleInput: 'Ala ma kota!',
        starter: DEFAULT_TEMPLATE_GETLINE,
        hints: [
          'Wczytanie linii: `getline(cin, tekst);`',
          'Referencja `char &c` pozwala zmieniać znaki napisu wewnątrz pętli.',
          'Zamiana: `c = toupper(c);`',
        ],
        checks: [{ pattern: 'for\\s*\\(\\s*(char|auto)\\s*&', message: 'Użyj pętli foreach z referencją: for (char &c : tekst).' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string tekst;
    getline(cin, tekst);
    for (char &c : tekst) {
        c = toupper(c);
    }
    cout << tekst << endl;
    return 0;
}
`,
        tests: [
          { input: 'Ala ma kota!', expected: 'ALA MA KOTA!' },
          { input: 'c++ 2024', expected: 'C++ 2024' },
          { input: 'JUZ WIELKIE', expected: 'JUZ WIELKIE' },
        ],
      },
    ],
  },

  // ─────────────── 11 ───────────────
  {
    id: 'k11',
    title: 'C-napisy',
    subtitle: "tablice char, znak '\\0', <cstring>",
    icon: 'Quote',
    practice: false,
    theory: [
      { type: 'p', text: 'Zanim w C++ pojawił się typ `string`, napisy przechowywano w **tablicach znaków** (tak robi się w języku C – stąd nazwa „C-napisy”). Koniec napisu oznacza specjalny znak `\'\\0\'` (bajt o wartości 0), dlatego tablica musi mieć o jedno miejsce więcej niż liczba liter.' },
      { type: 'code', code: `char imie[10] = "Ola";
// w pamieci: 'O' 'l' 'a' '\\0' ? ? ? ? ? ?

char miasto[] = "Krakow";   // rozmiar 7 (6 liter + '\\0')
cout << imie << " z " << miasto;` },
      { type: 'h', text: 'Funkcje z biblioteki <cstring>' },
      { type: 'table', head: ['Funkcja', 'Działanie'], rows: [
        ['strlen(s)', 'długość napisu (bez \\0)'],
        ['strcpy(cel, zrodlo)', 'kopiuje napis (zamiast cel = zrodlo)'],
        ['strcat(cel, zrodlo)', 'dopisuje zrodlo na koniec cel'],
        ['strcmp(a, b)', '0 gdy równe, < 0 gdy a przed b, > 0 gdy a po b'],
        ['strncpy(cel, zr, n)', 'kopiuje najwyżej n znaków'],
        ['atoi(s) / atof(s)', 'zamiana napisu na liczbę'],
      ] },
      { type: 'warn', text: 'C-napisów nie można przypisywać (`a = b`) ani porównywać przez `==` – trzeba używać `strcpy` i `strcmp`. Gdy tablica docelowa jest za mała, `strcpy` i `strcat` piszą poza nią (**przepełnienie bufora** – źródło wielu luk bezpieczeństwa). To środowisko wykryje taki błąd.' },
      { type: 'h', text: 'Wczytywanie C-napisów' },
      { type: 'p', text: '`cin >> tab;` wczytuje jedno słowo, a `cin.getline(tab, rozmiar);` całą linię (ale nie więcej niż rozmiar − 1 znaków).' },
      { type: 'tip', text: 'W nowych programach używaj typu `string` – jest bezpieczniejszy i wygodniejszy. C-napisy warto znać, bo spotkasz je w starszym kodzie, w bibliotekach języka C i w funkcjach takich jak `printf`.' },
    ],
    example: {
      title: 'Operacje na C-napisach',
      description: 'Długość, kopiowanie, łączenie i porównywanie tablic znaków. Wpisz swoje imię i nazwisko.',
      input: 'Jan Kowalski',
      code: `#include <iostream>
#include <string>
#include <cstring>
using namespace std;

int main() {
    char imie[30];
    cout << "Podaj imie i nazwisko: ";
    cin.getline(imie, 30);
    cout << "Wczytano: " << imie << " (" << strlen(imie) << " znakow)" << endl;

    char powitanie[50] = "Czesc, ";
    strcat(powitanie, imie);
    strcat(powitanie, "!");
    cout << powitanie << endl;

    char kopia[30];
    strcpy(kopia, imie);
    if (strcmp(kopia, imie) == 0) {
        cout << "Kopia jest identyczna" << endl;
    }

    // policz litery 'a' - petla do znaku konca '\\0'
    int ile = 0;
    for (int i = 0; imie[i] != '\\0'; i++) {
        if (imie[i] == 'a') ile++;
    }
    cout << "Litera 'a' wystepuje " << ile << " razy" << endl;
    cout << "atoi(\\"42\\") + 1 = " << atoi("42") + 1 << endl;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 12 ───────────────
  {
    id: 'k12',
    title: 'Łańcuchy typu string',
    subtitle: 'string, length, substr, find, getline',
    icon: 'Type',
    practice: false,
    theory: [
      ...LEGACY.m7.theory,
      { type: 'h', text: 'Porównanie: string a C-napis' },
      { type: 'table', head: ['Operacja', 'string', 'C-napis (char[])'], rows: [
        ['przypisanie', 's = t;', 'strcpy(s, t);'],
        ['łączenie', 's = s + t;', 'strcat(s, t);'],
        ['porównanie', 's == t', 'strcmp(s, t) == 0'],
        ['długość', 's.length()', 'strlen(s)'],
      ] },
    ],
    example: LEGACY.m7.example,
    tasks: LEGACY.m7.tasks,
  },

  // ─────────────── 13 ───────────────
  {
    id: 'k13',
    title: 'Struktury',
    subtitle: 'struct, pola, tablice struktur',
    icon: 'Package',
    practice: false,
    theory: [
      { type: 'p', text: '**Struktura** (`struct`) łączy kilka zmiennych różnych typów w jeden nowy typ. Zamiast trzech osobnych tablic: imion, nazwisk i średnich – mamy jedną tablicę uczniów.' },
      { type: 'code', code: `struct Uczen {
    string imie;
    int klasa;
    double srednia;
};                          // <- srednik!

Uczen u;
u.imie = "Ola";             // dostep do pola: kropka
u.klasa = 2;
u.srednia = 4.75;

Uczen v = {"Kuba", 3, 4.2};  // inicjalizacja lista` },
      { type: 'list', items: [
        'Do pól odwołujemy się operatorem **kropki**: `u.imie`; przez wskaźnik – **strzałką**: `wsk->imie`.',
        'Struktury można przypisywać w całości (`v = u;` kopiuje wszystkie pola).',
        'Pole struktury może być inną strukturą, np. `struct Odcinek { Punkt a, b; };`.',
        'Tablica struktur: `Uczen klasa[30];` – a potem `klasa[i].srednia`.',
      ] },
      { type: 'h', text: 'Struktury w funkcjach' },
      { type: 'p', text: 'Strukturę przekazujemy zwykle przez **referencję do stałej** (`const Uczen &u`) – unikamy kopiowania, a funkcja nie może jej zmienić. Gdy funkcja ma zmienić strukturę, używamy zwykłej referencji `Uczen &u`.' },
      { type: 'tip', text: 'W C++ struktura może też mieć metody i konstruktory – różni się od klasy tylko tym, że jej pola są domyślnie publiczne.' },
    ],
    example: {
      title: 'Dziennik klasy',
      description: 'Tablica struktur, struktura zagnieżdżona i funkcje przyjmujące strukturę przez referencję.',
      code: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct Punkt {
    double x, y;
};

struct Uczen {
    string imie;
    double srednia;
};

double odleglosc(const Punkt &a, const Punkt &b) {
    return sqrt(pow(b.x - a.x, 2) + pow(b.y - a.y, 2));
}

void podwyzka(Uczen &u) {
    u.srednia += 0.5;
}

int main() {
    Punkt a = {0, 0}, b = {3, 4};
    cout << "Odleglosc: " << odleglosc(a, b) << endl;

    Uczen klasa[3] = { {"Ala", 4.5}, {"Kuba", 3.8}, {"Ola", 5.1} };
    podwyzka(klasa[1]);

    int najlepszy = 0;
    for (int i = 0; i < 3; i++) {
        cout << klasa[i].imie << ": " << klasa[i].srednia << endl;
        if (klasa[i].srednia > klasa[najlepszy].srednia) najlepszy = i;
    }
    cout << "Najlepsza srednia: " << klasa[najlepszy].imie << endl;

    Uczen *wsk = &klasa[2];
    cout << "Przez wskaznik: " << wsk->imie << endl;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 14 ───────────────
  {
    id: 'k14',
    title: 'Unie',
    subtitle: 'union – wspólna pamięć dla pól',
    icon: 'Combine',
    practice: false,
    theory: [
      { type: 'p', text: '**Unia** (`union`) wygląda jak struktura, ale wszystkie jej pola zajmują **to samo miejsce w pamięci**. W danej chwili sensowną wartość ma tylko jedno pole – to, do którego ostatnio coś zapisano. Rozmiar unii jest równy rozmiarowi jej największego pola.' },
      { type: 'code', code: `union Wartosc {
    int calkowita;
    double rzeczywista;
    char znak;
};

Wartosc w;
w.calkowita = 65;
cout << w.znak;      // 'A' - te same bajty odczytane jako znak!
cout << sizeof(Wartosc);   // 8 (rozmiar double)` },
      { type: 'table', head: ['', 'struct', 'union'], rows: [
        ['pamięć', 'każde pole ma własne miejsce', 'wszystkie pola dzielą jedno miejsce'],
        ['rozmiar', 'suma rozmiarów pól', 'rozmiar największego pola'],
        ['użycie pól', 'wszystkie naraz', 'jedno naraz'],
      ] },
      { type: 'h', text: 'Do czego służą unie?' },
      { type: 'list', items: [
        'Oszczędzanie pamięci, gdy obiekt przechowuje „jedną z kilku” wartości.',
        'Tzw. **unia z etykietą**: struktura zawiera pole-enum mówiące, które pole unii jest aktualnie używane.',
        'Podgląd surowych bajtów danych (np. jak zapisana jest liczba `float`).',
      ] },
      { type: 'warn', text: 'Odczyt innego pola niż ostatnio zapisane daje „surowe” bajty zinterpretowane jako inny typ – wynik zwykle nie ma sensu. Unie mogą zawierać tylko proste typy (w tym środowisku: liczby, znaki, bool); `string` w unii jest niedozwolony.' },
      { type: 'tip', text: 'W nowoczesnym C++ zamiast unii z etykietą często używa się `std::variant` – ale zasada działania jest ta sama.' },
    ],
    example: {
      title: 'Wspólna pamięć i unia z etykietą',
      description: 'Zapis do jednego pola zmienia odczyt pozostałych. Etykieta (enum) mówi, które pole jest aktualne.',
      code: `#include <iostream>
#include <string>
using namespace std;

union Liczba {
    int i;
    float f;
    char c;
};

enum Typ { CALKOWITA, RZECZYWISTA };

struct Pomiar {
    Typ typ;           // etykieta: ktore pole unii jest wazne
    Liczba wartosc;
};

void wypisz(const Pomiar &p) {
    if (p.typ == CALKOWITA) cout << "int: " << p.wartosc.i << endl;
    else cout << "float: " << p.wartosc.f << endl;
}

int main() {
    cout << "sizeof(Liczba) = " << sizeof(Liczba) << endl;

    Liczba u;
    u.i = 66;
    cout << "u.i = " << u.i << ", u.c = " << u.c << endl;

    u.f = 1.5f;
    cout << "Po zapisie f = 1.5: u.i = " << u.i << " (surowe bajty!)" << endl;

    Pomiar a, b;
    a.typ = CALKOWITA;
    a.wartosc.i = 42;
    b.typ = RZECZYWISTA;
    b.wartosc.f = 36.6f;
    wypisz(a);
    wypisz(b);
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 15 ───────────────
  {
    id: 'k15',
    title: 'Funkcje',
    subtitle: 'parametry, return, void, referencje',
    icon: 'FunctionSquare',
    practice: false,
    theory: [
      ...LEGACY.m5.theory,
      { type: 'h', text: 'Deklaracja i definicja' },
      { type: 'p', text: 'Funkcję można najpierw **zadeklarować** (sam nagłówek ze średnikiem: `int suma(int a, int b);`) przed `main`, a **zdefiniować** (z ciałem) później. Parametrom można też nadać **wartości domyślne**: `void linia(int n = 10)` – wtedy wywołanie `linia()` użyje 10.' },
    ],
    example: LEGACY.m5.example,
    tasks: [legacyTask('m5t1'), legacyTask('m5t2')],
  },

  // ─────────────── 16 ───────────────
  {
    id: 'k16',
    title: 'Funkcje rekurencyjne',
    subtitle: 'warunek stopu, silnia, Fibonacci',
    icon: 'Infinity',
    practice: false,
    theory: [
      { type: 'p', text: 'Funkcja **rekurencyjna** to funkcja, która wywołuje samą siebie. Rozwiązuje problem, sprowadzając go do mniejszej wersji tego samego problemu.' },
      { type: 'code', code: `int silnia(int n) {
    if (n <= 1) return 1;         // warunek stopu
    return n * silnia(n - 1);     // wywolanie rekurencyjne
}
// silnia(4) = 4 * silnia(3) = 4 * 3 * silnia(2) = 4 * 3 * 2 * 1 = 24` },
      { type: 'list', items: [
        '**Warunek stopu** (przypadek bazowy) – sytuacja, w której funkcja zwraca wynik bez dalszych wywołań.',
        '**Krok rekurencyjny** – wywołanie funkcji dla mniejszych danych, które zbliżają się do warunku stopu.',
        'Każde wywołanie ma własne zmienne lokalne, odkładane na **stosie wywołań**.',
      ] },
      { type: 'warn', text: 'Brak warunku stopu (albo dane, które się do niego nie zbliżają) powoduje nieskończoną rekurencję i **przepełnienie stosu**. To środowisko przerwie taki program z czytelnym komunikatem.' },
      { type: 'h', text: 'Rekurencja a iteracja' },
      { type: 'p', text: 'Każdą rekurencję da się zastąpić pętlą. Rekurencja bywa krótsza i bardziej naturalna (np. NWD, potęgowanie, przeszukiwanie), ale naiwna rekurencja może być bardzo wolna – `fib(n)` liczy te same wartości wiele razy.' },
      { type: 'table', head: ['Problem', 'Zapis rekurencyjny'], rows: [
        ['silnia', 'n! = n · (n−1)!, 0! = 1'],
        ['Fibonacci', 'F(n) = F(n−1) + F(n−2), F(0)=0, F(1)=1'],
        ['potęga', 'a^n = a · a^(n−1), a^0 = 1'],
        ['NWD', 'nwd(a, b) = nwd(b, a % b), nwd(a, 0) = a'],
      ] },
    ],
    example: {
      title: 'Klasyki rekurencji',
      description: 'Silnia, ciąg Fibonacciego, potęga, suma cyfr i odwracanie napisu – wszystko rekurencyjnie.',
      code: `#include <iostream>
#include <string>
using namespace std;

long long silnia(int n) {
    if (n <= 1) return 1;
    return n * silnia(n - 1);
}

int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

long long potega(int a, int n) {
    if (n == 0) return 1;
    return a * potega(a, n - 1);
}

int sumaCyfr(int n) {
    if (n < 10) return n;
    return n % 10 + sumaCyfr(n / 10);
}

string odwroc(string s) {
    if (s.length() <= 1) return s;
    return odwroc(s.substr(1)) + s[0];
}

int main() {
    cout << "10! = " << silnia(10) << endl;
    cout << "Fibonacci: ";
    for (int i = 0; i <= 12; i++) cout << fib(i) << " ";
    cout << endl;
    cout << "2^20 = " << potega(2, 20) << endl;
    cout << "Suma cyfr 98765 = " << sumaCyfr(98765) << endl;
    cout << "Odwrocony: " << odwroc("rekurencja") << endl;
    return 0;
}
`,
    },
    tasks: [legacyTask('m5t3')],
  },
];
