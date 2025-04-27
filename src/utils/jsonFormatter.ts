/**
 * 解析 JSON 字符串，同时支持处理嵌套的 JSON 值
 * @param jsonStr JSON 字符串
 * @param processNestedJson 是否处理嵌套的 JSON 字符串
 * @returns 解析后的 JSON 对象
 */
export const parseJson = (jsonStr: string, processNestedJson: boolean = false): unknown => {
  try {
    // 检查是否是被双引号包裹的JSON字符串
    const unwrappedJson = unwrapQuotedJsonString(jsonStr);
    
    // 在解析之前，将大数字转换为带标记的字符串
    const processedJson = unwrappedJson.replace(/(?<!\\)":\s*(\d{16,})(?=\s*[,}])/g, '":"[BigInt]$1"');
    
    const parsed = JSON.parse(processedJson);
    
    if (processNestedJson) {
      return processNestedJsonValues(parsed);
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`JSON 解析错误: ${(error as Error).message}`);
  }
};

/**
 * 处理被双引号包裹的JSON字符串
 * 例如: "{\"resp_json\":\"value\"}" -> {"resp_json":"value"}
 * 或者: "{"resp_json":"value"}" -> {"resp_json":"value"}
 * @param jsonStr 可能被双引号包裹的JSON字符串
 * @returns 移除外层双引号后的JSON字符串
 */
export const unwrapQuotedJsonString = (jsonStr: string): string => {
  const trimmed = jsonStr.trim();
  
  // 检查是否被双引号包裹
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 2) {
    try {
      // 首先尝试标准的JSON解析
      const unquoted = JSON.parse(trimmed);
      
      // 检查解析后是否是字符串，并且该字符串看起来像是一个JSON
      if (typeof unquoted === 'string' && 
          ((unquoted.startsWith('{') && unquoted.endsWith('}')) || 
           (unquoted.startsWith('[') && unquoted.endsWith(']')))) {
        return unquoted;
      }
    } catch {
      // JSON.parse 失败，可能是因为内部没有转义，尝试手动截取
      try {
        // 去掉前后双引号，直接尝试看内容是否可以作为JSON解析
        const content = trimmed.substring(1, trimmed.length - 1);
        if ((content.startsWith('{') && content.endsWith('}')) || 
            (content.startsWith('[') && content.endsWith(']'))) {
          // 尝试直接解析内容
          JSON.parse(content);
          return content;
        }
      } catch {
        // 仍然失败，使用原始字符串
      }
    }
  }
  
  return trimmed;
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
        // 在解析之前，将大数字转换为带标记的字符串
        const processedValue = value.replace(/(?<!\\)":\s*(\d{16,})(?=\s*[,}])/g, '":"[BigInt]$1"');
        const parsedValue = JSON.parse(processedValue);
        result[key] = processNestedJsonValues(parsedValue);
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
  
  const trimmed = str.trim();
  
  // 快速检查：字符串是否以 { 开头和 } 结尾，或 [ 开头和 ] 结尾
  if (
    !(trimmed.startsWith('{') && trimmed.endsWith('}')) &&
    !(trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    // 检查是否是被双引号包裹的JSON字符串格式
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        // 标准方式尝试
        const unquoted = JSON.parse(trimmed);
        if (typeof unquoted === 'string') {
          return isJsonString(unquoted);
        }
      } catch {
        // 尝试直接截取内容检查
        const content = trimmed.substring(1, trimmed.length - 1);
        if ((content.startsWith('{') && content.endsWith('}')) || 
            (content.startsWith('[') && content.endsWith(']'))) {
          try {
            JSON.parse(content);
            return true;
          } catch {
            // 解析失败，不是有效的JSON字符串
          }
        }
      }
    }
    return false;
  }
  
  // 尝试解析
  try {
    JSON.parse(trimmed);
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