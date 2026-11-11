// Część II kursu – programowanie obiektowe (1/2).
// Każdy kod startowy, przykład i rozwiązanie zawiera `using namespace std;`.
import { starter } from './template.js';
import { legacyTask } from './legacy.js';

const H = (extra = []) => ['iostream', 'string', ...extra].map((i) => `#include <${i}>`).join('\n') + '\nusing namespace std;\n';

export const oop1 = [
  // ─────────────── Klasy i obiekty ───────────────
  {
    id: 'o01',
    title: 'Klasy i obiekty',
    subtitle: 'pola, metody, tworzenie obiektów',
    icon: 'Boxes',
    practice: true,
    part: 'oop',
    theory: [
      { type: 'p', text: '**Programowanie obiektowe** (OOP) to sposób myślenia o programie jako o zbiorze współpracujących **obiektów**. Każdy obiekt łączy **dane** (co o sobie wie) z **zachowaniem** (co potrafi zrobić). Zamiast osobnych zmiennych i funkcji mamy np. obiekt `konto`, który zna swoje saldo i potrafi przyjąć wpłatę.' },
      { type: 'table', head: ['Filar OOP', 'Idea', 'Lekcja'], rows: [
        ['Abstrakcja', 'opisujemy tylko to, co istotne (klasa jako model rzeczy)', 'Klasy i obiekty'],
        ['Enkapsulacja', 'ukrywamy dane, udostępniamy bezpieczne metody', 'Enkapsulacja'],
        ['Dziedziczenie', 'nowa klasa przejmuje cechy istniejącej', 'Dziedziczenie'],
        ['Polimorfizm', 'ta sama operacja działa różnie dla różnych obiektów', 'Polimorfizm'],
      ] },
      { type: 'h', text: 'Klasa a obiekt' },
      { type: 'p', text: '**Klasa** to projekt (foremka), który opisuje, jakie pola i metody będą miały obiekty. **Obiekt** to konkretny egzemplarz utworzony według tego projektu. Z jednej klasy `Samochod` można utworzyć dowolnie wiele samochodów – każdy ma **własne** wartości pól.' },
      { type: 'code', code: `class Samochod {
public:
    string marka;        // pola (dane)
    double paliwo;

    void jedz(double km) {          // metoda (zachowanie)
        paliwo -= km * 0.06;
    }
};                                  // <- srednik!

Samochod a, b;          // dwa obiekty
a.marka = "Fiat";       // kazdy ma wlasne pola
b.marka = "Opel";
a.jedz(100);            // wywolanie metody na obiekcie a` },
      { type: 'list', items: [
        '**Pole** (atrybut) – zmienna należąca do obiektu, np. `marka`, `paliwo`.',
        '**Metoda** – funkcja należąca do klasy; działa na polach obiektu, na rzecz którego ją wywołano.',
        'Dostęp do pól i metod: **kropka** dla obiektu (`a.jedz(5)`) i **strzałka** dla wskaźnika (`wsk->jedz(5)`).',
        'Wewnątrz metody nazwa pola (np. `paliwo`) oznacza pole **tego** obiektu, na którym wywołano metodę.',
      ] },
      { type: 'h', text: 'Metody definiowane poza klasą' },
      { type: 'p', text: 'W większych programach w klasie zostawiamy tylko **deklaracje** metod, a ich treść piszemy poza klasą, poprzedzając nazwę metody nazwą klasy i operatorem zasięgu `::`.' },
      { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

class Prostokat {
public:
    double a, b;
    double pole() const;       // tylko deklaracja
    void wypisz() const;
};

double Prostokat::pole() const {          // definicja poza klasa
    return a * b;
}

void Prostokat::wypisz() const {
    cout << a << " x " << b << ", pole = " << pole() << endl;
}

int main() {
    Prostokat p;
    p.a = 3;
    p.b = 4;
    p.wypisz();
    return 0;
}` },
      { type: 'h', text: 'Tablice obiektów i wskaźniki na obiekty' },
      { type: 'p', text: 'Obiekty można trzymać w tablicach i wektorach (`Samochod flota[10];`, `vector<Samochod> v;`) oraz tworzyć dynamicznie: `Samochod *s = new Samochod();` – wtedy do składowych odwołujemy się strzałką `s->marka`, a na końcu wywołujemy `delete s;`.' },
      { type: 'tip', text: 'Słowo **const** po nawiasach metody (`double pole() const`) oznacza, że metoda niczego w obiekcie nie zmienia – tylko odczytuje. To dobra praktyka dla wszystkich metod „pytających”.' },
    ],
    example: {
      title: 'Garaż samochodów',
      description: 'Klasa z polami i metodami, kilka obiektów, tablica obiektów i obiekt utworzony dynamicznie.',
      code: `#include <iostream>
#include <string>
using namespace std;

class Samochod {
public:
    string marka;
    double paliwo;      // w litrach
    double przebieg;    // w km

    void jedz(double km) {
        double potrzeba = km * 0.06;
        if (potrzeba > paliwo) {
            cout << marka << ": za malo paliwa na " << km << " km!" << endl;
            return;
        }
        paliwo -= potrzeba;
        przebieg += km;
    }

    void tankuj(double litry) {
        paliwo += litry;
    }

    void info() const {
        cout << marka << " | paliwo: " << paliwo << " l | przebieg: " << przebieg << " km" << endl;
    }
};

int main() {
    Samochod a;
    a.marka = "Fiat";
    a.paliwo = 10;
    a.przebieg = 0;

    Samochod b;
    b.marka = "Opel";
    b.paliwo = 3;
    b.przebieg = 1200;

    a.jedz(100);
    b.jedz(100);       // za malo paliwa
    b.tankuj(20);
    b.jedz(100);

    a.info();
    b.info();

    Samochod garaz[2] = { a, b };
    double suma = 0;
    for (int i = 0; i < 2; i++) suma += garaz[i].przebieg;
    cout << "Laczny przebieg w garazu: " << suma << " km" << endl;

    Samochod *nowy = new Samochod();
    nowy->marka = "Skoda";
    nowy->paliwo = 50;
    nowy->przebieg = 0;
    nowy->jedz(250);
    nowy->info();
    delete nowy;
    return 0;
}
`,
    },
    tasks: [
      legacyTask('m9t1'),
      {
        id: 'o01t1',
        title: 'Klasa Punkt',
        difficulty: 1,
        description: 'Utwórz klasę `Punkt` z publicznymi polami `x`, `y` (double) i metodami: `void przesun(double dx, double dy)`, `double odleglosc() const` (odległość od początku układu) oraz `void wypisz() const` (wypisuje `(x, y)`). Wczytaj `x y`, a potem przesunięcie `dx dy`. Wypisz:',
        expectedOutput: 'Po przesunieciu: (4, 6)\nOdleglosc: 7.2111',
        exampleInput: '1 2 3 4',
        starter: starter({ includes: ['cmath'], before: 'class Punkt {\npublic:\n    // pola i metody\n};', body: '    Punkt p;\n    // wczytaj dane, przesun punkt i wypisz wynik\n' }),
        hints: [
          'Metoda przesuwająca: `void przesun(double dx, double dy) { x += dx; y += dy; }`',
          'Odległość od (0, 0): `return sqrt(x * x + y * y);`',
          'W main: `cout << "Po przesunieciu: "; p.wypisz();`',
        ],
        checks: [
          { pattern: 'class\\s+Punkt', message: 'Utwórz klasę Punkt.' },
          { pattern: 'void\\s+przesun\\s*\\(', message: 'Dodaj metodę void przesun(double dx, double dy).' },
        ],
        solution: `${H(['cmath'])}
class Punkt {
public:
    double x, y;

    void przesun(double dx, double dy) {
        x += dx;
        y += dy;
    }
    double odleglosc() const {
        return sqrt(x * x + y * y);
    }
    void wypisz() const {
        cout << "(" << x << ", " << y << ")" << endl;
    }
};

int main() {
    Punkt p;
    double dx, dy;
    cin >> p.x >> p.y >> dx >> dy;
    p.przesun(dx, dy);
    cout << "Po przesunieciu: ";
    p.wypisz();
    cout << "Odleglosc: " << p.odleglosc() << endl;
    return 0;
}
`,
        tests: [
          { input: '1 2 3 4', expected: 'Po przesunieciu: (4, 6)\nOdleglosc: 7.2111' },
          { input: '0 0 3 4', expected: 'Po przesunieciu: (3, 4)\nOdleglosc: 5' },
          { input: '-1 -1 1 1', expected: 'Po przesunieciu: (0, 0)\nOdleglosc: 0' },
        ],
      },
      {
        id: 'o01t2',
        title: 'Licznik',
        difficulty: 1,
        description: 'Utwórz klasę `Licznik` z polem `wartosc` (początkowo 0) i metodami `zwieksz()`, `zmniejsz()` (wartość nie może spaść poniżej 0), `resetuj()` i `pobierz()`. Wczytaj `n`, a potem `n` znaków-poleceń: `+` (zwiększ), `-` (zmniejsz), `r` (resetuj). Wypisz końcową wartość:',
        expectedOutput: 'Wartosc: 3',
        exampleInput: '5\n+ + + - +',
        starter: starter({ before: 'class Licznik {\npublic:\n    int wartosc = 0;\n    // metody\n};', body: '    Licznik l;\n    int n;\n    cin >> n;\n    // wykonaj polecenia\n' }),
        hints: [
          'Zmniejszanie z warunkiem: `void zmniejsz() { if (wartosc > 0) wartosc--; }`',
          'Polecenie wczytaj jako znak: `char c; cin >> c;` i sprawdź `c == \'+\'` itd.',
        ],
        checks: [{ pattern: 'class\\s+Licznik', message: 'Utwórz klasę Licznik.' }],
        solution: `${H()}
class Licznik {
public:
    int wartosc = 0;

    void zwieksz() { wartosc++; }
    void zmniejsz() { if (wartosc > 0) wartosc--; }
    void resetuj() { wartosc = 0; }
    int pobierz() const { return wartosc; }
};

int main() {
    Licznik l;
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        char c;
        cin >> c;
        if (c == '+') l.zwieksz();
        else if (c == '-') l.zmniejsz();
        else if (c == 'r') l.resetuj();
    }
    cout << "Wartosc: " << l.pobierz() << endl;
    return 0;
}
`,
        tests: [
          { input: '5\n+ + + - +', expected: 'Wartosc: 3' },
          { input: '3\n- - +', expected: 'Wartosc: 1' },
          { input: '4\n+ + r +', expected: 'Wartosc: 1' },
        ],
      },
      {
        id: 'o01t3',
        title: 'Metody poza klasą',
        starterIncomplete: true, // kod startowy celowo nie ma definicji metod
        difficulty: 2,
        description: 'Klasa `Prostopadloscian` ma pola `a`, `b`, `c` oraz **zadeklarowane** metody `objetosc()` i `pole()`. Napisz definicje tych metod **poza klasą** (z operatorem `::`). Wczytaj wymiary i wypisz:',
        expectedOutput: 'Objetosc: 24\nPole: 52',
        exampleInput: '2 3 4',
        starter: starter({
          before: `class Prostopadloscian {
public:
    double a, b, c;
    double objetosc() const;
    double pole() const;
};

// tutaj zdefiniuj metody, np. double Prostopadloscian::objetosc() const { ... }`,
          body: '    Prostopadloscian p;\n    cin >> p.a >> p.b >> p.c;\n    cout << "Objetosc: " << p.objetosc() << endl;\n    cout << "Pole: " << p.pole() << endl;\n',
        }),
        hints: [
          'Nagłówek definicji: `double Prostopadloscian::objetosc() const { return a * b * c; }`',
          'Pole powierzchni: `2 * (a * b + a * c + b * c)`.',
        ],
        checks: [{ pattern: 'Prostopadloscian\\s*::\\s*objetosc', message: 'Zdefiniuj metodę poza klasą: double Prostopadloscian::objetosc() const { ... }' }],
        solution: `${H()}
class Prostopadloscian {
public:
    double a, b, c;
    double objetosc() const;
    double pole() const;
};

double Prostopadloscian::objetosc() const {
    return a * b * c;
}

double Prostopadloscian::pole() const {
    return 2 * (a * b + a * c + b * c);
}

int main() {
    Prostopadloscian p;
    cin >> p.a >> p.b >> p.c;
    cout << "Objetosc: " << p.objetosc() << endl;
    cout << "Pole: " << p.pole() << endl;
    return 0;
}
`,
        tests: [
          { input: '2 3 4', expected: 'Objetosc: 24\nPole: 52' },
          { input: '1 1 1', expected: 'Objetosc: 1\nPole: 6' },
          { input: '2.5 2 4', expected: 'Objetosc: 20\nPole: 46' },
        ],
      },
    ],
  },

  // ─────────────── Konstruktory i destruktory ───────────────
  {
    id: 'o02',
    title: 'Konstruktory i destruktory',
    subtitle: 'tworzenie, kopiowanie i niszczenie obiektów',
    icon: 'Hammer',
    practice: true,
    part: 'oop',
    theory: [
      { type: 'p', text: '**Konstruktor** to specjalna metoda wywoływana automatycznie w chwili tworzenia obiektu. Ma **taką samą nazwę jak klasa** i **nie ma typu zwracanego**. Jego zadaniem jest nadanie polom poprawnych wartości początkowych, tak aby obiekt od pierwszej chwili był w sensownym stanie.' },
      { type: 'code', code: `class Punkt {
public:
    double x, y;

    Punkt() {                       // konstruktor domyslny (bez parametrow)
        x = 0;
        y = 0;
    }
    Punkt(double a, double b) {     // konstruktor z parametrami
        x = a;
        y = b;
    }
};

Punkt p;          // Punkt() -> (0, 0)
Punkt q(3, 4);    // Punkt(double, double) -> (3, 4)` },
      { type: 'h', text: 'Lista inicjalizacyjna' },
      { type: 'p', text: 'Zamiast przypisywać pola w ciele konstruktora, można je zainicjalizować na **liście inicjalizacyjnej** po dwukropku. To zalecany sposób – a dla pól `const`, referencji i pól-obiektów bez konstruktora domyślnego jedyny możliwy.' },
      { type: 'code', code: `Punkt(double a, double b) : x(a), y(b) {}
Punkt(double a = 0, double b = 0) : x(a), y(b) {}   // z wartosciami domyslnymi` },
      { type: 'h', text: 'Destruktor' },
      { type: 'p', text: '**Destruktor** `~NazwaKlasy()` wywołuje się automatycznie, gdy obiekt przestaje istnieć: zmienna lokalna – na końcu bloku `{ }`, obiekt z `new` – przy `delete`. Służy do sprzątania: zwalniania pamięci, zamykania plików. Destruktor nie ma parametrów i może być tylko jeden.' },
      { type: 'list', items: [
        'Obiekty lokalne są tworzone w kolejności deklaracji, a **niszczone w odwrotnej kolejności**.',
        'Obiekt utworzony w pętli powstaje i jest niszczony w **każdym obrocie**.',
        'Jeśli nie napiszesz żadnego konstruktora, kompilator doda pusty konstruktor domyślny. Gdy napiszesz jakikolwiek – domyślny znika (chyba że dopiszesz `NazwaKlasy() = default;`).',
      ] },
      { type: 'h', text: 'Konstruktor kopiujący' },
      { type: 'p', text: 'Konstruktor kopiujący `Klasa(const Klasa& inny)` tworzy nowy obiekt jako kopię istniejącego. Wywołuje się m.in. przy `Klasa b = a;`, `Klasa b(a);` oraz przy **przekazaniu obiektu do funkcji przez wartość**. Domyślny (wygenerowany przez kompilator) kopiuje po prostu wszystkie pola.' },
      { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

class Gosc {
    string imie;
public:
    Gosc(string i) : imie(i) { cout << "Witaj, " << imie << endl; }
    Gosc(const Gosc& g) : imie(g.imie + " (kopia)") { cout << "Kopiuje: " << g.imie << endl; }
    ~Gosc() { cout << "Zegnaj, " << imie << endl; }
};

void odwiedziny(Gosc g) {          // przekazanie przez wartosc = kopia!
    cout << "...w funkcji..." << endl;
}

int main() {
    Gosc a("Ala");
    {
        Gosc b("Bartek");
        cout << "Koniec bloku" << endl;
    }                                // tu ginie b
    odwiedziny(a);
    cout << "Koniec main" << endl;
    return 0;
}                                    // tu ginie a` },
      { type: 'warn', text: 'Gdy klasa samodzielnie zarządza pamięcią (`new` w konstruktorze, `delete` w destruktorze), domyślna kopia skopiuje tylko **wskaźnik** – oba obiekty będą wskazywać na tę samą pamięć i zwolnią ją dwa razy. Wtedy trzeba napisać własny konstruktor kopiujący (tzw. **głęboka kopia**).' },
    ],
    example: {
      title: 'Konto z historią',
      description: 'Przeciążone konstruktory, lista inicjalizacyjna, wartości domyślne oraz komunikaty pokazujące, kiedy obiekty powstają i giną (także przez new/delete).',
      code: `#include <iostream>
#include <string>
using namespace std;

class Konto {
    string wlasciciel;
    double saldo;
public:
    Konto() : wlasciciel("anonim"), saldo(0) {
        cout << "[+] puste konto" << endl;
    }
    Konto(string w, double s = 0) : wlasciciel(w), saldo(s) {
        cout << "[+] konto " << wlasciciel << " (" << saldo << " zl)" << endl;
    }
    Konto(const Konto& k) : wlasciciel(k.wlasciciel + "-kopia"), saldo(k.saldo) {
        cout << "[+] kopia konta " << k.wlasciciel << endl;
    }
    ~Konto() {
        cout << "[-] zamykam konto " << wlasciciel << endl;
    }
};

int main() {
    Konto a;
    Konto b("Ola", 150);
    Konto c("Jan");
    Konto d = b;

    cout << "--- obiekt dynamiczny ---" << endl;
    Konto *e = new Konto("Ewa", 99);
    delete e;

    cout << "--- obiekty w petli ---" << endl;
    for (int i = 1; i <= 2; i++) {
        Konto tymczasowe("petla");
    }
    cout << "--- koniec main ---" << endl;
    return 0;
}
`,
    },
    tasks: [
      legacyTask('m9t3'),
      {
        id: 'o02t1',
        title: 'Przeciążone konstruktory – Czas',
        difficulty: 2,
        description: 'Utwórz klasę `Czas` z polami `h`, `m` i trzema konstruktorami: `Czas()` (00:00), `Czas(int minuty)` (np. 135 → 02:15) oraz `Czas(int h, int m)`. Konstruktory mają **normalizować** czas: nadmiarowe minuty przechodzą w godziny, a godziny liczone są modulo 24. Metoda `wypisz()` wypisuje czas w formacie `hh:mm`.\n\nWczytaj `k` (0, 1 lub 2), a potem `k` liczb i utwórz obiekt odpowiednim konstruktorem.',
        expectedOutput: '02:15',
        exampleInput: '1 135',
        starter: starter({ before: 'class Czas {\n    int h, m;\npublic:\n    // trzy konstruktory i metoda wypisz()\n};', body: '    int k;\n    cin >> k;\n    // utworz obiekt odpowiednim konstruktorem i wypisz go\n' }),
        hints: [
          'Najprościej zamienić wszystko na minuty: `int razem = h * 60 + m;` a potem `h = (razem / 60) % 24; m = razem % 60;`',
          'Konstruktor `Czas(int minuty)` może wywołać tę samą logikę co `Czas(int h, int m)` z h = 0.',
          'Zera wiodące: `if (h < 10) cout << 0;` przed wypisaniem godzin (tak samo dla minut).',
        ],
        checks: [{ pattern: '(Czas\\s*\\([^)]*\\)[\\s\\S]*){3}', message: 'Klasa Czas powinna mieć trzy konstruktory.' }],
        solution: `${H()}
class Czas {
    int h, m;

    void ustaw(int godziny, int minuty) {
        int razem = godziny * 60 + minuty;
        h = (razem / 60) % 24;
        m = razem % 60;
    }

public:
    Czas() { ustaw(0, 0); }
    Czas(int minuty) { ustaw(0, minuty); }
    Czas(int godziny, int minuty) { ustaw(godziny, minuty); }

    void wypisz() const {
        if (h < 10) cout << 0;
        cout << h << ":";
        if (m < 10) cout << 0;
        cout << m << endl;
    }
};

int main() {
    int k;
    cin >> k;
    if (k == 0) {
        Czas c;
        c.wypisz();
    } else if (k == 1) {
        int min;
        cin >> min;
        Czas c(min);
        c.wypisz();
    } else {
        int h, m;
        cin >> h >> m;
        Czas c(h, m);
        c.wypisz();
    }
    return 0;
}
`,
        tests: [
          { input: '1 135', expected: '02:15' },
          { input: '0', expected: '00:00' },
          { input: '2 9 5', expected: '09:05' },
          { input: '2 23 70', expected: '00:10' },
        ],
      },
      {
        id: 'o02t2',
        title: 'Życie obiektów',
        difficulty: 2,
        description: 'Utwórz klasę `Gosc`, której konstruktor przyjmuje imię i wypisuje `Witaj, IMIE`, a destruktor wypisuje `Zegnaj, IMIE`. W `main` najpierw utwórz obiekt `Gosc gospodarz("Gospodarz");`, a następnie wczytaj `n` i w pętli dla każdego wczytanego imienia utwórz **lokalny** obiekt `Gosc`. Obserwuj, kiedy obiekty powstają i giną:',
        expectedOutput: 'Witaj, Gospodarz\nWitaj, Ola\nZegnaj, Ola\nWitaj, Jan\nZegnaj, Jan\nZegnaj, Gospodarz',
        exampleInput: '2\nOla Jan',
        starter: starter({ before: 'class Gosc {\n    string imie;\npublic:\n    // konstruktor i destruktor\n};' }),
        hints: [
          'Konstruktor: `Gosc(string i) : imie(i) { cout << "Witaj, " << imie << endl; }`',
          'Destruktor: `~Gosc() { cout << "Zegnaj, " << imie << endl; }`',
          'W pętli: `string s; cin >> s; Gosc g(s);` – obiekt `g` zginie na końcu każdego obrotu.',
        ],
        checks: [{ pattern: '~\\s*Gosc\\s*\\(', message: 'Dodaj destruktor ~Gosc().' }],
        solution: `${H()}
class Gosc {
    string imie;
public:
    Gosc(string i) : imie(i) {
        cout << "Witaj, " << imie << endl;
    }
    ~Gosc() {
        cout << "Zegnaj, " << imie << endl;
    }
};

int main() {
    Gosc gospodarz("Gospodarz");
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        Gosc g(s);
    }
    return 0;
}
`,
        tests: [
          { input: '2\nOla Jan', expected: 'Witaj, Gospodarz\nWitaj, Ola\nZegnaj, Ola\nWitaj, Jan\nZegnaj, Jan\nZegnaj, Gospodarz' },
          { input: '0', expected: 'Witaj, Gospodarz\nZegnaj, Gospodarz' },
          { input: '1\nEwa', expected: 'Witaj, Gospodarz\nWitaj, Ewa\nZegnaj, Ewa\nZegnaj, Gospodarz' },
        ],
      },
      {
        id: 'o02t3',
        title: 'Konstruktor kopiujący – wersje dokumentu',
        difficulty: 3,
        description: 'Klasa `Dokument` ma pola `tytul` i `wersja`. Konstruktor `Dokument(string t)` ustawia wersję 1. Napisz **konstruktor kopiujący**, który tworzy kopię z wersją o 1 większą i wypisuje `Kopiuje wersje X` (X – wersja oryginału). Wczytaj tytuł i `n`; utwórz dokument, a potem `n` razy wykonaj w pętli `Dokument kopia = d; d = kopia;`. Na końcu wywołaj `d.info()`, które wypisuje `TYTUL vN`.',
        expectedOutput: 'Kopiuje wersje 1\nKopiuje wersje 2\nKopiuje wersje 3\nRaport v4',
        exampleInput: 'Raport 3',
        starter: starter({
          before: `class Dokument {
    string tytul;
    int wersja;
public:
    Dokument(string t) : tytul(t), wersja(1) {}
    // konstruktor kopiujacy
    void info() const { cout << tytul << " v" << wersja << endl; }
};`,
          body: '    string t;\n    int n;\n    cin >> t >> n;\n    Dokument d(t);\n    for (int i = 0; i < n; i++) {\n        Dokument kopia = d;\n        d = kopia;\n    }\n    d.info();\n',
        }),
        hints: [
          'Nagłówek: `Dokument(const Dokument& inny)`.',
          'Lista inicjalizacyjna: `: tytul(inny.tytul), wersja(inny.wersja + 1)`.',
          'W ciele wypisz `"Kopiuje wersje " << inny.wersja`.',
        ],
        checks: [{ pattern: 'Dokument\\s*\\(\\s*const\\s+Dokument\\s*&', message: 'Napisz konstruktor kopiujący Dokument(const Dokument& inny).' }],
        solution: `${H()}
class Dokument {
    string tytul;
    int wersja;
public:
    Dokument(string t) : tytul(t), wersja(1) {}
    Dokument(const Dokument& inny) : tytul(inny.tytul), wersja(inny.wersja + 1) {
        cout << "Kopiuje wersje " << inny.wersja << endl;
    }
    void info() const { cout << tytul << " v" << wersja << endl; }
};

int main() {
    string t;
    int n;
    cin >> t >> n;
    Dokument d(t);
    for (int i = 0; i < n; i++) {
        Dokument kopia = d;
        d = kopia;
    }
    d.info();
    return 0;
}
`,
        tests: [
          { input: 'Raport 3', expected: 'Kopiuje wersje 1\nKopiuje wersje 2\nKopiuje wersje 3\nRaport v4' },
          { input: 'Notatka 0', expected: 'Notatka v1' },
          { input: 'Plan 1', expected: 'Kopiuje wersje 1\nPlan v2' },
        ],
      },
    ],
  },

  // ─────────────── Enkapsulacja ───────────────
  {
    id: 'o03',
    title: 'Enkapsulacja (hermetyzacja)',
    subtitle: 'private, public, gettery, settery, const',
    icon: 'Lock',
    practice: true,
    part: 'oop',
    theory: [
      { type: 'p', text: '**Enkapsulacja** (hermetyzacja) polega na **ukryciu danych** obiektu przed światem zewnętrznym i udostępnieniu tylko przemyślanego zestawu metod – **interfejsu**. Dzięki temu nikt nie może przypadkiem ustawić obiektu w niepoprawny stan, np. ujemnego salda albo wieku 500 lat.' },
      { type: 'table', head: ['Specyfikator', 'Kto ma dostęp'], rows: [
        ['public', 'wszyscy – to interfejs klasy'],
        ['private', 'tylko metody tej klasy (i jej przyjaciele – friend)'],
        ['protected', 'metody tej klasy i klas pochodnych'],
      ] },
      { type: 'h', text: 'Gettery i settery' },
      { type: 'p', text: '**Getter** zwraca wartość prywatnego pola (np. `getSaldo()`), a **setter** ją zmienia, ale najpierw **sprawdza poprawność** (walidacja). Nie każde pole potrzebuje settera – czasem zmiana powinna odbywać się tylko przez metody o konkretnym znaczeniu (np. `wplac`, `wyplac`).' },
      { type: 'code', code: `class Osoba {
private:
    string imie;
    int wiek;
public:
    Osoba(string i, int w) : imie(i), wiek(0) { setWiek(w); }

    int getWiek() const { return wiek; }        // getter (const!)
    string getImie() const { return imie; }

    bool setWiek(int w) {                       // setter z walidacja
        if (w < 0 || w > 130) return false;     // odrzucamy bzdury
        wiek = w;
        return true;
    }
};

Osoba o("Ola", 15);
o.wiek = -5;          // BLAD kompilacji: pole prywatne
o.setWiek(-5);        // zwroci false, wiek bez zmian` },
      { type: 'h', text: 'Wskaźnik this' },
      { type: 'p', text: 'W każdej metodzie dostępny jest wskaźnik **this** na obiekt, na rzecz którego ją wywołano. Przydaje się, gdy parametr ma taką samą nazwę jak pole: `this->wiek = wiek;` oraz do zwracania obiektu z metody: `return *this;` (pozwala łączyć wywołania: `k.wplac(10).wplac(20);`).' },
      { type: 'h', text: 'Metody stałe (const)' },
      { type: 'p', text: 'Metoda oznaczona `const` obiecuje, że nie zmieni obiektu. Tylko takie metody można wywołać na obiekcie stałym lub przekazanym przez `const Klasa&`. Gettery i metody wypisujące zawsze oznaczaj jako `const`.' },
      { type: 'list', items: [
        '**Niezmiennik klasy** – warunek, który zawsze musi być spełniony (np. saldo ≥ 0, mianownik ≠ 0). Enkapsulacja pozwala go pilnować w jednym miejscu.',
        'Ukryte dane można zmienić (np. zamienić `double` na grosze w `long long`) bez zmiany kodu, który korzysta z klasy – byle interfejs został taki sam.',
        'Zasada: pola `private`, metody interfejsu `public`, metody pomocnicze `private`.',
      ] },
    ],
    example: {
      title: 'Bezpieczne konto bankowe',
      description: 'Prywatne dane, walidacja w metodach, getter const, metoda prywatna i łańcuchowanie przez return *this.',
      code: `#include <iostream>
#include <string>
using namespace std;

class Konto {
private:
    string wlasciciel;
    double saldo;
    int liczbaOperacji;

    void zapiszOperacje() { liczbaOperacji++; }    // metoda pomocnicza (prywatna)

public:
    Konto(string w) : wlasciciel(w), saldo(0), liczbaOperacji(0) {}

    Konto& wplac(double kwota) {
        if (kwota <= 0) {
            cout << "Odrzucono wplate: " << kwota << endl;
            return *this;
        }
        saldo += kwota;
        zapiszOperacje();
        return *this;
    }

    bool wyplac(double kwota) {
        if (kwota <= 0 || kwota > saldo) {
            cout << "Odrzucono wyplate: " << kwota << endl;
            return false;
        }
        saldo -= kwota;
        zapiszOperacje();
        return true;
    }

    double getSaldo() const { return saldo; }
    int getLiczbaOperacji() const { return liczbaOperacji; }
    string getWlasciciel() const { return wlasciciel; }
};

int main() {
    Konto k("Ola");
    k.wplac(100).wplac(50).wplac(-20);   // lancuchowanie dzieki return *this
    k.wyplac(500);
    k.wyplac(30);

    cout << k.getWlasciciel() << ": " << k.getSaldo() << " zl, operacji: "
         << k.getLiczbaOperacji() << endl;

    // k.saldo = 1000000;   // BLAD: saldo jest prywatne - odkomentuj i sprawdz!
    return 0;
}
`,
    },
    tasks: [
      legacyTask('m9t2'),
      {
        id: 'o03t1',
        title: 'Termometr z walidacją',
        difficulty: 1,
        description: 'Utwórz klasę `Termometr` z **prywatnym** polem `temp` (początkowo 20), metodą `bool ustaw(double t)`, która odrzuca temperatury niższe niż −273.15 (zero absolutne), oraz getterem `odczyt()`. Wczytaj `n` i `n` temperatur, próbując każdą ustawić. Dla odrzuconych wypisz `Bledna temperatura: X`, a na końcu:',
        expectedOutput: 'Bledna temperatura: -300\nTemperatura: 18.5',
        exampleInput: '3\n25 -300 18.5',
        starter: starter({ before: 'class Termometr {\nprivate:\n    double temp;\npublic:\n    // konstruktor, ustaw, odczyt\n};', body: '    Termometr t;\n    int n;\n    cin >> n;\n    // Twoj kod tutaj\n' }),
        hints: [
          'Konstruktor: `Termometr() : temp(20) {}`',
          'Setter: `bool ustaw(double t) { if (t < -273.15) return false; temp = t; return true; }`',
          'W main: `if (!t.ustaw(x)) cout << "Bledna temperatura: " << x << endl;`',
        ],
        checks: [{ pattern: 'private\\s*:', message: 'Pole temp powinno być prywatne.' }],
        solution: `${H()}
class Termometr {
private:
    double temp;
public:
    Termometr() : temp(20) {}
    bool ustaw(double t) {
        if (t < -273.15) return false;
        temp = t;
        return true;
    }
    double odczyt() const { return temp; }
};

int main() {
    Termometr t;
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        double x;
        cin >> x;
        if (!t.ustaw(x)) cout << "Bledna temperatura: " << x << endl;
    }
    cout << "Temperatura: " << t.odczyt() << endl;
    return 0;
}
`,
        tests: [
          { input: '3\n25 -300 18.5', expected: 'Bledna temperatura: -300\nTemperatura: 18.5' },
          { input: '1\n-500', expected: 'Bledna temperatura: -500\nTemperatura: 20' },
          { input: '2\n-273.15 0', expected: 'Temperatura: 0' },
        ],
      },
      {
        id: 'o03t2',
        title: 'Hasło użytkownika',
        difficulty: 2,
        description: 'Utwórz klasę `Uzytkownik` z prywatnymi polami `login` i `haslo`. Publiczne metody: `bool zaloguj(string h) const` oraz `bool zmienHaslo(string stare, string nowe)` – zmiana udaje się tylko wtedy, gdy stare hasło jest poprawne, a nowe ma **co najmniej 8 znaków**.\n\nWczytaj login i hasło, potem `n` poleceń: `L haslo` (wypisz `Zalogowano` / `Bledne haslo`) lub `Z stare nowe` (wypisz `Haslo zmienione` / `Nie zmieniono hasla`).',
        expectedOutput: 'Zalogowano\nNie zmieniono hasla\nHaslo zmienione\nBledne haslo',
        exampleInput: 'ola tajne123\n4\nL tajne123\nZ tajne123 krotkie\nZ tajne123 nowehaslo\nL tajne123',
        starter: starter({ before: 'class Uzytkownik {\nprivate:\n    string login, haslo;\npublic:\n    // konstruktor i metody\n};', body: '    string l, h;\n    cin >> l >> h;\n    // utworz uzytkownika i obsluz polecenia\n' }),
        hints: [
          'Konstruktor: `Uzytkownik(string l, string h) : login(l), haslo(h) {}`',
          'Warunek zmiany: `stare == haslo && nowe.length() >= 8`.',
          'Polecenie wczytaj jako znak: `char c; cin >> c;`, a potem odpowiednią liczbę słów.',
        ],
        checks: [{ pattern: 'private\\s*:', message: 'Hasło powinno być prywatne.' }],
        solution: `${H()}
class Uzytkownik {
private:
    string login, haslo;
public:
    Uzytkownik(string l, string h) : login(l), haslo(h) {}

    bool zaloguj(string h) const {
        return h == haslo;
    }

    bool zmienHaslo(string stare, string nowe) {
        if (stare != haslo || nowe.length() < 8) return false;
        haslo = nowe;
        return true;
    }
};

int main() {
    string l, h;
    cin >> l >> h;
    Uzytkownik u(l, h);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        char c;
        cin >> c;
        if (c == 'L') {
            string p;
            cin >> p;
            cout << (u.zaloguj(p) ? "Zalogowano" : "Bledne haslo") << endl;
        } else {
            string s, nw;
            cin >> s >> nw;
            cout << (u.zmienHaslo(s, nw) ? "Haslo zmienione" : "Nie zmieniono hasla") << endl;
        }
    }
    return 0;
}
`,
        tests: [
          { input: 'ola tajne123\n4\nL tajne123\nZ tajne123 krotkie\nZ tajne123 nowehaslo\nL tajne123', expected: 'Zalogowano\nNie zmieniono hasla\nHaslo zmienione\nBledne haslo' },
          { input: 'jan abc\n2\nL abd\nZ zle dlugiehaslo', expected: 'Bledne haslo\nNie zmieniono hasla' },
          { input: 'ewa start\n2\nZ start 12345678\nL 12345678', expected: 'Haslo zmienione\nZalogowano' },
        ],
      },
      {
        id: 'o03t3',
        title: 'Prostokąt z setterami',
        difficulty: 2,
        description: 'Klasa `Prostokat` ma prywatne boki `a`, `b`. Settery `setA` i `setB` zwracają `bool` i **odrzucają** wartości ≤ 0. Dodaj gettery i metodę `pole()`. Wczytaj początkowe boki (dodatnie), potem `n` poleceń `A x` lub `B x`. Dla każdej odrzuconej wartości wypisz `Odrzucono: x`, a na końcu:',
        expectedOutput: 'Odrzucono: -1\na = 5, b = 4, pole = 20',
        exampleInput: '2 3\n3\nA 5\nB -1\nB 4',
        starter: starter({ before: 'class Prostokat {\nprivate:\n    double a, b;\npublic:\n    // konstruktor, settery, gettery, pole()\n};', body: '    double a, b;\n    cin >> a >> b;\n    // Twoj kod tutaj\n' }),
        hints: [
          'Setter: `bool setA(double x) { if (x <= 0) return false; a = x; return true; }`',
          'Gettery: `double getA() const { return a; }`',
          'W main wybierz setter po literze polecenia.',
        ],
        checks: [
          { pattern: 'bool\\s+setA\\s*\\(', message: 'Dodaj setter bool setA(double x).' },
          { pattern: 'private\\s*:', message: 'Boki powinny być prywatne.' },
        ],
        solution: `${H()}
class Prostokat {
private:
    double a, b;
public:
    Prostokat(double x, double y) : a(x), b(y) {}

    bool setA(double x) {
        if (x <= 0) return false;
        a = x;
        return true;
    }
    bool setB(double y) {
        if (y <= 0) return false;
        b = y;
        return true;
    }
    double getA() const { return a; }
    double getB() const { return b; }
    double pole() const { return a * b; }
};

int main() {
    double a, b;
    cin >> a >> b;
    Prostokat p(a, b);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        char c;
        double x;
        cin >> c >> x;
        bool ok = (c == 'A') ? p.setA(x) : p.setB(x);
        if (!ok) cout << "Odrzucono: " << x << endl;
    }
    cout << "a = " << p.getA() << ", b = " << p.getB() << ", pole = " << p.pole() << endl;
    return 0;
}
`,
        tests: [
          { input: '2 3\n3\nA 5\nB -1\nB 4', expected: 'Odrzucono: -1\na = 5, b = 4, pole = 20' },
          { input: '1 1\n1\nA 0', expected: 'Odrzucono: 0\na = 1, b = 1, pole = 1' },
          { input: '2 2\n2\nA 2.5\nB 4', expected: 'a = 2.5, b = 4, pole = 10' },
        ],
      },
    ],
  },

  // ─────────────── Składowe statyczne ───────────────
  {
    id: 'o04',
    title: 'Składowe statyczne',
    subtitle: 'static – pola i metody wspólne dla klasy',
    icon: 'Hash',
    practice: true,
    part: 'oop',
    theory: [
      { type: 'p', text: 'Zwykłe pole należy do **konkretnego obiektu** – każdy obiekt ma własną kopię. Pole **statyczne** (`static`) należy do **całej klasy**: istnieje dokładnie jedna jego kopia, wspólna dla wszystkich obiektów, i istnieje nawet wtedy, gdy nie utworzono żadnego obiektu.' },
      { type: 'code', code: `class Uczen {
    string imie;
    static int liczbaUczniow;      // deklaracja w klasie
public:
    Uczen(string i) : imie(i) { liczbaUczniow++; }
    ~Uczen() { liczbaUczniow--; }
    static int ilu() { return liczbaUczniow; }   // metoda statyczna
};

int Uczen::liczbaUczniow = 0;      // definicja (i wartosc poczatkowa) poza klasa

cout << Uczen::ilu();             // 0 - mozna wywolac bez obiektu!` },
      { type: 'list', items: [
        'Pole statyczne deklarujemy w klasie, a **definiujemy poza nią**: `int Klasa::pole = 0;`. Stałe całkowite można zainicjalizować od razu w klasie: `static const int MAX = 100;`.',
        'Odwołanie: `Klasa::pole` albo przez dowolny obiekt (`obiekt.pole`) – to zawsze to samo miejsce w pamięci.',
        '**Metoda statyczna** nie jest wywoływana na rzecz obiektu, więc **nie ma `this`** i nie widzi zwykłych pól – może używać tylko składowych statycznych.',
        'Metodę statyczną wywołujemy przez nazwę klasy: `Uczen::ilu()`.',
      ] },
      { type: 'h', text: 'Typowe zastosowania' },
      { type: 'table', head: ['Zastosowanie', 'Przykład'], rows: [
        ['licznik obiektów', 'ile obiektów danej klasy aktualnie istnieje'],
        ['generator numerów', 'każdy nowy produkt dostaje kolejny numer seryjny'],
        ['wspólna stała', 'static const double VAT = 0.23;'],
        ['klasa narzędziowa', 'Matematyka::nwd(a, b) – funkcje pogrupowane w klasie'],
      ] },
      { type: 'warn', text: 'Próba użycia zwykłego pola w metodzie statycznej kończy się błędem – metoda statyczna nie wie, o który obiekt chodzi. To środowisko wyjaśni to w komunikacie.' },
    ],
    example: {
      title: 'Numery legitymacji',
      description: 'Pole statyczne jako licznik i generator numerów, stała statyczna oraz metody statyczne wywoływane przez nazwę klasy.',
      code: `#include <iostream>
#include <string>
using namespace std;

class Uczen {
    string imie;
    int numer;
    static int nastepnyNumer;
    static int liczbaUczniow;
public:
    static const int LIMIT = 30;

    Uczen(string i) : imie(i), numer(nastepnyNumer) {
        nastepnyNumer++;
        liczbaUczniow++;
    }
    ~Uczen() {
        liczbaUczniow--;
    }
    void info() const {
        cout << "Legitymacja nr " << numer << ": " << imie << endl;
    }
    static int ilu() { return liczbaUczniow; }
    static bool czyJestMiejsce() { return liczbaUczniow < LIMIT; }
};

int Uczen::nastepnyNumer = 1001;
int Uczen::liczbaUczniow = 0;

int main() {
    cout << "Na poczatku: " << Uczen::ilu() << " uczniow" << endl;
    Uczen a("Ala");
    Uczen b("Bartek");
    {
        Uczen c("Celina");
        c.info();
        cout << "W bloku: " << Uczen::ilu() << endl;
    }
    a.info();
    b.info();
    cout << "Po bloku: " << Uczen::ilu() << " (limit " << Uczen::LIMIT << ")" << endl;
    cout << "Czy jest miejsce? " << (Uczen::czyJestMiejsce() ? "tak" : "nie") << endl;
    return 0;
}
`,
    },
    tasks: [
      {
        id: 'o04t1',
        title: 'Licznik obiektów',
        difficulty: 1,
        description: 'Utwórz klasę `Obiekt` z prywatnym polem statycznym `ile`, które konstruktor zwiększa, a destruktor zmniejsza, oraz statyczną metodą `ileIstnieje()`. W `main` wczytaj `n`, utwórz tablicę dynamiczną `new Obiekt[n]`, a potem ją usuń. Wypisz:',
        expectedOutput: 'Na poczatku: 0\nPo utworzeniu: 3\nPo usunieciu: 0',
        exampleInput: '3',
        starter: starter({ before: 'class Obiekt {\n    // pole statyczne ile\npublic:\n    // konstruktor, destruktor, static int ileIstnieje()\n};\n\n// definicja pola statycznego', body: '    int n;\n    cin >> n;\n    // Twoj kod tutaj\n' }),
        hints: [
          'W klasie: `static int ile;`, a poza klasą: `int Obiekt::ile = 0;`',
          'Konstruktor `Obiekt() { ile++; }`, destruktor `~Obiekt() { ile--; }`.',
          'Wywołanie: `Obiekt::ileIstnieje()`; tablica: `Obiekt *t = new Obiekt[n]; ... delete[] t;`',
        ],
        checks: [
          { pattern: 'static\\s+int\\s+ile', message: 'Dodaj pole statyczne static int ile.' },
          { pattern: 'int\\s+Obiekt\\s*::\\s*ile', message: 'Zdefiniuj pole statyczne poza klasą: int Obiekt::ile = 0;' },
        ],
        solution: `${H()}
class Obiekt {
    static int ile;
public:
    Obiekt() { ile++; }
    ~Obiekt() { ile--; }
    static int ileIstnieje() { return ile; }
};

int Obiekt::ile = 0;

int main() {
    int n;
    cin >> n;
    cout << "Na poczatku: " << Obiekt::ileIstnieje() << endl;
    Obiekt *t = new Obiekt[n];
    cout << "Po utworzeniu: " << Obiekt::ileIstnieje() << endl;
    delete[] t;
    cout << "Po usunieciu: " << Obiekt::ileIstnieje() << endl;
    return 0;
}
`,
        tests: [
          { input: '3', expected: 'Na poczatku: 0\nPo utworzeniu: 3\nPo usunieciu: 0' },
          { input: '1', expected: 'Na poczatku: 0\nPo utworzeniu: 1\nPo usunieciu: 0' },
          { input: '10', expected: 'Na poczatku: 0\nPo utworzeniu: 10\nPo usunieciu: 0' },
        ],
      },
      {
        id: 'o04t2',
        title: 'Numery seryjne',
        difficulty: 2,
        description: 'Każdy obiekt klasy `Produkt` ma otrzymywać kolejny numer seryjny, zaczynając od 1001. Użyj **statycznego** pola `nastepnyNumer`. Wczytaj `n` nazw produktów, dla każdej utwórz obiekt i wypisz `NUMER: nazwa`. Na końcu wypisz `Nastepny numer: X` (użyj metody statycznej).',
        expectedOutput: '1001: mleko\n1002: chleb\n1003: ser\nNastepny numer: 1004',
        exampleInput: '3\nmleko chleb ser',
        starter: starter({ before: 'class Produkt {\n    string nazwa;\n    int numer;\n    // pole statyczne\npublic:\n    // konstruktor, wypisz(), static int podgladNumeru()\n};', body: '    int n;\n    cin >> n;\n    // Twoj kod tutaj\n' }),
        hints: [
          'Konstruktor: `Produkt(string n) : nazwa(n), numer(nastepnyNumer) { nastepnyNumer++; }`',
          'Definicja poza klasą: `int Produkt::nastepnyNumer = 1001;`',
          'Metoda statyczna: `static int podgladNumeru() { return nastepnyNumer; }`',
        ],
        checks: [{ pattern: 'static\\s+int\\s+nastepnyNumer', message: 'Użyj pola statycznego static int nastepnyNumer.' }],
        solution: `${H()}
class Produkt {
    string nazwa;
    int numer;
    static int nastepnyNumer;
public:
    Produkt(string n) : nazwa(n), numer(nastepnyNumer) {
        nastepnyNumer++;
    }
    void wypisz() const {
        cout << numer << ": " << nazwa << endl;
    }
    static int podgladNumeru() { return nastepnyNumer; }
};

int Produkt::nastepnyNumer = 1001;

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        Produkt p(s);
        p.wypisz();
    }
    cout << "Nastepny numer: " << Produkt::podgladNumeru() << endl;
    return 0;
}
`,
        tests: [
          { input: '3\nmleko chleb ser', expected: '1001: mleko\n1002: chleb\n1003: ser\nNastepny numer: 1004' },
          { input: '0', expected: 'Nastepny numer: 1001' },
          { input: '1\nwoda', expected: '1001: woda\nNastepny numer: 1002' },
        ],
      },
      {
        id: 'o04t3',
        title: 'Klasa narzędziowa',
        difficulty: 2,
        description: 'Utwórz klasę `Matematyka` zawierającą wyłącznie **metody statyczne**: `long long silnia(int n)`, `int nwd(int a, int b)` i `bool czyPierwsza(int n)`. W `main` wczytaj `a b` i – bez tworzenia obiektu – wypisz:',
        expectedOutput: 'silnia(5) = 120\nnwd(5, 12) = 1\npierwsza(12): nie',
        exampleInput: '5 12',
        starter: starter({ before: 'class Matematyka {\npublic:\n    // metody statyczne\n};', body: '    int a, b;\n    cin >> a >> b;\n    // uzyj Matematyka::silnia(a) itd.\n' }),
        hints: [
          'Deklaracja: `static long long silnia(int n) { ... }`',
          'Wywołanie bez obiektu: `Matematyka::silnia(a)`.',
        ],
        checks: [
          { pattern: 'static\\s+\\w+(\\s+\\w+)?\\s+silnia', message: 'Metoda silnia powinna być statyczna.' },
          { pattern: 'Matematyka\\s*::\\s*silnia\\s*\\(', message: 'Wywołaj metodę przez nazwę klasy: Matematyka::silnia(a).' },
        ],
        solution: `${H()}
class Matematyka {
public:
    static long long silnia(int n) {
        long long w = 1;
        for (int i = 2; i <= n; i++) w *= i;
        return w;
    }
    static int nwd(int a, int b) {
        while (b != 0) {
            int r = a % b;
            a = b;
            b = r;
        }
        return a;
    }
    static bool czyPierwsza(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }
};

int main() {
    int a, b;
    cin >> a >> b;
    cout << "silnia(" << a << ") = " << Matematyka::silnia(a) << endl;
    cout << "nwd(" << a << ", " << b << ") = " << Matematyka::nwd(a, b) << endl;
    cout << "pierwsza(" << b << "): " << (Matematyka::czyPierwsza(b) ? "tak" : "nie") << endl;
    return 0;
}
`,
        tests: [
          { input: '5 12', expected: 'silnia(5) = 120\nnwd(5, 12) = 1\npierwsza(12): nie' },
          { input: '6 9', expected: 'silnia(6) = 720\nnwd(6, 9) = 3\npierwsza(9): nie' },
          { input: '4 7', expected: 'silnia(4) = 24\nnwd(4, 7) = 1\npierwsza(7): tak' },
        ],
      },
    ],
  },
];
