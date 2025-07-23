import React from 'react';
import { StyleSheet, View, LayoutChangeEvent, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CharacterTile } from './CharacterTile';

interface TilePosition {
  id: string;
  position: { x: number; y: number };
  character: string;
}

interface GameCanvasProps {
  characters: string[];
}

const TILE_SIZE = 80; // Same as the tile width/height in CharacterTile styles
const COLLISION_THRESHOLD = TILE_SIZE * 0.7; // Tiles will snap when they are this close

export const GameCanvas: React.FC<GameCanvasProps> = ({ characters }) => {
  const [canvasLayout, setCanvasLayout] = React.useState({ width: 0, height: 0 });
  const [tilePositions, setTilePositions] = React.useState<TilePosition[]>([]);
  
  React.useEffect(() => {
    if (canvasLayout.width > 0) {
      // Initialize tile positions
      const initialPositions = characters.map((char, index) => ({
        id: `${char}-${index}`,
        position: getRandomPosition(),
        character: char
      }));
      setTilePositions(initialPositions);
    }
  }, [canvasLayout.width, characters]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasLayout({ width, height });
  };

  const getRandomPosition = () => ({
    x: Math.random() * (canvasLayout.width - TILE_SIZE),
    y: Math.random() * (canvasLayout.height - TILE_SIZE),
  });

  const checkCollision = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy) < COLLISION_THRESHOLD;
  };

  const onTileMove = (id: string, newPosition: { x: number; y: number }) => {
    setTilePositions(prevPositions => {
      const updatedPositions = [...prevPositions];
      const movingTileIndex = updatedPositions.findIndex(tile => tile.id === id);
      
      if (movingTileIndex === -1) return prevPositions;
      
      // Update the moving tile's position
      updatedPositions[movingTileIndex] = {
        ...updatedPositions[movingTileIndex],
        position: newPosition
      };

      // Check for collisions with other tiles
      updatedPositions.forEach((tile, index) => {
        if (tile.id !== id && checkCollision(newPosition, tile.position)) {
          // When tiles collide, snap them together
          const snapPosition = {
            x: (newPosition.x + tile.position.x) / 2,
            y: (newPosition.y + tile.position.y) / 2
          };
          
          updatedPositions[movingTileIndex].position = snapPosition;
          updatedPositions[index].position = snapPosition;
        }
      });

      return updatedPositions;
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.canvas} onLayout={onLayout}>
        {tilePositions.map(tile => (
          <CharacterTile
            key={tile.id}
            id={tile.id}
            character={tile.character}
            initialPosition={tile.position}
            onMove={(pos) => onTileMove(tile.id, pos)}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});
