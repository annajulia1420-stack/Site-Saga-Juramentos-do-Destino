import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  Type,
  Palette,
  Highlighter,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  Pilcrow,
  Check,
  X,
} from "lucide-react";

export const WORD_FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Jost (Padrão)", value: "Jost, system-ui, sans-serif" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', Georgia, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

export const WORD_FONT_SIZES: string[] = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
];

export const WORD_LINE_HEIGHTS: { label: string; value: string }[] = [
  { label: "Simples (1.0)", value: "1.0" },
  { label: "Compacto (1.15)", value: "1.15" },
  { label: "Padrão (1.5)", value: "1.5" },
  { label: "Confortável (1.75)", value: "1.75" },
  { label: "Duplo (2.0)", value: "2.0" },
];

export const WORD_PARAGRAPH_SPACINGS: { label: string; value: string }[] = [
  { label: "Sem espaço (0px)", value: "0px" },
  { label: "Pequeno (8px)", value: "8px" },
  { label: "Médio (14px)", value: "14px" },
  { label: "Amplo (22px)", value: "22px" },
];

export const WORD_TEXT_STYLES: {
  id: "normal" | "h1" | "h2" | "subtitle";
  label: string;
}[] = [
  { id: "normal", label: "Texto normal" },
  { id: "h1", label: "Título 1" },
  { id: "h2", label: "Título 2" },
  { id: "subtitle", label: "Subtítulo" },
];

export const WORD_TEXT_COLORS: { label: string; hex: string }[] = [
  { label: "Marfim (Padrão)", hex: "#F5EDF0" },
  { label: "Branco Puro", hex: "#FFFFFF" },
  { label: "Rosa Spectral", hex: "#E8475F" },
  { label: "Turquesa Místico", hex: "#5CC8C0" },
  { label: "Dourado Imperial", hex: "#F2D27A" },
  { label: "Lilás Astral", hex: "#C084FC" },
  { label: "Laranja Chama", hex: "#F97316" },
  { label: "Verde Esmeralda", hex: "#22C55E" },
  { label: "Azul Celeste", hex: "#60A5FA" },
  { label: "Vermelho Rubi", hex: "#EF4444" },
  { label: "Cinza Suave", hex: "#A1A1AA" },
  { label: "Preto Tinta", hex: "#18181B" },
];

export const WORD_HIGHLIGHT_COLORS: { label: string; hex: string }[] = [
  { label: "Sem destaque", hex: "transparent" },
  { label: "Marca-texto Rosa", hex: "#7A0F2B" },
  { label: "Marca-texto Turquesa", hex: "#0D3B4F" },
  { label: "Marca-texto Âmbar", hex: "#78350F" },
  { label: "Marca-texto Roxo", hex: "#3B0764" },
  { label: "Marca-texto Verde", hex: "#14532D" },
  { label: "Amarelo Clássico", hex: "#FEF08A" },
  { label: "Rosa Suave", hex: "#FBCFE8" },
  { label: "Ciano Suave", hex: "#A5F3FC" },
];

const ALLOWED_TAGS = new Set([
  "p",
  "div",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "sup",
  "sub",
  "span",
  "font",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "background",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-decoration-line",
  "text-align",
  "line-height",
  "margin-bottom",
  "margin-top",
  "margin-left",
  "padding-left",
]);

/**
 * Sanitiza HTML rico removendo tags perigosas (<script>, <iframe>, <object>, etc.),
 * atributos on* e URLs javascript:/data: maliciosas, preservando toda a formatação Word.
 */
export function sanitizeRichHtml(rawHtml: string): string {
  if (!rawHtml || !rawHtml.trim()) return "";
  if (typeof DOMParser === "undefined") {
    return rawHtml
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  function cleanNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent ?? "");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (
      tag === "script" ||
      tag === "style" ||
      tag === "iframe" ||
      tag === "object" ||
      tag === "embed" ||
      tag === "form" ||
      tag === "meta" ||
      tag === "link"
    ) {
      return null;
    }

    // Se a tag não está na lista permitida, preserva seus filhos dentro de um fragmento/span
    if (!ALLOWED_TAGS.has(tag)) {
      const frag = document.createDocumentFragment();
      Array.from(el.childNodes).forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) frag.appendChild(cleaned);
      });
      return frag;
    }

    const cleanEl = document.createElement(tag === "font" ? "span" : tag);

    // Atributos específicos de <font> legado convertidos para style seguro
    const styleParts: string[] = [];
    if (tag === "font") {
      const colorAttr = el.getAttribute("color");
      const faceAttr = el.getAttribute("face");
      if (colorAttr && !/javascript:|expression\(/i.test(colorAttr)) {
        styleParts.push(`color: ${colorAttr}`);
      }
      if (faceAttr && !/javascript:|expression\(/i.test(faceAttr)) {
        styleParts.push(`font-family: ${faceAttr}`);
      }
    }

    // Preserva style seguro
    const rawStyle = el.getAttribute("style");
    if (rawStyle) {
      rawStyle.split(";").forEach((decl) => {
        const idx = decl.indexOf(":");
        if (idx === -1) return;
        const prop = decl.slice(0, idx).trim().toLowerCase();
        const val = decl.slice(idx + 1).trim();
        if (ALLOWED_STYLE_PROPS.has(prop) && val && !/javascript:|expression\(|url\(/i.test(val)) {
          styleParts.push(`${prop}: ${val}`);
        }
      });
    }
    if (styleParts.length > 0) {
      cleanEl.setAttribute("style", styleParts.join("; "));
    }

    // Preserva data-subtitle ou class segura de subtítulo
    if (el.getAttribute("data-style") === "subtitle") {
      cleanEl.setAttribute("data-style", "subtitle");
    }

    // Se for link <a>, valida href seguro
    if (tag === "a") {
      const href = (el.getAttribute("href") ?? "").trim();
      if (
        href &&
        (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href) || !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href))
      ) {
        const normalizedHref = !/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href)
          ? `https://${href}`
          : href;
        cleanEl.setAttribute("href", normalizedHref);
        cleanEl.setAttribute("target", "_blank");
        cleanEl.setAttribute("rel", "noopener noreferrer");
      }
    }

    Array.from(el.childNodes).forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) cleanEl.appendChild(cleaned);
    });

    return cleanEl;
  }

  const container = document.createElement("div");
  Array.from(doc.body.childNodes).forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) container.appendChild(cleaned);
  });

  return container.innerHTML;
}

