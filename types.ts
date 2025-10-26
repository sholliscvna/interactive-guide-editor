
import { CATEGORIES } from './constants';

export interface Section {
  id: string;
  title: string;
  content: string;
  categoryKey: keyof typeof CATEGORIES;
  x: number; // percentage
  y: number; // percentage
}
