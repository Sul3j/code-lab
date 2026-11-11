// Moduły 1–5: podstawy języka C++.
// Każdy przykład, szablon i rozwiązanie zawiera `using namespace std;`.
import { DEFAULT_TEMPLATE, starter } from './template.js';

export const basicModules = [
  // ───────────────────────────── MODUŁ 1 ─────────────────────────────
  {
    id: 'm1',
    number: 1,
    title: 'Wyjście i zmienne',
    subtitle: 'cout, cin, int, string, double',
    icon: 'Terminal',
    theory: [
      { type: 'p', text: 'Każdy program w C++ zaczyna działanie od funkcji `main()`. To, co chcemy pokazać na ekranie, wysyłamy do strumienia **cout** operatorem `<<` (strzałki „płyną” w stronę cout).' },
      { type: 'code', code: `#include <iostream>
using namespace std;

int main() {
    cout << "Witaj, swiecie!" << endl;
    cout << "2 + 3 = " << 2 + 3 << endl;
    return 0;
}` },
      { type: 'list', items: [
        '`#include <iostream>` – dołącza bibliotekę wejścia/wyjścia (cout, cin).',
        '`using namespace std;` – pozwala pisać `cout` zamiast `std::cout`.',
        '`endl` – przechodzi do nowej linii (to samo robi znak `"\\n"`).',
        'Każda instrukcja kończy się średnikiem `;`.',
      ] },
      { type: 'h', text: 'Zmienne i typy danych' },
      { type: 'p', text: 'Zmienna to „pudełko” w pamięci, które ma **typ**, **nazwę** i **wartość**. Typ mówi, co można w nim przechowywać.' },
      { type: 'table', head: ['Typ', 'Co przechowuje', 'Przykład'], rows: [
        ['int', 'liczby całkowite', 'int wiek = 15;'],
        ['double', 'liczby rzeczywiste (z przecinkiem)', 'double cena = 4.99;'],
        ['char', 'pojedynczy znak (apostrofy)', "char ocena = 'A';"],
        ['string', 'tekst (cudzysłów)', 'string imie = "Ola";'],
        ['bool', 'prawda / fałsz', 'bool zdal = true;'],
      ] },
      { type: 'h', text: 'Wczytywanie danych – cin' },
      { type: 'p', text: 'Strumień **cin** z operatorem `>>` wczytuje dane z klawiatury do zmiennej. Można wczytać kilka wartości naraz: `cin >> a >> b;` – wartości oddzielamy spacją lub Enterem.' },
      { type: 'warn', text: 'Dzielenie dwóch liczb całkowitych daje wynik całkowity: `7 / 2` to `3`, a nie `3.5`! Aby otrzymać wynik z ułamkiem, jedna z liczb musi być typu double, np. `7 / 2.0` albo `(double)a / b`.' },
      { type: 'tip', text: 'Operator `%` (modulo) zwraca resztę z dzielenia: `7 % 2` to `1`. Przyda się do sprawdzania parzystości!' },
    ],
    example: {
      title: 'Przedstaw się',
      description: 'Program pyta o imię i wiek, a potem liczy, ile lat będziesz mieć za 10 lat. Uruchom go i wpisz dane w konsoli.',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string imie;
    int wiek;

    cout << "Jak masz na imie? ";
    cin >> imie;
    cout << "Ile masz lat? ";
    cin >> wiek;

    cout << "Czesc, " << imie << "!" << endl;
    cout << "Za 10 lat bedziesz mial(a) " << wiek + 10 << " lat." << endl;

    double wzrost = 1.65;
    cout << "Przykladowy wzrost: " << wzrost << " m" << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm1t1',
        title: 'Pierwszy program',
        difficulty: 1,
        description: 'Napisz program, który wypisze na ekranie **dokładnie** dwie linie:',
        expectedOutput: 'Witaj w C++!\nTo moj pierwszy program.',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Użyj `cout << "tekst" << endl;` – osobno dla każdej linii.',
          'Tekst w cudzysłowie musi być przepisany dokładnie, łącznie z kropką i wykrzyknikiem.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Witaj w C++!" << endl;
    cout << "To moj pierwszy program." << endl;
    return 0;
}
`,
        tests: [{ input: '', expected: 'Witaj w C++!\nTo moj pierwszy program.' }],
      },
      {
        id: 'm1t2',
        title: 'Suma i iloczyn',
        difficulty: 1,
        description: 'Wczytaj dwie liczby całkowite `a` i `b`. Wypisz ich sumę i iloczyn w formacie:',
        expectedOutput: 'Suma: 7\nIloczyn: 12',
        exampleInput: '3 4',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Zadeklaruj dwie zmienne: `int a, b;`',
          'Wczytaj je jednym poleceniem: `cin >> a >> b;`',
          'Wypisz: `cout << "Suma: " << a + b << endl;`',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int a, b;
    cout << "Podaj dwie liczby: ";
    cin >> a >> b;
    cout << "Suma: " << a + b << endl;
    cout << "Iloczyn: " << a * b << endl;
    return 0;
}
`,
        tests: [
          { input: '3 4', expected: 'Suma: 7\nIloczyn: 12' },
          { input: '-2 5', expected: 'Suma: 3\nIloczyn: -10' },
          { input: '0 100', expected: 'Suma: 100\nIloczyn: 0' },
        ],
      },
      {
        id: 'm1t3',
        title: 'Średnia trzech ocen',
        difficulty: 2,
        description: 'Wczytaj trzy oceny (liczby całkowite) i wypisz ich średnią jako liczbę rzeczywistą. Uważaj na dzielenie całkowite!',
        expectedOutput: 'Srednia: 4.33333',
        exampleInput: '5 4 4',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Suma trzech liczb `int` jest typu `int`. Jeśli podzielisz ją przez `3`, wynik zostanie obcięty.',
          'Podziel przez `3.0` albo zapisz wynik w zmiennej `double`: `double srednia = (a + b + c) / 3.0;`',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int a, b, c;
    cout << "Podaj trzy oceny: ";
    cin >> a >> b >> c;
    double srednia = (a + b + c) / 3.0;
    cout << "Srednia: " << srednia << endl;
    return 0;
}
`,
        tests: [
          { input: '5 4 4', expected: 'Srednia: 4.33333' },
          { input: '3 4 5', expected: 'Srednia: 4' },
          { input: '6 5 5', expected: 'Srednia: 5.33333' },
          { input: '1 2 2', expected: 'Srednia: 1.66667' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 2 ─────────────────────────────
  {
    id: 'm2',
    number: 2,
    title: 'Instrukcje warunkowe',
    subtitle: 'if, else if, else, switch',
    icon: 'GitBranch',
    theory: [
      { type: 'p', text: 'Instrukcja **if** pozwala wykonać fragment kodu tylko wtedy, gdy warunek jest prawdziwy. Gałąź **else** wykona się w przeciwnym razie, a **else if** pozwala sprawdzić kolejne warunki.' },
      { type: 'code', code: `if (temperatura > 25) {
    cout << "Goraco!" << endl;
} else if (temperatura > 10) {
    cout << "Przyjemnie" << endl;
} else {
    cout << "Zimno" << endl;
}` },
      { type: 'h', text: 'Operatory porównania i logiczne' },
      { type: 'table', head: ['Operator', 'Znaczenie', 'Przykład'], rows: [
        ['==', 'równe', 'x == 5'],
        ['!=', 'różne', 'x != 0'],
        ['< > <= >=', 'mniejsze / większe', 'wiek >= 18'],
        ['&&', 'i (oba prawdziwe)', 'x > 0 && x < 10'],
        ['||', 'lub (choć jeden)', 'dzien == 6 || dzien == 7'],
        ['!', 'zaprzeczenie', '!(x > 5)'],
      ] },
      { type: 'warn', text: 'Najczęstszy błąd: `if (x = 5)` to **przypisanie**, a nie porównanie! Do porównania używamy podwójnego `==`.' },
      { type: 'h', text: 'Instrukcja switch' },
      { type: 'p', text: '**switch** wybiera jedną z wielu ścieżek na podstawie wartości liczby całkowitej lub znaku. Każdy `case` kończymy `break;` – bez niego program „przeleci” do następnego przypadku. `default` wykona się, gdy żaden case nie pasuje.' },
      { type: 'code', code: `switch (ocena) {
    case 6: cout << "celujacy"; break;
    case 5: cout << "bardzo dobry"; break;
    default: cout << "inna ocena";
}` },
      { type: 'tip', text: 'Liczba `n` jest parzysta, gdy reszta z dzielenia przez 2 wynosi zero: `n % 2 == 0`.' },
    ],
    example: {
      title: 'Ocena słownie',
      description: 'Program zamienia punkty z testu na ocenę, używając if / else if / else.',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int punkty;
    cout << "Ile punktow (0-100)? ";
    cin >> punkty;

    if (punkty < 0 || punkty > 100) {
        cout << "Niepoprawna liczba punktow!" << endl;
    } else if (punkty >= 90) {
        cout << "Ocena: 5" << endl;
    } else if (punkty >= 70) {
        cout << "Ocena: 4" << endl;
    } else if (punkty >= 50) {
        cout << "Ocena: 3" << endl;
    } else {
        cout << "Ocena: 2 - trzeba poprawic" << endl;
    }
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm2t1',
        title: 'Parzysta czy nieparzysta?',
        difficulty: 1,
        description: 'Wczytaj liczbę całkowitą i wypisz słowo `parzysta` albo `nieparzysta`.',
        expectedOutput: 'parzysta',
        exampleInput: '8',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Użyj operatora reszty z dzielenia: `n % 2`.',
          'Sprawdź warunek `n % 2 == 0` – pamiętaj o podwójnym `==`.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cout << "Podaj liczbe: ";
    cin >> n;
    if (n % 2 == 0) {
        cout << "parzysta" << endl;
    } else {
        cout << "nieparzysta" << endl;
    }
    return 0;
}
`,
        tests: [
          { input: '8', expected: 'parzysta' },
          { input: '7', expected: 'nieparzysta' },
          { input: '0', expected: 'parzysta' },
          { input: '-3', expected: 'nieparzysta' },
        ],
      },
      {
        id: 'm2t2',
        title: 'Największa z trzech',
        difficulty: 2,
        description: 'Wczytaj trzy liczby całkowite i wypisz największą z nich (bez używania funkcji `max`).',
        expectedOutput: 'Max: 9',
        exampleInput: '4 9 2',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Załóż, że największa jest pierwsza: `int najw = a;`',
          'Potem sprawdź po kolei: `if (b > najw) najw = b;` i tak samo dla `c`.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    int najw = a;
    if (b > najw) najw = b;
    if (c > najw) najw = c;
    cout << "Max: " << najw << endl;
    return 0;
}
`,
        tests: [
          { input: '4 9 2', expected: 'Max: 9' },
          { input: '10 3 7', expected: 'Max: 10' },
          { input: '1 2 3', expected: 'Max: 3' },
          { input: '-5 -2 -9', expected: 'Max: -2' },
        ],
      },
      {
        id: 'm2t3',
        title: 'Dzień tygodnia (switch)',
        difficulty: 2,
        description: 'Wczytaj numer dnia (1–7) i wypisz jego nazwę: `Poniedzialek`, `Wtorek`, `Sroda`, `Czwartek`, `Piatek`, `Sobota`, `Niedziela`. Dla innej liczby wypisz `Bledny numer`. Użyj instrukcji **switch**.',
        expectedOutput: 'Sroda',
        exampleInput: '3',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Szkielet: `switch (dzien) { case 1: cout << "Poniedzialek"; break; ... }`',
          'Nie zapomnij o `break;` po każdym przypadku!',
          'Dla błędnych liczb użyj `default:`.',
        ],
        checks: [{ pattern: '\\bswitch\\s*\\(', message: 'Rozwiązanie powinno używać instrukcji switch.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int dzien;
    cout << "Numer dnia: ";
    cin >> dzien;
    switch (dzien) {
        case 1: cout << "Poniedzialek" << endl; break;
        case 2: cout << "Wtorek" << endl; break;
        case 3: cout << "Sroda" << endl; break;
        case 4: cout << "Czwartek" << endl; break;
        case 5: cout << "Piatek" << endl; break;
        case 6: cout << "Sobota" << endl; break;
        case 7: cout << "Niedziela" << endl; break;
        default: cout << "Bledny numer" << endl;
    }
    return 0;
}
`,
        tests: [
          { input: '3', expected: 'Sroda' },
          { input: '1', expected: 'Poniedzialek' },
          { input: '7', expected: 'Niedziela' },
          { input: '9', expected: 'Bledny numer' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 3 ─────────────────────────────
  {
    id: 'm3',
    number: 3,
    title: 'Pętle',
    subtitle: 'for, while, do-while',
    icon: 'Repeat',
    theory: [
      { type: 'p', text: 'Pętla powtarza fragment kodu wiele razy. W C++ mamy trzy główne rodzaje pętli.' },
      { type: 'h', text: 'Pętla for – gdy znamy liczbę powtórzeń' },
      { type: 'code', code: `for (int i = 1; i <= 5; i++) {
    cout << i << " ";
}
// wypisze: 1 2 3 4 5` },
      { type: 'list', items: [
        '`int i = 1` – start (wykona się raz, na początku),',
        '`i <= 5` – warunek sprawdzany przed każdym obrotem,',
        '`i++` – krok wykonywany po każdym obrocie (zwiększ i o 1).',
      ] },
      { type: 'h', text: 'Pętla while – dopóki warunek jest prawdziwy' },
      { type: 'code', code: `int n = 1234, cyfry = 0;
while (n > 0) {
    n = n / 10;   // obetnij ostatnią cyfrę
    cyfry++;
}` },
      { type: 'h', text: 'Pętla do-while – wykona się co najmniej raz' },
      { type: 'code', code: `int liczba;
do {
    cout << "Podaj liczbe dodatnia: ";
    cin >> liczba;
} while (liczba <= 0);` },
      { type: 'p', text: 'Słowo **break** natychmiast przerywa pętlę, a **continue** przeskakuje do następnego obrotu.' },
      { type: 'warn', text: 'Uważaj na nieskończone pętle! Jeśli warunek nigdy nie stanie się fałszywy (np. zapomnisz o `i++`), program będzie działał w nieskończoność. Tutaj możesz go zatrzymać przyciskiem **Stop**.' },
    ],
    example: {
      title: 'Trzy pętle w akcji',
      description: 'Ten sam efekt – suma liczb od 1 do n – liczona na trzy sposoby.',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cout << "Podaj n: ";
    cin >> n;

    int suma1 = 0;
    for (int i = 1; i <= n; i++) {
        suma1 += i;
    }

    int suma2 = 0, j = 1;
    while (j <= n) {
        suma2 += j;
        j++;
    }

    int suma3 = 0, k = 1;
    do {
        suma3 += k;
        k++;
    } while (k <= n);

    cout << "for: " << suma1 << ", while: " << suma2 << ", do-while: " << suma3 << endl;

    cout << "Liczby parzyste do n: ";
    for (int i = 1; i <= n; i++) {
        if (i % 2 != 0) continue;
        cout << i << " ";
    }
    cout << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm3t1',
        title: 'Odliczanie',
        difficulty: 1,
        description: 'Wczytaj liczbę `n` (n ≥ 1). Wypisz w jednej linii liczby od `n` do `1` oddzielone spacjami, a w następnej linii napis `Start!`.',
        expectedOutput: '5 4 3 2 1\nStart!',
        exampleInput: '5',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Pętla może liczyć w dół: `for (int i = n; i >= 1; i--)`.',
          'Po pętli wypisz `endl`, a potem `"Start!"`.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = n; i >= 1; i--) {
        cout << i << " ";
    }
    cout << endl;
    cout << "Start!" << endl;
    return 0;
}
`,
        tests: [
          { input: '5', expected: '5 4 3 2 1\nStart!' },
          { input: '1', expected: '1\nStart!' },
          { input: '10', expected: '10 9 8 7 6 5 4 3 2 1\nStart!' },
        ],
      },
      {
        id: 'm3t2',
        title: 'Suma cyfr',
        difficulty: 2,
        description: 'Wczytaj nieujemną liczbę całkowitą i oblicz sumę jej cyfr, używając pętli **while**.',
        expectedOutput: 'Suma cyfr: 6',
        exampleInput: '123',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Ostatnia cyfra liczby to `n % 10`.',
          'Aby „obciąć” ostatnią cyfrę, wykonaj `n = n / 10;`.',
          'Powtarzaj, dopóki `n > 0`.',
        ],
        checks: [{ pattern: '\\bwhile\\s*\\(', message: 'Rozwiązanie powinno używać pętli while.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    int suma = 0;
    while (n > 0) {
        suma += n % 10;
        n /= 10;
    }
    cout << "Suma cyfr: " << suma << endl;
    return 0;
}
`,
        tests: [
          { input: '123', expected: 'Suma cyfr: 6' },
          { input: '9999', expected: 'Suma cyfr: 36' },
          { input: '0', expected: 'Suma cyfr: 0' },
          { input: '1000005', expected: 'Suma cyfr: 6' },
        ],
      },
      {
        id: 'm3t3',
        title: 'Strażnik zakresu (do-while)',
        difficulty: 2,
        description: 'Program ma wczytywać liczby tak długo, aż użytkownik poda liczbę z przedziału **1–10**. Wtedy wypisuje `OK: X`, gdzie X to poprawna liczba. Użyj pętli **do-while**.',
        expectedOutput: 'OK: 7',
        exampleInput: '15\n-3\n7',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Szkielet: `do { cin >> x; } while (warunek_blednej_liczby);`',
          'Liczba jest błędna, gdy `x < 1 || x > 10`.',
        ],
        checks: [{ pattern: '\\bdo\\s*\\{', message: 'Rozwiązanie powinno używać pętli do-while.' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int x;
    do {
        cout << "Podaj liczbe 1-10: ";
        cin >> x;
    } while (x < 1 || x > 10);
    cout << "OK: " << x << endl;
    return 0;
}
`,
        tests: [
          { input: '15\n-3\n7', expected: 'OK: 7' },
          { input: '1', expected: 'OK: 1' },
          { input: '0\n11\n100\n10', expected: 'OK: 10' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 4 ─────────────────────────────
  {
    id: 'm4',
    number: 4,
    title: 'Tablice jednowymiarowe',
    subtitle: 'indeksy, przechodzenie pętlą',
    icon: 'Rows3',
    theory: [
      { type: 'p', text: 'Tablica to ciąg zmiennych tego samego typu, ułożonych w pamięci jedna za drugą. Do elementów odwołujemy się przez **indeks** w nawiasach kwadratowych.' },
      { type: 'code', code: `int oceny[5] = {5, 4, 3, 5, 6};
cout << oceny[0];   // pierwszy element: 5
cout << oceny[4];   // ostatni element: 6
oceny[2] = 4;       // zmiana trzeciego elementu` },
      { type: 'warn', text: 'Indeksy zaczynają się od **0**! Tablica `int t[5]` ma elementy `t[0]` … `t[4]`. Odwołanie do `t[5]` to wyjście poza tablicę – poważny błąd (to środowisko go wykryje i pokaże).' },
      { type: 'h', text: 'Przechodzenie tablicy pętlą' },
      { type: 'code', code: `const int N = 5;
int t[N];
for (int i = 0; i < N; i++) {
    cin >> t[i];        // wczytanie
}
int suma = 0;
for (int i = 0; i < N; i++) {
    suma += t[i];       // sumowanie
}` },
      { type: 'tip', text: 'Gdy liczba elementów jest podawana przez użytkownika, utwórz tablicę „z zapasem” (np. `int t[1000];`) i używaj tylko pierwszych `n` elementów.' },
      { type: 'p', text: 'Szukanie minimum/maksimum: przyjmij pierwszy element jako kandydata, a potem porównuj z kolejnymi.' },
    ],
    example: {
      title: 'Temperatury tygodnia',
      description: 'Tablica 7 temperatur: średnia, najcieplejszy dzień i wypisanie od końca.',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    const int DNI = 7;
    double temp[DNI] = {12.5, 14.0, 9.5, 11.0, 16.5, 18.0, 15.5};

    double suma = 0;
    int najcieplejszy = 0;
    for (int i = 0; i < DNI; i++) {
        suma += temp[i];
        if (temp[i] > temp[najcieplejszy]) {
            najcieplejszy = i;
        }
    }

    cout << "Srednia temperatura: " << suma / DNI << endl;
    cout << "Najcieplej bylo w dniu nr " << najcieplejszy + 1
         << " (" << temp[najcieplejszy] << " st.)" << endl;

    cout << "Od konca: ";
    for (int i = DNI - 1; i >= 0; i--) {
        cout << temp[i] << " ";
    }
    cout << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm4t1',
        title: 'Odwróć kolejność',
        difficulty: 1,
        description: 'Wczytaj liczbę `n` (1 ≤ n ≤ 100), a potem `n` liczb całkowitych. Wypisz je w odwrotnej kolejności, w jednej linii, oddzielone spacjami.',
        expectedOutput: '5 4 3 2 1',
        exampleInput: '5\n1 2 3 4 5',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Utwórz tablicę z zapasem: `int t[100];`',
          'Wczytuj pętlą `for (int i = 0; i < n; i++) cin >> t[i];`',
          'Wypisuj od ostatniego indeksu `n - 1` do `0`.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> t[i];
    }
    for (int i = n - 1; i >= 0; i--) {
        cout << t[i] << " ";
    }
    cout << endl;
    return 0;
}
`,
        tests: [
          { input: '5\n1 2 3 4 5', expected: '5 4 3 2 1' },
          { input: '1\n42', expected: '42' },
          { input: '4\n-1 0 7 3', expected: '3 7 0 -1' },
        ],
      },
      {
        id: 'm4t2',
        title: 'Statystyki tablicy',
        difficulty: 2,
        description: 'Wczytaj `n` (1 ≤ n ≤ 100) i `n` liczb całkowitych. Wypisz najmniejszą, największą wartość oraz sumę w formacie:',
        expectedOutput: 'Min: 1\nMax: 9\nSuma: 22',
        exampleInput: '5\n4 9 1 6 2',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Najpierw wczytaj wszystkie liczby do tablicy.',
          'Zainicjalizuj `mn` i `mx` pierwszym elementem: `int mn = t[0], mx = t[0];`',
          'W pętli porównuj każdy element z `mn` i `mx` i dodawaj go do sumy.',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    int t[100];
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> t[i];
    }
    int mn = t[0], mx = t[0], suma = 0;
    for (int i = 0; i < n; i++) {
        if (t[i] < mn) mn = t[i];
        if (t[i] > mx) mx = t[i];
        suma += t[i];
    }
    cout << "Min: " << mn << endl;
    cout << "Max: " << mx << endl;
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
        tests: [
          { input: '5\n4 9 1 6 2', expected: 'Min: 1\nMax: 9\nSuma: 22' },
          { input: '1\n-7', expected: 'Min: -7\nMax: -7\nSuma: -7' },
          { input: '6\n-3 10 0 -8 5 5', expected: 'Min: -8\nMax: 10\nSuma: 9' },
        ],
      },
      {
        id: 'm4t3',
        title: 'Powyżej średniej',
        difficulty: 3,
        description: 'Wczytaj `n` (1 ≤ n ≤ 100) i `n` liczb całkowitych. Policz, ile z nich jest **większych od średniej** wszystkich liczb.',
        expectedOutput: 'Powyzej sredniej: 2',
        exampleInput: '5\n1 2 3 4 5',
        starter: DEFAULT_TEMPLATE,
        hints: [
          'Potrzebujesz dwóch przejść po tablicy: najpierw policz średnią, potem porównuj elementy.',
          'Średnia powinna być typu double: `double sr = (double)suma / n;`',
        ],
        solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    int t[100];
    cin >> n;
    int suma = 0;
    for (int i = 0; i < n; i++) {
        cin >> t[i];
        suma += t[i];
    }
    double sr = (double)suma / n;
    int ile = 0;
    for (int i = 0; i < n; i++) {
        if (t[i] > sr) ile++;
    }
    cout << "Powyzej sredniej: " << ile << endl;
    return 0;
}
`,
        tests: [
          { input: '5\n1 2 3 4 5', expected: 'Powyzej sredniej: 2' },
          { input: '4\n2 2 2 2', expected: 'Powyzej sredniej: 0' },
          { input: '3\n1 2 4', expected: 'Powyzej sredniej: 1' },
          { input: '6\n10 0 0 0 0 1', expected: 'Powyzej sredniej: 1' },
        ],
      },
    ],
  },

  // ───────────────────────────── MODUŁ 5 ─────────────────────────────
  {
    id: 'm5',
    number: 5,
    title: 'Funkcje i procedury',
    subtitle: 'return, void, referencja &',
    icon: 'FunctionSquare',
    theory: [
      { type: 'p', text: 'Funkcja to nazwany fragment kodu, który można wielokrotnie wywoływać. Dzięki funkcjom program jest krótszy i czytelniejszy.' },
      { type: 'code', code: `#include <iostream>
using namespace std;

// typ_zwracany nazwa(parametry)
int kwadrat(int x) {
    return x * x;      // zwraca wynik
}

int main() {
    cout << kwadrat(5) << endl;  // 25
    return 0;
}` },
      { type: 'list', items: [
        'Funkcja zwracająca wartość ma typ (np. `int`, `double`) i kończy się instrukcją `return`.',
        'Procedura ma typ **void** – nic nie zwraca, tylko coś wykonuje (np. wypisuje).',
        'Funkcję trzeba zdefiniować **przed** miejscem użycia (lub zadeklarować jej nagłówek).',
      ] },
      { type: 'h', text: 'Przekazywanie przez wartość i przez referencję' },
      { type: 'p', text: 'Domyślnie funkcja dostaje **kopię** argumentu – zmiany wewnątrz nie wpływają na oryginał. Jeśli dopiszemy `&` przy typie parametru, funkcja dostaje **referencję**, czyli pracuje na oryginalnej zmiennej.' },
      { type: 'code', code: `void dodajJeden(int x)  { x++; }   // zmienia kopię
void dodajJeden2(int &x) { x++; }   // zmienia oryginał

int a = 5;
dodajJeden(a);   // a nadal = 5
dodajJeden2(a);  // a = 6` },
      { type: 'tip', text: 'Referencji używamy, gdy funkcja ma zmienić przekazane zmienne (np. zamienić je miejscami) lub „zwrócić” więcej niż jedną wartość.' },
      { type: 'h', text: 'Zmienne lokalne i globalne' },
      { type: 'p', text: 'Zmienna zadeklarowana wewnątrz funkcji jest **lokalna** – istnieje tylko w tej funkcji. Zmienna zadeklarowana poza wszystkimi funkcjami jest **globalna** – widzą ją wszystkie funkcje. Lepiej unikać zmiennych globalnych i przekazywać dane przez parametry.' },
    ],
    example: {
      title: 'Kalkulator na funkcjach',
      description: 'Funkcja zwracająca wynik, procedura void i parametry przez referencję.',
      code: `#include <iostream>
#include <string>
using namespace std;

double pole_kola(double r) {
    return 3.14159 * r * r;
}

void linia(int dlugosc) {
    for (int i = 0; i < dlugosc; i++) cout << "-";
    cout << endl;
}

// zwraca "dwa wyniki" przez referencje
void dzielenie(int a, int b, int &iloraz, int &reszta) {
    iloraz = a / b;
    reszta = a % b;
}

int main() {
    linia(20);
    cout << "Pole kola o r=2: " << pole_kola(2) << endl;

    int q, r;
    dzielenie(17, 5, q, r);
    cout << "17 / 5 = " << q << " reszty " << r << endl;
    linia(20);
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'm5t1',
        title: 'Własna potęga',
        difficulty: 1,
        description: 'Napisz funkcję `int potega(int a, int b)`, która za pomocą pętli liczy `a` do potęgi `b` (b ≥ 0). W `main` wczytaj `a` i `b` i wypisz wynik.',
        expectedOutput: '2^10 = 1024',
        exampleInput: '2 10',
        starter: starter({
          before: `int potega(int a, int b) {
    // uzupelnij funkcje
    return 1;
}`,
          body: '    int a, b;\n    cin >> a >> b;\n    cout << a << "^" << b << " = " << potega(a, b) << endl;\n',
        }),
        hints: [
          'Zacznij od `int wynik = 1;`',
          'Pomnóż `wynik` przez `a` dokładnie `b` razy: `for (int i = 0; i < b; i++) wynik *= a;`',
          'Na końcu `return wynik;`',
        ],
        checks: [{ pattern: 'int\\s+potega\\s*\\(', message: 'Zdefiniuj funkcję int potega(int a, int b).' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int potega(int a, int b) {
    int wynik = 1;
    for (int i = 0; i < b; i++) {
        wynik *= a;
    }
    return wynik;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << a << "^" << b << " = " << potega(a, b) << endl;
    return 0;
}
`,
        tests: [
          { input: '2 10', expected: '2^10 = 1024' },
          { input: '5 0', expected: '5^0 = 1' },
          { input: '3 4', expected: '3^4 = 81' },
          { input: '-2 3', expected: '-2^3 = -8' },
        ],
      },
      {
        id: 'm5t2',
        title: 'Zamiana przez referencję',
        difficulty: 2,
        description: 'Napisz procedurę `void zamien(int &a, int &b)`, która zamienia wartości dwóch zmiennych. W `main` wczytaj dwie liczby, wywołaj `zamien` i wypisz:',
        expectedOutput: 'a = 5, b = 3',
        exampleInput: '3 5',
        starter: starter({
          before: `void zamien(int &a, int &b) {
    // uzupelnij procedure
}`,
          body: '    int a, b;\n    cin >> a >> b;\n    zamien(a, b);\n    cout << "a = " << a << ", b = " << b << endl;\n',
        }),
        hints: [
          'Potrzebujesz zmiennej pomocniczej: `int tmp = a;`',
          'Potem `a = b;` i `b = tmp;`',
          'Znak `&` w parametrach sprawia, że zmiany są widoczne w `main`.',
        ],
        checks: [{ pattern: 'void\\s+zamien\\s*\\(\\s*int\\s*&', message: 'Procedura powinna mieć nagłówek void zamien(int &a, int &b).' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

void zamien(int &a, int &b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main() {
    int a, b;
    cin >> a >> b;
    zamien(a, b);
    cout << "a = " << a << ", b = " << b << endl;
    return 0;
}
`,
        tests: [
          { input: '3 5', expected: 'a = 5, b = 3' },
          { input: '-1 8', expected: 'a = 8, b = -1' },
          { input: '7 7', expected: 'a = 7, b = 7' },
        ],
      },
      {
        id: 'm5t3',
        title: 'NWD – algorytm Euklidesa',
        difficulty: 3,
        description: 'Napisz funkcję `int nwd(int a, int b)` zwracającą największy wspólny dzielnik dwóch liczb dodatnich (algorytm Euklidesa). Wypisz wynik w formacie:',
        expectedOutput: 'NWD: 6',
        exampleInput: '12 18',
        starter: starter({
          before: `int nwd(int a, int b) {
    // uzupelnij funkcje
    return 0;
}`,
          body: '    int a, b;\n    cin >> a >> b;\n    cout << "NWD: " << nwd(a, b) << endl;\n',
        }),
        hints: [
          'Algorytm: dopóki `b != 0`, zastąp parę `(a, b)` parą `(b, a % b)`.',
          'Potrzebujesz zmiennej pomocniczej: `int r = a % b; a = b; b = r;`',
          'Gdy `b` stanie się zerem, wynikiem jest `a`. (Można też rekurencyjnie: `return b == 0 ? a : nwd(b, a % b);`)',
        ],
        checks: [{ pattern: 'int\\s+nwd\\s*\\(', message: 'Zdefiniuj funkcję int nwd(int a, int b).' }],
        solution: `#include <iostream>
#include <string>
using namespace std;

int nwd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << "NWD: " << nwd(a, b) << endl;
    return 0;
}
`,
        tests: [
          { input: '12 18', expected: 'NWD: 6' },
          { input: '17 5', expected: 'NWD: 1' },
          { input: '100 75', expected: 'NWD: 25' },
          { input: '7 7', expected: 'NWD: 7' },
        ],
      },
    ],
  },
];
