
import React, { useState } from 'react';
import { NavTab } from '../types';
import { NAV_TABS } from '../constants';
import { Settings, BookOpen } from 'lucide-react';
import TokenConfigModal from './TokenConfigModal';
import UserGuideModal from './UserGuideModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  React.useEffect(() => {
    const handleUnauthorized = () => {
      setIsTokenModalOpen(true);
    };
    window.addEventListener('api-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api-unauthorized', handleUnauthorized);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-[60]">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            应用开发
          </h1>
          <nav className="flex h-16">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 h-full relative flex items-center text-sm font-medium transition-colors
                  ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsGuideModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            新手指引
          </button>
          <button 
            onClick={() => setIsTokenModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
            配置 Token
          </button>
        </div>
      </div>

      <TokenConfigModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        activeTab={activeTab}
      />
    </header>
  );
};

export default Header;
