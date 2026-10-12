import type { CustomQuestionDefinition, CustomQuestionAnswer, CharacterPalette } from "@/lib/store";

export type WorldNarrativeModality =
  "Fantasia — Medieval a Moderna" | "Distopia / Ficção Científica";

export type WorldRecordCategory =
  | "País"
  | "Mundo ou planeta"
  | "Reino"
  | "Império"
  | "Território"
  | "Continente"
  | "Região"
  | "Cidade"
  | "Organização"
  | "Instituição"
  | "Sistema mágico"
  | "Sistema de transformações"
  | (string & {});

export const WORLD_RECORD_CATEGORIES: string[] = [
  "País",
  "Mundo ou planeta",
  "Reino",
  "Império",
  "Território",
  "Continente",
  "Região",
  "Cidade",
  "Organização",
  "Instituição",
  "Sistema mágico",
  "Sistema de transformações",
];

export type WorldRecordStatus =
  "Em desenvolvimento" | "Rascunho" | "Estruturado" | "Completo" | "Arquivado";

export const WORLD_RECORD_STATUSES: WorldRecordStatus[] = [
  "Em desenvolvimento",
  "Rascunho",
  "Estruturado",
  "Completo",
  "Arquivado",
];

export const FANTASY_STYLES: { title: string; desc: string }[] = [
  {
    title: "Fantasia medieval",
    desc: "Castelos, feudos, ordens de cavalaria e reinos ancestrais.",
  },
  {
    title: "Fantasia clássica",
    desc: "Jornadas épicas, profecias, magia primordial e grandes impérios.",
  },
  {
    title: "Fantasia sombria",
    desc: "Atmosfera densa, dilemas morais, maldições e custos severos.",
  },
  {
    title: "Fantasia urbana",
    desc: "Sociedades secretas e magia oculta nas sombras das metrópoles.",
  },
  {
    title: "Fantasia contemporânea",
    desc: "O sobrenatural entrelaçado aos dilemas e culturas do mundo atual.",
  },
  {
    title: "Fantasia moderna",
    desc: "Países modernos, governos atuais e magia coexistindo no cotidiano.",
  },
  {
    title: "Fantasia histórica",
    desc: "Períodos históricos reais reinventados com forças sobrenaturais.",
  },
  {
    title: "Fantasia científica",
    desc: "Fusão entre leis cósmicas, alquimia avançada e rigor quase científico.",
  },
  {
    title: "Fantasia com magia integrada à tecnologia",
    desc: "Engenharia arcana, redes mágicas e infraestrutura movida a energia mística.",
  },
];

export const DYSTOPIA_SCIFI_STYLES: { title: string; desc: string }[] = [
  {
    title: "Distopia política",
    desc: "Regimes totalitários, vigilância estatal, censura e controle ideológico.",
  },
  {
    title: "Distopia tecnológica",
    desc: "Algoritmos soberanos, hipervigilância, IA dominante e perda de privacidade.",
  },
  {
    title: "Distopia ambiental",
    desc: "Colapso climático, escassez de recursos naturais e ecossistemas extremos.",
  },
  {
    title: "Distopia social",
    desc: "Castas rígidas, segregação extrema, engenharia comportamental e desigualdade.",
  },
  {
    title: "Ficção científica futurista",
    desc: "Sociedades avançadas, megacidades, novas físicas e horizontes tecnológicos.",
  },
  {
    title: "Ficção científica espacial",
    desc: "rotas interplanetárias, colônias orbitais, federações e exploração do cosmos.",
  },
  {
    title: "Cyberpunk",
    desc: "Alta tecnologia e baixa qualidade de vida, megacorporações e implantes cibernéticos.",
  },
  {
    title: "Biopunk",
    desc: "Biotecnologia, modificações genéticas, órgãos sintéticos e evolução dirigida.",
  },
  {
    title: "Solarpunk",
    desc: "Energia limpa, simbiose ecológica, arquitetura sustentável e comunalismo.",
  },
  {
    title: "Pós-apocalíptico",
    desc: "Reconstrução, zonas contaminadas, facções sobreviventes e relíquias do velho mundo.",
  },
  {
    title: "Utopia",
    desc: "Sociedade idealizada — ou com tensões filosóficas ocultas sob a perfeição.",
  },
  {
    title: "Ficção científica militar",
    desc: "Frotas estelares, defesa planetária, conflitos estratégicos e armamento avançado.",
  },
  {
    title: "Ficção científica especulativa",
    desc: "Experimentos sociais, realidades alternativas e hipóteses sobre o futuro humano.",
  },
];

export const ENCYCLOPEDIA_IMAGE_CATEGORIES: string[] = [
  "Bandeira",
  "Brasão",
  "Mapa",
  "Paisagem",
  "Capital",
  "Cidade",
  "Arquitetura",
  "Monumento",
  "Fauna",
  "Flora",
  "Cultura",
  "Gastronomia",
  "Moda",
  "Personagem histórico",
  "Tecnologia",
  "Magia",
  "Transformação",
  "Organização",
  "Documento histórico",
  "Referência estética",
];

export interface EncyclopediaImageItem {
  id: string;
  imageUrl: string;
  title: string;
  caption: string;
  description: string;
  category: string;
  notes: string;
  sectionNumber?: number | undefined;
  isCover?: boolean | undefined;
  createdAt: string;
}

export interface EncyclopediaCuriosityItem {
  id: string;
  title: string;
  description: string;
  category?: string | undefined;
  imageUrl?: string | undefined;
  sourceOrReference?: string | undefined;
  isHighlight: boolean;
}

