import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleDot,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Wand2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Users,
  Globe2,
} from "lucide-react";
import {
  ENCYCLOPEDIA_SECTIONS_META,
  FANTASY_STYLES,
  DYSTOPIA_SCIFI_STYLES,
  WORLD_RECORD_CATEGORIES,
  WORLD_RECORD_STATUSES,
  getSectionCompletionStatus,
  calculateOverallProgress,
  buildEncyclopedicSummaryFromData,
  type WorldEncyclopediaRecord,
  type WorldSectionFields,
  type WorldNarrativeModality,
  type WorldRecordCategory,
  type WorldRecordStatus,
  type TerritorialDivisionItem,
  type IntelligentSpeciesItem,
  type EncyclopediaSourceItem,
  type WorldOrganization,
  type WorldMagicSystem,
  type WorldTransformation,
} from "@/lib/encyclopedia-types";
import type { Character, Book } from "@/lib/store";
import { PaletteStudio } from "@/components/character/PaletteStudio";
import { SelectableCards, TagListEditor } from "@/components/character/TagListEditor";
import { EncyclopediaQuestionManager } from "@/components/encyclopedia/EncyclopediaQuestionManager";
import { EncyclopediaCuriositiesManager } from "@/components/encyclopedia/EncyclopediaCuriositiesManager";
import { EncyclopediaTimelineManager } from "@/components/encyclopedia/EncyclopediaTimelineManager";
import { EncyclopediaMapStudio } from "@/components/encyclopedia/EncyclopediaMapStudio";
import { EncyclopediaImageGallery } from "@/components/encyclopedia/EncyclopediaImageGallery";
import { EncyclopediaEntitiesHub } from "@/components/encyclopedia/EncyclopediaEntitiesHub";

type FieldSpec = {
  key: keyof WorldSectionFields;
  label: string;
  placeholder: string;
  type?: "short" | "long" | "select";
  options?: string[];
};

