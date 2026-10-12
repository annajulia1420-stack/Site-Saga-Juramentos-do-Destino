import { useHydrated } from "@tanstack/react-router";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowLeft,
  BookOpen,
  Box,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Layers,
  Maximize2,
  Move3d,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useStore,
  actions,
  defaultDesign,
  type StudioDesign,
  type BookFormatPreset,
  type BookPaperType,
  type BookFoilType,
  type BookLaminationType,
  type BookPageEdgeType,
  type BookCornerStyle,
  type BookTypographyStyle,
  type BookTitleAlignment,
} from "@/lib/store";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { useResolvedMediaUrl } from "@/components/MediaImage";

export const Route = createFileRoute("/estudio/$id")({
  head: () => ({
    meta: [
      { title: "Estúdio Editorial — Spectral Archive Studio" },
      {
        name: "description",
        content:
          "Estúdio editorial 3D: simule capa frontal, lombada proporcional, contracapa, orelhas e miolo.",
      },
      { property: "og:title", content: "Estúdio Editorial — Spectral Archive Studio" },
      {
        property: "og:description",
        content:
          "Estúdio editorial 3D: simule capa frontal, lombada proporcional, contracapa, orelhas e miolo.",
      },
    ],
  }),
  component: Studio,
});

const FORMATS: Record<Exclude<BookFormatPreset, "Personalizado">, [number, number]> = {
  "14x21": [14, 21],
  "16x23": [16, 23],
  A5: [14.8, 21],
  "15.5x22.5": [15.5, 22.5],
  "17x24": [17, 24],
};

const FORMAT_LABELS: Record<BookFormatPreset, string> = {
  "14x21": "14 × 21 cm (Romances / Eco)",
  "16x23": "16 × 23 cm (Trade Editorial)",
  A5: "14,8 × 21 cm (Padrão A5)",
  "15.5x22.5": "15,5 × 22,5 cm (Literário)",
  "17x24": "17 × 24 cm (Edição Luxo)",
  Personalizado: "Personalizado (cm)",
};

const PAPER_COLOR: Record<BookPaperType, string> = {
  Pólen: "#efe3c8",
  Branco: "#f9f9fb",
  Creme: "#f5ead6",
  Avena: "#ebe0c9",
  Marfim: "#f7efde",
};

const PAPER_CALIPER_Factor: Record<number, number> = {
  75: 0.0052,
  80: 0.0062,
  90: 0.0072,
  115: 0.0085,
};

const FOIL_STYLE: Record<BookFoilType, { color: string; gradient?: string; label: string }> = {
  Nenhum: { color: "", label: "Sem metalizado" },
  Dourado: {
    color: "#e6c36e",
    gradient:
      "linear-gradient(135deg, #b8892b 0%, #f7e094 28%, #d4a443 52%, #fff2bd 75%, #a87920 100%)",
    label: "Hot Stamping Dourado",
  },
  Rosé: {
    color: "#eeb4b9",
    gradient:
      "linear-gradient(135deg, #b9757c 0%, #ffdbe0 30%, #dc98a0 55%, #fff0f2 78%, #a6626a 100%)",
    label: "Hot Stamping Rosé Gold",
  },
  Prateado: {
    color: "#d9dfe6",
    gradient:
      "linear-gradient(135deg, #8e98a4 0%, #f5f8fc 30%, #b8c2ce 55%, #ffffff 78%, #7d8794 100%)",
    label: "Hot Stamping Prateado",
  },
  Holográfico: {
    color: "#b4e8f8",
    gradient:
      "linear-gradient(135deg, #ff85c0 0%, #a5f3fc 32%, #d8b4fe 58%, #fde68a 82%, #67e8f9 100%)",
    label: "Foil Holográfico Prismatic",
  },
  Cobre: {
    color: "#da8a67",
    gradient:
      "linear-gradient(135deg, #8c482b 0%, #f5b393 32%, #c9734c 58%, #ffd8c4 80%, #7c3b20 100%)",
    label: "Hot Stamping Cobre Imperial",
  },
  "Vinho Metálico": {
    color: "#d95b82",
    gradient:
      "linear-gradient(135deg, #6b132f 0%, #f27ca0 32%, #a8244e 58%, #ffb8ce 80%, #580d25 100%)",
    label: "Foil Vinho Metálico",
  },
};

const TYPOGRAPHY_FAMILIES: Record<BookTypographyStyle, string> = {
  Editorial: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
  Clássica: "Georgia, 'Times New Roman', serif",
  Moderna: "var(--font-sans), 'Jost', system-ui, sans-serif",
  Romântica: "'Cormorant Garamond', Georgia, serif",
  Gótica: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
};

type ViewMode = "3d" | "frontal" | "contracapa" | "lombada" | "planificada" | "aberto" | "miolo";

type InspectorTab = "identidade" | "artes" | "formato" | "acabamento" | "miolo" | "versoes";

function computeBookDimensions(d: StudioDesign) {
  const [w, h] =
    d.format === "Personalizado"
      ? [
          Math.min(30, Math.max(9, d.customWidthCm || 15)),
          Math.min(36, Math.max(13, d.customHeightCm || 22)),
        ]
      : FORMATS[d.format] || [14, 21];

  const gsm = d.paperWeightGsm || 80;
  const factor = PAPER_CALIPER_Factor[gsm] ?? 0.0062;
  const paperFactorBonus =
    d.paper === "Pólen" || d.paper === "Avena" ? 1.08 : d.paper === "Branco" ? 0.92 : 1.0;

  const calculatedSpine = Math.max(
    0.85,
    +(d.pages * factor * paperFactorBonus + (d.hardcover ? 0.45 : 0.12)).toFixed(2),
  );

  const spineCm =
    d.autoSpineWidth === false && d.manualSpineCm
      ? Math.min(9.5, Math.max(0.6, d.manualSpineCm))
      : calculatedSpine;

  return { widthCm: w, heightCm: h, spineCm, calculatedSpine };
}

