import type { Book } from "@/lib/store";

export function Cover({ book, className = "" }: { book: Book; className?: string }) {
  const [a, b, c] = book.palette;
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-lg shadow-glow ${className}`}
      style={{
        background: book.cover
          ? `url(${book.cover}) center/cover`
          : `radial-gradient(circle at 50% 30%, ${b}, ${a} 70%)`,
      }}
    >
      {!book.cover && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center"
          style={{ color: c }}
        >
          <span className="text-[0.55rem] uppercase tracking-[0.3em] opacity-80">
            Livro {book.order}
          </span>
          <span className="font-display text-2xl font-semibold leading-none">{book.title}</span>
          <span className="text-[0.5rem] uppercase tracking-[0.25em] opacity-70">
            Juramentos do Destino
          </span>
        </div>
      )}
    </div>
  );
}
