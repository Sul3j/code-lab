// Kurs Pythona – część II: programowanie obiektowe.

export const pyOop = [
  // ─────────────── Klasy i obiekty ───────────────
  {
    id: 'py23', title: 'Klasy i obiekty', subtitle: 'class, self, atrybuty, metody', icon: 'Boxes', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Klasa** to projekt obiektów: opisuje ich dane (**atrybuty**) i zachowania (**metody**). **Obiekt** tworzymy, wywołując klasę jak funkcję: `Samochod()`. Pierwszym parametrem każdej metody jest **self** – odwołanie do obiektu, na którym metodę wywołano.' },
      { type: 'table', head: ['Filar OOP', 'W Pythonie'], rows: [
        ['Abstrakcja', 'klasa opisuje to, co istotne'], ['Hermetyzacja', 'konwencja _prywatne, @property'],
        ['Dziedziczenie', 'class Pochodna(Bazowa)'], ['Polimorfizm', 'nadpisywanie metod, „duck typing”'],
      ] },
      { type: 'code', run: true, code: `class Samochod:
    def __init__(self, marka, paliwo):   # konstruktor
        self.marka = marka               # atrybuty obiektu
        self.paliwo = paliwo

    def jedz(self, km):                  # metoda
        self.paliwo -= km * 0.06

    def __str__(self):                   # tekst dla print()
        return f"{self.marka} ({self.paliwo:.1f} l)"

a = Samochod("Fiat", 40)
a.jedz(100)
print(a)` },
      { type: 'list', items: [
        'Atrybuty tworzymy w `__init__` przez `self.nazwa = wartosc`.',
        '`b = a` nie kopiuje obiektu – obie nazwy wskazują to samo auto.',
        '`__str__` decyduje, jak obiekt wygląda w `print()`.',
      ] },
    ],
    example: {
      title: 'Garaż',
      description: 'Klasa z atrybutami i metodami, kilka obiektów i lista obiektów.',
      code: `class Samochod:
    def __init__(self, marka, paliwo, przebieg=0):
        self.marka = marka
        self.paliwo = paliwo
        self.przebieg = przebieg

    def jedz(self, km):
        potrzeba = km * 0.06
        if potrzeba > self.paliwo:
            print(f"{self.marka}: za malo paliwa na {km} km!")
            return
        self.paliwo -= potrzeba
        self.przebieg += km

    def __str__(self):
        return f"{self.marka} (paliwo {self.paliwo:.1f} l, przebieg {self.przebieg} km)"

a = Samochod("Fiat", 10)
b = Samochod("Opel", 3, 1200)
a.jedz(100)
b.jedz(100)
print(a)
print(b)

c = a
c.jedz(50)
print("Przebieg a po jezdzie c:", a.przebieg)

garaz = [a, b]
print("Laczny przebieg:", sum(s.przebieg for s in garaz))
`,
    },
    tasks: [
      {
        id: 'py23t1', title: 'Klasa Prostokat', difficulty: 1,
        description: 'Utwórz klasę `Prostokat` z konstruktorem `__init__(self, a, b)` i metodami `pole()` oraz `obwod()`. Wczytaj boki (liczby całkowite w jednej linii) i wypisz:',
        expectedOutput: 'Pole: 12\nObwod: 14', exampleInput: '3 4',
        starter: `class Prostokat:
    pass  # konstruktor i metody

# Twój kod tutaj
`,
        hints: ['`def __init__(self, a, b): self.a = a; self.b = b`', '`def pole(self): return self.a * self.b`'],
        checks: [{ pattern: 'class\\s+Prostokat', message: 'Utwórz klasę Prostokat.' }, { pattern: 'def\\s+pole\\s*\\(\\s*self', message: 'Dodaj metodę pole(self).' }],
        solution: `class Prostokat:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def pole(self):
        return self.a * self.b

    def obwod(self):
        return 2 * (self.a + self.b)

a, b = map(int, input().split())
p = Prostokat(a, b)
print(f"Pole: {p.pole()}")
print(f"Obwod: {p.obwod()}")
`,
        tests: [{ input: '3 4', expected: 'Pole: 12\nObwod: 14' }, { input: '1 1', expected: 'Pole: 1\nObwod: 4' }],
      },
      {
        id: 'py23t2', title: 'Licznik', difficulty: 1,
        description: 'Utwórz klasę `Licznik` z atrybutem `wartosc` (początkowo 0) i metodami `zwieksz()`, `zmniejsz()` (nie poniżej 0) i `resetuj()`. Wczytaj linię poleceń `+`, `-`, `r` oddzielonych spacjami, wykonaj je i wypisz:',
        expectedOutput: 'Wartosc: 3', exampleInput: '+ + + - +',
        starter: `class Licznik:
    def __init__(self):
        self.wartosc = 0

    # metody

# Twój kod tutaj
`,
        hints: ['`def zmniejsz(self): if self.wartosc > 0: self.wartosc -= 1`'],
        checks: [{ pattern: 'class\\s+Licznik', message: 'Utwórz klasę Licznik.' }],
        solution: `class Licznik:
    def __init__(self):
        self.wartosc = 0

    def zwieksz(self):
        self.wartosc += 1

    def zmniejsz(self):
        if self.wartosc > 0:
            self.wartosc -= 1

    def resetuj(self):
        self.wartosc = 0

l = Licznik()
for p in input().split():
    if p == "+":
        l.zwieksz()
    elif p == "-":
        l.zmniejsz()
    elif p == "r":
        l.resetuj()
print(f"Wartosc: {l.wartosc}")
`,
        tests: [{ input: '+ + + - +', expected: 'Wartosc: 3' }, { input: '- - +', expected: 'Wartosc: 1' }, { input: '+ + r +', expected: 'Wartosc: 1' }],
      },
    ],
  },

  // ─────────────── Konstruktor ───────────────
  {
    id: 'py24', title: 'Konstruktor __init__', subtitle: 'inicjalizacja, walidacja, __del__', icon: 'Hammer', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Metoda **__init__** jest wywoływana automatycznie po utworzeniu obiektu i ustawia jego atrybuty. Python nie ma przeciążania konstruktorów – różne sposoby tworzenia obiektu uzyskujemy przez **argumenty domyślne** albo **metody klasowe** (`@classmethod`) zwracające nowy obiekt.' },
      { type: 'code', run: true, code: `class Punkt:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

    @classmethod
    def z_napisu(cls, tekst):            # alternatywny "konstruktor"
        x, y = map(float, tekst.split(","))
        return cls(x, y)

p = Punkt()
q = Punkt(3, 4)
r = Punkt.z_napisu("1.5,2")
print(p.x, q.y, r.x)` },
      { type: 'list', items: [
        'Konstruktor może sprawdzać dane i zgłosić błąd: `raise ValueError("opis")`.',
        'Metoda `__del__` wywołuje się, gdy obiekt jest usuwany z pamięci – w CPythonie zwykle od razu, gdy znika ostatnie odwołanie (np. `del obiekt`). Nie należy na niej polegać przy ważnych operacjach.',
      ] },
    ],
    example: {
      title: 'Konto z walidacją',
      description: 'Argumenty domyślne, walidacja w konstruktorze, metoda klasowa i __del__.',
      code: `class Konto:
    def __init__(self, wlasciciel, saldo=0):
        if saldo < 0:
            raise ValueError("Saldo poczatkowe nie moze byc ujemne")
        self.wlasciciel = wlasciciel
        self.saldo = saldo
        print(f"[+] konto {wlasciciel} ({saldo} zl)")

    @classmethod
    def premium(cls, wlasciciel):
        return cls(wlasciciel, 1000)

    def __del__(self):
        print(f"[-] zamykam konto {self.wlasciciel}")

a = Konto("Ola")
b = Konto.premium("Jan")
try:
    c = Konto("Ewa", -10)
except ValueError as e:
    print("Blad:", e)
del a
print("Koniec programu")
`,
    },
    tasks: [
      {
        id: 'py24t1', title: 'Czas – normalizacja', difficulty: 2,
        description: 'Utwórz klasę `Czas` z konstruktorem `__init__(self, h=0, m=0)`, który normalizuje czas (nadmiar minut przechodzi w godziny, godziny modulo 24), oraz metodą `__str__` zwracającą `hh:mm`. Wczytaj linię z 0, 1 lub 2 liczbami (godziny, minuty) i wypisz utworzony obiekt.',
        expectedOutput: '02:15', exampleInput: '0 135',
        starter: `class Czas:
    pass  # konstruktor i __str__

liczby = list(map(int, input().split()))
c = Czas(*liczby)
print(c)
`,
        hints: ['`razem = h * 60 + m`; `self.h = razem // 60 % 24`; `self.m = razem % 60`', '`return f"{self.h:02d}:{self.m:02d}"`'],
        checks: [{ pattern: 'def\\s+__init__\\s*\\(\\s*self\\s*,\\s*h\\s*=', message: 'Konstruktor powinien mieć argumenty domyślne: __init__(self, h=0, m=0).' }],
        solution: `class Czas:
    def __init__(self, h=0, m=0):
        razem = h * 60 + m
        self.h = razem // 60 % 24
        self.m = razem % 60

    def __str__(self):
        return f"{self.h:02d}:{self.m:02d}"

liczby = list(map(int, input().split()))
c = Czas(*liczby)
print(c)
`,
        tests: [{ input: '0 135', expected: '02:15' }, { input: '\n', expected: '00:00' }, { input: '23 70', expected: '00:10' }, { input: '9', expected: '09:00' }],
      },
      {
        id: 'py24t2', title: 'Uczeń z walidacją', difficulty: 2,
        description: 'Klasa `Uczen` ma atrybuty `imie` i `wiek`. Konstruktor zgłasza `ValueError`, gdy wiek jest spoza zakresu 5–20. Wczytaj `n` i `n` linii `imie wiek`; dla każdej spróbuj utworzyć ucznia i wypisz `Dodano: IMIE` albo `Bledne dane: IMIE`.',
        expectedOutput: 'Dodano: Ola\nBledne dane: Jan\nDodano: Ewa', exampleInput: '3\nOla 15\nJan 40\nEwa 7',
        starter: `class Uczen:
    pass  # konstruktor z walidacja

# Twój kod tutaj
`,
        hints: ['`if not 5 <= wiek <= 20: raise ValueError("Bledny wiek")`', 'W pętli: `try: ... except ValueError: ...`'],
        checks: [{ pattern: 'raise\\s+ValueError', message: 'Konstruktor powinien zgłaszać ValueError.' }],
        solution: `class Uczen:
    def __init__(self, imie, wiek):
        if not 5 <= wiek <= 20:
            raise ValueError("Bledny wiek")
        self.imie = imie
        self.wiek = wiek

n = int(input())
for _ in range(n):
    imie, wiek = input().split()
    try:
        u = Uczen(imie, int(wiek))
        print(f"Dodano: {u.imie}")
    except ValueError:
        print(f"Bledne dane: {imie}")
`,
        tests: [{ input: '3\nOla 15\nJan 40\nEwa 7', expected: 'Dodano: Ola\nBledne dane: Jan\nDodano: Ewa' }, { input: '1\nAdam 3', expected: 'Bledne dane: Adam' }],
      },
    ],
  },

  // ─────────────── Hermetyzacja ───────────────
  {
    id: 'py25', title: 'Hermetyzacja i właściwości', subtitle: '_prywatne, __ukryte, @property', icon: 'Lock', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Python nie ma słów `private`/`public`. Obowiązują **konwencje**: nazwa z jednym podkreśleniem `_saldo` oznacza „wewnętrzne – nie ruszaj z zewnątrz”, a z dwoma `__saldo` jest dodatkowo zmieniana przez interpreter (*name mangling*), co utrudnia przypadkowy dostęp.' },
      { type: 'h', text: 'Właściwości – @property' },
      { type: 'p', text: 'Dekorator **@property** pozwala odczytywać metodę jak atrybut, a `@nazwa.setter` – kontrolować przypisanie (walidacja). Właściwość bez settera jest tylko do odczytu.' },
      { type: 'code', run: true, code: `class Osoba:
    def __init__(self, imie, wiek):
        self.imie = imie
        self.wiek = wiek            # przechodzi przez setter!

    @property
    def wiek(self):
        return self._wiek

    @wiek.setter
    def wiek(self, wartosc):
        if not 0 <= wartosc <= 130:
            raise ValueError("Bledny wiek")
        self._wiek = wartosc

    @property
    def pelnoletnia(self):          # tylko do odczytu
        return self._wiek >= 18

o = Osoba("Ola", 15)
o.wiek = 18
print(o.wiek, o.pelnoletnia)` },
      { type: 'tip', text: 'Zasada: dane wewnętrzne z podkreśleniem, a na zewnątrz – metody i właściwości, które pilnują poprawności obiektu (niezmienników).' },
    ],
    example: {
      title: 'Bezpieczne konto',
      description: 'Ukryte saldo, właściwość tylko do odczytu, walidacja w metodach i name mangling.',
      code: `class Konto:
    def __init__(self, wlasciciel):
        self.wlasciciel = wlasciciel
        self.__saldo = 0
        self._operacje = 0

    @property
    def saldo(self):
        return self.__saldo

    def wplac(self, kwota):
        if kwota <= 0:
            print("Odrzucono wplate", kwota)
            return
        self.__saldo += kwota
        self._operacje += 1

    def wyplac(self, kwota):
        if kwota <= 0 or kwota > self.__saldo:
            return False
        self.__saldo -= kwota
        self._operacje += 1
        return True

k = Konto("Ola")
k.wplac(100)
k.wplac(-5)
print("Wyplata 500:", k.wyplac(500), "| wyplata 30:", k.wyplac(30))
print(f"{k.wlasciciel}: {k.saldo} zl")
try:
    k.saldo = 1000000
except AttributeError:
    print("Saldo jest tylko do odczytu!")
print("Ukryty atrybut ma nazwe:", [n for n in vars(k) if "saldo" in n])
`,
    },
    tasks: [
      {
        id: 'py25t1', title: 'Termometr', difficulty: 2,
        description: 'Utwórz klasę `Termometr` z właściwością `temperatura` (początkowo 20). Setter zgłasza `ValueError` dla wartości poniżej −273.15. Wczytaj linię temperatur, spróbuj ustawić każdą i dla błędnych wypisz `Bledna temperatura: X`. Na końcu `Temperatura: X`.',
        expectedOutput: 'Bledna temperatura: -300.0\nTemperatura: 18.5', exampleInput: '25 -300 18.5',
        starter: `class Termometr:
    def __init__(self):
        self._temp = 20.0

    # wlasciwosc temperatura z setterem

# Twój kod tutaj
`,
        hints: ['`@property def temperatura(self): return self._temp`', '`@temperatura.setter def temperatura(self, v): ...`'],
        checks: [{ pattern: '@property', message: 'Użyj dekoratora @property.' }, { pattern: '\\.setter', message: 'Dodaj setter właściwości.' }],
        solution: `class Termometr:
    def __init__(self):
        self._temp = 20.0

    @property
    def temperatura(self):
        return self._temp

    @temperatura.setter
    def temperatura(self, wartosc):
        if wartosc < -273.15:
            raise ValueError("Ponizej zera absolutnego")
        self._temp = wartosc

t = Termometr()
for s in input().split():
    x = float(s)
    try:
        t.temperatura = x
    except ValueError:
        print(f"Bledna temperatura: {x}")
print(f"Temperatura: {t.temperatura}")
`,
        tests: [{ input: '25 -300 18.5', expected: 'Bledna temperatura: -300.0\nTemperatura: 18.5' }, { input: '-500', expected: 'Bledna temperatura: -500.0\nTemperatura: 20.0' }],
      },
      {
        id: 'py25t2', title: 'Konto bankowe', difficulty: 2,
        description: 'Klasa `Konto` ma ukryte saldo (`self._saldo`, początkowo 0), właściwość tylko do odczytu `saldo` oraz metody `wplac(kwota)` i `wyplac(kwota)` (zwraca False, gdy brakuje środków). Wczytaj `n` i `n` linii `W kwota` / `P kwota`. Po każdej nieudanej wypłacie wypisz `Brak srodkow`, na końcu `Saldo: X`.',
        expectedOutput: 'Brak srodkow\nSaldo: 70', exampleInput: '3\nW 100\nP 200\nP 30',
        starter: `class Konto:
    def __init__(self):
        self._saldo = 0

    # wlasciwosc saldo, wplac, wyplac

# Twój kod tutaj
`,
        hints: ['Właściwość bez settera: `@property def saldo(self): return self._saldo`.'],
        checks: [{ pattern: '@property', message: 'Saldo udostępnij przez @property.' }],
        solution: `class Konto:
    def __init__(self):
        self._saldo = 0

    @property
    def saldo(self):
        return self._saldo

    def wplac(self, kwota):
        if kwota > 0:
            self._saldo += kwota

    def wyplac(self, kwota):
        if kwota > self._saldo:
            return False
        self._saldo -= kwota
        return True

k = Konto()
n = int(input())
for _ in range(n):
    typ, kwota = input().split()
    if typ == "W":
        k.wplac(int(kwota))
    elif not k.wyplac(int(kwota)):
        print("Brak srodkow")
print(f"Saldo: {k.saldo}")
`,
        tests: [{ input: '3\nW 100\nP 200\nP 30', expected: 'Brak srodkow\nSaldo: 70' }, { input: '2\nW 10\nP 10', expected: 'Saldo: 0' }],
      },
    ],
  },

  // ─────────────── Atrybuty klasy ───────────────
  {
    id: 'py26', title: 'Atrybuty i metody klasy', subtitle: 'atrybuty klasowe, @staticmethod, @classmethod', icon: 'Hash', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Atrybut zdefiniowany bezpośrednio w ciele klasy (poza metodami) jest **atrybutem klasy** – wspólnym dla wszystkich obiektów. Odwołujemy się do niego przez nazwę klasy: `Uczen.liczba`.' },
      { type: 'code', run: true, code: `class Uczen:
    liczba = 0                     # atrybut klasy

    def __init__(self, imie):
        self.imie = imie           # atrybut obiektu
        Uczen.liczba += 1

    @staticmethod
    def czy_poprawne_imie(s):      # nie potrzebuje ani obiektu, ani klasy
        return s.isalpha()

    @classmethod
    def ilu(cls):                  # dostaje klase (cls)
        return cls.liczba

Uczen("Ola"); Uczen("Jan")
print(Uczen.ilu(), Uczen.czy_poprawne_imie("Ewa1"))` },
      { type: 'warn', text: 'Przypisanie `self.liczba = 5` NIE zmienia atrybutu klasy – tworzy nowy atrybut w obiekcie, który go zasłania. Atrybut klasy zmieniaj przez `NazwaKlasy.liczba`.' },
    ],
    example: {
      title: 'Numery legitymacji',
      description: 'Atrybut klasy jako licznik i generator numerów, metoda statyczna i klasowa.',
      code: `class Uczen:
    nastepny_numer = 1001
    liczba = 0
    LIMIT = 30

    def __init__(self, imie):
        self.imie = imie
        self.numer = Uczen.nastepny_numer
        Uczen.nastepny_numer += 1
        Uczen.liczba += 1

    @classmethod
    def jest_miejsce(cls):
        return cls.liczba < cls.LIMIT

    @staticmethod
    def format_numeru(n):
        return f"LEG-{n:05d}"

    def __str__(self):
        return f"{Uczen.format_numeru(self.numer)}: {self.imie}"

print("Na poczatku:", Uczen.liczba)
a = Uczen("Ala")
b = Uczen("Bartek")
print(a)
print(b)
print(f"Uczniow: {Uczen.liczba}/{Uczen.LIMIT}, miejsce: {Uczen.jest_miejsce()}")
`,
    },
    tasks: [
      {
        id: 'py26t1', title: 'Numery seryjne', difficulty: 1,
        description: 'Każdy obiekt klasy `Produkt` dostaje kolejny numer, zaczynając od 1001 (atrybut klasy). Wczytaj linię nazw, utwórz produkty i wypisz `NUMER: nazwa`, a na końcu `Utworzono: N`.',
        expectedOutput: '1001: mleko\n1002: chleb\n1003: ser\nUtworzono: 3', exampleInput: 'mleko chleb ser',
        starter: `class Produkt:
    pass  # atrybuty klasy i konstruktor

# Twój kod tutaj
`,
        hints: ['W klasie: `nastepny = 1001` i `utworzono = 0`.', 'W konstruktorze: `self.numer = Produkt.nastepny` i `Produkt.nastepny += 1`.'],
        checks: [{ pattern: 'Produkt\\.\\w+\\s*\\+=', message: 'Zwiększaj atrybut klasy przez Produkt.nazwa += 1.' }],
        solution: `class Produkt:
    nastepny = 1001
    utworzono = 0

    def __init__(self, nazwa):
        self.nazwa = nazwa
        self.numer = Produkt.nastepny
        Produkt.nastepny += 1
        Produkt.utworzono += 1

for s in input().split():
    p = Produkt(s)
    print(f"{p.numer}: {p.nazwa}")
print(f"Utworzono: {Produkt.utworzono}")
`,
        tests: [{ input: 'mleko chleb ser', expected: '1001: mleko\n1002: chleb\n1003: ser\nUtworzono: 3' }, { input: 'woda', expected: '1001: woda\nUtworzono: 1' }],
      },
      {
        id: 'py26t2', title: 'Klasa narzędziowa', difficulty: 2,
        description: 'Utwórz klasę `Matematyka` z **metodami statycznymi** `silnia(n)`, `nwd(a, b)` i `czy_pierwsza(n)`. Wczytaj `a b` i bez tworzenia obiektu wypisz:',
        expectedOutput: 'silnia(5) = 120\nnwd(5, 12) = 1\npierwsza(12): False', exampleInput: '5 12',
        starter: `class Matematyka:
    pass  # metody statyczne

# Twój kod tutaj
`,
        hints: ['`@staticmethod` przed każdą metodą, bez parametru self.', 'Wywołanie: `Matematyka.silnia(a)`.'],
        checks: [{ pattern: '@staticmethod', message: 'Użyj dekoratora @staticmethod.' }],
        solution: `class Matematyka:
    @staticmethod
    def silnia(n):
        w = 1
        for i in range(2, n + 1):
            w *= i
        return w

    @staticmethod
    def nwd(a, b):
        while b:
            a, b = b, a % b
        return a

    @staticmethod
    def czy_pierwsza(n):
        if n < 2:
            return False
        d = 2
        while d * d <= n:
            if n % d == 0:
                return False
            d += 1
        return True

a, b = map(int, input().split())
print(f"silnia({a}) = {Matematyka.silnia(a)}")
print(f"nwd({a}, {b}) = {Matematyka.nwd(a, b)}")
print(f"pierwsza({b}): {Matematyka.czy_pierwsza(b)}")
`,
        tests: [{ input: '5 12', expected: 'silnia(5) = 120\nnwd(5, 12) = 1\npierwsza(12): False' }, { input: '4 7', expected: 'silnia(4) = 24\nnwd(4, 7) = 1\npierwsza(7): True' }],
      },
    ],
  },

  // ─────────────── Dziedziczenie ───────────────
  {
    id: 'py27', title: 'Dziedziczenie', subtitle: 'class B(A), super()', icon: 'GitFork', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: '**Dziedziczenie** zapisujemy, podając klasę bazową w nawiasie: `class Uczen(Osoba):`. Klasa pochodna przejmuje atrybuty i metody bazy, może dodać własne i **nadpisać** istniejące. Funkcja **super()** daje dostęp do wersji z klasy bazowej.' },
      { type: 'code', run: true, code: `class Osoba:
    def __init__(self, imie):
        self.imie = imie

    def przedstaw(self):
        return f"Jestem {self.imie}"

class Uczen(Osoba):
    def __init__(self, imie, klasa):
        super().__init__(imie)          # konstruktor bazowy
        self.klasa = klasa

    def przedstaw(self):                # nadpisanie
        return super().przedstaw() + f", klasa {self.klasa}"

print(Uczen("Ola", 2).przedstaw())
print(isinstance(Uczen("Jan", 1), Osoba))   # True` },
      { type: 'list', items: [
        'Python pozwala na dziedziczenie po wielu klasach: `class C(A, B):` (używaj ostrożnie).',
        'Każda klasa dziedziczy po `object`.',
        '`isinstance(obj, Klasa)` i `issubclass(A, B)` sprawdzają relację „jest”.',
      ] },
    ],
    example: {
      title: 'Pojazdy',
      description: 'Klasa bazowa, dwie pochodne, super() w konstruktorze i w metodzie.',
      code: `class Pojazd:
    def __init__(self, nazwa, predkosc_max):
        self.nazwa = nazwa
        self.predkosc_max = predkosc_max

    def opis(self):
        return f"{self.nazwa}, max {self.predkosc_max} km/h"

    def czas_przejazdu(self, km):
        return km / self.predkosc_max

class Samochod(Pojazd):
    def __init__(self, nazwa, v, miejsca):
        super().__init__(nazwa, v)
        self.miejsca = miejsca

    def opis(self):
        return super().opis() + f", miejsc: {self.miejsca}"

class Rower(Pojazd):
    def __init__(self, nazwa):
        super().__init__(nazwa, 25)

    def dzwonek(self):
        print(f"{self.nazwa}: dzyn dzyn!")

s = Samochod("Fiat", 160, 5)
r = Rower("Romet")
print(s.opis())
print(r.opis())
r.dzwonek()
print("100 km rowerem:", r.czas_przejazdu(100), "h")
`,
    },
    tasks: [
      {
        id: 'py27t1', title: 'Osoba i Uczeń', difficulty: 1,
        description: 'Klasa `Osoba` ma atrybuty `imie`, `wiek` i metodę `przedstaw()` zwracającą `Jestem IMIE, mam WIEK lat`. Utwórz `Uczen(Osoba)` z atrybutem `szkola`, której `przedstaw()` dokleja `, szkola: SZKOLA` do wyniku `super().przedstaw()`. Wczytaj `imie wiek szkola` i wypisz przedstawienie ucznia.',
        expectedOutput: 'Jestem Ola, mam 15 lat, szkola: LO1', exampleInput: 'Ola 15 LO1',
        starter: `class Osoba:
    def __init__(self, imie, wiek):
        self.imie = imie
        self.wiek = wiek

    def przedstaw(self):
        return f"Jestem {self.imie}, mam {self.wiek} lat"

# klasa Uczen
`,
        hints: ['`class Uczen(Osoba):` i w konstruktorze `super().__init__(imie, wiek)`.'],
        checks: [{ pattern: 'class\\s+Uczen\\s*\\(\\s*Osoba\\s*\\)', message: 'Uczen powinien dziedziczyć po Osoba.' }, { pattern: 'super\\(\\)\\.przedstaw', message: 'Użyj super().przedstaw().' }],
        solution: `class Osoba:
    def __init__(self, imie, wiek):
        self.imie = imie
        self.wiek = wiek

    def przedstaw(self):
        return f"Jestem {self.imie}, mam {self.wiek} lat"

class Uczen(Osoba):
    def __init__(self, imie, wiek, szkola):
        super().__init__(imie, wiek)
        self.szkola = szkola

    def przedstaw(self):
        return super().przedstaw() + f", szkola: {self.szkola}"

imie, wiek, szkola = input().split()
print(Uczen(imie, int(wiek), szkola).przedstaw())
`,
        tests: [{ input: 'Ola 15 LO1', expected: 'Jestem Ola, mam 15 lat, szkola: LO1' }, { input: 'Jan 17 Technikum', expected: 'Jestem Jan, mam 17 lat, szkola: Technikum' }],
      },
      {
        id: 'py27t2', title: 'Konto oszczędnościowe', difficulty: 2,
        description: 'Klasa `Konto` ma atrybut `saldo`. Utwórz `KontoOszczednosciowe(Konto)` z atrybutem `procent` i metodą `dodaj_odsetki()`. Wczytaj `saldo procent lata`, dolicz odsetki raz na rok i wypisz saldo z 2 miejscami:',
        expectedOutput: 'Saldo: 1102.50', exampleInput: '1000 5 2',
        starter: `class Konto:
    def __init__(self, saldo):
        self.saldo = saldo

# klasa KontoOszczednosciowe
`,
        hints: ['`super().__init__(saldo)` w konstruktorze klasy pochodnej.', '`self.saldo += self.saldo * self.procent / 100`'],
        checks: [{ pattern: 'class\\s+KontoOszczednosciowe\\s*\\(\\s*Konto\\s*\\)', message: 'KontoOszczednosciowe powinno dziedziczyć po Konto.' }],
        solution: `class Konto:
    def __init__(self, saldo):
        self.saldo = saldo

class KontoOszczednosciowe(Konto):
    def __init__(self, saldo, procent):
        super().__init__(saldo)
        self.procent = procent

    def dodaj_odsetki(self):
        self.saldo += self.saldo * self.procent / 100

s, p, lata = input().split()
k = KontoOszczednosciowe(float(s), float(p))
for _ in range(int(lata)):
    k.dodaj_odsetki()
print(f"Saldo: {k.saldo:.2f}")
`,
        tests: [{ input: '1000 5 2', expected: 'Saldo: 1102.50' }, { input: '500 10 1', expected: 'Saldo: 550.00' }],
      },
    ],
  },

  // ─────────────── Polimorfizm ───────────────
  {
    id: 'py28', title: 'Polimorfizm', subtitle: 'nadpisywanie metod, duck typing', icon: 'Shuffle', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'W Pythonie **każda metoda jest „wirtualna”** – wywołanie `obiekt.glos()` zawsze uruchamia wersję z rzeczywistej klasy obiektu. Dzięki temu listę różnych obiektów możemy przetwarzać jedną pętlą.' },
      { type: 'code', run: true, code: `class Zwierze:
    def glos(self):
        return "..."

class Pies(Zwierze):
    def glos(self):
        return "Hau!"

class Kot(Zwierze):
    def glos(self):
        return "Miau!"

for z in [Pies(), Kot(), Zwierze()]:
    print(z.glos())` },
      { type: 'h', text: 'Duck typing' },
      { type: 'p', text: '„Jeśli chodzi jak kaczka i kwacze jak kaczka, to jest kaczką.” Python nie wymaga wspólnej klasy bazowej – wystarczy, że obiekt ma potrzebną metodę. Funkcja wywołująca `x.glos()` zadziała dla każdego obiektu z metodą `glos`.' },
      { type: 'tip', text: 'Polimorfizm działa też dla funkcji wbudowanych: `len()` wywołuje metodę `__len__`, a `print()` – `__str__` danego obiektu.' },
    ],
    example: {
      title: 'Lista płac',
      description: 'Różni pracownicy w jednej liście; każda klasa liczy pensję po swojemu.',
      code: `class Pracownik:
    def __init__(self, imie):
        self.imie = imie

    def pensja(self):
        return 0

    def stanowisko(self):
        return "pracownik"

class Etatowy(Pracownik):
    def __init__(self, imie, stala):
        super().__init__(imie)
        self.stala = stala

    def pensja(self):
        return self.stala

    def stanowisko(self):
        return "etat"

class Godzinowy(Pracownik):
    def __init__(self, imie, stawka, godziny):
        super().__init__(imie)
        self.stawka = stawka
        self.godziny = godziny

    def pensja(self):
        return self.stawka * self.godziny

    def stanowisko(self):
        return "godzinowy"

class Robot:                       # nie dziedziczy po Pracownik – duck typing
    imie = "R2D2"
    def pensja(self):
        return 0
    def stanowisko(self):
        return "robot"

zespol = [Etatowy("Ola", 5200), Godzinowy("Jan", 35, 120), Robot()]
for p in zespol:
    print(f"{p.imie} ({p.stanowisko()}): {p.pensja()} zl")
print("Razem:", sum(p.pensja() for p in zespol), "zl")
`,
    },
    tasks: [
      {
        id: 'py28t1', title: 'Pensje pracowników', difficulty: 2,
        description: 'Klasa bazowa `Pracownik` ma atrybut `imie` i metodę `pensja()`. Utwórz `Etatowy` (stała pensja) i `Godzinowy` (stawka × godziny). Wczytaj `n` i `n` linii: `E imie kwota` lub `G imie stawka godziny` (liczby całkowite). Wypisz pensję każdego i sumę:',
        expectedOutput: 'Ola: 5000\nJan: 4000\nRazem: 9000', exampleInput: '2\nE Ola 5000\nG Jan 40 100',
        starter: `class Pracownik:
    def __init__(self, imie):
        self.imie = imie

    def pensja(self):
        return 0

# klasy Etatowy i Godzinowy
`,
        hints: ['`class Etatowy(Pracownik):` z metodą `pensja(self)` zwracającą kwotę.', 'Linia: `p = input().split()`, typ w `p[0]`.'],
        checks: [{ pattern: 'class\\s+Godzinowy\\s*\\(\\s*Pracownik\\s*\\)', message: 'Godzinowy powinien dziedziczyć po Pracownik.' }],
        solution: `class Pracownik:
    def __init__(self, imie):
        self.imie = imie

    def pensja(self):
        return 0

class Etatowy(Pracownik):
    def __init__(self, imie, kwota):
        super().__init__(imie)
        self.kwota = kwota

    def pensja(self):
        return self.kwota

class Godzinowy(Pracownik):
    def __init__(self, imie, stawka, godziny):
        super().__init__(imie)
        self.stawka = stawka
        self.godziny = godziny

    def pensja(self):
        return self.stawka * self.godziny

lista = []
for _ in range(int(input())):
    p = input().split()
    if p[0] == "E":
        lista.append(Etatowy(p[1], int(p[2])))
    else:
        lista.append(Godzinowy(p[1], int(p[2]), int(p[3])))
for pr in lista:
    print(f"{pr.imie}: {pr.pensja()}")
print(f"Razem: {sum(pr.pensja() for pr in lista)}")
`,
        tests: [{ input: '2\nE Ola 5000\nG Jan 40 100', expected: 'Ola: 5000\nJan: 4000\nRazem: 9000' }, { input: '1\nG Ewa 25 10', expected: 'Ewa: 250\nRazem: 250' }],
      },
      {
        id: 'py28t2', title: 'Rysowanie kształtów', difficulty: 2,
        description: 'Klasy `Kwadrat(n)` (n linii po n znaków `#`), `Trojkat(n)` (linie z 1…n gwiazdkami) i `Linia(n)` (n znaków `-`) mają metodę `rysuj()`. Wczytaj `k` i `k` linii `K n`, `T n` lub `L n`; zapisz obiekty w liście i narysuj je po kolei.',
        expectedOutput: '##\n##\n*\n**\n***\n----', exampleInput: '3\nK 2\nT 3\nL 4',
        starter: `# klasy Kwadrat, Trojkat i Linia z metoda rysuj()

# Twój kod tutaj
`,
        hints: ['`class Kwadrat: def __init__(self, n): self.n = n; def rysuj(self): for _ in range(self.n): print("#" * self.n)`', 'Pętla: `for s in ksztalty: s.rysuj()`.'],
        checks: [{ pattern: 'def\\s+rysuj\\s*\\(\\s*self', message: 'Każda klasa powinna mieć metodę rysuj(self).' }],
        solution: `class Kwadrat:
    def __init__(self, n):
        self.n = n

    def rysuj(self):
        for _ in range(self.n):
            print("#" * self.n)

class Trojkat:
    def __init__(self, n):
        self.n = n

    def rysuj(self):
        for i in range(1, self.n + 1):
            print("*" * i)

class Linia:
    def __init__(self, n):
        self.n = n

    def rysuj(self):
        print("-" * self.n)

klasy = {"K": Kwadrat, "T": Trojkat, "L": Linia}
ksztalty = []
for _ in range(int(input())):
    typ, n = input().split()
    ksztalty.append(klasy[typ](int(n)))
for s in ksztalty:
    s.rysuj()
`,
        tests: [{ input: '3\nK 2\nT 3\nL 4', expected: '##\n##\n*\n**\n***\n----' }, { input: '1\nT 1', expected: '*' }],
      },
    ],
  },

  // ─────────────── Klasy abstrakcyjne ───────────────
  {
    id: 'py29', title: 'Klasy abstrakcyjne i interfejsy', subtitle: 'moduł abc, @abstractmethod', icon: 'Shapes', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Klasę abstrakcyjną tworzymy, dziedzicząc po **ABC** z modułu `abc`, a metody, które klasy pochodne **muszą** zaimplementować, oznaczamy dekoratorem **@abstractmethod**. Próba utworzenia obiektu klasy abstrakcyjnej (lub pochodnej bez wszystkich metod) kończy się TypeError.' },
      { type: 'code', run: true, code: `from abc import ABC, abstractmethod

class Figura(ABC):
    @abstractmethod
    def pole(self):
        pass

    def opis(self):                        # zwykla metoda z kodem
        return f"{type(self).__name__}: pole {self.pole():.2f}"

class Kwadrat(Figura):
    def __init__(self, a):
        self.a = a

    def pole(self):
        return self.a ** 2

print(Kwadrat(3).opis())
try:
    Figura()
except TypeError as e:
    print("Blad:", e)` },
      { type: 'h', text: 'Interfejsy w Pythonie' },
      { type: 'p', text: 'Python nie ma słowa `interface`. Rolę interfejsu pełni klasa abstrakcyjna zawierająca **tylko** metody abstrakcyjne, albo – dzięki duck typingowi – po prostu umowa, że obiekt ma określone metody.' },
      { type: 'table', head: ['Cecha', 'Klasa abstrakcyjna (ABC)', '„Interfejs”'], rows: [
        ['metody abstrakcyjne', 'co najmniej jedna', 'wszystkie'], ['metody z kodem i atrybuty', 'tak', 'nie'], ['tworzenie obiektów', 'nie', 'nie'],
      ] },
    ],
    example: {
      title: 'Figury i interfejs',
      description: 'Interfejs Opisywalny, abstrakcyjna Figura, klasy pochodne i polimorficzna lista posortowana po polu.',
      code: `from abc import ABC, abstractmethod
import math

class Opisywalny(ABC):
    @abstractmethod
    def opis(self):
        pass

class Figura(Opisywalny):
    def __init__(self, nazwa):
        self.nazwa = nazwa

    @abstractmethod
    def pole(self):
        pass

    def opis(self):
        return f"{self.nazwa}: pole = {self.pole():.2f}"

class Kolo(Figura):
    def __init__(self, r):
        super().__init__("kolo")
        self.r = r

    def pole(self):
        return math.pi * self.r ** 2

class Prostokat(Figura):
    def __init__(self, a, b):
        super().__init__("prostokat")
        self.a, self.b = a, b

    def pole(self):
        return self.a * self.b

figury = [Kolo(1), Prostokat(2, 3), Kolo(0.5)]
for f in sorted(figury, key=lambda f: f.pole()):
    print(f.opis())

class Trojkat(Figura):        # brak metody pole!
    pass

try:
    Trojkat("trojkat")
except TypeError:
    print("Trojkat nie implementuje metody pole – nie mozna utworzyc obiektu")
`,
    },
    tasks: [
      {
        id: 'py29t1', title: 'Zwierzęta (ABC)', difficulty: 2,
        description: 'Klasa abstrakcyjna `Zwierze(ABC)` ma atrybut `imie`, metodę abstrakcyjną `glos()` i zwykłą `przedstaw()` zwracającą `IMIE mowi: GLOS`. Utwórz `Pies` (`Hau!`) i `Kot` (`Miau!`). Wczytaj `n` i `n` linii `pies Imie` / `kot Imie`, a potem wypisz przedstawienia.',
        expectedOutput: 'Burek mowi: Hau!\nMruczek mowi: Miau!', exampleInput: '2\npies Burek\nkot Mruczek',
        starter: `from abc import ABC, abstractmethod

class Zwierze(ABC):
    def __init__(self, imie):
        self.imie = imie

    @abstractmethod
    def glos(self):
        pass

    def przedstaw(self):
        return f"{self.imie} mowi: {self.glos()}"

# klasy Pies i Kot
`,
        hints: ['`class Pies(Zwierze): def glos(self): return "Hau!"`'],
        checks: [{ pattern: 'class\\s+Pies\\s*\\(\\s*Zwierze\\s*\\)', message: 'Pies powinien dziedziczyć po Zwierze.' }],
        solution: `from abc import ABC, abstractmethod

class Zwierze(ABC):
    def __init__(self, imie):
        self.imie = imie

    @abstractmethod
    def glos(self):
        pass

    def przedstaw(self):
        return f"{self.imie} mowi: {self.glos()}"

class Pies(Zwierze):
    def glos(self):
        return "Hau!"

class Kot(Zwierze):
    def glos(self):
        return "Miau!"

lista = []
for _ in range(int(input())):
    typ, imie = input().split()
    lista.append(Pies(imie) if typ == "pies" else Kot(imie))
for z in lista:
    print(z.przedstaw())
`,
        tests: [{ input: '2\npies Burek\nkot Mruczek', expected: 'Burek mowi: Hau!\nMruczek mowi: Miau!' }, { input: '1\nkot Filemon', expected: 'Filemon mowi: Miau!' }],
      },
      {
        id: 'py29t2', title: 'Interfejs Figura', difficulty: 2,
        description: 'Klasa abstrakcyjna `Figura(ABC)` ma tylko metodę abstrakcyjną `pole()`. Zaimplementuj `Kwadrat(a)`, `Prostokat(a, b)` i `Kolo(r)` (π = 3.14). Wczytaj `n` i `n` linii `K a`, `P a b` lub `O r` (liczby całkowite) i wypisz sumę pól z 2 miejscami:',
        expectedOutput: 'Suma pol: 10.00', exampleInput: '2\nK 2\nP 2 3',
        starter: `from abc import ABC, abstractmethod

class Figura(ABC):
    @abstractmethod
    def pole(self):
        pass

# klasy Kwadrat, Prostokat i Kolo
`,
        hints: ['Każda klasa dziedziczy po Figura i definiuje `pole(self)`.'],
        checks: [{ pattern: 'class\\s+Kolo\\s*\\(\\s*Figura\\s*\\)', message: 'Kolo powinno dziedziczyć po Figura.' }],
        solution: `from abc import ABC, abstractmethod

class Figura(ABC):
    @abstractmethod
    def pole(self):
        pass

class Kwadrat(Figura):
    def __init__(self, a):
        self.a = a

    def pole(self):
        return self.a * self.a

class Prostokat(Figura):
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def pole(self):
        return self.a * self.b

class Kolo(Figura):
    def __init__(self, r):
        self.r = r

    def pole(self):
        return 3.14 * self.r * self.r

figury = []
for _ in range(int(input())):
    p = input().split()
    if p[0] == "K":
        figury.append(Kwadrat(int(p[1])))
    elif p[0] == "P":
        figury.append(Prostokat(int(p[1]), int(p[2])))
    else:
        figury.append(Kolo(int(p[1])))
print(f"Suma pol: {sum(f.pole() for f in figury):.2f}")
`,
        tests: [{ input: '2\nK 2\nP 2 3', expected: 'Suma pol: 10.00' }, { input: '1\nO 1', expected: 'Suma pol: 3.14' }],
      },
    ],
  },

  // ─────────────── Kompozycja ───────────────
  {
    id: 'py30', title: 'Kompozycja i agregacja', subtitle: 'relacja „ma”', icon: 'Puzzle', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Obiekty mogą zawierać inne obiekty – relacja **„ma”**. W **kompozycji** całość sama tworzy swoje części (samochód tworzy swój silnik), w **agregacji** korzysta z obiektów utworzonych gdzie indziej (klasa szkolna dostaje listę istniejących uczniów).' },
      { type: 'code', code: `class Silnik:
    def __init__(self, moc):
        self.moc = moc

class Samochod:
    def __init__(self, marka, moc):
        self.marka = marka
        self.silnik = Silnik(moc)    # kompozycja
        self.kierowca = None         # agregacja – przypisany z zewnatrz` },
      { type: 'tip', text: 'Zasada: „przedkładaj kompozycję nad dziedziczenie”. Dziedzicz, gdy obiekt **jest** czymś (Kwadrat jest Figurą); gdy **ma** coś (Samochód ma Silnik) – użyj kompozycji.' },
    ],
    example: {
      title: 'Klasa szkolna',
      description: 'Klasa szkolna agreguje uczniów, a każdy uczeń ma własną listę ocen.',
      code: `class Uczen:
    def __init__(self, imie):
        self.imie = imie
        self.oceny = []               # kompozycja – lista nalezy do ucznia

    def dodaj_ocene(self, o):
        self.oceny.append(o)

    def srednia(self):
        return sum(self.oceny) / len(self.oceny) if self.oceny else 0

class KlasaSzkolna:
    def __init__(self, nazwa):
        self.nazwa = nazwa
        self.uczniowie = []           # agregacja – uczniowie istnieja niezaleznie

    def dodaj(self, uczen):
        self.uczniowie.append(uczen)

    def najlepszy(self):
        return max(self.uczniowie, key=lambda u: u.srednia())

ola = Uczen("Ola")
ola.dodaj_ocene(5)
ola.dodaj_ocene(6)
jan = Uczen("Jan")
jan.dodaj_ocene(4)

k = KlasaSzkolna("2B")
k.dodaj(ola)
k.dodaj(jan)
n = k.najlepszy()
print(f"Najlepszy w {k.nazwa}: {n.imie} ({n.srednia():.2f})")
`,
    },
    tasks: [
      {
        id: 'py30t1', title: 'Koszyk zakupów', difficulty: 2,
        description: 'Klasa `Produkt` ma atrybuty `nazwa` i `cena`. Klasa `Koszyk` **zawiera** listę produktów i ma metody `dodaj(p)`, `suma()`, `ile()` i `najdrozszy()`. Wczytaj `n` i `n` linii `nazwa cena`; wypisz:',
        expectedOutput: 'Produktow: 3\nSuma: 19.70\nNajdrozszy: ser', exampleInput: '3\nchleb 4.5\nser 12\nmleko 3.2',
        starter: `class Produkt:
    def __init__(self, nazwa, cena):
        self.nazwa = nazwa
        self.cena = cena

class Koszyk:
    def __init__(self):
        self.produkty = []

    # dodaj, suma, ile, najdrozszy

# Twój kod tutaj
`,
        hints: ['`def najdrozszy(self): return max(self.produkty, key=lambda p: p.cena)`'],
        checks: [{ pattern: 'self\\.produkty\\s*=\\s*\\[\\]', message: 'Koszyk powinien zawierać listę produktów.' }],
        solution: `class Produkt:
    def __init__(self, nazwa, cena):
        self.nazwa = nazwa
        self.cena = cena

class Koszyk:
    def __init__(self):
        self.produkty = []

    def dodaj(self, p):
        self.produkty.append(p)

    def suma(self):
        return sum(p.cena for p in self.produkty)

    def ile(self):
        return len(self.produkty)

    def najdrozszy(self):
        return max(self.produkty, key=lambda p: p.cena)

k = Koszyk()
for _ in range(int(input())):
    nazwa, cena = input().split()
    k.dodaj(Produkt(nazwa, float(cena)))
print(f"Produktow: {k.ile()}")
print(f"Suma: {k.suma():.2f}")
print(f"Najdrozszy: {k.najdrozszy().nazwa}")
`,
        tests: [{ input: '3\nchleb 4.5\nser 12\nmleko 3.2', expected: 'Produktow: 3\nSuma: 19.70\nNajdrozszy: ser' }, { input: '1\nwoda 2', expected: 'Produktow: 1\nSuma: 2.00\nNajdrozszy: woda' }],
      },
    ],
  },

  // ─────────────── Metody specjalne ───────────────
  {
    id: 'py31', title: 'Metody specjalne (przeciążanie operatorów)', subtitle: '__add__, __eq__, __lt__, __str__', icon: 'Plus', practice: true, part: 'oop',
    theory: [
      { type: 'p', text: 'Operatory działają na obiektach dzięki **metodom specjalnym** (tzw. „dunder”, od *double underscore*). `a + b` wywołuje `a.__add__(b)`, `a == b` – `a.__eq__(b)`, a `print(a)` – `a.__str__()`.' },
      { type: 'table', head: ['Metoda', 'Operator / funkcja'], rows: [
        ['__add__, __sub__, __mul__', '+, -, *'], ['__eq__, __lt__, __le__', '==, <, <='], ['__str__', 'print(), str()'], ['__repr__', 'postać w konsoli / liście'],
        ['__len__', 'len()'], ['__getitem__', 'obiekt[i]'], ['__neg__', '-obiekt'],
      ] },
      { type: 'code', run: true, code: `class Wektor:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        return Wektor(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Wektor(self.x * k, self.y * k)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __str__(self):
        return f"[{self.x}, {self.y}]"

print(Wektor(1, 2) + Wektor(3, 4), Wektor(1, 2) * 3, Wektor(1, 1) == Wektor(1, 1))` },
      { type: 'tip', text: 'Gdy zdefiniujesz `__lt__` i `__eq__`, obiekty można sortować funkcją `sorted()`. Dekorator `functools.total_ordering` uzupełni brakujące porównania.' },
    ],
    example: {
      title: 'Ułamki',
      description: 'Klasa Ulamek skracana w konstruktorze z operatorami +, *, ==, < oraz __str__.',
      code: `from math import gcd

class Ulamek:
    def __init__(self, l, m):
        d = gcd(l, m)
        self.l = l // d
        self.m = m // d

    def __add__(self, o):
        return Ulamek(self.l * o.m + o.l * self.m, self.m * o.m)

    def __mul__(self, o):
        return Ulamek(self.l * o.l, self.m * o.m)

    def __eq__(self, o):
        return self.l == o.l and self.m == o.m

    def __lt__(self, o):
        return self.l * o.m < o.l * self.m

    def __str__(self):
        return f"{self.l}/{self.m}"

a, b = Ulamek(1, 2), Ulamek(1, 3)
print(f"{a} + {b} = {a + b}")
print(f"{a} * {b} = {a * b}")
print("2/4 == 1/2 ?", Ulamek(2, 4) == a)
print("Posortowane:", *sorted([Ulamek(3, 4), a, b]))
`,
    },
    tasks: [
      {
        id: 'py31t1', title: 'Działania na wektorach', difficulty: 2,
        description: 'Klasa `Wektor` ma atrybuty `x`, `y`. Zdefiniuj `__add__`, `__sub__`, `__mul__` (wektor razy liczba) i `__str__` (format `[x, y]`). Wczytaj liczby całkowite `x1 y1 x2 y2 k` i wypisz:',
        expectedOutput: 'a + b = [4, 6]\na - b = [-2, -2]\na * k = [2, 4]', exampleInput: '1 2 3 4 2',
        starter: `class Wektor:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # metody specjalne

# Twój kod tutaj
`,
        hints: ['`def __add__(self, o): return Wektor(self.x + o.x, self.y + o.y)`', '`def __str__(self): return f"[{self.x}, {self.y}]"`'],
        checks: [{ pattern: 'def\\s+__add__', message: 'Zdefiniuj metodę __add__.' }, { pattern: 'def\\s+__str__', message: 'Zdefiniuj metodę __str__.' }],
        solution: `class Wektor:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, o):
        return Wektor(self.x + o.x, self.y + o.y)

    def __sub__(self, o):
        return Wektor(self.x - o.x, self.y - o.y)

    def __mul__(self, k):
        return Wektor(self.x * k, self.y * k)

    def __str__(self):
        return f"[{self.x}, {self.y}]"

x1, y1, x2, y2, k = map(int, input().split())
a, b = Wektor(x1, y1), Wektor(x2, y2)
print(f"a + b = {a + b}")
print(f"a - b = {a - b}")
print(f"a * k = {a * k}")
`,
        tests: [{ input: '1 2 3 4 2', expected: 'a + b = [4, 6]\na - b = [-2, -2]\na * k = [2, 4]' }, { input: '0 0 1 1 5', expected: 'a + b = [1, 1]\na - b = [-1, -1]\na * k = [0, 0]' }],
      },
      {
        id: 'py31t2', title: 'Porównywanie godzin', difficulty: 2,
        description: 'Klasa `Godzina` ma atrybuty `h` i `m`. Zdefiniuj `__eq__` i `__lt__`. Wczytaj `h1 m1 h2 m2` i używając tylko operatorów `==` i `<` wypisz `Rowne`, `Pierwsza wczesniej` albo `Druga wczesniej`.',
        expectedOutput: 'Pierwsza wczesniej', exampleInput: '9 59 10 0',
        starter: `class Godzina:
    def __init__(self, h, m):
        self.h = h
        self.m = m

    # __eq__ i __lt__

# Twój kod tutaj
`,
        hints: ['Porównuj minuty od północy: `self.h * 60 + self.m`.'],
        checks: [{ pattern: 'def\\s+__eq__', message: 'Zdefiniuj metodę __eq__.' }, { pattern: 'def\\s+__lt__', message: 'Zdefiniuj metodę __lt__.' }],
        solution: `class Godzina:
    def __init__(self, h, m):
        self.h = h
        self.m = m

    def minuty(self):
        return self.h * 60 + self.m

    def __eq__(self, o):
        return self.minuty() == o.minuty()

    def __lt__(self, o):
        return self.minuty() < o.minuty()

h1, m1, h2, m2 = map(int, input().split())
a, b = Godzina(h1, m1), Godzina(h2, m2)
if a == b:
    print("Rowne")
elif a < b:
    print("Pierwsza wczesniej")
else:
    print("Druga wczesniej")
`,
        tests: [{ input: '9 59 10 0', expected: 'Pierwsza wczesniej' }, { input: '10 30 10 30', expected: 'Rowne' }, { input: '12 0 11 59', expected: 'Druga wczesniej' }],
      },
    ],
  },
];
