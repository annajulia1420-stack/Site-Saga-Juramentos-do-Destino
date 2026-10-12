import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UserRound,
  Sparkles,
  Heart,
  Target,
  Eye,
  Palette,
  Film,
  BookOpen,
  Users,
  Coffee,
  Terminal,
  Star,
  TrendingUp,
  Lightbulb,
  Images,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Wand2,
  Copy,
  Check,
  ImagePlus,
} from "lucide-react";
import {
  SECONDARY_VISUAL_REF_CATEGORIES,
  type Character,
  type Book,
  type SecondaryProtagonistLink,
  type SecondaryStrikingObject,
  type NarrativeImportanceLevel,
  type CharacterCuriosity,
} from "@/lib/store";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";
import { PaletteStudio } from "@/components/character/PaletteStudio";
import { ReferenceGallery } from "@/components/character/ReferenceGallery";
import { SelectableCards, TagListEditor } from "@/components/character/TagListEditor";

export const SECONDARY_SECTIONS = [
  { num: 1, title: "Identidade", icon: UserRound },
  { num: 2, title: "Essência", icon: Sparkles },
  { num: 3, title: "Personalidade", icon: Heart },
  { num: 4, title: "Motivação", icon: Target },
  { num: 5, title: "Aparência", icon: Eye },
  { num: 6, title: "Estilo Visual", icon: Palette },
  { num: 7, title: "Assinatura Visual", icon: Film },
  { num: 8, title: "História Resumida", icon: BookOpen },
  { num: 9, title: "Relacionamentos", icon: Users },
  { num: 10, title: "Detalhes Humanos", icon: Coffee },
  { num: 11, title: "Prompt Base de IA", icon: Terminal },
  { num: 12, title: "Importância Narrativa", icon: Star },
  { num: 13, title: "Evolução", icon: TrendingUp },
  { num: 14, title: "Curiosidades", icon: Lightbulb },
  { num: 15, title: "Referências Visuais", icon: Images },
] as const;

const STORY_FUNCTION_PRESETS = [
  { title: "Melhor amigo", desc: "Confidente leal e apoio constante na jornada." },
  { title: "Mentor", desc: "Guia experiente que ensina, desafia e orienta." },
  { title: "Rival", desc: "Competidor ou contraponto que força o crescimento." },
  { title: "Vilão", desc: "Força antagonista que ameaça os objetivos centrais." },
  { title: "Aliado", desc: "Parceiro estratégico em momentos decisivos." },
  { title: "Família", desc: "Laço de sangue ou criação que ancora o passado e o presente." },
  { title: "Alívio cômico", desc: "Traz leveza, humor e humanidade em meio à tensão." },
  { title: "Mistério", desc: "Figura enigmática cujas verdadeiras intenções são ocultas." },
  { title: "Guardião", desc: "Protetor jurado de um segredo, lugar ou pessoa." },
];

const EMOTIONAL_ROLE_PRESETS = [
  { title: "Apoia", desc: "Oferece suporte emocional e acolhimento nos momentos difíceis." },
  {
    title: "Desafia",
    desc: "Questiona escolhas e empurra o protagonista além da zona de conforto.",
  },
  { title: "Protege", desc: "Coloca-se na linha de frente para defender quem importa." },
  { title: "Confunde", desc: "Gera dúvida, ambiguidade e dilemas morais." },
  { title: "Inspira", desc: "Serve como farol de esperança, coragem ou mudança." },
  { title: "Ameaça", desc: "Provoca medo, perigo real ou instabilidade emocional." },
];

const WAY_OF_SPEAKING_PRESETS = [
  { title: "Calmo", desc: "Voz serena, pausada e ponderada." },
  { title: "Irônico", desc: " Comentários ácidos, humor afiado e subtexto." },
  { title: "Direto", desc: "Sem rodeios, objetivo e franco." },
  { title: "Divertido", desc: "Entusiasmado, expressivo e contagiante." },
  { title: "Misterioso", desc: "Frases enigmáticas, metáforas e silêncios calculados." },
  { title: "Intenso", desc: "Carregado de paixão, urgência e firmeza." },
];

const SEC_AESTHETIC_PRESETS = [
  { title: "Casual", desc: "Prático, autêntico e descomplicado no dia a dia." },
  { title: "Elegante", desc: "Cortes refinados, postura clássica e sofisticação." },
  { title: "Urbano", desc: "Contemporâneo, peças de rua e atitude moderna." },
  { title: "Sombrio", desc: "Tons fechados, camadas dramáticas e aura noturna." },
  { title: "Criativo", desc: "Combinações únicas, cores expressivas e originalidade." },
  { title: "Minimalista", desc: "Silhueta limpa, funcional e sem excessos." },
];

const SEC_SCENE_VIBE_PRESETS = [
  { title: "Leve", desc: "Momentos cotidianos, diálogos solares e respiro narrativo." },
  { title: "Intensa", desc: "Alta carga dramática, decisões urgentes e emoção à flor da pele." },
  { title: "Misteriosa", desc: "Segredos sussurrados, penumbra e investigação." },
  { title: "Emocional", desc: "Confissões sinceras, vulnerabilidade e conexão profunda." },
  { title: "Conflito", desc: "Embates diretos, tensão elétrica e confronto de ideias." },
];

const SEC_FRAMING_PRESETS = [
  { title: "Close", desc: "Destaque íntimo para expressão facial e olhar." },
  { title: "Plano médio", desc: "Interação corporal, gestos e presença em diálogo." },
  { title: "Cena aberta", desc: "Personagem integrado ao ambiente e atmosfera ao redor." },
];

