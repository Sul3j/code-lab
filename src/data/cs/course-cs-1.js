// Kurs C# – tematy 1–11. Każdy program zaczyna się od `using System;`.
import { csProg, CS_TEMPLATE } from '../lang-templates.js';

export const cs1 = [
  // ─────────────── 1 ───────────────
  {
    id: 'cs01', title: 'Podstawowe elementy języka C#', subtitle: 'Main, Console, zmienne, typy', icon: 'Terminal', practice: false,
    theory: [
      { type: 'p', text: 'Program w C# składa się z **klas**. Wykonanie zaczyna się od metody `static void Main()` w klasie `Program`. Na ekran wypisujemy metodą `Console.WriteLine(...)` (z przejściem do nowej linii) albo `Console.Write(...)` (bez).' },
      { type: 'code', code: csProg({ main: `Console.WriteLine("Witaj, swiecie!");
Console.WriteLine("2 + 3 = " + (2 + 3));` }) },
      { type: 'list', items: [
        '`using System;` – pozwala pisać `Console` zamiast `System.Console` (w tym kursie zawsze ją dodajemy).',
        'Każda instrukcja kończy się średnikiem `;`, a bloki kodu ujmujemy w klamry `{ }`.',
        'C# rozróżnia wielkość liter: `Console` to nie to samo co `console`.',
      ] },
      { type: 'h', text: 'Zmienne i typy' },
      { type: 'table', head: ['Typ', 'Co przechowuje', 'Przykład'], rows: [
        ['int', 'liczby całkowite', 'int wiek = 15;'],
        ['double', 'liczby rzeczywiste', 'double cena = 4.99;'],
        ['char', 'jeden znak (apostrofy)', "char litera = 'A';"],
        ['string', 'tekst (cudzysłów)', 'string imie = "Ola";'],
        ['bool', 'prawda / fałsz', 'bool zdal = true;'],
        ['var', 'typ ustalany przez kompilator', 'var x = 10; // int'],
      ] },
      { type: 'h', text: 'Wczytywanie danych' },
      { type: 'p', text: '`Console.ReadLine()` wczytuje całą linię jako **tekst** (`string`). Aby otrzymać liczbę, trzeba ją zamienić: `int.Parse(...)` albo `double.Parse(...)`.' },
      { type: 'code', code: `string imie = Console.ReadLine();
int wiek = int.Parse(Console.ReadLine());` },
      { type: 'warn', text: 'Dzielenie dwóch liczb `int` daje wynik całkowity: `7 / 2` to `3`. Aby dostać `3.5`, jedna liczba musi być typu double: `7 / 2.0` lub `(double)a / b`.' },
      { type: 'tip', text: 'Napis interpolowany `$"..."` wstawia wartości zmiennych w nawiasach klamrowych: `Console.WriteLine($"Masz {wiek} lat");`. Format `{x:F2}` daje dwa miejsca po przecinku.' },
    ],
    example: {
      title: 'Przedstaw się', input: 'Ola\n15',
      description: 'Program wczytuje imię i wiek, a potem wypisuje powitanie z użyciem napisu interpolowanego.',
      code: csProg({ main: `Console.Write("Jak masz na imie? ");
string imie = Console.ReadLine();
Console.Write("Ile masz lat? ");
int wiek = int.Parse(Console.ReadLine());

Console.WriteLine($"Czesc, {imie}!");
Console.WriteLine($"Za 10 lat bedziesz mial(a) {wiek + 10} lat.");

double wzrost = 1.65;
Console.WriteLine($"Przykladowy wzrost: {wzrost} m");
Console.WriteLine($"7 / 2 = {7 / 2}, a 7 / 2.0 = {7 / 2.0}");` }),
    },
    tasks: [
      {
        id: 'cs01t1', title: 'Suma i iloczyn', difficulty: 1,
        description: 'Wczytaj dwie liczby całkowite (każdą w osobnej linii) i wypisz ich sumę oraz iloczyn:',
        expectedOutput: 'Suma: 7\nIloczyn: 12', exampleInput: '3\n4',
        starter: CS_TEMPLATE,
        hints: ['Wczytanie liczby: `int a = int.Parse(Console.ReadLine());`', 'Wypisanie: `Console.WriteLine($"Suma: {a + b}");`'],
        solution: csProg({ main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
Console.WriteLine($"Suma: {a + b}");
Console.WriteLine($"Iloczyn: {a * b}");` }),
        tests: [
          { input: '3\n4', expected: 'Suma: 7\nIloczyn: 12' },
          { input: '-2\n5', expected: 'Suma: 3\nIloczyn: -10' },
        ],
      },
      {
        id: 'cs01t2', title: 'Średnia trzech ocen', difficulty: 2,
        description: 'Wczytaj trzy oceny (liczby całkowite, każda w osobnej linii) i wypisz ich średnią z dokładnością do dwóch miejsc po przecinku. Uważaj na dzielenie całkowite!',
        expectedOutput: 'Srednia: 4.33', exampleInput: '5\n4\n4',
        starter: CS_TEMPLATE,
        hints: ['Suma trzech `int` jest typu `int` – podziel ją przez `3.0`.', 'Format: `$"Srednia: {srednia:F2}"`.'],
        solution: csProg({ main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
int c = int.Parse(Console.ReadLine());
double srednia = (a + b + c) / 3.0;
Console.WriteLine($"Srednia: {srednia:F2}");` }),
        tests: [
          { input: '5\n4\n4', expected: 'Srednia: 4.33' },
          { input: '3\n4\n5', expected: 'Srednia: 4.00' },
          { input: '1\n2\n2', expected: 'Srednia: 1.67' },
        ],
      },
    ],
  },

  // ─────────────── 2 ───────────────
  {
    id: 'cs02', title: 'Instrukcje warunkowe i wyboru', subtitle: 'if, else if, switch, ?:', icon: 'GitBranch', practice: true,
    theory: [
      { type: 'p', text: 'Instrukcja **if** wykonuje kod tylko wtedy, gdy warunek jest prawdziwy. W C# warunek **musi być typu bool** – nie można napisać `if (x)` dla liczby, trzeba `if (x != 0)`.' },
      { type: 'code', code: `if (temperatura > 25)
{
    Console.WriteLine("Goraco!");
}
else if (temperatura > 10)
{
    Console.WriteLine("Przyjemnie");
}
else
{
    Console.WriteLine("Zimno");
}` },
      { type: 'table', head: ['Operator', 'Znaczenie'], rows: [
        ['== !=', 'równe / różne'], ['< > <= >=', 'mniejsze / większe'], ['&&', 'i'], ['||', 'lub'], ['!', 'zaprzeczenie'],
      ] },
      { type: 'h', text: 'switch' },
      { type: 'p', text: 'Instrukcja **switch** wybiera sekcję na podstawie wartości (liczby, znaku, napisu lub wyliczenia). W C# każda niepusta sekcja **musi kończyć się `break`** (albo `return`) – nie ma „przelatywania” do następnej sekcji. Kilka etykiet może prowadzić do jednej sekcji.' },
      { type: 'code', code: `switch (dzien)
{
    case 6:
    case 7:
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Dzien roboczy");
        break;
}` },
      { type: 'h', text: 'Wyrażenie switch i operator ?:' },
      { type: 'code', code: `string opis = ocena switch
{
    6 => "celujacy",
    5 => "bardzo dobry",
    _ => "inna"
};
string parzystosc = n % 2 == 0 ? "parzysta" : "nieparzysta";` },
      { type: 'warn', text: '`if (x = 5)` w C# to błąd kompilacji (wynik przypisania nie jest typu bool) – do porównania służy `==`.' },
    ],
    example: {
      title: 'Ocena słownie', input: '83',
      description: 'Zamiana punktów na ocenę przez if / else if, a oceny na opis – wyrażeniem switch.',
      code: csProg({ main: `Console.Write("Ile punktow (0-100)? ");
int punkty = int.Parse(Console.ReadLine());

int ocena;
if (punkty < 0 || punkty > 100)
{
    Console.WriteLine("Niepoprawna liczba punktow!");
    return;
}
else if (punkty >= 90) ocena = 5;
else if (punkty >= 70) ocena = 4;
else if (punkty >= 50) ocena = 3;
else ocena = 2;

string opis = ocena switch
{
    5 => "bardzo dobry",
    4 => "dobry",
    3 => "dostateczny",
    _ => "niedostateczny"
};
Console.WriteLine($"Ocena: {ocena} ({opis})");` }),
    },
    tasks: [
      {
        id: 'cs02t1', title: 'Parzysta czy nieparzysta?', difficulty: 1,
        description: 'Wczytaj liczbę całkowitą i wypisz `parzysta` albo `nieparzysta`.',
        expectedOutput: 'parzysta', exampleInput: '8', starter: CS_TEMPLATE,
        hints: ['Reszta z dzielenia: `n % 2`.', 'Warunek: `if (n % 2 == 0)`.'],
        solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
if (n % 2 == 0)
{
    Console.WriteLine("parzysta");
}
else
{
    Console.WriteLine("nieparzysta");
}` }),
        tests: [{ input: '8', expected: 'parzysta' }, { input: '7', expected: 'nieparzysta' }, { input: '-3', expected: 'nieparzysta' }, { input: '0', expected: 'parzysta' }],
      },
      {
        id: 'cs02t2', title: 'Dzień tygodnia (switch)', difficulty: 2,
        description: 'Wczytaj numer dnia (1–7) i wypisz jego nazwę: `Poniedzialek`, `Wtorek`, `Sroda`, `Czwartek`, `Piatek`, `Sobota`, `Niedziela`. Dla innej liczby wypisz `Bledny numer`. Użyj instrukcji **switch**.',
        expectedOutput: 'Sroda', exampleInput: '3', starter: CS_TEMPLATE,
        hints: ['Każda sekcja `case` musi kończyć się `break;`.', 'Dla pozostałych liczb użyj `default:`.'],
        checks: [{ pattern: '\\bswitch\\b', message: 'Użyj instrukcji lub wyrażenia switch.' }],
        solution: csProg({ main: `int dzien = int.Parse(Console.ReadLine());
switch (dzien)
{
    case 1: Console.WriteLine("Poniedzialek"); break;
    case 2: Console.WriteLine("Wtorek"); break;
    case 3: Console.WriteLine("Sroda"); break;
    case 4: Console.WriteLine("Czwartek"); break;
    case 5: Console.WriteLine("Piatek"); break;
    case 6: Console.WriteLine("Sobota"); break;
    case 7: Console.WriteLine("Niedziela"); break;
    default: Console.WriteLine("Bledny numer"); break;
}` }),
        tests: [{ input: '3', expected: 'Sroda' }, { input: '1', expected: 'Poniedzialek' }, { input: '7', expected: 'Niedziela' }, { input: '0', expected: 'Bledny numer' }],
      },
    ],
  },

  // ─────────────── 3 ───────────────
  {
    id: 'cs03', title: 'Pętle programowe', subtitle: 'for, while, do-while, break', icon: 'Repeat', practice: true,
    theory: [
      { type: 'p', text: 'Pętle powtarzają fragment kodu. **for** stosujemy, gdy znamy liczbę powtórzeń, **while** – gdy powtarzamy, dopóki warunek jest prawdziwy, a **do-while** wykona się co najmniej raz.' },
      { type: 'code', code: `for (int i = 1; i <= 5; i++)
{
    Console.Write(i + " ");          // 1 2 3 4 5
}

int n = 1234, cyfry = 0;
while (n > 0)
{
    n /= 10;
    cyfry++;
}

int liczba;
do
{
    liczba = int.Parse(Console.ReadLine());
} while (liczba <= 0);` },
      { type: 'list', items: ['`break` – natychmiast kończy pętlę.', '`continue` – przechodzi do następnego obrotu.', 'Zmienna zadeklarowana w `for (int i = ...)` istnieje tylko wewnątrz pętli.'] },
      { type: 'warn', text: 'Nieskończona pętla (np. zapomniane `i++`) zawiesza program – tutaj zatrzymasz go przyciskiem **Stop**.' },
    ],
    example: {
      title: 'Choinka i suma', input: '4',
      description: 'Pętle zagnieżdżone rysują trójkąt z gwiazdek, a pętla while liczy sumę cyfr.',
      code: csProg({ main: `Console.Write("Wysokosc: ");
int h = int.Parse(Console.ReadLine());
for (int i = 1; i <= h; i++)
{
    for (int j = 0; j < i; j++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}

int liczba = 98765, suma = 0;
while (liczba > 0)
{
    suma += liczba % 10;
    liczba /= 10;
}
Console.WriteLine($"Suma cyfr 98765 = {suma}");` }),
    },
    tasks: [
      {
        id: 'cs03t1', title: 'Odliczanie', difficulty: 1,
        description: 'Wczytaj liczbę `n` (n ≥ 1). Wypisz w jednej linii liczby od `n` do `1` oddzielone spacjami, a w następnej linii `Start!`.',
        expectedOutput: '5 4 3 2 1\nStart!', exampleInput: '5', starter: CS_TEMPLATE,
        hints: ['Pętla w dół: `for (int i = n; i >= 1; i--)`.', 'Po pętli: `Console.WriteLine();` i `Console.WriteLine("Start!");`.'],
        solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
for (int i = n; i >= 1; i--)
{
    Console.Write(i + " ");
}
Console.WriteLine();
Console.WriteLine("Start!");` }),
        tests: [{ input: '5', expected: '5 4 3 2 1\nStart!' }, { input: '1', expected: '1\nStart!' }],
      },
      {
        id: 'cs03t2', title: 'Suma cyfr', difficulty: 2,
        description: 'Wczytaj nieujemną liczbę całkowitą i oblicz sumę jej cyfr pętlą **while**.',
        expectedOutput: 'Suma cyfr: 6', exampleInput: '123', starter: CS_TEMPLATE,
        hints: ['Ostatnia cyfra: `n % 10`.', 'Obcięcie ostatniej cyfry: `n /= 10;`.'],
        checks: [{ pattern: '\\bwhile\\s*\\(', message: 'Użyj pętli while.' }],
        solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
int suma = 0;
while (n > 0)
{
    suma += n % 10;
    n /= 10;
}
Console.WriteLine($"Suma cyfr: {suma}");` }),
        tests: [{ input: '123', expected: 'Suma cyfr: 6' }, { input: '0', expected: 'Suma cyfr: 0' }, { input: '99999', expected: 'Suma cyfr: 45' }],
      },
    ],
  },

  // ─────────────── 4 ───────────────
  {
    id: 'cs04', title: 'Typ wyliczeniowy', subtitle: 'enum', icon: 'ListOrdered', practice: true,
    theory: [
      { type: 'p', text: 'Typ wyliczeniowy **enum** nadaje nazwy kolejnym liczbom całkowitym. Wartości zapisujemy z nazwą typu: `Dzien.Sroda`. Wypisanie wartości enum pokazuje jej **nazwę**, a nie liczbę.' },
      { type: 'code', code: `enum Dzien { Pon = 1, Wt, Sr, Czw, Pt, Sob, Nd }

Dzien d = Dzien.Sr;
Console.WriteLine(d);          // Sr
Console.WriteLine((int)d);     // 3
Dzien e = (Dzien)6;            // Sob – z liczby przez rzutowanie` },
      { type: 'list', items: [
        'Domyślnie pierwsza wartość ma numer 0, a kolejne są o 1 większe; można je ustawić ręcznie.',
        'Zamiana enum ↔ int wymaga **jawnego rzutowania**: `(int)d`, `(Dzien)n`.',
        'Wyliczenia świetnie współpracują ze `switch` i z wyrażeniem `switch`.',
        'Typ enum definiujemy poza metodą (np. przed klasą Program).',
      ] },
      { type: 'tip', text: 'Stosuj enum zamiast „magicznych liczb”: stan gry (`Menu`, `Gra`, `Koniec`), kierunek (`Gora`, `Dol`…), poziom trudności.' },
    ],
    example: {
      title: 'Kierunki ruchu',
      description: 'Robot porusza się według listy kierunków zapisanych jako enum.',
      code: csProg({ types: `enum Kierunek { Gora, Prawo, Dol, Lewo }`, main: `Kierunek[] ruchy = { Kierunek.Gora, Kierunek.Gora, Kierunek.Prawo, Kierunek.Dol };
int x = 0, y = 0;
foreach (Kierunek k in ruchy)
{
    switch (k)
    {
        case Kierunek.Gora: y++; break;
        case Kierunek.Dol: y--; break;
        case Kierunek.Prawo: x++; break;
        case Kierunek.Lewo: x--; break;
    }
    Console.WriteLine($"Ruch {k} (nr {(int)k}) -> ({x}, {y})");
}` }),
    },
    tasks: [
      {
        id: 'cs04t1', title: 'Weekend czy dzień roboczy?', difficulty: 1,
        description: 'Zdefiniuj `enum Dzien { Pon = 1, Wt, Sr, Czw, Pt, Sob, Nd }`. Wczytaj numer dnia (1–7), zamień go na `Dzien` i wypisz nazwę dnia oraz `Weekend` albo `Dzien roboczy`:',
        expectedOutput: 'Sob: Weekend', exampleInput: '6',
        starter: csProg({ types: 'enum Dzien { Pon = 1, Wt, Sr, Czw, Pt, Sob, Nd }' }),
        hints: ['Rzutowanie: `Dzien d = (Dzien)n;`', 'Warunek: `d == Dzien.Sob || d == Dzien.Nd`.', 'Wypisanie `d` pokazuje nazwę: `$"{d}: Weekend"`.'],
        checks: [{ pattern: 'enum\\s+Dzien', message: 'Użyj typu wyliczeniowego Dzien.' }],
        solution: csProg({ types: 'enum Dzien { Pon = 1, Wt, Sr, Czw, Pt, Sob, Nd }', main: `int n = int.Parse(Console.ReadLine());
Dzien d = (Dzien)n;
if (d == Dzien.Sob || d == Dzien.Nd)
{
    Console.WriteLine($"{d}: Weekend");
}
else
{
    Console.WriteLine($"{d}: Dzien roboczy");
}` }),
        tests: [{ input: '6', expected: 'Sob: Weekend' }, { input: '7', expected: 'Nd: Weekend' }, { input: '1', expected: 'Pon: Dzien roboczy' }],
      },
      {
        id: 'cs04t2', title: 'Sygnalizacja świetlna', difficulty: 2,
        description: 'Zdefiniuj `enum Swiatlo { Czerwone, Zielone, Zolte }` i metodę `static Swiatlo Nastepne(Swiatlo s)` (Czerwone → Zielone → Zolte → Czerwone). Wczytaj numer światła startowego (0–2) i liczbę zmian `k`; wypisz kolejne `k` świateł, każde w osobnej linii.',
        expectedOutput: 'Zielone\nZolte\nCzerwone', exampleInput: '0\n3',
        starter: csProg({ types: 'enum Swiatlo { Czerwone, Zielone, Zolte }', methods: `static Swiatlo Nastepne(Swiatlo s)
{
    // uzupelnij
    return s;
}` }),
        hints: ['Wyrażenie switch: `return s switch { Swiatlo.Czerwone => Swiatlo.Zielone, ... };`', 'W Main: `Swiatlo s = (Swiatlo)start;` i pętla `k` razy.'],
        checks: [{ pattern: 'static\\s+Swiatlo\\s+Nastepne', message: 'Zdefiniuj metodę static Swiatlo Nastepne(Swiatlo s).' }],
        solution: csProg({ types: 'enum Swiatlo { Czerwone, Zielone, Zolte }', methods: `static Swiatlo Nastepne(Swiatlo s)
{
    return s switch
    {
        Swiatlo.Czerwone => Swiatlo.Zielone,
        Swiatlo.Zielone => Swiatlo.Zolte,
        _ => Swiatlo.Czerwone
    };
}`, main: `int start = int.Parse(Console.ReadLine());
int k = int.Parse(Console.ReadLine());
Swiatlo s = (Swiatlo)start;
for (int i = 0; i < k; i++)
{
    s = Nastepne(s);
    Console.WriteLine(s);
}` }),
        tests: [{ input: '0\n3', expected: 'Zielone\nZolte\nCzerwone' }, { input: '2\n1', expected: 'Czerwone' }],
      },
    ],
  },

  // ─────────────── 5 ───────────────
  {
    id: 'cs05', title: 'Typy wartościowe i referencyjne', subtitle: 'ref, out – odpowiednik wskaźników', icon: 'MousePointer2', practice: true,
    theory: [
      { type: 'p', text: 'W C# (w zwykłym kodzie) nie używa się wskaźników jak w C++. Ich rolę przejmują **referencje**. Każdy typ jest albo **wartościowy** (zmienna przechowuje samą wartość), albo **referencyjny** (zmienna przechowuje odwołanie do obiektu na stercie).' },
      { type: 'table', head: ['Typy wartościowe', 'Typy referencyjne'], rows: [
        ['int, double, char, bool, struct, enum', 'string, tablice, List, klasy (class)'],
        ['przypisanie kopiuje wartość', 'przypisanie kopiuje odwołanie – obie zmienne widzą ten sam obiekt'],
      ] },
      { type: 'h', text: 'Parametry ref i out' },
      { type: 'p', text: 'Parametry metod są domyślnie przekazywane **przez wartość** (kopia). Słowo **ref** przekazuje odwołanie do zmiennej – metoda może ją zmienić. **out** służy do „zwracania” dodatkowych wyników: metoda **musi** nadać wartość parametrowi out. Słowo ref/out piszemy także przy wywołaniu.' },
      { type: 'code', code: csProg({ methods: `static void Zamien(ref int a, ref int b)
{
    int tmp = a;
    a = b;
    b = tmp;
}

static void Dziel(int a, int b, out int iloraz, out int reszta)
{
    iloraz = a / b;
    reszta = a % b;
}`, main: `int x = 1, y = 2;
Zamien(ref x, ref y);
Console.WriteLine($"x = {x}, y = {y}");      // x = 2, y = 1

Dziel(17, 5, out int q, out int r);
Console.WriteLine($"17 / 5 = {q} reszty {r}");` }) },
      { type: 'tip', text: 'Znane metody z out: `int.TryParse(tekst, out int liczba)` zwraca `true`/`false` i przez out oddaje liczbę.' },
    ],
    example: {
      title: 'Kopia czy to samo?',
      description: 'Przypisanie zmiennej int tworzy kopię, a przypisanie tablicy – drugie odwołanie do tej samej tablicy.',
      code: csProg({ methods: `static void Podwoj(int liczba) { liczba *= 2; }
static void PodwojRef(ref int liczba) { liczba *= 2; }`, main: `int a = 5;
int b = a;          // kopia wartosci
b = 100;
Console.WriteLine($"a = {a}, b = {b}");

int[] t1 = { 1, 2, 3 };
int[] t2 = t1;      // kopia odwolania - ta sama tablica!
t2[0] = 100;
Console.WriteLine($"t1[0] = {t1[0]}");

int x = 10;
Podwoj(x);
Console.WriteLine($"Po Podwoj: {x}");
PodwojRef(ref x);
Console.WriteLine($"Po PodwojRef: {x}");` }),
    },
    tasks: [
      {
        id: 'cs05t1', title: 'Zamiana przez ref', difficulty: 1,
        description: 'Napisz metodę `static void Zamien(ref int a, ref int b)`. Wczytaj dwie liczby, zamień je metodą i wypisz:',
        expectedOutput: 'a = 5, b = 3', exampleInput: '3\n5',
        starter: csProg({ methods: `static void Zamien(ref int a, ref int b)
{
    // uzupelnij
}`, main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
// wywolaj Zamien
Console.WriteLine($"a = {a}, b = {b}");` }),
        hints: ['Zmienna pomocnicza: `int tmp = a; a = b; b = tmp;`', 'Wywołanie: `Zamien(ref a, ref b);`'],
        checks: [{ pattern: 'Zamien\\s*\\(\\s*ref', message: 'Wywołaj metodę z ref: Zamien(ref a, ref b).' }],
        solution: csProg({ methods: `static void Zamien(ref int a, ref int b)
{
    int tmp = a;
    a = b;
    b = tmp;
}`, main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
Zamien(ref a, ref b);
Console.WriteLine($"a = {a}, b = {b}");` }),
        tests: [{ input: '3\n5', expected: 'a = 5, b = 3' }, { input: '-1\n8', expected: 'a = 8, b = -1' }],
      },
      {
        id: 'cs05t2', title: 'Min i max przez out', difficulty: 2,
        description: 'Napisz metodę `static void MinMax(int a, int b, int c, out int min, out int max)`. Wczytaj trzy liczby i wypisz wynik:',
        expectedOutput: 'Min: 2, Max: 9', exampleInput: '4\n9\n2',
        starter: csProg({ methods: `static void MinMax(int a, int b, int c, out int min, out int max)
{
    // uzupelnij – oba parametry out musza dostac wartosc
    min = 0;
    max = 0;
}` }),
        hints: ['`min = Math.Min(a, Math.Min(b, c));`', 'Wywołanie: `MinMax(a, b, c, out int mn, out int mx);`'],
        checks: [{ pattern: 'out\\s+int\\s+min', message: 'Metoda powinna mieć parametry out int min i out int max.' }],
        solution: csProg({ methods: `static void MinMax(int a, int b, int c, out int min, out int max)
{
    min = Math.Min(a, Math.Min(b, c));
    max = Math.Max(a, Math.Max(b, c));
}`, main: `int a = int.Parse(Console.ReadLine());
int b = int.Parse(Console.ReadLine());
int c = int.Parse(Console.ReadLine());
MinMax(a, b, c, out int mn, out int mx);
Console.WriteLine($"Min: {mn}, Max: {mx}");` }),
        tests: [{ input: '4\n9\n2', expected: 'Min: 2, Max: 9' }, { input: '-5\n-5\n0', expected: 'Min: -5, Max: 0' }],
      },
    ],
  },

  // ─────────────── 6 ───────────────
  {
    id: 'cs06', title: 'Pamięć, null i Garbage Collector', subtitle: 'new, sterta, null, ?. i ??', icon: 'Cpu', practice: false,
    theory: [
      { type: 'p', text: 'Obiekty klas, tablice i napisy powstają na **stercie** przez `new`. W przeciwieństwie do C++ nie zwalniamy ich ręcznie – robi to automatycznie **Garbage Collector** (odśmiecacz), gdy na obiekt nie wskazuje już żadna zmienna.' },
      { type: 'code', code: `int[] t = new int[1000];   // pamiec na stercie
t = null;                   // tablica nie jest juz uzywana -> GC ja kiedys usunie` },
      { type: 'h', text: 'Wartość null' },
      { type: 'p', text: 'Zmienna typu referencyjnego może mieć wartość **null** – „nie wskazuje na żaden obiekt”. Próba użycia jej składowej kończy się wyjątkiem **NullReferenceException**. Typy wartościowe (`int`, `double`…) nie mogą być null, chyba że dopiszemy `?`: `int? wynik = null;`.' },
      { type: 'table', head: ['Zapis', 'Znaczenie'], rows: [
        ['x ?? y', 'x, a jeśli x jest null – y'],
        ['x?.Length', 'Length, a jeśli x jest null – null (bez wyjątku)'],
        ['x ??= y', 'przypisz y, jeśli x jest null'],
        ['int? n', 'int, który może mieć wartość null (n.HasValue, n.Value)'],
      ] },
      { type: 'tip', text: 'Garbage Collector nie oznacza, że pamięć jest nieograniczona: obiekty, do których wciąż trzymamy odwołania (np. w liście), nie zostaną usunięte.' },
    ],
    example: {
      title: 'Bezpieczna praca z null',
      description: 'Operatory ?. i ?? pozwalają uniknąć NullReferenceException.',
      code: csProg({ main: `string imie = null;
Console.WriteLine($"Imie: {imie ?? "(brak)"}");
Console.WriteLine($"Dlugosc: {imie?.Length ?? 0}");

imie ??= "Ola";
Console.WriteLine($"Teraz: {imie}, dlugosc {imie.Length}");

int? ocena = null;
Console.WriteLine($"Czy jest ocena? {ocena.HasValue}");
ocena = 5;
Console.WriteLine($"Ocena: {ocena.Value}");

try
{
    string pusty = null;
    Console.WriteLine(pusty.Length);
}
catch (NullReferenceException)
{
    Console.WriteLine("Blad: odwolanie do null!");
}` }),
    },
    tasks: [
      {
        id: 'cs06t1', title: 'Imię albo brak', difficulty: 1,
        description: 'Wczytaj linię tekstu. Jeśli jest pusta, ustaw zmienną `string imie` na `null`, w przeciwnym razie na wczytany tekst. Następnie – używając operatorów `??` oraz `?.` – wypisz:',
        expectedOutput: 'Imie: Ola\nDlugosc: 3', exampleInput: 'Ola',
        starter: CS_TEMPLATE,
        hints: ['`string imie = linia == "" ? null : linia;`', '`Console.WriteLine($"Imie: {imie ?? "brak"}");`', '`imie?.Length ?? 0` – długość albo 0 dla null.'],
        checks: [{ pattern: '\\?\\?', message: 'Użyj operatora ??.' }, { pattern: '\\?\\.', message: 'Użyj operatora ?. .' }],
        solution: csProg({ main: `string linia = Console.ReadLine();
string imie = linia == "" ? null : linia;
Console.WriteLine($"Imie: {imie ?? "brak"}");
Console.WriteLine($"Dlugosc: {imie?.Length ?? 0}");` }),
        tests: [{ input: 'Ola', expected: 'Imie: Ola\nDlugosc: 3' }, { input: '\n', expected: 'Imie: brak\nDlugosc: 0' }],
      },
    ],
  },

  // ─────────────── 7 ───────────────
  {
    id: 'cs07', title: 'Tablice', subtitle: 'tablice 1D, 2D i postrzępione', icon: 'Rows3', practice: true,
    theory: [
      { type: 'p', text: 'Tablica przechowuje wiele wartości tego samego typu. Indeksy zaczynają się od **0**, a liczbę elementów podaje właściwość `Length`. Rozmiaru tablicy nie można zmienić po utworzeniu.' },
      { type: 'code', code: `int[] oceny = new int[5];             // 5 zer
int[] liczby = { 4, 8, 15, 16, 23 };  // z wartosciami
Console.WriteLine(liczby[0]);         // 4
Console.WriteLine(liczby.Length);     // 5` },
      { type: 'h', text: 'Wczytywanie wielu liczb z jednej linii' },
      { type: 'code', code: `string[] czesci = Console.ReadLine().Split(' ');
int[] t = new int[czesci.Length];
for (int i = 0; i < t.Length; i++)
{
    t[i] = int.Parse(czesci[i]);
}` },
      { type: 'h', text: 'Tablice dwuwymiarowe' },
      { type: 'code', code: `int[,] m = new int[2, 3];          // 2 wiersze, 3 kolumny
m[1, 2] = 7;
int wiersze = m.GetLength(0), kolumny = m.GetLength(1);

int[][] postrzepiona = new int[3][];  // kazdy wiersz moze miec inna dlugosc
postrzepiona[0] = new int[] { 1, 2 };` },
      { type: 'warn', text: 'Indeks spoza zakresu `0 … Length-1` powoduje wyjątek **IndexOutOfRangeException**.' },
    ],
    example: {
      title: 'Temperatury tygodnia',
      description: 'Średnia, najcieplejszy dzień i tablica 2D z tabliczką mnożenia.',
      code: csProg({ main: `double[] temp = { 12.5, 14.0, 9.5, 11.0, 16.5, 18.0, 15.5 };
double suma = 0;
int najcieplejszy = 0;
for (int i = 0; i < temp.Length; i++)
{
    suma += temp[i];
    if (temp[i] > temp[najcieplejszy]) najcieplejszy = i;
}
Console.WriteLine($"Srednia: {suma / temp.Length:F2}");
Console.WriteLine($"Najcieplej w dniu nr {najcieplejszy + 1}: {temp[najcieplejszy]}");

int[,] tab = new int[3, 3];
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        tab[i, j] = (i + 1) * (j + 1);
        Console.Write($"{tab[i, j],4}");
    }
    Console.WriteLine();
}` }),
    },
    tasks: [
      {
        id: 'cs07t1', title: 'Statystyki tablicy', difficulty: 1,
        description: 'Wczytaj linię liczb całkowitych oddzielonych spacjami i zapisz je w tablicy. Wypisz najmniejszą, największą wartość i sumę:',
        expectedOutput: 'Min: 1\nMax: 9\nSuma: 22', exampleInput: '4 9 1 6 2',
        starter: CS_TEMPLATE,
        hints: ['`string[] p = Console.ReadLine().Split(\' \');`', 'Zainicjalizuj `min` i `max` pierwszym elementem.'],
        solution: csProg({ main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
for (int i = 0; i < p.Length; i++)
{
    t[i] = int.Parse(p[i]);
}
int min = t[0], max = t[0], suma = 0;
foreach (int x in t)
{
    if (x < min) min = x;
    if (x > max) max = x;
    suma += x;
}
Console.WriteLine($"Min: {min}");
Console.WriteLine($"Max: {max}");
Console.WriteLine($"Suma: {suma}");` }),
        tests: [{ input: '4 9 1 6 2', expected: 'Min: 1\nMax: 9\nSuma: 22' }, { input: '-7', expected: 'Min: -7\nMax: -7\nSuma: -7' }],
      },
      {
        id: 'cs07t2', title: 'Odwróć kolejność', difficulty: 1,
        description: 'Wczytaj linię liczb i wypisz je w odwrotnej kolejności (oddzielone spacjami).',
        expectedOutput: '5 4 3 2 1', exampleInput: '1 2 3 4 5', starter: CS_TEMPLATE,
        hints: ['Pętla od końca: `for (int i = t.Length - 1; i >= 0; i--)`.'],
        solution: csProg({ main: `string[] t = Console.ReadLine().Split(' ');
for (int i = t.Length - 1; i >= 0; i--)
{
    Console.Write(int.Parse(t[i]) + " ");
}
Console.WriteLine();` }),
        tests: [{ input: '1 2 3 4 5', expected: '5 4 3 2 1' }, { input: '42', expected: '42' }],
      },
      {
        id: 'cs07t3', title: 'Przekątna macierzy', difficulty: 2,
        description: 'Wczytaj `n`, a potem `n` linii po `n` liczb. Zapisz je w tablicy `int[,]` i wypisz sumę elementów głównej przekątnej:',
        expectedOutput: 'Przekatna: 15', exampleInput: '3\n1 2 3\n4 5 6\n7 8 9', starter: CS_TEMPLATE,
        hints: ['Tablica: `int[,] m = new int[n, n];`', 'Przekątna to elementy `m[i, i]`.'],
        checks: [{ pattern: 'int\\s*\\[\\s*,\\s*\\]', message: 'Użyj tablicy dwuwymiarowej int[,].' }],
        solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
int[,] m = new int[n, n];
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    for (int j = 0; j < n; j++)
    {
        m[i, j] = int.Parse(p[j]);
    }
}
int suma = 0;
for (int i = 0; i < n; i++) suma += m[i, i];
Console.WriteLine($"Przekatna: {suma}");` }),
        tests: [{ input: '3\n1 2 3\n4 5 6\n7 8 9', expected: 'Przekatna: 15' }, { input: '1\n42', expected: 'Przekatna: 42' }],
      },
    ],
  },

  // ─────────────── 8 ───────────────
  {
    id: 'cs08', title: 'Tablice jako referencje', subtitle: 'przekazywanie do metod, kopiowanie', icon: 'Link2', practice: false,
    theory: [
      { type: 'p', text: 'Tablica jest typem **referencyjnym**: zmienna przechowuje odwołanie do tablicy. Gdy przekazujemy tablicę do metody, metoda dostaje odwołanie do **tej samej** tablicy i może zmieniać jej elementy.' },
      { type: 'code', code: `static void Wyzeruj(int[] t)
{
    for (int i = 0; i < t.Length; i++) t[i] = 0;   // zmienia oryginal!
}` },
      { type: 'h', text: 'Jak skopiować tablicę?' },
      { type: 'table', head: ['Zapis', 'Efekt'], rows: [
        ['int[] b = a;', 'NIE kopiuje – b i a to ta sama tablica'],
        ['int[] b = (int[])a.Clone();', 'nowa tablica z tymi samymi wartościami'],
        ['Array.Copy(a, b, n);', 'kopiuje n elementów do istniejącej tablicy b'],
        ['Array.Resize(ref a, 10);', '„powiększa” tablicę – tworzy nową i kopiuje elementy'],
      ] },
      { type: 'tip', text: 'Metoda, która ma „podmienić” całą tablicę (np. `Array.Resize`), musi dostać ją przez `ref` – inaczej zmieniłaby tylko swoją lokalną kopię odwołania.' },
    ],
    example: {
      title: 'Odwołanie a kopia',
      description: 'Metoda modyfikuje oryginał, Clone tworzy niezależną kopię, a Array.Resize zmienia rozmiar.',
      code: csProg({ methods: `static void Podwoj(int[] t)
{
    for (int i = 0; i < t.Length; i++) t[i] *= 2;
}

static void Wypisz(string opis, int[] t)
{
    Console.WriteLine(opis + string.Join(", ", t));
}`, main: `int[] a = { 1, 2, 3 };
int[] alias = a;
int[] kopia = (int[])a.Clone();

Podwoj(a);
Wypisz("a:     ", a);
Wypisz("alias: ", alias);
Wypisz("kopia: ", kopia);

Array.Resize(ref a, 5);
Wypisz("po Resize: ", a);` }),
    },
    tasks: [
      {
        id: 'cs08t1', title: 'Metoda zmieniająca tablicę', difficulty: 1,
        description: 'Napisz metodę `static void Kwadraty(int[] t)`, która zamienia każdy element tablicy na jego kwadrat (bez tworzenia nowej tablicy). Wczytaj linię liczb, wywołaj metodę i wypisz tablicę (elementy oddzielone spacją).',
        expectedOutput: '1 4 9 16', exampleInput: '1 2 3 4',
        starter: csProg({ methods: `static void Kwadraty(int[] t)
{
    // uzupelnij
}` }),
        hints: ['W pętli: `t[i] = t[i] * t[i];`', 'Wypisanie: `Console.WriteLine(string.Join(" ", t));`'],
        checks: [{ pattern: 'static\\s+void\\s+Kwadraty\\s*\\(\\s*int\\s*\\[\\s*\\]', message: 'Zdefiniuj metodę static void Kwadraty(int[] t).' }],
        solution: csProg({ methods: `static void Kwadraty(int[] t)
{
    for (int i = 0; i < t.Length; i++)
    {
        t[i] = t[i] * t[i];
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
for (int i = 0; i < p.Length; i++) t[i] = int.Parse(p[i]);
Kwadraty(t);
Console.WriteLine(string.Join(" ", t));` }),
        tests: [{ input: '1 2 3 4', expected: '1 4 9 16' }, { input: '-3 5', expected: '9 25' }],
      },
    ],
  },

  // ─────────────── 9 ───────────────
  {
    id: 'cs09', title: 'Listy (List<T>)', subtitle: 'tablice dynamiczne', icon: 'Layers', practice: true,
    theory: [
      { type: 'p', text: '**List<T>** to „tablica, która sama rośnie” – podstawowa kolekcja w C#. W nawiasach ostrych podajemy typ elementów, np. `List<int>`, `List<string>`. Liczbę elementów podaje `Count`.' },
      { type: 'table', head: ['Operacja', 'Opis'], rows: [
        ['var l = new List<int>();', 'pusta lista'],
        ['new List<int> { 3, 1, 2 }', 'lista z wartościami'],
        ['l.Add(x) / l.Insert(i, x)', 'dodaj na koniec / na pozycję i'],
        ['l.Remove(x) / l.RemoveAt(i)', 'usuń wartość / element o indeksie'],
        ['l.Count, l[i]', 'liczba elementów, dostęp do elementu'],
        ['l.Contains(x), l.IndexOf(x)', 'czy zawiera / pozycja'],
        ['l.Sort(), l.Reverse()', 'sortowanie, odwrócenie'],
        ['l.Sum(), l.Max(), l.Average()', 'statystyki (LINQ)'],
      ] },
      { type: 'tip', text: 'Gdy nie znasz z góry liczby elementów (np. wczytujesz dane aż do zera), używaj listy zamiast tablicy.' },
    ],
    example: {
      title: 'Lista zakupów',
      description: 'Dodawanie, usuwanie, sortowanie i statystyki listy.',
      code: csProg({ usings: ['System.Collections.Generic', 'System.Linq'], main: `List<string> zakupy = new List<string> { "chleb", "mleko" };
zakupy.Add("ser");
zakupy.Insert(0, "jablka");
zakupy.Remove("mleko");
zakupy.Sort();
Console.WriteLine($"Zakupy ({zakupy.Count}): {string.Join(", ", zakupy)}");

List<int> liczby = new List<int> { 7, 3, 9 };
liczby.Add(1);
Console.WriteLine($"Suma: {liczby.Sum()}, max: {liczby.Max()}, srednia: {liczby.Average():F2}");
Console.WriteLine($"Czy jest 9? {liczby.Contains(9)}");` }),
    },
    tasks: [
      {
        id: 'cs09t1', title: 'Zbieraj aż do zera', difficulty: 1,
        description: 'Wczytuj liczby całkowite (każdą w osobnej linii) do `List<int>`, aż pojawi się `0` (zera nie dodawaj). Wypisz liczbę elementów, sumę i elementy od końca:',
        expectedOutput: 'Ilosc: 3\nSuma: 12\n7 3 2', exampleInput: '2\n3\n7\n0',
        starter: csProg({ usings: ['System.Collections.Generic'], main: `List<int> lista = new List<int>();
// Twoj kod tutaj` }),
        hints: ['Pętla: `int x = int.Parse(Console.ReadLine()); while (x != 0) { lista.Add(x); x = int.Parse(Console.ReadLine()); }`', 'Od końca: `for (int i = lista.Count - 1; i >= 0; i--)`.'],
        checks: [{ pattern: 'List\\s*<\\s*int\\s*>', message: 'Użyj listy List<int>.' }],
        solution: csProg({ usings: ['System.Collections.Generic'], main: `List<int> lista = new List<int>();
int x = int.Parse(Console.ReadLine());
while (x != 0)
{
    lista.Add(x);
    x = int.Parse(Console.ReadLine());
}
int suma = 0;
foreach (int v in lista) suma += v;
Console.WriteLine($"Ilosc: {lista.Count}");
Console.WriteLine($"Suma: {suma}");
for (int i = lista.Count - 1; i >= 0; i--)
{
    Console.Write(lista[i] + " ");
}
Console.WriteLine();` }),
        tests: [{ input: '2\n3\n7\n0', expected: 'Ilosc: 3\nSuma: 12\n7 3 2' }, { input: '5\n0', expected: 'Ilosc: 1\nSuma: 5\n5' }],
      },
      {
        id: 'cs09t2', title: 'Usuń ujemne', difficulty: 2,
        description: 'Wczytaj linię liczb do listy, usuń z niej wszystkie liczby ujemne, posortuj rosnąco i wypisz wynik (liczby oddzielone spacją).',
        expectedOutput: '0 3 5', exampleInput: '5 -2 3 -7 0', starter: csProg({ usings: ['System.Collections.Generic'] }),
        hints: ['`lista.RemoveAll(x => x < 0);` usuwa elementy spełniające warunek.', 'Potem `lista.Sort();` i `string.Join(" ", lista)`.'],
        solution: csProg({ usings: ['System.Collections.Generic'], main: `List<int> lista = new List<int>();
foreach (string s in Console.ReadLine().Split(' '))
{
    lista.Add(int.Parse(s));
}
lista.RemoveAll(x => x < 0);
lista.Sort();
Console.WriteLine(string.Join(" ", lista));` }),
        tests: [{ input: '5 -2 3 -7 0', expected: '0 3 5' }, { input: '9 8 7', expected: '7 8 9' }],
      },
    ],
  },

  // ─────────────── 10 ───────────────
  {
    id: 'cs10', title: 'Pętla foreach', subtitle: 'przechodzenie po kolekcjach', icon: 'RefreshCw', practice: true,
    theory: [
      { type: 'p', text: 'Pętla **foreach** przechodzi po wszystkich elementach tablicy, listy, napisu lub słownika – bez indeksu i bez ryzyka wyjścia poza zakres.' },
      { type: 'code', code: `int[] t = { 4, 8, 15 };
foreach (int x in t)
{
    Console.WriteLine(x);
}
foreach (char c in "kot") Console.Write(c + "-");   // k-o-t-` },
      { type: 'list', items: [
        'Zmienna pętli jest **tylko do odczytu** – nie można do niej przypisać (do zmiany elementów tablicy użyj zwykłego for).',
        'Nie wolno dodawać ani usuwać elementów listy w trakcie foreach – pojawi się wyjątek InvalidOperationException.',
        '`foreach (var x in kolekcja)` – kompilator sam ustali typ elementu.',
      ] },
    ],
    example: {
      title: 'Statystyki ocen',
      description: 'Foreach po liście ocen, po napisie i po słowniku.',
      code: csProg({ usings: ['System.Collections.Generic'], main: `List<int> oceny = new List<int> { 4, 5, 3, 6, 4 };
int suma = 0, najlepsza = 0;
foreach (int o in oceny)
{
    suma += o;
    if (o > najlepsza) najlepsza = o;
}
Console.WriteLine($"Srednia: {(double)suma / oceny.Count:F2}, najlepsza: {najlepsza}");

int samogloski = 0;
foreach (char c in "programowanie")
{
    if ("aeiouy".Contains(c)) samogloski++;
}
Console.WriteLine($"Samogloski: {samogloski}");

var stolice = new Dictionary<string, string> { { "Polska", "Warszawa" }, { "Czechy", "Praga" } };
foreach (var para in stolice)
{
    Console.WriteLine($"{para.Key} -> {para.Value}");
}` }),
    },
    tasks: [
      {
        id: 'cs10t1', title: 'Parzyste w liście', difficulty: 1,
        description: 'Wczytaj linię liczb. Używając pętli **foreach**, policz liczby parzyste i ich sumę:',
        expectedOutput: 'Parzyste: 3, suma: 12', exampleInput: '1 2 4 5 6', starter: CS_TEMPLATE,
        hints: ['`foreach (string s in Console.ReadLine().Split(\' \'))` i `int x = int.Parse(s);`'],
        checks: [{ pattern: '\\bforeach\\s*\\(', message: 'Użyj pętli foreach.' }],
        solution: csProg({ main: `int ile = 0, suma = 0;
foreach (string s in Console.ReadLine().Split(' '))
{
    int x = int.Parse(s);
    if (x % 2 == 0)
    {
        ile++;
        suma += x;
    }
}
Console.WriteLine($"Parzyste: {ile}, suma: {suma}");` }),
        tests: [{ input: '1 2 4 5 6', expected: 'Parzyste: 3, suma: 12' }, { input: '1 3 5', expected: 'Parzyste: 0, suma: 0' }],
      },
      {
        id: 'cs10t2', title: 'Najdłuższe słowo', difficulty: 2,
        description: 'Wczytaj linię słów oddzielonych spacjami. Pętlą **foreach** znajdź najdłuższe (pierwsze, jeśli kilka ma tę samą długość) i wypisz:',
        expectedOutput: 'Najdluzsze: programowanie (13)', exampleInput: 'kot programowanie dom', starter: CS_TEMPLATE,
        hints: ['Zapamiętuj najlepsze słowo: `string naj = "";`', '`if (s.Length > naj.Length) naj = s;`'],
        checks: [{ pattern: '\\bforeach\\s*\\(', message: 'Użyj pętli foreach.' }],
        solution: csProg({ main: `string naj = "";
foreach (string s in Console.ReadLine().Split(' '))
{
    if (s.Length > naj.Length) naj = s;
}
Console.WriteLine($"Najdluzsze: {naj} ({naj.Length})");` }),
        tests: [{ input: 'kot programowanie dom', expected: 'Najdluzsze: programowanie (13)' }, { input: 'ala ola ewa', expected: 'Najdluzsze: ala (3)' }],
      },
    ],
  },

  // ─────────────── 11 ───────────────
  {
    id: 'cs11', title: 'Znaki, char[] i StringBuilder', subtitle: 'odpowiednik C-napisów', icon: 'Quote', practice: false,
    theory: [
      { type: 'p', text: 'W C# typ `string` jest **niezmienny** – nie można zmienić pojedynczego znaku (`s[0] = \'X\'` to błąd). Każda „zmiana” tworzy nowy napis. Gdy trzeba zmieniać tekst znak po znaku, używamy tablicy znaków `char[]` albo klasy **StringBuilder**.' },
      { type: 'code', code: `char[] znaki = "kot".ToCharArray();
znaki[0] = 'K';
string wynik = new string(znaki);     // "Kot"
Array.Reverse(znaki);                 // t o K` },
      { type: 'h', text: 'StringBuilder' },
      { type: 'p', text: '`StringBuilder` (przestrzeń nazw `System.Text`) to „zmienny napis”: dopisywanie (`Append`) jest szybkie, bo nie tworzy za każdym razem nowego obiektu. Gotowy tekst odczytujemy metodą `ToString()`.' },
      { type: 'code', code: `var sb = new StringBuilder();
for (int i = 1; i <= 5; i++)
{
    sb.Append(i).Append(',');
}
sb.Remove(sb.Length - 1, 1);         // usun ostatni przecinek
Console.WriteLine(sb.ToString());    // 1,2,3,4,5` },
      { type: 'tip', text: 'Sklejanie napisów operatorem `+` w długiej pętli jest wolne (za każdym razem powstaje nowy napis). W takich sytuacjach używaj StringBuilder.' },
    ],
    example: {
      title: 'Odwracanie i budowanie tekstu',
      description: 'Odwrócenie słowa przez tablicę znaków oraz budowanie napisu StringBuildem.',
      code: csProg({ usings: ['System.Text'], main: `string slowo = "programowanie";
char[] t = slowo.ToCharArray();
Array.Reverse(t);
Console.WriteLine($"Od tylu: {new string(t)}");

t[0] = char.ToUpper(t[0]);
Console.WriteLine($"Z wielka litera: {new string(t)}");

StringBuilder sb = new StringBuilder("Liczby:");
for (int i = 1; i <= 5; i++)
{
    sb.Append(' ').Append(i * i);
}
sb.Insert(0, ">> ");
Console.WriteLine(sb.ToString());
Console.WriteLine($"Dlugosc: {sb.Length}");` }),
    },
    tasks: [
      {
        id: 'cs11t1', title: 'Odwróć słowo', difficulty: 1,
        description: 'Wczytaj słowo, zamień je na tablicę znaków (`ToCharArray`), odwróć metodą `Array.Reverse` i wypisz.',
        expectedOutput: 'kilots', exampleInput: 'stolik', starter: CS_TEMPLATE,
        hints: ['`char[] t = s.ToCharArray();`', '`Array.Reverse(t);` i `Console.WriteLine(new string(t));`'],
        checks: [{ pattern: 'ToCharArray', message: 'Użyj metody ToCharArray().' }],
        solution: csProg({ main: `string s = Console.ReadLine();
char[] t = s.ToCharArray();
Array.Reverse(t);
Console.WriteLine(new string(t));` }),
        tests: [{ input: 'stolik', expected: 'kilots' }, { input: 'C#', expected: '#C' }],
      },
      {
        id: 'cs11t2', title: 'Ciąg z StringBuilder', difficulty: 2,
        description: 'Wczytaj `n` i zbuduj w obiekcie **StringBuilder** napis `1-2-3-...-n`, a potem go wypisz.',
        expectedOutput: '1-2-3-4-5', exampleInput: '5', starter: csProg({ usings: ['System.Text'] }),
        hints: ['`var sb = new StringBuilder();`', 'Przed każdą liczbą poza pierwszą dopisz `-`: `if (i > 1) sb.Append(\'-\');`'],
        checks: [{ pattern: 'StringBuilder', message: 'Użyj klasy StringBuilder.' }],
        solution: csProg({ usings: ['System.Text'], main: `int n = int.Parse(Console.ReadLine());
StringBuilder sb = new StringBuilder();
for (int i = 1; i <= n; i++)
{
    if (i > 1) sb.Append('-');
    sb.Append(i);
}
Console.WriteLine(sb.ToString());` }),
        tests: [{ input: '5', expected: '1-2-3-4-5' }, { input: '1', expected: '1' }],
      },
    ],
  },
];
