import { Search, Info, AlertTriangle, CheckCircle2, Newspaper, TrendingUp, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, type FormEvent } from 'react';
import { analyzeNews, getTrendingNews, type NewsAnalysis, type TrendingNews } from '@/src/services/gemini';
import { cn } from '@/src/lib/utils';

export default function App() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [trending, setTrending] = useState<TrendingNews[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    const data = await getTrendingNews();
    setTrending(data);
  };

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeNews(query);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-prism-bg prism-grid selection:bg-prism-accent selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-prism-border bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-prism-ink flex items-center justify-center rounded-sm rotate-45">
              <div className="w-4 h-4 bg-prism-accent rotate-[-45deg]" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">新聞稜鏡 <span className="text-sm font-sans font-normal opacity-50 ml-1">News Prism</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium opacity-70">
            <a href="#" className="hover:opacity-100 transition-opacity">熱門新聞</a>
            <a href="#" className="hover:opacity-100 transition-opacity">關於我們</a>
            <a href="#" className="hover:opacity-100 transition-opacity">偏見分析方法</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Hero & Search */}
        <section className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              折射真相，<br />
              看見新聞的<span className="italic text-prism-accent">多重維度</span>
            </h2>
            <p className="text-lg opacity-60 max-w-xl mx-auto">
              輸入關鍵字或新聞連結，由 AI 為您彙整多家媒體觀點，提取核心事實並揭示潛在偏見。
            </p>
          </motion.div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-prism-accent to-purple-500 rounded-lg blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white border border-prism-border rounded-lg overflow-hidden shadow-xl">
              <div className="pl-4 opacity-40">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="輸入新聞關鍵字或貼上連結..."
                className="w-full py-4 px-4 outline-none text-lg"
              />
              <button
                type="submit"
                disabled={isAnalyzing}
                className="bg-prism-ink text-white px-8 py-4 font-medium hover:bg-prism-accent transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? '分析中...' : '開始分析'}
              </button>
            </div>
          </form>
        </section>

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-prism-border border-t-prism-accent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-prism-ink rounded-sm animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">正在折射新聞光譜...</p>
                <p className="text-sm opacity-50">正在搜尋主流媒體報導並提取核心事實</p>
              </div>
            </motion.div>
          ) : analysis ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Analysis Header */}
              <div className="border-l-4 border-prism-accent pl-6 py-2">
                <div className="flex items-center gap-2 text-prism-accent mb-2">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold tracking-widest uppercase">分析完成</span>
                </div>
                <h3 className="text-3xl font-serif font-bold">{analysis.topic}</h3>
                <p className="mt-4 text-lg opacity-70 leading-relaxed">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Core Facts */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card p-8 rounded-xl space-y-6">
                    <div className="flex items-center gap-2 border-b border-prism-border pb-4">
                      <Info className="text-prism-accent" size={20} />
                      <h4 className="font-bold text-lg">核心事實 <span className="text-xs font-mono opacity-40 ml-2">CORE FACTS</span></h4>
                    </div>
                    <ul className="space-y-4">
                      {analysis.coreFacts.map((fact, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="font-mono text-prism-accent font-bold">0{i + 1}</span>
                          <p className="text-lg leading-relaxed">{fact}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sources & Perspectives */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Newspaper size={20} />
                        <h4 className="font-bold text-lg">媒體報導與觀點 <span className="text-xs font-mono opacity-40 ml-2">SOURCES</span></h4>
                      </div>
                      {analysis.foundCount < 5 && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium">
                          <AlertTriangle size={14} />
                          僅找到 {analysis.foundCount} 家主流媒體報導
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.sources.map((source, i) => (
                        <div key={i} className="glass-card p-6 rounded-xl hover:border-prism-accent transition-colors group relative">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold bg-prism-ink text-white px-2 py-1 rounded-sm">{source.mediaName}</span>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-prism-accent hover:text-prism-ink transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                              閱讀原文 <ExternalLink size={14} />
                            </a>
                          </div>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <h5 className="font-bold mb-3 group-hover:text-prism-accent transition-colors leading-snug">
                              {source.title}
                            </h5>
                          </a>
                          <div className="space-y-3 text-sm">
                            <div className="bg-prism-bg p-3 rounded-lg">
                              <p className="font-bold text-[10px] uppercase opacity-40 mb-1">觀點角度</p>
                              <p className="opacity-80">{source.perspective}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                              <p className="font-bold text-[10px] uppercase text-red-400 mb-1">潛在偏見</p>
                              <p className="text-red-700">{source.potentialBias}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar: Bias Alert */}
                <div className="space-y-6">
                  <div className="bg-prism-ink text-white p-8 rounded-xl space-y-6 sticky top-24">
                    <div className="flex items-center gap-2 border-b border-white/20 pb-4">
                      <AlertTriangle className="text-amber-400" size={20} />
                      <h4 className="font-bold text-lg">綜合偏見提醒 <span className="text-xs font-mono opacity-40 ml-2">BIAS ALERT</span></h4>
                    </div>
                    <p className="text-sm leading-relaxed opacity-80 italic">
                      "{analysis.biasAlert}"
                    </p>
                    <div className="pt-4 space-y-4">
                      <p className="text-[10px] uppercase tracking-widest opacity-40">分析建議</p>
                      <ul className="text-xs space-y-2 opacity-70">
                        <li>• 交叉比對不同政治光譜的媒體</li>
                        <li>• 注意情緒化字眼的使用</li>
                        <li>• 關注報導中被省略的細節</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-prism-accent" />
                <h4 className="font-bold text-lg">當下熱門新聞 <span className="text-xs font-mono opacity-40 ml-2">TRENDING NOW</span></h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.length > 0 ? trending.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(item.title);
                      handleSearch();
                    }}
                    className="glass-card p-6 rounded-xl text-left hover:border-prism-accent transition-all hover:translate-y-[-4px] group"
                  >
                    <span className="text-[10px] font-bold text-prism-accent uppercase tracking-widest mb-2 block">{item.category}</span>
                    <h5 className="font-bold text-lg mb-2 group-hover:text-prism-accent transition-colors">{item.title}</h5>
                    <p className="text-sm opacity-50 line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      立即分析 <ArrowRight size={14} />
                    </div>
                  </button>
                )) : (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-card p-6 rounded-xl h-40 animate-pulse bg-gray-100/50" />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="max-w-xl mx-auto bg-red-50 border border-red-100 p-4 rounded-lg flex items-center gap-3 text-red-700">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </main>

      <footer className="border-t border-prism-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 text-sm">
          <p>© 2026 新聞稜鏡 News Prism. 旨在提升媒體識讀能力。</p>
          <div className="flex gap-8">
            <a href="#" className="hover:underline">隱私權政策</a>
            <a href="#" className="hover:underline">服務條款</a>
            <a href="#" className="hover:underline">聯絡我們</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
