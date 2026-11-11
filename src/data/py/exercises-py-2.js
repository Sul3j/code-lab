// Dodatkowe zadania Python – tematy 17–31 (w tym programowanie obiektowe).
import { mk } from './exercises-py-1.js';

export const EX_PY_2 = {
  py17: [
    mk({
      id: 'py17t2', title: 'Największa z *args', difficulty: 2,
      description: 'Napisz funkcję `najwieksza(*liczby)`, która przyjmuje dowolną liczbę argumentów i zwraca największy (bez wbudowanej funkcji `max`). Wczytaj linię liczb i wypisz wynik wywołania dla dwóch pierwszych liczb oraz dla wszystkich (`najwieksza(*t)`).',
      hints: ['`*liczby` zbiera argumenty w krotkę.', 'Rozpakowanie listy przy wywołaniu: `najwieksza(*t)`.'],
      checks: [{ pattern: 'def\\s+najwieksza\\s*\\(\\s*\\*\\w+', message: 'Funkcja powinna mieć parametr *liczby.' }, { pattern: 'najwieksza\\s*\\(\\s*\\*', message: 'Wywołaj funkcję z rozpakowaną listą: najwieksza(*t).' }],
      solution: `def najwieksza(*liczby):
    wynik = liczby[0]
    for x in liczby:
        if x > wynik:
            wynik = x
    return wynik


t = list(map(int, input().split()))
print("Z dwoch pierwszych:", najwieksza(t[0], t[1]))
print("Ze wszystkich:", najwieksza(*t))
`,
      tests: [
        { input: '3 9 4 12 1', expected: 'Z dwoch pierwszych: 9\nZe wszystkich: 12' },
        { input: '-5 -7', expected: 'Z dwoch pierwszych: -5\nZe wszystkich: -5' },
      ],
    }),
    mk({
      id: 'py17t3', title: 'Powitanie z argumentem domyślnym', difficulty: 1,
      description: 'Napisz funkcję `powitaj(imie, powitanie="Czesc")`. Wczytaj imię i w drugiej linii powitanie – jeśli to `-`, wywołaj funkcję **bez** drugiego argumentu.',
      hints: ['Parametr z wartością domyślną musi być za parametrami bez wartości domyślnej.'],
      checks: [{ pattern: 'powitanie\\s*=\\s*"Czesc"', message: 'Parametr powitanie powinien mieć wartość domyślną "Czesc".' }],
      solution: `def powitaj(imie, powitanie="Czesc"):
    return f"{powitanie}, {imie}!"


imie = input()
pow = input()
if pow == "-":
    print(powitaj(imie))
else:
    print(powitaj(imie, pow))
`,
      tests: [
        { input: 'Ola\n-', expected: 'Czesc, Ola!' },
        { input: 'Jan\nDzien dobry', expected: 'Dzien dobry, Jan!' },
      ],
    }),
    mk({
      id: 'py17t4', title: 'Cena z argumentami nazwanymi', difficulty: 2,
      description: 'Napisz funkcję `cena(netto, vat=23, rabat=0)`, która zwraca cenę brutto po rabacie: netto · (1 − rabat/100) · (1 + vat/100). Wczytaj kwotę netto i rabat. Wypisz cenę bez rabatu oraz z rabatem – drugi raz wywołaj funkcję z **argumentem nazwanym** `rabat=...`.',
      hints: ['Argument nazwany pozwala pominąć `vat`: `cena(netto, rabat=r)`.'],
      checks: [{ pattern: 'cena\\s*\\([^)]*rabat\\s*=', message: 'Wywołaj funkcję z argumentem nazwanym rabat=...' }],
      solution: `def cena(netto, vat=23, rabat=0):
    return netto * (1 - rabat / 100) * (1 + vat / 100)


netto = float(input())
r = int(input())
print(f"Bez rabatu: {cena(netto):.2f}")
print(f"Z rabatem: {cena(netto, rabat=r):.2f}")
`,
      tests: [
        { input: '100\n10', expected: 'Bez rabatu: 123.00\nZ rabatem: 110.70' },
        { input: '50\n0', expected: 'Bez rabatu: 61.50\nZ rabatem: 61.50' },
      ],
    }),
  ],

  py18: [
    mk({
      id: 'py18t2', title: 'Kwadraty liczb (map)', difficulty: 1,
      description: 'Wczytaj linię liczb i wypisz ich kwadraty, używając funkcji `map` z wyrażeniem `lambda`.',
      hints: ['`list(map(lambda x: x * x, t))`'],
      checks: [{ pattern: 'map\\s*\\(\\s*lambda', message: 'Użyj map z wyrażeniem lambda.' }],
      solution: `t = list(map(int, input().split()))
kwadraty = list(map(lambda x: x * x, t))
print(*kwadraty)
`,
      tests: [
        { input: '1 2 3', expected: '1 4 9' },
        { input: '-4 10', expected: '16 100' },
      ],
    }),
    mk({
      id: 'py18t3', title: 'Ile większych od k (filter)', difficulty: 1,
      description: 'Wczytaj linię liczb, a w drugiej linii liczbę `k`. Policz liczby większe od `k`, używając funkcji `filter` z wyrażeniem `lambda`.',
      hints: ['`len(list(filter(lambda x: x > k, t)))`'],
      checks: [{ pattern: 'filter\\s*\\(\\s*lambda', message: 'Użyj filter z wyrażeniem lambda.' }],
      solution: `t = list(map(int, input().split()))
k = int(input())
ile = len(list(filter(lambda x: x > k, t)))
print(f"Wiekszych od {k}: {ile}")
`,
      tests: [
        { input: '3 8 1 9 6\n5', expected: 'Wiekszych od 5: 3' },
        { input: '1 2 3\n10', expected: 'Wiekszych od 10: 0' },
      ],
    }),
    mk({
      id: 'py18t4', title: 'Funkcja jako parametr', difficulty: 2,
      description: 'Napisz funkcję `zastosuj(f, x)`, która zwraca `f(x)`. Wczytaj `x` i wywołaj ją z trzema różnymi wyrażeniami `lambda`:',
      hints: ['Wywołanie: `zastosuj(lambda v: v + 1, x)`.'],
      checks: [{ pattern: 'zastosuj\\s*\\(\\s*lambda', message: 'Przekaż do zastosuj wyrażenie lambda.' }],
      solution: `def zastosuj(f, x):
    return f(x)


x = int(input())
print("x + 1 =", zastosuj(lambda v: v + 1, x))
print("x * x =", zastosuj(lambda v: v * v, x))
print("-x =", zastosuj(lambda v: -v, x))
`,
      tests: [
        { input: '5', expected: 'x + 1 = 6\nx * x = 25\n-x = -5' },
        { input: '-3', expected: 'x + 1 = -2\nx * x = 9\n-x = 3' },
      ],
    }),
  ],

  py19: [
    mk({
      id: 'py19t3', title: 'Pole i obwód koła', difficulty: 1,
      description: 'Wczytaj promień koła (liczba rzeczywista) i wypisz jego pole i obwód z dwoma miejscami po przecinku. Użyj stałej `math.pi`.',
      hints: ['`import math`', 'Pole: `math.pi * r ** 2`, obwód: `2 * math.pi * r`.'],
      checks: [{ pattern: 'math\\.pi|\\bpi\\b', message: 'Użyj stałej math.pi.' }],
      solution: `import math

r = float(input())
print(f"Pole: {math.pi * r ** 2:.2f}")
print(f"Obwod: {2 * math.pi * r:.2f}")
`,
      tests: [
        { input: '5', expected: 'Pole: 78.54\nObwod: 31.42' },
        { input: '1', expected: 'Pole: 3.14\nObwod: 6.28' },
        { input: '2.5', expected: 'Pole: 19.63\nObwod: 15.71' },
      ],
    }),
    mk({
      id: 'py19t4', title: 'Zaokrąglenia', difficulty: 1,
      description: 'Wczytaj liczbę rzeczywistą i wypisz wynik `math.floor` (w dół), `math.ceil` (w górę) i `round` do 2 miejsc po przecinku.',
      hints: ['`round(x, 2)` – drugi argument to liczba miejsc po przecinku.'],
      checks: [{ pattern: 'floor\\s*\\(', message: 'Użyj math.floor.' }, { pattern: 'ceil\\s*\\(', message: 'Użyj math.ceil.' }],
      solution: `import math

x = float(input())
print("Floor:", math.floor(x))
print("Ceil:", math.ceil(x))
print("Round:", round(x, 2))
`,
      tests: [
        { input: '3.14159', expected: 'Floor: 3\nCeil: 4\nRound: 3.14' },
        { input: '-2.71828', expected: 'Floor: -3\nCeil: -2\nRound: -2.72' },
        { input: '7', expected: 'Floor: 7\nCeil: 7\nRound: 7.0' },
      ],
    }),
  ],

  py20: [
    mk({
      id: 'py20t3', title: 'Tylko cyfry', difficulty: 1,
      description: 'Wczytaj linię tekstu. Wypisz wszystkie cyfry w kolejności występowania oraz ich sumę. Użyj metody `isdigit()`.',
      hints: ['Wartość cyfry: `int(c)`.'],
      checks: [{ pattern: '\\.isdigit\\s*\\(', message: 'Użyj metody isdigit().' }],
      solution: `s = input()
cyfry = ""
suma = 0
for c in s:
    if c.isdigit():
        cyfry += c
        suma += int(c)
print("Cyfry:", cyfry)
print("Suma:", suma)
`,
      tests: [
        { input: 'Rok 2024, klasa 3b', expected: 'Cyfry: 20243\nSuma: 11' },
        { input: 'abc9', expected: 'Cyfry: 9\nSuma: 9' },
      ],
    }),
    mk({
      id: 'py20t4', title: 'Odwrócona wielkość liter', difficulty: 2,
      description: 'Wczytaj linię tekstu i zamień wielkie litery na małe, a małe na wielkie (pozostałe znaki bez zmian). Użyj `isupper()`, `islower()`, `upper()` i `lower()` – bez gotowej metody `swapcase()`.',
      hints: ['Buduj wynik znak po znaku.'],
      checks: [{ pattern: '\\.isupper\\s*\\(|\\.islower\\s*\\(', message: 'Sprawdzaj wielkość liter metodą isupper() lub islower().' }],
      solution: `s = input()
wynik = ""
for c in s:
    if c.isupper():
        wynik += c.lower()
    elif c.islower():
        wynik += c.upper()
    else:
        wynik += c
print(wynik)
`,
      tests: [
        { input: 'Ala Ma KOTA', expected: 'aLA mA kota' },
        { input: 'Python 3', expected: 'pYTHON 3' },
      ],
    }),
  ],

  py21: [
    mk({
      id: 'py21t3', title: 'Suma poprawnych liczb', difficulty: 2,
      description: 'Wczytaj linię „słów”. Zsumuj te, które są poprawnymi liczbami całkowitymi (zamiana `int()` w bloku `try`), i policz błędne (`except ValueError`).',
      hints: ['`try: suma += int(s)` / `except ValueError: bledne += 1`'],
      checks: [{ pattern: 'except\\s+ValueError', message: 'Łap wyjątek ValueError.' }],
      solution: `suma = 0
bledne = 0
for s in input().split():
    try:
        suma += int(s)
    except ValueError:
        bledne += 1
print("Suma:", suma)
print("Bledne:", bledne)
`,
      tests: [
        { input: '5 abc 3 x2 2', expected: 'Suma: 10\nBledne: 2' },
        { input: '-4 4', expected: 'Suma: 0\nBledne: 0' },
      ],
    }),
    mk({
      id: 'py21t4', title: 'Stopnie Celsjusza na Fahrenheita', difficulty: 1,
      description: 'Wczytaj temperaturę w stopniach Celsjusza. Jeśli to nie jest liczba, wypisz `To nie liczba`; w przeciwnym razie przelicz ją: F = C · 9 / 5 + 32 i wypisz z dwoma miejscami.',
      hints: ['`try: c = float(s)` / `except ValueError:`', 'Można też użyć `else:` po `except`.'],
      checks: [{ pattern: '\\btry\\s*:', message: 'Użyj bloku try / except.' }],
      solution: `s = input()
try:
    c = float(s)
except ValueError:
    print("To nie liczba")
else:
    print(f"Fahrenheit: {c * 9 / 5 + 32:.2f}")
`,
      tests: [
        { input: '36.6', expected: 'Fahrenheit: 97.88' },
        { input: 'abc', expected: 'To nie liczba' },
        { input: '-40', expected: 'Fahrenheit: -40.00' },
      ],
    }),
  ],

  py22: [
    mk({
      id: 'py22t3', title: 'Tabela kwadratów i sześcianów', difficulty: 1,
      description: 'Wczytaj `n` i wypisz tabelę dla liczb od 1 do `n`: liczba, kwadrat i sześcian wyrównane do prawej w kolumnach o szerokości 4, 6 i 8 znaków.',
      hints: ['Szerokość w f-stringu: `f"{i:4}{i * i:6}"`.'],
      checks: [{ pattern: '\\{[^}]*:\\s*>?\\d+\\s*\\}', message: 'Użyj szerokości pola w f-stringu, np. {x:6}.' }],
      solution: `n = int(input())
for i in range(1, n + 1):
    print(f"{i:4}{i * i:6}{i ** 3:8}")
`,
      tests: [
        { input: '3', expected: '   1     1       1\n   2     4       8\n   3     9      27' },
        { input: '5', expected: '   1     1       1\n   2     4       8\n   3     9      27\n   4    16      64\n   5    25     125' },
      ],
    }),
    mk({
      id: 'py22t4', title: 'Średnia z zadaną dokładnością', difficulty: 2,
      description: 'Wczytaj linię liczb, a w drugiej linii liczbę miejsc po przecinku `p`. Wypisz średnią sformatowaną do `p` miejsc.',
      hints: ['Precyzję można podać zmienną: `f"{srednia:.{p}f}"`.'],
      solution: `t = list(map(float, input().split()))
p = int(input())
srednia = sum(t) / len(t)
print(f"Srednia: {srednia:.{p}f}")
`,
      tests: [
        { input: '2 3 4 6\n3', expected: 'Srednia: 3.750' },
        { input: '1 2 4\n2', expected: 'Srednia: 2.33' },
        { input: '10\n0', expected: 'Srednia: 10' },
      ],
    }),
  ],

  py23: [
    mk({
      id: 'py23t3', title: 'Klasa Punkt', difficulty: 1,
      description: 'Utwórz klasę `Punkt` z atrybutami `x`, `y` i metodą `odleglosc(self, inny)`. Wczytaj dwa punkty (każdy w osobnej linii) i wypisz odległość między nimi z dwoma miejscami po przecinku.',
      starter: `class Punkt:
    pass  # konstruktor i metoda odleglosc


# Twój kod tutaj
`,
      hints: ['Odległość: `math.sqrt(dx ** 2 + dy ** 2)` albo `math.hypot(dx, dy)`.'],
      checks: [{ pattern: 'def\\s+odleglosc\\s*\\(\\s*self', message: 'Dodaj metodę odleglosc(self, inny).' }],
      solution: `import math


class Punkt:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def odleglosc(self, inny):
        return math.hypot(self.x - inny.x, self.y - inny.y)


p = Punkt(*map(float, input().split()))
q = Punkt(*map(float, input().split()))
print(f"Odleglosc: {p.odleglosc(q):.2f}")
`,
      tests: [
        { input: '0 0\n3 4', expected: 'Odleglosc: 5.00' },
        { input: '1 1\n2 2', expected: 'Odleglosc: 1.41' },
      ],
    }),
    mk({
      id: 'py23t4', title: 'Uczeń i jego oceny', difficulty: 2,
      description: 'Klasa `Uczen` ma atrybut `imie`, listę ocen tworzoną w `__init__` oraz metody `dodaj_ocene(o)` i `srednia()`. Wczytaj imię i linię ocen, a potem wypisz średnią z dwoma miejscami.',
      starter: `class Uczen:
    def __init__(self, imie):
        self.imie = imie
        self.oceny = []

    # metody dodaj_ocene i srednia


# Twój kod tutaj
`,
      hints: ['`def dodaj_ocene(self, o): self.oceny.append(o)`'],
      checks: [{ pattern: 'def\\s+dodaj_ocene', message: 'Dodaj metodę dodaj_ocene.' }, { pattern: 'def\\s+srednia', message: 'Dodaj metodę srednia.' }],
      solution: `class Uczen:
    def __init__(self, imie):
        self.imie = imie
        self.oceny = []

    def dodaj_ocene(self, o):
        self.oceny.append(o)

    def srednia(self):
        if not self.oceny:
            return 0
        return sum(self.oceny) / len(self.oceny)


u = Uczen(input())
for s in input().split():
    u.dodaj_ocene(int(s))
print(f"{u.imie}: srednia {u.srednia():.2f}")
`,
      tests: [
        { input: 'Ola\n5 4 5', expected: 'Ola: srednia 4.67' },
        { input: 'Jan\n3', expected: 'Jan: srednia 3.00' },
      ],
    }),
  ],

  py24: [
    mk({
      id: 'py24t3', title: 'Kolor RGB', difficulty: 2,
      description: 'Klasa `Kolor` ma konstruktor `__init__(self, r, g=None, b=None)`: gdy podano tylko `r`, kolor jest szary (wszystkie składowe równe `r`). Metoda `__str__` zwraca zapis szesnastkowy `#RRGGBB`. Wczytaj linię z 3 liczbami albo z jedną i wypisz kolor.',
      starter: `class Kolor:
    pass  # konstruktor i __str__


# Twój kod tutaj
`,
      hints: ['Dwie wielkie cyfry szesnastkowe: `f"{self.r:02X}"`.', 'Wywołanie z listy: `Kolor(*liczby)`.'],
      checks: [{ pattern: 'g\\s*=\\s*None', message: 'Konstruktor powinien mieć parametry domyślne g=None, b=None.' }],
      solution: `class Kolor:
    def __init__(self, r, g=None, b=None):
        if g is None:
            g = b = r
        self.r = r
        self.g = g
        self.b = b

    def __str__(self):
        return f"#{self.r:02X}{self.g:02X}{self.b:02X}"


liczby = list(map(int, input().split()))
print(Kolor(*liczby))
`,
      tests: [
        { input: '255 128 0', expected: '#FF8000' },
        { input: '128', expected: '#808080' },
        { input: '0 10 255', expected: '#000AFF' },
      ],
    }),
    mk({
      id: 'py24t4', title: 'Książka z wartościami domyślnymi', difficulty: 2,
      description: 'Klasa `Ksiazka` ma konstruktor `__init__(self, tytul, autor="nieznany", strony=100)` i metodę `opis()`. Wczytaj linię z polami oddzielonymi `;` (1, 2 lub 3 pola) i wypisz opis książki.',
      starter: `class Ksiazka:
    pass  # konstruktor i opis


# Twój kod tutaj
`,
      hints: ['`pola = input().split(";")`', 'Liczba stron musi być liczbą: `int(pola[2])`.'],
      checks: [{ pattern: 'autor\\s*=\\s*"nieznany"', message: 'Autor powinien mieć wartość domyślną "nieznany".' }],
      solution: `class Ksiazka:
    def __init__(self, tytul, autor="nieznany", strony=100):
        self.tytul = tytul
        self.autor = autor
        self.strony = strony

    def opis(self):
        return f"{self.tytul}, autor: {self.autor}, stron: {self.strony}"


p = input().split(";")
if len(p) == 3:
    k = Ksiazka(p[0], p[1], int(p[2]))
elif len(p) == 2:
    k = Ksiazka(p[0], p[1])
else:
    k = Ksiazka(p[0])
print(k.opis())
`,
      tests: [
        { input: 'Pan Tadeusz;Mickiewicz;340', expected: 'Pan Tadeusz, autor: Mickiewicz, stron: 340' },
        { input: 'Lalka;Prus', expected: 'Lalka, autor: Prus, stron: 100' },
        { input: 'Notatnik', expected: 'Notatnik, autor: nieznany, stron: 100' },
      ],
    }),
  ],

  py25: [
    mk({
      id: 'py25t3', title: 'Prostokąt z walidacją', difficulty: 2,
      description: 'Klasa `Prostokat` ma właściwości `szerokosc` i `wysokosc` (początkowo 1), których setter **ignoruje** wartości niedodatnie, oraz właściwość tylko do odczytu `pole`. Wczytaj `n` i `n` poleceń `S x` (ustaw szerokość) lub `W x` (ustaw wysokość). Wypisz pole.',
      starter: `class Prostokat:
    def __init__(self):
        self._szer = 1
        self._wys = 1

    # wlasciwosci szerokosc, wysokosc i pole


# Twój kod tutaj
`,
      hints: ['`@szerokosc.setter` z warunkiem `if wartosc > 0:`.', '`pole` – `@property` bez settera.'],
      checks: [{ pattern: '\\.setter', message: 'Dodaj setter z walidacją.' }],
      solution: `class Prostokat:
    def __init__(self):
        self._szer = 1
        self._wys = 1

    @property
    def szerokosc(self):
        return self._szer

    @szerokosc.setter
    def szerokosc(self, wartosc):
        if wartosc > 0:
            self._szer = wartosc

    @property
    def wysokosc(self):
        return self._wys

    @wysokosc.setter
    def wysokosc(self, wartosc):
        if wartosc > 0:
            self._wys = wartosc

    @property
    def pole(self):
        return self._szer * self._wys


p = Prostokat()
for _ in range(int(input())):
    typ, x = input().split()
    if typ == "S":
        p.szerokosc = int(x)
    else:
        p.wysokosc = int(x)
print("Pole:", p.pole)
`,
      tests: [
        { input: '3\nS 5\nW 3\nW -2', expected: 'Pole: 15' },
        { input: '2\nS 0\nW 4', expected: 'Pole: 4' },
      ],
    }),
    mk({
      id: 'py25t4', title: 'Zmiana hasła', difficulty: 2,
      description: 'Klasa `Uzytkownik` przechowuje hasło w atrybucie ukrytym `__haslo`. Metoda `zmien_haslo(stare, nowe)` zmienia hasło tylko wtedy, gdy stare jest poprawne, a nowe ma co najmniej 8 znaków, i zwraca `True`/`False`. Wczytaj hasło początkowe, `n` i `n` linii `stare nowe`. Dla każdej wypisz `Zmieniono` lub `Odrzucono`.',
      starter: `class Uzytkownik:
    pass  # konstruktor i zmien_haslo


# Twój kod tutaj
`,
      hints: ['Atrybut z dwoma podkreśleniami: `self.__haslo = haslo`.'],
      checks: [{ pattern: 'self\\.__haslo', message: 'Przechowuj hasło w atrybucie self.__haslo.' }, { pattern: 'def\\s+zmien_haslo', message: 'Dodaj metodę zmien_haslo.' }],
      solution: `class Uzytkownik:
    def __init__(self, haslo):
        self.__haslo = haslo

    def zmien_haslo(self, stare, nowe):
        if stare != self.__haslo or len(nowe) < 8:
            return False
        self.__haslo = nowe
        return True


u = Uzytkownik(input())
for _ in range(int(input())):
    stare, nowe = input().split()
    print("Zmieniono" if u.zmien_haslo(stare, nowe) else "Odrzucono")
`,
      tests: [
        { input: 'tajne123\n3\nzle nowehaslo1\ntajne123 krotkie\ntajne123 superhaslo', expected: 'Odrzucono\nOdrzucono\nZmieniono' },
        { input: 'abc\n2\nabc 12345678\nabc 87654321', expected: 'Zmieniono\nOdrzucono' },
      ],
    }),
  ],

  py26: [
    mk({
      id: 'py26t3', title: 'Przelicznik walut', difficulty: 1,
      description: 'Klasa `Waluty` ma atrybut klasy `KURS_EUR = 4.30` i **metody statyczne** `pln_na_eur(kwota)` oraz `eur_na_pln(kwota)`. Wczytaj kwotę i wypisz oba przeliczenia (2 miejsca po przecinku) bez tworzenia obiektu.',
      starter: `class Waluty:
    KURS_EUR = 4.30

    # metody statyczne


# Twój kod tutaj
`,
      hints: ['`@staticmethod` przed metodą; w środku `Waluty.KURS_EUR`.'],
      checks: [{ pattern: '@staticmethod', message: 'Użyj dekoratora @staticmethod.' }],
      solution: `class Waluty:
    KURS_EUR = 4.30

    @staticmethod
    def pln_na_eur(kwota):
        return kwota / Waluty.KURS_EUR

    @staticmethod
    def eur_na_pln(kwota):
        return kwota * Waluty.KURS_EUR


k = float(input())
print(f"{k:.2f} PLN = {Waluty.pln_na_eur(k):.2f} EUR")
print(f"{k:.2f} EUR = {Waluty.eur_na_pln(k):.2f} PLN")
`,
      tests: [
        { input: '100', expected: '100.00 PLN = 23.26 EUR\n100.00 EUR = 430.00 PLN' },
        { input: '43', expected: '43.00 PLN = 10.00 EUR\n43.00 EUR = 184.90 PLN' },
      ],
    }),
    mk({
      id: 'py26t4', title: 'Rekord gry', difficulty: 2,
      description: 'Klasa `Gracz` ma atrybuty obiektu `imie` i `punkty` oraz **atrybuty klasy** `rekord = 0` i `mistrz = "brak"`, aktualizowane w `__init__`, gdy nowy gracz pobije rekord. Wczytaj `n` i `n` linii `imie punkty`, a potem wypisz rekord.',
      hints: ['Atrybut klasy zmieniaj przez nazwę klasy: `Gracz.rekord = punkty`.'],
      checks: [{ pattern: 'Gracz\\.rekord\\s*=', message: 'Aktualizuj atrybut klasy przez Gracz.rekord = ...' }],
      solution: `class Gracz:
    rekord = 0
    mistrz = "brak"

    def __init__(self, imie, punkty):
        self.imie = imie
        self.punkty = punkty
        if punkty > Gracz.rekord:
            Gracz.rekord = punkty
            Gracz.mistrz = imie


for _ in range(int(input())):
    imie, punkty = input().split()
    Gracz(imie, int(punkty))
print(f"Rekord: {Gracz.rekord} ({Gracz.mistrz})")
`,
      tests: [
        { input: '3\nOla 120\nJan 90\nEwa 150', expected: 'Rekord: 150 (Ewa)' },
        { input: '2\nAdam 50\nZosia 50', expected: 'Rekord: 50 (Adam)' },
      ],
    }),
  ],

  py27: [
    mk({
      id: 'py27t3', title: 'Pojazdy i koła', difficulty: 1,
      description: 'Klasa bazowa `Pojazd` ma atrybuty `nazwa` i `kola` ustawiane w `__init__`. Klasy `Rower` (2 koła), `Samochod` (4 koła) i `Trojkolowiec` (3 koła) dziedziczą po niej i wywołują `super().__init__(...)`. Wczytaj linię nazw pojazdów, utwórz obiekty i wypisz łączną liczbę kół.',
      hints: ['`class Rower(Pojazd): def __init__(self): super().__init__("rower", 2)`'],
      checks: [{ pattern: 'super\\(\\)\\.__init__', message: 'Wywołaj konstruktor bazowy przez super().__init__(...).' }],
      solution: `class Pojazd:
    def __init__(self, nazwa, kola):
        self.nazwa = nazwa
        self.kola = kola


class Rower(Pojazd):
    def __init__(self):
        super().__init__("rower", 2)


class Samochod(Pojazd):
    def __init__(self):
        super().__init__("samochod", 4)


class Trojkolowiec(Pojazd):
    def __init__(self):
        super().__init__("trojkolowiec", 3)


klasy = {"rower": Rower, "samochod": Samochod, "trojkolowiec": Trojkolowiec}
pojazdy = [klasy[s]() for s in input().split()]
print("Lacznie kol:", sum(p.kola for p in pojazdy))
`,
      tests: [
        { input: 'rower samochod rower', expected: 'Lacznie kol: 8' },
        { input: 'trojkolowiec samochod', expected: 'Lacznie kol: 7' },
      ],
    }),
    mk({
      id: 'py27t4', title: 'Pracownik i kierownik', difficulty: 2,
      description: 'Klasa `Pracownik` ma pensję i metodę `wyplata()`. Klasa `Kierownik(Pracownik)` dodaje premię i nadpisuje `wyplata()`, korzystając z `super().wyplata()`. Wczytaj `pensja premia` i wypisz wypłatę pracownika i kierownika z tą samą pensją.',
      hints: ['`def wyplata(self): return super().wyplata() + self.premia`'],
      checks: [{ pattern: 'super\\(\\)\\.wyplata\\s*\\(', message: 'Użyj super().wyplata() w klasie Kierownik.' }],
      solution: `class Pracownik:
    def __init__(self, pensja):
        self.pensja = pensja

    def wyplata(self):
        return self.pensja


class Kierownik(Pracownik):
    def __init__(self, pensja, premia):
        super().__init__(pensja)
        self.premia = premia

    def wyplata(self):
        return super().wyplata() + self.premia


pensja, premia = map(int, input().split())
print("Pracownik:", Pracownik(pensja).wyplata())
print("Kierownik:", Kierownik(pensja, premia).wyplata())
`,
      tests: [
        { input: '5000 1500', expected: 'Pracownik: 5000\nKierownik: 6500' },
        { input: '4200 0', expected: 'Pracownik: 4200\nKierownik: 4200' },
      ],
    }),
  ],

  py28: [
    mk({
      id: 'py28t3', title: 'Bilety komunikacji', difficulty: 2,
      description: 'Klasa `Bilet` ma metodę `cena()` (4.40 zł). Klasy `Ulgowy` (2.20 zł) i `Rodzinny` (10.00 zł) dziedziczą po niej i nadpisują `cena()`. Wczytaj linię liter `N`, `U`, `R`, zapisz bilety w liście i wypisz sumę cen.',
      hints: ['Sumowanie: `sum(b.cena() for b in bilety)` – wersja metody zależy od klasy obiektu.'],
      checks: [{ pattern: 'class\\s+Ulgowy\\s*\\(\\s*Bilet\\s*\\)', message: 'Ulgowy powinien dziedziczyć po Bilet.' }],
      solution: `class Bilet:
    def cena(self):
        return 4.40


class Ulgowy(Bilet):
    def cena(self):
        return 2.20


class Rodzinny(Bilet):
    def cena(self):
        return 10.00


klasy = {"N": Bilet, "U": Ulgowy, "R": Rodzinny}
bilety = [klasy[s]() for s in input().split()]
print(f"Suma: {sum(b.cena() for b in bilety):.2f}")
`,
      tests: [
        { input: 'N U U R', expected: 'Suma: 18.80' },
        { input: 'N', expected: 'Suma: 4.40' },
      ],
    }),
    mk({
      id: 'py28t4', title: 'Figura o największym polu', difficulty: 2,
      description: 'Klasy `Kolo(r)`, `Kwadrat(a)` i `Prostokat(a, b)` mają metody `pole()` i `nazwa()`. Wczytaj `n` i `n` linii (`kolo r`, `kwadrat a`, `prostokat a b`) i wypisz figurę o największym polu (2 miejsca po przecinku).',
      hints: ['`max(figury, key=lambda f: f.pole())`'],
      checks: [{ pattern: 'def\\s+pole\\s*\\(\\s*self', message: 'Każda klasa powinna mieć metodę pole(self).' }],
      solution: `import math


class Kolo:
    def __init__(self, r):
        self.r = r

    def pole(self):
        return math.pi * self.r ** 2

    def nazwa(self):
        return "kolo"


class Kwadrat:
    def __init__(self, a):
        self.a = a

    def pole(self):
        return self.a * self.a

    def nazwa(self):
        return "kwadrat"


class Prostokat:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def pole(self):
        return self.a * self.b

    def nazwa(self):
        return "prostokat"


figury = []
for _ in range(int(input())):
    p = input().split()
    liczby = [float(x) for x in p[1:]]
    if p[0] == "kolo":
        figury.append(Kolo(*liczby))
    elif p[0] == "kwadrat":
        figury.append(Kwadrat(*liczby))
    else:
        figury.append(Prostokat(*liczby))
naj = max(figury, key=lambda f: f.pole())
print(f"Najwieksze pole: {naj.nazwa()} ({naj.pole():.2f})")
`,
      tests: [
        { input: '3\nkolo 1\nkwadrat 2\nprostokat 1 3', expected: 'Najwieksze pole: kwadrat (4.00)' },
        { input: '2\nprostokat 2 5\nkolo 2', expected: 'Najwieksze pole: kolo (12.57)' },
      ],
    }),
  ],

  py29: [
    mk({
      id: 'py29t3', title: 'Metody płatności', difficulty: 2,
      description: 'Klasa abstrakcyjna `Platnosc(ABC)` ma metody abstrakcyjne `nazwa()` i `oplata(kwota)`. Zaimplementuj `Karta` (prowizja 1%), `Gotowka` (bez opłat) i `Przelew` (+2 zł). Wczytaj kwotę i wypisz koszt każdą metodą.',
      starter: `from abc import ABC, abstractmethod


class Platnosc(ABC):
    @abstractmethod
    def nazwa(self):
        pass

    @abstractmethod
    def oplata(self, kwota):
        pass


# klasy Karta, Gotowka, Przelew
`,
      hints: ['`class Karta(Platnosc): def oplata(self, kwota): return kwota * 1.01`'],
      checks: [{ pattern: 'class\\s+Przelew\\s*\\(\\s*Platnosc\\s*\\)', message: 'Przelew powinien dziedziczyć po Platnosc.' }],
      solution: `from abc import ABC, abstractmethod


class Platnosc(ABC):
    @abstractmethod
    def nazwa(self):
        pass

    @abstractmethod
    def oplata(self, kwota):
        pass


class Karta(Platnosc):
    def nazwa(self):
        return "Karta"

    def oplata(self, kwota):
        return kwota * 1.01


class Gotowka(Platnosc):
    def nazwa(self):
        return "Gotowka"

    def oplata(self, kwota):
        return kwota


class Przelew(Platnosc):
    def nazwa(self):
        return "Przelew"

    def oplata(self, kwota):
        return kwota + 2


kwota = float(input())
for p in [Karta(), Gotowka(), Przelew()]:
    print(f"{p.nazwa()}: {p.oplata(kwota):.2f}")
`,
      tests: [
        { input: '100', expected: 'Karta: 101.00\nGotowka: 100.00\nPrzelew: 102.00' },
        { input: '250', expected: 'Karta: 252.50\nGotowka: 250.00\nPrzelew: 252.00' },
      ],
    }),
    mk({
      id: 'py29t4', title: 'Interfejs Opisywalny', difficulty: 2,
      description: 'Klasa abstrakcyjna `Opisywalny(ABC)` zawiera tylko metodę abstrakcyjną `opis()` – pełni rolę interfejsu. Klasy `Ksiazka(tytul)` i `Film(tytul, minuty)` ją implementują. Wczytaj `n` i `n` linii `ksiazka Tytul` lub `film Tytul minuty` i wypisz opisy.',
      hints: ['`class Film(Opisywalny): def opis(self): return f"Film: {self.tytul} ({self.minuty} min)"`'],
      checks: [{ pattern: 'class\\s+Opisywalny\\s*\\(\\s*ABC\\s*\\)', message: 'Zdefiniuj klasę abstrakcyjną Opisywalny(ABC).' }, { pattern: '@abstractmethod', message: 'Oznacz opis() dekoratorem @abstractmethod.' }],
      solution: `from abc import ABC, abstractmethod


class Opisywalny(ABC):
    @abstractmethod
    def opis(self):
        pass


class Ksiazka(Opisywalny):
    def __init__(self, tytul):
        self.tytul = tytul

    def opis(self):
        return f"Ksiazka: {self.tytul}"


class Film(Opisywalny):
    def __init__(self, tytul, minuty):
        self.tytul = tytul
        self.minuty = minuty

    def opis(self):
        return f"Film: {self.tytul} ({self.minuty} min)"


lista = []
for _ in range(int(input())):
    p = input().split()
    if p[0] == "ksiazka":
        lista.append(Ksiazka(p[1]))
    else:
        lista.append(Film(p[1], int(p[2])))
for o in lista:
    print(o.opis())
`,
      tests: [
        { input: '2\nksiazka Lalka\nfilm Shrek 90', expected: 'Ksiazka: Lalka\nFilm: Shrek (90 min)' },
        { input: '1\nfilm Avatar 162', expected: 'Film: Avatar (162 min)' },
      ],
    }),
  ],

  py30: [
    mk({
      id: 'py30t2', title: 'Samochód z silnikiem', difficulty: 2,
      description: 'Klasa `Silnik` ma atrybut `wlaczony` i metody `start()` oraz `stop()`. Klasa `Samochod` **tworzy** swój silnik w `__init__` (kompozycja) i ma metody `uruchom()`, `zatrzymaj()`, `jedz()`. Wczytaj linię poleceń `start`, `jedz`, `stop` i wykonaj je. Komunikaty: `Uruchomiono silnik`, `Zatrzymano silnik`, `Jade` albo `Silnik wylaczony`.',
      hints: ['W konstruktorze Samochod: `self.silnik = Silnik()`.'],
      checks: [{ pattern: 'self\\.\\w+\\s*=\\s*Silnik\\s*\\(', message: 'Samochód powinien sam utworzyć swój silnik (self.silnik = Silnik()).' }],
      solution: `class Silnik:
    def __init__(self):
        self.wlaczony = False

    def start(self):
        self.wlaczony = True

    def stop(self):
        self.wlaczony = False


class Samochod:
    def __init__(self):
        self.silnik = Silnik()

    def uruchom(self):
        self.silnik.start()
        print("Uruchomiono silnik")

    def zatrzymaj(self):
        self.silnik.stop()
        print("Zatrzymano silnik")

    def jedz(self):
        print("Jade" if self.silnik.wlaczony else "Silnik wylaczony")


auto = Samochod()
for p in input().split():
    if p == "start":
        auto.uruchom()
    elif p == "stop":
        auto.zatrzymaj()
    else:
        auto.jedz()
`,
      tests: [
        { input: 'jedz start jedz stop jedz', expected: 'Silnik wylaczony\nUruchomiono silnik\nJade\nZatrzymano silnik\nSilnik wylaczony' },
        { input: 'start jedz jedz', expected: 'Uruchomiono silnik\nJade\nJade' },
      ],
    }),
    mk({
      id: 'py30t3', title: 'Biblioteka', difficulty: 3,
      description: 'Klasa `Ksiazka` ma `tytul` i `wypozyczona`. Klasa `Biblioteka` przechowuje listę książek i ma metody `wypozycz(tytul)` oraz `zwroc(tytul)`. Pierwsza linia: tytuły książek, potem `n` i `n` poleceń `W tytul` / `Z tytul`. Wypisuj `Wypozyczono: T`, `Niedostepna: T` lub `Zwrocono: T`, a na końcu listę dostępnych książek.',
      hints: ['Szukaj książki pętlą po liście; niedostępna = brak w bibliotece lub już wypożyczona.'],
      checks: [{ pattern: 'class\\s+Biblioteka', message: 'Utwórz klasę Biblioteka.' }],
      solution: `class Ksiazka:
    def __init__(self, tytul):
        self.tytul = tytul
        self.wypozyczona = False


class Biblioteka:
    def __init__(self):
        self.ksiazki = []

    def dodaj(self, k):
        self.ksiazki.append(k)

    def znajdz(self, tytul):
        for k in self.ksiazki:
            if k.tytul == tytul:
                return k
        return None

    def wypozycz(self, tytul):
        k = self.znajdz(tytul)
        if k is None or k.wypozyczona:
            print("Niedostepna:", tytul)
            return
        k.wypozyczona = True
        print("Wypozyczono:", tytul)

    def zwroc(self, tytul):
        k = self.znajdz(tytul)
        if k is not None:
            k.wypozyczona = False
        print("Zwrocono:", tytul)

    def dostepne(self):
        return [k.tytul for k in self.ksiazki if not k.wypozyczona]


b = Biblioteka()
for t in input().split():
    b.dodaj(Ksiazka(t))
for _ in range(int(input())):
    typ, tytul = input().split()
    if typ == "W":
        b.wypozycz(tytul)
    else:
        b.zwroc(tytul)
print("Dostepne:", *b.dostepne())
`,
      tests: [
        { input: 'Lalka Potop Quo_Vadis\n3\nW Potop\nW Potop\nW Lalka', expected: 'Wypozyczono: Potop\nNiedostepna: Potop\nWypozyczono: Lalka\nDostepne: Quo_Vadis' },
        { input: 'Lalka Potop\n3\nW Lalka\nZ Lalka\nW Dziady', expected: 'Wypozyczono: Lalka\nZwrocono: Lalka\nNiedostepna: Dziady\nDostepne: Lalka Potop' },
      ],
    }),
    mk({
      id: 'py30t4', title: 'Najlepszy w klasie', difficulty: 3,
      description: 'Klasa `Uczen` ma imię, listę ocen i metodę `srednia()`. Klasa `KlasaSzkolna` przechowuje uczniów (agregacja) i ma metody `najlepszy()` oraz `srednia_klasy()` (średnia średnich). Wczytaj `n` i `n` linii `imie oceny...`. Wypisz:',
      hints: ['`imie, *oceny = input().split()` – gwiazdka zbiera resztę elementów.'],
      checks: [{ pattern: 'class\\s+KlasaSzkolna', message: 'Utwórz klasę KlasaSzkolna.' }],
      solution: `class Uczen:
    def __init__(self, imie, oceny):
        self.imie = imie
        self.oceny = oceny

    def srednia(self):
        return sum(self.oceny) / len(self.oceny)


class KlasaSzkolna:
    def __init__(self):
        self.uczniowie = []

    def dodaj(self, u):
        self.uczniowie.append(u)

    def najlepszy(self):
        return max(self.uczniowie, key=lambda u: u.srednia())

    def srednia_klasy(self):
        return sum(u.srednia() for u in self.uczniowie) / len(self.uczniowie)


k = KlasaSzkolna()
for _ in range(int(input())):
    imie, *oceny = input().split()
    k.dodaj(Uczen(imie, [int(o) for o in oceny]))
naj = k.najlepszy()
print(f"Najlepszy: {naj.imie} ({naj.srednia():.2f})")
print(f"Srednia klasy: {k.srednia_klasy():.2f}")
`,
      tests: [
        { input: '3\nOla 5 6 5\nJan 3 4\nEwa 4 4 5', expected: 'Najlepszy: Ola (5.33)\nSrednia klasy: 4.39' },
        { input: '1\nAdam 2 3', expected: 'Najlepszy: Adam (2.50)\nSrednia klasy: 2.50' },
      ],
    }),
  ],

  py31: [
    mk({
      id: 'py31t3', title: 'Dodawanie ułamków', difficulty: 3,
      description: 'Klasa `Ulamek` (licznik, mianownik) skraca się w `__init__`, ma metodę `__add__` i `__str__` zwracającą `l/m`. Wczytaj `l1 m1 l2 m2` i wypisz działanie z wynikiem.',
      hints: ['a/b + c/d = (a·d + c·b) / (b·d)', 'Skracanie: `from math import gcd`.'],
      checks: [{ pattern: 'def\\s+__add__', message: 'Zdefiniuj metodę __add__.' }],
      solution: `from math import gcd


class Ulamek:
    def __init__(self, l, m):
        d = gcd(l, m)
        self.l = l // d
        self.m = m // d

    def __add__(self, o):
        return Ulamek(self.l * o.m + o.l * self.m, self.m * o.m)

    def __str__(self):
        return f"{self.l}/{self.m}"


l1, m1, l2, m2 = map(int, input().split())
a = Ulamek(l1, m1)
b = Ulamek(l2, m2)
print(f"{a} + {b} = {a + b}")
`,
      tests: [
        { input: '1 2 1 3', expected: '1/2 + 1/3 = 5/6' },
        { input: '1 4 1 4', expected: '1/4 + 1/4 = 1/2' },
        { input: '2 3 1 3', expected: '2/3 + 1/3 = 1/1' },
      ],
    }),
    mk({
      id: 'py31t4', title: 'Czas trwania', difficulty: 2,
      description: 'Klasa `Czas` przechowuje liczbę minut. Zdefiniuj `__add__` (dwa czasy), `__mul__` (czas razy liczba całkowita) i `__str__` zwracające `h:mm`. Wczytaj `a b k` (minuty, minuty, mnożnik) i wypisz:',
      hints: ['Minuty dwucyfrowo: `f"{m:02d}"`.'],
      checks: [{ pattern: 'def\\s+__add__', message: 'Zdefiniuj metodę __add__.' }, { pattern: 'def\\s+__mul__', message: 'Zdefiniuj metodę __mul__.' }],
      solution: `class Czas:
    def __init__(self, minuty):
        self.minuty = minuty

    def __add__(self, o):
        return Czas(self.minuty + o.minuty)

    def __mul__(self, k):
        return Czas(self.minuty * k)

    def __str__(self):
        return f"{self.minuty // 60}:{self.minuty % 60:02d}"


a, b, k = map(int, input().split())
print(f"a + b = {Czas(a) + Czas(b)}")
print(f"a * {k} = {Czas(a) * k}")
`,
      tests: [
        { input: '90 45 3', expected: 'a + b = 2:15\na * 3 = 4:30' },
        { input: '5 3 2', expected: 'a + b = 0:08\na * 2 = 0:10' },
      ],
    }),
  ],
};
