import React from 'react';
import { AspectRatio } from '../ui/aspect-ratio';
import { Badge } from '../ui/badge';
import { ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

export const Explore = () => {
  const curatedCollections = [
    {
      title: '성수동 커피 투어',
      subtitle: '공장지대에서 피어난 커피향',
      image: 'https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: '비 오는 날, 따뜻한 라떼',
      subtitle: '감성 충전이 필요할 때',
      image: 'https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: '스페셜티 입문하기',
      subtitle: '커피의 신세계로 초대합니다',
      image: 'https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">탐색하기</h1>
        <p className="text-stone-500 mb-8">새로운 커피 경험을 발견해보세요.</p>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-stone-800">이번 주 에디터 픽</h2>
            <button className="text-sm text-amber-600 font-medium flex items-center hover:text-amber-700">
              더보기 <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid gap-6">
            {curatedCollections.map((item) => (
              <div key={item.title} className="relative rounded-xl overflow-hidden group cursor-pointer shadow-md">
                <AspectRatio ratio={16 / 9}>
                   <img src={item.image} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                   <div className="absolute bottom-0 left-0 p-6">
                     <Badge className="mb-2 bg-amber-500 hover:bg-amber-600 border-none">Editor's Pick</Badge>
                     <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                     <p className="text-stone-200 text-sm">{item.subtitle}</p>
                   </div>
                </AspectRatio>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-800 mb-4 px-1">카테고리별로 찾기</h2>
          <div className="grid grid-cols-2 gap-3">
             {['스페셜티', '디카페인', '핸드드립', '에스프레소바', '디저트맛집', '대형카페', '로스팅', '원두구매'].map(cat => (
               <div key={cat} className="bg-white p-4 rounded-xl border border-stone-100 text-center font-medium text-stone-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-all cursor-pointer">
                 #{cat}
               </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
};
