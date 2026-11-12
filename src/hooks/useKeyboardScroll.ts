import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";

const GAP = 24; // space kept between the focused input and the top of the keyboard

/**
 * Keeps the field you are typing in visible above the keyboard.
 * Use: <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16}
 *        contentContainerStyle={{ paddingBottom: 48 + keyboardHeight }} />
 */
export function useKeyboardScroll() {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);

      // Wait for the extra bottom space to render, then scroll the focused input above the keyboard.
      setTimeout(() => {
        const input = TextInput.State.currentlyFocusedInput?.();
        input?.measureInWindow((_x, y, _width, height) => {
          const overlap = y + height + GAP - e.endCoordinates.screenY;
          if (overlap > 0)
            scrollRef.current?.scrollTo({
              y: scrollY.current + overlap,
              animated: true,
            });
        });
      }, 150);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  }, []);

  return { scrollRef, keyboardHeight, onScroll };
}
