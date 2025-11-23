import React, { useState } from 'react';
import { Navigation } from './components/layout/Navigation';
import { CoffeeCard, CoffeePost } from './components/coffee/CoffeeCard';
import { CreatePost } from './components/coffee/CreatePost';
import { SearchPage } from './components/search/SearchPage';
import { Explore } from './components/explore/Explore';
import { Profile } from './components/user/Profile';
import { Bell, Search, Filter, MapPin, Star } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

// Mock Data
const MOCK_POSTS: CoffeePost[] = [
  {
    id: '1',
    cafeName: '블루보틀 성수',
    coffeeName: '뉴올리언스',
    location: '서울 성동구',
    imageUrl: 'https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    tags: ['달콤함', '부드러움', '시그니처'],
    flavorProfile: {
      acidity: 2,
      sweetness: 5,
      body: 4,
      bitterness: 2,
      aroma: 4,
    },
    author: {
      name: '커피러버',
      avatar: 'https://i.pravatar.cc/150?u=1',
      level: 'Barista',
    },
    description: '블루보틀의 시그니처 메뉴. 치커리와 섞은 콜드브루에 우유와 유기농 설탕을 넣어 달콤하고 부드러운 맛이 일품입니다.',
    likes: 124,
    comments: 12,
    date: '2시간 전',
  },
  {
    id: '2',
    cafeName: '앤트러사이트 합정',
    coffeeName: '공기와 꿈 드립',
    location: '서울 마포구',
    imageUrl: 'https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    tags: ['산미', '꽃향기', '깔끔함'],
    flavorProfile: {
      acidity: 5,
      sweetness: 3,
      body: 2,
      bitterness: 1,
      aroma: 5,
    },
    author: {
      name: '브루잉마스터',
      avatar: 'https://i.pravatar.cc/150?u=2',
      level: 'Pro',
    },
    description: '에티오피아 원두 특유의 화사한 산미가 돋보입니다. 식으면서 더 살아나는 베리류의 향미가 매력적이에요.',
    likes: 89,
    comments: 5,
    date: '5시간 전',
  },
  {
    id: '3',
    cafeName: '프릳츠 도화',
    coffeeName: '잘 되어 가시나',
    location: '서울 마포구',
    imageUrl: 'https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    tags: ['밸런스', '견과류', '데일리'],
    flavorProfile: {
      acidity: 3,
      sweetness: 4,
      body: 4,
      bitterness: 3,
      aroma: 3,
    },
    author: {
      name: '데일리커피',
      avatar: 'https://i.pravatar.cc/150?u=3',
      level: 'Starter',
    },
    description: '매일 마셔도 질리지 않는 훌륭한 밸런스. 고소한 견과류의 풍미와 은은한 단맛이 조화롭습니다.',
    likes: 210,
    comments: 34,
    date: '1일 전',
  },
  {
    id: '4',
    cafeName: '모모스 커피',
    coffeeName: '에스 쇼콜라',
    location: '부산 영도구',
    imageUrl: 'https://images.unsplash.com/photo-1751956066306-c5684cbcf385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYWZlJTIwaW50ZXJpb3IlMjBjb3p5fGVufDF8fHx8MTc2MzcxMDM4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    tags: ['다크초콜릿', '묵직함', '라떼추천'],
    flavorProfile: {
      acidity: 1,
      sweetness: 4,
      body: 5,
      bitterness: 4,
      aroma: 3,
    },
    author: {
      name: '라떼장인',
      avatar: 'https://i.pravatar.cc/150?u=4',
      level: 'Expert',
    },
    description: '이름처럼 다크 초콜릿의 쌉싸름함과 단맛이 진하게 느껴집니다. 우유와 섞였을 때 그 진가가 발휘되는 원두.',
    likes: 156,
    comments: 18,
    date: '2일 전',
  }
];

const HomeView = () => (
  <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">안녕하세요, 바리스타님 ☕️</h1>
      <p className="text-stone-500">오늘의 추천 커피를 확인해보세요.</p>
    </div>

    <Tabs defaultValue="feed" className="w-full mb-8">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-stone-100 p-1">
          <TabsTrigger value="feed" className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm">피드</TabsTrigger>
          <TabsTrigger value="nearby" className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm">내 주변</TabsTrigger>
          <TabsTrigger value="ranking" className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm">랭킹</TabsTrigger>
        </TabsList>
        
        <Button variant="outline" size="sm" className="gap-2 text-stone-600">
          <Filter className="w-4 h-4" />
          필터
        </Button>
      </div>

      <TabsContent value="feed" className="mt-0">
        {/* Filter Tags */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
          {['전체', '산미있는', '고소한', '디카페인', '핸드드립', '라떼맛집', '뷰맛집'].map((tag, i) => (
            <Button 
              key={tag} 
              variant={i === 0 ? "default" : "outline"}
              className={i === 0 ? "bg-stone-800 text-white hover:bg-stone-700" : "text-stone-600 border-stone-200 hover:bg-stone-50 whitespace-nowrap"}
              size="sm"
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Masonry-like Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_POSTS.map((post) => (
            <CoffeeCard key={post.id} post={post} />
          ))}
          {MOCK_POSTS.map((post) => (
             <CoffeeCard key={`${post.id}-duplicate`} post={{...post, id: `${post.id}-duplicate`}} />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="nearby">
        <div className="flex flex-col items-center justify-center h-64 text-stone-400 bg-white rounded-2xl border border-stone-100">
          <MapPin className="w-10 h-10 mb-3 opacity-20" />
          <p>내 주변 카페 지도를 준비중입니다.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="ranking">
         <div className="flex flex-col items-center justify-center h-64 text-stone-400 bg-white rounded-2xl border border-stone-100">
          <Star className="w-10 h-10 mb-3 opacity-20" />
          <p>이달의 인기 커피 랭킹을 준비중입니다.</p>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomeView />;
      case 'search': return <SearchPage />;
      case 'record': return <CreatePost />;
      case 'explore': return <Explore />;
      case 'my': return <Profile />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navigation activeView={currentView} onViewChange={setCurrentView} />
      
      <main className="md:pl-64">
        {/* Header - Only show on Home view for now, or customize per view */}
        {currentView === 'home' && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                 <Input 
                   placeholder="카페, 원두, 맛으로 검색해보세요" 
                   className="pl-10 bg-stone-100 border-none focus-visible:ring-amber-500 focus-visible:bg-white transition-all"
                 />
               </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Button size="icon" variant="ghost" className="text-stone-500 hover:text-amber-600">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar 
                className="w-8 h-8 border border-stone-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setCurrentView('my')}
              >
                <AvatarImage src="https://i.pravatar.cc/150?u=me" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
            </div>
          </header>
        )}

        {renderView()}
      </main>
    </div>
  );
}
