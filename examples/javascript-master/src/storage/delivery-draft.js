const KEY = 'app:delivery-draft';
export const saveDraft = (draft) => sessionStorage.setItem(KEY, JSON.stringify(draft));
export function loadDraft() {
  try {
    // Incluso el almacenamiento propio se trata como dato externo al leer.
    return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}
