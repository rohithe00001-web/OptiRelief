import { useState } from 'react';
import { Bell, AlertTriangle, Truck, Users, MapPin, CheckCircle2, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'alert' | 'vehicle' | 'shelter' | 'sos' | 'success';
  title: string;
  message: string;
  location: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Flash Flood Warning',
    message: 'Heavy rainfall expected in next 2 hours',
    location: 'Koramangala, Bangalore',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'sos',
    title: 'New SOS Request',
    message: 'Family of 4 stranded, need evacuation',
    location: 'Indiranagar 100ft Road',
    time: '5 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'vehicle',
    title: 'Vehicle KA-01-MG-7001 Dispatched',
    message: 'En route to MG Road Relief Center',
    location: 'MG Road, Bangalore',
    time: '8 min ago',
    read: false,
  },
  {
    id: '4',
    type: 'shelter',
    title: 'Shelter Capacity Alert',
    message: 'Brigade Road Shelter at 85% capacity',
    location: 'Brigade Road, Bangalore',
    time: '12 min ago',
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Evacuation Complete',
    message: '45 people evacuated successfully',
    location: 'Whitefield, Bangalore',
    time: '18 min ago',
    read: true,
  },
  {
    id: '6',
    type: 'alert',
    title: 'Power Outage Reported',
    message: 'Grid failure in sector, backup activated',
    location: 'Electronic City Phase 1',
    time: '25 min ago',
    read: true,
  },
  {
    id: '7',
    type: 'vehicle',
    title: 'Supply Delivery Completed',
    message: 'Medical supplies delivered to shelter',
    location: 'Trinity Circle Camp',
    time: '32 min ago',
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case 'vehicle':
      return <Truck className="w-4 h-4 text-primary" />;
    case 'shelter':
      return <Users className="w-4 h-4 text-emerald-400" />;
    case 'sos':
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationBg = (type: Notification['type'], read: boolean) => {
  if (read) return 'bg-secondary/30';
  switch (type) {
    case 'alert':
      return 'bg-warning/10 border-l-2 border-warning';
    case 'sos':
      return 'bg-destructive/10 border-l-2 border-destructive';
    case 'success':
      return 'bg-emerald-500/10 border-l-2 border-emerald-500';
    default:
      return 'bg-primary/10 border-l-2 border-primary';
  }
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-secondary/20 transition-colors cursor-pointer ${getNotificationBg(notification.type, notification.read)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className={`text-xs mt-0.5 ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {notification.location}
                        </div>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}