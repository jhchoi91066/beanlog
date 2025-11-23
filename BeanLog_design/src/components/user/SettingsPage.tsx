import React from 'react';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage = ({ onBack }: SettingsPageProps) => {
  return (
    <div className="min-h-screen bg-stone-50 pb-24 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-14 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Button>
        <h1 className="font-bold text-lg text-stone-800">설정</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Account Section */}
        <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">계정</h2>
          </div>
          <div className="divide-y divide-stone-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">프로필 편집</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">개인정보 및 보안</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </section>

        {/* App Settings Section */}
        <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">앱 설정</h2>
          </div>
          <div className="divide-y divide-stone-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">알림 설정</span>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">다크 모드</span>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
           <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">지원</h2>
          </div>
          <div className="divide-y divide-stone-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-stone-700 font-medium">도움말 및 문의하기</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <Button variant="outline" className="w-full py-6 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 gap-2">
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>

        <div className="text-center text-xs text-stone-400 pt-4">
          <p>버전 1.0.0</p>
        </div>
      </div>
    </div>
  );
};
