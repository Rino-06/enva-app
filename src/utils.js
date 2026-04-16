// ─────────────────────────────────────────────
//  utils.js  —  ENVA yardımcı fonksiyonlar
// ─────────────────────────────────────────────

/** Sayıyı 2 haneli stringe çevirir: 5 → "05" */
export const pad = (n) => String(n).padStart(2, "0");

/**
 * Süreyi formatlı stringe çevirir.
 * Yüzme: "mm:ss.ms"  |  Koşma: "mm:ss"
 */
export const fmtTime = (disc, m, s, ms = 0) =>
  disc === "swim"
    ? `${pad(m)}:${pad(s)}.${pad(ms)}`
    : `${pad(m)}:${pad(s)}`;

/** Dakika / saniye / milisaniyeyi toplam saniyeye çevirir */
export const toSec = (m, s, ms = 0) => m * 60 + s + ms / 100;

/**
 * Şifre doğrulama: en az 1 büyük harf, 1 küçük harf, 1 özel karakter
 */
export const validatePass = (p) =>
  /[A-Z]/.test(p) && /[a-z]/.test(p) && /[!@#$%^&*()_\-+=]/.test(p);

/**
 * Türkçe karakterleri dönüştürerek "ad.soyad" formatında kullanıcı adı üretir.
 * Örn: "Fatih Hasdemir" → "fatih.hasdemir"
 */
export const makeUsername = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/, ".");

/** Bugünün tarihini "YYYY-MM-DD" formatında döndürür */
export const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * ISO tarih stringini GG.AA.YYYY formatına çevirir.
 * Örn: "2026-03-15" → "15.03.2026"
 */
export const fmtDate = (iso) => {
  if (!iso || iso.length < 10) return iso || "";
  return `${iso.slice(8,10)}.${iso.slice(5,7)}.${iso.slice(0,4)}`;
};

/**
 * Basit şifre üretir: KelimeNNN
 */
export const makePassword = (name) => {
  const words = ["Enva","Yuzme","Kosu","Spor","Penta","Hiz","Guc","Su","Pist","Kulup"];
  const idx = name ? name.charCodeAt(0) % words.length : 0;
  const num = String(Math.floor(Math.random()*900)+100);
  return words[idx] + num;
};
