import { createContext, useContext } from 'react';
import { getCourse } from '../data/course.js';
import { langOf } from './lang.js';

// Aktywny język programowania i jego kurs – dostępne w całym drzewie komponentów.
export const LangContext = createContext('cpp');

export function useLang() {
  const id = useContext(LangContext);
  return { id, lang: langOf(id), course: getCourse(id) };
}
