/** Public contact / operator identity for brochure and legal pages. */

const DEFAULT_OPERATOR_NAME_BG = "Learning Lesson — пилотен екип";
const DEFAULT_OPERATOR_NAME_EN = "Learning Lesson — pilot team";
const DEFAULT_CONTACT_EMAIL = "pilot@learninglesson.app";

export function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
}

export function getOperatorName(language: "bg" | "en"): string {
  const fromEnv = process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return language === "bg" ? DEFAULT_OPERATOR_NAME_BG : DEFAULT_OPERATOR_NAME_EN;
}

export function getContactMailto(subject?: string): string {
  const email = getContactEmail();
  if (!subject) {
    return `mailto:${email}`;
  }
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
