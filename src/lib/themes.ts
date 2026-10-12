import { useSyncExternalStore } from "react";

export type ThemeCategory =
  | "Todos"
  | "Claros"
  | "Escuros"
  | "Românticos"
  | "Fantasia"
  | "Acadêmicos"
  | "Naturais"
  | "Futuristas"
  | "Personalizados";

export const THEME_CATEGORIES: ThemeCategory[] = [
  "Todos",
  "Claros",
  "Escuros",
  "Românticos",
  "Fantasia",
  "Acadêmicos",
  "Naturais",
  "Futuristas",
  "Personalizados",
];

export type ThemeMode = "light" | "dark";

export type ThemeCardBorderStyle =
  "subtle" | "rounded-soft" | "classic-double" | "neon-glow" | "sharp-minimal";
export type ThemeButtonShape = "pill" | "rounded" | "soft-square" | "cyber-cut";
export type ThemeIconStyle =
  "minimalist" | "delicate" | "ornamental" | "magical" | "futuristic" | "editorial" | "botanical";

export type ThemeDecorationMotif =
  | "none"
  | "spectral-archive"
  | "sparkle-hearts"
  | "coquette-bows"
  | "cherry-blossom"
  | "academia-quills"
  | "classic-filigree"
  | "sage-leaves"
  | "ocean-waves"
  | "lavender-stars"
  | "galaxy-constellations"
  | "mystic-crystals"
  | "cyberpunk-grid"
  | "cottage-wildflowers"
  | "royal-crowns"
  | "minimal-clean";

export type ThemeSpacingScale = "compact" | "default" | "relaxed";

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardElevated: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  hover: string;
  success: string;
  warning: string;
  destructive: string;
  wine: string;
  magenta: string;
  teal: string;
  plum: string;
  gold?: string;
  iconColor?: string;
  iconPrimary?: string;
  iconSecondary?: string;
  iconAccent?: string;
  iconMuted?: string;
  iconActive?: string;
  iconHover?: string;
  iconDisabled?: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  titleLetterSpacing: string;
}

export interface ThemeVisualStyle {
  radiusPx: number;
  cardBorderStyle: ThemeCardBorderStyle;
  buttonShape: ThemeButtonShape;
  iconStyle: ThemeIconStyle;
  decorationMotif: ThemeDecorationMotif;
  shadowIntensity: number; // 0 to 100
  glowEffect: boolean;
  dividerStyle: "solid" | "dashed" | "ornate" | "glow";
}

export interface VisualTheme {
  id: string;
  name: string;
  description: string;
  mode: ThemeMode;
  categories: ThemeCategory[];
  isBuiltIn: boolean;
  isCustom?: boolean;
  paletteSwatches: [string, string, string, string, string];
  colors: ThemeColors;
  typography: ThemeTypography;
  visualStyle: ThemeVisualStyle;
  createdAt?: string;
  updatedAt?: string;
}

export interface ThemeScheduleConfig {
  enabled: boolean;
  dayThemeId: string;
  nightThemeId: string;
  dayStartHour: number; // default 6
  nightStartHour: number; // default 19
}

export interface ThemeAccessibilityConfig {
  showDecorations: boolean;
  decorationIntensity: "subtle" | "medium" | "vibrant";
  enableAnimations: boolean;
  highContrast: boolean;
  spacingScale: ThemeSpacingScale;
}

export interface ThemeSystemState {
  activeThemeId: string;
  previewThemeId: string | null;
  favoriteThemeIds: string[];
  customThemes: VisualTheme[];
  bookThemeOverrides: Record<string, string>; // bookId -> themeId
  worldThemeOverrides: Record<string, string>; // worldRecordId or universeName -> themeId
  schedule: ThemeScheduleConfig;
  accessibility: ThemeAccessibilityConfig;
}

// ============================================================================
// OS 15 TEMAS INICIAIS OFICIAIS DO SPECTRAL ARCHIVE STUDIO
// ============================================================================

