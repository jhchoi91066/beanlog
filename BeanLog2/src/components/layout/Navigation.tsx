import React from 'react';
import { Coffee, Home, Search, User, PlusCircle, Compass, Users } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

export const Navigation = ({ activeView, onViewChange }: { activeView: string, onViewChange: (view: string) => void }) => {
  const navItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'search', icon: Search, label: '검색' },
    { id: 'record', icon: PlusCircle, label: '기록하기', highlight: true },
    { id: 'explore', icon: Compass, label: '탐색' },
    { id: 'community', icon: Users, label: '커뮤니티' },
    { id: 'my', icon: User, label: '마이' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 z-50 p-6">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-amber-600 p-2 rounded-lg text-white">
            <Coffee className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">BrewLog</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full justify-start text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                activeView === item.id && "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 font-medium",
                item.highlight && "bg-stone-900 dark:bg-amber-700 text-white hover:bg-stone-800 dark:hover:bg-amber-800 hover:text-white mt-4 mb-4 shadow-md"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800">
          <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mb-2">오늘의 커피 취향</p>
            <p className="text-sm text-stone-800 dark:text-stone-100 font-bold">산미있는 에티오피아 어때요?</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-50 px-6 py-3 flex justify-between items-center pb-safe">
        {navItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1" onClick={() => onViewChange(item.id)}>
             <div className={cn(
               "p-2 rounded-full transition-all cursor-pointer",
               item.highlight ? "bg-stone-900 text-white -mt-6 shadow-lg" : "text-stone-400",
               activeView === item.id && !item.highlight && "text-amber-600 bg-amber-50"
             )}>
               <item.icon className={cn("w-6 h-6", item.highlight && "w-6 h-6")} />
             </div>
             {!item.highlight && (
               <span className={cn(
                 "text-[10px] font-medium cursor-pointer", 
                 activeView === item.id ? "text-amber-600" : "text-stone-400"
               )}>
                 {item.label}
               </span>
             )}
          </div>
        ))}
      </div>
    </>
  );
};