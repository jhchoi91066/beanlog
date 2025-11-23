import React, { useState } from 'react';
import { Camera, Star, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { FlavorRadar } from './FlavorRadar';

export const CreatePost = () => {
  const [rating, setRating] = useState(0);
  const [flavor, setFlavor] = useState({
    acidity: 3,
    sweetness: 3,
    body: 3,
    bitterness: 3,
    aroma: 3,
  });

  const handleSliderChange = (key: keyof typeof flavor, value: number[]) => {
    setFlavor((prev) => ({ ...prev, [key]: value[0] }));
  };

  const radarData = [
    { subject: '산미', A: flavor.acidity, fullMark: 5 },
    { subject: '단맛', A: flavor.sweetness, fullMark: 5 },
    { subject: '바디', A: flavor.body, fullMark: 5 },
    { subject: '쓴맛', A: flavor.bitterness, fullMark: 5 },
    { subject: '향', A: flavor.aroma, fullMark: 5 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">새로운 커피 기록</h1>
        <Button variant="ghost" size="icon">
          <X className="w-6 h-6 text-stone-400" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Image Upload Placeholder */}
        <div className="w-full aspect-[4/3] bg-stone-100 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
          <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
            <Camera className="w-6 h-6 text-stone-400" />
          </div>
          <p className="text-stone-500 text-sm font-medium">사진을 올려주세요</p>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="cafe">카페 이름</Label>
            <Input id="cafe" placeholder="예: 블루보틀 성수점" className="bg-white" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="menu">메뉴 이름</Label>
            <Input id="menu" placeholder="예: 뉴올리언스" className="bg-white" />
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label>평점</Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-stone-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-stone-600 font-medium text-lg">{rating}.0</span>
          </div>
        </div>

        {/* Flavor Profile */}
        <div className="space-y-6 bg-stone-50 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold text-stone-700">맛 그래프</Label>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <FlavorRadar data={radarData} />
            </div>
            <div className="w-full md:w-1/2 space-y-5">
              {Object.entries(flavor).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-500 uppercase font-medium">
                    <span>{key === 'acidity' ? '산미' : key === 'sweetness' ? '단맛' : key === 'body' ? '바디' : key === 'bitterness' ? '쓴맛' : '향'}</span>
                    <span>{value}</span>
                  </div>
                  <Slider
                    value={[value]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(val) => handleSliderChange(key as keyof typeof flavor, val)}
                    className="[&_.bg-primary]:bg-amber-600 [&_.border-primary]:border-amber-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description">나만의 기록</Label>
          <Textarea 
            id="description" 
            placeholder="커피의 맛과 향, 카페의 분위기는 어땠나요?" 
            className="bg-white min-h-[150px] resize-none"
          />
        </div>

        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white py-6 text-lg rounded-xl">
          기록 저장하기
        </Button>
      </div>
    </div>
  );
};
