// Kurs C# – tematy 12–22. Każdy program zaczyna się od `using System;`.
import { csProg, CS_TEMPLATE } from '../lang-templates.js';

export const cs2 = [
  // ─────────────── 12 ───────────────
  {
    id: 'cs12', title: 'Łańcuchy typu string', subtitle: 'Length, Substring, IndexOf, Split', icon: 'Type', practice: false,
    theory: [
      { type: 'p', text: 'Typ **string** przechowuje tekst. Do znaków odwołujemy się przez indeks `s[i]` (tylko odczyt!), a długość podaje właściwość `Length`. Metody napisu zawsze zwracają **nowy** napis – oryginał się nie zmienia.' },
      { type: 'table', head: ['Operacja', 'Przykład', 'Wynik'], rows: [
        ['Length', '"kajak".Length', '5'],
        ['ToUpper() / ToLower()', '"Ala".ToUpper()', '"ALA"'],
        ['Substring(start, ile)', '"kajak".Substring(1, 3)', '"aja"'],
        ['IndexOf(tekst)', '"kajak".IndexOf("ja")', '2 (lub -1)'],
        ['Contains / StartsWith / EndsWith', '"kajak".Contains("aj")', 'True'],
        ['Replace(a, b)', '"ala".Replace("a", "o")', '"olo"'],
        ['Split(\' \')', '"a b c".Split(\' \')', 'tablica 3 napisów'],
        ['Trim()', '"  x ".Trim()', '"x"'],
        ['string.Join(sep, kolekcja)', 'string.Join("-", t)', '"1-2-3"'],
      ] },
      { type: 'code', code: `string s = "Programowanie";
Console.WriteLine(s[0]);                  // P
Console.WriteLine(s[s.Length - 1]);       // e
// s[0] = 'p';  // BLAD: napis jest niezmienny
s = "p" + s.Substring(1);                 // tworzymy nowy napis` },
      { type: 'tip', text: 'Napisy porównujemy operatorem `==` (porównuje treść). Do sprawdzenia kolejności alfabetycznej służy `string.Compare(a, b)` albo `a.CompareTo(b)`.' },
    ],
    example: {
      title: 'Analiza zdania',
      description: 'Długość, wielkie litery, wyszukiwanie, podział na słowa i odwrócenie.',
      code: csProg({ main: `string zdanie = "Ala ma kota";
Console.WriteLine($"Dlugosc: {zdanie.Length}");
Console.WriteLine($"Wielkimi: {zdanie.ToUpper()}");
Console.WriteLine($"Pozycja 'kot': {zdanie.IndexOf("kot")}");

string[] slowa = zdanie.Split(' ');
Console.WriteLine($"Liczba slow: {slowa.Length}, ostatnie: {slowa[slowa.Length - 1]}");

string odwrocony = "";
for (int i = zdanie.Length - 1; i >= 0; i--)
{
    odwrocony += zdanie[i];
}
Console.WriteLine($"Od tylu: {odwrocony}");
Console.WriteLine(string.Join(" | ", slowa));` }),
    },
    tasks: [
      {
        id: 'cs12t1', title: 'Czy to palindrom?', difficulty: 2,
        description: 'Napisz metodę `static bool CzyPalindrom(string s)`. Wczytaj słowo i wypisz `TAK`, jeśli jest palindromem, albo `NIE`. Wielkość liter ma znaczenie.',
        expectedOutput: 'TAK', exampleInput: 'kajak',
        starter: csProg({ methods: `static bool CzyPalindrom(string s)
{
    // uzupelnij
    return false;
}` }),
        hints: ['Porównuj `s[i]` z `s[s.Length - 1 - i]` dla pierwszej połowy napisu.', 'Gdy para się różni – `return false;`.'],
        checks: [{ pattern: 'static\\s+bool\\s+CzyPalindrom', message: 'Zdefiniuj metodę static bool CzyPalindrom(string s).' }],
        solution: csProg({ methods: `static bool CzyPalindrom(string s)
{
    for (int i = 0; i < s.Length / 2; i++)
    {
        if (s[i] != s[s.Length - 1 - i]) return false;
    }
    return true;
}`, main: `string slowo = Console.ReadLine();
Console.WriteLine(CzyPalindrom(slowo) ? "TAK" : "NIE");` }),
        tests: [{ input: 'kajak', expected: 'TAK' }, { input: 'kot', expected: 'NIE' }, { input: 'Kajak', expected: 'NIE' }],
      },
      {
        id: 'cs12t2', title: 'Licznik samogłosek', difficulty: 2,
        description: 'Wczytaj linię tekstu i policz samogłoski `a e i o u y` (małe i wielkie litery):',
        expectedOutput: 'Samogloski: 5', exampleInput: 'Ala ma kota', starter: CS_TEMPLATE,
        hints: ['Zamień tekst na małe litery: `tekst.ToLower()`.', 'Sprawdzenie znaku: `"aeiouy".Contains(c)`.'],
        solution: csProg({ main: `string tekst = Console.ReadLine().ToLower();
int ile = 0;
foreach (char c in tekst)
{
    if ("aeiouy".Contains(c)) ile++;
}
Console.WriteLine($"Samogloski: {ile}");` }),
        tests: [{ input: 'Ala ma kota', expected: 'Samogloski: 5' }, { input: 'C# jest super', expected: 'Samogloski: 3' }],
      },
    ],
  },

  // ─────────────── 13 ───────────────
  {
    id: 'cs13', title: 'Struktury', subtitle: 'struct – typy wartościowe', icon: 'Package', practice: false,
    theory: [
      { type: 'p', text: '**Struktura** (`struct`) grupuje kilka powiązanych danych w jeden typ – podobnie jak klasa, ale jest **typem wartościowym**: przypisanie i przekazanie do metody tworzy **kopię** wszystkich pól.' },
      { type: 'code', code: `struct Punkt
{
    public double X;
    public double Y;

    public Punkt(double x, double y)
    {
        X = x;
        Y = y;
    }

    public double Odleglosc() => Math.Sqrt(X * X + Y * Y);
}

Punkt a = new Punkt(3, 4);
Punkt b = a;        // KOPIA
b.X = 100;          // a.X nadal 3` },
      { type: 'table', head: ['', 'struct', 'class'], rows: [
        ['rodzaj typu', 'wartościowy', 'referencyjny'],
        ['przypisanie b = a', 'kopiuje dane', 'kopiuje odwołanie (ten sam obiekt)'],
        ['dziedziczenie', 'nie', 'tak'],
        ['typowe użycie', 'małe „paczki” danych: punkt, kolor, data', 'większe obiekty z zachowaniem'],
      ] },
      { type: 'tip', text: 'Typy `int`, `double`, `bool`, `char` to w C# właśnie wbudowane struktury.' },
    ],
    example: {
      title: 'Punkty i kopiowanie',
      description: 'Struktura z konstruktorem i metodą; przypisanie tworzy niezależną kopię.',
      code: csProg({ types: `struct Punkt
{
    public double X;
    public double Y;

    public Punkt(double x, double y)
    {
        X = x;
        Y = y;
    }

    public double OdlegloscOd(Punkt p)
    {
        double dx = X - p.X, dy = Y - p.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public override string ToString() => $"({X}, {Y})";
}`, main: `Punkt a = new Punkt(0, 0);
Punkt b = new Punkt(3, 4);
Console.WriteLine($"Odleglosc {a} - {b}: {a.OdlegloscOd(b)}");

Punkt c = b;
c.X = 10;
Console.WriteLine($"b = {b}, c = {c}");

Punkt[] trojkat = { new Punkt(0, 0), new Punkt(4, 0), new Punkt(0, 3) };
double obwod = 0;
for (int i = 0; i < 3; i++)
{
    obwod += trojkat[i].OdlegloscOd(trojkat[(i + 1) % 3]);
}
Console.WriteLine($"Obwod trojkata: {obwod}");` }),
    },
    tasks: [
      {
        id: 'cs13t1', title: 'Odległość punktów', difficulty: 1,
        description: 'Zdefiniuj strukturę `Punkt` z polami `X`, `Y` (double) i konstruktorem. Wczytaj współrzędne dwóch punktów (4 liczby w jednej linii) i wypisz ich odległość z dokładnością do 2 miejsc:',
        expectedOutput: 'Odleglosc: 5.00', exampleInput: '0 0 3 4',
        starter: csProg({ types: `struct Punkt
{
    // pola i konstruktor
}` }),
        hints: ['Wczytanie: `string[] p = Console.ReadLine().Split(\' \');` i `double.Parse(p[0])`.', 'Odległość: `Math.Sqrt(dx * dx + dy * dy)`; format `{d:F2}`.'],
        checks: [{ pattern: 'struct\\s+Punkt', message: 'Zdefiniuj strukturę Punkt.' }],
        solution: csProg({ types: `struct Punkt
{
    public double X;
    public double Y;

    public Punkt(double x, double y)
    {
        X = x;
        Y = y;
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
Punkt a = new Punkt(double.Parse(p[0]), double.Parse(p[1]));
Punkt b = new Punkt(double.Parse(p[2]), double.Parse(p[3]));
double dx = a.X - b.X, dy = a.Y - b.Y;
double d = Math.Sqrt(dx * dx + dy * dy);
Console.WriteLine($"Odleglosc: {d:F2}");` }),
        tests: [{ input: '0 0 3 4', expected: 'Odleglosc: 5.00' }, { input: '0 0 1 1', expected: 'Odleglosc: 1.41' }],
      },
    ],
  },

  // ─────────────── 14 ───────────────
  {
    id: 'cs14', title: 'Krotki (tuple)', subtitle: 'kilka wartości naraz', icon: 'Combine', practice: false,
    theory: [
      { type: 'p', text: '**Krotka** (tuple) łączy kilka wartości w jedną bez definiowania osobnej klasy. Elementy mogą mieć nazwy. Krotki są typem wartościowym.' },
      { type: 'code', code: `(string, int) osoba = ("Ola", 15);
Console.WriteLine(osoba.Item1);          // Ola

(string Imie, int Wiek) uczen = ("Jan", 16);
Console.WriteLine(uczen.Imie + " " + uczen.Wiek);

var (imie, wiek) = uczen;                // dekonstrukcja na zmienne
(a, b) = (b, a);                         // zamiana wartosci w jednej linii!` },
      { type: 'h', text: 'Metoda zwracająca kilka wyników' },
      { type: 'code', code: `static (int min, int max) MinMax(int[] t)
{
    int mn = t[0], mx = t[0];
    foreach (int x in t)
    {
        if (x < mn) mn = x;
        if (x > mx) mx = x;
    }
    return (mn, mx);
}` },
      { type: 'tip', text: 'Krotka to wygodna alternatywa dla parametrów `out`. Jeśli te same dane występują w wielu miejscach programu, lepiej utworzyć dla nich strukturę lub klasę.' },
    ],
    example: {
      title: 'Krotki w praktyce',
      description: 'Metoda zwracająca krotkę, dekonstrukcja i zamiana zmiennych.',
      code: csProg({ methods: `static (int suma, double srednia) Statystyki(int[] t)
{
    int s = 0;
    foreach (int x in t) s += x;
    return (s, (double)s / t.Length);
}`, main: `int[] dane = { 4, 8, 15, 16, 23, 42 };
var wynik = Statystyki(dane);
Console.WriteLine($"Suma: {wynik.suma}, srednia: {wynik.srednia:F2}");

var (s, sr) = Statystyki(new[] { 1, 2, 3 });
Console.WriteLine($"s = {s}, sr = {sr}");

int a = 1, b = 2;
(a, b) = (b, a);
Console.WriteLine($"a = {a}, b = {b}");

(string Nazwa, double Cena) produkt = ("chleb", 4.5);
Console.WriteLine(produkt);` }),
    },
    tasks: [
      {
        id: 'cs14t1', title: 'Min i max jako krotka', difficulty: 2,
        description: 'Napisz metodę `static (int min, int max) MinMax(int[] t)`. Wczytaj linię liczb, wywołaj metodę i wypisz:',
        expectedOutput: 'Min: 1, Max: 9', exampleInput: '4 9 1 6',
        starter: csProg({ methods: `static (int min, int max) MinMax(int[] t)
{
    // uzupelnij
    return (0, 0);
}` }),
        hints: ['Zwrot krotki: `return (mn, mx);`', 'Dekonstrukcja: `var (mn, mx) = MinMax(t);`'],
        checks: [{ pattern: '\\(\\s*int\\s+min\\s*,\\s*int\\s+max\\s*\\)\\s*MinMax', message: 'Metoda powinna zwracać krotkę (int min, int max).' }],
        solution: csProg({ methods: `static (int min, int max) MinMax(int[] t)
{
    int mn = t[0], mx = t[0];
    foreach (int x in t)
    {
        if (x < mn) mn = x;
        if (x > mx) mx = x;
    }
    return (mn, mx);
}`, main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
for (int i = 0; i < p.Length; i++) t[i] = int.Parse(p[i]);
var (mn, mx) = MinMax(t);
Console.WriteLine($"Min: {mn}, Max: {mx}");` }),
        tests: [{ input: '4 9 1 6', expected: 'Min: 1, Max: 9' }, { input: '-3', expected: 'Min: -3, Max: -3' }],
      },
    ],
  },

  // ─────────────── 15 ───────────────
  {
    id: 'cs15', title: 'Metody', subtitle: 'parametry, return, void', icon: 'FunctionSquare', practice: false,
    theory: [
      { type: 'p', text: '**Metoda** to nazwany fragment kodu w klasie. Ma typ zwracany (`int`, `double`, `string`… albo `void`, gdy nic nie zwraca), nazwę i parametry. Metody wywoływane z `Main` w klasie Program oznaczamy słowem **static**.' },
      { type: 'code', code: csProg({ methods: `static int Kwadrat(int x)
{
    return x * x;
}

static void Linia(int n, char znak = '-')      // parametr z wartoscia domyslna
{
    Console.WriteLine(new string(znak, n));
}

static double Pole(double r) => Math.PI * r * r;  // metoda w skroconym zapisie`, main: `Console.WriteLine(Kwadrat(5));
Linia(10);
Linia(5, '*');
Console.WriteLine(Pole(2).ToString("F2"));` }) },
      { type: 'list', items: [
        'Metoda niebędąca `void` musi na każdej ścieżce zakończyć się `return wartosc;`.',
        'Zmienne zadeklarowane w metodzie są **lokalne** – istnieją tylko w niej.',
        'Wywołanie z argumentami nazwanymi: `Linia(znak: \'=\', n: 3);`.',
      ] },
      { type: 'warn', text: 'Wywołanie metody bez `static` z metody statycznej `Main` to błąd CS0120 – częsty błąd początkujących.' },
    ],
    example: {
      title: 'Kalkulator na metodach',
      description: 'Metody zwracające wynik, procedura void i parametr domyślny.',
      code: csProg({ methods: `static bool CzyPierwsza(int n)
{
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++)
    {
        if (n % d == 0) return false;
    }
    return true;
}

static void Ramka(string tekst, char znak = '*')
{
    string linia = new string(znak, tekst.Length + 4);
    Console.WriteLine(linia);
    Console.WriteLine($"{znak} {tekst} {znak}");
    Console.WriteLine(linia);
}`, main: `Ramka("Liczby pierwsze");
for (int i = 1; i <= 20; i++)
{
    if (CzyPierwsza(i)) Console.Write(i + " ");
}
Console.WriteLine();
Ramka("Koniec", '#');` }),
    },
    tasks: [
      {
        id: 'cs15t1', title: 'Własna potęga', difficulty: 1,
        description: 'Napisz metodę `static long Potega(int a, int b)`, która pętlą liczy `a` do potęgi `b` (b ≥ 0). Wczytaj `a` i `b` (każde w osobnej linii) i wypisz:',
        expectedOutput: '2^10 = 1024', exampleInput: '2\n10',
        starter: csProg({ methods: `static long Potega(int a, int b)
{
    // uzupelnij
    return 1;
}`, main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
Console.WriteLine($"{a}^{b} = {Potega(a, b)}");` }),
        hints: ['Zacznij od `long wynik = 1;` i pomnóż przez `a` dokładnie `b` razy.'],
        checks: [{ pattern: 'static\\s+long\\s+Potega', message: 'Zdefiniuj metodę static long Potega(int a, int b).' }],
        solution: csProg({ methods: `static long Potega(int a, int b)
{
    long wynik = 1;
    for (int i = 0; i < b; i++)
    {
        wynik *= a;
    }
    return wynik;
}`, main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
Console.WriteLine($"{a}^{b} = {Potega(a, b)}");` }),
        tests: [{ input: '2\n10', expected: '2^10 = 1024' }, { input: '5\n0', expected: '5^0 = 1' }, { input: '3\n4', expected: '3^4 = 81' }],
      },
      {
        id: 'cs15t2', title: 'Liczby pierwsze', difficulty: 2,
        description: 'Napisz metodę `static bool CzyPierwsza(int n)`. Wczytaj `n` (n ≥ 2) i wypisz w jednej linii wszystkie liczby pierwsze od 2 do `n`.',
        expectedOutput: '2 3 5 7', exampleInput: '10',
        starter: csProg({ methods: `static bool CzyPierwsza(int n)
{
    // uzupelnij
    return false;
}` }),
        hints: ['Sprawdzaj dzielniki od 2, dopóki `d * d <= n`.'],
        checks: [{ pattern: 'static\\s+bool\\s+CzyPierwsza', message: 'Zdefiniuj metodę static bool CzyPierwsza(int n).' }],
        solution: csProg({ methods: `static bool CzyPierwsza(int n)
{
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++)
    {
        if (n % d == 0) return false;
    }
    return true;
}`, main: `int n = int.Parse(Console.ReadLine());
for (int i = 2; i <= n; i++)
{
    if (CzyPierwsza(i)) Console.Write(i + " ");
}
Console.WriteLine();` }),
        tests: [{ input: '10', expected: '2 3 5 7' }, { input: '20', expected: '2 3 5 7 11 13 17 19' }],
      },
    ],
  },

  // ─────────────── 16 ───────────────
  {
    id: 'cs16', title: 'Metody rekurencyjne', subtitle: 'warunek stopu, silnia, Fibonacci', icon: 'Infinity', practice: false,
    theory: [
      { type: 'p', text: 'Metoda **rekurencyjna** wywołuje samą siebie dla mniejszego problemu. Musi mieć **warunek stopu**, inaczej program zakończy się wyjątkiem StackOverflowException.' },
      { type: 'code', code: `static long Silnia(int n)
{
    if (n <= 1) return 1;          // warunek stopu
    return n * Silnia(n - 1);      // krok rekurencyjny
}` },
      { type: 'table', head: ['Problem', 'Zapis rekurencyjny'], rows: [
        ['silnia', 'n! = n · (n−1)!, 0! = 1'], ['Fibonacci', 'F(n) = F(n−1) + F(n−2)'], ['NWD', 'nwd(a, b) = nwd(b, a % b), nwd(a, 0) = a'],
      ] },
      { type: 'tip', text: 'Każdą rekurencję da się zapisać pętlą. Rekurencja bywa krótsza, ale naiwny Fibonacci liczy te same wartości wiele razy i jest bardzo wolny dla dużych n.' },
    ],
    example: {
      title: 'Klasyki rekurencji',
      description: 'Silnia, Fibonacci, NWD i odwracanie napisu rekurencyjnie.',
      code: csProg({ methods: `static long Silnia(int n) => n <= 1 ? 1 : n * Silnia(n - 1);

static int Fib(int n) => n < 2 ? n : Fib(n - 1) + Fib(n - 2);

static int Nwd(int a, int b) => b == 0 ? a : Nwd(b, a % b);

static string Odwroc(string s)
{
    if (s.Length <= 1) return s;
    return Odwroc(s.Substring(1)) + s[0];
}`, main: `Console.WriteLine($"10! = {Silnia(10)}");
for (int i = 0; i <= 10; i++) Console.Write(Fib(i) + " ");
Console.WriteLine();
Console.WriteLine($"NWD(48, 36) = {Nwd(48, 36)}");
Console.WriteLine(Odwroc("rekurencja"));` }),
    },
    tasks: [
      {
        id: 'cs16t1', title: 'Fibonacci rekurencyjnie', difficulty: 1,
        description: 'Napisz **rekurencyjną** metodę `static int Fib(int n)`. Wczytaj `n` (0–25) i wypisz:',
        expectedOutput: 'Fib(10) = 55', exampleInput: '10',
        starter: csProg({ methods: `static int Fib(int n)
{
    // uzupelnij rekurencyjnie
    return 0;
}`, main: `int n = int.Parse(Console.ReadLine());
Console.WriteLine($"Fib({n}) = {Fib(n)}");` }),
        hints: ['Warunek stopu: `if (n < 2) return n;`', 'Krok: `return Fib(n - 1) + Fib(n - 2);`'],
        checks: [{ pattern: 'Fib\\s*\\(\\s*n\\s*-\\s*1\\s*\\)', message: 'Metoda Fib powinna wywoływać samą siebie.' }],
        solution: csProg({ methods: `static int Fib(int n)
{
    if (n < 2) return n;
    return Fib(n - 1) + Fib(n - 2);
}`, main: `int n = int.Parse(Console.ReadLine());
Console.WriteLine($"Fib({n}) = {Fib(n)}");` }),
        tests: [{ input: '10', expected: 'Fib(10) = 55' }, { input: '0', expected: 'Fib(0) = 0' }, { input: '20', expected: 'Fib(20) = 6765' }],
      },
      {
        id: 'cs16t2', title: 'NWD rekurencyjnie', difficulty: 2,
        description: 'Napisz **rekurencyjną** metodę `static int Nwd(int a, int b)` (algorytm Euklidesa). Wczytaj dwie liczby i wypisz:',
        expectedOutput: 'NWD: 6', exampleInput: '12\n18',
        starter: csProg({ methods: `static int Nwd(int a, int b)
{
    // uzupelnij rekurencyjnie
    return 0;
}` }),
        hints: ['Warunek stopu: `if (b == 0) return a;`', 'Krok: `return Nwd(b, a % b);`'],
        checks: [{ pattern: 'return\\s+Nwd\\s*\\(', message: 'Metoda Nwd powinna wywoływać samą siebie.' }],
        solution: csProg({ methods: `static int Nwd(int a, int b)
{
    if (b == 0) return a;
    return Nwd(b, a % b);
}`, main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
Console.WriteLine($"NWD: {Nwd(a, b)}");` }),
        tests: [{ input: '12\n18', expected: 'NWD: 6' }, { input: '17\n5', expected: 'NWD: 1' }],
      },
    ],
  },

  // ─────────────── 17 ───────────────
  {
    id: 'cs17', title: 'Przeciążanie metod', subtitle: 'ta sama nazwa, różne parametry', icon: 'Copy', practice: false,
    theory: [
      { type: 'p', text: '**Przeciążanie** to tworzenie kilku metod o tej samej nazwie, różniących się **liczbą lub typami parametrów**. Kompilator wybiera wersję pasującą do argumentów.' },
      { type: 'code', code: `static int Pole(int a) => a * a;                    // kwadrat
static double Pole(double a, double b) => a * b;    // prostokat
static double Pole(double r) => Math.PI * r * r;    // kolo

Pole(3);        // int -> 9
Pole(2.0, 5.0); // 10
Pole(1.0);      // 3.14...` },
      { type: 'list', items: [
        'Same typy zwracane nie wystarczą – metody muszą różnić się parametrami.',
        'Biblioteka .NET stale korzysta z przeciążania: `Console.WriteLine` ma kilkanaście wersji (dla int, double, string…).',
        'Alternatywą bywa parametr domyślny: `static void Linia(int n = 10)`.',
      ] },
    ],
    example: {
      title: 'Jedna nazwa – wiele wersji',
      description: 'Kompilator dobiera metodę na podstawie typów i liczby argumentów.',
      code: csProg({ methods: `static void Opisz(int x) => Console.WriteLine($"int: {x}");
static void Opisz(double x) => Console.WriteLine($"double: {x}");
static void Opisz(string x) => Console.WriteLine($"string: {x}");
static void Opisz(char x) => Console.WriteLine($"char: {x}");

static int Max(int a, int b) => a > b ? a : b;
static int Max(int a, int b, int c) => Max(Max(a, b), c);`, main: `Opisz(42);
Opisz(3.14);
Opisz("tekst");
Opisz('Z');
Console.WriteLine($"{Max(3, 8)} {Max(4, 9, 2)}");` }),
    },
    tasks: [
      {
        id: 'cs17t1', title: 'Pole figur', difficulty: 2,
        description: 'Napisz trzy przeciążone metody `Pole`: `Pole(double r)` – koło (użyj `Math.PI`), `Pole(double a, double b)` – prostokąt, `Pole(double a, double b, double h)` – trapez. Wczytaj linię: pierwsza liczba `k` (1–3) to liczba parametrów, a dalej `k` liczb. Wypisz wynik z dokładnością do 2 miejsc:',
        expectedOutput: 'Pole: 12.00', exampleInput: '2 3 4', starter: CS_TEMPLATE,
        hints: ['Trapez: `(a + b) * h / 2`.', 'Wybierz wersję metody w zależności od `k`.'],
        checks: [{ pattern: '(static\\s+double\\s+Pole\\s*\\([\\s\\S]*){3}', message: 'Zdefiniuj trzy przeciążone metody static double Pole(...).' }],
        solution: csProg({ methods: `static double Pole(double r) => Math.PI * r * r;
static double Pole(double a, double b) => a * b;
static double Pole(double a, double b, double h) => (a + b) * h / 2;`, main: `string[] p = Console.ReadLine().Split(' ');
int k = int.Parse(p[0]);
double wynik;
if (k == 1) wynik = Pole(double.Parse(p[1]));
else if (k == 2) wynik = Pole(double.Parse(p[1]), double.Parse(p[2]));
else wynik = Pole(double.Parse(p[1]), double.Parse(p[2]), double.Parse(p[3]));
Console.WriteLine($"Pole: {wynik:F2}");` }),
        tests: [{ input: '2 3 4', expected: 'Pole: 12.00' }, { input: '1 2', expected: 'Pole: 12.57' }, { input: '3 2 4 3', expected: 'Pole: 9.00' }],
      },
    ],
  },

  // ─────────────── 18 ───────────────
  {
    id: 'cs18', title: 'Wyrażenia lambda i delegaty', subtitle: '=>, Func, Action, metody w skrócie', icon: 'Zap', practice: false,
    theory: [
      { type: 'p', text: 'Odpowiednikiem krótkich funkcji „inline” z C++ są w C# **metody wyrażeniowe** (`static int Kwadrat(int x) => x * x;`) oraz **wyrażenia lambda** – anonimowe funkcje zapisywane w miejscu użycia.' },
      { type: 'code', code: `Func<int, int> kwadrat = x => x * x;            // przyjmuje int, zwraca int
Func<int, int, int> suma = (a, b) => a + b;
Action<string> powitaj = imie => Console.WriteLine("Czesc, " + imie);
Predicate<int> parzysta = n => n % 2 == 0;

Console.WriteLine(kwadrat(5));    // 25
powitaj("Ola");` },
      { type: 'table', head: ['Typ delegata', 'Znaczenie'], rows: [
        ['Func<T, TWynik>', 'funkcja przyjmująca T i zwracająca TWynik (ostatni typ to wynik)'],
        ['Action<T>', 'procedura przyjmująca T, bez wyniku'],
        ['Predicate<T>', 'funkcja zwracająca bool (warunek)'],
      ] },
      { type: 'h', text: 'Lambdy z kolekcjami (LINQ)' },
      { type: 'code', code: `List<int> liczby = new List<int> { 5, 2, 8, 1 };
var parzyste = liczby.Where(x => x % 2 == 0).ToList();  // 2, 8
var kwadraty = liczby.Select(x => x * x).ToList();      // 25, 4, 64, 1
liczby.Sort((a, b) => b.CompareTo(a));                  // malejaco` },
    ],
    example: {
      title: 'Funkcje jako wartości',
      description: 'Delegaty przechowywane w zmiennych, przekazywane do metod i używane z LINQ.',
      code: csProg({ usings: ['System.Collections.Generic', 'System.Linq'], methods: `static void Zastosuj(int[] t, Func<int, int> f)
{
    for (int i = 0; i < t.Length; i++) t[i] = f(t[i]);
}`, main: `int[] t = { 1, 2, 3, 4 };
Zastosuj(t, x => x * 10);
Console.WriteLine(string.Join(", ", t));

Func<double, double> polowa = x => x / 2;
Console.WriteLine(polowa(7));

List<string> imiona = new List<string> { "Ola", "Bartek", "Ewa", "Kamila" };
var dlugie = imiona.Where(s => s.Length > 3).OrderBy(s => s).ToList();
Console.WriteLine(string.Join(" ", dlugie));
imiona.ForEach(s => Console.Write(s[0]));
Console.WriteLine();` }),
    },
    tasks: [
      {
        id: 'cs18t1', title: 'Filtr z lambdą', difficulty: 2,
        description: 'Wczytaj linię liczb do `List<int>` oraz liczbę `k` w drugiej linii. Używając lambdy (np. `FindAll` lub `Where`), wybierz liczby większe od `k` i wypisz je (oddzielone spacją), a w kolejnej linii ich liczbę:',
        expectedOutput: '7 9 12\nIle: 3', exampleInput: '3 7 1 9 12\n5',
        starter: csProg({ usings: ['System.Collections.Generic', 'System.Linq'] }),
        hints: ['`List<int> wynik = lista.FindAll(x => x > k);`', 'Albo: `lista.Where(x => x > k).ToList()`.'],
        checks: [{ pattern: '=>', message: 'Użyj wyrażenia lambda (=>).' }],
        solution: csProg({ usings: ['System.Collections.Generic', 'System.Linq'], main: `List<int> lista = new List<int>();
foreach (string s in Console.ReadLine().Split(' ')) lista.Add(int.Parse(s));
int k = int.Parse(Console.ReadLine());
List<int> wynik = lista.FindAll(x => x > k);
Console.WriteLine(string.Join(" ", wynik));
Console.WriteLine($"Ile: {wynik.Count}");` }),
        tests: [{ input: '3 7 1 9 12\n5', expected: '7 9 12\nIle: 3' }, { input: '1 2 3\n0', expected: '1 2 3\nIle: 3' }],
      },
    ],
  },

  // ─────────────── 19 ───────────────
  {
    id: 'cs19', title: 'Klasa Math', subtitle: 'funkcje matematyczne', icon: 'Sigma', practice: false,
    theory: [
      { type: 'p', text: 'Klasa **Math** zawiera statyczne metody matematyczne. Większość z nich przyjmuje i zwraca `double`.' },
      { type: 'table', head: ['Metoda', 'Działanie', 'Przykład'], rows: [
        ['Math.Sqrt(x)', 'pierwiastek', 'Math.Sqrt(16) → 4'],
        ['Math.Pow(a, b)', 'potęga', 'Math.Pow(2, 10) → 1024'],
        ['Math.Abs(x)', 'wartość bezwzględna', 'Math.Abs(-5) → 5'],
        ['Math.Round(x, n)', 'zaokrąglenie do n miejsc (połówki do parzystej!)', 'Math.Round(2.5) → 2'],
        ['Math.Floor / Math.Ceiling', 'w dół / w górę', 'Math.Floor(2.7) → 2'],
        ['Math.Max / Math.Min', 'większa / mniejsza', 'Math.Max(3, 7) → 7'],
        ['Math.Sin, Cos, Tan', 'trygonometria (radiany!)', 'Math.Sin(Math.PI / 2) → 1'],
        ['Math.PI, Math.E', 'stałe', '3.14159…, 2.71828…'],
      ] },
      { type: 'warn', text: '`Math.Round(2.5)` daje **2**, a `Math.Round(3.5)` daje **4** – C# domyślnie zaokrągla połówki do najbliższej liczby parzystej („zaokrąglanie bankierskie”). Aby zaokrąglać połówki w górę, użyj `Math.Round(x, MidpointRounding.AwayFromZero)`.' },
    ],
    example: {
      title: 'Kalkulator naukowy',
      description: 'Równanie kwadratowe, trygonometria i dwa rodzaje zaokrąglania.',
      code: csProg({ main: `double a = 1, b = -3, c = 2;
double delta = b * b - 4 * a * c;
double x1 = (-b - Math.Sqrt(delta)) / (2 * a);
double x2 = (-b + Math.Sqrt(delta)) / (2 * a);
Console.WriteLine($"x1 = {x1}, x2 = {x2}");

Console.WriteLine($"2^10 = {Math.Pow(2, 10)}");
Console.WriteLine($"sin(30 st.) = {Math.Sin(30 * Math.PI / 180):F4}");
Console.WriteLine($"Round(2.5) = {Math.Round(2.5)}, AwayFromZero: {Math.Round(2.5, MidpointRounding.AwayFromZero)}");
Console.WriteLine($"Floor(-2.7) = {Math.Floor(-2.7)}, Ceiling(-2.7) = {Math.Ceiling(-2.7)}");` }),
    },
    tasks: [
      {
        id: 'cs19t1', title: 'Przeciwprostokątna', difficulty: 1,
        description: 'Wczytaj przyprostokątne `a` i `b` (każdą w osobnej linii) i wypisz przeciwprostokątną z dokładnością do 2 miejsc:',
        expectedOutput: 'c = 5.00', exampleInput: '3\n4', starter: CS_TEMPLATE,
        hints: ['`Math.Sqrt(a * a + b * b)`', 'Format: `{c:F2}`.'],
        checks: [{ pattern: 'Math\\.Sqrt', message: 'Użyj Math.Sqrt.' }],
        solution: csProg({ main: `double a = double.Parse(Console.ReadLine());
double b = double.Parse(Console.ReadLine());
double c = Math.Sqrt(a * a + b * b);
Console.WriteLine($"c = {c:F2}");` }),
        tests: [{ input: '3\n4', expected: 'c = 5.00' }, { input: '1\n1', expected: 'c = 1.41' }],
      },
      {
        id: 'cs19t2', title: 'Równanie kwadratowe', difficulty: 3,
        description: 'Wczytaj `a b c` (w jednej linii, a > 0). Wypisz z dokładnością do 2 miejsc: dla Δ > 0 `x1 = ...` i `x2 = ...` (x1 mniejszy), dla Δ = 0 `x = ...`, dla Δ < 0 `Brak rozwiazan`.',
        expectedOutput: 'x1 = 1.00\nx2 = 2.00', exampleInput: '1 -3 2', starter: CS_TEMPLATE,
        hints: ['`double delta = b * b - 4 * a * c;`', 'Pierwiastki: `(-b - Math.Sqrt(delta)) / (2 * a)` i z plusem.'],
        solution: csProg({ main: `string[] p = Console.ReadLine().Split(' ');
double a = double.Parse(p[0]), b = double.Parse(p[1]), c = double.Parse(p[2]);
double delta = b * b - 4 * a * c;
if (delta > 0)
{
    Console.WriteLine($"x1 = {(-b - Math.Sqrt(delta)) / (2 * a):F2}");
    Console.WriteLine($"x2 = {(-b + Math.Sqrt(delta)) / (2 * a):F2}");
}
else if (delta == 0)
{
    Console.WriteLine($"x = {-b / (2 * a):F2}");
}
else
{
    Console.WriteLine("Brak rozwiazan");
}` }),
        tests: [{ input: '1 -3 2', expected: 'x1 = 1.00\nx2 = 2.00' }, { input: '1 2 1', expected: 'x = -1.00' }, { input: '1 0 1', expected: 'Brak rozwiazan' }],
      },
    ],
  },

  // ─────────────── 20 ───────────────
  {
    id: 'cs20', title: 'Metody typu char', subtitle: 'char.IsDigit, char.ToUpper, kody znaków', icon: 'CaseSensitive', practice: false,
    theory: [
      { type: 'p', text: 'Typ `char` przechowuje jeden znak Unicode. Każdy znak ma kod liczbowy: `(int)\'A\'` to 65. Klasa `char` udostępnia metody statyczne do badania i zmiany znaków.' },
      { type: 'table', head: ['Metoda', 'Zwraca true, gdy znak to…'], rows: [
        ['char.IsDigit(c)', 'cyfra'], ['char.IsLetter(c)', 'litera'], ['char.IsLetterOrDigit(c)', 'litera lub cyfra'],
        ['char.IsUpper(c) / IsLower(c)', 'wielka / mała litera'], ['char.IsWhiteSpace(c)', 'biały znak'], ['char.IsPunctuation(c)', 'znak interpunkcyjny'],
      ] },
      { type: 'code', code: `char c = 'a';
char duza = char.ToUpper(c);           // 'A' – w C# wynik jest typu char
int kod = c;                           // 97 – char -> int niejawnie
char nastepny = (char)(c + 1);         // 'b' – int -> char wymaga rzutowania
int cyfra = '7' - '0';                 // 7` },
      { type: 'tip', text: 'W przeciwieństwie do C++ `char.ToUpper` zwraca od razu `char`, więc `Console.WriteLine(char.ToUpper(\'q\'))` wypisze literę Q.' },
    ],
    example: {
      title: 'Analiza tekstu i szyfr Cezara',
      description: 'Klasyfikacja znaków i przesuwanie liter w alfabecie.',
      code: csProg({ main: `string s = "Haslo123 ma 2 spacje!";
int litery = 0, cyfry = 0, spacje = 0, inne = 0;
foreach (char c in s)
{
    if (char.IsLetter(c)) litery++;
    else if (char.IsDigit(c)) cyfry++;
    else if (char.IsWhiteSpace(c)) spacje++;
    else inne++;
}
Console.WriteLine($"Litery: {litery}, cyfry: {cyfry}, spacje: {spacje}, inne: {inne}");

string szyfr = "";
foreach (char c in "Ala ma kota")
{
    if (char.IsLower(c)) szyfr += (char)('a' + (c - 'a' + 3) % 26);
    else if (char.IsUpper(c)) szyfr += (char)('A' + (c - 'A' + 3) % 26);
    else szyfr += c;
}
Console.WriteLine($"Szyfr Cezara: {szyfr}");` }),
    },
    tasks: [
      {
        id: 'cs20t1', title: 'Statystyka znaków', difficulty: 1,
        description: 'Wczytaj linię tekstu i policz litery, cyfry i spacje:',
        expectedOutput: 'Litery: 9\nCyfry: 1\nSpacje: 3', exampleInput: 'Ala ma 2 koty', starter: CS_TEMPLATE,
        hints: ['`char.IsLetter(c)`, `char.IsDigit(c)`, `char.IsWhiteSpace(c)`'],
        checks: [{ pattern: 'char\\.IsLetter', message: 'Użyj char.IsLetter.' }],
        solution: csProg({ main: `string tekst = Console.ReadLine();
int litery = 0, cyfry = 0, spacje = 0;
foreach (char c in tekst)
{
    if (char.IsLetter(c)) litery++;
    else if (char.IsDigit(c)) cyfry++;
    else if (char.IsWhiteSpace(c)) spacje++;
}
Console.WriteLine($"Litery: {litery}");
Console.WriteLine($"Cyfry: {cyfry}");
Console.WriteLine($"Spacje: {spacje}");` }),
        tests: [{ input: 'Ala ma 2 koty', expected: 'Litery: 9\nCyfry: 1\nSpacje: 3' }, { input: 'C# 2024!', expected: 'Litery: 1\nCyfry: 4\nSpacje: 1' }],
      },
      {
        id: 'cs20t2', title: 'Szyfr Cezara', difficulty: 3,
        description: 'Wczytaj przesunięcie `k` (0–25), a w drugiej linii tekst. Przesuń każdą literę o `k` miejsc w alfabecie (z zawijaniem, z zachowaniem wielkości liter); inne znaki zostaw.',
        expectedOutput: 'Dod pd nrwd', exampleInput: '3\nAla ma kota', starter: CS_TEMPLATE,
        hints: ["Mała litera: `(char)('a' + (c - 'a' + k) % 26)`.", 'Wynik buduj w StringBuilder lub przez `+=`.'],
        checks: [{ pattern: '%\\s*26', message: 'Zawijanie alfabetu zrób przez % 26.' }],
        solution: csProg({ main: `int k = int.Parse(Console.ReadLine());
string tekst = Console.ReadLine();
string wynik = "";
foreach (char c in tekst)
{
    if (char.IsLower(c)) wynik += (char)('a' + (c - 'a' + k) % 26);
    else if (char.IsUpper(c)) wynik += (char)('A' + (c - 'A' + k) % 26);
    else wynik += c;
}
Console.WriteLine(wynik);` }),
        tests: [{ input: '3\nAla ma kota', expected: 'Dod pd nrwd' }, { input: '1\nxyz XYZ!', expected: 'yza YZA!' }],
      },
    ],
  },

  // ─────────────── 21 ───────────────
  {
    id: 'cs21', title: 'Konwersja typów', subtitle: 'rzutowanie, Parse, TryParse, Convert, wyjątki', icon: 'ArrowLeftRight', practice: false,
    theory: [
      { type: 'p', text: 'C# jest **ściśle typowany**: konwersje „bezpieczne” (np. `int` → `double`) odbywają się niejawnie, a te, które mogą stracić dane (np. `double` → `int`), wymagają **jawnego rzutowania**.' },
      { type: 'code', code: `int a = 7;
double d = a;               // niejawnie: int -> double
int b = (int)3.99;          // jawnie: obcina do 3
// int c = 3.99;            // BLAD kompilacji CS0266` },
      { type: 'table', head: ['Sposób', 'Przykład', 'Uwagi'], rows: [
        ['rzutowanie', '(int)x', 'obcina część ułamkową'],
        ['int.Parse(s)', 'int.Parse("42")', 'błędny tekst → wyjątek FormatException'],
        ['int.TryParse(s, out n)', 'if (int.TryParse(s, out int n))', 'zwraca false zamiast wyjątku'],
        ['Convert.ToInt32(x)', 'Convert.ToInt32(2.5)', 'zaokrągla (połówki do parzystej → 2)'],
        ['x.ToString()', '42.ToString()', 'liczba → tekst'],
      ] },
      { type: 'h', text: 'Obsługa wyjątków' },
      { type: 'code', code: `try
{
    int n = int.Parse(Console.ReadLine());
    Console.WriteLine(100 / n);
}
catch (FormatException)
{
    Console.WriteLine("To nie jest liczba!");
}
catch (DivideByZeroException)
{
    Console.WriteLine("Nie dziel przez zero!");
}` },
      { type: 'tip', text: 'Na polskim Windowsie `double.Parse("2.5")` może rzucić wyjątek, bo kultura oczekuje przecinka („2,5”). W tym środowisku (jak w kompilatorach online) obowiązuje kropka.' },
    ],
    example: {
      title: 'Konwersje w praktyce', input: 'abc\n12',
      description: 'Rzutowanie, Parse, TryParse z pętlą ponawiania i łapanie wyjątków.',
      code: csProg({ main: `double cena = 19.99;
int zl = (int)cena;
int gr = (int)Math.Round((cena - zl) * 100);
Console.WriteLine($"{cena} = {zl} zl {gr} gr");

char c = 'A';
int kod = c;
Console.WriteLine($"Kod {c}: {kod}, nastepny: {(char)(kod + 1)}");

int liczba;
Console.Write("Podaj liczbe: ");
while (!int.TryParse(Console.ReadLine(), out liczba))
{
    Console.Write("To nie liczba, sprobuj jeszcze raz: ");
}
Console.WriteLine($"Wczytano {liczba}, razy 2 = {liczba * 2}");

try
{
    int zle = int.Parse("12x");
}
catch (FormatException e)
{
    Console.WriteLine("Wyjatek: " + e.Message);
}` }),
    },
    tasks: [
      {
        id: 'cs21t1', title: 'Bezpieczne wczytywanie', difficulty: 2,
        description: 'Wczytuj kolejne linie, dopóki użytkownik nie poda poprawnej liczby całkowitej. Dla każdej błędnej linii wypisz `Bledne dane: TEKST`, a dla poprawnej `OK: LICZBA`. Użyj `int.TryParse`.',
        expectedOutput: 'Bledne dane: abc\nBledne dane: 1.5\nOK: 7', exampleInput: 'abc\n1.5\n7', starter: CS_TEMPLATE,
        hints: ['`while (true) { string s = Console.ReadLine(); if (int.TryParse(s, out int n)) { ...; break; } ... }`'],
        checks: [{ pattern: 'int\\.TryParse', message: 'Użyj int.TryParse.' }],
        solution: csProg({ main: `while (true)
{
    string s = Console.ReadLine();
    if (int.TryParse(s, out int n))
    {
        Console.WriteLine($"OK: {n}");
        break;
    }
    Console.WriteLine($"Bledne dane: {s}");
}` }),
        tests: [{ input: 'abc\n1.5\n7', expected: 'Bledne dane: abc\nBledne dane: 1.5\nOK: 7' }, { input: '-3', expected: 'OK: -3' }],
      },
      {
        id: 'cs21t2', title: 'Dzielenie z wyjątkami', difficulty: 2,
        description: 'Wczytaj dwie linie i spróbuj obliczyć iloraz całkowity pierwszej liczby przez drugą. Obsłuż wyjątki: dla niepoprawnej liczby wypisz `Niepoprawna liczba`, dla dzielenia przez zero – `Dzielenie przez zero`. W przeciwnym razie wypisz `Wynik: X`.',
        expectedOutput: 'Wynik: 3', exampleInput: '10\n3', starter: CS_TEMPLATE,
        hints: ['Obejmij obliczenia blokiem `try`.', 'Dwa bloki: `catch (FormatException)` i `catch (DivideByZeroException)`.'],
        checks: [{ pattern: 'catch\\s*\\(\\s*FormatException', message: 'Obsłuż wyjątek FormatException.' }, { pattern: 'catch\\s*\\(\\s*DivideByZeroException', message: 'Obsłuż wyjątek DivideByZeroException.' }],
        solution: csProg({ main: `try
{
    int a = int.Parse(Console.ReadLine());
    int b = int.Parse(Console.ReadLine());
    Console.WriteLine($"Wynik: {a / b}");
}
catch (FormatException)
{
    Console.WriteLine("Niepoprawna liczba");
}
catch (DivideByZeroException)
{
    Console.WriteLine("Dzielenie przez zero");
}` }),
        tests: [{ input: '10\n3', expected: 'Wynik: 3' }, { input: '5\n0', expected: 'Dzielenie przez zero' }, { input: 'x\n2', expected: 'Niepoprawna liczba' }],
      },
    ],
  },

  // ─────────────── 22 ───────────────
  {
    id: 'cs22', title: 'Wejście i wyjście konsoli', subtitle: 'ReadLine, Split, formatowanie', icon: 'Keyboard', practice: false,
    theory: [
      { type: 'p', text: '`Console.ReadLine()` wczytuje całą linię tekstu (albo `null`, gdy danych już nie ma). Kilka wartości w jednej linii rozdzielamy metodą `Split`. Do wypisywania służą `Console.Write` i `Console.WriteLine`.' },
      { type: 'h', text: 'Formatowanie' },
      { type: 'table', head: ['Zapis', 'Wynik dla x = 3.14159 / n = 42'], rows: [
        ['$"{x:F2}"', '3.14'], ['$"{n,5}"', '   42 (wyrównanie do prawej na 5 znakach)'], ['$"{n,-5}|"', '42   | (do lewej)'],
        ['$"{n:D4}"', '0042'], ['$"{n:X}"', '2A (szesnastkowo)'], ['$"{0.25:P0}"', '25 %'],
        ['Console.WriteLine("{0} + {1}", a, b)', 'formatowanie złożone z numerami argumentów'],
        ['Convert.ToString(n, 2)', '101010 (system dwójkowy)'],
      ] },
      { type: 'code', code: `Console.Write("Podaj dwie liczby: ");
string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]), b = int.Parse(p[1]);
Console.WriteLine("{0} / {1} = {2:F3}", a, b, (double)a / b);` },
    ],
    example: {
      title: 'Paragon w tabeli',
      description: 'Wyrównanie kolumn, liczby z dwoma miejscami po przecinku i systemy liczbowe.',
      code: csProg({ main: `string[] produkty = { "Chleb", "Maslo", "Ser zolty" };
double[] ceny = { 4.5, 7.99, 12.3 };
Console.WriteLine($"{"Produkt",-12}{"Cena",8}");
double suma = 0;
for (int i = 0; i < produkty.Length; i++)
{
    Console.WriteLine($"{produkty[i],-12}{ceny[i],8:F2}");
    suma += ceny[i];
}
Console.WriteLine($"{"RAZEM",-12}{suma,8:F2}");

int n = 255;
Console.WriteLine($"{n} = {Convert.ToString(n, 2)} (bin) = {n:X} (hex)");
Console.WriteLine("Format zlozony: {0} i {1:F1}", "tekst", 2.75);` }),
    },
    tasks: [
      {
        id: 'cs22t1', title: 'Paragon', difficulty: 1,
        description: 'Wczytaj cenę produktu (liczba rzeczywista) i liczbę sztuk (każde w osobnej linii). Wypisz kwotę z dwoma miejscami po przecinku:',
        expectedOutput: 'Do zaplaty: 12.50 zl', exampleInput: '2.5\n5', starter: CS_TEMPLATE,
        hints: ['`double cena = double.Parse(Console.ReadLine());`', 'Format: `{kwota:F2}`.'],
        solution: csProg({ main: `double cena = double.Parse(Console.ReadLine());
int ilosc = int.Parse(Console.ReadLine());
Console.WriteLine($"Do zaplaty: {cena * ilosc:F2} zl");` }),
        tests: [{ input: '2.5\n5', expected: 'Do zaplaty: 12.50 zl' }, { input: '0.99\n3', expected: 'Do zaplaty: 2.97 zl' }],
      },
      {
        id: 'cs22t2', title: 'Systemy liczbowe', difficulty: 1,
        description: 'Wczytaj nieujemną liczbę całkowitą i wypisz ją dwójkowo (`Convert.ToString(n, 2)`) oraz szesnastkowo (`{n:X}`):',
        expectedOutput: 'bin: 1010\nhex: A', exampleInput: '10', starter: CS_TEMPLATE,
        hints: ['`Convert.ToString(n, 2)` zamienia na system dwójkowy.', 'Format `X` daje zapis szesnastkowy wielkimi literami.'],
        solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
Console.WriteLine($"bin: {Convert.ToString(n, 2)}");
Console.WriteLine($"hex: {n:X}");` }),
        tests: [{ input: '10', expected: 'bin: 1010\nhex: A' }, { input: '255', expected: 'bin: 11111111\nhex: FF' }],
      },
    ],
  },
];
