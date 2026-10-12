import { useSyncExternalStore } from "react";
import type {
  WorldEncyclopediaRecord,
  WorldNarrativeModality,
  WorldRecordCategory,
  WorldOrganization,
  WorldMagicSystem,
  WorldTransformation,
  EncyclopediaCustomQuestion,
} from "@/lib/encyclopedia-types";

export type BookStatus = "Planejamento" | "Rascunho" | "Escrevendo" | "Revisão" | "Concluído";
export const STATUSES: BookStatus[] = [
  "Planejamento",
  "Rascunho",
  "Escrevendo",
  "Revisão",
  "Concluído",
];

export interface Book {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  synopsis: string;
  protagonists: string;
  chapters: number;
  chaptersWritten: number;
  status: BookStatus;
  genre: string;
  palette: [string, string, string];
  cover?: string | undefined;
  editorial: string;
}

export type BookFormatPreset = "14x21" | "16x23" | "A5" | "15.5x22.5" | "17x24" | "Personalizado";
export type BookPaperType = "Pólen" | "Branco" | "Creme" | "Avena" | "Marfim";
export type BookFoilType =
  "Nenhum" | "Dourado" | "Rosé" | "Prateado" | "Holográfico" | "Cobre" | "Vinho Metálico";
export type BookLaminationType = "Fosca" | "Brilho" | "Soft Touch" | "Textura Linho";
export type BookPageEdgeType = "Natural" | "Pintado" | "Metalizado" | "Estampado";
export type BookCornerStyle = "Reto" | "Arredondado" | "Chanfrado";
export type BookTypographyStyle = "Clássica" | "Moderna" | "Romântica" | "Gótica" | "Editorial";
export type BookTitleAlignment = "centro" | "topo" | "base" | "esquerda";

export interface StudioDesign {
  title: string;
  subtitle: string;
  author: string;
  synopsis: string;
  frontImage?: string | undefined;
  backImage?: string | undefined;
  spineImage?: string | undefined;
  format: BookFormatPreset;
  customWidthCm?: number | undefined;
  customHeightCm?: number | undefined;
  pages: number;
  paper: BookPaperType;
  paperWeightGsm?: 75 | 80 | 90 | 115 | undefined;
  hardcover: boolean;
  flaps?: boolean | undefined;
  flapWidthCm?: number | undefined;
  frontFlapText?: string | undefined;
  backFlapText?: string | undefined;
  foil: BookFoilType;
  lamination?: BookLaminationType | undefined;
  ribbon: boolean;
  ribbonColor: string;
  headbandColor?: string | undefined;
  coverColor: string;
  secondaryCoverColor?: string | undefined;
  spineColor?: string | undefined;
  textColor: string;
  spineTextColor?: string | undefined;
  pageEdgeType?: BookPageEdgeType | undefined;
  pageEdgeColor?: string | undefined;
  endpaperColor?: string | undefined;
  cornerStyle?: BookCornerStyle | undefined;
  cornerPieces?: boolean | undefined;
  borderFrameStyle?: "Nenhuma" | "Simples" | "Dupla" | "Ornamental" | " Imperial" | undefined;
  typographyStyle?: BookTypographyStyle | undefined;
  titleAlignment?: BookTitleAlignment | undefined;
  publisherName?: string | undefined;
  collectionName?: string | undefined;
  editionLabel?: string | undefined;
  volumeLabel?: string | undefined;
  backQuote?: string | undefined;
  isbnCode?: string | undefined;
  showBarcode?: boolean | undefined;
  interiorChapterTitle?: string | undefined;
  interiorSampleText?: string | undefined;
  interiorDropCap?: boolean | undefined;
  interiorOrnament?: boolean | undefined;
  autoSpineWidth?: boolean | undefined;
  manualSpineCm?: number | undefined;
}
export interface StudioVersion {
  id: string;
  name: string;
  savedAt: string;
  design: StudioDesign;
}

export type CharacterModelType = "Protagonista" | "Secundário";

export interface CharacterPalette {
  id: string;
  name: string;
  colors: string[]; // códigos hexadecimais ex: ["#FF69B4", "#3A1238"]
}

export interface CharacterAbility {
  id: string;
  name: string;
  howItWorks: string;
  limitations: string;
  fightingStyle: string;
}

export type RelationshipType =
  "Romântico" | "Amizade" | "Familiar" | "Rivalidade" | "Aliança" | "Mentor / Pupilo" | "Outro";

export interface CharacterRelationship {
  id: string;
  targetCharacterId?: string | undefined;
  targetName: string;
  type: RelationshipType;
  howTheyMet: string;
  dynamic: string;
  whatAwakens: string;
  majorConflict: string;
}

export type VisualRefCategory =
  | "Personagens"
  | "Personagem"
  | "Estilo de moda"
  | "Atores e atrizes"
  | "Moda"
  | "Fotografia"
  | "Filmes"
  | "Música"
  | "Outras inspirações"
  | "Aparência física"
  | (string & {});

export const VISUAL_REF_CATEGORIES: string[] = [
  "Personagens",
  "Atores e atrizes",
  "Moda",
  "Fotografia",
  "Filmes",
  "Música",
  "Outras inspirações",
  "Aparência física",
];

export const SECONDARY_VISUAL_REF_CATEGORIES: string[] = ["Personagem", "Estilo de moda"];

export interface VisualReferenceItem {
  id: string;
  imageUrl: string; // pode ser idb://... ou data:...
  title: string;
  category: string;
  notes: string;
  createdAt: string;
}

export interface SecondaryProtagonistLink {
  id: string;
  protagonistId?: string | undefined;
  protagonistName: string;
  relationDescription: string;
}

export interface SecondaryStrikingObject {
  id: string;
  name: string;
  description: string;
  narrativeMeaning: string;
  imageUrl?: string | undefined;
}

export type NarrativeImportanceLevel = 1 | 2 | 3;

export type QuoteCategory = "Frase marcante" | "Frase que representa a personalidade";

export interface CharacterQuote {
  id: string;
  text: string;
  type: QuoteCategory;
  context?: string | undefined;
}

export interface CharacterCuriosity {
  id: string;
  text: string;
}

export type CustomQuestionType =
  | "short_text"
  | "long_text"
  | "number"
  | "date"
  | "boolean"
  | "single_select"
  | "multi_select"
  | "custom_options"
  | "numeric_scale"
  | "star_rating"
  | "color"
  | "item_list"
  | "image"
  | "link"
  | "time";

export interface CustomQuestionDefinition {
  id: string;
  prompt: string;
  type: CustomQuestionType;
  required: boolean;
  options: string[];
  scope: "character" | "global";
  scaleMin?: number | undefined;
  scaleMax?: number | undefined;
}

export type CustomQuestionAnswer =
  string | number | boolean | string[] | { imageUrl: string; caption?: string | undefined } | null;

export interface Character {
  id: string;
  name: string;
  nicknames: string;
  age: string;
  appearance: string;
  personality: string;
  qualities: string;
  flaws: string;
  fears: string;
  likes: string;
  dislikes: string;
  family: string;
  past: string;
  profession: string;
  style: string;
  quotes: string;
  evolution: string;
  photo?: string | undefined;
  bookIds: string[];
  partnerId?: string | undefined;

  // Campos expandidos do Arquivo de Personagem (16 Seções + Perguntas Personalizadas)
  modelType?: CharacterModelType | undefined;

  // Seção 1 — Identidade
  primaryArc?: string | undefined;
  elementOrConcept?: string | undefined;
  elementsMultiple?: string[] | undefined;
  birthDate?: string | undefined;
  nationalityOrOrigin?: string | undefined;
  identityNotes?: string | undefined;

  // Seção 2 — Essência do Personagem
  definingPhrase?: string | undefined;
  archetypes?: string[] | undefined;
  customArchetypes?: string[] | undefined;
  visualEnergies?: string[] | undefined;
  customVisualEnergies?: string[] | undefined;

  // Seção 3 — Personalidade
  mainTraitsList?: string[] | undefined;
  strengthsList?: string[] | undefined;
  weaknessesList?: string[] | undefined;
  fearsList?: string[] | undefined;
  desiresList?: string[] | undefined;
  contradictionOutside?: string | undefined;
  contradictionInside?: string | undefined;

  // Seção 4 — Psicologia
  psychHowThinks?: string | undefined;
  psychUnderPressure?: string | undefined;
  psychShowsAffection?: string | undefined;
  psychNeverAdmits?: string | undefined;
  psychInnerConflict?: string | undefined;

  // Seção 5 — Aparência Visual
  faceDetails?: string | undefined;
  hairDetails?: string | undefined;
  eyesDetails?: string | undefined;
  heightDetails?: string | undefined;
  bodyAndPosture?: string | undefined;
  defaultExpression?: string | undefined;

  // Seção 6 — Estilo Visual & Paletas
  aesthetics?: string[] | undefined;
  customAesthetics?: string[] | undefined;
  palettes?: CharacterPalette[] | undefined;
  mainClothes?: string | undefined;
  accessories?: string | undefined;
  strikingVisualElements?: string | undefined;

  // Seção 7 — Assinatura Cinematográfica
  sceneTypes?: string[] | undefined;
  customSceneTypes?: string[] | undefined;
  customSceneDescription?: string | undefined;
  lightingStyles?: string[] | undefined;
  customLightingStyles?: string[] | undefined;
  customLightingDescription?: string | undefined;
  scenariosList?: string[] | undefined;
  idealCameraShots?: string[] | undefined;
  customCameraShots?: string[] | undefined;
  customCameraDescription?: string | undefined;
  musicOrVibe?: string | undefined;
  cinematicNotes?: string | undefined;

  // Seção 8 — História
  lifeChangingEvent?: string | undefined;
  secret?: string | undefined;
  currentGoal?: string | undefined;
  journeyBefore?: string | undefined;
  journeyAfter?: string | undefined;

  // Seção 9 — Relacionamentos
  romanticHowMet?: string | undefined;
  romanticDynamic?: string | undefined;
  customDynamics?: string[] | undefined;
  romanticAwakens?: string | undefined;
  romanticConflict?: string | undefined;
  relationships?: CharacterRelationship[] | undefined;

  // Seção 10 — Habilidades e Poderes
  abilities?: CharacterAbility[] | undefined;

  // Seção 11 — Detalhes Humanos
  likesList?: string[] | undefined;
  dislikesList?: string[] | undefined;
  hobbiesList?: string[] | undefined;
  favoriteFood?: string | undefined;
  themeSong?: string | undefined;
  smallHabit?: string | undefined;

  // Seção 12 — Prompt Base de IA
  aiBasePrompt?: string | undefined;

  // Seção 13 — Referências Visuais
  visualReferences?: VisualReferenceItem[] | undefined;

  // Seção 14 — Frases Importantes
  quotesList?: CharacterQuote[] | undefined;

  // Seção 15 — Evolução no Universo
  evolutionStarts?: string | undefined;
  evolutionTurningPoint?: string | undefined;
  evolutionEnds?: string | undefined;

  // Seção 16 — Curiosidades
  curiosities?: CharacterCuriosity[] | undefined;

  // Funcionalidade Essencial — Perguntas Personalizadas
  customQuestions?: CustomQuestionDefinition[] | undefined;
  customAnswers?: Record<string, CustomQuestionAnswer> | undefined;

