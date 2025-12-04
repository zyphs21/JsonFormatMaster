import React, { useState, ReactNode, useMemo, useEffect } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

// 内联样式
const styles = {
  container: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    width: '100%',
    overflow: 'visible',
    display: 'inline-block'
  },
  nodeLine: {
    margin: '0.25rem 0',
  },
  nonExpandable: {
    cursor: 'default',
  },
  nodeWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  expandIcon: {
    marginRight: '0.25rem',
    color: '#6b7280',
    paddingTop: '0.125rem',
    cursor: 'pointer',
  },
  propertyName: {
    color: '#3b82f6',
    marginRight: '0.25rem',
    userSelect: 'text' as const,
    cursor: 'pointer',
  },
  indentation: {
    marginLeft: '1rem',
  },
  valueString: {
    color: '#10b981',
    cursor: 'pointer',
    userSelect: 'text' as const,
  },
  valueNumber: {
    color: '#3b82f6',
    cursor: 'pointer',
    userSelect: 'text' as const,
  },
  valueBoolean: {
    color: '#8b5cf6',
    cursor: 'pointer',
    userSelect: 'text' as const,
  },
  valueNull: {
    color: '#6b7280',
    cursor: 'pointer',
    userSelect: 'text' as const,
  },
  preview: {
    color: '#9ca3af',
  },
  comma: {
    marginLeft: '0',
  },
  bracket: {
    color: '#374151',
  },
  valueContainer: {
    position: 'relative' as const,
    display: 'inline-block',
  }
};

type JsonViewerProps = {
  data: unknown;
  initialExpanded?: boolean;
  nestingLevel?: number;
  searchQuery?: string;
  searchMode?: 'text' | 'path';
  autoExpandOnSearch?: boolean;
  globalExpandSignal?: { mode: 'none' | 'expand_all' | 'collapse_all'; tick: number };
  filterMode?: boolean;
  matchStrategy?: 'contains' | 'exact' | 'regex';
  caseSensitive?: boolean;
  activeMatchPath?: string;
  onRegisterMatch?: (path: string) => void;
  matchesVersion?: number;
  matchedPaths?: string[];
};

