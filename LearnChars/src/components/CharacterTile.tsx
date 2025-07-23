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
  const [position, setPosition] = React.useState(initialPosition);
  const startPosition = React.useRef({ x: 0, y: 0 });

  const onGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newPosition = {
        x: startPosition.current.x + event.nativeEvent.translationX,
        y: startPosition.current.y + event.nativeEvent.translationY
      };
      setPosition(newPosition);
      onMove?.(newPosition);
    }
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      startPosition.current = position;
    }
  };

  React.useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

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
            top: position.y
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
    borderWidth: 2,
    borderColor: '#ddd',
  },
  character: {
    fontSize: 40,
    color: '#333',
  },
});
