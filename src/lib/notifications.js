/**
 * Request notification permission and schedule daily reminders.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function getNotificationTime() {
  return localStorage.getItem('dj_notification_time') || '20:00';
}

export function setNotificationTime(time) {
  localStorage.setItem('dj_notification_time', time);
  scheduleNotification(time);
}

let notificationTimer = null;

export function scheduleNotification(time) {
  if (notificationTimer) clearTimeout(notificationTimer);

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hours, minutes, 0, 0);

  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  const delay = scheduled.getTime() - now.getTime();

  notificationTimer = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Daily Journal 📝', {
        body: "Time to reflect on your day. How was it?",
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'daily-reminder'
      });
    }
    // Reschedule for tomorrow
    scheduleNotification(time);
  }, delay);
}

export function initNotifications() {
  if (Notification.permission === 'granted') {
    const time = getNotificationTime();
    scheduleNotification(time);
  }
}