  // ===========================================================================
  // CAMPOS EXCLUSIVOS DO MODELO: ARQUIVO DE PERSONAGEM — SECUNDÁRIO (15 SEÇÕES)
  // ===========================================================================

  // Seção 1 (Secundário) — Identidade
  secStoryFunctions?: string[] | undefined;
  secCustomStoryFunctions?: string[] | undefined;
  secCustomStoryFunctionDesc?: string | undefined;
  secProtagonistLinks?: SecondaryProtagonistLink[] | undefined;

  // Seção 2 (Secundário) — Essência
  secEmotionalRoles?: string[] | undefined;
  secCustomEmotionalRoles?: string[] | undefined;
  secCustomEmotionalRoleDesc?: string | undefined;

  // Seção 3 (Secundário) — Personalidade
  secThreeMainTraits?: string[] | undefined;
  secStrikingQuality?: string | undefined;
  secStrikingFlaw?: string | undefined;
  secWayOfSpeaking?: string[] | undefined;
  secCustomWaysOfSpeaking?: string[] | undefined;
  secCustomWayOfSpeakingDesc?: string | undefined;

  // Seção 4 (Secundário) — Motivação
  secWhatWants?: string | undefined;
  secWhyWants?: string | undefined;
  secFearsLosing?: string | undefined;
  secSecret?: string | undefined;

  // Seção 5 (Secundário) — Aparência
  secApproximateAge?: string | undefined;
  secHair?: string | undefined;
  secEyes?: string | undefined;
  secStrikingFeatures?: string | undefined;
  secCommonExpression?: string | undefined;

  // Seção 6 (Secundário) — Estilo Visual
  secAesthetics?: string[] | undefined;
  secCustomAesthetics?: string[] | undefined;
  secCustomAestheticDesc?: string | undefined;
  secTypicalClothes?: string | undefined;
  secStrikingObjects?: SecondaryStrikingObject[] | undefined;

  // Seção 7 (Secundário) — Assinatura Visual
  secSceneVibes?: string[] | undefined;
  secCustomSceneVibes?: string[] | undefined;
  secCustomSceneVibeDesc?: string | undefined;
  secMatchingScenario?: string | undefined;
  secFramingTypes?: string[] | undefined;
  secCustomFramingTypes?: string[] | undefined;
  secCustomFramingDesc?: string | undefined;

  // Seção 8 (Secundário) — História Resumida
  secOrigin?: string | undefined;
  secImportantEvent?: string | undefined;
  secUniverseRelation?: string | undefined;

  // Seção 9 (Secundário) — Relacionamentos
  secBestConnectionCharacterId?: string | undefined;
  secBestConnectionText?: string | undefined;
  secConflictCharacterId?: string | undefined;
  secConflictText?: string | undefined;
  secHowHelpsStory?: string | undefined;

  // Seção 10 (Secundário) — Detalhes Humanos
  secMania?: string | undefined;
  secUniqueSmallDetail?: string | undefined;

  // Seção 11 (Secundário) — Prompt Base de IA
  secAiPrompt?: string | undefined;

  // Seção 12 (Secundário) — Importância Narrativa
  secNarrativeImportance?: NarrativeImportanceLevel | undefined;

  // Seção 13 (Secundário) — Evolução
  secAppearsAs?: string | undefined;
  secWhatLearnsOrChanges?: string | undefined;
  secEvolutionResult?: string | undefined;

  // Seção 15 (Secundário) — Categorias personalizadas de Referências Visuais
  secCustomRefCategories?: string[] | undefined;
}

export const CHAR_FIELDS: [keyof Character, string, boolean][] = [
  ["nicknames", "Apelidos", false],
  ["age", "Idade", false],
  ["profession", "Profissão", false],
  ["appearance", "Aparência", true],
  ["personality", "Personalidade", true],
  ["qualities", "Qualidades", true],
  ["flaws", "Defeitos", true],
  ["fears", "Medos", true],
  ["likes", "Gostos", true],
  ["dislikes", "Desgostos", true],
  ["family", "Família", true],
  ["past", "Passado", true],
  ["style", "Estilo de roupa", true],
  ["quotes", "Frases marcantes", true],
  ["evolution", "Evolução narrativa", true],
];
export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export type ChapterType = "Capítulo" | "Prólogo" | "Epílogo" | "Interlúdio" | "Personalizado";

export const CHAPTER_TYPES: ChapterType[] = [
  "Capítulo",
  "Prólogo",
  "Epílogo",
  "Interlúdio",
  "Personalizado",
];

export type ChapterStatus =
  | "Não iniciado"
  | "Planejado"
  | "Em escrita"
  | "Escrito"
  | "Em revisão"
  | "Revisado"
  | "Finalizado";

export const CHAPTER_STATUSES: ChapterStatus[] = [
  "Não iniciado",
  "Planejado",
  "Em escrita",
  "Escrito",
  "Em revisão",
  "Revisado",
  "Finalizado",
];

export interface ChapterImportantEvent {
  id: string;
  description: string;
  order: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  displayOrder: number;
  title: string;
  type: ChapterType;
  customType?: string | undefined;
  partOrSection: string;
  summaryHtml: string;
  summaryPlainText: string;
  importantEvents: ChapterImportantEvent[];
  characterIds: string[];
  worldRecordIds: string[];
  organizationIds: string[];
  historicalEventIds: string[];
  artifactNames: string[];
  storyChronologyDate: string;
  narrativeObjective: string;
  mainConflict: string;
  emotionOrAtmosphere: string;
  finalHook: string;
  privateNotes: string;
  status: ChapterStatus;
  createdAt: string;
  updatedAt: string;
}

// ===========================================================================
// MÓDULO DE MOODBOARDS & GALERIAS DE REFERÊNCIAS
// ===========================================================================

export type DefaultMoodboardCategory =
  | "Capas de livros"
  | "Figurinos e moda"
  | "Paletas de cores"
  | "Objetos e acessórios"
  | "Personagens"
  | "Casais"
  | "Cenários e lugares"
  | "Cenas e atmosferas"
  | "Magia e transformações"
  | "Colagens"
  | "Referências diversas"
  | "Personalizada";

export const MOODBOARD_DEFAULT_CATEGORIES: DefaultMoodboardCategory[] = [
  "Capas de livros",
  "Figurinos e moda",
  "Paletas de cores",
  "Objetos e acessórios",
  "Personagens",
  "Casais",
  "Cenários e lugares",
  "Cenas e atmosferas",
  "Magia e transformações",
  "Colagens",
  "Referências diversas",
  "Personalizada",
];

export type MoodboardAspectRatio = "original" | "vertical" | "square" | "horizontal";