export interface EncyclopediaSourceItem {
  id: string;
  title: string;
  authorOrInstitution: string;
  sourceType: string; // Documento fictício, Nota de criação, Inspiração real, Crônica do universo...
  link: string;
  publicationDate: string;
  consultationDate: string;
  relatedInfo: string;
  reliabilityDegree: string;
  observations: string;
  relatedRecordIds: string[];
}

export type MapModalityType = "real_world" | "fictional_in_real_world" | "fictional_world";

export type MapMarkerType =
  | "Capital"
  | "Cidade"
  | "Região"
  | "Fronteira"
  | "Montanha"
  | "Rio"
  | "Mar / Oceano"
  | "Ilha"
  | "Reino"
  | "Império"
  | "Território"
  | "Local mágico"
  | "Ruína"
  | "Local histórico"
  | "Base / Instalação tecnológica"
  | "Ponto de interesse";

export interface EncyclopediaMapMarker {
  id: string;
  name: string;
  type: MapMarkerType;
  regionName: string;
  coordinatesText: string; // Ex: "45°N, 12°E" ou "Quadrante C-4"
  xPercent: number; // 0 a 100 para posicionamento visual na imagem do mapa
  yPercent: number; // 0 a 100
  description: string;
  relatedRecordId?: string | undefined;
}

export interface EncyclopediaMapItem {
  id: string;
  title: string;
  modality: MapModalityType;
  description: string;
  imageUrl?: string | undefined;
  // Campos para Mundo Real / País Fictício no Mundo Real
  realWorldCountryRef?: string | undefined;
  continent?: string | undefined;
  region?: string | undefined;
  approximateCoordinates?: string | undefined;
  neighboringCountries?: string | undefined;
  landAndSeaBorders?: string | undefined;
  citiesPosition?: string | undefined;
  realGeographyIntegration?: string | undefined;
  annotations?: string | undefined;
  // Vínculo e Marcadores Interativos
  linkedRecordId?: string | undefined;
  markers: EncyclopediaMapMarker[];
  createdAt: string;
}

export interface HistoricalEventItem {
  id: string;
  name: string;
  dateOrPeriod: string;
  fictionalCalendarDate?: string | undefined;
  realCalendarEquivalent?: string | undefined;
  chronologicalOrder: number; // para ordenação mesmo quando a data é aproximada ou indefinida
  isApproximateDate: boolean;
  isUndefinedDate: boolean;
  category: string; // Fundação, Guerra, Tratado, Descoberta, Revolução, Cataclismo, Era...
  location: string;
  description: string;
  causes: string;
  development: string;
  consequences: string;
  politicalImpacts: string;
  economicImpacts: string;
  socialImpacts: string;
  characterIds: string[];
  worldRecordIds: string[];
  organizationIds: string[];
  bookIds: string[];
  narrativeArcs: string;
  sourcesAndDocuments: string;
  imageUrl?: string | undefined;
  notes: string;
}

export type OrganizationCategory =
  | "Política"
  | "Militar"
  | "Diplomática"
  | "Econômica / Megacorporação"
  | "Científica / Tecnológica"
  | "Mágica / Sobrenatural"
  | "Criminosa / Clandestina"
  | "Religiosa / Espiritual"
  | "Cultural / Educacional"
  | "Resistência / Movimento Social"
  | "Outra";

export const ORGANIZATION_CATEGORIES: OrganizationCategory[] = [
  "Política",
  "Militar",
  "Diplomática",
  "Econômica / Megacorporação",
  "Científica / Tecnológica",
  "Mágica / Sobrenatural",
  "Criminosa / Clandestina",
  "Religiosa / Espiritual",
  "Cultural / Educacional",
  "Resistência / Movimento Social",
  "Outra",
];

export interface WorldOrganization {
  id: string;
  name: string;
  acronym: string;
  category: OrganizationCategory;
  description: string;
  originRecordId?: string | undefined;
  originName: string;
  actingArea: string;
  actingRecordIds: string[];
  objectives: string;
  history: string;
  hierarchicalStructure: string;
  leadership: string;
  memberCharacterIds: string[];
  allies: string;
  rivals: string;
  headquarters: string;
  symbolOrLogoUrl?: string | undefined;
  imageUrls: string[];
  historicalEventIds: string[];
  bookIds: string[];
  narrativeArcs: string;
  notes: string;
  customQuestions: CustomQuestionDefinition[];
  customAnswers: Record<string, CustomQuestionAnswer>;
  createdAt: string;
  updatedAt: string;
}

