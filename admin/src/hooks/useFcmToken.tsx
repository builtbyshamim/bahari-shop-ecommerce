import { useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';
import { getFirebaseMessaging } from '../lib/firebase';
import { authApi } from '../redux/api/authApi';
import { store } from '../redux/store';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;

/**
 * Initialises Firebase Cloud Messaging for the admin dashboard.
 * - Requests browser notification permission.
 * - Retrieves the FCM device token and saves it to the backend.
 * - Listens for foreground messages and shows a toast.
 *
 * Call this hook inside a component that only renders when the admin is logged in
 * (e.g. MainLayout).
 */
export function useFcmToken(isLoggedIn: boolean) {
  const initialised = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || initialised.current) return;
    if (!('Notification' in window) || !VAPID_KEY) return;

    initialised.current = true;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const init = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Wait for firebase-messaging-sw.js to become active.
        // It may be in 'installing' or 'waiting' if a previous SW held the scope.
        await new Promise<void>((resolve) => {
          const sw = swReg.installing ?? swReg.waiting;
          if (!sw) return resolve(); // already active
          sw.addEventListener('statechange', function handler() {
            if (sw.state === 'activated') {
              sw.removeEventListener('statechange', handler);
              resolve();
            }
          });
        });

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          localStorage.setItem('fcm_token', token);
          await store.dispatch(authApi.endpoints.saveFcmToken.initiate({ fcmToken: token }));
        }
      } catch (err) {
        console.error('FCM init error:', err);
      }
    };

    void init();

    // Foreground message handler — shows a toast when the tab is open
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      toast(
        (t) => (
          <div onClick={() => toast.dismiss(t.id)} style={{ cursor: 'pointer' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{title}</p>
            {body && <p style={{ margin: '4px 0 0', fontSize: 13 }}>{body}</p>}
          </div>
        ),
        { duration: 6000 },
      );
    });

    return () => unsubscribe();
  }, [isLoggedIn]);
}
