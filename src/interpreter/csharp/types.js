// Typy czasu wykonania interpretera C# oraz kod "preludium" (wbudowane klasy wyjątków).

export const isPrim = (t) => typeof t === 'string';
export const NUMERIC = new Set(['int', 'long', 'char', 'double', 'float', 'decimal']);
export const INTEGRAL = new Set(['int', 'long', 'char']);
export const isNum = (t) => NUMERIC.has(t);
export const isIntT = (t) => INTEGRAL.has(t);
export const isFloatT = (t) => t === 'double' || t === 'float' || t === 'decimal';
export const has = (t, k) => !!t && typeof t === 'object' && k in t;

// rzutowania niejawne między typami liczbowymi
const WIDEN = {
  char: ['int', 'long', 'float', 'double', 'decimal'],
  int: ['long', 'float', 'double', 'decimal'],
  long: ['float', 'double', 'decimal'],
  float: ['double'],
};
export const numWidens = (from, to) => from === to || (WIDEN[from] || []).includes(to);

const NET_PRIM = {
  int: 'System.Int32', long: 'System.Int64', double: 'System.Double', float: 'System.Single', decimal: 'System.Decimal',
  char: 'System.Char', bool: 'System.Boolean', string: 'System.String', object: 'System.Object', void: 'System.Void',
};

// nazwa typu taka, jaką wypisuje .NET (np. ToString() obiektu bez nadpisania)
export function netName(t, types) {
  if (isPrim(t)) return NET_PRIM[t] || t;
  if (has(t, 'arr')) return `${netName(t.arr, types)}[${','.repeat(t.rank - 1)}]`;
  if (has(t, 'list')) return `System.Collections.Generic.List\`1[${netName(t.list, types)}]`;
  if (has(t, 'dict')) return `System.Collections.Generic.Dictionary\`2[${netName(t.dict[0], types)},${netName(t.dict[1], types)}]`;
  if (has(t, 'cls')) {
    const info = types && types.get(t.cls);
    return info && info.ns ? `${info.ns}.${t.cls}` : t.cls;
  }
  if (has(t, 'enum')) return t.enum;
  if (has(t, 'fn')) return 'System.Delegate';
  if (has(t, 'tuple')) return `System.ValueTuple\`${t.tuple.length}`;
  if (has(t, 'nullable')) return `System.Nullable\`1[${netName(t.nullable, types)}]`;
  if (t === 'sb') return 'System.Text.StringBuilder';
  if (t === 'random') return 'System.Random';
  return String(t);
}

// nazwa typu w zapisie C# (do komunikatów)
export function csName(t) {
  if (t === null || t === undefined) return '?';
  if (isPrim(t)) return { sb: 'StringBuilder', random: 'Random', null: 'null', type: 'typ' }[t] || t;
  if (has(t, 'arr')) return `${csName(t.arr)}[${','.repeat(t.rank - 1)}]`;
  if (has(t, 'list')) return `List<${csName(t.list)}>`;
  if (has(t, 'dict')) return `Dictionary<${csName(t.dict[0])}, ${csName(t.dict[1])}>`;
  if (has(t, 'kvp')) return `KeyValuePair<${csName(t.kvp[0])}, ${csName(t.kvp[1])}>`;
  if (has(t, 'cls')) return t.cls;
  if (has(t, 'enum')) return t.enum;
  if (has(t, 'nullable')) return `${csName(t.nullable)}?`;
  if (has(t, 'tuple')) return `(${t.tuple.map((x) => csName(x.t)).join(', ')})`;
  if (has(t, 'fn')) return t.fn ? (t.fn.ret === 'void' ? `Action<${t.fn.params.map(csName).join(', ')}>` : `Func<${[...t.fn.params, t.fn.ret].map(csName).join(', ')}>`) : 'delegat';
  return '?';
}

