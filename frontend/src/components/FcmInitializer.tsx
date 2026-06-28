'use client';

import { useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';
import { getFirebaseMessaging } from '@/lib/firebase';
import { store } from '@/redux/store';
import { userApi } from '@/redux/api/userApi';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
export default function FcmInitializer() {
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
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
          // Persist to backend — silently ignored if user is not authenticated yet
          await store.dispatch(userApi.endpoints.saveFcmToken.initiate({ fcmToken: token }));
        }
      } catch (err) {
        console.error('FCM init error:', err);
      }
    };

    void init();

    // Foreground message handler — show a toast when the browser tab is active
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Ekmars';
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
  }, []);

  return null;
}
