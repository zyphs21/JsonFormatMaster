/**
 * 解析 JSON 字符串，同时支持处理嵌套的 JSON 值
 * @param jsonStr JSON 字符串
 * @param processNestedJson 是否处理嵌套的 JSON 字符串
 * @returns 解析后的 JSON 对象
 */
export const parseJson = (jsonStr: string, processNestedJson: boolean = false): unknown => {
  try {
    const parsed = JSON.parse(jsonStr);
    
    if (processNestedJson) {
      return processNestedJsonValues(parsed);
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`JSON 解析错误: ${(error as Error).message}`);
  }
};

/**
 * 递归处理嵌套的 JSON 字符串值
 * @param obj 待处理的对象
 * @returns 处理后的对象
 */
const processNestedJsonValues = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processNestedJsonValues(item));
  }
  
  const result: Record<string, unknown> = {};
  
  for (const key in obj as Record<string, unknown>) {
    const value = (obj as Record<string, unknown>)[key];
    
    // 检查是否为 JSON 字符串
    if (typeof value === 'string' && isJsonString(value)) {
      try {
        result[key] = processNestedJsonValues(JSON.parse(value));
      } catch {
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = processNestedJsonValues(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * 检查字符串是否为有效的 JSON
 * @param str 待检查的字符串
 * @returns 是否为 JSON 字符串
 */
export const isJsonString = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  
  // 检查字符串是否以 { 开头和 } 结尾，或 [ 开头和 ] 结尾
  const trimmed = str.trim();
  if (
    !(trimmed.startsWith('{') && trimmed.endsWith('}')) &&
    !(trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return false;
  }
  
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * 将对象转换为格式化的 JSON 字符串
 * @param obj 待转换的对象
 * @returns 格式化的 JSON 字符串
 */
export const stringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    throw new Error(`JSON 转换错误: ${(error as Error).message}`);
  }
}; 