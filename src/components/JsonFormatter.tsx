import React, { useState, useCallback, ReactNode } from 'react';
import { parseJson, stringify } from '../utils/jsonFormatter';
import JsonViewer from './JsonViewer';
import { FiCopy, FiTrash2 } from 'react-icons/fi';

const JsonFormatter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<unknown>(null);
  const [processNestedJson, setProcessNestedJson] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setError('请输入有效的 JSON 字符串');
      setFormattedJson(null);
      return;
    }

    try {
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
        const prettyJson = stringify(formattedJson);
        navigator.clipboard.writeText(prettyJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        setError(`复制失败: ${(e as Error).message}`);
      }
    }
  }, [formattedJson]);

  const handleClear = useCallback(() => {
    setJsonInput('');
    setFormattedJson(null);
    setError(null);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  }, []);

  const handleToggleNestedJson = useCallback(() => {
    setProcessNestedJson(prev => !prev);
    if (jsonInput.trim()) {
      try {
        const parsedJson = parseJson(jsonInput, !processNestedJson);
        setFormattedJson(parsedJson);
        setError(null);
      } catch {
        // 保持当前状态，不进行更新
      }
    }
  }, [jsonInput, processNestedJson]);

  const renderResult = (): ReactNode => {
    if (error) {
      return <div className="text-red-500 p-2">{error}</div>;
    }
    
    if (formattedJson !== null) {
      return <JsonViewer data={formattedJson} />;
    }
    
    return <div className="text-gray-400 p-2">格式化的 JSON 将在这里显示</div>;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">JSON 格式化工具</h1>
        <p className="text-center text-gray-400">输入 JSON 字符串，轻松格式化并查看</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <label htmlFor="jsonInput" className="block text-lg font-medium mb-2">
              输入 JSON
            </label>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-red-500 hover:text-red-600"
              title="清空"
            >
              <FiTrash2 /> 清空
            </button>
          </div>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={handleInputChange}
            className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder='{"example": "在此处粘贴你的 JSON"}'
          />
          
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="processNestedJson"
                checked={processNestedJson}
                onChange={handleToggleNestedJson}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
              />
              <label htmlFor="processNestedJson" className="ml-2 text-sm font-medium">
                解析嵌套 JSON 字符串
              </label>
            </div>
            
            <button
              onClick={formatJson}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              格式化 JSON
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">格式化结果</h2>
            {formattedJson && (
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                title="复制到剪贴板"
              >
                <FiCopy /> {copied ? '已复制!' : '复制'}
              </button>
            )}
          </div>
          
          <div className="w-full h-64 p-4 border border-gray-300 rounded-md overflow-auto dark:bg-gray-800 dark:border-gray-700">
            {renderResult()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter; 