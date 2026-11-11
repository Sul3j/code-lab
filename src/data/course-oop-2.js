// Część II kursu – programowanie obiektowe (2/2).
// Każdy kod startowy, przykład i rozwiązanie zawiera `using namespace std;`.
import { starter } from './template.js';

const H = (extra = []) => ['iostream', 'string', ...extra].map((i) => `#include <${i}>`).join('\n') + '\nusing namespace std;\n';

export const oopInheritance = {
  id: 'o05',
  title: 'Dziedziczenie',
  subtitle: 'klasa bazowa i pochodna, protected',
  icon: 'GitFork',
  practice: true,
  part: 'oop',
  theory: [
    { type: 'p', text: '**Dziedziczenie** pozwala utworzyć nową klasę na podstawie istniejącej. Klasa **pochodna** przejmuje pola i metody klasy **bazowej**, może dodać własne i zmienić działanie odziedziczonych. Opisuje relację **„jest”**: Uczeń *jest* Osobą, Samochód *jest* Pojazdem.' },
    { type: 'code', code: `class Osoba {                      // klasa bazowa
protected:
    string imie;
public:
    Osoba(string i) : imie(i) {}
    void przedstaw() const { cout << "Jestem " << imie; }
};

class Uczen : public Osoba {       // Uczen dziedziczy po Osoba
    int klasa;
public:
    Uczen(string i, int k) : Osoba(i), klasa(k) {}   // wywolanie konstruktora bazowego
    void przedstaw() const {
        Osoba::przedstaw();          // wywolanie wersji z klasy bazowej
        cout << " z klasy " << klasa;
    }
};` },
    { type: 'list', items: [
      '`class Pochodna : public Bazowa` – dziedziczenie publiczne (najczęstsze): publiczne składowe bazy pozostają publiczne.',
      'Pola **private** klasy bazowej są w obiekcie pochodnym, ale klasa pochodna **nie ma do nich bezpośredniego dostępu**. Dlatego pola przeznaczone dla potomków oznaczamy **protected**.',
      'Konstruktor klasy bazowej wywołujemy na **liście inicjalizacyjnej**: `Uczen(...) : Osoba(i), ...`.',
      'Klasa pochodna może **przesłonić** metodę bazową, definiując metodę o tej samej nazwie; wersję bazową wywołamy przez `Bazowa::metoda()`.',
    ] },
    { type: 'h', text: 'Kolejność konstruktorów i destruktorów' },
    { type: 'p', text: 'Przy tworzeniu obiektu najpierw działa konstruktor **klasy bazowej**, potem pochodnej (fundamenty przed piętrami). Destruktory wywołują się w **odwrotnej** kolejności.' },
    { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

class A {
public:
    A() { cout << "Konstruktor A" << endl; }
    ~A() { cout << "Destruktor A" << endl; }
};
class B : public A {
public:
    B() { cout << "Konstruktor B" << endl; }
    ~B() { cout << "Destruktor B" << endl; }
};
class C : public B {
public:
    C() { cout << "Konstruktor C" << endl; }
    ~C() { cout << "Destruktor C" << endl; }
};

int main() {
    C obiekt;      // A, B, C ... a na koncu ~C, ~B, ~A
    return 0;
}` },
    { type: 'table', head: ['Składowa w bazie', 'public', 'protected', 'private'], rows: [
      ['dostęp z klasy pochodnej', 'tak', 'tak', 'nie'],
      ['dostęp z zewnątrz (main)', 'tak', 'nie', 'nie'],
    ] },
    { type: 'tip', text: 'Dziedziczenie stosuj tylko wtedy, gdy relacja „jest” naprawdę zachodzi. Jeśli obiekt „ma” inny obiekt (samochód ma silnik), lepsza jest **kompozycja** – o niej w jednej z kolejnych lekcji.' },
  ],
  example: {
    title: 'Pojazdy',
    description: 'Klasa bazowa z polami protected, dwie klasy pochodne, wywołanie konstruktora bazowego, przesłanianie metody i wywołanie wersji bazowej.',
    code: `#include <iostream>
#include <string>
using namespace std;

class Pojazd {
protected:
    string nazwa;
    int predkoscMax;
public:
    Pojazd(string n, int v) : nazwa(n), predkoscMax(v) {
        cout << "[Pojazd] " << nazwa << endl;
    }
    void opis() const {
        cout << nazwa << ", max " << predkoscMax << " km/h";
    }
    double czasPrzejazdu(double km) const {
        return km / predkoscMax;
    }
};

class Samochod : public Pojazd {
    int miejsca;
public:
    Samochod(string n, int v, int m) : Pojazd(n, v), miejsca(m) {
        cout << "[Samochod] " << miejsca << " miejsc" << endl;
    }
    void opis() const {
        Pojazd::opis();                  // najpierw opis z klasy bazowej
        cout << ", miejsc: " << miejsca;
    }
};

class Rower : public Pojazd {
public:
    Rower(string n) : Pojazd(n, 25) {}
    void dzwonek() const { cout << nazwa << ": dzyn dzyn!" << endl; }
};

int main() {
    Samochod s("Fiat", 160, 5);
    Rower r("Romet");

    s.opis();
    cout << endl;
    r.opis();
    cout << endl;
    r.dzwonek();

    cout << "100 km samochodem: " << s.czasPrzejazdu(100) << " h" << endl;
    cout << "100 km rowerem: " << r.czasPrzejazdu(100) << " h" << endl;
    return 0;
}
`,
  },
  tasks: [
    {
      id: 'o05t1',
      title: 'Osoba i Uczeń',
      difficulty: 1,
      description: 'Klasa `Osoba` ma pola **protected** `imie`, `wiek` i metodę `przedstaw()`, która wypisuje `Jestem IMIE, mam WIEK lat` (bez końca linii). Utwórz klasę `Uczen` dziedziczącą po `Osoba`, z dodatkowym polem `szkola`. Jej metoda `przedstaw()` ma wywołać wersję z klasy bazowej (`Osoba::przedstaw()`) i dopisać `, szkola: SZKOLA`. Wczytaj imię, wiek i szkołę, a potem wypisz przedstawienie ucznia:',
      expectedOutput: 'Jestem Ola, mam 15 lat, szkola: LO1',
      exampleInput: 'Ola 15 LO1',
      starter: starter({
        before: `class Osoba {
protected:
    string imie;
    int wiek;
public:
    Osoba(string i, int w) : imie(i), wiek(w) {}
    void przedstaw() const {
        cout << "Jestem " << imie << ", mam " << wiek << " lat";
    }
};

// klasa Uczen`,
        body: '    string imie, szkola;\n    int wiek;\n    cin >> imie >> wiek >> szkola;\n    // utworz ucznia i wywolaj przedstaw()\n',
      }),
      hints: [
        'Nagłówek: `class Uczen : public Osoba { string szkola; public: ... };`',
        'Konstruktor: `Uczen(string i, int w, string s) : Osoba(i, w), szkola(s) {}`',
        'Metoda: `void przedstaw() const { Osoba::przedstaw(); cout << ", szkola: " << szkola; }`',
      ],
      checks: [
        { pattern: 'class\\s+Uczen\\s*:\\s*public\\s+Osoba', message: 'Klasa Uczen powinna dziedziczyć publicznie po Osoba.' },
        { pattern: 'Osoba\\s*::\\s*przedstaw\\s*\\(', message: 'Wywołaj wersję z klasy bazowej: Osoba::przedstaw().' },
      ],
      solution: `${H()}
class Osoba {
protected:
    string imie;
    int wiek;
public:
    Osoba(string i, int w) : imie(i), wiek(w) {}
    void przedstaw() const {
        cout << "Jestem " << imie << ", mam " << wiek << " lat";
    }
};

class Uczen : public Osoba {
    string szkola;
public:
    Uczen(string i, int w, string s) : Osoba(i, w), szkola(s) {}
    void przedstaw() const {
        Osoba::przedstaw();
        cout << ", szkola: " << szkola;
    }
};

int main() {
    string imie, szkola;
    int wiek;
    cin >> imie >> wiek >> szkola;
    Uczen u(imie, wiek, szkola);
    u.przedstaw();
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: 'Ola 15 LO1', expected: 'Jestem Ola, mam 15 lat, szkola: LO1' },
        { input: 'Jan 17 Technikum', expected: 'Jestem Jan, mam 17 lat, szkola: Technikum' },
      ],
    },
    {
      id: 'o05t2',
      title: 'Konto oszczędnościowe',
      difficulty: 2,
      description: 'Klasa bazowa `Konto` ma pole **protected** `saldo`, metody `wplac()` i `getSaldo()`. Utwórz klasę `KontoOszczednosciowe : public Konto` z polem `procent` i metodą `dodajOdsetki()`, która powiększa saldo o `procent`%. Wczytaj saldo początkowe, oprocentowanie i liczbę lat; dolicz odsetki raz na rok i wypisz saldo z 2 miejscami po przecinku:',
      expectedOutput: 'Saldo: 1102.50',
      exampleInput: '1000 5 2',
      starter: starter({
        includes: ['iomanip'],
        before: `class Konto {
protected:
    double saldo;
public:
    Konto(double s) : saldo(s) {}
    void wplac(double kwota) { if (kwota > 0) saldo += kwota; }
    double getSaldo() const { return saldo; }
};

// klasa KontoOszczednosciowe`,
        body: '    double s, p;\n    int lata;\n    cin >> s >> p >> lata;\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Konstruktor: `KontoOszczednosciowe(double s, double p) : Konto(s), procent(p) {}`',
        'Pole `saldo` jest protected, więc w metodzie klasy pochodnej możesz napisać `saldo += saldo * procent / 100;`',
        'Wypisanie: `cout << fixed << setprecision(2) << "Saldo: " << k.getSaldo();`',
      ],
      checks: [{ pattern: 'class\\s+KontoOszczednosciowe\\s*:\\s*public\\s+Konto', message: 'KontoOszczednosciowe powinno dziedziczyć po Konto.' }],
      solution: `${H(['iomanip'])}
class Konto {
protected:
    double saldo;
public:
    Konto(double s) : saldo(s) {}
    void wplac(double kwota) { if (kwota > 0) saldo += kwota; }
    double getSaldo() const { return saldo; }
};

class KontoOszczednosciowe : public Konto {
    double procent;
public:
    KontoOszczednosciowe(double s, double p) : Konto(s), procent(p) {}
    void dodajOdsetki() {
        saldo += saldo * procent / 100;
    }
};

int main() {
    double s, p;
    int lata;
    cin >> s >> p >> lata;
    KontoOszczednosciowe k(s, p);
    for (int i = 0; i < lata; i++) k.dodajOdsetki();
    cout << fixed << setprecision(2) << "Saldo: " << k.getSaldo() << endl;
    return 0;
}
`,
      tests: [
        { input: '1000 5 2', expected: 'Saldo: 1102.50' },
        { input: '500 10 1', expected: 'Saldo: 550.00' },
        { input: '200 0 5', expected: 'Saldo: 200.00' },
      ],
    },
    {
      id: 'o05t3',
      title: 'Kolejność konstruktorów',
      difficulty: 2,
      description: 'Uzupełnij hierarchię `A ← B ← C` (B dziedziczy po A, C po B). Każda klasa ma konstruktor wypisujący `Konstruktor X` i destruktor wypisujący `Destruktor X`. Program (już gotowy w `main`) tworzy w pętli `n` obiektów klasy `C`. Sprawdź, w jakiej kolejności działają konstruktory i destruktory.',
      expectedOutput: 'Konstruktor A\nKonstruktor B\nKonstruktor C\nDestruktor C\nDestruktor B\nDestruktor A',
      exampleInput: '1',
      starter: starter({
        before: `class A {
public:
    // konstruktor i destruktor
};

class B : public A {
public:
    // konstruktor i destruktor
};

class C : public B {
public:
    // konstruktor i destruktor
};`,
        body: '    int n;\n    cin >> n;\n    for (int i = 0; i < n; i++) {\n        C obiekt;\n    }\n',
      }),
      hints: [
        'Konstruktor: `A() { cout << "Konstruktor A" << endl; }`',
        'Destruktor: `~A() { cout << "Destruktor A" << endl; }`',
        'Nie musisz wywoływać konstruktorów bazowych ręcznie – domyślne zostaną wywołane automatycznie.',
      ],
      checks: [{ pattern: '~\\s*C\\s*\\(', message: 'Dodaj destruktor ~C().' }],
      solution: `${H()}
class A {
public:
    A() { cout << "Konstruktor A" << endl; }
    ~A() { cout << "Destruktor A" << endl; }
};

class B : public A {
public:
    B() { cout << "Konstruktor B" << endl; }
    ~B() { cout << "Destruktor B" << endl; }
};

class C : public B {
public:
    C() { cout << "Konstruktor C" << endl; }
    ~C() { cout << "Destruktor C" << endl; }
};

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        C obiekt;
    }
    return 0;
}
`,
      tests: [
        { input: '1', expected: 'Konstruktor A\nKonstruktor B\nKonstruktor C\nDestruktor C\nDestruktor B\nDestruktor A' },
        { input: '2', expected: 'Konstruktor A\nKonstruktor B\nKonstruktor C\nDestruktor C\nDestruktor B\nDestruktor A\nKonstruktor A\nKonstruktor B\nKonstruktor C\nDestruktor C\nDestruktor B\nDestruktor A' },
      ],
    },
  ],
};

