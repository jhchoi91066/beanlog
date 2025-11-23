import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, MapPin, Star } from 'lucide-react';
import { FlavorRadar } from './FlavorRadar';
import { AspectRatio } from '../ui/aspect-ratio';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

export interface CoffeePost {
  id: string;
  cafeName: string;
  coffeeName: string;
  location: string;
  imageUrl: string;
  rating: number;
  tags: string[];
  flavorProfile: {
    acidity: number; // 1-5
    sweetness: number;
    body: number;
    bitterness: number;
    aroma: number;
  };
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  description: string;
  likes: number;
  comments: number;
  date: string;
}

interface CoffeeCardProps {
  post: CoffeePost;
}

export const CoffeeCard = ({ post }: CoffeeCardProps) => {
  const radarData = [
    { subject: '산미', A: post.flavorProfile.acidity, fullMark: 5 },
    { subject: '단맛', A: post.flavorProfile.sweetness, fullMark: 5 },
    { subject: '바디', A: post.flavorProfile.body, fullMark: 5 },
    { subject: '쓴맛', A: post.flavorProfile.bitterness, fullMark: 5 },
    { subject: '향', A: post.flavorProfile.aroma, fullMark: 5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
        <div className="relative">
          <AspectRatio ratio={4 / 3}>
            <img
              src={post.imageUrl}
              alt={post.coffeeName}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          </AspectRatio>
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full flex items-center text-xs font-medium">
            <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
            {post.rating.toFixed(1)}
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-stone-800 leading-tight">{post.coffeeName}</h3>
              <div className="flex items-center text-stone-500 text-sm mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {post.cafeName}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 text-stone-400">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <p className="text-stone-600 text-sm mb-4 line-clamp-2">
            {post.description}
          </p>
          
          <div className="flex items-center justify-center bg-stone-50 rounded-xl p-2 mb-4">
             <FlavorRadar data={radarData} />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-stone-100 text-stone-600 hover:bg-stone-200 font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2 pt-4">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-stone-600">{post.author.name}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-stone-400">
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-xs">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.comments}</span>
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
