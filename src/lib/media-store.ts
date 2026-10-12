/**
 * Armazenamento dedicado de imagens e mídias (IndexedDB) para não sobrecarregar o localStorage.
 * Mantém fallback em memória caso IndexedDB não esteja disponível (ex: testes SSR/jsdom).
 */

const DB_NAME = "spectral-archive-media-v1";
const STORE_NAME = "images";
const memFallback = new Map<string, string>();

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function storeMediaDataUrl(id: string, dataUrl: string): Promise<string> {
  memFallback.set(id, dataUrl);
  const db = await openDB();
  if (!db) return dataUrl;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, id);
      tx.oncomplete = () => resolve(`idb://${id}`);
      tx.onerror = () => resolve(dataUrl);
    } catch {
      resolve(dataUrl);
    }
  });
}

export async function getMediaDataUrl(refOrUrl: string | undefined): Promise<string | undefined> {
  if (!refOrUrl) return undefined;
  if (!refOrUrl.startsWith("idb://")) return refOrUrl;
  const id = refOrUrl.slice("idb://".length);
  if (memFallback.has(id)) return memFallback.get(id);
  const db = await openDB();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const val = typeof req.result === "string" ? req.result : undefined;
        if (val) memFallback.set(id, val);
        resolve(val);
      };
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function deleteMediaDataUrl(refOrUrl: string | undefined): Promise<void> {
  if (!refOrUrl || !refOrUrl.startsWith("idb://")) return;
  const id = refOrUrl.slice("idb://".length);
  memFallback.delete(id);
  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Lê um arquivo de imagem (PNG, JPEG, WebP, etc.), redimensiona/otimiza suavemente se necessário
 * para evitar consumo excessivo de memória, e retorna um DataURL.
 */
export function processImageFile(file: File, maxDim = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo de imagem."));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      // Em ambiente de teste (jsdom) onde Image/Canvas pode não renderizar, retorna direto:
      if (
        typeof document === "undefined" ||
        typeof Image === "undefined" ||
        rawDataUrl.length < 180_000
      ) {
        resolve(rawDataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width <= maxDim && height <= maxDim && rawDataUrl.length < 600_000) {
            resolve(rawDataUrl);
            return;
          }
          const ratio = Math.min(maxDim / width, maxDim / height, 1);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const out = canvas.toDataURL("image/webp", 0.86);
          resolve(out && out.startsWith("data:image") ? out : rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
