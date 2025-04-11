import React, { useState } from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

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
  
  const renderValue = () => {
    switch (valueType) {
      case 'string':
        return <span className="text-green-500">"{value as string}"</span>;
      case 'number':
        return <span className="text-blue-500">{value as number}</span>;
      case 'boolean':
        return <span className="text-purple-500">{String(value)}</span>;
      case 'null':
        return <span className="text-gray-500">null</span>;
      case 'object':
      case 'array':
        if (!expanded) {
          const preview = valueType === 'array' 
            ? `[${(value as unknown[]).length}项]` 
            : `{${Object.keys(value as Record<string, unknown>).length}键}`;
          return <span className="text-gray-400">{preview}</span>;
        }
        
        if (valueType === 'array') {
          if ((value as unknown[]).length === 0) {
            return <span className="text-gray-400">[]</span>;
          }
          
          return (
            <div className="ml-4">
              [
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
              ]
            </div>
          );
        } else {
          const entries = Object.entries(value as Record<string, unknown>);
          if (entries.length === 0) {
            return <span className="text-gray-400">{'{}'}</span>;
          }
          
          return (
            <div className="ml-4">
              {'{'}
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
              {'}'}
            </div>
          );
        }
      default:
        return <span className="text-gray-400">undefined</span>;
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
      className={`my-1 ${isExpandable ? 'cursor-pointer' : ''}`} 
      onClick={handleClick}
    >
      <div className="flex items-start">
        {isExpandable && (
          <span className="mr-1 text-gray-500 pt-0.5">
            {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </span>
        )}
        
        <div>
          {name !== undefined && (
            <span className="text-blue-400 mr-1">"{name}":</span>
          )}
          
          {renderValue()}
          
          {!isLast && <span>,</span>}
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
    <div className="font-mono text-sm">
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