const SECTION_FIELDS_CONFIG: Record<number, FieldSpec[]> = {
  1: [
    {
      key: "officialName",
      label: "Nome oficial completo",
      placeholder: "Ex: Reino Unido de Valdoria, Federação Orbital de Hélios…",
    },
    {
      key: "commonOrShortName",
      label: "Nome curto ou usual",
      placeholder: "Ex: Valdoria, Hélios…",
    },
    {
      key: "historicalOrOldNames",
      label: "Nomes antigos ou históricos",
      placeholder: "Denominações em eras anteriores…",
    },
    {
      key: "nameEtymologyAndMeaning",
      label: "Etimologia e significado do nome",
      placeholder: "Origem linguística ou mítica do nome…",
      type: "long",
    },
    {
      key: "nationalMotto",
      label: "Lema oficial / divisa",
      placeholder: "Ex: “Pela Chama e pela Coroa”…",
    },
    {
      key: "anthemNameAndMeaning",
      label: "Hino nacional / cântico e significado",
      placeholder: "Nome do hino e tema central…",
      type: "long",
    },
    {
      key: "flagDescriptionAndSymbolism",
      label: "Descrição da bandeira / estandarte e simbolismo",
      placeholder: "Cores, formas e o que cada elemento representa…",
      type: "long",
    },
    {
      key: "coatOfArmsAndSymbols",
      label: "Brasão de armas, selo ou emblemas oficiais",
      placeholder: "Insígnias reais, corporativas ou planetárias…",
      type: "long",
    },
    {
      key: "patronAnimalFloraElement",
      label: "Animal, planta, astro ou elemento símbolo",
      placeholder: "Ex: Fênix de Bronze, Lírio da Noite, Elemento Chama…",
    },
    {
      key: "capitalCity",
      label: "Capital (se aplicável)",
      placeholder: "Cidade ou estação sede do poder…",
    },
    {
      key: "largestOrMostImportantCities",
      label: "Maiores ou mais importantes cidades / centros",
      placeholder: "Metrópoles, portos e fortalezas principais…",
    },
    {
      key: "demonym",
      label: "Gentílico (como os habitantes são chamados)",
      placeholder: "Ex: Valdoriano(a), Heliano(a)…",
    },
    {
      key: "officialLanguages",
      label: "Idioma(s) oficial(is)",
      placeholder: "Línguas reconhecidas pelo Estado ou população…",
    },
    {
      key: "secondaryAndRegionalLanguages",
      label: "Idiomas secundários, dialetos ou línguas ancestrais",
      placeholder: "Dialetos regionais, língua arcana, código binário…",
    },
    {
      key: "officialCurrency",
      label: "Moeda oficial / sistema de troca",
      placeholder: "Ex: Coroas de Ouro, Créditos Neurais, Dracmas de Prata…",
    },
    {
      key: "calendarAndTimeSystem",
      label: "Calendário adotado e contagem do tempo",
      placeholder: "Ex: Calendário Lunar de 13 meses, Ano Padrão Galáctico…",
    },
    {
      key: "timeZones",
      label: "Fusos horários ou ciclos solares",
      placeholder: "Ex: UTC-3, Ciclo de dois sóis (30h)…",
    },
  ],
  2: [
    {
      key: "planetOrWorldName",
      label: "Mundo ou planeta onde se situa",
      placeholder: "Ex: Aethelgard, Terra Alternativa, Érebo Prime…",
    },
    {
      key: "continentName",
      label: "Continente ou setor planetário",
      placeholder: "Ex: Continente de Solária, Hemisfério Boreal…",
    },
    {
      key: "subcontinentOrMacroRegion",
      label: "Subcontinente ou macrorregião",
      placeholder: "Ex: Península das Cinzas, Cinturão Equatorial…",
    },
    {
      key: "hemisphereAndCoordinates",
      label: "Hemisfério e coordenadas geográficas",
      placeholder: "Latitude, longitude ou posição astral…",
    },
    {
      key: "totalArea",
      label: "Área territorial total (estimada)",
      placeholder: "Ex: 1.450.000 km², 3 continentes…",
    },
    {
      key: "landBordersAndNeighbors",
      label: "Fronteiras terrestres e países/reinos vizinhos",
      placeholder: "Com quem faz divisa ao norte, sul, leste e oeste…",
      type: "long",
    },
    {
      key: "maritimeBordersAndOceans",
      label: "Fronteiras marítimas, mares e oceanos banhados",
      placeholder: "Mares, golfos, estreitos ou rotas oceânicas…",
      type: "long",
    },
    {
      key: "coastlineExtension",
      label: "Extensão do litoral / costa",
      placeholder: "Características das costas, falésias e portos naturais…",
    },
    {
      key: "strategicGeographicPosition",
      label: "Importância geopolítica e estratégica da localização",
      placeholder: "Gargalos comerciais, defesas naturais, rotas de éter…",
      type: "long",
    },
    {
      key: "extremePointsAndRelief",
      label: "Relevo predominante e pontos extremos",
      placeholder: "Planícies, cânions, planaltos, crateras…",
      type: "long",
    },
    {
      key: "majorMountainRangesAndPeaks",
      label: "Cordilheiras, cadeias montanhosas e ponto mais alto",
      placeholder: "Ex: Montes da Aurora (Pico Solis, 6.200m)…",
    },
    {
      key: "hydrographyRiversAndLakes",
      label: "Hidrografia: principais rios, bacias e lagos",
      placeholder: "Rios navegáveis, lagos sagrados, aquíferos subterrâneos…",
      type: "long",
    },
    {
      key: "islandsAndArchipelagos",
      label: "Ilhas, arquipélagos e territórios insulares",
      placeholder: "Ilhas costeiras, ilhas flutuantes ou vulcânicas…",
    },
  ],
  3: [
    {
      key: "administrativeOrganizationType",
      label: "Forma de organização territorial",
      placeholder:
        "Ex: Estado Unitário, Federação de Províncias, Feudos Reais, Megassetores Corporativos…",
    },
    {
      key: "numberOfStatesOrProvinces",
      label: "Quantidade de províncias, estados, ducados ou setores",
      placeholder: "Ex: 7 Ducados Reais e 2 Territórios Livres…",
    },
    {
      key: "specialAutonomousRegions",
      label: "Regiões autônomas ou zonas de estatuto especial",
      placeholder: "Enclaves mágicos, reservas indígenas, zonas francas…",
      type: "long",
    },
    {
      key: "disputedOrOccupiedTerritories",
      label: "Territórios disputados, ocupados ou separatistas",
      placeholder: "Fronteiras em conflito ou províncias rebeldes…",
      type: "long",
    },
    {
      key: "overseasOrOffworldColonies",
      label: "Colônias ultramarinas, protetorados ou bases fora do mundo",
      placeholder: "Possessões distantes, estações orbitais ou vassalos…",
    },
    {
      key: "borderControlAndInternalMobility",
      label: "Controle de fronteiras e mobilidade interna",
      placeholder: "Livre circulação, salvos-condutos, checkpoints biométricos…",
      type: "long",
    },
  ],
  4: [
    {
      key: "foundationDateOrEra",
      label: "Data ou Era de fundação",
      placeholder: "Ex: Ano 1 da Primeira Chama, 2145 d.C.…",
    },
    {
      key: "foundingPeoplesAndFigures",
      label: "Povos fundadores e figuras históricas centrais",
      placeholder: "Quem unificou ou fundou a nação/mundo…",
      type: "long",
    },
    {
      key: "foundationMythOrHistoricalOrigin",
      label: "Mito de fundação vs. origem histórica",
      placeholder: "A lenda contada pelo povo e os fatos históricos…",
      type: "long",
    },
    {
      key: "majorHistoricalEras",
      label: "Grandes períodos ou eras históricas",
      placeholder: "Resumo das principais fases da história…",
      type: "long",
    },
    {
      key: "warsRevolutionsAndConflicts",
      label: "Guerras, revoluções e conflitos determinantes",
      placeholder: "Conflitos internos e externos que moldaram o território…",
      type: "long",
    },
    {
      key: "goldenAgeAndCrisisPeriods",
      label: "Era de Ouro e grandes períodos de crise/colapso",
      placeholder: "Apogeu cultural/econômico e épocas de trevas ou escassez…",
      type: "long",
    },
    {
      key: "recentHistoryAndCurrentContext",
      label: "História recente e momento histórico atual",
      placeholder: "O que aconteceu nas últimas décadas até o início da narrativa…",
      type: "long",
    },
    {
      key: "historicalTraumasAndGlories",
      label: "Maiores orgulhos e feridas históricas",
      placeholder: "Eventos que ainda inflamam o sentimento nacional…",
      type: "long",
    },
  ],
  5: [
    {
      key: "governmentSystem",
      label: "Sistema e regime de governo",
      placeholder:
        "Ex: Monarquia Constitucional, Teocracia Arcana, Oligarquia Cyberpunk, República…",
    },
    {
      key: "headOfStateTitleAndName",
      label: "Chefe de Estado (título e ocupante atual)",
      placeholder: "Ex: Imperatriz Lyra III, Chanceler Supremo…",
    },
    {
      key: "headOfGovernmentTitleAndName",
      label: "Chefe de Governo (título e ocupante atual)",
      placeholder: "Ex: Primeiro-Ministro, Grão-Vizir, Diretor Executivo…",
    },
    {
      key: "executivePowerStructure",
      label: "Estrutura do Poder Executivo / Corte / Gabinete",
      placeholder: "Ministérios, conselheiros reais, diretoria corporativa…",
      type: "long",
    },
    {
      key: "legislativePowerOrCouncil",
      label: "Poder Legislativo, Parlamento ou Conselho",
      placeholder: "Senado, Assembleia dos Clãs, Conselho dos Magos…",
      type: "long",
    },
    {
      key: "successionOrElectionMethod",
      label: "Forma de escolha de líderes, eleição ou sucessão",
      placeholder: "Hereditariedade, sufrágio universal, duelo ritual, algoritmo…",
      type: "long",
    },
    {
      key: "politicalPartiesFactionsOrHouses",
      label: "Partidos políticos, facções ou Casas Nobres",
      placeholder: "Principais forças políticas que disputam o poder…",
      type: "long",
    },
    {
      key: "politicalStabilityAndCorruption",
      label: "Estabilidade política, intrigas e nível de corrupção",
      placeholder: "Quão sólido ou vulnerável a golpes é o governo atual…",
      type: "long",
    },
    {
      key: "stateControlAndSurveillanceLevel",
      label: "Controle estatal, censura e sistemas de vigilância",
      placeholder: "Monitoramento de cidadãos, polícia política, redes de informação…",
      type: "long",
    },
    {
      key: "oppositionAndResistanceMovements",
      label: "Oposição legal, dissidência e movimentos de resistência",
      placeholder: "Grupos rebeldes, sindicatos clandestinos, insurgentes…",
      type: "long",
    },
  ],
  6: [
    {
      key: "constitutionOrFundamentalCode",
      label: "Constituição, Carta Magna ou Código Sagrado",
      placeholder: "A lei suprema que rege o país ou mundo…",
      type: "long",
    },
    {
      key: "judicialSystemAndCourts",
      label: "Sistema judiciário, tribunais e magistrados",
      placeholder: "Como os julgamentos acontecem e quem julga…",
      type: "long",
    },
    {
      key: "civilRightsAndLiberties",
      label: "Direitos civis, deveres e liberdades individuais",
      placeholder: "Liberdade de expressão, crença, locomoção e propriedade…",
      type: "long",
    },
    {
      key: "socialHierarchyAndCasteLaws",
      label: "Leis de nobreza, castas ou estratificação jurídica",
      placeholder: "Todos são iguais perante a lei ou existem privilégios de sangue/classe?…",
      type: "long",
    },
    {
      key: "mostSevereCrimesAndPunishments",
      label: "Crimes mais graves e sistema de punições",
      placeholder: "Prisão, exílio, trabalhos forçados, banimento mágico…",
      type: "long",
    },
    {
      key: "forbiddenPracticesMagicOrTech",
      label: "Práticas, magias ou tecnologias estritamente proibidas",
      placeholder: "Contrabando arcano, IA autônoma, clonagem, pactos sombrios…",
      type: "long",
    },
    {
      key: "lawEnforcementAndInquisition",
      label: "Forças policiais, guardas reais ou inquisição",
      placeholder: "Quem patrulha as ruas e aplica a lei no cotidiano…",
      type: "long",
    },
    {
      key: "citizenshipAndForeignerRights",
      label: "Regras de cidadania e tratamento a estrangeiros",
      placeholder: "Como alguém se torna cidadão e direitos de visitantes…",
    },
  ],
  7: [
    {
      key: "totalPopulationEstimate",
      label: "População total estimada",
      placeholder: "Ex: 42 milhões de habitantes…",
    },
    {
      key: "demographicDensityAndDistribution",
      label: "Densidade demográfica e distribuição no território",
      placeholder: "Regiões superpovoadas vs. vazios demográficos…",
    },
    {
      key: "urbanVsRuralPopulation",
      label: "Proporção entre população urbana e rural",
      placeholder: "Ex: 75% urbana concentrada em megacidades, 25% agrária…",
    },
    {
      key: "ethnicAndSpeciesComposition",
      label: "Composição étnica, cultural e de espécies",
      placeholder: "Povos humanos, linhagens mágicas, espécies inteligentes, ciborgues…",
      type: "long",
    },
    {
      key: "ageStructureAndLifeExpectancy",
      label: "Expectativa de vida, natalidade e estrutura etária",
      placeholder: "Longevidade média (humana ou ampliada por magia/biotecnologia)…",
    },
    {
      key: "migrationFlowsAndDiaspora",
      label: "Fluxos migratórios, imigração e diáspora",
      placeholder: "Atrai imigrantes? Há refugiados ou emigração em massa?…",
      type: "long",
    },
    {
      key: "socialClassesAndInequality",
      label: "Classes sociais, mobilidade social e desigualdade",
      placeholder: "Abismo entre elites e camadas populares, classe média, guildas…",
      type: "long",
    },
  ],
  8: [
    {
      key: "economicSystem",
      label: "Sistema econômico vigente",
      placeholder: "Ex: Feudalismo Arcano, Capitalismo Corporativo, Economia Planificada…",
    },
    {
      key: "gdpAndWealthLevel",
      label: "Nível de riqueza nacional e poder econômico",
      placeholder: "Potência hegemônica, economia emergente, nação em reconstrução…",
    },
    {
      key: "mainNaturalAndMagicalResources",
      label: "Principais recursos naturais, minerais, energéticos ou mágicos",
      placeholder: "Minérios raros, cristais de mana, hélio-3, água potável, especiarias…",
      type: "long",
    },
    {
      key: "agricultureAndFoodProduction",
      label: "Agricultura, pecuária e produção de alimentos",
      placeholder: "Fazendas tradicionais, hidroponia vertical, colheitas encantadas…",
      type: "long",
    },
    {
      key: "industryManufacturingAndGuilds",
      label: "Indústria, manufatura, forjas e guildas de ofício",
      placeholder: "O que é produzido internamente e quem controla a produção…",
      type: "long",
    },
    {
      key: "tradeServicesAndExports",
      label: "Comércio, serviços e principais exportações",
      placeholder: "O que este país/mundo vende de mais valioso para o exterior…",
      type: "long",
    },
    {
      key: "importsAndExternalDependencies",
      label: "Principais importações e dependências externas",
      placeholder: "De quais recursos externos o território depende para sobreviver…",
    },
    {
      key: "energyMatrixAndSources",
      label: "Matriz energética (fontes de energia)",
      placeholder: "Vapor, eletricidade, fusão nuclear, energia solar, linhas de ley…",
    },
    {
      key: "taxationAndStateFinances",
      label: "Sistema de impostos, tributos e finanças públicas",
      placeholder: "Dízimos reais, tarifas alfandegárias, taxas corporativas…",
    },
    {
      key: "laborConditionsAndSyndicates",
      label: "Relações de trabalho, guildas e sindicatos",
      placeholder: "Direitos trabalhistas, servidão, automação robótica…",
      type: "long",
    },
  ],
  9: [
    {
      key: "literacyAndAccessLevel",
      label: "Taxa de alfabetização e acesso à educação",
      placeholder: "Educação universal, restrita à nobreza/elite ou doutrinação estatal…",
    },
    {
      key: "schoolAndAcademicStructure",
      label: "Estrutura do ensino básico ao superior",
      placeholder: "Escolas públicas, tutores, aprendizado em guildas, ensino neural…",
      type: "long",
    },
    {
      key: "prestigiousUniversitiesOrAcademies",
      label: "Grandes universidades, academias mágicas ou institutos",
      placeholder: "Instituições de renome onde os personagens podem estudar…",
      type: "long",
    },
    {
      key: "restrictedOrCensoredKnowledge",
      label: "Conhecimentos restritos, proibidos ou censurados",
      placeholder: "Arquivos secretos, tomos banidos, história apagada pelo regime…",
      type: "long",
    },
    {
      key: "librariesArchivesAndKnowledgePreservation",
      label: "Bibliotecas, arquivos e preservação da memória",
      placeholder: "Pergaminhos, cristais de memória, servidores quânticos…",
    },
    {
      key: "magicalOrTechnicalTraining",
      label: "Formação mágica, militar ou científico-tecnológica",
      placeholder: "Como jovens talentos são descobertos e treinados…",
      type: "long",
    },
  ],
  10: [
    {
      key: "predominantClimateTypes",
      label: "Climas predominantes no território",
      placeholder: "Temperado oceânico, árido, polar, tropical úmido, artificialmente controlado…",
    },
    {
      key: "seasonsDurationAndCharacteristics",
      label: "Estações do ano (duração e características)",
      placeholder: "Quatro estações regulares, invernos longos, estação das monções…",
      type: "long",
    },
    {
      key: "averageTemperaturesAndExtremes",
      label: "Temperaturas médias e extremos térmicos",
      placeholder: "Variações entre verão/inverno e dia/noite…",
    },
    {
      key: "rainfallSnowAndWinds",
      label: "Regime de chuvas, neve, neblina e ventos marcantes",
      placeholder: "Ventos constantes, nevoeiros eternos, chuvas luminescentes…",
    },
    {
      key: "naturalOrSupernaturalDisasters",
      label: "Fenômenos climáticos extremos, naturais ou sobrenaturais",
      placeholder: "Tempestades de éter, furacões, chuva ácida, anomalias gravitacionais…",
      type: "long",
    },
    {
      key: "climateImpactOnDailyLife",
      label: "Impacto do clima na arquitetura, roupas e rotina",
      placeholder: "Como a população se adapta ao clima local…",
      type: "long",
    },
  ],
  11: [
    {
      key: "mainBiomesAndEcosystems",
      label: "Biomas e ecossistemas principais",
      placeholder: "Florestas boreais, desertos de cristal, tundras, selvas bioluminescentes…",
      type: "long",
    },
    {
      key: "nativeAndEndemicFlora",
      label: "Flora nativa e paisagem botânica",
      placeholder: "Árvores ancestrais, flores típicas, vegetação urbana…",
      type: "long",
    },
    {
      key: "magicalMedicinalOrMutantPlants",
      label: "Plantas medicinais, mágicas, venenosas ou geneticamente modificadas",
      placeholder: "Ervas alquímicas, fungos sintéticos, flora rara…",
      type: "long",
    },
    {
      key: "nativeFaunaAndPredators",
      label: "Fauna nativa, animais domésticos e predadores",
      placeholder: "Animais comuns no campo, montarias e predadores naturais…",
      type: "long",
    },
    {
      key: "magicalCreaturesOrBioengineeredBeasts",
      label: "Criaturas mágicas, monstros ou bestas bioengenheiradas",
      placeholder: "Dragões, feras espectrais, autômatos de caça, quimeras…",
      type: "long",
    },
    {
      key: "protectedAreasAndEnvironmentalState",
      label: "Preservação ambiental, reservas ou degradação ecológica",
      placeholder: "Santuários intocados vs. zonas poluídas ou devastadas…",
      type: "long",
    },
    {
      key: "symbolicOrSacredBeasts",
      label: "Animais sagrados ou venerados na cultura local",
      placeholder: "Espécies protegidas por lei ou religião…",
    },
  ],
  12: [
    {
      key: "architecturalStyleAndMaterials",
      label: "Estilo arquitetônico e materiais de construção",
      placeholder: "Mármore e vitrais góticos, concreto brutalista e neon, madeira e cobre…",
      type: "long",
    },
    {
      key: "urbanPlanningAndCityLayout",
      label: "Traçado urbano e organização das cidades",
      placeholder: "Cidades muradas em anéis, metrópoles verticais em níveis, canais…",
      type: "long",
    },
    {
      key: "lightingSanitationAndUtilities",
      label: "Iluminação pública, saneamento e abastecimento urbano",
      placeholder: "Lampiões de fogo-fátuo, redes elétricas, aquedutos, reciclagem de ar…",
    },
    {
      key: "contrastRichAndPoorDistricts",
      label: "Contraste entre bairros nobres e periferias / submundo",
      placeholder: "Torres altas vs. níveis subterrâneos, cidadela interna vs. porto…",
      type: "long",
    },
    {
      key: "fortificationsDomesOrMegastructures",
      label: "Muralhas, domos climáticos, escudos ou megaestruturas",
      placeholder: "Estruturas colossais que protegem ou definem a silhueta das cidades…",
      type: "long",
    },
    {
      key: "iconicCitiesOverview",
      label: "Perfil das principais cidades e assentamentos",
      placeholder: "Breve descrição das cidades mais marcantes deste registro…",
      type: "long",
    },
  ],
  13: [
    {
      key: "landTransportAndRoads",
      label: "Transportes terrestres, estradas e ferrovias",
      placeholder: "Carruagens, estradas reais, trens maglev, veículos autônomos…",
      type: "long",
    },
    {
      key: "maritimeAndRiverNavigation",
      label: "Navegação marítima, fluvial e portos",
      placeholder: "Frotas mercantes, navios encouraçados, barcas fluviais…",
    },
    {
      key: "airSpaceOrPortalTransport",
      label: "Transporte aéreo, espacial ou por portais mágicos",
      placeholder: "Dirigíveis, montarias aladas, portais de teletransporte, espaçonaves…",
      type: "long",
    },
    {
      key: "communicationsPostAndNetworks",
      label: "Sistemas de comunicação, correio e redes de dados",
      placeholder: "Corvos mensageiros, espelhos arcanos, telégrafo, rede neural global…",
      type: "long",
    },
    {
      key: "supplyChainsAndWaterGrid",
      label: "Infraestrutura hídrica, pontes, canais e logística",
      placeholder: "Grandes obras de engenharia ou magia que mantêm o país conectado…",
    },
  ],
  14: [
    {
      key: "coreCulturalValuesAndMentalities",
      label: "Valores fundamentais, mentalidade e visão de mundo",
      placeholder: "Honra, progresso, espiritualidade, coletivismo, ambição…",
      type: "long",
    },
    {
      key: "socialEtiquetteGreetingsAndTaboos",
      label: "Costumes sociais, cumprimentos, etiqueta e tabus",
      placeholder: "Como as pessoas se cumprimentam, o que é considerado ofensivo…",
      type: "long",
    },
    {
      key: "familyStructureAndMarriageCustoms",
      label: "Estrutura familiar, linhagens e costumes de casamento",
      placeholder: "Famílias nucleares, clãs extensos, casamentos políticos ou livres…",
      type: "long",
    },
    {
      key: "ritesOfPassageBirthToDeath",
      label: "Ritos de passagem (nascimento, maioridade, maturidade)",
      placeholder: "Cerimônias de despertar mágico, batismo, escolha de ofício…",
      type: "long",
    },
    {
      key: "nationalHolidaysAndFestivals",
      label: "Festas nacionais, celebrações e festivais sazonais",
      placeholder: "Datas comemorativas, bailes de máscaras, festivais de colheita ou luz…",
      type: "long",
    },
    {
      key: "folkloreLegendsAndSuperstitions",
      label: "Folclore, mitos populares e superstições cotidianas",
      placeholder: "Amuletos, presságios, histórias contadas às crianças…",
      type: "long",
    },
    {
      key: "senseOfHumorAndHospitality",
      label: "Hospitalidade, temperamento e convivência cotidiana",
      placeholder: "Como recebem forasteiros e como celebram no dia a dia…",
    },
  ],
  15: [
    {
      key: "stapleIngredientsAndCrops",
      label: "Ingredientes básicos e especiarias locais",
      placeholder: "Grãos, carnes, frutos do mar, ervas luminosas, proteínas sintéticas…",
    },
    {
      key: "traditionalAndNationalDishes",
      label: "Pratos típicos e prato nacional",
      placeholder: "Receitas emblemáticas das tavernas, ruas e banquetes…",
      type: "long",
    },
    {
      key: "typicalAndMagicalBeverages",
      label: "Bebidas típicas, chás, vinhos ou elixires",
      placeholder: "Vinhos solares, chás de ervas raras, destilados, tônicos energéticos…",
      type: "long",
    },
    {
      key: "streetFoodVsBanquetCuisine",
      label: "Comida de rua vs. alta gastronomia / banquetes da elite",
      placeholder: "O que o povo come diariamente vs. o que é servido nos palácios…",
      type: "long",
    },
    {
      key: "tableMannersAndFoodTaboos",
      label: "Rituais à mesa e restrições/tabus alimentares",
      placeholder: "Brindes tradicionais, alimentos sagrados ou proibidos…",
    },
    {
      key: "foodScarcityOrSyntheticRations",
      label: "Segurança alimentar, racionamento ou alimentação futurista",
      placeholder: "Fartura agrícola vs. rações controladas pelo Estado (em distopias)…",
    },
  ],
  16: [
    {
      key: "everydayClothingAndFabrics",
      label: "Vestuário cotidiano e tecidos predominantes",
      placeholder: "Linho, lã, seda, couro, fibras térmicas inteligentes…",
      type: "long",
    },
    {
      key: "nobleFormalOrCeremonialAttire",
      label: "Trajes de gala, nobreza ou cerimoniais",
      placeholder: "Mantos bordados, uniformes de corte, alta-costura futurista…",
      type: "long",
    },
    {
      key: "climateOrTechAdaptedGear",
      label: "Roupas adaptadas ao clima, combate ou tecnologia",
      placeholder: "Capas térmicas, respiradores urbanos, armaduras leves, exoesqueletos…",
    },
    {
      key: "jewelryAccessoriesAndInsignias",
      label: "Joias, acessórios, amuletos e insígnias",
      placeholder: "Broches de clã, anéis de canalização mágica, visores…",
    },
    {
      key: "hairstylesMakeupMarksAndModifications",
      label: "Penteados, maquiagem, tatuagens rúnicas ou modificações corporais",
      placeholder: "Tranças guerreiras, pinturas rituais, implantes cibernéticos…",
      type: "long",
    },
    {
      key: "statusMarkersInFashion",
      label: "Cores e elementos visuais que indicam status ou profissão",
      placeholder: "Cores exclusivas da realeza, uniformes de casta ou guilda…",
    },
  ],
  17: [
    {
      key: "predominantReligionsOrCults",
      label: "Religiões, filosofias ou cultos predominantes",
      placeholder: "Politeísmo astral, culto aos ancestrais, filosofia secular, tecnocrença…",
      type: "long",
    },
    {
      key: "pantheonDeitiesOrCosmicEntities",
      label: "Panteão, divindades, espíritos ou entidades veneradas",
      placeholder: "Nomes e domínios dos deuses ou forças primordiais…",
      type: "long",
    },
    {
      key: "religiousFreedomVsStateReligion",
      label: "Religião oficial do Estado vs. liberdade religiosa",
      placeholder: "Tolerância religiosa, sincretismo ou perseguição a heresias…",
    },
    {
      key: "templesClergyAndReligiousOrders",
      label: "Templos, santuários, sacerdócio e ordens religiosas",
      placeholder: "Organização do clero e influência política dos templos…",
      type: "long",
    },
    {
      key: "sacredTextsPropheciesAndDogmas",
      label: "Textos sagrados, dogmas e profecias centrais",
      placeholder: "Livros canônicos e profecias que movem a trama…",
      type: "long",
    },
    {
      key: "magicScienceAndFaithRelationship",
      label: "Relação entre fé, magia e ciência",
      placeholder: "A magia é vista como dádiva divina, ciência natural ou maldição?…",
      type: "long",
    },
    {
      key: "funeraryPracticesAndAfterlifeBeliefs",
      label: "Rituais funerários e crenças sobre a vida após a morte",
      placeholder: "Piras funerárias, catacumbas de cristal, transferência de consciência…",
      type: "long",
    },
  ],
  18: [
    {
      key: "literaturePoetryAndOralTradition",
      label: "Literatura, poesia, crônicas e tradição oral",
      placeholder: "Grandes épicos, bardos, romances proibidos…",
      type: "long",
    },
    {
      key: "musicInstrumentsAndDances",
      label: "Música, instrumentos típicos e danças tradicionais",
      placeholder: "Sonoridade local, instrumentos acústicos, arcanos ou eletrônicos…",
      type: "long",
    },
    {
      key: "visualArtsPaintingAndSculpture",
      label: "Artes visuais, pintura, escultura e artesanato",
      placeholder: "Tapeçarias, afrescos, hologramas, arte de rua…",
    },
    {
      key: "theaterCinemaAndDigitalMedia",
      label: "Teatro, ópera, cinema e entretenimento audiovisual",
      placeholder: "Companhias teatrais, transmissões holográficas, realidade virtual…",
    },
    {
      key: "pressInformationControlAndPropaganda",
      label: "Imprensa, meios de comunicação, propaganda e censura",
      placeholder: "Jornais livres, arautos reais, rede estatal de notícias…",
      type: "long",
    },
    {
      key: "nightlifeAndPopularPastimes",
      label: "Vida noturna, jogos de salão e lazer popular",
      placeholder: "Tavernas, casas de chá, clubes subterrâneos, jogos de estratégia…",
    },
  ],
  19: [
    {
      key: "mostPopularSportsAndGames",
      label: "Esportes e jogos mais populares",
      placeholder: "Esportes coletivos, corridas de montarias ou veículos, xadrez arcano…",
      type: "long",
    },
    {
      key: "martialTournamentsArenasOrDuels",
      label: "Torneios marciais, arenas de combate ou duelos",
      placeholder: "Justas, arenas mágicas, campeonatos de mechas…",
      type: "long",
    },
    {
      key: "greatCompetitionsAndPrizes",
      label: "Grandes competições nacionais e honrarias",
      placeholder: "O maior evento esportivo/marcial do calendário…",
    },
    {
      key: "socialAndPoliticalRoleOfSports",
      label: "Papel social e político das competições",
      placeholder: "Prestígio entre casas, válvula de escape social, recrutamento…",
    },
  ],
  20: [
    {
      key: "healthcareSystemAndAccess",
      label: "Sistema de saúde, hospitais e acesso da população",
      placeholder: "Cura pública, casas de caridade, clínicas corporativas privadas…",
      type: "long",
    },
    {
      key: "traditionalMagicalOrBioMedicine",
      label: "Medicina tradicional, cura mágica ou biotecnologia médica",
      placeholder: "Poções, curandeiros, cirurgia robótica, regeneração celular…",
      type: "long",
    },
    {
      key: "commonOrSupernaturalDiseases",
      label: "Doenças comuns, pragas históricas ou enfermidades mágicas",
      placeholder: "Praga de cinzas, síndrome cibernética, febres sazonais…",
      type: "long",
    },
    {
      key: "mentalHealthAndSocialWellbeing",
      label: "Saúde mental, bem-estar e qualidade de vida",
      placeholder: "Como a sociedade lida com traumas, estresse e descanso…",
    },
    {
      key: "longevityEnhancementsOrBionics",
      label: "Próteses, implantes, elixires de longevidade",
      placeholder: "Membros mecânicos/arcanos, terapias genéticas…",
    },
    {
      key: "sanitationAndPublicHygiene",
      label: "Higiene pública, água tratada e controle sanitário",
      placeholder: "Banhos públicos, purificação mágica da água, filtragem de ar…",
    },
  ],
  21: [
    {
      key: "armedForcesBranchesAndStructure",
      label: "Forças Armadas (exército, marinha, aeronáutica/espacial)",
      placeholder: "Divisões militares, efetivo e cadeia de comando…",
      type: "long",
    },
    {
      key: "militaryPowerWeaponsAndTech",
      label: "Poderio bélico, armamentos e tecnologia de defesa",
      placeholder: "Espadas rúnicas, artilharia, frotas de cruzadores, drones…",
      type: "long",
    },
    {
      key: "magicalWarfareOrSuperSoldiers",
      label: "Unidades de elite, guerreiros mágicos ou supersoldados",
      placeholder: "Ordens de cavaleiros arcanos, esquadrões cibernéticos…",
      type: "long",
    },
    {
      key: "intelligenceEspionageAndSecretPolice",
      label: "Serviço de inteligência, espionagem e contraespionagem",
      placeholder: "Rede de espiões, assassinos da coroa, vigilância digital…",
      type: "long",
    },
    {
      key: "borderDefenseShieldsAndFortresses",
      label: "Defesas de fronteira, fortalezas e escudos",
      placeholder: "Linhas de fortificação, cúpulas de força, baterias orbitais…",
    },
    {
      key: "militaryServiceAndWarriorTradition",
      label: "Serviço militar (alistamento) e tradição guerreira",
      placeholder: "Exército profissional, conscrição obrigatória, mercenários…",
    },
  ],
  22: [
    {
      key: "foreignPolicyStance",
      label: "Postura diplomática e política externa",
      placeholder: "Expansionista, isolacionista, potência mediadora, neutro…",
      type: "long",
    },
    {
      key: "historicAndCurrentAllies",
      label: "Principais aliados históricos e atuais",
      placeholder: "Nações amigas, pactos de defesa mútua…",
      type: "long",
    },
    {
      key: "rivalsEnemiesAndColdWars",
      label: "Rivais geopolíticos, inimigos e tensões latentes",
      placeholder: "Disputas hegemônicas, guerras frias, embargos…",
      type: "long",
    },
    {
      key: "internationalTreatiesAndBlocs",
      label: "Participação em blocos, conselhos e tratados internacionais",
      placeholder: "Alianças continentais, Liga dos Mundos, Pacto das Cinzas…",
      type: "long",
    },
    {
      key: "commercialAndMagicalAgreements",
      label: "Acordos comerciais, científicos e de trânsito",
      placeholder: "Rotas livres, intercâmbio de estudantes e recursos…",
    },
    {
      key: "embassiesAndSoftPower",
      label: "Embaixadas e influência diplomática (soft power)",
      placeholder: "Prestígio diplomático, espionagem em embaixadas…",
    },
  ],
  23: [
    {
      key: "overallTechnologicalLevel",
      label: "Nível científico e tecnológico geral",
      placeholder: "Ex: Medieval com Alquimia, Contemporâneo, Cyberpunk Avançado, Interestelar…",
    },
    {
      key: "flagshipTechnologiesAndInventions",
      label: "Principais conquistas científicas e invenções",
      placeholder: "Descobertas que mudaram a história deste país/mundo…",
      type: "long",
    },
    {
      key: "magicAndTechnologyIntegration",
      label: "Relação entre magia e ciência / tecnologia",
      placeholder: "Coexistem em harmonia (magitek), competem ou a magia não existe?…",
      type: "long",
    },
    {
      key: "aiRoboticsAndCybernetics",
      label: "Inteligência artificial, autômatos, robótica e cibernética",
      placeholder: "De golens arcanos a IAs sencientes e androides…",
      type: "long",
    },
    {
      key: "biotechGeneticsAndCloning",
      label: "Biotecnologia, genética, alquimia biológica e mutações",
      placeholder: "Modificações genéticas, quimerismo, aprimoramento humano…",
      type: "long",
    },
    {
      key: "spaceExplorationAndTerraforming",
      label: "Astronomia, exploração espacial ou navegação planar",
      placeholder: "Observatórios astrais, colônias lunares, viagens entre planos…",
    },
    {
      key: "forbiddenTechAndEthicalDilemmas",
      label: "Tecnologias banidas e dilemas éticos da ciência",
      placeholder: "Experimentos clandestinos, armas de destruição em massa…",
      type: "long",
    },
  ],
  24: [
    {
      key: "naturalWondersAndLandmarks",
      label: "Maravilhas naturais e paisagens icônicas",
      placeholder: "Cataratas flutuantes, cânions de basalto, florestas de vidro…",
      type: "long",
    },
    {
      key: "historicalMonumentsAndRuins",
      label: "Monumentos históricos, palácios e ruínas ancestrais",
      placeholder: "Coliseus, fortalezas antigas, vestígios de civilizações extintas…",
      type: "long",
    },
    {
      key: "sacredOrMagicalSites",
      label: "Locais sagrados, santuários ou nexos de poder",
      placeholder: "Templos de peregrinação, fontes de magia pura…",
      type: "long",
    },
    {
      key: "museumsAndCulturalHeritage",
      label: "Museus, relíquias nacionais e patrimônio imaterial",
      placeholder: "Tesouros guardados pelo Estado ou pela tradição…",
    },
    {
      key: "tourismFlowAndVisitorRules",
      label: "Turismo, hospitalidade a viajantes e restrições de visita",
      placeholder: "Destino turístico famoso ou território fechado a forasteiros?…",
    },
  ],
  25: [
    {
      key: "howOtherNationsPerceiveIt",
      label: "Como este país/mundo é visto pelas demais nações",
      placeholder: "Admirado pela cultura, temido pelo exército, visto como enigmático…",
      type: "long",
    },
    {
      key: "commonStereotypesAndMythsAbroad",
      label: "Estereótipos, clichês e mitos no exterior",
      placeholder: "O que os estrangeiros costumam pensar sobre seus habitantes…",
      type: "long",
    },
    {
      key: "mainCulturalAndPoliticalInfluence",
      label: "Principal exportação cultural ou influência ideológica",
      placeholder: "Moda, música, filosofia política, artes arcanas, tecnologia…",
    },
    {
      key: "prestigeAndFameInUniverse",
      label: "Grau de prestígio e reputação no universo",
      placeholder: "Qual é a primeira imagem que vem à mente quando seu nome é citado…",
    },
  ],
  26: [
    {
      key: "internalSocialTensionsAndPrejudices",
      label: "Tensões sociais internas, preconceitos e divisões",
      placeholder: "Conflitos entre classes, regiões, usuários de magia e não-usuários…",
      type: "long",
    },
    {
      key: "povertyCrimeAndUnderworld",
      label: "Pobreza, criminalidade, mercado clandestino e máfias",
      placeholder: "Sindicatos do crime, contrabando, corrupção urbana…",
      type: "long",
    },
    {
      key: "politicalOrSuccessionCrises",
      label: "Crises políticas, conspirações ou disputas de sucessão",
      placeholder: "Ameaças de guerra civil, vácuo de poder, traições palacianas…",
      type: "long",
    },
    {
      key: "environmentalOrMagicalThreats",
      label: "Problemas ambientais, escassez de recursos ou colapso mágico",
      placeholder: "Secas, poluição extrema, exaustão de mana, anomalias…",
      type: "long",
    },
    {
      key: "externalThreatsAndImminentWars",
      label: "Ameaças externas e perigos iminentes",
      placeholder: "Invasões estrangeiras, monstros, colapso orbital…",
      type: "long",
    },
  ],
  27: [
    {
      key: "stateProjectsAndAmbitions",
      label: "Grandes projetos nacionais e ambições de futuro",
      placeholder: "O que o governo ou sociedade planeja alcançar nas próximas décadas…",
      type: "long",
    },
    {
      key: "propheciesOrFutureProjections",
      label: "Profecias, previsões científicas ou tendências futuras",
      placeholder: "Destinos anunciados por oráculos ou simulações…",
      type: "long",
    },
    {
      key: "upcomingReformsOrRevolutions",
      label: "Reformas em curso ou revoluções prestes a eclodir",
      placeholder: "Mudanças estruturais que estão fermentando na sociedade…",
      type: "long",
    },
    {
      key: "narrativeRoleInUpcomingBooks",
      label: "Papel futuro deste país/mundo nos próximos livros da saga",
      placeholder: "Como este cenário evoluirá ao longo dos arcos…",
      type: "long",
    },
  ],
  28: [
    {
      key: "curiositiesGeneralNotes",
      label: "Notas gerais sobre peculiaridades e fatos raros",
      placeholder: "Observações complementares à lista interativa de curiosidades abaixo…",
      type: "long",
    },
  ],
  29: [
    {
      key: "documentationGeneralNotes",
      label: "Notas sobre arquivos, crônicas do universo e referências de criação",
      placeholder: "Observações sobre as fontes fictícias ou inspirações reais deste registro…",
      type: "long",
    },
  ],
  30: [
    {
      key: "cosmologyCreationAndStructure",
      label: "Origem cósmica, mito da criação e estrutura do universo",
      placeholder: "Como o mundo/universo surgiu e qual sua arquitetura cósmica…",
      type: "long",
    },
    {
      key: "sunsMoonsAndAstronomicalBodies",
      label: "Sóis, luas, constelações e corpos celestes",
      placeholder: "Quantidade de luas, fases lunares, estrelas-guia e seus efeitos…",
      type: "long",
    },
    {
      key: "gravityAtmosphereAndDayLength",
      label: "Gravidade, atmosfera, duração do dia e do ano",
      placeholder: "Condições físicas e planetárias do mundo…",
    },
    {
      key: "planesOfExistenceAndDimensions",
      label: "Planos de existência, dimensões paralelas ou mundo espiritual",
      placeholder: "Plano Astral, Mundo das Sombras, hiperespaço, véu entre mundos…",
      type: "long",
    },
    {
      key: "cosmicEventsEclipsesAndAlignments",
      label: "Eventos cósmicos (eclipses, alinhamentos, marés astrais)",
      placeholder: "Como eventos celestes afetam a magia, a tecnologia ou o comportamento…",
      type: "long",
    },
    {
      key: "planetaryRingOrOrbitalStructures",
      label: "Anéis planetários, satélites artificiais ou estruturas orbitais",
      placeholder: "Elevadores espaciais, estações lunares, cinturões de asteroides…",
    },
  ],
  31: [
    {
      key: "magicPresenceAndAccessibility",
      label: "Presença sobrenatural e quem tem acesso à magia",
      placeholder: "Magia onipresente, rara, secreta, hereditária ou inexistente…",
      type: "long",
    },
    {
      key: "fundamentalMagicalLawsAndSource",
      label: "Leis sobrenaturais fundamentais e fonte primordial",
      placeholder: "De onde vem o poder e quais leis jamais podem ser quebradas…",
      type: "long",
    },
    {
      key: "magicalInstitutionsAndRegulation",
      label: "Fiscalização, tribunais mágicos e regulamentação",
      placeholder: "Como o Estado ou ordens controlam os praticantes…",
      type: "long",
    },
    {
      key: "supernaturalPhenomenaAndAnomalies",
      label: "Fenômenos sobrenaturais, maldições e zonas anômalas",
      placeholder: "Lugares onde as leis da física/magia se comportam de modo estranho…",
      type: "long",
    },
    {
      key: "magicImpactOnEconomyAndHierarchy",
      label: "Impacto da magia na economia, guerra e hierarquia social",
      placeholder:
        "Os usuários de magia governam, são perseguidos ou servem como força de trabalho?…",
      type: "long",
    },
  ],
  32: [
    {
      key: "peoplesCoexistenceAndConflicts",
      label: "Convivência, alianças e tensões entre povos e espécies",
      placeholder: "Como diferentes etnias, linhagens ou espécies coexistem no território…",
      type: "long",
    },
    {
      key: "languagesAndCulturalExchange",
      label: "Trocas culturais, mestiçagem e comunicação entre povos",
      placeholder: "Tradições compartilhadas, línguas francas e fronteiras culturais…",
      type: "long",
    },
  ],
  33: [
    {
      key: "oneLinePitch",
      label: "Síntese em uma frase (Logline do País/Mundo)",
      placeholder: "Uma frase impactante que define a essência deste lugar…",
    },
    {
      key: "encyclopedicSummaryText",
      label: "Artigo / Resumo Enciclopédico Introdutório",
      placeholder:
        "Texto introdutório completo sobre o registro (pode ser montado automaticamente a partir dos dados preenchidos ou escrito livremente)…",
      type: "long",
    },
  ],
  34: [
    {
      key: "authorBrainstormingAndIdeas",
      label: "Brainstorming, rascunhos e ideias em aberto",
      placeholder: "Ideias livres para cenas, reviravoltas e expansão deste cenário…",
      type: "long",
    },
    {
      key: "pendingDecisionsAndQuestions",
      label: "Pontos pendentes de definição",
      placeholder: "O que ainda precisa ser decidido ou aprofundado futuramente…",
      type: "long",
    },
    {
      key: "inspirationsAndAestheticMood",
      label: "Inspirações literárias, históricas, cinematográficas e estéticas",
      placeholder: "Obras, épocas reais ou atmosferas que inspiram este lugar…",
      type: "long",
    },
    {
      key: "connectionsToPlotAndScenes",
      label: "Cenas-chave da trama que acontecem neste lugar",
      placeholder: "Capítulos, batalhas, encontros ou revelações situados aqui…",
      type: "long",
    },
  ],
};