export const oopPolymorphism = {
  id: 'o06',
  title: 'Polimorfizm',
  subtitle: 'virtual, override, wiązanie dynamiczne',
  icon: 'Shuffle',
  practice: true,
  part: 'oop',
  theory: [
    { type: 'p', text: '**Polimorfizm** („wielopostaciowość”) oznacza, że ta sama operacja może działać różnie w zależności od obiektu. Wywołujemy `zwierze->dajGlos()`, a odpowiada pies, kot albo krowa – zależnie od tego, jaki obiekt naprawdę kryje się pod wskaźnikiem.' },
    { type: 'table', head: ['Rodzaj', 'Mechanizm', 'Kiedy wybierana jest wersja'], rows: [
      ['statyczny (czasu kompilacji)', 'przeciążanie funkcji i operatorów', 'kompilator – na podstawie typów argumentów'],
      ['dynamiczny (czasu wykonania)', 'metody wirtualne (virtual)', 'w trakcie działania – na podstawie rzeczywistego obiektu'],
    ] },
    { type: 'h', text: 'Metody wirtualne' },
    { type: 'code', code: `class Zwierze {
public:
    virtual string glos() const { return "..."; }   // metoda wirtualna
    virtual ~Zwierze() {}                            // wirtualny destruktor
};
class Pies : public Zwierze {
public:
    string glos() const override { return "Hau!"; }  // nadpisanie
};

Zwierze *z = new Pies();
cout << z->glos();     // "Hau!" - wersja z klasy Pies
delete z;` },
    { type: 'list', items: [
      'Wskaźnik lub referencja typu bazowego może wskazywać na obiekt dowolnej klasy pochodnej.',
      'Gdy metoda jest **virtual**, decyzja, którą wersję wywołać, zapada w trakcie działania programu (**wiązanie dynamiczne**). Bez virtual – zawsze wywoła się wersja z typu wskaźnika (**wiązanie statyczne**).',
      '**override** przy metodzie klasy pochodnej to prośba do kompilatora: „sprawdź, czy naprawdę coś nadpisuję”. Literówka w nazwie da wtedy błąd zamiast cichej pomyłki.',
      'Klasa bazowa używana polimorficznie powinna mieć **virtual destruktor**, inaczej `delete` przez wskaźnik bazowy nie wywoła destruktora pochodnego.',
    ] },
    { type: 'h', text: 'Pułapka: przekazywanie przez wartość (slicing)' },
    { type: 'p', text: 'Polimorfizm działa tylko przez **wskaźniki i referencje**. Gdy obiekt pochodny przekażemy do funkcji przyjmującej klasę bazową **przez wartość**, zostanie skopiowana tylko część bazowa (tzw. „przycięcie”, *object slicing*) i wywoła się wersja bazowa metody.' },
    { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

class Zwierze {
public:
    virtual string glos() const { return "..."; }
    virtual ~Zwierze() {}
};
class Kot : public Zwierze {
public:
    string glos() const override { return "Miau!"; }
};

void przezReferencje(const Zwierze &z) { cout << "referencja: " << z.glos() << endl; }
void przezWartosc(Zwierze z)           { cout << "wartosc: " << z.glos() << endl; }

int main() {
    Kot k;
    przezReferencje(k);    // Miau!
    przezWartosc(k);       // ... - obiekt zostal przyciety do klasy Zwierze!
    return 0;
}` },
    { type: 'tip', text: 'Typowy wzorzec: tablica lub wektor wskaźników na klasę bazową (`vector<Figura*>`) i jedna pętla, która dla każdego elementu wywołuje tę samą metodę – każdy obiekt odpowiada „po swojemu”. Dodanie nowej klasy pochodnej nie wymaga zmiany tej pętli.' },
  ],
  example: {
    title: 'Lista płac',
    description: 'Różne rodzaje pracowników w jednej tablicy wskaźników. Metoda wirtualna liczy pensję, metoda niewirtualna pokazuje różnicę w wiązaniu.',
    code: `#include <iostream>
#include <string>
using namespace std;

class Pracownik {
protected:
    string imie;
public:
    Pracownik(string i) : imie(i) {}
    virtual double pensja() const { return 0; }
    virtual string stanowisko() const { return "pracownik"; }
    string typ() const { return "Pracownik"; }            // NIE wirtualna
    void wypisz() const {
        cout << imie << " (" << stanowisko() << "): " << pensja() << " zl" << endl;
    }
    virtual ~Pracownik() {}
};

class Etatowy : public Pracownik {
    double stala;
public:
    Etatowy(string i, double s) : Pracownik(i), stala(s) {}
    double pensja() const override { return stala; }
    string stanowisko() const override { return "etat"; }
    string typ() const { return "Etatowy"; }
};

class Godzinowy : public Pracownik {
    double stawka;
    int godziny;
public:
    Godzinowy(string i, double s, int g) : Pracownik(i), stawka(s), godziny(g) {}
    double pensja() const override { return stawka * godziny; }
    string stanowisko() const override { return "godzinowy"; }
};

class Kierownik : public Etatowy {
    double premia;
public:
    Kierownik(string i, double s, double p) : Etatowy(i, s), premia(p) {}
    double pensja() const override { return Etatowy::pensja() + premia; }
    string stanowisko() const override { return "kierownik"; }
};

int main() {
    Pracownik *zespol[3] = {
        new Etatowy("Ola", 5200),
        new Godzinowy("Jan", 35, 120),
        new Kierownik("Ewa", 7000, 1500)
    };

    double suma = 0;
    for (int i = 0; i < 3; i++) {
        zespol[i]->wypisz();              // polimorfizm: wlasciwa pensja() i stanowisko()
        suma += zespol[i]->pensja();
    }
    cout << "Razem: " << suma << " zl" << endl;

    cout << "typ() przez wskaznik bazowy: " << zespol[0]->typ() << " (bez virtual!)" << endl;

    for (int i = 0; i < 3; i++) delete zespol[i];
    return 0;
}
`,
  },
  tasks: [
    {
      id: 'o06t1',
      title: 'Pensje pracowników',
      difficulty: 2,
      description: 'Klasa bazowa `Pracownik` ma pole `imie` i **wirtualną** metodę `double pensja() const`. Utwórz klasy `Etatowy` (stała pensja) i `Godzinowy` (stawka × godziny). Wczytaj `n` (1–20), a potem `n` linii: `E imie kwota` lub `G imie stawka godziny`. Obiekty utwórz przez `new` i przechowuj w tablicy `Pracownik*`. Wypisz pensję każdego pracownika i sumę:',
      expectedOutput: 'Ola: 5000\nJan: 4000\nRazem: 9000',
      exampleInput: '2\nE Ola 5000\nG Jan 40 100',
      starter: starter({
        before: `class Pracownik {
protected:
    string imie;
public:
    Pracownik(string i) : imie(i) {}
    string getImie() const { return imie; }
    virtual double pensja() const { return 0; }
    virtual ~Pracownik() {}
};

// klasy Etatowy i Godzinowy`,
        body: '    int n;\n    cin >> n;\n    Pracownik *t[20];\n    // Twoj kod tutaj\n',
      }),
      hints: [
        '`class Etatowy : public Pracownik { double kwota; public: Etatowy(string i, double k) : Pracownik(i), kwota(k) {} double pensja() const override { return kwota; } };`',
        'Tworzenie: `if (typ == \'E\') { ... t[i] = new Etatowy(imie, kwota); }`',
        'W pętli wypisującej: `t[i]->getImie()` i `t[i]->pensja()`; na końcu `delete t[i];`.',
      ],
      checks: [
        { pattern: 'class\\s+Godzinowy\\s*:\\s*public\\s+Pracownik', message: 'Klasa Godzinowy powinna dziedziczyć po Pracownik.' },
        { pattern: '->\\s*pensja\\s*\\(', message: 'Wywołuj pensja() przez wskaźnik na klasę bazową.' },
      ],
      solution: `${H()}
class Pracownik {
protected:
    string imie;
public:
    Pracownik(string i) : imie(i) {}
    string getImie() const { return imie; }
    virtual double pensja() const { return 0; }
    virtual ~Pracownik() {}
};

class Etatowy : public Pracownik {
    double kwota;
public:
    Etatowy(string i, double k) : Pracownik(i), kwota(k) {}
    double pensja() const override { return kwota; }
};

class Godzinowy : public Pracownik {
    double stawka;
    int godziny;
public:
    Godzinowy(string i, double s, int g) : Pracownik(i), stawka(s), godziny(g) {}
    double pensja() const override { return stawka * godziny; }
};

int main() {
    int n;
    cin >> n;
    Pracownik *t[20];
    for (int i = 0; i < n; i++) {
        char typ;
        string imie;
        cin >> typ >> imie;
        if (typ == 'E') {
            double k;
            cin >> k;
            t[i] = new Etatowy(imie, k);
        } else {
            double s;
            int g;
            cin >> s >> g;
            t[i] = new Godzinowy(imie, s, g);
        }
    }
    double suma = 0;
    for (int i = 0; i < n; i++) {
        cout << t[i]->getImie() << ": " << t[i]->pensja() << endl;
        suma += t[i]->pensja();
    }
    cout << "Razem: " << suma << endl;
    for (int i = 0; i < n; i++) delete t[i];
    return 0;
}
`,
      tests: [
        { input: '2\nE Ola 5000\nG Jan 40 100', expected: 'Ola: 5000\nJan: 4000\nRazem: 9000' },
        { input: '1\nG Ewa 25.5 10', expected: 'Ewa: 255\nRazem: 255' },
        { input: '3\nE A 100\nE B 200\nG C 10 3', expected: 'A: 100\nB: 200\nC: 30\nRazem: 330' },
      ],
    },
    {
      id: 'o06t2',
      title: 'Napraw brakujące virtual',
      difficulty: 1,
      description: 'Program w kodzie startowym ma błąd: zwierzęta przechowywane przez wskaźniki `Zwierze*` zawsze „mówią” `...`. Popraw klasy tak, aby zadziałał **polimorfizm** – każde zwierzę ma wydać swój głos. Nie zmieniaj funkcji `main`.',
      expectedOutput: 'Hau!\nMiau!\nMuu!',
      exampleInput: '3\npies kot krowa',
      starter: `${H()}
class Zwierze {
public:
    string glos() const { return "..."; }
    ~Zwierze() {}
};

class Pies : public Zwierze {
public:
    string glos() const { return "Hau!"; }
};

class Kot : public Zwierze {
public:
    string glos() const { return "Miau!"; }
};

class Krowa : public Zwierze {
public:
    string glos() const { return "Muu!"; }
};

int main() {
    int n;
    cin >> n;
    Zwierze *t[10];
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        if (s == "pies") t[i] = new Pies();
        else if (s == "kot") t[i] = new Kot();
        else t[i] = new Krowa();
    }
    for (int i = 0; i < n; i++) cout << t[i]->glos() << endl;
    for (int i = 0; i < n; i++) delete t[i];
    return 0;
}
`,
      hints: [
        'Wywołanie przez wskaźnik `Zwierze*` bez słowa `virtual` zawsze wybiera wersję z klasy `Zwierze`.',
        'Dopisz `virtual` przed metodą `glos()` w klasie bazowej (i przed destruktorem!).',
        'W klasach pochodnych warto dopisać `override` – kompilator sprawdzi, czy nadpisanie jest poprawne.',
      ],
      checks: [{ pattern: 'virtual\\s+string\\s+glos', message: 'Metoda glos() w klasie bazowej powinna być wirtualna.' }],
      solution: `${H()}
class Zwierze {
public:
    virtual string glos() const { return "..."; }
    virtual ~Zwierze() {}
};

class Pies : public Zwierze {
public:
    string glos() const override { return "Hau!"; }
};

class Kot : public Zwierze {
public:
    string glos() const override { return "Miau!"; }
};

class Krowa : public Zwierze {
public:
    string glos() const override { return "Muu!"; }
};

int main() {
    int n;
    cin >> n;
    Zwierze *t[10];
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        if (s == "pies") t[i] = new Pies();
        else if (s == "kot") t[i] = new Kot();
        else t[i] = new Krowa();
    }
    for (int i = 0; i < n; i++) cout << t[i]->glos() << endl;
    for (int i = 0; i < n; i++) delete t[i];
    return 0;
}
`,
      tests: [
        { input: '3\npies kot krowa', expected: 'Hau!\nMiau!\nMuu!' },
        { input: '2\nkot kot', expected: 'Miau!\nMiau!' },
      ],
    },
    {
      id: 'o06t3',
      title: 'Rysowanie kształtów',
      difficulty: 3,
      description: 'Klasa bazowa `Ksztalt` ma wirtualną metodę `void rysuj() const`. Utwórz klasy: `Kwadrat(n)` – n linii po n znaków `#`, `Trojkat(n)` – linie z 1, 2, …, n gwiazdkami `*`, `Linia(n)` – jedna linia z n znaków `-`. Wczytaj `k`, a potem `k` linii `K n`, `T n` lub `L n`; zapisz kształty w `vector<Ksztalt*>` i narysuj je po kolei.',
      expectedOutput: '##\n##\n*\n**\n***\n----',
      exampleInput: '3\nK 2\nT 3\nL 4',
      starter: starter({
        includes: ['vector'],
        before: `class Ksztalt {
public:
    virtual void rysuj() const = 0;
    virtual ~Ksztalt() {}
};

// klasy Kwadrat, Trojkat, Linia`,
        body: '    int k;\n    cin >> k;\n    vector<Ksztalt*> ksztalty;\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Każda klasa przechowuje rozmiar `n` i nadpisuje `rysuj()` zagnieżdżonymi pętlami.',
        'Dodawanie: `ksztalty.push_back(new Kwadrat(n));`',
        'Rysowanie: `for (Ksztalt *s : ksztalty) s->rysuj();` – i nie zapomnij o `delete`.',
      ],
      checks: [{ pattern: 'vector\\s*<\\s*Ksztalt\\s*\\*\\s*>', message: 'Przechowuj kształty w vector<Ksztalt*>.' }],
      solution: `${H(['vector'])}
class Ksztalt {
public:
    virtual void rysuj() const = 0;
    virtual ~Ksztalt() {}
};

class Kwadrat : public Ksztalt {
    int n;
public:
    Kwadrat(int n) : n(n) {}
    void rysuj() const override {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cout << '#';
            cout << endl;
        }
    }
};

class Trojkat : public Ksztalt {
    int n;
public:
    Trojkat(int n) : n(n) {}
    void rysuj() const override {
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) cout << '*';
            cout << endl;
        }
    }
};

class Linia : public Ksztalt {
    int n;
public:
    Linia(int n) : n(n) {}
    void rysuj() const override {
        for (int i = 0; i < n; i++) cout << '-';
        cout << endl;
    }
};

int main() {
    int k;
    cin >> k;
    vector<Ksztalt*> ksztalty;
    for (int i = 0; i < k; i++) {
        char typ;
        int n;
        cin >> typ >> n;
        if (typ == 'K') ksztalty.push_back(new Kwadrat(n));
        else if (typ == 'T') ksztalty.push_back(new Trojkat(n));
        else ksztalty.push_back(new Linia(n));
    }
    for (Ksztalt *s : ksztalty) s->rysuj();
    for (Ksztalt *s : ksztalty) delete s;
    return 0;
}
`,
      tests: [
        { input: '3\nK 2\nT 3\nL 4', expected: '##\n##\n*\n**\n***\n----' },
        { input: '1\nT 1', expected: '*' },
        { input: '2\nL 3\nK 1', expected: '---\n#' },
      ],
    },
  ],
};

