import { Upgrade } from './types';
import { Bot, Zap, Rocket, TrendingUp, MessageCircle, Image, UserCheck, Leaf } from 'lucide-react';
import React from 'react';

export const BAD_WORDS = ['admin', 'root', 'system', 'mod', 'fuk', 'fck', 'sh1t', 'shit', 'dick', 'ass', 'bitch', 'cunt', 'nigger', 'nigga', 'faggot', 'whore', 'slut', 'cock', 'pussy', 'sex', 'xyz', 'kill', 'die'];

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'reply-guy',
    name: 'Reply Guy',
    description: 'Spams "This is the ticker" under every Elon tweet.',
    baseCost: 15,
    costMultiplier: 1.5,
    effectValue: 1,
    effectType: 'passive',
    icon: 'message',
    count: 0,
  },
  {
    id: 'meme-generator',
    name: 'Meme Factory',
    description: 'Cooking up fresh memes for the timeline 24/7.',
    baseCost: 100,
    costMultiplier: 1.4,
    effectValue: 5,
    effectType: 'passive',
    icon: 'image',
    count: 0,
  },
  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    description: 'Fingers physically unable to click the sell button.',
    baseCost: 250,
    costMultiplier: 1.6,
    effectValue: 3,
    effectType: 'click',
    icon: 'zap',
    count: 0,
  },
  {
    id: 'chad-holder',
    name: 'Chad Holder',
    description: 'Buys the top, never sells. A true believer.',
    baseCost: 1000,
    costMultiplier: 1.5,
    effectValue: 25,
    effectType: 'passive',
    icon: 'user',
    count: 0,
  },
  {
    id: 'based-dev',
    name: 'Based Dev',
    description: 'Dev is actually working and not sleeping.',
    baseCost: 5000,
    costMultiplier: 1.7,
    effectValue: 100,
    effectType: 'passive',
    icon: 'rocket',
    count: 0,
  },
  {
    id: 'organic-growth',
    name: 'Organic Growth',
    description: 'No paid marketing, just pure vibes and community.',
    baseCost: 20000,
    costMultiplier: 1.8,
    effectValue: 500,
    effectType: 'passive',
    icon: 'leaf',
    count: 0,
  },
];

export const getIcon = (name: string, className?: string) => {
  const props = { className: className || "w-5 h-5" };
  switch (name) {
    case 'bot': return <Bot {...props} />;
    case 'zap': return <Zap {...props} />;
    case 'rocket': return <Rocket {...props} />;
    case 'trending': return <TrendingUp {...props} />;
    case 'message': return <MessageCircle {...props} />;
    case 'image': return <Image {...props} />;
    case 'user': return <UserCheck {...props} />;
    case 'leaf': return <Leaf {...props} />;
    default: return <Bot {...props} />;
  }
};
