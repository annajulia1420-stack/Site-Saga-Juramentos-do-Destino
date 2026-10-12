import { useState, useRef } from "react";
import {
  Map,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  ImagePlus,
  Compass,
  Globe2,
  X,
  Check,
  Info,
} from "lucide-react";
import type {
  EncyclopediaMapItem,
  EncyclopediaMapMarker,
  MapModalityType,
  MapMarkerType,
  WorldEncyclopediaRecord,
} from "@/lib/encyclopedia-types";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";

const MARKER_TYPES: MapMarkerType[] = [
  "Capital",
  "Cidade",
  "Região",
  "Fronteira",
  "Montanha",
  "Rio",
  "Mar / Oceano",
  "Ilha",
  "Reino",
  "Império",
  "Território",
  "Local mágico",
  "Ruína",
  "Local histórico",
  "Base / Instalação tecnológica",
  "Ponto de interesse",
];

const MODALITY_LABELS: Record<MapModalityType, { title: string; subtitle: string }> = {
  real_world: {
    title: "Modalidade A — Mapa do mundo real",
    subtitle:
      "Referência geográfica real: país existente, coordenadas, países vizinhos e localização.",
  },
  fictional_in_real_world: {
    title: "Modalidade B — País fictício no mundo real",
    subtitle:
      "País fictício inserido em versão alternativa da Terra (continente, coordenadas aproximadas e fronteiras).",
  },
  fictional_world: {
    title: "Modalidade C — Mapa de mundo fictício",
    subtitle:
      "Mundos inventados com upload de mapa, marcadores visuais de capitais, reinos, rios, ruínas e bases tecnológicas.",
  },
};

