// Kurs Pythona – tematy 1–11.
import { PY_TEMPLATE } from '../lang-templates.js';

export const py1 = [
  // ─────────────── 1 ───────────────
  {
    id: 'py01', title: 'Podstawowe elementy języka Python', subtitle: 'print, input, zmienne, typy', icon: 'Terminal', practice: false,
    theory: [
      { type: 'p', text: 'Program w Pythonie wykonuje się linia po linii, od góry do dołu – nie potrzeba funkcji `main` ani średników. Na ekran wypisujemy funkcją `print(...)`.' },
      { type: 'code', run: true, code: `print("Witaj, swiecie!")
print("2 + 3 =", 2 + 3)      # kilka wartosci oddziela spacja
# to jest komentarz` },
      { type: 'h', text: 'Zmienne i typy' },
      { type: 'p', text: 'Zmienną tworzymy, przypisując jej wartość – typ ustala się sam (**typowanie dynamiczne**). Funkcja `type(x)` pokazuje typ.' },
      { type: 'table', head: ['Typ', 'Co przechowuje', 'Przykład'], rows: [
        ['int', 'liczby całkowite (dowolnie duże!)', 'wiek = 15'],
        ['float', 'liczby rzeczywiste', 'cena = 4.99'],
        ['str', 'tekst', 'imie = "Ola"'],
        ['bool', 'True / False', 'zdal = True'],
      ] },
      { type: 'h', text: 'Wczytywanie danych' },
      { type: 'p', text: '`input()` zwraca zawsze **tekst** (str). Liczbę uzyskamy przez `int(...)` lub `float(...)`.' },
      { type: 'code', code: `imie = input("Jak masz na imie? ")
wiek = int(input("Ile masz lat? "))` },
      { type: 'table', head: ['Operator', 'Znaczenie', 'Przykład'], rows: [
        ['/', 'dzielenie (zawsze float)', '7 / 2 → 3.5'],
        ['//', 'dzielenie całkowite', '7 // 2 → 3'],
        ['%', 'reszta z dzielenia', '7 % 2 → 1'],
        ['**', 'potęgowanie', '2 ** 10 → 1024'],
      ] },
      { type: 'tip', text: 'f-string wstawia wartości w napis: `print(f"Masz {wiek} lat")`. Format `{x:.2f}` daje dwa miejsca po przecinku.' },
      { type: 'warn', text: 'Wcięcia w Pythonie mają znaczenie! Kod na najwyższym poziomie nie może zaczynać się od spacji.' },
    ],
    example: {
      title: 'Przedstaw się', input: 'Ola\n15',
      description: 'Wczytanie imienia i wieku oraz powitanie f-stringiem.',
      code: `imie = input("Jak masz na imie? ")
wiek = int(input("Ile masz lat? "))

print(f"Czesc, {imie}!")
print(f"Za 10 lat bedziesz mial(a) {wiek + 10} lat.")

wzrost = 1.65
print("Przykladowy wzrost:", wzrost, "m")
print("7 / 2 =", 7 / 2, "a 7 // 2 =", 7 // 2)
print("2 ** 100 =", 2 ** 100)
`,
    },
    tasks: [
      {
        id: 'py01t1', title: 'Suma i iloczyn', difficulty: 1,
        description: 'Wczytaj dwie liczby całkowite (każdą w osobnej linii) i wypisz ich sumę oraz iloczyn:',
        expectedOutput: 'Suma: 7\nIloczyn: 12', exampleInput: '3\n4', starter: PY_TEMPLATE,
        hints: ['`a = int(input())`', '`print(f"Suma: {a + b}")`'],
        solution: `a = int(input())
b = int(input())
print(f"Suma: {a + b}")
print(f"Iloczyn: {a * b}")
`,
        tests: [{ input: '3\n4', expected: 'Suma: 7\nIloczyn: 12' }, { input: '-2\n5', expected: 'Suma: 3\nIloczyn: -10' }],
      },
      {
        id: 'py01t2', title: 'Średnia trzech ocen', difficulty: 1,
        description: 'Wczytaj trzy oceny (każdą w osobnej linii) i wypisz ich średnią z dokładnością do 2 miejsc po przecinku:',
        expectedOutput: 'Srednia: 4.33', exampleInput: '5\n4\n4', starter: PY_TEMPLATE,
        hints: ['W Pythonie `/` zawsze daje float, więc `(a + b + c) / 3` jest poprawne.', 'Format: `f"Srednia: {srednia:.2f}"`.'],
        solution: `a = int(input())
b = int(input())
c = int(input())
srednia = (a + b + c) / 3
print(f"Srednia: {srednia:.2f}")
`,
        tests: [{ input: '5\n4\n4', expected: 'Srednia: 4.33' }, { input: '3\n4\n5', expected: 'Srednia: 4.00' }],
      },
    ],
  },

  // ─────────────── 2 ───────────────
  {
    id: 'py02', title: 'Instrukcje warunkowe i wyboru', subtitle: 'if, elif, else, match', icon: 'GitBranch', practice: true,
    theory: [
      { type: 'p', text: 'Instrukcja **if** wykonuje wcięty blok, gdy warunek jest prawdziwy. Po warunku stawiamy **dwukropek**, a ciało bloku wcinamy (4 spacje).' },
      { type: 'code', code: `if temperatura > 25:
    print("Goraco!")
elif temperatura > 10:
    print("Przyjemnie")
else:
    print("Zimno")` },
      { type: 'table', head: ['Operator', 'Znaczenie'], rows: [
        ['== !=', 'równe / różne'], ['< > <= >=', 'porównania (można łączyć: 0 < x < 10)'], ['and, or, not', 'i, lub, nie'], ['in', 'czy element należy: "a" in "kot"'],
      ] },
      { type: 'h', text: 'match-case (Python 3.10+)' },
      { type: 'code', code: `match dzien:
    case 6 | 7:
        print("Weekend")
    case 1 | 2 | 3 | 4 | 5:
        print("Dzien roboczy")
    case _:
        print("Bledny numer")` },
      { type: 'tip', text: 'Wyrażenie warunkowe w jednej linii: `opis = "parzysta" if n % 2 == 0 else "nieparzysta"`.' },
      { type: 'warn', text: 'Najczęstsze błędy: brak dwukropka po warunku i niespójne wcięcia. Środowisko pokaże linię i wyjaśnienie.' },
    ],
    example: {
      title: 'Ocena słownie', input: '83',
      description: 'Zamiana punktów na ocenę przez if/elif/else oraz opis przez match.',
      code: `punkty = int(input("Ile punktow (0-100)? "))

if punkty < 0 or punkty > 100:
    print("Niepoprawna liczba punktow!")
else:
    if punkty >= 90:
        ocena = 5
    elif punkty >= 70:
        ocena = 4
    elif punkty >= 50:
        ocena = 3
    else:
        ocena = 2

    match ocena:
        case 5:
            opis = "bardzo dobry"
        case 4:
            opis = "dobry"
        case 3:
            opis = "dostateczny"
        case _:
            opis = "niedostateczny"
    print(f"Ocena: {ocena} ({opis})")
`,
    },
    tasks: [
      {
        id: 'py02t1', title: 'Parzysta czy nieparzysta?', difficulty: 1,
        description: 'Wczytaj liczbę całkowitą i wypisz `parzysta` albo `nieparzysta`.',
        expectedOutput: 'parzysta', exampleInput: '8', starter: PY_TEMPLATE,
        hints: ['`if n % 2 == 0:` – pamiętaj o dwukropku i wcięciu.'],
        solution: `n = int(input())
if n % 2 == 0:
    print("parzysta")
else:
    print("nieparzysta")
`,
        tests: [{ input: '8', expected: 'parzysta' }, { input: '7', expected: 'nieparzysta' }, { input: '-3', expected: 'nieparzysta' }],
      },
      {
        id: 'py02t2', title: 'Dzień tygodnia (match)', difficulty: 2,
        description: 'Wczytaj numer dnia (1–7) i wypisz `Poniedzialek` … `Niedziela`, a dla innej liczby `Bledny numer`. Użyj instrukcji **match**.',
        expectedOutput: 'Sroda', exampleInput: '3', starter: PY_TEMPLATE,
        hints: ['`match dzien:` i dalej `case 1:` … `case _:`.'],
        checks: [{ pattern: '\\bmatch\\b', message: 'Użyj instrukcji match.' }],
        solution: `dzien = int(input())
match dzien:
    case 1:
        print("Poniedzialek")
    case 2:
        print("Wtorek")
    case 3:
        print("Sroda")
    case 4:
        print("Czwartek")
    case 5:
        print("Piatek")
    case 6:
        print("Sobota")
    case 7:
        print("Niedziela")
    case _:
        print("Bledny numer")
`,
        tests: [{ input: '3', expected: 'Sroda' }, { input: '7', expected: 'Niedziela' }, { input: '9', expected: 'Bledny numer' }],
      },
    ],
  },

  // ─────────────── 3 ───────────────
  {
    id: 'py03', title: 'Pętle programowe', subtitle: 'for, range, while, break', icon: 'Repeat', practice: true,
    theory: [
      { type: 'p', text: 'Pętla **for** przechodzi po kolejnych elementach – najczęściej po liczbach z `range(...)`. Pętla **while** powtarza blok, dopóki warunek jest prawdziwy.' },
      { type: 'table', head: ['Zapis', 'Kolejne wartości'], rows: [
        ['range(5)', '0, 1, 2, 3, 4'], ['range(1, 6)', '1, 2, 3, 4, 5'], ['range(10, 0, -2)', '10, 8, 6, 4, 2'],
      ] },
      { type: 'code', run: true, code: `for i in range(1, 6):
    print(i, end=" ")         # end=" " – zamiast nowej linii spacja
print()

n = 1234
cyfry = 0
while n > 0:
    n //= 10
    cyfry += 1
print("Cyfr:", cyfry)` },
      { type: 'list', items: ['`break` – przerywa pętlę, `continue` – przechodzi do kolejnego obrotu.', 'Python nie ma pętli do-while; zastępuje ją `while True:` z `break` w środku.'] },
      { type: 'warn', text: 'Nieskończoną pętlę zatrzymasz przyciskiem **Stop**.' },
    ],
    example: {
      title: 'Choinka i suma cyfr', input: '4',
      description: 'Pętle zagnieżdżone i mnożenie napisów oraz pętla while.',
      code: `h = int(input("Wysokosc: "))
for i in range(1, h + 1):
    print("*" * i)

liczba = 98765
suma = 0
while liczba > 0:
    suma += liczba % 10
    liczba //= 10
print("Suma cyfr 98765 =", suma)

while True:
    print("Petla while True konczy sie przez break")
    break
`,
    },
    tasks: [
      {
        id: 'py03t1', title: 'Odliczanie', difficulty: 1,
        description: 'Wczytaj `n` (n ≥ 1). Wypisz w jednej linii liczby od `n` do `1` oddzielone spacjami, a w kolejnej `Start!`.',
        expectedOutput: '5 4 3 2 1\nStart!', exampleInput: '5', starter: PY_TEMPLATE,
        hints: ['`for i in range(n, 0, -1):` i `print(i, end=" ")`.', 'Po pętli `print()` i `print("Start!")`.'],
        solution: `n = int(input())
for i in range(n, 0, -1):
    print(i, end=" ")
print()
print("Start!")
`,
        tests: [{ input: '5', expected: '5 4 3 2 1\nStart!' }, { input: '1', expected: '1\nStart!' }],
      },
      {
        id: 'py03t2', title: 'Suma cyfr', difficulty: 2,
        description: 'Wczytaj nieujemną liczbę całkowitą i oblicz sumę jej cyfr pętlą **while** (bez zamiany na napis).',
        expectedOutput: 'Suma cyfr: 6', exampleInput: '123', starter: PY_TEMPLATE,
        hints: ['Ostatnia cyfra: `n % 10`, obcięcie: `n //= 10`.'],
        checks: [{ pattern: '\\bwhile\\b', message: 'Użyj pętli while.' }],
        solution: `n = int(input())
suma = 0
while n > 0:
    suma += n % 10
    n //= 10
print(f"Suma cyfr: {suma}")
`,
        tests: [{ input: '123', expected: 'Suma cyfr: 6' }, { input: '0', expected: 'Suma cyfr: 0' }, { input: '99999', expected: 'Suma cyfr: 45' }],
      },
    ],
  },

  // ─────────────── 4 ───────────────
  {
    id: 'py04', title: 'Typ wyliczeniowy', subtitle: 'moduł enum', icon: 'ListOrdered', practice: true,
    theory: [
      { type: 'p', text: 'Typ wyliczeniowy tworzymy w module **enum** jako klasę dziedziczącą po `Enum`. Każdy element ma nazwę (`.name`) i wartość (`.value`).' },
      { type: 'code', run: true, code: `from enum import Enum

class Dzien(Enum):
    PON = 1
    WT = 2
    SR = 3

d = Dzien.SR
print(d.name, d.value)      # SR 3
print(Dzien(2))             # Dzien.WT – element o wartosci 2
for x in Dzien:
    print(x.name, end=" ")
print()` },
      { type: 'list', items: [
        '`Dzien(n)` zwraca element o wartości n (dla nieistniejącej – ValueError).',
        '`Dzien["SR"]` zwraca element o nazwie SR.',
        'Elementy porównujemy przez `==` albo `is`: `if d == Dzien.SR:`.',
        '`auto()` z modułu enum nadaje kolejne wartości automatycznie.',
      ] },
      { type: 'tip', text: 'Używaj enum zamiast „magicznych” liczb i napisów: stan gry, kierunek, poziom trudności.' },
    ],
    example: {
      title: 'Kierunki ruchu',
      description: 'Robot porusza się według listy kierunków z enum; match rozpoznaje kierunek.',
      code: `from enum import Enum, auto

class Kierunek(Enum):
    GORA = auto()
    PRAWO = auto()
    DOL = auto()
    LEWO = auto()

ruchy = [Kierunek.GORA, Kierunek.GORA, Kierunek.PRAWO, Kierunek.DOL]
x, y = 0, 0
for k in ruchy:
    match k:
        case Kierunek.GORA:
            y += 1
        case Kierunek.DOL:
            y -= 1
        case Kierunek.PRAWO:
            x += 1
        case Kierunek.LEWO:
            x -= 1
    print(f"Ruch {k.name} (nr {k.value}) -> ({x}, {y})")
`,
    },
    tasks: [
      {
        id: 'py04t1', title: 'Weekend czy dzień roboczy?', difficulty: 1,
        description: 'Zdefiniuj `class Dzien(Enum)` z elementami `PON = 1` … `ND = 7`. Wczytaj numer dnia, zamień go na element (`Dzien(n)`) i wypisz nazwę oraz `Weekend` albo `Dzien roboczy`:',
        expectedOutput: 'SOB: Weekend', exampleInput: '6',
        starter: `from enum import Enum

class Dzien(Enum):
    PON = 1
    WT = 2
    SR = 3
    CZW = 4
    PT = 5
    SOB = 6
    ND = 7

# Twój kod tutaj
`,
        hints: ['`d = Dzien(int(input()))`', 'Warunek: `d in (Dzien.SOB, Dzien.ND)`, nazwa: `d.name`.'],
        checks: [{ pattern: 'class\\s+Dzien\\s*\\(\\s*Enum\\s*\\)', message: 'Użyj klasy Dzien(Enum).' }],
        solution: `from enum import Enum

class Dzien(Enum):
    PON = 1
    WT = 2
    SR = 3
    CZW = 4
    PT = 5
    SOB = 6
    ND = 7

d = Dzien(int(input()))
if d in (Dzien.SOB, Dzien.ND):
    print(f"{d.name}: Weekend")
else:
    print(f"{d.name}: Dzien roboczy")
`,
        tests: [{ input: '6', expected: 'SOB: Weekend' }, { input: '1', expected: 'PON: Dzien roboczy' }],
      },
      {
        id: 'py04t2', title: 'Pory roku', difficulty: 2,
        description: 'Zdefiniuj `class PoraRoku(Enum)` (`WIOSNA`, `LATO`, `JESIEN`, `ZIMA`) i funkcję `pora(miesiac)` zwracającą element enum (3–5 wiosna, 6–8 lato, 9–11 jesień, pozostałe zima). Wczytaj miesiąc i wypisz nazwę pory roku małymi literami z wielką pierwszą (`.name.capitalize()`).',
        expectedOutput: 'Wiosna', exampleInput: '4',
        starter: `from enum import Enum

class PoraRoku(Enum):
    WIOSNA = 1
    LATO = 2
    JESIEN = 3
    ZIMA = 4

def pora(miesiac):
    # uzupelnij
    return PoraRoku.ZIMA
`,
        hints: ['`if 3 <= miesiac <= 5: return PoraRoku.WIOSNA`', '`print(pora(m).name.capitalize())`'],
        checks: [{ pattern: 'def\\s+pora\\s*\\(', message: 'Zdefiniuj funkcję pora(miesiac).' }],
        solution: `from enum import Enum

class PoraRoku(Enum):
    WIOSNA = 1
    LATO = 2
    JESIEN = 3
    ZIMA = 4

def pora(miesiac):
    if 3 <= miesiac <= 5:
        return PoraRoku.WIOSNA
    if 6 <= miesiac <= 8:
        return PoraRoku.LATO
    if 9 <= miesiac <= 11:
        return PoraRoku.JESIEN
    return PoraRoku.ZIMA

m = int(input())
print(pora(m).name.capitalize())
`,
        tests: [{ input: '4', expected: 'Wiosna' }, { input: '7', expected: 'Lato' }, { input: '12', expected: 'Zima' }, { input: '10', expected: 'Jesien' }],
      },
    ],
  },

  // ─────────────── 5 ───────────────
  {
    id: 'py05', title: 'Zmienne i referencje', subtitle: 'odpowiednik wskaźników: id, is, mutowalność', icon: 'MousePointer2', practice: true,
    theory: [
      { type: 'p', text: 'W Pythonie nie ma wskaźników jak w C++, ale każda zmienna jest **nazwą (etykietą) przyczepioną do obiektu** w pamięci. Przypisanie `b = a` nie kopiuje obiektu – obie nazwy wskazują ten sam obiekt. Funkcja `id(x)` zwraca identyfikator obiektu (w CPythonie – jego adres).' },
      { type: 'code', run: true, code: `a = [1, 2, 3]
b = a                  # ta sama lista!
b.append(4)
print(a)               # [1, 2, 3, 4]
print(a is b)          # True – ten sam obiekt
print(id(a) == id(b))  # True

c = [1, 2, 3, 4]
print(a == c, a is c)  # True False – rowne, ale rozne obiekty` },
      { type: 'table', head: ['Niezmienne (immutable)', 'Zmienne (mutable)'], rows: [
        ['int, float, str, bool, tuple', 'list, dict, set, obiekty klas'],
        ['„zmiana” tworzy nowy obiekt', 'można zmieniać obiekt w miejscu'],
      ] },
      { type: 'h', text: 'Przekazywanie do funkcji' },
      { type: 'p', text: 'Funkcja dostaje odwołanie do tego samego obiektu. Jeśli obiekt jest **zmienny** (lista), funkcja może go zmodyfikować i zmiana będzie widoczna na zewnątrz. Przypisanie nowej wartości do parametru zmienia jednak tylko lokalną nazwę.' },
      { type: 'code', run: true, code: `def dodaj_zero(lista):
    lista.append(0)        # zmienia oryginal

def zamien_na_nowa(lista):
    lista = [9, 9]         # tylko lokalna nazwa wskazuje nowa liste

t = [1, 2]
dodaj_zero(t)
zamien_na_nowa(t)
print(t)                   # [1, 2, 0]` },
      { type: 'tip', text: 'Funkcja nie może „zamienić” dwóch zmiennych int przekazanych jako argumenty (jak `swap` w C++). W Pythonie zwraca się nowe wartości: `a, b = b, a`.' },
    ],
    example: {
      title: 'Kopia czy to samo?',
      description: 'Liczby są niezmienne, a lista – zmienna; zobacz, co dzieje się przy przypisaniu i w funkcji.',
      code: `x = 10
y = x
y += 5
print("x =", x, "y =", y)        # int: y wskazuje nowy obiekt

lista1 = [1, 2, 3]
lista2 = lista1
lista2[0] = 100
print("lista1 =", lista1)        # zmienila sie tez lista1!

kopia = lista1.copy()
kopia[0] = -1
print("lista1 =", lista1, "kopia =", kopia)

def podwoj_elementy(t):
    for i in range(len(t)):
        t[i] *= 2

podwoj_elementy(lista1)
print("po funkcji:", lista1)
print("lista1 is lista2:", lista1 is lista2, "| lista1 is kopia:", lista1 is kopia)
`,
    },
    tasks: [
      {
        id: 'py05t1', title: 'Funkcja zmieniająca listę', difficulty: 1,
        description: 'Napisz funkcję `kwadraty(t)`, która **w miejscu** zamienia każdy element listy na jego kwadrat i niczego nie zwraca. Wczytaj linię liczb, wywołaj funkcję i wypisz listę (elementy oddzielone spacją).',
        expectedOutput: '1 4 9 16', exampleInput: '1 2 3 4',
        starter: `def kwadraty(t):
    # uzupelnij – zmien elementy listy t
    pass

t = list(map(int, input().split()))
kwadraty(t)
print(*t)
`,
        hints: ['`for i in range(len(t)): t[i] = t[i] ** 2`', '`print(*t)` wypisuje elementy oddzielone spacją.'],
        checks: [{ pattern: 'def\\s+kwadraty\\s*\\(', message: 'Zdefiniuj funkcję kwadraty(t).' }],
        solution: `def kwadraty(t):
    for i in range(len(t)):
        t[i] = t[i] ** 2

t = list(map(int, input().split()))
kwadraty(t)
print(*t)
`,
        tests: [{ input: '1 2 3 4', expected: '1 4 9 16' }, { input: '-3 5', expected: '9 25' }],
      },
      {
        id: 'py05t2', title: 'Zamiana bez zmiennej pomocniczej', difficulty: 1,
        description: 'Wczytaj dwie liczby (każdą w osobnej linii), zamień ich wartości **jedną instrukcją** `a, b = b, a` i wypisz:',
        expectedOutput: 'a = 5, b = 3', exampleInput: '3\n5', starter: PY_TEMPLATE,
        hints: ['Prawa strona tworzy krotkę `(b, a)`, która jest „rozpakowywana” do `a` i `b`.'],
        checks: [{ pattern: '\\ba\\s*,\\s*b\\s*=\\s*b\\s*,\\s*a\\b', message: 'Użyj zapisu a, b = b, a.' }],
        solution: `a = int(input())
b = int(input())
a, b = b, a
print(f"a = {a}, b = {b}")
`,
        tests: [{ input: '3\n5', expected: 'a = 5, b = 3' }, { input: '-1\n8', expected: 'a = 8, b = -1' }],
      },
    ],
  },

  // ─────────────── 6 ───────────────
  {
    id: 'py06', title: 'Pamięć, None i odśmiecanie', subtitle: 'obiekty, del, licznik referencji', icon: 'Cpu', practice: false,
    theory: [
      { type: 'p', text: 'Wszystkie wartości w Pythonie są **obiektami** tworzonymi dynamicznie na stercie. Nie zwalniamy ich ręcznie: Python liczy odwołania (referencje) do każdego obiektu i gdy licznik spadnie do zera, obiekt jest usuwany. Cykle odwołań usuwa dodatkowo **garbage collector**.' },
      { type: 'code', code: `dane = [0] * 1_000_000   # duza lista
dane = None              # nikt juz nie wskazuje listy -> zostanie zwolniona
x = [1, 2]
del x                    # usuwa NAZWE x (obiekt zniknie, gdy nie ma innych odwolan)` },
      { type: 'h', text: 'Wartość None' },
      { type: 'p', text: '`None` oznacza „brak wartości” – zwracają ją funkcje bez `return`. Sprawdzamy ją operatorem `is`: `if wynik is None:`.' },
      { type: 'code', run: true, code: `def znajdz(lista, x):
    for i, v in enumerate(lista):
        if v == x:
            return i
    return None

i = znajdz([4, 8, 15], 16)
print("nie znaleziono" if i is None else f"indeks {i}")` },
      { type: 'tip', text: 'Napis pusty, 0, pusta lista i None są w warunku traktowane jak fałsz: `if lista:` znaczy „jeśli lista nie jest pusta”. Wygodny skrót: `imie = linia or "brak"`.' },
    ],
    example: {
      title: 'Obiekty i odwołania',
      description: 'Kilka nazw może wskazywać ten sam obiekt; None jako brak wartości; operator or jako wartość domyślna.',
      code: `import sys

lista = [1, 2, 3]
druga = lista
print("Ten sam obiekt?", lista is druga)
print("Liczba odwolan do listy (w przyblizeniu):", sys.getrefcount(lista) - 1)

del druga
print("Po del druga – lista nadal istnieje:", lista)

def bez_return():
    pass

print("Funkcja bez return zwraca:", bez_return())

wartosc = None
print("Wynik:", wartosc if wartosc is not None else "brak danych")
imie = "" or "anonim"
print("Imie:", imie)
`,
    },
    tasks: [
      {
        id: 'py06t1', title: 'Imię albo brak', difficulty: 1,
        description: 'Wczytaj linię tekstu. Jeśli jest pusta, ustaw zmienną `imie` na `None`, w przeciwnym razie na wczytany tekst. Następnie wypisz:',
        expectedOutput: 'Imie: Ola\nDlugosc: 3', exampleInput: 'Ola', starter: PY_TEMPLATE,
        hints: ['`imie = linia if linia != "" else None`', 'Sprawdzenie: `if imie is None:`.'],
        checks: [{ pattern: 'is\\s+(not\\s+)?None', message: 'Sprawdź None operatorem is.' }],
        solution: `linia = input()
imie = linia if linia != "" else None
if imie is None:
    print("Imie: brak")
    print("Dlugosc: 0")
else:
    print(f"Imie: {imie}")
    print(f"Dlugosc: {len(imie)}")
`,
        tests: [{ input: 'Ola', expected: 'Imie: Ola\nDlugosc: 3' }, { input: '\n', expected: 'Imie: brak\nDlugosc: 0' }],
      },
    ],
  },

  // ─────────────── 7 ───────────────
  {
    id: 'py07', title: 'Listy jako tablice', subtitle: 'indeksy, len, listy dwuwymiarowe', icon: 'Rows3', practice: true,
    theory: [
      { type: 'p', text: 'Rolę tablic pełnią w Pythonie **listy**. Indeksy zaczynają się od 0, a ujemne liczymy od końca (`t[-1]` to ostatni element). Długość podaje `len(t)`.' },
      { type: 'code', run: true, code: `t = [4, 8, 15, 16, 23]
print(t[0], t[-1], len(t))      # 4 23 5
t[2] = 100
zera = [0] * 5                  # [0, 0, 0, 0, 0]

liczby = list(map(int, "3 1 2".split()))   # wczytywanie: list(map(int, input().split()))
print(min(liczby), max(liczby), sum(liczby))` },
      { type: 'h', text: 'Listy dwuwymiarowe' },
      { type: 'code', run: true, code: `m = [[0] * 3 for _ in range(2)]   # 2 wiersze, 3 kolumny
m[1][2] = 7
print(m)
for wiersz in m:
    print(*wiersz)` },
      { type: 'warn', text: 'Nie twórz macierzy zapisem `[[0] * 3] * 2` – powstaną dwa odwołania do **tego samego** wiersza i zmiana jednego zmieni oba.' },
    ],
    example: {
      title: 'Temperatury tygodnia',
      description: 'Statystyki listy oraz tabliczka mnożenia w liście dwuwymiarowej.',
      code: `temp = [12.5, 14.0, 9.5, 11.0, 16.5, 18.0, 15.5]
srednia = sum(temp) / len(temp)
najcieplejszy = temp.index(max(temp))
print(f"Srednia: {srednia:.2f}")
print(f"Najcieplej w dniu nr {najcieplejszy + 1}: {temp[najcieplejszy]}")

tab = [[(i + 1) * (j + 1) for j in range(3)] for i in range(3)]
for wiersz in tab:
    for x in wiersz:
        print(f"{x:4}", end="")
    print()
`,
    },
    tasks: [
      {
        id: 'py07t1', title: 'Statystyki listy', difficulty: 1,
        description: 'Wczytaj linię liczb całkowitych oddzielonych spacjami i wypisz najmniejszą, największą wartość i sumę:',
        expectedOutput: 'Min: 1\nMax: 9\nSuma: 22', exampleInput: '4 9 1 6 2', starter: PY_TEMPLATE,
        hints: ['`t = list(map(int, input().split()))`', 'Funkcje `min(t)`, `max(t)`, `sum(t)`.'],
        solution: `t = list(map(int, input().split()))
print(f"Min: {min(t)}")
print(f"Max: {max(t)}")
print(f"Suma: {sum(t)}")
`,
        tests: [{ input: '4 9 1 6 2', expected: 'Min: 1\nMax: 9\nSuma: 22' }, { input: '-7', expected: 'Min: -7\nMax: -7\nSuma: -7' }],
      },
      {
        id: 'py07t2', title: 'Przekątna macierzy', difficulty: 2,
        description: 'Wczytaj `n`, a potem `n` linii po `n` liczb. Zapisz je w liście list i wypisz sumę głównej przekątnej:',
        expectedOutput: 'Przekatna: 15', exampleInput: '3\n1 2 3\n4 5 6\n7 8 9', starter: PY_TEMPLATE,
        hints: ['`m = [list(map(int, input().split())) for _ in range(n)]`', 'Przekątna: `m[i][i]`.'],
        solution: `n = int(input())
m = []
for _ in range(n):
    m.append(list(map(int, input().split())))
suma = 0
for i in range(n):
    suma += m[i][i]
print(f"Przekatna: {suma}")
`,
        tests: [{ input: '3\n1 2 3\n4 5 6\n7 8 9', expected: 'Przekatna: 15' }, { input: '1\n42', expected: 'Przekatna: 42' }],
      },
    ],
  },

  // ─────────────── 8 ───────────────
  {
    id: 'py08', title: 'Wycinki i kopiowanie list', subtitle: 'slicing, alias, copy', icon: 'Link2', practice: false,
    theory: [
      { type: 'p', text: '**Wycinek** (slice) `t[start:stop:krok]` tworzy nową listę z fragmentu. Brak `start` oznacza początek, brak `stop` – koniec, a ujemny krok przechodzi od tyłu.' },
      { type: 'table', head: ['Zapis', 'Wynik dla t = [0, 1, 2, 3, 4, 5]'], rows: [
        ['t[1:4]', '[1, 2, 3]'], ['t[:2]', '[0, 1]'], ['t[3:]', '[3, 4, 5]'], ['t[::2]', '[0, 2, 4]'], ['t[::-1]', '[5, 4, 3, 2, 1, 0] – odwrócona'],
      ] },
      { type: 'h', text: 'Alias a kopia' },
      { type: 'table', head: ['Zapis', 'Efekt'], rows: [
        ['b = a', 'NIE kopiuje – b i a to ta sama lista (alias)'],
        ['b = a[:] lub b = a.copy()', 'płytka kopia – nowa lista'],
        ['b = copy.deepcopy(a)', 'głęboka kopia – kopiuje też listy zagnieżdżone'],
      ] },
      { type: 'warn', text: 'Płytka kopia listy list kopiuje tylko „zewnętrzną” listę – wiersze nadal są wspólne. Do macierzy używaj `copy.deepcopy`.' },
    ],
    example: {
      title: 'Wycinki w akcji',
      description: 'Wycinki, odwracanie, rotacja oraz różnica między płytką i głęboką kopią.',
      code: `import copy

t = [0, 1, 2, 3, 4, 5]
print(t[1:4], t[::2], t[::-1])

k = 2
print("Rotacja o 2:", t[k:] + t[:k])

macierz = [[1, 2], [3, 4]]
plytka = macierz.copy()
gleboka = copy.deepcopy(macierz)
macierz[0][0] = 99
print("plytka:", plytka)
print("gleboka:", gleboka)

s = "programowanie"
print(s[:7], s[-3:], s[::-1])
`,
    },
    tasks: [
      {
        id: 'py08t1', title: 'Rotacja listy', difficulty: 2,
        description: 'Wczytaj linię liczb oraz w drugiej linii liczbę `k` (0 ≤ k ≤ długość listy). Używając **wycinków**, przesuń listę cyklicznie w lewo o `k` pozycji i wypisz ją.',
        expectedOutput: '3 4 5 1 2', exampleInput: '1 2 3 4 5\n2', starter: PY_TEMPLATE,
        hints: ['Wynik to `t[k:] + t[:k]`.'],
        checks: [{ pattern: '\\[\\s*\\w+\\s*:\\s*\\]', message: 'Użyj wycinków, np. t[k:].' }],
        solution: `t = input().split()
k = int(input())
wynik = t[k:] + t[:k]
print(*wynik)
`,
        tests: [{ input: '1 2 3 4 5\n2', expected: '3 4 5 1 2' }, { input: '7 8 9\n0', expected: '7 8 9' }],
      },
    ],
  },

  // ─────────────── 9 ───────────────
  {
    id: 'py09', title: 'Listy dynamiczne', subtitle: 'append, pop, sort, wyrażenia listowe', icon: 'Layers', practice: true,
    theory: [
      { type: 'p', text: 'Lista w Pythonie sama zmienia rozmiar. Najważniejsze metody:' },
      { type: 'table', head: ['Operacja', 'Opis'], rows: [
        ['t.append(x)', 'dodaj na koniec'], ['t.insert(i, x)', 'wstaw na pozycję i'], ['t.pop() / t.pop(i)', 'usuń i zwróć ostatni / i-ty element'],
        ['t.remove(x)', 'usuń pierwsze wystąpienie wartości x'], ['t.sort() / sorted(t)', 'sortuj w miejscu / zwróć nową posortowaną'],
        ['t.reverse()', 'odwróć w miejscu'], ['x in t, t.count(x), t.index(x)', 'czy jest, ile razy, gdzie'],
      ] },
      { type: 'h', text: 'Wyrażenia listowe (list comprehension)' },
      { type: 'code', run: true, code: `kwadraty = [x * x for x in range(1, 6)]          # [1, 4, 9, 16, 25]
parzyste = [x for x in range(10) if x % 2 == 0]   # [0, 2, 4, 6, 8]
print(kwadraty, parzyste)` },
    ],
    example: {
      title: 'Lista zakupów',
      description: 'Dodawanie, usuwanie, sortowanie i wyrażenia listowe.',
      code: `zakupy = ["chleb", "mleko"]
zakupy.append("ser")
zakupy.insert(0, "jablka")
zakupy.remove("mleko")
zakupy.sort()
print(f"Zakupy ({len(zakupy)}): {', '.join(zakupy)}")

liczby = [7, 3, 9]
liczby.append(1)
ostatnia = liczby.pop()
print("Zdjeto:", ostatnia, "zostalo:", liczby)
print("Posortowane malejaco:", sorted(liczby, reverse=True))
print("Podwojone:", [x * 2 for x in liczby])
`,
    },
    tasks: [
      {
        id: 'py09t1', title: 'Zbieraj aż do zera', difficulty: 1,
        description: 'Wczytuj liczby (każdą w osobnej linii) do listy, aż pojawi się `0` (zera nie dodawaj). Wypisz liczbę elementów, sumę i elementy od końca:',
        expectedOutput: 'Ilosc: 3\nSuma: 12\n7 3 2', exampleInput: '2\n3\n7\n0', starter: PY_TEMPLATE,
        hints: ['`while True:` – wczytaj `x`, jeśli `x == 0` to `break`, inaczej `t.append(x)`.', 'Od końca: `print(*t[::-1])`.'],
        checks: [{ pattern: '\\.append\\s*\\(', message: 'Dodawaj elementy metodą append.' }],
        solution: `t = []
while True:
    x = int(input())
    if x == 0:
        break
    t.append(x)
print(f"Ilosc: {len(t)}")
print(f"Suma: {sum(t)}")
print(*t[::-1])
`,
        tests: [{ input: '2\n3\n7\n0', expected: 'Ilosc: 3\nSuma: 12\n7 3 2' }, { input: '5\n0', expected: 'Ilosc: 1\nSuma: 5\n5' }],
      },
      {
        id: 'py09t2', title: 'Usuń ujemne', difficulty: 1,
        description: 'Wczytaj linię liczb. Używając **wyrażenia listowego**, utwórz listę bez liczb ujemnych, posortuj ją rosnąco i wypisz.',
        expectedOutput: '0 3 5', exampleInput: '5 -2 3 -7 0', starter: PY_TEMPLATE,
        hints: ['`nowa = [x for x in t if x >= 0]`', 'Potem `nowa.sort()` i `print(*nowa)`.'],
        checks: [{ pattern: '\\[[^\\]]*\\bfor\\b[^\\]]*\\bif\\b', message: 'Użyj wyrażenia listowego z warunkiem: [x for x in t if ...].' }],
        solution: `t = list(map(int, input().split()))
nowa = [x for x in t if x >= 0]
nowa.sort()
print(*nowa)
`,
        tests: [{ input: '5 -2 3 -7 0', expected: '0 3 5' }, { input: '9 8 7', expected: '7 8 9' }],
      },
    ],
  },

  // ─────────────── 10 ───────────────
  {
    id: 'py10', title: 'Pętla for-each', subtitle: 'for x in, enumerate, zip', icon: 'RefreshCw', practice: true,
    theory: [
      { type: 'p', text: 'W Pythonie każda pętla `for` jest pętlą „for-each”: przechodzi po elementach listy, napisu, słownika czy zakresu.' },
      { type: 'code', run: true, code: `for x in [4, 8, 15]:
    print(x, end=" ")
print()
for i, imie in enumerate(["Ola", "Jan"], start=1):   # numer + element
    print(i, imie)
for a, b in zip([1, 2, 3], ["a", "b", "c"]):          # dwie listy naraz
    print(a, b, end=" | ")
print()` },
      { type: 'list', items: [
        'Zmiana zmiennej pętli (`x = 0`) nie zmienia listy – do modyfikacji elementów użyj indeksów albo wyrażenia listowego.',
        'Nie dodawaj ani nie usuwaj elementów listy, po której właśnie iterujesz – iteruj po kopii: `for x in t[:]:`.',
        'Po słowniku: `for klucz, wartosc in d.items():`.',
      ] },
    ],
    example: {
      title: 'Statystyki ocen',
      description: 'Pętla po liście, po napisie, enumerate i zip.',
      code: `oceny = [4, 5, 3, 6, 4]
najlepsza = 0
for o in oceny:
    if o > najlepsza:
        najlepsza = o
print(f"Srednia: {sum(oceny) / len(oceny):.2f}, najlepsza: {najlepsza}")

samogloski = 0
for c in "programowanie":
    if c in "aeiouy":
        samogloski += 1
print("Samogloski:", samogloski)

for nr, o in enumerate(oceny, start=1):
    print(f"{nr}. {o}")

przedmioty = ["mat", "fiz", "inf"]
for p, o in zip(przedmioty, oceny):
    print(p, "->", o)
`,
    },
    tasks: [
      {
        id: 'py10t1', title: 'Parzyste w liście', difficulty: 1,
        description: 'Wczytaj linię liczb. Pętlą **for** po elementach policz liczby parzyste i ich sumę:',
        expectedOutput: 'Parzyste: 3, suma: 12', exampleInput: '1 2 4 5 6', starter: PY_TEMPLATE,
        hints: ['`for x in t:` i warunek `x % 2 == 0`.'],
        checks: [{ pattern: 'for\\s+\\w+\\s+in\\s+(?!range)', message: 'Przechodź po elementach listy: for x in t.' }],
        solution: `t = list(map(int, input().split()))
ile = 0
suma = 0
for x in t:
    if x % 2 == 0:
        ile += 1
        suma += x
print(f"Parzyste: {ile}, suma: {suma}")
`,
        tests: [{ input: '1 2 4 5 6', expected: 'Parzyste: 3, suma: 12' }, { input: '1 3 5', expected: 'Parzyste: 0, suma: 0' }],
      },
      {
        id: 'py10t2', title: 'Ponumerowana lista', difficulty: 1,
        description: 'Wczytaj linię słów i wypisz je ponumerowane od 1, każde w osobnej linii, w formacie `1. slowo`. Użyj `enumerate`.',
        expectedOutput: '1. chleb\n2. mleko\n3. ser', exampleInput: 'chleb mleko ser', starter: PY_TEMPLATE,
        hints: ['`for i, s in enumerate(slowa, start=1):`'],
        checks: [{ pattern: 'enumerate\\s*\\(', message: 'Użyj funkcji enumerate.' }],
        solution: `slowa = input().split()
for i, s in enumerate(slowa, start=1):
    print(f"{i}. {s}")
`,
        tests: [{ input: 'chleb mleko ser', expected: '1. chleb\n2. mleko\n3. ser' }, { input: 'woda', expected: '1. woda' }],
      },
    ],
  },

  // ─────────────── 11 ───────────────
  {
    id: 'py11', title: 'Znaki i kody', subtitle: 'ord, chr, niezmienność napisów', icon: 'Quote', practice: false,
    theory: [
      { type: 'p', text: 'Python nie ma osobnego typu „znak” – pojedynczy znak to napis długości 1. Każdy znak ma kod Unicode: `ord("A")` daje 65, a `chr(66)` daje `"B"`.' },
      { type: 'code', run: true, code: `print(ord("a"), chr(98))            # 97 b
print(chr(ord("a") + 1))             # b – nastepna litera
print(int("7"), ord("7") - ord("0")) # dwa sposoby na cyfre` },
      { type: 'h', text: 'Napisy są niezmienne' },
      { type: 'p', text: 'Nie można zmienić znaku `s[0] = "X"` (TypeError). Aby zmieniać tekst znak po znaku, zamieniamy go na **listę znaków**, modyfikujemy i sklejamy metodą `"".join(lista)`.' },
      { type: 'code', run: true, code: `znaki = list("kot")
znaki[0] = "K"
print("".join(znaki))      # Kot
print("".join(reversed("kot")))` },
      { type: 'tip', text: 'Sklejanie wielu kawałków przez `+=` w pętli jest wolniejsze niż zebranie ich w liście i jedno `"".join(...)` na końcu.' },
    ],
    example: {
      title: 'Kody znaków',
      description: 'Zamiana znaków na kody i z powrotem, lista znaków i join.',
      code: `slowo = "Python"
for c in slowo:
    print(c, ord(c), end=" | ")
print()

alfabet = "".join(chr(ord("a") + i) for i in range(26))
print(alfabet)

znaki = list("programowanie")
znaki[0] = znaki[0].upper()
znaki.reverse()
print("".join(znaki))
`,
    },
    tasks: [
      {
        id: 'py11t1', title: 'Kody liter', difficulty: 1,
        description: 'Wczytaj słowo i wypisz w jednej linii kody (`ord`) jego kolejnych znaków, oddzielone spacją.',
        expectedOutput: '75 111 116', exampleInput: 'Kot', starter: PY_TEMPLATE,
        hints: ['`kody = [ord(c) for c in s]` i `print(*kody)`.'],
        checks: [{ pattern: 'ord\\s*\\(', message: 'Użyj funkcji ord.' }],
        solution: `s = input()
kody = [ord(c) for c in s]
print(*kody)
`,
        tests: [{ input: 'Kot', expected: '75 111 116' }, { input: 'a', expected: '97' }],
      },
      {
        id: 'py11t2', title: 'Następne litery', difficulty: 2,
        description: 'Wczytaj słowo złożone z małych liter i zamień każdą literę na następną w alfabecie (`z` → `a`). Zbuduj wynik jako listę znaków i sklej ją `"".join(...)`.',
        expectedOutput: 'lpu', exampleInput: 'kot', starter: PY_TEMPLATE,
        hints: ['Następna litera: `chr((ord(c) - ord("a") + 1) % 26 + ord("a"))`.'],
        checks: [{ pattern: 'join\\s*\\(', message: 'Sklej znaki metodą join.' }],
        solution: `s = input()
wynik = []
for c in s:
    wynik.append(chr((ord(c) - ord("a") + 1) % 26 + ord("a")))
print("".join(wynik))
`,
        tests: [{ input: 'kot', expected: 'lpu' }, { input: 'xyz', expected: 'yza' }],
      },
    ],
  },
];
