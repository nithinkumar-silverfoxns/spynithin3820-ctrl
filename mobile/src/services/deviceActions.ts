import { Linking, Platform, Share } from 'react-native';
import { hasNative, JarvisNative } from '../../modules/jarvis-native';
import { Directive } from './commands';

/**
 * Executes authorized directives ON THE DEVICE.
 *
 * When the native module is present (custom dev/prod build) it performs real
 * actions — torch, battery, camera, alarms, reminders — in Kotlin/Swift. In
 * Expo Go (no native module) those fall back to RN built-ins where possible, or
 * return an honest "needs the native build" message. No action ever fakes
 * success.
 */

export type ActionResult = { success: boolean; detail: string };

const needsBuild = (what: string): ActionResult => ({
  success: false,
  detail: `${what} needs the native build (run "npx expo prebuild && npx expo run:…").`,
});

const unsupported = (what: string): ActionResult => ({
  success: false,
  detail: `${what} isn't available on ${Platform.OS}; try a Shortcut.`,
});

/** Permission strings this layer can satisfy right now. */
export function currentPermissions(): string[] {
  const base = ['phone.call', 'messages.compose']; // deep links, no runtime perm
  if (hasNative) base.push('camera.torch', 'camera', 'alarms', 'reminders');
  return base;
}

async function openUrl(url: string): Promise<ActionResult> {
  const ok = await Linking.canOpenURL(url).catch(() => false);
  if (!ok) return { success: false, detail: `Nothing can open ${url}.` };
  await Linking.openURL(url);
  return { success: true, detail: `Opened ${url}` };
}

/** Parse "7am" / "7:30 pm" / "15:00" into {hour, minute}. */
function parseTime(s: string): { hour: number; minute: number } | null {
  const m = s.trim().toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  if (m[3] === 'pm' && hour < 12) hour += 12;
  if (m[3] === 'am' && hour === 12) hour = 0;
  return { hour, minute };
}

export const deviceActions = {
  async run(d: Directive): Promise<ActionResult> {
    const p = d.params as Record<string, string>;
    try {
      switch (d.name) {
        case 'open_url':
          return openUrl(String(p.url ?? ''));

        case 'open_app':
          if (JarvisNative) {
            await JarvisNative.openApp(String(p.app ?? ''));
            return { success: true, detail: `Opened ${p.app}` };
          }
          return openUrl(String(p.app ?? ''));

        case 'open_navigation': {
          const q = encodeURIComponent(String(p.destination ?? ''));
          const url = Platform.OS === 'ios' ? `http://maps.apple.com/?daddr=${q}` : `google.navigation:q=${q}`;
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

        case 'flashlight':
          if (!JarvisNative) return needsBuild('Flashlight');
          await JarvisNative.setTorch(String(p.on) === 'true' || (p.on as unknown) === true);
          return { success: true, detail: `Flashlight ${p.on ? 'on' : 'off'}.` };

        case 'battery_status': {
          if (!JarvisNative) return needsBuild('Battery status');
          const b = await JarvisNative.getBattery();
          return { success: true, detail: `Battery ${b.level}%${b.charging ? ', charging' : ''}.` };
        }

        case 'launch_camera':
          if (!JarvisNative) return needsBuild('Camera launch');
          await JarvisNative.launchCamera();
          return { success: true, detail: 'Opened the camera.' };

        case 'set_alarm': {
          if (!JarvisNative) return needsBuild('Setting alarms');
          const t = parseTime(String(p.time ?? ''));
          if (!t) return { success: false, detail: "I couldn't understand that time." };
          await JarvisNative.setAlarm(t.hour, t.minute, String(p.label ?? 'JARVIS alarm'));
          return { success: true, detail: `Alarm set for ${p.time}.` };
        }

        case 'set_reminder':
          if (!JarvisNative) return needsBuild('Reminders');
          await JarvisNative.addReminder(String(p.title ?? 'Reminder'), p.due ? String(p.due) : null);
          return { success: true, detail: 'Reminder added.' };

        case 'read_contacts':
          return needsBuild('Reading contacts');
        case 'read_notifications':
          return needsBuild('Reading notifications');

        default:
          return { success: false, detail: `No handler for ${d.name}.` };
      }
    } catch (e: any) {
      if (e?.code === 'UNSUPPORTED') return unsupported(d.name.replace(/_/g, ' '));
      return { success: false, detail: e?.message ?? 'Action failed.' };
    }
  },
};
