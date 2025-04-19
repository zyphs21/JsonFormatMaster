import React, { useState, ReactNode } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

// 内联样式
const styles = {
  container: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
  nodeLine: {
    margin: '0.25rem 0',
    cursor: 'pointer',
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
  },
  propertyName: {
    color: '#3b82f6',
    marginRight: '0.25rem',
  },
  indentation: {
    marginLeft: '1rem',
  },
  valueString: {
    color: '#10b981',
  },
  valueNumber: {
    color: '#3b82f6',
  },
  valueBoolean: {
    color: '#8b5cf6',
  },
  valueNull: {
    color: '#6b7280',
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
  
  const renderValue = (): ReactNode => {
    switch (valueType) {
      case 'string':
        return <span style={styles.valueString}>"{value as string}"</span>;
      case 'number':
        return <span style={styles.valueNumber}>{value as number}</span>;
      case 'boolean':
        return <span style={styles.valueBoolean}>{String(value)}</span>;
      case 'null':
        return <span style={styles.valueNull}>null</span>;
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
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpandable) {
      toggleExpand();
    }
  };
  
  return (
    <div 
      style={{
        ...styles.nodeLine,
        ...(isExpandable ? {} : styles.nonExpandable)
      }}
      onClick={handleClick}
    >
      <div style={styles.nodeWrapper}>
        {isExpandable && (
          <span style={styles.expandIcon}>
            {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </span>
        )}
        
        <div>
          {name !== undefined && (
            <span style={styles.propertyName}>"{name}":</span>
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