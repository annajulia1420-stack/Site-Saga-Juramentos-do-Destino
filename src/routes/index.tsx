import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Users,
  Heart,
  ScrollText,
  Clock,
  Trash2,
  Plus,
  Images,
  Lightbulb,
  Music,
} from "lucide-react";
import { useStore, actions } from "@/lib/store";
import { Cover } from "@/components/Cover";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Juramentos do Destino Studio" },
      {
        name: "description",
        content: "Painel da saga em dez livros: progresso, atalhos e tarefas.",
      },
      { property: "og:title", content: "Juramentos do Destino Studio" },
      {
        property: "og:description",
        content: "Painel da saga em dez livros: progresso, atalhos e tarefas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const books = useStore((s) => s.books);
  const tasks = useStore((s) => s.tasks);
  const author = useStore((s) => s.authorName);
  const [task, setTask] = useState("");
  const total = books.reduce((a, b) => a + b.chapters, 0);
  const written = books.reduce((a, b) => a + b.chaptersWritten, 0);
  const pct = total ? Math.round((written / total) * 100) : 0;
  const shortcuts = [
    { to: "/laboratorio-de-ideias", label: "Laboratório de Ideias", icon: Lightbulb },
    { to: "/music-room", label: "Music Room", icon: Music },
    { to: "/personagens", label: "Personagens", icon: Users },
    { to: "/casais", label: "Casais", icon: Heart },
    { to: "/capitulos", label: "Capítulos", icon: ScrollText },
    { to: "/universo", label: "Cronologia", icon: Clock },
    { to: "/moodboards", label: "Moodboards", icon: Images },
    { to: "/estudio", label: "Estúdio editorial", icon: BookOpen },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="bg-saga relative overflow-hidden rounded-3xl border p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-teal">Saga em dez livros</p>
        <h1 className="mt-2 text-4xl md:text-6xl">
          Olá,{" "}
          <input
            aria-label="Seu nome"
            value={author}
            onChange={(e) => actions.setAuthor(e.target.value)}
            className="!inline !w-auto max-w-[9ch] !border-0 !bg-transparent !p-0 font-display italic text-primary"
          />
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Juramentos do Destino — do primeiro esboço ao livro na estante.
        </p>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {books.slice(0, 10).map((b) => (
            <Link
              key={b.id}
              to="/livros/$id"
              params={{ id: b.id }}
              className="w-16 shrink-0 md:w-20"
            >
              <Cover book={b} />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          ["Livros", books.length],
          ["Capítulos escritos", `${written}/${total}`],
          ["Progresso", `${pct}%`],
        ].map(([l, v]) => (
          <div key={l} className="card-luxe p-4">
            <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">{l}</p>
            <p className="font-display text-3xl">{v}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {shortcuts.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="card-luxe flex flex-col items-start gap-2 p-4 hover:border-primary"
          >
            <Icon className="h-5 w-5 text-teal" />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card-luxe p-5">
          <h2 className="text-2xl">Projetos recentes</h2>
          <ul className="mt-3 divide-y divide-border">
            {books.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <Cover book={b} className="w-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link to="/livros/$id" params={{ id: b.id }} className="font-display text-lg">
                    {b.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{b.status}</p>
                </div>
                <Link to="/estudio/$id" params={{ id: b.id }} className="btn-ghost !py-1 text-xs">
                  Estúdio
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card-luxe p-5">
          <h2 className="text-2xl">Tarefas pendentes</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (task.trim()) {
                actions.addTask(task.trim());
                setTask("");
              }
            }}
          >
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Nova tarefa…"
            />
            <button className="btn shrink-0" aria-label="Adicionar">
              <Plus className="h-4 w-4" />
            </button>
          </form>
          {tasks.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma tarefa. Aproveite para escrever ✨
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="!w-4"
                  checked={t.done}
                  onChange={() => actions.toggleTask(t.id)}
                />
                <span className={`flex-1 ${t.done ? "text-muted-foreground line-through" : ""}`}>
                  {t.text}
                </span>
                <button
                  aria-label="Excluir"
                  onClick={() => confirm("Excluir tarefa?") && actions.deleteTask(t.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