const IMPORTANCE_LEVELS: {
  level: NarrativeImportanceLevel;
  stars: string;
  label: string;
  desc: string;
}[] = [
  {
    level: 1,
    stars: "⭐",
    label: "Nível 1 — Participação leve",
    desc: "Aparições pontuais que enriquecem o mundo ou cenas específicas.",
  },
  {
    level: 2,
    stars: "⭐⭐",
    label: "Nível 2 — Importante para o arco",
    desc: "Presença recorrente com impacto direto em subtramas e escolhas dos protagonistas.",
  },
  {
    level: 3,
    stars: "⭐⭐⭐",
    label: "Nível 3 — Fundamental na história",
    desc: "Peça-chave indispensável para as reviravoltas e resolução do arco principal.",
  },
];

export function SecondaryCharacterSheet({
  f,
  up,
  toggleBook,
  books,
  chars,
  activeSec,
  setActiveSec,
  setMsg,
}: {
  f: Character;
  up: <K extends keyof Character>(k: K, v: Character[K]) => void;
  toggleBook: (bid: string) => void;
  books: Book[];
  chars: Character[];
  activeSec: number;
  setActiveSec: React.Dispatch<React.SetStateAction<number>>;
  setMsg: (m: { text: string; type: "success" | "error" } | null) => void;
}) {
  // Estados auxiliares para Vínculo com Protagonistas (Seção 1)
  const [protDraft, setProtDraft] = useState<{
    protagonistId: string;
    protagonistName: string;
    relationDescription: string;
  }>({
    protagonistId: "",
    protagonistName: "",
    relationDescription: "",
  });

  // Estados auxiliares para Objetos Marcantes (Seção 6)
  const [objDraft, setObjDraft] = useState<{
    name: string;
    description: string;
    narrativeMeaning: string;
    imageUrl?: string | undefined;
  }>({
    name: "",
    description: "",
    narrativeMeaning: "",
    imageUrl: undefined,
  });
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const objFileRef = useRef<HTMLInputElement | null>(null);

  // Estados auxiliares para Curiosidades (Seção 14)
  const [curiosityDraft, setCuriosityDraft] = useState("");
  const [editingCuriosityId, setEditingCuriosityId] = useState<string | null>(null);
  const [editingCuriosityText, setEditingCuriosityText] = useState("");

  // Estado auxiliar para copiar Prompt IA (Seção 11)
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const safeSec = activeSec >= 1 && activeSec <= 15 ? activeSec : 1;
  const currentSectionMeta =
    SECONDARY_SECTIONS.find((s) => s.num === safeSec) ?? SECONDARY_SECTIONS[0];

  const allSavedPalettes = chars.flatMap((c) => c.palettes ?? []);
  const otherCharacters = chars.filter((c) => c.id !== f.id);

  // Montador automático do Prompt Base de IA para Personagem Secundário (Seção 11)
  const buildSecondaryAiPrompt = () => {
    const nome = f.name.trim() || "secondary character";
    const idade = (f.secApproximateAge || f.age || "").trim() || "adult";
    const aparenciaParts = [f.secHair, f.secEyes, f.secStrikingFeatures, f.secCommonExpression]
      .map((s) => s?.trim())
      .filter(Boolean);
    const aparencia = aparenciaParts.length
      ? aparenciaParts.join(", ")
      : "expressive features, authentic presence";

    const estiloParts = [
      ...(f.secAesthetics ?? []).filter((x) => x !== "Personalizado"),
      f.secAesthetics?.includes("Personalizado") ? f.secCustomAestheticDesc : undefined,
      f.secTypicalClothes,
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const estilo = estiloParts.length ? estiloParts.join(", ") : "distinctive wardrobe";

    const persParts = [
      ...(f.secThreeMainTraits ?? []),
      f.secStrikingQuality,
      ...(f.secEmotionalRoles ?? []).filter((x) => x !== "Personalizado"),
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const personalidade = persParts.length ? persParts.join(", ") : "memorable personality";

    const cenarioParts = [
      f.secMatchingScenario,
      ...(f.secSceneVibes ?? []).filter((x) => x !== "Personalizado"),
      f.secSceneVibes?.includes("Personalizado") ? f.secCustomSceneVibeDesc : undefined,
      ...(f.secFramingTypes ?? []).filter((x) => x !== "Personalizado"),
      f.secFramingTypes?.includes("Personalizado") ? f.secCustomFramingDesc : undefined,
    ]
      .map((s) => s?.trim())
      .filter(Boolean);
    const cenario = cenarioParts.length ? cenarioParts.join(", ") : "atmospheric setting";

    const promptText = `${nome}, ${idade}, ${aparencia}, ${estilo}, ${personalidade}, cinematic realistic portrait, film still, natural lighting, ${cenario}.`;
    up("secAiPrompt", promptText);
    setMsg({ text: "Prompt de personagem secundário montado com sucesso ✓", type: "success" });
  };

  const copySecPrompt = async () => {
    const text = f.secAiPrompt ?? "";
    if (!text) return;
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // fallback
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]" data-testid="secondary-character-sheet">
      {/* Menu Lateral das 15 Seções da Ficha Secundária */}
      <aside className="space-y-2">
        <div className="lg:hidden">
          <label htmlFor="mobile-sec-section-select">Navegar para a seção (1 a 15)</label>
          <select
            id="mobile-sec-section-select"
            value={safeSec}
            onChange={(e) => setActiveSec(Number(e.target.value))}
            className="mt-1"
          >
            {SECONDARY_SECTIONS.map((s) => (
              <option key={s.num} value={s.num}>
                {String(s.num).padStart(2, "0")}. {s.title}
              </option>
            ))}
          </select>
        </div>

        <nav
          aria-label="Seções da ficha de personagem secundário"
          className="card-luxe hidden max-h-[75vh] flex-col gap-1 overflow-y-auto p-2.5 lg:flex"
        >
          {SECONDARY_SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = safeSec === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveSec(s.num)}
                data-testid={`nav-sec-${s.num}`}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition ${
                  active
                    ? "bg-teal text-background font-semibold"
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

      {/* Conteúdo Principal da Seção Ativa (1 a 15) */}
      <div className="space-y-6">
        <div className="card-luxe space-y-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
            <div>
              <p
                className="text-xs uppercase tracking-[0.2em] text-teal"
                data-testid="secondary-section-counter"
              >
                Ficha Secundária · Seção {String(currentSectionMeta.num).padStart(2, "0")} de 15
              </p>
              <h2 className="font-display text-3xl">{currentSectionMeta.title}</h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSec((s) => Math.max(1, s - 1))}
                disabled={safeSec === 1}
                className="btn-ghost !min-h-9 !px-3 !py-1 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => setActiveSec((s) => Math.min(15, s + 1))}
                disabled={safeSec === 15}
                className="btn-ghost !min-h-9 !px-3 !py-1 text-xs disabled:opacity-40"
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 1 — IDENTIDADE (FICHA SECUNDÁRIA)                           */}
          {/* ================================================================= */}
          {safeSec === 1 && (
            <div className="space-y-6" data-testid="sec-section-1-identidade">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sec-name-input">Nome</label>
                  <input
                    id="sec-name-input"
                    value={f.name}
                    onChange={(e) => up("name", e.target.value)}
                    placeholder="Nome do personagem secundário…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-nick-input">Apelido</label>
                  <input
                    id="sec-nick-input"
                    value={f.nicknames}
                    onChange={(e) => up("nicknames", e.target.value)}
                    placeholder="Como é chamado pelos outros…"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block">Livro / Arco (integração com a Biblioteca)</label>
                <div className="flex flex-wrap gap-2">
                  {books.map((b) => {
                    const active = f.bookIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBook(b.id)}
                        className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                          active
                            ? "border-teal bg-teal/20 text-foreground font-medium"
                            : "bg-background/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {b.order}. {b.title}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <label htmlFor="sec-arc-input">Arco narrativo ou núcleo</label>
                  <input
                    id="sec-arc-input"
                    value={f.primaryArc ?? ""}
                    onChange={(e) => up("primaryArc", e.target.value)}
                    placeholder="Ex: Arco da Corte Solar, Subtrama da Guilda…"
                  />
                </div>
              </div>

              <SelectableCards
                label="Função na história"
                subtitle="Selecione uma ou mais funções narrativas ou escolha 'Personalizado'."
                presets={STORY_FUNCTION_PRESETS}
                customOptions={f.secCustomStoryFunctions ?? []}
                selected={f.secStoryFunctions ?? []}
                onChangeSelected={(next) => up("secStoryFunctions", next)}
                onAddCustomOption={(opt) =>
                  up("secCustomStoryFunctions", [...(f.secCustomStoryFunctions ?? []), opt])
                }
                enableCustomOptionCard
                customOptionCardDesc="Descrever uma função narrativa personalizada."
                customDescriptionValue={f.secCustomStoryFunctionDesc ?? ""}
                onChangeCustomDescription={(val) => up("secCustomStoryFunctionDesc", val)}
                customDescriptionLabel="Função personalizada na história"
                customDescriptionPlaceholder="Descreva qual é o papel único deste personagem na trama…"
                fieldTestIdPrefix="sec-funcao-historia"
              />

              {/* Relação com os protagonistas */}
              <div className="space-y-3 rounded-2xl border bg-background/40 p-4">
                <div>
                  <h3 className="font-display text-xl">Relação com os protagonistas</h3>
                  <p className="text-xs text-muted-foreground">
                    Vincule a personagens cadastrados ou descreva manualmente a relação com cada
                    protagonista.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sec-prot-select">
                      Selecionar personagem cadastrado (opcional)
                    </label>
                    <select
                      id="sec-prot-select"
                      value={protDraft.protagonistId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const found = otherCharacters.find((c) => c.id === pid);
                        setProtDraft({
                          ...protDraft,
                          protagonistId: pid,
                          protagonistName: found ? found.name : protDraft.protagonistName,
                        });
                      }}
                    >
                      <option value="">Digitar nome manualmente…</option>
                      {otherCharacters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || "Sem nome"} ({c.modelType ?? "Protagonista"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sec-prot-name">Nome do protagonista / personagem</label>
                    <input
                      id="sec-prot-name"
                      value={protDraft.protagonistName}
                      onChange={(e) =>
                        setProtDraft({ ...protDraft, protagonistName: e.target.value })
                      }
                      placeholder="Ex: Lyra Vane…"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sec-prot-desc">Descrição da relação</label>
                  <input
                    id="sec-prot-desc"
                    value={protDraft.relationDescription}
                    onChange={(e) =>
                      setProtDraft({ ...protDraft, relationDescription: e.target.value })
                    }
                    placeholder="Ex: Mentora de combate que conhece o passado da família dela…"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!protDraft.protagonistName.trim()) return;
                      const item: SecondaryProtagonistLink = {
                        id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                        protagonistId: protDraft.protagonistId || undefined,
                        protagonistName: protDraft.protagonistName.trim(),
                        relationDescription: protDraft.relationDescription.trim(),
                      };
                      up("secProtagonistLinks", [...(f.secProtagonistLinks ?? []), item]);
                      setProtDraft({
                        protagonistId: "",
                        protagonistName: "",
                        relationDescription: "",
                      });
                    }}
                    className="btn-ghost text-xs"
                    data-testid="btn-add-protagonist-link"
                  >
                    <Plus className="h-4 w-4" /> Adicionar vínculo com protagonista
                  </button>
                </div>

                {(f.secProtagonistLinks ?? []).length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {(f.secProtagonistLinks ?? []).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-xl border bg-secondary/40 px-3 py-2 text-xs"
                      >
                        <div>
                          <strong className="text-foreground">{item.protagonistName}</strong>
                          {item.relationDescription && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {item.relationDescription}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            up(
                              "secProtagonistLinks",
                              (f.secProtagonistLinks ?? []).filter((x) => x.id !== item.id),
                            )
                          }
                          aria-label={`Remover vínculo com ${item.protagonistName}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 2 — ESSÊNCIA (FICHA SECUNDÁRIA)                             */}
          {/* ================================================================= */}
          {safeSec === 2 && (
            <div className="space-y-6" data-testid="sec-section-2-essencia">
              <div>
                <label htmlFor="sec-defining-phrase">Frase que resume o personagem</label>
                <textarea
                  id="sec-defining-phrase"
                  rows={2}
                  value={f.definingPhrase ?? ""}
                  onChange={(e) => up("definingPhrase", e.target.value)}
                  placeholder="Uma frase que sintetiza a alma ou presença deste personagem secundário…"
                />
              </div>

              <SelectableCards
                label="Papel emocional na trama"
                subtitle="Como este personagem impacta emocionalmente os protagonistas e o leitor."
                presets={EMOTIONAL_ROLE_PRESETS}
                customOptions={f.secCustomEmotionalRoles ?? []}
                selected={f.secEmotionalRoles ?? []}
                onChangeSelected={(next) => up("secEmotionalRoles", next)}
                onAddCustomOption={(opt) =>
                  up("secCustomEmotionalRoles", [...(f.secCustomEmotionalRoles ?? []), opt])
                }
                enableCustomOptionCard
                customOptionCardDesc="Descrever um papel emocional personalizado."
                customDescriptionValue={f.secCustomEmotionalRoleDesc ?? ""}
                onChangeCustomDescription={(val) => up("secCustomEmotionalRoleDesc", val)}
                customDescriptionLabel="Papel emocional personalizado"
                customDescriptionPlaceholder="Descreva livremente o impacto emocional deste personagem…"
                fieldTestIdPrefix="sec-papel-emocional"
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 3 — PERSONALIDADE (FICHA SECUNDÁRIA)                        */}
          {/* ================================================================= */}
          {safeSec === 3 && (
            <div className="space-y-6" data-testid="sec-section-3-personalidade">
              <TagListEditor
                label="3 traços principais"
                items={f.secThreeMainTraits ?? []}
                onChange={(next) => up("secThreeMainTraits", next)}
                placeholder="Digite um traço e clique em Adicionar…"
                suggestions={[
                  "Observador",
                  "Leal",
                  "Sarcástico",
                  "Pragmático",
                  "Impulsivo",
                  "Diplomático",
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sec-striking-quality">Qualidade marcante</label>
                  <input
                    id="sec-striking-quality"
                    value={f.secStrikingQuality ?? ""}
                    onChange={(e) => up("secStrikingQuality", e.target.value)}
                    placeholder="A virtude mais admirável deste personagem…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-striking-flaw">Defeito marcante</label>
                  <input
                    id="sec-striking-flaw"
                    value={f.secStrikingFlaw ?? ""}
                    onChange={(e) => up("secStrikingFlaw", e.target.value)}
                    placeholder="A falha ou vulnerabilidade mais evidente…"
                  />
                </div>
              </div>

              <SelectableCards
                label="Jeito de falar / agir"
                subtitle="Tom de voz, cadência e atitude comportamental em cena."
                presets={WAY_OF_SPEAKING_PRESETS}
                customOptions={f.secCustomWaysOfSpeaking ?? []}
                selected={f.secWayOfSpeaking ?? []}
                onChangeSelected={(next) => up("secWayOfSpeaking", next)}
                onAddCustomOption={(opt) =>
                  up("secCustomWaysOfSpeaking", [...(f.secCustomWaysOfSpeaking ?? []), opt])
                }
                enableCustomOptionCard
                customOptionCardDesc="Descrever um jeito de falar ou agir próprio."
                customDescriptionValue={f.secCustomWayOfSpeakingDesc ?? ""}
                onChangeCustomDescription={(val) => up("secCustomWayOfSpeakingDesc", val)}
                customDescriptionLabel="Jeito de falar / agir personalizado"
                customDescriptionPlaceholder="Descreva sotaque, expressões recorrentes, gestos ou postura…"
                fieldTestIdPrefix="sec-jeito-falar"
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 4 — MOTIVAÇÃO (FICHA SECUNDÁRIA)                            */}
          {/* ================================================================= */}
          {safeSec === 4 && (
            <div className="space-y-4" data-testid="sec-section-4-motivacao">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sec-what-wants">O que ele quer</label>
                  <textarea
                    id="sec-what-wants"
                    rows={3}
                    value={f.secWhatWants ?? ""}
                    onChange={(e) => up("secWhatWants", e.target.value)}
                    placeholder="Qual é a ambição ou desejo imediato deste personagem…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-why-wants">Por que quer isso</label>
                  <textarea
                    id="sec-why-wants"
                    rows={3}
                    value={f.secWhyWants ?? ""}
                    onChange={(e) => up("secWhyWants", e.target.value)}
                    placeholder="Qual ferida, promessa ou razão íntima move essa busca…"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sec-fears-losing">O que teme perder</label>
                  <textarea
                    id="sec-fears-losing"
                    rows={3}
                    value={f.secFearsLosing ?? ""}
                    onChange={(e) => up("secFearsLosing", e.target.value)}
                    placeholder="O que colocaria tudo a perder para ele…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-secret">Segredo (se tiver — opcional)</label>
                  <textarea
                    id="sec-secret"
                    rows={3}
                    value={f.secSecret ?? ""}
                    onChange={(e) => up("secSecret", e.target.value)}
                    placeholder="Algo que esconde dos protagonistas ou do mundo…"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 5 — APARÊNCIA (FICHA SECUNDÁRIA)                            */}
          {/* ================================================================= */}
          {safeSec === 5 && (
            <div className="space-y-4" data-testid="sec-section-5-aparencia">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="sec-approx-age">Idade aproximada</label>
                  <input
                    id="sec-approx-age"
                    value={f.secApproximateAge ?? ""}
                    onChange={(e) => up("secApproximateAge", e.target.value)}
                    placeholder="Ex: Aparenta 35 anos, Fim da adolescência…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-hair">Cabelo</label>
                  <input
                    id="sec-hair"
                    value={f.secHair ?? ""}
                    onChange={(e) => up("secHair", e.target.value)}
                    placeholder="Cor, corte, textura…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-eyes">Olhos</label>
                  <input
                    id="sec-eyes"
                    value={f.secEyes ?? ""}
                    onChange={(e) => up("secEyes", e.target.value)}
                    placeholder="Cor, formato, intensidade do olhar…"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sec-striking-features">Traços marcantes</label>
                  <textarea
                    id="sec-striking-features"
                    rows={3}
                    value={f.secStrikingFeatures ?? ""}
                    onChange={(e) => up("secStrikingFeatures", e.target.value)}
                    placeholder="Cicatrizes, tatuagens, porte físico, detalhes únicos…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-common-expression">Expressão comum</label>
                  <textarea
                    id="sec-common-expression"
                    rows={3}
                    value={f.secCommonExpression ?? ""}
                    onChange={(e) => up("secCommonExpression", e.target.value)}
                    placeholder="Ex: Meio sorriso irônico, sobrancelha arqueada, olhar vigilante…"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 6 — ESTILO VISUAL (FICHA SECUNDÁRIA)                        */}
          {/* ================================================================= */}
          {safeSec === 6 && (
            <div className="space-y-6" data-testid="sec-section-6-estilo">
              <SelectableCards
                label="Estética"
                subtitle="Identidade visual do vestuário e apresentação."
                presets={SEC_AESTHETIC_PRESETS}
                customOptions={f.secCustomAesthetics ?? []}
                selected={f.secAesthetics ?? []}
                onChangeSelected={(next) => up("secAesthetics", next)}
                onAddCustomOption={(opt) =>
                  up("secCustomAesthetics", [...(f.secCustomAesthetics ?? []), opt])
                }
                enableCustomOptionCard
                customOptionCardDesc="Descrever uma estética visual personalizada."
                customDescriptionValue={f.secCustomAestheticDesc ?? ""}
                onChangeCustomDescription={(val) => up("secCustomAestheticDesc", val)}
                customDescriptionLabel="Estética personalizada"
                customDescriptionPlaceholder="Descreva referências de moda, época, tecidos e silhueta…"
                fieldTestIdPrefix="sec-estetica"
              />

              {/* Paleta de cores completa e funcional */}
              <div className="rounded-2xl border bg-background/40 p-4 sm:p-5">
                <PaletteStudio
                  palettes={f.palettes ?? []}
                  savedGlobalPalettes={allSavedPalettes}
                  onChange={(next) => up("palettes", next)}
                />
              </div>

              <div>
                <label htmlFor="sec-typical-clothes">Roupas típicas</label>
                <textarea
                  id="sec-typical-clothes"
                  rows={3}
                  value={f.secTypicalClothes ?? ""}
                  onChange={(e) => up("secTypicalClothes", e.target.value)}
                  placeholder="Peças que costuma vestir em suas aparições…"
                />
              </div>

              {/* Acessório ou Objeto Marcante com nome, descrição, significado e imagem opcional */}
              <div className="space-y-4 rounded-2xl border bg-background/40 p-4 sm:p-5">
                <div>
                  <h3 className="font-display text-xl">Acessório ou Objeto Marcante</h3>
                  <p className="text-xs text-muted-foreground">
                    Cadastre itens icônicos do personagem com nome, descrição, significado narrativo
                    e imagem opcional.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sec-obj-name">Nome do objeto / acessório</label>
                    <input
                      id="sec-obj-name"
                      value={objDraft.name}
                      onChange={(e) => setObjDraft({ ...objDraft, name: e.target.value })}
                      placeholder="Ex: Bússola de Latão Quebrada…"
                    />
                  </div>
                  <div>
                    <label htmlFor="sec-obj-meaning">Significado narrativo</label>
                    <input
                      id="sec-obj-meaning"
                      value={objDraft.narrativeMeaning}
                      onChange={(e) =>
                        setObjDraft({
                          ...objDraft,
                          narrativeMeaning: e.target.value,
                        })
                      }
                      placeholder="Ex: Lembrança do juramento feito ao antigo rei…"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sec-obj-desc">Descrição visual do objeto</label>
                  <textarea
                    id="sec-obj-desc"
                    rows={2}
                    value={objDraft.description}
                    onChange={(e) => setObjDraft({ ...objDraft, description: e.target.value })}
                    placeholder="Material, gravuras, estado de conservação…"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      ref={objFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const dataUrl = await processImageFile(file, 600);
                        const stored = await storeMediaDataUrl(`obj_${Date.now()}`, dataUrl);
                        setObjDraft((prev) => ({ ...prev, imageUrl: stored }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => objFileRef.current?.click()}
                      className="btn-ghost text-xs"
                    >
                      <ImagePlus className="h-4 w-4" />{" "}
                      {objDraft.imageUrl ? "Trocar imagem do objeto" : "Imagem opcional"}
                    </button>
                    {objDraft.imageUrl && (
                      <div className="h-10 w-10 overflow-hidden rounded-lg border">
                        <MediaImage
                          src={objDraft.imageUrl}
                          alt="Prévia do objeto"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingObjId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingObjId(null);
                          setObjDraft({
                            name: "",
                            description: "",
                            narrativeMeaning: "",
                            imageUrl: undefined,
                          });
                        }}
                        className="btn-ghost text-xs"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!objDraft.name.trim()) return;
                        const list = f.secStrikingObjects ?? [];
                        if (editingObjId) {
                          up(
                            "secStrikingObjects",
                            list.map((o) =>
                              o.id === editingObjId
                                ? {
                                    ...o,
                                    name: objDraft.name.trim(),
                                    description: objDraft.description.trim(),
                                    narrativeMeaning: objDraft.narrativeMeaning.trim(),
                                    imageUrl: objDraft.imageUrl,
                                  }
                                : o,
                            ),
                          );
                          setEditingObjId(null);
                        } else {
                          const newObj: SecondaryStrikingObject = {
                            id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                            name: objDraft.name.trim(),
                            description: objDraft.description.trim(),
                            narrativeMeaning: objDraft.narrativeMeaning.trim(),
                            imageUrl: objDraft.imageUrl,
                          };
                          up("secStrikingObjects", [...list, newObj]);
                        }
                        setObjDraft({
                          name: "",
                          description: "",
                          narrativeMeaning: "",
                          imageUrl: undefined,
                        });
                      }}
                      className="btn text-xs"
                      data-testid="btn-save-striking-object"
                    >
                      <Plus className="h-4 w-4" />{" "}
                      {editingObjId ? "Atualizar objeto" : "Adicionar objeto"}
                    </button>
                  </div>
                </div>

                {(f.secStrikingObjects ?? []).length > 0 && (
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    {(f.secStrikingObjects ?? []).map((obj) => (
                      <div
                        key={obj.id}
                        className="flex items-start justify-between gap-3 rounded-xl border bg-secondary/40 p-3 text-xs"
                        data-testid="striking-object-card"
                      >
                        <div className="flex items-start gap-3">
                          {obj.imageUrl && (
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-secondary">
                              <MediaImage
                                src={obj.imageUrl}
                                alt={obj.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="font-display text-base font-medium text-foreground">
                              {obj.name}
                            </p>
                            {obj.description && (
                              <p className="text-muted-foreground">{obj.description}</p>
                            )}
                            {obj.narrativeMeaning && (
                              <p className="text-teal">Significado: {obj.narrativeMeaning}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingObjId(obj.id);
                              setObjDraft({
                                name: obj.name,
                                description: obj.description,
                                narrativeMeaning: obj.narrativeMeaning,
                                imageUrl: obj.imageUrl,
                              });
                            }}
                            aria-label={`Editar ${obj.name}`}
                            className="rounded p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              up(
                                "secStrikingObjects",
                                (f.secStrikingObjects ?? []).filter((x) => x.id !== obj.id),
                              )
                            }
                            aria-label={`Remover ${obj.name}`}
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 7 — ASSINATURA VISUAL (FICHA SECUNDÁRIA)                    */}
          {/* ================================================================= */}
          {safeSec === 7 && (
            <div className="space-y-6" data-testid="sec-section-7-assinatura">
              <SelectableCards
                label="Clima de cena"
                subtitle="Atmosfera predominante quando o personagem entra em cena."
                presets={SEC_SCENE_VIBE_PRESETS}
                customOptions={f.secCustomSceneVibes ?? []}
                selected={f.secSceneVibes ?? []}
                onChangeSelected={(next) => up("secSceneVibes", next)}
                onAddCustomOption={(opt) =>
                  up("secCustomSceneVibes", [...(f.secCustomSceneVibes ?? []), opt])
                }
                enableCustomOptionCard
                customOptionCardDesc="Descrever um clima de cena personalizado."
                customDescriptionValue={f.secCustomSceneVibeDesc ?? ""}
                onChangeCustomDescription={(val) => up("secCustomSceneVibeDesc", val)}
                customDescriptionLabel="Clima de cena personalizado"
                customDescriptionPlaceholder="Descreva a atmosfera, iluminação e sensação da cena…"
                fieldTestIdPrefix="sec-clima-cena"
              />

              <div>
                <label htmlFor="sec-matching-scenario">Cenário que combina com ele</label>
                <textarea
                  id="sec-matching-scenario"
                  rows={2}
                  value={f.secMatchingScenario ?? ""}
                  onChange={(e) => up("secMatchingScenario", e.target.value)}
                  placeholder="Ex: Biblioteca subterrânea iluminada por lamparinas, taverna portuária na neblina…"
                />
              </div>

              <SelectableCards
                label="Tipo de enquadramento"
                subtitle="Como a câmera imaginária captura melhor este personagem."
                presets={SEC_FRAMING_PRESETS}
                customOptions={f.secCustomFramingTypes ?? []}
                selected={f.secFramingTypes ?? []}
                onChangeSelected={(next) => up("secFramingTypes", next)}
                onAddCustomOption={(opt) =>
                  up("secCustomFramingTypes", [...(f.secCustomFramingTypes ?? []), opt])
                }
                enableCustomOptionCard
                customOptionCardDesc="Descrever enquadramento e ângulo personalizados."
                customDescriptionValue={f.secCustomFramingDesc ?? ""}
                onChangeCustomDescription={(val) => up("secCustomFramingDesc", val)}
                customDescriptionLabel="Tipo de enquadramento personalizado"
                customDescriptionPlaceholder="Descreva livremente enquadramentos, ângulos e movimentos de câmera…"
                fieldTestIdPrefix="sec-enquadramento"
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 8 — HISTÓRIA RESUMIDA (FICHA SECUNDÁRIA)                    */}
          {/* ================================================================= */}
          {safeSec === 8 && (
            <div className="space-y-4" data-testid="sec-section-8-historia">
              <div>
                <label htmlFor="sec-origin">Origem</label>
                <textarea
                  id="sec-origin"
                  rows={3}
                  value={f.secOrigin ?? ""}
                  onChange={(e) => up("secOrigin", e.target.value)}
                  placeholder="De onde veio, raízes familiares ou sociais…"
                />
              </div>
              <div>
                <label htmlFor="sec-important-event">Evento importante do passado</label>
                <textarea
                  id="sec-important-event"
                  rows={3}
                  value={f.secImportantEvent ?? ""}
                  onChange={(e) => up("secImportantEvent", e.target.value)}
                  placeholder="O acontecimento que definiu quem ele é antes de encontrar os protagonistas…"
                />
              </div>
              <div>
                <label htmlFor="sec-universe-relation">Relação com o universo da história</label>
                <textarea
                  id="sec-universe-relation"
                  rows={3}
                  value={f.secUniverseRelation ?? ""}
                  onChange={(e) => up("secUniverseRelation", e.target.value)}
                  placeholder="Sua posição nas facções, leis, magia ou política do universo…"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 9 — RELACIONAMENTOS (FICHA SECUNDÁRIA)                      */}
          {/* ================================================================= */}
          {safeSec === 9 && (
            <div className="space-y-5" data-testid="sec-section-9-relacionamentos">
              <div className="rounded-2xl border bg-background/40 p-4 space-y-3">
                <label className="block text-sm font-medium">Com quem mais se conecta</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sec-best-conn-select">
                      Vincular personagem existente (opcional)
                    </label>
                    <select
                      id="sec-best-conn-select"
                      value={f.secBestConnectionCharacterId ?? ""}
                      onChange={(e) => {
                        const cid = e.target.value;
                        const found = otherCharacters.find((x) => x.id === cid);
                        up("secBestConnectionCharacterId", cid);
                        if (found && !f.secBestConnectionText) {
                          up("secBestConnectionText", `${found.name} — `);
                        }
                      }}
                    >
                      <option value="">Selecionar personagem…</option>
                      {otherCharacters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || "Sem nome"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sec-best-conn-text">Descrição da conexão / afinidade</label>
                    <input
                      id="sec-best-conn-text"
                      value={f.secBestConnectionText ?? ""}
                      onChange={(e) => up("secBestConnectionText", e.target.value)}
                      placeholder="Como funciona essa sintonia e lealdade…"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/40 p-4 space-y-3">
                <label className="block text-sm font-medium">Com quem entra em conflito</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sec-conflict-select">
                      Vincular personagem existente (opcional)
                    </label>
                    <select
                      id="sec-conflict-select"
                      value={f.secConflictCharacterId ?? ""}
                      onChange={(e) => {
                        const cid = e.target.value;
                        const found = otherCharacters.find((x) => x.id === cid);
                        up("secConflictCharacterId", cid);
                        if (found && !f.secConflictText) {
                          up("secConflictText", `${found.name} — `);
                        }
                      }}
                    >
                      <option value="">Selecionar personagem…</option>
                      {otherCharacters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || "Sem nome"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sec-conflict-text">Motivo do atrito ou rivalidade</label>
                    <input
                      id="sec-conflict-text"
                      value={f.secConflictText ?? ""}
                      onChange={(e) => up("secConflictText", e.target.value)}
                      placeholder="Por que suas visões de mundo colidem…"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="sec-how-helps">Como ajuda ou atrapalha a história</label>
                <textarea
                  id="sec-how-helps"
                  rows={3}
                  value={f.secHowHelpsStory ?? ""}
                  onChange={(e) => up("secHowHelpsStory", e.target.value)}
                  placeholder="De que maneira suas ações impulsionam ou complicam a jornada central…"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 10 — DETALHES HUMANOS (FICHA SECUNDÁRIA)                    */}
          {/* ================================================================= */}
          {safeSec === 10 && (
            <div className="space-y-5" data-testid="sec-section-10-detalhes">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sec-mania">Mania ou hábito</label>
                  <input
                    id="sec-mania"
                    value={f.secMania ?? ""}
                    onChange={(e) => up("secMania", e.target.value)}
                    placeholder="Ex: Tamborilar os dedos na bainha da espada…"
                  />
                </div>
                <div>
                  <label htmlFor="sec-unique-detail">Pequeno detalhe que o torna único</label>
                  <input
                    id="sec-unique-detail"
                    value={f.secUniqueSmallDetail ?? ""}
                    onChange={(e) => up("secUniqueSmallDetail", e.target.value)}
                    placeholder="Ex: Coleciona folhas secas de cada cidade visitada…"
                  />
                </div>
              </div>

              <TagListEditor
                label="Coisas que gosta"
                items={f.likesList ?? []}
                onChange={(next) => up("likesList", next)}
                placeholder="Adicionar gosto…"
                suggestions={["Chá forte", "Mapas antigos", "Chuva", "Silêncio"]}
              />

              <TagListEditor
                label="Coisas que odeia"
                items={f.dislikesList ?? []}
                onChange={(next) => up("dislikesList", next)}
                placeholder="Adicionar aversão…"
                suggestions={["Traição", "Atrasos", "Formalidades vazias"]}
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 11 — PROMPT BASE DE IA (FICHA SECUNDÁRIA)                   */}
          {/* ================================================================= */}
          {safeSec === 11 && (
            <div className="space-y-4" data-testid="sec-section-11-prompt">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl">
                    Prompt Base de IA (Personagem Secundário)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Gere automaticamente com base nos campos da ficha secundária ou edite
                    livremente.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={buildSecondaryAiPrompt}
                    className="btn text-xs"
                    data-testid="btn-montar-prompt-secundario"
                  >
                    <Wand2 className="h-4 w-4" /> Gerar automaticamente
                  </button>
                  <button
                    type="button"
                    onClick={copySecPrompt}
                    className="btn-ghost text-xs"
                    data-testid="btn-copiar-prompt-secundario"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="h-4 w-4 text-teal" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copiar prompt
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="sec-ai-prompt-textarea">
                  Estrutura do Prompt ([Nome], [idade], [aparência], [estilo de roupa],
                  [personalidade], cinematic realistic portrait, film still, natural lighting,
                  [cenário])
                </label>
                <textarea
                  id="sec-ai-prompt-textarea"
                  rows={5}
                  value={f.secAiPrompt ?? ""}
                  onChange={(e) => up("secAiPrompt", e.target.value)}
                  placeholder="[Nome], [idade], [aparência], [estilo de roupa], [personalidade], cinematic realistic portrait, film still, natural lighting, [cenário]"
                  data-testid="textarea-prompt-secundario"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 12 — IMPORTÂNCIA NARRATIVA (FICHA SECUNDÁRIA)               */}
          {/* ================================================================= */}
          {safeSec === 12 && (
            <div className="space-y-4" data-testid="sec-section-12-importancia">
              <p className="text-xs text-muted-foreground">
                Selecione o nível de relevância deste personagem secundário na estrutura geral da
                obra:
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {IMPORTANCE_LEVELS.map((item) => {
                  const active = (f.secNarrativeImportance ?? 2) === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => up("secNarrativeImportance", item.level)}
                      data-testid={`importance-level-${item.level}`}
                      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-teal bg-teal/15 text-foreground shadow-sm"
                          : "bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span className="text-lg">{item.stars}</span>
                      <span className="mt-1 font-display text-lg font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 13 — EVOLUÇÃO (FICHA SECUNDÁRIA)                            */}
          {/* ================================================================= */}
          {safeSec === 13 && (
            <div className="space-y-4" data-testid="sec-section-13-evolucao">
              <div>
                <label htmlFor="sec-appears-as">Como aparece na história</label>
                <textarea
                  id="sec-appears-as"
                  rows={3}
                  value={f.secAppearsAs ?? ""}
                  onChange={(e) => up("secAppearsAs", e.target.value)}
                  placeholder="Sua primeira impressão e papel inicial quando surge na trama…"
                />
              </div>
              <div>
                <label htmlFor="sec-learns-changes">O que aprende ou muda</label>
                <textarea
                  id="sec-learns-changes"
                  rows={3}
                  value={f.secWhatLearnsOrChanges ?? ""}
                  onChange={(e) => up("secWhatLearnsOrChanges", e.target.value)}
                  placeholder="Ponto de inflexão ou descoberta ao longo do arco…"
                />
              </div>
              <div>
                <label htmlFor="sec-evol-result">Como termina ou continua no universo</label>
                <textarea
                  id="sec-evol-result"
                  rows={3}
                  value={f.secEvolutionResult ?? ""}
                  onChange={(e) => up("secEvolutionResult", e.target.value)}
                  placeholder="Seu destino final ou gancho para próximos livros da saga…"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SEÇÃO 14 — CURIOSIDADES (FICHA SECUNDÁRIA)                        */}
          {/* ================================================================= */}
          {safeSec === 14 && (
            <div className="space-y-4" data-testid="sec-section-14-curiosidades">
              <div>
                <label htmlFor="sec-curiosity-input">
                  Fatos extras, segredos de bastidores e ideias futuras
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="sec-curiosity-input"
                    value={curiosityDraft}
                    onChange={(e) => setCuriosityDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && curiosityDraft.trim()) {
                        e.preventDefault();
                        const next: CharacterCuriosity = {
                          id: `cur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                          text: curiosityDraft.trim(),
                        };
                        up("curiosities", [...(f.curiosities ?? []), next]);
                        setCuriosityDraft("");
                      }
                    }}
                    placeholder="Adicione um fato extra ou nota criativa sobre o personagem…"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!curiosityDraft.trim()) return;
                      const next: CharacterCuriosity = {
                        id: `cur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                        text: curiosityDraft.trim(),
                      };
                      up("curiosities", [...(f.curiosities ?? []), next]);
                      setCuriosityDraft("");
                    }}
                    className="btn shrink-0 text-xs"
                    data-testid="btn-add-sec-curiosity"
                  >
                    <Plus className="h-4 w-4" /> Adicionar
                  </button>
                </div>
              </div>

              {(f.curiosities ?? []).length > 0 && (
                <ul className="space-y-2">
                  {(f.curiosities ?? []).map((cur, idx) => {
                    const list = f.curiosities ?? [];
                    const isEditing = editingCuriosityId === cur.id;
                    return (
                      <li
                        key={cur.id}
                        className="flex items-center justify-between gap-2 rounded-xl border bg-background/50 p-3"
                      >
                        {isEditing ? (
                          <div className="flex flex-1 gap-2">
                            <input
                              aria-label="Editar texto da curiosidade"
                              value={editingCuriosityText}
                              onChange={(e) => setEditingCuriosityText(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingCuriosityText.trim()) {
                                  up(
                                    "curiosities",
                                    list.map((x) =>
                                      x.id === cur.id
                                        ? {
                                            ...x,
                                            text: editingCuriosityText.trim(),
                                          }
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
                            <strong className="mr-2 font-mono text-xs text-teal">#{idx + 1}</strong>
                            {cur.text}
                          </span>
                        )}

                        <div className="flex shrink-0 items-center gap-1">
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
                            className="rounded p-1 text-muted-foreground hover:text-foreground"
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

          {/* ================================================================= */}
          {/* SEÇÃO 15 — REFERÊNCIAS VISUAIS (FICHA SECUNDÁRIA)                 */}
          {/* ================================================================= */}
          {safeSec === 15 && (
            <div className="space-y-4" data-testid="sec-section-15-referencias">
              <ReferenceGallery
                items={f.visualReferences ?? []}
                onChange={(next) => up("visualReferences", next)}
                defaultCategory="Personagem"
                categories={SECONDARY_VISUAL_REF_CATEGORIES}
                customCategories={f.secCustomRefCategories ?? []}
                onAddCustomCategory={(cat) => {
                  const curr = f.secCustomRefCategories ?? [];
                  if (!curr.includes(cat)) {
                    up("secCustomRefCategories", [...curr, cat]);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
