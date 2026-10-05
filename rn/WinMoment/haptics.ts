/* The win moment's haptics. The web calls navigator.vibrate (buzz) at two beats; the app gets three, each mapped
   to the closest system feel through react-native-haptic-feedback (iOS Taptic Engine; Android vibration patterns).

     press   the button is pressed and the charge starts      impactLight   (new in the app: the web has no tap buzz)
     surge   the payoff starts, the liquid goes over the top  soft          (web: buzz(10) in win())
     gain    the gain lands on screen                         notificationSuccess (web: buzz(18) at w = .5)

   The chips bursting at the surface (about .2 and .3s after the gain) get none: three taps inside half a second
   after a success notification blur into a rattle, and the success is the beat that should stand out. */
import HapticFeedback from 'react-native-haptic-feedback';

export type HapticBeat = 'press' | 'surge' | 'gain';

const TYPE = {
  press: 'impactLight',
  surge: 'soft',
  gain: 'notificationSuccess',
} as const;

/* ignoreAndroidSystemSettings false: respects the phone's "touch feedback" switch */
const OPTIONS = { enableVibrateFallback: false, ignoreAndroidSystemSettings: false };

export function defaultHaptic(beat: HapticBeat) {
  try {
    HapticFeedback.trigger(TYPE[beat], OPTIONS);
  } catch {
    // no haptics on this device: the moment works without them
  }
}
