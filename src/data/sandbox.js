// Szablony programów dla piaskownicy – każdy zawiera `using namespace std;`.
import { DEFAULT_TEMPLATE } from './template.js';

export const SANDBOX_TEMPLATES = [
  {
    id: 'empty',
    title: 'Pusty program',
    description: 'Standardowy szablon startowy',
    code: DEFAULT_TEMPLATE,
  },
  {
    id: 'io',
    title: 'Wczytaj i wypisz',
    description: 'cin, cout i zmienne',
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string imie;
    int liczba;

    cout << "Podaj imie: ";
    cin >> imie;
    cout << "Podaj ulubiona liczbe: ";
    cin >> liczba;

    cout << imie << ", Twoja liczba razy 2 to " << liczba * 2 << endl;
    return 0;
}
`,
  },
  {
    id: 'loop',
    title: 'Pętla i tablica',
    description: 'for, tablica, suma elementów',
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    const int N = 5;
    int t[N] = {3, 7, 1, 9, 4};
    int suma = 0;

    for (int i = 0; i < N; i++) {
        cout << "t[" << i << "] = " << t[i] << endl;
        suma += t[i];
    }
    cout << "Suma: " << suma << endl;
    return 0;
}
`,
  },
  {
    id: 'func',
    title: 'Funkcje',
    description: 'funkcja z wynikiem i procedura void',
    code: `#include <iostream>
#include <string>
using namespace std;

int kwadrat(int x) {
    return x * x;
}

void powitanie(string imie) {
    cout << "Czesc, " << imie << "!" << endl;
}

int main() {
    powitanie("Ola");
    for (int i = 1; i <= 5; i++) {
        cout << i << "^2 = " << kwadrat(i) << endl;
    }
    return 0;
}
`,
  },
  {
    id: 'class',
    title: 'Klasa i obiekt',
    description: 'pola, konstruktor, metody',
    code: `#include <iostream>
#include <string>
using namespace std;

class Pies {
private:
    string imie;
    int wiek;

public:
    Pies(string i, int w) : imie(i), wiek(w) {}

    void szczekaj() const {
        cout << imie << " mowi: Hau! Hau!" << endl;
    }

    int wiekWLatachLudzkich() const {
        return wiek * 7;
    }
};

int main() {
    Pies burek("Burek", 3);
    burek.szczekaj();
    cout << "Wiek w latach ludzkich: " << burek.wiekWLatachLudzkich() << endl;
    return 0;
}
`,
  },
  {
    id: 'recursion',
    title: 'Rekurencja',
    description: 'silnia i ciąg Fibonacciego',
    code: `#include <iostream>
#include <string>
using namespace std;

long long silnia(int n) {
    if (n <= 1) return 1;
    return n * silnia(n - 1);
}

int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    for (int i = 0; i <= 10; i++) {
        cout << i << "! = " << silnia(i) << ",  fib(" << i << ") = " << fib(i) << endl;
    }
    return 0;
}
`,
  },
];

// Krótkie fragmenty wstawiane w miejscu kursora (do istniejącego programu).
export const SNIPPETS = [
  { label: 'cout', code: 'cout << "" << endl;' },
  { label: 'cin', code: 'cin >> x;' },
  { label: 'if / else', code: 'if (warunek) {\n    \n} else {\n    \n}' },
  { label: 'for', code: 'for (int i = 0; i < n; i++) {\n    \n}' },
  { label: 'while', code: 'while (warunek) {\n    \n}' },
  { label: 'do-while', code: 'do {\n    \n} while (warunek);' },
  { label: 'switch', code: 'switch (x) {\n    case 1:\n        break;\n    default:\n        break;\n}' },
  { label: 'tablica', code: 'int t[5] = {1, 2, 3, 4, 5};' },
  { label: 'string', code: 'string s = "tekst";' },
  { label: 'getline', code: 'getline(cin, s);' },
];
