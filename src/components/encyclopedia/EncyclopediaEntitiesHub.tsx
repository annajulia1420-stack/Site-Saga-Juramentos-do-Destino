import { useState, useRef } from "react";
import {
  Building2,
  Wand2,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Copy,
  ImagePlus,
  X,
  Check,
  Search,
} from "lucide-react";
import { actions, type Character, type Book } from "@/lib/store";
import {
  ORGANIZATION_CATEGORIES,
  type OrganizationCategory,
  type WorldOrganization,
  type WorldMagicSystem,
  type WorldTransformation,
  type WorldEncyclopediaRecord,
} from "@/lib/encyclopedia-types";
import { processImageFile, storeMediaDataUrl } from "@/lib/media-store";
import { MediaImage } from "@/components/MediaImage";
import { PaletteStudio } from "@/components/character/PaletteStudio";
import { TagListEditor } from "@/components/character/TagListEditor";
import { CustomQuestionsManager } from "@/components/character/CustomQuestionsManager";

export function EncyclopediaEntitiesHub({
  organizations,
  magicSystems,
  transformations,
  worldRecords,
  characters,
  books,
  activeSubTab = "organizations",
  currentRecordId,
  linkedOrgIds = [],
  linkedMagicIds = [],
  linkedTransIds = [],
  onToggleLinkOrg,
  onToggleLinkMagic,
  onToggleLinkTrans,
}: {
  organizations: WorldOrganization[];
  magicSystems: WorldMagicSystem[];
  transformations: WorldTransformation[];
  worldRecords: WorldEncyclopediaRecord[];
  characters: Character[];
  books: Book[];
  activeSubTab?: "organizations" | "magic" | "transformations";
  currentRecordId?: string | undefined;
  linkedOrgIds?: string[];
  linkedMagicIds?: string[];
  linkedTransIds?: string[];
  onToggleLinkOrg?: (id: string) => void;
  onToggleLinkMagic?: (id: string) => void;
  onToggleLinkTrans?: (id: string) => void;
}) {
  const [tab, setTab] = useState<"organizations" | "magic" | "transformations">(activeSubTab);
  const [searchQ, setSearchQ] = useState("");

  // Estados de edição para Organizações
  const [orgDraft, setOrgDraft] = useState<WorldOrganization | null>(null);
  const [confirmDelOrgId, setConfirmDelOrgId] = useState<string | null>(null);

  // Estados de edição para Sistemas Mágicos
  const [magicDraft, setMagicDraft] = useState<WorldMagicSystem | null>(null);
  const [confirmDelMagicId, setConfirmDelMagicId] = useState<string | null>(null);

  // Estados de edição para Transformações
  const [transDraft, setTransDraft] = useState<WorldTransformation | null>(null);
  const [confirmDelTransId, setConfirmDelTransId] = useState<string | null>(null);

  const orgLogoRef = useRef<HTMLInputElement | null>(null);
  const magicImgRef = useRef<HTMLInputElement | null>(null);
  const transImgRef = useRef<HTMLInputElement | null>(null);

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <div className="space-y-5" data-testid="encyclopedia-entities-hub">
      {/* Navegação interna: Organizações | Sistemas Mágicos | Transformações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("organizations")}
            data-testid="hub-tab-organizations"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition ${
              tab === "organizations"
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" /> Organizações ({organizations.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("magic")}
            data-testid="hub-tab-magic"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition ${
              tab === "magic"
                ? "border-teal bg-teal text-background font-semibold"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wand2 className="h-4 w-4" /> Sistemas Mágicos ({magicSystems.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("transformations")}
            data-testid="hub-tab-transformations"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition ${
              tab === "transformations"
                ? "border-gold bg-gold text-background font-semibold"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Transformações ({transformations.length})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Pesquisar registro…"
            className="!min-h-9 !pl-8 text-xs"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* ABA 1 — ORGANIZAÇÕES                                                */}
      {/* =================================================================== */}
      {tab === "organizations" && (
        <div className="space-y-4" data-testid="organizations-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-display text-2xl">
                Organizações Políticas, Mágicas, Militares e Corporativas
              </h4>
              <p className="text-xs text-muted-foreground">
                Registros independentes que podem atuar em múltiplos países, mundos, eventos e
                livros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const base = actions.newWorldOrganization();
                if (currentRecordId) {
                  base.originRecordId = currentRecordId;
                  base.actingRecordIds = [currentRecordId];
                }
                setOrgDraft(base);
              }}
              className="btn text-xs"
              data-testid="btn-nova-organizacao"
            >
              <Plus className="h-4 w-4" /> Criar organização
            </button>
          </div>

          {orgDraft && (
            <div
              className="card-luxe space-y-4 border-primary/50 p-4 sm:p-5"
              data-testid="organization-editor-modal"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h5 className="font-display text-xl">{orgDraft.name || "Nova Organização"}</h5>
                <button
                  type="button"
                  onClick={() => setOrgDraft(null)}
                  className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="org-name">Nome da organização</label>
                  <input
                    id="org-name"
                    value={orgDraft.name}
                    onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })}
                    placeholder="Ex: Ordem do Eclipse Rubro…"
                    data-testid="input-org-name"
                  />
                </div>
                <div>
                  <label htmlFor="org-acronym">Sigla</label>
                  <input
                    id="org-acronym"
                    value={orgDraft.acronym}
                    onChange={(e) => setOrgDraft({ ...orgDraft, acronym: e.target.value })}
                    placeholder="Ex: OER"
                    data-testid="input-org-acronym"
                  />
                </div>
                <div>
                  <label htmlFor="org-cat">Categoria</label>
                  <select
                    id="org-cat"
                    value={orgDraft.category}
                    onChange={(e) =>
                      setOrgDraft({
                        ...orgDraft,
                        category: e.target.value as OrganizationCategory,
                      })
                    }
                    data-testid="select-org-category"
                  >
                    {ORGANIZATION_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="org-origin-rec">País ou mundo de origem</label>
                  <select
                    id="org-origin-rec"
                    value={orgDraft.originRecordId ?? ""}
                    onChange={(e) =>
                      setOrgDraft({
                        ...orgDraft,
                        originRecordId: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">Selecionar registro…</option>
                    {worldRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || "Sem nome"} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="org-acting">Área de atuação</label>
                  <input
                    id="org-acting"
                    value={orgDraft.actingArea}
                    onChange={(e) => setOrgDraft({ ...orgDraft, actingArea: e.target.value })}
                    placeholder="Continental, Interplanetária, Clandestina…"
                  />
                </div>
                <div>
                  <label htmlFor="org-hq">Sede principal</label>
                  <input
                    id="org-hq"
                    value={orgDraft.headquarters}
                    onChange={(e) => setOrgDraft({ ...orgDraft, headquarters: e.target.value })}
                    placeholder="Ex: Torre de Marfim de Solis…"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="org-desc">Descrição</label>
                <textarea
                  id="org-desc"
                  rows={2}
                  value={orgDraft.description}
                  onChange={(e) => setOrgDraft({ ...orgDraft, description: e.target.value })}
                  placeholder="O que é esta organização e qual sua reputação…"
                  data-testid="input-org-description"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="org-obj">Objetivos</label>
                  <textarea
                    id="org-obj"
                    rows={2}
                    value={orgDraft.objectives}
                    onChange={(e) => setOrgDraft({ ...orgDraft, objectives: e.target.value })}
                    placeholder="Metas públicas e agendas ocultas…"
                  />
                </div>
                <div>
                  <label htmlFor="org-hist">História da organização</label>
                  <textarea
                    id="org-hist"
                    rows={2}
                    value={orgDraft.history}
                    onChange={(e) => setOrgDraft({ ...orgDraft, history: e.target.value })}
                    placeholder="Como surgiu e momentos marcantes…"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="org-hier">Estrutura hierárquica</label>
                  <input
                    id="org-hier"
                    value={orgDraft.hierarchicalStructure}
                    onChange={(e) =>
                      setOrgDraft({
                        ...orgDraft,
                        hierarchicalStructure: e.target.value,
                      })
                    }
                    placeholder="Patentes, conselhos, círculos internos…"
                  />
                </div>
                <div>
                  <label htmlFor="org-lead">Liderança</label>
                  <input
                    id="org-lead"
                    value={orgDraft.leadership}
                    onChange={(e) => setOrgDraft({ ...orgDraft, leadership: e.target.value })}
                    placeholder="Quem comanda atualmente…"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="org-allies">Aliados</label>
                  <input
                    id="org-allies"
                    value={orgDraft.allies}
                    onChange={(e) => setOrgDraft({ ...orgDraft, allies: e.target.value })}
                    placeholder="Reinos, guildas ou facções aliadas…"
                  />
                </div>
                <div>
                  <label htmlFor="org-rivals">Rivais</label>
                  <input
                    id="org-rivals"
                    value={orgDraft.rivals}
                    onChange={(e) => setOrgDraft({ ...orgDraft, rivals: e.target.value })}
                    placeholder="Inimigos declarados ou concorrentes…"
                  />
                </div>
              </div>

              {/* Vínculo com Personagens e Livros */}
              <div className="space-y-3 rounded-xl border bg-background/50 p-3">
                {characters.length > 0 && (
                  <div>
                    <label className="mb-1 block">Integrantes relacionados (Personagens)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {characters.map((c) => {
                        const active = orgDraft.memberCharacterIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              setOrgDraft({
                                ...orgDraft,
                                memberCharacterIds: toggleId(orgDraft.memberCharacterIds, c.id),
                              })
                            }
                            className={`rounded-lg border px-2.5 py-1 text-xs ${
                              active
                                ? "border-primary bg-primary/20 text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {books.length > 0 && (
                  <div>
                    <label className="mb-1 block">Livros relacionados</label>
                    <div className="flex flex-wrap gap-1.5">
                      {books.map((b) => {
                        const active = orgDraft.bookIds.includes(b.id);
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() =>
                              setOrgDraft({
                                ...orgDraft,
                                bookIds: toggleId(orgDraft.bookIds, b.id),
                              })
                            }
                            className={`rounded-lg border px-2.5 py-1 text-xs ${
                              active
                                ? "border-teal bg-teal/20 text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {b.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="org-notes">Notas personalizadas</label>
                <textarea
                  id="org-notes"
                  rows={2}
                  value={orgDraft.notes}
                  onChange={(e) => setOrgDraft({ ...orgDraft, notes: e.target.value })}
                  placeholder="Segredos, lemas internos ou notas adicionais…"
                />
              </div>

              {/* Perguntas personalizadas da organização */}
              <div className="rounded-xl border bg-background/40 p-3">
                <CustomQuestionsManager
                  characterQuestions={orgDraft.customQuestions ?? []}
                  globalQuestions={[]}
                  answers={orgDraft.customAnswers ?? {}}
                  onChangeQuestions={(next) => setOrgDraft({ ...orgDraft, customQuestions: next })}
                  onChangeAnswers={(next) => setOrgDraft({ ...orgDraft, customAnswers: next })}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={orgLogoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await processImageFile(file, 600);
                      const stored = await storeMediaDataUrl(`orglogo_${orgDraft.id}`, dataUrl);
                      setOrgDraft({ ...orgDraft, symbolOrLogoUrl: stored });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => orgLogoRef.current?.click()}
                    className="btn-ghost text-xs"
                  >
                    <ImagePlus className="h-4 w-4" /> Símbolo ou logotipo
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!orgDraft.name.trim()) return;
                    actions.saveWorldOrganization(orgDraft);
                    if (currentRecordId && onToggleLinkOrg && !linkedOrgIds.includes(orgDraft.id)) {
                      onToggleLinkOrg(orgDraft.id);
                    }
                    setOrgDraft(null);
                  }}
                  className="btn text-xs"
                  data-testid="btn-salvar-organizacao"
                >
                  <Check className="h-4 w-4" /> Salvar organização
                </button>
              </div>
            </div>
          )}

          {/* Listagem de Organizações */}
          <div className="grid gap-3 sm:grid-cols-2">
            {organizations
              .filter((o) => o.name.toLowerCase().includes(searchQ.toLowerCase()))
              .map((org) => {
                const isLinked = linkedOrgIds.includes(org.id);
                return (
                  <div
                    key={org.id}
                    className="card-luxe flex flex-col justify-between p-4"
                    data-testid={`org-card-${org.id}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {org.symbolOrLogoUrl && (
                            <div className="h-10 w-10 overflow-hidden rounded-lg border">
                              <MediaImage
                                src={org.symbolOrLogoUrl}
                                alt={org.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="text-[0.65rem] uppercase tracking-wider text-teal">
                              {org.category}
                              {org.acronym ? ` · ${org.acronym}` : ""}
                            </span>
                            <h5 className="font-display text-xl text-foreground">{org.name}</h5>
                          </div>
                        </div>

                        {onToggleLinkOrg && (
                          <button
                            type="button"
                            onClick={() => onToggleLinkOrg(org.id)}
                            className={`rounded-lg border px-2.5 py-1 text-[0.7rem] ${
                              isLinked
                                ? "border-teal bg-teal/20 text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isLinked ? "Vinculada ✓" : "Vincular"}
                          </button>
                        )}
                      </div>

                      {org.description && (
                        <p className="mt-2 text-xs text-muted-foreground">{org.description}</p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => setOrgDraft(org)}
                        className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Editar
                      </button>
                      {confirmDelOrgId === org.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            actions.deleteWorldOrganization(org.id);
                            setConfirmDelOrgId(null);
                          }}
                          className="btn !min-h-7 !bg-destructive !px-2.5 !py-0.5 text-xs"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelOrgId(org.id)}
                          className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA 2 — SISTEMAS MÁGICOS                                            */}
      {/* =================================================================== */}
      {tab === "magic" && (
        <div className="space-y-4" data-testid="magic-systems-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-display text-2xl">Sistemas Mágicos e Leis Sobrenaturais</h4>
              <p className="text-xs text-muted-foreground">
                Cadastre sistemas mágicos individuais com fonte de energia, regras, custos, poderes
                proibidos e instituições.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const ms = actions.newWorldMagicSystem();
                if (currentRecordId) {
                  ms.affectedRegionIds = [currentRecordId];
                }
                setMagicDraft(ms);
              }}
              className="btn text-xs"
              data-testid="btn-novo-sistema-magico"
            >
              <Plus className="h-4 w-4" /> Criar sistema mágico
            </button>
          </div>

          {magicDraft && (
            <div
              className="card-luxe space-y-4 border-teal/50 p-4 sm:p-5"
              data-testid="magic-system-editor-modal"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h5 className="font-display text-xl">{magicDraft.name || "Novo Sistema Mágico"}</h5>
                <button
                  type="button"
                  onClick={() => setMagicDraft(null)}
                  className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="ms-name">Nome do sistema mágico</label>
                  <input
                    id="ms-name"
                    value={magicDraft.name}
                    onChange={(e) => setMagicDraft({ ...magicDraft, name: e.target.value })}
                    placeholder="Ex: Tecelagem Astral, Alquimia de Sangue…"
                    data-testid="input-magic-name"
                  />
                </div>
                <div>
                  <label htmlFor="ms-origin">Origem</label>
                  <input
                    id="ms-origin"
                    value={magicDraft.origin}
                    onChange={(e) => setMagicDraft({ ...magicDraft, origin: e.target.value })}
                    placeholder="Dádiva primordial, anomalia cósmica, linhagem…"
                  />
                </div>
                <div>
                  <label htmlFor="ms-source">Fonte de energia</label>
                  <input
                    id="ms-source"
                    value={magicDraft.energySource}
                    onChange={(e) =>
                      setMagicDraft({
                        ...magicDraft,
                        energySource: e.target.value,
                      })
                    }
                    placeholder="Ex: Luz estelar, vitalidade, cristais de éter…"
                    data-testid="input-magic-source"
                  />
                </div>
              </div>

              <TagListEditor
                label="Tipos de magia / vertentes"
                items={magicDraft.magicTypes}
                onChange={(next) => setMagicDraft({ ...magicDraft, magicTypes: next })}
                placeholder="Adicionar vertente mágica…"
                suggestions={["Elemental", "Ilusão", "Runas", "Cura", "Invocação", "Gravitacional"]}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ms-users">Usuários (quem pode conjurar)</label>
                  <textarea
                    id="ms-users"
                    rows={2}
                    value={magicDraft.usersDescription}
                    onChange={(e) =>
                      setMagicDraft({
                        ...magicDraft,
                        usersDescription: e.target.value,
                      })
                    }
                    placeholder="Nascidos sob eclipses, eruditos treinados, portadores de relíquias…"
                  />
                </div>
                <div>
                  <label htmlFor="ms-rules">Regras fundamentais</label>
                  <textarea
                    id="ms-rules"
                    rows={2}
                    value={magicDraft.rules}
                    onChange={(e) => setMagicDraft({ ...magicDraft, rules: e.target.value })}
                    placeholder="Leis invioláveis de funcionamento do sistema…"
                    data-testid="input-magic-rules"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="ms-limits">Limitações</label>
                  <textarea
                    id="ms-limits"
                    rows={2}
                    value={magicDraft.limitations}
                    onChange={(e) =>
                      setMagicDraft({
                        ...magicDraft,
                        limitations: e.target.value,
                      })
                    }
                    placeholder="O que esta magia jamais consegue fazer…"
                  />
                </div>
                <div>
                  <label htmlFor="ms-costs">Custos</label>
                  <textarea
                    id="ms-costs"
                    rows={2}
                    value={magicDraft.costs}
                    onChange={(e) => setMagicDraft({ ...magicDraft, costs: e.target.value })}
                    placeholder="Exaustão física, memória, calor corporal…"
                  />
                </div>
                <div>
                  <label htmlFor="ms-conseq">Consequências do abuso</label>
                  <textarea
                    id="ms-conseq"
                    rows={2}
                    value={magicDraft.consequences}
                    onChange={(e) =>
                      setMagicDraft({
                        ...magicDraft,
                        consequences: e.target.value,
                      })
                    }
                    placeholder="Corrupção, cristalização, perda de sentidos…"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ms-laws">Leis relacionadas</label>
                  <input
                    id="ms-laws"
                    value={magicDraft.relatedLaws}
                    onChange={(e) =>
                      setMagicDraft({
                        ...magicDraft,
                        relatedLaws: e.target.value,
                      })
                    }
                    placeholder="Editos reais, licenças obrigatórias…"
                  />
                </div>
                <div>
                  <label htmlFor="ms-forb">Poderes proibidos / tabus</label>
                  <input
                    id="ms-forb"
                    value={magicDraft.forbiddenPowers}
                    onChange={(e) =>
                      setMagicDraft({
                        ...magicDraft,
                        forbiddenPowers: e.target.value,
                      })
                    }
                    placeholder="Necromancia temporal, controle mental…"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={magicImgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await processImageFile(file);
                      const stored = await storeMediaDataUrl(`magimg_${magicDraft.id}`, dataUrl);
                      setMagicDraft({ ...magicDraft, imageUrl: stored });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => magicImgRef.current?.click()}
                    className="btn-ghost text-xs"
                  >
                    <ImagePlus className="h-4 w-4" /> Imagem / Diagrama mágico
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!magicDraft.name.trim()) return;
                    actions.saveWorldMagicSystem(magicDraft);
                    if (
                      currentRecordId &&
                      onToggleLinkMagic &&
                      !linkedMagicIds.includes(magicDraft.id)
                    ) {
                      onToggleLinkMagic(magicDraft.id);
                    }
                    setMagicDraft(null);
                  }}
                  className="btn text-xs"
                  data-testid="btn-salvar-sistema-magico"
                >
                  <Check className="h-4 w-4" /> Salvar sistema mágico
                </button>
              </div>
            </div>
          )}

          {/* Lista de Sistemas Mágicos */}
          <div className="grid gap-3 sm:grid-cols-2">
            {magicSystems
              .filter((m) => m.name.toLowerCase().includes(searchQ.toLowerCase()))
              .map((ms) => {
                const isLinked = linkedMagicIds.includes(ms.id);
                return (
                  <div
                    key={ms.id}
                    className="card-luxe flex flex-col justify-between p-4"
                    data-testid={`magic-card-${ms.id}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[0.65rem] uppercase tracking-wider text-teal">
                            Fonte: {ms.energySource || "Não informada"}
                          </span>
                          <h5 className="font-display text-xl text-foreground">{ms.name}</h5>
                        </div>

                        {onToggleLinkMagic && (
                          <button
                            type="button"
                            onClick={() => onToggleLinkMagic(ms.id)}
                            className={`rounded-lg border px-2.5 py-1 text-[0.7rem] ${
                              isLinked
                                ? "border-teal bg-teal/20 text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isLinked ? "Vinculado ✓" : "Vincular"}
                          </button>
                        )}
                      </div>

                      {ms.rules && <p className="mt-2 text-xs text-muted-foreground">{ms.rules}</p>}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => actions.duplicateWorldMagicSystem(ms.id)}
                        className="btn-ghost !min-h-7 !px-2 !py-0.5 text-xs"
                        title="Duplicar sistema mágico"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMagicDraft(ms)}
                        className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Editar
                      </button>
                      {confirmDelMagicId === ms.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            actions.deleteWorldMagicSystem(ms.id);
                            setConfirmDelMagicId(null);
                          }}
                          className="btn !min-h-7 !bg-destructive !px-2.5 !py-0.5 text-xs"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelMagicId(ms.id)}
                          className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA 3 — TRANSFORMAÇÕES INDEPENDENTES                                */}
      {/* =================================================================== */}
      {tab === "transformations" && (
        <div className="space-y-4" data-testid="transformations-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-display text-2xl">Sistemas de Transformações Independentes</h4>
              <p className="text-xs text-muted-foreground">
                Cadastre formas despertas, metamorfoses arcanas ou trajes simbióticos com
                requisitos, aparência, paleta de cores e habilidades.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTransDraft(actions.newWorldTransformation())}
              className="btn text-xs"
              data-testid="btn-nova-transformacao"
            >
              <Plus className="h-4 w-4" /> Criar transformação
            </button>
          </div>

          {transDraft && (
            <div
              className="card-luxe space-y-4 border-gold/50 p-4 sm:p-5"
              data-testid="transformation-editor-modal"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h5 className="font-display text-xl">{transDraft.name || "Nova Transformação"}</h5>
                <button
                  type="button"
                  onClick={() => setTransDraft(null)}
                  className="btn-ghost !min-h-8 !px-2.5 !py-1 text-xs"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="tr-name">Nome da transformação</label>
                  <input
                    id="tr-name"
                    value={transDraft.name}
                    onChange={(e) => setTransDraft({ ...transDraft, name: e.target.value })}
                    placeholder="Ex: Forma de Valquíria Solar, Despertar Abissal…"
                    data-testid="input-transformation-name"
                  />
                </div>
                <div>
                  <label htmlFor="tr-ms">Sistema mágico vinculado</label>
                  <select
                    id="tr-ms"
                    value={transDraft.magicSystemId ?? ""}
                    onChange={(e) =>
                      setTransDraft({
                        ...transDraft,
                        magicSystemId: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">Independente / Outro</option>
                    {magicSystems.map((ms) => (
                      <option key={ms.id} value={ms.id}>
                        {ms.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tr-cat">Categoria ou classe</label>
                  <input
                    id="tr-cat"
                    value={transDraft.systemOrCategoryName}
                    onChange={(e) =>
                      setTransDraft({
                        ...transDraft,
                        systemOrCategoryName: e.target.value,
                      })
                    }
                    placeholder="Ex: Ascensão Elemental Nível III"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="tr-req">Requisitos de ativação</label>
                  <textarea
                    id="tr-req"
                    rows={2}
                    value={transDraft.activationRequirements}
                    onChange={(e) =>
                      setTransDraft({
                        ...transDraft,
                        activationRequirements: e.target.value,
                      })
                    }
                    placeholder="Condição emocional, relíquia catalisadora ou ritual…"
                    data-testid="input-transformation-reqs"
                  />
                </div>
                <div>
                  <label htmlFor="tr-app">Aparência visual na transformação</label>
                  <textarea
                    id="tr-app"
                    rows={2}
                    value={transDraft.appearance}
                    onChange={(e) =>
                      setTransDraft({
                        ...transDraft,
                        appearance: e.target.value,
                      })
                    }
                    placeholder="Mudança nos olhos, cabelo, aura, armadura ou traços…"
                  />
                </div>
              </div>

              <TagListEditor
                label="Habilidades adquiridas"
                items={transDraft.acquiredAbilities}
                onChange={(next) => setTransDraft({ ...transDraft, acquiredAbilities: next })}
                placeholder="Adicionar habilidade adquirida…"
              />

              {/* Paleta de cores da transformação */}
              <div className="rounded-xl border bg-background/40 p-3.5">
                <PaletteStudio
                  palettes={transDraft.palettes}
                  savedGlobalPalettes={[]}
                  onChange={(next) => setTransDraft({ ...transDraft, palettes: next })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="tr-dur">Duração</label>
                  <input
                    id="tr-dur"
                    value={transDraft.duration}
                    onChange={(e) => setTransDraft({ ...transDraft, duration: e.target.value })}
                    placeholder="Ex: Enquanto durar o fôlego astral…"
                  />
                </div>
                <div>
                  <label htmlFor="tr-lim">Limitações</label>
                  <input
                    id="tr-lim"
                    value={transDraft.limitations}
                    onChange={(e) =>
                      setTransDraft({
                        ...transDraft,
                        limitations: e.target.value,
                      })
                    }
                    placeholder="Vulnerabilidades durante a forma…"
                  />
                </div>
                <div>
                  <label htmlFor="tr-cost">Custos e consequências</label>
                  <input
                    id="tr-cost"
                    value={transDraft.costsAndConsequences}
                    onChange={(e) =>
                      setTransDraft({
                        ...transDraft,
                        costsAndConsequences: e.target.value,
                      })
                    }
                    placeholder="Efeito rebote após destransformar…"
                  />
                </div>
              </div>

              {characters.length > 0 && (
                <div>
                  <label className="mb-1 block">Personagens capazes de utilizá-la</label>
                  <div className="flex flex-wrap gap-1.5">
                    {characters.map((c) => {
                      const active = transDraft.characterIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setTransDraft({
                              ...transDraft,
                              characterIds: toggleId(transDraft.characterIds, c.id),
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1 text-xs ${
                            active
                              ? "border-primary bg-primary/20 text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={transImgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await processImageFile(file);
                      const stored = await storeMediaDataUrl(`trimg_${transDraft.id}`, dataUrl);
                      setTransDraft({ ...transDraft, imageUrl: stored });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => transImgRef.current?.click()}
                    className="btn-ghost text-xs"
                  >
                    <ImagePlus className="h-4 w-4" /> Imagem de referência
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!transDraft.name.trim()) return;
                    actions.saveWorldTransformation(transDraft);
                    if (
                      currentRecordId &&
                      onToggleLinkTrans &&
                      !linkedTransIds.includes(transDraft.id)
                    ) {
                      onToggleLinkTrans(transDraft.id);
                    }
                    setTransDraft(null);
                  }}
                  className="btn text-xs"
                  data-testid="btn-salvar-transformacao"
                >
                  <Check className="h-4 w-4" /> Salvar transformação
                </button>
              </div>
            </div>
          )}

          {/* Lista de Transformações */}
          <div className="grid gap-3 sm:grid-cols-2">
            {transformations
              .filter((t) => t.name.toLowerCase().includes(searchQ.toLowerCase()))
              .map((tr) => {
                const isLinked = linkedTransIds.includes(tr.id);
                const sys = magicSystems.find((m) => m.id === tr.magicSystemId);
                return (
                  <div
                    key={tr.id}
                    className="card-luxe flex flex-col justify-between p-4"
                    data-testid={`transformation-card-${tr.id}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[0.65rem] uppercase tracking-wider text-gold">
                            {sys
                              ? `Sistema: ${sys.name}`
                              : tr.systemOrCategoryName || "Transformação"}
                          </span>
                          <h5 className="font-display text-xl text-foreground">{tr.name}</h5>
                        </div>

                        {onToggleLinkTrans && (
                          <button
                            type="button"
                            onClick={() => onToggleLinkTrans(tr.id)}
                            className={`rounded-lg border px-2.5 py-1 text-[0.7rem] ${
                              isLinked
                                ? "border-gold bg-gold/20 text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isLinked ? "Vinculada ✓" : "Vincular"}
                          </button>
                        )}
                      </div>

                      {tr.activationRequirements && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <strong>Ativação:</strong> {tr.activationRequirements}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={() => actions.duplicateWorldTransformation(tr.id)}
                        className="btn-ghost !min-h-7 !px-2 !py-0.5 text-xs"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransDraft(tr)}
                        className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Editar
                      </button>
                      {confirmDelTransId === tr.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            actions.deleteWorldTransformation(tr.id);
                            setConfirmDelTransId(null);
                          }}
                          className="btn !min-h-7 !bg-destructive !px-2.5 !py-0.5 text-xs"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelTransId(tr.id)}
                          className="btn-ghost !min-h-7 !px-2.5 !py-0.5 text-xs text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