export const BUILTIN_THEMES: VisualTheme[] = [
  {
    id: "spectral-original",
    name: "Spectral Original",
    description:
      "Tema oficial do aplicativo. Rosa choque, azul-noite, lavanda, turquesa e verde limão em uma atmosfera moderna, elegante e misteriosa inspirada em arquivos criativos.",
    mode: "dark",
    categories: ["Escuros", "Fantasia", "Acadêmicos"],
    isBuiltIn: true,
    paletteSwatches: ["#181020", "#E83888", "#4CD4C8", "#B392F0", "#A6E22E"],
    colors: {
      background: "#160F1D",
      backgroundSecondary: "#22162B",
      card: "#21162A",
      cardElevated: "#2B1D37",
      foreground: "#F7EEF5",
      mutedForeground: "#B9A3B5",
      primary: "#E83888",
      primaryForeground: "#FFF8FC",
      secondary: "#332040",
      secondaryForeground: "#F2E2EE",
      accent: "#4CD4C8",
      accentForeground: "#0D2424",
      border: "rgba(185, 130, 175, 0.28)",
      input: "rgba(165, 110, 155, 0.35)",
      ring: "#E83888",
      hover: "#3D264D",
      success: "#A6E22E",
      warning: "#F5B942",
      destructive: "#EA4C4C",
      wine: "#5C162E",
      magenta: "#E01E8C",
      teal: "#4CD4C8",
      plum: "#5B2C6F",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.01em",
    },
    visualStyle: {
      radiusPx: 16,
      cardBorderStyle: "subtle",
      buttonShape: "pill",
      iconStyle: "editorial",
      decorationMotif: "spectral-archive",
      shadowIntensity: 60,
      glowEffect: true,
      dividerStyle: "solid",
    },
  },
  {
    id: "pink-dream",
    name: "Pink Dream",
    description:
      "Rosa-bebê, rosa-claro, branco e detalhes magenta. Aparência delicada, alegre e acolhedora com cartões suaves e detalhes arredondados.",
    mode: "light",
    categories: ["Claros", "Românticos"],
    isBuiltIn: true,
    paletteSwatches: ["#FFF5F9", "#FFD6E7", "#FF85B3", "#D92672", "#FFFFFF"],
    colors: {
      background: "#FFF6FA",
      backgroundSecondary: "#FFEAF3",
      card: "#FFFFFF",
      cardElevated: "#FFF0F6",
      foreground: "#4A1930",
      mutedForeground: "#8C536E",
      primary: "#E03A80",
      primaryForeground: "#FFFFFF",
      secondary: "#FFE0EE",
      secondaryForeground: "#5C1D3A",
      accent: "#FF85B3",
      accentForeground: "#4A1930",
      border: "rgba(224, 58, 128, 0.22)",
      input: "rgba(224, 58, 128, 0.28)",
      ring: "#E03A80",
      hover: "#FFD1E6",
      success: "#2E9E6B",
      warning: "#D9822B",
      destructive: "#D9384A",
      wine: "#8F2452",
      magenta: "#E03A80",
      teal: "#3898A6",
      plum: "#9A4C80",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.015em",
    },
    visualStyle: {
      radiusPx: 22,
      cardBorderStyle: "rounded-soft",
      buttonShape: "pill",
      iconStyle: "delicate",
      decorationMotif: "sparkle-hearts",
      shadowIntensity: 35,
      glowEffect: true,
      dividerStyle: "solid",
    },
  },
  {
    id: "coquette",
    name: "Coquette",
    description:
      "Rosa, vermelho-cereja, creme e detalhes bordô. Elementos visuais delicados inspirados em laços, fitas e romantismo clássico sofisticado.",
    mode: "light",
    categories: ["Claros", "Românticos"],
    isBuiltIn: true,
    paletteSwatches: ["#FDF8F5", "#F7DCE2", "#B81D38", "#6B0F24", "#E899AC"],
    colors: {
      background: "#FCF6F4",
      backgroundSecondary: "#F7E9E8",
      card: "#FFFDFC",
      cardElevated: "#FAF0F0",
      foreground: "#3D101B",
      mutedForeground: "#7D4955",
      primary: "#B81D38",
      primaryForeground: "#FFF9FA",
      secondary: "#F5DCE0",
      secondaryForeground: "#4D1221",
      accent: "#6B0F24",
      accentForeground: "#FFF9FA",
      border: "rgba(184, 29, 56, 0.24)",
      input: "rgba(184, 29, 56, 0.3)",
      ring: "#B81D38",
      hover: "#EED0D6",
      success: "#2E8555",
      warning: "#C87D28",
      destructive: "#C91E2E",
      wine: "#6B0F24",
      magenta: "#B81D38",
      teal: "#7D4955",
      plum: "#8A2846",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.02em",
    },
    visualStyle: {
      radiusPx: 20,
      cardBorderStyle: "classic-double",
      buttonShape: "pill",
      iconStyle: "ornamental",
      decorationMotif: "coquette-bows",
      shadowIntensity: 40,
      glowEffect: false,
      dividerStyle: "ornate",
    },
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    description:
      "Rosa pastel, branco e verde suave. Inspiração nas flores de cerejeira na primavera, com decoração floral discreta e atmosfera tranquila.",
    mode: "light",
    categories: ["Claros", "Românticos", "Naturais"],
    isBuiltIn: true,
    paletteSwatches: ["#FFF9FB", "#FADCE6", "#E36888", "#6D9F7B", "#4F313C"],
    colors: {
      background: "#FFF9FB",
      backgroundSecondary: "#F9ECF0",
      card: "#FFFFFF",
      cardElevated: "#FDF3F6",
      foreground: "#3B232B",
      mutedForeground: "#7A5864",
      primary: "#D65A7A",
      primaryForeground: "#FFFFFF",
      secondary: "#F5DFE7",
      secondaryForeground: "#472934",
      accent: "#5A8F69",
      accentForeground: "#FFFFFF",
      border: "rgba(214, 90, 122, 0.22)",
      input: "rgba(214, 90, 122, 0.28)",
      ring: "#D65A7A",
      hover: "#F0D3DD",
      success: "#4E8C62",
      warning: "#CC8A35",
      destructive: "#CF3A4B",
      wine: "#7A3045",
      magenta: "#D65A7A",
      teal: "#5A8F69",
      plum: "#8C4F6E",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.015em",
    },
    visualStyle: {
      radiusPx: 18,
      cardBorderStyle: "rounded-soft",
      buttonShape: "pill",
      iconStyle: "botanical",
      decorationMotif: "cherry-blossom",
      shadowIntensity: 30,
      glowEffect: false,
      dividerStyle: "solid",
    },
  },
  {
    id: "dark-academia",
    name: "Dark Academia",
    description:
      "Marrom, vinho, bege, preto e tons de papel envelhecido. Inspiração em bibliotecas antigas, arquivos históricos, livros clássicos e estudos.",
    mode: "dark",
    categories: ["Escuros", "Acadêmicos"],
    isBuiltIn: true,
    paletteSwatches: ["#17120E", "#292019", "#6E222A", "#C7A26B", "#EAE0D0"],
    colors: {
      background: "#17120E",
      backgroundSecondary: "#221A14",
      card: "#241B15",
      cardElevated: "#2E231B",
      foreground: "#EAE0D0",
      mutedForeground: "#B09D84",
      primary: "#A87B46",
      primaryForeground: "#17120E",
      secondary: "#33261E",
      secondaryForeground: "#E5D8C5",
      accent: "#8C2D38",
      accentForeground: "#FAF3E8",
      border: "rgba(199, 162, 107, 0.25)",
      input: "rgba(199, 162, 107, 0.32)",
      ring: "#C7A26B",
      hover: "#3B2D23",
      success: "#6E9E6B",
      warning: "#D99B38",
      destructive: "#B83B3B",
      wine: "#6E222A",
      magenta: "#8C2D38",
      teal: "#C7A26B",
      plum: "#4A2E25",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.025em",
    },
    visualStyle: {
      radiusPx: 10,
      cardBorderStyle: "classic-double",
      buttonShape: "rounded",
      iconStyle: "editorial",
      decorationMotif: "academia-quills",
      shadowIntensity: 70,
      glowEffect: false,
      dividerStyle: "ornate",
    },
  },
  {
    id: "classic-library",
    name: "Classic Library",
    description:
      "Bordô, dourado, marfim e marrom. Aparência de biblioteca clássica com elementos inspirados em livros encadernados em couro e arquivos literários.",
    mode: "light",
    categories: ["Claros", "Acadêmicos"],
    isBuiltIn: true,
    paletteSwatches: ["#F7F2E7", "#EDE3CE", "#6E1A28", "#B8860B", "#3B2314"],
    colors: {
      background: "#F7F2E7",
      backgroundSecondary: "#EDE3CE",
      card: "#FCF9F2",
      cardElevated: "#F4EBDD",
      foreground: "#2B1A10",
      mutedForeground: "#6B5341",
      primary: "#6E1A28",
      primaryForeground: "#FAF5EB",
      secondary: "#E6D9C0",
      secondaryForeground: "#382114",
      accent: "#B08223",
      accentForeground: "#FFFFFF",
      border: "rgba(110, 26, 40, 0.24)",
      input: "rgba(107, 83, 65, 0.3)",
      ring: "#6E1A28",
      hover: "#DFCFAF",
      success: "#357A4D",
      warning: "#B87D1E",
      destructive: "#B32626",
      wine: "#6E1A28",
      magenta: "#8A2435",
      teal: "#B08223",
      plum: "#52281D",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.02em",
    },
    visualStyle: {
      radiusPx: 10,
      cardBorderStyle: "classic-double",
      buttonShape: "rounded",
      iconStyle: "editorial",
      decorationMotif: "classic-filigree",
      shadowIntensity: 45,
      glowEffect: false,
      dividerStyle: "ornate",
    },
  },
  {
    id: "sage-garden",
    name: "Sage Garden",
    description:
      "Verde-sálvia, verde-escuro, creme e branco. Inspiração botânica serena com pequenos detalhes de folhas e formas orgânicas naturais.",
    mode: "light",
    categories: ["Claros", "Naturais"],
    isBuiltIn: true,
    paletteSwatches: ["#F5F7F2", "#E2EAE0", "#4A6B53", "#2C4233", "#8FA893"],
    colors: {
      background: "#F5F7F2",
      backgroundSecondary: "#E6EDE4",
      card: "#FFFFFF",
      cardElevated: "#EFF4ED",
      foreground: "#1F3024",
      mutedForeground: "#556B5B",
      primary: "#3D6348",
      primaryForeground: "#F8FAF7",
      secondary: "#DCE6D9",
      secondaryForeground: "#253B2B",
      accent: "#729479",
      accentForeground: "#FFFFFF",
      border: "rgba(61, 99, 72, 0.24)",
      input: "rgba(61, 99, 72, 0.3)",
      ring: "#3D6348",
      hover: "#CFDEC9",
      success: "#2F7D4E",
      warning: "#C28429",
      destructive: "#C43B3B",
      wine: "#3D5944",
      magenta: "#52785C",
      teal: "#3D6348",
      plum: "#2C4233",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.015em",
    },
    visualStyle: {
      radiusPx: 16,
      cardBorderStyle: "rounded-soft",
      buttonShape: "pill",
      iconStyle: "botanical",
      decorationMotif: "sage-leaves",
      shadowIntensity: 30,
      glowEffect: false,
      dividerStyle: "solid",
    },
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    description:
      "Azul, turquesa, branco e azul profundo. Aparência fresca, limpa e tranquila com elementos fluidos inspirados nas marés e no oceano.",
    mode: "light",
    categories: ["Claros", "Naturais"],
    isBuiltIn: true,
    paletteSwatches: ["#F2F9FC", "#D9F0F7", "#0E7490", "#083344", "#22D3EE"],
    colors: {
      background: "#F2F9FC",
      backgroundSecondary: "#E1F2F8",
      card: "#FFFFFF",
      cardElevated: "#ECF7FB",
      foreground: "#0B2938",
      mutedForeground: "#496E80",
      primary: "#0E7490",
      primaryForeground: "#FFFFFF",
      secondary: "#D5EDF6",
      secondaryForeground: "#0D3547",
      accent: "#0284C7",
      accentForeground: "#FFFFFF",
      border: "rgba(14, 116, 144, 0.24)",
      input: "rgba(14, 116, 144, 0.3)",
      ring: "#0E7490",
      hover: "#C3E5F2",
      success: "#0D9488",
      warning: "#D97706",
      destructive: "#DC2626",
      wine: "#155E75",
      magenta: "#0284C7",
      teal: "#0E7490",
      plum: "#1E3A8A",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.01em",
    },
    visualStyle: {
      radiusPx: 18,
      cardBorderStyle: "rounded-soft",
      buttonShape: "pill",
      iconStyle: "delicate",
      decorationMotif: "ocean-waves",
      shadowIntensity: 35,
      glowEffect: false,
      dividerStyle: "solid",
    },
  },
  {
    id: "lavender-dreams",
    name: "Lavender Dreams",
    description:
      "Lavanda, lilás, branco e roxo suave. Aparência delicada, sonhadora e mágica com detalhes sutis inspirados em estrelas e flores noturnas.",
    mode: "light",
    categories: ["Claros", "Românticos", "Fantasia"],
    isBuiltIn: true,
    paletteSwatches: ["#F9F6FF", "#EAE0FC", "#7E42D9", "#4A2080", "#B589F7"],
    colors: {
      background: "#F9F6FF",
      backgroundSecondary: "#EFE8FC",
      card: "#FFFFFF",
      cardElevated: "#F5F0FE",
      foreground: "#2A1547",
      mutedForeground: "#6B528C",
      primary: "#7E42D9",
      primaryForeground: "#FFFFFF",
      secondary: "#E6DAFA",
      secondaryForeground: "#361B5C",
      accent: "#9D65EB",
      accentForeground: "#FFFFFF",
      border: "rgba(126, 66, 217, 0.23)",
      input: "rgba(126, 66, 217, 0.3)",
      ring: "#7E42D9",
      hover: "#DAC8F7",
      success: "#2E9668",
      warning: "#D48824",
      destructive: "#D9385A",
      wine: "#5B2A86",
      magenta: "#9D4EDD",
      teal: "#7E42D9",
      plum: "#4A2080",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.015em",
    },
    visualStyle: {
      radiusPx: 20,
      cardBorderStyle: "rounded-soft",
      buttonShape: "pill",
      iconStyle: "magical",
      decorationMotif: "lavender-stars",
      shadowIntensity: 35,
      glowEffect: true,
      dividerStyle: "solid",
    },
  },
  {
    id: "midnight-galaxy",
    name: "Midnight Galaxy",
    description:
      "Azul-noite, roxo cósmico, violeta e detalhes luminosos. Inspiração em galáxias, nebulosas e astronomia com elementos celestes discretos.",
    mode: "dark",
    categories: ["Escuros", "Fantasia", "Futuristas"],
    isBuiltIn: true,
    paletteSwatches: ["#090B1A", "#131836", "#6366F1", "#A855F7", "#38BDF8"],
    colors: {
      background: "#090B1A",
      backgroundSecondary: "#11152E",
      card: "#131836",
      cardElevated: "#1B224A",
      foreground: "#ECF0FF",
      mutedForeground: "#94A0CC",
      primary: "#7C68FA",
      primaryForeground: "#FFFFFF",
      secondary: "#1E2652",
      secondaryForeground: "#DCE3FF",
      accent: "#38BDF8",
      accentForeground: "#061926",
      border: "rgba(124, 104, 250, 0.28)",
      input: "rgba(124, 104, 250, 0.35)",
      ring: "#7C68FA",
      hover: "#263066",
      success: "#34D399",
      warning: "#FBBF24",
      destructive: "#F87171",
      wine: "#311B61",
      magenta: "#A855F7",
      teal: "#38BDF8",
      plum: "#1E1B4B",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.02em",
    },
    visualStyle: {
      radiusPx: 16,
      cardBorderStyle: "neon-glow",
      buttonShape: "pill",
      iconStyle: "magical",
      decorationMotif: "galaxy-constellations",
      shadowIntensity: 65,
      glowEffect: true,
      dividerStyle: "glow",
    },
  },
  {
    id: "mystic-fantasy",
    name: "Mystic Fantasy",
    description:
      "Roxo profundo, magenta, azul arcano e detalhes prateados. Aparência mágica e encantada inspirada em símbolos místicos, cristais e luz etérea.",
    mode: "dark",
    categories: ["Escuros", "Fantasia"],
    isBuiltIn: true,
    paletteSwatches: ["#140A24", "#22123B", "#D946EF", "#60A5FA", "#E2E8F0"],
    colors: {
      background: "#140A24",
      backgroundSecondary: "#1E1035",
      card: "#22123B",
      cardElevated: "#2D194D",
      foreground: "#F5EEFC",
      mutedForeground: "#B8A2D4",
      primary: "#D946EF",
      primaryForeground: "#FFF7FF",
      secondary: "#341C59",
      secondaryForeground: "#EFE3FA",
      accent: "#60A5FA",
      accentForeground: "#09182E",
      border: "rgba(217, 70, 239, 0.28)",
      input: "rgba(217, 70, 239, 0.35)",
      ring: "#D946EF",
      hover: "#40236B",
      success: "#4ADE80",
      warning: "#FACC15",
      destructive: "#FB7185",
      wine: "#4C1D95",
      magenta: "#D946EF",
      teal: "#60A5FA",
      plum: "#3B0764",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.02em",
    },
    visualStyle: {
      radiusPx: 18,
      cardBorderStyle: "neon-glow",
      buttonShape: "pill",
      iconStyle: "magical",
      decorationMotif: "mystic-crystals",
      shadowIntensity: 70,
      glowEffect: true,
      dividerStyle: "glow",
    },
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    description:
      "Preto, azul-escuro, ciano elétrico, magenta neon e verde limão. Aparência futurista e tecnológica com bordas luminosas e elementos geométricos.",
    mode: "dark",
    categories: ["Escuros", "Futuristas"],
    isBuiltIn: true,
    paletteSwatches: ["#070913", "#0F1629", "#00F0FF", "#FF007F", "#B8FF01"],
    colors: {
      background: "#070913",
      backgroundSecondary: "#0D1324",
      card: "#0F1629",
      cardElevated: "#16203A",
      foreground: "#ECFEFF",
      mutedForeground: "#88A4C4",
      primary: "#FF007F",
      primaryForeground: "#FFFFFF",
      secondary: "#17223D",
      secondaryForeground: "#D8F8FF",
      accent: "#00F0FF",
      accentForeground: "#04161A",
      border: "rgba(0, 240, 255, 0.35)",
      input: "rgba(0, 240, 255, 0.42)",
      ring: "#00F0FF",
      hover: "#1E2D52",
      success: "#B8FF01",
      warning: "#FFE600",
      destructive: "#FF2A54",
      wine: "#59003A",
      magenta: "#FF007F",
      teal: "#00F0FF",
      plum: "#1E1047",
    },
    typography: {
      displayFont: '"Jost", system-ui, sans-serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.06em",
    },
    visualStyle: {
      radiusPx: 6,
      cardBorderStyle: "neon-glow",
      buttonShape: "cyber-cut",
      iconStyle: "futuristic",
      decorationMotif: "cyberpunk-grid",
      shadowIntensity: 80,
      glowEffect: true,
      dividerStyle: "glow",
    },
  },
  {
    id: "cottagecore",
    name: "Cottagecore",
    description:
      "Verde-musgo, bege, creme e rosa seco. Inspiração campestre, acolhedora e artesanal com elementos florais e atmosfera tranquila.",
    mode: "light",
    categories: ["Claros", "Naturais", "Românticos"],
    isBuiltIn: true,
    paletteSwatches: ["#FAF6EE", "#EFE7D6", "#5E7153", "#C87D87", "#785A46"],
    colors: {
      background: "#FAF6EE",
      backgroundSecondary: "#EFE7D6",
      card: "#FFFDF8",
      cardElevated: "#F5EFE0",
      foreground: "#33291F",
      mutedForeground: "#6E5D4F",
      primary: "#5E7153",
      primaryForeground: "#FFFFFF",
      secondary: "#E6DCC8",
      secondaryForeground: "#3B3024",
      accent: "#C87D87",
      accentForeground: "#FFFFFF",
      border: "rgba(94, 113, 83, 0.25)",
      input: "rgba(110, 93, 79, 0.3)",
      ring: "#5E7153",
      hover: "#DDD1B8",
      success: "#4E7A45",
      warning: "#C9862E",
      destructive: "#B84242",
      wine: "#8A4954",
      magenta: "#C87D87",
      teal: "#5E7153",
      plum: "#6E5041",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.015em",
    },
    visualStyle: {
      radiusPx: 18,
      cardBorderStyle: "classic-double",
      buttonShape: "pill",
      iconStyle: "botanical",
      decorationMotif: "cottage-wildflowers",
      shadowIntensity: 35,
      glowEffect: false,
      dividerStyle: "ornate",
    },
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    description:
      "Preto, dourado imperial, creme e vinho. Aparência luxuosa, nobre e editorial com detalhes dourados discretos e acabamento refinado.",
    mode: "dark",
    categories: ["Escuros", "Acadêmicos", "Fantasia"],
    isBuiltIn: true,
    paletteSwatches: ["#110E0C", "#1C1714", "#D4AF37", "#7A1C29", "#F7F1E3"],
    colors: {
      background: "#110E0C",
      backgroundSecondary: "#191512",
      card: "#1C1714",
      cardElevated: "#261F1B",
      foreground: "#F7F1E3",
      mutedForeground: "#B8AA93",
      primary: "#D4AF37",
      primaryForeground: "#14100C",
      secondary: "#2B231C",
      secondaryForeground: "#F2E8D5",
      accent: "#8F2030",
      accentForeground: "#FFF8F0",
      border: "rgba(212, 175, 55, 0.3)",
      input: "rgba(212, 175, 55, 0.38)",
      ring: "#D4AF37",
      hover: "#362B22",
      success: "#5EBA7D",
      warning: "#E5A93C",
      destructive: "#D94848",
      wine: "#7A1C29",
      magenta: "#A32939",
      teal: "#D4AF37",
      plum: "#4A1C24",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0.03em",
    },
    visualStyle: {
      radiusPx: 12,
      cardBorderStyle: "classic-double",
      buttonShape: "rounded",
      iconStyle: "ornamental",
      decorationMotif: "royal-crowns",
      shadowIntensity: 75,
      glowEffect: true,
      dividerStyle: "ornate",
    },
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    description:
      "Branco, cinza suave, grafite e detalhes discretos. Foco absoluto em leitura, produtividade e escrita sem distrações visuais.",
    mode: "light",
    categories: ["Claros", "Acadêmicos"],
    isBuiltIn: true,
    paletteSwatches: ["#FFFFFF", "#F4F4F5", "#18181B", "#52525B", "#E4E4E7"],
    colors: {
      background: "#FAFAFA",
      backgroundSecondary: "#F1F1F3",
      card: "#FFFFFF",
      cardElevated: "#F6F6F7",
      foreground: "#18181B",
      mutedForeground: "#63636B",
      primary: "#27272A",
      primaryForeground: "#FFFFFF",
      secondary: "#ECECEF",
      secondaryForeground: "#18181B",
      accent: "#3F3F46",
      accentForeground: "#FFFFFF",
      border: "rgba(24, 24, 27, 0.14)",
      input: "rgba(24, 24, 27, 0.2)",
      ring: "#27272A",
      hover: "#E4E4E7",
      success: "#16A34A",
      warning: "#D97706",
      destructive: "#DC2626",
      wine: "#3F3F46",
      magenta: "#52525B",
      teal: "#27272A",
      plum: "#3F3F46",
    },
    typography: {
      displayFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Jost", system-ui, sans-serif',
      titleLetterSpacing: "0em",
    },
    visualStyle: {
      radiusPx: 10,
      cardBorderStyle: "sharp-minimal",
      buttonShape: "soft-square",
      iconStyle: "minimalist",
      decorationMotif: "minimal-clean",
      shadowIntensity: 15,
      glowEffect: false,
      dividerStyle: "solid",
    },
  },
];

