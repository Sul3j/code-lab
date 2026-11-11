// Dodatkowe zadania C# – tematy 17–31 (w tym programowanie obiektowe).
import { csProg } from '../lang-templates.js';
import { mk } from './exercises-cs-1.js';

const L = ['System.Collections.Generic'];
const LQ = ['System.Collections.Generic', 'System.Linq'];

export const EX_CS_2 = {
  cs17: [
    mk({
      id: 'cs17t2', title: 'Największa – trzy wersje', difficulty: 2,
      description: 'Napisz trzy przeciążone metody `Najwieksza`: dla dwóch liczb `int`, dla trzech liczb `int` oraz dla dwóch liczb `double`. Pierwsza linia: trzy liczby całkowite `a b c`, druga: dwie liczby rzeczywiste `x y`. Wypisz:',
      hints: ['Przeciążone metody mają tę samą nazwę, ale różne parametry.', 'Wersja trzyargumentowa może wywołać dwuargumentową: `Najwieksza(Najwieksza(a, b), c)`.'],
      checks: [
        { pattern: 'Najwieksza\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*,\\s*int', message: 'Dodaj wersję Najwieksza(int, int, int).' },
        { pattern: 'Najwieksza\\s*\\(\\s*double', message: 'Dodaj wersję Najwieksza(double, double).' },
      ],
      solution: csProg({ methods: `static int Najwieksza(int a, int b)
{
    return a > b ? a : b;
}

static int Najwieksza(int a, int b, int c)
{
    return Najwieksza(Najwieksza(a, b), c);
}

static double Najwieksza(double a, double b)
{
    return a > b ? a : b;
}`, main: `string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]), b = int.Parse(p[1]), c = int.Parse(p[2]);
string[] q = Console.ReadLine().Split(' ');
double x = double.Parse(q[0]), y = double.Parse(q[1]);
Console.WriteLine($"Najwieksza({a}, {b}) = {Najwieksza(a, b)}");
Console.WriteLine($"Najwieksza({a}, {b}, {c}) = {Najwieksza(a, b, c)}");
Console.WriteLine($"Najwieksza({x}, {y}) = {Najwieksza(x, y)}");` }),
      tests: [
        { input: '3 9 4\n2.5 1.75', expected: 'Najwieksza(3, 9) = 9\nNajwieksza(3, 9, 4) = 9\nNajwieksza(2.5, 1.75) = 2.5' },
        { input: '7 2 11\n-1.5 -0.5', expected: 'Najwieksza(7, 2) = 7\nNajwieksza(7, 2, 11) = 11\nNajwieksza(-1.5, -0.5) = -0.5' },
      ],
    }),
    mk({
      id: 'cs17t3', title: 'Powitanie z parametrem opcjonalnym', difficulty: 1,
      description: 'Napisz metodę `static string Powitaj(string imie, string powitanie = "Czesc")`. Wczytaj imię i w drugiej linii powitanie – jeśli to `-`, wywołaj metodę **bez** drugiego argumentu.',
      hints: ['Parametr z wartością domyślną musi być na końcu listy parametrów.'],
      checks: [{ pattern: 'string\\s+powitanie\\s*=\\s*"Czesc"', message: 'Parametr powitanie powinien mieć wartość domyślną "Czesc".' }],
      solution: csProg({ methods: `static string Powitaj(string imie, string powitanie = "Czesc")
{
    return $"{powitanie}, {imie}!";
}`, main: `string imie = Console.ReadLine();
string pow = Console.ReadLine();
if (pow == "-") Console.WriteLine(Powitaj(imie));
else Console.WriteLine(Powitaj(imie, pow));` }),
      tests: [
        { input: 'Ola\n-', expected: 'Czesc, Ola!' },
        { input: 'Jan\nDzien dobry', expected: 'Dzien dobry, Jan!' },
      ],
    }),
    mk({
      id: 'cs17t4', title: 'Suma z params', difficulty: 2,
      description: 'Napisz **jedną** metodę `static int Suma(params int[] liczby)`, którą można wywołać z dowolną liczbą argumentów. Wczytaj `a b c` i wypisz:',
      hints: ['Słowo `params` pozwala pisać `Suma(a, b)` zamiast `Suma(new int[] { a, b })`.', 'Bez argumentów tablica jest pusta, więc suma to 0.'],
      checks: [{ pattern: 'params\\s+int\\s*\\[\\s*\\]', message: 'Użyj parametru params int[].' }],
      solution: csProg({ methods: `static int Suma(params int[] liczby)
{
    int s = 0;
    foreach (int x in liczby) s += x;
    return s;
}`, main: `string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]), b = int.Parse(p[1]), c = int.Parse(p[2]);
Console.WriteLine($"Suma() = {Suma()}");
Console.WriteLine($"Suma({a}) = {Suma(a)}");
Console.WriteLine($"Suma({a}, {b}) = {Suma(a, b)}");
Console.WriteLine($"Suma({a}, {b}, {c}) = {Suma(a, b, c)}");` }),
      tests: [
        { input: '2 3 4', expected: 'Suma() = 0\nSuma(2) = 2\nSuma(2, 3) = 5\nSuma(2, 3, 4) = 9' },
        { input: '10 -5 1', expected: 'Suma() = 0\nSuma(10) = 10\nSuma(10, -5) = 5\nSuma(10, -5, 1) = 6' },
      ],
    }),
  ],

  cs18: [
    mk({
      id: 'cs18t2', title: 'Sortowanie po długości', difficulty: 1,
      description: 'Wczytaj linię słów i wypisz je posortowane od najkrótszego do najdłuższego (słowa równej długości – w pierwotnej kolejności). Użyj `OrderBy` z wyrażeniem lambda.',
      starter: csProg({ usings: LQ }),
      hints: ['`slowa.OrderBy(s => s.Length)`'],
      checks: [{ pattern: 'OrderBy\\s*\\(\\s*\\w+\\s*=>', message: 'Użyj OrderBy z wyrażeniem lambda.' }],
      solution: csProg({ usings: LQ, main: `string[] slowa = Console.ReadLine().Split(' ');
var wynik = slowa.OrderBy(s => s.Length);
Console.WriteLine(string.Join(" ", wynik));` }),
      tests: [
        { input: 'programowanie to fajna sprawa', expected: 'to fajna sprawa programowanie' },
        { input: 'kot ala dom', expected: 'kot ala dom' },
      ],
    }),
    mk({
      id: 'cs18t3', title: 'Ile większych od k', difficulty: 1,
      description: 'Wczytaj linię liczb, a w drugiej linii liczbę `k`. Policz liczby większe od `k` metodą `Count` z wyrażeniem lambda.',
      starter: csProg({ usings: LQ }),
      hints: ['Zamiana na liczby: `.Select(int.Parse)` albo `.Select(s => int.Parse(s))`.', '`liczby.Count(x => x > k)`'],
      checks: [{ pattern: 'Count\\s*\\(\\s*\\w+\\s*=>', message: 'Użyj Count z wyrażeniem lambda.' }],
      solution: csProg({ usings: LQ, main: `var liczby = Console.ReadLine().Split(' ').Select(s => int.Parse(s)).ToList();
int k = int.Parse(Console.ReadLine());
Console.WriteLine($"Wiekszych od {k}: {liczby.Count(x => x > k)}");` }),
      tests: [
        { input: '3 8 1 9 6\n5', expected: 'Wiekszych od 5: 3' },
        { input: '1 2 3\n10', expected: 'Wiekszych od 10: 0' },
      ],
    }),
    mk({
      id: 'cs18t4', title: 'Funkcja jako parametr', difficulty: 2,
      description: 'Napisz metodę `static int Zastosuj(Func<int, int> f, int x)`, która zwraca `f(x)`. Wczytaj `x` i wywołaj ją z trzema różnymi wyrażeniami lambda:',
      hints: ['Wywołanie: `Zastosuj(v => v + 1, x)`.'],
      checks: [{ pattern: 'Func\\s*<\\s*int\\s*,\\s*int\\s*>', message: 'Parametr metody powinien mieć typ Func<int, int>.' }],
      solution: csProg({ methods: `static int Zastosuj(Func<int, int> f, int x)
{
    return f(x);
}`, main: `int x = int.Parse(Console.ReadLine());
Console.WriteLine($"x + 1 = {Zastosuj(v => v + 1, x)}");
Console.WriteLine($"x * x = {Zastosuj(v => v * v, x)}");
Console.WriteLine($"-x = {Zastosuj(v => -v, x)}");` }),
      tests: [
        { input: '5', expected: 'x + 1 = 6\nx * x = 25\n-x = -5' },
        { input: '-3', expected: 'x + 1 = -2\nx * x = 9\n-x = 3' },
      ],
    }),
  ],

  cs19: [
    mk({
      id: 'cs19t3', title: 'Pole i obwód koła', difficulty: 1,
      description: 'Wczytaj promień koła (liczba rzeczywista) i wypisz jego pole i obwód z dwoma miejscami po przecinku. Użyj `Math.PI` i `Math.Pow`.',
      hints: ['Pole: `Math.PI * Math.Pow(r, 2)`, obwód: `2 * Math.PI * r`.'],
      checks: [{ pattern: 'Math\\.PI', message: 'Użyj stałej Math.PI.' }],
      solution: csProg({ main: `double r = double.Parse(Console.ReadLine());
Console.WriteLine($"Pole: {Math.PI * Math.Pow(r, 2):F2}");
Console.WriteLine($"Obwod: {2 * Math.PI * r:F2}");` }),
      tests: [
        { input: '5', expected: 'Pole: 78.54\nObwod: 31.42' },
        { input: '1', expected: 'Pole: 3.14\nObwod: 6.28' },
        { input: '2.5', expected: 'Pole: 19.63\nObwod: 15.71' },
      ],
    }),
    mk({
      id: 'cs19t4', title: 'Zaokrąglenia', difficulty: 1,
      description: 'Wczytaj liczbę rzeczywistą i wypisz wynik `Math.Floor` (w dół), `Math.Ceiling` (w górę) i `Math.Round` do 2 miejsc po przecinku.',
      hints: ['`Math.Round(x, 2)` – drugi argument to liczba miejsc po przecinku.'],
      checks: [{ pattern: 'Math\\.Floor', message: 'Użyj Math.Floor.' }, { pattern: 'Math\\.Ceiling', message: 'Użyj Math.Ceiling.' }],
      solution: csProg({ main: `double x = double.Parse(Console.ReadLine());
Console.WriteLine($"Floor: {Math.Floor(x)}");
Console.WriteLine($"Ceiling: {Math.Ceiling(x)}");
Console.WriteLine($"Round: {Math.Round(x, 2)}");` }),
      tests: [
        { input: '3.14159', expected: 'Floor: 3\nCeiling: 4\nRound: 3.14' },
        { input: '-2.71828', expected: 'Floor: -3\nCeiling: -2\nRound: -2.72' },
        { input: '7', expected: 'Floor: 7\nCeiling: 7\nRound: 7' },
      ],
    }),
  ],

  cs20: [
    mk({
      id: 'cs20t3', title: 'Tylko cyfry', difficulty: 1,
      description: 'Wczytaj linię tekstu. Wypisz wszystkie cyfry w kolejności występowania oraz ich sumę. Użyj `char.IsDigit`.',
      hints: ['Wartość cyfry jako liczba: `c - \'0\'`.'],
      checks: [{ pattern: 'char\\.IsDigit', message: 'Użyj char.IsDigit.' }],
      solution: csProg({ main: `string s = Console.ReadLine();
string cyfry = "";
int suma = 0;
foreach (char c in s)
{
    if (char.IsDigit(c))
    {
        cyfry += c;
        suma += c - '0';
    }
}
Console.WriteLine($"Cyfry: {cyfry}");
Console.WriteLine($"Suma: {suma}");` }),
      tests: [
        { input: 'Rok 2024, klasa 3b', expected: 'Cyfry: 20243\nSuma: 11' },
        { input: 'abc9', expected: 'Cyfry: 9\nSuma: 9' },
      ],
    }),
    mk({
      id: 'cs20t4', title: 'Odwrócona wielkość liter', difficulty: 2,
      description: 'Wczytaj linię tekstu i zamień wielkie litery na małe, a małe na wielkie (pozostałe znaki bez zmian). Użyj `char.IsUpper`, `char.ToLower` i `char.ToUpper`.',
      hints: ['Zbuduj wynik w pętli `foreach (char c in s)`.'],
      checks: [{ pattern: 'char\\.IsUpper|char\\.IsLower', message: 'Sprawdzaj wielkość liter metodą char.IsUpper lub char.IsLower.' }],
      solution: csProg({ main: `string s = Console.ReadLine();
string wynik = "";
foreach (char c in s)
{
    if (char.IsUpper(c)) wynik += char.ToLower(c);
    else if (char.IsLower(c)) wynik += char.ToUpper(c);
    else wynik += c;
}
Console.WriteLine(wynik);` }),
      tests: [
        { input: 'Ala Ma KOTA', expected: 'aLA mA kota' },
        { input: 'C# 2024', expected: 'c# 2024' },
      ],
    }),
  ],

  cs21: [
    mk({
      id: 'cs21t3', title: 'Suma poprawnych liczb', difficulty: 2,
      description: 'Wczytaj linię „słów”. Zsumuj te, które są poprawnymi liczbami całkowitymi (`int.TryParse`), i policz błędne.',
      hints: ['`if (int.TryParse(s, out int x)) suma += x; else bledne++;`'],
      checks: [{ pattern: 'int\\.TryParse', message: 'Użyj int.TryParse.' }],
      solution: csProg({ main: `int suma = 0, bledne = 0;
foreach (string s in Console.ReadLine().Split(' '))
{
    if (int.TryParse(s, out int x)) suma += x;
    else bledne++;
}
Console.WriteLine($"Suma: {suma}");
Console.WriteLine($"Bledne: {bledne}");` }),
      tests: [
        { input: '5 abc 3 x2 2', expected: 'Suma: 10\nBledne: 2' },
        { input: '-4 4', expected: 'Suma: 0\nBledne: 0' },
      ],
    }),
    mk({
      id: 'cs21t4', title: 'Stopnie Celsjusza na Fahrenheita', difficulty: 1,
      description: 'Wczytaj temperaturę w stopniach Celsjusza. Jeśli to nie jest liczba, wypisz `To nie liczba`; w przeciwnym razie przelicz ją: F = C · 9 / 5 + 32 i wypisz z dwoma miejscami.',
      hints: ['`if (double.TryParse(s, out double c))`'],
      checks: [{ pattern: 'double\\.TryParse', message: 'Użyj double.TryParse.' }],
      solution: csProg({ main: `string s = Console.ReadLine();
if (double.TryParse(s, out double c))
{
    Console.WriteLine($"Fahrenheit: {c * 9 / 5 + 32:F2}");
}
else
{
    Console.WriteLine("To nie liczba");
}` }),
      tests: [
        { input: '36.6', expected: 'Fahrenheit: 97.88' },
        { input: 'abc', expected: 'To nie liczba' },
        { input: '-40', expected: 'Fahrenheit: -40.00' },
      ],
    }),
  ],

  cs22: [
    mk({
      id: 'cs22t3', title: 'Tabela kwadratów i sześcianów', difficulty: 1,
      description: 'Wczytaj `n` i wypisz tabelę dla liczb od 1 do `n`: liczba, kwadrat i sześcian wyrównane do prawej w kolumnach o szerokości 4, 6 i 8 znaków.',
      hints: ['Wyrównanie w napisie interpolowanym: `{i,4}{i * i,6}`.'],
      checks: [{ pattern: '\\{[^}]*,\\s*\\d+\\s*\\}', message: 'Użyj wyrównania kolumn, np. {x,6}.' }],
      solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
for (int i = 1; i <= n; i++)
{
    Console.WriteLine($"{i,4}{i * i,6}{i * i * i,8}");
}` }),
      tests: [
        { input: '3', expected: '   1     1       1\n   2     4       8\n   3     9      27' },
        { input: '5', expected: '   1     1       1\n   2     4       8\n   3     9      27\n   4    16      64\n   5    25     125' },
      ],
    }),
    mk({
      id: 'cs22t4', title: 'Średnia z zadaną dokładnością', difficulty: 2,
      description: 'Wczytaj linię liczb, a w drugiej linii liczbę miejsc po przecinku `p`. Wypisz średnią sformatowaną do `p` miejsc.',
      hints: ['Format można zbudować w czasie działania: `srednia.ToString("F" + p)`.'],
      solution: csProg({ main: `string[] t = Console.ReadLine().Split(' ');
int p = int.Parse(Console.ReadLine());
double suma = 0;
foreach (string s in t) suma += double.Parse(s);
double srednia = suma / t.Length;
Console.WriteLine("Srednia: " + srednia.ToString("F" + p));` }),
      tests: [
        { input: '2 3 4 6\n3', expected: 'Srednia: 3.750' },
        { input: '1 2 4\n2', expected: 'Srednia: 2.33' },
        { input: '10\n0', expected: 'Srednia: 10' },
      ],
    }),
  ],

  cs23: [
    mk({
      id: 'cs23t3', title: 'Klasa Punkt', difficulty: 1,
      description: 'Utwórz klasę `Punkt` z polami `X`, `Y`, konstruktorem i metodą `double Odleglosc(Punkt inny)`. Wczytaj dwa punkty (każdy w osobnej linii) i wypisz odległość między nimi z dwoma miejscami po przecinku.',
      hints: ['Odległość: `Math.Sqrt(dx * dx + dy * dy)`.'],
      checks: [{ pattern: 'class\\s+Punkt', message: 'Utwórz klasę Punkt.' }, { pattern: 'double\\s+Odleglosc\\s*\\(\\s*Punkt', message: 'Dodaj metodę double Odleglosc(Punkt inny).' }],
      solution: csProg({ types: `class Punkt
{
    public double X;
    public double Y;

    public Punkt(double x, double y)
    {
        X = x;
        Y = y;
    }

    public double Odleglosc(Punkt inny)
    {
        double dx = X - inny.X;
        double dy = Y - inny.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }
}`, main: `string[] a = Console.ReadLine().Split(' ');
string[] b = Console.ReadLine().Split(' ');
Punkt p = new Punkt(double.Parse(a[0]), double.Parse(a[1]));
Punkt q = new Punkt(double.Parse(b[0]), double.Parse(b[1]));
Console.WriteLine($"Odleglosc: {p.Odleglosc(q):F2}");` }),
      tests: [
        { input: '0 0\n3 4', expected: 'Odleglosc: 5.00' },
        { input: '1 1\n2 2', expected: 'Odleglosc: 1.41' },
      ],
    }),
    mk({
      id: 'cs23t4', title: 'Uczeń i jego oceny', difficulty: 2,
      description: 'Klasa `Uczen` ma pole `Imie`, prywatną listę ocen oraz metody `DodajOcene(int o)` i `double Srednia()`. Wczytaj imię i linię ocen, a potem wypisz średnią z dwoma miejscami.',
      starter: csProg({ usings: L, types: `class Uczen
{
    public string Imie;
    private List<int> oceny = new List<int>();

    // konstruktor, DodajOcene, Srednia
}` }),
      hints: ['`public void DodajOcene(int o) { oceny.Add(o); }`'],
      checks: [{ pattern: 'void\\s+DodajOcene', message: 'Dodaj metodę DodajOcene.' }, { pattern: 'double\\s+Srednia\\s*\\(', message: 'Dodaj metodę double Srednia().' }],
      solution: csProg({ usings: L, types: `class Uczen
{
    public string Imie;
    private List<int> oceny = new List<int>();

    public Uczen(string imie)
    {
        Imie = imie;
    }

    public void DodajOcene(int o)
    {
        oceny.Add(o);
    }

    public double Srednia()
    {
        if (oceny.Count == 0) return 0;
        int suma = 0;
        foreach (int o in oceny) suma += o;
        return (double)suma / oceny.Count;
    }
}`, main: `Uczen u = new Uczen(Console.ReadLine());
foreach (string s in Console.ReadLine().Split(' '))
{
    u.DodajOcene(int.Parse(s));
}
Console.WriteLine($"{u.Imie}: srednia {u.Srednia():F2}");` }),
      tests: [
        { input: 'Ola\n5 4 5', expected: 'Ola: srednia 4.67' },
        { input: 'Jan\n3', expected: 'Jan: srednia 3.00' },
      ],
    }),
  ],

  cs24: [
    mk({
      id: 'cs24t3', title: 'Kolor RGB', difficulty: 2,
      description: 'Klasa `Kolor` ma właściwości `R`, `G`, `B` i dwa konstruktory: `Kolor(int r, int g, int b)` oraz `Kolor(int szary)` (wszystkie składowe równe), który wywołuje pierwszy przez `: this(...)`. Metoda `ToString()` zwraca zapis szesnastkowy `#RRGGBB`. Wczytaj linię z 3 liczbami albo z jedną i wypisz kolor.',
      hints: ['Zapis szesnastkowy dwucyfrowy: `R.ToString("X2")` lub `{R:X2}`.', 'Konstruktor delegujący: `public Kolor(int szary) : this(szary, szary, szary) { }`'],
      checks: [{ pattern: ':\\s*this\\s*\\(', message: 'Drugi konstruktor powinien wywoływać pierwszy przez : this(...).' }],
      solution: csProg({ types: `class Kolor
{
    public int R { get; }
    public int G { get; }
    public int B { get; }

    public Kolor(int r, int g, int b)
    {
        R = r;
        G = g;
        B = b;
    }

    public Kolor(int szary) : this(szary, szary, szary)
    {
    }

    public override string ToString()
    {
        return $"#{R:X2}{G:X2}{B:X2}";
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
Kolor k;
if (p.Length == 3) k = new Kolor(int.Parse(p[0]), int.Parse(p[1]), int.Parse(p[2]));
else k = new Kolor(int.Parse(p[0]));
Console.WriteLine(k);` }),
      tests: [
        { input: '255 128 0', expected: '#FF8000' },
        { input: '128', expected: '#808080' },
        { input: '0 10 255', expected: '#000AFF' },
      ],
    }),
    mk({
      id: 'cs24t4', title: 'Książka – łańcuch konstruktorów', difficulty: 2,
      description: 'Klasa `Ksiazka` ma pola `Tytul`, `Autor`, `Strony` i trzy konstruktory: z samym tytułem (autor `nieznany`, 100 stron), z tytułem i autorem (100 stron) oraz pełny. Krótsze konstruktory wywołują dłuższe przez `: this(...)`. Wczytaj linię z polami oddzielonymi `;` (1, 2 lub 3 pola) i wypisz opis książki.',
      hints: ['`public Ksiazka(string tytul) : this(tytul, "nieznany") { }`'],
      checks: [{ pattern: ':\\s*this\\s*\\(', message: 'Użyj łańcucha konstruktorów : this(...).' }],
      solution: csProg({ types: `class Ksiazka
{
    public string Tytul;
    public string Autor;
    public int Strony;

    public Ksiazka(string tytul, string autor, int strony)
    {
        Tytul = tytul;
        Autor = autor;
        Strony = strony;
    }

    public Ksiazka(string tytul, string autor) : this(tytul, autor, 100)
    {
    }

    public Ksiazka(string tytul) : this(tytul, "nieznany")
    {
    }

    public string Opis()
    {
        return $"{Tytul}, autor: {Autor}, stron: {Strony}";
    }
}`, main: `string[] p = Console.ReadLine().Split(';');
Ksiazka k;
if (p.Length == 3) k = new Ksiazka(p[0], p[1], int.Parse(p[2]));
else if (p.Length == 2) k = new Ksiazka(p[0], p[1]);
else k = new Ksiazka(p[0]);
Console.WriteLine(k.Opis());` }),
      tests: [
        { input: 'Pan Tadeusz;Mickiewicz;340', expected: 'Pan Tadeusz, autor: Mickiewicz, stron: 340' },
        { input: 'Lalka;Prus', expected: 'Lalka, autor: Prus, stron: 100' },
        { input: 'Notatnik', expected: 'Notatnik, autor: nieznany, stron: 100' },
      ],
    }),
  ],

  cs25: [
    mk({
      id: 'cs25t3', title: 'Prostokąt z walidacją', difficulty: 2,
      description: 'Klasa `Prostokat` ma właściwości `Szerokosc` i `Wysokosc` (początkowo 1), których setter **ignoruje** wartości niedodatnie, oraz właściwość tylko do odczytu `Pole`. Wczytaj `n` i `n` poleceń `S x` (ustaw szerokość) lub `W x` (ustaw wysokość). Wypisz pole.',
      hints: ['Właściwość z polem: `private int szer = 1; public int Szerokosc { get { return szer; } set { if (value > 0) szer = value; } }`', 'Tylko do odczytu: `public int Pole => Szerokosc * Wysokosc;`'],
      checks: [{ pattern: 'set\\s*\\{', message: 'Dodaj setter z walidacją (set { ... }).' }],
      solution: csProg({ types: `class Prostokat
{
    private int szer = 1;
    private int wys = 1;

    public int Szerokosc
    {
        get { return szer; }
        set { if (value > 0) szer = value; }
    }

    public int Wysokosc
    {
        get { return wys; }
        set { if (value > 0) wys = value; }
    }

    public int Pole => Szerokosc * Wysokosc;
}`, main: `Prostokat p = new Prostokat();
int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] c = Console.ReadLine().Split(' ');
    int x = int.Parse(c[1]);
    if (c[0] == "S") p.Szerokosc = x;
    else p.Wysokosc = x;
}
Console.WriteLine($"Pole: {p.Pole}");` }),
      tests: [
        { input: '3\nS 5\nW 3\nW -2', expected: 'Pole: 15' },
        { input: '2\nS 0\nW 4', expected: 'Pole: 4' },
      ],
    }),
    mk({
      id: 'cs25t4', title: 'Zmiana hasła', difficulty: 2,
      description: 'Klasa `Uzytkownik` przechowuje hasło w **prywatnym** polu. Metoda `bool ZmienHaslo(string stare, string nowe)` zmienia hasło tylko wtedy, gdy stare jest poprawne, a nowe ma co najmniej 8 znaków. Wczytaj hasło początkowe, `n` i `n` linii `stare nowe`. Dla każdej wypisz `Zmieniono` lub `Odrzucono`.',
      hints: ['Hasła nie da się odczytać z zewnątrz – klasa sama sprawdza poprawność.'],
      checks: [{ pattern: 'private\\s+string', message: 'Hasło powinno być prywatnym polem.' }, { pattern: 'bool\\s+ZmienHaslo', message: 'Dodaj metodę bool ZmienHaslo(string stare, string nowe).' }],
      solution: csProg({ types: `class Uzytkownik
{
    private string haslo;

    public Uzytkownik(string haslo)
    {
        this.haslo = haslo;
    }

    public bool ZmienHaslo(string stare, string nowe)
    {
        if (stare != haslo || nowe.Length < 8) return false;
        haslo = nowe;
        return true;
    }
}`, main: `Uzytkownik u = new Uzytkownik(Console.ReadLine());
int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    Console.WriteLine(u.ZmienHaslo(p[0], p[1]) ? "Zmieniono" : "Odrzucono");
}` }),
      tests: [
        { input: 'tajne123\n3\nzle nowehaslo1\ntajne123 krotkie\ntajne123 superhaslo', expected: 'Odrzucono\nOdrzucono\nZmieniono' },
        { input: 'abc\n2\nabc 12345678\nabc 87654321', expected: 'Zmieniono\nOdrzucono' },
      ],
    }),
  ],

  cs26: [
    mk({
      id: 'cs26t3', title: 'Przelicznik walut', difficulty: 1,
      description: 'Utwórz **statyczną** klasę `Waluty` ze stałą `KursEur = 4.30` i statycznymi metodami `PlnNaEur(double kwota)` oraz `EurNaPln(double kwota)`. Wczytaj kwotę i wypisz oba przeliczenia (2 miejsca po przecinku).',
      hints: ['`static class Waluty { public const double KursEur = 4.30; ... }`', 'Wywołanie bez tworzenia obiektu: `Waluty.PlnNaEur(k)`.'],
      checks: [{ pattern: 'static\\s+class\\s+Waluty', message: 'Klasa Waluty powinna być statyczna.' }],
      solution: csProg({ types: `static class Waluty
{
    public const double KursEur = 4.30;

    public static double PlnNaEur(double kwota)
    {
        return kwota / KursEur;
    }

    public static double EurNaPln(double kwota)
    {
        return kwota * KursEur;
    }
}`, main: `double k = double.Parse(Console.ReadLine());
Console.WriteLine($"{k:F2} PLN = {Waluty.PlnNaEur(k):F2} EUR");
Console.WriteLine($"{k:F2} EUR = {Waluty.EurNaPln(k):F2} PLN");` }),
      tests: [
        { input: '100', expected: '100.00 PLN = 23.26 EUR\n100.00 EUR = 430.00 PLN' },
        { input: '43', expected: '43.00 PLN = 10.00 EUR\n43.00 EUR = 184.90 PLN' },
      ],
    }),
    mk({
      id: 'cs26t4', title: 'Rekord gry', difficulty: 2,
      description: 'Klasa `Gracz` ma pola `Imie` i `Punkty` oraz **statyczne** pola `Rekord` i `Mistrz`, aktualizowane w konstruktorze, gdy nowy gracz pobije rekord. Wczytaj `n` i `n` linii `imie punkty`, a potem wypisz rekord.',
      hints: ['Pole statyczne jest wspólne dla wszystkich obiektów: `public static int Rekord = 0;`'],
      checks: [{ pattern: 'static\\s+int\\s+Rekord', message: 'Rekord powinien być polem statycznym.' }],
      solution: csProg({ types: `class Gracz
{
    public static int Rekord = 0;
    public static string Mistrz = "brak";

    public string Imie;
    public int Punkty;

    public Gracz(string imie, int punkty)
    {
        Imie = imie;
        Punkty = punkty;
        if (punkty > Rekord)
        {
            Rekord = punkty;
            Mistrz = imie;
        }
    }
}`, main: `int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    new Gracz(p[0], int.Parse(p[1]));
}
Console.WriteLine($"Rekord: {Gracz.Rekord} ({Gracz.Mistrz})");` }),
      tests: [
        { input: '3\nOla 120\nJan 90\nEwa 150', expected: 'Rekord: 150 (Ewa)' },
        { input: '2\nAdam 50\nZosia 50', expected: 'Rekord: 50 (Adam)' },
      ],
    }),
  ],

  cs27: [
    mk({
      id: 'cs27t3', title: 'Pojazdy i koła', difficulty: 1,
      description: 'Klasa bazowa `Pojazd` ma pola `Nazwa` i `Kola` ustawiane w konstruktorze. Klasy `Rower` (2 koła), `Samochod` (4 koła) i `Trojkolowiec` (3 koła) dziedziczą po niej i wywołują konstruktor bazowy przez `: base(...)`. Wczytaj linię nazw pojazdów, utwórz obiekty i wypisz łączną liczbę kół.',
      hints: ['`class Rower : Pojazd { public Rower() : base("rower", 2) { } }`'],
      checks: [{ pattern: ':\\s*base\\s*\\(', message: 'Wywołaj konstruktor bazowy przez : base(...).' }],
      solution: csProg({ usings: L, types: `class Pojazd
{
    public string Nazwa;
    public int Kola;

    public Pojazd(string nazwa, int kola)
    {
        Nazwa = nazwa;
        Kola = kola;
    }
}

class Rower : Pojazd
{
    public Rower() : base("rower", 2) { }
}

class Samochod : Pojazd
{
    public Samochod() : base("samochod", 4) { }
}

class Trojkolowiec : Pojazd
{
    public Trojkolowiec() : base("trojkolowiec", 3) { }
}`, main: `List<Pojazd> lista = new List<Pojazd>();
foreach (string s in Console.ReadLine().Split(' '))
{
    if (s == "rower") lista.Add(new Rower());
    else if (s == "samochod") lista.Add(new Samochod());
    else lista.Add(new Trojkolowiec());
}
int kola = 0;
foreach (Pojazd p in lista) kola += p.Kola;
Console.WriteLine($"Lacznie kol: {kola}");` }),
      tests: [
        { input: 'rower samochod rower', expected: 'Lacznie kol: 8' },
        { input: 'trojkolowiec samochod', expected: 'Lacznie kol: 7' },
      ],
    }),
    mk({
      id: 'cs27t4', title: 'Pracownik i kierownik', difficulty: 2,
      description: 'Klasa `Pracownik` ma pensję i wirtualną metodę `Wyplata()`. Klasa `Kierownik : Pracownik` dodaje premię i nadpisuje `Wyplata()`, korzystając z `base.Wyplata()`. Wczytaj `pensja premia` i wypisz wypłatę pracownika i kierownika z tą samą pensją.',
      hints: ['`public override int Wyplata() { return base.Wyplata() + Premia; }`'],
      checks: [{ pattern: 'base\\.Wyplata\\s*\\(', message: 'Użyj base.Wyplata() w klasie Kierownik.' }],
      solution: csProg({ types: `class Pracownik
{
    public int Pensja;

    public Pracownik(int pensja)
    {
        Pensja = pensja;
    }

    public virtual int Wyplata()
    {
        return Pensja;
    }
}

class Kierownik : Pracownik
{
    public int Premia;

    public Kierownik(int pensja, int premia) : base(pensja)
    {
        Premia = premia;
    }

    public override int Wyplata()
    {
        return base.Wyplata() + Premia;
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
int pensja = int.Parse(p[0]);
int premia = int.Parse(p[1]);
Console.WriteLine($"Pracownik: {new Pracownik(pensja).Wyplata()}");
Console.WriteLine($"Kierownik: {new Kierownik(pensja, premia).Wyplata()}");` }),
      tests: [
        { input: '5000 1500', expected: 'Pracownik: 5000\nKierownik: 6500' },
        { input: '4200 0', expected: 'Pracownik: 4200\nKierownik: 4200' },
      ],
    }),
  ],

  cs28: [
    mk({
      id: 'cs28t3', title: 'Bilety komunikacji', difficulty: 2,
      description: 'Klasa `Bilet` ma wirtualną metodę `double Cena()` (4.40 zł). Klasy `Ulgowy` (2.20 zł) i `Rodzinny` (10.00 zł) ją nadpisują. Wczytaj linię liter `N`, `U`, `R`, zapisz bilety w liście typu `List<Bilet>` i wypisz sumę cen.',
      hints: ['W pętli wywołuj `b.Cena()` – wersja metody zależy od faktycznego typu obiektu.'],
      checks: [{ pattern: 'override\\s+double\\s+Cena', message: 'Nadpisz metodę Cena w klasach pochodnych.' }],
      solution: csProg({ usings: L, types: `class Bilet
{
    public virtual double Cena() => 4.40;
}

class Ulgowy : Bilet
{
    public override double Cena() => 2.20;
}

class Rodzinny : Bilet
{
    public override double Cena() => 10.00;
}`, main: `List<Bilet> bilety = new List<Bilet>();
foreach (string s in Console.ReadLine().Split(' '))
{
    if (s == "U") bilety.Add(new Ulgowy());
    else if (s == "R") bilety.Add(new Rodzinny());
    else bilety.Add(new Bilet());
}
double suma = 0;
foreach (Bilet b in bilety) suma += b.Cena();
Console.WriteLine($"Suma: {suma:F2}");` }),
      tests: [
        { input: 'N U U R', expected: 'Suma: 18.80' },
        { input: 'N', expected: 'Suma: 4.40' },
      ],
    }),
    mk({
      id: 'cs28t4', title: 'Figura o największym polu', difficulty: 2,
      description: 'Klasa `Figura` ma wirtualne metody `double Pole()` i `string Nazwa()`. Klasy `Kolo(r)`, `Kwadrat(a)` i `Prostokat(a, b)` je nadpisują. Wczytaj `n` i `n` linii (`kolo r`, `kwadrat a`, `prostokat a b`) i wypisz figurę o największym polu (2 miejsca po przecinku).',
      hints: ['Pole koła: `Math.PI * r * r`.'],
      checks: [{ pattern: 'override\\s+double\\s+Pole', message: 'Nadpisz metodę Pole w klasach pochodnych.' }],
      solution: csProg({ usings: L, types: `class Figura
{
    public virtual double Pole() => 0;
    public virtual string Nazwa() => "figura";
}

class Kolo : Figura
{
    private double r;
    public Kolo(double r) { this.r = r; }
    public override double Pole() => Math.PI * r * r;
    public override string Nazwa() => "kolo";
}

class Kwadrat : Figura
{
    private double a;
    public Kwadrat(double a) { this.a = a; }
    public override double Pole() => a * a;
    public override string Nazwa() => "kwadrat";
}

class Prostokat : Figura
{
    private double a, b;
    public Prostokat(double a, double b) { this.a = a; this.b = b; }
    public override double Pole() => a * b;
    public override string Nazwa() => "prostokat";
}`, main: `int n = int.Parse(Console.ReadLine());
List<Figura> figury = new List<Figura>();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    if (p[0] == "kolo") figury.Add(new Kolo(double.Parse(p[1])));
    else if (p[0] == "kwadrat") figury.Add(new Kwadrat(double.Parse(p[1])));
    else figury.Add(new Prostokat(double.Parse(p[1]), double.Parse(p[2])));
}
Figura naj = figury[0];
foreach (Figura f in figury)
{
    if (f.Pole() > naj.Pole()) naj = f;
}
Console.WriteLine($"Najwieksze pole: {naj.Nazwa()} ({naj.Pole():F2})");` }),
      tests: [
        { input: '3\nkolo 1\nkwadrat 2\nprostokat 1 3', expected: 'Najwieksze pole: kwadrat (4.00)' },
        { input: '2\nprostokat 2 5\nkolo 2', expected: 'Najwieksze pole: kolo (12.57)' },
      ],
    }),
  ],

  cs29: [
    mk({
      id: 'cs29t3', title: 'Metody płatności', difficulty: 2,
      description: 'Klasa abstrakcyjna `Platnosc` ma abstrakcyjną metodę `double Oplata(double kwota)` i abstrakcyjną właściwość `Nazwa`. Zaimplementuj `Karta` (prowizja 1%), `Gotowka` (bez opłat) i `Przelew` (+2 zł). Wczytaj kwotę i wypisz koszt każdą metodą.',
      hints: ['`public abstract string Nazwa { get; }` i w klasie pochodnej `public override string Nazwa => "Karta";`'],
      checks: [{ pattern: 'abstract\\s+class\\s+Platnosc', message: 'Platnosc powinna być klasą abstrakcyjną.' }, { pattern: 'abstract\\s+double\\s+Oplata', message: 'Oplata powinna być metodą abstrakcyjną.' }],
      solution: csProg({ usings: L, types: `abstract class Platnosc
{
    public abstract string Nazwa { get; }
    public abstract double Oplata(double kwota);
}

class Karta : Platnosc
{
    public override string Nazwa => "Karta";
    public override double Oplata(double kwota) => kwota * 1.01;
}

class Gotowka : Platnosc
{
    public override string Nazwa => "Gotowka";
    public override double Oplata(double kwota) => kwota;
}

class Przelew : Platnosc
{
    public override string Nazwa => "Przelew";
    public override double Oplata(double kwota) => kwota + 2;
}`, main: `double kwota = double.Parse(Console.ReadLine());
List<Platnosc> metody = new List<Platnosc> { new Karta(), new Gotowka(), new Przelew() };
foreach (Platnosc p in metody)
{
    Console.WriteLine($"{p.Nazwa}: {p.Oplata(kwota):F2}");
}` }),
      tests: [
        { input: '100', expected: 'Karta: 101.00\nGotowka: 100.00\nPrzelew: 102.00' },
        { input: '250', expected: 'Karta: 252.50\nGotowka: 250.00\nPrzelew: 252.00' },
      ],
    }),
    mk({
      id: 'cs29t4', title: 'Interfejs IOpis', difficulty: 2,
      description: 'Interfejs `IOpis` ma metodę `string Opis()`. Niezwiązane ze sobą klasy `Ksiazka(tytul)` i `Film(tytul, minuty)` go implementują. Wczytaj `n` i `n` linii `ksiazka Tytul` lub `film Tytul minuty`, zapisz obiekty w liście `List<IOpis>` i wypisz ich opisy.',
      hints: ['`interface IOpis { string Opis(); }`', '`class Film : IOpis { ... public string Opis() => ...; }`'],
      checks: [{ pattern: 'interface\\s+IOpis', message: 'Zdefiniuj interfejs IOpis.' }, { pattern: 'List\\s*<\\s*IOpis\\s*>', message: 'Przechowuj obiekty w liście List<IOpis>.' }],
      solution: csProg({ usings: L, types: `interface IOpis
{
    string Opis();
}

class Ksiazka : IOpis
{
    private string tytul;
    public Ksiazka(string tytul) { this.tytul = tytul; }
    public string Opis() => $"Ksiazka: {tytul}";
}

class Film : IOpis
{
    private string tytul;
    private int minuty;
    public Film(string tytul, int minuty) { this.tytul = tytul; this.minuty = minuty; }
    public string Opis() => $"Film: {tytul} ({minuty} min)";
}`, main: `int n = int.Parse(Console.ReadLine());
List<IOpis> lista = new List<IOpis>();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    if (p[0] == "ksiazka") lista.Add(new Ksiazka(p[1]));
    else lista.Add(new Film(p[1], int.Parse(p[2])));
}
foreach (IOpis o in lista) Console.WriteLine(o.Opis());` }),
      tests: [
        { input: '2\nksiazka Lalka\nfilm Shrek 90', expected: 'Ksiazka: Lalka\nFilm: Shrek (90 min)' },
        { input: '1\nfilm Avatar 162', expected: 'Film: Avatar (162 min)' },
      ],
    }),
  ],

  cs30: [
    mk({
      id: 'cs30t2', title: 'Samochód z silnikiem', difficulty: 2,
      description: 'Klasa `Silnik` ma pole `Wlaczony` i metody `Start()` oraz `Stop()`. Klasa `Samochod` **tworzy** swój silnik (kompozycja) i ma metody `Uruchom()`, `Zatrzymaj()`, `Jedz()`. Wczytaj linię poleceń `start`, `jedz`, `stop` i wykonaj je. Komunikaty: `Uruchomiono silnik`, `Zatrzymano silnik`, `Jade` albo `Silnik wylaczony`.',
      hints: ['W klasie Samochod: `private Silnik silnik = new Silnik();`'],
      checks: [{ pattern: 'new\\s+Silnik\\s*\\(', message: 'Samochód powinien sam utworzyć swój silnik (new Silnik()).' }],
      solution: csProg({ types: `class Silnik
{
    public bool Wlaczony;

    public void Start() { Wlaczony = true; }
    public void Stop() { Wlaczony = false; }
}

class Samochod
{
    private Silnik silnik = new Silnik();

    public void Uruchom()
    {
        silnik.Start();
        Console.WriteLine("Uruchomiono silnik");
    }

    public void Zatrzymaj()
    {
        silnik.Stop();
        Console.WriteLine("Zatrzymano silnik");
    }

    public void Jedz()
    {
        Console.WriteLine(silnik.Wlaczony ? "Jade" : "Silnik wylaczony");
    }
}`, main: `Samochod auto = new Samochod();
foreach (string p in Console.ReadLine().Split(' '))
{
    if (p == "start") auto.Uruchom();
    else if (p == "stop") auto.Zatrzymaj();
    else auto.Jedz();
}` }),
      tests: [
        { input: 'jedz start jedz stop jedz', expected: 'Silnik wylaczony\nUruchomiono silnik\nJade\nZatrzymano silnik\nSilnik wylaczony' },
        { input: 'start jedz jedz', expected: 'Uruchomiono silnik\nJade\nJade' },
      ],
    }),
    mk({
      id: 'cs30t3', title: 'Biblioteka', difficulty: 3,
      description: 'Klasa `Ksiazka` ma `Tytul` i `Wypozyczona`. Klasa `Biblioteka` przechowuje listę książek i ma metody `Wypozycz(tytul)` oraz `Zwroc(tytul)`. Pierwsza linia: tytuły książek, potem `n` i `n` poleceń `W tytul` / `Z tytul`. Wypisuj `Wypozyczono: T`, `Niedostepna: T` lub `Zwrocono: T`, a na końcu listę dostępnych książek.',
      hints: ['Szukaj książki pętlą po liście; niedostępna = brak w bibliotece lub już wypożyczona.'],
      checks: [{ pattern: 'List\\s*<\\s*Ksiazka\\s*>', message: 'Biblioteka powinna przechowywać List<Ksiazka>.' }],
      solution: csProg({ usings: L, types: `class Ksiazka
{
    public string Tytul;
    public bool Wypozyczona;

    public Ksiazka(string tytul) { Tytul = tytul; }
}

class Biblioteka
{
    private List<Ksiazka> ksiazki = new List<Ksiazka>();

    public void Dodaj(Ksiazka k) { ksiazki.Add(k); }

    private Ksiazka Znajdz(string tytul)
    {
        foreach (Ksiazka k in ksiazki) if (k.Tytul == tytul) return k;
        return null;
    }

    public void Wypozycz(string tytul)
    {
        Ksiazka k = Znajdz(tytul);
        if (k == null || k.Wypozyczona)
        {
            Console.WriteLine($"Niedostepna: {tytul}");
            return;
        }
        k.Wypozyczona = true;
        Console.WriteLine($"Wypozyczono: {tytul}");
    }

    public void Zwroc(string tytul)
    {
        Ksiazka k = Znajdz(tytul);
        if (k != null) k.Wypozyczona = false;
        Console.WriteLine($"Zwrocono: {tytul}");
    }

    public string Dostepne()
    {
        List<string> t = new List<string>();
        foreach (Ksiazka k in ksiazki) if (!k.Wypozyczona) t.Add(k.Tytul);
        return string.Join(" ", t);
    }
}`, main: `Biblioteka b = new Biblioteka();
foreach (string t in Console.ReadLine().Split(' ')) b.Dodaj(new Ksiazka(t));
int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    if (p[0] == "W") b.Wypozycz(p[1]);
    else b.Zwroc(p[1]);
}
Console.WriteLine("Dostepne: " + b.Dostepne());` }),
      tests: [
        { input: 'Lalka Potop Quo_Vadis\n3\nW Potop\nW Potop\nW Lalka', expected: 'Wypozyczono: Potop\nNiedostepna: Potop\nWypozyczono: Lalka\nDostepne: Quo_Vadis' },
        { input: 'Lalka Potop\n3\nW Lalka\nZ Lalka\nW Dziady', expected: 'Wypozyczono: Lalka\nZwrocono: Lalka\nNiedostepna: Dziady\nDostepne: Lalka Potop' },
      ],
    }),
    mk({
      id: 'cs30t4', title: 'Najlepszy w klasie', difficulty: 3,
      description: 'Klasa `Uczen` ma imię i listę ocen oraz metodę `Srednia()`. Klasa `KlasaSzkolna` przechowuje uczniów (agregacja) i ma metody `Najlepszy()` oraz `SredniaKlasy()` (średnia średnich). Wczytaj `n` i `n` linii `imie oceny...`. Wypisz:',
      hints: ['`string[] p = linia.Split(\' \');` – `p[0]` to imię, dalej oceny.'],
      checks: [{ pattern: 'List\\s*<\\s*Uczen\\s*>', message: 'Klasa szkolna powinna przechowywać List<Uczen>.' }],
      solution: csProg({ usings: L, types: `class Uczen
{
    public string Imie;
    private List<int> oceny = new List<int>();

    public Uczen(string imie) { Imie = imie; }

    public void Dodaj(int o) { oceny.Add(o); }

    public double Srednia()
    {
        double s = 0;
        foreach (int o in oceny) s += o;
        return s / oceny.Count;
    }
}

class KlasaSzkolna
{
    private List<Uczen> uczniowie = new List<Uczen>();

    public void Dodaj(Uczen u) { uczniowie.Add(u); }

    public Uczen Najlepszy()
    {
        Uczen naj = uczniowie[0];
        foreach (Uczen u in uczniowie) if (u.Srednia() > naj.Srednia()) naj = u;
        return naj;
    }

    public double SredniaKlasy()
    {
        double s = 0;
        foreach (Uczen u in uczniowie) s += u.Srednia();
        return s / uczniowie.Count;
    }
}`, main: `KlasaSzkolna k = new KlasaSzkolna();
int n = int.Parse(Console.ReadLine());
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    Uczen u = new Uczen(p[0]);
    for (int j = 1; j < p.Length; j++) u.Dodaj(int.Parse(p[j]));
    k.Dodaj(u);
}
Uczen naj = k.Najlepszy();
Console.WriteLine($"Najlepszy: {naj.Imie} ({naj.Srednia():F2})");
Console.WriteLine($"Srednia klasy: {k.SredniaKlasy():F2}");` }),
      tests: [
        { input: '3\nOla 5 6 5\nJan 3 4\nEwa 4 4 5', expected: 'Najlepszy: Ola (5.33)\nSrednia klasy: 4.39' },
        { input: '1\nAdam 2 3', expected: 'Najlepszy: Adam (2.50)\nSrednia klasy: 2.50' },
      ],
    }),
  ],

  cs31: [
    mk({
      id: 'cs31t3', title: 'Dodawanie ułamków', difficulty: 3,
      description: 'Klasa `Ulamek` (licznik, mianownik) skraca się w konstruktorze, ma operator `+` i metodę `ToString()` zwracającą `l/m`. Wczytaj `l1 m1 l2 m2` i wypisz działanie z wynikiem.',
      hints: ['a/b + c/d = (a·d + c·b) / (b·d)', '`public static Ulamek operator +(Ulamek x, Ulamek y)`'],
      checks: [{ pattern: 'operator\\s*\\+', message: 'Przeciąż operator +.' }],
      solution: csProg({ types: `class Ulamek
{
    public int L { get; }
    public int M { get; }

    public Ulamek(int l, int m)
    {
        int a = l, b = m;
        while (b != 0)
        {
            int t = a % b;
            a = b;
            b = t;
        }
        L = l / a;
        M = m / a;
    }

    public static Ulamek operator +(Ulamek x, Ulamek y)
    {
        return new Ulamek(x.L * y.M + y.L * x.M, x.M * y.M);
    }

    public override string ToString() => $"{L}/{M}";
}`, main: `string[] p = Console.ReadLine().Split(' ');
Ulamek a = new Ulamek(int.Parse(p[0]), int.Parse(p[1]));
Ulamek b = new Ulamek(int.Parse(p[2]), int.Parse(p[3]));
Console.WriteLine($"{a} + {b} = {a + b}");` }),
      tests: [
        { input: '1 2 1 3', expected: '1/2 + 1/3 = 5/6' },
        { input: '1 4 1 4', expected: '1/4 + 1/4 = 1/2' },
        { input: '2 3 1 3', expected: '2/3 + 1/3 = 1/1' },
      ],
    }),
    mk({
      id: 'cs31t4', title: 'Czas trwania', difficulty: 2,
      description: 'Klasa `Czas` przechowuje liczbę minut. Przeciąż operatory `+` (dwa czasy) i `*` (czas razy liczba całkowita), a `ToString()` niech zwraca `h:mm`. Wczytaj `a b k` (minuty, minuty, mnożnik) i wypisz:',
      hints: ['Format minut dwucyfrowo: `{m:D2}`.'],
      checks: [{ pattern: 'operator\\s*\\+', message: 'Przeciąż operator +.' }, { pattern: 'operator\\s*\\*', message: 'Przeciąż operator *.' }],
      solution: csProg({ types: `class Czas
{
    public int Minuty { get; }

    public Czas(int minuty) { Minuty = minuty; }

    public static Czas operator +(Czas a, Czas b) => new Czas(a.Minuty + b.Minuty);
    public static Czas operator *(Czas a, int k) => new Czas(a.Minuty * k);

    public override string ToString() => $"{Minuty / 60}:{Minuty % 60:D2}";
}`, main: `string[] p = Console.ReadLine().Split(' ');
Czas a = new Czas(int.Parse(p[0]));
Czas b = new Czas(int.Parse(p[1]));
int k = int.Parse(p[2]);
Console.WriteLine($"a + b = {a + b}");
Console.WriteLine($"a * {k} = {a * k}");` }),
      tests: [
        { input: '90 45 3', expected: 'a + b = 2:15\na * 3 = 4:30' },
        { input: '5 3 2', expected: 'a + b = 0:08\na * 2 = 0:10' },
      ],
    }),
  ],
};