export interface MoodboardReferenceItem {
  id: string;
  title: string;
  imageUrl: string; // idb://... ou data:... ou https://...
  caption: string;
  category: string;
  customCategoryName?: string | undefined;
  tags: string[];
  paletteColors: string[];
  sourceOrCredits: string;
  aspectRatio: MoodboardAspectRatio;
  displayOrder: number;
  isFavorite: boolean;
  moodboardIds: string[];
  bookIds: string[];
  characterIds: string[];
  coupleIds: string[]; // formato "charAId::charBId" ou ID de par
  worldRecordIds: string[];
  chapterIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Moodboard {
  id: string;
  name: string;
  description: string;
  category: string;
  customCategoryName?: string | undefined;
  coverImageUrl?: string | undefined;
  paletteColors: string[];
  tags: string[];
  isFavorite: boolean;
  layoutMode: "pinterest" | "grid";
  bookIds: string[];
  characterIds: string[];
  coupleIds: string[];
  worldRecordIds: string[];
  chapterIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ===========================================================================
// MÓDULO DE LINHA DO TEMPO NARRATIVA
// ===========================================================================

export type TimelineEventType =
  | "Marco Histórico"
  | "Trama Principal"
  | "Ponto de Virada"
  | "Batalha & Confronto"
  | "Revelação & Segredo"
  | "Romance & Vínculo"
  | "Magia & Transformação"
  | "Tragédia & Perda"
  | "Decisão Crucial"
  | "Flashback & Memória"
  | "Profecia & Visão"
  | "Personalizado";

export const TIMELINE_EVENT_TYPES: TimelineEventType[] = [
  "Marco Histórico",
  "Trama Principal",
  "Ponto de Virada",
  "Batalha & Confronto",
  "Revelação & Segredo",
  "Romance & Vínculo",
  "Magia & Transformação",
  "Tragédia & Perda",
  "Decisão Crucial",
  "Flashback & Memória",
  "Profecia & Visão",
  "Personalizado",
];

export type TimelineImpactLevel =
  "Crucial / Ponto de Virada" | "Alto Impacto" | "Impacto Moderado" | "Secundário / Contexto";

export const TIMELINE_IMPACT_LEVELS: TimelineImpactLevel[] = [
  "Crucial / Ponto de Virada",
  "Alto Impacto",
  "Impacto Moderado",
  "Secundário / Contexto",
];

export type TimelineNarrativeMoment =
  "Passado Remoto" | "Passado Recente" | "Presente da Narrativa" | "Futuro / Profecia";

export const TIMELINE_NARRATIVE_MOMENTS: TimelineNarrativeMoment[] = [
  "Passado Remoto",
  "Passado Recente",
  "Presente da Narrativa",
  "Futuro / Profecia",
];

export const DEFAULT_TIMELINE_ERAS = [
  "Origens & Era Ancestral",
  "Antes da Queda",
  "Era Imperial",
  "Presente da Saga",
  "Pós-Guerra / Novo Amanhecer",
];

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: TimelineEventType;
  customType?: string | undefined;
  bookId?: string | undefined;
  chapterId?: string | undefined;
  worldRecordId?: string | undefined;
  organizationId?: string | undefined;
  locationName?: string | undefined;
  tags: string[];

  // Informações cronológicas
  storyDate: string;
  eraOrPeriod: string;
  fictionalYear?: number | string | undefined;
  fictionalMonth?: string | undefined;
  fictionalDay?: number | string | undefined;
  chronologicalOrder: number;
  narrativeMoment: TimelineNarrativeMoment;
  impactLevel: TimelineImpactLevel;

  // Participantes & Vínculos
  characterIds: string[];
  affectedCharacterIds?: string[] | undefined;
  coupleId?: string | undefined;
  previousEventId?: string | undefined;
  nextEventId?: string | undefined;

  // Estética e Extras
  coverImageUrl?: string | undefined;
  authorNotes?: string | undefined;
  isCanonical: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================================================================
// MÓDULO MUSIC ROOM (PLAYLISTS & MÚSICAS)
// ===========================================================================

export type MusicStreamingService =
  "spotify" | "youtube_music" | "apple_music" | "deezer" | "other";

export const MUSIC_DEFAULT_CATEGORIES = [
  "Livros",
  "Personagens",
  "Casais",
  "Cenas",
  "Romance",
  "Tristeza e melancolia",
  "Ação e aventura",
  "Fantasia e magia",
  "Espionagem",
  "Concentração para escrever",
  "Trilhas sonoras pessoais",
  "Personalizada",
] as const;

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string | undefined;
  url: string;
  service: MusicStreamingService;
  coverUrl?: string | undefined;
  notes?: string | undefined;
  tags: string[];
  playlistIds: string[]; // Relação N-para-N: uma música pode estar em várias playlists
  bookId?: string | undefined;
  characterId?: string | undefined;
  coupleId?: string | undefined;
  chapterId?: string | undefined;
  sceneDescription?: string | undefined;
  isFavorite: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string | undefined;
  category: string;
  customCategoryName?: string | undefined;
  tags: string[];
  accentColor?: string | undefined;
  isFavorite: boolean;
  bookId?: string | undefined;
  characterId?: string | undefined;
  coupleId?: string | undefined;
  chapterId?: string | undefined;
  personalNotes?: string | undefined;
  trackIds: string[]; // Lista ordenada de IDs de faixas
  createdAt: string;
  updatedAt: string;
}

export interface StreamingServiceConnection {
  service: MusicStreamingService;
  name: string;
  connected: boolean;
  connectedAccountName?: string | undefined;
  connectedAt?: string | undefined;
}

// ===========================================================================
// MÓDULO LABORATÓRIO DE IDEIAS
// ===========================================================================

export const IDEA_DEFAULT_CATEGORIES = [
  "Enredo",
  "Personagens",
  "Casais e relacionamentos",
  "Cenas",
  "Diálogos",
  "Reviravoltas",
  "Mistérios e segredos",
  "Magia e poderes",
  "Worldbuilding",
  "Países e culturas",
  "Organizações e facções",
  "Conflitos",
  "Simbolismos",
  "Estética e referências visuais",
  "Trilha sonora",
  "Marketing literário",
  "Publicação",
  "Ideias aleatórias",
  "Outros",
] as const;

export type IdeaStatus = "centelha" | "desenvolvimento" | "amadurecida" | "integrada" | "arquivada";

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  content?: string | undefined;
  category: string;
  tags: string[];
  status: IdeaStatus;
  isFavorite: boolean;
  accentColor?: string | undefined;
  accentStyle?: "border" | "badge" | "soft_bg" | undefined;
  imageUrl?: string | undefined;
  bookId?: string | undefined;
  characterIds?: string[] | undefined;
  coupleId?: string | undefined;
  chapterId?: string | undefined;
  connectedIdeaIds?: string[] | undefined;
  whatIf?: string | undefined;
  keyConflict?: string | undefined;
  sampleDialogue?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

interface State {
  books: Book[];
  chapters: Chapter[];
  studio: Record<string, { current: StudioDesign; versions: StudioVersion[] }>;
  tasks: Task[];
  characters: Character[];
  authorName: string;
  globalQuestions: CustomQuestionDefinition[];
  worldRecords: WorldEncyclopediaRecord[];
  worldOrganizations: WorldOrganization[];
  worldMagicSystems: WorldMagicSystem[];
  worldTransformations: WorldTransformation[];
  worldGlobalQuestions: EncyclopediaCustomQuestion[];
  moodboards: Moodboard[];
  moodboardItems: MoodboardReferenceItem[];
  moodboardCustomCategories: string[];
  timelineEvents: TimelineEvent[];
  timelineEras: string[];
  musicPlaylists: MusicPlaylist[];
  musicTracks: MusicTrack[];
  musicCustomCategories: string[];
  musicStreamingConnections: Record<MusicStreamingService, boolean>;
  ideas: IdeaItem[];
  ideaCustomCategories: string[];
}

const NAMES = [
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
];
const PALETTES: [string, string, string][] = [
  ["#7a0f2b", "#e8475f", "#f6b26b"],
  ["#0d3b4f", "#2d8a9e", "#a8e6e2"],
  ["#3a2a5c", "#f2d27a", "#fff4d6"],
  ["#14142e", "#6b5ca5", "#d9d4f5"],
  ["#1f4d2e", "#e86fa6", "#f7e1ea"],
  ["#4a2e1f", "#a8703f", "#d8c3a5"],
  ["#06243a", "#1a6f8f", "#5cc8c0"],
  ["#1a0b2e", "#e01e8c", "#2de2d0"],
  ["#2b0a1e", "#a01652", "#d4a5ff"],
  ["#3a1238", "#f08ca0", "#ffd9b0"],
];
const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function seed(): State {
  return {
    authorName: "Autora",
    books: NAMES.map((t, i) => ({
      id: slug(t),
      order: i + 1,
      title: t,
      subtitle: `Livro ${i + 1} — subtítulo a definir (exemplo editável)`,
      synopsis: "",
      protagonists: "",
      chapters: 0,
      chaptersWritten: 0,
      status: "Planejamento",
      genre: "Fantasia romântica (exemplo editável)",
      palette: PALETTES[i]!,
      editorial: "",
    })),
    studio: {},
    chapters: [],
    characters: [],
    globalQuestions: [],
    worldRecords: [],
    worldOrganizations: [],
    worldMagicSystems: [],
    worldTransformations: [],
    worldGlobalQuestions: [],
    moodboards: [],
    moodboardItems: [],
    moodboardCustomCategories: [],
    timelineEvents: [],
    timelineEras: [...DEFAULT_TIMELINE_ERAS],
    musicPlaylists: [],
    musicTracks: [],
    musicCustomCategories: [],
    musicStreamingConnections: {
      spotify: false,
      youtube_music: false,
      apple_music: false,
      deezer: false,
      other: false,
    },
    ideas: [
      {
        id: "idea_1",
        title: "O Papiro das Sombras Proibidas",
        description:
          "Um antigo tratado arquivado sob as ruínas da biblioteca ancestral revela que os juramentos sagrados foram forjados com traição.",
        content:
          "Durante a grande invasão de Névoa, um sacerdote escondeu um pergaminho que contraria tudo o que o império prega sobre a origem dos poderes. O herói encontra o pergaminho por acidente ao pesquisar a genealogia de sua família.",
        category: "Mistérios e segredos",
        tags: ["Segredo Ancestral", "Profecia", "Plot Twist"],
        status: "desenvolvimento",
        isFavorite: true,
        accentColor: "#a01652",
        bookId: "chama",
        whatIf: "E se a fé de toda uma ordem militar for baseada em uma promessa corrompida?",
        keyConflict:
          "Revelar a verdade e desestabilizar o reino, ou proteger a mentira para evitar uma guerra civil?",
        sampleDialogue:
          "— Há verdades, garoto, que queimam muito mais do que qualquer fogo mortal.",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "idea_2",
        title: "Duelo no Salão dos Espelhos Quebrados",
        description:
          "Cena de clímax onde as ilusões de espelho revelam não os reflexos, mas os maiores arrependimentos de cada duelista.",
        content:
          "A cada golpe de espada contra os vidros estilhaçados, fragmentos de memórias passadas ressoam no ambiente, forçando ambos a confrontarem o motivo pelo qual se afastaram há dez anos.",
        category: "Cenas",
        tags: ["Ação", "Duelo", "Clímax Emocional"],
        status: "amadurecida",
        isFavorite: false,
        accentColor: "#2d8a9e",
        bookId: "mare",
        whatIf: "E se você só pudesse derrotar seu rival se perdoasse a si mesmo primeiro?",
        keyConflict: "A espada não atinge a carne sem que o duelista aceite a dor do reflexo.",
        sampleDialogue: "— Olhe para o vidro! Não sou eu que você está tentando destruir!",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "idea_3",
        title: "Sistema de Magia: Ressonância de Lágrimas e Marés",
        description:
          "Magia ligada às emoções humanas profundas e aos ciclos lunares, onde cada lágrima derramada por luto ou devoção cristaliza um minério vivo.",
        content:
          "Os tecelões de maré recolhem esses cristais para alimentar navios voadores e conjurar escudos temporais. Quanto mais genuíno o sentimento, mais puro o cristal.",
        category: "Magia e poderes",
        tags: ["Sistema Mágico", "Cristais", "Worldbuilding"],
        status: "centelha",
        isFavorite: true,
        accentColor: "#6b5ca5",
        bookId: "luz",
        whatIf: "E se os sentimentos não fossem fraqueza, mas a moeda mais valiosa do universo?",
        keyConflict:
          "Guildas gananciosas que forçam pessoas ao sofrimento para colher cristais raros.",
        sampleDialogue: "— A dor deles não é poesia para o seu motor.",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
    ],
    ideaCustomCategories: [],
    tasks: [
      { id: "t1", text: "Preencher a sinopse de Chama (exemplo editável)", done: false },
      { id: "t2", text: "Definir paleta da capa de Maré (exemplo editável)", done: false },
    ],
  };
}

const KEY = "juramentos-studio-v1";
let state: State | null = null;
const serverState = seed();
const listeners = new Set<() => void>();

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? { ...seed(), ...JSON.parse(raw) } : seed();
  } catch {
    state = seed();
  }
  if (!state.timelineEvents) state.timelineEvents = [];
  if (!state.timelineEras || state.timelineEras.length === 0) {
    state.timelineEras = [...DEFAULT_TIMELINE_ERAS];
  }
  if (!state.musicPlaylists) state.musicPlaylists = [];
  if (!state.musicTracks) state.musicTracks = [];
  if (!state.musicCustomCategories) state.musicCustomCategories = [];
  if (!state.musicStreamingConnections) {
    state.musicStreamingConnections = {
      spotify: false,
      youtube_music: false,
      apple_music: false,
      deezer: false,
      other: false,
    };
  }
  if (!state.ideas) state.ideas = [];
  if (!state.ideaCustomCategories) state.ideaCustomCategories = [];
  return state!;
}
function set(fn: (s: State) => State) {
  state = fn(load());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    console.warn("Espaço do localStorage próximo do limite.");
  }
  listeners.forEach((l) => l());
}

export function useStore<T>(sel: (s: State) => T): T {
  return sel(
    useSyncExternalStore(
      (l) => {
        listeners.add(l);
        return () => listeners.delete(l);
      },
      load,
      () => serverState,
    ),
  );
}

export function resolveCharacterModel(c?: Character | null): CharacterModelType {
  if (!c) return "Protagonista";
  if (c.modelType === "Secundário" || c.modelType === "Protagonista") {
    return c.modelType;
  }
  // Inspeção segura para registros antigos sem modelType explícito
  if (
    (c.secStoryFunctions && c.secStoryFunctions.length > 0) ||
    (c.secEmotionalRoles && c.secEmotionalRoles.length > 0) ||
    c.secNarrativeImportance !== undefined
  ) {
    return "Secundário";
  }
  return "Protagonista";
}

