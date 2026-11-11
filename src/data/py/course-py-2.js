// Kurs Pythona – tematy 12–22.
import { PY_TEMPLATE } from '../lang-templates.js';

export const py2 = [
  // ─────────────── 12 ───────────────
  {
    id: 'py12', title: 'Napisy (str)', subtitle: 'metody napisów, wycinki, formatowanie', icon: 'Type', practice: false,
    theory: [
      { type: 'p', text: 'Napis (`str`) to niezmienna sekwencja znaków. Działają na nim indeksy, wycinki, `len()` i pętla for. Metody zawsze zwracają **nowy** napis.' },
      { type: 'table', head: ['Operacja', 'Przykład', 'Wynik'], rows: [
        ['len(s)', 'len("kajak")', '5'],
        ['s.upper() / s.lower()', '"Ala".upper()', '"ALA"'],
        ['s[1:4]', '"kajak"[1:4]', '"aja"'],
        ['s.find(t)', '"kajak".find("ja")', '2 (lub -1)'],
        ['t in s', '"aj" in "kajak"', 'True'],
        ['s.replace(a, b)', '"ala".replace("a", "o")', '"olo"'],
        ['s.split()', '"a b  c".split()', "['a', 'b', 'c']"],
        ['s.strip()', '"  x ".strip()', '"x"'],
        ['sep.join(lista)', '"-".join(["1", "2"])', '"1-2"'],
        ['s.count(t)', '"banan".count("a")', '2'],
      ] },
      { type: 'code', run: true, code: `s = "Programowanie"
print(s[0], s[-1], s[::-1])
print(s.lower().count("a"))
print(s.startswith("Pro"), s.endswith("nie"))` },
    ],
    example: {
      title: 'Analiza zdania',
      description: 'Długość, zamiana liter, wyszukiwanie, podział na słowa i odwrócenie.',
      code: `zdanie = "Ala ma kota"
print("Dlugosc:", len(zdanie))
print("Wielkimi:", zdanie.upper())
print("Pozycja 'kot':", zdanie.find("kot"))

slowa = zdanie.split()
print("Liczba slow:", len(slowa), "ostatnie:", slowa[-1])
print("Od tylu:", zdanie[::-1])
print(" | ".join(slowa))
print("Tytul:", zdanie.title())
`,
    },
    tasks: [
      {
        id: 'py12t1', title: 'Czy to palindrom?', difficulty: 1,
        description: 'Napisz funkcję `czy_palindrom(s)` zwracającą `True` lub `False`. Wczytaj słowo i wypisz `TAK` albo `NIE`. Wielkość liter ma znaczenie.',
        expectedOutput: 'TAK', exampleInput: 'kajak',
        starter: `def czy_palindrom(s):
    # uzupelnij
    return False

# Twój kod tutaj
`,
        hints: ['Najprościej: `return s == s[::-1]`.'],
        checks: [{ pattern: 'def\\s+czy_palindrom\\s*\\(', message: 'Zdefiniuj funkcję czy_palindrom(s).' }],
        solution: `def czy_palindrom(s):
    return s == s[::-1]

slowo = input()
print("TAK" if czy_palindrom(slowo) else "NIE")
`,
        tests: [{ input: 'kajak', expected: 'TAK' }, { input: 'kot', expected: 'NIE' }, { input: 'Kajak', expected: 'NIE' }],
      },
      {
        id: 'py12t2', title: 'Licznik samogłosek', difficulty: 1,
        description: 'Wczytaj linię tekstu i policz samogłoski `a e i o u y` (małe i wielkie):',
        expectedOutput: 'Samogloski: 5', exampleInput: 'Ala ma kota', starter: PY_TEMPLATE,
        hints: ['`for c in tekst.lower():` i warunek `c in "aeiouy"`.'],
        solution: `tekst = input().lower()
ile = 0
for c in tekst:
    if c in "aeiouy":
        ile += 1
print(f"Samogloski: {ile}")
`,
        tests: [{ input: 'Ala ma kota', expected: 'Samogloski: 5' }, { input: 'Python jest super', expected: 'Samogloski: 5' }],
      },
    ],
  },

  // ─────────────── 13 ───────────────
  {
    id: 'py13', title: 'Słowniki i struktury danych', subtitle: 'dict – pary klucz : wartość', icon: 'Package', practice: false,
    theory: [
      { type: 'p', text: 'W Pythonie zamiast struktur (struct) dane grupujemy w **słownikach** (`dict`) albo klasach. Słownik przechowuje pary **klucz → wartość** i pozwala szybko odszukać wartość po kluczu.' },
      { type: 'code', run: true, code: `uczen = {"imie": "Ola", "klasa": 2, "srednia": 4.75}
print(uczen["imie"])
uczen["srednia"] = 5.0          # zmiana
uczen["wiek"] = 15              # dodanie nowej pary
print(uczen.get("adres", "brak"))   # bez bledu, gdy klucza nie ma
for klucz, wartosc in uczen.items():
    print(klucz, "=", wartosc)` },
      { type: 'table', head: ['Operacja', 'Opis'], rows: [
        ['d[k]', 'wartość dla klucza (KeyError, gdy brak)'], ['d.get(k, domyslna)', 'wartość albo wartość domyślna'],
        ['k in d', 'czy klucz istnieje'], ['del d[k] / d.pop(k)', 'usuń parę'], ['d.keys(), d.values(), d.items()', 'klucze, wartości, pary'],
      ] },
      { type: 'tip', text: 'Klasyczne zastosowanie: zliczanie – `licznik[slowo] = licznik.get(slowo, 0) + 1`.' },
    ],
    example: {
      title: 'Dziennik i liczenie słów',
      description: 'Lista słowników jako „tablica struktur” oraz słownik do zliczania słów.',
      code: `klasa = [
    {"imie": "Ala", "srednia": 4.5},
    {"imie": "Kuba", "srednia": 3.8},
    {"imie": "Ola", "srednia": 5.1},
]
najlepszy = max(klasa, key=lambda u: u["srednia"])
for u in klasa:
    print(f"{u['imie']}: {u['srednia']}")
print("Najlepsza srednia:", najlepszy["imie"])

tekst = "ala ma kota a kot ma ale"
licznik = {}
for slowo in tekst.split():
    licznik[slowo] = licznik.get(slowo, 0) + 1
print(licznik)
print("Ile razy 'ma':", licznik["ma"])
`,
    },
    tasks: [
      {
        id: 'py13t1', title: 'Najczęstsze słowo', difficulty: 2,
        description: 'Wczytaj linię słów. Policz wystąpienia w słowniku i wypisz najczęstsze słowo oraz liczbę jego wystąpień (przy remisie – to, które pojawiło się wcześniej):',
        expectedOutput: 'ma: 3', exampleInput: 'ala ma kota ala ma psa ma', starter: PY_TEMPLATE,
        hints: ['`licznik[s] = licznik.get(s, 0) + 1`', 'Słownik pamięta kolejność dodawania – przejdź po `licznik.items()` i zapamiętaj największą wartość (porównanie `>`).'],
        checks: [{ pattern: '\\{\\s*\\}|dict\\s*\\(', message: 'Użyj słownika do zliczania.' }],
        solution: `licznik = {}
for s in input().split():
    licznik[s] = licznik.get(s, 0) + 1
najslowo = ""
naj = 0
for slowo, ile in licznik.items():
    if ile > naj:
        najslowo = slowo
        naj = ile
print(f"{najslowo}: {naj}")
`,
        tests: [{ input: 'ala ma kota ala ma psa ma', expected: 'ma: 3' }, { input: 'jeden', expected: 'jeden: 1' }],
      },
    ],
  },

  // ─────────────── 14 ───────────────
  {
    id: 'py14', title: 'Krotki (tuple)', subtitle: 'niezmienne sekwencje, rozpakowywanie', icon: 'Combine', practice: false,
    theory: [
      { type: 'p', text: '**Krotka** (`tuple`) to niezmienna sekwencja – jak lista, której nie da się zmienić. Zapisujemy ją w nawiasach okrągłych. Krotki służą do grupowania kilku wartości i zwracania kilku wyników z funkcji.' },
      { type: 'code', run: true, code: `punkt = (3, 4)
x, y = punkt                     # rozpakowanie
print(x, y)

def min_max(t):
    return min(t), max(t)        # zwraca krotke

mn, mx = min_max([4, 8, 1])
print(mn, mx)

a, b = 1, 2
a, b = b, a                      # zamiana przez krotke
print(a, b)` },
      { type: 'list', items: [
        'Krotka jednoelementowa wymaga przecinka: `(5,)`.',
        'Krotki mogą być kluczami słownika (listy – nie).',
        'Próba zmiany elementu (`punkt[0] = 1`) kończy się TypeError.',
      ] },
    ],
    example: {
      title: 'Krotki w praktyce',
      description: 'Funkcja zwracająca krotkę, rozpakowywanie i krotki jako klucze.',
      code: `def statystyki(t):
    return sum(t), sum(t) / len(t)

suma, srednia = statystyki([4, 8, 15, 16, 23, 42])
print(f"Suma: {suma}, srednia: {srednia:.2f}")

uczen = ("Ola", 15, 5.0)
imie, wiek, ocena = uczen
print(imie, "ma", wiek, "lat")

odleglosci = {("Warszawa", "Krakow"): 293, ("Gdansk", "Poznan"): 300}
print(odleglosci[("Warszawa", "Krakow")], "km")

try:
    uczen[0] = "Jan"
except TypeError:
    print("Krotki nie mozna zmienic!")
`,
    },
    tasks: [
      {
        id: 'py14t1', title: 'Min i max jako krotka', difficulty: 1,
        description: 'Napisz funkcję `min_max(t)` zwracającą krotkę `(min, max)` bez używania wbudowanych `min` i `max`. Wczytaj linię liczb, rozpakuj wynik i wypisz:',
        expectedOutput: 'Min: 1, Max: 9', exampleInput: '4 9 1 6',
        starter: `def min_max(t):
    # uzupelnij – zwroc krotke (mn, mx)
    return (0, 0)

# Twój kod tutaj
`,
        hints: ['Zacznij od `mn = mx = t[0]` i przejdź pętlą.', '`return mn, mx` i `mn, mx = min_max(t)`.'],
        checks: [{ pattern: 'def\\s+min_max\\s*\\(', message: 'Zdefiniuj funkcję min_max(t).' }, { pattern: '^(?![\\s\\S]*\\b(min|max)\\s*\\()', message: 'Nie używaj wbudowanych funkcji min i max.' }],
        solution: `def min_max(t):
    mn = mx = t[0]
    for x in t:
        if x < mn:
            mn = x
        if x > mx:
            mx = x
    return mn, mx

t = list(map(int, input().split()))
mn, mx = min_max(t)
print(f"Min: {mn}, Max: {mx}")
`,
        tests: [{ input: '4 9 1 6', expected: 'Min: 1, Max: 9' }, { input: '-3', expected: 'Min: -3, Max: -3' }],
      },
    ],
  },

  // ─────────────── 15 ───────────────
  {
    id: 'py15', title: 'Funkcje', subtitle: 'def, return, argumenty, zasięg', icon: 'FunctionSquare', practice: false,
    theory: [
      { type: 'p', text: 'Funkcję definiujemy słowem **def**. Instrukcja `return` zwraca wynik; funkcja bez `return` zwraca `None`. Funkcję trzeba zdefiniować, zanim zostanie wywołana.' },
      { type: 'code', run: true, code: `def kwadrat(x):
    return x * x

def linia(n, znak="-"):          # argument z wartoscia domyslna
    print(znak * n)

print(kwadrat(5))
linia(10)
linia(5, "*")
linia(znak="=", n=3)             # argumenty nazwane` },
      { type: 'h', text: 'Zasięg zmiennych' },
      { type: 'p', text: 'Zmienne utworzone w funkcji są **lokalne**. Aby zmienić zmienną globalną wewnątrz funkcji, trzeba ją zadeklarować słowem `global` (lepiej jednak przekazywać dane przez argumenty i `return`).' },
      { type: 'tip', text: 'Pierwsza linia funkcji w potrójnym cudzysłowie to **docstring** – opis funkcji widoczny w `help(nazwa)`.' },
    ],
    example: {
      title: 'Funkcje pomocnicze',
      description: 'Funkcja zwracająca wynik, funkcja z argumentem domyślnym i docstring.',
      code: `def czy_pierwsza(n):
    """Zwraca True, jesli n jest liczba pierwsza."""
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

def ramka(tekst, znak="*"):
    linia = znak * (len(tekst) + 4)
    print(linia)
    print(f"{znak} {tekst} {znak}")
    print(linia)

ramka("Liczby pierwsze")
print(*[i for i in range(1, 21) if czy_pierwsza(i)])
ramka("Koniec", "#")
`,
    },
    tasks: [
      {
        id: 'py15t1', title: 'Własna potęga', difficulty: 1,
        description: 'Napisz funkcję `potega(a, b)` liczącą pętlą `a` do potęgi `b` (bez operatora `**`). Wczytaj `a` i `b` (osobne linie) i wypisz:',
        expectedOutput: '2^10 = 1024', exampleInput: '2\n10',
        starter: `def potega(a, b):
    # uzupelnij
    return 1

a = int(input())
b = int(input())
print(f"{a}^{b} = {potega(a, b)}")
`,
        hints: ['`wynik = 1` i pętla `for _ in range(b): wynik *= a`.'],
        checks: [{ pattern: 'def\\s+potega\\s*\\(', message: 'Zdefiniuj funkcję potega(a, b).' }, { pattern: '^(?![\\s\\S]*\\*\\*)', message: 'Nie używaj operatora **.' }],
        solution: `def potega(a, b):
    wynik = 1
    for _ in range(b):
        wynik *= a
    return wynik

a = int(input())
b = int(input())
print(f"{a}^{b} = {potega(a, b)}")
`,
        tests: [{ input: '2\n10', expected: '2^10 = 1024' }, { input: '5\n0', expected: '5^0 = 1' }],
      },
      {
        id: 'py15t2', title: 'Liczby pierwsze', difficulty: 2,
        description: 'Napisz funkcję `czy_pierwsza(n)`. Wczytaj `n` (n ≥ 2) i wypisz w jednej linii liczby pierwsze od 2 do `n`.',
        expectedOutput: '2 3 5 7', exampleInput: '10',
        starter: `def czy_pierwsza(n):
    # uzupelnij
    return False

# Twój kod tutaj
`,
        hints: ['Sprawdzaj dzielniki `d`, dopóki `d * d <= n`.'],
        checks: [{ pattern: 'def\\s+czy_pierwsza\\s*\\(', message: 'Zdefiniuj funkcję czy_pierwsza(n).' }],
        solution: `def czy_pierwsza(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

n = int(input())
pierwsze = [i for i in range(2, n + 1) if czy_pierwsza(i)]
print(*pierwsze)
`,
        tests: [{ input: '10', expected: '2 3 5 7' }, { input: '20', expected: '2 3 5 7 11 13 17 19' }],
      },
    ],
  },

  // ─────────────── 16 ───────────────
  {
    id: 'py16', title: 'Funkcje rekurencyjne', subtitle: 'warunek stopu, silnia, Fibonacci', icon: 'Infinity', practice: false,
    theory: [
      { type: 'p', text: 'Funkcja **rekurencyjna** wywołuje samą siebie dla mniejszego problemu. Musi mieć **warunek stopu**. Python ogranicza głębokość rekurencji (domyślnie ok. 1000 wywołań) – przekroczenie kończy się RecursionError.' },
      { type: 'code', run: true, code: `def silnia(n):
    if n <= 1:          # warunek stopu
        return 1
    return n * silnia(n - 1)

print(silnia(10))` },
      { type: 'table', head: ['Problem', 'Zapis rekurencyjny'], rows: [
        ['silnia', 'n! = n · (n−1)!, 0! = 1'], ['Fibonacci', 'F(n) = F(n−1) + F(n−2)'], ['NWD', 'nwd(a, b) = nwd(b, a % b), nwd(a, 0) = a'], ['suma cyfr', 's(n) = n % 10 + s(n // 10)'],
      ] },
    ],
    example: {
      title: 'Klasyki rekurencji',
      description: 'Silnia, Fibonacci, NWD i odwracanie napisu.',
      code: `def silnia(n):
    return 1 if n <= 1 else n * silnia(n - 1)

def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

def nwd(a, b):
    return a if b == 0 else nwd(b, a % b)

def odwroc(s):
    if len(s) <= 1:
        return s
    return odwroc(s[1:]) + s[0]

print("10! =", silnia(10))
print(*[fib(i) for i in range(11)])
print("NWD(48, 36) =", nwd(48, 36))
print(odwroc("rekurencja"))
`,
    },
    tasks: [
      {
        id: 'py16t1', title: 'Fibonacci rekurencyjnie', difficulty: 1,
        description: 'Napisz **rekurencyjną** funkcję `fib(n)`. Wczytaj `n` (0–25) i wypisz:',
        expectedOutput: 'fib(10) = 55', exampleInput: '10',
        starter: `def fib(n):
    # uzupelnij rekurencyjnie
    return 0

n = int(input())
print(f"fib({n}) = {fib(n)}")
`,
        hints: ['`if n < 2: return n`', '`return fib(n - 1) + fib(n - 2)`'],
        checks: [{ pattern: 'fib\\s*\\(\\s*n\\s*-\\s*1\\s*\\)', message: 'Funkcja fib powinna wywoływać samą siebie.' }],
        solution: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

n = int(input())
print(f"fib({n}) = {fib(n)}")
`,
        tests: [{ input: '10', expected: 'fib(10) = 55' }, { input: '0', expected: 'fib(0) = 0' }, { input: '20', expected: 'fib(20) = 6765' }],
      },
      {
        id: 'py16t2', title: 'Suma cyfr rekurencyjnie', difficulty: 2,
        description: 'Napisz **rekurencyjną** funkcję `suma_cyfr(n)` (bez pętli). Wczytaj nieujemną liczbę i wypisz:',
        expectedOutput: 'Suma cyfr: 6', exampleInput: '123',
        starter: `def suma_cyfr(n):
    # uzupelnij rekurencyjnie
    return 0

n = int(input())
print(f"Suma cyfr: {suma_cyfr(n)}")
`,
        hints: ['Warunek stopu: `if n < 10: return n`.', 'Krok: `return n % 10 + suma_cyfr(n // 10)`.'],
        checks: [{ pattern: 'suma_cyfr\\s*\\(\\s*n\\s*//\\s*10\\s*\\)', message: 'Wywołaj funkcję rekurencyjnie: suma_cyfr(n // 10).' }, { pattern: '^(?![\\s\\S]*\\b(for|while)\\b)', message: 'Nie używaj pętli.' }],
        solution: `def suma_cyfr(n):
    if n < 10:
        return n
    return n % 10 + suma_cyfr(n // 10)

n = int(input())
print(f"Suma cyfr: {suma_cyfr(n)}")
`,
        tests: [{ input: '123', expected: 'Suma cyfr: 6' }, { input: '0', expected: 'Suma cyfr: 0' }, { input: '99999', expected: 'Suma cyfr: 45' }],
      },
    ],
  },

  // ─────────────── 17 ───────────────
  {
    id: 'py17', title: 'Argumenty domyślne i *args', subtitle: 'zamiast przeciążania funkcji', icon: 'Copy', practice: false,
    theory: [
      { type: 'p', text: 'Python **nie ma przeciążania funkcji** – druga definicja o tej samej nazwie zastępuje pierwszą. Ten sam efekt osiąga się inaczej: **argumentami domyślnymi**, zmienną liczbą argumentów `*args` / `**kwargs` albo sprawdzaniem typu (`isinstance`).' },
      { type: 'code', run: true, code: `def pole(a, b=None):
    if b is None:
        return a * a          # kwadrat
    return a * b              # prostokat

def suma(*liczby):            # dowolna liczba argumentow -> krotka
    return sum(liczby)

def opis(**dane):             # argumenty nazwane -> slownik
    for k, v in dane.items():
        print(k, "=", v)

print(pole(3), pole(2, 5), suma(1, 2, 3, 4))
opis(imie="Ola", wiek=15)` },
      { type: 'tip', text: 'Gwiazdka „rozpakowuje” też listę przy wywołaniu: `suma(*[1, 2, 3])` to to samo co `suma(1, 2, 3)`.' },
    ],
    example: {
      title: 'Jedna funkcja – wiele zastosowań',
      description: 'Argumenty domyślne, *args i sprawdzanie typu zastępują przeciążanie.',
      code: `def opisz(x):
    if isinstance(x, int):
        print("liczba calkowita:", x)
    elif isinstance(x, float):
        print("liczba rzeczywista:", x)
    elif isinstance(x, str):
        print("tekst:", x)

def maks(*liczby):
    wynik = liczby[0]
    for x in liczby:
        if x > wynik:
            wynik = x
    return wynik

def linia(n=10, znak="-"):
    print(znak * n)

opisz(42)
opisz(3.14)
opisz("Python")
print(maks(3, 8), maks(4, 9, 2, 7))
linia()
linia(5, "*")
`,
    },
    tasks: [
      {
        id: 'py17t1', title: 'Pole figur', difficulty: 2,
        description: 'Napisz **jedną** funkcję `pole(*wymiary)`: dla 1 argumentu liczy pole koła (`math.pi`), dla 2 – prostokąta, dla 3 – trapezu `(a + b) * h / 2`. Wczytaj linię liczb (1–3 wartości) i wypisz wynik z 2 miejscami po przecinku:',
        expectedOutput: 'Pole: 12.00', exampleInput: '3 4',
        starter: `import math

def pole(*wymiary):
    # uzupelnij
    return 0
`,
        hints: ['`len(wymiary)` mówi, ile podano argumentów.', 'Wywołanie z listy: `pole(*liczby)`.'],
        checks: [{ pattern: 'def\\s+pole\\s*\\(\\s*\\*', message: 'Funkcja powinna przyjmować *wymiary.' }],
        solution: `import math

def pole(*wymiary):
    if len(wymiary) == 1:
        return math.pi * wymiary[0] ** 2
    if len(wymiary) == 2:
        return wymiary[0] * wymiary[1]
    a, b, h = wymiary
    return (a + b) * h / 2

liczby = list(map(float, input().split()))
print(f"Pole: {pole(*liczby):.2f}")
`,
        tests: [{ input: '3 4', expected: 'Pole: 12.00' }, { input: '2', expected: 'Pole: 12.57' }, { input: '2 4 3', expected: 'Pole: 9.00' }],
      },
    ],
  },

  // ─────────────── 18 ───────────────
  {
    id: 'py18', title: 'Funkcje lambda', subtitle: 'lambda, map, filter, sorted', icon: 'Zap', practice: false,
    theory: [
      { type: 'p', text: '**Lambda** to krótka, anonimowa funkcja zapisana w jednej linii: `lambda argumenty: wyrażenie`. Najczęściej przekazuje się ją jako argument do innych funkcji.' },
      { type: 'code', run: true, code: `kwadrat = lambda x: x * x
print(kwadrat(5))

liczby = [5, 2, 8, 1]
print(list(map(lambda x: x * 10, liczby)))          # [50, 20, 80, 10]
print(list(filter(lambda x: x % 2 == 0, liczby)))   # [2, 8]
slowa = ["kot", "programowanie", "dom"]
print(sorted(slowa, key=lambda s: len(s)))           # sortowanie po dlugosci
print(max(slowa, key=len))` },
      { type: 'tip', text: 'Często czytelniejsze od `map`/`filter` są wyrażenia listowe: `[x * 10 for x in liczby]`, `[x for x in liczby if x % 2 == 0]`.' },
    ],
    example: {
      title: 'Funkcje jako wartości',
      description: 'Funkcje przekazywane do innych funkcji, lambda w sortowaniu i filtrowaniu.',
      code: `def zastosuj(t, f):
    return [f(x) for x in t]

print(zastosuj([1, 2, 3, 4], lambda x: x ** 2))

uczniowie = [("Ola", 5.2), ("Jan", 4.1), ("Ewa", 4.9)]
po_sredniej = sorted(uczniowie, key=lambda u: u[1], reverse=True)
for imie, sr in po_sredniej:
    print(imie, sr)

dlugie = list(filter(lambda s: len(s) > 3, ["Ola", "Bartek", "Ewa", "Kamila"]))
print(dlugie)
`,
    },
    tasks: [
      {
        id: 'py18t1', title: 'Sortowanie po długości', difficulty: 2,
        description: 'Wczytaj linię słów i wypisz je posortowane według długości (rosnąco), a przy równej długości – alfabetycznie. Użyj `sorted` z argumentem `key` i lambdą.',
        expectedOutput: 'ala dom kot programowanie', exampleInput: 'programowanie kot dom ala', starter: PY_TEMPLATE,
        hints: ['Klucz może być krotką: `key=lambda s: (len(s), s)`.'],
        checks: [{ pattern: 'lambda', message: 'Użyj wyrażenia lambda.' }],
        solution: `slowa = input().split()
wynik = sorted(slowa, key=lambda s: (len(s), s))
print(*wynik)
`,
        tests: [{ input: 'programowanie kot dom ala', expected: 'ala dom kot programowanie' }, { input: 'bb a ccc', expected: 'a bb ccc' }],
      },
    ],
  },

  // ─────────────── 19 ───────────────
  {
    id: 'py19', title: 'Moduł math', subtitle: 'funkcje matematyczne', icon: 'Sigma', practice: false,
    theory: [
      { type: 'p', text: 'Funkcje matematyczne znajdują się w module **math** (`import math`). Część operacji jest wbudowana: `abs`, `round`, `min`, `max`, `sum`, `pow`.' },
      { type: 'table', head: ['Funkcja', 'Działanie', 'Przykład'], rows: [
        ['math.sqrt(x)', 'pierwiastek', 'math.sqrt(16) → 4.0'],
        ['x ** y / pow(x, y)', 'potęga', '2 ** 10 → 1024'],
        ['abs(x)', 'wartość bezwzględna', 'abs(-5) → 5'],
        ['round(x, n)', 'zaokrąglenie (połówki do parzystej!)', 'round(2.5) → 2'],
        ['math.floor / math.ceil', 'w dół / w górę (zwraca int)', 'math.floor(2.7) → 2'],
        ['math.sin, cos, tan', 'trygonometria (radiany)', 'math.sin(math.pi / 2) → 1.0'],
        ['math.pi, math.e', 'stałe', '3.14159…'],
        ['math.gcd(a, b)', 'największy wspólny dzielnik', 'math.gcd(12, 18) → 6'],
        ['math.hypot(a, b)', 'przeciwprostokątna', 'math.hypot(3, 4) → 5.0'],
      ] },
      { type: 'warn', text: '`round(2.5)` daje **2**, a `round(3.5)` daje **4** (zaokrąglanie do parzystej). Liczby float są przybliżone: `0.1 + 0.2 == 0.3` to `False` – porównuj przez `math.isclose(a, b)`.' },
    ],
    example: {
      title: 'Kalkulator naukowy',
      description: 'Równanie kwadratowe, trygonometria, zaokrąglenia i pułapka porównań float.',
      code: `import math

a, b, c = 1, -3, 2
delta = b * b - 4 * a * c
x1 = (-b - math.sqrt(delta)) / (2 * a)
x2 = (-b + math.sqrt(delta)) / (2 * a)
print("x1 =", x1, "x2 =", x2)

print("2^10 =", 2 ** 10)
print(f"sin(30 st.) = {math.sin(math.radians(30)):.4f}")
print("round(2.5) =", round(2.5), "round(3.5) =", round(3.5))
print("floor(-2.7) =", math.floor(-2.7), "ceil(-2.7) =", math.ceil(-2.7))
print("NWD(48, 36) =", math.gcd(48, 36))
print("0.1 + 0.2 == 0.3 ?", 0.1 + 0.2 == 0.3, "| isclose:", math.isclose(0.1 + 0.2, 0.3))
`,
    },
    tasks: [
      {
        id: 'py19t1', title: 'Przeciwprostokątna', difficulty: 1,
        description: 'Wczytaj przyprostokątne `a` i `b` (osobne linie) i wypisz przeciwprostokątną z 2 miejscami po przecinku:',
        expectedOutput: 'c = 5.00', exampleInput: '3\n4', starter: 'import math\n\n# Twój kod tutaj\n',
        hints: ['`math.sqrt(a * a + b * b)` albo `math.hypot(a, b)`.', 'Format: `f"c = {c:.2f}"`.'],
        checks: [{ pattern: 'math\\.(sqrt|hypot)', message: 'Użyj funkcji z modułu math.' }],
        solution: `import math

a = float(input())
b = float(input())
c = math.sqrt(a * a + b * b)
print(f"c = {c:.2f}")
`,
        tests: [{ input: '3\n4', expected: 'c = 5.00' }, { input: '1\n1', expected: 'c = 1.41' }],
      },
      {
        id: 'py19t2', title: 'Równanie kwadratowe', difficulty: 3,
        description: 'Wczytaj `a b c` w jednej linii (a > 0). Wypisz z 2 miejscami po przecinku: dla Δ > 0 `x1 = ...` i `x2 = ...` (x1 mniejszy), dla Δ = 0 `x = ...`, dla Δ < 0 `Brak rozwiazan`.',
        expectedOutput: 'x1 = 1.00\nx2 = 2.00', exampleInput: '1 -3 2', starter: 'import math\n\n# Twój kod tutaj\n',
        hints: ['`a, b, c = map(float, input().split())`', '`delta = b * b - 4 * a * c`'],
        solution: `import math

a, b, c = map(float, input().split())
delta = b * b - 4 * a * c
if delta > 0:
    print(f"x1 = {(-b - math.sqrt(delta)) / (2 * a):.2f}")
    print(f"x2 = {(-b + math.sqrt(delta)) / (2 * a):.2f}")
elif delta == 0:
    print(f"x = {-b / (2 * a):.2f}")
else:
    print("Brak rozwiazan")
`,
        tests: [{ input: '1 -3 2', expected: 'x1 = 1.00\nx2 = 2.00' }, { input: '1 2 1', expected: 'x = -1.00' }, { input: '1 0 1', expected: 'Brak rozwiazan' }],
      },
    ],
  },

  // ─────────────── 20 ───────────────
  {
    id: 'py20', title: 'Metody znakowe', subtitle: 'isdigit, isalpha, upper, lower', icon: 'CaseSensitive', practice: false,
    theory: [
      { type: 'p', text: 'Znak w Pythonie to napis o długości 1, więc do badania znaków służą **metody napisów**.' },
      { type: 'table', head: ['Metoda', 'Zwraca True, gdy…'], rows: [
        ['c.isdigit()', 'cyfra'], ['c.isalpha()', 'litera (także ą, ę…)'], ['c.isalnum()', 'litera lub cyfra'],
        ['c.isupper() / c.islower()', 'wielka / mała litera'], ['c.isspace()', 'biały znak'],
      ] },
      { type: 'table', head: ['Metoda', 'Działanie'], rows: [
        ['c.upper() / c.lower()', 'zamiana wielkości liter'], ['s.capitalize()', 'pierwsza litera wielka, reszta małe'],
        ['s.title()', 'Każde Słowo Wielką Literą'], ['s.swapcase()', 'zamiana wielkości wszystkich liter'],
      ] },
      { type: 'tip', text: 'Metody działają także na całych napisach: `"123".isdigit()` to True – przydatne do sprawdzania danych przed `int()`.' },
    ],
    example: {
      title: 'Analiza tekstu i szyfr Cezara',
      description: 'Klasyfikacja znaków i przesuwanie liter w alfabecie.',
      code: `s = "Haslo123 ma 2 spacje!"
litery = cyfry = spacje = inne = 0
for c in s:
    if c.isalpha():
        litery += 1
    elif c.isdigit():
        cyfry += 1
    elif c.isspace():
        spacje += 1
    else:
        inne += 1
print(f"Litery: {litery}, cyfry: {cyfry}, spacje: {spacje}, inne: {inne}")

szyfr = []
for c in "Ala ma kota":
    if c.islower():
        szyfr.append(chr((ord(c) - ord("a") + 3) % 26 + ord("a")))
    elif c.isupper():
        szyfr.append(chr((ord(c) - ord("A") + 3) % 26 + ord("A")))
    else:
        szyfr.append(c)
print("Szyfr Cezara:", "".join(szyfr))
print("ala MA kota".title(), "|", "ala MA kota".swapcase())
`,
    },
    tasks: [
      {
        id: 'py20t1', title: 'Statystyka znaków', difficulty: 1,
        description: 'Wczytaj linię tekstu i policz litery, cyfry i spacje:',
        expectedOutput: 'Litery: 9\nCyfry: 1\nSpacje: 3', exampleInput: 'Ala ma 2 koty', starter: PY_TEMPLATE,
        hints: ['`c.isalpha()`, `c.isdigit()`, `c.isspace()`'],
        checks: [{ pattern: 'isalpha\\s*\\(', message: 'Użyj metody isalpha().' }],
        solution: `tekst = input()
litery = cyfry = spacje = 0
for c in tekst:
    if c.isalpha():
        litery += 1
    elif c.isdigit():
        cyfry += 1
    elif c.isspace():
        spacje += 1
print(f"Litery: {litery}")
print(f"Cyfry: {cyfry}")
print(f"Spacje: {spacje}")
`,
        tests: [{ input: 'Ala ma 2 koty', expected: 'Litery: 9\nCyfry: 1\nSpacje: 3' }, { input: 'Python 3.12', expected: 'Litery: 6\nCyfry: 3\nSpacje: 1' }],
      },
      {
        id: 'py20t2', title: 'Szyfr Cezara', difficulty: 3,
        description: 'Wczytaj przesunięcie `k` (0–25), a w drugiej linii tekst. Przesuń każdą literę o `k` miejsc (z zawijaniem, z zachowaniem wielkości liter); inne znaki zostaw.',
        expectedOutput: 'Dod pd nrwd', exampleInput: '3\nAla ma kota', starter: PY_TEMPLATE,
        hints: ['Mała litera: `chr((ord(c) - ord("a") + k) % 26 + ord("a"))`.'],
        checks: [{ pattern: '%\\s*26', message: 'Zawijanie alfabetu zrób przez % 26.' }],
        solution: `k = int(input())
tekst = input()
wynik = ""
for c in tekst:
    if c.islower():
        wynik += chr((ord(c) - ord("a") + k) % 26 + ord("a"))
    elif c.isupper():
        wynik += chr((ord(c) - ord("A") + k) % 26 + ord("A"))
    else:
        wynik += c
print(wynik)
`,
        tests: [{ input: '3\nAla ma kota', expected: 'Dod pd nrwd' }, { input: '1\nxyz XYZ!', expected: 'yza YZA!' }],
      },
    ],
  },

  // ─────────────── 21 ───────────────
  {
    id: 'py21', title: 'Konwersja typów i wyjątki', subtitle: 'int(), float(), str(), try/except', icon: 'ArrowLeftRight', practice: false,
    theory: [
      { type: 'p', text: 'Typy zamieniamy funkcjami o nazwach typów: `int("42")`, `float("2.5")`, `str(7)`, `bool(0)`. Python nie łączy automatycznie napisów z liczbami: `"Wiek: " + 15` to błąd TypeError – trzeba napisać `"Wiek: " + str(15)` albo użyć f-stringa.' },
      { type: 'table', head: ['Wywołanie', 'Wynik'], rows: [
        ['int("42")', '42'], ['int(3.99)', '3 (obcina)'], ['int("3.5")', 'ValueError!'], ['float("2.5")', '2.5'],
        ['str(3.0)', '"3.0"'], ['bool(""), bool(0), bool([])', 'False'], ['int("ff", 16)', '255'],
      ] },
      { type: 'h', text: 'Obsługa wyjątków: try / except' },
      { type: 'code', code: `try:
    n = int(input())
    print(100 / n)
except ValueError:
    print("To nie jest liczba!")
except ZeroDivisionError:
    print("Nie dziel przez zero!")` },
      { type: 'tip', text: 'Łap konkretne wyjątki (`except ValueError:`), a nie wszystkie naraz (`except:`) – inaczej ukryjesz prawdziwe błędy w programie.' },
    ],
    example: {
      title: 'Konwersje w praktyce', input: 'abc\n12',
      description: 'Zamiana typów, wczytywanie z ponawianiem i obsługa wyjątków.',
      code: `cena = 19.99
zl = int(cena)
gr = round((cena - zl) * 100)
print(f"{cena} = {zl} zl {gr} gr")

print("Kod A:", ord("A"), "| liczba 42 jako tekst:", repr(str(42)))
print("Binarnie 1010 =", int("1010", 2))

while True:
    tekst = input("Podaj liczbe: ")
    try:
        liczba = int(tekst)
        break
    except ValueError:
        print("To nie liczba, sprobuj jeszcze raz.")
print("Wczytano", liczba, "razy 2 =", liczba * 2)

try:
    print("Wiek: " + 15)
except TypeError as e:
    print("Blad:", e)
`,
    },
    tasks: [
      {
        id: 'py21t1', title: 'Bezpieczne wczytywanie', difficulty: 2,
        description: 'Wczytuj kolejne linie, dopóki użytkownik nie poda poprawnej liczby całkowitej. Dla błędnej linii wypisz `Bledne dane: TEKST`, dla poprawnej `OK: LICZBA`. Użyj `try`/`except ValueError`.',
        expectedOutput: 'Bledne dane: abc\nBledne dane: 1.5\nOK: 7', exampleInput: 'abc\n1.5\n7', starter: PY_TEMPLATE,
        hints: ['`while True:` – w `try` zamień tekst na int i zrób `break`.'],
        checks: [{ pattern: 'except\\s+ValueError', message: 'Obsłuż wyjątek ValueError.' }],
        solution: `while True:
    tekst = input()
    try:
        n = int(tekst)
        print(f"OK: {n}")
        break
    except ValueError:
        print(f"Bledne dane: {tekst}")
`,
        tests: [{ input: 'abc\n1.5\n7', expected: 'Bledne dane: abc\nBledne dane: 1.5\nOK: 7' }, { input: '-3', expected: 'OK: -3' }],
      },
      {
        id: 'py21t2', title: 'Dzielenie z wyjątkami', difficulty: 2,
        description: 'Wczytaj dwie linie i oblicz iloraz całkowity (`//`) pierwszej liczby przez drugą. Dla niepoprawnej liczby wypisz `Niepoprawna liczba`, dla dzielenia przez zero – `Dzielenie przez zero`, w przeciwnym razie `Wynik: X`.',
        expectedOutput: 'Wynik: 3', exampleInput: '10\n3', starter: PY_TEMPLATE,
        hints: ['Dwa bloki: `except ValueError:` i `except ZeroDivisionError:`.'],
        checks: [{ pattern: 'except\\s+ZeroDivisionError', message: 'Obsłuż wyjątek ZeroDivisionError.' }],
        solution: `try:
    a = int(input())
    b = int(input())
    print(f"Wynik: {a // b}")
except ValueError:
    print("Niepoprawna liczba")
except ZeroDivisionError:
    print("Dzielenie przez zero")
`,
        tests: [{ input: '10\n3', expected: 'Wynik: 3' }, { input: '5\n0', expected: 'Dzielenie przez zero' }, { input: 'x\n2', expected: 'Niepoprawna liczba' }],
      },
    ],
  },

  // ─────────────── 22 ───────────────
  {
    id: 'py22', title: 'Wejście i wyjście', subtitle: 'print, input, f-stringi, formatowanie', icon: 'Keyboard', practice: false,
    theory: [
      { type: 'p', text: '`print()` przyjmuje wiele wartości oraz parametry `sep` (separator) i `end` (zakończenie). `input()` wczytuje jedną linię tekstu. Kilka liczb z jednej linii wczytasz przez `map`.' },
      { type: 'code', run: true, code: `print("a", "b", "c", sep="-")        # a-b-c
print("bez nowej linii", end=" | ")
print("dalej")
a, b = map(int, "3 4".split())       # zwykle: map(int, input().split())
print(a + b)` },
      { type: 'h', text: 'Formatowanie w f-stringach' },
      { type: 'table', head: ['Zapis', 'Wynik dla x = 3.14159 / n = 42'], rows: [
        ['f"{x:.2f}"', '3.14'], ['f"{n:5}" / f"{n:>5}"', '   42 (do prawej)'], ['f"{n:<5}|"', '42   |'], ['f"{n:05}"', '00042'],
        ['f"{n:b}" / f"{n:x}" / f"{n:X}"', '101010 / 2a / 2A'], ['f"{0.25:.0%}"', '25%'], ['f"{1234567:,}"', '1,234,567'],
      ] },
    ],
    example: {
      title: 'Paragon w tabeli',
      description: 'Wyrównywanie kolumn, liczby z dwoma miejscami po przecinku i systemy liczbowe.',
      code: `produkty = [("Chleb", 4.5), ("Maslo", 7.99), ("Ser zolty", 12.3)]
print(f"{'Produkt':<12}{'Cena':>8}")
suma = 0
for nazwa, cena in produkty:
    print(f"{nazwa:<12}{cena:>8.2f}")
    suma += cena
print(f"{'RAZEM':<12}{suma:>8.2f}")

n = 255
print(f"{n} = {n:b} (bin) = {n:X} (hex) = {n:o} (oct)")
print("Lista:", *[1, 2, 3], sep=" ")
`,
    },
    tasks: [
      {
        id: 'py22t1', title: 'Paragon', difficulty: 1,
        description: 'Wczytaj cenę (liczba rzeczywista) i liczbę sztuk (osobne linie). Wypisz kwotę z dwoma miejscami po przecinku:',
        expectedOutput: 'Do zaplaty: 12.50 zl', exampleInput: '2.5\n5', starter: PY_TEMPLATE,
        hints: ['`f"Do zaplaty: {kwota:.2f} zl"`'],
        solution: `cena = float(input())
ilosc = int(input())
print(f"Do zaplaty: {cena * ilosc:.2f} zl")
`,
        tests: [{ input: '2.5\n5', expected: 'Do zaplaty: 12.50 zl' }, { input: '0.99\n3', expected: 'Do zaplaty: 2.97 zl' }],
      },
      {
        id: 'py22t2', title: 'Systemy liczbowe', difficulty: 1,
        description: 'Wczytaj nieujemną liczbę całkowitą i wypisz ją dwójkowo i szesnastkowo (wielkimi literami) używając formatowania f-stringów:',
        expectedOutput: 'bin: 1010\nhex: A', exampleInput: '10', starter: PY_TEMPLATE,
        hints: ['`f"{n:b}"` i `f"{n:X}"`.'],
        solution: `n = int(input())
print(f"bin: {n:b}")
print(f"hex: {n:X}")
`,
        tests: [{ input: '10', expected: 'bin: 1010\nhex: A' }, { input: '255', expected: 'bin: 11111111\nhex: FF' }],
      },
    ],
  },
];
