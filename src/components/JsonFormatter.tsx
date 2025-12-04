import React, { useState, useCallback, ReactNode, useRef } from 'react';
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
    color: '#333',
    overflow: 'auto',
    width: '100%'
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
    overflow: 'visible'
  },
  content: {
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 1rem',
    boxSizing: 'border-box' as const,
    overflow: 'hidden'
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
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    width: '100%',
    overflow: 'hidden'
  },
  card: {
    background: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #e5edff',
    transition: 'all 0.3s',
    width: '100%',
    boxSizing: 'border-box' as const
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
    padding: '1rem',
    boxSizing: 'border-box' as const
  },
  textarea: {
    width: '100%',
    height: '300px',
    padding: '1rem',
    border: '1px solid #e5edff',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    resize: 'none' as const,
    outline: 'none',
    boxSizing: 'border-box' as const
  },
  resultContainer: {
    minHeight: '300px',
    height: 'auto',
    maxHeight: 'none',
    overflow: 'auto',
    padding: '1rem',
    boxSizing: 'border-box' as const,
    whiteSpace: 'nowrap'
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
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pathSearchMode, setPathSearchMode] = useState<boolean>(false);
  const [globalExpandSignal, setGlobalExpandSignal] = useState<{ mode: 'none' | 'expand_all' | 'collapse_all'; tick: number }>({ mode: 'none', tick: 0 });
  const [filterOnlyMatches, setFilterOnlyMatches] = useState<boolean>(false);
  const [matchStrategy, setMatchStrategy] = useState<'contains' | 'exact' | 'regex'>('contains');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [autoExpand, setAutoExpand] = useState<boolean>(true);
  const [matchedPaths, setMatchedPaths] = useState<string[]>([]);
  const [matchesVersion, setMatchesVersion] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);

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
    setSearchQuery('');
    setMatchedPaths([]);
    setActiveIndex(0);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  }, []);

  const computeMatches = useCallback((data: unknown, query: string): string[] => {
    if (!data || !query.trim()) return [];
    const raw = query.trim();
    const norm = caseSensitive ? raw : raw.toLowerCase();
    const rawForRegex = raw.replace(/\[\]/g, '\\[\\d+\\]');
    const regex = matchStrategy === 'regex' ? (() => {
      try { return new RegExp(rawForRegex, caseSensitive ? undefined : 'i'); } catch { return null; }
    })() : null;
    const matchText = (text: string) => {
      if (!raw) return false;
      if (matchStrategy === 'regex') return regex ? regex.test(text) : false;
      const t = caseSensitive ? text : text.toLowerCase();
      if (matchStrategy === 'exact') return t === norm;
      return t.includes(norm);
    };
    const matchPath = (p: string) => {
      const text = p || '';
      if (!raw) return false;
      if (matchStrategy === 'regex') return regex ? regex.test(text) : false;
      const tNoIdx = text.replace(/\[\d+\]/g, '');
      const qNoIdx = raw.replace(/\[\d+\]/g, '').replace(/\[\]/g, '');
      const t = caseSensitive ? tNoIdx : tNoIdx.toLowerCase();
      const q = caseSensitive ? qNoIdx : qNoIdx.toLowerCase();
      if (matchStrategy === 'exact') return t === q;
      return t.includes(q);
    };

    const paths: string[] = [];
    const getType = (v: unknown): string => {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'array';
      return typeof v;
    };
    const walk = (v: unknown, p: string) => {
      const t = getType(v);
      if (pathSearchMode) {
        if (matchPath(p)) paths.push(p);
      } else {
        if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') {
          if (matchText(String(v))) paths.push(p);
        }
      }
      if (t === 'array') {
        const arr = v as unknown[];
        for (let i = 0; i < arr.length; i++) {
          walk(arr[i], `${p}[${i}]`);
        }
      } else if (t === 'object') {
        const obj = v as Record<string, unknown>;
        for (const k of Object.keys(obj)) {
          const childPath = p ? `${p}.${k}` : k;
          if (!pathSearchMode) {
            if (matchText(k)) paths.push(childPath);
          }
          walk(obj[k], childPath);
        }
      }
    };
    walk(data, '$');
    return paths;
  }, [matchStrategy, caseSensitive, pathSearchMode]);

  const triggerSearch = useCallback(() => {
    const q = searchInput.trim();
    setSearchQuery(q);
    setMatchesVersion(v => v + 1);
    if (formattedJson !== null) {
      const matches = computeMatches(formattedJson, q);
      setMatchedPaths(matches);
      setActiveIndex(0);
    } else {
      setMatchedPaths([]);
      setActiveIndex(0);
    }
  }, [searchInput, formattedJson, computeMatches]);

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

  React.useEffect(() => {
    // 仅在有效的 searchQuery 或数据/配置变化后重置并等待点击“搜索”触发
    setMatchedPaths([]);
    setActiveIndex(0);
  }, [pathSearchMode, matchStrategy, caseSensitive, formattedJson]);

  React.useEffect(() => {
    const activePath = matchedPaths[activeIndex];
    if (!activePath) return;
    const el = document.querySelector(`[data-path="${activePath}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [matchedPaths, activeIndex]);

  const renderResult = (): ReactNode => {
    if (error) {
      return <div style={styles.errorMessage}>{error}</div>;
    }
    
    if (formattedJson !== null) {
      return (
        <JsonViewer 
          data={formattedJson as Record<string, unknown> | unknown[]} 
          searchQuery={searchQuery} 
          searchMode={pathSearchMode ? 'path' : 'text'}
          autoExpandOnSearch={autoExpand}
          globalExpandSignal={globalExpandSignal}
          filterMode={filterOnlyMatches}
          matchStrategy={matchStrategy}
          caseSensitive={caseSensitive}
          activeMatchPath={matchedPaths[activeIndex]}
          onRegisterMatch={(p) => setMatchedPaths(prev => prev.includes(p) ? prev : [...prev, p])}
          matchesVersion={matchesVersion}
          matchedPaths={matchedPaths}
        />
      );
    }
    
    return <div style={styles.placeholder}>格式化的 JSON 将在这里显示</div>;
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    try {
      const se = document.scrollingElement || document.documentElement || document.body;
      if (se) {
        se.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {}
  }, []);

  const scrollToBottom = useCallback(() => {
    try {
      const se = document.scrollingElement || document.documentElement || document.body;
      const h = Math.max(
        se?.scrollHeight || 0,
        document.documentElement?.scrollHeight || 0,
        document.body?.scrollHeight || 0,
        containerRef.current?.scrollHeight || 0
      );
      if (se) {
        se.scrollTo({ top: h, left: 0, behavior: 'smooth' });
      }
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, left: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: h, left: 0, behavior: 'smooth' });
    } catch {}
  }, []);

  return (
    <div style={styles.container} ref={containerRef}>
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

            {/* 操作区域 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* 操作按钮和选项 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'linear-gradient(to right, #f3f4f6, #f9fafb)',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
              }}>
                <input
                  type="checkbox"
                  id="processNestedJson"
                  checked={processNestedJson}
                  onChange={handleToggleNestedJson}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    marginRight: '0.75rem',
                    accentColor: '#3b82f6'
                  }}
                />
                <label htmlFor="processNestedJson" style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#1e40af'
                }}>
                  解析嵌套 JSON 字符串
                </label>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  onClick={handleClear}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem 1.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    background: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiTrash2 style={{ color: '#ef4444', marginRight: '0.5rem' }} /> 清空
                </button>
                
                <button
                  onClick={formatJson}
                  style={{
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
                  }}
                >
                  格式化 JSON
                </button>
              </div>
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
              {/* 结果操作：搜索与展开控制 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="搜索（键/值），或勾选按键路径搜索" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    border: '1px solid #e5edff',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  onClick={triggerSearch}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #3b82f6',
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  title="搜索"
                >搜索</button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={pathSearchMode} 
                    onChange={(e) => setPathSearchMode(e.target.checked)} 
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  按键路径搜索
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={filterOnlyMatches} 
                    onChange={(e) => setFilterOnlyMatches(e.target.checked)} 
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  只显示匹配节点
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={caseSensitive} 
                    onChange={(e) => setCaseSensitive(e.target.checked)} 
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  区分大小写
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={autoExpand} 
                    onChange={(e) => setAutoExpand(e.target.checked)} 
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  搜索时自动展开
                </label>
                <select
                  value={matchStrategy}
                  onChange={(e) => setMatchStrategy(e.target.value as 'contains'|'exact'|'regex')}
                  style={{
                    padding: '0.375rem 0.5rem',
                    border: '1px solid #e5edff',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    background: 'white'
                  }}
                  title="匹配方式"
                >
                  <option value="contains">包含匹配</option>
                  <option value="exact">精准匹配</option>
                  <option value="regex">正则匹配</option>
                </select>
                <button
                  onClick={() => setGlobalExpandSignal(prev => ({ mode: 'expand_all', tick: prev.tick + 1 }))}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  title="全部展开"
                >全部展开</button>
                <button
                  onClick={() => setGlobalExpandSignal(prev => ({ mode: 'collapse_all', tick: prev.tick + 1 }))}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  title="全部折叠"
                >全部折叠</button>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>匹配 {matchedPaths.length} 项</span>
                {/* 导航按钮移至悬浮条，保留计数 */}
              </div>
              
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
          {/* 悬浮导航条：始终在屏幕上 */}
          {matchedPaths.length > 0 && (
            <div style={{
              position: 'fixed',
              right: '16px',
              bottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5edff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              zIndex: 9999
            }}>
              <span style={{ fontSize: '0.85rem', color: '#374151' }}>{activeIndex + 1} / {matchedPaths.length}</span>
              <button
                onClick={() => setActiveIndex(prev => matchedPaths.length ? (prev - 1 + matchedPaths.length) % matchedPaths.length : 0)}
                style={{
                  padding: '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                title="上一个"
              >上一个</button>
              <button
                onClick={scrollToTop}
                style={{
                  padding: '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                title="回顶部"
              >回顶部</button>
              <button
                onClick={scrollToBottom}
                style={{
                  padding: '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                title="去底部"
              >去底部</button>
              <button
                onClick={() => setActiveIndex(prev => matchedPaths.length ? (prev + 1) % matchedPaths.length : 0)}
                style={{
                  padding: '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                title="下一个"
              >下一个</button>
            </div>
          )}
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
