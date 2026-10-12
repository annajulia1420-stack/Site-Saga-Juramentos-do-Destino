import { useThemeStore, resolveEffectiveTheme, type ThemeDecorationMotif } from "@/lib/themes";

export function ThemeDecorations({
  overrideMotif,
  forceShow,
  className = "",
}: {
  overrideMotif?: ThemeDecorationMotif;
  forceShow?: boolean;
  className?: string;
}) {
  const state = useThemeStore((s) => s);
  const effectiveTheme = resolveEffectiveTheme(undefined, state);
  const motif = overrideMotif ?? effectiveTheme.visualStyle.decorationMotif;
  const show = forceShow ?? state.accessibility.showDecorations;

  if (!show || motif === "none" || motif === "minimal-clean") return null;

  const opacityClass =
    state.accessibility.decorationIntensity === "vibrant"
      ? "opacity-25"
      : state.accessibility.decorationIntensity === "medium"
        ? "opacity-15"
        : "opacity-10";

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${opacityClass} ${className}`}
      aria-hidden="true"
      data-testid="theme-decorative-layer"
      data-motif={motif}
    >
      {/* Motivo: Spectral Original / Arquivos Criativos */}
      {motif === "spectral-archive" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <circle
            cx="1080"
            cy="110"
            r="140"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle cx="1080" cy="110" r="95" stroke="var(--teal)" strokeWidth="0.8" />
          <path
            d="M1080 35 L1085 105 L1155 110 L1085 115 L1080 185 L1075 115 L1005 110 L1075 105 Z"
            fill="var(--primary)"
            fillOpacity="0.25"
          />
          <circle
            cx="120"
            cy="680"
            r="110"
            stroke="var(--plum)"
            strokeWidth="1.2"
            strokeDasharray="3 5"
          />
        </svg>
      )}

      {/* Motivo: Pink Dream (Corações e Brilhos Delicados) */}
      {motif === "sparkle-hearts" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <path
            d="M1060 95 C1060 80 1040 70 1028 83 C1016 70 996 80 996 95 C996 116 1028 134 1028 134 C1028 134 1060 116 1060 95 Z"
            stroke="var(--primary)"
            strokeWidth="1.8"
            fill="var(--primary)"
            fillOpacity="0.15"
          />
          <path
            d="M1115 140 L1119 152 L1131 156 L1119 160 L1115 172 L1111 160 L1099 156 L1111 152 Z"
            fill="var(--accent)"
          />
          <path
            d="M140 650 L144 662 L156 666 L144 670 L140 682 L136 670 L124 666 L136 662 Z"
            fill="var(--primary)"
          />
          <circle cx="1090" cy="70" r="6" fill="var(--accent)" />
        </svg>
      )}

      {/* Motivo: Coquette (Laços, Fitas e Molduras Românticas) */}
      {motif === "coquette-bows" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          {/* Laço superior direito */}
          <path
            d="M1050 90 C1015 60 995 95 1030 110 C995 125 1015 160 1050 115 M1050 90 C1085 60 1105 95 1070 110 C1105 125 1085 160 1050 115"
            stroke="var(--primary)"
            strokeWidth="2"
            fill="var(--primary)"
            fillOpacity="0.14"
          />
          <circle cx="1050" cy="108" r="7" fill="var(--primary)" />
          <path
            d="M1046 114 L1030 165 M1054 114 L1070 165"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Cantoneira clássica inferior esquerda */}
          <path d="M60 640 L60 740 L160 740" stroke="var(--primary)" strokeWidth="1.5" />
          <path
            d="M72 652 L72 728 L148 728"
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      )}

      {/* Motivo: Cherry Blossom (Pétalas de Cerejeira) */}
      {motif === "cherry-blossom" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <g transform="translate(1040, 90)">
            <circle cx="0" cy="-22" r="14" fill="var(--primary)" fillOpacity="0.28" />
            <circle cx="21" cy="-7" r="14" fill="var(--primary)" fillOpacity="0.28" />
            <circle cx="13" cy="18" r="14" fill="var(--primary)" fillOpacity="0.28" />
            <circle cx="-13" cy="18" r="14" fill="var(--primary)" fillOpacity="0.28" />
            <circle cx="-21" cy="-7" r="14" fill="var(--primary)" fillOpacity="0.28" />
            <circle cx="0" cy="0" r="6" fill="var(--accent)" />
          </g>
          <path
            d="M960 140 C975 130 990 145 975 155 C960 165 950 150 960 140 Z"
            fill="var(--primary)"
            fillOpacity="0.3"
          />
          <path
            d="M150 670 C165 660 180 675 165 685 C150 695 140 680 150 670 Z"
            fill="var(--primary)"
            fillOpacity="0.3"
          />
        </svg>
      )}

      {/* Motivo: Dark Academia & Classic Library (Filigranas e Molduras Clássicas) */}
      {(motif === "academia-quills" || motif === "classic-filigree") && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <rect
            x="36"
            y="36"
            width="1128"
            height="728"
            rx="8"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
          <rect
            x="44"
            y="44"
            width="1112"
            height="712"
            rx="4"
            stroke="var(--primary)"
            strokeWidth="0.6"
            strokeDasharray="6 6"
            strokeOpacity="0.35"
          />
          <path
            d="M36 90 L90 36 M1164 90 L1110 36 M36 710 L90 764 M1164 710 L1110 764"
            stroke="var(--primary)"
            strokeWidth="1.4"
          />
        </svg>
      )}

      {/* Motivo: Sage Garden & Cottagecore (Folhas Botânicas e Flores Campestres) */}
      {(motif === "sage-leaves" || motif === "cottage-wildflowers") && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <path
            d="M1140 40 C1060 90 1020 160 990 250"
            stroke="var(--primary)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M1090 75 C1065 60 1045 80 1070 98 C1090 110 1105 90 1090 75 Z"
            fill="var(--primary)"
            fillOpacity="0.28"
          />
          <path
            d="M1050 125 C1080 115 1095 135 1070 150 C1045 162 1035 135 1050 125 Z"
            fill="var(--accent)"
            fillOpacity="0.28"
          />
          <path
            d="M1020 180 C995 168 980 188 1002 204 C1022 215 1035 192 1020 180 Z"
            fill="var(--primary)"
            fillOpacity="0.28"
          />
        </svg>
      )}

      {/* Motivo: Ocean Breeze (Ondas Fluidas) */}
      {motif === "ocean-waves" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <path
            d="M0 710 Q 300 660, 600 710 T 1200 710"
            stroke="var(--primary)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M0 745 Q 300 695, 600 745 T 1200 745"
            stroke="var(--accent)"
            strokeWidth="1.2"
            strokeDasharray="8 6"
            fill="none"
          />
        </svg>
      )}

      {/* Motivo: Lavender Dreams, Midnight Galaxy & Mystic Fantasy (Constelações, Cristais e Estrelas) */}
      {(motif === "lavender-stars" ||
        motif === "galaxy-constellations" ||
        motif === "mystic-crystals") && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <polyline
            points="960,80 1030,115 1095,75 1140,145 1065,190"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <circle cx="960" cy="80" r="3.5" fill="var(--accent)" />
          <circle cx="1030" cy="115" r="4.5" fill="var(--primary)" />
          <circle cx="1095" cy="75" r="3.5" fill="var(--accent)" />
          <circle cx="1140" cy="145" r="5" fill="var(--primary)" />
          <circle cx="1065" cy="190" r="3.5" fill="var(--accent)" />
          <polygon
            points="140,640 158,675 140,715 122,675"
            stroke="var(--primary)"
            strokeWidth="1.5"
            fill="var(--primary)"
            fillOpacity="0.18"
          />
        </svg>
      )}

      {/* Motivo: Cyberpunk Neon (Grade Tecnológica Geométrica) */}
      {motif === "cyberpunk-grid" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <path d="M980 40 L1160 40 L1160 180" stroke="var(--accent)" strokeWidth="2" />
          <path
            d="M1010 55 L1145 55 L1145 140"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeDasharray="10 4"
          />
          <path d="M40 640 L40 760 L220 760" stroke="var(--primary)" strokeWidth="2" />
          <line
            x1="0"
            y1="780"
            x2="1200"
            y2="780"
            stroke="var(--accent)"
            strokeWidth="0.8"
            strokeDasharray="20 10"
          />
        </svg>
      )}

      {/* Motivo: Royal Gold (Coroa e Insígnia Imperial) */}
      {motif === "royal-crowns" && (
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none">
          <polygon
            points="1020,115 1035,75 1060,100 1080,65 1100,100 1125,75 1140,115"
            stroke="var(--primary)"
            strokeWidth="1.8"
            fill="var(--primary)"
            fillOpacity="0.16"
          />
          <line x1="1020" y1="122" x2="1140" y2="122" stroke="var(--primary)" strokeWidth="2" />
          <rect
            x="42"
            y="42"
            width="1116"
            height="716"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
        </svg>
      )}
    </div>
  );
}