// ============================================================================
// UTILITÁRIOS DE CONTRASTE E ACESSIBILIDADE
// ============================================================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const transform = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = transform(rgb.r);
  const G = transform(rgb.g);
  const B = transform(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function ensureReadableForeground(bgHex: string, preferredFgHex?: string): string {
  if (preferredFgHex && getContrastRatio(bgHex, preferredFgHex) >= 4.2) {
    return preferredFgHex;
  }
  const lum = getRelativeLuminance(bgHex);
  return lum > 0.42 ? "#18141C" : "#FAF5FC";
}

// ============================================================================
// GERENCIAMENTO DE ESTADO E PERSISTÊNCIA DE TEMAS
// ============================================================================

const THEME_STORAGE_KEY = "spectral-archive-themes-v1";

function defaultThemeState(): ThemeSystemState {
  return {
    activeThemeId: "spectral-original",
    previewThemeId: null,
    favoriteThemeIds: ["spectral-original", "pink-dream", "dark-academia"],
    customThemes: [],
    bookThemeOverrides: {},
    worldThemeOverrides: {},
    schedule: {
      enabled: false,
      dayThemeId: "classic-library",
      nightThemeId: "spectral-original",
      dayStartHour: 6,
      nightStartHour: 19,
    },
    accessibility: {
      showDecorations: true,
      decorationIntensity: "subtle",
      enableAnimations: true,
      highContrast: false,
      spacingScale: "default",
    },
  };
}

let themeState: ThemeSystemState | null = null;
const serverThemeState = defaultThemeState();
const themeListeners = new Set<() => void>();

function loadThemeState(): ThemeSystemState {
  if (themeState) return themeState;
  try {
    const raw =
      typeof localStorage !== "undefined" ? localStorage.getItem(THEME_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThemeSystemState>;
      themeState = {
        ...defaultThemeState(),
        ...parsed,
        PreviewResetSafe: undefined,
        previewThemeId: parsed.previewThemeId ?? null,
        schedule: {
          ...defaultThemeState().schedule,
          ...(parsed.schedule ?? {}),
        },
        accessibility: {
          ...defaultThemeState().accessibility,
          ...(parsed.accessibility ?? {}),
        },
        customThemes: Array.isArray(parsed.customThemes) ? parsed.customThemes : [],
        favoriteThemeIds: Array.isArray(parsed.favoriteThemeIds)
          ? parsed.favoriteThemeIds
          : defaultThemeState().favoriteThemeIds,
        bookThemeOverrides: parsed.bookThemeOverrides ?? {},
        worldThemeOverrides: parsed.worldThemeOverrides ?? {},
      } as ThemeSystemState;
    } else {
      themeState = defaultThemeState();
    }
  } catch {
    themeState = defaultThemeState();
  }
  return themeState!;
}

function setThemeState(updater: (prev: ThemeSystemState) => ThemeSystemState) {
  const prev = loadThemeState();
  themeState = updater(prev);
  try {
    if (typeof localStorage !== "undefined") {
      // Persistimos tudo exceto previewThemeId temporário para evitar travar em prévia se fechar a aba
      const toPersist: ThemeSystemState = {
        ...themeState,
        previewThemeId: null,
      };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(toPersist));
    }
  } catch {
    console.warn("Não foi possível salvar configurações de tema no localStorage.");
  }
  applyCurrentThemeToDocument();
  themeListeners.forEach((l) => l());
}