export const actions = {
  newCharacter: (modelType: CharacterModelType = "Protagonista"): Character =>
    ({
      id: `p${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      nicknames: "",
      age: "",
      appearance: "",
      personality: "",
      qualities: "",
      flaws: "",
      fears: "",
      likes: "",
      dislikes: "",
      family: "",
      past: "",
      profession: "",
      style: "",
      quotes: "",
      evolution: "",
      bookIds: [],
      modelType,
      primaryArc: modelType === "Protagonista" ? "Arco Principal" : "",
      elementOrConcept: "",
      elementsMultiple: [],
      birthDate: "",
      nationalityOrOrigin: "",
      identityNotes: "",
      definingPhrase: "",
      archetypes: modelType === "Protagonista" ? ["Herói silencioso"] : [],
      customArchetypes: [],
      visualEnergies: modelType === "Protagonista" ? ["Intensa", "Misteriosa"] : [],
      customVisualEnergies: [],
      mainTraitsList: [],
      strengthsList: [],
      weaknessesList: [],
      fearsList: [],
      desiresList: [],
      contradictionOutside: "",
      contradictionInside: "",
      psychHowThinks: "",
      psychUnderPressure: "",
      psychShowsAffection: "",
      psychNeverAdmits: "",
      psychInnerConflict: "",
      faceDetails: "",
      hairDetails: "",
      eyesDetails: "",
      heightDetails: "",
      bodyAndPosture: "",
      defaultExpression: "",
      aesthetics: [],
      customAesthetics: [],
      palettes: [],
      mainClothes: "",
      accessories: "",
      strikingVisualElements: "",
      sceneTypes: [],
      customSceneTypes: [],
      customSceneDescription: "",
      lightingStyles: [],
      customLightingStyles: [],
      customLightingDescription: "",
      scenariosList: [],
      idealCameraShots: [],
      customCameraShots: [],
      customCameraDescription: "",
      musicOrVibe: "",
      cinematicNotes: "",
      lifeChangingEvent: "",
      secret: "",
      currentGoal: "",
      journeyBefore: "",
      journeyAfter: "",
      romanticHowMet: "",
      romanticDynamic: "",
      customDynamics: [],
      romanticAwakens: "",
      romanticConflict: "",
      relationships: [],
      abilities: [],
      likesList: [],
      dislikesList: [],
      hobbiesList: [],
      favoriteFood: "",
      themeSong: "",
      smallHabit: "",
      aiBasePrompt: "",
      visualReferences: [],
      quotesList: [],
      evolutionStarts: "",
      evolutionTurningPoint: "",
      evolutionEnds: "",
      curiosities: [],
      customQuestions: [],
      customAnswers: {},

      // Inicialização dos campos da Ficha Secundária (15 Seções)
      secStoryFunctions: [],
      secCustomStoryFunctions: [],
      secCustomStoryFunctionDesc: "",
      secProtagonistLinks: [],
      secEmotionalRoles: [],
      secCustomEmotionalRoles: [],
      secCustomEmotionalRoleDesc: "",
      secThreeMainTraits: [],
      secStrikingQuality: "",
      secStrikingFlaw: "",
      secWayOfSpeaking: [],
      secCustomWaysOfSpeaking: [],
      secCustomWayOfSpeakingDesc: "",
      secWhatWants: "",
      secWhyWants: "",
      secFearsLosing: "",
      secSecret: "",
      secApproximateAge: "",
      secHair: "",
      secEyes: "",
      secStrikingFeatures: "",
      secCommonExpression: "",
      secAesthetics: [],
      secCustomAesthetics: [],
      secCustomAestheticDesc: "",
      secTypicalClothes: "",
      secStrikingObjects: [],
      secSceneVibes: [],
      secCustomSceneVibes: [],
      secCustomSceneVibeDesc: "",
      secMatchingScenario: "",
      secFramingTypes: [],
      secCustomFramingTypes: [],
      secCustomFramingDesc: "",
      secOrigin: "",
      secImportantEvent: "",
      secUniverseRelation: "",
      secBestConnectionCharacterId: "",
      secBestConnectionText: "",
      secConflictCharacterId: "",
      secConflictText: "",
      secHowHelpsStory: "",
      secMania: "",
      secUniqueSmallDetail: "",
      secAiPrompt: "",
      secNarrativeImportance: 2,
      secAppearsAs: "",
      secWhatLearnsOrChanges: "",
      secEvolutionResult: "",
      secCustomRefCategories: [],
    }) as unknown as Character,
  duplicateCharacter: (sourceId: string): Character | null => {
    const s = load();
    const orig = s.characters.find((c) => c.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Mapeia novos IDs independentes para perguntas exclusivas do personagem e suas respostas
    const nextAnswers: Record<string, CustomQuestionAnswer> = {
      ...(cloned.customAnswers ?? {}),
    };
    const nextQuestions = (cloned.customQuestions ?? []).map((q) => {
      if (q.scope === "global") return q;
      const newQId = `q_${suffix()}`;
      if (q.id in nextAnswers) {
        nextAnswers[newQId] = nextAnswers[q.id]!;
        delete nextAnswers[q.id];
      }
      return { ...q, id: newQId };
    });

    const copy: Character = {
      ...cloned,
      id: `p${suffix()}`,
      name: `${orig.name || "Personagem"} (Cópia)`,
      partnerId: undefined, // evita sobrescrever o vínculo recíproco do personagem original
      palettes: (cloned.palettes ?? []).map((p) => ({
        ...p,
        id: `pal_${suffix()}`,
        colors: [...p.colors],
      })),
      secStrikingObjects: (cloned.secStrikingObjects ?? []).map((o) => ({
        ...o,
        id: `obj_${suffix()}`,
      })),
      curiosities: (cloned.curiosities ?? []).map((cur) => ({
        ...cur,
        id: `cur_${suffix()}`,
      })),
      customQuestions: nextQuestions,
      customAnswers: nextAnswers,
    };
    set((st) => ({ ...st, characters: [...st.characters, copy] }));
    return copy;
  },
  saveCharacter: (c: Character) =>
    set((s) => {
      // Sincroniza campos legados de texto para manter compatibilidade com buscas ou visualizações antigas
      const synced: Character = {
        ...c,
        appearance:
          c.appearance ||
          [c.faceDetails, c.hairDetails, c.eyesDetails, c.heightDetails, c.bodyAndPosture]
            .filter(Boolean)
            .join(" · "),
        personality: c.personality || (c.mainTraitsList?.length ? c.mainTraitsList.join(", ") : ""),
        qualities: c.qualities || (c.strengthsList?.length ? c.strengthsList.join(", ") : ""),
        flaws: c.flaws || (c.weaknessesList?.length ? c.weaknessesList.join(", ") : ""),
        fears: c.fears || (c.fearsList?.length ? c.fearsList.join(", ") : ""),
        likes: c.likes || (c.likesList?.length ? c.likesList.join(", ") : ""),
        dislikes: c.dislikes || (c.dislikesList?.length ? c.dislikesList.join(", ") : ""),
        style: c.style || [c.aesthetics?.join(", "), c.mainClothes].filter(Boolean).join(" — "),
        quotes:
          c.quotes ||
          (c.quotesList?.length ? c.quotesList.map((q) => `"${q.text}"`).join(" / ") : ""),
        evolution:
          c.evolution ||
          [c.evolutionStarts, c.evolutionTurningPoint, c.evolutionEnds].filter(Boolean).join(" → "),
      };
      const prev = s.characters.find((x) => x.id === synced.id);
      let list = prev
        ? s.characters.map((x) => (x.id === synced.id ? synced : x))
        : [...s.characters, synced];
      // par romântico é recíproco
      list = list.map((x) => {
        if (x.id === synced.id) return x;
        if (x.id === synced.partnerId) return { ...x, partnerId: synced.id };
        if (x.partnerId === synced.id) return { ...x, partnerId: undefined };
        return x;
      });
      if (synced.partnerId) {
        list = list.map((x) =>
          x.id !== synced.id && x.id !== synced.partnerId && x.partnerId === synced.partnerId
            ? { ...x, partnerId: undefined }
            : x,
        );
      }
      return { ...s, characters: list };
    }),
  deleteCharacter: (id: string) =>
    set((s) => ({
      ...s,
      characters: s.characters
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          partnerId: c.partnerId === id ? undefined : c.partnerId,
          relationships: c.relationships?.filter((r) => r.targetCharacterId !== id),
        })),
      worldRecords: (s.worldRecords ?? []).map((r) => ({
        ...r,
        relatedCharacterIds: (r.relatedCharacterIds ?? []).filter((x) => x !== id),
        historicalEvents: (r.historicalEvents ?? []).map((ev) => ({
          ...ev,
          characterIds: (ev.characterIds ?? []).filter((x) => x !== id),
        })),
      })),
      worldOrganizations: (s.worldOrganizations ?? []).map((org) => ({
        ...org,
        memberCharacterIds: (org.memberCharacterIds ?? []).filter((x) => x !== id),
      })),
      worldMagicSystems: (s.worldMagicSystems ?? []).map((ms) => ({
        ...ms,
        characterIds: (ms.characterIds ?? []).filter((x) => x !== id),
      })),
      worldTransformations: (s.worldTransformations ?? []).map((tr) => ({
        ...tr,
        characterIds: (tr.characterIds ?? []).filter((x) => x !== id),
      })),
      chapters: (s.chapters ?? []).map((ch) => ({
        ...ch,
        characterIds: (ch.characterIds ?? []).filter((x) => x !== id),
      })),
      moodboards: (s.moodboards ?? []).map((mb) => ({
        ...mb,
        characterIds: (mb.characterIds ?? []).filter((x) => x !== id),
        coupleIds: (mb.coupleIds ?? []).filter((cid) => !cid.split("::").includes(id)),
      })),
      moodboardItems: (s.moodboardItems ?? []).map((item) => ({
        ...item,
        characterIds: (item.characterIds ?? []).filter((x) => x !== id),
        coupleIds: (item.coupleIds ?? []).filter((cid) => !cid.split("::").includes(id)),
      })),
    })),
  saveGlobalQuestion: (q: CustomQuestionDefinition) =>
    set((s) => {
      const exists = (s.globalQuestions ?? []).some((x) => x.id === q.id);
      const list = exists
        ? (s.globalQuestions ?? []).map((x) => (x.id === q.id ? q : x))
        : [...(s.globalQuestions ?? []), q];
      return { ...s, globalQuestions: list };
    }),
  deleteGlobalQuestion: (qid: string) =>
    set((s) => ({
      ...s,
      globalQuestions: (s.globalQuestions ?? []).filter((x) => x.id !== qid),
    })),
  resetStoreForTests: () => {
    state = seed();
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
  setAuthor: (n: string) => set((s) => ({ ...s, authorName: n })),
  saveBook: (b: Book) =>
    set((s) => ({
      ...s,
      books: s.books.some((x) => x.id === b.id)
        ? s.books.map((x) => (x.id === b.id ? b : x))
        : [...s.books, b],
    })),
  deleteBook: (id: string) =>
    set((s) => ({
      ...s,
      books: s.books.filter((b) => b.id !== id),
      chapters: (s.chapters ?? []).filter((ch) => ch.bookId !== id),
      characters: s.characters.map((c) => ({ ...c, bookIds: c.bookIds.filter((x) => x !== id) })),
      moodboards: (s.moodboards ?? []).map((mb) => ({
        ...mb,
        bookIds: (mb.bookIds ?? []).filter((x) => x !== id),
      })),
      moodboardItems: (s.moodboardItems ?? []).map((item) => ({
        ...item,
        bookIds: (item.bookIds ?? []).filter((x) => x !== id),
      })),
    })),
  newBook: (order: number): Book => ({
    id: `livro-${Date.now()}`,
    order,
    title: "Novo livro",
    subtitle: "",
    synopsis: "",
    protagonists: "",
    chapters: 0,
    chaptersWritten: 0,
    status: "Planejamento",
    genre: "",
    palette: ["#3a1238", "#e01e8c", "#5cc8c0"],
    editorial: "",
  }),
  addTask: (text: string) =>
    set((s) => ({ ...s, tasks: [...s.tasks, { id: `t${Date.now()}`, text, done: false }] })),
  toggleTask: (id: string) =>
    set((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
  deleteTask: (id: string) => set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
  saveDesign: (bookId: string, d: StudioDesign) =>
    set((s) => ({
      ...s,
      studio: { ...s.studio, [bookId]: { versions: s.studio[bookId]?.versions ?? [], current: d } },
    })),
  saveVersion: (bookId: string, name: string, d: StudioDesign) =>
    set((s) => {
      const e = s.studio[bookId] ?? { current: d, versions: [] };
      return {
        ...s,
        studio: {
          ...s.studio,
          [bookId]: {
            current: d,
            versions: [
              {
                id: `v${Date.now()}`,
                name,
                savedAt: new Date().toLocaleString("pt-BR"),
                design: d,
              },
              ...e.versions,
            ],
          },
        },
      };
    }),
  deleteVersion: (bookId: string, vid: string) =>
    set((s) => {
      const e = s.studio[bookId];
      if (!e) return s;
      return {
        ...s,
        studio: {
          ...s.studio,
          [bookId]: { ...e, versions: e.versions.filter((v) => v.id !== vid) },
        },
      };
    }),
  duplicateVersion: (bookId: string, vid: string) =>
    set((s) => {
      const e = s.studio[bookId];
      if (!e) return s;
      const target = e.versions.find((v) => v.id === vid);
      if (!target) return s;
      const clonedDesign = structuredClone(target.design);
      const copy: StudioVersion = {
        id: `v${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        name: `${target.name} (Cópia)`,
        savedAt: new Date().toLocaleString("pt-BR"),
        design: clonedDesign,
      };
      return {
        ...s,
        studio: {
          ...s.studio,
          [bookId]: {
            ...e,
            versions: [copy, ...e.versions],
          },
        },
      };
    }),

  // ===========================================================================
  // ENCICLOPÉDIA DE PAÍSES E MUNDOS — AÇÕES E PERSISTÊNCIA
  // ===========================================================================
  newWorldRecord: (
    modality: WorldNarrativeModality = "Fantasia — Medieval a Moderna",
    category: WorldRecordCategory = "País",
    styleInfluences: string[] = [],
  ): WorldEncyclopediaRecord => {
    const nowIso = new Date().toISOString();
    return {
      id: `wrec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      subtitleOrTagline: "",
      category,
      customCategoryName: "",
      modality,
      styleInfluences,
      customStyles: [],
      genre:
        modality === "Fantasia — Medieval a Moderna"
          ? styleInfluences[0] || "Fantasia"
          : styleInfluences[0] || "Distopia / Ficção Científica",
      universeName: "Juramentos do Destino",
      continentFilter: "",
      regionFilter: "",
      status: "Em desenvolvimento",
      isFavorite: false,
      coverImageUrl: undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
      sections: {},
      sectionNotes: {},
      territorialDivisions: [],
      speciesList: [],
      curiosities: [],
      sources: [],
      images: [],
      customImageCategories: [],
      maps: [],
      historicalEvents: [],
      customQuestions: [],
      customAnswers: {},
      removedDefaultQuestionIds: [],
      relatedRecordIds: [],
      relatedCharacterIds: [],
      relatedBookIds: [],
      relatedNarrativeArcs: [],
      relatedOrganizationIds: [],
      relatedMagicSystemIds: [],
      relatedTransformationIds: [],
    };
  },
  saveWorldRecord: (rec: WorldEncyclopediaRecord) =>
    set((s) => {
      const updated: WorldEncyclopediaRecord = {
        ...rec,
        updatedAt: new Date().toISOString(),
        continentFilter: rec.continentFilter || rec.sections.continentName || "",
        regionFilter: rec.regionFilter || rec.sections.subcontinentOrMacroRegion || "",
      };
      const list = s.worldRecords ?? [];
      const exists = list.some((r) => r.id === updated.id);
      return {
        ...s,
        worldRecords: exists
          ? list.map((r) => (r.id === updated.id ? updated : r))
          : [...list, updated],
      };
    }),
  upsertWorldRecord: (rec: WorldEncyclopediaRecord) =>
    set((s) => {
      const updated: WorldEncyclopediaRecord = {
        ...rec,
        updatedAt: new Date().toISOString(),
        continentFilter: rec.continentFilter || rec.sections.continentName || "",
        regionFilter: rec.regionFilter || rec.sections.subcontinentOrMacroRegion || "",
      };
      const list = s.worldRecords ?? [];
      const exists = list.some((r) => r.id === updated.id);
      return {
        ...s,
        worldRecords: exists
          ? list.map((r) => (r.id === updated.id ? updated : r))
          : [...list, updated],
      };
    }),
  toggleFavoriteWorldRecord: (id: string) =>
    set((s) => ({
      ...s,
      worldRecords: (s.worldRecords ?? []).map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
      ),
    })),
  duplicateWorldRecord: (sourceId: string): WorldEncyclopediaRecord | null => {
    const s = load();
    const orig = (s.worldRecords ?? []).find((r) => r.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    const nextAnswers: Record<string, CustomQuestionAnswer> = {
      ...(cloned.customAnswers ?? {}),
    };
    const nextQuestions = (cloned.customQuestions ?? []).map((q) => {
      if (q.scope === "global") return q;
      const newQId = `wq_${suffix()}`;
      if (q.id in nextAnswers) {
        nextAnswers[newQId] = nextAnswers[q.id]!;
        delete nextAnswers[q.id];
      }
      return { ...q, id: newQId };
    });

    const newRecId = `wrec_${suffix()}`;
    const copy: WorldEncyclopediaRecord = {
      ...cloned,
      id: newRecId,
      name: `${orig.name || "Registro"} (Cópia)`,
      createdAt: nowIso,
      updatedAt: nowIso,
      curiosities: (cloned.curiosities ?? []).map((c) => ({
        ...c,
        id: `wcur_${suffix()}`,
      })),
      sources: (cloned.sources ?? []).map((src) => ({
        ...src,
        id: `wsrc_${suffix()}`,
      })),
      images: (cloned.images ?? []).map((img) => ({
        ...img,
        id: `wimg_${suffix()}`,
      })),
      maps: (cloned.maps ?? []).map((m) => ({
        ...m,
        id: `wmap_${suffix()}`,
        linkedRecordId: newRecId,
        markers: (m.markers ?? []).map((mk) => ({
          ...mk,
          id: `wmk_${suffix()}`,
        })),
      })),
      historicalEvents: (cloned.historicalEvents ?? []).map((ev) => ({
        ...ev,
        id: `wev_${suffix()}`,
      })),
      territorialDivisions: (cloned.territorialDivisions ?? []).map((td) => ({
        ...td,
        id: `wtd_${suffix()}`,
      })),
      speciesList: (cloned.speciesList ?? []).map((sp) => ({
        ...sp,
        id: `wsp_${suffix()}`,
      })),
      customQuestions: nextQuestions,
      customAnswers: nextAnswers,
    };

    set((st) => ({
      ...st,
      worldRecords: [...(st.worldRecords ?? []), copy],
    }));
    return copy;
  },
  deleteWorldRecord: (id: string) =>
    set((s) => ({
      ...s,
      worldRecords: (s.worldRecords ?? [])
        .filter((r) => r.id !== id)
        .map((r) => ({
          ...r,
          relatedRecordIds: (r.relatedRecordIds ?? []).filter((x) => x !== id),
          sources: (r.sources ?? []).map((src) => ({
            ...src,
            relatedRecordIds: (src.relatedRecordIds ?? []).filter((x) => x !== id),
          })),
          historicalEvents: (r.historicalEvents ?? []).map((ev) => ({
            ...ev,
            worldRecordIds: (ev.worldRecordIds ?? []).filter((x) => x !== id),
          })),
          maps: (r.maps ?? []).map((m) => ({
            ...m,
            linkedRecordId: m.linkedRecordId === id ? undefined : m.linkedRecordId,
            markers: (m.markers ?? []).map((mk) => ({
              ...mk,
              relatedRecordId: mk.relatedRecordId === id ? undefined : mk.relatedRecordId,
            })),
          })),
        })),
      worldOrganizations: (s.worldOrganizations ?? []).map((org) => ({
        ...org,
        originRecordId: org.originRecordId === id ? undefined : org.originRecordId,
        actingRecordIds: (org.actingRecordIds ?? []).filter((x) => x !== id),
      })),
      worldMagicSystems: (s.worldMagicSystems ?? []).map((ms) => ({
        ...ms,
        affectedRegionIds: (ms.affectedRegionIds ?? []).filter((x) => x !== id),
      })),
      chapters: (s.chapters ?? []).map((ch) => ({
        ...ch,
        worldRecordIds: (ch.worldRecordIds ?? []).filter((x) => x !== id),
      })),
      moodboards: (s.moodboards ?? []).map((mb) => ({
        ...mb,
        worldRecordIds: (mb.worldRecordIds ?? []).filter((x) => x !== id),
      })),
      moodboardItems: (s.moodboardItems ?? []).map((item) => ({
        ...item,
        worldRecordIds: (item.worldRecordIds ?? []).filter((x) => x !== id),
      })),
    })),

  saveWorldGlobalQuestion: (q: EncyclopediaCustomQuestion) =>
    set((s) => {
      const list = s.worldGlobalQuestions ?? [];
      const exists = list.some((x) => x.id === q.id);
      return {
        ...s,
        worldGlobalQuestions: exists ? list.map((x) => (x.id === q.id ? q : x)) : [...list, q],
      };
    }),
  deleteWorldGlobalQuestion: (qid: string) =>
    set((s) => ({
      ...s,
      worldGlobalQuestions: (s.worldGlobalQuestions ?? []).filter((x) => x.id !== qid),
    })),

  // Organizações Independentes
  newWorldOrganization: (): WorldOrganization => {
    const nowIso = new Date().toISOString();
    return {
      id: `worg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      acronym: "",
      category: "Política",
      description: "",
      originRecordId: undefined,
      originName: "",
      actingArea: "",
      actingRecordIds: [],
      objectives: "",
      history: "",
      hierarchicalStructure: "",
      leadership: "",
      memberCharacterIds: [],
      allies: "",
      rivals: "",
      headquarters: "",
      symbolOrLogoUrl: undefined,
      imageUrls: [],
      historicalEventIds: [],
      bookIds: [],
      narrativeArcs: "",
      notes: "",
      customQuestions: [],
      customAnswers: {},
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveWorldOrganization: (org: WorldOrganization) =>
    set((s) => {
      const updated = { ...org, updatedAt: new Date().toISOString() };
      const list = s.worldOrganizations ?? [];
      const exists = list.some((x) => x.id === updated.id);
      return {
        ...s,
        worldOrganizations: exists
          ? list.map((x) => (x.id === updated.id ? updated : x))
          : [...list, updated],
      };
    }),
  deleteWorldOrganization: (id: string) =>
    set((s) => ({
      ...s,
      worldOrganizations: (s.worldOrganizations ?? []).filter((x) => x.id !== id),
      worldRecords: (s.worldRecords ?? []).map((r) => ({
        ...r,
        relatedOrganizationIds: (r.relatedOrganizationIds ?? []).filter((x) => x !== id),
        historicalEvents: (r.historicalEvents ?? []).map((ev) => ({
          ...ev,
          organizationIds: (ev.organizationIds ?? []).filter((x) => x !== id),
        })),
      })),
      worldMagicSystems: (s.worldMagicSystems ?? []).map((ms) => ({
        ...ms,
        responsibleInstitutionIds: (ms.responsibleInstitutionIds ?? []).filter((x) => x !== id),
      })),
      chapters: (s.chapters ?? []).map((ch) => ({
        ...ch,
        organizationIds: (ch.organizationIds ?? []).filter((x) => x !== id),
      })),
    })),

  // Sistemas Mágicos Independentes
  newWorldMagicSystem: (): WorldMagicSystem => {
    const nowIso = new Date().toISOString();
    return {
      id: `wmag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      origin: "",
      energySource: "",
      usersDescription: "",
      magicTypes: [],
      rules: "",
      limitations: "",
      costs: "",
      consequences: "",
      relatedLaws: "",
      forbiddenPowers: "",
      responsibleInstitutionIds: [],
      responsibleInstitutionsText: "",
      affectedRegionIds: [],
      affectedRegionsText: "",
      characterIds: [],
      bookIds: [],
      historicalEventIds: [],
      imageUrl: undefined,
      notes: "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveWorldMagicSystem: (ms: WorldMagicSystem) =>
    set((s) => {
      const updated = { ...ms, updatedAt: new Date().toISOString() };
      const list = s.worldMagicSystems ?? [];
      const exists = list.some((x) => x.id === updated.id);
      return {
        ...s,
        worldMagicSystems: exists
          ? list.map((x) => (x.id === updated.id ? updated : x))
          : [...list, updated],
      };
    }),
  duplicateWorldMagicSystem: (sourceId: string): WorldMagicSystem | null => {
    const s = load();
    const orig = (s.worldMagicSystems ?? []).find((x) => x.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const nowIso = new Date().toISOString();
    const copy: WorldMagicSystem = {
      ...cloned,
      id: `wmag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${orig.name || "Sistema Mágico"} (Cópia)`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    set((st) => ({
      ...st,
      worldMagicSystems: [...(st.worldMagicSystems ?? []), copy],
    }));
    return copy;
  },
  deleteWorldMagicSystem: (id: string) =>
    set((s) => ({
      ...s,
      worldMagicSystems: (s.worldMagicSystems ?? []).filter((x) => x.id !== id),
      worldRecords: (s.worldRecords ?? []).map((r) => ({
        ...r,
        relatedMagicSystemIds: (r.relatedMagicSystemIds ?? []).filter((x) => x !== id),
      })),
      worldTransformations: (s.worldTransformations ?? []).map((tr) => ({
        ...tr,
        magicSystemId: tr.magicSystemId === id ? undefined : tr.magicSystemId,
      })),
    })),

  // Transformações Independentes
  newWorldTransformation: (): WorldTransformation => {
    const nowIso = new Date().toISOString();
    return {
      id: `wtr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      magicSystemId: undefined,
      systemOrCategoryName: "",
      activationRequirements: "",
      origin: "",
      description: "",
      appearance: "",
      palettes: [],
      acquiredAbilities: [],
      limitations: "",
      duration: "",
      costsAndConsequences: "",
      characterIds: [],
      imageUrl: undefined,
      bookIds: [],
      narrativeArcs: "",
      specialRules: "",
      notes: "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveWorldTransformation: (tr: WorldTransformation) =>
    set((s) => {
      const updated = { ...tr, updatedAt: new Date().toISOString() };
      const list = s.worldTransformations ?? [];
      const exists = list.some((x) => x.id === updated.id);
      return {
        ...s,
        worldTransformations: exists
          ? list.map((x) => (x.id === updated.id ? updated : x))
          : [...list, updated],
      };
    }),
  duplicateWorldTransformation: (sourceId: string): WorldTransformation | null => {
    const s = load();
    const orig = (s.worldTransformations ?? []).find((x) => x.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const nowIso = new Date().toISOString();
    const copy: WorldTransformation = {
      ...cloned,
      id: `wtr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${orig.name || "Transformação"} (Cópia)`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    set((st) => ({
      ...st,
      worldTransformations: [...(st.worldTransformations ?? []), copy],
    }));
    return copy;
  },
  deleteWorldTransformation: (id: string) =>
    set((s) => ({
      ...s,
      worldTransformations: (s.worldTransformations ?? []).filter((x) => x.id !== id),
      worldRecords: (s.worldRecords ?? []).map((r) => ({
        ...r,
        relatedTransformationIds: (r.relatedTransformationIds ?? []).filter((x) => x !== id),
      })),
    })),

  // ===========================================================================
  // MÓDULO DE CAPÍTULOS E SINOPSES — AÇÕES E PERSISTÊNCIA
  // ===========================================================================
  newChapter: (bookId: string, nextNumber?: number): Chapter => {
    const s = load();
    const bookChapters = (s.chapters ?? []).filter((c) => c.bookId === bookId);
    const maxNum = bookChapters.reduce((m, c) => Math.max(m, c.number || 0), 0);
    const maxOrder = bookChapters.reduce((m, c) => Math.max(m, c.displayOrder || 0), 0);
    const num = nextNumber ?? maxNum + 1;
    const nowIso = new Date().toISOString();
    return {
      id: `chap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bookId,
      number: num,
      displayOrder: maxOrder + 1,
      title: "",
      type: "Capítulo",
      customType: "",
      partOrSection: "",
      summaryHtml: "",
      summaryPlainText: "",
      importantEvents: [],
      characterIds: [],
      worldRecordIds: [],
      organizationIds: [],
      historicalEventIds: [],
      artifactNames: [],
      storyChronologyDate: "",
      narrativeObjective: "",
      mainConflict: "",
      emotionOrAtmosphere: "",
      finalHook: "",
      privateNotes: "",
      status: "Planejado",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveChapter: (chap: Chapter) =>
    set((s) => {
      const updated: Chapter = {
        ...chap,
        updatedAt: new Date().toISOString(),
      };
      const list = s.chapters ?? [];
      const exists = list.some((x) => x.id === updated.id);
      const nextChapters = exists
        ? list.map((x) => (x.id === updated.id ? updated : x))
        : [...list, updated];

      // Sincroniza contadores do livro se aplicável
      const bookChaps = nextChapters.filter((c) => c.bookId === updated.bookId);
      const writtenStatuses: ChapterStatus[] = ["Escrito", "Em revisão", "Revisado", "Finalizado"];
      const writtenCount = bookChaps.filter((c) => writtenStatuses.includes(c.status)).length;

      const nextBooks = s.books.map((b) => {
        if (b.id !== updated.bookId) return b;
        return {
          ...b,
          chapters: Math.max(b.chapters, bookChaps.length),
          chaptersWritten: writtenCount,
        };
      });

      return {
        ...s,
        chapters: nextChapters,
        books: nextBooks,
      };
    }),
  updateChapterStatus: (id: string, status: ChapterStatus) =>
    set((s) => {
      const target = (s.chapters ?? []).find((c) => c.id === id);
      if (!target) return s;
      const nowIso = new Date().toISOString();
      const nextChapters = (s.chapters ?? []).map((c) =>
        c.id === id ? { ...c, status, updatedAt: nowIso } : c,
      );
      const bookChaps = nextChapters.filter((c) => c.bookId === target.bookId);
      const writtenStatuses: ChapterStatus[] = ["Escrito", "Em revisão", "Revisado", "Finalizado"];
      const writtenCount = bookChaps.filter((c) => writtenStatuses.includes(c.status)).length;
      const nextBooks = s.books.map((b) =>
        b.id === target.bookId
          ? {
              ...b,
              chapters: Math.max(b.chapters, bookChaps.length),
              chaptersWritten: writtenCount,
            }
          : b,
      );
      return { ...s, chapters: nextChapters, books: nextBooks };
    }),
  duplicateChapter: (sourceId: string): Chapter | null => {
    const s = load();
    const orig = (s.chapters ?? []).find((c) => c.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const bookChapters = (s.chapters ?? []).filter((c) => c.bookId === orig.bookId);
    const maxOrder = bookChapters.reduce((m, c) => Math.max(m, c.displayOrder || 0), 0);
    const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();
    const copy: Chapter = {
      ...cloned,
      id: `chap_${suffix()}`,
      title: `${orig.title || "Capítulo"} (Cópia)`,
      displayOrder: maxOrder + 1,
      importantEvents: (cloned.importantEvents ?? []).map((ev, idx) => ({
        ...ev,
        id: `cev_${suffix()}_${idx}`,
      })),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    set((st) => {
      const nextChapters = [...(st.chapters ?? []), copy];
      const bookChaps = nextChapters.filter((c) => c.bookId === copy.bookId);
      const writtenStatuses: ChapterStatus[] = ["Escrito", "Em revisão", "Revisado", "Finalizado"];
      const writtenCount = bookChaps.filter((c) => writtenStatuses.includes(c.status)).length;
      const nextBooks = st.books.map((b) =>
        b.id === copy.bookId
          ? {
              ...b,
              chapters: Math.max(b.chapters, bookChaps.length),
              chaptersWritten: writtenCount,
            }
          : b,
      );
      return { ...st, chapters: nextChapters, books: nextBooks };
    });
    return copy;
  },
  deleteChapter: (id: string) =>
    set((s) => {
      const target = (s.chapters ?? []).find((c) => c.id === id);
      const nextChapters = (s.chapters ?? []).filter((c) => c.id !== id);
      const nextMoodboards = (s.moodboards ?? []).map((mb) => ({
        ...mb,
        chapterIds: (mb.chapterIds ?? []).filter((x) => x !== id),
      }));
      const nextMoodboardItems = (s.moodboardItems ?? []).map((item) => ({
        ...item,
        chapterIds: (item.chapterIds ?? []).filter((x) => x !== id),
      }));
      if (!target)
        return {
          ...s,
          chapters: nextChapters,
          moodboards: nextMoodboards,
          moodboardItems: nextMoodboardItems,
        };
      const bookChaps = nextChapters.filter((c) => c.bookId === target.bookId);
      const writtenStatuses: ChapterStatus[] = ["Escrito", "Em revisão", "Revisado", "Finalizado"];
      const writtenCount = bookChaps.filter((c) => writtenStatuses.includes(c.status)).length;
      const nextBooks = s.books.map((b) =>
        b.id === target.bookId
          ? {
              ...b,
              chapters: bookChaps.length,
              chaptersWritten: writtenCount,
            }
          : b,
      );
      return {
        ...s,
        chapters: nextChapters,
        books: nextBooks,
        moodboards: nextMoodboards,
        moodboardItems: nextMoodboardItems,
      };
    }),
  reorderBookChapters: (bookId: string, orderedIds: string[]) =>
    set((s) => {
      const orderMap = new Map<string, number>();
      orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));
      return {
        ...s,
        chapters: (s.chapters ?? []).map((ch) => {
          if (ch.bookId !== bookId) return ch;
          const nextOrder = orderMap.get(ch.id);
          return nextOrder !== undefined ? { ...ch, displayOrder: nextOrder } : ch;
        }),
      };
    }),

  // ===========================================================================
  // MÓDULO DE MOODBOARDS & GALERIAS DE REFERÊNCIAS — AÇÕES E PERSISTÊNCIA
  // ===========================================================================
  newMoodboard: (category: string = "Referências diversas"): Moodboard => {
    const nowIso = new Date().toISOString();
    return {
      id: `mb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      description: "",
      category,
      customCategoryName: "",
      coverImageUrl: undefined,
      paletteColors: [],
      tags: [],
      isFavorite: false,
      layoutMode: "pinterest",
      bookIds: [],
      characterIds: [],
      coupleIds: [],
      worldRecordIds: [],
      chapterIds: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveMoodboard: (mb: Moodboard) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      const effectiveCategory =
        mb.category === "Personalizada" && mb.customCategoryName?.trim()
          ? mb.customCategoryName.trim()
          : mb.category;
      const updated: Moodboard = {
        ...mb,
        category: effectiveCategory,
        updatedAt: nowIso,
      };
      const list = s.moodboards ?? [];
      const exists = list.some((x) => x.id === updated.id);
      const customCats = new Set(s.moodboardCustomCategories ?? []);
      if (
        effectiveCategory &&
        !MOODBOARD_DEFAULT_CATEGORIES.includes(effectiveCategory as DefaultMoodboardCategory)
      ) {
        customCats.add(effectiveCategory);
      }
      return {
        ...s,
        moodboards: exists
          ? list.map((x) => (x.id === updated.id ? updated : x))
          : [updated, ...list],
        moodboardCustomCategories: Array.from(customCats),
      };
    }),
  duplicateMoodboard: (sourceId: string): Moodboard | null => {
    const s = load();
    const orig = (s.moodboards ?? []).find((x) => x.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();
    const newId = `mb_${suffix()}`;
    const copy: Moodboard = {
      ...cloned,
      id: newId,
      name: `${orig.name || "Moodboard"} (Cópia)`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    set((st) => ({
      ...st,
      moodboards: [copy, ...(st.moodboards ?? [])],
      // Vincula os mesmos itens de referência ao novo moodboard duplicado
      moodboardItems: (st.moodboardItems ?? []).map((item) =>
        (item.moodboardIds ?? []).includes(sourceId)
          ? { ...item, moodboardIds: [...(item.moodboardIds ?? []), newId] }
          : item,
      ),
    }));
    return copy;
  },
  toggleFavoriteMoodboard: (id: string) =>
    set((s) => ({
      ...s,
      moodboards: (s.moodboards ?? []).map((x) =>
        x.id === id ? { ...x, isFavorite: !x.isFavorite, updatedAt: new Date().toISOString() } : x,
      ),
    })),
  deleteMoodboard: (id: string, alsoDeleteExclusiveItems = false) =>
    set((s) => {
      const nextMoodboards = (s.moodboards ?? []).filter((x) => x.id !== id);
      const nextItems = (s.moodboardItems ?? [])
        .filter((item) => {
          if (!alsoDeleteExclusiveItems) return true;
          const mbs = item.moodboardIds ?? [];
          return !(mbs.length === 1 && mbs[0] === id);
        })
        .map((item) => ({
          ...item,
          moodboardIds: (item.moodboardIds ?? []).filter((mid) => mid !== id),
        }));
      return {
        ...s,
        moodboards: nextMoodboards,
        moodboardItems: nextItems,
      };
    }),
  newMoodboardItem: (
    category: string = "Referências diversas",
    moodboardId?: string,
  ): MoodboardReferenceItem => {
    const s = load();
    const maxOrder = (s.moodboardItems ?? []).reduce(
      (m, it) => Math.max(m, it.displayOrder || 0),
      0,
    );
    const nowIso = new Date().toISOString();
    return {
      id: `mbi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: "",
      imageUrl: "",
      caption: "",
      category,
      customCategoryName: "",
      tags: [],
      paletteColors: [],
      sourceOrCredits: "",
      aspectRatio: "original",
      displayOrder: maxOrder + 1,
      isFavorite: false,
      moodboardIds: moodboardId ? [moodboardId] : [],
      bookIds: [],
      characterIds: [],
      coupleIds: [],
      worldRecordIds: [],
      chapterIds: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveMoodboardItem: (item: MoodboardReferenceItem) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      const effectiveCategory =
        item.category === "Personalizada" && item.customCategoryName?.trim()
          ? item.customCategoryName.trim()
          : item.category;
      const updated: MoodboardReferenceItem = {
        ...item,
        category: effectiveCategory,
        updatedAt: nowIso,
      };
      const list = s.moodboardItems ?? [];
      const exists = list.some((x) => x.id === updated.id);
      const customCats = new Set(s.moodboardCustomCategories ?? []);
      if (
        effectiveCategory &&
        !MOODBOARD_DEFAULT_CATEGORIES.includes(effectiveCategory as DefaultMoodboardCategory)
      ) {
        customCats.add(effectiveCategory);
      }
      // Atualiza updatedAt e capa automática (se vazia) nos moodboards vinculados
      const linkedMbSet = new Set(updated.moodboardIds ?? []);
      const nextMoodboards = (s.moodboards ?? []).map((mb) => {
        if (!linkedMbSet.has(mb.id)) return mb;
        return {
          ...mb,
          coverImageUrl: mb.coverImageUrl || updated.imageUrl || undefined,
          updatedAt: nowIso,
        };
      });
      return {
        ...s,
        moodboardItems: exists
          ? list.map((x) => (x.id === updated.id ? updated : x))
          : [updated, ...list],
        moodboards: nextMoodboards,
        moodboardCustomCategories: Array.from(customCats),
      };
    }),
  toggleFavoriteMoodboardItem: (id: string) =>
    set((s) => ({
      ...s,
      moodboardItems: (s.moodboardItems ?? []).map((x) =>
        x.id === id ? { ...x, isFavorite: !x.isFavorite, updatedAt: new Date().toISOString() } : x,
      ),
    })),
  deleteMoodboardItem: (id: string) =>
    set((s) => ({
      ...s,
      moodboardItems: (s.moodboardItems ?? []).filter((x) => x.id !== id),
    })),
  reorderMoodboardItems: (orderedIds: string[]) =>
    set((s) => {
      const orderMap = new Map<string, number>();
      orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));
      return {
        ...s,
        moodboardItems: (s.moodboardItems ?? []).map((it) => {
          const nextOrder = orderMap.get(it.id);
          return nextOrder !== undefined ? { ...it, displayOrder: nextOrder } : it;
        }),
      };
    }),
  addCustomMoodboardCategory: (name: string) =>
    set((s) => {
      const trimmed = name.trim();
      if (!trimmed) return s;
      const setCats = new Set(s.moodboardCustomCategories ?? []);
      setCats.add(trimmed);
      return {
        ...s,
        moodboardCustomCategories: Array.from(setCats),
      };
    }),
  deleteCustomMoodboardCategory: (name: string) =>
    set((s) => ({
      ...s,
      moodboardCustomCategories: (s.moodboardCustomCategories ?? []).filter((c) => c !== name),
      moodboards: (s.moodboards ?? []).map((mb) =>
        mb.category === name ? { ...mb, category: "Referências diversas" } : mb,
      ),
      moodboardItems: (s.moodboardItems ?? []).map((it) =>
        it.category === name ? { ...it, category: "Referências diversas" } : it,
      ),
    })),
  // ===========================================================================
  // AÇÕES: LINHA DO TEMPO NARRATIVA
  // ===========================================================================
  newTimelineEvent: (defaults?: Partial<TimelineEvent>): TimelineEvent => {
    const s = load();
    const nowIso = new Date().toISOString();
    const maxOrder = (s.timelineEvents ?? []).reduce(
      (m, it) => Math.max(m, it.chronologicalOrder || 0),
      0,
    );
    return {
      id: `tle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: defaults?.title ?? "",
      description: defaults?.description ?? "",
      type: defaults?.type ?? "Trama Principal",
      customType: defaults?.customType ?? "",
      bookId: defaults?.bookId ?? "",
      chapterId: defaults?.chapterId ?? "",
      worldRecordId: defaults?.worldRecordId ?? "",
      organizationId: defaults?.organizationId ?? "",
      locationName: defaults?.locationName ?? "",
      tags: defaults?.tags ?? [],
      storyDate: defaults?.storyDate ?? "",
      eraOrPeriod: defaults?.eraOrPeriod ?? (s.timelineEras?.[0] || "Presente da Saga"),
      fictionalYear: defaults?.fictionalYear ?? "",
      fictionalMonth: defaults?.fictionalMonth ?? "",
      fictionalDay: defaults?.fictionalDay ?? "",
      chronologicalOrder: defaults?.chronologicalOrder ?? maxOrder + 10,
      narrativeMoment: defaults?.narrativeMoment ?? "Presente da Narrativa",
      impactLevel: defaults?.impactLevel ?? "Impacto Moderado",
      characterIds: defaults?.characterIds ?? [],
      affectedCharacterIds: defaults?.affectedCharacterIds ?? [],
      coupleId: defaults?.coupleId ?? "",
      previousEventId: defaults?.previousEventId ?? "",
      nextEventId: defaults?.nextEventId ?? "",
      coverImageUrl: defaults?.coverImageUrl ?? "",
      authorNotes: defaults?.authorNotes ?? "",
      isCanonical: defaults?.isCanonical ?? true,
      isFavorite: defaults?.isFavorite ?? false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  },
  saveTimelineEvent: (event: TimelineEvent) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      const updated: TimelineEvent = {
        ...event,
        updatedAt: nowIso,
      };
      const list = s.timelineEvents ?? [];
      const exists = list.some((x) => x.id === updated.id);
      const erasSet = new Set(s.timelineEras ?? DEFAULT_TIMELINE_ERAS);
      if (updated.eraOrPeriod && updated.eraOrPeriod.trim()) {
        erasSet.add(updated.eraOrPeriod.trim());
      }
      return {
        ...s,
        timelineEvents: exists
          ? list.map((x) => (x.id === updated.id ? updated : x))
          : [updated, ...list],
        timelineEras: Array.from(erasSet),
      };
    }),
  deleteTimelineEvent: (id: string) =>
    set((s) => ({
      ...s,
      timelineEvents: (s.timelineEvents ?? []).filter((x) => x.id !== id),
    })),
  toggleFavoriteTimelineEvent: (id: string) =>
    set((s) => ({
      ...s,
      timelineEvents: (s.timelineEvents ?? []).map((x) =>
        x.id === id ? { ...x, isFavorite: !x.isFavorite, updatedAt: new Date().toISOString() } : x,
      ),
    })),
  duplicateTimelineEvent: (sourceId: string): TimelineEvent | null => {
    const s = load();
    const orig = (s.timelineEvents ?? []).find((x) => x.id === sourceId);
    if (!orig) return null;
    const cloned = structuredClone(orig);
    const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();
    const newId = `tle_${suffix()}`;
    const copy: TimelineEvent = {
      ...cloned,
      id: newId,
      title: `${orig.title || "Evento"} (Cópia)`,
      chronologicalOrder: (orig.chronologicalOrder || 0) + 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    set((st) => ({
      ...st,
      timelineEvents: [copy, ...(st.timelineEvents ?? [])],
    }));
    return copy;
  },
  reorderTimelineEvents: (orderedIds: string[]) =>
    set((s) => {
      const orderMap = new Map<string, number>();
      orderedIds.forEach((id, idx) => orderMap.set(id, (idx + 1) * 10));
      return {
        ...s,
        timelineEvents: (s.timelineEvents ?? []).map((it) => {
          const nextOrder = orderMap.get(it.id);
          return nextOrder !== undefined ? { ...it, chronologicalOrder: nextOrder } : it;
        }),
      };
    }),
  addTimelineEra: (era: string) =>
    set((s) => {
      const trimmed = era.trim();
      if (!trimmed) return s;
      const setEras = new Set(s.timelineEras ?? DEFAULT_TIMELINE_ERAS);
      setEras.add(trimmed);
      return {
        ...s,
        timelineEras: Array.from(setEras),
      };
    }),
  deleteTimelineEra: (era: string) =>
    set((s) => ({
      ...s,
      timelineEras: (s.timelineEras ?? DEFAULT_TIMELINE_ERAS).filter((e) => e !== era),
    })),

  // --- AÇÕES DO MÓDULO MUSIC ROOM ---
  newMusicPlaylist: (defaults?: Partial<MusicPlaylist>): MusicPlaylist => {
    const nowIso = new Date().toISOString();
    return {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: "",
      description: "",
      category: "Livros",
      tags: [],
      isFavorite: false,
      trackIds: [],
      createdAt: nowIso,
      updatedAt: nowIso,
      ...defaults,
    };
  },
  saveMusicPlaylist: (playlist: MusicPlaylist) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      const currentList = s.musicPlaylists ?? [];
      const exists = currentList.some((p) => p.id === playlist.id);
      const updatedItem = { ...playlist, updatedAt: nowIso };
      return {
        ...s,
        musicPlaylists: exists
          ? currentList.map((p) => (p.id === playlist.id ? updatedItem : p))
          : [updatedItem, ...currentList],
      };
    }),
  deleteMusicPlaylist: (id: string) =>
    set((s) => ({
      ...s,
      musicPlaylists: (s.musicPlaylists ?? []).filter((p) => p.id !== id),
      // Remove a playlist das referências de todas as músicas sem apagar as faixas originais
      musicTracks: (s.musicTracks ?? []).map((t) => ({
        ...t,
        playlistIds: (t.playlistIds ?? []).filter((pId) => pId !== id),
      })),
    })),
  duplicateMusicPlaylist: (id: string): MusicPlaylist | null => {
    const st = load();
    const orig = (st.musicPlaylists ?? []).find((p) => p.id === id);
    if (!orig) return null;
    const nowIso = new Date().toISOString();
    const newId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned = structuredClone(orig);
    const copy: MusicPlaylist = {
      ...cloned,
      id: newId,
      name: `${orig.name || "Playlist"} (Cópia)`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    // Vincula também as faixas existentes a essa nova playlist
    const updatedTracks = (st.musicTracks ?? []).map((track) => {
      if (orig.trackIds.includes(track.id)) {
        return {
          ...track,
          playlistIds: Array.from(new Set([...(track.playlistIds ?? []), newId])),
        };
      }
      return track;
    });
    set((prev) => ({
      ...prev,
      musicPlaylists: [copy, ...(prev.musicPlaylists ?? [])],
      musicTracks: updatedTracks,
    }));
    return copy;
  },
  toggleFavoritePlaylist: (id: string) =>
    set((s) => ({
      ...s,
      musicPlaylists: (s.musicPlaylists ?? []).map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite, updatedAt: new Date().toISOString() } : p,
      ),
    })),
  reorderPlaylistTracks: (playlistId: string, newTrackIds: string[]) =>
    set((s) => ({
      ...s,
      musicPlaylists: (s.musicPlaylists ?? []).map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: newTrackIds, updatedAt: new Date().toISOString() }
          : p,
      ),
    })),
  addTrackToPlaylist: (playlistId: string, trackId: string) =>
    set((s) => {
      const playlists = (s.musicPlaylists ?? []).map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return {
            ...p,
            trackIds: [...p.trackIds, trackId],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      const tracks = (s.musicTracks ?? []).map((t) => {
        if (t.id === trackId && !t.playlistIds.includes(playlistId)) {
          return {
            ...t,
            playlistIds: [...t.playlistIds, playlistId],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      return { ...s, musicPlaylists: playlists, musicTracks: tracks };
    }),
  removeTrackFromPlaylist: (playlistId: string, trackId: string) =>
    set((s) => {
      const playlists = (s.musicPlaylists ?? []).map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            trackIds: p.trackIds.filter((id) => id !== trackId),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      const tracks = (s.musicTracks ?? []).map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            playlistIds: t.playlistIds.filter((id) => id !== playlistId),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      return { ...s, musicPlaylists: playlists, musicTracks: tracks };
    }),

  // Gestão de Músicas (Tracks)
  newMusicTrack: (defaults?: Partial<MusicTrack>): MusicTrack => {
    const nowIso = new Date().toISOString();
    return {
      id: `trk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: "",
      artist: "",
      url: "",
      service: "other",
      tags: [],
      playlistIds: [],
      isFavorite: false,
      addedAt: nowIso,
      updatedAt: nowIso,
      ...defaults,
    };
  },
  saveMusicTrack: (track: MusicTrack) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      const currentTracks = s.musicTracks ?? [];
      const exists = currentTracks.some((t) => t.id === track.id);
      const updatedTrack = { ...track, updatedAt: nowIso };
      const newTracksList = exists
        ? currentTracks.map((t) => (t.id === track.id ? updatedTrack : t))
        : [updatedTrack, ...currentTracks];

      // Sincroniza as listas de tracks nas playlists correspondentes
      const currentPlaylists = (s.musicPlaylists ?? []).map((p) => {
        const shouldHave = (track.playlistIds ?? []).includes(p.id);
        const hasIt = p.trackIds.includes(track.id);
        if (shouldHave && !hasIt) {
          return { ...p, trackIds: [...p.trackIds, track.id], updatedAt: nowIso };
        }
        if (!shouldHave && hasIt) {
          return {
            ...p,
            trackIds: p.trackIds.filter((tId) => tId !== track.id),
            updatedAt: nowIso,
          };
        }
        return p;
      });

      return {
        ...s,
        musicTracks: newTracksList,
        musicPlaylists: currentPlaylists,
      };
    }),
  deleteMusicTrack: (id: string) =>
    set((s) => ({
      ...s,
      musicTracks: (s.musicTracks ?? []).filter((t) => t.id !== id),
      musicPlaylists: (s.musicPlaylists ?? []).map((p) => ({
        ...p,
        trackIds: p.trackIds.filter((tId) => tId !== id),
      })),
    })),
  toggleFavoriteTrack: (id: string) =>
    set((s) => ({
      ...s,
      musicTracks: (s.musicTracks ?? []).map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite, updatedAt: new Date().toISOString() } : t,
      ),
    })),

  // Categorias personalizadas de música
  addMusicCustomCategory: (cat: string) =>
    set((s) => {
      const trimmed = cat.trim();
      if (!trimmed) return s;
      const setCats = new Set(s.musicCustomCategories ?? []);
      setCats.add(trimmed);
      return { ...s, musicCustomCategories: Array.from(setCats) };
    }),
  deleteMusicCustomCategory: (cat: string) =>
    set((s) => ({
      ...s,
      musicCustomCategories: (s.musicCustomCategories ?? []).filter((c) => c !== cat),
    })),

  // Conexões de streaming
  setStreamingServiceConnection: (service: MusicStreamingService, connected: boolean) =>
    set((s) => ({
      ...s,
      musicStreamingConnections: {
        ...(s.musicStreamingConnections ?? {
          spotify: false,
          youtube_music: false,
          apple_music: false,
          deezer: false,
          other: false,
        }),
        [service]: connected,
      },
    })),

  // =========================================================================
  // ACTIONS: LABORATÓRIO DE IDEIAS
  // =========================================================================
  upsertIdea: (idea: IdeaItem) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      const current = s.ideas ?? [];
      const exists = current.some((i) => i.id === idea.id);
      const updatedIdea: IdeaItem = {
        ...idea,
        createdAt: exists ? idea.createdAt || nowIso : nowIso,
        updatedAt: nowIso,
      };
      return {
        ...s,
        ideas: exists
          ? current.map((i) => (i.id === idea.id ? updatedIdea : i))
          : [updatedIdea, ...current],
      };
    }),

  deleteIdea: (id: string) =>
    set((s) => ({
      ...s,
      ideas: (s.ideas ?? []).filter((i) => i.id !== id),
    })),

  toggleFavoriteIdea: (id: string) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      return {
        ...s,
        ideas: (s.ideas ?? []).map((i) =>
          i.id === id ? { ...i, isFavorite: !i.isFavorite, updatedAt: nowIso } : i,
        ),
      };
    }),

  updateIdeaStatus: (id: string, status: IdeaStatus) =>
    set((s) => {
      const nowIso = new Date().toISOString();
      return {
        ...s,
        ideas: (s.ideas ?? []).map((i) => (i.id === id ? { ...i, status, updatedAt: nowIso } : i)),
      };
    }),

  duplicateIdea: (id: string) =>
    set((s) => {
      const found = (s.ideas ?? []).find((i) => i.id === id);
      if (!found) return s;
      const nowIso = new Date().toISOString();
      const clone: IdeaItem = {
        ...found,
        id: `idea_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `${found.title} (Cópia)`,
        createdAt: nowIso,
        updatedAt: nowIso,
        isFavorite: false,
      };
      return {
        ...s,
        ideas: [clone, ...(s.ideas ?? [])],
      };
    }),

  addIdeaCustomCategory: (cat: string) =>
    set((s) => {
      const trimmed = cat.trim();
      if (!trimmed) return s;
      const setCats = new Set(s.ideaCustomCategories ?? []);
      setCats.add(trimmed);
      return { ...s, ideaCustomCategories: Array.from(setCats) };
    }),

  deleteIdeaCustomCategory: (cat: string) =>
    set((s) => ({
      ...s,
      ideaCustomCategories: (s.ideaCustomCategories ?? []).filter((c) => c !== cat),
    })),

  resetStoreForTests: () => set(() => seed()),
};

export function defaultDesign(b: Book, author: string): StudioDesign {
  return {
    title: b.title,
    subtitle: b.subtitle,
    author,
    synopsis: b.synopsis,
    frontImage: b.cover,
    format: "14x21",
    customWidthCm: 15,
    customHeightCm: 22,
    pages: 320,
    paper: "Pólen",
    paperWeightGsm: 80,
    hardcover: false,
    flaps: false,
    flapWidthCm: 7.5,
    frontFlapText: "",
    backFlapText: "",
    foil: "Dourado",
    lamination: "Soft Touch",
    ribbon: true,
    ribbonColor: b.palette[1],
    headbandColor: b.palette[2],
    coverColor: b.palette[0],
    secondaryCoverColor: b.palette[1],
    spineColor: b.palette[0],
    textColor: b.palette[2],
    spineTextColor: b.palette[2],
    pageEdgeType: "Natural",
    pageEdgeColor: b.palette[1],
    endpaperColor: b.palette[0],
    cornerStyle: "Reto",
    cornerPieces: false,
    borderFrameStyle: "Dupla",
    typographyStyle: "Editorial",
    titleAlignment: "centro",
    publisherName: "Spectral Editorial",
    collectionName: "Juramentos do Destino",
    editionLabel: "Edição Especial",
    volumeLabel: `Volume ${b.order}`,
    backQuote: "",
    isbnCode: `978-65-8900-${String(b.order).padStart(2, "0")}-4`,
    showBarcode: true,
    interiorChapterTitle: "Capítulo I",
    interiorSampleText: "",
    interiorDropCap: true,
    interiorOrnament: true,
    autoSpineWidth: true,
    manualSpineCm: 2.2,
  };
}
