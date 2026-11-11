// Ściąga Python – najważniejsze pojęcia w pigułce.
export const CHEATSHEET_PY = [
  {
    id: 'basics', title: 'Budowa programu', icon: 'FileCode2',
    items: [
      {
        title: 'Wcięcia zamiast klamer',
        text: 'Python wyznacza bloki kodu **wcięciami** (4 spacje). Po `if`, `for`, `while`, `def`, `class` stawiamy dwukropek `:`, a treść bloku wcinamy. Pomieszanie wcięć daje `IndentationError`.',
        code: `for i in range(3):
    if i % 2 == 0:
        print(i, "parzysta")
    else:
        print(i, "nieparzysta")
print("koniec")   # poza petla`,
      },
      { title: 'Bez średników i bez main', text: 'Każda instrukcja to osobna linia – średnika nie trzeba. Program wykonuje się od góry do dołu; nie ma obowiązkowej funkcji main.' },
      { title: 'Komentarze', text: '`# komentarz do końca linii`. Skrót w edytorze: **Ctrl + /**. Napis w potrójnych cudzysłowach `"""..."""` na początku funkcji to jej opis (docstring).' },
      { title: 'import', text: 'Moduły dołączamy przez `import math` (potem `math.sqrt(2)`) albo `from math import sqrt`.' },
    ],
  },
  {
    id: 'vars', title: 'Zmienne i typy', icon: 'Box',
    items: [
      {
        title: 'Typy wbudowane',
        text: 'Typ zmiennej wynika z wartości (typowanie dynamiczne): `int`, `float`, `str`, `bool` (`True`/`False`), `None` (brak wartości). Typ sprawdza `type(x)`.',
        code: `wiek = 15          # int
cena = 4.99        # float
imie = "Ola"       # str
zdal = True        # bool
nic = None`,
      },
      { title: 'Konwersje', text: '`int("12")`, `float("3.5")`, `str(42)`, `bool(0)` → False. Błędny napis w `int()` zgłasza `ValueError`.' },
      { title: 'Zmienne jako etykiety', text: 'Zmienna to **nazwa wskazująca obiekt**. `b = a` dla listy nie kopiuje jej – obie nazwy wskazują tę samą listę. Kopia: `b = a.copy()` lub `b = a[:]`. `is` sprawdza, czy to ten sam obiekt, `==` – czy równe wartości.' },
    ],
  },
  {
    id: 'ops', title: 'Operatory i warunki', icon: 'Calculator',
    items: [
      { title: 'Dzielenie', text: '`7 / 2` daje `3.5` (zawsze float), `7 // 2` daje `3` (dzielenie całkowite), `7 % 2` daje `1`, `2 ** 10` daje `1024`.' },
      { title: 'Logika', text: '`and`, `or`, `not`. Porównania można łączyć: `0 <= x < 10`. Przynależność: `"a" in "kot"`, `5 in lista`.' },
      {
        title: 'if / elif / else i match',
        text: 'Wielokrotny wybór: `elif`. Od Pythona 3.10 istnieje też `match`.',
        code: `match dzien:
    case 1:
        print("poniedzialek")
    case 6 | 7:
        print("weekend")
    case _:
        print("inny dzien")`,
      },
      { title: 'Wyrażenie warunkowe', text: '`wynik = "nieujemna" if x >= 0 else "ujemna"`' },
    ],
  },
  {
    id: 'io', title: 'Wejście i wyjście', icon: 'Keyboard',
    items: [
      {
        title: 'print',
        text: '`print(a, b)` wypisuje wartości oddzielone spacją. Parametry: `sep=", "` (separator), `end=""` (bez nowej linii). **f-string** wstawia wartości: `f"{x}"`, `f"{x:.2f}"` (2 miejsca), `f"{x:5}"` (szerokość 5).',
        code: `sr = 4.256
print(f"Srednia: {sr:.2f}")     # Srednia: 4.26
print(1, 2, 3, sep="-")         # 1-2-3`,
      },
      {
        title: 'input',
        text: '`input()` zwraca całą linię jako `str`. Liczby trzeba zamienić. Kilka liczb w jednej linii – `split()` i `map`.',
        code: `n = int(input())
a, b = map(int, input().split())
liczby = list(map(int, input().split()))`,
      },
    ],
  },
  {
    id: 'collections', title: 'Listy i kolekcje', icon: 'Rows3',
    items: [
      {
        title: 'Lista',
        text: '`t = [1, 2, 3]`; `t.append(x)`, `t.insert(i, x)`, `t.remove(x)`, `t.pop()`, `len(t)`, `sorted(t)`, `sum(t)`, `max(t)`. Indeks `-1` to ostatni element. Wycinki: `t[1:3]`, `t[::-1]` (odwrócona).',
        code: `t = [5, 2, 8]
t.append(1)
t.sort()
print(t, t[0], t[-1])   # [1, 2, 5, 8] 1 8`,
      },
      { title: 'Lista składana', text: '`[x * x for x in range(10) if x % 2 == 0]` – krótki sposób tworzenia list.' },
      { title: 'Słownik', text: '`d = {"Ola": 5}`; `d["Jan"] = 4`; `d.get(k, 0)` – wartość lub domyślna; `for k, v in d.items():`.' },
      { title: 'Krotka i zbiór', text: 'Krotka `(1, 2)` – niezmienna lista. Zbiór `{1, 2, 3}` – bez powtórzeń, szybkie `in`; `set(lista)` usuwa duplikaty.' },
    ],
  },
  {
    id: 'oop', title: 'Programowanie obiektowe', icon: 'Boxes',
    items: [
      {
        title: 'Klasa i self',
        text: 'Konstruktor to `__init__`. Pierwszy parametr metod, `self`, to bieżący obiekt.',
        code: `class Konto:
    def __init__(self, wlasciciel):
        self.wlasciciel = wlasciciel
        self._saldo = 0          # "prywatne" (konwencja)

    @property
    def saldo(self):             # tylko do odczytu
        return self._saldo

    def wplac(self, k):
        if k > 0:
            self._saldo += k`,
      },
      { title: 'Dziedziczenie', text: '`class Uczen(Osoba):` – w konstruktorze `super().__init__(imie)`. Każda metoda może zostać nadpisana (wszystkie są „wirtualne”).' },
      { title: 'Klasy abstrakcyjne', text: '`from abc import ABC, abstractmethod` – klasa dziedzicząca po `ABC` z metodą `@abstractmethod` nie pozwala tworzyć obiektów, dopóki pochodna nie zaimplementuje metody.' },
      { title: 'Metody specjalne', text: '`__str__` (print), `__eq__` (==), `__lt__` (<), `__add__` (+), `__len__` (len). Dzięki nim obiekty działają z operatorami.' },
    ],
  },
  {
    id: 'errors', title: 'Wyjątki i błędy', icon: 'Bug',
    items: [
      {
        title: 'try / except / finally',
        text: 'Błędy wykonania to **wyjątki**. `except Typ` łapie wybrany rodzaj, `else` wykonuje się, gdy błędu nie było, `finally` – zawsze. Własny błąd: `raise ValueError("opis")`.',
        code: `try:
    x = int(input())
    print(100 / x)
except ValueError:
    print("To nie liczba")
except ZeroDivisionError:
    print("Dzielenie przez 0")`,
      },
      { title: 'Najczęstsze wyjątki', text: '`ValueError` (zła wartość, np. `int("abc")`), `ZeroDivisionError`, `IndexError` (indeks poza listą), `KeyError` (brak klucza w słowniku), `TypeError` (zły typ, np. `"a" + 1`), `NameError` (nieznana nazwa), `AttributeError`.' },
      { title: 'Błędy składni', text: '`SyntaxError` – np. brak dwukropka po `if`; `IndentationError` – złe wcięcie. Program z błędem składni w ogóle się nie uruchamia.' },
    ],
  },
];