export function EncyclopediaMapStudio({
  maps,
  currentRecordId,
  allRecords,
  onChangeMaps,
}: {
  maps: EncyclopediaMapItem[];
  currentRecordId: string;
  allRecords: WorldEncyclopediaRecord[];
  onChangeMaps: (next: EncyclopediaMapItem[]) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(maps[0]?.id ?? null);

  // Estado do formulário de Mapa
  const [title, setTitle] = useState("");
  const [modality, setModality] = useState<MapModalityType>("fictional_world");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [realWorldCountryRef, setRealWorldCountryRef] = useState("");
  const [continent, setContinent] = useState("");
  const [region, setRegion] = useState("");
  const [approximateCoordinates, setApproximateCoordinates] = useState("");
  const [neighboringCountries, setNeighboringCountries] = useState("");
  const [landAndSeaBorders, setLandAndSeaBorders] = useState("");
  const [citiesPosition, setCitiesPosition] = useState("");
  const [realGeographyIntegration, setRealGeographyIntegration] = useState("");
  const [annotations, setAnnotations] = useState("");
  const [linkedRecordId, setLinkedRecordId] = useState<string>(currentRecordId);

  // Estado de novo marcador
  const [markerName, setMarkerName] = useState("");
  const [markerType, setMarkerType] = useState<MapMarkerType>("Capital");
  const [markerRegion, setMarkerRegion] = useState("");
  const [markerCoords, setMarkerCoords] = useState("");
  const [markerX, setMarkerX] = useState(50);
  const [markerY, setMarkerY] = useState(50);
  const [markerDesc, setMarkerDesc] = useState("");
  const [markerRelId, setMarkerRelId] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const resetMapForm = () => {
    setEditingMapId(null);
    setTitle("");
    setModality("fictional_world");
    setDescription("");
    setImageUrl(undefined);
    setRealWorldCountryRef("");
    setContinent("");
    setRegion("");
    setApproximateCoordinates("");
    setNeighboringCountries("");
    setLandAndSeaBorders("");
    setCitiesPosition("");
    setRealGeographyIntegration("");
    setAnnotations("");
    setLinkedRecordId(currentRecordId);
    setShowCreate(false);
  };

  const openEditMap = (m: EncyclopediaMapItem) => {
    setEditingMapId(m.id);
    setTitle(m.title);
    setModality(m.modality);
    setDescription(m.description);
    setImageUrl(m.imageUrl);
    setRealWorldCountryRef(m.realWorldCountryRef ?? "");
    setContinent(m.continent ?? "");
    setRegion(m.region ?? "");
    setApproximateCoordinates(m.approximateCoordinates ?? "");
    setNeighboringCountries(m.neighboringCountries ?? "");
    setLandAndSeaBorders(m.landAndSeaBorders ?? "");
    setCitiesPosition(m.citiesPosition ?? "");
    setRealGeographyIntegration(m.realGeographyIntegration ?? "");
    setAnnotations(m.annotations ?? "");
    setLinkedRecordId(m.linkedRecordId ?? currentRecordId);
    setShowCreate(true);
  };

  const handleSaveMap = () => {
    if (!title.trim()) return;
    if (editingMapId) {
      const next = maps.map((m) =>
        m.id === editingMapId
          ? {
              ...m,
              title: title.trim(),
              modality,
              description: description.trim(),
              imageUrl,
              realWorldCountryRef: realWorldCountryRef.trim() || undefined,
              continent: continent.trim() || undefined,
              region: region.trim() || undefined,
              approximateCoordinates: approximateCoordinates.trim() || undefined,
              neighboringCountries: neighboringCountries.trim() || undefined,
              landAndSeaBorders: landAndSeaBorders.trim() || undefined,
              citiesPosition: citiesPosition.trim() || undefined,
              realGeographyIntegration: realGeographyIntegration.trim() || undefined,
              annotations: annotations.trim() || undefined,
              linkedRecordId: linkedRecordId || currentRecordId,
            }
          : m,
      );
      onChangeMaps(next);
      setSelectedMapId(editingMapId);
    } else {
      const id = `wmap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newMap: EncyclopediaMapItem = {
        id,
        title: title.trim(),
        modality,
        description: description.trim(),
        imageUrl,
        realWorldCountryRef: realWorldCountryRef.trim() || undefined,
        continent: continent.trim() || undefined,
        region: region.trim() || undefined,
        approximateCoordinates: approximateCoordinates.trim() || undefined,
        neighboringCountries: neighboringCountries.trim() || undefined,
        landAndSeaBorders: landAndSeaBorders.trim() || undefined,
        citiesPosition: citiesPosition.trim() || undefined,
        realGeographyIntegration: realGeographyIntegration.trim() || undefined,
        annotations: annotations.trim() || undefined,
        linkedRecordId: linkedRecordId || currentRecordId,
        markers: [],
        createdAt: new Date().toLocaleDateString("pt-BR"),
      };
      onChangeMaps([...maps, newMap]);
      setSelectedMapId(id);
    }
    resetMapForm();
  };

  const activeMap = maps.find((m) => m.id === selectedMapId) ?? maps[0] ?? null;

  const addMarkerToActiveMap = () => {
    if (!activeMap || !markerName.trim()) return;
    const mk: EncyclopediaMapMarker = {
      id: `wmk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: markerName.trim(),
      type: markerType,
      regionName: markerRegion.trim(),
      coordinatesText: markerCoords.trim() || `${markerX}%, ${markerY}%`,
      xPercent: Math.max(0, Math.min(100, markerX)),
      yPercent: Math.max(0, Math.min(100, markerY)),
      description: markerDesc.trim(),
      relatedRecordId: markerRelId || undefined,
    };
    const next = maps.map((m) =>
      m.id === activeMap.id ? { ...m, markers: [...m.markers, mk] } : m,
    );
    onChangeMaps(next);
    setMarkerName("");
    setMarkerRegion("");
    setMarkerCoords("");
    setMarkerDesc("");
    setMarkerRelId("");
  };

  const removeMarker = (mapId: string, mkId: string) => {
    onChangeMaps(
      maps.map((m) =>
        m.id === mapId ? { ...m, markers: m.markers.filter((x) => x.id !== mkId) } : m,
      ),
    );
  };

  return (
    <div className="space-y-5" data-testid="encyclopedia-map-studio">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl">Mapas e Geografia Interativa ({maps.length})</h3>
          <p className="text-xs text-muted-foreground">
            Suporte às 3 modalidades: Mundo Real, País Fictício no Mundo Real e Mapa de Mundo
            Fictício com marcadores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetMapForm();
            setShowCreate(true);
          }}
          className="btn text-xs"
          data-testid="btn-novo-mapa"
        >
          <Plus className="h-4 w-4" /> Criar ou importar mapa
        </button>
      </div>

      {/* Aviso transparente sobre integrações externas de mapas vs uso local gratuito */}
      <div className="flex items-start gap-2.5 rounded-xl border border-teal/40 bg-teal/5 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
        <div>
          <strong className="text-foreground">
            Nota sobre serviços de mapas e camadas interativas:
          </strong>{" "}
          APIs comerciais de geocodificação em tempo real (como Google Maps Platform) exigem chave
          de API e faturamento após a cota gratuita. Para manter o aplicativo 100% gratuito e
          funcional offline, você pode registrar coordenadas, países de referência e importar
          imagens de mapas próprios com posicionamento interativo de marcadores (clique diretamente
          sobre a imagem do mapa ou defina coordenadas X/Y).
        </div>
      </div>

      {/* Formulário de Criação/Edição de Mapa */}
      {showCreate && (
        <div
          className="card-luxe space-y-4 border-primary/50 p-4 sm:p-5"
          data-testid="map-editor-modal"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-display text-xl">
              {editingMapId ? "Editar mapa" : "Novo mapa enciclopédico"}
            </h4>
            <button
              type="button"
              onClick={resetMapForm}
              className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>

          {/* Seleção da Modalidade */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(MODALITY_LABELS) as MapModalityType[]).map((mod) => {
              const active = modality === mod;
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setModality(mod)}
                  data-testid={`map-modality-${mod}`}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-teal bg-teal/15 text-foreground"
                      : "bg-background/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-display text-base font-medium text-foreground">
                    {MODALITY_LABELS[mod].title}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {MODALITY_LABELS[mod].subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wmap-title">Título do mapa</label>
              <input
                id="wmap-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mapa Político do Reino de Valdoria…"
                data-testid="input-map-title"
              />
            </div>

            <div>
              <label htmlFor="wmap-linked-rec">Vincular a país, mundo, cidade ou região</label>
              <select
                id="wmap-linked-rec"
                value={linkedRecordId}
                onChange={(e) => setLinkedRecordId(e.target.value)}
                data-testid="select-map-linked-record"
              >
                <option value={currentRecordId}>Registro atual desta ficha</option>
                {allRecords
                  .filter((r) => r.id !== currentRecordId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || "Sem nome"} ({r.category})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="wmap-desc">Descrição geral do mapa</label>
            <textarea
              id="wmap-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escala, época retratada, autor cartográfico ou contexto geopolítico…"
              data-testid="input-map-description"
            />
          </div>

          {/* Campos específicos para Mundo Real (Modalidade A) e País Fictício no Mundo Real (Modalidade B) */}
          {(modality === "real_world" || modality === "fictional_in_real_world") && (
            <div className="grid gap-3 rounded-xl border bg-secondary/20 p-3.5 sm:grid-cols-2">
              {modality === "fictional_in_real_world" && (
                <div className="sm:col-span-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold">
                  Localização Fictícia no Mundo Real: este território representa uma geografia
                  ficcional/alternativa e não um Estado real oficialmente reconhecido.
                </div>
              )}

              <div>
                <label htmlFor="wmap-real-ref">País ou mapa real de referência</label>
                <input
                  id="wmap-real-ref"
                  value={realWorldCountryRef}
                  onChange={(e) => setRealWorldCountryRef(e.target.value)}
                  placeholder="Ex: Escócia, Península Ibérica, Mar do Norte…"
                />
              </div>

              <div>
                <label htmlFor="wmap-coords">Coordenadas geográficas / aproximadas</label>
                <input
                  id="wmap-coords"
                  value={approximateCoordinates}
                  onChange={(e) => setApproximateCoordinates(e.target.value)}
                  placeholder="Ex: 56°29'N 4°12'W"
                />
              </div>

              <div>
                <label htmlFor="wmap-continent">Continente</label>
                <input
                  id="wmap-continent"
                  value={continent}
                  onChange={(e) => setContinent(e.target.value)}
                  placeholder="Ex: Europa, Ásia, América do Sul…"
                />
              </div>

              <div>
                <label htmlFor="wmap-region">Região</label>
                <input
                  id="wmap-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Ex: Atlântico Norte, Cáucaso, Mediterrâneo…"
                />
              </div>

              <div>
                <label htmlFor="wmap-neighbors">Países vizinhos</label>
                <input
                  id="wmap-neighbors"
                  value={neighboringCountries}
                  onChange={(e) => setNeighboringCountries(e.target.value)}
                  placeholder="Países que fazem fronteira direta ou marítima…"
                />
              </div>

              <div>
                <label htmlFor="wmap-borders">Fronteiras terrestres e marítimas</label>
                <input
                  id="wmap-borders"
                  value={landAndSeaBorders}
                  onChange={(e) => setLandAndSeaBorders(e.target.value)}
                  placeholder="Limites naturais, estreitos, cordilheiras…"
                />
              </div>

              {modality === "fictional_in_real_world" && (
                <>
                  <div>
                    <label htmlFor="wmap-cities-pos">Posição das cidades</label>
                    <input
                      id="wmap-cities-pos"
                      value={citiesPosition}
                      onChange={(e) => setCitiesPosition(e.target.value)}
                      placeholder="Onde ficam a capital e portos principais…"
                    />
                  </div>
                  <div>
                    <label htmlFor="wmap-geo-fit">
                      Como o país se encaixa na geografia existente
                    </label>
                    <input
                      id="wmap-geo-fit"
                      value={realGeographyIntegration}
                      onChange={(e) => setRealGeographyIntegration(e.target.value)}
                      placeholder="Ex: Arquipélago fictício situado a oeste da Irlanda…"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label htmlFor="wmap-annotations">Anotações cartográficas</label>
            <textarea
              id="wmap-annotations"
              rows={2}
              value={annotations}
              onChange={(e) => setAnnotations(e.target.value)}
              placeholder="Rotas comerciais, zonas proibidas, correntes marítimas ou notas de fronteira…"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                data-testid="input-file-map-image"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const dataUrl = await processImageFile(file);
                  const stored = await storeMediaDataUrl(`mapimg_${Date.now()}`, dataUrl);
                  setImageUrl(stored);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost text-xs"
              >
                <ImagePlus className="h-4 w-4" />{" "}
                {imageUrl ? "Trocar imagem do mapa" : "Importar imagem do mapa"}
              </button>
              {imageUrl && (
                <div className="h-12 w-16 overflow-hidden rounded-lg border">
                  <MediaImage
                    src={imageUrl}
                    alt="Prévia do mapa"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveMap}
              className="btn text-xs"
              data-testid="btn-salvar-mapa"
            >
              <Check className="h-4 w-4" /> {editingMapId ? "Atualizar mapa" : "Salvar mapa"}
            </button>
          </div>
        </div>
      )}

      {/* Lista e Visualizador Interativo do Mapa Selecionado */}
      {maps.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Map className="mx-auto h-8 w-8 text-teal" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum mapa vinculado ainda. Crie ou importe um mapa para documentar fronteiras,
            cidades, reinos e marcadores.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Seletor de mapas do registro */}
          <div className="flex flex-wrap gap-2">
            {maps.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMapId(m.id)}
                data-testid={`select-map-tab-${m.id}`}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition ${
                  activeMap?.id === m.id
                    ? "border-teal bg-teal/20 text-foreground font-semibold"
                    : "bg-background/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe2 className="h-3.5 w-3.5 text-teal" />
                {m.title}
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem]">
                  {m.markers.length} pts
                </span>
              </button>
            ))}
          </div>

          {activeMap && (
            <div className="card-luxe space-y-5 p-4 sm:p-6" data-testid="active-map-viewer">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                <div>
                  <span className="text-[0.7rem] uppercase tracking-wider text-teal">
                    {MODALITY_LABELS[activeMap.modality].title}
                  </span>
                  <h4 className="font-display text-2xl">{activeMap.title}</h4>
                  {activeMap.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{activeMap.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditMap(activeMap)}
                    className="btn-ghost !min-h-8 !px-3 !py-1 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar dados do mapa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = maps.filter((x) => x.id !== activeMap.id);
                      onChangeMaps(next);
                      setSelectedMapId(next[0]?.id ?? null);
                    }}
                    className="btn-ghost !min-h-8 !px-3 !py-1 text-xs text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir mapa
                  </button>
                </div>
              </div>

              {/* Metadados Geográficos */}
              {(activeMap.realWorldCountryRef ||
                activeMap.continent ||
                activeMap.region ||
                activeMap.approximateCoordinates ||
                activeMap.neighboringCountries ||
                activeMap.landAndSeaBorders) && (
                <div className="grid gap-3 rounded-xl border bg-background/40 p-3.5 text-xs sm:grid-cols-3">
                  {activeMap.realWorldCountryRef && (
                    <div>
                      <span className="text-muted-foreground">Referência:</span>{" "}
                      <strong>{activeMap.realWorldCountryRef}</strong>
                    </div>
                  )}
                  {activeMap.continent && (
                    <div>
                      <span className="text-muted-foreground">Continente:</span>{" "}
                      <strong>{activeMap.continent}</strong>
                    </div>
                  )}
                  {activeMap.region && (
                    <div>
                      <span className="text-muted-foreground">Região:</span>{" "}
                      <strong>{activeMap.region}</strong>
                    </div>
                  )}
                  {activeMap.approximateCoordinates && (
                    <div>
                      <span className="text-muted-foreground">Coordenadas:</span>{" "}
                      <strong>{activeMap.approximateCoordinates}</strong>
                    </div>
                  )}
                  {activeMap.neighboringCountries && (
                    <div>
                      <span className="text-muted-foreground">Vizinhos:</span>{" "}
                      <strong>{activeMap.neighboringCountries}</strong>
                    </div>
                  )}
                  {activeMap.landAndSeaBorders && (
                    <div>
                      <span className="text-muted-foreground">Fronteiras:</span>{" "}
                      <strong>{activeMap.landAndSeaBorders}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Tela Visual do Mapa com Marcadores Interativos Clicáveis */}
              <div
                className="relative min-h-[280px] w-full overflow-hidden rounded-2xl border bg-secondary/50"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  if (rect.width > 0 && rect.height > 0) {
                    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                    setMarkerX(Math.max(0, Math.min(100, x)));
                    setMarkerY(Math.max(0, Math.min(100, y)));
                  }
                }}
                title="Clique em qualquer ponto do mapa para capturar as coordenadas X/Y do próximo marcador"
              >
                {activeMap.imageUrl ? (
                  <MediaImage
                    src={activeMap.imageUrl}
                    alt={activeMap.title}
                    className="max-h-[460px] w-full object-contain"
                  />
                ) : (
                  <div className="flex h-72 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
                    <Compass className="mb-2 h-10 w-10 text-teal/60" />
                    <span>
                      Quadro Cartográfico Vetorial ({activeMap.title}) — Clique para posicionar
                      marcadores ou importe uma imagem de mapa.
                    </span>
                  </div>
                )}

                {activeMap.markers.map((mk) => (
                  <div
                    key={mk.id}
                    style={{
                      left: `${mk.xPercent}%`,
                      top: `${mk.yPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    title={`${mk.name} (${mk.type}) — ${mk.description}`}
                  >
                    <div className="flex items-center gap-1 rounded-full border border-gold bg-background/90 px-2 py-0.5 text-[0.65rem] font-semibold text-foreground shadow">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span>{mk.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar Marcadores (Cidades, Capitais, Montanhas, Rios, Reinos, Locais Mágicos, Ruínas, Bases...) */}
              <div className="space-y-3 rounded-2xl border bg-background/40 p-4">
                <h5 className="font-display text-lg">
                  Adicionar Marcador / Ponto de Interesse no Mapa
                </h5>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="mk-name">Nome do local</label>
                    <input
                      id="mk-name"
                      value={markerName}
                      onChange={(e) => setMarkerName(e.target.value)}
                      placeholder="Ex: Cidadela de Solis, Rio de Prata…"
                      data-testid="input-map-marker-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="mk-type">Tipo de marcador</label>
                    <select
                      id="mk-type"
                      value={markerType}
                      onChange={(e) => setMarkerType(e.target.value as MapMarkerType)}
                      data-testid="select-map-marker-type"
                    >
                      {MARKER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mk-region">Região / Território</label>
                    <input
                      id="mk-region"
                      value={markerRegion}
                      onChange={(e) => setMarkerRegion(e.target.value)}
                      placeholder="Ex: Terras Altas do Norte"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label htmlFor="mk-coords">Coordenadas no mapa</label>
                    <input
                      id="mk-coords"
                      value={markerCoords}
                      onChange={(e) => setMarkerCoords(e.target.value)}
                      placeholder="Ex: Quadrante B-3 ou 42°N"
                    />
                  </div>
                  <div>
                    <label htmlFor="mk-x">Posição X (%)</label>
                    <input
                      id="mk-x"
                      type="number"
                      min={0}
                      max={100}
                      value={markerX}
                      onChange={(e) => setMarkerX(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="mk-y">Posição Y (%)</label>
                    <input
                      id="mk-y"
                      type="number"
                      min={0}
                      max={100}
                      value={markerY}
                      onChange={(e) => setMarkerY(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="mk-rel">Registro vinculado (opcional)</label>
                    <select
                      id="mk-rel"
                      value={markerRelId}
                      onChange={(e) => setMarkerRelId(e.target.value)}
                    >
                      <option value="">Nenhum</option>
                      {allRecords.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name || "Sem nome"} ({r.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1">
                    <label htmlFor="mk-desc">Descrição do ponto</label>
                    <input
                      id="mk-desc"
                      value={markerDesc}
                      onChange={(e) => setMarkerDesc(e.target.value)}
                      placeholder="Importância estratégica, histórica ou mágica deste ponto…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMarkerToActiveMap}
                    className="btn text-xs"
                    data-testid="btn-add-map-marker"
                  >
                    <Plus className="h-4 w-4" /> Adicionar marcador
                  </button>
                </div>

                {activeMap.markers.length > 0 && (
                  <div className="grid gap-2 pt-2 sm:grid-cols-2">
                    {activeMap.markers.map((mk) => (
                      <div
                        key={mk.id}
                        className="flex items-center justify-between gap-2 rounded-xl border bg-secondary/40 px-3 py-2 text-xs"
                        data-testid="map-marker-item"
                      >
                        <div>
                          <span className="font-semibold text-foreground">{mk.name}</span>{" "}
                          <span className="text-teal">({mk.type})</span>
                          {mk.regionName && (
                            <span className="text-muted-foreground"> · {mk.regionName}</span>
                          )}
                          <span className="ml-1 font-mono text-[0.65rem] text-muted-foreground">
                            [{mk.coordinatesText}]
                          </span>
                          {mk.description && (
                            <p className="text-muted-foreground">{mk.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMarker(activeMap.id, mk.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
