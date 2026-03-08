'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Reply,
  Heart,
  Basketball,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { formatTime } from '@/lib/utils';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'announcement';
  isOrganizer?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  replyTo?: string;
}

interface GameChatProps {
  gameId: string;
  currentUser: {
    id: string;
    username: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    username: string;
    avatar?: string;
    isOrganizer?: boolean;
  }>;
  className?: string;
}

// Mock chat messages
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    userId: 'system',
    username: 'System',
    message: 'Game created! Players can now join.',
    timestamp: new Date('2024-12-27T10:00:00'),
    type: 'system'
  },
  {
    id: '2',
    userId: 'user1',
    username: 'PickupKing',
    message: 'Hey everyone! Looking forward to a great game tonight. Court has good lighting so we can play until late 🏀',
    timestamp: new Date('2024-12-27T10:30:00'),
    type: 'message',
    isOrganizer: true,
    reactions: [
      { emoji: '🏀', count: 3, users: ['user2', 'user3', 'user4'] },
      { emoji: '🔥', count: 2, users: ['user2', 'user5'] }
    ]
  },
  {
    id: '3',
    userId: 'user2',
    username: 'SharpShooter',
    message: 'Count me in! Should I bring extra basketballs?',
    timestamp: new Date('2024-12-27T11:15:00'),
    type: 'message',
    replyTo: '2'
  },
  {
    id: '4',
    userId: 'user1',
    username: 'PickupKing',
    message: 'That would be great! Always good to have backups.',
    timestamp: new Date('2024-12-27T11:20:00'),
    type: 'message',
    isOrganizer: true,
    replyTo: '3'
  },
  {
    id: '5',
    userId: 'system',
    username: 'System',
    message: 'BigMan joined the game',
    timestamp: new Date('2024-12-27T12:00:00'),
    type: 'system'
  },
  {
    id: '6',
    userId: 'user3',
    username: 'BigMan',
    message: 'What\'s up team! Ready to dominate the paint 💪',
    timestamp: new Date('2024-12-27T12:05:00'),
    type: 'message'
  },
  {
    id: '7',
    userId: 'user1',
    username: 'PickupKing',
    message: 'Quick reminder: Game starts at 6 PM sharp. Court address is in the details tab. See you all there!',
    timestamp: new Date('2024-12-27T14:30:00'),
    type: 'announcement',
    isOrganizer: true,
    reactions: [
      { emoji: '👍', count: 5, users: ['user2', 'user3', 'user4', 'user5', 'user6'] }
    ]
  }
];

const basketballEmojis = ['🏀', '🔥', '💪', '👍', '⚡', '🎯', '💯', '🏆'];

export function GameChat({ gameId, currentUser, participants, className }: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      message: newMessage,
      timestamp: new Date(),
      type: 'message',
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser.id)) {
            // Remove reaction
            existingReaction.count--;
            existingReaction.users = existingReaction.users.filter(id => id !== currentUser.id);
            if (existingReaction.count === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            // Add reaction
            existingReaction.count++;
            existingReaction.users.push(currentUser.id);
          }
        } else {
          // New reaction
          reactions.push({ emoji, count: 1, users: [currentUser.id] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const getMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatTime(timestamp);
  };

  const findReplyMessage = (replyId: string) => {
    return messages.find(msg => msg.id === replyId);
  };

  return (
    <div className={cn('flex flex-col h-[600px] bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl border border-primary-400/20', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-400/20">
        <div>
          <h3 className="font-display font-bold text-white">Game Chat</h3>
          <p className="text-sm text-primary-300">{participants.length} participants</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((participant) => (
              <div
                key={participant.id}
                className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-dark-300"
              >
                {participant.username.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 3 && (
              <div className="w-8 h-8 bg-dark-200 rounded-full flex items-center justify-center text-primary-300 text-xs font-bold border-2 border-dark-300">
                +{participants.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex space-x-3',
                message.type === 'system' && 'justify-center',
                message.userId === currentUser.id && 'flex-row-reverse space-x-reverse'
              )}
            >
              {message.type === 'system' ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-dark-200/50 rounded-full">
                  <div className="w-2 h-2 bg-primary-400 rounded-full" />
                  <span className="text-sm text-primary-300">{message.message}</span>
                  <span className="text-xs text-primary-400">{getMessageTime(message.timestamp)}</span>
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  {message.userId !== currentUser.id && (
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {message.username.charAt(0).toUpperCase()}
                      </div>
                      {message.isOrganizer && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-xs">👑</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={cn(
                    'flex-1 max-w-xs lg:max-w-md',
                    message.userId === currentUser.id && 'flex flex-col items-end'
                  )}>
                    {/* Reply Context */}
                    {message.replyTo && (
                      <div className="mb-2 p-2 bg-dark-200/30 rounded-lg border-l-2 border-primary-400/50">
                        <p className="text-xs text-primary-400 mb-1">
                          Replying to {findReplyMessage(message.replyTo)?.username}
                        </p>
                        <p className="text-sm text-primary-300 truncate">
                          {findReplyMessage(message.replyTo)?.message}
                        </p>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={cn(
                      'relative p-3 rounded-2xl',
                      message.type === 'announcement' 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                        : message.userId === currentUser.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                        : 'bg-dark-200/50 text-primary-100'
                    )}>
                      {/* Username and Time */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          'text-xs font-medium',
                          message.userId === currentUser.id ? 'text-primary-100' : 'text-primary-300'
                        )}>
                          {message.username}
                          {message.isOrganizer && ' 👑'}
                        </span>
                        <span className={cn(
                          'text-xs',
                          message.userId === currentUser.id ? 'text-primary-200' : 'text-primary-400'
                        )}>
                          {getMessageTime(message.timestamp)}
                        </span>
                      </div>

                      {/* Message Text */}
                      <p className="text-sm leading-relaxed">{message.message}</p>

                      {/* Message Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex items-center space-x-1">
                              {message.reactions.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => handleReaction(message.id, reaction.emoji)}
                                  className={cn(
                                    'flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all',
                                    reaction.users.includes(currentUser.id)
                                      ? 'bg-primary-500/30 text-primary-200'
                                      : 'bg-dark-200/30 text-primary-300 hover:bg-dark-200/50'
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        {message.userId !== currentUser.id && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-1 rounded-full hover:bg-dark-200/30 transition-colors"
                            >
                              <Reply className="w-3 h-3 text-primary-400" />
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, '👍')}
                              className="p-1 rounded-full hover:bg-dark-200/30 transition-colors"
                            >
                              <Heart className="w-3 h-3 text-primary-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current User Avatar */}
                  {message.userId === currentUser.id && (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Context */}
      {replyingTo && (
        <motion.div
          className="px-4 py-2 bg-dark-200/30 border-t border-primary-400/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">
                Replying to <span className="font-medium text-primary-200">{replyingTo.username}</span>
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-primary-400 hover:text-primary-300"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-primary-400 truncate mt-1 ml-6">
            {replyingTo.message}
          </p>
        </motion.div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-primary-400/20">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            
            {/* Quick Emoji Reactions */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {basketballEmojis.slice(0, 3).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewMessage(prev => prev + emoji)}
                  className="text-lg hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <GameButton
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            icon={<Send className="w-4 h-4" />}
          />
        </div>

        {/* Quick Reactions */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-primary-400">Quick:</span>
          {basketballEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setNewMessage(prev => prev + emoji)}
              className="text-lg hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
