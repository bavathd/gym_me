import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const SYSTEM_CHANNEL = 'system-default';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const ensurePermissions = async (): Promise<boolean> => {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return !!req.granted;
};

export const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(SYSTEM_CHANNEL, {
    name: 'System Notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 120, 60, 240],
    lightColor: '#00D4FF',
  });
};

type DailyTrigger = {
  hour: number;
  minute: number;
};

const dailyTrigger = (t: DailyTrigger): Notifications.NotificationTriggerInput =>
  ({
    hour: t.hour,
    minute: t.minute,
    repeats: true,
    channelId: SYSTEM_CHANNEL,
  }) as Notifications.NotificationTriggerInput;

/**
 * Schedules the 23:00 "incomplete" warning + 00:00 penalty/reset notice.
 * Idempotent — cancels any prior system notifications first.
 */
export const scheduleDailyNotifications = async () => {
  const granted = await ensurePermissions();
  if (!granted) return;
  await ensureAndroidChannel();

  // Wipe any prior identified schedules.
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((n) => n.identifier.startsWith('sl-'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  await Notifications.scheduleNotificationAsync({
    identifier: 'sl-warning-23',
    content: {
      title: 'Warning',
      body: 'Daily Quest incomplete. 1 hour remaining before penalty.',
      sound: 'default',
    },
    trigger: dailyTrigger({ hour: 23, minute: 0 }),
  });

  await Notifications.scheduleNotificationAsync({
    identifier: 'sl-midnight-00',
    content: {
      title: 'Quest Reset',
      body: 'A new Daily Quest has been issued. Check the System panel.',
      sound: 'default',
    },
    trigger: dailyTrigger({ hour: 0, minute: 0 }),
  });
};

export const cancelAllSystemNotifications = async () => {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((n) => n.identifier.startsWith('sl-'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
};
