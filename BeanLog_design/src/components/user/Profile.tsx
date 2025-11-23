import React, { useState } from "react";
import { Settings, Award, Coffee, Heart } from "lucide-react";
import { Button } from "../ui/button";
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
import { CoffeeCard, CoffeePost } from "../coffee/CoffeeCard";
import { FlavorRadar } from "../coffee/FlavorRadar";
import { SettingsPage } from "./SettingsPage";

// Reuse MOCK_POSTS or accept as props in real app
const MOCK_USER_POSTS: CoffeePost[] = [
  {
    id: "1",
    cafeName: "블루보틀 성수",
    coffeeName: "뉴올리언스",
    location: "서울 성동구",
    imageUrl:
      "https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    tags: ["달콤함", "부드러움", "시그니처"],
    flavorProfile: {
      acidity: 2,
      sweetness: 5,
      body: 4,
      bitterness: 2,
      aroma: 4,
    },
    author: {
      name: "커피러버",
      avatar: "https://i.pravatar.cc/150?u=1",
      level: "Barista",
    },
    description:
      "블루보틀의 시그니처 메뉴. 치커리와 섞은 콜드브루에 우유와 유기농 설탕을 넣어 달콤하고 부드러운 맛이 일품입니다.",
    likes: 124,
    comments: 12,
    date: "2시간 전",
  },
];

export const Profile = () => {
  const [showSettings, setShowSettings] = useState(false);

  const userFlavorStats = [
    { subject: "산미", A: 4, fullMark: 5 },
    { subject: "단맛", A: 3, fullMark: 5 },
    { subject: "바디", A: 3, fullMark: 5 },
    { subject: "쓴맛", A: 2, fullMark: 5 },
    { subject: "향", A: 5, fullMark: 5 },
  ];

  if (showSettings) {
    return (
      <SettingsPage onBack={() => setShowSettings(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-stone-100">
                <AvatarImage src="https://i.pravatar.cc/150?u=me" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">
                  커피러버
                </h1>
                <p className="text-stone-500 text-sm">
                  오늘도 맛있는 한 잔 ☕️
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    <Award className="w-3 h-3 mr-1" /> Barista
                    Level
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5 text-stone-600" />
            </Button>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="text-center">
              <p className="text-xl font-bold text-stone-800">
                42
              </p>
              <p className="text-xs text-stone-500">기록</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-stone-800">
                1.2k
              </p>
              <p className="text-xs text-stone-500">팔로워</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-stone-800">
                380
              </p>
              <p className="text-xs text-stone-500">팔로잉</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 flex items-center gap-6">
            <div className="w-32">
              <FlavorRadar data={userFlavorStats} />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800 mb-1">
                나의 커피 취향
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                산미와 향이 풍부한 커피를 선호하시네요!
                <br />
                에티오피아 계열의 원두와 잘 맞아요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-stone-200 rounded-none h-auto p-0 justify-start gap-8 mb-6">
            <TabsTrigger
              value="logs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:shadow-none px-0 pb-3 text-stone-500 data-[state=active]:text-stone-900 bg-transparent"
            >
              <Coffee className="w-4 h-4 mr-2" />내 기록
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:shadow-none px-0 pb-3 text-stone-500 data-[state=active]:text-stone-900 bg-transparent"
            >
              <Heart className="w-4 h-4 mr-2" />
              찜한 커피
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-6">
            {MOCK_USER_POSTS.map((post) => (
              <CoffeeCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="saved">
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Heart className="w-12 h-12 mb-4 opacity-20" />
              <p>아직 찜한 커피가 없습니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};