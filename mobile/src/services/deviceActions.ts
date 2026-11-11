import { Linking, Platform, Share } from 'react-native';
import { Directive } from './commands';

/**
 * Executes authorized directives ON THE DEVICE.
 *
 * Phase 2 implements everything achievable with React Native's built-ins
 * (deep links, dialer, SMS composer, share sheet). Actions that genuinely need
 * a native module (flashlight, battery, alarms, reminders, contacts,
 * notifications, camera) return `{ success:false }` with an honest reason and
 * are wired up in Phase 3 (android/ Kotlin, ios/ Swift). No action ever returns
 * a fake success.
 */

export type ActionResult = { success: boolean; detail: string };

const NEEDS_NATIVE = (what: string): ActionResult => ({
  success: false,
  detail: `${what} needs the native module added in Phase 3.`,
});

/** Permission strings the current (JS-only) layer can actually satisfy. */
export function currentPermissions(): string[] {
  // Dialer / SMS composer open via deep links without a runtime permission.
  return ['phone.call', 'messages.compose'];
}

async function openUrl(url: string): Promise<ActionResult> {
  const ok = await Linking.canOpenURL(url).catch(() => false);
  if (!ok) return { success: false, detail: `Nothing can open ${url}.` };
  await Linking.openURL(url);
  return { success: true, detail: `Opened ${url}` };
}

export const deviceActions = {
  async run(d: Directive): Promise<ActionResult> {
    const p = d.params as Record<string, string>;
    switch (d.name) {
      case 'open_url':
        return openUrl(String(p.url ?? ''));

      case 'open_app':
        return openUrl(String(p.app ?? ''));

      case 'open_navigation': {
        const q = encodeURIComponent(String(p.destination ?? ''));
        const url =
          Platform.OS === 'ios'
            ? `http://maps.apple.com/?daddr=${q}`
            : `google.navigation:q=${q}`;
        return openUrl(url);
      }

      case 'place_call':
        return openUrl(`tel:${String(p.recipient ?? '')}`);

      case 'draft_message': {
        const sep = Platform.OS === 'ios' ? '&' : '?';
        const body = encodeURIComponent(String(p.body ?? ''));
        return openUrl(`sms:${String(p.recipient ?? '')}${sep}body=${body}`);
      }

      case 'share_content':
        await Share.share({ message: String(p.content ?? '') });
        return { success: true, detail: 'Opened the share sheet.' };

      case 'device_setting':
        await Linking.openSettings();
        return { success: true, detail: 'Opened settings.' };

      // --- Require a native module (Phase 3) ---
      case 'flashlight':
        return NEEDS_NATIVE('Flashlight');
      case 'battery_status':
        return NEEDS_NATIVE('Battery status');
      case 'launch_camera':
        return NEEDS_NATIVE('Camera launch');
      case 'set_alarm':
        return NEEDS_NATIVE('Setting alarms');
      case 'set_reminder':
        return NEEDS_NATIVE('Reminders');
      case 'read_contacts':
        return NEEDS_NATIVE('Reading contacts');
      case 'read_notifications':
        return NEEDS_NATIVE('Reading notifications');

      default:
        return { success: false, detail: `No handler for ${d.name}.` };
    }
  },
};
