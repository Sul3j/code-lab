// Ściąga C# – najważniejsze pojęcia w pigułce.
export const CHEATSHEET_CS = [
  {
    id: 'basics', title: 'Budowa programu', icon: 'FileCode2',
    items: [
      {
        title: 'Po co jest using System;?',
        text: 'Klasy biblioteki .NET (Console, Math, Convert…) leżą w **przestrzeni nazw** `System`. Bez tej linijki trzeba by pisać pełne nazwy, np. `System.Console.WriteLine`. W tym środowisku każdy program zaczyna się od `using System;`. Dodatkowe przestrzenie: `System.Collections.Generic` (List, Dictionary), `System.Linq` (Where, Sum), `System.Text` (StringBuilder).',
        code: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Witaj!");
    }
}`,
      },
      { title: 'Metoda Main', text: 'Wykonanie programu zaczyna się od `static void Main(string[] args)` w klasie `Program`. Inne metody wywoływane z Main też muszą być `static` (albo należeć do obiektu).' },
      { title: 'Średniki i klamry', text: 'Każda instrukcja kończy się średnikiem `;`. Bloki kodu (ciała klas, metod, if, pętli) ujmujemy w klamry `{ }`. Po `if (...)` i `for (...)` średnika nie stawiamy.' },
      { title: 'Komentarze', text: '`// do końca linii`, `/* wiele linii */`. Skrót w edytorze: **Ctrl + /**.' },
    ],
  },
  {
    id: 'vars', title: 'Zmienne i typy', icon: 'Box',
    items: [
      {
        title: 'Typy wbudowane',
        text: '`int` (całkowite), `long` (duże całkowite), `double` (rzeczywiste), `decimal` (pieniądze, przyrostek `m`), `char` (znak w apostrofach), `string` (tekst), `bool` (true/false). `var` – typ ustala kompilator z wartości początkowej.',
        code: `int wiek = 15;
double cena = 4.99;
decimal kwota = 19.99m;
char litera = 'A';
string imie = "Ola";
bool zdal = true;
var x = 10;          // int`,
      },
      { title: 'Stałe', text: '`const double PI = 3.14159;` – wartość ustalana raz, nie da się jej zmienić.' },
      { title: 'Typy wartościowe i referencyjne', text: 'Typy **wartościowe** (`int`, `double`, `bool`, `char`, `struct`) przy przypisaniu są kopiowane. Typy **referencyjne** (`class`, tablice, `List`, `string`) – przypisanie kopiuje tylko odwołanie, obie zmienne wskazują ten sam obiekt.' },
      { title: 'null i typy nullable', text: 'Zmienna referencyjna może mieć wartość `null` (brak obiektu). Typ wartościowy można uczynić „nullowalnym”: `int? x = null;` – sprawdzamy `x.HasValue`, a operator `??` podaje wartość zastępczą: `int y = x ?? 0;`.' },
    ],
  },
  {
    id: 'ops', title: 'Operatory i warunki', icon: 'Calculator',
    items: [
      { title: 'Dzielenie całkowite', text: '`7 / 2` daje `3` (obie liczby int), `7 % 2` daje `1` (reszta). Aby dostać `3.5`: `7 / 2.0` lub `(double)a / b`.' },
      { title: 'Porównania i logika', text: '`==`, `!=`, `<`, `<=`, `>`, `>=`; logiczne: `&&` (i), `||` (lub), `!` (nie). Warunek w if musi być typu `bool` – `if (x)` dla int jest błędem.' },
      {
        title: 'switch i wyrażenie switch',
        text: 'Każda sekcja `case` musi kończyć się `break` (lub return). Nowsze **wyrażenie switch** zwraca wartość.',
        code: `string nazwa = dzien switch
{
    1 => "poniedzialek",
    2 => "wtorek",
    _ => "inny dzien"
};`,
      },
      { title: 'Operator warunkowy', text: '`string wynik = x >= 0 ? "nieujemna" : "ujemna";`' },
    ],
  },
  {
    id: 'io', title: 'Wejście i wyjście', icon: 'Keyboard',
    items: [
      {
        title: 'Wypisywanie',
        text: '`Console.WriteLine(x)` – z nową linią, `Console.Write(x)` – bez. Napis interpolowany `$"..."` wstawia wartości: `{x}`, `{x:F2}` (2 miejsca po przecinku), `{x,5}` (wyrównanie do 5 znaków).',
        code: `double sr = 4.256;
Console.WriteLine($"Srednia: {sr:F2}");   // Srednia: 4.26`,
      },
      {
        title: 'Wczytywanie',
        text: '`Console.ReadLine()` zwraca całą linię jako `string`. Liczby trzeba zamienić: `int.Parse`, `double.Parse`. Kilka liczb w jednej linii – `Split`.',
        code: `int n = int.Parse(Console.ReadLine());
string[] p = Console.ReadLine().Split(' ');
int a = int.Parse(p[0]), b = int.Parse(p[1]);`,
      },
      { title: 'Bezpieczna konwersja', text: '`int.TryParse(tekst, out int x)` zwraca `true`/`false` zamiast zgłaszać wyjątek przy błędnych danych.' },
    ],
  },
  {
    id: 'collections', title: 'Tablice i kolekcje', icon: 'Rows3',
    items: [
      { title: 'Tablice', text: '`int[] t = new int[5];` lub `int[] t = { 1, 2, 3 };`. Długość: `t.Length`. Indeksy od 0. Tablica dwuwymiarowa: `int[,] m = new int[3, 4];`, rozmiar: `m.GetLength(0)`.' },
      {
        title: 'List<T>',
        text: 'Lista o zmiennej długości (`using System.Collections.Generic;`). `Add`, `Remove`, `RemoveAt`, `Contains`, `Count`, `Sort()`.',
        code: `List<string> imiona = new List<string>();
imiona.Add("Ola");
imiona.Add("Jan");
Console.WriteLine(imiona.Count);     // 2
foreach (string s in imiona) Console.WriteLine(s);`,
      },
      { title: 'Dictionary<K, V>', text: 'Słownik klucz → wartość: `var d = new Dictionary<string, int>(); d["Ola"] = 5;`. Sprawdzenie klucza: `d.ContainsKey(k)`, bezpieczny odczyt: `d.TryGetValue(k, out int v)`.' },
      { title: 'LINQ', text: '`using System.Linq;` – `lista.Where(x => x > 0)`, `.Select(x => x * 2)`, `.Sum()`, `.Max()`, `.Average()`, `.OrderBy(x => x)`, `.Count(x => ...)`, `.ToList()`.' },
    ],
  },
  {
    id: 'oop', title: 'Programowanie obiektowe', icon: 'Boxes',
    items: [
      {
        title: 'Klasa, konstruktor, właściwość',
        text: 'Pola zwykle są `private`, a dostęp z zewnątrz dają **właściwości** (`get`/`set`) i metody `public`.',
        code: `class Konto
{
    private decimal saldo;
    public string Wlasciciel { get; }

    public Konto(string wlasciciel) { Wlasciciel = wlasciciel; }

    public decimal Saldo => saldo;
    public void Wplac(decimal k) { if (k > 0) saldo += k; }
}`,
      },
      { title: 'Dziedziczenie', text: '`class Uczen : Osoba` – klasa Uczen dziedziczy po Osoba. Konstruktor bazowy: `public Uczen(string i) : base(i) { }`.' },
      { title: 'Polimorfizm', text: 'Metoda w klasie bazowej oznaczona `virtual` może być nadpisana w pochodnej słowem `override`. Metoda `abstract` (w klasie `abstract`) **musi** zostać nadpisana.' },
      { title: 'Interfejs', text: '`interface IFigura { double Pole(); }` – sam kontrakt. Klasa może implementować wiele interfejsów: `class Kolo : Figura, IComparable<Kolo>`.' },
      { title: 'static', text: 'Składowa `static` należy do klasy, nie do obiektu: `Uczen.Liczba`, `Math.Sqrt(x)`.' },
    ],
  },
  {
    id: 'errors', title: 'Wyjątki i błędy', icon: 'Bug',
    items: [
      {
        title: 'try / catch / finally',
        text: 'Błędy wykonania zgłaszane są jako **wyjątki**. Łapiemy je w `catch` – od najbardziej szczegółowego. `finally` wykonuje się zawsze.',
        code: `try
{
    int x = int.Parse(Console.ReadLine());
    Console.WriteLine(100 / x);
}
catch (FormatException) { Console.WriteLine("To nie liczba"); }
catch (DivideByZeroException) { Console.WriteLine("Dzielenie przez 0"); }`,
      },
      { title: 'Najczęstsze wyjątki', text: '`FormatException` (zły format liczby), `DivideByZeroException`, `IndexOutOfRangeException` (indeks poza tablicą), `NullReferenceException` (użycie null), `ArgumentException` (zły argument).' },
      { title: 'Częste błędy kompilacji', text: 'Brak średnika (CS1002), użycie niezadeklarowanej zmiennej (CS0103), niejawna konwersja double → int (CS0266 – potrzebne rzutowanie `(int)x`), brak `break` w `case` (CS0163).' },
    ],
  },
];
