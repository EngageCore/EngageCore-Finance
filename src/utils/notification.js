import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { formatAmount, dateFormat } from '@/utils/common';

const notifier = new AWN({});

if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    }
  });
}

export const handleMessage = (t, message, type) => {
  switch (type) {
    case 'info':
      notifier.info(`${t(message)}`);
      break;
    case 'success':
      notifier.success(`${t(message)}`);
      break;
    case 'warning':
      notifier.warning(`${t(message)}`);
      break;
    case 'error':
      notifier.alert(`${t(message)}`);
      break;
    default:
      notifier.tip(`${t(message)}`);
      break;
  }
};

export const handleWebSocketMessage = (data, t) => {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  notificationStore.triggerNotification(data);

  switch (data.type) {
    case 'deposit':
      if (authStore.token) {
        // notifier.info(`New Deposit from ${data.brandCode} - (${data.username}) with amount ${formatAmount(data.amount)}`);
        notifier.info(t('notify_deposit', { brand: data.brandCode, username: data.username, amount: formatAmount(data.amount) }));
        window.dispatchEvent(new Event('refresh-deposit'));
        if (Notification.permission === 'granted') {
          // new Notification(`New Deposit from ${data.brandCode} - (${data.username}) with amount ${formatAmount(data.amount)}`);
          new Notification(t('notify_deposit', { brand: data.brandCode, username: data.username, amount: formatAmount(data.amount) }));
        }
        playNotificationSound();
      }
      break;
    case 'withdrawal':
      if (authStore.token) {
        // notifier.info(`New Withdrawal from ${data.brandCode} - (${data.username}) with amount ${formatAmount(data.amount)}`);
        notifier.info(t('notify_withdrawal', { brand: data.brandCode, username: data.username, amount: formatAmount(data.amount) }));
        window.dispatchEvent(new Event('refresh-withdrawal'));
        if (Notification.permission === 'granted') {
          // new Notification(`New Withdrawal from ${data.brandCode} - (${data.username}) with amount ${formatAmount(data.amount)}`);
          new Notification(t('notify_withdrawal', { brand: data.brandCode, username: data.username, amount: formatAmount(data.amount) }));
        }
        playNotificationSound();
      }
      break;
    case 'take-over':
      if (authStore.token === data.token) {
        // notifier.warning(`Your Transaction (${data.referenceId}) has been taken over by ${data.takeOverBy}`);
        notifier.warning(t('notify_take_over', { reference: data.referenceId, takeOverBy: data.takeOverBy }));
        if (Notification.permission === 'granted') {
          // new Notification(`Your Transaction (${data.referenceId}) has been taken over by others`);
          new Notification(t('notify_take_over', { reference: data.referenceId, takeOverBy: data.takeOverBy }));
        }
        playNotificationSound();
      }
      break;
    case 'register':
      if (authStore.token) {
        notifier.info(t('notify_register', { brand: data.brandCode, username: data.username }));
        window.dispatchEvent(new Event('refresh-register'));
        if (Notification.permission === 'granted') {
          new Notification(t('notify_register', { brand: data.brandCode, username: data.username }));
        }
        playNotificationSound();
      }
      break;
    case 'bankkyc':
      if (authStore.token) {
        notifier.info(t('notify_bankkyc', { username: data.username, createdAt: dateFormat(data.createdAt) }));
        window.dispatchEvent(new Event('refresh-bankkyc'));
        if (Notification.permission === 'granted') {
          new Notification(t('notify_bankkyc', { username: data.username, createdAt: dateFormat(data.createdAt) }));
        }
        playNotificationSound();
      }
      break;
    case 'new-message':
      if (authStore.token) {
        notifier.info(t('notify_new_message', { player: data.username, brand: data.brandName }));
        window.dispatchEvent(new Event('refresh-message'));
        if (Notification.permission === 'granted') {
          new Notification(t('notify_new_message', { player: data.username, brand: data.brandName }));
        }
        playNotificationSound();
      }
      break;
    default:
      break;
  }
};

const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
};
