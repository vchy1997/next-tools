'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode2, Trash2, List, Play } from 'lucide-react';
import { javascript } from '@codemirror/lang-javascript';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-white/90 p-4 rounded-lg">加载中...</div>
    </div>
  )
});
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

export default function JsonParser() {
  const [displayInput, setDisplayInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<any>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const cursorPosRef = useRef<{anchor: number, head: number} | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateSampleData = () => {
    const sampleData = {
      string: "Hello, World!",
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3, "four", { nested: "object" }],
      object: {
        name: "John Doe",
        age: 30,
        hobbies: ["reading", "coding"],
        address: {
          street: "123 Main St",
          city: "Tech City"
        }
      }
    };
    const formatted = JSON.stringify(sampleData, null, 2);
    setDisplayInput(formatted);
    setJsonInput(formatted);
    handleJsonParse(formatted);
    toast.success('已生成示例数据');
  };

  const handleJsonParse = (input: string) => {
    try {
      if (!input.trim()) {
        setParsedJson(null);
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setParsedJson(parsed);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setParsedJson(null);
    }
  };

  const handleFormat = () => {
    try {
      if (!jsonInput.trim()) {
        toast.error('请先输入JSON字符串');
        setError('请先输入JSON字符串');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);

      if (editorRef.current?.view?.state?.selection?.main) {
        const cursor = editorRef.current.view.state.selection.main;
        cursorPosRef.current = {
          anchor: cursor.anchor,
          head: cursor.head
        };
      }

      setDisplayInput(formatted);
      setJsonInput(formatted);
      handleJsonParse(formatted);
      setEditorKey(prev => prev + 1);
      toast.success('格式化成功');
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(`JSON格式错误: ${errorMessage}`);
      setError(errorMessage);
    }
  };

  const handleClear = () => {
    setDisplayInput('');
    setJsonInput('');
    setParsedJson(null);
    setError(null);
    setEditorKey(prev => prev + 1);
    toast.success('已清空内容');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    const currentJson = parsedJson;
    setParsedJson(null);
    setTimeout(() => setParsedJson(currentJson), 0);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="p-6 bg-gray-50/5 backdrop-blur-sm border-gray-800/20">
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleFormat}
            className="flex items-center gap-2 hover:bg-gray-700/50"
          >
            <FileCode2 className="h-4 w-4" />
            格式化
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex items-center gap-2 hover:bg-gray-700/50"
          >
            <Trash2 className="h-4 w-4" />
            清空
          </Button>
          <Button
            variant="outline"
            onClick={toggleCollapse}
            className="flex items-center gap-2 hover:bg-gray-700/50"
          >
            <List className="h-4 w-4" />
            {isCollapsed ? '展开全部' : '折叠全部'}
          </Button>
          <Button
            variant="outline"
            onClick={generateSampleData}
            className="flex items-center gap-2 hover:bg-gray-700/50"
          >
            生成示例
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-0 overflow-hidden border-gray-800/20">
              <CodeMirror
                value={displayInput}
                height="500px"
                theme={oneDark}
                extensions={[json()]}
                onChange={(value) => {
                  if (editorRef.current?.view?.state?.selection?.main) {
                    const cursor = editorRef.current.view.state.selection.main;
                    cursorPosRef.current = {
                      anchor: cursor.anchor,
                      head: cursor.head
                    };
                  }
                  setJsonInput(value);
                  handleJsonParse(value);
                }}
                onCreateEditor={(editor) => {
                  editorRef.current = editor;
                }}
                key={editorKey}
                placeholder="请输入JSON字符串..."
                className="rounded-lg overflow-hidden scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent"
              />
            </Card>

            <Card className="relative min-h-[500px] p-0 overflow-hidden border-gray-800/20 bg-[#1e1e1e]">
              <div className="absolute inset-0 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
                {error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-red-500 bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-red-500/20">
                      {error}
                    </div>
                  </div>
                ) : parsedJson ? (
                  <ReactJson
                    src={parsedJson}
                    theme="monokai"
                    collapsed={isCollapsed}
                    displayDataTypes={false}
                    enableClipboard={true}
                    displayObjectSize={false}
                    name={false}
                    style={{
                      backgroundColor: 'transparent',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      borderRadius: '0.5rem',
                      padding: '0.5rem'
                    }}
                    iconStyle="square"
                    quotesOnKeys={false}
                  />
                ) : null}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 space-y-4 border-gray-800/20">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      const jsonData = JSON.parse(jsonInput);
                      let result = (new Function('data', `
                        try {
                          return ${codeInput};
                        } catch (error) {
                          throw new Error('执行代码时出错: ' + error.message);
                        }
                      `))(jsonData);
                      setCodeResult(result);
                      setCodeError(null);
                      toast.success('代码执行成功');
                    } catch (err) {
                      const errorMessage = (err as Error).message;
                      setCodeError(errorMessage);
                      setCodeResult(null);
                      toast.error(`代码执行错误: ${errorMessage}`);
                    }
                  }}
                  className="flex items-center gap-2 hover:bg-gray-700/50"
                >
                  <Play className="h-4 w-4" />
                  执行代码
                </Button>
              </div>
              <CodeMirror
                value={codeInput}
                height="200px"
                theme={oneDark}
                extensions={[javascript()]}
                onChange={(value) => {
                  setCodeInput(value);
                }}
                placeholder="在这里输入JavaScript代码，可以直接使用'data'变量访问JSON数据..."
                className="rounded-lg overflow-hidden scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent"
              />
            </Card>

            <Card className="relative min-h-[264px] p-0 overflow-hidden border-gray-800/20 bg-[#1e1e1e]">
              <div className="absolute inset-0 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
                {codeError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-red-500 bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-red-500/20">
                      {codeError}
                    </div>
                  </div>
                ) : codeResult !== null ? (
                  <pre className="text-white whitespace-pre-wrap break-words text-sm">
                    {typeof codeResult === 'object' ?
                      JSON.stringify(codeResult, null, 2) :
                      String(codeResult)
                    }
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white/70 p-4 rounded-lg text-sm">
                      在代码编辑器中输入JavaScript代码，可以直接使用'data'变量访问JSON数据。例如：data.object.name
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}