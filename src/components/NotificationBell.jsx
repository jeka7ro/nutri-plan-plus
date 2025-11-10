import React, { useState } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X, UserPlus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  // Hide for FREE users
  if (user && user.subscription_plan === 'free') {
    return null;
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="w-5 h-5 text-[rgb(var(--ios-text-primary))]" />
          {unreadCount.count > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount.count > 9 ? '9+' : unreadCount.count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[rgb(var(--ios-text-primary))]">
              🔔 {language === 'ro' ? 'Notificări' : 'Notifications'} 
              {unreadCount.count > 0 && ` (${unreadCount.count})`}
            </h3>
            {unreadCount.count > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs"
              >
                {language === 'ro' ? 'Citește toate' : 'Mark all read'}
              </Button>
            )}
          </div>
        </div>

        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-3 w-full">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[rgb(var(--ios-text-primary))] mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                    {formatDistanceToNow(new Date(notification.created_at), { 
                      addSuffix: true, 
                      locale: language === 'ro' ? ro : enUS 
                    })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-8 text-center text-[rgb(var(--ios-text-tertiary))]">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {language === 'ro' ? 'Nicio notificare' : 'No notifications'}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

