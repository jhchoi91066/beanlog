import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MessageCircle, 
  ThumbsUp, 
  Eye, 
  TrendingUp, 
  HelpCircle, 
  Lightbulb, 
  Coffee,
  ArrowRight,
  Bookmark,
  Share2,
  MoreHorizontal,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../ui/utils';

interface Post {
  id: string;
  type: 'discussion' | 'question' | 'tip';
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isSolved?: boolean;
  timeAgo: string;
  category: string;
}

const PostCard = ({ post }: { post: Post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  const typeConfig = {
    discussion: { icon: MessageCircle, label: '토론', color: 'text-blue-600 dark:text-blue-400' },
    question: { icon: HelpCircle, label: '질문', color: 'text-purple-600 dark:text-purple-400' },
    tip: { icon: Lightbulb, label: '팁', color: 'text-amber-600 dark:text-amber-400' },
  };

  const config = typeConfig[post.type];
  const TypeIcon = config.icon;

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer dark:bg-stone-900 dark:border-stone-800 group">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-stone-800 dark:text-stone-100">{post.author.name}</span>
              <Badge variant="secondary" className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-none">
                {post.author.level}
              </Badge>
              {post.isSolved && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-500 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>해결됨</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>{post.timeAgo}</span>
              <span>·</span>
              <span>{post.category}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <MoreHorizontal className="w-4 h-4 text-stone-400" />
          </Button>
        </div>

        <div className="mb-3">
          <div className="flex items-start gap-2 mb-2">
            <TypeIcon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", config.color)} />
            <h3 className="font-bold text-stone-800 dark:text-stone-100 line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </div>
          <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2 leading-relaxed ml-6">
            {post.content}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4 ml-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-amber-600 dark:hover:text-amber-500",
                isLiked && "text-amber-600 dark:text-amber-500"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-amber-600 dark:fill-amber-500")} />
              <span>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
            >
              <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-amber-600 text-amber-600 dark:fill-amber-500 dark:text-amber-500")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TrendingTopics = () => {
  const topics = [
    { name: '홈카페', posts: 234, trend: '+12%' },
    { name: '에스프레소', posts: 189, trend: '+8%' },
    { name: '핸드드립', posts: 156, trend: '+15%' },
    { name: '원두추천', posts: 142, trend: '+5%' },
  ];

  return (
    <Card className="dark:bg-stone-900 dark:border-stone-800">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <h3 className="font-bold text-stone-800 dark:text-stone-100">실시간 인기 토픽</h3>
        </div>
        <div className="space-y-3">
          {topics.map((topic, i) => (
            <div 
              key={topic.name}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-100">#{topic.name}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{topic.posts}개 게시글</p>
                </div>
              </div>
              <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 text-xs">
                {topic.trend}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActions = () => {
  const actions = [
    { label: '질문하기', icon: HelpCircle, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
    { label: '팁 공유', icon: Lightbulb, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
    { label: '토론하기', icon: MessageCircle, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className={cn(
            "flex flex-col items-center gap-2 h-auto py-4 border-2 hover:shadow-md transition-all dark:border-stone-800",
            action.color
          )}
        >
          <action.icon className="w-5 h-5" />
          <span className="text-xs font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export const Community = () => {
  const [activeTab, setActiveTab] = useState('all');

  const mockPosts: Post[] = [
    {
      id: '1',
      type: 'question',
      title: '에스프레소 추출 시간이 너무 빠른데 원인이 뭘까요?',
      content: '새로 산 그라인더로 추출하는데 18초만에 2온스가 나와버려요. 분쇄도를 더 곱게 해야 할까요? 아니면 다른 문제일까요?',
      author: {
        name: '커피초보',
        avatar: 'https://i.pravatar.cc/150?u=user1',
        level: 'Starter',
      },
      tags: ['에스프레소', '추출', '그라인더'],
      likes: 23,
      comments: 15,
      views: 342,
      timeAgo: '30분 전',
      category: '추출 기술',
      isSolved: false,
    },
    {
      id: '2',
      type: 'tip',
      title: '홈카페에서 라떼아트 연습하는 5가지 팁',
      content: '1년간 연습한 결과 깨달은 것들을 정리해봤어요. 우유 스티밍 온도, 각도, 푸어링 타이밍 등 실전 팁들입니다.',
      author: {
        name: '라떼마스터',
        avatar: 'https://i.pravatar.cc/150?u=user2',
        level: 'Expert',
      },
      tags: ['라떼아트', '홈카페', '우유스티밍'],
      likes: 156,
      comments: 34,
      views: 1289,
      timeAgo: '2시간 전',
      category: '팁&노하우',
      isBookmarked: true,
    },
    {
      id: '3',
      type: 'discussion',
      title: '에티오피아 vs 콜롬비아, 산미 좋아하면 어디 원두가 더 좋을까요?',
      content: '산미를 선호하는데 에티오피아 예가체프와 콜롬비아 수프리모 중에 고민됩니다. 둘 다 마셔보신 분들 의견이 궁금해요!',
      author: {
        name: '원두탐험가',
        avatar: 'https://i.pravatar.cc/150?u=user3',
        level: 'Pro',
      },
      tags: ['원두', '산미', '에티오피아', '콜롬비아'],
      likes: 45,
      comments: 28,
      views: 567,
      timeAgo: '4시간 전',
      category: '원두&로스팅',
      isLiked: true,
    },
    {
      id: '4',
      type: 'question',
      title: '핸드드립 온도는 몇도가 가장 적당한가요?',
      content: '보통 92-96도 사이라고 하던데, 원두에 따라 다른가요? 요즘 케냐 원두 사용 중인데 너무 뜨거운 물로 하면 쓴맛이 나는 것 같아요.',
      author: {
        name: '드립러버',
        avatar: 'https://i.pravatar.cc/150?u=user4',
        level: 'Barista',
      },
      tags: ['핸드드립', '온도', '추출'],
      likes: 67,
      comments: 42,
      views: 892,
      timeAgo: '6시간 전',
      category: '추출 기술',
      isSolved: true,
    },
    {
      id: '5',
      type: 'tip',
      title: '카페에서 일하며 배운 우유 거품 만드는 비법',
      content: '바리스타로 일한 지 3년차인데, 처음 배울 때 몰랐던 것들을 공유합니다. 특히 우유 온도 체크하는 팁이 유용할 거예요.',
      author: {
        name: '바리스타김',
        avatar: 'https://i.pravatar.cc/150?u=user5',
        level: 'Expert',
      },
      tags: ['바리스타', '우유거품', '카페'],
      likes: 189,
      comments: 56,
      views: 2134,
      timeAgo: '1일 전',
      category: '팁&노하우',
    },
  ];

  const filterPosts = (posts: Post[]) => {
    if (activeTab === 'all') return posts;
    return posts.filter(post => post.type === activeTab);
  };

  const filteredPosts = filterPosts(mockPosts);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-6 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">커뮤니티</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm">커피 애호가들과 지식을 나눠보세요</p>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
              <Coffee className="w-4 h-4" />
              글쓰기
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 mb-6">
                <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-500">
                  전체
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
                  토론
                </TabsTrigger>
                <TabsTrigger value="question" className="flex-1 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
                  질문
                </TabsTrigger>
                <TabsTrigger value="tip" className="flex-1 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-500">
                  팁
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-0">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <Card className="dark:bg-stone-900 dark:border-stone-800">
                    <CardContent className="p-12 text-center">
                      <Coffee className="w-12 h-12 mx-auto mb-4 text-stone-300 dark:text-stone-700" />
                      <p className="text-stone-500 dark:text-stone-400">아직 게시글이 없습니다</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TrendingTopics />

            {/* Popular Tags */}
            <Card className="dark:bg-stone-900 dark:border-stone-800">
              <CardContent className="p-5">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">인기 태그</h3>
                <div className="flex flex-wrap gap-2">
                  {['홈카페', '에스프레소', '핸드드립', '라떼아트', '원두추천', '그라인더', '추출', '로스팅'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-500 hover:border-amber-300 dark:hover:border-amber-700 transition-colors bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="dark:bg-stone-900 dark:border-stone-800">
              <CardContent className="p-5">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">커뮤니티 현황</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400 text-sm">전체 멤버</span>
                    <span className="font-bold text-stone-800 dark:text-stone-100">12,458명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400 text-sm">오늘 활성 사용자</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">1,234명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-400 text-sm">총 게시글</span>
                    <span className="font-bold text-stone-800 dark:text-stone-100">8,923개</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