/**
 * Converte um texto legado (texto simples com quebras de linha) ou HTML já existente
 * em HTML pronto para o editor rico, sem perder parágrafos, acentos ou quebras de linha.
 */
export function normalizeSummaryToHtml(summaryHtml?: string, plainTextFallback?: string): string {
  if (summaryHtml && summaryHtml.trim().length > 0) {
    const trimmed = summaryHtml.trim();
    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
      return sanitizeRichHtml(trimmed);
    }
    return plainTextToHtml(trimmed);
  }
  if (plainTextFallback && plainTextFallback.trim().length > 0) {
    const trimmed = plainTextFallback.trim();
    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
      return sanitizeRichHtml(trimmed);
    }
    return plainTextToHtml(trimmed);
  }
  return "";
}

export function plainTextToHtml(text: string): string {
  if (!text) return "";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = escaped.split(/\n{2,}/);
  return paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
}

export function extractPlainTextFromHtml(html: string): string {
  if (!html || !html.trim()) return "";
  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const withNewlines = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|blockquote)>/gi, "\n");
  const parser = new DOMParser();
  const doc = parser.parseFromString(withNewlines, "text/html");
  return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

interface RichTextWordEditorProps {
  valueHtml: string;
  plainTextFallback?: string;
  onChange: (nextHtml: string, nextPlainText: string) => void;
  placeholder?: string;
  id?: string;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  superscript: boolean;
  subscript: boolean;
  align: "left" | "center" | "right" | "justify";
  unorderedList: boolean;
  orderedList: boolean;
  blockStyle: "normal" | "h1" | "h2" | "subtitle";
  fontFamily: string;
  fontSize: string;
  textColor: string;
  highlightColor: string;
  lineHeight: string;
  paragraphSpacing: string;
}

const DEFAULT_ACTIVE_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  superscript: false,
  subscript: false,
  align: "left",
  unorderedList: false,
  orderedList: false,
  blockStyle: "normal",
  fontFamily: WORD_FONT_FAMILIES[0]!.value,
  fontSize: "16px",
  textColor: "#F5EDF0",
  highlightColor: "transparent",
  lineHeight: "1.5",
  paragraphSpacing: "8px",
};

