import React, { useState, ReactNode } from 'react';
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
};

type JsonNodeProps = {
  name?: string;
  value: unknown;
  isLast: boolean;
  expanded: boolean;
  nestingLevel: number;
  toggleExpand: () => void;
};

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  isLast,
  expanded,
  nestingLevel,
  toggleExpand,
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
        if (!expanded) {
          const preview = valueType === 'array' 
            ? `[${(value as unknown[]).length}项]` 
            : `{${Object.keys(value as Record<string, unknown>).length}键}`;
          return <span style={styles.preview}>{preview}</span>;
        }
        
        if (valueType === 'array') {
          if ((value as unknown[]).length === 0) {
            return <span style={styles.preview}>[]</span>;
          }
          
          return (
            <div style={styles.indentation}>
              <span style={styles.bracket}>[</span>
              <div>
                {(value as unknown[]).map((item, index) => (
                  <JsonNode
                    key={index}
                    value={item}
                    isLast={index === (value as unknown[]).length - 1}
                    expanded={!!childExpanded[index]}
                    nestingLevel={nestingLevel + 1}
                    toggleExpand={() => toggleChild(String(index))}
                  />
                ))}
              </div>
              <span style={styles.bracket}>]</span>
            </div>
          );
        } else {
          const entries = Object.entries(value as Record<string, unknown>);
          if (entries.length === 0) {
            return <span style={styles.preview}>{'{}'}</span>;
          }
          
          return (
            <div style={styles.indentation}>
              <span style={styles.bracket}>{'{'}</span>
              <div>
                {entries.map(([key, val], index) => (
                  <JsonNode
                    key={key}
                    name={key}
                    value={val}
                    isLast={index === entries.length - 1}
                    expanded={!!childExpanded[key]}
                    nestingLevel={nestingLevel + 1}
                    toggleExpand={() => toggleChild(key)}
                  />
                ))}
              </div>
              <span style={styles.bracket}>{'}'}</span>
            </div>
          );
        }
      default:
        return <span style={styles.preview}>undefined</span>;
    }
  };
  
  return (
    <div style={styles.nodeLine}>
      <div style={styles.nodeWrapper}>
        {isExpandable ? (
          <span 
            style={styles.expandIcon} 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </span>
        ) : (
          <span style={{ width: '10px', marginRight: '0.25rem' }}></span>
        )}
        
        <div>
          {name !== undefined && (
            <span 
              style={styles.propertyName}
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
          
          {renderValue()}
          
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
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  return (
    <div style={styles.container}>
      <JsonNode
        value={data}
        isLast={true}
        expanded={expanded}
        nestingLevel={nestingLevel}
        toggleExpand={() => setExpanded(!expanded)}
      />
    </div>
  );
};

export default JsonViewer; 