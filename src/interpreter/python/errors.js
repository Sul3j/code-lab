// Tłumaczenie błędów Pythona na zrozumiałe polskie wyjaśnienia.
// Oryginalny komunikat zostaje dopisany w nawiasie – uczeń uczy się też prawdziwych nazw wyjątków.

const RULES = [
  // błędy składni i wcięć
  [/^expected ':'/, 'brakuje dwukropka \':\' na końcu linii (po if/elif/else/for/while/def/class)'],
  [/^expected an indented block after '(\w+)' statement on line (\d+)/, (m) => `po instrukcji '${m[1]}' (linia ${m[2]}) musi być wcięty blok – dodaj 4 spacje na początku kolejnej linii`],
  [/^expected an indented block after function definition on line (\d+)/, (m) => `ciało funkcji (zdefiniowanej w linii ${m[1]}) musi być wcięte – dodaj 4 spacje`],
  [/^expected an indented block after class definition/, 'ciało klasy musi być wcięte – dodaj 4 spacje'],
  [/^expected an indented block/, 'oczekiwano wciętego bloku kodu (4 spacje)'],
  [/^unexpected indent/, 'nieoczekiwane wcięcie – ta linia nie powinna zaczynać się od spacji'],
  [/^unindent does not match any outer indentation level/, 'wcięcie nie pasuje do żadnego poziomu – używaj konsekwentnie 4 spacji'],
  [/inconsistent use of tabs and spaces/, 'pomieszano tabulatory i spacje we wcięciach – używaj tylko spacji'],
  [/^unterminated string literal/, 'niezamknięty napis – brakuje cudzysłowu na końcu'],
  [/^unterminated triple-quoted string/, 'niezamknięty napis wielowierszowy """ ... """'],
  [/^'(.)' was never closed/, (m) => `nawias '${m[1]}' nie został zamknięty`],
  [/^unmatched '(.)'/, (m) => `nadmiarowy nawias zamykający '${m[1]}'`],
  [/^closing parenthesis '(.)' does not match opening parenthesis '(.)'/, (m) => `nawias '${m[1]}' nie pasuje do otwartego '${m[2]}'`],
  [/^Missing parentheses in call to 'print'/, 'w Pythonie 3 print jest funkcją – pisz print(...) z nawiasami'],
  [/Perhaps you forgot a comma/, 'niepoprawna składnia – może brakuje przecinka?'],
  [/^invalid syntax. Maybe you meant '==' or ':=' instead of '='/, "w warunku użyto '=' (przypisanie) – do porównania służy '=='"],
  [/^cannot assign to (literal|expression|function call)/, 'po lewej stronie znaku = musi być nazwa zmiennej'],
  [/^invalid decimal literal/, 'niepoprawna liczba lub nazwa (nazwa nie może zaczynać się od cyfry)'],
  [/^invalid character '(.)'/, (m) => `niedozwolony znak '${m[1]}' (może cudzysłów typograficzny zamiast "?)`],
  [/^'return' outside function/, "'return' może wystąpić tylko wewnątrz funkcji (def)"],
  [/^'break' outside loop/, "'break' może wystąpić tylko wewnątrz pętli"],
  [/^invalid syntax/, 'niepoprawna składnia – sprawdź tę linię (nawiasy, dwukropki, cudzysłowy, operatory)'],
  // NameError / UnboundLocalError
  [/^name '(\w+)' is not defined. Did you mean: '(\w+)'\?/, (m) => `nazwa '${m[1]}' nie jest zdefiniowana – czy chodziło o '${m[2]}'?`],
  [/^name '(\w+)' is not defined/, (m) => `nazwa '${m[1]}' nie jest zdefiniowana – sprawdź pisownię (wielkość liter ma znaczenie) i czy zmienna ma już wartość`],
  [/^cannot access local variable '(\w+)'/, (m) => `zmienna '${m[1]}' została użyta przed nadaniem wartości w tej funkcji – jeśli chodzi o zmienną globalną, dodaj 'global ${m[1]}'`],
  // TypeError
  [/^can only concatenate str \(not "(\w+)"\) to str/, (m) => `nie można dodać wartości typu ${m[1]} do napisu – zamień ją na tekst: str(x) albo użyj f-stringa f"...{x}..."`],
  [/^unsupported operand type\(s\) for ([^:]+): '(\w+)' and '(\w+)'/, (m) => `operator ${m[1]} nie działa dla typów '${m[2]}' i '${m[3]}'${m[2] === 'str' || m[3] === 'str' ? ' – czy zamieniłeś tekst z input() na liczbę przez int() lub float()?' : ''}`],
  [/^'(.+)' not supported between instances of '(\w+)' and '(\w+)'/, (m) => `nie można porównać '${m[2]}' z '${m[3]}' operatorem ${m[1]}${m[2] === 'str' || m[3] === 'str' ? ' – czy zamieniłeś input() na int()?' : ''}`],
  [/^'(\w+)' object is not subscriptable/, (m) => `wartości typu '${m[1]}' nie można indeksować nawiasami [ ]`],
  [/^'str' object does not support item assignment/, 'napisy są niezmienne – nie można zmienić pojedynczego znaku s[i]; zbuduj nowy napis'],
  [/^'tuple' object does not support item assignment/, 'krotki są niezmienne – nie można zmienić ich elementu'],
  [/^'(\w+)' object is not callable/, (m) => `wartość typu '${m[1]}' nie jest funkcją – nie można jej wywołać nawiasami ()`],
  [/^'(\w+)' object is not iterable/, (m) => `po wartości typu '${m[1]}' nie można iterować pętlą for – może chodziło o range(n)?`],
  [/^'(\w+)' object cannot be interpreted as an integer/, (m) => `oczekiwano liczby całkowitej, a podano wartość typu '${m[1]}' (np. range() wymaga int)`],
  [/^(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/, (m) => `funkcja ${m[1]}() przyjmuje ${m[2]} argument(ów), a podano ${m[3]}${Number(m[3]) === Number(m[2]) + 1 ? " – w metodzie klasy pamiętaj o parametrze 'self'" : ''}`],
  [/^(\w+)\(\) missing (\d+) required positional arguments?: (.+)/, (m) => `w wywołaniu ${m[1]}() brakuje ${m[2]} argument(ów): ${m[3]}`],
  [/^object of type '(\w+)' has no len\(\)/, (m) => `wartość typu '${m[1]}' nie ma długości – len() działa dla napisów, list, słowników…`],
  [/^Can't instantiate abstract class (\w+)/, (m) => `nie można utworzyć obiektu klasy abstrakcyjnej '${m[1]}' – utwórz obiekt klasy pochodnej, która implementuje wszystkie metody abstrakcyjne`],
  [/^list indices must be integers or slices, not (\w+)/, (m) => `indeks listy musi być liczbą całkowitą, a jest typu '${m[1]}' – użyj int(...) lub //`],
  [/^string indices must be integers/, 'indeks napisu musi być liczbą całkowitą'],
  [/^'NoneType' object/, 'wartość jest None – może funkcja nie zwraca wyniku (brak return)?'],
  // ValueError
  [/^invalid literal for int\(\) with base 10: (.+)/, (m) => `nie można zamienić ${m[1]} na liczbę całkowitą (int) – sprawdź dane wejściowe`],
  [/^could not convert string to float: (.+)/, (m) => `nie można zamienić ${m[1]} na liczbę rzeczywistą (float) – używaj kropki, np. 2.5`],
  [/^math domain error/, 'błąd dziedziny funkcji matematycznej (np. pierwiastek z liczby ujemnej lub logarytm z zera)'],
  [/^not enough values to unpack \(expected (\d+), got (\d+)\)/, (m) => `za mało wartości do rozpakowania (oczekiwano ${m[1]}, jest ${m[2]}) – sprawdź, ile liczb podano w linii`],
  [/^too many values to unpack \(expected (\d+)/, (m) => `za dużo wartości do rozpakowania (oczekiwano ${m[1]}) – sprawdź, ile liczb podano w linii`],
  [/^(.+) is not in list/, (m) => `wartości ${m[1]} nie ma na liście`],
  [/^list.remove\(x\): x not in list/, 'nie można usunąć elementu, którego nie ma na liście'],
  // inne
  [/^division by zero|^integer division or modulo by zero|^float division by zero|^integer modulo by zero/, 'dzielenie przez zero'],
  [/^list index out of range/, 'indeks poza zakresem listy (poprawne indeksy: od 0 do len(lista) - 1)'],
  [/^string index out of range/, 'indeks poza zakresem napisu (poprawne indeksy: od 0 do len(s) - 1)'],
  [/^tuple index out of range/, 'indeks poza zakresem krotki'],
  [/^pop from empty list/, 'nie można zdjąć elementu z pustej listy (pop)'],
  [/^maximum recursion depth exceeded/, 'przekroczono maksymalną głębokość rekurencji – czy funkcja rekurencyjna ma warunek zakończenia?'],
  [/^EOF when reading a line/, 'program próbował wczytać więcej danych (input()), niż podano'],
  [/^'(\w+)' object has no attribute '(\w+)'/, (m) => `obiekt typu '${m[1]}' nie ma atrybutu ani metody '${m[2]}'`],
  [/^type object '(\w+)' has no attribute '(\w+)'/, (m) => `klasa '${m[1]}' nie ma atrybutu '${m[2]}'`],
  [/^No module named '(\w+)'/, (m) => `nie ma modułu '${m[1]}' w tym środowisku`],
];

const TYPE_HINTS = {
  ZeroDivisionError: 'dzielenie przez zero',
  KeyError: 'w słowniku nie ma takiego klucza – sprawdź "klucz in slownik" albo użyj .get()',
  RecursionError: 'przekroczono maksymalną głębokość rekurencji – czy funkcja ma warunek zakończenia?',
  EOFError: 'program próbował wczytać więcej danych (input()), niż podano',
  IndexError: 'indeks poza zakresem',
  AssertionError: 'warunek w assert nie jest spełniony',
  StopIteration: 'iterator nie ma już kolejnych elementów',
  NotImplementedError: 'metoda nie została zaimplementowana (zwykle trzeba ją nadpisać w klasie pochodnej)',
};

export function translatePyError(err) {
  if (!err) return null;
  const { type, message, line, kind } = err;
  if (type === undefined) return err;
  const msg = message || '';
  let pl = null;
  for (const [re, txt] of RULES) {
    const m = msg.match(re);
    if (m) { pl = typeof txt === 'function' ? txt(m) : txt; break; }
  }
  if (!pl && type === 'KeyError') pl = `w słowniku nie ma klucza ${msg} – sprawdź "klucz in slownik" albo użyj .get()`;
  if (!pl) pl = TYPE_HINTS[type] || null;
  const original = msg ? `${type}: ${msg}` : type;
  const full = pl ? `${pl} (${original})` : original;
  const isCompile = kind === 'compile' || ['SyntaxError', 'IndentationError', 'TabError'].includes(type);
  return { kind: isCompile ? 'compile' : (kind === 'limit' ? 'limit' : 'runtime'), line: line ?? null, message: full, pyType: type };
}
