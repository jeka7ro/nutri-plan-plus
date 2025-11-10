import React, { useState } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X, UserPlus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "./LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { ro, enUS } from "date-fns/locale";

export default function NotificationBell() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Get user subscription plan
  React.useEffect(() => {
    localApi.auth.me()
      .then(userData => {
        console.log('🔔 NotificationBell user:', userData);
        setUser(userData);
      })
      .catch((error) => {
        console.error('❌ NotificationBell user error:', error);
      });
  }, []);

  // Hide for FREE users
  if (user && user.subscription_plan === 'free') {
    console.log('🔔 Hidden for FREE user');
    return null;
  }
  
  // Show loading state sau show bell chiar dacă user e null (după refresh)
  if (!user) {
    console.log('🔔 User not loaded yet, showing bell anyway');
    // return null; // NU ascunde, așteaptă să se încarce
  }

  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['notificationsUnread'],
    queryFn: async () => {
      try {
        const result = await localApi.notifications.getUnreadCount();
        console.log('🔔 Unread count:', result);
        return result;
      } catch (error) {
        console.error('❌ Unread count error:', error);
        return { count: 0 };
      }
    },
    refetchInterval: 30000, // Refresh la fiecare 30 secunde
    enabled: !!user && user.subscription_plan === 'premium',
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const result = await localApi.notifications.list();
        console.log('🔔 Notifications list:', result);
        return result;
      } catch (error) {
        console.error('❌ Notifications list error:', error);
        return [];
      }
    },
    enabled: isOpen && !!user && user.subscription_plan === 'premium',
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => localApi.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsUnread']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => localApi.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsUnread']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  // Friend request mutations - Accept/Decline direct din NotificationBell!
  const acceptRequestMutation = useMutation({
    mutationFn: async ({ requestId, notificationId }) => {
      console.log('✅ ACCEPT request:', { requestId, notificationId });
      await localApi.friends.acceptRequest(requestId);
      await localApi.notifications.markAsRead(notificationId);
    },
    onSuccess: () => {
      console.log('✅ Friend request ACCEPTED! Refreshing...');
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationsUnread']);
      setIsOpen(false); // AUTO-CLOSE dropdown după accept!
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, notificationId }) => {
      console.log('❌ REJECT request:', { requestId, notificationId });
      await localApi.friends.rejectRequest(requestId);
      await localApi.notifications.markAsRead(notificationId);
    },
    onSuccess: () => {
      console.log('❌ Friend request REJECTED! Refreshing...');
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationsUnread']);
      setIsOpen(false); // AUTO-CLOSE dropdown după refuză!
    },
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'friend_accepted':
        return <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'friend_rejected':
        return <X className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'recipe_shared':
        return <ChefHat className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const handleBellClick = () => {
    console.log('🔔 Bell clicked! Opening:', !isOpen, 'Unread:', unreadCount.count, 'User:', user?.email);
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* BELL BUTTON - MOBIL FRIENDLY! */}
      <button
        className="relative inline-flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[rgb(var(--ios-text-primary))]" />
        {unreadCount.count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount.count > 9 ? '9+' : unreadCount.count}
          </span>
        )}
      </button>

      {/* NOTIFICATIONS DIALOG - MOBIL PERFECT! */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                🔔 {language === 'ro' ? 'Notificări' : 'Notifications'}
                {unreadCount.count > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount.count}</Badge>
                )}
              </span>
              {unreadCount.count > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs"
                >
                  {language === 'ro' ? 'Citește toate' : 'Mark all'}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !notification.is_read 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
                      : 'bg-[rgb(var(--ios-bg-tertiary))] border-[rgb(var(--ios-border))]'
                  } ${notification.type !== 'friend_request' ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={() => notification.type !== 'friend_request' && handleNotificationClick(notification)}
                >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--ios-text-primary))] mb-1 font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: language === 'ro' ? ro : enUS 
                      })}
                    </p>
                    
                    {/* FRIEND REQUEST - Accept/Decline buttons MOBIL OPTIMIZAT */}
                    {notification.type === 'friend_request' && notification.related_recipe_id && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('✅ ACCEPT clicked!', notification.related_recipe_id);
                            acceptRequestMutation.mutate({ 
                              requestId: notification.related_recipe_id, 
                              notificationId: notification.id 
                            });
                          }}
                          disabled={acceptRequestMutation.isPending || rejectRequestMutation.isPending}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {language === 'ro' ? 'Acceptă' : 'Accept'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('❌ REJECT clicked!', notification.related_recipe_id);
                            rejectRequestMutation.mutate({ 
                              requestId: notification.related_recipe_id, 
                              notificationId: notification.id 
                            });
                          }}
                          disabled={acceptRequestMutation.isPending || rejectRequestMutation.isPending}
                          className="flex-1 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium py-3 px-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {language === 'ro' ? 'Refuză' : 'Decline'}
                        </button>
                      </div>
                    )}
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[rgb(var(--ios-text-tertiary))]">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-medium">
                  {language === 'ro' ? 'Nicio notificare' : 'No notifications'}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