export function useThemeStore<T>(selector: (s: ThemeSystemState) => T): T {
  return selector(
    useSyncExternalStore(
      (l) => {
        themeListeners.add(l);
        return () => themeListeners.delete(l);
      },
      loadThemeState,
      () => serverThemeState,
    ),
  );
}

export function getAllThemes(state: ThemeSystemState = loadThemeState()): VisualTheme[] {
  return [...BUILTIN_THEMES, ...(state.customThemes ?? [])];
}

export function getThemeById(
  themeId: string | undefined | null,
  state: ThemeSystemState = loadThemeState(),
): VisualTheme {
  if (!themeId) return BUILTIN_THEMES[0]!;
  const all = getAllThemes(state);
  return all.find((t) => t.id === themeId) ?? BUILTIN_THEMES[0]!;
}

export function resolveScheduledThemeId(
  state: ThemeSystemState = loadThemeState(),
  currentHour: number = new Date().getHours(),
): string {
  if (!state.schedule.enabled) return state.activeThemeId;
  const { dayStartHour, nightStartHour, dayThemeId, nightThemeId } = state.schedule;
  const isDay =
    dayStartHour < nightStartHour
      ? currentHour >= dayStartHour && currentHour < nightStartHour
      : currentHour >= dayStartHour || currentHour < nightStartHour;
  return isDay ? dayThemeId : nightThemeId;
}