export interface WorldMagicSystem {
  id: string;
  name: string;
  origin: string;
  energySource: string;
  usersDescription: string;
  magicTypes: string[];
  rules: string;
  limitations: string;
  costs: string;
  consequences: string;
  relatedLaws: string;
  forbiddenPowers: string;
  responsibleInstitutionIds: string[];
  responsibleInstitutionsText: string;
  affectedRegionIds: string[];
  affectedRegionsText: string;
  characterIds: string[];
  bookIds: string[];
  historicalEventIds: string[];
  imageUrl?: string | undefined;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldTransformation {
  id: string;
  name: string;
  magicSystemId?: string | undefined;
  systemOrCategoryName: string;
  activationRequirements: string;
  origin: string;
  description: string;
  appearance: string;
  palettes: CharacterPalette[];
  acquiredAbilities: string[];
  limitations: string;
  duration: string;
  costsAndConsequences: string;
  characterIds: string[];
  imageUrl?: string | undefined;
  bookIds: string[];
  narrativeArcs: string;
  specialRules: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntelligentSpeciesItem {
  id: string;
  name: string;
  originAndHabitat: string;
  physicalTraits: string;
  longevityAndBiology: string;
  cultureAndSociety: string;
  abilitiesOrMagic: string;
  relationsWithOtherPeoples: string;
}

export interface TerritorialDivisionItem {
  id: string;
  name: string;
  type: string; // Província, Estado, Ducado, Setor, Distrito, Colônia...
  capitalOrSeat: string;
  autonomousLevel: string;
  description: string;
}

export interface EncyclopediaCustomQuestion extends CustomQuestionDefinition {
  sectionNumber: number;
  favorite?: boolean | undefined;
  isDefaultOverridden?: boolean | undefined;
}

export const ENCYCLOPEDIA_SECTIONS_META = [
  { num: 1, title: "Identificação Geral", group: "Fundação & Geografia" },
  { num: 2, title: "Localização Geográfica", group: "Fundação & Geografia" },
  { num: 3, title: "Divisão Territorial e Administrativa", group: "Fundação & Geografia" },
  { num: 4, title: "Origem e História", group: "História & Poder" },
  { num: 5, title: "Governo e Política", group: "História & Poder" },
  { num: 6, title: "Leis, Justiça e Direitos", group: "História & Poder" },
  { num: 7, title: "População e Demografia", group: "Sociedade & Economia" },
  { num: 8, title: "Economia e Desenvolvimento", group: "Sociedade & Economia" },
  { num: 9, title: "Educação e Conhecimento", group: "Sociedade & Economia" },
  { num: 10, title: "Clima e Meteorologia", group: "Natureza & Território" },
  { num: 11, title: "Biomas e Biodiversidade", group: "Natureza & Território" },
  { num: 12, title: "Cidades, Arquitetura e Urbanismo", group: "Infraestrutura & Vida Urbana" },
  { num: 13, title: "Transportes e Infraestrutura", group: "Infraestrutura & Vida Urbana" },
  { num: 14, title: "Cultura e Identidade Nacional", group: "Cultura & Cotidiano" },
  { num: 15, title: "Gastronomia e Alimentação", group: "Cultura & Cotidiano" },
  { num: 16, title: "Vestuário, Moda e Aparência", group: "Cultura & Cotidiano" },
  { num: 17, title: "Religião, Crenças e Espiritualidade", group: "Cultura & Cotidiano" },
  { num: 18, title: "Artes, Entretenimento e Mídia", group: "Cultura & Cotidiano" },
  { num: 19, title: "Esportes e Competições", group: "Cultura & Cotidiano" },
  { num: 20, title: "Saúde e Qualidade de Vida", group: "Estado, Ciência & Geopolítica" },
  { num: 21, title: "Defesa e Segurança Nacional", group: "Estado, Ciência & Geopolítica" },
  {
    num: 22,
    title: "Relações Internacionais e Diplomacia",
    group: "Estado, Ciência & Geopolítica",
  },
  { num: 23, title: "Ciência, Tecnologia e Inovação", group: "Estado, Ciência & Geopolítica" },
  { num: 24, title: "Patrimônio e Turismo", group: "Projeção & Desafios" },
  { num: 25, title: "Imagem Internacional", group: "Projeção & Desafios" },
  { num: 26, title: "Problemas Sociais e Desafios", group: "Projeção & Desafios" },
  { num: 27, title: "Futuro e Desenvolvimento Nacional", group: "Projeção & Desafios" },
  { num: 28, title: "Curiosidades Nacionais", group: "Acervo & Síntese" },
  { num: 29, title: "Documentação e Fontes", group: "Acervo & Síntese" },
  { num: 30, title: "Mundo, Planeta e Cosmologia", group: "Cosmologia & Sobrenatural" },
  { num: 31, title: "Magia e Leis Sobrenaturais", group: "Cosmologia & Sobrenatural" },
  { num: 32, title: "Povos e Espécies Inteligentes", group: "Cosmologia & Sobrenatural" },
  { num: 33, title: "Resumo Enciclopédico", group: "Acervo & Síntese" },
  { num: 34, title: "Notas de Desenvolvimento", group: "Acervo & Síntese" },
] as const;

/**
 * Campos estruturados detalhados de todas as 34 seções da Ficha Enciclopédica
 */
export interface WorldSectionFields {
  // SEÇÃO 1 — IDENTIFICAÇÃO GERAL
  officialName?: string;
  commonOrShortName?: string;
  historicalOrOldNames?: string;
  nameEtymologyAndMeaning?: string;
  nationalMotto?: string;
  anthemNameAndMeaning?: string;
  flagDescriptionAndSymbolism?: string;
  coatOfArmsAndSymbols?: string;
  patronAnimalFloraElement?: string;
  capitalCity?: string;
  largestOrMostImportantCities?: string;
  demonym?: string; // gentílico
  officialLanguages?: string;
  secondaryAndRegionalLanguages?: string;
  officialCurrency?: string;
  calendarAndTimeSystem?: string;
  timeZones?: string;
  nationalColors?: CharacterPalette[];

  // SEÇÃO 2 — LOCALIZAÇÃO GEOGRÁFICA
  planetOrWorldName?: string;
  continentName?: string;
  subcontinentOrMacroRegion?: string;
  hemisphereAndCoordinates?: string;
  totalArea?: string;
  landBordersAndNeighbors?: string;
  maritimeBordersAndOceans?: string;
  coastlineExtension?: string;
  strategicGeographicPosition?: string;
  extremePointsAndRelief?: string;
  majorMountainRangesAndPeaks?: string;
  hydrographyRiversAndLakes?: string;
  islandsAndArchipelagos?: string;

  // SEÇÃO 3 — DIVISÃO TERRITORIAL E ADMINISTRATIVA
  administrativeOrganizationType?: string; // Federação, Império Descentralizado, Províncias Reais, Setores Corporativos...
  numberOfStatesOrProvinces?: string;
  specialAutonomousRegions?: string;
  disputedOrOccupiedTerritories?: string;
  overseasOrOffworldColonies?: string;
  borderControlAndInternalMobility?: string;

  // SEÇÃO 4 — ORIGEM E HISTÓRIA
  foundationDateOrEra?: string;
  foundingPeoplesAndFigures?: string;
  foundationMythOrHistoricalOrigin?: string;
  majorHistoricalEras?: string;
  warsRevolutionsAndConflicts?: string;
  goldenAgeAndCrisisPeriods?: string;
  recentHistoryAndCurrentContext?: string;
  historicalTraumasAndGlories?: string;

  // SEÇÃO 5 — GOVERNO E POLÍTICA
  governmentSystem?: string; // Monarquia Absoluta, República Parlamentar, Conselho Arcano, Tecnocracia Corporativa...
  headOfStateTitleAndName?: string;
  headOfGovernmentTitleAndName?: string;
  executivePowerStructure?: string;
  legislativePowerOrCouncil?: string;
  successionOrElectionMethod?: string;
  politicalPartiesFactionsOrHouses?: string;
  politicalStabilityAndCorruption?: string;
  stateControlAndSurveillanceLevel?: string; // especialmente relevante em Distopia / Sci-Fi
  oppositionAndResistanceMovements?: string;

  // SEÇÃO 6 — LEIS, JUSTIÇA E DIREITOS
  constitutionOrFundamentalCode?: string;
  judicialSystemAndCourts?: string;
  civilRightsAndLiberties?: string;
  socialHierarchyAndCasteLaws?: string;
  mostSevereCrimesAndPunishments?: string;
  forbiddenPracticesMagicOrTech?: string;
  lawEnforcementAndInquisition?: string;
  citizenshipAndForeignerRights?: string;

  // SEÇÃO 7 — POPULAÇÃO E DEMOGRAFIA
  totalPopulationEstimate?: string;
  demographicDensityAndDistribution?: string;
  urbanVsRuralPopulation?: string;
  ethnicAndSpeciesComposition?: string;
  ageStructureAndLifeExpectancy?: string;
  migrationFlowsAndDiaspora?: string;
  socialClassesAndInequality?: string;

  // SEÇÃO 8 — ECONOMIA E DESENVOLVIMENTO
  economicSystem?: string; // Feudal, Mercantil, Capitalista Moderno, Corporativista Cibernético, Pós-escassez...
  gdpAndWealthLevel?: string;
  mainNaturalAndMagicalResources?: string;
  agricultureAndFoodProduction?: string;
  industryManufacturingAndGuilds?: string;
  tradeServicesAndExports?: string;
  importsAndExternalDependencies?: string;
  energyMatrixAndSources?: string;
  taxationAndStateFinances?: string;
  laborConditionsAndSyndicates?: string;

  // SEÇÃO 9 — EDUCAÇÃO E CONHECIMENTO
  literacyAndAccessLevel?: string;
  schoolAndAcademicStructure?: string;
  prestigiousUniversitiesOrAcademies?: string; // Academias de Magia, Institutos de Cibernética...
  restrictedOrCensoredKnowledge?: string;
  librariesArchivesAndKnowledgePreservation?: string;
  magicalOrTechnicalTraining?: string;

  // SEÇÃO 10 — CLIMA E METEOROLOGIA
  predominantClimateTypes?: string;
  seasonsDurationAndCharacteristics?: string;
  averageTemperaturesAndExtremes?: string;
  rainfallSnowAndWinds?: string;
  naturalOrSupernaturalDisasters?: string; // Tempestades de éter, chuva ácida, invernos de dez anos...
  climateImpactOnDailyLife?: string;

  // SEÇÃO 11 — BIOMAS E BIODIVERSIDADE
  mainBiomesAndEcosystems?: string;
  nativeAndEndemicFlora?: string;
  magicalMedicinalOrMutantPlants?: string;
  nativeFaunaAndPredators?: string;
  magicalCreaturesOrBioengineeredBeasts?: string;
  protectedAreasAndEnvironmentalState?: string;
  symbolicOrSacredBeasts?: string;

  // SEÇÃO 12 — CIDADES, ARQUITETURA E URBANISMO
  architecturalStyleAndMaterials?: string;
  urbanPlanningAndCityLayout?: string;
  lightingSanitationAndUtilities?: string;
  contrastRichAndPoorDistricts?: string;
  fortificationsDomesOrMegastructures?: string;
  iconicCitiesOverview?: string;

  // SEÇÃO 13 — TRANSPORTES E INFRAESTRUTURA
  landTransportAndRoads?: string;
  maritimeAndRiverNavigation?: string;
  airSpaceOrPortalTransport?: string; // Portais arcanos, dirigíveis, trens maglev, naves orbitais...
  communicationsPostAndNetworks?: string;
  supplyChainsAndWaterGrid?: string;

  // SEÇÃO 14 — CULTURA E IDENTIDADE NACIONAL
  coreCulturalValuesAndMentalities?: string;
  socialEtiquetteGreetingsAndTaboos?: string;
  familyStructureAndMarriageCustoms?: string;
  ritesOfPassageBirthToDeath?: string;
  nationalHolidaysAndFestivals?: string;
  folkloreLegendsAndSuperstitions?: string;
  senseOfHumorAndHospitality?: string;

  // SEÇÃO 15 — GASTRONOMIA E ALIMENTAÇÃO
  stapleIngredientsAndCrops?: string;
  traditionalAndNationalDishes?: string;
  typicalAndMagicalBeverages?: string;
  streetFoodVsBanquetCuisine?: string;
  tableMannersAndFoodTaboos?: string;
  foodScarcityOrSyntheticRations?: string;

  // SEÇÃO 16 — VESTUÁRIO, MODA E APARÊNCIA
  everydayClothingAndFabrics?: string;
  nobleFormalOrCeremonialAttire?: string;
  climateOrTechAdaptedGear?: string;
  jewelryAccessoriesAndInsignias?: string;
  hairstylesMakeupMarksAndModifications?: string; // tatuagens rúnicas, implantes estéticos...
  statusMarkersInFashion?: string;

  // SEÇÃO 17 — RELIGIÃO, CRENÇAS E ESPIRITUALIDADE
  predominantReligionsOrCults?: string;
  pantheonDeitiesOrCosmicEntities?: string;
  religiousFreedomVsStateReligion?: string;
  templesClergyAndReligiousOrders?: string;
  sacredTextsPropheciesAndDogmas?: string;
  magicScienceAndFaithRelationship?: string;
  funeraryPracticesAndAfterlifeBeliefs?: string;

  // SEÇÃO 18 — ARTES, ENTRETENIMENTO E MÍDIA
  literaturePoetryAndOralTradition?: string;
  musicInstrumentsAndDances?: string;
  visualArtsPaintingAndSculpture?: string;
  theaterCinemaAndDigitalMedia?: string;
  pressInformationControlAndPropaganda?: string;
  nightlifeAndPopularPastimes?: string;

  // SEÇÃO 19 — ESPORTES E COMPETIÇÕES
  mostPopularSportsAndGames?: string;
  martialTournamentsArenasOrDuels?: string;
  greatCompetitionsAndPrizes?: string;
  socialAndPoliticalRoleOfSports?: string;

  // SEÇÃO 20 — SAÚDE E QUALIDADE DE VIDA
  healthcareSystemAndAccess?: string;
  traditionalMagicalOrBioMedicine?: string;
  commonOrSupernaturalDiseases?: string;
  mentalHealthAndSocialWellbeing?: string;
  longevityEnhancementsOrBionics?: string;
  sanitationAndPublicHygiene?: string;

  // SEÇÃO 21 — DEFESA E SEGURANÇA NACIONAL
  armedForcesBranchesAndStructure?: string;
  militaryPowerWeaponsAndTech?: string;
  magicalWarfareOrSuperSoldiers?: string;
  intelligenceEspionageAndSecretPolice?: string;
  borderDefenseShieldsAndFortresses?: string;
  militaryServiceAndWarriorTradition?: string;

  // SEÇÃO 22 — RELAÇÕES INTERNACIONAIS E DIPLOMACIA
  foreignPolicyStance?: string; // Isolacionista, Imperialista, Neutro, Mediador...
  historicAndCurrentAllies?: string;
  rivalsEnemiesAndColdWars?: string;
  internationalTreatiesAndBlocs?: string;
  commercialAndMagicalAgreements?: string;
  embassiesAndSoftPower?: string;

  // SEÇÃO 23 — CIÊNCIA, TECNOLOGIA E INOVAÇÃO
  overallTechnologicalLevel?: string; // Medieval, Renascentista, Industrial, Moderno, Cyberpunk, Interestelar...
  flagshipTechnologiesAndInventions?: string;
  magicAndTechnologyIntegration?: string;
  aiRoboticsAndCybernetics?: string;
  biotechGeneticsAndCloning?: string;
  spaceExplorationAndTerraforming?: string;
  forbiddenTechAndEthicalDilemmas?: string;

  // SEÇÃO 24 — PATRIMÔNIO E TURISMO
  naturalWondersAndLandmarks?: string;
  historicalMonumentsAndRuins?: string;
  sacredOrMagicalSites?: string;
  museumsAndCulturalHeritage?: string;
  tourismFlowAndVisitorRules?: string;

  // SEÇÃO 25 — IMAGEM INTERNACIONAL
  howOtherNationsPerceiveIt?: string;
  commonStereotypesAndMythsAbroad?: string;
  mainCulturalAndPoliticalInfluence?: string;
  prestigeAndFameInUniverse?: string;

  // SEÇÃO 26 — PROBLEMAS SOCIAIS E DESAFIOS
  internalSocialTensionsAndPrejudices?: string;
  povertyCrimeAndUnderworld?: string;
  politicalOrSuccessionCrises?: string;
  environmentalOrMagicalThreats?: string;
  externalThreatsAndImminentWars?: string;

  // SEÇÃO 27 — FUTURO E DESENVOLVIMENTO NACIONAL
  stateProjectsAndAmbitions?: string;
  propheciesOrFutureProjections?: string;
  upcomingReformsOrRevolutions?: string;
  narrativeRoleInUpcomingBooks?: string;

  // SEÇÃO 28 — CURIOSIDADES NACIONAIS (notas gerais + lista interativa em curiosities)
  curiositiesGeneralNotes?: string;

  // SEÇÃO 29 — DOCUMENTAÇÃO E FONTES (notas gerais + lista interativa em sources)
  documentationGeneralNotes?: string;

  // SEÇÃO 30 — MUNDO, PLANETA E COSMOLOGIA
  cosmologyCreationAndStructure?: string;
  sunsMoonsAndAstronomicalBodies?: string;
  gravityAtmosphereAndDayLength?: string;
  planesOfExistenceAndDimensions?: string;
  cosmicEventsEclipsesAndAlignments?: string;
  planetaryRingOrOrbitalStructures?: string;

  // SEÇÃO 31 — MAGIA E LEIS SOBRENATURAIS
  magicPresenceAndAccessibility?: string;
  fundamentalMagicalLawsAndSource?: string;
  magicalInstitutionsAndRegulation?: string;
  supernaturalPhenomenaAndAnomalies?: string;
  magicImpactOnEconomyAndHierarchy?: string;

  // SEÇÃO 32 — POVOS E ESPÉCIES INTELIGENTES (notas gerais + lista em speciesList)
  peoplesCoexistenceAndConflicts?: string;
  languagesAndCulturalExchange?: string;

  // SEÇÃO 33 — RESUMO ENCICLOPÉDICO
  encyclopedicSummaryText?: string;
  oneLinePitch?: string;

  // SEÇÃO 34 — NOTAS DE DESENVOLVIMENTO
  authorBrainstormingAndIdeas?: string;
  pendingDecisionsAndQuestions?: string;
  inspirationsAndAestheticMood?: string;
  connectionsToPlotAndScenes?: string;
}

export interface WorldEncyclopediaRecord {
  id: string;
  name: string;
  subtitleOrTagline: string;
  category: WorldRecordCategory;
  customCategoryName?: string | undefined;
  modality: WorldNarrativeModality;
  styleInfluences: string[];
  customStyles: string[];
  genre: string;
  universeName: string;
  continentFilter: string;
  regionFilter: string;
  status: WorldRecordStatus;
  isFavorite: boolean;
  coverImageUrl?: string | undefined;
  createdAt: string;
  updatedAt: string;

  // Dados das 34 Seções
  sections: WorldSectionFields;
  sectionNotes: Record<number, string>;
  territorialDivisions: TerritorialDivisionItem[];
  speciesList: IntelligentSpeciesItem[];

  // Recursos Interativos Obrigatórios
  curiosities: EncyclopediaCuriosityItem[];
  sources: EncyclopediaSourceItem[];
  images: EncyclopediaImageItem[];
  customImageCategories: string[];
  maps: EncyclopediaMapItem[];
  historicalEvents: HistoricalEventItem[];

  // Perguntas Editáveis e Personalizadas por seção
  customQuestions: EncyclopediaCustomQuestion[];
  customAnswers: Record<string, CustomQuestionAnswer>;
  removedDefaultQuestionIds: string[];

  // Relações com o restante do Universo (por ID)
  relatedRecordIds: string[]; // outros países, mundos, continentes, regiões, cidades
  relatedCharacterIds: string[]; // protagonistas e secundários
  relatedBookIds: string[];
  relatedNarrativeArcs: string[];
  relatedOrganizationIds: string[];
  relatedMagicSystemIds: string[];
  relatedTransformationIds: string[];
}

/**
 * Calcula o progresso de preenchimento de uma seção (1 a 34):
 * Retorna "filled" | "partial" | "empty"
 */
const SECTION_FIELD_KEYS: Record<number, (keyof WorldSectionFields)[]> = {
  1: [
    "officialName",
    "commonOrShortName",
    "nationalMotto",
    "capitalCity",
    "officialLanguages",
    "officialCurrency",
    "calendarAndTimeSystem",
  ],
  2: [
    "planetOrWorldName",
    "continentName",
    "totalArea",
    "landBordersAndNeighbors",
    "majorMountainRangesAndPeaks",
    "hydrographyRiversAndLakes",
  ],
  3: ["administrativeOrganizationType", "numberOfStatesOrProvinces", "specialAutonomousRegions"],
  4: [
    "foundationDateOrEra",
    "foundingPeoplesAndFigures",
    "foundationMythOrHistoricalOrigin",
    "majorHistoricalEras",
  ],
  5: [
    "governmentSystem",
    "headOfStateTitleAndName",
    "executivePowerStructure",
    "politicalPartiesFactionsOrHouses",
  ],
  6: [
    "constitutionOrFundamentalCode",
    "judicialSystemAndCourts",
    "civilRightsAndLiberties",
    "forbiddenPracticesMagicOrTech",
  ],
  7: [
    "totalPopulationEstimate",
    "urbanVsRuralPopulation",
    "ethnicAndSpeciesComposition",
    "socialClassesAndInequality",
  ],
  8: [
    "economicSystem",
    "mainNaturalAndMagicalResources",
    "tradeServicesAndExports",
    "energyMatrixAndSources",
  ],
  9: ["literacyAndAccessLevel", "prestigiousUniversitiesOrAcademies", "magicalOrTechnicalTraining"],
  10: [
    "predominantClimateTypes",
    "seasonsDurationAndCharacteristics",
    "naturalOrSupernaturalDisasters",
  ],
  11: ["mainBiomesAndEcosystems", "nativeAndEndemicFlora", "magicalCreaturesOrBioengineeredBeasts"],
  12: ["architecturalStyleAndMaterials", "urbanPlanningAndCityLayout", "iconicCitiesOverview"],
  13: ["landTransportAndRoads", "airSpaceOrPortalTransport", "communicationsPostAndNetworks"],
  14: [
    "coreCulturalValuesAndMentalities",
    "nationalHolidaysAndFestivals",
    "folkloreLegendsAndSuperstitions",
  ],
  15: ["stapleIngredientsAndCrops", "traditionalAndNationalDishes", "typicalAndMagicalBeverages"],
  16: [
    "everydayClothingAndFabrics",
    "nobleFormalOrCeremonialAttire",
    "jewelryAccessoriesAndInsignias",
  ],
  17: [
    "predominantReligionsOrCults",
    "pantheonDeitiesOrCosmicEntities",
    "templesClergyAndReligiousOrders",
  ],
  18: [
    "literaturePoetryAndOralTradition",
    "musicInstrumentsAndDances",
    "visualArtsPaintingAndSculpture",
  ],
  19: [
    "mostPopularSportsAndGames",
    "martialTournamentsArenasOrDuels",
    "greatCompetitionsAndPrizes",
  ],
  20: [
    "healthcareSystemAndAccess",
    "traditionalMagicalOrBioMedicine",
    "commonOrSupernaturalDiseases",
  ],
  21: [
    "armedForcesBranchesAndStructure",
    "militaryPowerWeaponsAndTech",
    "intelligenceEspionageAndSecretPolice",
  ],
  22: ["foreignPolicyStance", "historicAndCurrentAllies", "rivalsEnemiesAndColdWars"],
  23: [
    "overallTechnologicalLevel",
    "flagshipTechnologiesAndInventions",
    "magicAndTechnologyIntegration",
  ],
  24: ["naturalWondersAndLandmarks", "historicalMonumentsAndRuins", "sacredOrMagicalSites"],
  25: ["howOtherNationsPerceiveIt", "commonStereotypesAndMythsAbroad", "prestigeAndFameInUniverse"],
  26: [
    "internalSocialTensionsAndPrejudices",
    "politicalOrSuccessionCrises",
    "externalThreatsAndImminentWars",
  ],
  27: [
    "stateProjectsAndAmbitions",
    "propheciesOrFutureProjections",
    "narrativeRoleInUpcomingBooks",
  ],
  28: ["curiositiesGeneralNotes"],
  29: ["documentationGeneralNotes"],
  30: [
    "cosmologyCreationAndStructure",
    "sunsMoonsAndAstronomicalBodies",
    "planesOfExistenceAndDimensions",
  ],
  31: [
    "magicPresenceAndAccessibility",
    "fundamentalMagicalLawsAndSource",
    "magicalInstitutionsAndRegulation",
  ],
  32: ["peoplesCoexistenceAndConflicts", "languagesAndCulturalExchange"],
  33: ["encyclopedicSummaryText", "oneLinePitch"],
  34: ["authorBrainstormingAndIdeas", "pendingDecisionsAndQuestions", "connectionsToPlotAndScenes"],
};

export function getSectionCompletionStatus(
  rec: WorldEncyclopediaRecord,
  secNum: number,
): "filled" | "partial" | "empty" {
  if (secNum === 28) {
    const hasCur = (rec.curiosities?.length ?? 0) > 0;
    const hasNote = Boolean(rec.sections.curiositiesGeneralNotes?.trim());
    if (hasCur && hasNote) return "filled";
    if (hasCur || hasNote) return "partial";
    return "empty";
  }
  if (secNum === 29) {
    const hasSrc = (rec.sources?.length ?? 0) > 0;
    const hasNote = Boolean(rec.sections.documentationGeneralNotes?.trim());
    if (hasSrc && hasNote) return "filled";
    if (hasSrc || hasNote) return "partial";
    return "empty";
  }
  const keys = SECTION_FIELD_KEYS[secNum] ?? [];
  let filledCount = 0;
  for (const k of keys) {
    const v = rec.sections[k];
    if (typeof v === "string" && v.trim().length > 0) {
      filledCount++;
    } else if (Array.isArray(v) && v.length > 0) {
      filledCount++;
    }
  }
  if (secNum === 3 && (rec.territorialDivisions?.length ?? 0) > 0) filledCount++;
  if (secNum === 4 && (rec.historicalEvents?.length ?? 0) > 0) filledCount++;
  if (secNum === 32 && (rec.speciesList?.length ?? 0) > 0) filledCount++;

  // Conta também respostas de perguntas personalizadas nesta seção
  const secQs = (rec.customQuestions ?? []).filter((q) => q.sectionNumber === secNum);
  for (const q of secQs) {
    const ans = rec.customAnswers?.[q.id];
    if (ans !== undefined && ans !== null && ans !== "") {
      filledCount++;
    }
  }

  if (filledCount === 0) return "empty";
  if (filledCount >= Math.max(2, Math.ceil(keys.length * 0.6))) return "filled";
  return "partial";
}

export function calculateOverallProgress(rec: WorldEncyclopediaRecord): {
  filledSections: number;
  partialSections: number;
  emptySections: number;
  percentage: number;
} {
  let filledSections = 0;
  let partialSections = 0;
  let emptySections = 0;
  for (let i = 1; i <= 34; i++) {
    const st = getSectionCompletionStatus(rec, i);
    if (st === "filled") filledSections++;
    else if (st === "partial") partialSections++;
    else emptySections++;
  }
  const percentage = Math.round(((filledSections + partialSections * 0.5) / 34) * 100);
  return { filledSections, partialSections, emptySections, percentage };
}

/**
 * Montador do Resumo Enciclopédico (Seção 33) utilizando APENAS dados efetivamente preenchidos.
 * Adapta a narrativa à categoria do registro (País, Mundo ou planeta, Reino, Cidade, etc.).
 */
export function buildEncyclopedicSummaryFromData(rec: WorldEncyclopediaRecord): string {
  const s = rec.sections;
  const paragraphs: string[] = [];

  const titleName = (s.officialName || rec.name || "").trim();
  const shortName = s.commonOrShortName?.trim();
  const cat =
    rec.category === "Outro tipo personalizado" && rec.customCategoryName?.trim()
      ? rec.customCategoryName.trim()
      : rec.category;

  // Parágrafo 1: Identificação, Modalidade, Localização e Capital
  const introParts: string[] = [];
  if (titleName) {
    const aliasPart =
      shortName && shortName.toLowerCase() !== titleName.toLowerCase()
        ? `, comumente conhecido(a) como ${shortName},`
        : "";
    introParts.push(
      `${titleName}${aliasPart} é um(a) ${cat.toLowerCase()} inserido(a) na modalidade ${rec.modality}`,
    );
  }
  if (rec.styleInfluences && rec.styleInfluences.length > 0) {
    introParts.push(`com influências de ${rec.styleInfluences.join(", ")}`);
  }
  if (rec.universeName?.trim()) {
    introParts.push(`pertencente ao universo ${rec.universeName.trim()}`);
  }

  const firstSentence = introParts.length > 0 ? `${introParts.join(" ")}.` : "";

  const geoSentences: string[] = [];
  const locPieces = [
    s.continentName?.trim() ? `no continente ${s.continentName.trim()}` : "",
    s.subcontinentOrMacroRegion?.trim() ? `região de ${s.subcontinentOrMacroRegion.trim()}` : "",
    s.planetOrWorldName?.trim() ? `em ${s.planetOrWorldName.trim()}` : "",
  ].filter(Boolean);
  if (locPieces.length > 0) {
    geoSentences.push(`Localiza-se ${locPieces.join(", ")}.`);
  }
  if (s.capitalCity?.trim()) {
    geoSentences.push(`Sua capital é ${s.capitalCity.trim()}.`);
  }
  if (s.officialLanguages?.trim()) {
    geoSentences.push(`Idioma(s) oficial(is): ${s.officialLanguages.trim()}.`);
  }
  if (s.officialCurrency?.trim()) {
    geoSentences.push(`Moeda oficial: ${s.officialCurrency.trim()}.`);
  }
  if (s.nationalMotto?.trim()) {
    geoSentences.push(`Seu lema é “${s.nationalMotto.trim()}”.`);
  }

  const p1 = [firstSentence, ...geoSentences].filter(Boolean).join(" ");
  if (p1) paragraphs.push(p1);

  // Parágrafo 2: História, Governo, População e Economia
  const socSentences: string[] = [];
  if (s.foundationDateOrEra?.trim() || s.foundationMythOrHistoricalOrigin?.trim()) {
    const fDate = s.foundationDateOrEra?.trim() ? `em ${s.foundationDateOrEra.trim()}` : "";
    const fOrigin = s.foundationMythOrHistoricalOrigin?.trim()
      ? `: ${s.foundationMythOrHistoricalOrigin.trim()}`
      : ".";
    socSentences.push(`Sua origem remonta ${fDate}${fOrigin}`);
  }
  if (s.governmentSystem?.trim()) {
    const leader = s.headOfStateTitleAndName?.trim()
      ? `, sob a liderança de ${s.headOfStateTitleAndName.trim()}`
      : "";
    socSentences.push(
      `Politicamente, organiza-se sob o regime de ${s.governmentSystem.trim()}${leader}.`,
    );
  }
  if (s.totalPopulationEstimate?.trim()) {
    socSentences.push(`A população estimada é de ${s.totalPopulationEstimate.trim()}.`);
  }
  if (s.economicSystem?.trim() || s.mainNaturalAndMagicalResources?.trim()) {
    const eco = s.economicSystem?.trim()
      ? `Sua economia baseia-se em ${s.economicSystem.trim()}`
      : "Sua estrutura econômica destaca-se";
    const res = s.mainNaturalAndMagicalResources?.trim()
      ? `, tendo como recursos principais ${s.mainNaturalAndMagicalResources.trim()}`
      : "";
    socSentences.push(`${eco}${res}.`);
  }
  if (socSentences.length > 0) paragraphs.push(socSentences.join(" "));

  // Parágrafo 3: Cultura, Clima, Ciência/Tecnologia e Magia/Cosmologia
  const cultSentences: string[] = [];
  if (s.predominantClimateTypes?.trim() || s.mainBiomesAndEcosystems?.trim()) {
    const cli = s.predominantClimateTypes?.trim()
      ? `clima ${s.predominantClimateTypes.trim()}`
      : "";
    const bio = s.mainBiomesAndEcosystems?.trim()
      ? `biomas de ${s.mainBiomesAndEcosystems.trim()}`
      : "";
    cultSentences.push(
      `O território caracteriza-se por ${[cli, bio].filter(Boolean).join(" e ")}.`,
    );
  }
  if (s.coreCulturalValuesAndMentalities?.trim()) {
    cultSentences.push(
      `Culturalmente, destaca-se por ${s.coreCulturalValuesAndMentalities.trim()}.`,
    );
  }
  if (s.overallTechnologicalLevel?.trim()) {
    cultSentences.push(
      `O patamar científico e tecnológico é ${s.overallTechnologicalLevel.trim()}.`,
    );
  }
  if (s.magicPresenceAndAccessibility?.trim() || s.fundamentalMagicalLawsAndSource?.trim()) {
    const mag = [s.magicPresenceAndAccessibility?.trim(), s.fundamentalMagicalLawsAndSource?.trim()]
      .filter(Boolean)
      .join(" — ");
    cultSentences.push(`No âmbito sobrenatural: ${mag}.`);
  }
  if (s.cosmologyCreationAndStructure?.trim()) {
    cultSentences.push(`Cosmologia: ${s.cosmologyCreationAndStructure.trim()}.`);
  }
  if (cultSentences.length > 0) paragraphs.push(cultSentences.join(" "));

  return paragraphs.join("\n\n");
}
