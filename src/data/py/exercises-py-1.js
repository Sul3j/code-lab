// Dodatkowe zadania Python – tematy 1–16.
import { PY_TEMPLATE } from '../lang-templates.js';

// uzupełnia przykładowe wejście/wyjście na podstawie pierwszego testu
export const mk = (t) => ({
  starter: PY_TEMPLATE,
  exampleInput: t.tests[0].input === '' ? undefined : t.tests[0].input,
  expectedOutput: t.tests[0].expected,
  ...t,
});

export const EX_PY_1 = {
  py01: [
    mk({
      id: 'py01t3', title: 'Przelicznik czasu', difficulty: 1,
      description: 'Wczytaj liczbę sekund i zamień ją na godziny, minuty i sekundy. Użyj dzielenia całkowitego `//` i reszty `%`.',
      hints: ['Godziny: `s // 3600`, minuty: `s % 3600 // 60`, sekundy: `s % 60`.'],
      solution: `s = int(input())
h = s // 3600
m = s % 3600 // 60
sek = s % 60
print(f"{s} s = {h} h {m} min {sek} s")
`,
      tests: [
        { input: '3725', expected: '3725 s = 1 h 2 min 5 s' },
        { input: '59', expected: '59 s = 0 h 0 min 59 s' },
        { input: '7200', expected: '7200 s = 2 h 0 min 0 s' },
      ],
    }),
    mk({
      id: 'py01t4', title: 'Cena z rabatem', difficulty: 1,
      description: 'Wczytaj cenę (liczba rzeczywista) i rabat w procentach (liczba całkowita) – każdą w osobnej linii. Wypisz kwotę do zapłaty z dwoma miejscami po przecinku.',
      hints: ['`cena = float(input())`', 'Format: `f"{kwota:.2f}"`.'],
      solution: `cena = float(input())
rabat = int(input())
kwota = cena * (100 - rabat) / 100
print(f"Do zaplaty: {kwota:.2f}")
`,
      tests: [
        { input: '95\n10', expected: 'Do zaplaty: 85.50' },
        { input: '200\n25', expected: 'Do zaplaty: 150.00' },
        { input: '19.99\n0', expected: 'Do zaplaty: 19.99' },
      ],
    }),
  ],

  py02: [
    mk({
      id: 'py02t3', title: 'Rok przestępny', difficulty: 2,
      description: 'Rok jest przestępny, gdy dzieli się przez 4 i nie dzieli się przez 100, albo gdy dzieli się przez 400. Wczytaj rok i wypisz `Rok przestepny` albo `Rok zwykly`.',
      hints: ['Warunek: `(r % 4 == 0 and r % 100 != 0) or r % 400 == 0`.'],
      checks: [{ pattern: '%\\s*400', message: 'Uwzględnij regułę podzielności przez 400.' }],
      solution: `r = int(input())
if (r % 4 == 0 and r % 100 != 0) or r % 400 == 0:
    print("Rok przestepny")
else:
    print("Rok zwykly")
`,
      tests: [
        { input: '2024', expected: 'Rok przestepny' },
        { input: '1900', expected: 'Rok zwykly' },
        { input: '2000', expected: 'Rok przestepny' },
        { input: '2023', expected: 'Rok zwykly' },
      ],
    }),
    mk({
      id: 'py02t4', title: 'Ocena z punktów', difficulty: 2,
      description: 'Wczytaj liczbę punktów (0–100) i wypisz ocenę według skali: 0–39 niedostateczny, 40–54 dopuszczajacy, 55–69 dostateczny, 70–84 dobry, 85–94 bardzo dobry, 95–100 celujacy. Dla liczby spoza zakresu wypisz `Bledne dane`.',
      hints: ['Najpierw sprawdź zakres: `if not 0 <= p <= 100:`', 'Potem kolejne progi w `elif`.'],
      checks: [{ pattern: '\\belif\\b', message: 'Użyj instrukcji elif.' }],
      solution: `p = int(input())
if not 0 <= p <= 100:
    print("Bledne dane")
else:
    if p < 40:
        ocena = "niedostateczny"
    elif p < 55:
        ocena = "dopuszczajacy"
    elif p < 70:
        ocena = "dostateczny"
    elif p < 85:
        ocena = "dobry"
    elif p < 95:
        ocena = "bardzo dobry"
    else:
        ocena = "celujacy"
    print(f"Ocena: {ocena}")
`,
      tests: [
        { input: '87', expected: 'Ocena: bardzo dobry' },
        { input: '39', expected: 'Ocena: niedostateczny' },
        { input: '100', expected: 'Ocena: celujacy' },
        { input: '55', expected: 'Ocena: dostateczny' },
        { input: '120', expected: 'Bledne dane' },
      ],
    }),
  ],

  py03: [
    mk({
      id: 'py03t3', title: 'Tabliczka mnożenia', difficulty: 1,
      description: 'Wczytaj liczbę `n` i wypisz jej tabliczkę mnożenia od 1 do 10 w formacie `n x i = wynik`.',
      hints: ['`for i in range(1, 11):`'],
      checks: [{ pattern: '\\bfor\\b', message: 'Użyj pętli for.' }],
      solution: `n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
`,
      tests: [
        { input: '3', expected: '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30' },
        { input: '7', expected: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70' },
      ],
    }),
    mk({
      id: 'py03t4', title: 'Potęga dwójki', difficulty: 2,
      description: 'Wczytaj liczbę dodatnią `n` i za pomocą pętli `while` znajdź najmniejszą potęgę dwójki, która jest większa lub równa `n`.',
      hints: ['Zacznij od `p = 1` i podwajaj, dopóki `p < n`.'],
      checks: [{ pattern: '\\bwhile\\b', message: 'Użyj pętli while.' }],
      solution: `n = int(input())
p = 1
while p < n:
    p *= 2
print(f"Najmniejsza potega 2 >= {n}: {p}")
`,
      tests: [
        { input: '100', expected: 'Najmniejsza potega 2 >= 100: 128' },
        { input: '1', expected: 'Najmniejsza potega 2 >= 1: 1' },
        { input: '64', expected: 'Najmniejsza potega 2 >= 64: 64' },
      ],
    }),
  ],

  py04: [
    mk({
      id: 'py04t3', title: 'Nazwa miesiąca', difficulty: 1,
      description: 'Klasa `Miesiac(Enum)` ma wartości od `STYCZEN = 1` do `GRUDZIEN = 12`. Wczytaj numer miesiąca i wypisz nazwę elementu (`Miesiac(n).name`). Dla numeru spoza 1–12 wypisz `Brak miesiaca`.',
      starter: `from enum import Enum


class Miesiac(Enum):
    STYCZEN = 1
    LUTY = 2
    MARZEC = 3
    KWIECIEN = 4
    MAJ = 5
    CZERWIEC = 6
    LIPIEC = 7
    SIERPIEN = 8
    WRZESIEN = 9
    PAZDZIERNIK = 10
    LISTOPAD = 11
    GRUDZIEN = 12


# Twój kod tutaj
`,
      hints: ['Element po wartości: `Miesiac(3)` → `Miesiac.MARZEC`.', 'Nazwa: `.name`.'],
      checks: [{ pattern: 'Miesiac\\s*\\(', message: 'Pobierz element wyliczenia przez Miesiac(n).' }],
      solution: `from enum import Enum


class Miesiac(Enum):
    STYCZEN = 1
    LUTY = 2
    MARZEC = 3
    KWIECIEN = 4
    MAJ = 5
    CZERWIEC = 6
    LIPIEC = 7
    SIERPIEN = 8
    WRZESIEN = 9
    PAZDZIERNIK = 10
    LISTOPAD = 11
    GRUDZIEN = 12


n = int(input())
if 1 <= n <= 12:
    print(f"Miesiac: {Miesiac(n).name}")
else:
    print("Brak miesiaca")
`,
      tests: [
        { input: '3', expected: 'Miesiac: MARZEC' },
        { input: '12', expected: 'Miesiac: GRUDZIEN' },
        { input: '13', expected: 'Brak miesiaca' },
        { input: '0', expected: 'Brak miesiaca' },
      ],
    }),
    mk({
      id: 'py04t4', title: 'Kompas', difficulty: 2,
      description: 'Robot stoi zwrócony na północ. Wczytaj linię poleceń `P` (obrót w prawo) i `L` (obrót w lewo). Kierunki zapisz w `Kierunek(Enum)`: `POLNOC = 0`, `WSCHOD = 1`, `POLUDNIE = 2`, `ZACHOD = 3` i wypisz nazwę kierunku końcowego.',
      starter: `from enum import Enum


class Kierunek(Enum):
    POLNOC = 0
    WSCHOD = 1
    POLUDNIE = 2
    ZACHOD = 3


# Twój kod tutaj
`,
      hints: ['Obrót w prawo: `k = Kierunek((k.value + 1) % 4)`.', 'Obrót w lewo: `+ 3` zamiast `+ 1`.'],
      checks: [{ pattern: 'Kierunek\\s*\\(', message: 'Wyznacz nowy kierunek przez Kierunek(wartosc).' }],
      solution: `from enum import Enum


class Kierunek(Enum):
    POLNOC = 0
    WSCHOD = 1
    POLUDNIE = 2
    ZACHOD = 3


k = Kierunek.POLNOC
for p in input().split():
    if p == "P":
        k = Kierunek((k.value + 1) % 4)
    elif p == "L":
        k = Kierunek((k.value + 3) % 4)
print(f"Kierunek: {k.name}")
`,
      tests: [
        { input: 'P P L', expected: 'Kierunek: WSCHOD' },
        { input: 'L', expected: 'Kierunek: ZACHOD' },
        { input: 'P P P P', expected: 'Kierunek: POLNOC' },
        { input: 'L L L P P', expected: 'Kierunek: ZACHOD' },
      ],
    }),
  ],

  py05: [
    mk({
      id: 'py05t3', title: 'Alias czy kopia?', difficulty: 2,
      description: 'Wczytaj linię liczb do listy `a`. Utwórz `b = a` (alias) oraz `c = a.copy()` (kopia), a potem dopisz liczbę 99 do listy `b`. Wypisz długości list `a` i `c` oraz wynik porównań `a is b` i `a is c`.',
      hints: ['`b = a` nie tworzy nowej listy – obie nazwy wskazują ten sam obiekt.'],
      checks: [{ pattern: '\\.copy\\s*\\(\\s*\\)|\\[\\s*:\\s*\\]', message: 'Utwórz kopię listy (copy() albo [:]).' }, { pattern: '\\bis\\b', message: 'Użyj operatora is.' }],
      solution: `a = list(map(int, input().split()))
b = a
c = a.copy()
b.append(99)
print("Dlugosc a:", len(a))
print("Dlugosc c:", len(c))
print("a is b:", a is b)
print("a is c:", a is c)
`,
      tests: [
        { input: '1 2 3', expected: 'Dlugosc a: 4\nDlugosc c: 3\na is b: True\na is c: False' },
        { input: '7', expected: 'Dlugosc a: 2\nDlugosc c: 1\na is b: True\na is c: False' },
      ],
    }),
    mk({
      id: 'py05t4', title: 'Liczba a lista w funkcji', difficulty: 2,
      description: 'Napisz funkcje `zwieksz(x)` (wykonuje `x += 1`, nic nie zwraca) oraz `dopisz(lista, x)` (dopisuje `x + 1` do listy). Wczytaj `n`, utwórz `t = [n]`, wywołaj obie funkcje i wypisz `n` oraz `t`. Zobaczysz, że liczby się nie zmieniają, a listy – tak.',
      hints: ['Liczby są niezmienne – `x += 1` w funkcji tworzy nowy obiekt lokalny.', 'Lista jest zmienna – `append` zmienia obiekt widoczny też poza funkcją.'],
      checks: [{ pattern: 'def\\s+zwieksz\\s*\\(', message: 'Zdefiniuj funkcję zwieksz.' }, { pattern: 'def\\s+dopisz\\s*\\(', message: 'Zdefiniuj funkcję dopisz.' }],
      solution: `def zwieksz(x):
    x += 1


def dopisz(lista, x):
    lista.append(x + 1)


n = int(input())
t = [n]
zwieksz(n)
dopisz(t, n)
print("Po zwieksz:", n)
print("Po dopisz:", t)
`,
      tests: [
        { input: '5', expected: 'Po zwieksz: 5\nPo dopisz: [5, 6]' },
        { input: '-1', expected: 'Po zwieksz: -1\nPo dopisz: [-1, 0]' },
      ],
    }),
  ],

  py06: [
    mk({
      id: 'py06t2', title: 'Pierwsze dłuższe słowo', difficulty: 1,
      description: 'Wczytaj linię słów i liczbę `k`. Znajdź pierwsze słowo dłuższe niż `k` znaków – zmienna z wynikiem ma początkowo wartość `None`. Wypisz słowo albo `brak` (sprawdź `is None`).',
      hints: ['`znalezione = None`', '`if znalezione is None:`'],
      checks: [{ pattern: 'is\\s+None|is\\s+not\\s+None', message: 'Sprawdź wynik przez is None.' }],
      solution: `slowa = input().split()
k = int(input())
znalezione = None
for s in slowa:
    if len(s) > k:
        znalezione = s
        break
if znalezione is None:
    print("Znaleziono: brak")
else:
    print("Znaleziono:", znalezione)
`,
      tests: [
        { input: 'ala ma kota\n3', expected: 'Znaleziono: kota' },
        { input: 'ala ma kota\n5', expected: 'Znaleziono: brak' },
        { input: 'programowanie jest super\n2', expected: 'Znaleziono: programowanie' },
      ],
    }),
    mk({
      id: 'py06t3', title: 'Oceny z nieobecnościami', difficulty: 2,
      description: 'Wczytaj `n`, a potem `n` linii – ocenę albo `-` (uczeń nieobecny). Zapisz je w liście, gdzie nieobecność to `None`. Wypisz liczbę obecnych i średnią ich ocen z dwoma miejscami po przecinku, a gdy nikt nie był obecny – `Srednia: brak`.',
      hints: ['`oceny.append(None if s == "-" else int(s))`', 'Obecni: `[o for o in oceny if o is not None]`.'],
      checks: [{ pattern: '\\bNone\\b', message: 'Zapisz nieobecność jako None.' }],
      solution: `n = int(input())
oceny = []
for _ in range(n):
    s = input()
    oceny.append(None if s == "-" else int(s))
obecni = [o for o in oceny if o is not None]
print("Obecni:", len(obecni))
if obecni:
    print(f"Srednia: {sum(obecni) / len(obecni):.2f}")
else:
    print("Srednia: brak")
`,
      tests: [
        { input: '4\n5\n-\n4\n4', expected: 'Obecni: 3\nSrednia: 4.33' },
        { input: '2\n-\n-', expected: 'Obecni: 0\nSrednia: brak' },
        { input: '1\n6', expected: 'Obecni: 1\nSrednia: 6.00' },
      ],
    }),
    mk({
      id: 'py06t4', title: 'Lista jednokierunkowa', difficulty: 3,
      description: 'Klasa `Wezel` przechowuje wartość i odwołanie do następnego węzła (`None` na końcu). Wczytaj linię liczb i dodawaj każdą **na początek** listy. Potem przejdź listę pętlą `while w is not None` i wypisz elementy oraz ich sumę.',
      starter: `class Wezel:
    def __init__(self, wartosc, nastepny):
        self.wartosc = wartosc
        self.nastepny = nastepny


# Twój kod tutaj
`,
      hints: ['Dodanie na początek: `glowa = Wezel(x, glowa)`.', 'Przejście: `w = glowa` i w pętli `w = w.nastepny`.'],
      checks: [{ pattern: 'while\\s+\\w+\\s+is\\s+not\\s+None', message: 'Przejdź listę pętlą while w is not None.' }],
      solution: `class Wezel:
    def __init__(self, wartosc, nastepny):
        self.wartosc = wartosc
        self.nastepny = nastepny


glowa = None
for s in input().split():
    glowa = Wezel(int(s), glowa)

elementy = []
suma = 0
w = glowa
while w is not None:
    elementy.append(w.wartosc)
    suma += w.wartosc
    w = w.nastepny
print("Lista:", *elementy)
print("Suma:", suma)
`,
      tests: [
        { input: '1 2 3', expected: 'Lista: 3 2 1\nSuma: 6' },
        { input: '10', expected: 'Lista: 10\nSuma: 10' },
        { input: '5 -2 7 0', expected: 'Lista: 0 7 -2 5\nSuma: 10' },
      ],
    }),
  ],

  py07: [
    mk({
      id: 'py07t3', title: 'Większe od średniej', difficulty: 2,
      description: 'Wczytaj linię liczb całkowitych do listy. Wypisz ich średnią (2 miejsca po przecinku) i liczbę elementów większych od średniej.',
      hints: ['`srednia = sum(t) / len(t)`', 'Druga pętla zlicza elementy `> srednia`.'],
      solution: `t = list(map(int, input().split()))
srednia = sum(t) / len(t)
wieksze = 0
for x in t:
    if x > srednia:
        wieksze += 1
print(f"Srednia: {srednia:.2f}")
print("Wieksze:", wieksze)
`,
      tests: [
        { input: '2 8 5 9 1', expected: 'Srednia: 5.00\nWieksze: 2' },
        { input: '4 4 4', expected: 'Srednia: 4.00\nWieksze: 0' },
        { input: '1 2', expected: 'Srednia: 1.50\nWieksze: 1' },
      ],
    }),
    mk({
      id: 'py07t4', title: 'Sumy wierszy macierzy', difficulty: 2,
      description: 'Pierwsza linia zawiera liczbę wierszy `w` i kolumn `k`, kolejne `w` linii – elementy macierzy. Zapisz macierz jako listę list, wypisz sumę każdego wiersza i sumę wszystkich elementów.',
      hints: ['`m = [list(map(int, input().split())) for _ in range(w)]`', 'Suma wiersza: `sum(m[i])`.'],
      solution: `w, k = map(int, input().split())
m = []
for _ in range(w):
    m.append(list(map(int, input().split())))
razem = 0
for i in range(w):
    s = sum(m[i])
    print(f"Wiersz {i + 1}: {s}")
    razem += s
print("Suma:", razem)
`,
      tests: [
        { input: '2 3\n1 2 3\n4 5 6', expected: 'Wiersz 1: 6\nWiersz 2: 15\nSuma: 21' },
        { input: '3 1\n5\n-2\n7', expected: 'Wiersz 1: 5\nWiersz 2: -2\nWiersz 3: 7\nSuma: 10' },
      ],
    }),
  ],

  py08: [
    mk({
      id: 'py08t2', title: 'Fragmenty listy', difficulty: 1,
      description: 'Wczytaj linię liczb (co najmniej 3). Za pomocą **wycinków** wypisz pierwsze trzy elementy, ostatnie trzy i co drugi element (od pierwszego).',
      hints: ['`t[:3]`, `t[-3:]`, `t[::2]`'],
      checks: [{ pattern: '\\[\\s*-3\\s*:\\s*\\]', message: 'Ostatnie trzy elementy pobierz wycinkiem [-3:].' }, { pattern: '\\[\\s*:\\s*:\\s*2\\s*\\]', message: 'Co drugi element pobierz wycinkiem [::2].' }],
      solution: `t = list(map(int, input().split()))
print("Pierwsze 3:", t[:3])
print("Ostatnie 3:", t[-3:])
print("Co drugi:", t[::2])
`,
      tests: [
        { input: '1 2 3 4 5 6 7', expected: 'Pierwsze 3: [1, 2, 3]\nOstatnie 3: [5, 6, 7]\nCo drugi: [1, 3, 5, 7]' },
        { input: '9 8 7', expected: 'Pierwsze 3: [9, 8, 7]\nOstatnie 3: [9, 8, 7]\nCo drugi: [9, 7]' },
      ],
    }),
    mk({
      id: 'py08t3', title: 'Symetryczna lista', difficulty: 1,
      description: 'Wczytaj linię liczb i sprawdź, czy lista czytana od końca jest taka sama (porównaj ją z wycinkiem `[::-1]`). Wypisz `Symetryczna: Tak` lub `Nie`.',
      hints: ['`t == t[::-1]`'],
      checks: [{ pattern: '\\[\\s*:\\s*:\\s*-1\\s*\\]', message: 'Odwróć listę wycinkiem [::-1].' }],
      solution: `t = input().split()
print("Symetryczna:", "Tak" if t == t[::-1] else "Nie")
`,
      tests: [
        { input: '1 2 3 2 1', expected: 'Symetryczna: Tak' },
        { input: '1 2 3', expected: 'Symetryczna: Nie' },
        { input: '5', expected: 'Symetryczna: Tak' },
      ],
    }),
    mk({
      id: 'py08t4', title: 'Kopia wycinkiem', difficulty: 2,
      description: 'Wczytaj linię liczb do listy `a`. Utwórz kopię `b = a[:]`, w kopii ustaw pierwszy element na 0 i odwróć ją metodą `reverse()`. Wypisz obie listy – oryginał ma zostać bez zmian.',
      hints: ['Wycinek `[:]` tworzy nową listę.'],
      checks: [{ pattern: '\\[\\s*:\\s*\\]', message: 'Utwórz kopię wycinkiem [:].' }],
      solution: `a = list(map(int, input().split()))
b = a[:]
b[0] = 0
b.reverse()
print("a:", a)
print("b:", b)
`,
      tests: [
        { input: '5 3 8', expected: 'a: [5, 3, 8]\nb: [8, 3, 0]' },
        { input: '1', expected: 'a: [1]\nb: [0]' },
      ],
    }),
  ],

  py09: [
    mk({
      id: 'py09t3', title: 'Bez duplikatów', difficulty: 1,
      description: 'Wczytaj linię liczb i zbuduj listę bez powtórzeń, zachowując kolejność pierwszych wystąpień. Wypisz elementy oddzielone spacjami.',
      hints: ['Dodawaj tylko, gdy `x not in wynik`.', 'Wypisanie: `print(*wynik)`.'],
      checks: [{ pattern: 'not\\s+in', message: 'Sprawdzaj operatorem not in, czy liczba już jest na liście.' }],
      solution: `wynik = []
for x in map(int, input().split()):
    if x not in wynik:
        wynik.append(x)
print(*wynik)
`,
      tests: [
        { input: '1 5 1 2 5', expected: '1 5 2' },
        { input: '7 7 7', expected: '7' },
        { input: '3 1 2', expected: '3 1 2' },
      ],
    }),
    mk({
      id: 'py09t4', title: 'Wstawianie z zachowaniem porządku', difficulty: 2,
      description: 'Wczytaj linię liczb. Każdą liczbę wstaw do listy metodą `insert` w takie miejsce, aby lista była cały czas uporządkowana rosnąco (bez `sort` i `sorted`). Wypisz listę.',
      hints: ['Szukaj pozycji: `i = 0; while i < len(lista) and lista[i] < x: i += 1`', 'Potem `lista.insert(i, x)`.'],
      checks: [{ pattern: '\\.insert\\s*\\(', message: 'Użyj metody insert.' }],
      solution: `lista = []
for x in map(int, input().split()):
    i = 0
    while i < len(lista) and lista[i] < x:
        i += 1
    lista.insert(i, x)
print("Lista:", *lista)
`,
      tests: [
        { input: '4 1 7 3', expected: 'Lista: 1 3 4 7' },
        { input: '5 5 -2', expected: 'Lista: -2 5 5' },
      ],
    }),
  ],

  py10: [
    mk({
      id: 'py10t3', title: 'Liczba wystąpień słowa', difficulty: 1,
      description: 'Wczytaj linię słów, a w drugiej linii szukane słowo. Pętlą `for` (bez metody `count`) policz, ile razy występuje.',
      hints: ['`for s in slowa: if s == szukane: ile += 1`'],
      checks: [{ pattern: 'for\\s+\\w+\\s+in', message: 'Użyj pętli for ... in.' }],
      solution: `slowa = input().split()
szukane = input()
ile = 0
for s in slowa:
    if s == szukane:
        ile += 1
print("Wystapienia:", ile)
`,
      tests: [
        { input: 'kot pies kot ryba kot\nkot', expected: 'Wystapienia: 3' },
        { input: 'ala ma kota\npies', expected: 'Wystapienia: 0' },
      ],
    }),
    mk({
      id: 'py10t4', title: 'Dodatnie i ujemne', difficulty: 2,
      description: 'Wczytaj linię liczb całkowitych. Pętlą `for` policz liczby dodatnie i ujemne oraz ich sumy (zera pomijamy). Wypisz:',
      hints: ['Cztery zmienne: licznik i suma dla dodatnich oraz dla ujemnych.'],
      checks: [{ pattern: 'for\\s+\\w+\\s+in', message: 'Użyj pętli for ... in.' }],
      solution: `ile_d = suma_d = ile_u = suma_u = 0
for x in map(int, input().split()):
    if x > 0:
        ile_d += 1
        suma_d += x
    elif x < 0:
        ile_u += 1
        suma_u += x
print(f"Dodatnie: {ile_d} (suma {suma_d})")
print(f"Ujemne: {ile_u} (suma {suma_u})")
`,
      tests: [
        { input: '3 -2 0 4 -3 5', expected: 'Dodatnie: 3 (suma 12)\nUjemne: 2 (suma -5)' },
        { input: '0 0 1', expected: 'Dodatnie: 1 (suma 1)\nUjemne: 0 (suma 0)' },
      ],
    }),
  ],

  py11: [
    mk({
      id: 'py11t3', title: 'Suma kodów znaków', difficulty: 1,
      description: 'Wczytaj słowo i wypisz sumę kodów jego znaków (`ord`) oraz znak o największym kodzie.',
      hints: ['`sum(ord(c) for c in s)`', 'Największy kod: `max(s)` albo porównywanie `ord`.'],
      checks: [{ pattern: '\\bord\\s*\\(', message: 'Użyj funkcji ord.' }],
      solution: `s = input()
suma = 0
naj = s[0]
for c in s:
    suma += ord(c)
    if ord(c) > ord(naj):
        naj = c
print("Suma kodow:", suma)
print("Najwiekszy kod:", naj, ord(naj))
`,
      tests: [
        { input: 'abc', expected: 'Suma kodow: 294\nNajwiekszy kod: c 99' },
        { input: 'Az', expected: 'Suma kodow: 187\nNajwiekszy kod: z 122' },
      ],
    }),
    mk({
      id: 'py11t4', title: 'Kompresja RLE', difficulty: 3,
      description: 'Kompresja RLE zapisuje ciąg powtarzających się znaków jako znak i liczbę powtórzeń, np. `aaabbc` → `a3b2c1`. Wczytaj słowo i wypisz jego postać skompresowaną.',
      hints: ['Licz powtórzenia bieżącego znaku; gdy następny znak jest inny (lub to koniec), dopisz znak i licznik.', 'Napisy są niezmienne – wygodnie zbierać części w liście i złączyć `"".join(...)`.'],
      solution: `s = input()
czesci = []
licznik = 1
for i in range(1, len(s) + 1):
    if i < len(s) and s[i] == s[i - 1]:
        licznik += 1
    else:
        czesci.append(s[i - 1] + str(licznik))
        licznik = 1
print("".join(czesci))
`,
      tests: [
        { input: 'aaabbc', expected: 'a3b2c1' },
        { input: 'x', expected: 'x1' },
        { input: 'zzzzzyy', expected: 'z5y2' },
      ],
    }),
  ],

  py12: [
    mk({
      id: 'py12t3', title: 'Inicjały', difficulty: 1,
      description: 'Wczytaj imiona i nazwisko (małymi literami, oddzielone spacjami) i wypisz inicjały – wielkie litery zakończone kropkami.',
      hints: ['Pierwsza litera słowa: `s[0].upper()`.'],
      solution: `slowa = input().split()
wynik = ""
for s in slowa:
    wynik += s[0].upper() + "."
print(wynik)
`,
      tests: [
        { input: 'jan maria kowalski', expected: 'J.M.K.' },
        { input: 'ola nowak', expected: 'O.N.' },
      ],
    }),
    mk({
      id: 'py12t4', title: 'Zamiana słowa', difficulty: 2,
      description: 'Wczytaj zdanie, słowo do zastąpienia i nowe słowo (3 linie). Zamień tylko **całe słowa** (np. `kot` nie zmienia się w `kotek`). Wypisz liczbę zamian i nowe zdanie.',
      hints: ['Metoda `replace` zmieniłaby też fragmenty słów – podziel zdanie `split()` i porównuj całe słowa.', 'Złączenie: `" ".join(slowa)`.'],
      solution: `slowa = input().split()
stare = input()
nowe = input()
zamiany = 0
for i in range(len(slowa)):
    if slowa[i] == stare:
        slowa[i] = nowe
        zamiany += 1
print("Zamiany:", zamiany)
print(" ".join(slowa))
`,
      tests: [
        { input: 'kot lubi mleko i kot spi\nkot\npies', expected: 'Zamiany: 2\npies lubi mleko i pies spi' },
        { input: 'kotek i kot\nkot\nlis', expected: 'Zamiany: 1\nkotek i lis' },
      ],
    }),
  ],

  py13: [
    mk({
      id: 'py13t2', title: 'Średnie uczniów', difficulty: 2,
      description: 'Wczytaj `n` i `n` linii `imie ocena` (uczeń może pojawić się kilka razy). Zbierz oceny w słowniku `imie → lista ocen` i wypisz średnie uczniów w kolejności alfabetycznej (2 miejsca po przecinku).',
      hints: ['`oceny.setdefault(imie, []).append(o)`', 'Kolejność alfabetyczna: `for imie in sorted(oceny):`'],
      checks: [{ pattern: '\\{\\s*\\}|dict\\s*\\(', message: 'Użyj słownika.' }],
      solution: `oceny = {}
for _ in range(int(input())):
    imie, o = input().split()
    oceny.setdefault(imie, []).append(int(o))
for imie in sorted(oceny):
    lista = oceny[imie]
    print(f"{imie}: {sum(lista) / len(lista):.2f}")
`,
      tests: [
        { input: '4\nOla 5\nJan 3\nOla 4\nJan 4', expected: 'Jan: 3.50\nOla: 4.50' },
        { input: '1\nEwa 6', expected: 'Ewa: 6.00' },
      ],
    }),
    mk({
      id: 'py13t3', title: 'Licznik liter', difficulty: 2,
      description: 'Wczytaj słowo i policz w słowniku, ile razy występuje każda litera. Wypisz litery w kolejności alfabetycznej w formacie `litera: liczba`.',
      hints: ['`licznik[c] = licznik.get(c, 0) + 1`'],
      checks: [{ pattern: '\\.get\\s*\\(|\\bin\\b', message: 'Zliczaj w słowniku (np. metodą get).' }],
      solution: `s = input()
licznik = {}
for c in s:
    licznik[c] = licznik.get(c, 0) + 1
for c in sorted(licznik):
    print(f"{c}: {licznik[c]}")
`,
      tests: [
        { input: 'banan', expected: 'a: 2\nb: 1\nn: 2' },
        { input: 'zzz', expected: 'z: 3' },
      ],
    }),
    mk({
      id: 'py13t4', title: 'Słownik tłumaczeń', difficulty: 2,
      description: 'Wczytaj `n` i `n` par `polskie angielskie`, a potem zdanie po polsku. Przetłumacz je słowo po słowie; słowa, których nie ma w słowniku, wypisz w nawiasach kwadratowych.',
      hints: ['`slownik.get(s, "[" + s + "]")` – wartość domyślna dla brakującego klucza.'],
      solution: `slownik = {}
for _ in range(int(input())):
    pl, en = input().split()
    slownik[pl] = en
zdanie = input().split()
print(" ".join(slownik.get(s, "[" + s + "]") for s in zdanie))
`,
      tests: [
        { input: '3\nkot cat\nma has\npies dog\nkot ma pies', expected: 'cat has dog' },
        { input: '1\nala ala\nala ma kota', expected: 'ala [ma] [kota]' },
      ],
    }),
  ],

  py14: [
    mk({
      id: 'py14t2', title: 'Iloraz i reszta (krotka)', difficulty: 1,
      description: 'Napisz funkcję `podziel(a, b)`, która zwraca krotkę `(iloraz, reszta)`. Wczytaj `a b`, rozpakuj wynik do dwóch zmiennych i wypisz:',
      hints: ['`return a // b, a % b`', 'Rozpakowanie: `q, r = podziel(a, b)`.'],
      checks: [{ pattern: '\\w+\\s*,\\s*\\w+\\s*=\\s*podziel\\s*\\(', message: 'Rozpakuj krotkę: q, r = podziel(a, b).' }],
      solution: `def podziel(a, b):
    return a // b, a % b


a, b = map(int, input().split())
q, r = podziel(a, b)
print(f"{a} / {b} = {q} reszta {r}")
`,
      tests: [
        { input: '17 5', expected: '17 / 5 = 3 reszta 2' },
        { input: '9 3', expected: '9 / 3 = 3 reszta 0' },
      ],
    }),
    mk({
      id: 'py14t3', title: 'Najbliższy punkt', difficulty: 2,
      description: 'Wczytaj `n` i `n` linii `x y`. Zapisz punkty jako listę krotek i wypisz punkt najbliższy początkowi układu współrzędnych (0, 0).',
      hints: ['`punkty.append((x, y))`', '`min(punkty, key=lambda p: p[0] ** 2 + p[1] ** 2)`'],
      solution: `punkty = []
for _ in range(int(input())):
    x, y = map(int, input().split())
    punkty.append((x, y))
naj = min(punkty, key=lambda p: p[0] ** 2 + p[1] ** 2)
print("Najblizszy:", naj)
`,
      tests: [
        { input: '3\n3 4\n1 2\n-5 0', expected: 'Najblizszy: (1, 2)' },
        { input: '2\n10 10\n-3 -1', expected: 'Najblizszy: (-3, -1)' },
      ],
    }),
    mk({
      id: 'py14t4', title: 'Zamiana przez rozpakowanie', difficulty: 1,
      description: 'Wczytaj `a b` i zamień wartości zmiennych **jedną instrukcją**: `a, b = b, a` (to przypisanie krotki). Wypisz:',
      hints: ['Prawa strona tworzy krotkę `(b, a)`, która jest rozpakowywana do `a` i `b`.'],
      checks: [{ pattern: 'a\\s*,\\s*b\\s*=\\s*b\\s*,\\s*a', message: 'Zamień wartości instrukcją a, b = b, a.' }],
      solution: `a, b = map(int, input().split())
a, b = b, a
print(f"a = {a}, b = {b}")
`,
      tests: [
        { input: '3 5', expected: 'a = 5, b = 3' },
        { input: '-1 8', expected: 'a = 8, b = -1' },
      ],
    }),
  ],

  py15: [
    mk({
      id: 'py15t3', title: 'Liczby doskonałe', difficulty: 2,
      description: 'Liczba doskonała jest równa sumie swoich dzielników mniejszych od niej (np. 6 = 1 + 2 + 3). Napisz funkcję `czy_doskonala(n)`. Wczytaj `n` i wypisz wszystkie liczby doskonałe od 1 do `n` albo `brak`.',
      hints: ['Suma dzielników: `sum(d for d in range(1, n) if n % d == 0)`.', 'Liczba 1 nie jest doskonała.'],
      checks: [{ pattern: 'def\\s+czy_doskonala\\s*\\(', message: 'Zdefiniuj funkcję czy_doskonala(n).' }],
      solution: `def czy_doskonala(n):
    suma = 0
    for d in range(1, n):
        if n % d == 0:
            suma += d
    return n > 1 and suma == n


n = int(input())
wynik = [str(i) for i in range(1, n + 1) if czy_doskonala(i)]
print(f"Doskonale do {n}:", " ".join(wynik) if wynik else "brak")
`,
      tests: [
        { input: '30', expected: 'Doskonale do 30: 6 28' },
        { input: '5', expected: 'Doskonale do 5: brak' },
        { input: '500', expected: 'Doskonale do 500: 6 28 496' },
      ],
    }),
    mk({
      id: 'py15t4', title: 'Symbol Newtona', difficulty: 2,
      description: 'Napisz funkcje `silnia(n)` oraz `newton(n, k)` = n! / (k! · (n − k)!) (bez modułu math). Wczytaj `n k` i wypisz:',
      hints: ['Wynik dzielenia całkowitego: `//` – symbol Newtona jest zawsze liczbą całkowitą.'],
      checks: [{ pattern: 'def\\s+silnia\\s*\\(', message: 'Zdefiniuj funkcję silnia(n).' }],
      solution: `def silnia(n):
    w = 1
    for i in range(2, n + 1):
        w *= i
    return w


def newton(n, k):
    return silnia(n) // (silnia(k) * silnia(n - k))


n, k = map(int, input().split())
print(f"C({n}, {k}) = {newton(n, k)}")
`,
      tests: [
        { input: '5 2', expected: 'C(5, 2) = 10' },
        { input: '10 3', expected: 'C(10, 3) = 120' },
        { input: '6 0', expected: 'C(6, 0) = 1' },
      ],
    }),
  ],

  py16: [
    mk({
      id: 'py16t3', title: 'Odwracanie napisu rekurencyjnie', difficulty: 2,
      description: 'Napisz **rekurencyjną** funkcję `odwroc(s)`: napis krótszy niż 2 znaki zwraca bez zmian, a w przeciwnym razie zwraca `odwroc(reszta) + pierwszy znak`. Wczytaj słowo i wypisz je odwrócone (bez `[::-1]`).',
      hints: ['Reszta napisu: `s[1:]`, pierwszy znak: `s[0]`.'],
      checks: [{ pattern: 'def\\s+odwroc[\\s\\S]*odwroc\\s*\\(\\s*s\\s*\\[', message: 'Funkcja odwroc powinna wywoływać samą siebie.' }],
      solution: `def odwroc(s):
    if len(s) < 2:
        return s
    return odwroc(s[1:]) + s[0]


print(odwroc(input()))
`,
      tests: [
        { input: 'python', expected: 'nohtyp' },
        { input: 'abc', expected: 'cba' },
        { input: 'x', expected: 'x' },
      ],
    }),
    mk({
      id: 'py16t4', title: 'Wieże Hanoi', difficulty: 3,
      description: 'Przenieś `n` krążków z pręta A na pręt C (pomocniczy: B). Napisz rekurencyjną funkcję `hanoi(n, z, na, pom)`, która wypisuje ruchy w postaci `A -> C` i **zwraca** liczbę ruchów. Na końcu wypisz liczbę ruchów.',
      hints: ['Aby przenieść n krążków: przenieś n−1 na pręt pomocniczy, przenieś największy, przenieś n−1 na docelowy.', 'Liczba ruchów: `hanoi(...) + 1 + hanoi(...)`, dla n = 0 zwróć 0.'],
      checks: [{ pattern: 'def\\s+hanoi[\\s\\S]*hanoi\\s*\\(\\s*n\\s*-\\s*1', message: 'Funkcja hanoi powinna być rekurencyjna.' }],
      solution: `def hanoi(n, z, na, pom):
    if n == 0:
        return 0
    ruchy = hanoi(n - 1, z, pom, na)
    print(f"{z} -> {na}")
    ruchy += 1
    ruchy += hanoi(n - 1, pom, na, z)
    return ruchy


n = int(input())
print("Ruchow:", hanoi(n, "A", "C", "B"))
`,
      tests: [
        { input: '1', expected: 'A -> C\nRuchow: 1' },
        { input: '2', expected: 'A -> B\nA -> C\nB -> C\nRuchow: 3' },
        { input: '3', expected: 'A -> C\nA -> B\nC -> B\nA -> C\nB -> A\nB -> C\nA -> C\nRuchow: 7' },
      ],
    }),
  ],
};