export function resolveEffectiveTheme(
  options?: {
    bookId?: string | null | undefined;
    worldRecordId?: string | null | undefined;
    currentHour?: number | undefined;
  },
  state: ThemeSystemState = loadThemeState(),
): VisualTheme {
  // 1. Se houver pré-visualização ativa, ela tem prioridade imediata
  if (state.previewThemeId) {
    return getThemeById(state.previewThemeId, state);
  }
  // 2. Se houver livro específico com tema vinculado
  if (options?.bookId && state.bookThemeOverrides[options.bookId]) {
    return getThemeById(state.bookThemeOverrides[options.bookId], state);
  }
  // 3. Se houver mundo/registro da enciclopédia com tema vinculado
  if (options?.worldRecordId && state.worldThemeOverrides[options.worldRecordId]) {
    return getThemeById(state.worldThemeOverrides[options.worldRecordId], state);
  }
  // 4. Modo automático Dia/Noite ou Tema Ativo Global
  const targetId = resolveScheduledThemeId(state, options?.currentHour);
  return getThemeById(targetId, state);
}

// ============================================================================
// APLICAÇÃO DE VARIÁVEIS CSS NO DOCUMENTO EM TEMPO REAL
// ============================================================================

let activeContextOverride: { bookId?: string | null; worldRecordId?: string | null } = {};