export function RichTextWordEditor({
  valueHtml,
  plainTextFallback,
  onChange,
  placeholder = "Escreva e formate o resumo detalhado do capítulo...",
  id = "chapter-summary-editor",
}: RichTextWordEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedHtmlRef = useRef<string>("");

  // Histórico Undo / Redo próprio para funcionar perfeitamente tanto com execCommand quanto manipulações DOM
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  const [active, setActive] = useState<ActiveFormats>(DEFAULT_ACTIVE_FORMATS);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [customTextColorHex, setCustomTextColorHex] = useState("#E8475F");
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [customHighlightHex, setCustomHighlightHex] = useState("#7A0F2B");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("https://");
  const [linkTextInput, setLinkTextInput] = useState("");
  const [spacingMenuOpen, setSpacingMenuOpen] = useState(false);

  const pushHistory = useCallback((html: string) => {
    const stack = historyRef.current;
    const idx = historyIndexRef.current;
    if (idx >= 0 && stack[idx] === html) return;
    const nextStack = stack.slice(0, idx + 1);
    nextStack.push(html);
    if (nextStack.length > 60) nextStack.shift();
    historyRef.current = nextStack;
    historyIndexRef.current = nextStack.length - 1;
  }, []);

  // Inicializa e sincroniza quando o capítulo aberto muda externamente
  useEffect(() => {
    const normalized = normalizeSummaryToHtml(valueHtml, plainTextFallback);
    const el = editorRef.current;
    if (!el) return;
    if (normalized !== lastEmittedHtmlRef.current && el.innerHTML !== normalized) {
      el.innerHTML = normalized;
      lastEmittedHtmlRef.current = normalized;
      historyRef.current = [normalized];
      historyIndexRef.current = 0;
    } else if (historyRef.current.length === 0) {
      historyRef.current = [el.innerHTML];
      historyIndexRef.current = 0;
    }
  }, [valueHtml, plainTextFallback]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    const el = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !el) return;
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    if (savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const emitChange = useCallback(
    (recordInHistory = true) => {
      const el = editorRef.current;
      if (!el) return;
      const sanitized = sanitizeRichHtml(el.innerHTML);
      const plain = extractPlainTextFromHtml(sanitized);
      const finalHtml = plain.length === 0 && !/<(ul|ol|h1|h2)/i.test(sanitized) ? "" : sanitized;
      lastEmittedHtmlRef.current = finalHtml;
      if (recordInHistory) {
        pushHistory(finalHtml);
      }
      onChange(finalHtml, plain);
    },
    [onChange, pushHistory],
  );

  const inspectActiveFormatting = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    saveSelection();

    const sel = window.getSelection();
    let node: Node | null = sel && sel.rangeCount > 0 ? sel.anchorNode : null;
    if (node && node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    const targetEl = node && el.contains(node) ? (node as HTMLElement) : el;

    const hasAncestorTag = (tags: string[]): boolean => {
      let cur: HTMLElement | null = targetEl;
      while (cur && cur !== el) {
        if (tags.includes(cur.tagName.toLowerCase())) return true;
        cur = cur.parentElement;
      }
      return false;
    };

    const findBlockAncestor = (): HTMLElement | null => {
      let cur: HTMLElement | null = targetEl;
      while (cur && cur !== el) {
        const t = cur.tagName.toLowerCase();
        if (["p", "h1", "h2", "h3", "div", "li", "blockquote"].includes(t)) {
          return cur;
        }
        cur = cur.parentElement;
      }
      return null;
    };

    const blockEl = findBlockAncestor();

    let blockStyle: ActiveFormats["blockStyle"] = "normal";
    if (blockEl) {
      const bt = blockEl.tagName.toLowerCase();
      if (bt === "h1") blockStyle = "h1";
      else if (bt === "h2") blockStyle = "h2";
      else if (bt === "h3" || blockEl.getAttribute("data-style") === "subtitle") {
        blockStyle = "subtitle";
      }
    }

    let align: ActiveFormats["align"] = "left";
    if (blockEl && blockEl.style.textAlign) {
      const ta = blockEl.style.textAlign.toLowerCase();
      if (ta === "center" || ta === "right" || ta === "justify") {
        align = ta;
      }
    }

    let inlineStyleFontSize = "";
    let inlineStyleFontFamily = "";
    let inlineTextColor = "";
    let inlineBgColor = "";
    let cur: HTMLElement | null = targetEl;
    while (cur && cur !== el) {
      if (!inlineStyleFontSize && cur.style.fontSize) {
        inlineStyleFontSize = cur.style.fontSize;
      }
      if (!inlineStyleFontFamily && cur.style.fontFamily) {
        inlineStyleFontFamily = cur.style.fontFamily;
      }
      if (!inlineTextColor && cur.style.color) {
        inlineTextColor = cur.style.color;
      }
      if (!inlineBgColor && cur.style.backgroundColor) {
        inlineBgColor = cur.style.backgroundColor;
      }
      cur = cur.parentElement;
    }

    setActive((prev) => ({
      ...prev,
      bold:
        hasAncestorTag(["b", "strong"]) ||
        targetEl.style.fontWeight === "bold" ||
        Number(targetEl.style.fontWeight) >= 700,
      italic: hasAncestorTag(["i", "em"]) || targetEl.style.fontStyle === "italic",
      underline: hasAncestorTag(["u"]) || targetEl.style.textDecoration.includes("underline"),
      strikeThrough:
        hasAncestorTag(["s", "strike", "del"]) ||
        targetEl.style.textDecoration.includes("line-through"),
      superscript: hasAncestorTag(["sup"]),
      subscript: hasAncestorTag(["sub"]),
      unorderedList: hasAncestorTag(["ul"]),
      orderedList: hasAncestorTag(["ol"]),
      blockStyle,
      align,
      fontSize: inlineStyleFontSize || prev.fontSize,
      fontFamily: inlineStyleFontFamily || prev.fontFamily,
      textColor: inlineTextColor || prev.textColor,
      highlightColor: inlineBgColor || prev.highlightColor,
      lineHeight: blockEl?.style.lineHeight || prev.lineHeight,
      paragraphSpacing: blockEl?.style.marginBottom || prev.paragraphSpacing,
    }));
  }, [saveSelection]);

  // Envolve a seleção atual em uma tag inline ou aplica caso o cursor esteja posicionado
  const toggleInlineTag = (
    tagName: "strong" | "em" | "u" | "s" | "sup" | "sub",
    execCmdName: string,
  ) => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();

    // Tenta document.execCommand se suportado pelo navegador
    let handledByExec = false;
    try {
      if (typeof document.execCommand === "function") {
        handledByExec = document.execCommand(execCmdName, false);
      }
    } catch {
      handledByExec = false;
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Fallback DOM explícito para garantir formatação real mesmo em JSDOM ou quando execCommand não envolve a tag esperada
      const anc =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement
          : (range.commonAncestorContainer as HTMLElement);

      let existingTagEl: HTMLElement | null = null;
      let cur: HTMLElement | null = anc;
      const equivalentTags =
        tagName === "strong"
          ? ["strong", "b"]
          : tagName === "em"
            ? ["em", "i"]
            : tagName === "s"
              ? ["s", "strike", "del"]
              : [tagName];
      while (cur && cur !== el) {
        if (equivalentTags.includes(cur.tagName.toLowerCase())) {
          existingTagEl = cur;
          break;
        }
        cur = cur.parentElement;
      }

      if (!handledByExec) {
        if (existingTagEl) {
          // Desfaz a tag mantendo o conteúdo
          const parent = existingTagEl.parentNode;
          if (parent) {
            while (existingTagEl.firstChild) {
              parent.insertBefore(existingTagEl.firstChild, existingTagEl);
            }
            parent.removeChild(existingTagEl);
          }
        } else if (!range.collapsed) {
          const wrapper = document.createElement(tagName);
          wrapper.appendChild(range.extractContents());
          range.insertNode(wrapper);
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(wrapper);
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
        } else {
          // Sem seleção: envolve ou ativa estado para o próximo texto digitado
          const wrapper = document.createElement(tagName);
          wrapper.appendChild(document.createTextNode("\u200B"));
          range.insertNode(wrapper);
          const nextRange = document.createRange();
          nextRange.setStart(wrapper.firstChild!, 1);
          nextRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(nextRange);
          savedRangeRef.current = nextRange.cloneRange();
        }
      }
    }

    emitChange();
    inspectActiveFormatting();
  };

  // Aplica estilo inline CSS (família tipográfica, tamanho, cor ou marca-texto)
  const applyInlineStyle = (
    styleKey: "fontFamily" | "fontSize" | "color" | "backgroundColor",
    styleValue: string,
  ) => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      // Se não há seleção ativa mas há conteúdo no editor, estiliza um span ou bloco
      const wrapper = document.createElement("span");
      wrapper.style[styleKey] = styleValue;
      wrapper.appendChild(document.createTextNode("\u200B"));
      el.appendChild(wrapper);
      emitChange();
      return;
    }

    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    if (!range.collapsed) {
      const span = document.createElement("span");
      if (styleValue === "transparent" && styleKey === "backgroundColor") {
        span.style.backgroundColor = "transparent";
      } else {
        span.style[styleKey] = styleValue;
      }
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    } else {
      const span = document.createElement("span");
      span.style[styleKey] = styleValue;
      span.appendChild(document.createTextNode("\u200B"));
      range.insertNode(span);
      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    }

    setActive((prev) => ({
      ...prev,
      ...(styleKey === "fontFamily" ? { fontFamily: styleValue } : {}),
      ...(styleKey === "fontSize" ? { fontSize: styleValue } : {}),
      ...(styleKey === "color" ? { textColor: styleValue } : {}),
      ...(styleKey === "backgroundColor" ? { highlightColor: styleValue } : {}),
    }));

    emitChange();
  };

  const stepFontSize = (direction: 1 | -1) => {
    const currentIdx = WORD_FONT_SIZES.indexOf(active.fontSize);
    const baseIdx = currentIdx === -1 ? 2 : currentIdx;
    const nextIdx = Math.max(0, Math.min(WORD_FONT_SIZES.length - 1, baseIdx + direction));
    const nextSize = WORD_FONT_SIZES[nextIdx]!;
    applyInlineStyle("fontSize", nextSize);
  };

  // Encontra ou cria o elemento de bloco onde está o cursor/seleção
  const getOrCreateCurrentBlock = (): HTMLElement | null => {
    const el = editorRef.current;
    if (!el) return null;
    restoreSelection();
    const sel = window.getSelection();
    let node: Node | null = sel && sel.rangeCount > 0 ? sel.anchorNode : el.firstChild;

    if (!node) {
      const p = document.createElement("p");
      p.innerHTML = "<br/>";
      el.appendChild(p);
      return p;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement === el) {
        const p = document.createElement("p");
        el.insertBefore(p, node);
        p.appendChild(node);
        return p;
      }
      node = node.parentElement;
    }

    let cur = node as HTMLElement | null;
    while (cur && cur !== el) {
      const t = cur.tagName.toLowerCase();
      if (["p", "h1", "h2", "h3", "div", "li", "blockquote"].includes(t)) {
        return cur;
      }
      cur = cur.parentElement;
    }

    if (el.firstElementChild) {
      return el.firstElementChild as HTMLElement;
    }

    const p = document.createElement("p");
    while (el.firstChild) {
      p.appendChild(el.firstChild);
    }
    el.appendChild(p);
    return p;
  };

  // Aplica estilo de título/parágrafo (Texto normal, Título 1, Título 2, Subtítulo)
  const applyBlockStyle = (styleId: "normal" | "h1" | "h2" | "subtitle") => {
    const el = editorRef.current;
    if (!el) return;
    const block = getOrCreateCurrentBlock();
    if (!block) return;

    const targetTag =
      styleId === "h1" ? "h1" : styleId === "h2" ? "h2" : styleId === "subtitle" ? "h3" : "p";

    const replacement = document.createElement(targetTag);
    if (styleId === "subtitle") {
      replacement.setAttribute("data-style", "subtitle");
      replacement.style.fontSize = "18px";
      replacement.style.fontStyle = "italic";
      replacement.style.color = "#5CC8C0";
    } else if (styleId === "h1") {
      replacement.style.fontSize = "26px";
      replacement.style.fontWeight = "700";
    } else if (styleId === "h2") {
      replacement.style.fontSize = "21px";
      replacement.style.fontWeight = "600";
    }

    if (block.style.textAlign) {
      replacement.style.textAlign = block.style.textAlign;
    }

    while (block.firstChild) {
      replacement.appendChild(block.firstChild);
    }
    block.parentNode?.replaceChild(replacement, block);

    const sel = window.getSelection();
    if (sel) {
      const newRange = document.createRange();
      newRange.selectNodeContents(replacement);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    }

    setActive((prev) => ({ ...prev, blockStyle: styleId }));
    emitChange();
  };

  const applyAlignment = (align: "left" | "center" | "right" | "justify") => {
    const block = getOrCreateCurrentBlock();
    if (!block) return;
    block.style.textAlign = align;
    setActive((prev) => ({ ...prev, align }));
    emitChange();
  };

  const toggleList = (listTag: "ul" | "ol") => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();

    const cmd = listTag === "ul" ? "insertUnorderedList" : "insertOrderedList";
    let handled = false;
    try {
      if (typeof document.execCommand === "function") {
        handled = document.execCommand(cmd, false);
      }
    } catch {
      handled = false;
    }

    if (!handled || !el.querySelector(listTag)) {
      const block = getOrCreateCurrentBlock();
      if (block) {
        const parentList = block.closest("ul, ol");
        if (parentList && parentList.tagName.toLowerCase() === listTag) {
          // Converte lista de volta em parágrafos
          const frag = document.createDocumentFragment();
          Array.from(parentList.querySelectorAll("li")).forEach((li) => {
            const p = document.createElement("p");
            p.innerHTML = li.innerHTML;
            frag.appendChild(p);
          });
          parentList.parentNode?.replaceChild(frag, parentList);
        } else if (parentList) {
          // Troca entre ul e ol
          const newList = document.createElement(listTag);
          newList.innerHTML = parentList.innerHTML;
          parentList.parentNode?.replaceChild(newList, parentList);
        } else {
          const listEl = document.createElement(listTag);
          const li = document.createElement("li");
          while (block.firstChild) {
            li.appendChild(block.firstChild);
          }
          if (!li.innerHTML.trim()) li.innerHTML = "Item da lista";
          listEl.appendChild(li);
          block.parentNode?.replaceChild(listEl, block);

          const sel = window.getSelection();
          if (sel) {
            const r = document.createRange();
            r.selectNodeContents(li);
            r.collapse(false);
            sel.removeAllRanges();
            sel.addRange(r);
            savedRangeRef.current = r.cloneRange();
          }
        }
      }
    }

    emitChange();
    inspectActiveFormatting();
  };

  const adjustIndent = (delta: 1 | -1) => {
    const block = getOrCreateCurrentBlock();
    if (!block) return;
    const currentPx = parseInt(block.style.marginLeft || "0", 10) || 0;
    const nextPx = Math.max(0, Math.min(160, currentPx + delta * 24));
    block.style.marginLeft = nextPx > 0 ? `${nextPx}px` : "";
    emitChange();
  };

  const applyLineHeight = (lh: string) => {
    const block = getOrCreateCurrentBlock();
    if (!block) return;
    block.style.lineHeight = lh;
    setActive((prev) => ({ ...prev, lineHeight: lh }));
    emitChange();
  };

  const applyParagraphSpacing = (mb: string) => {
    const block = getOrCreateCurrentBlock();
    if (!block) return;
    block.style.marginBottom = mb;
    setActive((prev) => ({ ...prev, paragraphSpacing: mb }));
    emitChange();
  };

  const clearSelectionFormatting = () => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
      const range = sel.getRangeAt(0);
      const plain = range.toString();
      range.deleteContents();
      const textNode = document.createTextNode(plain);
      range.insertNode(textNode);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(textNode);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      savedRangeRef.current = nextRange.cloneRange();
    } else {
      // Se nenhum trecho específico estiver selecionado, limpa formatação inline do bloco atual
      const block = getOrCreateCurrentBlock();
      if (block) {
        const plain = block.textContent ?? "";
        const p = document.createElement("p");
        p.textContent = plain;
        block.parentNode?.replaceChild(p, block);
      }
    }
    emitChange();
    inspectActiveFormatting();
  };

  const openInsertLinkDialog = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    setLinkTextInput(selectedText);

    // Verifica se já está sob um <a>
    let existingHref = "https://";
    if (sel && sel.anchorNode) {
      const parentEl =
        sel.anchorNode.nodeType === Node.TEXT_NODE
          ? sel.anchorNode.parentElement
          : (sel.anchorNode as HTMLElement);
      const existingAnchor = parentEl?.closest("a");
      if (existingAnchor) {
        existingHref = existingAnchor.getAttribute("href") || "https://";
        if (!selectedText) {
          setLinkTextInput(existingAnchor.textContent || "");
        }
      }
    }
    setLinkUrlInput(existingHref);
    setLinkDialogOpen(true);
  };

  const confirmInsertLink = () => {
    const url = linkUrlInput.trim();
    if (!url) {
      setLinkDialogOpen(false);
      return;
    }
    const safeHref = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;

    const el = editorRef.current;
    if (!el) return;
    restoreSelection();

    const sel = window.getSelection();
    const anchor = document.createElement("a");
    anchor.setAttribute("href", safeHref);
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
    anchor.style.color = "#5CC8C0";
    anchor.style.textDecoration = "underline";

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        if (!range.collapsed) {
          const label = linkTextInput.trim() || range.toString() || safeHref;
          range.deleteContents();
          anchor.textContent = label;
          range.insertNode(anchor);
        } else {
          anchor.textContent = linkTextInput.trim() || safeHref;
          range.insertNode(anchor);
        }
      } else {
        anchor.textContent = linkTextInput.trim() || safeHref;
        el.appendChild(anchor);
      }
    } else {
      anchor.textContent = linkTextInput.trim() || safeHref;
      el.appendChild(anchor);
    }

    setLinkDialogOpen(false);
    emitChange();
  };

  const removeHyperlink = () => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const containerEl =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement
          : (range.commonAncestorContainer as HTMLElement);
      const directAnchor = containerEl?.closest("a");
      if (directAnchor && el.contains(directAnchor)) {
        const textNode = document.createTextNode(directAnchor.textContent ?? "");
        directAnchor.parentNode?.replaceChild(textNode, directAnchor);
        emitChange();
        return;
      }
    }

    // Caso o usuário tenha selecionado ou queira remover o último/todos os links no bloco
    const anchors = el.querySelectorAll("a");
    anchors.forEach((a) => {
      const textNode = document.createTextNode(a.textContent ?? "");
      a.parentNode?.replaceChild(textNode, a);
    });
    emitChange();
  };

  const handleUndo = () => {
    const el = editorRef.current;
    if (!el) return;
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevHtml = historyRef.current[historyIndexRef.current] ?? "";
      el.innerHTML = prevHtml;
      lastEmittedHtmlRef.current = prevHtml;
      onChange(prevHtml, extractPlainTextFromHtml(prevHtml));
    }
  };

  const handleRedo = () => {
    const el = editorRef.current;
    if (!el) return;
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextHtml = historyRef.current[historyIndexRef.current] ?? "";
      el.innerHTML = nextHtml;
      lastEmittedHtmlRef.current = nextHtml;
      onChange(nextHtml, extractPlainTextFromHtml(nextHtml));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData("text/html");
    const textData = e.clipboardData.getData("text/plain");

    const cleanToInsert = htmlData ? sanitizeRichHtml(htmlData) : plainTextToHtml(textData);

    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement("div");
      temp.innerHTML = cleanToInsert;
      const frag = document.createDocumentFragment();
      let lastNode: Node | null = null;
      while (temp.firstChild) {
        lastNode = frag.appendChild(temp.firstChild);
      }
      range.insertNode(frag);
      if (lastNode) {
        const nextRange = document.createRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
        savedRangeRef.current = nextRange.cloneRange();
      }
    } else {
      el.innerHTML += cleanToInsert;
    }
    emitChange();
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo =
    historyIndexRef.current >= 0 && historyIndexRef.current < historyRef.current.length - 1;

  const toolBtnClass = (isActive?: boolean, disabled?: boolean) =>
    `inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition ${
      disabled
        ? "cursor-not-allowed opacity-35"
        : isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/85 hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <div
      className="rounded-2xl border border-border bg-card/85 shadow-sm"
      data-testid="word-rich-editor-container"
    >
      {/* BARRA DE FERRAMENTAS ESTILO MICROSOFT WORD */}
      <div
        role="toolbar"
        aria-label="Barra de ferramentas de formatação do Resumo"
        className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/60 p-2"
      >
        {/* GRUPO 1: DESFAZER / REFAZER */}
        <div className="flex items-center gap-0.5 pr-1">
          <button
            type="button"
            title="Desfazer (Ctrl+Z)"
            aria-label="Desfazer"
            data-testid="toolbar-undo"
            disabled={!canUndo}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleUndo}
            className={toolBtnClass(false, !canUndo)}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Refazer (Ctrl+Y)"
            aria-label="Refazer"
            data-testid="toolbar-redo"
            disabled={!canRedo}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRedo}
            className={toolBtnClass(false, !canRedo)}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* GRUPO 2: ESTILOS DE TEXTO, FONTE E TAMANHO */}
        <div className="flex flex-wrap items-center gap-1 px-1">
          <select
            aria-label="Estilo do texto"
            title="Estilos de texto (Normal, Título 1, Título 2, Subtítulo)"
            data-testid="toolbar-block-style"
            value={active.blockStyle}
            onChange={(e) => applyBlockStyle(e.target.value as "normal" | "h1" | "h2" | "subtitle")}
            className="!min-h-8 !w-auto !rounded-lg !px-2 !py-1 !text-xs"
          >
            {WORD_TEXT_STYLES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Família tipográfica"
            title="Escolher família tipográfica"
            data-testid="toolbar-font-family"
            value={active.fontFamily}
            onChange={(e) => applyInlineStyle("fontFamily", e.target.value)}
            className="!min-h-8 !w-auto max-w-[155px] !rounded-lg !px-2 !py-1 !text-xs"
          >
            {WORD_FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Tamanho da fonte"
            title="Escolher tamanho da fonte"
            data-testid="toolbar-font-size"
            value={active.fontSize}
            onChange={(e) => applyInlineStyle("fontSize", e.target.value)}
            className="!min-h-8 !w-auto !rounded-lg !px-2 !py-1 !text-xs"
          >
            {WORD_FONT_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>

          <button
            type="button"
            title="Aumentar tamanho da fonte"
            aria-label="Aumentar tamanho da fonte"
            data-testid="toolbar-font-increase"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => stepFontSize(1)}
            className={toolBtnClass(false)}
          >
            <Type className="h-3.5 w-3.5" />
            <ArrowUp className="h-2.5 w-2.5" />
          </button>

          <button
            type="button"
            title="Diminuir tamanho da fonte"
            aria-label="Diminuir tamanho da fonte"
            data-testid="toolbar-font-decrease"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => stepFontSize(-1)}
            className={toolBtnClass(false)}
          >
            <Type className="h-3 w-3" />
            <ArrowDown className="h-2.5 w-2.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* GRUPO 3: FORMATAÇÃO DE CARACTERES */}
        <div className="flex flex-wrap items-center gap-0.5 px-1">
          <button
            type="button"
            title="Negrito (Ctrl+B)"
            aria-label="Negrito"
            aria-pressed={active.bold}
            data-testid="toolbar-bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleInlineTag("strong", "bold")}
            className={toolBtnClass(active.bold)}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Itálico (Ctrl+I)"
            aria-label="Itálico"
            aria-pressed={active.italic}
            data-testid="toolbar-italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleInlineTag("em", "italic")}
            className={toolBtnClass(active.italic)}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Sublinhado (Ctrl+U)"
            aria-label="Sublinhado"
            aria-pressed={active.underline}
            data-testid="toolbar-underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleInlineTag("u", "underline")}
            className={toolBtnClass(active.underline)}
          >
            <Underline className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Tachado"
            aria-label="Tachado"
            aria-pressed={active.strikeThrough}
            data-testid="toolbar-strikethrough"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleInlineTag("s", "strikeThrough")}
            className={toolBtnClass(active.strikeThrough)}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Sobrescrito"
            aria-label="Sobrescrito"
            aria-pressed={active.superscript}
            data-testid="toolbar-superscript"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleInlineTag("sup", "superscript")}
            className={toolBtnClass(active.superscript)}
          >
            <Superscript className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Subscrito"
            aria-label="Subscrito"
            aria-pressed={active.subscript}
            data-testid="toolbar-subscript"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleInlineTag("sub", "subscript")}
            className={toolBtnClass(active.subscript)}
          >
            <Subscript className="h-3.5 w-3.5" />
          </button>

          {/* COR DO TEXTO */}
          <div className="relative">
            <button
              type="button"
              title="Cor do texto"
              aria-label="Cor do texto"
              data-testid="toolbar-text-color"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => {
                setTextColorOpen((o) => !o);
                setHighlightOpen(false);
                setSpacingMenuOpen(false);
              }}
              className={toolBtnClass(textColorOpen)}
            >
              <Palette className="h-3.5 w-3.5" />
              <span
                className="ml-1 h-2.5 w-2.5 rounded-full border border-white/30"
                style={{ backgroundColor: active.textColor }}
              />
            </button>
            {textColorOpen && (
              <div
                className="card-luxe absolute left-0 top-10 z-50 w-60 p-3 shadow-xl"
                data-testid="popover-text-color"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Cor da Fonte
                  </span>
                  <button
                    type="button"
                    onClick={() => setTextColorOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {WORD_TEXT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      data-testid={`text-color-swatch-${c.hex}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applyInlineStyle("color", c.hex);
                        setTextColorOpen(false);
                      }}
                      className="h-6 w-6 rounded-md border border-white/25 transition hover:scale-110"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2">
                  <input
                    type="text"
                    aria-label="Hexadecimal da cor do texto"
                    data-testid="input-custom-text-color"
                    value={customTextColorHex}
                    onChange={(e) => setCustomTextColorHex(e.target.value)}
                    placeholder="#E8475F"
                    className="!min-h-7 !px-2 !py-0.5 !text-xs font-mono"
                  />
                  <button
                    type="button"
                    data-testid="apply-custom-text-color"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (/^#[0-9A-Fa-f]{3,6}$/.test(customTextColorHex.trim())) {
                        applyInlineStyle("color", customTextColorHex.trim());
                        setTextColorOpen(false);
                      }
                    }}
                    className="btn !min-h-7 !px-2.5 !py-0.5 !text-xs"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MARCA-TEXTO (COR DE DESTAQUE) */}
          <div className="relative">
            <button
              type="button"
              title="Realce / Cor de destaque (Marca-texto)"
              aria-label="Cor de destaque"
              data-testid="toolbar-highlight-color"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => {
                setHighlightOpen((o) => !o);
                setTextColorOpen(false);
                setSpacingMenuOpen(false);
              }}
              className={toolBtnClass(highlightOpen)}
            >
              <Highlighter className="h-3.5 w-3.5" />
            </button>
            {highlightOpen && (
              <div
                className="card-luxe absolute left-0 top-10 z-50 w-60 p-3 shadow-xl"
                data-testid="popover-highlight-color"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Marca-Texto
                  </span>
                  <button
                    type="button"
                    onClick={() => setHighlightOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {WORD_HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      title={c.label}
                      data-testid={`highlight-swatch-${c.hex}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applyInlineStyle("backgroundColor", c.hex);
                        setHighlightOpen(false);
                      }}
                      className="flex h-6 w-8 items-center justify-center rounded-md border border-white/25 text-[10px] transition hover:scale-105"
                      style={{
                        backgroundColor: c.hex === "transparent" ? "transparent" : c.hex,
                      }}
                    >
                      {c.hex === "transparent" ? "Ø" : ""}
                    </button>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2">
                  <input
                    type="text"
                    aria-label="Hexadecimal do destaque"
                    data-testid="input-custom-highlight-color"
                    value={customHighlightHex}
                    onChange={(e) => setCustomHighlightHex(e.target.value)}
                    placeholder="#7A0F2B"
                    className="!min-h-7 !px-2 !py-0.5 !text-xs font-mono"
                  />
                  <button
                    type="button"
                    data-testid="apply-custom-highlight-color"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (/^#[0-9A-Fa-f]{3,6}$/.test(customHighlightHex.trim())) {
                        applyInlineStyle("backgroundColor", customHighlightHex.trim());
                        setHighlightOpen(false);
                      }
                    }}
                    className="btn !min-h-7 !px-2.5 !py-0.5 !text-xs"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            title="Limpar formatação do trecho selecionado"
            aria-label="Remover formatação"
            data-testid="toolbar-clear-format"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSelectionFormatting}
            className={toolBtnClass(false)}
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* GRUPO 4: PARÁGRAFOS, ALINHAMENTO, LISTAS E RECUOS */}
        <div className="flex flex-wrap items-center gap-0.5 px-1">
          <button
            type="button"
            title="Alinhar à esquerda"
            aria-label="Alinhar à esquerda"
            aria-pressed={active.align === "left"}
            data-testid="toolbar-align-left"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyAlignment("left")}
            className={toolBtnClass(active.align === "left")}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Centralizar"
            aria-label="Centralizar"
            aria-pressed={active.align === "center"}
            data-testid="toolbar-align-center"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyAlignment("center")}
            className={toolBtnClass(active.align === "center")}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Alinhar à direita"
            aria-label="Alinhar à direita"
            aria-pressed={active.align === "right"}
            data-testid="toolbar-align-right"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyAlignment("right")}
            className={toolBtnClass(active.align === "right")}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Justificar"
            aria-label="Justificar"
            aria-pressed={active.align === "justify"}
            data-testid="toolbar-align-justify"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyAlignment("justify")}
            className={toolBtnClass(active.align === "justify")}
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Lista com marcadores"
            aria-label="Lista com marcadores"
            aria-pressed={active.unorderedList}
            data-testid="toolbar-bullet-list"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleList("ul")}
            className={toolBtnClass(active.unorderedList)}
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Lista numerada"
            aria-label="Lista numerada"
            aria-pressed={active.orderedList}
            data-testid="toolbar-ordered-list"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleList("ol")}
            className={toolBtnClass(active.orderedList)}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Diminuir recuo"
            aria-label="Diminuir recuo"
            data-testid="toolbar-outdent"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => adjustIndent(-1)}
            className={toolBtnClass(false)}
          >
            <IndentDecrease className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Aumentar recuo"
            aria-label="Aumentar recuo"
            data-testid="toolbar-indent"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => adjustIndent(1)}
            className={toolBtnClass(false)}
          >
            <IndentIncrease className="h-3.5 w-3.5" />
          </button>

          {/* ESPAÇAMENTO ENTRE LINHAS E PARÁGRAFOS */}
          <div className="relative">
            <button
              type="button"
              title="Espaçamento entre linhas e parágrafos"
              aria-label="Espaçamento"
              data-testid="toolbar-spacing"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => {
                setSpacingMenuOpen((o) => !o);
                setTextColorOpen(false);
                setHighlightOpen(false);
              }}
              className={toolBtnClass(spacingMenuOpen)}
            >
              <MoveVertical className="h-3.5 w-3.5" />
            </button>
            {spacingMenuOpen && (
              <div
                className="card-luxe absolute right-0 top-10 z-50 w-56 space-y-2 p-3 shadow-xl"
                data-testid="popover-spacing"
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Entrelinhas
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    {WORD_LINE_HEIGHTS.map((lh) => (
                      <button
                        key={lh.value}
                        type="button"
                        data-testid={`line-height-${lh.value}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          applyLineHeight(lh.value);
                          setSpacingMenuOpen(false);
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-1 text-left text-xs hover:bg-secondary ${
                          active.lineHeight === lh.value ? "bg-secondary text-primary" : ""
                        }`}
                      >
                        <span>{lh.label}</span>
                        {active.lineHeight === lh.value && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-2">
                  <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Pilcrow className="h-3 w-3" /> Espaço entre parágrafos
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    {WORD_PARAGRAPH_SPACINGS.map((ps) => (
                      <button
                        key={ps.value}
                        type="button"
                        data-testid={`para-spacing-${ps.value}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          applyParagraphSpacing(ps.value);
                          setSpacingMenuOpen(false);
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-1 text-left text-xs hover:bg-secondary ${
                          active.paragraphSpacing === ps.value ? "bg-secondary text-primary" : ""
                        }`}
                      >
                        <span>{ps.label}</span>
                        {active.paragraphSpacing === ps.value && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* GRUPO 5: HIPERLINKS */}
        <div className="flex items-center gap-0.5 pl-1">
          <button
            type="button"
            title="Inserir ou editar hiperlink"
            aria-label="Inserir hiperlink"
            data-testid="toolbar-insert-link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={openInsertLinkDialog}
            className={toolBtnClass(linkDialogOpen)}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Remover hiperlink"
            aria-label="Remover hiperlink"
            data-testid="toolbar-remove-link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={removeHyperlink}
            className={toolBtnClass(false)}
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* PAINEL INLINE DE INSERÇÃO / EDIÇÃO DE HIPERLINK */}
      {linkDialogOpen && (
        <div
          className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-xs"
          data-testid="link-dialog-panel"
        >
          <span className="font-medium text-teal">Hiperlink:</span>
          <input
            type="text"
            aria-label="Texto do link"
            data-testid="input-link-text"
            placeholder="Texto exibido (opcional)"
            value={linkTextInput}
            onChange={(e) => setLinkTextInput(e.target.value)}
            className="!min-h-8 !w-44 !px-2 !py-1 !text-xs"
          />
          <input
            type="url"
            aria-label="URL do link"
            data-testid="input-link-url"
            placeholder="https://exemplo.com"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            className="!min-h-8 min-w-[200px] flex-1 !px-2 !py-1 !text-xs"
          />
          <button
            type="button"
            data-testid="confirm-insert-link"
            onClick={confirmInsertLink}
            className="btn !min-h-8 !px-3 !py-1 !text-xs"
          >
            Aplicar Link
          </button>
          <button
            type="button"
            onClick={() => setLinkDialogOpen(false)}
            className="btn-ghost !min-h-8 !px-2.5 !py-1 !text-xs"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ÁREA DE DOCUMENTO EDITÁVEL */}
      <div className="relative">
        {!valueHtml && !plainTextFallback && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3.5 select-none text-sm text-muted-foreground/65"
          >
            {placeholder}
          </div>
        )}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Resumo do capítulo"
          data-testid="word-rich-editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={() => emitChange(true)}
          onKeyUp={inspectActiveFormatting}
          onMouseUp={inspectActiveFormatting}
          onFocus={inspectActiveFormatting}
          onBlur={saveSelection}
          onPaste={handlePaste}
          className="min-h-[240px] max-h-[680px] overflow-y-auto px-4 py-3.5 text-base leading-relaxed text-foreground focus:outline-none [&_a]:text-teal [&_a]:underline [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:font-display [&_h3]:text-lg [&_h3]:italic [&_h3]:text-teal [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
    </div>
  );
}
