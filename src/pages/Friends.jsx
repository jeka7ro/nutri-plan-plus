import React, { useState } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Search,
  Trash2,
  Clock,
  TrendingDown,
  TrendingUp,
  Flame,
  Award
} from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import Paywall from "../components/Paywall";

export default function FriendsNew() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState("");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Get user info
  React.useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  // Check if FREE user
  if (user && user.subscription_plan === 'free') {
    return (
      <Paywall 
        title={language === 'ro' ? '👥 Prieteni - Premium Feature' : '👥 Friends - Premium Feature'}
        description={language === 'ro' 
          ? 'Conectează-te cu prieteni, partajează rețete și urmărește progresul împreună!' 
          : 'Connect with friends, share recipes and track progress together!'}
        feature="friends"
      />
    );
  }

  // Fetch friends list
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: () => localApi.friends.list(),
  });

  // Fetch friend requests
  const { data: requests = { received: [], sent: [] }, isLoading: loadingRequests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => localApi.friends.getRequests(),
  });

  // Fetch friends progress (PRIVACY: doar % weight loss, NU kg absolute!)
  const { data: friendsProgress = [], isLoading: loadingProgress } = useQuery({
    queryKey: ['friendsProgress'],
    queryFn: async () => {
      try {
        console.log('📊 Fetching friends progress...');
        console.log('📊 Current friends count:', friends.length);
        console.log('📊 User plan:', user?.subscription_plan);
        const result = await localApi.friends.getProgress();
        console.log('📊 Friends progress result:', result);
        console.log('📊 Progress array length:', result?.length);
        return result || [];
      } catch (error) {
        console.error('❌ Friends progress error:', error);
        return [];
      }
    },
    enabled: !!user && friends.length > 0, // REMOVED subscription_plan check - SHOW pentru toți!
    refetchInterval: 60000, // Refresh la fiecare 60 sec
  });

  // Search users mutation
  const searchMutation = useMutation({
    mutationFn: (email) => localApi.friends.search(email),
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (friendEmail) => localApi.friends.sendRequest(friendEmail),
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests']);
      toast({
        title: language === 'ro' ? "Cerere trimisă!" : "Request sent!",
        description: language === 'ro' ? "Cererea de prietenie a fost trimisă." : "Friend request was sent.",
      });
      setSearchEmail("");
      searchMutation.reset();
    },
    onError: (error) => {
      toast({
        title: language === 'ro' ? "Eroare" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: (requestId) => localApi.friends.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['friends']);
      toast({
        title: language === 'ro' ? "Cerere acceptată!" : "Request accepted!",
        description: language === 'ro' ? "Acum sunteți prieteni!" : "You are now friends!",
      });
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId) => localApi.friends.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests']);
      toast({
        title: language === 'ro' ? "Cerere refuzată" : "Request rejected",
      });
    },
  });

  // Remove friend mutation
  const removeMutation = useMutation({
    mutationFn: (friendshipId) => localApi.friends.remove(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      toast({
        title: language === 'ro' ? "Prieten șters" : "Friend removed",
      });
    },
  });

  const handleSearch = () => {
    if (!searchEmail.trim()) return;
    searchMutation.mutate(searchEmail);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            {language === 'ro' ? 'Prieteni' : 'Friends'}
          </h1>
          <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
            {language === 'ro' 
              ? 'Conectează-te cu prietenii și partajați rețete' 
              : 'Connect with friends and share recipes'}
          </p>
        </div>

        {/* Search Section */}
        <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {language === 'ro' ? '🔍 Caută Prieteni' : '🔍 Search Friends'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="email@exemplu.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Search className="w-4 h-4 mr-2" />
                {language === 'ro' ? 'Caută' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchMutation.data && (
              <div className="space-y-2">
                {searchMutation.data.map((user) => (
                  <div key={user.id} className="p-4 bg-[rgb(var(--ios-bg-tertiary))] rounded-[14px] border border-[rgb(var(--ios-border))]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.profile_picture ? (
                          <img 
                            src={user.profile_picture} 
                            alt={user.first_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.first_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                          </div>
                          <div className="text-sm text-[rgb(var(--ios-text-secondary))]">{user.email}</div>
                        </div>
                      </div>
                      
                      {user.status === 'friends' && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <Check className="w-3 h-3 mr-1" />
                          {language === 'ro' ? 'Prieten' : 'Friend'}
                        </Badge>
                      )}
                      
                      {user.status === 'pending_sent' && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {language === 'ro' ? 'În așteptare' : 'Pending'}
                        </Badge>
                      )}
                      
                      {user.status === 'pending_received' && (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                          {language === 'ro' ? 'Cerere primită' : 'Request received'}
                        </Badge>
                      )}
                      
                      {user.status === 'none' && (
                        <Button
                          size="sm"
                          onClick={() => sendRequestMutation.mutate(user.email)}
                          disabled={sendRequestMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {language === 'ro' ? 'Adaugă' : 'Add'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchMutation.isError && (
              <div className="text-center py-4 text-red-600 dark:text-red-400">
                {language === 'ro' ? 'Niciun utilizator găsit' : 'No user found'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friend Requests PRIMITE */}
        {requests.received.length > 0 && (
          <Card className="ios-card ios-shadow-lg rounded-[20px] border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <UserPlus className="w-5 h-5" />
                📬 {language === 'ro' ? `Cereri Primite (${requests.received.length})` : `Received Requests (${requests.received.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.received.map((req) => (
                <div key={req.id} className="p-4 bg-white dark:bg-gray-800 rounded-[14px] border border-blue-300 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {req.profile_picture ? (
                        <img 
                          src={req.profile_picture} 
                          alt={req.first_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {req.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                          {req.first_name && req.last_name ? `${req.first_name} ${req.last_name}` : req.email}
                        </div>
                        <div className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                          {format(new Date(req.created_at), 'PPp', { locale: ro })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* BUTOANE PE RÂND SEPARAT - NU SUPRAPUSE! */}
                  <div className="flex gap-3 mt-4 w-full">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('✅ ACCEPT friend request:', req.id);
                        acceptMutation.mutate(req.id);
                      }}
                      disabled={acceptMutation.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {language === 'ro' ? 'Acceptă' : 'Accept'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('❌ REJECT friend request:', req.id);
                        rejectMutation.mutate(req.id);
                      }}
                      disabled={rejectMutation.isPending}
                      className="flex-1 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium py-3 px-4 rounded-xl disabled:opacity-50 transition-all active:scale-95 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      {language === 'ro' ? 'Refuză' : 'Decline'}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Cereri TRIMISE */}
        {requests.sent.length > 0 && (
          <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                📤 {language === 'ro' ? `Cereri Trimise (${requests.sent.length})` : `Sent Requests (${requests.sent.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.sent.map((req) => (
                <div key={req.id} className="p-4 bg-[rgb(var(--ios-bg-tertiary))] rounded-[14px] border border-[rgb(var(--ios-border))]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {req.profile_picture ? (
                        <img 
                          src={req.profile_picture} 
                          alt={req.first_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {req.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[rgb(var(--ios-text-primary))] text-sm">
                          {req.first_name && req.last_name ? `${req.first_name} ${req.last_name}` : req.email}
                        </div>
                        <div className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                          ⏳ {language === 'ro' ? 'În așteptare...' : 'Pending...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Prietenii MEI */}
        <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              👥 {language === 'ro' ? `Prietenii Mei (${friends.length})` : `My Friends (${friends.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div key={friend.id} className="p-4 bg-[rgb(var(--ios-bg-tertiary))] rounded-[14px] border border-[rgb(var(--ios-border))]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {friend.profile_picture ? (
                        <img 
                          src={friend.profile_picture} 
                          alt={friend.first_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold">
                            {friend.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                          {friend.first_name && friend.last_name ? `${friend.first_name} ${friend.last_name}` : friend.email}
                        </div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">{friend.email}</div>
                        <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                          {language === 'ro' ? 'Prieten din' : 'Friends since'} {format(new Date(friend.created_at), 'dd MMM yyyy', { locale: ro })}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMutation.mutate(friend.id)}
                      disabled={removeMutation.isPending}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[rgb(var(--ios-text-tertiary))]">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Încă nu ai prieteni' : 'No friends yet'}
                </p>
                <p className="text-sm mt-2">
                  {language === 'ro' ? 'Caută utilizatori și trimite cereri de prietenie!' : 'Search for users and send friend requests!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FRIEND PROGRESS - Progresul Prietenilor (PRIVACY: doar % weight loss!) */}
        {friends.length > 0 && (
          <Card className="ios-card ios-shadow-lg rounded-[20px] border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                <Flame className="w-5 h-5 text-orange-500" />
                📊 {language === 'ro' ? 'Progresul Prietenilor' : 'Friends Progress'}
              </CardTitle>
              <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-2">
                {language === 'ro' 
                  ? '🔒 Privat: Vezi doar procentul de pierdere, nu kilograme absolute.' 
                  : '🔒 Private: See only % loss, not absolute weight.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProgress ? (
                <div className="text-center py-8 text-[rgb(var(--ios-text-tertiary))]">
                  {language === 'ro' ? 'Se încarcă progres...' : 'Loading progress...'}
                </div>
              ) : friendsProgress.length > 0 ? (
                friendsProgress.map((friend) => (
                  <div key={friend.id} className="p-4 bg-white dark:bg-gray-800 rounded-[16px] border border-emerald-300 dark:border-emerald-700 shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {friend.profile_picture ? (
                          <img 
                            src={friend.profile_picture} 
                            alt={friend.first_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {friend.first_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[rgb(var(--ios-text-primary))]">
                            {friend.first_name && friend.last_name ? `${friend.first_name} ${friend.last_name}` : friend.email}
                          </div>
                          <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-0.5">
                            {language === 'ro' ? 'Progres ultimele 7 zile' : 'Last 7 days progress'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {friend.weight_loss_percent !== null && friend.weight_loss_percent !== undefined ? (
                          <Badge className={`${friend.weight_loss_percent > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} text-lg font-bold px-3 py-1`}>
                            {friend.weight_loss_percent > 0 ? <TrendingDown className="w-4 h-4 mr-1 inline" /> : <TrendingUp className="w-4 h-4 mr-1 inline" />}
                            {Math.abs(friend.weight_loss_percent).toFixed(1)}%
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-sm">
                            {language === 'ro' ? 'Fără date' : 'No data'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-[rgb(var(--ios-text-secondary))]">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span>
                          {language === 'ro' ? 'Mese' : 'Meals'}: <strong>{friend.meals_completed || 0}</strong>/35
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[rgb(var(--ios-text-secondary))]">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>
                          {language === 'ro' ? 'Calorii' : 'Calories'}: <strong>{friend.calories_burned || 0}</strong>
                        </span>
                      </div>
                    </div>
                    {friend.recent_recipes && friend.recent_recipes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                        <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mb-2">
                          {language === 'ro' ? '🍽️ Rețete recente:' : '🍽️ Recent recipes:'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {friend.recent_recipes.slice(0, 3).map((recipe, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {recipe.name_ro && language === 'ro' ? recipe.name_ro : recipe.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[rgb(var(--ios-text-tertiary))]">
                  <Flame className="w-16 h-16 mx-auto mb-4 opacity-30 text-orange-500" />
                  <p className="font-medium text-[rgb(var(--ios-text-secondary))]">
                    {language === 'ro' ? 'Progresul prietenilor va apărea aici' : 'Friends progress will appear here'}
                  </p>
                  <p className="text-sm mt-2">
                    {language === 'ro' ? 'Prietenii tăi încă nu au progres înregistrat.' : 'Your friends don\'t have recorded progress yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

