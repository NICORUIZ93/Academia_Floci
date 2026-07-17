import {
  Apple, Atom, BookOpen, Braces, ChevronDown, ChevronRight, Circle, CircleCheck, CloudCog, Coffee,
  Command, GitBranch, Layers, Leaf, LucideIconData, Search, Server, Shield, Smartphone, Truck, Wind, X,
} from 'lucide-angular';

/** Mapea el campo string `Track.icon` a su icono lucide-angular, para mantener
 *  los archivos de datos (tracks/*.track.ts) libres de imports de UI. */
export const TRACK_ICONS: Record<string, LucideIconData> = {
  'book-open': BookOpen,
  'cloud-cog': CloudCog,
  'git-branch': GitBranch,
  'braces': Braces,
  'server': Server,
  'shield': Shield,
  'atom': Atom,
  'coffee': Coffee,
  'leaf': Leaf,
  'layers': Layers,
  'smartphone': Smartphone,
  'apple': Apple,
  'wind': Wind,
  'truck': Truck,
};

export const SHARED_ICONS = {
  ChevronDown, ChevronRight, Circle, CircleCheck, Command, Search, X,
};
