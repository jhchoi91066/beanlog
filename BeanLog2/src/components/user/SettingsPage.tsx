import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Camera, Lock, Slash, Database, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useTheme } from '../theme-provider';

interface SettingsPageProps {
  onBack: () => void;
}

type SettingsView = 'main' | 'profile' | 'privacy' | 'support';

const ProfileEditView = ({ onBack }: { onBack: () => void }) => (
  <div className="animate-in slide-in-from-right duration-300">
    <div className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4 transition-colors">
      <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 text-stone-600 dark:text-stone-400">
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <h1 className="font-bold text-lg text-stone-800 dark:text-stone-100">프로필 편집</h1>
      <Button variant="ghost" className="ml-auto text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-stone-800">
        저장
      </Button>
    </div>

    <div className="p-6 space-y-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-white dark:border-stone-800 shadow-lg">
            <AvatarImage src="https://i.pravatar.cc/150?u=me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-stone-800 hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 border-2 border-white dark:border-stone-800">
            <Camera className="w-4 h-4 text-white" />
          </Button>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">프로필 사진 변경</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-stone-900 dark:text-stone-100">닉네임</Label>
          <Input id="nickname" defaultValue="커피러버" className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-stone-900 dark:text-stone-100">소개</Label>
          <Textarea id="bio" defaultValue="오늘도 맛있는 한 잔 ☕️" className="resize-none h-24 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100" />
        </div>
      </div>
    </div>
  </div>
);

const PrivacyView = ({ onBack }: { onBack: () => void }) => (
  <div className="animate-in slide-in-from-right duration-300">
    <div className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4 transition-colors">
      <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 text-stone-600 dark:text-stone-400">
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <h1 className="font-bold text-lg text-stone-800 dark:text-stone-100">개인정보 및 보안</h1>
    </div>

    <div className="p-4 space-y-6">
      <section className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-stone-800 dark:text-stone-100 font-medium">비밀번호 변경</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">주기적인 변경으로 계정을 보호하세요</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left">
             <div className="flex items-center gap-3">
              <Slash className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-stone-800 dark:text-stone-100 font-medium">차단 관리</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">차단한 사용자를 관리합니다</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left">
             <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-stone-800 dark:text-stone-100 font-medium">데이터 관리</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">캐시 삭제 및 데이터 내보내기</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </section>
      
      <div className="px-4">
        <p className="text-xs text-stone-400 mb-2">위험 구역</p>
        <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-100 dark:border-red-900/30 justify-start">
          회원 탈퇴
        </Button>
      </div>
    </div>
  </div>
);

const SupportView = ({ onBack }: { onBack: () => void }) => (
  <div className="animate-in slide-in-from-right duration-300">
    <div className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4 transition-colors">
      <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 text-stone-600 dark:text-stone-400">
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <h1 className="font-bold text-lg text-stone-800 dark:text-stone-100">도움말 및 문의</h1>
    </div>

    <div className="p-4 space-y-6">
      <section>
        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 px-1">자주 묻는 질문</h3>
        <Accordion type="single" collapsible className="w-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 px-4 transition-colors">
          <AccordionItem value="item-1" className="border-stone-100 dark:border-stone-800">
            <AccordionTrigger className="text-sm text-stone-700 dark:text-stone-200 hover:no-underline">원두 기록은 어떻게 하나요?</AccordionTrigger>
            <AccordionContent className="text-stone-500 dark:text-stone-400 text-sm">
              하단 내비게이션의 (+) 버튼을 눌러 커피 기록 화면으로 진입할 수 있습니다. 사진과 함께 맛을 기록해보세요.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-stone-100 dark:border-stone-800">
            <AccordionTrigger className="text-sm text-stone-700 dark:text-stone-200 hover:no-underline">레벨은 어떻게 올리나요?</AccordionTrigger>
            <AccordionContent className="text-stone-500 dark:text-stone-400 text-sm">
              커피 기록을 작성하고 다른 사용자와 소통하면 경험치가 쌓여 레벨이 올라갑니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger className="text-sm text-stone-700 dark:text-stone-200 hover:no-underline">다크 모드를 지원하나요?</AccordionTrigger>
            <AccordionContent className="text-stone-500 dark:text-stone-400 text-sm">
              네, 설정 &gt; 앱 설정 &gt; 다크 모드에서 설정하실 수 있습니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 px-1">문의하기</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800 transition-colors">
            <Mail className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">이메일 문의</span>
          </Button>
           <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800 transition-colors">
            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">1:1 채팅</span>
          </Button>
        </div>
      </section>
    </div>
  </div>
);

export const SettingsPage = ({ onBack }: SettingsPageProps) => {
  const [view, setView] = useState<SettingsView>('main');
  const { theme, setTheme } = useTheme();

  const renderView = () => {
    switch(view) {
      case 'profile': return <ProfileEditView onBack={() => setView('main')} />;
      case 'privacy': return <PrivacyView onBack={() => setView('main')} />;
      case 'support': return <SupportView onBack={() => setView('main')} />;
      default: return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 animate-in slide-in-from-right duration-300 transition-colors">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 h-14 flex items-center gap-4 transition-colors">
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 text-stone-600 dark:text-stone-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg text-stone-800 dark:text-stone-100">설정</h1>
          </div>

          <div className="p-4 space-y-6">
            {/* Account Section */}
            <section className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
              <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                <h2 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">계정</h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                <button 
                  onClick={() => setView('profile')}
                  className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-stone-700 dark:text-stone-200 font-medium">프로필 편집</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
                <button 
                  onClick={() => setView('privacy')}
                  className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-stone-700 dark:text-stone-200 font-medium">개인정보 및 보안</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </section>

            {/* App Settings Section */}
            <section className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
              <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                <h2 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">앱 설정</h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="text-stone-700 dark:text-stone-200 font-medium">알림 설정</span>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-500">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-stone-700 dark:text-stone-200 font-medium">다크 모드</span>
                  </div>
                  <Switch 
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>
            </section>

            {/* Support Section */}
            <section className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
               <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                <h2 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">지원</h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                <button 
                  onClick={() => setView('support')}
                  className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-stone-700 dark:text-stone-200 font-medium">도움말 및 문의하기</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </section>

            {/* Logout Button */}
            <Button variant="outline" className="w-full py-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-100 dark:border-red-900/30 dark:bg-transparent gap-2">
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>

            <div className="text-center text-xs text-stone-400 pt-4">
              <p>버전 1.0.0</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return renderView();
};
