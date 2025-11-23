import React, { useState } from 'react';
import { Search, X, TrendingUp, Clock, Map, List, MapPin, Navigation as NavIcon, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const SearchPage = () => {
  const [isMapView, setIsMapView] = useState(false);
  const recentSearches = ['에티오피아', '블루보틀', '디카페인', '성수동 카페'];
  const trendingKeywords = ['#크림라떼', '#스페셜티', '#신상카페', '#뷰맛집', '#핸드드립'];

  const mockMapPins = [
    { id: 1, x: '30%', y: '40%', name: '블루보틀' },
    { id: 2, x: '60%', y: '20%', name: '로우키' },
    { id: 3, x: '50%', y: '60%', name: '센터커피' },
    { id: 4, x: '20%', y: '70%', name: '메쉬' },
    { id: 5, x: '75%', y: '50%', name: '카멜커피' },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      {/* Search Header */}
      <div className="sticky top-0 bg-white z-30 border-b border-stone-100 p-4 shadow-sm">
        <div className="relative flex gap-2">
           <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input 
              autoFocus={!isMapView}
              placeholder={isMapView ? "지도에서 지역 검색" : "검색어를 입력하세요"}
              className="pl-10 pr-10 h-12 text-lg bg-stone-50 border-none focus-visible:ring-amber-500 transition-all"
            />
             {!isMapView && (
               <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-400">
                 <X className="w-4 h-4" />
               </Button>
             )}
           </div>
           
           <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 shrink-0 border-stone-200 text-stone-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200"
            onClick={() => setIsMapView(!isMapView)}
          >
            {isMapView ? <List className="w-5 h-5" /> : <Map className="w-5 h-5" />}
           </Button>
        </div>
      </div>

      {isMapView ? (
        <div className="relative w-full h-[calc(100vh-180px)] bg-stone-100 overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
               }} 
          />
          
          {/* Floating 'Search This Area' Button */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
             <Button className="bg-white text-stone-800 hover:bg-stone-50 shadow-md rounded-full text-xs h-9 px-4 border border-stone-200 flex items-center gap-2">
               <NavIcon className="w-3 h-3 text-amber-600" />
               이 지역 재검색
             </Button>
          </div>

          {/* Mock Pins */}
          {mockMapPins.map(pin => (
            <div 
              key={pin.id}
              className="absolute flex flex-col items-center cursor-pointer group"
              style={{ top: pin.y, left: pin.x }}
            >
              <div className="bg-amber-600 text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform border-2 border-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="mt-1 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-stone-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {pin.name}
              </div>
            </div>
          ))}
          
          {/* Bottom Info Card Placeholder */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-stone-800 text-sm">성수동 카페거리</p>
                   <p className="text-xs text-stone-500">현재 지도에 42개의 카페가 있어요</p>
                 </div>
               </div>
               <Button size="sm" className="bg-stone-900 text-white text-xs h-8">목록보기</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-8">
           {/* Banner for Map Search */}
           <div 
             onClick={() => setIsMapView(true)}
             className="relative rounded-xl overflow-hidden bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all group"
           >
            <div className="z-10">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Map className="w-5 h-5 text-amber-400" />
                지도로 카페 찾기
              </h3>
              <p className="text-stone-300 text-xs">내 주변의 맛있는 카페를 지도에서 확인해보세요</p>
            </div>
            <div className="bg-white/10 p-2 rounded-full z-10 group-hover:bg-white/20 transition-colors">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            
            {/* Decor */}
            <Map className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                최근 검색어
              </h3>
              <Button variant="link" className="text-xs text-stone-400 h-auto p-0">지우기</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(term => (
                <Badge key={term} variant="secondary" className="bg-stone-100 text-stone-600 hover:bg-stone-200 py-1.5 px-3 font-normal cursor-pointer">
                  {term}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                실시간 인기 태그
              </h3>
            </div>
            <div className="space-y-3">
              {trendingKeywords.map((keyword, idx) => (
                <div key={keyword} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className={`font-bold w-4 text-center ${idx < 3 ? 'text-amber-600' : 'text-stone-400'}`}>{idx + 1}</span>
                    <span className="text-stone-700 group-hover:text-amber-700 transition-colors">{keyword}</span>
                  </div>
                  <div className="w-12 h-8 bg-stone-100 rounded-md animate-pulse hidden group-hover:block transition-all" />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