export const oopComposition = {
  id: 'o08',
  title: 'Kompozycja i agregacja',
  subtitle: 'relacja „ma”, obiekty w obiektach',
  icon: 'Puzzle',
  practice: true,
  part: 'oop',
  theory: [
    { type: 'p', text: 'Obiekty mogą składać się z innych obiektów. Taka relacja to **„ma”** (*has-a*): samochód **ma** silnik, klasa szkolna **ma** uczniów. W C++ wyrażamy ją, umieszczając w klasie pole będące obiektem innej klasy albo wskaźnikiem na nie.' },
    { type: 'table', head: ['', 'Kompozycja', 'Agregacja'], rows: [
      ['zapis w C++', 'pole-obiekt: Silnik silnik;', 'wskaźnik/referencja: Kierowca *kierowca;'],
      ['czas życia części', 'część powstaje i ginie razem z całością', 'część istnieje niezależnie'],
      ['przykład', 'Samochód – Silnik, Dom – Pokoje', 'Klasa – Uczniowie, Biblioteka – Czytelnik'],
      ['własność', 'całość jest właścicielem części', 'całość tylko „korzysta” z części'],
    ] },
    { type: 'code', code: `class Silnik {
    int moc;
public:
    Silnik(int m) : moc(m) {}
    int getMoc() const { return moc; }
};

class Samochod {
    string marka;
    Silnik silnik;              // KOMPOZYCJA - samochod zawiera silnik
    Osoba *kierowca;            // AGREGACJA - kierowca istnieje niezaleznie
public:
    Samochod(string m, int moc) : marka(m), silnik(moc), kierowca(nullptr) {}
    void wsiadz(Osoba *o) { kierowca = o; }
};` },
    { type: 'list', items: [
      'Pole-obiekt inicjalizujemy na **liście inicjalizacyjnej** (`silnik(moc)`), zwłaszcza gdy jego klasa nie ma konstruktora domyślnego.',
      'Kolejność: najpierw konstruowane są pola-obiekty, potem wykonuje się ciało konstruktora całości. Destrukcja przebiega odwrotnie: najpierw destruktor całości, potem pól.',
      'Przy agregacji obiekt-całość **nie usuwa** części (`delete`) – nie jest jej właścicielem.',
    ] },
    { type: 'h', text: 'Dziedziczenie czy kompozycja?' },
    { type: 'p', text: 'Zadaj pytanie: czy A **jest** B (dziedziczenie), czy A **ma** B (kompozycja)? Kwadrat *jest* figurą, ale samochód *nie jest* silnikiem – ma silnik. Popularna zasada projektowa brzmi: **„przedkładaj kompozycję nad dziedziczenie”** – kompozycja tworzy luźniejsze, łatwiejsze do zmiany powiązania.' },
  ],
  example: {
    title: 'Samochód, silnik i kierowca',
    description: 'Silnik jest częścią samochodu (kompozycja – zwróć uwagę na kolejność komunikatów), a kierowca istnieje niezależnie (agregacja przez wskaźnik).',
    code: `#include <iostream>
#include <string>
using namespace std;

class Silnik {
    int moc;
public:
    Silnik(int m) : moc(m) { cout << "  [+] silnik " << moc << " KM" << endl; }
    ~Silnik() { cout << "  [-] silnik" << endl; }
    int getMoc() const { return moc; }
};

class Kierowca {
    string imie;
public:
    Kierowca(string i) : imie(i) {}
    string getImie() const { return imie; }
};

class Samochod {
    string marka;
    Silnik silnik;            // kompozycja
    Kierowca *kierowca;       // agregacja
public:
    Samochod(string m, int moc) : marka(m), silnik(moc), kierowca(nullptr) {
        cout << "  [+] samochod " << marka << endl;
    }
    ~Samochod() { cout << "  [-] samochod " << marka << endl; }

    void wsiadz(Kierowca *k) { kierowca = k; }
    void wysiadz() { kierowca = nullptr; }

    void info() const {
        cout << marka << ", " << silnik.getMoc() << " KM, kierowca: "
             << (kierowca != nullptr ? kierowca->getImie() : "brak") << endl;
    }
};

int main() {
    Kierowca ola("Ola");
    cout << "Tworze samochod:" << endl;
    {
        Samochod auto1("Fiat", 90);
        auto1.info();
        auto1.wsiadz(&ola);
        auto1.info();
        cout << "Koniec bloku:" << endl;
    }
    cout << "Kierowca nadal istnieje: " << ola.getImie() << endl;
    return 0;
}
`,
  },
  tasks: [
    {
      id: 'o08t1',
      title: 'Prostokąt z dwóch punktów',
      difficulty: 2,
      description: 'Klasa `Punkt` ma pola `x`, `y` i konstruktor. Utwórz klasę `Prostokat` złożoną z **dwóch punktów** (lewy dolny i prawy górny róg) z metodami `pole()`, `obwod()` oraz `bool zawiera(Punkt p) const` (punkt na brzegu też się liczy). Wczytaj `x1 y1 x2 y2` oraz punkt `px py` i wypisz:',
      expectedOutput: 'Pole: 12\nObwod: 14\nPunkt w srodku: tak',
      exampleInput: '0 0 4 3 1 1',
      starter: starter({
        before: `class Punkt {
public:
    double x, y;
    Punkt(double x = 0, double y = 0) : x(x), y(y) {}
};

class Prostokat {
    Punkt lewyDolny, prawyGorny;
public:
    // konstruktor i metody
};`,
        body: '    double x1, y1, x2, y2, px, py;\n    cin >> x1 >> y1 >> x2 >> y2 >> px >> py;\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Konstruktor: `Prostokat(Punkt a, Punkt b) : lewyDolny(a), prawyGorny(b) {}`',
        'Szerokość: `prawyGorny.x - lewyDolny.x`, wysokość analogicznie.',
        'Zawieranie: `p.x >= lewyDolny.x && p.x <= prawyGorny.x && ...` (to samo dla y).',
      ],
      checks: [{ pattern: 'Punkt\\s+lewyDolny', message: 'Prostokąt powinien zawierać pola typu Punkt (kompozycja).' }],
      solution: `${H()}
class Punkt {
public:
    double x, y;
    Punkt(double x = 0, double y = 0) : x(x), y(y) {}
};

class Prostokat {
    Punkt lewyDolny, prawyGorny;
public:
    Prostokat(Punkt a, Punkt b) : lewyDolny(a), prawyGorny(b) {}
    double szerokosc() const { return prawyGorny.x - lewyDolny.x; }
    double wysokosc() const { return prawyGorny.y - lewyDolny.y; }
    double pole() const { return szerokosc() * wysokosc(); }
    double obwod() const { return 2 * (szerokosc() + wysokosc()); }
    bool zawiera(Punkt p) const {
        return p.x >= lewyDolny.x && p.x <= prawyGorny.x
            && p.y >= lewyDolny.y && p.y <= prawyGorny.y;
    }
};

int main() {
    double x1, y1, x2, y2, px, py;
    cin >> x1 >> y1 >> x2 >> y2 >> px >> py;
    Prostokat r(Punkt(x1, y1), Punkt(x2, y2));
    cout << "Pole: " << r.pole() << endl;
    cout << "Obwod: " << r.obwod() << endl;
    cout << "Punkt w srodku: " << (r.zawiera(Punkt(px, py)) ? "tak" : "nie") << endl;
    return 0;
}
`,
      tests: [
        { input: '0 0 4 3 1 1', expected: 'Pole: 12\nObwod: 14\nPunkt w srodku: tak' },
        { input: '1 1 3 3 5 2', expected: 'Pole: 4\nObwod: 8\nPunkt w srodku: nie' },
        { input: '0 0 2 2 2 2', expected: 'Pole: 4\nObwod: 8\nPunkt w srodku: tak' },
      ],
    },
    {
      id: 'o08t2',
      title: 'Koszyk zakupów',
      difficulty: 2,
      description: 'Klasa `Produkt` ma prywatne pola `nazwa` i `cena` oraz gettery. Utwórz klasę `Koszyk`, która **zawiera** `vector<Produkt>` i ma metody `dodaj(const Produkt& p)`, `suma()`, `ile()` oraz `najdrozszy()` (zwraca produkt). Wczytaj `n` (≥ 1), a potem `n` linii `nazwa cena`. Wypisz:',
      expectedOutput: 'Produktow: 3\nSuma: 19.7\nNajdrozszy: ser',
      exampleInput: '3\nchleb 4.5\nser 12\nmleko 3.2',
      starter: starter({
        includes: ['vector'],
        before: `class Produkt {
    string nazwa;
    double cena;
public:
    Produkt(string n, double c) : nazwa(n), cena(c) {}
    string getNazwa() const { return nazwa; }
    double getCena() const { return cena; }
};

class Koszyk {
    vector<Produkt> produkty;
public:
    // dodaj, suma, ile, najdrozszy
};`,
        body: '    int n;\n    cin >> n;\n    Koszyk k;\n    // Twoj kod tutaj\n',
      }),
      hints: [
        'Dodawanie: `void dodaj(const Produkt& p) { produkty.push_back(p); }`',
        'Suma: `for (const Produkt &p : produkty) s += p.getCena();`',
        'Najdroższy: zapamiętaj indeks największej ceny i zwróć `produkty[naj]`.',
      ],
      checks: [{ pattern: 'vector\\s*<\\s*Produkt\\s*>', message: 'Koszyk powinien zawierać vector<Produkt>.' }],
      solution: `${H(['vector'])}
class Produkt {
    string nazwa;
    double cena;
public:
    Produkt(string n, double c) : nazwa(n), cena(c) {}
    string getNazwa() const { return nazwa; }
    double getCena() const { return cena; }
};

class Koszyk {
    vector<Produkt> produkty;
public:
    void dodaj(const Produkt& p) { produkty.push_back(p); }
    int ile() const { return produkty.size(); }
    double suma() const {
        double s = 0;
        for (const Produkt &p : produkty) s += p.getCena();
        return s;
    }
    Produkt najdrozszy() const {
        int naj = 0;
        for (int i = 1; i < produkty.size(); i++) {
            if (produkty[i].getCena() > produkty[naj].getCena()) naj = i;
        }
        return produkty[naj];
    }
};

int main() {
    int n;
    cin >> n;
    Koszyk k;
    for (int i = 0; i < n; i++) {
        string nazwa;
        double cena;
        cin >> nazwa >> cena;
        k.dodaj(Produkt(nazwa, cena));
    }
    cout << "Produktow: " << k.ile() << endl;
    cout << "Suma: " << k.suma() << endl;
    cout << "Najdrozszy: " << k.najdrozszy().getNazwa() << endl;
    return 0;
}
`,
      tests: [
        { input: '3\nchleb 4.5\nser 12\nmleko 3.2', expected: 'Produktow: 3\nSuma: 19.7\nNajdrozszy: ser' },
        { input: '1\nwoda 2', expected: 'Produktow: 1\nSuma: 2\nNajdrozszy: woda' },
        { input: '2\nA 5\nB 5', expected: 'Produktow: 2\nSuma: 10\nNajdrozszy: A' },
      ],
    },
    {
      id: 'o08t3',
      title: 'Biblioteka (agregacja)',
      difficulty: 3,
      description: 'Klasa `Ksiazka` ma tytuł i flagę `wypozyczona`. Klasa `Czytelnik` przechowuje **wskaźniki** na wypożyczone książki (`vector<Ksiazka*>`) – książki należą do biblioteki, nie do czytelnika (agregacja). Metoda `bool wypozycz(Ksiazka* k)` udaje się tylko, gdy książka jest dostępna.\n\nWczytaj `m` i `m` tytułów (jednowyrazowych), a potem `n` poleceń `W i` (wypożycz książkę o indeksie i). Dla każdego polecenia wypisz `Wypozyczono: TYTUL` lub `Niedostepna: TYTUL`, a na końcu `Czytelnik ma: K`.',
      expectedOutput: 'Wypozyczono: PanTadeusz\nWypozyczono: Quo\nNiedostepna: PanTadeusz\nWypozyczono: Lalka\nCzytelnik ma: 3',
      exampleInput: '3\nPanTadeusz Lalka Quo\n4\nW 0\nW 2\nW 0\nW 1',
      starter: starter({
        includes: ['vector'],
        before: `class Ksiazka {
    string tytul;
    bool wypozyczona;
public:
    Ksiazka(string t) : tytul(t), wypozyczona(false) {}
    string getTytul() const { return tytul; }
    bool czyDostepna() const { return !wypozyczona; }
    void ustawWypozyczona(bool w) { wypozyczona = w; }
};

class Czytelnik {
    vector<Ksiazka*> ksiazki;
public:
    // wypozycz, ile
};`,
        body: '    int m;\n    cin >> m;\n    vector<Ksiazka> biblioteka;\n    for (int i = 0; i < m; i++) {\n        string t;\n        cin >> t;\n        biblioteka.push_back(Ksiazka(t));\n    }\n    Czytelnik c;\n    // obsluz polecenia\n',
      }),
      hints: [
        'Wypożyczenie: `if (!k->czyDostepna()) return false; k->ustawWypozyczona(true); ksiazki.push_back(k); return true;`',
        'Adres książki z biblioteki: `&biblioteka[i]`.',
        'Liczba wypożyczonych: `ksiazki.size()`.',
      ],
      checks: [{ pattern: 'vector\\s*<\\s*Ksiazka\\s*\\*\\s*>', message: 'Czytelnik powinien przechowywać wskaźniki: vector<Ksiazka*>.' }],
      solution: `${H(['vector'])}
class Ksiazka {
    string tytul;
    bool wypozyczona;
public:
    Ksiazka(string t) : tytul(t), wypozyczona(false) {}
    string getTytul() const { return tytul; }
    bool czyDostepna() const { return !wypozyczona; }
    void ustawWypozyczona(bool w) { wypozyczona = w; }
};

class Czytelnik {
    vector<Ksiazka*> ksiazki;
public:
    bool wypozycz(Ksiazka* k) {
        if (!k->czyDostepna()) return false;
        k->ustawWypozyczona(true);
        ksiazki.push_back(k);
        return true;
    }
    int ile() const { return ksiazki.size(); }
};

int main() {
    int m;
    cin >> m;
    vector<Ksiazka> biblioteka;
    for (int i = 0; i < m; i++) {
        string t;
        cin >> t;
        biblioteka.push_back(Ksiazka(t));
    }
    Czytelnik c;
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        char p;
        int idx;
        cin >> p >> idx;
        Ksiazka *k = &biblioteka[idx];
        if (c.wypozycz(k)) cout << "Wypozyczono: " << k->getTytul() << endl;
        else cout << "Niedostepna: " << k->getTytul() << endl;
    }
    cout << "Czytelnik ma: " << c.ile() << endl;
    return 0;
}
`,
      tests: [
        { input: '3\nPanTadeusz Lalka Quo\n4\nW 0\nW 2\nW 0\nW 1', expected: 'Wypozyczono: PanTadeusz\nWypozyczono: Quo\nNiedostepna: PanTadeusz\nWypozyczono: Lalka\nCzytelnik ma: 3' },
        { input: '1\nHobbit\n2\nW 0\nW 0', expected: 'Wypozyczono: Hobbit\nNiedostepna: Hobbit\nCzytelnik ma: 1' },
      ],
    },
  ],
};

export const oopOperators = {
  id: 'o09',
  title: 'Przeciążanie operatorów',
  subtitle: 'operator+, operator==, operator<<, friend',
  icon: 'Plus',
  practice: true,
  part: 'oop',
  theory: [
    { type: 'p', text: '**Przeciążanie operatorów** pozwala używać zwykłych operatorów (`+`, `==`, `<<`…) z obiektami własnych klas. Zamiast `a.dodaj(b)` piszemy naturalnie `a + b`. Operator to po prostu funkcja o specjalnej nazwie: `operator+`, `operator==`, `operator<<`.' },
    { type: 'code', code: `class Wektor {
public:
    double x, y;
    Wektor(double x = 0, double y = 0) : x(x), y(y) {}

    // operator jako METODA: lewy argument to *this
    Wektor operator+(const Wektor& o) const {
        return Wektor(x + o.x, y + o.y);
    }
    bool operator==(const Wektor& o) const {
        return x == o.x && y == o.y;
    }
};

// operator jako FUNKCJA GLOBALNA: oba argumenty jawnie
Wektor operator*(const Wektor& w, double k) {
    return Wektor(w.x * k, w.y * k);
}

Wektor a(1, 2), b(3, 4);
Wektor c = a + b;        // a.operator+(b)
Wektor d = a * 2;        // operator*(a, 2)` },
    { type: 'table', head: ['Operatory', 'Typowa postać'], rows: [
      ['+ - * /', 'Klasa operator+(const Klasa& o) const'],
      ['== != < >', 'bool operator==(const Klasa& o) const'],
      ['+= -=', 'Klasa& operator+=(const Klasa& o) { ...; return *this; }'],
      ['- (jednoargumentowy)', 'Klasa operator-() const'],
      ['[ ]', 'double operator[](int i) const'],
      ['<< (wypisywanie)', 'friend ostream& operator<<(ostream& os, const Klasa& k)'],
      ['>> (wczytywanie)', 'friend istream& operator>>(istream& is, Klasa& k)'],
    ] },
    { type: 'h', text: 'Wypisywanie przez cout – operator<< i friend' },
    { type: 'p', text: 'W wyrażeniu `cout << w` lewym argumentem jest `cout`, a nie nasz obiekt, więc `operator<<` musi być **funkcją globalną**. Żeby miała dostęp do prywatnych pól, deklarujemy ją w klasie jako **zaprzyjaźnioną** (`friend`). Zwraca strumień, dzięki czemu można łączyć wypisywanie: `cout << a << " " << b;`.' },
    { type: 'code', code: `#include <iostream>
#include <string>
using namespace std;

class Ulamek {
    int l, m;
public:
    Ulamek(int l, int m) : l(l), m(m) {}
    Ulamek operator*(const Ulamek& o) const { return Ulamek(l * o.l, m * o.m); }
    friend ostream& operator<<(ostream& os, const Ulamek& u) {
        os << u.l << "/" << u.m;
        return os;
    }
};

int main() {
    Ulamek a(1, 2), b(3, 4);
    cout << a << " * " << b << " = " << a * b << endl;
    return 0;
}` },
    { type: 'h', text: 'Zasady' },
    { type: 'list', items: [
      'Nie można tworzyć nowych operatorów ani zmieniać ich priorytetu czy liczby argumentów.',
      'Przynajmniej jeden argument musi być obiektem klasy użytkownika (nie przeciążysz `+` dla dwóch `int`).',
      'Operator powinien zachować intuicyjne znaczenie: `+` ma dodawać, a nie np. usuwać.',
      'Funkcja zaprzyjaźniona (**friend**) nie jest metodą klasy, ale ma dostęp do jej składowych prywatnych – używaj jej oszczędnie, bo osłabia enkapsulację.',
    ] },
  ],
  example: {
    title: 'Wektor 2D',
    description: 'Operatory arytmetyczne, porównania, +=, jednoargumentowy minus, indeksowanie oraz wypisywanie i wczytywanie przez friend operator<< i operator>>. Program wczytuje jeden wektor.',
    input: '5 6',
    code: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

class Wektor {
    double x, y;
public:
    Wektor(double x = 0, double y = 0) : x(x), y(y) {}

    Wektor operator+(const Wektor& o) const { return Wektor(x + o.x, y + o.y); }
    Wektor operator-(const Wektor& o) const { return Wektor(x - o.x, y - o.y); }
    Wektor operator*(double k) const { return Wektor(x * k, y * k); }
    Wektor operator-() const { return Wektor(-x, -y); }
    bool operator==(const Wektor& o) const { return x == o.x && y == o.y; }
    bool operator!=(const Wektor& o) const { return !(*this == o); }

    Wektor& operator+=(const Wektor& o) {
        x += o.x;
        y += o.y;
        return *this;
    }

    double operator[](int i) const { return i == 0 ? x : y; }
    double dlugosc() const { return sqrt(x * x + y * y); }

    friend ostream& operator<<(ostream& os, const Wektor& w) {
        os << "[" << w.x << ", " << w.y << "]";
        return os;
    }
    friend istream& operator>>(istream& is, Wektor& w) {
        is >> w.x >> w.y;
        return is;
    }
};

int main() {
    Wektor a(1, 2), b(3, 4);
    cout << "a + b = " << a + b << endl;
    cout << "b - a = " << b - a << endl;
    cout << "a * 3 = " << a * 3 << endl;
    cout << "-a = " << -a << endl;
    cout << "a == b ? " << (a == b) << ", a != b ? " << (a != b) << endl;

    a += b;
    cout << "po a += b: " << a << ", x = " << a[0] << ", |a| = " << a.dlugosc() << endl;

    Wektor w;
    cout << "Podaj wektor (x y): ";
    cin >> w;
    cout << "Wczytano " << w << endl;
    return 0;
}
`,
  },
  tasks: [
    {
      id: 'o09t1',
      title: 'Działania na wektorach',
      difficulty: 2,
      description: 'Klasa `Wektor` ma prywatne pola `x`, `y`. Przeciąż operatory `+` i `-` (dwa wektory), `*` (wektor razy liczba) oraz `<<` (wypisuje `[x, y]`). Wczytaj dwa wektory i liczbę `k`, a potem wypisz:',
      expectedOutput: 'a + b = [4, 6]\na - b = [-2, -2]\na * k = [2, 4]',
      exampleInput: '1 2 3 4 2',
      starter: starter({
        before: `class Wektor {
    double x, y;
public:
    Wektor(double x = 0, double y = 0) : x(x), y(y) {}
    // operatory +, -, * oraz friend operator<<
};`,
        body: '    double x1, y1, x2, y2, k;\n    cin >> x1 >> y1 >> x2 >> y2 >> k;\n    Wektor a(x1, y1), b(x2, y2);\n    // wypisz wyniki uzywajac operatorow\n',
      }),
      hints: [
        '`Wektor operator+(const Wektor& o) const { return Wektor(x + o.x, y + o.y); }`',
        '`Wektor operator*(double k) const { return Wektor(x * k, y * k); }`',
        '`friend ostream& operator<<(ostream& os, const Wektor& w) { os << "[" << w.x << ", " << w.y << "]"; return os; }`',
      ],
      checks: [
        { pattern: 'operator\\s*\\+\\s*\\(', message: 'Przeciąż operator +.' },
        { pattern: 'operator\\s*<<\\s*\\(', message: 'Przeciąż operator << do wypisywania.' },
      ],
      solution: `${H()}
class Wektor {
    double x, y;
public:
    Wektor(double x = 0, double y = 0) : x(x), y(y) {}
    Wektor operator+(const Wektor& o) const { return Wektor(x + o.x, y + o.y); }
    Wektor operator-(const Wektor& o) const { return Wektor(x - o.x, y - o.y); }
    Wektor operator*(double k) const { return Wektor(x * k, y * k); }
    friend ostream& operator<<(ostream& os, const Wektor& w) {
        os << "[" << w.x << ", " << w.y << "]";
        return os;
    }
};

int main() {
    double x1, y1, x2, y2, k;
    cin >> x1 >> y1 >> x2 >> y2 >> k;
    Wektor a(x1, y1), b(x2, y2);
    cout << "a + b = " << a + b << endl;
    cout << "a - b = " << a - b << endl;
    cout << "a * k = " << a * k << endl;
    return 0;
}
`,
      tests: [
        { input: '1 2 3 4 2', expected: 'a + b = [4, 6]\na - b = [-2, -2]\na * k = [2, 4]' },
        { input: '0 0 1 1 5', expected: 'a + b = [1, 1]\na - b = [-1, -1]\na * k = [0, 0]' },
        { input: '2.5 -1 0.5 1 -2', expected: 'a + b = [3, 0]\na - b = [2, -2]\na * k = [-5, 2]' },
      ],
    },
    {
      id: 'o09t2',
      title: 'Porównywanie godzin',
      difficulty: 2,
      description: 'Klasa `Godzina` ma pola `h` i `m`. Przeciąż operatory `==` oraz `<`. Wczytaj dwie godziny (`h1 m1 h2 m2`) i używając **tylko tych operatorów**, wypisz `Rowne`, `Pierwsza wczesniej` albo `Druga wczesniej`.',
      expectedOutput: 'Pierwsza wczesniej',
      exampleInput: '9 59 10 0',
      starter: starter({
        before: `class Godzina {
    int h, m;
public:
    Godzina(int h, int m) : h(h), m(m) {}
    // operator== i operator<
};`,
        body: '    int h1, m1, h2, m2;\n    cin >> h1 >> m1 >> h2 >> m2;\n    Godzina a(h1, m1), b(h2, m2);\n    // porownaj a i b operatorami\n',
      }),
      hints: [
        '`bool operator==(const Godzina& o) const { return h == o.h && m == o.m; }`',
        'Najprościej porównać liczbę minut od północy: `h * 60 + m < o.h * 60 + o.m`.',
        'W main: `if (a == b) ... else if (a < b) ... else ...`',
      ],
      checks: [
        { pattern: 'operator\\s*==\\s*\\(', message: 'Przeciąż operator ==.' },
        { pattern: 'operator\\s*<\\s*\\(', message: 'Przeciąż operator <.' },
      ],
      solution: `${H()}
class Godzina {
    int h, m;
public:
    Godzina(int h, int m) : h(h), m(m) {}
    bool operator==(const Godzina& o) const { return h == o.h && m == o.m; }
    bool operator<(const Godzina& o) const { return h * 60 + m < o.h * 60 + o.m; }
};

int main() {
    int h1, m1, h2, m2;
    cin >> h1 >> m1 >> h2 >> m2;
    Godzina a(h1, m1), b(h2, m2);
    if (a == b) cout << "Rowne" << endl;
    else if (a < b) cout << "Pierwsza wczesniej" << endl;
    else cout << "Druga wczesniej" << endl;
    return 0;
}
`,
      tests: [
        { input: '9 59 10 0', expected: 'Pierwsza wczesniej' },
        { input: '10 30 10 30', expected: 'Rowne' },
        { input: '12 0 11 59', expected: 'Druga wczesniej' },
      ],
    },
    {
      id: 'o09t3',
      title: 'Kwota pieniędzy',
      difficulty: 3,
      description: 'Klasa `Kwota` przechowuje pieniądze w **groszach** (`long long`). Konstruktor `Kwota(int zl, int gr)`. Przeciąż `+=` (zwraca `*this`) oraz `<<`, który wypisuje kwotę w formacie `12.05 zl` (zawsze dwie cyfry groszy). Wczytaj `n` i `n` kwot (`zl gr`), zsumuj je operatorem `+=` i wypisz:',
      expectedOutput: 'Suma: 12.05 zl',
      exampleInput: '2\n10 50\n1 55',
      starter: starter({
        before: `class Kwota {
    long long grosze;
public:
    Kwota(int zl = 0, int gr = 0) : grosze(zl * 100LL + gr) {}
    // operator+= i friend operator<<
};`,
        body: '    int n;\n    cin >> n;\n    Kwota suma;\n    // wczytaj kwoty i dodawaj je operatorem +=\n',
      }),
      hints: [
        '`Kwota& operator+=(const Kwota& o) { grosze += o.grosze; return *this; }`',
        'Złote: `k.grosze / 100`, grosze: `k.grosze % 100`.',
        'Dwie cyfry groszy: `if (gr < 10) os << 0;` przed wypisaniem groszy.',
      ],
      checks: [
        { pattern: 'operator\\s*\\+=\\s*\\(', message: 'Przeciąż operator +=.' },
        { pattern: 'operator\\s*<<\\s*\\(', message: 'Przeciąż operator <<.' },
      ],
      solution: `${H()}
class Kwota {
    long long grosze;
public:
    Kwota(int zl = 0, int gr = 0) : grosze(zl * 100LL + gr) {}

    Kwota& operator+=(const Kwota& o) {
        grosze += o.grosze;
        return *this;
    }

    friend ostream& operator<<(ostream& os, const Kwota& k) {
        long long gr = k.grosze % 100;
        os << k.grosze / 100 << ".";
        if (gr < 10) os << 0;
        os << gr << " zl";
        return os;
    }
};

int main() {
    int n;
    cin >> n;
    Kwota suma;
    for (int i = 0; i < n; i++) {
        int zl, gr;
        cin >> zl >> gr;
        suma += Kwota(zl, gr);
    }
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
      tests: [
        { input: '2\n10 50\n1 55', expected: 'Suma: 12.05 zl' },
        { input: '3\n0 99\n0 1\n5 0', expected: 'Suma: 6.00 zl' },
        { input: '1\n7 7', expected: 'Suma: 7.07 zl' },
      ],
    },
    {
      id: 'o09t4',
      title: 'Ułamki z operatorami',
      difficulty: 3,
      description: 'Klasa `Ulamek` (licznik, mianownik > 0) **skraca się w konstruktorze**. Przeciąż operatory `+` i `*` oraz `<<` (format `l/m`). Wczytaj dwa ułamki `l1 m1 l2 m2` i wypisz:',
      expectedOutput: '1/2 + 1/3 = 5/6\n1/2 * 1/3 = 1/6',
      exampleInput: '1 2 1 3',
      starter: starter({
        before: `int nwd(int a, int b) {
    if (a < 0) a = -a;
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

class Ulamek {
    int l, m;
public:
    Ulamek(int l, int m) : l(l), m(m) {
        // skroc ulamek
    }
    // operatory +, * i friend operator<<
};`,
        body: '    int l1, m1, l2, m2;\n    cin >> l1 >> m1 >> l2 >> m2;\n    Ulamek a(l1, m1), b(l2, m2);\n    // wypisz sume i iloczyn\n',
      }),
      hints: [
        'Skracanie w konstruktorze: `int d = nwd(l, m); if (d != 0) { l /= d; m /= d; }` – uwaga na zasłanianie: pola to `this->l`, `this->m`.',
        'Suma: `Ulamek(l * o.m + o.l * m, m * o.m)` – konstruktor sam skróci wynik.',
        'Wypisanie: `cout << a << " + " << b << " = " << a + b << endl;`',
      ],
      checks: [
        { pattern: 'operator\\s*\\*\\s*\\(', message: 'Przeciąż operator *.' },
        { pattern: 'operator\\s*<<\\s*\\(', message: 'Przeciąż operator <<.' },
      ],
      solution: `${H()}
int nwd(int a, int b) {
    if (a < 0) a = -a;
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

class Ulamek {
    int l, m;
public:
    Ulamek(int licznik, int mianownik) : l(licznik), m(mianownik) {
        int d = nwd(l, m);
        if (d != 0) {
            l /= d;
            m /= d;
        }
    }
    Ulamek operator+(const Ulamek& o) const { return Ulamek(l * o.m + o.l * m, m * o.m); }
    Ulamek operator*(const Ulamek& o) const { return Ulamek(l * o.l, m * o.m); }
    friend ostream& operator<<(ostream& os, const Ulamek& u) {
        os << u.l << "/" << u.m;
        return os;
    }
};

int main() {
    int l1, m1, l2, m2;
    cin >> l1 >> m1 >> l2 >> m2;
    Ulamek a(l1, m1), b(l2, m2);
    cout << a << " + " << b << " = " << a + b << endl;
    cout << a << " * " << b << " = " << a * b << endl;
    return 0;
}
`,
      tests: [
        { input: '1 2 1 3', expected: '1/2 + 1/3 = 5/6\n1/2 * 1/3 = 1/6' },
        { input: '2 4 1 2', expected: '1/2 + 1/2 = 1/1\n1/2 * 1/2 = 1/4' },
        { input: '3 4 4 3', expected: '3/4 + 4/3 = 25/12\n3/4 * 4/3 = 1/1' },
      ],
    },
  ],
};
