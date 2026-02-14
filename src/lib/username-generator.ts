/**
 * 生成随机用户名
 * 格式：user + 随机4位数字
 * 例如：user7392
 */
export function generateRandomUsername(): string {
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `user${randomNum}`;
}

/**
 * 验证用户名格式
 * 要求：3-20 个字符，只允许字母、数字、下划线
 */
export function isValidUsername(username: string): string | null {
  if (!username) return "用户名不能为空";
  if (username.length < 3) return "用户名至少需要 3 个字符";
  if (username.length > 20) return "用户名最多 20 个字符";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "用户名只能包含字母、数字和下划线";
  }
  return null;
}

/**
 * 检查是否可以修改用户名（每月一次）
 */
export function canChangeUsername(lastChangedAt: string | null): boolean {
  if (!lastChangedAt) return true;

  const lastChanged = new Date(lastChangedAt);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDiff >= 30;
}

/**
 * 获取下次可修改用户名的日期
 */
export function getNextChangeDate(lastChangedAt: string | null): Date | null {
  if (!lastChangedAt) return null;

  const lastChanged = new Date(lastChangedAt);
  const nextChange = new Date(lastChanged.getTime() + 30 * 24 * 60 * 60 * 1000);

  return nextChange;
}
