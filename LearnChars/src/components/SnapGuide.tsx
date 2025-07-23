import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SnapGuideProps {
  direction: 'left' | 'right' | 'top' | 'bottom';
  position: { x: number; y: number };
}

export const SnapGuide: React.FC<SnapGuideProps> = ({ direction, position }) => {
  const isHorizontal = direction === 'left' || direction === 'right';
  const offset = direction === 'left' || direction === 'top' ? -2 : 82; // 80px tile size + 2px offset

  return (
    <View
      style={[
        styles.guide,
        {
          position: 'absolute',
          left: isHorizontal ? position.x + offset : position.x,
          top: !isHorizontal ? position.y + offset : position.y,
          width: isHorizontal ? 4 : 80,
          height: !isHorizontal ? 4 : 80,
        },
      ]}
    >
      <View style={[styles.guideDot, styles.guideDotStart]} />
      <View style={[styles.guideDot, styles.guideDotEnd]} />
    </View>
  );
};

const styles = StyleSheet.create({
  guide: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)', // Light green
    borderRadius: 2,
  },
  guideDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50', // Solid green
  },
  guideDotStart: {
    left: 0,
    top: 0,
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
  guideDotEnd: {
    right: 0,
    bottom: 0,
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
});