type JsonNodeProps = {
  name?: string;
  value: unknown;
  isLast: boolean;
  expanded: boolean;
  nestingLevel: number;
  toggleExpand: () => void;
  path: string;
  searchQuery?: string;
  searchMode?: 'text' | 'path';
  autoExpandOnSearch?: boolean;
  globalExpandSignal?: { mode: 'none' | 'expand_all' | 'collapse_all'; tick: number };
  filterMode?: boolean;
  matchStrategy?: 'contains' | 'exact' | 'regex';
  caseSensitive?: boolean;
  activeMatchPath?: string;
  onRegisterMatch?: (path: string) => void;
  matchesVersion?: number;
  matchedPaths?: string[];
};

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  isLast,
  expanded,
  nestingLevel,
  toggleExpand,
  path,
  searchQuery,
  searchMode = 'text',
  autoExpandOnSearch = true,
  globalExpandSignal,
  filterMode = false,
  matchStrategy = 'contains',
  caseSensitive = false,
  activeMatchPath,
  onRegisterMatch,
  matchesVersion,
  matchedPaths = [],
}) => {
  const [childExpanded, setChildExpanded] = useState<Record<string, boolean>>({});
  const [isSelecting, setIsSelecting] = useState(false);
  
  // 监听mouseup事件，判断是否在选择文本
  React.useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection()?.toString();
      if (selection) {
        // 如果有选中的文本，设置状态为true
        setIsSelecting(true);
        // 短暂延迟后重置状态，避免影响下次点击
        setTimeout(() => setIsSelecting(false), 300);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // 全局展开/折叠：仅作用于当前“显示中的”子节点（受过滤影响）
  // 将此逻辑放在匹配工具函数定义之后，以便正确判断显示状态
  
  const toggleChild = (key: string) => {
    setChildExpanded(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  const getValueType = (val: unknown): string => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };
  
  const valueType = getValueType(value);
  const isExpandable = valueType === 'object' || valueType === 'array';
  
  const rawQuery = (searchQuery ?? '').trim();
  const normalizedQuery = caseSensitive ? rawQuery : rawQuery.toLowerCase();
  const regex = useMemo(() => {
    if (!rawQuery || matchStrategy !== 'regex') return null as RegExp | null;
    const rawForRegex = rawQuery.replace(/\[\]/g, '\\[\\d+\\]');
    try {
      return new RegExp(rawForRegex, caseSensitive ? undefined : 'i');
    } catch {
      return null;
    }
  }, [rawQuery, matchStrategy, caseSensitive]);
  const matchText = (text: string): boolean => {
    if (!rawQuery) return false;
    if (matchStrategy === 'regex') return regex ? regex.test(text) : false;
    const t = caseSensitive ? text : text.toLowerCase();
    if (matchStrategy === 'exact') return t === normalizedQuery;
    return t.includes(normalizedQuery);
  };
  const matchPath = (p: string): boolean => {
    const text = p || '';
    if (!rawQuery) return false;
    if (matchStrategy === 'regex') return regex ? regex.test(text) : false;
    const tNoIdx = text.replace(/\[\d+\]/g, '');
    const qNoIdx = rawQuery.replace(/\[\d+\]/g, '').replace(/\[\]/g, '');
    const t = caseSensitive ? tNoIdx : tNoIdx.toLowerCase();
    const q = caseSensitive ? qNoIdx : qNoIdx.toLowerCase();
    if (matchStrategy === 'exact') return t === q;
    return t.includes(q);
  };
  const keyMatches = useMemo(() => {
    if (!rawQuery || !name) return false;
    if (searchMode === 'path') return matchPath(path);
    return matchText(String(name));
  }, [rawQuery, name, path, searchMode, matchStrategy, caseSensitive, regex]);
  const valueMatches = useMemo(() => {
    if (!rawQuery) return false;
    if (searchMode === 'path') return matchPath(path);
    if (valueType === 'string') return matchText(String(value));
    if (valueType === 'number' || valueType === 'boolean' || valueType === 'null') return matchText(String(value));
    return false;
  }, [rawQuery, value, valueType, path, searchMode, matchStrategy, caseSensitive, regex]);
  const isSelfMatch = keyMatches || valueMatches;
  
  const subtreeHasMatch = useMemo(() => {
    const check = (val: unknown, currentPath: string): boolean => {
      const t = getValueType(val);
      if (searchMode === 'path') {
        if (matchPath(currentPath)) return true;
      } else {
        if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') {
          if (matchText(String(val))) return true;
        }
      }
      if (t === 'array') {
        const arr = val as unknown[];
        for (let i = 0; i < arr.length; i++) {
          const childPath = `${currentPath}[${i}]`;
          if (check(arr[i], childPath)) return true;
        }
      } else if (t === 'object') {
        const obj = val as Record<string, unknown>;
        for (const k of Object.keys(obj)) {
          const childPath = currentPath ? `${currentPath}.${k}` : k;
          if (searchMode !== 'path') {
            if (matchText(k)) return true;
          }
          if (check(obj[k], childPath)) return true;
        }
      }
      return false;
    };
    if (!rawQuery) return false;
    return check(value, path);
  }, [rawQuery, value, path, searchMode, matchStrategy, caseSensitive, regex]);
  
  const isOnMatchedPath = useMemo(() => {
    if (!rawQuery || !autoExpandOnSearch) return false;
    if (!matchedPaths || matchedPaths.length === 0) return false;
    return matchedPaths.some(mp => mp === path || mp.startsWith(path));
  }, [rawQuery, autoExpandOnSearch, matchedPaths, path]);
  const renderExpanded = expanded || isOnMatchedPath;

  useEffect(() => {
    if (onRegisterMatch && isSelfMatch) onRegisterMatch(path);
  }, [isSelfMatch, onRegisterMatch, path, matchesVersion]);
  
  const handleCopyValue = (val: unknown, e: React.MouseEvent) => {
    let textToCopy = '';
    
    if (valueType === 'string') {
      textToCopy = val as string;
    } else if (valueType === 'number' || valueType === 'boolean') {
      textToCopy = String(val);
    } else if (valueType === 'null') {
      textToCopy = 'null';
    }
    
    if (textToCopy || textToCopy === '') {
      try {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            // 创建一个全局Toast元素
            const toastDiv = document.createElement('div');
            Object.assign(toastDiv.style, {
              position: 'fixed',
              left: `${e.clientX}px`,
              top: `${e.clientY - 40}px`,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              zIndex: '9999',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            });
            toastDiv.textContent = '已复制到剪贴板';
            document.body.appendChild(toastDiv);
            
            // 显示一段时间后移除
            setTimeout(() => {
              document.body.removeChild(toastDiv);
            }, 1500);
          })
          .catch(err => {
            console.error('复制失败:', err);
          });
      } catch (e) {
        console.error('复制出错:', e);
      }
    }
  };
  
  const renderValue = (): ReactNode => {
    switch (valueType) {
      case 'string':
        return (
          <span style={styles.valueContainer}>
            <span 
              style={styles.valueString} 
              onClick={(e) => {
                e.stopPropagation();
                handleCopyValue(value, e);
              }}
              title="点击复制"
            >
              "{value as string}"
            </span>
          </span>
        );
      case 'number':
        return (
          <span style={styles.valueContainer}>
            <span 
              style={styles.valueNumber} 
              onClick={(e) => {
                e.stopPropagation();
                handleCopyValue(value, e);
              }}
              title="点击复制"
            >
              {value as number}
            </span>
          </span>
        );
      case 'boolean':
        return (
          <span style={styles.valueContainer}>
            <span 
              style={styles.valueBoolean} 
              onClick={(e) => {
                e.stopPropagation();
                handleCopyValue(value, e);
              }}
              title="点击复制"
            >
              {String(value)}
            </span>
          </span>
        );
      case 'null':
        return (
          <span style={styles.valueContainer}>
            <span 
              style={styles.valueNull} 
              onClick={(e) => {
                e.stopPropagation();
                handleCopyValue(null, e);
              }}
              title="点击复制"
            >
              null
            </span>
          </span>
        );
      case 'object':
      case 'array':
        if (!renderExpanded) {
          const preview = valueType === 'array' 
            ? `[${(value as unknown[]).length}项]` 
            : `{${Object.keys(value as Record<string, unknown>).length}键}`;
          return (
            <span 
              style={{
                ...styles.preview,
                cursor: 'pointer'
              }} 
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              title="点击展开"
            >
              {preview}
            </span>
          );
        }
        
        if (valueType === 'array') {
          if ((value as unknown[]).length === 0) {
            return (
              <span 
                style={{
                  ...styles.preview,
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                title="空数组"
              >
                []
              </span>
            );
          }
          
          const arr = value as unknown[];
          const children = arr.map((item, index) => {
            const childPath = `${path}[${index}]`;
            const childMatch = filterMode && rawQuery ? (() => {
              const t = getValueType(item);
              if (searchMode === 'path') return matchedPaths.some(mp => mp === childPath || mp.startsWith(childPath));
              if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') return matchText(String(item));
              return subtreeHasMatchFor(item, childPath);
            })() : true;
            return { index, item, childPath, childMatch };
          }).filter(c => c.childMatch);
          const rendered = children.map((c, idx) => {
            const autoChildExpanded = isOnMatchedPath && matchedPaths.some(mp => mp === c.childPath || mp.startsWith(c.childPath));
            return (
              <JsonNode
                key={c.index}
                value={c.item}
                isLast={idx === children.length - 1}
                expanded={!!childExpanded[c.index] || autoChildExpanded}
                nestingLevel={nestingLevel + 1}
                toggleExpand={() => toggleChild(String(c.index))}
                path={c.childPath}
                searchQuery={searchQuery}
                searchMode={searchMode}
                autoExpandOnSearch={autoExpandOnSearch}
                globalExpandSignal={globalExpandSignal}
                filterMode={filterMode}
                matchStrategy={matchStrategy}
                caseSensitive={caseSensitive}
                activeMatchPath={activeMatchPath}
                onRegisterMatch={onRegisterMatch}
                matchesVersion={matchesVersion}
                matchedPaths={matchedPaths}
              />
            );
          });
          return (
            <div style={styles.indentation}>
              <span style={styles.bracket}>[</span>
              <div>{rendered}</div>
              <span style={styles.bracket}>]</span>
            </div>
          );
        } else {
          const entries = Object.entries(value as Record<string, unknown>);
          if (entries.length === 0) {
            return (
              <span 
                style={{
                  ...styles.preview,
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                title="空对象"
              >
                {}
              </span>
            );
          }
          
          const children = entries.map(([key, val], index) => {
            const childPath = path ? `${path}.${key}` : key;
            const childMatch = filterMode && rawQuery ? (() => {
              if (searchMode === 'path') return matchedPaths.some(mp => mp === childPath || mp.startsWith(childPath));
              if (matchText(key)) return true;
              const t = getValueType(val);
              if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') return matchText(String(val));
              return subtreeHasMatchFor(val, childPath);
            })() : true;
            return { key, val, index, childPath, childMatch };
          }).filter(c => c.childMatch);
          const rendered = children.map((c, idx) => {
            const autoChildExpanded = isOnMatchedPath && matchedPaths.some(mp => mp === c.childPath || mp.startsWith(c.childPath));
            return (
              <JsonNode
                key={c.key}
                name={c.key}
                value={c.val}
                isLast={idx === children.length - 1}
                expanded={!!childExpanded[c.key] || autoChildExpanded}
                nestingLevel={nestingLevel + 1}
                toggleExpand={() => toggleChild(c.key)}
                path={c.childPath}
                searchQuery={searchQuery}
                searchMode={searchMode}
                autoExpandOnSearch={autoExpandOnSearch}
                globalExpandSignal={globalExpandSignal}
                filterMode={filterMode}
                matchStrategy={matchStrategy}
                caseSensitive={caseSensitive}
                activeMatchPath={activeMatchPath}
                onRegisterMatch={onRegisterMatch}
                matchesVersion={matchesVersion}
                matchedPaths={matchedPaths}
              />
            );
          });
          return (
            <div style={styles.indentation}>
              <span style={styles.bracket}>{'{'}</span>
              <div>{rendered}</div>
              <span style={styles.bracket}>{'}'}</span>
            </div>
          );
        }
      default:
        return <span style={styles.preview}>undefined</span>;
    }
  };
  
  const subtreeHasMatchFor = (val: unknown, currentPath: string): boolean => {
    const t = getValueType(val);
    if (searchMode === 'path') {
      if (matchPath(currentPath)) return true;
    } else {
      if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') {
        if (matchText(String(val))) return true;
      }
    }
    if (t === 'array') {
      const arr = val as unknown[];
      for (let i = 0; i < arr.length; i++) {
        const childPath = `${currentPath}[${i}]`;
        if (subtreeHasMatchFor(arr[i], childPath)) return true;
      }
    } else if (t === 'object') {
      const obj = val as Record<string, unknown>;
      for (const k of Object.keys(obj)) {
        const childPath = currentPath ? `${currentPath}.${k}` : k;
        if (searchMode !== 'path') {
          if (matchText(k)) return true;
        }
        if (subtreeHasMatchFor(obj[k], childPath)) return true;
      }
    }
    return false;
  };

  // 全局展开/折叠：仅作用于当前“显示中的”子节点（受过滤影响）
  useEffect(() => {
    if (!globalExpandSignal || (typeof value !== 'object' || value === null)) return;
    const isArr = Array.isArray(value);
    const arr = isArr ? (value as unknown[]) : undefined;
    const obj = !isArr ? (value as Record<string, unknown>) : undefined;

    const getDisplayedKeys = (): string[] => {
      if (isArr) {
        const keys: string[] = [];
        for (let i = 0; i < (arr as unknown[]).length; i++) {
          const childPath = `${path}[${i}]`;
          let displayed = true;
          if (filterMode) {
            if (searchMode === 'path') {
              displayed = (matchedPaths && matchedPaths.length)
                ? matchedPaths.some(mp => mp === childPath || mp.startsWith(childPath))
                : true;
            } else if (rawQuery) {
              const item = (arr as unknown[])[i];
              const t = getValueType(item);
              if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') displayed = matchText(String(item));
              else displayed = subtreeHasMatchFor(item, childPath);
            }
          }
          if (displayed) keys.push(String(i));
        }
        return keys;
      } else {
        const keys: string[] = [];
        for (const k of Object.keys(obj as Record<string, unknown>)) {
          const childPath = path ? `${path}.${k}` : k;
          let displayed = true;
          if (filterMode) {
            if (searchMode === 'path') {
              displayed = (matchedPaths && matchedPaths.length)
                ? matchedPaths.some(mp => mp === childPath || mp.startsWith(childPath))
                : true;
            } else if (rawQuery) {
              if (matchText(k)) displayed = true;
              else {
                const val = (obj as Record<string, unknown>)[k];
                const t = getValueType(val);
                if (t === 'string' || t === 'number' || t === 'boolean' || t === 'null') displayed = matchText(String(val));
                else displayed = subtreeHasMatchFor(val, childPath);
              }
            }
          }
          if (displayed) keys.push(k);
        }
        return keys;
      }
    };

    const displayedKeys = getDisplayedKeys();
    if (globalExpandSignal.mode === 'expand_all') {
      setChildExpanded(prev => {
        const next: Record<string, boolean> = { ...prev };
        for (const k of displayedKeys) next[k] = true;
        return next;
      });
    } else if (globalExpandSignal.mode === 'collapse_all') {
      setChildExpanded(prev => {
        const next: Record<string, boolean> = { ...prev };
        for (const k of displayedKeys) next[k] = false;
        return next;
      });
    }
    // 仅在 tick 改变或过滤相关变化时触发
  }, [globalExpandSignal, filterMode, rawQuery, matchedPaths, value, path, searchMode]);
  
  if (filterMode) {
    if (searchMode === 'path') {
      const relevant = Array.isArray((matchedPaths as unknown as string[])) && (matchedPaths as unknown as string[]).length > 0
        ? (matchedPaths as unknown as string[]).some(mp => mp === path || mp.startsWith(path))
        : true;
      if (!relevant) return null;
    } else if (rawQuery && !(isSelfMatch || subtreeHasMatch)) {
      return null;
    }
  }
  
  return (
    <div style={styles.nodeLine} data-path={path}>
      <div style={styles.nodeWrapper}>
        {isExpandable ? (
          <span 
            style={styles.expandIcon} 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {renderExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </span>
        ) : (
          <span style={{ width: '10px', marginRight: '0.25rem' }}></span>
        )}
        
        <div>
          {name !== undefined && (
            <span 
              style={{
                ...styles.propertyName,
                ...((rawQuery && isSelfMatch) ? { backgroundColor: 'rgba(255, 229, 100, 0.5)' } : {}),
                ...((activeMatchPath && activeMatchPath === path) ? { outline: '2px solid #f59e0b', borderRadius: '2px' } : {})
              }}
              onClick={(e) => {
                // 如果正在选择文本，不触发展开/收起
                if (isSelecting || window.getSelection()?.toString()) {
                  return;
                }
                
                // 如果是可展开的节点，才执行展开/收起
                if (isExpandable) {
                  e.stopPropagation();
                  toggleExpand();
                }
              }}
              onDoubleClick={(e) => {
                // 双击时阻止事件冒泡，防止触发单击事件的展开/收起
                e.stopPropagation();
                // 双击时不做任何处理，让浏览器默认行为选中文本
              }}
              title={isExpandable ? "单击展开/收起，双击选中文本" : "双击选中文本"}
            >"{name}":</span>
          )}
          
          <span style={{
            ...(activeMatchPath && activeMatchPath === path ? { outline: '2px solid #f59e0b', borderRadius: '2px' } : {})
          }}>
            {renderValue()}
          </span>
          
          {!isLast && <span style={styles.comma}>,</span>}
        </div>
      </div>
    </div>
  );
};

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  initialExpanded = true,
  nestingLevel = 0,
  searchQuery,
  searchMode = 'text',
  autoExpandOnSearch = true,
  globalExpandSignal,
  filterMode = false,
  matchStrategy = 'contains',
  caseSensitive = false,
  activeMatchPath,
  onRegisterMatch,
  matchesVersion,
  matchedPaths = [],
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  // 添加全局样式来自定义选中文本的样式
  React.useEffect(() => {
    // 创建样式元素
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .json-formatter-content ::selection {
        background-color: rgba(0, 0, 0, 0.7) !important;
        color: white !important;
      }
    `;
    document.head.appendChild(styleElement);

    // 组件卸载时移除样式
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // 根据全局信号控制根节点的展开/折叠
  useEffect(() => {
    if (!globalExpandSignal) return;
    if (globalExpandSignal.mode === 'expand_all') setExpanded(true);
    else if (globalExpandSignal.mode === 'collapse_all') setExpanded(false);
  }, [globalExpandSignal]);

  // 搜索自动展开：有命中路径时强制展开根节点
  useEffect(() => {
    if (autoExpandOnSearch && matchedPaths && matchedPaths.length > 0) {
      setExpanded(true);
    }
  }, [autoExpandOnSearch, matchedPaths]);
  
  return (
    <div style={styles.container} className="json-formatter-content">
      <JsonNode
        value={data}
        isLast={true}
        expanded={expanded}
        nestingLevel={nestingLevel}
        toggleExpand={() => setExpanded(!expanded)}
        path="$"
        searchQuery={searchQuery}
        searchMode={searchMode}
        autoExpandOnSearch={autoExpandOnSearch}
        globalExpandSignal={globalExpandSignal}
        filterMode={filterMode}
        matchStrategy={matchStrategy}
        caseSensitive={caseSensitive}
        activeMatchPath={activeMatchPath}
        onRegisterMatch={onRegisterMatch}
        matchesVersion={matchesVersion}
        matchedPaths={matchedPaths}
      />
    </div>
  );
};

export default JsonViewer;