export function EncyclopediaRecordSheet({
  record,
  onChangeRecord,
  allRecords,
  characters,
  books,
  organizations,
  magicSystems,
  transformations,
  globalQuestions,
  onSave,
}: {
  record: WorldEncyclopediaRecord;
  onChangeRecord: (
    next: WorldEncyclopediaRecord | ((prev: WorldEncyclopediaRecord) => WorldEncyclopediaRecord),
  ) => void;
  allRecords: WorldEncyclopediaRecord[];
  characters: Character[];
  books: Book[];
  organizations: WorldOrganization[];
  magicSystems: WorldMagicSystem[];
  transformations: WorldTransformation[];
  globalQuestions: WorldEncyclopediaRecord["customQuestions"];
  onSave: () => void;
}) {
  // Controle de seções expandidas/recolhidas (permite expandir várias ou navegar diretamente)
  const [expandedSecs, setExpandedSecs] = useState<number[]>([1, 4, 28, 33]);
  const [activeSubView, setActiveSubView] = useState<
    "sections" | "gallery" | "maps" | "timeline" | "entities" | "relations"
  >("sections");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Estados auxiliares para Divisões Territoriais (Seção 3)
  const [divName, setDivName] = useState("");
  const [divType, setDivType] = useState("Província");
  const [divCapital, setDivCapital] = useState("");
  const [divDesc, setDivDesc] = useState("");

  // Estados auxiliares para Espécies Inteligentes (Seção 32)
  const [spName, setSpName] = useState("");
  const [spOrigin, setSpOrigin] = useState("");
  const [spTraits, setSpTraits] = useState("");
  const [spAbilities, setSpAbilities] = useState("");
  const [spCulture, setSpCulture] = useState("");

  // Estados auxiliares para Fontes e Documentação (Seção 29)
  const [srcTitle, setSrcTitle] = useState("");
  const [srcAuthor, setSrcAuthor] = useState("");
  const [srcType, setSrcType] = useState("Documento fictício do universo");
  const [srcLink, setSrcLink] = useState("");
  const [srcPubDate, setSrcPubDate] = useState("");
  const [srcConsDate, setSrcConsDate] = useState("");
  const [srcInfo, setSrcInfo] = useState("");
  const [srcReliability, setSrcReliability] = useState("");
  const [srcObs, setSrcObs] = useState("");
  const [editingSrcId, setEditingSrcId] = useState<string | null>(null);

  const up = <K extends keyof WorldEncyclopediaRecord>(k: K, v: WorldEncyclopediaRecord[K]) => {
    onChangeRecord((prev) => ({ ...(prev ?? record), [k]: v }));
  };

  const upSec = <K extends keyof WorldSectionFields>(k: K, v: WorldSectionFields[K]) => {
    onChangeRecord((prev) => {
      const base = prev ?? record;
      return {
        ...base,
        sections: {
          ...base.sections,
          [k]: v,
        },
      };
    });
  };

  const toggleSec = (num: number) => {
    setExpandedSecs((prev) =>
      prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num],
    );
  };

  const jumpToSection = (num: number) => {
    setActiveSubView("sections");
    if (!expandedSecs.includes(num)) {
      setExpandedSecs((prev) => [...prev, num]);
    }
    if (typeof document !== "undefined") {
      setTimeout(() => {
        document
          .getElementById(`enc-sec-${num}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    }
  };

  const progress = calculateOverallProgress(record);

  const stylePresets =
    record.modality === "Fantasia — Medieval a Moderna" ? FANTASY_STYLES : DYSTOPIA_SCIFI_STYLES;

  const handleBuildSummary = () => {
    const generated = buildEncyclopedicSummaryFromData(record);
    if (!generated.trim()) return;
    const existing = record.sections.encyclopedicSummaryText?.trim();
    const nextText = existing ? `${existing}\n\n${generated}` : generated;
    upSec("encyclopedicSummaryText", nextText);
  };

  const copySummary = async () => {
    const txt = record.sections.encyclopedicSummaryText ?? "";
    if (!txt) return;
    try {
      await navigator.clipboard?.writeText(txt);
    } catch {
      // ignore
    }
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const toggleRelationId = (
    key:
      | "relatedRecordIds"
      | "relatedCharacterIds"
      | "relatedBookIds"
      | "relatedOrganizationIds"
      | "relatedMagicSystemIds"
      | "relatedTransformationIds",
    id: string,
  ) => {
    const curr = record[key] ?? [];
    up(key, curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]);
  };

  return (
    <div className="space-y-6" data-testid="encyclopedia-record-sheet">
      {/* Painel de Identificação, Modalidade Narrativa, Categoria e Progresso */}
      <div className="card-luxe space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Modalidade narrativa do registro"
                value={record.modality}
                onChange={(e) => up("modality", e.target.value as WorldNarrativeModality)}
                className="!min-h-8 !w-auto !px-3 !py-1 text-xs font-semibold text-teal"
                data-testid="select-record-modality"
              >
                <option value="Fantasia — Medieval a Moderna">
                  Modalidade: Fantasia — Medieval a Moderna
                </option>
                <option value="Distopia / Ficção Científica">
                  Modalidade: Distopia / Ficção Científica
                </option>
              </select>

              <select
                aria-label="Categoria do registro"
                value={record.category}
                onChange={(e) => up("category", e.target.value as WorldRecordCategory)}
                className="!min-h-8 !w-auto !px-3 !py-1 text-xs font-medium"
                data-testid="select-record-category"
              >
                {WORLD_RECORD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    Categoria: {c}
                  </option>
                ))}
                <option value="Outro tipo personalizado">
                  Categoria: Outro tipo personalizado
                </option>
              </select>

              <select
                aria-label="Status do registro"
                value={record.status}
                onChange={(e) => up("status", e.target.value as WorldRecordStatus)}
                className="!min-h-8 !w-auto !px-3 !py-1 text-xs"
                data-testid="select-record-status"
              >
                {WORLD_RECORD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </div>

            {record.category === "Outro tipo personalizado" && (
              <div>
                <label htmlFor="custom-cat-name">Nome da categoria personalizada</label>
                <input
                  id="custom-cat-name"
                  value={record.customCategoryName ?? ""}
                  onChange={(e) => up("customCategoryName", e.target.value)}
                  placeholder="Ex: Cidade-Estado Flutuante, Dimensão de Bolso…"
                />
              </div>
            )}

            <input
              aria-label="Nome do registro enciclopédico"
              value={record.name}
              onChange={(e) => up("name", e.target.value)}
              placeholder="Nome do País, Mundo, Reino, Império ou Cidade…"
              className="!border-0 !bg-transparent !p-0 font-display text-3xl sm:text-4xl focus:!outline-none"
              data-testid="input-world-record-name"
            />

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="wrec-universe">Universo literário</label>
                <input
                  id="wrec-universe"
                  value={record.universeName}
                  onChange={(e) => up("universeName", e.target.value)}
                  placeholder="Ex: Juramentos do Destino"
                />
              </div>
              <div>
                <label htmlFor="wrec-genre">Gênero / Subgênero</label>
                <input
                  id="wrec-genre"
                  value={record.genre}
                  onChange={(e) => up("genre", e.target.value)}
                  placeholder="Ex: Fantasia Medieval, Cyberpunk…"
                />
              </div>
              <div>
                <label htmlFor="wrec-continent">Continente / Setor</label>
                <input
                  id="wrec-continent"
                  value={record.continentFilter}
                  onChange={(e) => up("continentFilter", e.target.value)}
                  placeholder="Ex: Solária, Setor 7…"
                />
              </div>
              <div>
                <label htmlFor="wrec-region">Região</label>
                <input
                  id="wrec-region"
                  value={record.regionFilter}
                  onChange={(e) => up("regionFilter", e.target.value)}
                  placeholder="Ex: Vale do Norte…"
                />
              </div>
            </div>
          </div>

          {/* Indicador de Progresso das 34 Seções */}
          <div
            className="flex flex-col justify-between rounded-2xl border bg-background/60 p-4"
            data-testid="encyclopedia-progress-box"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider text-muted-foreground">
                  Progresso da Ficha (34 Seções)
                </span>
                <span className="font-mono font-bold text-teal">{progress.percentage}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-teal transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.7rem]">
              <div className="rounded-lg border bg-teal/10 p-1.5">
                <strong className="block text-sm text-teal">{progress.filledSections}</strong>
                <span className="text-muted-foreground">Preenchidas</span>
              </div>
              <div className="rounded-lg border bg-gold/10 p-1.5">
                <strong className="block text-sm text-gold">{progress.partialSections}</strong>
                <span className="text-muted-foreground">Parciais</span>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-1.5">
                <strong className="block text-sm text-muted-foreground">
                  {progress.emptySections}
                </strong>
                <span className="text-muted-foreground">Em aberto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Influências e Estilos da Modalidade Selecionada (Fantasia vs Distopia/Sci-Fi) */}
        <div className="border-t pt-4">
          <SelectableCards
            label={
              record.modality === "Fantasia — Medieval a Moderna"
                ? "Influências e Períodos de Fantasia (Medieval a Moderna)"
                : "Categorias de Distopia / Ficção Científica"
            }
            subtitle="Selecione uma ou mais vertentes e adicione estilos próprios se desejar."
            presets={stylePresets}
            customOptions={record.customStyles ?? []}
            selected={record.styleInfluences ?? []}
            onChangeSelected={(next) => up("styleInfluences", next)}
            onAddCustomOption={(opt) => up("customStyles", [...(record.customStyles ?? []), opt])}
            placeholderCustom="Adicionar estilo personalizado…"
            fieldTestIdPrefix="world-modality-styles"
          />
        </div>
      </div>

      {/* Barra de Abas Rápidas da Ficha Enciclopédica */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "sections", label: "Ficha Completa (34 Seções)" },
          {
            id: "gallery",
            label: `Galeria & Capa (${record.images.length})`,
          },
          { id: "maps", label: `Mapas & Geografia (${record.maps.length})` },
          {
            id: "timeline",
            label: `Linha do Tempo (${record.historicalEvents.length})`,
          },
          {
            id: "entities",
            label: "Organizações, Magia & Transformações",
          },
          { id: "relations", label: "Relações com o Universo" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveSubView(t.id as typeof activeSubView)}
            data-testid={`sheet-view-tab-${t.id}`}
            className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
              activeSubView === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* SUB-VISÃO: GALERIA DE IMAGENS                                       */}
      {/* =================================================================== */}
      {activeSubView === "gallery" && (
        <div className="card-luxe p-5 sm:p-6">
          <EncyclopediaImageGallery
            images={record.images}
            customCategories={record.customImageCategories}
            coverImageUrl={record.coverImageUrl}
            onChangeImages={(next) => up("images", next)}
            onChangeCustomCategories={(next) => up("customImageCategories", next)}
            onChangeCoverImage={(url) => up("coverImageUrl", url)}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VISÃO: MAPAS INTERATIVOS                                        */}
      {/* =================================================================== */}
      {activeSubView === "maps" && (
        <div className="card-luxe p-5 sm:p-6">
          <EncyclopediaMapStudio
            maps={record.maps}
            currentRecordId={record.id}
            allRecords={allRecords}
            onChangeMaps={(next) => up("maps", next)}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VISÃO: LINHA DO TEMPO E ACONTECIMENTOS                          */}
      {/* =================================================================== */}
      {activeSubView === "timeline" && (
        <div className="card-luxe p-5 sm:p-6">
          <EncyclopediaTimelineManager
            events={record.historicalEvents}
            onChangeEvents={(next) => up("historicalEvents", next)}
            characters={characters}
            books={books}
            worldRecords={allRecords}
            organizations={organizations}
            currentRecordId={record.id}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VISÃO: ORGANIZAÇÕES, SISTEMAS MÁGICOS E TRANSFORMAÇÕES          */}
      {/* =================================================================== */}
      {activeSubView === "entities" && (
        <div className="card-luxe p-5 sm:p-6">
          <EncyclopediaEntitiesHub
            organizations={organizations}
            magicSystems={magicSystems}
            transformations={transformations}
            worldRecords={allRecords}
            characters={characters}
            books={books}
            currentRecordId={record.id}
            linkedOrgIds={record.relatedOrganizationIds}
            linkedMagicIds={record.relatedMagicSystemIds}
            linkedTransIds={record.relatedTransformationIds}
            onToggleLinkOrg={(id) => toggleRelationId("relatedOrganizationIds", id)}
            onToggleLinkMagic={(id) => toggleRelationId("relatedMagicSystemIds", id)}
            onToggleLinkTrans={(id) => toggleRelationId("relatedTransformationIds", id)}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VISÃO: RELAÇÕES COM O RESTANTE DO UNIVERSO                      */}
      {/* =================================================================== */}
      {activeSubView === "relations" && (
        <div className="card-luxe space-y-6 p-5 sm:p-6" data-testid="record-relations-panel">
          <div>
            <h3 className="font-display text-2xl">Conexões com o Universo Literário</h3>
            <p className="text-xs text-muted-foreground">
              Relacione este registro a personagens principais e secundários, livros da biblioteca,
              outros lugares, organizações, sistemas mágicos e transformações.
            </p>
          </div>

          {/* Livros da Biblioteca */}
          <div className="space-y-2 rounded-2xl border bg-background/40 p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-teal" /> Livros em que este registro aparece
            </label>
            <div className="flex flex-wrap gap-2">
              {books.map((b) => {
                const active = record.relatedBookIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleRelationId("relatedBookIds", b.id)}
                    data-testid={`rel-book-${b.id}`}
                    className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                      active
                        ? "border-teal bg-teal/20 text-foreground font-semibold"
                        : "bg-background/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b.order}. {b.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personagens Principais e Secundários */}
          <div className="space-y-2 rounded-2xl border bg-background/40 p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" /> Personagens relacionados (Protagonistas e
              Secundários)
            </label>
            {characters.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum personagem cadastrado ainda no Arquivo de Personagens.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {characters.map((c) => {
                  const active = record.relatedCharacterIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleRelationId("relatedCharacterIds", c.id)}
                      data-testid={`rel-char-${c.id}`}
                      className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                        active
                          ? "border-primary bg-primary/20 text-foreground font-semibold"
                          : "bg-background/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.name || "Sem nome"} ({c.modelType ?? "Protagonista"})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outros Países, Mundos, Continentes, Regiões e Cidades */}
          <div className="space-y-2 rounded-2xl border bg-background/40 p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Globe2 className="h-4 w-4 text-gold" /> Países, Mundos, Continentes, Regiões e
              Cidades relacionados
            </label>
            {allRecords.filter((r) => r.id !== record.id).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Crie outros registros na enciclopédia para estabelecer vínculos territoriais ou
                diplomáticos.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allRecords
                  .filter((r) => r.id !== record.id)
                  .map((r) => {
                    const active = record.relatedRecordIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRelationId("relatedRecordIds", r.id)}
                        data-testid={`rel-record-${r.id}`}
                        className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                          active
                            ? "border-gold bg-gold/20 text-foreground font-semibold"
                            : "bg-background/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r.name || "Sem nome"} ({r.category})
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <TagListEditor
            label="Arcos narrativos relacionados"
            items={record.relatedNarrativeArcs}
            onChange={(next) => up("relatedNarrativeArcs", next)}
            placeholder="Adicionar arco narrativo…"
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VISÃO PRINCIPAL: AS 34 SEÇÕES EXPANSÍVEIS E RECOLHÍVEIS         */}
      {/* =================================================================== */}
      {activeSubView === "sections" && (
        <div className="grid gap-6 lg:grid-cols-[270px_1fr]">
          {/* Índice Lateral Direto das 34 Seções */}
          <aside className="space-y-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setExpandedSecs(ENCYCLOPEDIA_SECTIONS_META.map((s) => s.num))}
                className="btn-ghost !min-h-8 flex-1 !px-2 !py-1 text-[0.7rem]"
                data-testid="btn-expandir-todas-secoes"
              >
                Expandir todas (34)
              </button>
              <button
                type="button"
                onClick={() => setExpandedSecs([])}
                className="btn-ghost !min-h-8 flex-1 !px-2 !py-1 text-[0.7rem]"
                data-testid="btn-recolher-todas-secoes"
              >
                Recolher todas
              </button>
            </div>

            <nav
              aria-label="Índice das 34 seções enciclopédicas"
              className="card-luxe max-h-[75vh] space-y-1 overflow-y-auto p-2.5"
            >
              {ENCYCLOPEDIA_SECTIONS_META.map((sec) => {
                const st = getSectionCompletionStatus(record, sec.num);
                const isOpen = expandedSecs.includes(sec.num);
                return (
                  <button
                    key={sec.num}
                    type="button"
                    onClick={() => jumpToSection(sec.num)}
                    data-testid={`nav-enc-sec-${sec.num}`}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                      isOpen
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">
                      {String(sec.num).padStart(2, "0")}. {sec.title}
                    </span>
                    {st === "filled" ? (
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-teal"
                        title="Seção preenchida"
                      />
                    ) : st === "partial" ? (
                      <CircleDot
                        className="h-3.5 w-3.5 shrink-0 text-gold"
                        title="Parcialmente preenchida"
                      />
                    ) : (
                      <Circle
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
                        title="Ainda vazia"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Lista de Acordeões das 34 Seções */}
          <div className="space-y-4">
            {ENCYCLOPEDIA_SECTIONS_META.map((sec) => {
              const isOpen = expandedSecs.includes(sec.num);
              const st = getSectionCompletionStatus(record, sec.num);
              const fields = SECTION_FIELDS_CONFIG[sec.num] ?? [];

              return (
                <section
                  key={sec.num}
                  id={`enc-sec-${sec.num}`}
                  className="card-luxe overflow-hidden"
                  data-testid={`enc-section-card-${sec.num}`}
                >
                  {/* Cabeçalho Clicável para Expandir / Recolher */}
                  <button
                    type="button"
                    onClick={() => toggleSec(sec.num)}
                    data-testid={`toggle-enc-sec-${sec.num}`}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-secondary/30 sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
                        {String(sec.num).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="text-[0.65rem] uppercase tracking-widest text-teal">
                          {sec.group}
                        </span>
                        <h3 className="font-display text-2xl text-foreground">{sec.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium ${
                          st === "filled"
                            ? "bg-teal/20 text-teal"
                            : st === "partial"
                              ? "bg-gold/20 text-gold"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {st === "filled"
                          ? "Preenchida"
                          : st === "partial"
                            ? "Em andamento"
                            : "Vazia"}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Corpo da Seção */}
                  {isOpen && (
                    <div
                      className="space-y-5 border-t p-4 sm:p-6"
                      data-testid={`enc-section-body-${sec.num}`}
                    >
                      {/* Ações especiais da Seção 33 (Resumo Enciclopédico) */}
                      {sec.num === 33 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-teal/40 bg-teal/10 p-3.5">
                          <div className="text-xs">
                            <strong className="text-foreground">
                              Montador Inteligente de Resumo Enciclopédico:
                            </strong>{" "}
                            <span className="text-muted-foreground">
                              Gera uma introdução enciclopédica utilizando apenas os campos já
                              preenchidos nesta ficha, sem inventar informações.
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleBuildSummary}
                              className="btn text-xs"
                              data-testid="btn-montar-resumo-enciclopedico"
                            >
                              <Wand2 className="h-4 w-4" /> Montar resumo com dados preenchidos
                            </button>
                            <button
                              type="button"
                              onClick={copySummary}
                              className="btn-ghost text-xs"
                              data-testid="btn-copiar-resumo-enciclopedico"
                            >
                              {copiedSummary ? (
                                <>
                                  <Check className="h-4 w-4 text-teal" /> Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" /> Copiar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Campos Estruturados da Seção */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {fields.map((fSpec) => {
                          const val = (record.sections[fSpec.key] as string) ?? "";
                          const isLong = fSpec.type === "long";
                          return (
                            <div key={String(fSpec.key)} className={isLong ? "sm:col-span-2" : ""}>
                              <label htmlFor={`sec-${sec.num}-${String(fSpec.key)}`}>
                                {fSpec.label}
                              </label>
                              {isLong ? (
                                <textarea
                                  id={`sec-${sec.num}-${String(fSpec.key)}`}
                                  rows={3}
                                  value={val}
                                  onChange={(e) => upSec(fSpec.key, e.target.value)}
                                  placeholder={fSpec.placeholder}
                                  data-testid={`field-${String(fSpec.key)}`}
                                />
                              ) : (
                                <input
                                  id={`sec-${sec.num}-${String(fSpec.key)}`}
                                  value={val}
                                  onChange={(e) => upSec(fSpec.key, e.target.value)}
                                  placeholder={fSpec.placeholder}
                                  data-testid={`field-${String(fSpec.key)}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Seção 1: Paleta de Cores Nacionais / Simbólicas */}
                      {sec.num === 1 && (
                        <div className="rounded-2xl border bg-background/40 p-4">
                          <PaletteStudio
                            palettes={record.sections.nationalColors ?? []}
                            savedGlobalPalettes={[]}
                            onChange={(next) => upSec("nationalColors", next)}
                          />
                        </div>
                      )}

                      {/* Seção 2: Atalho / Integração de Mapas */}
                      {sec.num === 2 && (
                        <div className="rounded-2xl border bg-background/40 p-4">
                          <EncyclopediaMapStudio
                            maps={record.maps}
                            currentRecordId={record.id}
                            allRecords={allRecords}
                            onChangeMaps={(next) => up("maps", next)}
                          />
                        </div>
                      )}

                      {/* Seção 3: Lista Repetível de Divisões Territoriais (Províncias, Estados, Ducados, Setores) */}
                      {sec.num === 3 && (
                        <div className="space-y-3 rounded-2xl border bg-background/40 p-4">
                          <h4 className="font-display text-lg">
                            Unidades Territoriais Cadastradas ({record.territorialDivisions.length})
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-4">
                            <input
                              value={divName}
                              onChange={(e) => setDivName(e.target.value)}
                              placeholder="Nome da província/setor…"
                            />
                            <input
                              value={divType}
                              onChange={(e) => setDivType(e.target.value)}
                              placeholder="Tipo (Ducado, Estado, Setor)…"
                            />
                            <input
                              value={divCapital}
                              onChange={(e) => setDivCapital(e.target.value)}
                              placeholder="Capital regional…"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!divName.trim()) return;
                                const item: TerritorialDivisionItem = {
                                  id: `wtd_${Date.now()}`,
                                  name: divName.trim(),
                                  type: divType.trim() || "Província",
                                  capitalOrSeat: divCapital.trim(),
                                  autonomousLevel: "",
                                  description: divDesc.trim(),
                                };
                                up("territorialDivisions", [...record.territorialDivisions, item]);
                                setDivName("");
                                setDivCapital("");
                                setDivDesc("");
                              }}
                              className="btn text-xs"
                            >
                              <Plus className="h-4 w-4" /> Adicionar divisão
                            </button>
                          </div>
                          {record.territorialDivisions.length > 0 && (
                            <ul className="space-y-1.5 pt-2">
                              {record.territorialDivisions.map((td) => (
                                <li
                                  key={td.id}
                                  className="flex items-center justify-between rounded-xl border bg-secondary/40 px-3 py-2 text-xs"
                                >
                                  <span>
                                    <strong>{td.name}</strong> ({td.type})
                                    {td.capitalOrSeat ? ` · Sede: ${td.capitalOrSeat}` : ""}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      up(
                                        "territorialDivisions",
                                        record.territorialDivisions.filter((x) => x.id !== td.id),
                                      )
                                    }
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Seção 4: Sistema Completo de Acontecimentos Históricos & Linha do Tempo */}
                      {sec.num === 4 && (
                        <EncyclopediaTimelineManager
                          events={record.historicalEvents}
                          onChangeEvents={(next) => up("historicalEvents", next)}
                          characters={characters}
                          books={books}
                          worldRecords={allRecords}
                          organizations={organizations}
                          currentRecordId={record.id}
                        />
                      )}

                      {/* Seção 28: Sistema Interativo de Curiosidades Nacionais */}
                      {sec.num === 28 && (
                        <EncyclopediaCuriositiesManager
                          items={record.curiosities}
                          onChange={(next) => up("curiosities", next)}
                        />
                      )}

                      {/* Seção 29: Sistema de Documentação e Fontes */}
                      {sec.num === 29 && (
                        <div
                          className="space-y-4 rounded-2xl border bg-background/40 p-4"
                          data-testid="sources-manager-sec-29"
                        >
                          <h4 className="font-display text-lg">
                            Fontes, Crônicas e Referências ({record.sources.length})
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <label htmlFor="src-title">Título da fonte</label>
                              <input
                                id="src-title"
                                value={srcTitle}
                                onChange={(e) => setSrcTitle(e.target.value)}
                                placeholder="Ex: Anais da Coroa de Cinzas…"
                                data-testid="input-source-title"
                              />
                            </div>
                            <div>
                              <label htmlFor="src-author">Autor ou instituição</label>
                              <input
                                id="src-author"
                                value={srcAuthor}
                                onChange={(e) => setSrcAuthor(e.target.value)}
                                placeholder="Ex: Arquimago Valen, Arquivo Imperial…"
                              />
                            </div>
                            <div>
                              <label htmlFor="src-type">Tipo de fonte</label>
                              <input
                                id="src-type"
                                value={srcType}
                                onChange={(e) => setSrcType(e.target.value)}
                                placeholder="Documento fictício, Nota de criação, Inspiração…"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <label htmlFor="src-link">Link (opcional)</label>
                              <input
                                id="src-link"
                                value={srcLink}
                                onChange={(e) => setSrcLink(e.target.value)}
                                placeholder="https://…"
                              />
                            </div>
                            <div>
                              <label htmlFor="src-pub">Data de publicação</label>
                              <input
                                id="src-pub"
                                value={srcPubDate}
                                onChange={(e) => setSrcPubDate(e.target.value)}
                                placeholder="Data real ou fictícia…"
                              />
                            </div>
                            <div>
                              <label htmlFor="src-rel">
                                Grau de confiabilidade (definido pelo autor)
                              </label>
                              <input
                                id="src-rel"
                                value={srcReliability}
                                onChange={(e) => setSrcReliability(e.target.value)}
                                placeholder="Ex: Canônico, Relato parcial, Lenda…"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label htmlFor="src-info">Informação relacionada</label>
                              <input
                                id="src-info"
                                value={srcInfo}
                                onChange={(e) => setSrcInfo(e.target.value)}
                                placeholder="A qual aspecto do país/mundo esta fonte se refere…"
                              />
                            </div>
                            <div>
                              <label htmlFor="src-obs">Observações</label>
                              <input
                                id="src-obs"
                                value={srcObs}
                                onChange={(e) => setSrcObs(e.target.value)}
                                placeholder="Notas sobre o documento…"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (!srcTitle.trim()) return;
                                if (editingSrcId) {
                                  up(
                                    "sources",
                                    record.sources.map((s) =>
                                      s.id === editingSrcId
                                        ? {
                                            ...s,
                                            title: srcTitle.trim(),
                                            authorOrInstitution: srcAuthor.trim(),
                                            sourceType: srcType.trim(),
                                            link: srcLink.trim(),
                                            publicationDate: srcPubDate.trim(),
                                            consultationDate: srcConsDate.trim(),
                                            relatedInfo: srcInfo.trim(),
                                            reliabilityDegree: srcReliability.trim(),
                                            observations: srcObs.trim(),
                                          }
                                        : s,
                                    ),
                                  );
                                  setEditingSrcId(null);
                                } else {
                                  const newSrc: EncyclopediaSourceItem = {
                                    id: `wsrc_${Date.now()}`,
                                    title: srcTitle.trim(),
                                    authorOrInstitution: srcAuthor.trim(),
                                    sourceType: srcType.trim(),
                                    link: srcLink.trim(),
                                    publicationDate: srcPubDate.trim(),
                                    consultationDate: srcConsDate.trim(),
                                    relatedInfo: srcInfo.trim(),
                                    reliabilityDegree: srcReliability.trim(),
                                    observations: srcObs.trim(),
                                    relatedRecordIds: [],
                                  };
                                  up("sources", [...record.sources, newSrc]);
                                }
                                setSrcTitle("");
                                setSrcAuthor("");
                                setSrcLink("");
                                setSrcPubDate("");
                                setSrcInfo("");
                                setSrcReliability("");
                                setSrcObs("");
                              }}
                              className="btn text-xs"
                              data-testid="btn-add-source"
                            >
                              <Plus className="h-4 w-4" />{" "}
                              {editingSrcId ? "Atualizar fonte" : "Adicionar fonte"}
                            </button>
                          </div>

                          {record.sources.length > 0 && (
                            <ul className="space-y-2">
                              {record.sources.map((s) => (
                                <li
                                  key={s.id}
                                  className="flex items-start justify-between gap-2 rounded-xl border bg-secondary/40 p-3 text-xs"
                                >
                                  <div>
                                    <strong className="text-foreground">{s.title}</strong>{" "}
                                    {s.authorOrInstitution && (
                                      <span className="text-muted-foreground">
                                        — {s.authorOrInstitution}
                                      </span>
                                    )}
                                    <span className="ml-2 rounded bg-background px-1.5 py-0.5 text-[0.65rem] text-teal">
                                      {s.sourceType}
                                    </span>
                                    {s.reliabilityDegree && (
                                      <span className="ml-1 text-[0.65rem] text-gold">
                                        ({s.reliabilityDegree})
                                      </span>
                                    )}
                                    {s.observations && (
                                      <p className="mt-1 text-muted-foreground">{s.observations}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSrcId(s.id);
                                        setSrcTitle(s.title);
                                        setSrcAuthor(s.authorOrInstitution);
                                        setSrcType(s.sourceType);
                                        setSrcLink(s.link);
                                        setSrcPubDate(s.publicationDate);
                                        setSrcInfo(s.relatedInfo);
                                        setSrcReliability(s.reliabilityDegree);
                                        setSrcObs(s.observations);
                                      }}
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        up(
                                          "sources",
                                          record.sources.filter((x) => x.id !== s.id),
                                        )
                                      }
                                      className="p-1 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Seção 31: Hub de Sistemas Mágicos e Transformações dentro da Seção 31 */}
                      {sec.num === 31 && (
                        <div className="rounded-2xl border bg-background/40 p-4">
                          <EncyclopediaEntitiesHub
                            organizations={organizations}
                            magicSystems={magicSystems}
                            transformations={transformations}
                            worldRecords={allRecords}
                            characters={characters}
                            books={books}
                            activeSubTab="magic"
                            currentRecordId={record.id}
                            linkedOrgIds={record.relatedOrganizationIds}
                            linkedMagicIds={record.relatedMagicSystemIds}
                            linkedTransIds={record.relatedTransformationIds}
                            onToggleLinkOrg={(id) => toggleRelationId("relatedOrganizationIds", id)}
                            onToggleLinkMagic={(id) =>
                              toggleRelationId("relatedMagicSystemIds", id)
                            }
                            onToggleLinkTrans={(id) =>
                              toggleRelationId("relatedTransformationIds", id)
                            }
                          />
                        </div>
                      )}

                      {/* Seção 32: Cadastro Repetível de Povos e Espécies Inteligentes */}
                      {sec.num === 32 && (
                        <div className="space-y-3 rounded-2xl border bg-background/40 p-4">
                          <h4 className="font-display text-lg">
                            Povos e Espécies Inteligentes ({record.speciesList.length})
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              value={spName}
                              onChange={(e) => setSpName(e.target.value)}
                              placeholder="Nome do povo ou espécie…"
                              data-testid="input-species-name"
                            />
                            <input
                              value={spOrigin}
                              onChange={(e) => setSpOrigin(e.target.value)}
                              placeholder="Origem e habitat…"
                            />
                            <input
                              value={spTraits}
                              onChange={(e) => setSpTraits(e.target.value)}
                              placeholder="Traços físicos e biologia…"
                            />
                            <input
                              value={spAbilities}
                              onChange={(e) => setSpAbilities(e.target.value)}
                              placeholder="Habilidades, magia ou tecnologia própria…"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={spCulture}
                              onChange={(e) => setSpCulture(e.target.value)}
                              placeholder="Cultura e relação com outros povos…"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!spName.trim()) return;
                                const item: IntelligentSpeciesItem = {
                                  id: `wsp_${Date.now()}`,
                                  name: spName.trim(),
                                  originAndHabitat: spOrigin.trim(),
                                  physicalTraits: spTraits.trim(),
                                  longevityAndBiology: "",
                                  cultureAndSociety: spCulture.trim(),
                                  abilitiesOrMagic: spAbilities.trim(),
                                  relationsWithOtherPeoples: "",
                                };
                                up("speciesList", [...record.speciesList, item]);
                                setSpName("");
                                setSpOrigin("");
                                setSpTraits("");
                                setSpAbilities("");
                                setSpCulture("");
                              }}
                              className="btn shrink-0 text-xs"
                              data-testid="btn-add-species"
                            >
                              <Plus className="h-4 w-4" /> Adicionar espécie/povo
                            </button>
                          </div>

                          {record.speciesList.length > 0 && (
                            <div className="grid gap-2 pt-2 sm:grid-cols-2">
                              {record.speciesList.map((sp) => (
                                <div
                                  key={sp.id}
                                  className="flex items-start justify-between rounded-xl border bg-secondary/40 p-3 text-xs"
                                >
                                  <div>
                                    <strong className="font-display text-base text-foreground">
                                      {sp.name}
                                    </strong>
                                    {sp.originAndHabitat && (
                                      <p className="text-teal">Habitat: {sp.originAndHabitat}</p>
                                    )}
                                    {sp.physicalTraits && (
                                      <p className="text-muted-foreground">{sp.physicalTraits}</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      up(
                                        "speciesList",
                                        record.speciesList.filter((x) => x.id !== sp.id),
                                      )
                                    }
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notas Livres da Seção */}
                      <div>
                        <label htmlFor={`sec-note-${sec.num}`}>
                          Notas adicionais da Seção {sec.num} (opcional)
                        </label>
                        <textarea
                          id={`sec-note-${sec.num}`}
                          rows={2}
                          value={record.sectionNotes[sec.num] ?? ""}
                          onChange={(e) =>
                            up("sectionNotes", {
                              ...record.sectionNotes,
                              [sec.num]: e.target.value,
                            })
                          }
                          placeholder="Anotações livres, exceções ou observações para esta seção…"
                        />
                      </div>

                      {/* Gerenciador de Perguntas Editáveis e Personalizadas da Seção */}
                      <EncyclopediaQuestionManager
                        sectionNumber={sec.num}
                        sectionTitle={sec.title}
                        recordQuestions={record.customQuestions ?? []}
                        globalQuestions={globalQuestions}
                        answers={record.customAnswers ?? {}}
                        removedDefaultIds={record.removedDefaultQuestionIds ?? []}
                        onChangeQuestions={(next) => up("customQuestions", next)}
                        onChangeAnswers={(next) => up("customAnswers", next)}
                        onChangeRemovedDefaults={(next) => up("removedDefaultQuestionIds", next)}
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
