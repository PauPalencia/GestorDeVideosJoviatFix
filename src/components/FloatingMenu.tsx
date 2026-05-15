import React, { useRef, useState } from 'react';
import { Animated, Pressable, PanResponder, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  onHome: () => void;
  onUser: () => void;
  onLists: () => void;
};

const RADIUS = 76;
const BTN_SIZE = 52;
const ANGLES = [135, 90, 45];

export const FloatingMenu: React.FC<Props> = ({ onHome, onUser, onLists }) => {
  const [expanded, setExpanded] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 280, y: 560 })).current;

  const subAnims = useRef(
    ANGLES.map(() => ({
      pos: new Animated.ValueXY({ x: 0, y: 0 }),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => { pan.flattenOffset(); },
      onPanResponderGrant: () => pan.extractOffset(),
    })
  ).current;

  const toggle = () => {
    const opening = !expanded;
    setExpanded(opening);

    const anims = ANGLES.map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const targetX = opening ? Math.cos(rad) * RADIUS : 0;
      const targetY = opening ? -Math.sin(rad) * RADIUS : 0;

      return Animated.parallel([
        Animated.spring(subAnims[i].pos, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 6,
          tension: 100,
        }),
        Animated.timing(subAnims[i].opacity, {
          toValue: opening ? 1 : 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(subAnims[i].scale, {
          toValue: opening ? 1 : 0,
          useNativeDriver: false,
          friction: 6,
          tension: 120,
        }),
      ]);
    });

    Animated.stagger(50, opening ? anims : [...anims].reverse()).start();
  };

  const icons: Array<keyof typeof Ionicons.glyphMap> = ['star', 'person', 'menu'];
  const actions = [onHome, onUser, onLists];

  return (
    <Animated.View
      style={[styles.host, { transform: pan.getTranslateTransform() }]}
      {...responder.panHandlers}
    >
      {ANGLES.map((_, i) => (
        <Animated.View
          key={i}
          pointerEvents={expanded ? 'auto' : 'none'}
          style={[
            styles.sub,
            {
              transform: [
                ...subAnims[i].pos.getTranslateTransform(),
                { scale: subAnims[i].scale },
              ],
              opacity: subAnims[i].opacity,
            },
          ]}
        >
          <Pressable
            onPress={() => { actions[i](); toggle(); }}
            style={[styles.btn, styles.secondary]}
          >
            <Ionicons name={icons[i]} color="#fff" size={20} />
          </Pressable>
        </Animated.View>
      ))}
      <Pressable onPress={toggle} style={[styles.btn, styles.primary]}>
        <Ionicons name={expanded ? 'close' : 'home'} color="#fff" size={22} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  host: { position: 'absolute', zIndex: 60 },
  sub: { position: 'absolute', top: 0, left: 0 },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.success },
});
