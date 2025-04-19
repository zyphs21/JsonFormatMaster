import React, { useState, useCallback, ReactNode } from 'react';
import { parseJson, stringify, isJsonString, unwrapQuotedJsonString } from '../utils/jsonFormatter';
import JsonViewer from './JsonViewer';
import { FiCopy, FiTrash2, FiCode } from 'react-icons/fi';

// 内联样式定义
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
    color: '#333'
  },
  header: {
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1rem',
    borderBottom: '1px solid #e5edff'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center'
  },
  logoIcon: {
    color: '#3b82f6',
    marginRight: '0.5rem',
    fontSize: '1.5rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1e40af'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#3b82f6',
    fontWeight: '500'
  },
  main: {
    flexGrow: 1,
    padding: '2rem 0',
  },
  content: {
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 1rem',
  },
  toolbar: {
    marginBottom: '2rem',
    background: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5edff'
  },
  toolbarFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
    marginRight: '0.5rem'
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  badge: {
    position: 'absolute' as const,
    top: '-0.5rem',
    right: '-0.5rem',
    background: '#3b82f6',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    transform: 'rotate(3deg)'
  },
  buttonContainer: {
    display: 'flex',
    gap: '0.75rem'
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    background: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  clearButtonIcon: {
    color: '#ef4444',
    marginRight: '0.5rem'
  },
  formatButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: '0.5rem',
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    width: '100%'
  },
  card: {
    background: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #e5edff',
    transition: 'all 0.3s'
  },
  cardHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e5edff',
    background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e40af',
    display: 'flex',
    alignItems: 'center'
  },
  badge2: {
    marginLeft: '0.5rem',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    background: 'transparent',
    color: '#3b82f6',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  copyIcon: {
    marginRight: '0.25rem'
  },
  cardBody: {
    padding: '1rem'
  },
  textarea: {
    width: '100%',
    height: '400px',
    padding: '1rem',
    border: '1px solid #e5edff',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    resize: 'none' as const,
    outline: 'none'
  },
  resultContainer: {
    height: '400px',
    overflow: 'auto',
    padding: '1rem'
  },
  errorMessage: {
    color: '#ef4444',
    padding: '0.5rem'
  },
  placeholder: {
    color: '#9ca3af',
    padding: '0.5rem'
  },
  footer: {
    background: 'white',
    padding: '1.5rem 1rem',
    marginTop: '2rem',
    boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
    borderTop: '1px solid #e5edff'
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  copyright: {
    fontSize: '0.875rem',
    color: '#3b82f6',
    textAlign: 'center' as const
  },
  tag: {
    fontSize: '0.75rem',
    background: '#e0f2fe',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontWeight: '500'
  }
};

const JsonFormatter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<unknown>(null);
  const [processNestedJson, setProcessNestedJson] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [wasDoubleQuoted, setWasDoubleQuoted] = useState<boolean>(false);

  const formatJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setError('请输入有效的 JSON 字符串');
      setFormattedJson(null);
      return;
    }

    try {
      const trimmed = jsonInput.trim();
      // 检查是否是被双引号包裹的JSON字符串（包括有转义和无转义的情况）
      const isDoubleQuoted = 
        trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 2 &&
        (
          // 标准的包含转义符的情况
          ((() => {
            try {
              const parsed = JSON.parse(trimmed);
              return typeof parsed === 'string' && (
                parsed.startsWith('{') && parsed.endsWith('}') ||
                parsed.startsWith('[') && parsed.endsWith(']')
              );
            } catch {
              return false;
            }
          })()) ||
          // 无转义符的情况
          ((() => {
            const content = trimmed.substring(1, trimmed.length - 1);
            return (
              (content.startsWith('{') && content.endsWith('}')) ||
              (content.startsWith('[') && content.endsWith(']'))
            ) && (() => {
              try {
                JSON.parse(content);
                return true;
              } catch {
                return false;
              }
            })();
          })())
        );
      
      setWasDoubleQuoted(isDoubleQuoted);

      // 先尝试解开双引号包装后检查是否是有效的JSON
      const unwrapped = unwrapQuotedJsonString(jsonInput);
      if (!isJsonString(unwrapped)) {
        setError('输入的不是有效的JSON字符串');
        setFormattedJson(null);
        return;
      }

      const parsedJson = parseJson(jsonInput, processNestedJson);
      setFormattedJson(parsedJson);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setFormattedJson(null);
    }
  }, [jsonInput, processNestedJson]);

  const handleCopyToClipboard = useCallback(() => {
    if (formattedJson) {
      try {
        let prettyJson = stringify(formattedJson);
        
        // 如果原始输入是被双引号包裹的，且用户希望保持这种格式，可以再次包裹
        if (wasDoubleQuoted) {
          prettyJson = JSON.stringify(prettyJson);
        }
        
        navigator.clipboard.writeText(prettyJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        setError(`复制失败: ${(e as Error).message}`);
      }
    }
  }, [formattedJson, wasDoubleQuoted]);

  const handleClear = useCallback(() => {
    setJsonInput('');
    setFormattedJson(null);
    setError(null);
    setWasDoubleQuoted(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  }, []);

  const handleToggleNestedJson = useCallback(() => {
    setProcessNestedJson(prev => !prev);
    if (jsonInput.trim()) {
      try {
        const unwrapped = unwrapQuotedJsonString(jsonInput);
        if (isJsonString(unwrapped)) {
          const parsedJson = parseJson(jsonInput, !processNestedJson);
          setFormattedJson(parsedJson);
          setError(null);
        }
      } catch {
        // 保持当前状态，不进行更新
      }
    }
  }, [jsonInput, processNestedJson]);

  const renderResult = (): ReactNode => {
    if (error) {
      return <div style={styles.errorMessage}>{error}</div>;
    }
    
    if (formattedJson !== null) {
      return <JsonViewer data={formattedJson as Record<string, unknown> | unknown[]} />;
    }
    
    return <div style={styles.placeholder}>格式化的 JSON 将在这里显示</div>;
  };

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <FiCode style={styles.logoIcon} />
            <h1 style={styles.title}>JSON 格式化大师</h1>
          </div>
          <div style={styles.subtitle}>
            提供强大的 JSON 格式化与解析功能
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main style={styles.main}>
        <div style={styles.content}>
          {/* 工具栏 */}
          <div style={styles.toolbar}>
            <div style={styles.toolbarFlex}>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="processNestedJson"
                  checked={processNestedJson}
                  onChange={handleToggleNestedJson}
                  style={styles.checkbox}
                />
                <label htmlFor="processNestedJson" style={styles.checkboxLabel}>
                  解析嵌套 JSON 字符串
                </label>
                <div style={styles.badge}>
                  新功能
                </div>
              </div>
              
              <div style={styles.buttonContainer}>
                <button
                  onClick={handleClear}
                  style={styles.clearButton}
                >
                  <FiTrash2 style={styles.clearButtonIcon} /> 清空
                </button>
                
                <button
                  onClick={formatJson}
                  style={styles.formatButton}
                >
                  格式化 JSON
                </button>
              </div>
            </div>
          </div>

          {/* 输入输出区域 */}
          <div style={styles.grid}>
            {/* 输入区域 */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>
                  输入 JSON
                </h2>
              </div>
              
              <div style={styles.cardBody}>
                <textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder='{"example": "在此处粘贴你的 JSON"}'
                />
              </div>
            </div>

            {/* 输出区域 */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>
                  <span>格式化结果</span>
                  {wasDoubleQuoted && (
                    <span style={styles.badge2}>
                      检测到被引号包裹的JSON
                    </span>
                  )}
                </h2>
                
                {formattedJson !== null && (
                  <button
                    onClick={handleCopyToClipboard}
                    style={styles.copyButton}
                    title="复制到剪贴板"
                  >
                    <FiCopy style={styles.copyIcon} /> {copied ? '已复制!' : '复制'}
                  </button>
                )}
              </div>
              
              <div style={styles.resultContainer}>
                {renderResult()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部区域 */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} JSON 格式化大师 | 提供高效的 JSON 格式化工具
            </p>
          </div>
          <div>
            <span style={styles.tag}>
              支持标准JSON和嵌套JSON字符串
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JsonFormatter; 