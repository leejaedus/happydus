import { Platform } from 'react-native';

const isTauri = Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window as any).__TAURI_INTERNALS__ !== undefined;

/**
 * Shows a macOS notification when an agent completes its response.
 * Uses Tauri notification plugin in desktop app, Web Notification API in browser.
 * Only shows when the app window is not focused or user is viewing a different session.
 */
export async function showAgentCompleteNotification(sessionName: string, sessionId?: string) {
    console.log(`🔔 [Notification] Called for session: ${sessionName} (${sessionId}), platform: ${Platform.OS}, isTauri: ${isTauri}`);

    if (Platform.OS !== 'web' || typeof window === 'undefined') {
        console.log(`🔔 [Notification] Skipped: not web platform`);
        return;
    }

    // Skip if user is currently viewing this session
    if (sessionId && typeof window !== 'undefined') {
        const pathname = window.location?.pathname || '';
        if (pathname.includes(`/session/${sessionId}`)) {
            console.log(`🔔 [Notification] Skipped: user is viewing this session (${pathname})`);
            return;
        }
    }

    if (isTauri) {
        try {
            const { isPermissionGranted, requestPermission, sendNotification } =
                await import('@tauri-apps/plugin-notification');

            let granted = await isPermissionGranted();
            console.log(`🔔 [Notification] Tauri permission granted: ${granted}`);
            if (!granted) {
                const permission = await requestPermission();
                granted = permission === 'granted';
                console.log(`🔔 [Notification] Tauri permission after request: ${granted} (${permission})`);
            }
            if (granted) {
                console.log(`🔔 [Notification] Sending Tauri notification: ${sessionName}`);
                sendNotification({ title: sessionName, body: 'Agent response complete' });
            }
        } catch (e) {
            console.warn('[Notification] Tauri plugin error:', e);
        }
    } else {
        // Browser: use Web Notification API
        if (typeof Notification === 'undefined') return;

        if (Notification.permission === 'default') {
            Notification.requestPermission();
            return;
        }
        if (Notification.permission !== 'granted') return;

        new Notification(sessionName, {
            body: 'Agent response complete',
            silent: false,
        });
    }
}
