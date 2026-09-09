import React, { useEffect, useState } from 'react';
import { ResearchArticle, ActiveScreen } from '../types';
import { 
  Newspaper, 
  ExternalLink, 
  Bookmark, 
  Tag, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  RefreshCw,
  Search,
  ArrowRight
} from 'lucide-react';

interface NewsScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
}

export const NewsScreen: React.FC<NewsScreenProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch research news');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err: any) {
      console.error(err);
      setError('Unable to reach research updates server. Showing cached clinical publications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const allTags = ['All', 'Guidelines', 'AI & Machine Learning', 'Molecular Screening', 'Health Policy', 'Epidemiology'];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All' || art.category === selectedTag;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6B705C]/15 text-[#535846] mb-2">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Clinical Research & ICMR Directives</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
            Cervical Cancer Screening & AI Cytology Updates
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5B6B6F]">
            Peer-reviewed literature, WHO 90-70-90 elimination milestones, and deep learning benchmark papers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchNews}
          disabled={loading}
          className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-medium text-[#2F3A3D] bg-[#ECE4D6] hover:bg-[#DCD4C7] border border-[#DCD4C7] transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-[#6B705C] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Updates</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B6F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research publications, authors, or topics..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#DCD4C7] bg-white text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/60 focus:border-[#B85C38] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#B85C38] text-white shadow-xs'
                    : 'bg-[#F5F0E8] text-[#2F3A3D] hover:bg-[#ECE4D6] border border-[#DCD4C7]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Feed */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#5B6B6F]">Fetching latest indexed publications...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-[#FAF7F2] rounded-xl border border-[#DCD4C7]">
          <BookOpen className="w-8 h-8 text-[#5B6B6F] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#2F3A3D]">No research articles found</p>
          <p className="text-xs text-[#5B6B6F] mt-1">Try clearing your search query or selecting 'All' categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#6B705C] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#5B6B6F] mb-2">
                  <span className="font-semibold text-[#6B705C] bg-[#6B705C]/15 px-2 py-0.5 rounded text-[10px]">
                    {art.category}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{art.publishedDate}</span>
                  </div>
                </div>

                <h3 className="font-serif text-base font-bold text-[#2F3A3D] leading-snug mb-2">
                  {art.title}
                </h3>

                <p className="text-xs text-[#5B6B6F] leading-relaxed mb-4">
                  {art.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#DCD4C7]/70 flex items-center justify-between text-xs">
                <span className="font-medium text-[#2F3A3D] text-[11px] truncate max-w-[170px]">
                  {art.source}
                </span>

                <a
                  href={art.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#B85C38] hover:text-[#964726] font-semibold text-xs"
                >
                  <span>Read Paper</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