function Studio() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const books = useStore((s) => s.books);
  const chapters = useStore((s) => s.chapters);
  const book = useMemo(() => books.find((b) => b.id === id), [books, id]);
  const author = useStore((s) => s.authorName);
  const entry = useStore((s) => s.studio[id]);

  const [d, setD] = useState<StudioDesign | null>(null);
  const [view, setView] = useState<ViewMode>("3d");
  const [activeTab, setActiveTab] = useState<InspectorTab>("identidade");
  const [vname, setVname] = useState("");
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  // 3D interactive camera state
  const [rotY, setRotY] = useState(-28);
  const [rotX, setRotX] = useState(8);
  const [zoom, setZoom] = useState(1);
  const [bookOpenDeg, setBookOpenDeg] = useState(0); // 0 = fechado, até 150 = aberto
  const [isDragging, setIsDragging] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; rotY: number; rotX: number } | null>(null);

  const hydrated = useHydrated();

  useEffect(() => {
    if (book) {
      const base = defaultDesign(book, author);
      const saved = entry?.current;
      setD(saved ? { ...base, ...saved } : base);
    }
  }, [book?.id, hydrated]);

  // Resolve media URLs (IndexedDB or dataURL)
  const resolvedFrontImg = useResolvedMediaUrl(d?.frontImage);
  const resolvedBackImg = useResolvedMediaUrl(d?.backImage);
  const resolvedSpineImg = useResolvedMediaUrl(d?.spineImage);

  // Chapters of this book for interior preview
  const bookChapters = useMemo(
    () =>
      (chapters ?? [])
        .filter((c) => c.bookId === id)
        .sort((a, b) => (a.displayOrder || a.number) - (b.displayOrder || b.number)),
    [chapters, id],
  );

  const comparedVersion = useMemo(
    () => entry?.versions.find((v) => v.id === compareVersionId) ?? null,
    [entry?.versions, compareVersionId],
  );

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl card-luxe p-8 text-center">
        <p className="text-lg">Livro não encontrado.</p>
        <Link to="/estudio" className="btn mt-4">
          Voltar ao Estúdio
        </Link>
      </div>
    );
  }
  if (!d) return null;

  const up = <K extends keyof StudioDesign>(k: K, v: StudioDesign[K]) => {
    const n = { ...d, [k]: v };
    setD(n);
    actions.saveDesign(id, n);
  };

  const updateMultiple = (patch: Partial<StudioDesign>) => {
    const n = { ...d, ...patch };
    setD(n);
    actions.saveDesign(id, n);
  };

  const handleImageUpload = async (
    field: "frontImage" | "backImage" | "spineImage",
    file: File,
  ) => {
    try {
      const dataUrl = await processImageFile(file, 1400);
      const mediaKey = `studio_${id}_${field}_${Date.now()}`;
      const refUrl = await storeMediaDataUrl(mediaKey, dataUrl);
      up(field, refUrl);
    } catch {
      const r = new FileReader();
      r.onload = () => up(field, r.result as string);
      r.readAsDataURL(file);
    }
  };

  const { widthCm: w, heightCm: h, spineCm: spine, calculatedSpine } = computeBookDimensions(d);

  // Base scale: 16.5 pixels per centimeter gives realistic editorial presence
  const S = 16.5;
  const pxW = Math.round(w * S);
  const pxH = Math.round(h * S);
  const pxSpine = Math.max(16, Math.round(spine * S));
  const boardOverhang = d.hardcover ? 4 : 0; // Hardcover boards slightly overhang the paper block
  const blockW = pxW - (d.hardcover ? 5 : 1);
  const blockH = pxH - (d.hardcover ? 8 : 2);
  const blockThickness = Math.max(12, pxSpine - (d.hardcover ? 5 : 1));

  const foilSpec = FOIL_STYLE[d.foil] ?? FOIL_STYLE.Nenhum;
  const foilColor = foilSpec.color || d.textColor;
  const spineTextCol = d.foil !== "Nenhum" ? foilColor : d.spineTextColor || d.textColor;
  const secondaryCol = d.secondaryCoverColor || book.palette[1] || "#e8475f";
  const effectiveSpineColor = d.spineColor || d.coverColor;
  const paperHex = PAPER_COLOR[d.paper] || "#efe3c8";
  const titleFont = TYPOGRAPHY_FAMILIES[d.typographyStyle || "Editorial"];

  // Edge appearance (Fore-edge, top edge, bottom edge of pages)
  const getPageEdgeBackground = (direction: "90deg" | "0deg"): string => {
    const basePaper =
      d.pageEdgeType === "Pintado"
        ? d.pageEdgeColor || secondaryCol
        : d.pageEdgeType === "Metalizado"
          ? foilSpec.color || "#e3c27a"
          : paperHex;

    if (d.pageEdgeType === "Metalizado") {
      return `repeating-linear-gradient(${direction}, ${basePaper} 0px, ${basePaper} 1.5px, rgba(255,255,255,0.45) 1.5px, rgba(0,0,0,0.18) 3px)`;
    }
    if (d.pageEdgeType === "Estampado") {
      return `radial-gradient(circle at 50% 50%, ${d.pageEdgeColor || secondaryCol} 0%, ${basePaper} 65%), repeating-linear-gradient(${direction}, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1.5px, rgba(255,255,255,0.2) 1.5px, rgba(0,0,0,0.15) 3px)`;
    }
    return `repeating-linear-gradient(${direction}, ${basePaper} 0px, ${basePaper} 1.8px, rgba(60,42,25,0.16) 1.8px, rgba(60,42,25,0.24) 2.8px)`;
  };

  // Lamination finish overlay
  const getLaminationOverlay = (): CSSProperties => {
    if (d.lamination === "Brilho") {
      return {
        background:
          "linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.04) 34%, transparent 50%, rgba(255,255,255,0.1) 85%, transparent 100%)",
      };
    }
    if (d.lamination === "Textura Linho") {
      return {
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)",
      };
    }
    if (d.lamination === "Soft Touch") {
      return {
        background:
          "radial-gradient(120% 90% at 25% 15%, rgba(255,255,255,0.1) 0%, transparent 60%, rgba(0,0,0,0.18) 100%)",
      };
    }
    return {
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 55%, rgba(0,0,0,0.15) 100%)",
    };
  };

  const coverBg = (imgUrl: string | undefined, baseColor: string): CSSProperties => ({
    background: imgUrl
      ? `url("${imgUrl}") center/cover no-repeat`
      : `radial-gradient(circle at 50% 26%, ${secondaryCol}cc 0%, ${baseColor} 74%)`,
  });

  const cornerRadiusPx =
    d.cornerStyle === "Arredondado" ? 12 : d.cornerStyle === "Chanfrado" ? 4 : d.hardcover ? 4 : 2;

  const renderBorderFrame = () => {
    const style = d.borderFrameStyle || (d.foil !== "Nenhum" ? "Dupla" : "Nenhuma");
    if (style === "Nenhuma") return null;
    const strokeCol = d.foil !== "Nenhum" ? foilColor : `${d.textColor}66`;

    if (style === "Simples") {
      return (
        <div
          className="pointer-events-none absolute inset-[5.5%] rounded-[2px] border"
          style={{ borderColor: strokeCol }}
        />
      );
    }
    if (style === "Dupla") {
      return (
        <>
          <div
            className="pointer-events-none absolute inset-[4.8%] rounded-[2px] border"
            style={{ borderColor: strokeCol }}
          />
          <div
            className="pointer-events-none absolute inset-[6.4%] rounded-[1px] border opacity-75"
            style={{ borderColor: strokeCol }}
          />
        </>
      );
    }
    return (
      <>
        <div
          className="pointer-events-none absolute inset-[4.5%] border"
          style={{ borderColor: strokeCol }}
        />
        <div
          className="pointer-events-none absolute inset-[6.2%] border opacity-80"
          style={{ borderColor: strokeCol }}
        />
        {/* Cantoneiras ornamentais */}
        <div
          className="pointer-events-none absolute left-[3.5%] top-[3.5%] h-3.5 w-3.5 border-l-2 border-t-2"
          style={{ borderColor: strokeCol }}
        />
        <div
          className="pointer-events-none absolute right-[3.5%] top-[3.5%] h-3.5 w-3.5 border-r-2 border-t-2"
          style={{ borderColor: strokeCol }}
        />
        <div
          className="pointer-events-none absolute bottom-[3.5%] left-[3.5%] h-3.5 w-3.5 border-b-2 border-l-2"
          style={{ borderColor: strokeCol }}
        />
        <div
          className="pointer-events-none absolute bottom-[3.5%] right-[3.5%] h-3.5 w-3.5 border-b-2 border-r-2"
          style={{ borderColor: strokeCol }}
        />
      </>
    );
  };

  const renderCornerProtectors = () => {
    if (!d.cornerPieces) return null;
    const col = foilSpec.color || "#e3c27a";
    return (
      <>
        <div
          className="pointer-events-none absolute right-0 top-0 h-5 w-5"
          style={{
            background: `linear-gradient(225deg, ${col} 0%, ${col} 48%, transparent 50%)`,
            boxShadow: "inset -1px 1px 2px rgba(255,255,255,0.5)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-5 w-5"
          style={{
            background: `linear-gradient(315deg, ${col} 0%, ${col} 48%, transparent 50%)`,
            boxShadow: "inset -1px -1px 2px rgba(255,255,255,0.5)",
          }}
        />
      </>
    );
  };

  // Front Cover Component
  const FrontFace = (
    <div
      className={`relative flex h-full w-full select-none flex-col justify-between overflow-hidden p-[9%] ${
        d.titleAlignment === "esquerda" ? "items-start text-left" : "items-center text-center"
      }`}
      style={{
        ...coverBg(resolvedFrontImg, d.coverColor),
        color: d.textColor,
        fontFamily: titleFont,
        borderRadius: `2px ${cornerRadiusPx}px ${cornerRadiusPx}px 2px`,
        boxShadow: d.hardcover
          ? "inset 6px 0 12px -4px rgba(0,0,0,0.55), inset 10px 0 3px -8px rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.12)"
          : "inset 3px 0 6px -2px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {/* Sulco de vinco da capa dura (French groove hinge) */}
      {d.hardcover && (
        <div
          className="pointer-events-none absolute bottom-0 left-[10px] top-0 w-[3px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.16), rgba(0,0,0,0.25))",
          }}
        />
      )}

      {/* Laminação e textura */}
      <div className="pointer-events-none absolute inset-0" style={getLaminationOverlay()} />

      {renderBorderFrame()}
      {renderCornerProtectors()}

      {/* Topo: Autora + Volume/Selo */}
      <div className="relative z-10 flex w-full flex-col gap-0.5">
        {d.volumeLabel && (
          <span
            className="text-[0.44rem] uppercase tracking-[0.28em] opacity-80"
            style={{ color: foilColor }}
          >
            {d.volumeLabel}
          </span>
        )}
        <span
          className="text-[0.55rem] font-medium uppercase tracking-[0.3em]"
          style={{ color: foilColor }}
        >
          {d.author || author}
        </span>
      </div>

      {/* Centro/Posição do Título */}
      <div
        className={`relative z-10 my-auto flex w-full flex-col ${
          d.titleAlignment === "topo"
            ? "mt-3 mb-auto"
            : d.titleAlignment === "base"
              ? "mt-auto mb-3"
              : "my-auto"
        }`}
      >
        <p
          className="text-balance font-bold leading-[1.04] tracking-wide drop-shadow-sm"
          style={{
            fontSize: d.title.length > 22 ? "1.35rem" : d.title.length > 12 ? "1.65rem" : "2.05rem",
            color: foilColor,
            ...(d.foil !== "Nenhum" && foilSpec.gradient
              ? {
                  backgroundImage: foilSpec.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }
              : {}),
          }}
        >
          {d.title || book.title}
        </p>

        {d.interiorOrnament !== false && (
          <div
            className={`my-2 flex items-center gap-1.5 opacity-80 ${
              d.titleAlignment === "esquerda" ? "justify-start" : "justify-center"
            }`}
          >
            <span className="h-[1px] w-6" style={{ background: foilColor }} />
            <span className="text-[0.5rem]" style={{ color: foilColor }}>
              ✦
            </span>
            <span className="h-[1px] w-6" style={{ background: foilColor }} />
          </div>
        )}

        {d.subtitle && (
          <p className="text-[0.58rem] leading-snug opacity-90" style={{ color: d.textColor }}>
            {d.subtitle}
          </p>
        )}
      </div>

      {/* Rodapé Editorial: Coleção e Editora */}
      <div className="relative z-10 flex w-full flex-col gap-0.5 pt-1">
        {d.editionLabel && (
          <span className="text-[0.42rem] italic opacity-75">{d.editionLabel}</span>
        )}
        <span
          className="text-[0.46rem] uppercase tracking-[0.28em] opacity-85"
          style={{ color: foilColor }}
        >
          {d.collectionName || "Juramentos do Destino"}
        </span>
        {d.publisherName && (
          <span className="text-[0.38rem] uppercase tracking-[0.22em] opacity-65">
            {d.publisherName}
          </span>
        )}
      </div>
    </div>
  );

  // Spine Component
  const SpineFace = (
    <div
      className="relative flex h-full w-full select-none flex-col items-center justify-between overflow-hidden py-3"
      style={{
        background: resolvedSpineImg
          ? `url("${resolvedSpineImg}") center/cover no-repeat`
          : effectiveSpineColor,
        color: spineTextCol,
        fontFamily: titleFont,
        boxShadow:
          "inset 5px 0 10px -3px rgba(255,255,255,0.22), inset -6px 0 12px -3px rgba(0,0,0,0.55)",
      }}
    >
      <div className="pointer-events-none absolute inset-0" style={getLaminationOverlay()} />

      {/* Nervuras clássicas se capa dura */}
      {d.hardcover && (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-[10%] h-[2px] bg-white/15 shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
          <div className="pointer-events-none absolute left-0 right-0 top-[88%] h-[2px] bg-white/15 shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
        </>
      )}

      <span className="relative z-10 text-[0.45rem] font-semibold uppercase tracking-widest opacity-85">
        {d.volumeLabel ? d.volumeLabel.replace(/Volume\s*/i, "V.") : `0${book.order}`}
      </span>

      <div
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden py-2"
        style={{ writingMode: "vertical-rl" }}
      >
        <span
          className="truncate font-display font-semibold tracking-wider"
          style={{
            fontSize: pxSpine < 24 ? "0.62rem" : "0.76rem",
            color: spineTextCol,
          }}
        >
          {d.title || book.title}
        </span>
        <span className="mx-1.5 opacity-60">·</span>
        <span
          className="truncate text-[0.52rem] uppercase tracking-[0.2em] opacity-85"
          style={{ color: spineTextCol }}
        >
          {d.author || author}
        </span>
      </div>

      <span className="relative z-10 text-[0.42rem] uppercase tracking-widest opacity-75">✦</span>
    </div>
  );

  // Back Cover Component
  const BackFace = (
    <div
      className="relative flex h-full w-full select-none flex-col justify-between overflow-hidden p-[9%] text-left"
      style={{
        ...coverBg(resolvedBackImg, d.coverColor),
        color: d.textColor,
        fontFamily: titleFont,
        borderRadius: `${cornerRadiusPx}px 2px 2px ${cornerRadiusPx}px`,
        boxShadow: d.hardcover
          ? "inset -6px 0 12px -4px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.1)"
          : "inset -3px 0 6px -2px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <div className="pointer-events-none absolute inset-0" style={getLaminationOverlay()} />
      {renderBorderFrame()}

      <div className="relative z-10 space-y-2.5">
        {d.backQuote && (
          <p
            className="border-b border-current/20 pb-2 text-center font-display text-[0.62rem] italic leading-snug"
            style={{ color: foilColor }}
          >
            “{d.backQuote}”
          </p>
        )}
        <p className="line-clamp-[13] whitespace-pre-line font-sans text-[0.53rem] leading-[1.58] opacity-92">
          {d.synopsis ||
            book.synopsis ||
            "Sinopse editorial da contracapa. Personalize este texto no painel lateral para visualizar a diagramação traseira do seu livro físico."}
        </p>
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between gap-2 pt-2">
        <div className="flex flex-col text-[0.42rem] uppercase tracking-[0.18em] opacity-75">
          <span>{d.collectionName || "Juramentos do Destino"}</span>
          <span>{d.publisherName || "Spectral Editorial"}</span>
        </div>

        {d.showBarcode !== false && (
          <div className="flex flex-col items-center rounded-[2px] bg-white/95 px-1.5 py-1 text-[#18181b] shadow-sm">
            <div className="h-5 w-14 bg-[repeating-linear-gradient(90deg,#111_0_1px,transparent_1px_2.5px,#111_2.5px_4px,transparent_4px_5.5px)]" />
            <span className="mt-0.5 font-mono text-[0.36rem] tracking-tighter">
              {d.isbnCode || "978-65-8900-01-4"}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Drag handlers for 3D Viewport
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY,
      rotX,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextY = Math.max(-180, Math.min(180, Math.round(dragStartRef.current.rotY + dx * 0.65)));
    const nextX = Math.max(-35, Math.min(45, Math.round(dragStartRef.current.rotX - dy * 0.4)));
    setRotY(nextY);
    setRotX(nextX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const setCameraPreset = (preset: "iso" | "front" | "spine" | "back" | "top") => {
    if (preset === "iso") {
      setRotY(-28);
      setRotX(10);
      setBookOpenDeg(0);
    } else if (preset === "front") {
      setRotY(0);
      setRotX(0);
      setBookOpenDeg(0);
    } else if (preset === "spine") {
      setRotY(82);
      setRotX(4);
      setBookOpenDeg(0);
    } else if (preset === "back") {
      setRotY(180);
      setRotX(0);
      setBookOpenDeg(0);
    } else if (preset === "top") {
      setRotY(-32);
      setRotX(34);
    }
  };

  // Export High-Resolution Editorial Spread / Mockup Card to PNG
  const handleExportSpecificationPng = () => {
    try {
      const canvas = document.createElement("canvas");
      const scale = 2;
      const cw = 1200 * scale;
      const ch = 760 * scale;
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Studio dark backdrop
      const grad = ctx.createRadialGradient(600, 320, 60, 600, 380, 720);
      grad.addColorStop(0, "#241528");
      grad.addColorStop(1, "#0f0912");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 760);

      // Header text
      ctx.fillStyle = "#f5e9f2";
      ctx.font = "600 24px Georgia, serif";
      ctx.fillText(`PRANCHA EDITORIAL — ${(d.title || book.title).toUpperCase()}`, 50, 52);

      ctx.fillStyle = "#b9a3b5";
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillText(
        `Autora: ${d.author || author}  ·  Formato: ${w} × ${h} cm  ·  ${d.pages} páginas (${d.paper} ${d.paperWeightGsm || 80}g)  ·  Lombada: ${spine.toFixed(2)} cm  ·  ${d.hardcover ? "Capa Dura" : "Brochura"}`,
        50,
        78,
      );

      // Draw Spread (Back + Spine + Front)
      const drawScale = 22;
      const bw = w * drawScale;
      const bh = h * drawScale;
      const bsp = Math.max(18, spine * drawScale);
      const totalSpreadW = bw * 2 + bsp;
      const startX = (1200 - totalSpreadW) / 2;
      const startY = 125;

      // Shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = d.coverColor;
      ctx.fillRect(startX, startY, totalSpreadW, bh);
      ctx.restore();

      // Back cover box
      ctx.fillStyle = d.coverColor;
      ctx.fillRect(startX, startY, bw, bh);

      // Spine box
      ctx.fillStyle = effectiveSpineColor;
      ctx.fillRect(startX + bw, startY, bsp, bh);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.strokeRect(startX + bw, startY, bsp, bh);

      // Front cover box
      ctx.fillStyle = d.coverColor;
      ctx.fillRect(startX + bw + bsp, startY, bw, bh);

      // Frame on front cover
      const fCol = foilSpec.color || d.textColor;
      ctx.strokeStyle = fCol;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX + bw + bsp + 18, startY + 18, bw - 36, bh - 36);

      // Front Cover Typography
      ctx.fillStyle = fCol;
      ctx.textAlign = "center";
      const frontCenterX = startX + bw + bsp + bw / 2;
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText((d.author || author).toUpperCase(), frontCenterX, startY + 52);

      ctx.font = "bold 30px Georgia, serif";
      ctx.fillText(d.title || book.title, frontCenterX, startY + bh * 0.45);

      if (d.subtitle) {
        ctx.fillStyle = d.textColor;
        ctx.font = "13px Georgia, serif";
        ctx.fillText(d.subtitle.slice(0, 42), frontCenterX, startY + bh * 0.53);
      }

      ctx.fillStyle = fCol;
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(
        (d.collectionName || "JURAMENTOS DO DESTINO").toUpperCase(),
        frontCenterX,
        startY + bh - 38,
      );

      // Spine Vertical Text
      ctx.save();
      ctx.translate(startX + bw + bsp / 2, startY + bh / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = spineTextCol;
      ctx.textAlign = "center";
      ctx.font = "bold 13px Georgia, serif";
      ctx.fillText(`${d.title || book.title} · ${d.author || author}`, 0, 4);
      ctx.restore();

      // Back Cover Synopsis Preview
      ctx.fillStyle = d.textColor;
      ctx.textAlign = "left";
      ctx.font = "11px system-ui, sans-serif";
      const synText = d.synopsis || book.synopsis || "Sinopse editorial reservada na contracapa.";
      const words = synText.split(/\s+/);
      let line = "";
      let yCursor = startY + 55;
      const maxLineW = bw - 48;
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxLineW) {
          ctx.fillText(line, startX + 24, yCursor);
          line = word;
          yCursor += 17;
          if (yCursor > startY + bh - 80) break;
        } else {
          line = test;
        }
      }
      if (line && yCursor <= startY + bh - 80) {
        ctx.fillText(line, startX + 24, yCursor);
      }

      // Footer specs
      ctx.fillStyle = "#b9a3b5";
      ctx.textAlign = "center";
      ctx.font = "12px monospace";
      ctx.fillText(
        `Contracapa (${w}cm)   |   Lombada (${spine.toFixed(2)}cm)   |   Capa Frontal (${w}cm)   —   Largura Total Planificada: ${(w * 2 + spine).toFixed(2)} cm`,
        600,
        startY + bh + 45,
      );

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `livro-fisico-${book.id}.png`;
      a.click();
      setExportStatus("Prancha PNG exportada com sucesso!");
      setTimeout(() => setExportStatus(null), 3500);
    } catch {
      setExportStatus("Não foi possível exportar a imagem neste navegador.");
      setTimeout(() => setExportStatus(null), 3500);
    }
  };

  // Sample text for interior spread
  const sampleChapter = bookChapters[0];
  const effectiveChapterTitle =
    d.interiorChapterTitle ||
    (sampleChapter
      ? `${sampleChapter.type === "Capítulo" ? `Capítulo ${sampleChapter.number}` : sampleChapter.type}`
      : "Capítulo I");
  const effectiveChapterSubtitle = sampleChapter?.title || d.title || book.title;
  const effectiveInteriorBody =
    d.interiorSampleText?.trim() ||
    sampleChapter?.summaryPlainText?.trim() ||
    d.synopsis?.trim() ||
    book.synopsis?.trim() ||
    "As sombras antigas da biblioteca sussurravam promessas que atravessavam eras. Cada página guardada nos arquivos carregava o peso de uma escolha irreversível, gravada em tinta e memória sob a luz silenciosa das estrelas.";

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      {/* Cabeçalho com Seletor Rápido de Livro e Ações */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/estudio" className="btn-ghost !min-h-[38px] !px-3 !py-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Galeria de Livros
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Estúdio de Livro Físico
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-primary tabular-nums">Volume {book.order}</span>
            </div>
            <h1 className="text-2xl md:text-3xl">{d.title || book.title}</h1>
          </div>
        </div>

        {/* Troca rápida de livro + Exportar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <label htmlFor="studio-book-switcher" className="sr-only">
              Trocar livro
            </label>
            <select
              id="studio-book-switcher"
              aria-label="Selecionar livro do estúdio"
              value={book.id}
              onChange={(e) => navigate({ to: "/estudio/$id", params: { id: e.target.value } })}
              className="!min-h-[38px] !w-auto !py-1.5 text-xs"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.order}. {b.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportSpecificationPng}
            className="btn-ghost !min-h-[38px] !px-3.5 !py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Exportar Prancha PNG
          </button>
        </div>
      </div>

      {exportStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-teal/40 bg-teal/10 px-4 py-2.5 text-xs text-teal">
          <Check className="h-4 w-4 shrink-0" />
          <span>{exportStatus}</span>
        </div>
      )}

      {/* Layout Principal: Palco Editorial (Esquerda) + Inspetor de Propriedades (Direita) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_410px] xl:grid-cols-[1fr_440px]">
        {/* COLUNA ESQUERDA: PALCO DE VISUALIZAÇÃO 3D E EDITORIAL */}
        <div className="flex flex-col gap-4" style={{ marginLeft: "257px", marginRight: "0px" }}>
          {/* Barra de Modos de Visualização */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 backdrop-blur-sm">
            <div
              className="flex flex-wrap items-center gap-1"
              role="tablist"
              aria-label="Modos de visualização do livro"
            >
              {(
                [
                  ["3d", "3D Interativo", Move3d],
                  ["frontal", "Capa Frontal", BookOpen],
                  ["lombada", "Lombada", Layers],
                  ["contracapa", "Contracapa", FileText],
                  ["planificada", "Capa Aberta", Maximize2],
                  ["aberto", "Livro Aberto", Eye],
                  ["miolo", "Miolo Editorial", Type],
                ] as const
              ).map(([modeKey, label, Icon]) => (
                <button
                  key={modeKey}
                  type="button"
                  role="tab"
                  aria-selected={view === modeKey}
                  onClick={() => setView(modeKey)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    view === modeKey
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Controle de Zoom global */}
            <div className="flex items-center gap-1 border-l border-border/60 pl-2">
              <button
                type="button"
                aria-label="Diminuir zoom"
                onClick={() => setZoom((z) => Math.max(0.65, +(z - 0.1).toFixed(2)))}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[3rem] text-center text-[0.7rem] text-muted-foreground tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                aria-label="Aumentar zoom"
                onClick={() => setZoom((z) => Math.min(1.45, +(z + 0.1).toFixed(2)))}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* PALCO CENTRAL */}
          <div className="card-luxe relative flex min-h-[520px] flex-col items-center justify-between overflow-hidden p-6 md:min-h-[570px]">
            {/* Iluminação de estúdio de fundo */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(65% 55% at 50% 42%, ${secondaryCol}33 0%, transparent 72%)`,
              }}
            />

            {/* Indicador superior de especificações ativas */}
            <div className="relative z-10 flex w-full flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2 tabular-nums">
                <span className="font-medium text-foreground">
                  {w} × {h} cm
                </span>
                <span>·</span>
                <span>{d.pages} págs</span>
                <span>·</span>
                <span>Lombada {spine.toFixed(2)} cm</span>
                <span>·</span>
                <span>{d.hardcover ? "Capa Dura" : "Brochura"}</span>
                {d.flaps && (
                  <>
                    <span>·</span>
                    <span>Com orelhas ({d.flapWidthCm || 7.5} cm)</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Papel {d.paper}</span>
                {d.foil !== "Nenhum" && (
                  <>
                    <span>·</span>
                    <span className="text-primary">Foil {d.foil}</span>
                  </>
                )}
              </div>
            </div>

            {/* MODO 1: 3D INTERATIVO REALISTA (COM 6 FACES + MIOLO + CABECEADO + ABERTURA) */}
            {view === "3d" && (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative my-auto flex w-full flex-1 flex-col items-center justify-center py-6 select-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{ perspective: "1500px", touchAction: "none" }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: pxW,
                    height: pxH,
                    transformStyle: "preserve-3d",
                    transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                    transition: isDragging
                      ? "none"
                      : "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Sombra projetada no piso do estúdio */}
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      width: pxW * 1.18,
                      height: pxSpine * 2.4 + 44,
                      bottom: -26,
                      transform: `rotateX(90deg) translateZ(-${pxH / 2 + 16}px)`,
                      background:
                        "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.28) 55%, transparent 82%)",
                      filter: "blur(8px)",
                    }}
                  />

                  {/* 1. CAPA FRONTAL (com suporte a abertura articulada na lombada) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: "left center",
                      transform: `translateZ(${pxSpine / 2}px) rotateY(-${bookOpenDeg}deg)`,
                      transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Face externa da capa frontal */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {FrontFace}
                    </div>

                    {/* Face interna da capa frontal (Guardas / Orelha frontal visível ao abrir o livro) */}
                    <div
                      className="absolute inset-0 flex overflow-hidden"
                      style={{
                        transform: "rotateY(180deg) translateZ(1px)",
                        background: d.endpaperColor || paperHex,
                        borderRadius: `${cornerRadiusPx}px 2px 2px ${cornerRadiusPx}px`,
                        boxShadow: "inset 0 0 24px rgba(0,0,0,0.25)",
                      }}
                    >
                      {d.flaps && (
                        <div
                          className="h-full border-r border-black/15 p-3 text-[0.45rem] leading-relaxed"
                          style={{
                            width: "38%",
                            background: d.coverColor,
                            color: d.textColor,
                          }}
                        >
                          <p className="font-display text-[0.55rem] font-semibold uppercase tracking-wider opacity-90">
                            {d.title || book.title}
                          </p>
                          <p className="mt-1.5 opacity-80 line-clamp-[14]">
                            {d.frontFlapText ||
                              "Texto da orelha frontal: apresente um gancho magnético sobre a obra e o universo literário."}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center opacity-40">
                        <span className="font-display text-xs italic text-[#2c221e]">
                          Guarda Editorial · {d.collectionName || "Juramentos do Destino"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primeira página do miolo visível quando o livro é aberto em 3D */}
                  {bookOpenDeg > 3 && (
                    <div
                      className="absolute flex flex-col justify-between p-[9%] text-[#2c2018]"
                      style={{
                        width: blockW,
                        height: blockH,
                        left: 1,
                        top: (pxH - blockH) / 2,
                        background: paperHex,
                        transform: `translateZ(${blockThickness / 2 - 1}px)`,
                        boxShadow:
                          "inset 16px 0 24px -10px rgba(0,0,0,0.35), 0 0 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <p className="text-center text-[0.42rem] uppercase tracking-[0.25em] opacity-55">
                        {d.author || author}
                      </p>
                      <div className="my-auto text-center">
                        <p className="text-[0.46rem] uppercase tracking-[0.3em] opacity-70">
                          {effectiveChapterTitle}
                        </p>
                        <p className="mt-1 font-display text-base font-semibold">
                          {effectiveChapterSubtitle}
                        </p>
                        <div className="mx-auto my-2 h-[1px] w-8 bg-current/30" />
                        <p className="line-clamp-6 text-justify font-sans text-[0.46rem] leading-relaxed opacity-85">
                          {effectiveInteriorBody}
                        </p>
                      </div>
                      <p className="text-center text-[0.45rem] opacity-60">1</p>
                    </div>
                  )}

                  {/* 2. CONTRACAPA */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `rotateY(180deg) translateZ(${pxSpine / 2}px)`,
                    }}
                  >
                    {BackFace}
                  </div>

                  {/* 3. LOMBADA (Esquerda, conectando Capa e Contracapa perfeitamente) */}
                  <div
                    className="absolute top-0"
                    style={{
                      width: pxSpine,
                      height: pxH,
                      left: -pxSpine / 2,
                      transform: "rotateY(-90deg)",
                    }}
                  >
                    {SpineFace}
                  </div>

                  {/* 4. CORTE FRONTAL DE PÁGINAS (Direita - Fore-edge do bloco de folhas) */}
                  <div
                    className="absolute"
                    style={{
                      width: blockThickness,
                      height: blockH,
                      top: (pxH - blockH) / 2,
                      left: blockW - blockThickness / 2,
                      transform: "rotateY(90deg)",
                      background: getPageEdgeBackground("90deg"),
                      boxShadow:
                        "inset 0 3px 8px rgba(0,0,0,0.25), inset 0 -3px 8px rgba(0,0,0,0.25), inset 3px 0 6px rgba(0,0,0,0.2)",
                    }}
                  />

                  {/* 5. CORTE SUPERIOR DE PÁGINAS (Topo + Cabeceado / Headband) */}
                  <div
                    className="absolute"
                    style={{
                      width: blockW,
                      height: blockThickness,
                      left: 0,
                      top: (pxH - blockH) / 2 - blockThickness / 2,
                      transform: "rotateX(90deg)",
                      background: getPageEdgeBackground("0deg"),
                      boxShadow:
                        "inset 4px 0 8px rgba(0,0,0,0.28), inset -4px 0 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Cabeceado (Headband) junto à lombada */}
                    <div
                      className="h-full w-2.5"
                      style={{
                        background: `repeating-linear-gradient(0deg, ${
                          d.headbandColor || d.ribbonColor || secondaryCol
                        } 0 2px, #ffffff 2px 4px)`,
                      }}
                    />
                  </div>

                  {/* 6. CORTE INFERIOR DE PÁGINAS (Base + Fitilho / Marcador) */}
                  <div
                    className="absolute"
                    style={{
                      width: blockW,
                      height: blockThickness,
                      left: 0,
                      top: pxH - (pxH - blockH) / 2 - blockThickness / 2,
                      transform: "rotateX(-90deg)",
                      background: getPageEdgeBackground("0deg"),
                      boxShadow:
                        "inset 4px 0 10px rgba(0,0,0,0.35), inset -4px 0 10px rgba(0,0,0,0.25)",
                    }}
                  >
                    <div
                      className="h-full w-2.5"
                      style={{
                        background: `repeating-linear-gradient(0deg, ${
                          d.headbandColor || d.ribbonColor || secondaryCol
                        } 0 2px, #ffffff 2px 4px)`,
                      }}
                    />
                  </div>

                  {/* Marcador de fita (Fitilho de cetim) */}
                  {d.ribbon && (
                    <div
                      className="absolute"
                      style={{
                        width: 10,
                        height: 46,
                        bottom: -40 - boardOverhang,
                        left: "52%",
                        background: `linear-gradient(90deg, ${d.ribbonColor}, ${d.ribbonColor}dd 60%, ${d.ribbonColor})`,
                        transform: `translateZ(${pxSpine / 4}px) rotateZ(-3deg)`,
                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.45)",
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* MODO 2: CAPA FRONTAL (2D Em Alta Precisão) */}
            {view === "frontal" && (
              <div className="my-auto flex flex-col items-center justify-center py-4">
                <div
                  className="shadow-2xl transition-transform duration-200"
                  style={{
                    width: pxW,
                    height: pxH,
                    transform: `scale(${zoom})`,
                  }}
                >
                  {FrontFace}
                </div>
              </div>
            )}

            {/* MODO 3: LOMBADA ISOLADA + COMPARAÇÃO DE ESPESSURA */}
            {view === "lombada" && (
              <div className="my-auto flex flex-col items-center justify-center gap-4 py-4">
                <div
                  className="flex items-center gap-8 transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                      Lombada ({spine.toFixed(2)} cm)
                    </span>
                    <div
                      className="shadow-2xl"
                      style={{ width: Math.max(24, pxSpine * 1.35), height: pxH }}
                    >
                      {SpineFace}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-2 rounded-xl border border-border/60 bg-background/50 p-4 text-xs">
                    <p className="font-display text-base text-foreground">
                      Cálculo Técnico de Lombada
                    </p>
                    <div className="space-y-1 text-muted-foreground tabular-nums">
                      <p>
                        Páginas: {d.pages} págs ({Math.ceil(d.pages / 2)} folhas)
                      </p>
                      <p>
                        Papel: {d.paper} · Gramatura {d.paperWeightGsm || 80} g/m²
                      </p>
                      <p>
                        Acabamento: {d.hardcover ? "Capa Dura (+0,45 cm)" : "Brochura (+0,12 cm)"}
                      </p>
                      <p className="pt-1 font-medium text-primary">
                        Espessura final: {spine.toFixed(2)} cm ({(spine * 10).toFixed(1)} mm)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODO 4: CONTRACAPA */}
            {view === "contracapa" && (
              <div className="my-auto flex flex-col items-center justify-center py-4">
                <div
                  className="shadow-2xl transition-transform duration-200"
                  style={{
                    width: pxW,
                    height: pxH,
                    transform: `scale(${zoom})`,
                  }}
                >
                  {BackFace}
                </div>
              </div>
            )}

            {/* MODO 5: CAPA PLANIFICADA COMPLETA (Orelha Traseira + Contracapa + Lombada + Capa + Orelha Frontal) */}
            {view === "planificada" && (
              <div className="my-auto flex w-full items-center justify-center overflow-x-auto py-6">
                <div
                  className="flex flex-col items-center gap-3 transition-transform duration-200"
                  style={{ transform: `scale(${Math.min(zoom, 0.95)})` }}
                >
                  <div className="flex items-stretch shadow-2xl">
                    {/* Orelha da contracapa */}
                    {d.flaps && (
                      <div
                        className="flex flex-col justify-between border-r border-dashed border-white/25 p-3 text-[0.45rem] leading-relaxed"
                        style={{
                          width: Math.round((d.flapWidthCm || 7.5) * S),
                          height: pxH,
                          background: d.coverColor,
                          color: d.textColor,
                        }}
                      >
                        <div>
                          <p
                            className="font-display text-[0.55rem] uppercase tracking-widest"
                            style={{ color: foilColor }}
                          >
                            Sobre a Autora
                          </p>
                          <p className="mt-1.5 opacity-85">
                            {d.backFlapText ||
                              `${d.author || author} é criadora do universo ${d.collectionName || "Juramentos do Destino"}.`}
                          </p>
                        </div>
                        <span className="text-[0.38rem] uppercase tracking-widest opacity-50">
                          Orelha Traseira ({d.flapWidthCm || 7.5} cm)
                        </span>
                      </div>
                    )}

                    {/* Contracapa */}
                    <div style={{ width: pxW, height: pxH }}>{BackFace}</div>

                    {/* Lombada */}
                    <div style={{ width: pxSpine, height: pxH }}>{SpineFace}</div>

                    {/* Capa Frontal */}
                    <div style={{ width: pxW, height: pxH }}>{FrontFace}</div>

                    {/* Orelha Frontal */}
                    {d.flaps && (
                      <div
                        className="flex flex-col justify-between border-l border-dashed border-white/25 p-3 text-[0.45rem] leading-relaxed"
                        style={{
                          width: Math.round((d.flapWidthCm || 7.5) * S),
                          height: pxH,
                          background: d.coverColor,
                          color: d.textColor,
                        }}
                      >
                        <div>
                          <p
                            className="font-display text-[0.55rem] uppercase tracking-widest"
                            style={{ color: foilColor }}
                          >
                            {d.title || book.title}
                          </p>
                          <p className="mt-1.5 opacity-85">
                            {d.frontFlapText ||
                              "Texto de apresentação na orelha frontal. Destaque a premissa central da obra."}
                          </p>
                        </div>
                        <span className="text-[0.38rem] uppercase tracking-widest opacity-50">
                          Orelha Frontal ({d.flapWidthCm || 7.5} cm)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cota de medidas da prancha gráfica */}
                  <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground tabular-nums">
                    {d.flaps && <span>Orelha {d.flapWidthCm || 7.5} cm +</span>}
                    <span>Contracapa {w} cm +</span>
                    <span className="text-primary font-medium">Lombada {spine.toFixed(2)} cm</span>
                    <span>+ Capa {w} cm</span>
                    {d.flaps && <span>+ Orelha {d.flapWidthCm || 7.5} cm</span>}
                    <span>
                      = Total{" "}
                      {(w * 2 + spine + (d.flaps ? (d.flapWidthCm || 7.5) * 2 : 0)).toFixed(2)} ×{" "}
                      {h} cm
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MODO 6: LIVRO ABERTO EM PERSPECTIVA */}
            {view === "aberto" && (
              <div
                className="my-auto flex items-center justify-center py-6"
                style={{ perspective: "1400px" }}
              >
                <div
                  className="relative flex items-center transition-transform duration-300"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `scale(${zoom}) rotateX(18deg) rotateY(-8deg)`,
                  }}
                >
                  {/* Asa esquerda do livro aberto */}
                  <div
                    className="relative flex flex-col justify-between rounded-l-sm border-y-4 border-l-4 text-[#2c2018]"
                    style={{
                      width: pxW,
                      height: pxH,
                      borderColor: d.coverColor,
                      background: paperHex,
                      padding: `${1.5 * S}px ${1.3 * S}px`,
                      transformOrigin: "right center",
                      transform: "rotateY(14deg)",
                      boxShadow:
                        "inset -18px 0 28px -12px rgba(0,0,0,0.42), -8px 18px 30px rgba(0,0,0,0.45)",
                      fontFamily: titleFont,
                    }}
                  >
                    <p className="text-center text-[0.44rem] uppercase tracking-[0.25em] opacity-60">
                      {d.author || author}
                    </p>
                    <div className="my-auto flex flex-col items-center text-center">
                      {d.interiorOrnament !== false && (
                        <div
                          className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-current/20 text-xs"
                          style={{ color: d.coverColor }}
                        >
                          ✦
                        </div>
                      )}
                      <p className="text-[0.48rem] uppercase tracking-[0.32em] opacity-70">
                        {effectiveChapterTitle}
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold leading-tight">
                        {effectiveChapterSubtitle}
                      </p>
                      <p className="mt-3 text-justify font-sans text-[0.5rem] leading-[1.65] opacity-90">
                        {d.interiorDropCap !== false ? (
                          <>
                            <span className="float-left mr-1.5 font-display text-2xl font-bold leading-none">
                              {effectiveInteriorBody.charAt(0)}
                            </span>
                            {effectiveInteriorBody.slice(1, 260)}
                          </>
                        ) : (
                          effectiveInteriorBody.slice(0, 260)
                        )}
                      </p>
                    </div>
                    <p className="text-center text-[0.45rem] opacity-60">12</p>
                  </div>

                  {/* Asa direita do livro aberto */}
                  <div
                    className="relative flex flex-col justify-between rounded-r-sm border-y-4 border-r-4 text-[#2c2018]"
                    style={{
                      width: pxW,
                      height: pxH,
                      borderColor: d.coverColor,
                      background: paperHex,
                      padding: `${1.5 * S}px ${1.3 * S}px`,
                      transformOrigin: "left center",
                      transform: "rotateY(-14deg)",
                      boxShadow:
                        "inset 18px 0 28px -12px rgba(0,0,0,0.42), 12px 18px 30px rgba(0,0,0,0.45)",
                      fontFamily: titleFont,
                    }}
                  >
                    <p className="text-center text-[0.44rem] uppercase tracking-[0.25em] opacity-60">
                      {d.title || book.title}
                    </p>
                    <div className="my-auto space-y-2.5 text-justify font-sans text-[0.5rem] leading-[1.68] opacity-90">
                      <p>
                        {effectiveInteriorBody.length > 260
                          ? effectiveInteriorBody.slice(260, 620)
                          : "O silêncio entre dois capítulos revelava mais do que as palavras ditas em voz alta. Nas margens do arquivo, anotações preservavam segredos de famílias inteiras e juramentos selados sob a aurora."}
                      </p>
                      <p>
                        Cada detalhe da edição física reflete a atmosfera concebida para{" "}
                        <em>{d.title || book.title}</em>, unindo tipografia clássica, papel{" "}
                        {d.paper.toLowerCase()} e acabamento editorial cuidadoso.
                      </p>
                    </div>
                    <p className="text-center text-[0.45rem] opacity-60">13</p>
                    {d.ribbon && (
                      <div
                        className="pointer-events-none absolute -bottom-7 left-6 h-10 w-2"
                        style={{
                          background: d.ribbonColor,
                          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODO 7: MIOLO EDITORIAL PLANO (Dupla de Páginas) */}
            {view === "miolo" && (
              <div className="my-auto flex items-center justify-center overflow-x-auto py-4">
                <div
                  className="flex shadow-2xl transition-transform duration-200"
                  style={{ height: pxH, transform: `scale(${zoom})`, fontFamily: titleFont }}
                >
                  {[0, 1].map((p) => (
                    <div
                      key={p}
                      className="relative flex flex-col justify-between text-[#2d211b]"
                      style={{
                        width: pxW,
                        background: paperHex,
                        padding: `${1.65 * S}px ${1.35 * S}px`,
                        boxShadow: p
                          ? "inset 16px 0 24px -12px rgba(0,0,0,0.32)"
                          : "inset -16px 0 24px -12px rgba(0,0,0,0.32)",
                      }}
                    >
                      <p className="text-center text-[0.45rem] uppercase tracking-[0.25em] opacity-60">
                        {p ? d.title || book.title : d.author || author}
                      </p>

                      {p === 0 ? (
                        <div className="my-auto flex flex-col items-center text-center">
                          {d.interiorOrnament !== false && (
                            <div
                              className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full"
                              style={{
                                background: `radial-gradient(${secondaryCol}55, transparent 70%)`,
                                color: d.coverColor,
                              }}
                            >
                              ✦
                            </div>
                          )}
                          <p className="text-[0.5rem] uppercase tracking-[0.3em] opacity-75">
                            {effectiveChapterTitle}
                          </p>
                          <p className="mt-1 font-display text-xl font-semibold">
                            {effectiveChapterSubtitle}
                          </p>
                          <p className="mt-3 text-justify font-sans text-[0.52rem] leading-[1.68] opacity-90">
                            {d.interiorDropCap !== false ? (
                              <>
                                <span className="float-left mr-1.5 font-display text-2xl font-bold leading-none">
                                  {effectiveInteriorBody.charAt(0)}
                                </span>
                                {effectiveInteriorBody.slice(1, 310)}
                              </>
                            ) : (
                              effectiveInteriorBody.slice(0, 310)
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="my-auto space-y-2.5 text-justify font-sans text-[0.52rem] leading-[1.7] opacity-88">
                          <p>
                            {effectiveInteriorBody.length > 310
                              ? effectiveInteriorBody.slice(310, 720)
                              : "As páginas de papel " +
                                d.paper +
                                " acolhem a mancha gráfica com conforto óptico e equilíbrio clássico de margens."}
                          </p>
                          <div className="space-y-1.5 pt-2 opacity-35">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-[2.5px] rounded bg-current"
                                style={{ width: i === 7 ? "58%" : "100%" }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-center text-[0.48rem] tabular-nums opacity-70">{p + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BARRA INFERIOR DE CONTROLE DO PALCO (Ângulos, Rotação, Inclinação e Abertura da Capa) */}
            <div className="relative z-10 mt-2 flex w-full flex-col gap-3 rounded-xl border border-border/60 bg-background/75 p-3 backdrop-blur-md">
              {view === "3d" ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                        Ângulos:
                      </span>
                      {(
                        [
                          ["iso", "Perspectiva 3/4"],
                          ["front", "Frontal"],
                          ["spine", "Lombada"],
                          ["back", "Contracapa"],
                          ["top", "Vista Superior"],
                        ] as const
                      ).map(([presetKey, label]) => (
                        <button
                          key={presetKey}
                          type="button"
                          onClick={() => setCameraPreset(presetKey)}
                          className="rounded-lg border border-border/60 bg-secondary/50 px-2.5 py-1 text-[0.7rem] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRotY(-28);
                        setRotX(8);
                        setZoom(1);
                        setBookOpenDeg(0);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.7rem] text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <RefreshCw className="h-3 w-3" /> Centralizar 3D
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[0.68rem] text-muted-foreground tabular-nums">
                        Girar ({rotY}°)
                      </span>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={rotY}
                        onChange={(e) => setRotY(+e.target.value)}
                        aria-label="Girar livro"
                        className="!h-2 !p-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[0.68rem] text-muted-foreground tabular-nums">
                        Inclinar ({rotX}°)
                      </span>
                      <input
                        type="range"
                        min={-35}
                        max={45}
                        value={rotX}
                        onChange={(e) => setRotX(+e.target.value)}
                        aria-label="Inclinar livro verticalmente"
                        className="!h-2 !p-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-28 shrink-0 text-[0.68rem] text-muted-foreground tabular-nums">
                        Abrir capa ({bookOpenDeg}°)
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={145}
                        value={bookOpenDeg}
                        onChange={(e) => setBookOpenDeg(+e.target.value)}
                        aria-label="Abrir capa frontal em 3D"
                        className="!h-2 !p-0"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Visualização ativa:{" "}
                    <strong className="text-foreground uppercase">{view}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setView("3d")}
                    className="text-primary hover:underline"
                  >
                    Voltar ao modelo 3D interativo →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nota de Simulação Editorial */}
          <p className="flex items-center gap-2 rounded-xl border border-teal/35 bg-teal/10 px-3.5 py-2.5 text-xs text-teal">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Simulação editorial interativa com cálculo proporcional de lombada ({spine.toFixed(2)}{" "}
              cm para {d.pages} páginas em papel {d.paper} {d.paperWeightGsm || 80}g/m²). Arraste o
              livro no palco 3D para inspecionar todos os ângulos.
            </span>
          </p>
        </div>

        {/* COLUNA DIREITA: PAINEL INSPETOR DE PERSONALIZAÇÃO COMPLETA */}
        <aside className="card-luxe flex flex-col overflow-hidden">
          {/* Abas do Inspetor */}
          <div className="grid grid-cols-3 gap-1 border-b border-border/60 bg-background/40 p-2">
            {(
              [
                ["identidade", "Textos", Type],
                ["artes", "Capas & Cores", Palette],
                ["formato", "Medidas", Box],
                ["acabamento", "Acabamento", Sparkles],
                ["miolo", "Miolo", BookOpen],
                ["versoes", "Versões", Save],
              ] as const
            ).map(([tabId, label, Icon]) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tabId
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Conteúdo da Aba Selecionada */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 max-h-[680px]">
            {/* ABA 1: IDENTIDADE E TEXTOS */}
            {activeTab === "identidade" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Textos da Edição</h2>
                  <button
                    type="button"
                    onClick={() =>
                      updateMultiple({
                        title: book.title,
                        subtitle: book.subtitle,
                        synopsis: book.synopsis,
                      })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Sincronizar da Biblioteca
                  </button>
                </div>

                <div>
                  <label>Título</label>
                  <input
                    value={d.title}
                    onChange={(e) => up("title", e.target.value)}
                    placeholder="Título principal na capa e lombada"
                  />
                </div>

                <div>
                  <label>Subtítulo</label>
                  <input
                    value={d.subtitle}
                    onChange={(e) => up("subtitle", e.target.value)}
                    placeholder="Subtítulo ou frase de destaque"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label>Autora</label>
                    <input value={d.author} onChange={(e) => up("author", e.target.value)} />
                  </div>
                  <div>
                    <label>Volume / Número</label>
                    <input
                      value={d.volumeLabel ?? ""}
                      onChange={(e) => up("volumeLabel", e.target.value)}
                      placeholder="Ex: Volume 1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label>Série ou Coleção</label>
                    <input
                      value={d.collectionName ?? ""}
                      onChange={(e) => up("collectionName", e.target.value)}
                      placeholder="Juramentos do Destino"
                    />
                  </div>
                  <div>
                    <label>Editora / Selo</label>
                    <input
                      value={d.publisherName ?? ""}
                      onChange={(e) => up("publisherName", e.target.value)}
                      placeholder="Spectral Editorial"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label>Selo de Edição</label>
                    <input
                      value={d.editionLabel ?? ""}
                      onChange={(e) => up("editionLabel", e.target.value)}
                      placeholder="Edição de Colecionador"
                    />
                  </div>
                  <div>
                    <label>ISBN Ilustrativo</label>
                    <input
                      value={d.isbnCode ?? ""}
                      onChange={(e) => up("isbnCode", e.target.value)}
                      placeholder="978-65-8900-01-4"
                    />
                  </div>
                </div>

                <div>
                  <label>Frase de Impacto (Topo da Contracapa)</label>
                  <input
                    value={d.backQuote ?? ""}
                    onChange={(e) => up("backQuote", e.target.value)}
                    placeholder="Ex: Nem todo juramento sobrevive ao fogo..."
                  />
                </div>

                <div>
                  <label>Sinopse (Contracapa)</label>
                  <textarea
                    rows={4}
                    value={d.synopsis}
                    onChange={(e) => up("synopsis", e.target.value)}
                    placeholder="Texto completo da contracapa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label>Estilo Tipográfico</label>
                    <select
                      value={d.typographyStyle || "Editorial"}
                      onChange={(e) => up("typographyStyle", e.target.value as BookTypographyStyle)}
                    >
                      {(["Editorial", "Clássica", "Romântica", "Gótica", "Moderna"] as const).map(
                        (t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label>Posição do Título</label>
                    <select
                      value={d.titleAlignment || "centro"}
                      onChange={(e) => up("titleAlignment", e.target.value as BookTitleAlignment)}
                    >
                      <option value="centro">Centralizado</option>
                      <option value="topo">Superior</option>
                      <option value="base">Inferior</option>
                      <option value="esquerda">Alinhado à esquerda</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: ARTES DE CAPA E PALETA DE CORES */}
            {activeTab === "artes" && (
              <div className="space-y-4">
                <h2 className="text-lg">Imagens e Paleta</h2>

                <div className="space-y-2.5">
                  {(
                    [
                      ["frontImage", "Capa frontal", resolvedFrontImg],
                      ["backImage", "Contracapa", resolvedBackImg],
                      ["spineImage", "Arte da Lombada", resolvedSpineImg],
                    ] as const
                  ).map(([fieldKey, label, previewUrl]) => (
                    <div
                      key={fieldKey}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 p-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={label}
                            referrerPolicy="no-referrer"
                            className="h-10 w-8 shrink-0 rounded object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">{label}</p>
                          <p className="truncate text-[0.68rem] text-muted-foreground">
                            {d[fieldKey] ? "Imagem personalizada ativa" : "Usando fundo cromático"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="btn-ghost !min-h-[34px] !px-2.5 !py-1 text-xs cursor-pointer !normal-case !tracking-normal">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{label}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files?.[0] && handleImageUpload(fieldKey, e.target.files[0])
                            }
                          />
                        </label>
                        {d[fieldKey] && (
                          <button
                            type="button"
                            aria-label={`Remover ${label}`}
                            onClick={() => up(fieldKey, undefined)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paleta rápida do livro */}
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Paleta Original do Livro</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateMultiple({
                          coverColor: book.palette[0],
                          secondaryCoverColor: book.palette[1],
                          spineColor: book.palette[0],
                          textColor: book.palette[2],
                          spineTextColor: book.palette[2],
                          ribbonColor: book.palette[1],
                        })
                      }
                      className="text-[0.7rem] text-primary hover:underline"
                    >
                      Restaurar cores da obra
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {book.palette.map((hex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => up("coverColor", hex)}
                        className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2 py-1 text-[0.7rem]"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/20"
                          style={{ background: hex }}
                        />
                        <span className="font-mono">{hex}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>Cor da capa</label>
                    <input
                      type="color"
                      className="!h-10 !p-1"
                      value={d.coverColor}
                      onChange={(e) => up("coverColor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Luz / Gradiente</label>
                    <input
                      type="color"
                      className="!h-10 !p-1"
                      value={d.secondaryCoverColor || book.palette[1]}
                      onChange={(e) => up("secondaryCoverColor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Cor da lombada</label>
                    <input
                      type="color"
                      className="!h-10 !p-1"
                      value={d.spineColor || d.coverColor}
                      onChange={(e) => up("spineColor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Cor do texto</label>
                    <input
                      type="color"
                      className="!h-10 !p-1"
                      value={d.textColor}
                      onChange={(e) => up("textColor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Texto da lombada</label>
                    <input
                      type="color"
                      className="!h-10 !p-1"
                      value={d.spineTextColor || d.textColor}
                      onChange={(e) => up("spineTextColor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Cor das guardas</label>
                    <input
                      type="color"
                      className="!h-10 !p-1"
                      value={d.endpaperColor || d.coverColor}
                      onChange={(e) => up("endpaperColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: FORMATO, PÁGINAS E LOMBADA */}
            {activeTab === "formato" && (
              <div className="space-y-4">
                <h2 className="text-lg">Formato e Proporções</h2>

                <div>
                  <label>Formato Editorial</label>
                  <select
                    value={d.format}
                    onChange={(e) => up("format", e.target.value as BookFormatPreset)}
                  >
                    {(Object.keys(FORMAT_LABELS) as BookFormatPreset[]).map((f) => (
                      <option key={f} value={f}>
                        {FORMAT_LABELS[f]}
                      </option>
                    ))}
                  </select>
                </div>

                {d.format === "Personalizado" && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label>Largura (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        min={9}
                        max={30}
                        value={d.customWidthCm ?? 15}
                        onChange={(e) => up("customWidthCm", +e.target.value || 15)}
                      />
                    </div>
                    <div>
                      <label>Altura (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        min={13}
                        max={36}
                        value={d.customHeightCm ?? 22}
                        onChange={(e) => up("customHeightCm", +e.target.value || 22)}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label>Páginas</label>
                    <input
                      type="number"
                      min={40}
                      max={1500}
                      value={d.pages}
                      onChange={(e) =>
                        up("pages", Math.max(40, Math.min(1500, +e.target.value || 40)))
                      }
                    />
                  </div>
                  <div>
                    <label>Gramatura do Papel</label>
                    <select
                      value={d.paperWeightGsm || 80}
                      onChange={(e) => up("paperWeightGsm", +e.target.value as 75 | 80 | 90 | 115)}
                    >
                      <option value={75}>75 g/m² (Leve)</option>
                      <option value={80}>80 g/m² (Editorial Padrão)</option>
                      <option value={90}>90 g/m² (Encorpado)</option>
                      <option value={115}>115 g/m² (Luxo / Ilustrado)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Papel</label>
                  <select
                    value={d.paper}
                    onChange={(e) => up("paper", e.target.value as BookPaperType)}
                  >
                    {(Object.keys(PAPER_COLOR) as BookPaperType[]).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Controle de Lombada Automática vs Manual */}
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4"
                        checked={d.autoSpineWidth !== false}
                        onChange={(e) => up("autoSpineWidth", e.target.checked)}
                      />
                      Lombada proporcional automática ({calculatedSpine.toFixed(2)} cm)
                    </label>
                  </div>
                  {d.autoSpineWidth === false && (
                    <div>
                      <label>Espessura manual da lombada (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min={0.6}
                        max={9.5}
                        value={d.manualSpineCm ?? calculatedSpine}
                        onChange={(e) => up("manualSpineCm", +e.target.value || 2)}
                      />
                    </div>
                  )}
                </div>

                {/* Orelhas do Livro (Flaps) */}
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4"
                        checked={Boolean(d.flaps)}
                        onChange={(e) => up("flaps", e.target.checked)}
                      />
                      Incluir Orelhas Editoriais (Flaps)
                    </label>
                  </div>
                  {d.flaps && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label>Largura de cada orelha (cm)</label>
                        <input
                          type="number"
                          step="0.5"
                          min={5}
                          max={12}
                          value={d.flapWidthCm ?? 7.5}
                          onChange={(e) => up("flapWidthCm", +e.target.value || 7.5)}
                        />
                      </div>
                      <div>
                        <label>Texto da Orelha Frontal</label>
                        <textarea
                          rows={2}
                          value={d.frontFlapText ?? ""}
                          onChange={(e) => up("frontFlapText", e.target.value)}
                          placeholder="Resumo magnético na orelha da frente..."
                        />
                      </div>
                      <div>
                        <label>Texto da Orelha Traseira (Biografia)</label>
                        <textarea
                          rows={2}
                          value={d.backFlapText ?? ""}
                          onChange={(e) => up("backFlapText", e.target.value)}
                          placeholder="Nota biográfica da autora..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 4: ACABAMENTO GRÁFICO */}
            {activeTab === "acabamento" && (
              <div className="space-y-4">
                <h2 className="text-lg">Acabamento e Detalhes</h2>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label>Hot stamping</label>
                    <select
                      value={d.foil}
                      onChange={(e) => up("foil", e.target.value as BookFoilType)}
                    >
                      {(Object.keys(FOIL_STYLE) as BookFoilType[]).map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Laminação da Capa</label>
                    <select
                      value={d.lamination || "Soft Touch"}
                      onChange={(e) => up("lamination", e.target.value as BookLaminationType)}
                    >
                      {(["Fosca", "Brilho", "Soft Touch", "Textura Linho"] as const).map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Moldura da Capa</label>
                    <select
                      value={d.borderFrameStyle || "Dupla"}
                      onChange={(e) =>
                        up("borderFrameStyle", e.target.value as StudioDesign["borderFrameStyle"])
                      }
                    >
                      {(["Nenhuma", "Simples", "Dupla", "Ornamental"] as const).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Cantos do Livro</label>
                    <select
                      value={d.cornerStyle || "Reto"}
                      onChange={(e) => up("cornerStyle", e.target.value as BookCornerStyle)}
                    >
                      {(["Reto", "Arredondado", "Chanfrado"] as const).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Corte Lateral das Páginas (Sprayed / Gilded Edges) */}
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label>Corte das Folhas (Bordas)</label>
                      <select
                        value={d.pageEdgeType || "Natural"}
                        onChange={(e) => up("pageEdgeType", e.target.value as BookPageEdgeType)}
                      >
                        <option value="Natural">Natural do Papel</option>
                        <option value="Pintado">Corte Pintado (Sprayed)</option>
                        <option value="Metalizado">Corte Dourado / Metalizado</option>
                        <option value="Estampado">Corte Marmorizado</option>
                      </select>
                    </div>
                    {(d.pageEdgeType === "Pintado" || d.pageEdgeType === "Estampado") && (
                      <div>
                        <label>Cor do Corte</label>
                        <input
                          type="color"
                          className="!h-10 !p-1"
                          value={d.pageEdgeColor || secondaryCol}
                          onChange={(e) => up("pageEdgeColor", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Opções Booleanas: Capa Dura, Fitilho, Cantoneiras, Código de Barras */}
                <div className="space-y-2.5 rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4"
                        checked={d.hardcover}
                        onChange={(e) => up("hardcover", e.target.checked)}
                      />
                      Capa dura (com vinco e nervuras na lombada)
                    </label>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4"
                        checked={Boolean(d.cornerPieces)}
                        onChange={(e) => up("cornerPieces", e.target.checked)}
                      />
                      Cantoneiras metálicas protetoras
                    </label>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4"
                        checked={d.ribbon}
                        onChange={(e) => up("ribbon", e.target.checked)}
                      />
                      Marcador de fita
                    </label>
                    {d.ribbon && (
                      <input
                        type="color"
                        aria-label="Cor do marcador de fita"
                        className="!h-8 !w-12 !p-1"
                        value={d.ribbonColor}
                        onChange={(e) => up("ribbonColor", e.target.value)}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4"
                        checked={d.showBarcode !== false}
                        onChange={(e) => up("showBarcode", e.target.checked)}
                      />
                      Exibir código de barras ISBN na contracapa
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 5: MIOLO EDITORIAL */}
            {activeTab === "miolo" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">Diagramação do Miolo</h2>
                  <button
                    type="button"
                    onClick={() => setView("miolo")}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver páginas abertas
                  </button>
                </div>

                <div>
                  <label>Cabeçalho de Capítulo de Exemplo</label>
                  <input
                    value={d.interiorChapterTitle ?? ""}
                    onChange={(e) => up("interiorChapterTitle", e.target.value)}
                    placeholder="Ex: Capítulo I · Prólogo"
                  />
                </div>

                {bookChapters.length > 0 && (
                  <div>
                    <label>Importar Trecho de Capítulo Cadastrado</label>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const ch = bookChapters.find((c) => c.id === e.target.value);
                        if (ch) {
                          updateMultiple({
                            interiorChapterTitle:
                              ch.type === "Capítulo" ? `Capítulo ${ch.number}` : ch.type,
                            interiorSampleText: ch.summaryPlainText || ch.narrativeObjective || "",
                          });
                        }
                      }}
                    >
                      <option value="">Selecionar capítulo do livro...</option>
                      {bookChapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.number}. {c.title || c.type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label>Texto de Amostra das Páginas Internas</label>
                  <textarea
                    rows={5}
                    value={d.interiorSampleText ?? ""}
                    onChange={(e) => up("interiorSampleText", e.target.value)}
                    placeholder="Digite ou cole um trecho da narrativa para testar a leitura no papel escolhido..."
                  />
                </div>

                <div className="space-y-2 rounded-xl border border-border/60 bg-background/40 p-3 text-sm">
                  <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="!w-4"
                      checked={d.interiorDropCap !== false}
                      onChange={(e) => up("interiorDropCap", e.target.checked)}
                    />
                    Capitular clássica no início do capítulo (Drop Cap)
                  </label>
                  <label className="flex items-center gap-2 !normal-case !tracking-normal !text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="!w-4"
                      checked={d.interiorOrnament !== false}
                      onChange={(e) => up("interiorOrnament", e.target.checked)}
                    />
                    Exibir florão / ornamento editorial
                  </label>
                </div>
              </div>
            )}

            {/* ABA 6: VERSÕES E HISTÓRICO DO PROJETO */}
            {activeTab === "versoes" && (
              <div className="space-y-4">
                <h2 className="text-lg">Versões do Projeto</h2>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    actions.saveVersion(
                      id,
                      vname.trim() || `Versão ${(entry?.versions.length ?? 0) + 1}`,
                      d,
                    );
                    setVname("");
                  }}
                >
                  <input
                    placeholder="Nome da versão (ex: Capa Colecionador)"
                    value={vname}
                    onChange={(e) => setVname(e.target.value)}
                  />
                  <button className="btn shrink-0" aria-label="Salvar versão">
                    <Save className="h-4 w-4" />
                  </button>
                </form>

                {!entry?.versions.length ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma versão salva. As alterações atuais são salvas automaticamente.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {entry.versions.map((v) => {
                      const vDims = computeBookDimensions(v.design);
                      return (
                        <li
                          key={v.id}
                          className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/40 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-4 w-4 shrink-0 rounded-full border border-white/25"
                                style={{ background: v.design.coverColor }}
                              />
                              <span className="truncate font-medium text-foreground">{v.name}</span>
                            </div>
                            <span className="shrink-0 text-[0.68rem] text-muted-foreground tabular-nums">
                              {v.savedAt}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground tabular-nums">
                            <span>
                              {v.design.format} · {v.design.pages}p · Lombada{" "}
                              {vDims.spineCm.toFixed(1)}cm ·{" "}
                              {v.design.hardcover ? "Capa dura" : "Brochura"}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 border-t border-border/40 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCompareVersionId((prev) => (prev === v.id ? null : v.id))
                              }
                              className="rounded-lg border border-border/60 px-2 py-1 text-[0.68rem] hover:bg-secondary"
                            >
                              {compareVersionId === v.id ? "Fechar comparação" : "Comparar"}
                            </button>
                            <button
                              type="button"
                              aria-label="Duplicar versão"
                              onClick={() => actions.duplicateVersion(id, v.id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              title="Duplicar versão"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Restaurar"
                              onClick={() => {
                                setD(v.design);
                                actions.saveDesign(id, v.design);
                              }}
                              className="rounded-lg p-1.5 text-teal hover:bg-teal/15"
                              title="Restaurar esta versão"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-teal" />
                            </button>
                            <button
                              type="button"
                              aria-label="Excluir"
                              onClick={() => actions.deleteVersion(id, v.id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                              title="Excluir versão"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {comparedVersion && (
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        Comparando com: {comparedVersion.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCompareVersionId(null)}
                        className="text-[0.68rem] text-muted-foreground hover:underline"
                      >
                        Fechar
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[0.7rem] tabular-nums">
                      <div className="rounded-lg bg-background/60 p-2">
                        <p className="font-medium text-foreground">Design Atual</p>
                        <p className="text-muted-foreground">
                          {d.format} · {d.pages} págs
                        </p>
                        <p className="text-muted-foreground">
                          Papel {d.paper} · Foil {d.foil}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background/60 p-2">
                        <p className="font-medium text-foreground">{comparedVersion.name}</p>
                        <p className="text-muted-foreground">
                          {comparedVersion.design.format} · {comparedVersion.design.pages} págs
                        </p>
                        <p className="text-muted-foreground">
                          Papel {comparedVersion.design.paper} · Foil {comparedVersion.design.foil}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
