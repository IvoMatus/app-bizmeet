import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, type Text } from 'react-native';

/**
 * Moves VoiceOver/TalkBack accessibility focus to the returned ref's element once it
 * mounts. Attach the ref to a screen's heading so screen reader users land on the new
 * content right after a step/route change, instead of staying anchored on whatever was
 * focused before navigating — relying on the OS to do this by itself isn't consistent
 * across platforms (TalkBack in particular).
 */
export function useAccessibilityFocusOnMount() {
  const ref = useRef<Text>(null);

  useEffect(() => {
    const tag = findNodeHandle(ref.current);
    if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
  }, []);

  return ref;
}
