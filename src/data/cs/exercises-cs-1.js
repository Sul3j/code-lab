// Dodatkowe zadania C# – tematy 1–16. Każdy program zaczyna się od `using System;`.
import { csProg, CS_TEMPLATE } from '../lang-templates.js';

// uzupełnia przykładowe wejście/wyjście na podstawie pierwszego testu
export const mk = (t) => ({
  starter: CS_TEMPLATE,
  exampleInput: t.tests[0].input === '' ? undefined : t.tests[0].input,
  expectedOutput: t.tests[0].expected,
  ...t,
});

const L = ['System.Collections.Generic'];
const LQ = ['System.Collections.Generic', 'System.Linq'];

export const EX_CS_1 = {
  cs01: [
    mk({
      id: 'cs01t3', title: 'Przelicznik czasu', difficulty: 1,
      description: 'Wczytaj liczbę sekund i zamień ją na godziny, minuty i sekundy. Użyj dzielenia całkowitego `/` i reszty `%`.',
      hints: ['Godziny: `s / 3600`, minuty: `s % 3600 / 60`, sekundy: `s % 60`.'],
      solution: csProg({ main: `int s = int.Parse(Console.ReadLine());
int h = s / 3600;
int m = s % 3600 / 60;
int sek = s % 60;
Console.WriteLine($"{s} s = {h} h {m} min {sek} s");` }),
      tests: [
        { input: '3725', expected: '3725 s = 1 h 2 min 5 s' },
        { input: '59', expected: '59 s = 0 h 0 min 59 s' },
        { input: '7200', expected: '7200 s = 2 h 0 min 0 s' },
      ],
    }),
    mk({
      id: 'cs01t4', title: 'Cena z rabatem', difficulty: 1,
      description: 'Wczytaj cenę (liczba rzeczywista) i rabat w procentach (liczba całkowita) – każdą w osobnej linii. Wypisz kwotę do zapłaty z dwoma miejscami po przecinku.',
      hints: ['`double cena = double.Parse(Console.ReadLine());`', 'Kwota: `cena * (100 - rabat) / 100`, format `{kwota:F2}`.'],
      solution: csProg({ main: `double cena = double.Parse(Console.ReadLine());
int rabat = int.Parse(Console.ReadLine());
double kwota = cena * (100 - rabat) / 100;
Console.WriteLine($"Do zaplaty: {kwota:F2}");` }),
      tests: [
        { input: '95\n10', expected: 'Do zaplaty: 85.50' },
        { input: '200\n25', expected: 'Do zaplaty: 150.00' },
        { input: '19.99\n0', expected: 'Do zaplaty: 19.99' },
      ],
    }),
  ],

  cs02: [
    mk({
      id: 'cs02t3', title: 'Rok przestępny', difficulty: 2,
      description: 'Rok jest przestępny, gdy dzieli się przez 4 i nie dzieli się przez 100, albo gdy dzieli się przez 400. Wczytaj rok i wypisz `Rok przestepny` albo `Rok zwykly`.',
      hints: ['Warunek: `(r % 4 == 0 && r % 100 != 0) || r % 400 == 0`.'],
      checks: [{ pattern: '%\\s*400', message: 'Uwzględnij regułę podzielności przez 400.' }],
      solution: csProg({ main: `int r = int.Parse(Console.ReadLine());
if ((r % 4 == 0 && r % 100 != 0) || r % 400 == 0)
{
    Console.WriteLine("Rok przestepny");
}
else
{
    Console.WriteLine("Rok zwykly");
}` }),
      tests: [
        { input: '2024', expected: 'Rok przestepny' },
        { input: '1900', expected: 'Rok zwykly' },
        { input: '2000', expected: 'Rok przestepny' },
        { input: '2023', expected: 'Rok zwykly' },
      ],
    }),
    mk({
      id: 'cs02t4', title: 'Ocena z punktów', difficulty: 2,
      description: 'Wczytaj liczbę punktów (0–100) i wypisz ocenę według skali: 0–39 niedostateczny, 40–54 dopuszczajacy, 55–69 dostateczny, 70–84 dobry, 85–94 bardzo dobry, 95–100 celujacy. Dla liczby spoza zakresu wypisz `Bledne dane`.',
      hints: ['Najpierw sprawdź zakres: `if (p < 0 || p > 100)`.', 'Potem kolejne progi od najniższego: `else if (p < 40)` …'],
      solution: csProg({ main: `int p = int.Parse(Console.ReadLine());
if (p < 0 || p > 100)
{
    Console.WriteLine("Bledne dane");
}
else
{
    string ocena;
    if (p < 40) ocena = "niedostateczny";
    else if (p < 55) ocena = "dopuszczajacy";
    else if (p < 70) ocena = "dostateczny";
    else if (p < 85) ocena = "dobry";
    else if (p < 95) ocena = "bardzo dobry";
    else ocena = "celujacy";
    Console.WriteLine($"Ocena: {ocena}");
}` }),
      tests: [
        { input: '87', expected: 'Ocena: bardzo dobry' },
        { input: '39', expected: 'Ocena: niedostateczny' },
        { input: '100', expected: 'Ocena: celujacy' },
        { input: '55', expected: 'Ocena: dostateczny' },
        { input: '120', expected: 'Bledne dane' },
      ],
    }),
  ],

  cs03: [
    mk({
      id: 'cs03t3', title: 'Tabliczka mnożenia', difficulty: 1,
      description: 'Wczytaj liczbę `n` i wypisz jej tabliczkę mnożenia od 1 do 10 w formacie `n x i = wynik`.',
      hints: ['`for (int i = 1; i <= 10; i++)`'],
      checks: [{ pattern: '\\bfor\\s*\\(', message: 'Użyj pętli for.' }],
      solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
for (int i = 1; i <= 10; i++)
{
    Console.WriteLine($"{n} x {i} = {n * i}");
}` }),
      tests: [
        { input: '3', expected: '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30' },
        { input: '7', expected: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70' },
      ],
    }),
    mk({
      id: 'cs03t4', title: 'Potęga dwójki', difficulty: 2,
      description: 'Wczytaj liczbę dodatnią `n` i za pomocą pętli `while` znajdź najmniejszą potęgę dwójki, która jest większa lub równa `n`.',
      hints: ['Zacznij od `p = 1` i podwajaj, dopóki `p < n`.'],
      checks: [{ pattern: '\\bwhile\\s*\\(', message: 'Użyj pętli while.' }],
      solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
int p = 1;
while (p < n)
{
    p *= 2;
}
Console.WriteLine($"Najmniejsza potega 2 >= {n}: {p}");` }),
      tests: [
        { input: '100', expected: 'Najmniejsza potega 2 >= 100: 128' },
        { input: '1', expected: 'Najmniejsza potega 2 >= 1: 1' },
        { input: '64', expected: 'Najmniejsza potega 2 >= 64: 64' },
      ],
    }),
  ],

  cs04: [
    mk({
      id: 'cs04t3', title: 'Nazwa miesiąca', difficulty: 1,
      description: 'Typ `Miesiac` ma wartości od `Styczen = 1` do `Grudzien`. Wczytaj numer miesiąca i wypisz jego nazwę, rzutując liczbę na typ wyliczeniowy. Dla numeru spoza 1–12 wypisz `Brak miesiaca`.',
      starter: csProg({ types: `enum Miesiac
{
    Styczen = 1, Luty, Marzec, Kwiecien, Maj, Czerwiec,
    Lipiec, Sierpien, Wrzesien, Pazdziernik, Listopad, Grudzien
}` }),
      hints: ['Rzutowanie: `Miesiac m = (Miesiac)n;`', 'Wypisanie wartości enum daje jej nazwę.'],
      checks: [{ pattern: '\\(\\s*Miesiac\\s*\\)', message: 'Zamień liczbę na Miesiac przez rzutowanie (Miesiac)n.' }],
      solution: csProg({ types: `enum Miesiac
{
    Styczen = 1, Luty, Marzec, Kwiecien, Maj, Czerwiec,
    Lipiec, Sierpien, Wrzesien, Pazdziernik, Listopad, Grudzien
}`, main: `int n = int.Parse(Console.ReadLine());
if (n >= 1 && n <= 12)
{
    Miesiac m = (Miesiac)n;
    Console.WriteLine($"Miesiac: {m}");
}
else
{
    Console.WriteLine("Brak miesiaca");
}` }),
      tests: [
        { input: '3', expected: 'Miesiac: Marzec' },
        { input: '12', expected: 'Miesiac: Grudzien' },
        { input: '13', expected: 'Brak miesiaca' },
        { input: '0', expected: 'Brak miesiaca' },
      ],
    }),
    mk({
      id: 'cs04t4', title: 'Kompas', difficulty: 2,
      description: 'Robot stoi zwrócony na północ. Wczytaj linię poleceń `P` (obrót w prawo) i `L` (obrót w lewo) oddzielonych spacjami. Kierunki zapisz w typie `Kierunek { Polnoc, Wschod, Poludnie, Zachod }` i wypisz kierunek końcowy.',
      starter: csProg({ types: `enum Kierunek { Polnoc, Wschod, Poludnie, Zachod }` }),
      hints: ['Obrót w prawo: `k = (Kierunek)(((int)k + 1) % 4);`', 'Obrót w lewo to trzy obroty w prawo: `+ 3`.'],
      checks: [{ pattern: '\\(\\s*Kierunek\\s*\\)', message: 'Wyznacz nowy kierunek rzutowaniem na Kierunek.' }],
      solution: csProg({ types: `enum Kierunek { Polnoc, Wschod, Poludnie, Zachod }`, main: `Kierunek k = Kierunek.Polnoc;
string[] polecenia = Console.ReadLine().Split(' ');
foreach (string p in polecenia)
{
    if (p == "P") k = (Kierunek)(((int)k + 1) % 4);
    else if (p == "L") k = (Kierunek)(((int)k + 3) % 4);
}
Console.WriteLine($"Kierunek: {k}");` }),
      tests: [
        { input: 'P P L', expected: 'Kierunek: Wschod' },
        { input: 'L', expected: 'Kierunek: Zachod' },
        { input: 'P P P P', expected: 'Kierunek: Polnoc' },
        { input: 'L L L P P', expected: 'Kierunek: Zachod' },
      ],
    }),
  ],

  cs05: [
    mk({
      id: 'cs05t3', title: 'Dzielenie z resztą (out)', difficulty: 2,
      description: 'Napisz metodę `static void Podziel(int a, int b, out int iloraz, out int reszta)`. Wczytaj `a b` (w jednej linii) i wypisz wynik w formacie `a = b * iloraz + reszta`.',
      starter: csProg({ methods: `static void Podziel(int a, int b, out int iloraz, out int reszta)
{
    iloraz = 0;
    reszta = 0;
}` }),
      hints: ['W metodzie: `iloraz = a / b; reszta = a % b;`', 'Wywołanie: `Podziel(a, b, out int q, out int r);`'],
      checks: [{ pattern: 'out\\s+int\\s+\\w+\\s*,\\s*out\\s+int', message: 'Metoda powinna zwracać wyniki przez dwa parametry out.' }],
      solution: csProg({ methods: `static void Podziel(int a, int b, out int iloraz, out int reszta)
{
    iloraz = a / b;
    reszta = a % b;
}`, main: `string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]);
int b = int.Parse(p[1]);
Podziel(a, b, out int q, out int r);
Console.WriteLine($"{a} = {b} * {q} + {r}");` }),
      tests: [
        { input: '17 5', expected: '17 = 5 * 3 + 2' },
        { input: '20 4', expected: '20 = 4 * 5 + 0' },
        { input: '3 7', expected: '3 = 7 * 0 + 3' },
      ],
    }),
    mk({
      id: 'cs05t4', title: 'Struktura a klasa', difficulty: 2,
      description: 'Struktura `PunktS` i klasa `PunktK` mają pole `X`. Wczytaj liczbę `n`, utwórz obiekt każdego typu z `X = n`, przypisz go do drugiej zmiennej i w **kopii** ustaw `X = 0`. Wypisz `X` oryginałów – zobaczysz różnicę między typem wartościowym a referencyjnym.',
      starter: csProg({ types: `struct PunktS
{
    public int X;
}

class PunktK
{
    public int X;
}` }),
      hints: ['`PunktS s2 = s1;` kopiuje całą strukturę.', '`PunktK k2 = k1;` kopiuje tylko odwołanie – obie zmienne wskazują ten sam obiekt.'],
      checks: [{ pattern: 'PunktS\\s+\\w+\\s*=\\s*\\w+\\s*;', message: 'Skopiuj strukturę do drugiej zmiennej.' }, { pattern: 'PunktK\\s+\\w+\\s*=\\s*\\w+\\s*;', message: 'Przypisz obiekt klasy do drugiej zmiennej.' }],
      solution: csProg({ types: `struct PunktS
{
    public int X;
}

class PunktK
{
    public int X;
}`, main: `int n = int.Parse(Console.ReadLine());

PunktS s1 = new PunktS();
s1.X = n;
PunktS s2 = s1;
s2.X = 0;

PunktK k1 = new PunktK();
k1.X = n;
PunktK k2 = k1;
k2.X = 0;

Console.WriteLine($"Struktura: {s1.X}");
Console.WriteLine($"Klasa: {k1.X}");` }),
      tests: [
        { input: '5', expected: 'Struktura: 5\nKlasa: 0' },
        { input: '42', expected: 'Struktura: 42\nKlasa: 0' },
      ],
    }),
  ],

  cs06: [
    mk({
      id: 'cs06t2', title: 'Pierwsze dłuższe słowo', difficulty: 1,
      description: 'Wczytaj linię słów i liczbę `k`. Znajdź pierwsze słowo dłuższe niż `k` znaków – zmienna z wynikiem ma początkowo wartość `null`. Wypisz je albo `brak`, używając operatora `??`.',
      hints: ['`string znalezione = null;`', '`Console.WriteLine("Znaleziono: " + (znalezione ?? "brak"));`'],
      checks: [{ pattern: '\\?\\?', message: 'Użyj operatora ?? do wypisania wartości zastępczej.' }],
      solution: csProg({ main: `string[] slowa = Console.ReadLine().Split(' ');
int k = int.Parse(Console.ReadLine());
string znalezione = null;
foreach (string s in slowa)
{
    if (s.Length > k)
    {
        znalezione = s;
        break;
    }
}
Console.WriteLine("Znaleziono: " + (znalezione ?? "brak"));` }),
      tests: [
        { input: 'ala ma kota\n3', expected: 'Znaleziono: kota' },
        { input: 'ala ma kota\n5', expected: 'Znaleziono: brak' },
        { input: 'programowanie jest super\n2', expected: 'Znaleziono: programowanie' },
      ],
    }),
    mk({
      id: 'cs06t3', title: 'Oceny z nieobecnościami', difficulty: 2,
      description: 'Wczytaj `n`, a potem `n` linii – ocenę albo `-` (uczeń nieobecny). Zapisz je w tablicy `int?[]` (nieobecność = `null`). Wypisz liczbę obecnych i średnią ich ocen z dwoma miejscami po przecinku, a gdy nikt nie był obecny – `Srednia: brak`.',
      hints: ['`int?[] oceny = new int?[n];`', 'Ocena istnieje, gdy `oceny[i].HasValue`; wartość: `oceny[i].Value`.'],
      checks: [{ pattern: 'int\\?', message: 'Użyj typu int? (nullable).' }],
      solution: csProg({ main: `int n = int.Parse(Console.ReadLine());
int?[] oceny = new int?[n];
for (int i = 0; i < n; i++)
{
    string s = Console.ReadLine();
    if (s != "-") oceny[i] = int.Parse(s);
}
int obecni = 0;
int suma = 0;
foreach (int? o in oceny)
{
    if (o.HasValue)
    {
        obecni++;
        suma += o.Value;
    }
}
Console.WriteLine($"Obecni: {obecni}");
if (obecni > 0) Console.WriteLine($"Srednia: {(double)suma / obecni:F2}");
else Console.WriteLine("Srednia: brak");` }),
      tests: [
        { input: '4\n5\n-\n4\n4', expected: 'Obecni: 3\nSrednia: 4.33' },
        { input: '2\n-\n-', expected: 'Obecni: 0\nSrednia: brak' },
        { input: '1\n6', expected: 'Obecni: 1\nSrednia: 6.00' },
      ],
    }),
    mk({
      id: 'cs06t4', title: 'Lista jednokierunkowa', difficulty: 3,
      description: 'Klasa `Wezel` przechowuje liczbę i odwołanie do następnego węzła (`null` na końcu). Wczytaj linię liczb i dodawaj każdą **na początek** listy. Potem przejdź listę pętlą `while (w != null)` i wypisz elementy oraz ich sumę.',
      starter: csProg({ types: `class Wezel
{
    public int Wartosc;
    public Wezel Nastepny;

    public Wezel(int wartosc, Wezel nastepny)
    {
        Wartosc = wartosc;
        Nastepny = nastepny;
    }
}` }),
      hints: ['Dodanie na początek: `glowa = new Wezel(x, glowa);`', 'Przejście: `Wezel w = glowa; while (w != null) { ...; w = w.Nastepny; }`'],
      checks: [{ pattern: 'while\\s*\\(\\s*\\w+\\s*!=\\s*null\\s*\\)', message: 'Przejdź listę pętlą while (w != null).' }],
      solution: csProg({ types: `class Wezel
{
    public int Wartosc;
    public Wezel Nastepny;

    public Wezel(int wartosc, Wezel nastepny)
    {
        Wartosc = wartosc;
        Nastepny = nastepny;
    }
}`, main: `Wezel glowa = null;
foreach (string s in Console.ReadLine().Split(' '))
{
    glowa = new Wezel(int.Parse(s), glowa);
}
int suma = 0;
string lista = "";
Wezel w = glowa;
while (w != null)
{
    lista += w.Wartosc + " ";
    suma += w.Wartosc;
    w = w.Nastepny;
}
Console.WriteLine("Lista: " + lista.Trim());
Console.WriteLine($"Suma: {suma}");` }),
      tests: [
        { input: '1 2 3', expected: 'Lista: 3 2 1\nSuma: 6' },
        { input: '10', expected: 'Lista: 10\nSuma: 10' },
        { input: '5 -2 7 0', expected: 'Lista: 0 7 -2 5\nSuma: 10' },
      ],
    }),
  ],

  cs07: [
    mk({
      id: 'cs07t4', title: 'Większe od średniej', difficulty: 2,
      description: 'Wczytaj linię liczb całkowitych do tablicy. Wypisz ich średnią (2 miejsca po przecinku) i liczbę elementów większych od średniej.',
      hints: ['Najpierw policz sumę, potem drugą pętlą zlicz elementy większe od `srednia`.'],
      solution: csProg({ main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
int suma = 0;
for (int i = 0; i < t.Length; i++)
{
    t[i] = int.Parse(p[i]);
    suma += t[i];
}
double srednia = (double)suma / t.Length;
int wieksze = 0;
for (int i = 0; i < t.Length; i++)
{
    if (t[i] > srednia) wieksze++;
}
Console.WriteLine($"Srednia: {srednia:F2}");
Console.WriteLine($"Wieksze: {wieksze}");` }),
      tests: [
        { input: '2 8 5 9 1', expected: 'Srednia: 5.00\nWieksze: 2' },
        { input: '4 4 4', expected: 'Srednia: 4.00\nWieksze: 0' },
        { input: '1 2', expected: 'Srednia: 1.50\nWieksze: 1' },
      ],
    }),
    mk({
      id: 'cs07t5', title: 'Sumy wierszy macierzy', difficulty: 2,
      description: 'Pierwsza linia zawiera liczbę wierszy `w` i kolumn `k`, kolejne `w` linii – elementy macierzy. Zapisz je w tablicy `int[,]`, wypisz sumę każdego wiersza i sumę wszystkich elementów.',
      hints: ['`int[,] m = new int[w, k];`', 'Suma wiersza `i`: pętla po `j` od 0 do `k - 1`.'],
      checks: [{ pattern: 'int\\s*\\[\\s*,\\s*\\]', message: 'Użyj tablicy dwuwymiarowej int[,].' }],
      solution: csProg({ main: `string[] wk = Console.ReadLine().Split(' ');
int w = int.Parse(wk[0]);
int k = int.Parse(wk[1]);
int[,] m = new int[w, k];
for (int i = 0; i < w; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    for (int j = 0; j < k; j++) m[i, j] = int.Parse(p[j]);
}
int razem = 0;
for (int i = 0; i < w; i++)
{
    int s = 0;
    for (int j = 0; j < k; j++) s += m[i, j];
    Console.WriteLine($"Wiersz {i + 1}: {s}");
    razem += s;
}
Console.WriteLine($"Suma: {razem}");` }),
      tests: [
        { input: '2 3\n1 2 3\n4 5 6', expected: 'Wiersz 1: 6\nWiersz 2: 15\nSuma: 21' },
        { input: '3 1\n5\n-2\n7', expected: 'Wiersz 1: 5\nWiersz 2: -2\nWiersz 3: 7\nSuma: 10' },
      ],
    }),
  ],

  cs08: [
    mk({
      id: 'cs08t2', title: 'Kopia tablicy', difficulty: 2,
      description: 'Wczytaj linię liczb do tablicy. Utwórz **kopię** tablicy (`Array.Copy`), posortuj tylko kopię (`Array.Sort`) i wypisz obie tablice. Oryginał ma pozostać bez zmian.',
      hints: ['`int[] kopia = new int[t.Length]; Array.Copy(t, kopia, t.Length);`', 'Samo `int[] kopia = t;` nie tworzy kopii – to ta sama tablica!'],
      checks: [{ pattern: 'Array\\.Copy', message: 'Skopiuj tablicę metodą Array.Copy.' }, { pattern: 'Array\\.Sort', message: 'Posortuj kopię metodą Array.Sort.' }],
      solution: csProg({ main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
for (int i = 0; i < p.Length; i++) t[i] = int.Parse(p[i]);

int[] kopia = new int[t.Length];
Array.Copy(t, kopia, t.Length);
Array.Sort(kopia);

Console.WriteLine("Oryginal: " + string.Join(" ", t));
Console.WriteLine("Posortowana: " + string.Join(" ", kopia));` }),
      tests: [
        { input: '5 3 8', expected: 'Oryginal: 5 3 8\nPosortowana: 3 5 8' },
        { input: '9 -1 4 0', expected: 'Oryginal: 9 -1 4 0\nPosortowana: -1 0 4 9' },
      ],
    }),
    mk({
      id: 'cs08t3', title: 'Metoda podwajająca', difficulty: 1,
      description: 'Uzupełnij metodę `static void Podwoj(int[] t)`, która podwaja każdy element tablicy **w miejscu** (nic nie zwraca). Wczytaj liczby, wypisz tablicę przed i po wywołaniu metody.',
      starter: csProg({ methods: `static void Podwoj(int[] t)
{
    // uzupelnij
}` }),
      hints: ['Tablica jest typem referencyjnym – metoda zmienia tę samą tablicę, którą ma Main.'],
      checks: [{ pattern: 'static\\s+void\\s+Podwoj\\s*\\(\\s*int\\s*\\[\\s*\\]', message: 'Metoda Podwoj(int[] t) powinna być typu void.' }],
      solution: csProg({ methods: `static void Podwoj(int[] t)
{
    for (int i = 0; i < t.Length; i++)
    {
        t[i] *= 2;
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
for (int i = 0; i < p.Length; i++) t[i] = int.Parse(p[i]);
Console.WriteLine("Przed: " + string.Join(" ", t));
Podwoj(t);
Console.WriteLine("Po: " + string.Join(" ", t));` }),
      tests: [
        { input: '1 2 3', expected: 'Przed: 1 2 3\nPo: 2 4 6' },
        { input: '-5 0 7', expected: 'Przed: -5 0 7\nPo: -10 0 14' },
      ],
    }),
    mk({
      id: 'cs08t4', title: 'Zeruj ujemne', difficulty: 2,
      description: 'Napisz metodę `static int ZerujUjemne(int[] t)`, która zamienia elementy ujemne na 0 i **zwraca** liczbę zmian. Wczytaj liczby, wywołaj metodę i wypisz:',
      hints: ['Metoda i zmienia tablicę (referencja), i zwraca wynik przez `return`.'],
      checks: [{ pattern: 'static\\s+int\\s+ZerujUjemne\\s*\\(\\s*int\\s*\\[\\s*\\]', message: 'Utwórz metodę static int ZerujUjemne(int[] t).' }],
      solution: csProg({ methods: `static int ZerujUjemne(int[] t)
{
    int zmiany = 0;
    for (int i = 0; i < t.Length; i++)
    {
        if (t[i] < 0)
        {
            t[i] = 0;
            zmiany++;
        }
    }
    return zmiany;
}`, main: `string[] p = Console.ReadLine().Split(' ');
int[] t = new int[p.Length];
for (int i = 0; i < p.Length; i++) t[i] = int.Parse(p[i]);
int ile = ZerujUjemne(t);
Console.WriteLine($"Zmieniono: {ile}");
Console.WriteLine("Tablica: " + string.Join(" ", t));` }),
      tests: [
        { input: '3 -1 5 -8', expected: 'Zmieniono: 2\nTablica: 3 0 5 0' },
        { input: '1 2', expected: 'Zmieniono: 0\nTablica: 1 2' },
      ],
    }),
  ],

  cs09: [
    mk({
      id: 'cs09t3', title: 'Bez duplikatów', difficulty: 1,
      description: 'Wczytaj linię liczb i zbuduj listę `List<int>` bez powtórzeń, zachowując kolejność pierwszych wystąpień.',
      starter: csProg({ usings: L }),
      hints: ['Dodawaj tylko, gdy `!wynik.Contains(x)`.'],
      checks: [{ pattern: '\\.Contains\\s*\\(', message: 'Sprawdzaj metodą Contains, czy liczba już jest na liście.' }],
      solution: csProg({ usings: L, main: `List<int> wynik = new List<int>();
foreach (string s in Console.ReadLine().Split(' '))
{
    int x = int.Parse(s);
    if (!wynik.Contains(x)) wynik.Add(x);
}
Console.WriteLine(string.Join(" ", wynik));` }),
      tests: [
        { input: '1 5 1 2 5', expected: '1 5 2' },
        { input: '7 7 7', expected: '7' },
        { input: '3 1 2', expected: '3 1 2' },
      ],
    }),
    mk({
      id: 'cs09t4', title: 'Wstawianie z zachowaniem porządku', difficulty: 2,
      description: 'Wczytaj linię liczb. Każdą liczbę wstaw do listy metodą `Insert` w takie miejsce, aby lista była cały czas uporządkowana rosnąco (bez używania `Sort`). Wypisz listę.',
      starter: csProg({ usings: L }),
      hints: ['Szukaj pozycji: `int i = 0; while (i < lista.Count && lista[i] < x) i++;`', 'Potem `lista.Insert(i, x);`'],
      checks: [{ pattern: '\\.Insert\\s*\\(', message: 'Użyj metody Insert.' }],
      solution: csProg({ usings: L, main: `List<int> lista = new List<int>();
foreach (string s in Console.ReadLine().Split(' '))
{
    int x = int.Parse(s);
    int i = 0;
    while (i < lista.Count && lista[i] < x) i++;
    lista.Insert(i, x);
}
Console.WriteLine("Lista: " + string.Join(" ", lista));` }),
      tests: [
        { input: '4 1 7 3', expected: 'Lista: 1 3 4 7' },
        { input: '5 5 -2', expected: 'Lista: -2 5 5' },
      ],
    }),
  ],

  cs10: [
    mk({
      id: 'cs10t3', title: 'Liczba wystąpień słowa', difficulty: 1,
      description: 'Wczytaj linię słów, a w drugiej linii szukane słowo. Pętlą `foreach` policz, ile razy występuje.',
      hints: ['`foreach (string s in slowa) if (s == szukane) ile++;`'],
      checks: [{ pattern: '\\bforeach\\s*\\(', message: 'Użyj pętli foreach.' }],
      solution: csProg({ main: `string[] slowa = Console.ReadLine().Split(' ');
string szukane = Console.ReadLine();
int ile = 0;
foreach (string s in slowa)
{
    if (s == szukane) ile++;
}
Console.WriteLine($"Wystapienia: {ile}");` }),
      tests: [
        { input: 'kot pies kot ryba kot\nkot', expected: 'Wystapienia: 3' },
        { input: 'ala ma kota\npies', expected: 'Wystapienia: 0' },
      ],
    }),
    mk({
      id: 'cs10t4', title: 'Dodatnie i ujemne', difficulty: 2,
      description: 'Wczytaj linię liczb całkowitych. Pętlą `foreach` policz liczby dodatnie i ujemne oraz ich sumy (zera pomijamy). Wypisz:',
      hints: ['Cztery zmienne: licznik i suma dla dodatnich oraz dla ujemnych.'],
      checks: [{ pattern: '\\bforeach\\s*\\(', message: 'Użyj pętli foreach.' }],
      solution: csProg({ main: `int ileD = 0, sumaD = 0, ileU = 0, sumaU = 0;
foreach (string s in Console.ReadLine().Split(' '))
{
    int x = int.Parse(s);
    if (x > 0) { ileD++; sumaD += x; }
    else if (x < 0) { ileU++; sumaU += x; }
}
Console.WriteLine($"Dodatnie: {ileD} (suma {sumaD})");
Console.WriteLine($"Ujemne: {ileU} (suma {sumaU})");` }),
      tests: [
        { input: '3 -2 0 4 -3 5', expected: 'Dodatnie: 3 (suma 12)\nUjemne: 2 (suma -5)' },
        { input: '0 0 1', expected: 'Dodatnie: 1 (suma 1)\nUjemne: 0 (suma 0)' },
      ],
    }),
  ],

  cs11: [
    mk({
      id: 'cs11t3', title: 'Spacje na podkreślenia', difficulty: 1,
      description: 'Wczytaj linię tekstu, zamień ją na tablicę znaków (`ToCharArray`), w pętli zamień każdą spację na `_` i wypisz wynik utworzony konstruktorem `new string(tablica)`.',
      hints: ['`char[] z = s.ToCharArray();`', 'Porównanie znaku: `z[i] == \' \'`.'],
      checks: [{ pattern: 'ToCharArray', message: 'Użyj metody ToCharArray.' }, { pattern: 'new\\s+string\\s*\\(', message: 'Zbuduj wynik przez new string(...).' }],
      solution: csProg({ main: `string s = Console.ReadLine();
char[] z = s.ToCharArray();
for (int i = 0; i < z.Length; i++)
{
    if (z[i] == ' ') z[i] = '_';
}
Console.WriteLine(new string(z));` }),
      tests: [
        { input: 'ala ma kota', expected: 'ala_ma_kota' },
        { input: 'bez_spacji', expected: 'bez_spacji' },
      ],
    }),
    mk({
      id: 'cs11t4', title: 'Kompresja RLE', difficulty: 3,
      description: 'Kompresja RLE zapisuje ciąg powtarzających się znaków jako znak i liczbę powtórzeń, np. `aaabbc` → `a3b2c1`. Wczytaj słowo i zbuduj wynik za pomocą `StringBuilder`.',
      starter: csProg({ usings: ['System.Text'] }),
      hints: ['Licz powtórzenia bieżącego znaku; gdy następny znak jest inny (lub to koniec), dopisz `znak` i `licznik`.'],
      checks: [{ pattern: 'StringBuilder', message: 'Zbuduj wynik za pomocą StringBuilder.' }],
      solution: csProg({ usings: ['System.Text'], main: `string s = Console.ReadLine();
StringBuilder sb = new StringBuilder();
int licznik = 1;
for (int i = 1; i <= s.Length; i++)
{
    if (i < s.Length && s[i] == s[i - 1])
    {
        licznik++;
    }
    else
    {
        sb.Append(s[i - 1]);
        sb.Append(licznik);
        licznik = 1;
    }
}
Console.WriteLine(sb.ToString());` }),
      tests: [
        { input: 'aaabbc', expected: 'a3b2c1' },
        { input: 'x', expected: 'x1' },
        { input: 'zzzzzyy', expected: 'z5y2' },
      ],
    }),
  ],

  cs12: [
    mk({
      id: 'cs12t3', title: 'Inicjały', difficulty: 1,
      description: 'Wczytaj imiona i nazwisko (małymi literami, oddzielone spacjami) i wypisz inicjały – wielkie litery zakończone kropkami.',
      hints: ['Pierwsza litera słowa: `s[0]`, wielka litera: `char.ToUpper(s[0])`.'],
      solution: csProg({ main: `string[] slowa = Console.ReadLine().Split(' ');
string wynik = "";
foreach (string s in slowa)
{
    wynik += char.ToUpper(s[0]) + ".";
}
Console.WriteLine(wynik);` }),
      tests: [
        { input: 'jan maria kowalski', expected: 'J.M.K.' },
        { input: 'ola nowak', expected: 'O.N.' },
      ],
    }),
    mk({
      id: 'cs12t4', title: 'Zamiana słowa', difficulty: 2,
      description: 'Wczytaj zdanie, słowo do zastąpienia i nowe słowo (3 linie). Zamień tylko **całe słowa** (np. `kot` nie zmienia się w `kotek`). Wypisz liczbę zamian i nowe zdanie.',
      hints: ['Podziel zdanie `Split(\' \')`, porównuj całe słowa, a potem złącz `string.Join(" ", slowa)`.'],
      solution: csProg({ main: `string[] slowa = Console.ReadLine().Split(' ');
string stare = Console.ReadLine();
string nowe = Console.ReadLine();
int zamiany = 0;
for (int i = 0; i < slowa.Length; i++)
{
    if (slowa[i] == stare)
    {
        slowa[i] = nowe;
        zamiany++;
    }
}
Console.WriteLine($"Zamiany: {zamiany}");
Console.WriteLine(string.Join(" ", slowa));` }),
      tests: [
        { input: 'kot lubi mleko i kot spi\nkot\npies', expected: 'Zamiany: 2\npies lubi mleko i pies spi' },
        { input: 'kotek i kot\nkot\nlis', expected: 'Zamiany: 1\nkotek i lis' },
      ],
    }),
  ],

  cs13: [
    mk({
      id: 'cs13t2', title: 'Skracanie ułamka', difficulty: 2,
      description: 'Struktura `Ulamek` ma pola `L` (licznik) i `M` (mianownik) oraz metodę `Skroc()`, która dzieli oba przez ich NWD. Wczytaj `l m` i wypisz skrócony ułamek w postaci `L/M`.',
      hints: ['NWD: `while (b != 0) { int t = a % b; a = b; b = t; }`', 'Metoda struktury może zmieniać jej pola.'],
      checks: [{ pattern: 'struct\\s+Ulamek', message: 'Zdefiniuj strukturę Ulamek.' }],
      solution: csProg({ types: `struct Ulamek
{
    public int L;
    public int M;

    public Ulamek(int l, int m)
    {
        L = l;
        M = m;
    }

    public void Skroc()
    {
        int a = L, b = M;
        while (b != 0)
        {
            int t = a % b;
            a = b;
            b = t;
        }
        L /= a;
        M /= a;
    }
}`, main: `string[] p = Console.ReadLine().Split(' ');
Ulamek u = new Ulamek(int.Parse(p[0]), int.Parse(p[1]));
u.Skroc();
Console.WriteLine($"{u.L}/{u.M}");` }),
      tests: [
        { input: '6 8', expected: '3/4' },
        { input: '10 5', expected: '2/1' },
        { input: '7 3', expected: '7/3' },
      ],
    }),
    mk({
      id: 'cs13t3', title: 'Najstarszy uczeń', difficulty: 2,
      description: 'Struktura `Uczen` ma pola `Imie` i `Wiek`. Wczytaj `n` i `n` linii `imie wiek` do tablicy struktur, a potem wypisz najstarszego ucznia (przy równym wieku – pierwszego).',
      hints: ['`Uczen[] t = new Uczen[n];`', 'Pamiętaj indeks najstarszego i porównuj `t[i].Wiek > t[naj].Wiek`.'],
      checks: [{ pattern: 'struct\\s+Uczen', message: 'Zdefiniuj strukturę Uczen.' }],
      solution: csProg({ types: `struct Uczen
{
    public string Imie;
    public int Wiek;
}`, main: `int n = int.Parse(Console.ReadLine());
Uczen[] t = new Uczen[n];
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    t[i].Imie = p[0];
    t[i].Wiek = int.Parse(p[1]);
}
int naj = 0;
for (int i = 1; i < n; i++)
{
    if (t[i].Wiek > t[naj].Wiek) naj = i;
}
Console.WriteLine($"Najstarszy: {t[naj].Imie} ({t[naj].Wiek})");` }),
      tests: [
        { input: '3\nOla 15\nJan 17\nEwa 16', expected: 'Najstarszy: Jan (17)' },
        { input: '2\nAdam 14\nZosia 14', expected: 'Najstarszy: Adam (14)' },
      ],
    }),
    mk({
      id: 'cs13t4', title: 'Punkt w prostokącie', difficulty: 2,
      description: 'Struktura `Punkt` ma pola `X`, `Y`, a struktura `Prostokat` – lewy dolny róg `A`, prawy górny róg `B` i metodę `bool Zawiera(Punkt p)` (brzeg też się liczy). Pierwsza linia: `x1 y1 x2 y2`, druga: `px py`. Wypisz `Punkt w prostokacie: Tak` lub `Nie`.',
      hints: ['Punkt jest w środku, gdy `A.X <= p.X && p.X <= B.X` oraz to samo dla Y.'],
      checks: [{ pattern: 'bool\\s+Zawiera\\s*\\(\\s*Punkt', message: 'Dodaj metodę bool Zawiera(Punkt p).' }],
      solution: csProg({ types: `struct Punkt
{
    public int X;
    public int Y;

    public Punkt(int x, int y)
    {
        X = x;
        Y = y;
    }
}

struct Prostokat
{
    public Punkt A;
    public Punkt B;

    public bool Zawiera(Punkt p)
    {
        return A.X <= p.X && p.X <= B.X && A.Y <= p.Y && p.Y <= B.Y;
    }
}`, main: `string[] r = Console.ReadLine().Split(' ');
string[] q = Console.ReadLine().Split(' ');
Prostokat pr = new Prostokat();
pr.A = new Punkt(int.Parse(r[0]), int.Parse(r[1]));
pr.B = new Punkt(int.Parse(r[2]), int.Parse(r[3]));
Punkt p = new Punkt(int.Parse(q[0]), int.Parse(q[1]));
Console.WriteLine("Punkt w prostokacie: " + (pr.Zawiera(p) ? "Tak" : "Nie"));` }),
      tests: [
        { input: '0 0 4 3\n2 1', expected: 'Punkt w prostokacie: Tak' },
        { input: '0 0 4 3\n5 1', expected: 'Punkt w prostokacie: Nie' },
        { input: '-2 -2 2 2\n2 -2', expected: 'Punkt w prostokacie: Tak' },
      ],
    }),
  ],

  cs14: [
    mk({
      id: 'cs14t2', title: 'Iloraz i reszta (krotka)', difficulty: 1,
      description: 'Napisz metodę `static (int iloraz, int reszta) Podziel(int a, int b)` zwracającą krotkę. Wczytaj `a b` i wypisz wynik:',
      hints: ['Zwrócenie krotki: `return (a / b, a % b);`', 'Odczyt: `var w = Podziel(a, b); w.iloraz, w.reszta`.'],
      checks: [{ pattern: '\\(\\s*int\\s+iloraz\\s*,\\s*int\\s+reszta\\s*\\)', message: 'Metoda powinna zwracać krotkę (int iloraz, int reszta).' }],
      solution: csProg({ methods: `static (int iloraz, int reszta) Podziel(int a, int b)
{
    return (a / b, a % b);
}`, main: `string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]);
int b = int.Parse(p[1]);
var w = Podziel(a, b);
Console.WriteLine($"{a} / {b} = {w.iloraz} reszta {w.reszta}");` }),
      tests: [
        { input: '17 5', expected: '17 / 5 = 3 reszta 2' },
        { input: '9 3', expected: '9 / 3 = 3 reszta 0' },
      ],
    }),
    mk({
      id: 'cs14t3', title: 'Najbliższy punkt', difficulty: 2,
      description: 'Wczytaj `n` i `n` linii `x y`. Zapisz punkty w liście krotek `List<(int x, int y)>` i wypisz punkt najbliższy początkowi układu współrzędnych (0, 0).',
      starter: csProg({ usings: L }),
      hints: ['Porównuj kwadrat odległości: `x * x + y * y`.', 'Element listy krotek: `punkty[i].x`.'],
      checks: [{ pattern: 'List\\s*<\\s*\\(\\s*int', message: 'Przechowuj punkty w liście krotek List<(int x, int y)>.' }],
      solution: csProg({ usings: L, main: `int n = int.Parse(Console.ReadLine());
List<(int x, int y)> punkty = new List<(int x, int y)>();
for (int i = 0; i < n; i++)
{
    string[] p = Console.ReadLine().Split(' ');
    punkty.Add((int.Parse(p[0]), int.Parse(p[1])));
}
var naj = punkty[0];
foreach (var p in punkty)
{
    if (p.x * p.x + p.y * p.y < naj.x * naj.x + naj.y * naj.y) naj = p;
}
Console.WriteLine($"Najblizszy: ({naj.x}, {naj.y})");` }),
      tests: [
        { input: '3\n3 4\n1 2\n-5 0', expected: 'Najblizszy: (1, 2)' },
        { input: '2\n10 10\n-3 -1', expected: 'Najblizszy: (-3, -1)' },
      ],
    }),
    mk({
      id: 'cs14t4', title: 'Zamiana przez dekonstrukcję', difficulty: 1,
      description: 'Wczytaj `a b` i zamień wartości zmiennych **jedną instrukcją** z krotką: `(a, b) = (b, a);`. Wypisz:',
      hints: ['Dekonstrukcja krotki przypisuje obie wartości naraz – nie potrzeba zmiennej pomocniczej.'],
      checks: [{ pattern: '\\(\\s*a\\s*,\\s*b\\s*\\)\\s*=\\s*\\(\\s*b\\s*,\\s*a\\s*\\)', message: 'Zamień wartości instrukcją (a, b) = (b, a);' }],
      solution: csProg({ main: `string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]);
int b = int.Parse(p[1]);
(a, b) = (b, a);
Console.WriteLine($"a = {a}, b = {b}");` }),
      tests: [
        { input: '3 5', expected: 'a = 5, b = 3' },
        { input: '-1 8', expected: 'a = 8, b = -1' },
      ],
    }),
  ],

  cs15: [
    mk({
      id: 'cs15t3', title: 'Liczby doskonałe', difficulty: 2,
      description: 'Liczba doskonała jest równa sumie swoich dzielników mniejszych od niej (np. 6 = 1 + 2 + 3). Napisz metodę `static bool CzyDoskonala(int n)`. Wczytaj `n` i wypisz wszystkie liczby doskonałe od 1 do `n` albo `brak`.',
      hints: ['Suma dzielników: pętla `d` od 1 do `n - 1`, `if (n % d == 0) suma += d;`', 'Liczba 1 nie jest doskonała (suma jej dzielników to 0).'],
      checks: [{ pattern: 'static\\s+bool\\s+CzyDoskonala', message: 'Utwórz metodę static bool CzyDoskonala(int n).' }],
      solution: csProg({ methods: `static bool CzyDoskonala(int n)
{
    int suma = 0;
    for (int d = 1; d < n; d++)
    {
        if (n % d == 0) suma += d;
    }
    return n > 1 && suma == n;
}`, main: `int n = int.Parse(Console.ReadLine());
string wynik = "";
for (int i = 1; i <= n; i++)
{
    if (CzyDoskonala(i)) wynik += i + " ";
}
Console.WriteLine($"Doskonale do {n}: " + (wynik == "" ? "brak" : wynik.Trim()));` }),
      tests: [
        { input: '30', expected: 'Doskonale do 30: 6 28' },
        { input: '5', expected: 'Doskonale do 5: brak' },
        { input: '500', expected: 'Doskonale do 500: 6 28 496' },
      ],
    }),
    mk({
      id: 'cs15t4', title: 'Symbol Newtona', difficulty: 2,
      description: 'Napisz metody `static long Silnia(int n)` oraz `static long Newton(int n, int k)` = n! / (k! · (n − k)!). Wczytaj `n k` i wypisz:',
      hints: ['Typ `long` mieści większe liczby niż `int` (20! wymaga long).'],
      checks: [{ pattern: 'static\\s+long\\s+Silnia', message: 'Utwórz metodę static long Silnia(int n).' }],
      solution: csProg({ methods: `static long Silnia(int n)
{
    long w = 1;
    for (int i = 2; i <= n; i++) w *= i;
    return w;
}

static long Newton(int n, int k)
{
    return Silnia(n) / (Silnia(k) * Silnia(n - k));
}`, main: `string[] p = Console.ReadLine().Split(' ');
int n = int.Parse(p[0]);
int k = int.Parse(p[1]);
Console.WriteLine($"C({n}, {k}) = {Newton(n, k)}");` }),
      tests: [
        { input: '5 2', expected: 'C(5, 2) = 10' },
        { input: '10 3', expected: 'C(10, 3) = 120' },
        { input: '6 0', expected: 'C(6, 0) = 1' },
      ],
    }),
  ],

  cs16: [
    mk({
      id: 'cs16t3', title: 'Odwracanie napisu rekurencyjnie', difficulty: 2,
      description: 'Napisz **rekurencyjną** metodę `static string Odwroc(string s)`: napis krótszy niż 2 znaki zwraca bez zmian, a w przeciwnym razie zwraca `Odwroc(reszta) + pierwszy znak`. Wczytaj słowo i wypisz je odwrócone.',
      hints: ['Reszta napisu: `s.Substring(1)`, pierwszy znak: `s[0]`.'],
      checks: [{ pattern: 'static\\s+string\\s+Odwroc[\\s\\S]*\\{[\\s\\S]*Odwroc\\s*\\(', message: 'Metoda Odwroc powinna wywoływać samą siebie.' }],
      solution: csProg({ methods: `static string Odwroc(string s)
{
    if (s.Length < 2) return s;
    return Odwroc(s.Substring(1)) + s[0];
}`, main: `string s = Console.ReadLine();
Console.WriteLine(Odwroc(s));` }),
      tests: [
        { input: 'python', expected: 'nohtyp' },
        { input: 'abc', expected: 'cba' },
        { input: 'x', expected: 'x' },
      ],
    }),
    mk({
      id: 'cs16t4', title: 'Wieże Hanoi', difficulty: 3,
      description: 'Przenieś `n` krążków z pręta A na pręt C (pomocniczy: B). Napisz rekurencyjną metodę `Hanoi(int n, char z, char na, char pom)`, która wypisuje ruchy w postaci `A -> C`, a na końcu wypisz liczbę ruchów.',
      hints: ['Aby przenieść n krążków: przenieś n−1 na pręt pomocniczy, przenieś największy, przenieś n−1 na docelowy.', 'Liczbę ruchów zliczaj w polu `static int ruchy`.'],
      checks: [{ pattern: 'Hanoi\\s*\\([^)]*\\)[\\s\\S]*\\{[\\s\\S]*Hanoi\\s*\\(', message: 'Metoda Hanoi powinna być rekurencyjna.' }],
      solution: csProg({ methods: `static int ruchy = 0;

static void Hanoi(int n, char z, char na, char pom)
{
    if (n == 0) return;
    Hanoi(n - 1, z, pom, na);
    Console.WriteLine($"{z} -> {na}");
    ruchy++;
    Hanoi(n - 1, pom, na, z);
}`, main: `int n = int.Parse(Console.ReadLine());
Hanoi(n, 'A', 'C', 'B');
Console.WriteLine($"Ruchow: {ruchy}");` }),
      tests: [
        { input: '1', expected: 'A -> C\nRuchow: 1' },
        { input: '2', expected: 'A -> B\nA -> C\nB -> C\nRuchow: 3' },
        { input: '3', expected: 'A -> C\nA -> B\nC -> B\nA -> C\nB -> A\nB -> C\nA -> C\nRuchow: 7' },
      ],
    }),
  ],
};

export { LQ };