export function setThemeContextOverride(ctx: {
  bookId?: string | null;
  worldRecordId?: string | null;
}) {
  activeContextOverride = ctx;
  applyCurrentThemeToDocument();
}

export function resolveThemeIconPalette(
  c: ThemeColors,
  isHighContrast = false,
  mode: ThemeMode = "dark",
) {
  const iconPrimary = c.iconPrimary || c.primary;
  const iconAccent = c.iconAccent || c.accent || c.primary;
  const iconSecondary = c.iconSecondary || iconAccent;
  const iconMuted = isHighContrast
    ? mode === "light"
      ? "#27272A"
      : "#E4E4E7"
    : c.iconMuted || c.mutedForeground;
  const iconColor = c.iconColor || iconPrimary;
  const iconActive = c.iconActive || iconPrimary;
  const iconHover = c.iconHover || iconAccent;
  const iconDisabled = c.iconDisabled || iconMuted;
  const gold = c.gold || c.warning || c.accent || c.primary;

  return {
    iconColor,
    iconPrimary,
    iconSecondary,
    iconAccent,
    iconMuted,
    iconActive,
    iconHover,
    iconDisabled,
    gold,
  };
}

export function applyThemeObjectToDocument(
  theme: VisualTheme,
  accessibility: ThemeAccessibilityConfig = loadThemeState().accessibility,
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const c = theme.colors;

  const isHighContrast = accessibility.highContrast;
  const fg = isHighContrast ? (theme.mode === "light" ? "#000000" : "#FFFFFF") : c.foreground;
  const mutedFg = isHighContrast
    ? theme.mode === "light"
      ? "#27272A"
      : "#E4E4E7"
    : c.mutedForeground;
  const borderCol = isHighContrast
    ? theme.mode === "light"
      ? "rgba(0, 0, 0, 0.55)"
      : "rgba(255, 255, 255, 0.6)"
    : c.border;

  const icons = resolveThemeIconPalette(c, isHighContrast, theme.mode);

  // Sincroniza variáveis semânticas legadas caso um tema personalizado tenha editado primary/accent
  const effectiveTeal = c.iconAccent || c.teal || c.accent || c.primary;
  const effectiveMagenta = c.iconPrimary || c.magenta || c.primary;
  const effectiveGold = icons.gold;

  root.style.setProperty("--background", c.background);
  root.style.setProperty("--background-secondary", c.backgroundSecondary);
  root.style.setProperty("--foreground", fg);
  root.style.setProperty("--card", c.card);
  root.style.setProperty("--card-elevated", c.cardElevated);
  root.style.setProperty("--card-foreground", fg);
  root.style.setProperty("--popover", c.cardElevated);
  root.style.setProperty("--popover-foreground", fg);
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty(
    "--primary-foreground",
    ensureReadableForeground(c.primary, c.primaryForeground),
  );
  root.style.setProperty("--secondary", c.secondary);
  root.style.setProperty(
    "--secondary-foreground",
    ensureReadableForeground(c.secondary, c.secondaryForeground),
  );
  root.style.setProperty("--muted", c.backgroundSecondary);
  root.style.setProperty("--muted-foreground", mutedFg);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty(
    "--accent-foreground",
    ensureReadableForeground(c.accent, c.accentForeground),
  );
  root.style.setProperty("--destructive", c.destructive);
  root.style.setProperty("--destructive-foreground", "#FFFFFF");
  root.style.setProperty("--success", c.success);
  root.style.setProperty("--warning", c.warning);
  root.style.setProperty("--hover", c.hover);
  root.style.setProperty("--border", borderCol);
  root.style.setProperty("--input", c.input);
  root.style.setProperty("--ring", c.ring || c.primary);
  root.style.setProperty("--wine", c.wine);
  root.style.setProperty("--magenta", effectiveMagenta);
  root.style.setProperty("--teal", effectiveTeal);
  root.style.setProperty("--plum", c.plum);
  root.style.setProperty("--gold", effectiveGold);

  // Variáveis dinâmicas exclusivas de ícones do tema ativo
  root.style.setProperty("--icon-color", icons.iconColor);
  root.style.setProperty("--icon-primary", icons.iconPrimary);
  root.style.setProperty("--icon-secondary", icons.iconSecondary);
  root.style.setProperty("--icon-accent", icons.iconAccent);
  root.style.setProperty("--icon-muted", icons.iconMuted);
  root.style.setProperty("--icon-active", icons.iconActive);
  root.style.setProperty("--icon-hover", icons.iconHover);
  root.style.setProperty("--icon-disabled", icons.iconDisabled);

  // Tipografia e bordas
  root.style.setProperty("--radius", `${theme.visualStyle.radiusPx}px`);
  root.style.setProperty("--font-display", theme.typography.displayFont);
  root.style.setProperty("--font-sans", theme.typography.bodyFont);
  root.style.setProperty("--title-letter-spacing", theme.typography.titleLetterSpacing);

  // Formato de botão
  const btnRadius =
    theme.visualStyle.buttonShape === "pill"
      ? "999px"
      : theme.visualStyle.buttonShape === "rounded"
        ? "12px"
        : theme.visualStyle.buttonShape === "soft-square"
          ? "6px"
          : "4px";
  root.style.setProperty("--btn-radius", btnRadius);

  // Gradientes e sombras dinâmicas de acordo com o tema
  const glowAlpha = Math.round((theme.visualStyle.shadowIntensity / 100) * 55) / 100;
  root.style.setProperty(
    "--gradient-saga",
    `radial-gradient(120% 90% at 0% 0%, ${c.plum}55, transparent 60%), radial-gradient(100% 80% at 100% 100%, ${c.magenta}38, transparent 60%), linear-gradient(135deg, ${c.cardElevated}, ${c.background})`,
  );
  root.style.setProperty(
    "--card-gradient",
    `linear-gradient(160deg, ${c.card}, ${c.backgroundSecondary})`,
  );
  root.style.setProperty(
    "--body-radial-bg",
    `radial-gradient(80% 50% at 50% -10%, ${c.primary}${theme.mode === "light" ? "18" : "2E"}, transparent)`,
  );
  root.style.setProperty(
    "--shadow-glow",
    theme.visualStyle.glowEffect
      ? `0 18px 45px -18px ${c.primary}${Math.round(glowAlpha * 255)
          .toString(16)
          .padStart(2, "0")}`
      : `0 10px 30px -15px rgba(0, 0, 0, ${theme.mode === "light" ? "0.08" : "0.45"})`,
  );

  // Atributos de dados para estilização condicional de cartões, ícones e animações
  root.setAttribute("data-theme-id", theme.id);
  root.setAttribute("data-theme-mode", theme.mode);
  root.setAttribute("data-card-style", theme.visualStyle.cardBorderStyle);
  root.setAttribute("data-button-shape", theme.visualStyle.buttonShape);
  root.setAttribute("data-icon-style", theme.visualStyle.iconStyle);
  root.setAttribute("data-divider-style", theme.visualStyle.dividerStyle);
  root.setAttribute("data-animations", accessibility.enableAnimations ? "enabled" : "disabled");
  root.setAttribute("data-spacing", accessibility.spacingScale);
  root.setAttribute("data-high-contrast", accessibility.highContrast ? "true" : "false");

  if (theme.mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export function applyCurrentThemeToDocument() {
  const st = loadThemeState();
  const effective = resolveEffectiveTheme(activeContextOverride, st);
  applyThemeObjectToDocument(effective, st.accessibility);
}

// ============================================================================
// AÇÕES PÚBLICAS DO SISTEMA DE TEMAS
// ============================================================================

export const themeActions = {
  applyTheme: (themeId: string) =>
    setThemeState((s) => ({
      ...s,
      activeThemeId: themeId,
      previewThemeId: null,
    })),

  startPreviewTheme: (themeId: string) =>
    setThemeState((s) => ({
      ...s,
      previewThemeId: themeId,
    })),

  stopPreviewTheme: () =>
    setThemeState((s) => ({
      ...s,
      previewThemeId: null,
    })),

  toggleFavoriteTheme: (themeId: string) =>
    setThemeState((s) => {
      const exists = s.favoriteThemeIds.includes(themeId);
      return {
        ...s,
        favoriteThemeIds: exists
          ? s.favoriteThemeIds.filter((id) => id !== themeId)
          : [...s.favoriteThemeIds, themeId],
      };
    }),

  createBlankCustomTheme: (baseThemeId = "spectral-original"): VisualTheme => {
    const base = getThemeById(baseThemeId);
    const now = new Date().toISOString();
    return {
      ...structuredClone(base),
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "Meu Tema Personalizado",
      description: "Tema personalizado criado no Spectral Archive Studio.",
      isBuiltIn: false,
      isCustom: true,
      categories: ["Personalizados", base.mode === "light" ? "Claros" : "Escuros"],
      createdAt: now,
      updatedAt: now,
    };
  },

  saveCustomTheme: (theme: VisualTheme) =>
    setThemeState((s) => {
      const now = new Date().toISOString();
      const normalizedCategories = Array.from(
        new Set<ThemeCategory>([
          "Personalizados",
          theme.mode === "light" ? "Claros" : "Escuros",
          ...theme.categories.filter((c) => c !== "Todos" && c !== "Claros" && c !== "Escuros"),
        ]),
      );
      const tc = theme.colors;
      const effIconPrimary = tc.iconPrimary || tc.primary;
      const effIconAccent = tc.iconAccent || tc.accent;
      const effIconMuted = tc.iconMuted || tc.mutedForeground;
      const syncedColors: ThemeColors = {
        ...tc,
        ring: tc.primary,
        magenta: effIconPrimary,
        teal: effIconAccent,
        gold: tc.gold || tc.warning || tc.accent,
        iconColor: tc.iconColor || effIconPrimary,
        iconPrimary: effIconPrimary,
        iconSecondary: tc.iconSecondary || effIconAccent,
        iconAccent: effIconAccent,
        iconMuted: effIconMuted,
        iconActive: tc.iconActive || effIconPrimary,
        iconHover: tc.iconHover || effIconAccent,
        iconDisabled: tc.iconDisabled || effIconMuted,
      };
      const normalized: VisualTheme = {
        ...theme,
        colors: syncedColors,
        isBuiltIn: false,
        isCustom: true,
        categories: normalizedCategories,
        paletteSwatches: [
          syncedColors.background,
          syncedColors.card,
          syncedColors.primary,
          syncedColors.accent,
          syncedColors.foreground,
        ],
        updatedAt: now,
        createdAt: theme.createdAt || now,
      };
      const exists = s.customThemes.some((t) => t.id === normalized.id);
      return {
        ...s,
        customThemes: exists
          ? s.customThemes.map((t) => (t.id === normalized.id ? normalized : t))
          : [...s.customThemes, normalized],
      };
    }),

  duplicateThemeAsCustom: (sourceThemeId: string): VisualTheme => {
    const st = loadThemeState();
    const source = getThemeById(sourceThemeId, st);
    const now = new Date().toISOString();
    const copy: VisualTheme = {
      ...structuredClone(source),
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${source.name} (Cópia)`,
      isBuiltIn: false,
      isCustom: true,
      categories: Array.from(
        new Set<ThemeCategory>([
          "Personalizados",
          source.mode === "light" ? "Claros" : "Escuros",
          ...source.categories.filter((c) => c !== "Todos"),
        ]),
      ),
      createdAt: now,
      updatedAt: now,
    };
    setThemeState((s) => ({
      ...s,
      customThemes: [...s.customThemes, copy],
    }));
    return copy;
  },

  deleteCustomTheme: (themeId: string) =>
    setThemeState((s) => {
      const nextCustom = s.customThemes.filter((t) => t.id !== themeId);
      const nextActive = s.activeThemeId === themeId ? "spectral-original" : s.activeThemeId;
      const nextPreview = s.previewThemeId === themeId ? null : s.previewThemeId;
      const nextFavs = s.favoriteThemeIds.filter((id) => id !== themeId);
      const nextBooks = { ...s.bookThemeOverrides };
      for (const [k, v] of Object.entries(nextBooks)) {
        if (v === themeId) delete nextBooks[k];
      }
      const nextWorlds = { ...s.worldThemeOverrides };
      for (const [k, v] of Object.entries(nextWorlds)) {
        if (v === themeId) delete nextWorlds[k];
      }
      return {
        ...s,
        customThemes: nextCustom,
        activeThemeId: nextActive,
        previewThemeId: nextPreview,
        favoriteThemeIds: nextFavs,
        bookThemeOverrides: nextBooks,
        worldThemeOverrides: nextWorlds,
      };
    }),

  setBookThemeOverride: (bookId: string, themeId: string | null) =>
    setThemeState((s) => {
      const next = { ...s.bookThemeOverrides };
      if (!themeId) {
        delete next[bookId];
      } else {
        next[bookId] = themeId;
      }
      return { ...s, bookThemeOverrides: next };
    }),

  setWorldThemeOverride: (worldRecordId: string, themeId: string | null) =>
    setThemeState((s) => {
      const next = { ...s.worldThemeOverrides };
      if (!themeId) {
        delete next[worldRecordId];
      } else {
        next[worldRecordId] = themeId;
      }
      return { ...s, worldThemeOverrides: next };
    }),

  updateSchedule: (partial: Partial<ThemeScheduleConfig>) =>
    setThemeState((s) => ({
      ...s,
      schedule: { ...s.schedule, ...partial },
    })),

  updateAccessibility: (partial: Partial<ThemeAccessibilityConfig>) =>
    setThemeState((s) => ({
      ...s,
      accessibility: { ...s.accessibility, ...partial },
    })),

  restoreDefaultTheme: () =>
    setThemeState((s) => ({
      ...s,
      activeThemeId: "spectral-original",
      previewThemeId: null,
      schedule: {
        ...s.schedule,
        enabled: false,
      },
      accessibility: defaultThemeState().accessibility,
    })),

  resetThemesForTests: () => {
    themeState = defaultThemeState();
    activeContextOverride = {};
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
    applyCurrentThemeToDocument();
    themeListeners.forEach((l) => l());
  },
};
