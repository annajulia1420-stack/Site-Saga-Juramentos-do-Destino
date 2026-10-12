import { useHydrated, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  Check,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Wand2,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Sparkles,
  Brain,
  Heart,
  Eye,
  Palette,
  Film,
  BookOpen,
  Users,
  Zap,
  Coffee,
  Terminal,
  Images,
  Quote,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  Edit3,
} from "lucide-react";
import {
  useStore,
  actions,
  resolveCharacterModel,
  type Character,
  type CharacterModelType,
  type CharacterAbility,
  type CharacterRelationship,
  type RelationshipType,
  type CharacterQuote,
  type QuoteCategory,
  type CharacterCuriosity,
} from "@/lib/store";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";
import { PaletteStudio } from "@/components/character/PaletteStudio";
import { ReferenceGallery } from "@/components/character/ReferenceGallery";
import { CustomQuestionsManager } from "@/components/character/CustomQuestionsManager";
import { SecondaryCharacterSheet } from "@/components/character/SecondaryCharacterSheet";
import { TagListEditor, SelectableCards } from "@/components/character/TagListEditor";

export const Route = createFileRoute("/personagens/$id")({
  validateSearch: (search: Record<string, unknown>): { modelo?: CharacterModelType } => {
    const raw = search?.modelo;
    if (raw === "Secundário" || raw === "Protagonista") {
      return { modelo: raw };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Arquivo de Personagem — Juramentos Studio" },
      { name: "description", content: "Desenvolvimento literário e visual de personagem." },
      { property: "og:title", content: "Arquivo de Personagem — Juramentos Studio" },
      { property: "og:description", content: "Desenvolvimento literário e visual de personagem." },
    ],
  }),
  component: CharPage,
});

const SECTIONS = [
  { num: 1, title: "Identidade", icon: UserRound },
  { num: 2, title: "Essência do Personagem", icon: Sparkles },
  { num: 3, title: "Personalidade", icon: Heart },
  { num: 4, title: "Psicologia", icon: Brain },
  { num: 5, title: "Aparência Visual", icon: Eye },
  { num: 6, title: "Estilo Visual", icon: Palette },
  { num: 7, title: "Assinatura Cinematográfica", icon: Film },
  { num: 8, title: "História", icon: BookOpen },
  { num: 9, title: "Relacionamentos", icon: Users },
  { num: 10, title: "Habilidades e Poderes", icon: Zap },
  { num: 11, title: "Detalhes Humanos", icon: Coffee },
  { num: 12, title: "Prompt Base de IA", icon: Terminal },
  { num: 13, title: "Referências Visuais", icon: Images },
  { num: 14, title: "Frases Importantes", icon: Quote },
  { num: 15, title: "Evolução no Universo", icon: TrendingUp },
  { num: 16, title: "Curiosidades", icon: Lightbulb },
] as const;

const ARCHETYPE_PRESETS = [
  {
    title: "Herói silencioso",
    desc: "Ações falam mais alto que palavras; carrega o peso do mundo em silêncio.",
  },
  {
    title: "Líder",
    desc: "Inspira lealdade, toma decisões difíceis e guia o grupo na tempestade.",
  },
  {
    title: "Rebelde",
    desc: "Desafia regras, questiona sistemas impostos e segue seu próprio código.",
  },
  { title: "Sonhador", desc: "Enxerga beleza, esperança e possibilidades além da realidade dura." },
  { title: "Estrategista", desc: "Mente analítica, sempre três passos à frente dos adversários." },
  { title: "Protetor", desc: "Escudo inabalável para aqueles que ama, custe o que custar." },
  { title: "Espírito livre", desc: "Indomável, guiado pela intuição, vento e sede de liberdade." },
];

const VISUAL_ENERGY_PRESETS = [
  { title: "Intensa", desc: "Olhar magnético e presença que domina o ambiente." },
  { title: "Elegante", desc: "Postura refinada, movimentos precisos e sofisticação natural." },
  { title: "Misteriosa", desc: "Aura de sombras, segredos guardados e charme enigmático." },
  { title: "Calorosa", desc: "Sorriso acolhedor, luz solar e empatia imediata." },
  { title: "Caótica", desc: "Imprevisível, elétrica e cheia de contrastes vibrantes." },
  { title: "Delicada", desc: "Traços suaves, poesia visual e sensibilidade etérea." },
];

const AESTHETIC_PRESETS = [
  { title: "Streetwear", desc: "Urbano, silhuetas amplas, camadas contemporâneas e atitude." },
  {
    title: "Dark Academia",
    desc: "Alfaiataria clássica, tons terrosos/escuros, livros e mistério.",
  },
  { title: "Luxo Moderno", desc: "Cortes impecáveis, tecidos nobres, joias sutis e poder." },
  { title: "Techwear", desc: "Funcional, tático, futurista e preparado para ação." },
  { title: "Minimalista", desc: "Linhas puras, paleta enxuta e elegância sem excessos." },
  { title: "Vintage", desc: "Nostalgia atemporal, peças com história e charme clássico." },
];

const CAMERA_SHOT_PRESETS = [
  { title: "Close emocional", desc: "Foco íntimo nos olhos e microexpressões." },
  { title: "Plano aberto", desc: "Personagem imerso na grandiosidade do cenário." },
  { title: "Câmera baixa", desc: "Contra-plongée destacando imponência e poder." },
  { title: "Plano médio", desc: "Equilíbrio entre linguagem corporal e expressão." },
  { title: "Perfil", desc: "Silhueta contemplativa e recorte dramático." },
  { title: "Plano sobre o ombro", desc: "Perspectiva imersiva em diálogos e tensão." },
];

const LIGHTING_PRESETS = [
  { title: "Chiaroscuro dramático", desc: "Alto contraste entre luz intensa e sombras profundas." },
  { title: "Hora dourada (Golden Hour)", desc: "Luz quente e poética do entardecer." },
  { title: "Luar prateado", desc: "Atmosfera noturna, fria e mística." },
  { title: "Neon noturno", desc: "Reflexos vibrantes em chuva e estética urbana." },
  { title: "Luz de velas / Fogo", desc: "Tons âmbar bruxuleantes e intimistas." },
  { title: "Luz difusa de tempestade", desc: "Céu nublado, melancólico e cinematográfico." },
];

const SCENE_TYPE_PRESETS = [
  { title: "Confronto sob chuva", desc: "Tensão máxima e carga emocional." },
  { title: "Confissão silenciosa", desc: "Intimidade, vulnerabilidade e olhares." },
  { title: "Batalha coreografada", desc: "Ação dinâmica e demonstração de poder." },
  { title: "Solidão no observatório", desc: "Introspecção diante do infinito." },
  { title: "Baile de máscaras", desc: "Intriga, sedução e jogos de aparência." },
  { title: "Despertar de poder", desc: "Clímax visual e transformação." },
];

const DYNAMIC_PRESETS = [
  "Fogo e gelo",
  "Caos e controle",
  "Luz e sombra",
  "Inimigos a aliados (Enemies to Lovers)",
  "Protetor e protegido",
  "Rivais de sangue",
  "Almas espelhadas",
];

const ELEMENT_CONCEPTS = [
  "Chama",
  "Maré",
  "Luz",
  "Lua",
  "Vida",
  "Terra",
  "Oceano",
  "Neon",
  "Destino",
  "Aurora",
  "Sombra",
  "Tempestade",
];

