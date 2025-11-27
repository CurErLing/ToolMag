import React, { useState, useEffect, useRef } from 'react';
import { NAV_DATA } from './data';
import { SubCategory } from './types';
import { LinkCard } from './components/LinkCard';
import { ThemeToggle } from './components/ThemeToggle';
import { Hero } from './components/Hero';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Github, Twitter, Heart, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(NAV_DATA[0].id);
  const [isDark, setIsDark] = useState<boolean>(false);
  
  // Search Engine State
  const [searchEngine, setSearchEngine] = useState<'baidu' | 'bing' | 'google'>('baidu');
  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Favorites State
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nexus_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const searchEngines = {
    baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=' },
    bing: { name: '必应', url: 'https://www.bing.com/search?q=' },
    google: { name: '谷歌', url: 'https://www.google.com/search?q=' },
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial Theme Check
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  // Update HTML class for Tailwind Dark Mode
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('nexus_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleTheme = () => setIsDark(!isDark);

  const toggleFavorite = (id: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    setFavorites(newFavs);
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    const url = searchEngines[searchEngine].url + encodeURIComponent(searchInput);
    window.open(url, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const categoriesWithFav = [
    { id: 'favorites', title: '我的收藏' },
    ...NAV_DATA
  ];

  // Filter Logic (Modified to only handle categories/favorites, removed name search)
  const filteredData = React.useMemo(() => {
    const results: SubCategory[] = [];

    // Favorites Mode
    if (activeCategory === 'favorites') {
       NAV_DATA.forEach(cat => {
         cat.subCategories.forEach(sub => {
           const favItems = sub.items.filter(item => favorites.has(item.id));
           if (favItems.length > 0) {
             results.push({
               ...sub,
               items: favItems,
               title: `${cat.title} - ${sub.title}`
             });
           }
         });
       });
       return results;
    }
    
    // Normal Category Mode
    const standardCat = NAV_DATA.find(c => c.id === activeCategory);
    return standardCat?.subCategories || [];
  }, [activeCategory, favorites]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-deep-dark flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-deep-dark/80 backdrop-blur-md border-b-2 border-black dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform cursor-pointer" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span className="text-white dark:text-black font-bold text-lg">N</span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight dark:text-white hidden sm:block">
                凌同学工具库<span className="text-neon-purple">.</span>
              </span>
            </div>

            {/* Search Bar Section */}
            <div className="flex-1 max-w-lg mx-4 hidden md:block">
              <div 
                className={`
                  relative flex items-center w-full 
                  bg-gray-100 dark:bg-gray-800 
                  rounded-full border-2 
                  ${isDropdownOpen ? 'border-black dark:border-neon-purple' : 'border-transparent'} 
                  focus-within:border-black dark:focus-within:border-neon-purple 
                  transition-all duration-300
                `}
              >
                {/* Engine Selector */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 pl-5 pr-3 py-1.5 h-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors border-r border-gray-300 dark:border-gray-600 outline-none whitespace-nowrap"
                  >
                    {searchEngines[searchEngine].name}
                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 mt-2 w-28 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                      >
                        {(Object.keys(searchEngines) as Array<keyof typeof searchEngines>).map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSearchEngine(key);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                              searchEngine === key 
                                ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-medium' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            {searchEngines[key].name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input Field */}
                <input 
                  type="text" 
                  placeholder={`在 ${searchEngines[searchEngine].name} 上搜索...`}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none py-1.5 pl-3 pr-10 text-sm outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />
                
                {/* Search Icon/Button */}
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 p-1.5 text-gray-400 hover:text-neon-purple transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
              <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block">
                <Github size={18} className="dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Hero />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sticky Category Tabs */}
        <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 bg-gray-50/90 dark:bg-deep-dark/90 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-sm">
            <div 
              className="flex overflow-x-auto py-3 px-4 sm:px-6 lg:px-8 gap-3 items-center justify-start lg:justify-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Hide scrollbar for Chrome/Safari/Opera */}
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            {categoriesWithFav.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  // Scroll to top of content if scrolled far down
                  const heroHeight = window.innerHeight * 0.5;
                  if (window.scrollY > heroHeight) {
                    window.scrollTo({ top: heroHeight - 64, behavior: 'smooth' });
                  }
                }}
                className={`
                  relative px-5 py-2 rounded-full font-bold font-display text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 no-scrollbar flex items-center gap-2
                  ${activeCategory === category.id 
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-[3px_3px_0px_0px_#a855f7] transform -translate-y-0.5' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-gray-500 hover:-translate-y-0.5'}
                `}
              >
                {category.id === 'favorites' && <Heart size={14} className={activeCategory === 'favorites' ? 'fill-white dark:fill-black' : 'fill-none'} />}
                {category.title}
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 border-2 border-transparent rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredData.map((subCat) => (
              <section key={subCat.id} className="mb-10">
                {/* Left-Aligned Header with Neon Bar */}
                <div className="flex items-center gap-3 mb-6 group">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-neon-purple to-neon-pink rounded-full group-hover:h-10 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
                  <h2 className="text-2xl font-black font-display uppercase tracking-wider text-gray-900 dark:text-white">
                    {subCat.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {subCat.items.map((item, index) => (
                    <LinkCard 
                      key={item.id} 
                      item={item} 
                      index={index}
                      isFavorite={favorites.has(item.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            ))}
            
            {filteredData.length === 0 && (
              <div className="text-center py-20">
                {activeCategory === 'favorites' ? (
                   <div className="flex flex-col items-center gap-4">
                     <Heart size={48} className="text-gray-300 dark:text-gray-600" />
                     <p className="text-xl text-gray-500">还没有收藏任何工具</p>
                     <p className="text-sm text-gray-400">点击卡片右上角的爱心即可添加收藏</p>
                   </div>
                ) : (
                  <p className="text-xl text-gray-500">暂无内容</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black dark:border-gray-700 bg-white dark:bg-deep-dark py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-display">
            由 凌同学 用心 <span className="text-neon-pink">♥</span> 设计。
          </p>
          <div className="flex justify-center gap-4 mt-3">
             <Twitter className="w-5 h-5 text-gray-400 hover:text-neon-cyan cursor-pointer transition-colors" />
             <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;