export function sameType(a, b) {
  if (isPrim(a) || isPrim(b)) return a === b;
  if (has(a, 'arr') && has(b, 'arr')) return a.rank === b.rank && sameType(a.arr, b.arr);
  if (has(a, 'list') && has(b, 'list')) return sameType(a.list, b.list);
  if (has(a, 'dict') && has(b, 'dict')) return sameType(a.dict[0], b.dict[0]) && sameType(a.dict[1], b.dict[1]);
  if (has(a, 'cls') && has(b, 'cls')) return a.cls === b.cls;
  if (has(a, 'enum') && has(b, 'enum')) return a.enum === b.enum;
  if (has(a, 'nullable') && has(b, 'nullable')) return sameType(a.nullable, b.nullable);
  if (has(a, 'tuple') && has(b, 'tuple')) return a.tuple.length === b.tuple.length && a.tuple.every((x, k) => sameType(x.t, b.tuple[k].t));
  if (has(a, 'fn') && has(b, 'fn')) return true;
  if (has(a, 'kvp') && has(b, 'kvp')) return true;
  return false;
}

// ---------- wbudowane wyjątki (kompilowane razem z programem ucznia) ----------
export const EXCEPTIONS = [
  ['Exception', null, "Exception of type 'System.Exception' was thrown.", 'System'],
  ['SystemException', 'Exception', 'System error.', 'System'],
  ['ArithmeticException', 'SystemException', 'Overflow or underflow in the arithmetic operation.', 'System'],
  ['DivideByZeroException', 'ArithmeticException', 'Attempted to divide by zero.', 'System'],
  ['OverflowException', 'ArithmeticException', 'Arithmetic operation resulted in an overflow.', 'System'],
  ['FormatException', 'SystemException', 'One of the identified items was in an invalid format.', 'System'],
  ['IndexOutOfRangeException', 'SystemException', 'Index was outside the bounds of the array.', 'System'],
  ['NullReferenceException', 'SystemException', 'Object reference not set to an instance of an object.', 'System'],
  ['InvalidCastException', 'SystemException', 'Specified cast is not valid.', 'System'],
  ['InvalidOperationException', 'SystemException', 'Operation is not valid due to the current state of the object.', 'System'],
  ['ArgumentException', 'SystemException', 'Value does not fall within the expected range.', 'System'],
  ['ArgumentOutOfRangeException', 'ArgumentException', 'Specified argument was out of the range of valid values.', 'System'],
  ['ArgumentNullException', 'ArgumentException', 'Value cannot be null.', 'System'],
  ['NotImplementedException', 'SystemException', 'The method or operation is not implemented.', 'System'],
  ['NotSupportedException', 'SystemException', 'Specified method is not supported.', 'System'],
  ['KeyNotFoundException', 'SystemException', 'The given key was not present in the dictionary.', 'System.Collections.Generic'],
];

export const EXCEPTION_NAMES = EXCEPTIONS.map((e) => e[0]);

export const PRELUDE_SRC = EXCEPTIONS.map(([name, base, msg]) => {
  const m = JSON.stringify(msg);
  if (!base) {
    return `public class Exception {
  public string Message { get; }
  public Exception() { Message = ${m}; }
  public Exception(string message) { Message = message; }
}`;
  }
  return `public class ${name} : ${base} {
  public ${name}() : base(${m}) {}
  public ${name}(string message) : base(message) {}
}`;
}).join('\n');

// polskie wyjaśnienia nieobsłużonych wyjątków
export const EXCEPTION_HINTS = {
  FormatException: 'napis nie zawiera poprawnej liczby (sprawdź dane wejściowe albo użyj int.TryParse)',
  DivideByZeroException: 'dzielenie liczby całkowitej przez zero',
  IndexOutOfRangeException: 'indeks wychodzi poza tablicę (pamiętaj: indeksy od 0 do Length - 1)',
  ArgumentOutOfRangeException: 'indeks lub argument poza dozwolonym zakresem (np. indeks listy ≥ Count)',
  NullReferenceException: 'użyto zmiennej, która ma wartość null (obiekt nie został utworzony przez new)',
  InvalidCastException: 'niepoprawne rzutowanie – obiekt nie jest tego typu',
  KeyNotFoundException: 'w słowniku nie ma takiego klucza (sprawdź ContainsKey lub użyj TryGetValue)',
  OverflowException: 'liczba jest zbyt duża dla tego typu',
  InvalidOperationException: 'operacja niedozwolona w obecnym stanie (np. modyfikacja kolekcji w foreach)',
  ArgumentNullException: 'przekazano null tam, gdzie wymagana jest wartość',
};
