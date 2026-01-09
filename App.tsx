
import React, { useState, useCallback, useMemo } from 'react';
import { analyzeAsset, synthesizeCollectionSummary } from './geminiService';
import { AnalysisResult, GlobalReportData, CollectionSummary } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

// --- Subcomponents ---

const Header: React.FC = () => (
  <header className="bg-slate-900 text-white p-6 shadow-lg no-print">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <i className="fas fa-chart-line text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Visual Asset Insight Pro</h1>
          <p className="text-xs text-slate-400">Advanced AI Asset Audit & Benchmarking</p>
        </div>
      </div>
      <nav className="hidden md:flex space-x-6 text-sm font-medium">
        <a href="#" className="hover:text-blue-400 transition-colors">Analyzer</a>
        <a href="#" className="hover:text-blue-400 transition-colors">Market Benchmark</a>
        <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
      </nav>
    </div>
  </header>
);

const AnalysisDashboard: React.FC<{ 
  results: AnalysisResult[], 
  summary: CollectionSummary | null,
  onReset: () => void 
}> = ({ results, summary, onReset }) => {
  const reportData = useMemo((): GlobalReportData => {
    const total = results.length;
    const avgSharpness = results.reduce((acc, curr) => acc + curr.sharpness, 0) / total;
    const avgComplexity = results.reduce((acc, curr) => acc + curr.complexity, 0) / total;
    const avgUniqueness = results.reduce((acc, curr) => acc + curr.uniquenessScore, 0) / total;
    
    const colorMap: Record<string, { val: number, hex: string }> = {};
    results.forEach(r => r.colorDistribution.forEach(c => {
      colorMap[c.name] = { 
        val: (colorMap[c.name]?.val || 0) + c.value, 
        hex: c.hex 
      };
    }));
    const dominantColors = Object.entries(colorMap)
      .map(([name, data]) => ({ name, value: data.val / total, hex: data.hex }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      avgSharpness,
      avgComplexity,
      avgUniqueness,
      topStyles: Array.from(new Set(results.flatMap(r => r.styleFeatures))).slice(0, 4),
      dominantColors,
      recommendations: [
        "保持当前核心资产的高对比度线条风格。",
        "在多平台适配时建议统一色域饱和度至当前均值。",
        "对于独特性评分较低的部分，建议引入更具辨识度的装饰元素。"
      ],
      summary: summary || undefined
    };
  }, [results, summary]);

  const radarData = [
    { subject: 'Sharpness', A: reportData.avgSharpness, fullMark: 100 },
    { subject: 'Complexity', A: reportData.avgComplexity, fullMark: 100 },
    { subject: 'Uniqueness', A: reportData.avgUniqueness, fullMark: 100 },
    { subject: 'Saturation', A: results.reduce((a,b)=>a+b.saturation,0)/results.length, fullMark: 100 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">《外显资产视觉分析报告》</h2>
        <div className="space-x-4 no-print">
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-bold shadow-lg"
          >
            <i className="fas fa-file-pdf mr-2"></i>导出 PDF 报告
          </button>
          <button 
            onClick={onReset}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors font-medium"
          >
            重新分析
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-semibold uppercase mb-2">平均锐度</span>
          <span className="text-5xl font-black text-blue-600">{reportData.avgSharpness.toFixed(1)}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-semibold uppercase mb-2">装饰复杂度</span>
          <span className="text-5xl font-black text-purple-600">{reportData.avgComplexity.toFixed(1)}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-semibold uppercase mb-2">风格独特性</span>
          <span className="text-5xl font-black text-emerald-600">{reportData.avgUniqueness.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-700">视觉维度分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Metrics" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-700">全量资产主体色域统计</h3>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded font-bold uppercase tracking-wider">
              <i className="fas fa-filter mr-1"></i> 已忽略背景色
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.dominantColors}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-slate-200 shadow-md rounded">
                          <p className="font-bold" style={{ color: data.hex }}>{data.name}</p>
                          <p className="text-xs">{data.value.toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value">
                  {reportData.dominantColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hex} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-8 page-break">
        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
          <i className="fas fa-globe-americas mr-3 text-blue-500"></i>
          CLIP 向量对比分析 (抽样基准)
        </h3>
        <p className="text-slate-600 mb-8 leading-relaxed">
          通过多模态 CLIP 向量空间，将资产与 WikiArt (古典艺术)、LAION-5B (现代摄影) 以及 OpenGameArt (二次元/游戏资产) 进行余弦相似度计算。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results[0]?.clipSimilarity.map((comp, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">{comp.dataset}</div>
              <div className="text-lg font-bold text-slate-800 mb-2">{comp.styleMatch}</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-1000" 
                  style={{ width: `${comp.similarity * 100}%` }}
                ></div>
              </div>
              <div className="text-right text-xs mt-2 font-mono text-slate-500">
                Similarity: {(comp.similarity * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold mb-6 text-slate-800">代表性资产抽样图例</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((r, idx) => (
            <div key={idx} className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm flex flex-col">
              <div className="h-64 overflow-hidden bg-slate-100">
                <img src={r.thumbnail} alt="Sample" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-grow">
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.styleFeatures.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-slate-700 leading-relaxed italic whitespace-normal break-words">
                  "{r.description}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reportData.summary && (
        <div className="page-break mt-12 mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-8">
          <h3 className="text-2xl font-black text-blue-900 mb-8 flex items-center">
            <i className="fas fa-brain mr-4 text-blue-600"></i>
            图集核心视觉 DNA 总结
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {reportData.summary.coreFeatures.map((feat, i) => (
              <div key={i} className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm text-center">
                <span className="text-xs text-blue-400 font-bold block mb-1">FEATURE {i+1}</span>
                <span className="text-blue-900 font-bold">{feat}</span>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                大模型训练 Prompt 公式 (中文)
              </h4>
              <button 
                onClick={() => navigator.clipboard.writeText(reportData.summary?.promptFormula || "")}
                className="text-blue-600 hover:text-blue-800 text-xs font-bold no-print"
              >
                <i className="fas fa-copy mr-1"></i> 复制公式
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-100 font-mono text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {reportData.summary.promptFormula}
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg mt-8 no-print">
        <h3 className="text-xl font-bold mb-4">核心结论与建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-blue-400 font-bold mb-2 uppercase text-xs">风格趋势 (Style Trend)</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              当前资产集合表现出极高的 <strong>{reportData.topStyles.join(' & ')}</strong> 倾向。建议在后期集成中，对这些核心特征进行持续化巩固，以建立独特的品牌视觉语言。
            </p>
          </div>
          <ul className="space-y-3">
            {reportData.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start text-sm">
                <i className="fas fa-check-circle text-emerald-500 mt-1 mr-3"></i>
                <span className="text-slate-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const FileUploader: React.FC<{ onUpload: (files: File[]) => void }> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white shadow-sm"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-3xl">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">批量资产上传</h3>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        支持拖拽或选择多个图像文件（JPG, PNG, WebP）。我们将进行随机抽样并生成多维深度分析报告。
      </p>
      <label className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
        选择文件
        <input type="file" multiple className="hidden" accept="image/*" onChange={handleChange} />
      </label>
    </div>
  );
};

const LoadingState: React.FC<{ progress: number, status: string }> = ({ progress, status }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="w-64 bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
      <div 
        className="bg-blue-600 h-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <h3 className="text-xl font-bold text-slate-800 animate-pulse">{status}</h3>
    <p className="text-slate-500 mt-2 text-center">正在通过 CLIP 向量模型计算风格指纹并提取视觉 DNA...</p>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleUpload = async (files: File[]) => {
    setAnalyzing(true);
    const resultsBuffer: AnalysisResult[] = [];
    
    const samples = files.length > 6 ? files.sort(() => 0.5 - Math.random()).slice(0, 6) : files;
    
    for (let i = 0; i < samples.length; i++) {
      const file = samples[i];
      setStatus(`正在分析抽样资产: ${file.name} (${i + 1}/${samples.length})`);
      setProgress(((i) / (samples.length + 1)) * 100);

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      try {
        const result = await analyzeAsset(base64);
        resultsBuffer.push(result);
      } catch (err) {
        console.error("Analysis failed for a sample", err);
      }
    }

    setStatus("正在合成全图集视觉 DNA 与训练 Prompt...");
    setProgress(95);
    try {
      if (resultsBuffer.length > 0) {
        const aggregatedSummary = await synthesizeCollectionSummary(resultsBuffer);
        setSummary(aggregatedSummary);
      }
    } catch (err) {
      console.error("Aggregation failed", err);
    }

    setProgress(100);
    setResults(resultsBuffer);
    setAnalyzing(false);
  };

  const reset = () => {
    setResults([]);
    setSummary(null);
    setAnalyzing(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {!analyzing && results.length === 0 && (
          <div className="container mx-auto px-4 py-20 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                解密资产视觉 DNA
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                结合 Gemini 3 视觉模型与 CLIP 向量聚类，为您的视觉资产提供可量化的锐度、色值与风格独特性审计，并自动生成训练 Prompt。
              </p>
            </div>
            <FileUploader onUpload={handleUpload} />
          </div>
        )}

        {analyzing && <LoadingState progress={progress} status={status} />}

        {!analyzing && results.length > 0 && (
          <AnalysisDashboard results={results} summary={summary} onReset={reset} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-auto no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; 2025 Visual Asset Insight Pro. 采用 Gemini 3 Pro 与 CLIP 基准测试。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
