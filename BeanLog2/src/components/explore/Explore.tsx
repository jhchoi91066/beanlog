import React, { useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import {
  ArrowRight,
  MapPin,
  TrendingUp,
  Coffee,
  Sparkles,
  Map,
  Award,
  Users,
  ArrowLeft,
  Star,
  Heart,
  Navigation,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";

type ExploreView =
  | "main"
  | "collection"
  | "category"
  | "region";

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cafes?: number;
  description?: string;
}

interface Cafe {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  distance?: string;
  tags: string[];
}

const CollectionDetailView = ({
  collection,
  onBack,
}: {
  collection: Collection;
  onBack: () => void;
}) => {
  const cafes: Cafe[] = [
    {
      id: "1",
      name: "테라로사 커피",
      location: "서울 성수동",
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      rating: 4.8,
      reviews: 328,
      distance: "1.2km",
      tags: ["스페셜티", "로스터리", "브런치"],
    },
    {
      id: "2",
      name: "커피리브레",
      location: "서울 성수동",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      rating: 4.7,
      reviews: 256,
      distance: "0.8km",
      tags: ["핸드드립", "조용한", "디저트"],
    },
    {
      id: "3",
      name: "대림창고",
      location: "서울 성수동",
      image:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
      rating: 4.9,
      reviews: 412,
      distance: "1.5km",
      tags: ["넓은", "뷰맛집", "브런치"],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        <img
          src={collection.image}
          alt={collection.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge className="mb-3 bg-amber-500 hover:bg-amber-600 border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            Editor's Pick
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            {collection.title}
          </h1>
          <p className="text-stone-200">
            {collection.subtitle}
          </p>
          <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Coffee className="w-4 h-4" />
              {cafes.length}개 카페
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              1.2k명 저장
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
          {collection.description ||
            "과거 공장지대였던 성수동은 이제 서울의 핫플레이스로 자리잡았습니다. 독특한 인테리어와 훌륭한 커피를 자랑하는 카페들을 만나보세요."}
        </p>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-800 dark:text-stone-100">
            추천 카페
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
          >
            <Map className="w-4 h-4" />
            지도로 보기
          </Button>
        </div>

        <div className="space-y-4">
          {cafes.map((cafe) => (
            <Card
              key={cafe.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer dark:bg-stone-900 dark:border-stone-800"
            >
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0">
                    <img
                      src={cafe.image}
                      alt={cafe.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-1.5">
                          {cafe.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-2">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {cafe.location}
                          </span>
                          {cafe.distance && (
                            <>
                              <span className="text-stone-300 dark:text-stone-700">
                                ·
                              </span>
                              <span className="flex-shrink-0">
                                {cafe.distance}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8"
                      >
                        <Heart className="w-4 h-4 text-stone-400 hover:text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-stone-800 dark:text-stone-100">
                          {cafe.rating}
                        </span>
                      </div>
                      <span className="text-sm text-stone-400">
                        ({cafe.reviews})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cafe.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryDetailView = ({
  category,
  onBack,
}: {
  category: string;
  onBack: () => void;
}) => {
  const posts = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
      title: "스페셜티 커피 입문 가이드",
      author: "커피마스터",
      likes: 234,
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
      title: "최고의 에티오피아 원두 5선",
      author: "원두탐험가",
      likes: 189,
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
      title: "홈카페 추출 꿀팁",
      author: "홈바리스타",
      likes: 421,
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
      title: "라떼아트 기초부터",
      author: "라떼장인",
      likes: 356,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="-ml-2 text-stone-600 dark:text-stone-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg text-stone-800 dark:text-stone-100">
          #{category}
        </h1>
      </div>

      <div className="p-4">
        <Tabs defaultValue="cafes" className="w-full">
          <TabsList className="w-full bg-stone-100 dark:bg-stone-900 mb-6">
            <TabsTrigger value="cafes" className="flex-1">
              카페
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">
              게시글
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cafes" className="space-y-3 mt-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card
                key={i}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer dark:bg-stone-900 dark:border-stone-800"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0">
                      <img
                        src={`https://images.unsplash.com/photo-${1501339847302 + i * 1000000}-ac426a4a7cbb?w=200`}
                        alt={`Cafe ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-1">
                        카페 이름 #{i}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                        서울 성동구
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            4.{8 - (i % 3)}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400">
                          ·
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {120 + i * 30}개 리뷰
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="posts" className="mt-0">
            <div className="grid grid-cols-2 gap-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group cursor-pointer"
                >
                  <AspectRatio
                    ratio={3 / 4}
                    className="overflow-hidden rounded-xl mb-2"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium line-clamp-2">
                        {post.title}
                      </p>
                    </div>
                  </AspectRatio>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-5 h-5">
                        <AvatarImage
                          src={`https://i.pravatar.cc/150?u=${post.id}`}
                        />
                        <AvatarFallback className="text-[10px]">
                          {post.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-stone-600 dark:text-stone-400 truncate">
                        {post.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-500 dark:text-stone-500">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export const Explore = () => {
  const [view, setView] = useState<ExploreView>("main");
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("");

  const curatedCollections: Collection[] = [
    {
      id: "1",
      title: "성수동 커피 투어",
      subtitle: "공장지대에서 피어난 커피향",
      image:
        "https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      cafes: 12,
      description:
        "과거 공장지대였던 성수동은 이제 서울의 핫플레이스로 자리잡았습니다. 독특한 인테리어와 훌륭한 커피를 자랑하는 카페들을 만나보세요.",
    },
    {
      id: "2",
      title: "비 오는 날, 따뜻한 라떼",
      subtitle: "감성 충전이 필요할 때",
      image:
        "https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      cafes: 8,
      description:
        "빗소리를 들으며 마시는 따뜻한 라떼 한 잔. 감성적인 분위기의 카페를 모았습니다.",
    },
    {
      id: "3",
      title: "스페셜티 입문하기",
      subtitle: "커피의 신세계로 초대합니다",
      image:
        "https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      cafes: 15,
      description:
        "스페셜티 커피의 세계에 첫 발을 내딛는 분들을 위한 큐레이션입니다.",
    },
  ];

  const trendingCafes = [
    {
      name: "테라로사",
      location: "강릉",
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
      trend: "+24%",
    },
    {
      name: "모모스커피",
      location: "부산",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      trend: "+18%",
    },
    {
      name: "프릳츠",
      location: "서울",
      image:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
      trend: "+15%",
    },
  ];

  const regions = [
    { name: "서울", count: 1240, icon: "🏙️" },
    { name: "경기", count: 680, icon: "🌆" },
    { name: "부산", count: 320, icon: "🌊" },
    { name: "강릉", count: 150, icon: "⛰️" },
  ];

  if (view === "collection" && selectedCollection) {
    return (
      <CollectionDetailView
        collection={selectedCollection}
        onBack={() => setView("main")}
      />
    );
  }

  if (view === "category" && selectedCategory) {
    return (
      <CategoryDetailView
        category={selectedCategory}
        onBack={() => setView("main")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 transition-colors">
      <div className="p-6 pt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            탐색하기
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            새로운 커피 경험을 발견해보세요.
          </p>
        </div>

        {/* Trending Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <h2 className="font-bold text-stone-800 dark:text-stone-100">
                지금 뜨는 카페
              </h2>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trendingCafes.map((cafe, i) => (
              <Card
                key={i}
                className="flex-shrink-0 w-40 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow dark:bg-stone-900 dark:border-stone-800"
              >
                <CardContent className="p-0">
                  <AspectRatio ratio={1}>
                    <img
                      src={cafe.image}
                      alt={cafe.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 border-none text-white text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {cafe.trend}
                      </Badge>
                    </div>
                  </AspectRatio>
                  <div className="p-3">
                    <p className="font-bold text-sm text-stone-800 dark:text-stone-100 mb-0.5">
                      {cafe.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {cafe.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Editor's Pick */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <h2 className="font-bold text-stone-800 dark:text-stone-100">
                이번 주 에디터 픽
              </h2>
            </div>
            <button className="text-sm text-amber-600 dark:text-amber-500 font-medium flex items-center hover:text-amber-700 dark:hover:text-amber-600">
              더보기 <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid gap-4">
            {curatedCollections.map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all"
                onClick={() => {
                  setSelectedCollection(item);
                  setView("collection");
                }}
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-3 bg-amber-500 hover:bg-amber-600 border-none shadow-lg">
                      <Award className="w-3 h-3 mr-1" />
                      Editor's Pick
                    </Badge>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-stone-200 text-sm mb-3">
                      {item.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>{item.cafes}개 카페</span>
                    </div>
                  </div>
                </AspectRatio>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h2 className="font-bold text-stone-800 dark:text-stone-100">
              카테고리별로 찾기
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              "스페셜티",
              "디카페인",
              "핸드드립",
              "에스프레소바",
              "디저트맛집",
              "대형카페",
              "로스팅",
              "원두구매",
            ].map((cat) => (
              <Card
                key={cat}
                className="cursor-pointer hover:shadow-md transition-all dark:bg-stone-900 dark:border-stone-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                onClick={() => {
                  setSelectedCategory(cat);
                  setView("category");
                }}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    #{cat}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};