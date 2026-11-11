// Szablony piaskownicy i szybkie wstawki dla C# i Pythona.
import { csProg, CS_TEMPLATE, PY_TEMPLATE } from './lang-templates.js';

export const CS_SANDBOX_TEMPLATES = [
  { id: 'empty', title: 'Pusty program', description: 'Standardowy szablon startowy', code: CS_TEMPLATE },
  {
    id: 'io', title: 'Wczytaj i wypisz', description: 'Console.ReadLine, int.Parse',
    code: csProg({ main: `Console.Write("Podaj imie: ");
string imie = Console.ReadLine();
Console.Write("Podaj ulubiona liczbe: ");
int liczba = int.Parse(Console.ReadLine());

Console.WriteLine($"{imie}, Twoja liczba razy 2 to {liczba * 2}");` }),
  },
  {
    id: 'loop', title: 'Pętla i tablica', description: 'for, tablica, suma elementów',
    code: csProg({ main: `int[] t = { 3, 7, 1, 9, 4 };
int suma = 0;

for (int i = 0; i < t.Length; i++)
{
    Console.WriteLine($"t[{i}] = {t[i]}");
    suma += t[i];
}
Console.WriteLine($"Suma: {suma}");` }),
  },
  {
    id: 'func', title: 'Metody', description: 'metoda z wynikiem i metoda void',
    code: csProg({
      methods: `static int Kwadrat(int x)
{
    return x * x;
}

static void Powitanie(string imie)
{
    Console.WriteLine($"Czesc, {imie}!");
}`,
      main: `Powitanie("Ola");
for (int i = 1; i <= 5; i++)
{
    Console.WriteLine($"{i}^2 = {Kwadrat(i)}");
}`,
    }),
  },
  {
    id: 'class', title: 'Klasa i obiekt', description: 'pola, konstruktor, metody, właściwość',
    code: csProg({
      types: `class Pies
{
    private string imie;
    public int Wiek { get; private set; }

    public Pies(string imie, int wiek)
    {
        this.imie = imie;
        Wiek = wiek;
    }

    public void Szczekaj()
    {
        Console.WriteLine($"{imie} mowi: Hau! Hau!");
    }

    public int WiekWLatachLudzkich() => Wiek * 7;
}`,
      main: `Pies burek = new Pies("Burek", 3);
burek.Szczekaj();
Console.WriteLine($"Wiek w latach ludzkich: {burek.WiekWLatachLudzkich()}");`,
    }),
  },
  {
    id: 'list', title: 'Lista i LINQ', description: 'List<int>, foreach, Where, Sum',
    code: csProg({
      usings: ['System.Collections.Generic', 'System.Linq'],
      main: `List<int> liczby = new List<int> { 5, 12, 7, 3, 20 };
liczby.Add(8);

foreach (int x in liczby)
{
    Console.Write(x + " ");
}
Console.WriteLine();

var parzyste = liczby.Where(x => x % 2 == 0).ToList();
Console.WriteLine("Parzyste: " + string.Join(", ", parzyste));
Console.WriteLine($"Suma: {liczby.Sum()}, max: {liczby.Max()}");`,
    }),
  },
];

export const CS_SNIPPETS = [
  { label: 'WriteLine', code: 'Console.WriteLine($"");' },
  { label: 'ReadLine', code: 'string s = Console.ReadLine();' },
  { label: 'int.Parse', code: 'int x = int.Parse(Console.ReadLine());' },
  { label: 'if / else', code: 'if (warunek)\n{\n    \n}\nelse\n{\n    \n}' },
  { label: 'for', code: 'for (int i = 0; i < n; i++)\n{\n    \n}' },
  { label: 'foreach', code: 'foreach (var x in kolekcja)\n{\n    \n}' },
  { label: 'while', code: 'while (warunek)\n{\n    \n}' },
  { label: 'switch', code: 'switch (x)\n{\n    case 1:\n        break;\n    default:\n        break;\n}' },
  { label: 'tablica', code: 'int[] t = { 1, 2, 3, 4, 5 };' },
  { label: 'try / catch', code: 'try\n{\n    \n}\ncatch (Exception e)\n{\n    Console.WriteLine(e.Message);\n}' },
];

export const PY_SANDBOX_TEMPLATES = [
  { id: 'empty', title: 'Pusty program', description: 'Standardowy szablon startowy', code: PY_TEMPLATE },
  {
    id: 'io', title: 'Wczytaj i wypisz', description: 'input, int, f-string',
    code: `imie = input("Podaj imie: ")
liczba = int(input("Podaj ulubiona liczbe: "))

print(f"{imie}, Twoja liczba razy 2 to {liczba * 2}")
`,
  },
  {
    id: 'loop', title: 'Pętla i lista', description: 'for, lista, suma elementów',
    code: `t = [3, 7, 1, 9, 4]
suma = 0

for i in range(len(t)):
    print(f"t[{i}] = {t[i]}")
    suma += t[i]
print("Suma:", suma)
`,
  },
  {
    id: 'func', title: 'Funkcje', description: 'funkcja z wynikiem i bez',
    code: `def kwadrat(x):
    return x * x


def powitanie(imie):
    print(f"Czesc, {imie}!")


powitanie("Ola")
for i in range(1, 6):
    print(f"{i}^2 = {kwadrat(i)}")
`,
  },
  {
    id: 'class', title: 'Klasa i obiekt', description: 'atrybuty, __init__, metody',
    code: `class Pies:
    def __init__(self, imie, wiek):
        self.imie = imie
        self.wiek = wiek

    def szczekaj(self):
        print(f"{self.imie} mowi: Hau! Hau!")

    def wiek_w_latach_ludzkich(self):
        return self.wiek * 7


burek = Pies("Burek", 3)
burek.szczekaj()
print("Wiek w latach ludzkich:", burek.wiek_w_latach_ludzkich())
`,
  },
  {
    id: 'dict', title: 'Słownik i listy składane', description: 'dict, list comprehension',
    code: `oceny = {"Ola": [5, 6, 4], "Jan": [3, 4, 4], "Ewa": [6, 5, 6]}

for imie, lista in oceny.items():
    print(f"{imie}: srednia {sum(lista) / len(lista):.2f}")

kwadraty = [x * x for x in range(1, 11) if x % 2 == 0]
print("Kwadraty parzystych:", kwadraty)
`,
  },
];

export const PY_SNIPPETS = [
  { label: 'print', code: 'print()' },
  { label: 'input', code: 'x = input()' },
  { label: 'int(input())', code: 'x = int(input())' },
  { label: 'if / else', code: 'if warunek:\n    pass\nelse:\n    pass' },
  { label: 'for', code: 'for i in range(n):\n    pass' },
  { label: 'while', code: 'while warunek:\n    pass' },
  { label: 'def', code: 'def nazwa(parametr):\n    return parametr' },
  { label: 'lista', code: 't = [1, 2, 3, 4, 5]' },
  { label: 'split', code: 'a, b = map(int, input().split())' },
  { label: 'try / except', code: 'try:\n    pass\nexcept ValueError as e:\n    print("Blad:", e)' },
];
