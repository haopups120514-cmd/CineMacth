const ALLOWED_DOMAINS = [
  ".ac.jp",  // 日本大学
  ".edu",    // 美国大学
  ".edu.cn", // 中国大学
  ".ac.uk",  // 英国大学
  ".edu.au", // 澳洲大学
  ".ac.kr",  // 韩国大学
];

// 测试账户白名单
const WHITELIST_EMAILS = [
  "haopups120514@gmail.com",
  "yaojunwang607@gmail.com",
  "haopups@foxmail.com",
];

export function isStudentEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();

  // 检查白名单
  if (WHITELIST_EMAILS.includes(normalized)) return true;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) return false;
  return ALLOWED_DOMAINS.some((domain) => normalized.endsWith(domain));
}

export function getEmailError(email: string): string | null {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "请输入有效的邮箱地址";
  if (!isStudentEmail(email)) return "请使用学校邮箱（如 .ac.jp、.edu 等）";
  return null;
}
