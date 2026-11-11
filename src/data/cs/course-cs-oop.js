// Kurs C# – część II: programowanie obiektowe. Każdy program zaczyna się od `using System;`.
import { csProg } from '../lang-templates.js';

export const csOop = [
  // ─────────────── Klasy i obiekty ───────────────
  {
    id: 'cs23', title: 'Klasy i obiekty', subtitle: 'pola, metody, new', icon: 'Boxes', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Klasa** to projekt opisujący dane (**pola**) i zachowania (**metody**). **Obiekt** to konkretny egzemplarz klasy tworzony operatorem `new`. Klasy są typami **referencyjnymi** – zmienna przechowuje odwołanie do obiektu.' },
      { type: 'table', head: ['Filar OOP', 'Idea'], rows: [
        ['Abstrakcja', 'opisujemy tylko to, co istotne'], ['Hermetyzacja', 'ukrywamy dane, udostępniamy bezpieczne metody i właściwości'],
        ['Dziedziczenie', 'klasa pochodna przejmuje cechy bazowej'], ['Polimorfizm', 'ta sama operacja działa różnie dla różnych obiektów'],
      ] },
      { type: 'code', code: `class Samochod
{
    public string Marka;          // pole
    public double Paliwo;

    public void Jedz(double km)   // metoda
    {
        Paliwo -= km * 0.06;
    }
}

Samochod a = new Samochod();
a.Marka = "Fiat";
a.Paliwo = 40;
a.Jedz(100);` },
      { type: 'list', items: [
        'Składowe bez modyfikatora są **private** – żeby używać ich z innej klasy, dopisz `public`.',
        'Dostęp do składowych przez kropkę: `obiekt.Pole`, `obiekt.Metoda()`.',
        '`Samochod b = a;` nie tworzy kopii – b i a wskazują ten sam obiekt.',
        'Metoda `ToString()` (z `override`) określa, jak obiekt wygląda w `Console.WriteLine`.',
      ] },
    ],
    example: {
      title: 'Garaż',
      description: 'Klasa z polami i metodami, kilka obiektów, odwołania i nadpisany ToString.',
      code: csProg({ usings: ['System.Collections.Generic'], types: `class Samochod
{
    public string Marka;
    public double Paliwo;
    public double Przebieg;

    public void Jedz(double km)
    {
        double potrzeba = km * 0.06;
        if (potrzeba > Paliwo)
        {
            Console.WriteLine($"{Marka}: za malo paliwa na {km} km!");
            return;
        }
        Paliwo -= potrzeba;
        Przebieg += km;
    }

    public override string ToString() => $"{Marka} (paliwo {Paliwo:F1} l, przebieg {Przebieg} km)";
}`, main: `Samochod a = new Samochod { Marka = "Fiat", Paliwo = 10 };
Samochod b = new Samochod { Marka = "Opel", Paliwo = 3, Przebieg = 1200 };
a.Jedz(100);
b.Jedz(100);
Console.WriteLine(a);
Console.WriteLine(b);

Samochod c = a;          // to samo auto!
c.Jedz(50);
Console.WriteLine($"Po jezdzie c: {a.Przebieg} km");

List<Samochod> garaz = new List<Samochod> { a, b };
Console.WriteLine($"Aut w garazu: {garaz.Count}");` }),
    },
    tasks: [
      {
        id: 'cs23t1', title: 'Klasa Prostokat', difficulty: 1,
        description: 'Utwórz klasę `Prostokat` z publicznymi polami `A`, `B` (double) i metodami `Pole()` oraz `Obwod()`. Wczytaj boki (w jednej linii), utwórz obiekt i wypisz:',
        expectedOutput: 'Pole: 12\nObwod: 14', exampleInput: '3 4',
        starter: csProg({ types: `class Prostokat
{
    // pola i metody
}` }),
        hints: ['`public double Pole() => A * B;`', 'Tworzenie: `Prostokat p = new Prostokat(); p.A = ...;`'],
        checks: [{ pattern: 'class\\s+Prostokat', message: 'Utwórz klasę Prostokat.' }],
        solution: csProg({ types: `class Prostokat
{
    public double A;
    public double B;

    public double Pole() => A * B;
    public double Obwod() => 2 * (A + B);
}`, main: `string[] p = Console.ReadLine().Split(' ');
Prostokat r = new Prostokat();
r.A = double.Parse(p[0]);
r.B = double.Parse(p[1]);
Console.WriteLine($"Pole: {r.Pole()}");
Console.WriteLine($"Obwod: {r.Obwod()}");` }),
        tests: [{ input: '3 4', expected: 'Pole: 12\nObwod: 14' }, { input: '2.5 2', expected: 'Pole: 5\nObwod: 9' }],
      },
      {
        id: 'cs23t2', title: 'Licznik', difficulty: 1,
        description: 'Utwórz klasę `Licznik` z polem `Wartosc` i metodami `Zwieksz()`, `Zmniejsz()` (nie poniżej 0) i `Resetuj()`. Wczytaj linię poleceń `+`, `-`, `r` oddzielonych spacjami, wykonaj je i wypisz:',
        expectedOutput: 'Wartosc: 3', exampleInput: '+ + + - +',
        starter: csProg({ types: `class Licznik
{
    public int Wartosc;
    // metody
}` }),
        hints: ['`public void Zmniejsz() { if (Wartosc > 0) Wartosc--; }`', 'Polecenia: `foreach (string s in Console.ReadLine().Split(\' \'))`.'],
        checks: [{ pattern: 'class\\s+Licznik', message: 'Utwórz klasę Licznik.' }],
        solution: csProg({ types: `class Licznik
{
    public int Wartosc;

    public void Zwieksz() => Wartosc++;
    public void Zmniejsz()
    {
        if (Wartosc > 0) Wartosc--;
    }
    public void Resetuj() => Wartosc = 0;
}`, main: `Licznik l = new Licznik();
foreach (string s in Console.ReadLine().Split(' '))
{
    if (s == "+") l.Zwieksz();
    else if (s == "-") l.Zmniejsz();
    else if (s == "r") l.Resetuj();
}
Console.WriteLine($"Wartosc: {l.Wartosc}");` }),
        tests: [{ input: '+ + + - +', expected: 'Wartosc: 3' }, { input: '- - +', expected: 'Wartosc: 1' }, { input: '+ + r +', expected: 'Wartosc: 1' }],
      },
    ],
  },

  // ─────────────── Konstruktory ───────────────
  {
    id: 'cs24', title: 'Konstruktory', subtitle: 'inicjalizacja obiektów, this(...)', icon: 'Hammer', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Konstruktor** to metoda o nazwie klasy, bez typu zwracanego, wywoływana automatycznie przez `new`. Ustawia obiekt w poprawnym stanie początkowym. Klasa może mieć kilka konstruktorów (przeciążanie).' },
      { type: 'code', code: `class Punkt
{
    public double X, Y;

    public Punkt() : this(0, 0) { }            // wywolanie innego konstruktora

    public Punkt(double x, double y)
    {
        X = x;
        Y = y;
    }
}

Punkt p = new Punkt(3, 4);
Punkt q = new Punkt();
Punkt r = new Punkt { X = 1, Y = 2 };          // inicjalizator obiektu` },
      { type: 'list', items: [
        'Jeśli nie napiszesz konstruktora, C# doda pusty konstruktor bezparametrowy. Gdy napiszesz własny z parametrami, bezparametrowy znika.',
        '`this(...)` wywołuje inny konstruktor tej samej klasy, a `base(...)` – konstruktor klasy bazowej.',
        'Konstruktor może sprawdzać dane i rzucić wyjątek, np. `throw new ArgumentException("...")`.',
        'C# nie ma destruktorów wywoływanych w przewidywalnym momencie – pamięć zwalnia Garbage Collector.',
      ] },
    ],
    example: {
      title: 'Konto z walidacją',
      description: 'Przeciążone konstruktory, łańcuch this(...), walidacja z wyjątkiem i inicjalizator obiektu.',
      code: csProg({ types: `class Konto
{
    public string Wlasciciel;
    public double Saldo;

    public Konto(string wlasciciel) : this(wlasciciel, 0) { }

    public Konto(string wlasciciel, double saldo)
    {
        if (saldo < 0) throw new ArgumentException("Saldo poczatkowe nie moze byc ujemne");
        Wlasciciel = wlasciciel;
        Saldo = saldo;
        Console.WriteLine($"[+] konto {Wlasciciel} ({Saldo} zl)");
    }
}`, main: `Konto a = new Konto("Ola");
Konto b = new Konto("Jan", 150);
try
{
    Konto c = new Konto("Ewa", -10);
}
catch (ArgumentException e)
{
    Console.WriteLine("Blad: " + e.Message);
}
Console.WriteLine($"{a.Wlasciciel}: {a.Saldo}, {b.Wlasciciel}: {b.Saldo}");` }),
    },
    tasks: [
      {
        id: 'cs24t1', title: 'Czas – trzy konstruktory', difficulty: 2,
        description: 'Utwórz klasę `Czas` z polami `H`, `M` i konstruktorami: `Czas()` (00:00), `Czas(int minuty)` i `Czas(int h, int m)`. Konstruktory normalizują czas (nadmiar minut przechodzi w godziny, godziny modulo 24). Metoda `ToString()` zwraca `hh:mm`. Wczytaj linię: `k` (0–2) i `k` liczb; utwórz obiekt i wypisz go.',
        expectedOutput: '02:15', exampleInput: '1 135',
        starter: csProg({ types: `class Czas
{
    public int H, M;
    // konstruktory i ToString
}` }),
        hints: ['Wspólna logika: `int razem = h * 60 + m; H = razem / 60 % 24; M = razem % 60;`', '`Czas(int minuty) : this(0, minuty) { }`', '`public override string ToString() => $"{H:D2}:{M:D2}";`'],
        checks: [{ pattern: '(Czas\\s*\\([^)]*\\)[\\s\\S]*){3}', message: 'Klasa Czas powinna mieć trzy konstruktory.' }],
        solution: csProg({ types: `class Czas
{
    public int H, M;

    public Czas() : this(0, 0) { }
    public Czas(int minuty) : this(0, minuty) { }
    public Czas(int h, int m)
    {
        int razem = h * 60 + m;
        H = razem / 60 % 24;
        M = razem % 60;
    }

    public override string ToString() => $"{H:D2}:{M:D2}";
}`, main: `string[] p = Console.ReadLine().Split(' ');
int k = int.Parse(p[0]);
Czas c;
if (k == 0) c = new Czas();
else if (k == 1) c = new Czas(int.Parse(p[1]));
else c = new Czas(int.Parse(p[1]), int.Parse(p[2]));
Console.WriteLine(c);` }),
        tests: [{ input: '1 135', expected: '02:15' }, { input: '0', expected: '00:00' }, { input: '2 23 70', expected: '00:10' }],
      },
      {
        id: 'cs24t2', title: 'Uczeń z walidacją', difficulty: 2,
        description: 'Klasa `Uczen` ma pola `Imie` i `Wiek`. Konstruktor `Uczen(string imie, int wiek)` rzuca `ArgumentException`, gdy wiek jest spoza zakresu 5–20. Wczytaj `n` i `n` linii `imie wiek`; dla każdej spróbuj utworzyć ucznia i wypisz `Dodano: IMIE` albo `Bledne dane: IMIE`.',
        expectedOutput: 'Dodano: Ola\nBledne dane: Jan\nDodano: Ewa', exampleInput: '3\nOla 15\nJan 40\nEwa 7',
        starter: csProg({ types: `class Uczen
{
    public string Imie;
    public int Wiek;
    // konstruktor z walidacja
}` }),
        hints: ['`if (wiek < 5 || wiek > 20) throw new ArgumentException("Bledny wiek");`', 'W Main: `try { new Uczen(...); Console.WriteLine(...); } catch (ArgumentException) { ... }`'],
        checks: [{ pattern: 'throw\\s+new\\s+ArgumentException', message: 'Konstruktor powinien rzucać ArgumentException.' }],
        solution: csProg({ types: `class Uczen
{
    public string Imie;
    public int Wiek;

    public Uczen(string imie, int wiek)
    {
        if (wiek < 5 || wiek > 20) throw new ArgumentException("Bledny wiek");
        Imie = imie;
        Wiek = wiek;
    }
}`, main: `int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    try
    {
        Uczen u = new Uczen(p[0], int.Parse(p[1]));
        Console.WriteLine($"Dodano: {u.Imie}");
    }
    catch (ArgumentException)
    {
        Console.WriteLine($"Bledne dane: {p[0]}");
    }
}` }),
        tests: [{ input: '3\nOla 15\nJan 40\nEwa 7', expected: 'Dodano: Ola\nBledne dane: Jan\nDodano: Ewa' }, { input: '1\nAdam 3', expected: 'Bledne dane: Adam' }],
      },
    ],
  },

  // ─────────────── Hermetyzacja ───────────────
  {
    id: 'cs25', title: 'Hermetyzacja i właściwości', subtitle: 'private, public, get, set', icon: 'Lock', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Hermetyzacja** (enkapsulacja) oznacza ukrycie danych obiektu (`private`) i udostępnienie kontrolowanego interfejsu. W C# służą do tego **właściwości** (properties) – wyglądają jak pola, ale działają jak metody get/set.' },
      { type: 'code', code: `class Osoba
{
    private int wiek;                  // pole prywatne

    public int Wiek                    // wlasciwosc z walidacja
    {
        get { return wiek; }
        set
        {
            if (value < 0 || value > 130) throw new ArgumentException("Bledny wiek");
            wiek = value;              // value = przypisywana wartosc
        }
    }

    public string Imie { get; set; }                  // wlasciwosc automatyczna
    public double Saldo { get; private set; }         // odczyt dla wszystkich, zapis tylko w klasie
    public bool Pelnoletnia => wiek >= 18;            // tylko do odczytu (obliczana)
}` },
      { type: 'table', head: ['Modyfikator', 'Dostęp'], rows: [
        ['public', 'wszyscy'], ['private', 'tylko ta klasa (domyślny dla składowych)'], ['protected', 'ta klasa i klasy pochodne'], ['internal', 'cały projekt'],
      ] },
      { type: 'tip', text: 'Konwencja C#: pola prywatne małą literą (`saldo`), właściwości i metody publiczne wielką (`Saldo`, `Wplac`).' },
      { type: 'warn', text: 'Odwołanie do składowej prywatnej spoza klasy to błąd kompilacji CS0122 – to celowa ochrona danych.' },
    ],
    example: {
      title: 'Bezpieczne konto',
      description: 'Właściwość z prywatnym setterem, walidacja w metodach i właściwość obliczana.',
      code: csProg({ types: `class Konto
{
    public string Wlasciciel { get; }
    public double Saldo { get; private set; }
    public int Operacje { get; private set; }
    public bool Puste => Saldo == 0;

    public Konto(string wlasciciel)
    {
        Wlasciciel = wlasciciel;
    }

    public void Wplac(double kwota)
    {
        if (kwota <= 0)
        {
            Console.WriteLine($"Odrzucono wplate {kwota}");
            return;
        }
        Saldo += kwota;
        Operacje++;
    }

    public bool Wyplac(double kwota)
    {
        if (kwota <= 0 || kwota > Saldo) return false;
        Saldo -= kwota;
        Operacje++;
        return true;
    }
}`, main: `Konto k = new Konto("Ola");
Console.WriteLine($"Puste? {k.Puste}");
k.Wplac(100);
k.Wplac(-5);
Console.WriteLine($"Wyplata 500: {k.Wyplac(500)}, wyplata 30: {k.Wyplac(30)}");
Console.WriteLine($"{k.Wlasciciel}: {k.Saldo} zl, operacji: {k.Operacje}");
// k.Saldo = 1000000;   // BLAD: setter jest prywatny - odkomentuj i sprawdz` }),
    },
    tasks: [
      {
        id: 'cs25t1', title: 'Termometr', difficulty: 1,
        description: 'Utwórz klasę `Termometr` z prywatnym polem `temp` (początkowo 20) i publiczną właściwością `Temperatura`, której setter rzuca `ArgumentException` dla wartości poniżej −273.15. Wczytaj linię temperatur, spróbuj przypisać każdą i dla błędnych wypisz `Bledna temperatura: X`. Na końcu wypisz `Temperatura: X`.',
        expectedOutput: 'Bledna temperatura: -300\nTemperatura: 18.5', exampleInput: '25 -300 18.5',
        starter: csProg({ types: `class Termometr
{
    private double temp = 20;
    // wlasciwosc Temperatura
}` }),
        hints: ['`public double Temperatura { get => temp; set { if (value < -273.15) throw new ArgumentException("..."); temp = value; } }`', 'W Main obejmij przypisanie blokiem try/catch.'],
        checks: [{ pattern: 'public\\s+double\\s+Temperatura', message: 'Dodaj publiczną właściwość double Temperatura.' }, { pattern: '\\bset\\b', message: 'Właściwość powinna mieć akcesor set z walidacją.' }],
        solution: csProg({ types: `class Termometr
{
    private double temp = 20;

    public double Temperatura
    {
        get => temp;
        set
        {
            if (value < -273.15) throw new ArgumentException("Ponizej zera absolutnego");
            temp = value;
        }
    }
}`, main: `Termometr t = new Termometr();
foreach (string s in Console.ReadLine().Split(' '))
{
    double x = double.Parse(s);
    try
    {
        t.Temperatura = x;
    }
    catch (ArgumentException)
    {
        Console.WriteLine($"Bledna temperatura: {x}");
    }
}
Console.WriteLine($"Temperatura: {t.Temperatura}");` }),
        tests: [{ input: '25 -300 18.5', expected: 'Bledna temperatura: -300\nTemperatura: 18.5' }, { input: '-500', expected: 'Bledna temperatura: -500\nTemperatura: 20' }],
      },
      {
        id: 'cs25t2', title: 'Konto bankowe', difficulty: 2,
        description: 'Klasa `Konto` ma właściwość `Saldo { get; private set; }` (początkowo 0) oraz metody `Wplac(int kwota)` i `bool Wyplac(int kwota)` (false, gdy brakuje środków). Wczytaj `n` i `n` linii `W kwota` lub `P kwota`. Po każdej nieudanej wypłacie wypisz `Brak srodkow`, a na końcu `Saldo: X`.',
        expectedOutput: 'Brak srodkow\nSaldo: 70', exampleInput: '3\nW 100\nP 200\nP 30',
        starter: csProg({ types: `class Konto
{
    public int Saldo { get; private set; }
    // metody Wplac i Wyplac
}` }),
        hints: ['Setter jest prywatny, więc saldo zmieniaj tylko w metodach klasy.', '`string[] p = Console.ReadLine().Split(\' \');` – p[0] to typ operacji.'],
        checks: [{ pattern: 'private\\s+set', message: 'Saldo powinno mieć prywatny setter.' }],
        solution: csProg({ types: `class Konto
{
    public int Saldo { get; private set; }

    public void Wplac(int kwota)
    {
        if (kwota > 0) Saldo += kwota;
    }

    public bool Wyplac(int kwota)
    {
        if (kwota > Saldo) return false;
        Saldo -= kwota;
        return true;
    }
}`, main: `Konto k = new Konto();
int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    int kwota = int.Parse(p[1]);
    if (p[0] == "W") k.Wplac(kwota);
    else if (!k.Wyplac(kwota)) Console.WriteLine("Brak srodkow");
}
Console.WriteLine($"Saldo: {k.Saldo}");` }),
        tests: [{ input: '3\nW 100\nP 200\nP 30', expected: 'Brak srodkow\nSaldo: 70' }, { input: '2\nW 10\nP 10', expected: 'Saldo: 0' }],
      },
    ],
  },

  // ─────────────── Składowe statyczne ───────────────
  {
    id: 'cs26', title: 'Składowe statyczne', subtitle: 'static, const, klasy statyczne', icon: 'Hash', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Składowa **static** należy do **klasy**, a nie do obiektu – istnieje jedna jej kopia, wspólna dla wszystkich obiektów. Odwołujemy się do niej przez nazwę klasy: `Uczen.Liczba`. Metoda statyczna nie ma `this` i nie widzi pól instancji.' },
      { type: 'code', code: `class Uczen
{
    public static int Liczba { get; private set; }   // wspolna dla wszystkich
    public const int MaxWiek = 20;                    // stala (automatycznie static)
    public string Imie;

    public Uczen(string imie)
    {
        Imie = imie;
        Liczba++;
    }

    public static void Raport() => Console.WriteLine($"Uczniow: {Liczba}");
}

static class Matematyka                                // tylko skladowe statyczne
{
    public static int Kwadrat(int x) => x * x;
}` },
      { type: 'list', items: [
        'Typowe zastosowania: liczniki obiektów, generatory numerów, stałe, klasy narzędziowe (jak `Math`).',
        'Nie można utworzyć obiektu klasy `static class` – służy tylko do grupowania metod.',
        'Dlatego metody pomocnicze w klasie `Program` oznaczamy `static` – wywołujemy je z metody statycznej `Main`.',
      ] },
    ],
    example: {
      title: 'Numery legitymacji',
      description: 'Pole statyczne jako generator numerów, stała i klasa statyczna.',
      code: csProg({ types: `class Uczen
{
    private static int nastepnyNumer = 1001;
    public static int Liczba { get; private set; }

    public string Imie { get; }
    public int Numer { get; }

    public Uczen(string imie)
    {
        Imie = imie;
        Numer = nastepnyNumer++;
        Liczba++;
    }

    public override string ToString() => $"Legitymacja {Numer}: {Imie}";
}

static class Szkola
{
    public const int MaxUczniow = 30;
    public static bool JestMiejsce() => Uczen.Liczba < MaxUczniow;
}`, main: `Console.WriteLine($"Na poczatku: {Uczen.Liczba}");
Uczen a = new Uczen("Ala");
Uczen b = new Uczen("Bartek");
Console.WriteLine(a);
Console.WriteLine(b);
Console.WriteLine($"Uczniow: {Uczen.Liczba} / {Szkola.MaxUczniow}, miejsce: {Szkola.JestMiejsce()}");` }),
    },
    tasks: [
      {
        id: 'cs26t1', title: 'Numery seryjne', difficulty: 1,
        description: 'Każdy obiekt klasy `Produkt` otrzymuje kolejny numer, zaczynając od 1001 (użyj pola statycznego). Wczytaj linię nazw produktów, utwórz dla każdej obiekt i wypisz `NUMER: nazwa`. Na końcu wypisz `Utworzono: N` (statyczna właściwość z liczbą produktów).',
        expectedOutput: '1001: mleko\n1002: chleb\n1003: ser\nUtworzono: 3', exampleInput: 'mleko chleb ser',
        starter: csProg({ types: `class Produkt
{
    public string Nazwa;
    public int Numer;
    // skladowe statyczne i konstruktor
}` }),
        hints: ['`private static int nastepny = 1001;` i `public static int Utworzono { get; private set; }`', 'W konstruktorze: `Numer = nastepny++; Utworzono++;`'],
        checks: [{ pattern: '\\bstatic\\s+int\\b', message: 'Użyj pola lub właściwości static int.' }],
        solution: csProg({ types: `class Produkt
{
    private static int nastepny = 1001;
    public static int Utworzono { get; private set; }

    public string Nazwa;
    public int Numer;

    public Produkt(string nazwa)
    {
        Nazwa = nazwa;
        Numer = nastepny++;
        Utworzono++;
    }
}`, main: `foreach (string s in Console.ReadLine().Split(' '))
{
    Produkt p = new Produkt(s);
    Console.WriteLine($"{p.Numer}: {p.Nazwa}");
}
Console.WriteLine($"Utworzono: {Produkt.Utworzono}");` }),
        tests: [{ input: 'mleko chleb ser', expected: '1001: mleko\n1002: chleb\n1003: ser\nUtworzono: 3' }, { input: 'woda', expected: '1001: woda\nUtworzono: 1' }],
      },
      {
        id: 'cs26t2', title: 'Klasa narzędziowa', difficulty: 2,
        description: 'Utwórz **statyczną klasę** `Matematyka` z metodami `Silnia(int n)` (zwraca long), `Nwd(int a, int b)` i `CzyPierwsza(int n)`. Wczytaj `a b` (w jednej linii) i wypisz:',
        expectedOutput: 'Silnia(5) = 120\nNWD(5, 12) = 1\nPierwsza(12): False', exampleInput: '5 12',
        starter: csProg({ types: `static class Matematyka
{
    // metody statyczne
}` }),
        hints: ['Wywołanie: `Matematyka.Silnia(a)`.', 'Wartość bool wypisuje się jako `True`/`False`.'],
        checks: [{ pattern: 'static\\s+class\\s+Matematyka', message: 'Utwórz statyczną klasę Matematyka.' }],
        solution: csProg({ types: `static class Matematyka
{
    public static long Silnia(int n)
    {
        long w = 1;
        for (int i = 2; i <= n; i++) w *= i;
        return w;
    }

    public static int Nwd(int a, int b)
    {
        while (b != 0)
        {
            int r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    public static bool CzyPierwsza(int n)
    {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++)
        {
            if (n % d == 0) return false;
        }
        return true;
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]), b = int.Parse(p[1]);
Console.WriteLine($"Silnia({a}) = {Matematyka.Silnia(a)}");
Console.WriteLine($"NWD({a}, {b}) = {Matematyka.Nwd(a, b)}");
Console.WriteLine($"Pierwsza({b}): {Matematyka.CzyPierwsza(b)}");` }),
        tests: [{ input: '5 12', expected: 'Silnia(5) = 120\nNWD(5, 12) = 1\nPierwsza(12): False' }, { input: '4 7', expected: 'Silnia(4) = 24\nNWD(4, 7) = 1\nPierwsza(7): True' }],
      },
    ],
  },

  // ─────────────── Dziedziczenie ───────────────
  {
    id: 'cs27', title: 'Dziedziczenie', subtitle: 'klasa bazowa, base, protected', icon: 'GitFork', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Dziedziczenie** pozwala utworzyć klasę pochodną na podstawie bazowej: `class Uczen : Osoba`. Klasa pochodna przejmuje składowe bazy, może dodać własne i zmienić działanie metod. Opisuje relację **„jest”**.' },
      { type: 'code', code: `class Osoba
{
    protected string imie;                     // dostepne w klasach pochodnych
    public Osoba(string imie) { this.imie = imie; }
    public virtual string Przedstaw() => $"Jestem {imie}";
}

class Uczen : Osoba
{
    private int klasa;
    public Uczen(string imie, int klasa) : base(imie)   // konstruktor bazowy
    {
        this.klasa = klasa;
    }
    public override string Przedstaw() => base.Przedstaw() + $", klasa {klasa}";
}` },
      { type: 'list', items: [
        'C# pozwala dziedziczyć tylko po **jednej** klasie (ale implementować wiele interfejsów).',
        'Konstruktor bazowy wywołujemy przez `: base(...)`; najpierw wykonuje się konstruktor bazy, potem pochodnej.',
        '`base.Metoda()` wywołuje wersję z klasy bazowej.',
        'Klasa oznaczona `sealed` nie może mieć klas pochodnych.',
        'Wszystkie klasy dziedziczą (pośrednio) po `object` – stąd metody `ToString()`, `Equals()`.',
      ] },
    ],
    example: {
      title: 'Pojazdy',
      description: 'Klasa bazowa z polami protected, dwie klasy pochodne, wywołanie konstruktora i metody bazowej.',
      code: csProg({ types: `class Pojazd
{
    protected string nazwa;
    protected int predkoscMax;

    public Pojazd(string nazwa, int predkoscMax)
    {
        this.nazwa = nazwa;
        this.predkoscMax = predkoscMax;
        Console.WriteLine($"[Pojazd] {nazwa}");
    }

    public virtual string Opis() => $"{nazwa}, max {predkoscMax} km/h";
    public double CzasPrzejazdu(double km) => km / predkoscMax;
}

class Samochod : Pojazd
{
    private int miejsca;

    public Samochod(string nazwa, int v, int miejsca) : base(nazwa, v)
    {
        this.miejsca = miejsca;
        Console.WriteLine($"[Samochod] {miejsca} miejsc");
    }

    public override string Opis() => base.Opis() + $", miejsc: {miejsca}";
}

class Rower : Pojazd
{
    public Rower(string nazwa) : base(nazwa, 25) { }
    public void Dzwonek() => Console.WriteLine($"{nazwa}: dzyn dzyn!");
}`, main: `Samochod s = new Samochod("Fiat", 160, 5);
Rower r = new Rower("Romet");
Console.WriteLine(s.Opis());
Console.WriteLine(r.Opis());
r.Dzwonek();
Console.WriteLine($"100 km rowerem: {r.CzasPrzejazdu(100)} h");` }),
    },
    tasks: [
      {
        id: 'cs27t1', title: 'Osoba i Uczeń', difficulty: 1,
        description: 'Klasa `Osoba` ma pola protected `imie`, `wiek` i wirtualną metodę `Przedstaw()` zwracającą `Jestem IMIE, mam WIEK lat`. Utwórz klasę `Uczen : Osoba` z polem `szkola`, której `Przedstaw()` dokleja `, szkola: SZKOLA` do wyniku `base.Przedstaw()`. Wczytaj `imie wiek szkola` i wypisz przedstawienie ucznia.',
        expectedOutput: 'Jestem Ola, mam 15 lat, szkola: LO1', exampleInput: 'Ola 15 LO1',
        starter: csProg({ types: `class Osoba
{
    protected string imie;
    protected int wiek;

    public Osoba(string imie, int wiek)
    {
        this.imie = imie;
        this.wiek = wiek;
    }

    public virtual string Przedstaw() => $"Jestem {imie}, mam {wiek} lat";
}

// klasa Uczen` }),
        hints: ['`class Uczen : Osoba { private string szkola; public Uczen(string i, int w, string s) : base(i, w) { szkola = s; } ... }`', '`public override string Przedstaw() => base.Przedstaw() + $", szkola: {szkola}";`'],
        checks: [{ pattern: 'class\\s+Uczen\\s*:\\s*Osoba', message: 'Klasa Uczen powinna dziedziczyć po Osoba.' }, { pattern: 'base\\.Przedstaw\\s*\\(', message: 'Użyj base.Przedstaw().' }],
        solution: csProg({ types: `class Osoba
{
    protected string imie;
    protected int wiek;

    public Osoba(string imie, int wiek)
    {
        this.imie = imie;
        this.wiek = wiek;
    }

    public virtual string Przedstaw() => $"Jestem {imie}, mam {wiek} lat";
}

class Uczen : Osoba
{
    private string szkola;

    public Uczen(string imie, int wiek, string szkola) : base(imie, wiek)
    {
        this.szkola = szkola;
    }

    public override string Przedstaw() => base.Przedstaw() + $", szkola: {szkola}";
}`, main: `string[] p = Console.ReadLine().Split(' ');
Uczen u = new Uczen(p[0], int.Parse(p[1]), p[2]);
Console.WriteLine(u.Przedstaw());` }),
        tests: [{ input: 'Ola 15 LO1', expected: 'Jestem Ola, mam 15 lat, szkola: LO1' }, { input: 'Jan 17 Technikum', expected: 'Jestem Jan, mam 17 lat, szkola: Technikum' }],
      },
      {
        id: 'cs27t2', title: 'Konto oszczędnościowe', difficulty: 2,
        description: 'Klasa bazowa `Konto` ma właściwość `Saldo { get; protected set; }` i konstruktor `Konto(double saldo)`. Utwórz `KontoOszczednosciowe : Konto` z polem `procent` i metodą `DodajOdsetki()`. Wczytaj `saldo procent lata`, dolicz odsetki raz na rok i wypisz saldo z 2 miejscami:',
        expectedOutput: 'Saldo: 1102.50', exampleInput: '1000 5 2',
        starter: csProg({ types: `class Konto
{
    public double Saldo { get; protected set; }

    public Konto(double saldo)
    {
        Saldo = saldo;
    }
}

// klasa KontoOszczednosciowe` }),
        hints: ['Konstruktor: `public KontoOszczednosciowe(double s, double p) : base(s) { procent = p; }`', 'Setter jest protected, więc w klasie pochodnej można napisać `Saldo += Saldo * procent / 100;`'],
        checks: [{ pattern: 'class\\s+KontoOszczednosciowe\\s*:\\s*Konto', message: 'KontoOszczednosciowe powinno dziedziczyć po Konto.' }],
        solution: csProg({ types: `class Konto
{
    public double Saldo { get; protected set; }

    public Konto(double saldo)
    {
        Saldo = saldo;
    }
}

class KontoOszczednosciowe : Konto
{
    private double procent;

    public KontoOszczednosciowe(double saldo, double procent) : base(saldo)
    {
        this.procent = procent;
    }

    public void DodajOdsetki()
    {
        Saldo += Saldo * procent / 100;
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
KontoOszczednosciowe k = new KontoOszczednosciowe(double.Parse(p[0]), double.Parse(p[1]));
int lata = int.Parse(p[2]);
for (int i = 0; i < lata; i++) k.DodajOdsetki();
Console.WriteLine($"Saldo: {k.Saldo:F2}");` }),
        tests: [{ input: '1000 5 2', expected: 'Saldo: 1102.50' }, { input: '500 10 1', expected: 'Saldo: 550.00' }],
      },
    ],
  },

  // ─────────────── Polimorfizm ───────────────
  {
    id: 'cs28', title: 'Polimorfizm', subtitle: 'virtual, override, wiązanie dynamiczne', icon: 'Shuffle', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Polimorfizm** pozwala traktować obiekty różnych klas pochodnych jednakowo – przez typ bazowy – a mimo to każdy zachowuje się „po swojemu”. W C# metoda musi być oznaczona w bazie jako **virtual** (lub abstract), a w klasie pochodnej jako **override**.' },
      { type: 'code', code: `class Zwierze
{
    public virtual string Glos() => "...";
}
class Pies : Zwierze
{
    public override string Glos() => "Hau!";
}

Zwierze z = new Pies();
Console.WriteLine(z.Glos());    // Hau! – decyduje rzeczywisty typ obiektu` },
      { type: 'table', head: ['Zapis w klasie pochodnej', 'Efekt przy wywołaniu przez typ bazowy'], rows: [
        ['override', 'wywoła się wersja z klasy pochodnej (polimorfizm)'],
        ['new (albo brak słowa)', 'metoda tylko „zasłania” bazową – wywoła się wersja bazowa (ostrzeżenie CS0108)'],
      ] },
      { type: 'list', items: [
        'Typowy wzorzec: `List<Figura> figury` i pętla `foreach (Figura f in figury) f.Rysuj();`.',
        'Sprawdzenie typu w czasie działania: `if (z is Pies p) { ... }`.',
        'Przeciążanie metod to polimorfizm **statyczny** (wybór przy kompilacji), override – **dynamiczny** (wybór w trakcie działania).',
      ] },
    ],
    example: {
      title: 'Lista płac',
      description: 'Różni pracownicy w jednej liście; metoda wirtualna liczy pensję, a metoda bez virtual pokazuje różnicę.',
      code: csProg({ usings: ['System.Collections.Generic'], types: `class Pracownik
{
    public string Imie { get; }
    public Pracownik(string imie) { Imie = imie; }
    public virtual double Pensja() => 0;
    public virtual string Stanowisko => "pracownik";
    public string Typ() => "Pracownik";           // NIE wirtualna
}

class Etatowy : Pracownik
{
    private double stala;
    public Etatowy(string imie, double stala) : base(imie) { this.stala = stala; }
    public override double Pensja() => stala;
    public override string Stanowisko => "etat";
    public new string Typ() => "Etatowy";         // tylko zaslania
}

class Godzinowy : Pracownik
{
    private double stawka;
    private int godziny;
    public Godzinowy(string imie, double stawka, int godziny) : base(imie)
    {
        this.stawka = stawka;
        this.godziny = godziny;
    }
    public override double Pensja() => stawka * godziny;
    public override string Stanowisko => "godzinowy";
}`, main: `List<Pracownik> zespol = new List<Pracownik>
{
    new Etatowy("Ola", 5200),
    new Godzinowy("Jan", 35, 120)
};
double suma = 0;
foreach (Pracownik p in zespol)
{
    Console.WriteLine($"{p.Imie} ({p.Stanowisko}): {p.Pensja()} zl");
    suma += p.Pensja();
}
Console.WriteLine($"Razem: {suma} zl");

Pracownik x = zespol[0];
Console.WriteLine($"Typ() przez typ bazowy: {x.Typ()}, przez Etatowy: {((Etatowy)x).Typ()}");
if (x is Etatowy e) Console.WriteLine($"{e.Imie} jest na etacie");` }),
    },
    tasks: [
      {
        id: 'cs28t1', title: 'Pensje pracowników', difficulty: 2,
        description: 'Klasa bazowa `Pracownik` ma właściwość `Imie` i wirtualną metodę `double Pensja()`. Utwórz `Etatowy` (stała pensja) i `Godzinowy` (stawka × godziny). Wczytaj `n` i `n` linii: `E imie kwota` lub `G imie stawka godziny`. Zapisz pracowników w `List<Pracownik>` i wypisz pensję każdego oraz sumę:',
        expectedOutput: 'Ola: 5000\nJan: 4000\nRazem: 9000', exampleInput: '2\nE Ola 5000\nG Jan 40 100',
        starter: csProg({ usings: ['System.Collections.Generic'], types: `class Pracownik
{
    public string Imie { get; }
    public Pracownik(string imie) { Imie = imie; }
    public virtual double Pensja() => 0;
}

// klasy Etatowy i Godzinowy` }),
        hints: ['`class Etatowy : Pracownik { ... public override double Pensja() => kwota; }`', 'Lista: `List<Pracownik> lista = new List<Pracownik>();` i `lista.Add(new Etatowy(...))`.'],
        checks: [{ pattern: 'override\\s+double\\s+Pensja', message: 'Nadpisz metodę Pensja słowem override.' }],
        solution: csProg({ usings: ['System.Collections.Generic'], types: `class Pracownik
{
    public string Imie { get; }
    public Pracownik(string imie) { Imie = imie; }
    public virtual double Pensja() => 0;
}

class Etatowy : Pracownik
{
    private double kwota;
    public Etatowy(string imie, double kwota) : base(imie) { this.kwota = kwota; }
    public override double Pensja() => kwota;
}

class Godzinowy : Pracownik
{
    private double stawka;
    private int godziny;
    public Godzinowy(string imie, double stawka, int godziny) : base(imie)
    {
        this.stawka = stawka;
        this.godziny = godziny;
    }
    public override double Pensja() => stawka * godziny;
}`, main: `int n = int.Parse(Console.ReadLine());
List<Pracownik> lista = new List<Pracownik>();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    if (p[0] == "E") lista.Add(new Etatowy(p[1], double.Parse(p[2])));
    else lista.Add(new Godzinowy(p[1], double.Parse(p[2]), int.Parse(p[3])));
}
double suma = 0;
foreach (Pracownik pr in lista)
{
    Console.WriteLine($"{pr.Imie}: {pr.Pensja()}");
    suma += pr.Pensja();
}
Console.WriteLine($"Razem: {suma}");` }),
        tests: [{ input: '2\nE Ola 5000\nG Jan 40 100', expected: 'Ola: 5000\nJan: 4000\nRazem: 9000' }, { input: '1\nG Ewa 25.5 10', expected: 'Ewa: 255\nRazem: 255' }],
      },
      {
        id: 'cs28t2', title: 'Napraw polimorfizm', difficulty: 1,
        description: 'W kodzie startowym zwierzęta zapisane w tablicy `Zwierze[]` zawsze „mówią” `...`. Popraw klasy (słowa `virtual` i `override`) tak, aby każde zwierzę wydało swój głos. Nie zmieniaj metody `Main`.',
        expectedOutput: 'Hau!\nMiau!\nMuu!', exampleInput: 'pies kot krowa',
        starter: csProg({ types: `class Zwierze
{
    public string Glos() => "...";
}

class Pies : Zwierze
{
    public string Glos() => "Hau!";
}

class Kot : Zwierze
{
    public string Glos() => "Miau!";
}

class Krowa : Zwierze
{
    public string Glos() => "Muu!";
}`, main: `string[] nazwy = Console.ReadLine().Split(' ');
Zwierze[] t = new Zwierze[nazwy.Length];
for (int i = 0; i < nazwy.Length; i++)
{
    if (nazwy[i] == "pies") t[i] = new Pies();
    else if (nazwy[i] == "kot") t[i] = new Kot();
    else t[i] = new Krowa();
}
foreach (Zwierze z in t) Console.WriteLine(z.Glos());` }),
        hints: ['Bez `virtual` wywołanie przez typ `Zwierze` zawsze wybiera wersję bazową (kompilator ostrzega CS0108).', 'W bazie: `public virtual string Glos()`, w pochodnych: `public override string Glos()`.'],
        checks: [{ pattern: 'virtual\\s+string\\s+Glos', message: 'Metoda Glos w klasie bazowej powinna być virtual.' }],
        solution: csProg({ types: `class Zwierze
{
    public virtual string Glos() => "...";
}

class Pies : Zwierze
{
    public override string Glos() => "Hau!";
}

class Kot : Zwierze
{
    public override string Glos() => "Miau!";
}

class Krowa : Zwierze
{
    public override string Glos() => "Muu!";
}`, main: `string[] nazwy = Console.ReadLine().Split(' ');
Zwierze[] t = new Zwierze[nazwy.Length];
for (int i = 0; i < nazwy.Length; i++)
{
    if (nazwy[i] == "pies") t[i] = new Pies();
    else if (nazwy[i] == "kot") t[i] = new Kot();
    else t[i] = new Krowa();
}
foreach (Zwierze z in t) Console.WriteLine(z.Glos());` }),
        tests: [{ input: 'pies kot krowa', expected: 'Hau!\nMiau!\nMuu!' }, { input: 'kot kot', expected: 'Miau!\nMiau!' }],
      },
    ],
  },

  // ─────────────── Klasy abstrakcyjne i interfejsy ───────────────
  {
    id: 'cs29', title: 'Klasy abstrakcyjne i interfejsy', subtitle: 'abstract, interface', icon: 'Shapes', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Klasa abstrakcyjna** (`abstract class`) jest niepełna – nie można tworzyć jej obiektów. Może mieć metody **abstrakcyjne** (bez ciała), które klasy pochodne muszą nadpisać, oraz zwykłe pola i metody z kodem.' },
      { type: 'p', text: '**Interfejs** (`interface`) to czysty kontrakt: lista metod i właściwości, które klasa obiecuje zaimplementować. Klasa może implementować **wiele** interfejsów, ale dziedziczyć tylko po jednej klasie. Nazwy interfejsów zwyczajowo zaczynają się od litery `I`.' },
      { type: 'code', code: `interface IOpisywalny
{
    string Opis();
}

abstract class Figura : IOpisywalny
{
    public abstract double Pole();                     // musi byc nadpisana
    public string Opis() => $"{GetType().Name}: pole {Pole():F2}";
}

class Kolo : Figura
{
    private double r;
    public Kolo(double r) { this.r = r; }
    public override double Pole() => Math.PI * r * r;
}` },
      { type: 'table', head: ['Cecha', 'Klasa abstrakcyjna', 'Interfejs'], rows: [
        ['tworzenie obiektów', 'nie', 'nie'],
        ['pola (dane)', 'tak', 'nie'],
        ['metody z kodem', 'tak', 'zwykle nie'],
        ['konstruktor', 'tak', 'nie'],
        ['ile naraz można „odziedziczyć”', 'jedną', 'wiele'],
        ['relacja', 'Kolo **jest** Figurą', 'Plik **potrafi** być Drukowalny'],
      ] },
      { type: 'tip', text: 'Znane interfejsy .NET: `IComparable<T>` (metoda CompareTo – pozwala sortować obiekty), `IDisposable`, `IEnumerable<T>`.' },
    ],
    example: {
      title: 'Figury i interfejs',
      description: 'Interfejs, klasa abstrakcyjna z metodą abstrakcyjną, polimorficzna lista i sortowanie przez IComparable.',
      code: csProg({ usings: ['System.Collections.Generic'], types: `interface IOpisywalny
{
    string Opis();
}

abstract class Figura : IOpisywalny, IComparable<Figura>
{
    public string Nazwa { get; }
    protected Figura(string nazwa) { Nazwa = nazwa; }

    public abstract double Pole();
    public string Opis() => $"{Nazwa}: pole = {Pole():F2}";
    public int CompareTo(Figura inna) => Pole().CompareTo(inna.Pole());
}

class Kolo : Figura
{
    private double r;
    public Kolo(double r) : base("kolo") { this.r = r; }
    public override double Pole() => Math.PI * r * r;
}

class Prostokat : Figura
{
    private double a, b;
    public Prostokat(double a, double b) : base("prostokat") { this.a = a; this.b = b; }
    public override double Pole() => a * b;
}`, main: `List<Figura> figury = new List<Figura> { new Kolo(1), new Prostokat(2, 3), new Kolo(0.5) };
figury.Sort();
foreach (IOpisywalny f in figury)
{
    Console.WriteLine(f.Opis());
}
// Figura x = new Figura("?");   // BLAD: klasa abstrakcyjna - odkomentuj i sprawdz` }),
    },
    tasks: [
      {
        id: 'cs29t1', title: 'Zwierzęta (klasa abstrakcyjna)', difficulty: 2,
        description: 'Klasa abstrakcyjna `Zwierze` ma właściwość `Imie`, konstruktor oraz metodę abstrakcyjną `string Glos()`. Metoda zwykła `Przedstaw()` zwraca `IMIE mowi: GLOS`. Utwórz klasy `Pies` (`Hau!`) i `Kot` (`Miau!`). Wczytaj `n` i `n` linii `pies Imie` / `kot Imie`, a potem wypisz przedstawienia.',
        expectedOutput: 'Burek mowi: Hau!\nMruczek mowi: Miau!', exampleInput: '2\npies Burek\nkot Mruczek',
        starter: csProg({ usings: ['System.Collections.Generic'], types: `abstract class Zwierze
{
    public string Imie { get; }
    protected Zwierze(string imie) { Imie = imie; }
    public abstract string Glos();
    public string Przedstaw() => $"{Imie} mowi: {Glos()}";
}

// klasy Pies i Kot` }),
        hints: ['`class Pies : Zwierze { public Pies(string imie) : base(imie) { } public override string Glos() => "Hau!"; }`'],
        checks: [{ pattern: 'override\\s+string\\s+Glos', message: 'Zaimplementuj metodę Glos przez override.' }],
        solution: csProg({ usings: ['System.Collections.Generic'], types: `abstract class Zwierze
{
    public string Imie { get; }
    protected Zwierze(string imie) { Imie = imie; }
    public abstract string Glos();
    public string Przedstaw() => $"{Imie} mowi: {Glos()}";
}

class Pies : Zwierze
{
    public Pies(string imie) : base(imie) { }
    public override string Glos() => "Hau!";
}

class Kot : Zwierze
{
    public Kot(string imie) : base(imie) { }
    public override string Glos() => "Miau!";
}`, main: `int n = int.Parse(Console.ReadLine());
List<Zwierze> lista = new List<Zwierze>();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    if (p[0] == "pies") lista.Add(new Pies(p[1]));
    else lista.Add(new Kot(p[1]));
}
foreach (Zwierze z in lista) Console.WriteLine(z.Przedstaw());` }),
        tests: [{ input: '2\npies Burek\nkot Mruczek', expected: 'Burek mowi: Hau!\nMruczek mowi: Miau!' }, { input: '1\nkot Filemon', expected: 'Filemon mowi: Miau!' }],
      },
      {
        id: 'cs29t2', title: 'Interfejs IFigura', difficulty: 2,
        description: 'Zdefiniuj interfejs `IFigura` z metodą `double Pole()`. Zaimplementuj go w klasach `Kwadrat(a)`, `Prostokat(a, b)` i `Kolo(r)` (π = 3.14). Wczytaj `n` i `n` linii `K a`, `P a b` lub `O r`; zapisz figury w `List<IFigura>` i wypisz sumę pól:',
        expectedOutput: 'Suma pol: 10', exampleInput: '2\nK 2\nP 2 3',
        starter: csProg({ usings: ['System.Collections.Generic'], types: `interface IFigura
{
    double Pole();
}

// klasy Kwadrat, Prostokat i Kolo` }),
        hints: ['`class Kwadrat : IFigura { private double a; public Kwadrat(double a) { this.a = a; } public double Pole() => a * a; }`', 'Metody implementujące interfejs muszą być `public`.'],
        checks: [{ pattern: 'interface\\s+IFigura', message: 'Zdefiniuj interfejs IFigura.' }, { pattern: 'List\\s*<\\s*IFigura\\s*>', message: 'Przechowuj figury w List<IFigura>.' }],
        solution: csProg({ usings: ['System.Collections.Generic'], types: `interface IFigura
{
    double Pole();
}

class Kwadrat : IFigura
{
    private double a;
    public Kwadrat(double a) { this.a = a; }
    public double Pole() => a * a;
}

class Prostokat : IFigura
{
    private double a, b;
    public Prostokat(double a, double b) { this.a = a; this.b = b; }
    public double Pole() => a * b;
}

class Kolo : IFigura
{
    private double r;
    public Kolo(double r) { this.r = r; }
    public double Pole() => 3.14 * r * r;
}`, main: `int n = int.Parse(Console.ReadLine());
List<IFigura> figury = new List<IFigura>();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    if (p[0] == "K") figury.Add(new Kwadrat(double.Parse(p[1])));
    else if (p[0] == "P") figury.Add(new Prostokat(double.Parse(p[1]), double.Parse(p[2])));
    else figury.Add(new Kolo(double.Parse(p[1])));
}
double suma = 0;
foreach (IFigura f in figury) suma += f.Pole();
Console.WriteLine($"Suma pol: {suma}");` }),
        tests: [{ input: '2\nK 2\nP 2 3', expected: 'Suma pol: 10' }, { input: '1\nO 1', expected: 'Suma pol: 3.14' }],
      },
    ],
  },

  // ─────────────── Kompozycja ───────────────
  {
    id: 'cs30', title: 'Kompozycja i agregacja', subtitle: 'relacja „ma”', icon: 'Puzzle', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Obiekt może składać się z innych obiektów – to relacja **„ma”**: samochód **ma** silnik, koszyk **ma** produkty. W **kompozycji** część jest tworzona przez całość i do niej należy; w **agregacji** całość korzysta z obiektów, które istnieją niezależnie (np. przekazanych z zewnątrz).' },
      { type: 'code', code: `class Silnik
{
    public int Moc { get; }
    public Silnik(int moc) { Moc = moc; }
}

class Samochod
{
    private readonly Silnik silnik;     // kompozycja – tworzony przez samochod
    public Osoba Kierowca { get; set; }  // agregacja – osoba istnieje niezaleznie

    public Samochod(int moc)
    {
        silnik = new Silnik(moc);
    }
}` },
      { type: 'tip', text: 'Zasada projektowa: „przedkładaj kompozycję nad dziedziczenie”. Dziedzicz tylko wtedy, gdy relacja „jest” naprawdę zachodzi (Kwadrat jest Figurą), a w pozostałych przypadkach składaj obiekty z mniejszych części.' },
    ],
    example: {
      title: 'Klasa szkolna',
      description: 'Klasa szkolna zawiera listę uczniów (agregacja), a każdy uczeń ma swoją listę ocen (kompozycja).',
      code: csProg({ usings: ['System.Collections.Generic', 'System.Linq'], types: `class Uczen
{
    public string Imie { get; }
    private readonly List<int> oceny = new List<int>();

    public Uczen(string imie) { Imie = imie; }
    public void DodajOcene(int o) => oceny.Add(o);
    public double Srednia => oceny.Count == 0 ? 0 : oceny.Average();
}

class KlasaSzkolna
{
    public string Nazwa { get; }
    private readonly List<Uczen> uczniowie = new List<Uczen>();

    public KlasaSzkolna(string nazwa) { Nazwa = nazwa; }
    public void Dodaj(Uczen u) => uczniowie.Add(u);

    public Uczen Najlepszy()
    {
        Uczen naj = uczniowie[0];
        foreach (Uczen u in uczniowie)
        {
            if (u.Srednia > naj.Srednia) naj = u;
        }
        return naj;
    }
}`, main: `Uczen ola = new Uczen("Ola");
ola.DodajOcene(5); ola.DodajOcene(6);
Uczen jan = new Uczen("Jan");
jan.DodajOcene(4); jan.DodajOcene(3);

KlasaSzkolna k = new KlasaSzkolna("2B");
k.Dodaj(ola);
k.Dodaj(jan);
Uczen n = k.Najlepszy();
Console.WriteLine($"Najlepszy w {k.Nazwa}: {n.Imie} ({n.Srednia:F2})");` }),
    },
    tasks: [
      {
        id: 'cs30t1', title: 'Koszyk zakupów', difficulty: 2,
        description: 'Klasa `Produkt` ma właściwości `Nazwa` i `Cena`. Klasa `Koszyk` **zawiera** `List<Produkt>` i ma metody `Dodaj(Produkt p)`, `Suma()`, `Ile` (właściwość) i `Najdrozszy()`. Wczytaj `n` i `n` linii `nazwa cena`; wypisz:',
        expectedOutput: 'Produktow: 3\nSuma: 19.70\nNajdrozszy: ser', exampleInput: '3\nchleb 4.5\nser 12\nmleko 3.2',
        starter: csProg({ usings: ['System.Collections.Generic'], types: `class Produkt
{
    public string Nazwa { get; }
    public double Cena { get; }
    public Produkt(string nazwa, double cena) { Nazwa = nazwa; Cena = cena; }
}

class Koszyk
{
    private readonly List<Produkt> produkty = new List<Produkt>();
    // Dodaj, Suma, Ile, Najdrozszy
}` }),
        hints: ['`public int Ile => produkty.Count;`', 'Najdroższy: przejdź po liście i zapamiętaj produkt z największą ceną.'],
        checks: [{ pattern: 'List\\s*<\\s*Produkt\\s*>', message: 'Koszyk powinien zawierać List<Produkt>.' }],
        solution: csProg({ usings: ['System.Collections.Generic'], types: `class Produkt
{
    public string Nazwa { get; }
    public double Cena { get; }
    public Produkt(string nazwa, double cena) { Nazwa = nazwa; Cena = cena; }
}

class Koszyk
{
    private readonly List<Produkt> produkty = new List<Produkt>();

    public void Dodaj(Produkt p) => produkty.Add(p);
    public int Ile => produkty.Count;

    public double Suma()
    {
        double s = 0;
        foreach (Produkt p in produkty) s += p.Cena;
        return s;
    }

    public Produkt Najdrozszy()
    {
        Produkt naj = produkty[0];
        foreach (Produkt p in produkty)
        {
            if (p.Cena > naj.Cena) naj = p;
        }
        return naj;
    }
}`, main: `int n = int.Parse(Console.ReadLine());
Koszyk k = new Koszyk();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    k.Dodaj(new Produkt(p[0], double.Parse(p[1])));
}
Console.WriteLine($"Produktow: {k.Ile}");
Console.WriteLine($"Suma: {k.Suma():F2}");
Console.WriteLine($"Najdrozszy: {k.Najdrozszy().Nazwa}");` }),
        tests: [{ input: '3\nchleb 4.5\nser 12\nmleko 3.2', expected: 'Produktow: 3\nSuma: 19.70\nNajdrozszy: ser' }, { input: '1\nwoda 2', expected: 'Produktow: 1\nSuma: 2.00\nNajdrozszy: woda' }],
      },
    ],
  },

  // ─────────────── Przeciążanie operatorów ───────────────
  {
    id: 'cs31', title: 'Przeciążanie operatorów', subtitle: 'operator +, ==, ToString', icon: 'Plus', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'W C# operator przeciążamy jako **publiczną metodę statyczną** o nazwie `operator` i symbolu operatora. Dzięki temu obiekty własnych typów można dodawać, porównywać itd. jak liczby.' },
      { type: 'code', code: `class Wektor
{
    public double X { get; }
    public double Y { get; }
    public Wektor(double x, double y) { X = x; Y = y; }

    public static Wektor operator +(Wektor a, Wektor b) => new Wektor(a.X + b.X, a.Y + b.Y);
    public static Wektor operator *(Wektor a, double k) => new Wektor(a.X * k, a.Y * k);
    public static bool operator ==(Wektor a, Wektor b) => a.X == b.X && a.Y == b.Y;
    public static bool operator !=(Wektor a, Wektor b) => !(a == b);

    public override string ToString() => $"[{X}, {Y}]";
}` },
      { type: 'list', items: [
        'Operatory porównania przeciążamy parami: `==` z `!=`, `<` z `>`.',
        'Do wypisywania obiektu nie przeciążamy `<<` (jak w C++) – nadpisujemy metodę `ToString()`.',
        'Nie można tworzyć nowych operatorów ani przeciążać `=`, `&&`, `||`. Operator `+=` działa automatycznie, gdy jest zdefiniowany `+`.',
      ] },
    ],
    example: {
      title: 'Ułamki',
      description: 'Klasa Ulamek skracana w konstruktorze, z operatorami +, *, == i własnym ToString.',
      code: csProg({ types: `class Ulamek
{
    public int L { get; }
    public int M { get; }

    public Ulamek(int l, int m)
    {
        int d = Nwd(Math.Abs(l), Math.Abs(m));
        L = l / d;
        M = m / d;
    }

    private static int Nwd(int a, int b) => b == 0 ? a : Nwd(b, a % b);

    public static Ulamek operator +(Ulamek a, Ulamek b) => new Ulamek(a.L * b.M + b.L * a.M, a.M * b.M);
    public static Ulamek operator *(Ulamek a, Ulamek b) => new Ulamek(a.L * b.L, a.M * b.M);
    public static bool operator ==(Ulamek a, Ulamek b) => a.L == b.L && a.M == b.M;
    public static bool operator !=(Ulamek a, Ulamek b) => !(a == b);

    public override string ToString() => $"{L}/{M}";
}`, main: `Ulamek a = new Ulamek(1, 2), b = new Ulamek(1, 3);
Console.WriteLine($"{a} + {b} = {a + b}");
Console.WriteLine($"{a} * {b} = {a * b}");
Console.WriteLine($"2/4 == 1/2 ? {new Ulamek(2, 4) == a}");
Ulamek s = a;
s += b;
Console.WriteLine($"po += : {s}");` }),
    },
    tasks: [
      {
        id: 'cs31t1', title: 'Działania na wektorach', difficulty: 2,
        description: 'Klasa `Wektor` ma właściwości `X`, `Y`. Przeciąż operatory `+`, `-` (dwa wektory) i `*` (wektor razy liczba) oraz nadpisz `ToString()` (format `[x, y]`). Wczytaj linię `x1 y1 x2 y2 k` i wypisz:',
        expectedOutput: 'a + b = [4, 6]\na - b = [-2, -2]\na * k = [2, 4]', exampleInput: '1 2 3 4 2',
        starter: csProg({ types: `class Wektor
{
    public double X { get; }
    public double Y { get; }
    public Wektor(double x, double y) { X = x; Y = y; }
    // operatory i ToString
}` }),
        hints: ['`public static Wektor operator +(Wektor a, Wektor b) => new Wektor(a.X + b.X, a.Y + b.Y);`', '`public override string ToString() => $"[{X}, {Y}]";`'],
        checks: [{ pattern: 'operator\\s*\\+', message: 'Przeciąż operator +.' }, { pattern: 'override\\s+string\\s+ToString', message: 'Nadpisz ToString().' }],
        solution: csProg({ types: `class Wektor
{
    public double X { get; }
    public double Y { get; }
    public Wektor(double x, double y) { X = x; Y = y; }

    public static Wektor operator +(Wektor a, Wektor b) => new Wektor(a.X + b.X, a.Y + b.Y);
    public static Wektor operator -(Wektor a, Wektor b) => new Wektor(a.X - b.X, a.Y - b.Y);
    public static Wektor operator *(Wektor a, double k) => new Wektor(a.X * k, a.Y * k);

    public override string ToString() => $"[{X}, {Y}]";
}`, main: `string[] p = Console.ReadLine().Split(' ');
Wektor a = new Wektor(double.Parse(p[0]), double.Parse(p[1]));
Wektor b = new Wektor(double.Parse(p[2]), double.Parse(p[3]));
double k = double.Parse(p[4]);
Console.WriteLine($"a + b = {a + b}");
Console.WriteLine($"a - b = {a - b}");
Console.WriteLine($"a * k = {a * k}");` }),
        tests: [{ input: '1 2 3 4 2', expected: 'a + b = [4, 6]\na - b = [-2, -2]\na * k = [2, 4]' }, { input: '2.5 -1 0.5 1 -2', expected: 'a + b = [3, 0]\na - b = [2, -2]\na * k = [-5, 2]' }],
      },
      {
        id: 'cs31t2', title: 'Porównywanie godzin', difficulty: 2,
        description: 'Klasa `Godzina` ma właściwości `H` i `M`. Przeciąż operatory `==`, `!=`, `<` i `>`. Wczytaj linię `h1 m1 h2 m2` i używając tylko tych operatorów wypisz `Rowne`, `Pierwsza wczesniej` albo `Druga wczesniej`.',
        expectedOutput: 'Pierwsza wczesniej', exampleInput: '9 59 10 0',
        starter: csProg({ types: `class Godzina
{
    public int H { get; }
    public int M { get; }
    public Godzina(int h, int m) { H = h; M = m; }
    // operatory ==, !=, <, >
}` }),
        hints: ['Porównuj liczbę minut od północy: `a.H * 60 + a.M`.', 'Operatory definiuj parami: `==` i `!=`, `<` i `>`.'],
        checks: [{ pattern: 'operator\\s*==', message: 'Przeciąż operator ==.' }, { pattern: 'operator\\s*<', message: 'Przeciąż operator <.' }],
        solution: csProg({ types: `class Godzina
{
    public int H { get; }
    public int M { get; }
    public Godzina(int h, int m) { H = h; M = m; }

    private int Minuty => H * 60 + M;

    public static bool operator ==(Godzina a, Godzina b) => a.Minuty == b.Minuty;
    public static bool operator !=(Godzina a, Godzina b) => !(a == b);
    public static bool operator <(Godzina a, Godzina b) => a.Minuty < b.Minuty;
    public static bool operator >(Godzina a, Godzina b) => a.Minuty > b.Minuty;
}`, main: `string[] p = Console.ReadLine().Split(' ');
Godzina a = new Godzina(int.Parse(p[0]), int.Parse(p[1]));
Godzina b = new Godzina(int.Parse(p[2]), int.Parse(p[3]));
if (a == b) Console.WriteLine("Rowne");
else if (a < b) Console.WriteLine("Pierwsza wczesniej");
else Console.WriteLine("Druga wczesniej");` }),
        tests: [{ input: '9 59 10 0', expected: 'Pierwsza wczesniej' }, { input: '10 30 10 30', expected: 'Rowne' }, { input: '12 0 11 59', expected: 'Druga wczesniej' }],
      },
    ],
  },
];
