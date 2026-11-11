// Tematy 17–23 kursu. Każdy kod zawiera `using namespace std;`.
import { LEGACY } from './legacy.js';

export const course3 = [
  // ─────────────── 17 ───────────────
  {
    id: 'k17',
    title: 'Funkcje przeciążone',
    subtitle: 'ta sama nazwa, różne parametry',
    icon: 'Copy',
    practice: false,
    theory: [
      { type: 'p', text: '**Przeciążanie funkcji** to definiowanie kilku funkcji o **tej samej nazwie**, które różnią się **listą parametrów** (liczbą lub typami). Kompilator sam wybiera wersję pasującą do argumentów wywołania.' },
      { type: 'code', code: `int pole(int a)               { return a * a; }        // kwadrat
double pole(double a, double b) { return a * b; }      // prostokat
double pole(double r)         { return 3.14159 * r * r; } // kolo

pole(3);        // wersja int        -> 9
pole(2.0, 5.0); // wersja 2 x double -> 10
pole(1.0);      // wersja double     -> 3.14159` },
      { type: 'list', items: [
        'Funkcje przeciążone muszą różnić się **parametrami** – sam inny typ zwracany nie wystarczy.',
        'Dzięki przeciążaniu jedna nazwa (np. `wypisz`, `max`) działa dla różnych typów danych.',
        'Biblioteka standardowa korzysta z tego stale: `abs` działa dla `int` i dla `double`, a `cout <<` dla wszystkich typów.',
      ] },
      { type: 'warn', text: 'Gdy argumenty pasują równie dobrze do kilku wersji (np. `f(int, double)` i `f(double, int)` wywołane jako `f(1, 1)`), kompilator zgłasza błąd **niejednoznaczności**.' },
      { type: 'tip', text: 'Alternatywą dla przeciążania bywają **parametry domyślne**: `void linia(int n = 10, char z = \'-\')` – jedna funkcja obsługuje wywołania `linia()`, `linia(5)` i `linia(5, \'*\')`.' },
    ],
    example: {
      title: 'Jedna nazwa – wiele wersji',
      description: 'Kompilator dobiera wersję funkcji na podstawie typów i liczby argumentów.',
      code: `#include <iostream>
#include <string>
using namespace std;

void wypisz(int x)    { cout << "int: " << x << endl; }
void wypisz(double x) { cout << "double: " << x << endl; }
void wypisz(char x)   { cout << "char: " << x << endl; }
void wypisz(string x) { cout << "string: " << x << endl; }

int maks(int a, int b) { return a > b ? a : b; }
int maks(int a, int b, int c) { return maks(maks(a, b), c); }
double maks(double a, double b) { return a > b ? a : b; }

void linia(int n = 10, char znak = '-') {
    for (int i = 0; i < n; i++) cout << znak;
    cout << endl;
}

int main() {
    wypisz(42);
    wypisz(3.14);
    wypisz('Z');
    wypisz(string("tekst"));

    cout << maks(3, 8) << " " << maks(4, 9, 2) << " " << maks(2.5, 1.5) << endl;

    linia();
    linia(5);
    linia(15, '*');
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 18 ───────────────
  {
    id: 'k18',
    title: 'Funkcje inline',
    subtitle: 'wstawianie kodu zamiast wywołania',
    icon: 'Zap',
    practice: false,
    theory: [
      { type: 'p', text: 'Wywołanie funkcji ma swój koszt: trzeba przekazać argumenty, skoczyć do kodu funkcji i wrócić. Słowo kluczowe **inline** sugeruje kompilatorowi, by w miejscu wywołania **wstawił treść funkcji** – jak gdyby kod został przepisany.' },
      { type: 'code', code: `inline int kwadrat(int x) {
    return x * x;
}

int y = kwadrat(5);
// kompilator moze potraktowac to jak: int y = 5 * 5;` },
      { type: 'list', items: [
        '`inline` to tylko **sugestia** – nowoczesne kompilatory same decydują, co wstawić, a co wywołać normalnie.',
        'Nadaje się do **krótkich**, często wywoływanych funkcji (1–3 linijki), np. `kwadrat`, `maks`, gettery w klasach.',
        'Metody zdefiniowane bezpośrednio wewnątrz klasy są automatycznie traktowane jak inline.',
        'Długie lub rekurencyjne funkcje inline nie przyspieszają programu, a mogą zwiększyć jego rozmiar.',
      ] },
      { type: 'h', text: 'inline a makro #define' },
      { type: 'p', text: 'W języku C podobny efekt dawały makra: `#define KW(x) x*x`. Makro to jednak zwykła podmiana tekstu – `KW(2+3)` daje `2+3*2+3 = 11`, a nie 25! Funkcja inline jest bezpieczna: sprawdza typy i najpierw oblicza argument.' },
      { type: 'tip', text: 'Z punktu widzenia działania programu funkcja inline zachowuje się dokładnie jak zwykła funkcja – różnica dotyczy tylko sposobu, w jaki kompilator tłumaczy kod.' },
    ],
    example: {
      title: 'inline kontra makro',
      description: 'Funkcja inline liczy poprawnie, makro – przez podmianę tekstu – daje zaskakujący wynik.',
      code: `#include <iostream>
#include <string>
using namespace std;

#define KW_MAKRO(x) x * x

inline int kwadrat(int x) {
    return x * x;
}

inline bool parzysta(int n) { return n % 2 == 0; }
inline int maks(int a, int b) { return a > b ? a : b; }

int main() {
    cout << "kwadrat(2 + 3) = " << kwadrat(2 + 3) << endl;   // 25
    cout << "KW_MAKRO(2 + 3) = " << KW_MAKRO(2 + 3) << endl; // 2 + 3 * 2 + 3 = 11!

    int suma = 0;
    for (int i = 1; i <= 10; i++) {
        if (parzysta(i)) suma += kwadrat(i);
    }
    cout << "Suma kwadratow liczb parzystych 1..10: " << suma << endl;
    cout << "maks(7, 4) = " << maks(7, 4) << endl;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 19 ───────────────
  {
    id: 'k19',
    title: 'Funkcje matematyczne',
    subtitle: 'biblioteka <cmath>',
    icon: 'Sigma',
    practice: false,
    theory: [
      { type: 'p', text: 'Biblioteka **<cmath>** zawiera gotowe funkcje matematyczne. Większość z nich przyjmuje i zwraca liczby typu `double`.' },
      { type: 'table', head: ['Funkcja', 'Działanie', 'Przykład'], rows: [
        ['sqrt(x)', 'pierwiastek kwadratowy', 'sqrt(16) → 4'],
        ['pow(a, b)', 'potęga a do b', 'pow(2, 10) → 1024'],
        ['abs(x) / fabs(x)', 'wartość bezwzględna', 'abs(-5) → 5'],
        ['round(x)', 'zaokrąglenie do najbliższej całkowitej', 'round(2.5) → 3'],
        ['floor(x)', 'zaokrąglenie w dół (podłoga)', 'floor(2.7) → 2'],
        ['ceil(x)', 'zaokrąglenie w górę (sufit)', 'ceil(2.1) → 3'],
        ['trunc(x)', 'obcięcie części ułamkowej', 'trunc(-2.7) → -2'],
        ['fmod(a, b)', 'reszta z dzielenia liczb rzeczywistych', 'fmod(7.5, 2) → 1.5'],
        ['sin, cos, tan', 'funkcje trygonometryczne (kąt w radianach!)', 'sin(M_PI / 2) → 1'],
        ['log(x), log10(x)', 'logarytm naturalny / dziesiętny', 'log10(1000) → 3'],
        ['exp(x)', 'e do potęgi x', 'exp(1) → 2.71828'],
        ['hypot(a, b)', 'przeciwprostokątna √(a² + b²)', 'hypot(3, 4) → 5'],
      ] },
      { type: 'warn', text: 'Funkcje trygonometryczne przyjmują kąt w **radianach**. Zamiana stopni: `rad = stopnie * M_PI / 180`. Pierwiastek z liczby ujemnej daje `nan` (not a number).' },
      { type: 'tip', text: 'Do porównywania wyników obliczeń na double nie używaj `==` – przez błędy zaokrągleń `0.1 + 0.2 == 0.3` jest fałszem! Sprawdzaj, czy różnica jest bardzo mała: `fabs(a - b) < 1e-9`.' },
    ],
    example: {
      title: 'Kalkulator naukowy',
      description: 'Równanie kwadratowe, trygonometria, zaokrąglenia i pułapka porównywania liczb double.',
      code: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

int main() {
    // rownanie kwadratowe x^2 - 3x + 2 = 0
    double a = 1, b = -3, c = 2;
    double delta = b * b - 4 * a * c;
    if (delta >= 0) {
        double x1 = (-b - sqrt(delta)) / (2 * a);
        double x2 = (-b + sqrt(delta)) / (2 * a);
        cout << "x1 = " << x1 << ", x2 = " << x2 << endl;
    }

    cout << "2^10 = " << pow(2, 10) << endl;
    cout << "sin(30 st.) = " << sin(30 * M_PI / 180) << endl;
    cout << "Przeciwprostokatna 3, 4: " << hypot(3, 4) << endl;

    double x = -2.7;
    cout << "round: " << round(x) << ", floor: " << floor(x)
         << ", ceil: " << ceil(x) << ", trunc: " << trunc(x) << endl;

    double s = 0.1 + 0.2;
    cout << "0.1 + 0.2 == 0.3 ? " << (s == 0.3) << endl;
    cout << "fabs(s - 0.3) < 1e-9 ? " << (fabs(s - 0.3) < 1e-9) << endl;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 20 ───────────────
  {
    id: 'k20',
    title: 'Funkcje znakowe',
    subtitle: 'biblioteka <cctype>, kody ASCII',
    icon: 'CaseSensitive',
    practice: false,
    theory: [
      { type: 'p', text: 'Każdy znak (`char`) jest w pamięci liczbą – swoim **kodem ASCII**. Np. `\'A\'` = 65, `\'a\'` = 97, `\'0\'` = 48. Dlatego na znakach można wykonywać działania: `\'a\' + 1` to `\'b\'`, a `c - \'0\'` zamienia cyfrę-znak na liczbę.' },
      { type: 'h', text: 'Funkcje z biblioteki <cctype>' },
      { type: 'table', head: ['Funkcja', 'Zwraca prawdę, gdy znak to…'], rows: [
        ['isalpha(c)', 'litera'],
        ['isdigit(c)', 'cyfra 0–9'],
        ['isalnum(c)', 'litera lub cyfra'],
        ['isspace(c)', 'biały znak (spacja, tabulator, nowa linia)'],
        ['isupper(c) / islower(c)', 'wielka / mała litera'],
        ['ispunct(c)', 'znak interpunkcyjny'],
      ] },
      { type: 'table', head: ['Funkcja', 'Działanie'], rows: [
        ['toupper(c)', 'zamienia na wielką literę'],
        ['tolower(c)', 'zamienia na małą literę'],
      ] },
      { type: 'warn', text: '`toupper` i `tolower` zwracają **int** (kod znaku). `cout << toupper(\'a\')` wypisze `65`! Zapisz wynik do zmiennej `char` albo rzutuj: `cout << (char)toupper(\'a\')`.' },
      { type: 'tip', text: 'Szyfr Cezara, liczenie liter, sprawdzanie haseł, zamiana wielkości liter – to typowe zadania, w których przydają się funkcje znakowe.' },
    ],
    example: {
      title: 'Analiza tekstu i szyfr Cezara',
      description: 'Klasyfikacja znaków, kody ASCII i przesuwanie liter w alfabecie.',
      code: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s = "Haslo123 ma 2 spacje!";
    int litery = 0, cyfry = 0, spacje = 0, inne = 0;
    for (char c : s) {
        if (isalpha(c)) litery++;
        else if (isdigit(c)) cyfry++;
        else if (isspace(c)) spacje++;
        else inne++;
    }
    cout << "Litery: " << litery << ", cyfry: " << cyfry
         << ", spacje: " << spacje << ", inne: " << inne << endl;

    cout << "Kod 'A' = " << (int)'A' << ", znak 98 = " << (char)98 << endl;
    cout << "'7' - '0' = " << '7' - '0' << endl;
    cout << "toupper('q') bez rzutowania: " << toupper('q')
         << ", z rzutowaniem: " << (char)toupper('q') << endl;

    string tekst = "Ala ma kota", szyfr = "";
    for (char c : tekst) {
        if (islower(c)) c = 'a' + (c - 'a' + 3) % 26;
        else if (isupper(c)) c = 'A' + (c - 'A' + 3) % 26;
        szyfr += c;
    }
    cout << "Szyfr Cezara: " << szyfr << endl;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 21 ───────────────
  {
    id: 'k21',
    title: 'Konwersja typu danych',
    subtitle: 'niejawna, jawna, static_cast, string ↔ liczba',
    icon: 'ArrowLeftRight',
    practice: false,
    theory: [
      { type: 'p', text: '**Konwersja** (rzutowanie) to zamiana wartości jednego typu na inny. C++ wykonuje część konwersji **niejawnie** (automatycznie), a inne trzeba zapisać **jawnie**.' },
      { type: 'h', text: 'Konwersje niejawne' },
      { type: 'list', items: [
        'W działaniu `int` z `double` liczba całkowita zamieniana jest na `double`: `5 + 2.5` → `7.5`.',
        'Przypisanie `double` do `int` **obcina** część ułamkową: `int x = 3.99;` → 3 (środowisko pokaże ostrzeżenie).',
        '`char` zamienia się na `int` (kod znaku), a liczba na `bool`: 0 → `false`, cokolwiek innego → `true`.',
      ] },
      { type: 'h', text: 'Konwersje jawne' },
      { type: 'table', head: ['Zapis', 'Opis'], rows: [
        ['(double)x', 'rzutowanie w stylu C'],
        ['double(x)', 'rzutowanie w stylu funkcyjnym'],
        ['static_cast<double>(x)', 'rzutowanie w stylu C++ (zalecane – widoczne i bezpieczniejsze)'],
      ] },
      { type: 'code', code: `int suma = 7, n = 2;
double sr1 = suma / n;                       // 3   - dzielenie calkowite!
double sr2 = (double)suma / n;               // 3.5
double sr3 = static_cast<double>(suma) / n;  // 3.5` },
      { type: 'h', text: 'Napisy i liczby' },
      { type: 'table', head: ['Funkcja', 'Działanie', 'Przykład'], rows: [
        ['to_string(x)', 'liczba → string', 'to_string(42) → "42"'],
        ['stoi(s)', 'string → int', 'stoi("123") → 123'],
        ['stod(s)', 'string → double', 'stod("2.5") → 2.5'],
        ["c - '0'", 'znak cyfry → liczba', "'7' - '0' → 7"],
        ["char('0' + d)", 'cyfra → znak', "char('0' + 5) → '5'"],
      ] },
      { type: 'warn', text: '`stoi("abc")` kończy program błędem (wyjątek invalid_argument). Rzutowanie `(int)` nie zaokrągla, tylko obcina: `(int)2.9 == 2`, `(int)-2.9 == -2` – do zaokrąglenia użyj `round()`.' },
    ],
    example: {
      title: 'Konwersje w praktyce',
      description: 'Dzielenie całkowite kontra rzeczywiste, obcinanie, znaki jako liczby i zamiana napisów na liczby.',
      code: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

int main() {
    int punkty = 47, zadania = 10;
    cout << "Srednia (zle): " << punkty / zadania << endl;
    cout << "Srednia (dobrze): " << static_cast<double>(punkty) / zadania << endl;

    double cena = 19.99;
    int zl = (int)cena;
    int gr = (int)round((cena - zl) * 100);
    cout << cena << " = " << zl << " zl " << gr << " gr" << endl;

    char c = 'A';
    int kod = c;
    char nastepny = c + 1;
    cout << "Kod " << c << ": " << kod << ", nastepny znak: " << nastepny << endl;

    string rok = "2024";
    int za10 = stoi(rok) + 10;
    string opis = "Za 10 lat bedzie " + to_string(za10);
    cout << opis << endl;

    string liczba = "907";
    int sumaCyfr = 0;
    for (char z : liczba) sumaCyfr += z - '0';
    cout << "Suma cyfr " << liczba << " = " << sumaCyfr << endl;

    bool flaga = 5;
    cout << "bool z 5: " << flaga << ", z 0: " << (bool)0 << endl;
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 22 ───────────────
  {
    id: 'k22',
    title: 'Funkcje we/wy',
    subtitle: 'cin/cout, manipulatory, getline, printf/scanf',
    icon: 'Keyboard',
    practice: false,
    theory: [
      { type: 'p', text: 'C++ udostępnia dwa zestawy narzędzi wejścia/wyjścia: **strumienie** `cin`/`cout` z biblioteki `<iostream>` oraz odziedziczone po języku C funkcje `printf`/`scanf` z `<cstdio>`.' },
      { type: 'h', text: 'Strumienie i manipulatory (<iomanip>)' },
      { type: 'table', head: ['Manipulator / funkcja', 'Działanie'], rows: [
        ['endl', 'nowa linia + opróżnienie bufora'],
        ['setw(n)', 'szerokość następnej wartości (wyrównanie w tabelach)'],
        ['setfill(c)', 'znak wypełnienia dla setw'],
        ['left / right', 'wyrównanie do lewej / prawej'],
        ['fixed + setprecision(n)', 'n miejsc po przecinku'],
        ['hex / oct / dec', 'system szesnastkowy / ósemkowy / dziesiętny'],
        ['boolalpha', 'wypisuj true/false zamiast 1/0'],
      ] },
      { type: 'h', text: 'Wczytywanie' },
      { type: 'list', items: [
        '`cin >> x` – pomija białe znaki i wczytuje jedną wartość (słowo, liczbę).',
        '`getline(cin, s)` – wczytuje całą linię do zmiennej `string`.',
        '`cin.get(c)` – wczytuje jeden znak, także spację.',
        '`cin.ignore()` – pomija znak (np. Enter pozostawiony po `cin >> liczba` przed `getline`).',
        '`cin.getline(tab, n)` – całą linię do tablicy znaków.',
      ] },
      { type: 'h', text: 'printf i scanf' },
      { type: 'table', head: ['Znacznik', 'Typ', 'Przykład'], rows: [
        ['%d', 'int', 'printf("%d", 42)'],
        ['%f / %.2f', 'double (printf)', 'printf("%.2f", 3.14159) → 3.14'],
        ['%lf', 'double (scanf!)', 'scanf("%lf", &x)'],
        ['%c', 'char', 'printf("%c", \'A\')'],
        ['%s', 'C-napis', 'printf("%s", s.c_str())'],
        ['%5d / %-5d / %05d', 'szerokość, do lewej, zera wiodące', '|   42| |42   | |00042|'],
      ] },
      { type: 'warn', text: '`scanf` potrzebuje **adresów** zmiennych: `scanf("%d", &x);` – zapomniane `&` to klasyczny błąd. Typ znacznika musi pasować do zmiennej (`%d` dla int, `%lf` dla double), inaczej wynik jest błędny. Dla zmiennej `string` w `printf` użyj `s.c_str()`.' },
      { type: 'tip', text: 'W programach C++ zalecane są strumienie (bezpieczne typowo), ale `printf` bywa wygodny do formatowania tabel i spotkasz go w wielu materiałach.' },
    ],
    example: {
      title: 'Formatowanie wyników',
      description: 'Tabela z setw, liczby z ustaloną precyzją, systemy liczbowe oraz te same dane wypisane przez printf. Program wczytuje liczbę i imię.',
      input: '12 Ola',
      code: `#include <iostream>
#include <string>
#include <iomanip>
#include <cstdio>
using namespace std;

int main() {
    cout << left << setw(10) << "Produkt" << right << setw(8) << "Cena" << endl;
    cout << setfill('.') << left << setw(10) << "Chleb" << right << setw(8) << fixed << setprecision(2) << 4.5 << endl;
    cout << left << setw(10) << "Maslo" << right << setw(8) << 7.99 << endl;
    cout << setfill(' ');

    cout << "255 = " << hex << 255 << " (hex) = " << oct << 255 << " (oct)" << dec << endl;
    cout << boolalpha << "3 > 2: " << (3 > 2) << endl;

    int ile;
    char imie[20];
    printf("Podaj liczbe i imie: ");
    scanf("%d %s", &ile, imie);
    printf("Witaj %s! Podwojona liczba: %d\\n", imie, ile * 2);
    printf("|%5d|%-5d|%05d|\\n", ile, ile, ile);
    printf("Pi z dwoma miejscami: %.2f\\n", 3.14159);
    return 0;
}
`,
    },
    tasks: [],
  },

  // ─────────────── 23 ───────────────
  {
    id: 'k23',
    title: 'Klasy abstrakcyjne a interfejsy',
    subtitle: 'virtual, = 0, override, polimorfizm',
    icon: 'Shapes',
    practice: false,
    theory: [
      { type: 'p', text: 'Przypomnienie: **klasa** łączy dane (pola) i operacje (metody), a klasa pochodna może **dziedziczyć** po klasie bazowej (`class Kolo : public Figura`). Wskaźnik lub referencja do klasy bazowej może wskazywać na obiekt klasy pochodnej.' },
      { type: 'h', text: 'Metody wirtualne i polimorfizm' },
      { type: 'p', text: 'Gdy metoda klasy bazowej jest oznaczona słowem **virtual**, wywołanie przez wskaźnik/referencję typu bazowego uruchamia wersję z **rzeczywistej** klasy obiektu. To jest **polimorfizm**. Bez `virtual` wywoła się zawsze wersja z klasy bazowej. Słowo **override** w klasie pochodnej oznacza, że metoda nadpisuje wirtualną metodę bazową (kompilator to sprawdzi).' },
      { type: 'code', code: `class Zwierze {
public:
    virtual void dzwiek() { cout << "..."; }
};
class Pies : public Zwierze {
public:
    void dzwiek() override { cout << "Hau!"; }
};

Zwierze *z = new Pies();
z->dzwiek();      // "Hau!" - dzieki virtual` },
      { type: 'h', text: 'Klasa abstrakcyjna' },
      { type: 'p', text: 'Metoda **czysto wirtualna** (`virtual double pole() = 0;`) nie ma ciała – mówi tylko, że każda klasa pochodna **musi** ją zaimplementować. Klasa, która ma choć jedną taką metodę, jest **abstrakcyjna**: nie można tworzyć jej obiektów, służy jako wspólna baza. Może jednak mieć pola, konstruktor i zwykłe metody z kodem.' },
      { type: 'h', text: 'Interfejs' },
      { type: 'p', text: 'C++ nie ma osobnego słowa `interface` (jak Java czy C#). **Interfejs** to umowna nazwa klasy abstrakcyjnej, która ma **wyłącznie** metody czysto wirtualne (i wirtualny destruktor) – bez pól i bez kodu. Opisuje, *co* obiekt potrafi, a nie *jak* to robi. Klasa może „implementować” kilka interfejsów naraz (wielodziedziczenie).' },
      { type: 'table', head: ['Cecha', 'Klasa abstrakcyjna', 'Interfejs'], rows: [
        ['metody czysto wirtualne', 'co najmniej jedna', 'wszystkie'],
        ['metody z implementacją', 'tak, może mieć', 'nie'],
        ['pola (dane)', 'tak, może mieć', 'nie'],
        ['konstruktor', 'tak', 'nie (brak danych do ustawienia)'],
        ['tworzenie obiektów', 'nie', 'nie'],
        ['cel', 'wspólna baza z częścią gotowego kodu', 'kontrakt: lista wymaganych operacji'],
        ['relacja', 'Kolo **jest** Figurą', 'Plik **potrafi** być Drukowalny'],
      ] },
      { type: 'warn', text: 'Klasa bazowa używana polimorficznie powinna mieć **wirtualny destruktor** (`virtual ~Figura() {}`). Bez niego `delete` przez wskaźnik bazowy nie wywoła destruktora klasy pochodnej – to środowisko ostrzeże Cię o tym.' },
      { type: 'tip', text: 'Próba utworzenia obiektu klasy abstrakcyjnej (`Figura f;`) kończy się błędem kompilacji – sprawdź to w przykładzie!' },
    ],
    example: {
      title: 'Figury i interfejs Opisywalny',
      description: 'Interfejs (same metody = 0), klasa abstrakcyjna z polem i kodem, klasy pochodne oraz polimorficzna tablica wskaźników.',
      code: `#include <iostream>
#include <string>
using namespace std;

// INTERFEJS: tylko metody czysto wirtualne
class Opisywalny {
public:
    virtual string opis() const = 0;
    virtual ~Opisywalny() {}
};

// KLASA ABSTRAKCYJNA: ma pole, konstruktor i gotowa metode,
// ale pole() i obwod() musza dostarczyc klasy pochodne
class Figura : public Opisywalny {
protected:
    string nazwa;
public:
    Figura(string n) : nazwa(n) {}
    virtual double pole() const = 0;
    virtual double obwod() const = 0;
    string opis() const override {
        return nazwa + ": pole = " + to_string(pole());
    }
    virtual ~Figura() { cout << "Usuwam " << nazwa << endl; }
};

class Kolo : public Figura {
    double r;
public:
    Kolo(double r) : Figura("kolo"), r(r) {}
    double pole() const override { return 3.14159 * r * r; }
    double obwod() const override { return 2 * 3.14159 * r; }
};

class Prostokat : public Figura {
    double a, b;
public:
    Prostokat(double a, double b) : Figura("prostokat"), a(a), b(b) {}
    double pole() const override { return a * b; }
    double obwod() const override { return 2 * (a + b); }
};

void pokaz(const Opisywalny &o) {
    cout << o.opis() << endl;
}

int main() {
    Figura *figury[3] = { new Kolo(1), new Prostokat(2, 3), new Kolo(2.5) };

    double suma = 0;
    for (int i = 0; i < 3; i++) {
        pokaz(*figury[i]);                 // polimorfizm przez referencje
        suma += figury[i]->obwod();        // polimorfizm przez wskaznik
    }
    cout << "Suma obwodow: " << suma << endl;

    // Figura f("x");   // BLAD: klasa abstrakcyjna - odkomentuj i sprawdz!

    for (int i = 0; i < 3; i++) delete figury[i];
    return 0;
}
`,
    },
    // zadania o klasach przeniesiono do lekcji części „Programowanie obiektowe”
    tasks: [],
  },
];
