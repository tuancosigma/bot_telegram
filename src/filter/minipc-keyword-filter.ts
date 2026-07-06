const MINI_PC_KEYWORDS = [
  "firebat",
  "beelink",
  "minisforum",
  "gmktec",
  "aoostar",
  "geekom",
  "hp mini",
  "lenovo tiny",
  "dell micro",
  "intel nuc",
  "nuc",
  "mini pc",
  "minipc",
  "mini-pc",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // strip Vietnamese diacritics (combining marks)
}

export function isMiniPcPost(textContent: string): boolean {
  const normalized = normalize(textContent);
  return MINI_PC_KEYWORDS.some((keyword) => normalized.includes(normalize(keyword)));
}
