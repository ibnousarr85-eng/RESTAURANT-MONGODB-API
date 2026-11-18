export interface Page<T> {
  total: number;
  page: number;
  pages: number;
  resultats: T[];
}