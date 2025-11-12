import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
import { api as base44 } from "@/api/apiAdapter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Check, X, MessageCircle, TrendingDown, Search } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from "date-fns";

export default function Friends() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Friendship.filter({
        receiver_email: user.email,
        status: 'pending'
      });
    },
    enabled: !!user,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Friendship.filter({
        sender_email: user.email,
        status: 'pending'
      });
    },
    enabled: !!user,
  });

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

  const sendRequestMutation = useMutation({
    mutationFn: async (receiverEmail) => {
      return await base44.entities.Friendship.create({
        sender_email: user.email,
        receiver_email: receiverEmail,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sentRequests']);
      setSearchEmail("");
      setSearchedUser(null);
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      return await base44.entities.Friendship.update(requestId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['friendships']);
    },
  });

  const handleSearch = () => {
    const found = allUsers.find(u => u.email === searchEmail && u.email !== user?.email);
    setSearchedUser(found || null);
  };

  const getFriendEmail = (friendship) => {
    return friendship.sender_email === user?.email 
      ? friendship.receiver_email 
      : friendship.sender_email;
  };

  const getFriendData = (email) => {
    return allUsers.find(u => u.email === email);
  };

  const { data: friendProgress } = useQuery({
    queryKey: ['friendProgress', selectedFriend],
    queryFn: async () => {
      if (!selectedFriend) return null;
      const weights = await base44.entities.WeightEntry.filter({
        created_by: selectedFriend
      }, '-date', 14);
      return weights;
    },
    enabled: !!selectedFriend,
  });

  const isAlreadyFriend = (email) => {
    return friendships.some(f => getFriendEmail(f) === email);
  };

  const hasPendingRequest = (email) => {
    return sentRequests.some(r => r.receiver_email === email);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('myFriends')}</h1>
          <p className="text-gray-500 mt-1">{t('findConnect')}</p>
        </div>

        {/* Search Users */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              {t('searchUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="user@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-emerald-600">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {searchedUser && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {searchedUser.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{searchedUser.full_name}</div>
                      <div className="text-sm text-gray-600">{searchedUser.email}</div>
                    </div>
                  </div>
                  {isAlreadyFriend(searchedUser.email) ? (
                    <Button variant="outline" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      {t('friends')}
                    </Button>
                  ) : hasPendingRequest(searchedUser.email) ? (
                    <Button variant="outline" disabled>
                      {t('pending')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => sendRequestMutation.mutate(searchedUser.email)}
                      className="bg-emerald-600"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('sendRequest')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {t('friendRequests')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {friendRequests.map((request) => {
                const senderData = getFriendData(request.sender_email);
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {senderData?.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{senderData?.full_name}</div>
                        <div className="text-sm text-gray-600">{request.sender_email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                        className="bg-emerald-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {t('accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'declined' })}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {t('decline')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {t('friendsList')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {friendships.length > 0 ? (
                friendships.map((friendship) => {
                  const friendEmail = getFriendEmail(friendship);
                  const friendData = getFriendData(friendEmail);
                  return (
                    <div 
                      key={friendship.id} 
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedFriend === friendEmail 
                          ? 'bg-emerald-50 border-emerald-300' 
                          : 'bg-white border-gray-200 hover:border-emerald-200'
                      }`}
                      onClick={() => setSelectedFriend(friendEmail)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {friendData?.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{friendData?.full_name}</div>
                            <div className="text-sm text-gray-600">{friendEmail}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={createPageUrl("Messages") + "?friend=" + friendEmail}>
                              <MessageCircle className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFriend(friendEmail);
                            }}
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">{t('noFriends')}</p>
                  <p className="text-sm">{t('startSearching')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friend Progress */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-purple-600" />
                {t('viewProgress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFriend && friendProgress ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      {getFriendData(selectedFriend)?.full_name}
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {friendProgress[0]?.weight || '-'} kg
                    </div>
                  </div>
                  {friendProgress.length > 1 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={friendProgress.slice().reverse().map(entry => ({
                        date: format(new Date(entry.date), 'dd/MM'),
                        weight: entry.weight
                      }))}>
                        <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#9333ea" 
                          strokeWidth={3}
                          dot={{ fill: '#9333ea', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>{t('selectConversation')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}