// 内测阶段：暂时关闭邮箱域名限制，允许所有邮箱注册
// const ALLOWED_DOMAINS = [
//   ".ac.jp",  // 日本大学
//   ".edu",    // 美国大学
//   ".edu.cn", // 中国大学
//   ".ac.uk",  // 英国大学
//   ".edu.au", // 澳洲大学
//   ".ac.kr",  // 韩国大学
// ];

export function isStudentEmail(email: string): boolean {
  // 内测阶段：只要是有效邮箱格式即可
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
}

export function getEmailError(email: string): string | null {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "请输入有效的邮箱地址 / Please enter a valid email";
  return null;
}
