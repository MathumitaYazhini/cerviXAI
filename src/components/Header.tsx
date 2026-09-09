import React from 'react';
import { ActiveScreen } from '../types';
import { 
  Microscope, 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  Newspaper, 
  MessageSquareText, 
  LogOut, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ActiveScreen;
  setCurrentScreen: (screen: ActiveScreen) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  unreadChatCount?: number;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  isLoggedIn,
  onLogout,
  onToggleChat,
  isChatOpen,
}) => {
  if (!isLoggedIn && currentScreen === 'login') {
    return null;
  }

  // Required navigation order:
  // CerviXAI Logo -> Dashboard -> Screen New Slide -> Patient Registry -> Research & News -> AI Copilot -> User Profile
  const navItems = [
    { id: 'dashboard' as ActiveScreen, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload' as ActiveScreen, label: 'Screen New Slide', icon: UploadCloud },
    { id: 'history' as ActiveScreen, label: 'Patient Registry', icon: History },
    { id: 'news' as ActiveScreen, label: 'Research & News', icon: Newspaper },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#DCD4C7] shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* CerviXAI Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0" 
            onClick={() => setCurrentScreen('upload')}
            title="CerviXAI Screening Platform"
          >
            <div className="w-10 h-10 rounded-lg bg-[#B85C38] flex items-center justify-center text-white shadow-xs">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#2F3A3D]">CerviXAI</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#6B705C]/15 text-[#535846] border border-[#6B705C]/30">
                  Clinical v2.4
                </span>
              </div>
              <p className="text-xs text-[#5B6B6F] hidden sm:block font-normal">
                From cellular patterns to clearer decisions.
              </p>
            </div>
          </div>

          {/* Desktop Navigation: Dashboard -> Screen New Slide -> Patient Registry -> Research & News -> AI Copilot */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <nav className="flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#B85C38] text-white shadow-xs'
                        : 'text-[#2F3A3D] hover:bg-[#ECE4D6] hover:text-[#B85C38]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-white' : 'text-[#6B705C]'}`} />
                    {item.label}
                  </button>
                );
              })}

              {/* AI Copilot Button (ordered right after Research & News) */}
              <button
                id="nav-btn-copilot"
                onClick={onToggleChat}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all border ${
                  isChatOpen
                    ? 'bg-[#6B705C] text-white border-[#535846] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#2F3A3D] border-[#DCD4C7] hover:bg-[#ECE4D6]'
                }`}
                title="Open CerviXAI Doctor Assistant"
              >
                <MessageSquareText className={`w-4 h-4 mr-1.5 ${isChatOpen ? 'text-white' : 'text-[#B85C38]'}`} />
                <span>AI Copilot</span>
                <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </nav>

            {/* User Profile (ordered after AI Copilot) */}
            <div className="flex items-center pl-2 ml-1 border-l border-[#DCD4C7] space-x-2">
              <div 
                id="user-profile-badge"
                className="flex items-center text-left py-1 px-2 rounded-md hover:bg-[#ECE4D6]/60 transition-colors cursor-default"
                title="Logged in Clinician Profile"
              >
                <div className="w-8 h-8 rounded-full bg-[#6B705C]/20 border border-[#6B705C]/40 flex items-center justify-center text-[#535846] shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="ml-2 hidden lg:block">
                  <div className="text-xs font-semibold text-[#2F3A3D]">Dr. Ananya Sharma</div>
                  <div className="text-[10px] text-[#5B6B6F] flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-0.5 text-[#6B705C]" />
                    MD Cytopathology
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="p-2 text-[#5B6B6F] hover:text-[#B85C38] hover:bg-[#ECE4D6] rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar: Dashboard -> Screen New Slide -> Patient Registry -> Research & News -> AI Copilot */}
        <div className="md:hidden flex items-center space-x-1.5 py-2 overflow-x-auto scrollbar-none border-t border-[#DCD4C7]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`whitespace-nowrap px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#B85C38] text-white'
                    : 'text-[#2F3A3D] bg-[#ECE4D6]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mr-1" />
                {item.label}
              </button>
            );
          })}

          <button
            onClick={onToggleChat}
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center shrink-0 border transition-colors ${
              isChatOpen
                ? 'bg-[#6B705C] text-white border-[#535846]'
                : 'text-[#2F3A3D] bg-[#ECE4D6]/50 border-[#DCD4C7]'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5 mr-1 text-[#B85C38]" />
            AI Copilot
          </button>

          <button
            onClick={onLogout}
            className="whitespace-nowrap px-2 py-1.5 rounded-md text-xs font-medium flex items-center shrink-0 text-[#5B6B6F] hover:text-[#B85C38]"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
