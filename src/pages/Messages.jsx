import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
const base44 = localApi;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

export default function Messages() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const friendEmail = params.get('friend');
    if (friendEmail) {
      setSelectedFriend(friendEmail);
    }
  }, []);

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships'],
    queryFn: async () => {
      if (!user) return [];
      const sent = await base44.entities.Friendship.filter({
        sender_email: user.email,
        status: 'accepted'
      });
      const received = await base44.entities.Friendship.filter({
        receiver_email: user.email,
        status: 'accepted'
      });
      return [...sent, ...received];
    },
    enabled: !!user,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => localApi.users.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedFriend],
    queryFn: async () => {
      if (!user || !selectedFriend) return [];
      const sent = await base44.entities.Message.filter({
        sender_email: user.email,
        receiver_email: selectedFriend
      }, '-created_date');
      const received = await base44.entities.Message.filter({
        sender_email: selectedFriend,
        receiver_email: user.email
      }, '-created_date');
      return [...sent, ...received].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
    },
    enabled: !!user && !!selectedFriend,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.Message.create({
        sender_email: user.email,
        receiver_email: selectedFriend,
        content,
        read: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessageText("");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return await base44.entities.Message.update(messageId, { read: true });
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(msg => {
        if (msg.receiver_email === user?.email && !msg.read) {
          markAsReadMutation.mutate(msg.id);
        }
      });
    }
  }, [messages, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const getFriendEmail = (friendship) => {
    return friendship.sender_email === user?.email 
      ? friendship.receiver_email 
      : friendship.sender_email;
  };

  const getFriendData = (email) => {
    return allUsers.find(u => u.email === email);
  };

  const getUnreadCount = (friendEmail) => {
    return messages.filter(m => 
      m.sender_email === friendEmail && 
      m.receiver_email === user?.email && 
      !m.read
    ).length;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('myMessages')}</h1>
          <p className="text-gray-500 mt-1">{t('chatWithFriends')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Friends List */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                {t('friends')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {friendships.map((friendship) => {
                const friendEmail = getFriendEmail(friendship);
                const friendData = getFriendData(friendEmail);
                const unreadCount = getUnreadCount(friendEmail);
                
                return (
                  <div
                    key={friendship.id}
                    onClick={() => setSelectedFriend(friendEmail)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedFriend === friendEmail
                        ? 'bg-emerald-100 border-2 border-emerald-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center relative">
                        <span className="text-white font-bold text-sm">
                          {friendData?.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {friendData?.full_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {friendEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 border-none shadow-xl">
            {selectedFriend ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {getFriendData(selectedFriend)?.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {getFriendData(selectedFriend)?.full_name}
                      </div>
                      <div className="text-sm text-gray-500">{selectedFriend}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => {
                      const isOwn = message.sender_email === user?.email;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${
                              isOwn ? 'text-emerald-100' : 'text-gray-500'
                            }`}>
                              {format(new Date(message.created_date), 'HH:mm', { locale: ro })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSend} className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={t('typeMessage')}
                        className="flex-1"
                      />
                      <Button type="submit" className="bg-emerald-600">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center py-20">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>{t('selectConversation')}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}