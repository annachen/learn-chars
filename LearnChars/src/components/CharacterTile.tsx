import React from 'react';
import { StyleSheet, Text, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

interface CharacterTileProps {
  character: string;
  initialPosition?: { x: number; y: number };
  onMove?: (position: { x: number; y: number }) => void;
  id: string;
}

export const CharacterTile: React.FC<CharacterTileProps> = ({ 
  character, 
  initialPosition = { x: 0, y: 0 },
  onMove,
  id 
}) => {
  const position = React.useRef(new Animated.ValueXY(initialPosition)).current;
  const [absolutePosition, setAbsolutePosition] = React.useState(initialPosition);

  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    const newPosition = {
      x: absolutePosition.x + translationX,
      y: absolutePosition.y + translationY
    };
    position.setValue(newPosition);
    onMove?.(newPosition);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, translationY } = event.nativeEvent;
      const newPosition = {
        x: absolutePosition.x + translationX,
        y: absolutePosition.y + translationY
      };
      setAbsolutePosition(newPosition);
      position.setValue(newPosition);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            position: 'absolute',
            left: position.x,
            top: position.y,
          },
        ]}
      >
        <Text style={styles.character}>{character}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  character: {
    fontSize: 40,
    color: '#333',
  },
});
