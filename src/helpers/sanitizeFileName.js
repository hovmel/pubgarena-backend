function sanitizeFileName(str) {
  return str
    .replace(/[^a-zA-Zа-яА-ЯёЁ0-9_\-.]/gu, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default sanitizeFileName;