function CharPage() {
  const { id } = Route.useParams();
  const routeSearch = Route.useSearch();
  const nav = useNavigate();
  const existing = useStore((s) => s.characters.find((c) => c.id === id));
  const chars = useStore((s) => s.characters);
  const books = useStore((s) => s.books);
  const globalQuestions = useStore((s) => s.globalQuestions ?? []);

  const [f, setF] = useState<Character | null>(null);
  const [activeSec, setActiveSec] = useState<number>(1);
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [confirmDeleteChar, setConfirmDeleteChar] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Estados auxiliares para sub-formulários (Relacionamentos, Habilidades, Frases, Curiosidades)
  const [relDraft, setRelDraft] = useState<{
    targetCharacterId: string;
    targetName: string;
    type: RelationshipType;
    howTheyMet: string;
    dynamic: string;
    whatAwakens: string;
    majorConflict: string;
  }>({
    targetCharacterId: "",
    targetName: "",
    type: "Amizade",
    howTheyMet: "",
    dynamic: "Fogo e gelo",
    whatAwakens: "",
    majorConflict: "",
  });
  const [customDynamicInput, setCustomDynamicInput] = useState("");

  const [abilityDraft, setAbilityDraft] = useState<{
    name: string;
    howItWorks: string;
    limitations: string;
    fightingStyle: string;
  }>({
    name: "",
    howItWorks: "",
    limitations: "",
    fightingStyle: "",
  });

  const [quoteDraft, setQuoteDraft] = useState<{
    text: string;
    type: QuoteCategory;
    context: string;
  }>({
    text: "",
    type: "Frase marcante",
    context: "",
  });
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const [curiosityDraft, setCuriosityDraft] = useState("");
  const [editingCuriosityId, setEditingCuriosityId] = useState<string | null>(null);
  const [editingCuriosityText, setEditingCuriosityText] = useState("");

  const isNew = id === "novo";
  const hydrated = useHydrated();

  useEffect(() => {
    if (isNew) {
      let model: CharacterModelType = "Protagonista";
      if (
        routeSearch &&
        typeof routeSearch === "object" &&
        "modelo" in routeSearch &&
        (routeSearch.modelo === "Secundário" || routeSearch.modelo === "Protagonista")
      ) {
        model = routeSearch.modelo;
      } else if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const m = params.get("modelo");
        if (m === "Secundário" || m === "Protagonista") model = m;
      }
      setF((prev) => {
        if (prev && isNew && prev.modelType === model) return prev;
        return actions.newCharacter(model);
      });
    } else if (existing) {
      const resolvedModel = resolveCharacterModel(existing);
      setF({
        ...existing,
        modelType: resolvedModel,
      });
    } else {
      setF(null);
    }
  }, [id, existing?.id, hydrated, routeSearch]);

  if (!f) {
    return (
      <div className="card-luxe p-8 text-center">
        Personagem não encontrado.{" "}
        <Link to="/personagens" className="text-primary">
          Voltar para Personagens
        </Link>
      </div>
    );
  }

  const up = <K extends keyof Character>(k: K, v: Character[K]) => {
    setF((prev) => (prev ? { ...prev, [k]: v } : prev));
    setMsg(null);
  };

  const toggleBook = (bid: string) =>
    up(
      "bookIds",
      f.bookIds.includes(bid) ? f.bookIds.filter((x) => x !== bid) : [...f.bookIds, bid],
    );

  const save = () => {
    if (!f.name.trim()) {
      setMsg({ text: "Informe o nome do personagem antes de salvar.", type: "error" });
      setActiveSec(1);
      return;
    }
    actions.saveCharacter(f);
    setMsg({ text: "Ficha salva com sucesso ✓", type: "success" });
    if (isNew) {
      nav({ to: "/personagens/$id", params: { id: f.id }, replace: true });
    }
  };

  const handleDuplicateHere = () => {
    if (isNew) {
      setMsg({ text: "Salve a ficha primeiro antes de duplicar.", type: "error" });
      return;
    }
    actions.saveCharacter(f);
    const copy = actions.duplicateCharacter(f.id);
    if (copy) {
      setMsg({ text: `Ficha duplicada como “${copy.name}” ✓`, type: "success" });
      nav({ to: "/personagens/$id", params: { id: copy.id } });
    }
  };

  // Montador de Prompt Base de IA (Seção 12)
  const buildAiPrompt = () => {
    const nome = f.name.trim() || "character";
    const idade = f.age.trim() ? `${f.age.trim()} years old` : "young adult";
    const aparenciaParts = [
      f.faceDetails,
      f.hairDetails,
      f.eyesDetails,
      f.heightDetails,
      f.bodyAndPosture,
      f.defaultExpression,
      f.appearance,
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const aparencia = aparenciaParts.length
      ? aparenciaParts.join(", ")
      : "striking features, expressive eyes";

    const roupaParts = [f.mainClothes, f.accessories, f.strikingVisualElements, f.style]
      .map((s) => s?.trim())
      .filter(Boolean);
    const roupa = roupaParts.length ? roupaParts.join(", ") : "signature editorial outfit";

    const estiloParts = [...(f.aesthetics ?? []), ...(f.visualEnergies ?? [])];
    const estilo = estiloParts.length ? estiloParts.join(", ") : "dark luxury aesthetic";

    const persParts = [...(f.mainTraitsList ?? []), ...(f.archetypes ?? []), f.personality]
      .map((s) => s?.trim())
      .filter(Boolean);
    const personalidade = persParts.length ? persParts.join(", ") : "intense presence";

    const lightingParts = [
      ...(f.lightingStyles ?? []).filter((x) => x !== "Personalizado"),
      f.lightingStyles?.includes("Personalizado") ? f.customLightingDescription : undefined,
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const iluminacao =
      lightingParts.length > 0 ? lightingParts.join(", ") : "dramatic chiaroscuro rim lighting";

    const sceneAndScenarioParts = [
      ...(f.scenariosList ?? []),
      ...(f.sceneTypes ?? []).filter((x) => x !== "Personalizado"),
      f.sceneTypes?.includes("Personalizado") ? f.customSceneDescription : undefined,
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const cenario =
      sceneAndScenarioParts.length > 0
        ? sceneAndScenarioParts.join(", ")
        : "atmospheric moody backdrop";

    const cameraParts = [
      ...(f.idealCameraShots ?? []).filter((x) => x !== "Personalizado"),
      f.idealCameraShots?.includes("Personalizado") ? f.customCameraDescription : undefined,
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const camera = cameraParts.length > 0 ? `, ${cameraParts.join(", ")}` : "";

    const promptText = `${nome}, ${idade}, ${aparencia}, ${roupa}, ${estilo}, ${personalidade}, cinematic realistic photography, film still${camera}, ${iluminacao}, ${cenario}.`;
    up("aiBasePrompt", promptText);
    setMsg({ text: "Prompt montado com os dados da ficha ✓", type: "success" });
  };

  const copyPromptToClipboard = async () => {
    const text = f.aiBasePrompt ?? "";
    if (!text) return;
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // fallback
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const isSecondaryModel = resolveCharacterModel(f) === "Secundário";

  // Paletas salvas em todos os personagens para permitir reutilização
  const allSavedPalettes = chars.flatMap((c) => c.palettes ?? []);

  const currentSectionMeta = SECTIONS.find((s) => s.num === activeSec) ?? SECTIONS[0];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Barra de Topo da Ficha */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/personagens"
          className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Personagens
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuestionsPanel((v) => !v)}
            className="btn-ghost text-xs"
            data-testid="btn-topo-perguntas"
          >
            <HelpCircle className="h-4 w-4 text-teal" />
            {showQuestionsPanel ? "Ocultar perguntas extras" : "Adicionar pergunta"}
          </button>

          {!isNew && (
            <button
              type="button"
              onClick={handleDuplicateHere}
              className="btn-ghost text-xs"
              data-testid="btn-duplicar-ficha"
            >
              <Copy className="h-4 w-4" /> Duplicar ficha
            </button>
          )}

          <button
            type="button"
            onClick={save}
            className="btn text-xs"
            data-testid="btn-salvar-topo"
          >
            <Save className="h-4 w-4" /> Salvar ficha
          </button>
        </div>
      </div>

      {/* Cabeçalho de Identificação Rápida do Personagem */}
      <div className="card-luxe flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-4">
          <label
            className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-primary/40 bg-secondary !normal-case !tracking-normal"
            title="Clique para enviar foto de perfil"
          >
            {f.photo ? (
              <MediaImage
                src={f.photo}
                alt={f.name || "Foto do personagem"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                Foto
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await processImageFile(file, 800);
                const stored = await storeMediaDataUrl(`avatar_${f.id}`, dataUrl);
                up("photo", stored);
              }}
            />
          </label>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Modelo do personagem"
                value={resolveCharacterModel(f)}
                onChange={(e) => {
                  const nextModel = e.target.value as CharacterModelType;
                  up("modelType", nextModel);
                  if (nextModel === "Secundário" && activeSec > 15) {
                    setActiveSec(15);
                  }
                }}
                className="!min-h-7 !w-auto !px-2.5 !py-0.5 text-xs font-medium text-teal"
                data-testid="select-character-model"
              >
                <option value="Protagonista">
                  Arquivo de Personagem — Protagonista (16 Seções)
                </option>
                <option value="Secundário">Arquivo de Personagem — Secundário (15 Seções)</option>
              </select>

              {f.elementOrConcept && (
                <span className="text-xs text-muted-foreground">· {f.elementOrConcept}</span>
              )}
            </div>

            <input
              aria-label="Nome completo do personagem"
              value={f.name}
              onChange={(e) => up("name", e.target.value)}
              placeholder="Nome completo do personagem…"
              className="!border-0 !bg-transparent !p-0 font-display text-2xl sm:text-3xl focus:!outline-none"
              data-testid="input-char-name"
            />

            {f.definingPhrase && (
              <p className="truncate text-xs italic text-muted-foreground">“{f.definingPhrase}”</p>
            )}
          </div>
        </div>

        {/* Barra de cores da primeira paleta do personagem, se houver */}
        {f.palettes && f.palettes[0] && f.palettes[0].colors.length > 0 && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              {f.palettes[0].name}
            </span>
            <div className="flex h-6 w-36 overflow-hidden rounded-full border">
              {f.palettes[0].colors.map((hex, i) => (
                <span key={i} className="flex-1" style={{ backgroundColor: hex }} title={hex} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feedback de salvamento ou erro */}
      {msg && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
            msg.type === "error"
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-teal/50 bg-teal/10 text-teal"
          }`}
          data-testid="status-message"
        >
          {msg.text}
        </div>
      )}

      {/* Renderização Independente de acordo com o Modelo: Secundário (15 Seções) vs Protagonista (16 Seções) */}
      {isSecondaryModel ? (
        <SecondaryCharacterSheet
          f={f}
          up={up}
          toggleBook={toggleBook}
          books={books}
          chars={chars}
          activeSec={activeSec}
          setActiveSec={setActiveSec}
          setMsg={setMsg}
        />
      ) : (
        <div
          className="grid gap-6 lg:grid-cols-[260px_1fr]"
          data-testid="protagonist-character-sheet"
        >
          {/* Menu Lateral em Desktop / Seletor Horizontal em Mobile */}
          <aside className="space-y-2">
            <div className="lg:hidden">
              <label htmlFor="mobile-section-select">Navegar para a seção</label>
              <select
                id="mobile-section-select"
                value={activeSec}
                onChange={(e) => setActiveSec(Number(e.target.value))}
                className="mt-1"
              >
                {SECTIONS.map((s) => (
                  <option key={s.num} value={s.num}>
                    {String(s.num).padStart(2, "0")}. {s.title}
                  </option>
                ))}
              </select>
            </div>

            <nav
              aria-label="Seções da ficha de personagem"
              className="card-luxe hidden max-h-[75vh] flex-col gap-1 overflow-y-auto p-2.5 lg:flex"
            >
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeSec === s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setActiveSec(s.num)}
                    data-testid={`nav-sec-${s.num}`}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition ${
                      active
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {String(s.num).padStart(2, "0")}. {s.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Área Principal da Seção Selecionada */}
          <div className="space-y-6">
            <div className="card-luxe space-y-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal">
                    Seção {String(currentSectionMeta.num).padStart(2, "0")} de 16
                  </p>
                  <h2 className="font-display text-3xl">{currentSectionMeta.title}</h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSec((s) => Math.max(1, s - 1))}
                    disabled={activeSec === 1}
                    className="btn-ghost !min-h-9 !px-3 !py-1 text-xs disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSec((s) => Math.min(16, s + 1))}
                    disabled={activeSec === 16}
                    className="btn-ghost !min-h-9 !px-3 !py-1 text-xs disabled:opacity-40"
                  >
                    Próxima <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* SEÇÃO 1 — IDENTIDADE */}
              {activeSec === 1 && (
                <div className="space-y-5" data-testid="section-1-identidade">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sec1-name">Nome completo</label>
                      <input
                        id="sec1-name"
                        value={f.name}
                        onChange={(e) => up("name", e.target.value)}
                        placeholder="Ex: Lyra Vane d'Alver"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec1-nicknames">Nome de código ou apelido</label>
                      <input
                        id="sec1-nicknames"
                        value={f.nicknames}
                        onChange={(e) => up("nicknames", e.target.value)}
                        placeholder="Ex: Espectro Carmesim, A Dama das Cinzas"
                      />
                    </div>

                    <div>
                      <label htmlFor="sec1-birthdate">Data de nascimento</label>
                      <input
                        id="sec1-birthdate"
                        type="date"
                        value={f.birthDate ?? ""}
                        onChange={(e) => up("birthDate", e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="sec1-age">Idade</label>
                      <input
                        id="sec1-age"
                        type="number"
                        min={0}
                        value={f.age}
                        onChange={(e) => up("age", e.target.value)}
                        placeholder="Ex: 24"
                      />
                    </div>

                    <div>
                      <label htmlFor="sec1-origin">Nacionalidade ou origem</label>
                      <input
                        id="sec1-origin"
                        value={f.nationalityOrOrigin ?? ""}
                        onChange={(e) => up("nationalityOrOrigin", e.target.value)}
                        placeholder="Ex: Império de Solária / Cidadela do Norte"
                      />
                    </div>

                    <div>
                      <label htmlFor="sec1-profession">Profissão ou papel no universo</label>
                      <input
                        id="sec1-profession"
                        value={f.profession}
                        onChange={(e) => up("profession", e.target.value)}
                        placeholder="Ex: Capitã da Guarda Real, Alquimista"
                      />
                    </div>

                    <div>
                      <label htmlFor="sec1-arc">Arco principal</label>
                      <input
                        id="sec1-arc"
                        value={f.primaryArc ?? ""}
                        onChange={(e) => up("primaryArc", e.target.value)}
                        placeholder="Ex: Queda e Redenção no Trono de Cinzas"
                      />
                    </div>

                    <div>
                      <label htmlFor="sec1-element">Elemento ou conceito principal associado</label>
                      <select
                        id="sec1-element"
                        value={f.elementOrConcept ?? ""}
                        onChange={(e) => up("elementOrConcept", e.target.value)}
                      >
                        <option value="">Selecione um conceito…</option>
                        {ELEMENT_CONCEPTS.map((el) => (
                          <option key={el} value={el}>
                            {el}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Livros da biblioteca (Seleção Múltipla integrada) */}
                  <div>
                    <label>Livros da Biblioteca em que participa (Seleção múltipla)</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {books.map((b) => {
                        const selected = f.bookIds.includes(b.id);
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => toggleBook(b.id)}
                            className={`min-h-10 rounded-xl border px-3.5 text-xs font-medium transition ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {b.order}. {b.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conceitos / Elementos Secundários (Seleção múltipla complementar) */}
                  <TagListEditor
                    label="Conceitos simbólicos ou elementos secundários"
                    items={f.elementsMultiple ?? []}
                    onChange={(next) => up("elementsMultiple", next)}
                    placeholder="Ex: Espelhos quebrados, Relógios antigos, Fênix…"
                    suggestions={["Cinzas", "Sangue Real", "Estrelas", "Vento Norte"]}
                  />

                  <div>
                    <label htmlFor="sec1-notes">Resumo de Identidade (Texto longo)</label>
                    <textarea
                      id="sec1-notes"
                      rows={3}
                      value={f.identityNotes ?? ""}
                      onChange={(e) => up("identityNotes", e.target.value)}
                      placeholder="Apresentação geral de quem é o personagem no início da obra…"
                    />
                  </div>
                </div>
              )}

              {/* SEÇÃO 2 — ESSÊNCIA DO PERSONAGEM */}
              {activeSec === 2 && (
                <div className="space-y-6" data-testid="section-2-essencia">
                  <div>
                    <label htmlFor="sec2-phrase">Frase que define o personagem</label>
                    <textarea
                      id="sec2-phrase"
                      rows={2}
                      value={f.definingPhrase ?? ""}
                      onChange={(e) => up("definingPhrase", e.target.value)}
                      placeholder="Ex: “Prefiro queimar no meu próprio juramento a reinar sob a mentira de outro.”"
                    />
                  </div>

                  <SelectableCards
                    label="Arquétipo"
                    subtitle="Selecione um ou mais arquétipos visuais ou adicione o seu próprio."
                    presets={ARCHETYPE_PRESETS}
                    customOptions={f.customArchetypes ?? []}
                    selected={f.archetypes ?? []}
                    onChangeSelected={(next) => up("archetypes", next)}
                    onAddCustomOption={(opt) =>
                      up("customArchetypes", [...(f.customArchetypes ?? []), opt])
                    }
                    placeholderCustom="Adicionar arquétipo personalizado (ex: Anti-herói trágico)…"
                  />

                  <SelectableCards
                    label="Energia Visual"
                    subtitle="Selecione múltiplas características que transmitem a presença do personagem."
                    presets={VISUAL_ENERGY_PRESETS}
                    customOptions={f.customVisualEnergies ?? []}
                    selected={f.visualEnergies ?? []}
                    onChangeSelected={(next) => up("visualEnergies", next)}
                    onAddCustomOption={(opt) =>
                      up("customVisualEnergies", [...(f.customVisualEnergies ?? []), opt])
                    }
                    placeholderCustom="Adicionar energia visual personalizada (ex: Etérea, Selvagem)…"
                  />
                </div>
              )}

              {/* SEÇÃO 3 — PERSONALIDADE */}
              {activeSec === 3 && (
                <div className="space-y-6" data-testid="section-3-personalidade">
                  <TagListEditor
                    label="Características principais"
                    items={f.mainTraitsList ?? []}
                    onChange={(next) => up("mainTraitsList", next)}
                    placeholder="Adicione uma característica individualmente…"
                    suggestions={["Observador", "Sarcástico", "Leal", "Impulsivo", "Calculista"]}
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <TagListEditor
                      label="Pontos fortes"
                      items={f.strengthsList ?? []}
                      onChange={(next) => up("strengthsList", next)}
                      placeholder="Ex: Coragem sob fogo…"
                      suggestions={["Estratégia", "Empatia", "Resiliência", "Liderança"]}
                    />

                    <TagListEditor
                      label="Fraquezas"
                      items={f.weaknessesList ?? []}
                      onChange={(next) => up("weaknessesList", next)}
                      placeholder="Ex: Orgulho excessivo…"
                      suggestions={[
                        "Teimosia",
                        "Dificuldade em confiar",
                        "Rancor",
                        "Autossabotagem",
                      ]}
                    />

                    <TagListEditor
                      label="Medos"
                      items={f.fearsList ?? []}
                      onChange={(next) => up("fearsList", next)}
                      placeholder="Ex: Perder o controle do próprio poder…"
                      suggestions={[
                        "Abandono",
                        "Traição",
                        "Esquecimento",
                        "Fracassar com quem ama",
                      ]}
                    />

                    <TagListEditor
                      label="Desejos"
                      items={f.desiresList ?? []}
                      onChange={(next) => up("desiresList", next)}
                      placeholder="Ex: Encontrar um lugar onde pertença…"
                      suggestions={["Liberdade", "Justiça", "Redenção", "Proteger sua família"]}
                    />
                  </div>

                  {/* Contradição interna estruturada */}
                  <div className="rounded-2xl border bg-background/50 p-4 sm:p-5">
                    <label className="text-teal">Contradição Interna</label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      “Por fora parece…, mas por dentro…”
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="sec3-outside">Por fora parece…</label>
                        <textarea
                          id="sec3-outside"
                          rows={3}
                          value={f.contradictionOutside ?? ""}
                          onChange={(e) => up("contradictionOutside", e.target.value)}
                          placeholder="Ex: Frio, inabalável e indiferente ao perigo…"
                        />
                      </div>
                      <div>
                        <label htmlFor="sec3-inside">…mas por dentro</label>
                        <textarea
                          id="sec3-inside"
                          rows={3}
                          value={f.contradictionInside ?? ""}
                          onChange={(e) => up("contradictionInside", e.target.value)}
                          placeholder="Ex: Sente cada perda profundamente e teme não ser suficiente."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 4 — PSICOLOGIA */}
              {activeSec === 4 && (
                <div className="space-y-5" data-testid="section-4-psicologia">
                  <div>
                    <label htmlFor="sec4-thinks">Como pensa</label>
                    <textarea
                      id="sec4-thinks"
                      rows={3}
                      value={f.psychHowThinks ?? ""}
                      onChange={(e) => up("psychHowThinks", e.target.value)}
                      placeholder="Processos mentais, visão de mundo, lógica vs. emoção…"
                    />
                  </div>

                  <div>
                    <label htmlFor="sec4-pressure">Como age sob pressão</label>
                    <textarea
                      id="sec4-pressure"
                      rows={3}
                      value={f.psychUnderPressure ?? ""}
                      onChange={(e) => up("psychUnderPressure", e.target.value)}
                      placeholder="Fica mais frio e focado, ou age por impulso? Como reage em crises extremas?"
                    />
                  </div>

                  <div>
                    <label htmlFor="sec4-affection">Como demonstra carinho</label>
                    <textarea
                      id="sec4-affection"
                      rows={3}
                      value={f.psychShowsAffection ?? ""}
                      onChange={(e) => up("psychShowsAffection", e.target.value)}
                      placeholder="Atos silenciosos de proteção, toque físico, palavras raras mas sinceras…"
                    />
                  </div>

                  <div>
                    <label htmlFor="sec4-never-admits">O que nunca admite</label>
                    <textarea
                      id="sec4-never-admits"
                      rows={3}
                      value={f.psychNeverAdmits ?? ""}
                      onChange={(e) => up("psychNeverAdmits", e.target.value)}
                      placeholder="A verdade emocional que o personagem esconde até de si mesmo…"
                    />
                  </div>

                  <div>
                    <label htmlFor="sec4-conflict">Maior conflito interno</label>
                    <textarea
                      id="sec4-conflict"
                      rows={4}
                      value={f.psychInnerConflict ?? ""}
                      onChange={(e) => up("psychInnerConflict", e.target.value)}
                      placeholder="O dilema central entre dever e desejo, passado e futuro…"
                    />
                  </div>
                </div>
              )}

              {/* SEÇÃO 5 — APARÊNCIA VISUAL */}
              {activeSec === 5 && (
                <div className="space-y-6" data-testid="section-5-aparencia">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sec5-face">Rosto</label>
                      <textarea
                        id="sec5-face"
                        rows={2}
                        value={f.faceDetails ?? ""}
                        onChange={(e) => up("faceDetails", e.target.value)}
                        placeholder="Formato, maxilar, cicatrizes, sardas, traços marcantes…"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec5-hair">Cabelo</label>
                      <textarea
                        id="sec5-hair"
                        rows={2}
                        value={f.hairDetails ?? ""}
                        onChange={(e) => up("hairDetails", e.target.value)}
                        placeholder="Cor, textura, corte, penteado habitual…"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec5-eyes">Olhos</label>
                      <textarea
                        id="sec5-eyes"
                        rows={2}
                        value={f.eyesDetails ?? ""}
                        onChange={(e) => up("eyesDetails", e.target.value)}
                        placeholder="Cor da íris, formato, intensidade do olhar…"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec5-height">Altura</label>
                      <input
                        id="sec5-height"
                        value={f.heightDetails ?? ""}
                        onChange={(e) => up("heightDetails", e.target.value)}
                        placeholder="Ex: 1,78 m (alta, presença imponente)"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec5-body">Corpo e postura</label>
                      <textarea
                        id="sec5-body"
                        rows={2}
                        value={f.bodyAndPosture ?? ""}
                        onChange={(e) => up("bodyAndPosture", e.target.value)}
                        placeholder="Constituição física, modo de caminhar, linguagem corporal…"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec5-expression">Expressão padrão</label>
                      <textarea
                        id="sec5-expression"
                        rows={2}
                        value={f.defaultExpression ?? ""}
                        onChange={(e) => up("defaultExpression", e.target.value)}
                        placeholder="Sobrancelha levemente arqueada, meio sorriso irônico, olhar distante…"
                      />
                    </div>
                  </div>

                  {/* Galeria integrada para anexar imagens de referência de aparência física */}
                  <div className="border-t pt-5">
                    <ReferenceGallery
                      items={f.visualReferences ?? []}
                      onChange={(next) => up("visualReferences", next)}
                      defaultCategory="Aparência física"
                      compactTitle="Imagens de Referência de Aparência Física"
                    />
                  </div>
                </div>
              )}

              {/* SEÇÃO 6 — ESTILO VISUAL E CRIADOR DE PALETAS */}
              {activeSec === 6 && (
                <div className="space-y-6" data-testid="section-6-estilo">
                  <SelectableCards
                    label="Estética"
                    subtitle="Selecione várias estéticas ou adicione opções personalizadas."
                    presets={AESTHETIC_PRESETS}
                    customOptions={f.customAesthetics ?? []}
                    selected={f.aesthetics ?? []}
                    onChangeSelected={(next) => up("aesthetics", next)}
                    onAddCustomOption={(opt) =>
                      up("customAesthetics", [...(f.customAesthetics ?? []), opt])
                    }
                    placeholderCustom="Adicionar estética personalizada (ex: Gótico Real, Solarpunk)…"
                  />

                  {/* Funcionalidade Obrigatória: Criador de Paletas de Cores */}
                  <div className="border-y py-5">
                    <PaletteStudio
                      palettes={f.palettes ?? []}
                      savedGlobalPalettes={allSavedPalettes}
                      onChange={(next) => up("palettes", next)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="sec6-clothes">Roupas principais</label>
                      <textarea
                        id="sec6-clothes"
                        rows={3}
                        value={f.mainClothes ?? ""}
                        onChange={(e) => up("mainClothes", e.target.value)}
                        placeholder="Sobretudo de veludo vinho, botas de couro, trajes de combate ou gala…"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec6-accessories">Acessórios</label>
                      <textarea
                        id="sec6-accessories"
                        rows={2}
                        value={f.accessories ?? ""}
                        onChange={(e) => up("accessories", e.target.value)}
                        placeholder="Anéis de sinete, adaga ceremonial, colar de âmbar…"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec6-striking">Elementos visuais marcantes</label>
                      <textarea
                        id="sec6-striking"
                        rows={2}
                        value={f.strikingVisualElements ?? ""}
                        onChange={(e) => up("strikingVisualElements", e.target.value)}
                        placeholder="Tatuagem arcana no pulso, mecha prateada, capa rasgada…"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 7 — ASSINATURA CINEMATOGRÁFICA */}
              {activeSec === 7 && (
                <div className="space-y-6" data-testid="section-7-cinematografia">
                  <SelectableCards
                    label="Câmera ideal (Enquadramentos)"
                    subtitle="Selecione os enquadramentos que melhor capturam o personagem ou escolha Personalizado para descrever enquadramentos, ângulos e movimentos de câmera."
                    presets={CAMERA_SHOT_PRESETS}
                    customOptions={f.customCameraShots ?? []}
                    selected={f.idealCameraShots ?? []}
                    onChangeSelected={(next) => up("idealCameraShots", next)}
                    onAddCustomOption={(opt) =>
                      up("customCameraShots", [...(f.customCameraShots ?? []), opt])
                    }
                    placeholderCustom="Adicionar enquadramento rápido à grade (ex: Plano Holandês, Travelling circular)…"
                    enableCustomOptionCard
                    customOptionCardDesc="Descreva livremente enquadramentos, ângulos e movimentos de câmera."
                    customDescriptionValue={f.customCameraDescription ?? ""}
                    onChangeCustomDescription={(val) => up("customCameraDescription", val)}
                    customDescriptionLabel="Câmera ideal (Enquadramentos) — Personalizado"
                    customDescriptionPlaceholder="Descreva livremente enquadramentos, ângulos e movimentos de câmera (ex: travelling lento aproximando até extreme close-up nos olhos, câmera na mão em plano sequência)…"
                    fieldTestIdPrefix="camera-ideal"
                  />

                  <SelectableCards
                    label="Iluminação"
                    subtitle="Escolha os estilos de luz que acompanham o personagem ou selecione Personalizado para descrever luz, cores, intensidade e atmosfera."
                    presets={LIGHTING_PRESETS}
                    customOptions={f.customLightingStyles ?? []}
                    selected={f.lightingStyles ?? []}
                    onChangeSelected={(next) => up("lightingStyles", next)}
                    onAddCustomOption={(opt) =>
                      up("customLightingStyles", [...(f.customLightingStyles ?? []), opt])
                    }
                    placeholderCustom="Adicionar estilo de iluminação rápido à grade (ex: Contraluz carmesim, Feixe zenital)…"
                    enableCustomOptionCard
                    customOptionCardDesc="Descreva livremente o tipo de luz, cores, intensidade e atmosfera desejada."
                    customDescriptionValue={f.customLightingDescription ?? ""}
                    onChangeCustomDescription={(val) => up("customLightingDescription", val)}
                    customDescriptionLabel="Iluminação — Personalizado"
                    customDescriptionPlaceholder="Descreva livremente o tipo de luz, as cores, a intensidade e a atmosfera desejada (ex: luz fria azulada atravessando vitrais quebrados com reflexos dourados suaves no rosto)…"
                    fieldTestIdPrefix="iluminacao"
                  />

                  <SelectableCards
                    label="Tipo de cena que combina com o personagem"
                    subtitle="Selecione as cenas ideais ou marque Personalizado para descrever cenas específicas, situações narrativas e atmosferas cinematográficas."
                    presets={SCENE_TYPE_PRESETS}
                    customOptions={f.customSceneTypes ?? []}
                    selected={f.sceneTypes ?? []}
                    onChangeSelected={(next) => up("sceneTypes", next)}
                    onAddCustomOption={(opt) =>
                      up("customSceneTypes", [...(f.customSceneTypes ?? []), opt])
                    }
                    placeholderCustom="Adicionar tipo de cena rápido à grade (ex: Juramento à meia-noite, Fuga pelos telhados)…"
                    enableCustomOptionCard
                    customOptionCardDesc="Descreva livremente cenas específicas, situações narrativas e atmosferas cinematográficas."
                    customDescriptionValue={f.customSceneDescription ?? ""}
                    onChangeCustomDescription={(val) => up("customSceneDescription", val)}
                    customDescriptionLabel="Tipo de cena que combina com o personagem — Personalizado"
                    customDescriptionPlaceholder="Descreva livremente cenas específicas, situações narrativas e atmosferas cinematográficas (ex: caminhando sozinha por um salão de baile congelado no tempo enquanto pétalas de cinza caem)…"
                    fieldTestIdPrefix="tipo-cena"
                  />

                  <TagListEditor
                    label="Cenários ideais"
                    items={f.scenariosList ?? []}
                    onChange={(next) => up("scenariosList", next)}
                    placeholder="Adicione um cenário (ex: Biblioteca submersa, Telhados sob neblina)…"
                    suggestions={[
                      "Salão do Trono em ruínas",
                      "Floresta de cinzas",
                      "Metrópole chuvosa à meia-noite",
                      "Varanda de mármore ao luar",
                    ]}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sec7-music">Música ou vibe sonora</label>
                      <input
                        id="sec7-music"
                        value={f.musicOrVibe ?? ""}
                        onChange={(e) => up("musicOrVibe", e.target.value)}
                        placeholder="Ex: Violoncelo sombrio com sintetizadores graves"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec7-notes">Descrições cinematográficas próprias</label>
                      <input
                        id="sec7-notes"
                        value={f.cinematicNotes ?? ""}
                        onChange={(e) => up("cinematicNotes", e.target.value)}
                        placeholder="Ex: Granulação 35mm, movimento em câmera lenta…"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 8 — HISTÓRIA */}
              {activeSec === 8 && (
                <div className="space-y-5" data-testid="section-8-historia">
                  <div>
                    <label htmlFor="sec8-past">Passado</label>
                    <textarea
                      id="sec8-past"
                      rows={4}
                      value={f.past}
                      onChange={(e) => up("past", e.target.value)}
                      placeholder="Infância, criação, origens familiares e contexto antes do início da trama…"
                    />
                  </div>

                  <div>
                    <label htmlFor="sec8-event">Evento que mudou sua vida</label>
                    <textarea
                      id="sec8-event"
                      rows={3}
                      value={f.lifeChangingEvent ?? ""}
                      onChange={(e) => up("lifeChangingEvent", e.target.value)}
                      placeholder="O incidente decisivo que rompeu a rotina ou despertou seu destino…"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sec8-secret">Segredo</label>
                      <textarea
                        id="sec8-secret"
                        rows={3}
                        value={f.secret ?? ""}
                        onChange={(e) => up("secret", e.target.value)}
                        placeholder="O que este personagem esconde dos outros?"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec8-goal">Objetivo atual</label>
                      <textarea
                        id="sec8-goal"
                        rows={3}
                        value={f.currentGoal ?? ""}
                        onChange={(e) => up("currentGoal", e.target.value)}
                        placeholder="O que move suas ações neste momento da saga?"
                      />
                    </div>
                  </div>

                  {/* Jornada do personagem ANTES e DEPOIS visualmente separados */}
                  <div className="pt-2">
                    <label className="text-teal">Jornada do Personagem (Antes e Depois)</label>
                    <div className="mt-2 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border bg-background/60 p-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          ANTES
                        </span>
                        <textarea
                          aria-label="Jornada Antes"
                          rows={4}
                          value={f.journeyBefore ?? ""}
                          onChange={(e) => up("journeyBefore", e.target.value)}
                          placeholder="Quem era o personagem no ponto de partida? Quais crenças tinha?"
                          className="mt-2"
                        />
                      </div>

                      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                          DEPOIS
                        </span>
                        <textarea
                          aria-label="Jornada Depois"
                          rows={4}
                          value={f.journeyAfter ?? ""}
                          onChange={(e) => up("journeyAfter", e.target.value)}
                          placeholder="Em quem se transforma após enfrentar as provações da saga?"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 9 — RELACIONAMENTOS */}
              {activeSec === 9 && (
                <div className="space-y-6" data-testid="section-9-relacionamentos">
                  {/* Vínculo Romântico Principal (Sincronizado com a aba Casais) */}
                  <div className="rounded-2xl border bg-background/50 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <h4 className="font-display text-xl">Interesse Romântico Principal</h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="sec9-partner">Selecionar personagem cadastrado</label>
                        <select
                          id="sec9-partner"
                          value={f.partnerId ?? ""}
                          onChange={(e) => up("partnerId", e.target.value || undefined)}
                        >
                          <option value="">Nenhum</option>
                          {chars
                            .filter((c) => c.id !== f.id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name || "Sem nome"}
                                {c.partnerId && c.partnerId !== f.id ? " (já tem par)" : ""}
                              </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[0.7rem] text-muted-foreground">
                          Sincroniza automaticamente com a página Casais da saga.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="sec9-dynamic">Dinâmica do casal</label>
                        <select
                          id="sec9-dynamic"
                          value={f.romanticDynamic ?? ""}
                          onChange={(e) => up("romanticDynamic", e.target.value)}
                        >
                          <option value="">Selecione uma dinâmica…</option>
                          {[...DYNAMIC_PRESETS, ...(f.customDynamics ?? [])].map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 flex gap-1.5">
                          <input
                            value={customDynamicInput}
                            onChange={(e) => setCustomDynamicInput(e.target.value)}
                            placeholder="Criar dinâmica personalizada…"
                            className="!min-h-8 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const clean = customDynamicInput.trim();
                              if (!clean) return;
                              up("customDynamics", [...(f.customDynamics ?? []), clean]);
                              up("romanticDynamic", clean);
                              setCustomDynamicInput("");
                            }}
                            className="btn-ghost !min-h-8 shrink-0 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" /> Criar
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="sec9-howmet">Como se conheceram</label>
                        <textarea
                          id="sec9-howmet"
                          rows={2}
                          value={f.romanticHowMet ?? ""}
                          onChange={(e) => up("romanticHowMet", e.target.value)}
                          placeholder="O primeiro encontro, circunstâncias e primeira impressão…"
                        />
                      </div>

                      <div>
                        <label htmlFor="sec9-awakens">O que um desperta no outro</label>
                        <textarea
                          id="sec9-awakens"
                          rows={2}
                          value={f.romanticAwakens ?? ""}
                          onChange={(e) => up("romanticAwakens", e.target.value)}
                          placeholder="Vulnerabilidade, coragem, fúria, paz…"
                        />
                      </div>

                      <div>
                        <label htmlFor="sec9-conflict">Maior conflito entre os dois</label>
                        <textarea
                          id="sec9-conflict"
                          rows={2}
                          value={f.romanticConflict ?? ""}
                          onChange={(e) => up("romanticConflict", e.target.value)}
                          placeholder="Segredos, lados opostos da guerra, juramentos incompatíveis…"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Outros Vínculos: Amizades, Família, Rivalidades, Alianças */}
                  <div className="space-y-4">
                    <h4 className="font-display text-xl">
                      Rede de Relações (Amizades, Família, Rivalidades e Outros Vínculos)
                    </h4>

                    <div className="rounded-2xl border bg-background/40 p-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label>Personagem vinculado</label>
                          <select
                            aria-label="Escolher personagem do vínculo"
                            value={relDraft.targetCharacterId}
                            onChange={(e) => {
                              const cid = e.target.value;
                              const found = chars.find((x) => x.id === cid);
                              setRelDraft({
                                ...relDraft,
                                targetCharacterId: cid,
                                targetName: found ? found.name : relDraft.targetName,
                              });
                            }}
                          >
                            <option value="">Outro / Digitar nome abaixo…</option>
                            {chars
                              .filter((c) => c.id !== f.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name || "Sem nome"}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label>Nome do contato / personagem</label>
                          <input
                            value={relDraft.targetName}
                            onChange={(e) =>
                              setRelDraft({ ...relDraft, targetName: e.target.value })
                            }
                            placeholder="Nome do aliado, familiar ou rival…"
                          />
                        </div>

                        <div>
                          <label>Tipo de vínculo</label>
                          <select
                            value={relDraft.type}
                            onChange={(e) =>
                              setRelDraft({
                                ...relDraft,
                                type: e.target.value as RelationshipType,
                              })
                            }
                          >
                            {(
                              [
                                "Romântico",
                                "Amizade",
                                "Familiar",
                                "Rivalidade",
                                "Aliança",
                                "Mentor / Pupilo",
                                "Outro",
                              ] as RelationshipType[]
                            ).map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label>Dinâmica da relação</label>
                          <input
                            value={relDraft.dynamic}
                            onChange={(e) => setRelDraft({ ...relDraft, dynamic: e.target.value })}
                            placeholder="Ex: Fogo e gelo, Lealdade cega, Rivalidade fraterna…"
                          />
                        </div>
                        <div>
                          <label>Como se conheceram</label>
                          <input
                            value={relDraft.howTheyMet}
                            onChange={(e) =>
                              setRelDraft({ ...relDraft, howTheyMet: e.target.value })
                            }
                            placeholder="Origem do vínculo…"
                          />
                        </div>
                        <div>
                          <label>O que despertam um no outro</label>
                          <input
                            value={relDraft.whatAwakens}
                            onChange={(e) =>
                              setRelDraft({ ...relDraft, whatAwakens: e.target.value })
                            }
                            placeholder="Impacto emocional…"
                          />
                        </div>
                        <div>
                          <label>Maior conflito</label>
                          <input
                            value={relDraft.majorConflict}
                            onChange={(e) =>
                              setRelDraft({ ...relDraft, majorConflict: e.target.value })
                            }
                            placeholder="Ponto de tensão…"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!relDraft.targetName.trim()) return;
                            const newRel: CharacterRelationship = {
                              id: `rel_${Date.now()}`,
                              targetCharacterId: relDraft.targetCharacterId || undefined,
                              targetName: relDraft.targetName.trim(),
                              type: relDraft.type,
                              howTheyMet: relDraft.howTheyMet.trim(),
                              dynamic: relDraft.dynamic.trim(),
                              whatAwakens: relDraft.whatAwakens.trim(),
                              majorConflict: relDraft.majorConflict.trim(),
                            };
                            up("relationships", [...(f.relationships ?? []), newRel]);
                            setRelDraft({
                              targetCharacterId: "",
                              targetName: "",
                              type: "Amizade",
                              howTheyMet: "",
                              dynamic: "",
                              whatAwakens: "",
                              majorConflict: "",
                            });
                          }}
                          className="btn text-xs"
                          data-testid="btn-adicionar-vinculo"
                        >
                          <Plus className="h-4 w-4" /> Adicionar vínculo
                        </button>
                      </div>
                    </div>

                    {(f.relationships ?? []).length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(f.relationships ?? []).map((rel) => (
                          <div
                            key={rel.id}
                            className="rounded-2xl border bg-background/60 p-4 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs text-teal">{rel.type}</span>
                                <h5 className="font-display text-lg">{rel.targetName}</h5>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  up(
                                    "relationships",
                                    (f.relationships ?? []).filter((x) => x.id !== rel.id),
                                  )
                                }
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`Remover vínculo com ${rel.targetName}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {rel.dynamic && (
                              <p className="text-xs text-muted-foreground">
                                <strong>Dinâmica:</strong> {rel.dynamic}
                              </p>
                            )}
                            {rel.howTheyMet && (
                              <p className="text-xs text-muted-foreground">
                                <strong>Como se conheceram:</strong> {rel.howTheyMet}
                              </p>
                            )}
                            {rel.whatAwakens && (
                              <p className="text-xs text-muted-foreground">
                                <strong>O que desperta:</strong> {rel.whatAwakens}
                              </p>
                            )}
                            {rel.majorConflict && (
                              <p className="text-xs text-muted-foreground">
                                <strong>Conflito:</strong> {rel.majorConflict}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO 10 — HABILIDADES E PODERES */}
              {activeSec === 10 && (
                <div className="space-y-6" data-testid="section-10-habilidades">
                  <div className="rounded-2xl border bg-background/40 p-4 space-y-3">
                    <h4 className="font-display text-xl">Cadastrar Habilidade ou Poder</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="sec10-name">Habilidade principal / Nome do poder</label>
                        <input
                          id="sec10-name"
                          value={abilityDraft.name}
                          onChange={(e) =>
                            setAbilityDraft({ ...abilityDraft, name: e.target.value })
                          }
                          placeholder="Ex: Pirocinese Astral, Lâmina de Sombras"
                        />
                      </div>
                      <div>
                        <label htmlFor="sec10-style">Estilo de luta ou ação</label>
                        <input
                          id="sec10-style"
                          value={abilityDraft.fightingStyle}
                          onChange={(e) =>
                            setAbilityDraft({
                              ...abilityDraft,
                              fightingStyle: e.target.value,
                            })
                          }
                          placeholder="Ex: Combate ágil de curta distância, Estrategista à distância"
                        />
                      </div>
                      <div>
                        <label htmlFor="sec10-works">Como funciona</label>
                        <textarea
                          id="sec10-works"
                          rows={2}
                          value={abilityDraft.howItWorks}
                          onChange={(e) =>
                            setAbilityDraft({ ...abilityDraft, howItWorks: e.target.value })
                          }
                          placeholder="Regras de ativação, manifestação visual e alcance…"
                        />
                      </div>
                      <div>
                        <label htmlFor="sec10-limits">Limitações e custo</label>
                        <textarea
                          id="sec10-limits"
                          rows={2}
                          value={abilityDraft.limitations}
                          onChange={(e) =>
                            setAbilityDraft({ ...abilityDraft, limitations: e.target.value })
                          }
                          placeholder="Desgaste físico, condições climáticas, vulnerabilidades…"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!abilityDraft.name.trim()) return;
                          const newAb: CharacterAbility = {
                            id: `ab_${Date.now()}`,
                            name: abilityDraft.name.trim(),
                            howItWorks: abilityDraft.howItWorks.trim(),
                            limitations: abilityDraft.limitations.trim(),
                            fightingStyle: abilityDraft.fightingStyle.trim(),
                          };
                          up("abilities", [...(f.abilities ?? []), newAb]);
                          setAbilityDraft({
                            name: "",
                            howItWorks: "",
                            limitations: "",
                            fightingStyle: "",
                          });
                        }}
                        className="btn text-xs"
                        data-testid="btn-adicionar-habilidade"
                      >
                        <Plus className="h-4 w-4" /> Adicionar habilidade
                      </button>
                    </div>
                  </div>

                  {(f.abilities ?? []).length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Nenhuma habilidade cadastrada ainda.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(f.abilities ?? []).map((ab) => (
                        <div
                          key={ab.id}
                          className="rounded-2xl border bg-background/60 p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-display text-xl text-foreground">{ab.name}</h5>
                              {ab.fightingStyle && (
                                <p className="text-xs text-teal">{ab.fightingStyle}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                up(
                                  "abilities",
                                  (f.abilities ?? []).filter((x) => x.id !== ab.id),
                                )
                              }
                              aria-label={`Remover habilidade ${ab.name}`}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {ab.howItWorks && (
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-foreground">Como funciona:</strong>{" "}
                              {ab.howItWorks}
                            </p>
                          )}
                          {ab.limitations && (
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-foreground">Limitações:</strong>{" "}
                              {ab.limitations}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO 11 — DETALHES HUMANOS */}
              {activeSec === 11 && (
                <div className="space-y-6" data-testid="section-11-humanos">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <TagListEditor
                      label="Gostos"
                      items={f.likesList ?? []}
                      onChange={(next) => up("likesList", next)}
                      placeholder="Adicionar gosto…"
                      suggestions={["Chuva à noite", "Chá de especiarias", "Mapas antigos"]}
                    />
                    <TagListEditor
                      label="Não gosta"
                      items={f.dislikesList ?? []}
                      onChange={(next) => up("dislikesList", next)}
                      placeholder="Adicionar desgosto…"
                      suggestions={["Mentiras", "Lugares fechados", "Barulho excessivo"]}
                    />
                    <TagListEditor
                      label="Hobbies"
                      items={f.hobbiesList ?? []}
                      onChange={(next) => up("hobbiesList", next)}
                      placeholder="Adicionar hobby…"
                      suggestions={["Esgrima", "Tocar piano", "Astronomia", "Caligrafia"]}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="sec11-food">Comida favorita</label>
                      <input
                        id="sec11-food"
                        value={f.favoriteFood ?? ""}
                        onChange={(e) => up("favoriteFood", e.target.value)}
                        placeholder="Ex: Tortas de figo com mel"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec11-song">Música que representa</label>
                      <input
                        id="sec11-song"
                        value={f.themeSong ?? ""}
                        onChange={(e) => up("themeSong", e.target.value)}
                        placeholder="Ex: Réquiem em Ré Menor / Faixa tema"
                      />
                    </div>
                    <div>
                      <label htmlFor="sec11-habit">Pequeno hábito</label>
                      <input
                        id="sec11-habit"
                        value={f.smallHabit ?? ""}
                        onChange={(e) => up("smallHabit", e.target.value)}
                        placeholder="Ex: Girar o anel no polegar quando mente"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 12 — PROMPT BASE DE IA */}
              {activeSec === 12 && (
                <div className="space-y-5" data-testid="section-12-prompt">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-display text-xl">Gerador Local de Prompt Visual</h4>
                      <p className="text-xs text-muted-foreground">
                        Combina aparência, idade, roupas, estética, personalidade, iluminação e
                        cenário preenchidos na ficha. Nenhuma API externa paga é acionada.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={buildAiPrompt}
                      className="btn"
                      data-testid="btn-montar-prompt"
                    >
                      <Wand2 className="h-4 w-4" /> Montar prompt
                    </button>
                  </div>

                  <div>
                    <label htmlFor="sec12-prompt-textarea">
                      Estrutura do Prompt (Totalmente editável)
                    </label>
                    <textarea
                      id="sec12-prompt-textarea"
                      rows={5}
                      value={f.aiBasePrompt ?? ""}
                      onChange={(e) => up("aiBasePrompt", e.target.value)}
                      placeholder="[nome], [idade], [aparência], [roupa], [estilo], [personalidade], cinematic realistic photography, film still, [iluminação], [cenário]."
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={copyPromptToClipboard}
                      disabled={!f.aiBasePrompt}
                      className="btn-ghost text-xs disabled:opacity-40"
                      data-testid="btn-copiar-prompt"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="h-4 w-4 text-teal" /> Prompt copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copiar prompt completo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SEÇÃO 13 — REFERÊNCIAS VISUAIS */}
              {activeSec === 13 && (
                <div data-testid="section-13-referencias">
                  <ReferenceGallery
                    items={f.visualReferences ?? []}
                    onChange={(next) => up("visualReferences", next)}
                  />
                </div>
              )}

              {/* SEÇÃO 14 — FRASES IMPORTANTES */}
              {activeSec === 14 && (
                <div className="space-y-5" data-testid="section-14-frases">
                  <div className="rounded-2xl border bg-background/40 p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="sec14-type">Categoria da frase</label>
                        <select
                          id="sec14-type"
                          value={quoteDraft.type}
                          onChange={(e) =>
                            setQuoteDraft({
                              ...quoteDraft,
                              type: e.target.value as QuoteCategory,
                            })
                          }
                        >
                          <option value="Frase marcante">Frase marcante</option>
                          <option value="Frase que representa a personalidade">
                            Frase que representa a personalidade
                          </option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="sec14-context">Contexto / Capítulo (opcional)</label>
                        <input
                          id="sec14-context"
                          value={quoteDraft.context}
                          onChange={(e) =>
                            setQuoteDraft({ ...quoteDraft, context: e.target.value })
                          }
                          placeholder="Ex: Livro 1, diante do Conselho"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="sec14-text">Texto da frase</label>
                        <textarea
                          id="sec14-text"
                          rows={2}
                          value={quoteDraft.text}
                          onChange={(e) => setQuoteDraft({ ...quoteDraft, text: e.target.value })}
                          placeholder="Digite a citação do personagem…"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {editingQuoteId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuoteId(null);
                            setQuoteDraft({
                              text: "",
                              type: "Frase marcante",
                              context: "",
                            });
                          }}
                          className="btn-ghost text-xs"
                        >
                          Cancelar edição
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!quoteDraft.text.trim()) return;
                          if (editingQuoteId) {
                            up(
                              "quotesList",
                              (f.quotesList ?? []).map((q) =>
                                q.id === editingQuoteId
                                  ? {
                                      ...q,
                                      text: quoteDraft.text.trim(),
                                      type: quoteDraft.type,
                                      context: quoteDraft.context.trim() || undefined,
                                    }
                                  : q,
                              ),
                            );
                            setEditingQuoteId(null);
                          } else {
                            const nq: CharacterQuote = {
                              id: `qt_${Date.now()}`,
                              text: quoteDraft.text.trim(),
                              type: quoteDraft.type,
                              context: quoteDraft.context.trim() || undefined,
                            };
                            up("quotesList", [...(f.quotesList ?? []), nq]);
                          }
                          setQuoteDraft({
                            text: "",
                            type: "Frase marcante",
                            context: "",
                          });
                        }}
                        className="btn text-xs"
                        data-testid="btn-salvar-frase"
                      >
                        <Plus className="h-4 w-4" />{" "}
                        {editingQuoteId ? "Atualizar frase" : "Adicionar frase"}
                      </button>
                    </div>
                  </div>

                  {(f.quotesList ?? []).length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Nenhuma frase cadastrada ainda.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(f.quotesList ?? []).map((q) => (
                        <div
                          key={q.id}
                          className="rounded-2xl border bg-background/60 p-4 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-xs text-teal">
                              {q.type}
                              {q.context ? ` · ${q.context}` : ""}
                            </span>
                            <p className="font-display text-xl italic text-foreground">
                              “{q.text}”
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuoteId(q.id);
                                setQuoteDraft({
                                  text: q.text,
                                  type: q.type,
                                  context: q.context ?? "",
                                });
                              }}
                              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              aria-label="Editar frase"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                up(
                                  "quotesList",
                                  (f.quotesList ?? []).filter((x) => x.id !== q.id),
                                )
                              }
                              className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                              aria-label="Remover frase"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO 15 — EVOLUÇÃO NO UNIVERSO */}
              {activeSec === 15 && (
                <div className="space-y-5" data-testid="section-15-evolucao">
                  <p className="text-xs text-muted-foreground">
                    Acompanhe os três marcos de transformação do personagem ao longo da saga.
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border bg-background/50 p-4 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        01 · Como começa
                      </span>
                      <textarea
                        aria-label="Como começa"
                        rows={6}
                        value={f.evolutionStarts ?? ""}
                        onChange={(e) => up("evolutionStarts", e.target.value)}
                        placeholder="Estado emocional, posição social e visão de mundo nos primeiros capítulos…"
                      />
                    </div>

                    <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-teal">
                        02 · Momento de mudança
                      </span>
                      <textarea
                        aria-label="Momento de mudança"
                        rows={6}
                        value={f.evolutionTurningPoint ?? ""}
                        onChange={(e) => up("evolutionTurningPoint", e.target.value)}
                        placeholder="O clímax ou crise que força o personagem a abandonar quem era…"
                      />
                    </div>

                    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                        03 · Como termina
                      </span>
                      <textarea
                        aria-label="Como termina"
                        rows={6}
                        value={f.evolutionEnds ?? ""}
                        onChange={(e) => up("evolutionEnds", e.target.value)}
                        placeholder="Destino final, legado e maturidade conquistada ao fim da saga…"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 16 — CURIOSIDADES */}
              {activeSec === 16 && (
                <div className="space-y-5" data-testid="section-16-curiosidades">
                  <div className="flex gap-2">
                    <input
                      aria-label="Nova curiosidade"
                      value={curiosityDraft}
                      onChange={(e) => setCuriosityDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!curiosityDraft.trim()) return;
                          const item: CharacterCuriosity = {
                            id: `cur_${Date.now()}`,
                            text: curiosityDraft.trim(),
                          };
                          up("curiosities", [...(f.curiosities ?? []), item]);
                          setCuriosityDraft("");
                        }
                      }}
                      placeholder="Adicione uma curiosidade, detalhe de bastidor ou easter egg…"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!curiosityDraft.trim()) return;
                        const item: CharacterCuriosity = {
                          id: `cur_${Date.now()}`,
                          text: curiosityDraft.trim(),
                        };
                        up("curiosities", [...(f.curiosities ?? []), item]);
                        setCuriosityDraft("");
                      }}
                      className="btn shrink-0 text-xs"
                      data-testid="btn-adicionar-curiosidade"
                    >
                      <Plus className="h-4 w-4" /> Adicionar
                    </button>
                  </div>

                  {(f.curiosities ?? []).length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Nenhuma curiosidade cadastrada ainda.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {(f.curiosities ?? []).map((cur, idx) => {
                        const list = f.curiosities ?? [];
                        return (
                          <li
                            key={cur.id}
                            className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-3"
                          >
                            {editingCuriosityId === cur.id ? (
                              <div className="flex flex-1 gap-2">
                                <input
                                  value={editingCuriosityText}
                                  onChange={(e) => setEditingCuriosityText(e.target.value)}
                                  className="!min-h-8 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingCuriosityText.trim()) {
                                      up(
                                        "curiosities",
                                        list.map((x) =>
                                          x.id === cur.id
                                            ? { ...x, text: editingCuriosityText.trim() }
                                            : x,
                                        ),
                                      );
                                    }
                                    setEditingCuriosityId(null);
                                  }}
                                  className="btn !min-h-8 !px-3 !py-1 text-xs"
                                >
                                  Salvar
                                </button>
                              </div>
                            ) : (
                              <span className="flex-1 text-sm">
                                <strong className="mr-2 font-mono text-xs text-teal">
                                  #{idx + 1}
                                </strong>
                                {cur.text}
                              </span>
                            )}

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const next = [...list];
                                  const tmp = next[idx]!;
                                  next[idx] = next[idx - 1]!;
                                  next[idx - 1] = tmp;
                                  up("curiosities", next);
                                }}
                                aria-label="Mover curiosidade para cima"
                                className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === list.length - 1}
                                onClick={() => {
                                  const next = [...list];
                                  const tmp = next[idx]!;
                                  next[idx] = next[idx + 1]!;
                                  next[idx + 1] = tmp;
                                  up("curiosities", next);
                                }}
                                aria-label="Mover curiosidade para baixo"
                                className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCuriosityId(cur.id);
                                  setEditingCuriosityText(cur.text);
                                }}
                                aria-label="Editar curiosidade"
                                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  up(
                                    "curiosities",
                                    list.filter((x) => x.id !== cur.id),
                                  )
                                }
                                aria-label="Remover curiosidade"
                                className="rounded p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO ESSENCIAL — PERGUNTAS PERSONALIZADAS DO PERSONAGEM */}
      <div className="card-luxe p-5 sm:p-7">
        <CustomQuestionsManager
          characterQuestions={f.customQuestions ?? []}
          globalQuestions={globalQuestions}
          answers={f.customAnswers ?? {}}
          onChangeQuestions={(next) => up("customQuestions", next)}
          onChangeAnswers={(next) => up("customAnswers", next)}
        />
      </div>

      {/* Barra Inferior de Ações e Confirmação de Exclusão */}
      <div className="card-luxe flex flex-wrap items-center justify-between gap-3 p-4">
        {!isNew ? (
          confirmDeleteChar ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-destructive">
                Excluir “{f.name || "este personagem"}” permanentemente?
              </span>
              <button
                type="button"
                onClick={() => setConfirmDeleteChar(false)}
                className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  actions.deleteCharacter(f.id);
                  nav({ to: "/personagens" });
                }}
                className="btn !min-h-8 !bg-destructive !px-3 !py-1 text-xs"
                data-testid="btn-confirmar-exclusao-ficha"
              >
                Confirmar exclusão
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-ghost text-xs text-destructive"
              onClick={() => setConfirmDeleteChar(true)}
              data-testid="btn-excluir-ficha"
            >
              <Trash2 className="h-4 w-4" /> Excluir personagem
            </button>
          )
        ) : (
          <span className="text-xs text-muted-foreground">
            Nova ficha em criação ({resolveCharacterModel(f)})
          </span>
        )}

        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-teal">{msg.text}</span>}
          <button type="button" className="btn" onClick={save} data-testid="btn-salvar-ficha">
            <Save className="h-4 w-4" /> Salvar ficha
          </button>
        </div>
      </div>
    </div>
  );
}
