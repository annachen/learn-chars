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
  
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    
    // Only update if dimensions actually changed
    if (width !== canvasLayout.width || height !== canvasLayout.height) {
      setCanvasLayout({ width, height });
      
      // Initialize positions in a grid layout
      const tilesPerRow = Math.ceil(Math.sqrt(characters.length));
      const spacing = TILE_SIZE + 20; // 20px gap between tiles
      const startX = (width - (tilesPerRow * spacing)) / 2;
      const startY = (height - (Math.ceil(characters.length / tilesPerRow) * spacing)) / 2;
      
      const initialPositions = characters.map((char, index) => {
        const row = Math.floor(index / tilesPerRow);
        const col = index % tilesPerRow;
        return {
          id: `${char}-${index}`,
          position: {
            x: startX + (col * spacing),
            y: startY + (row * spacing)
          },
          character: char
        };
      });
      
      setTilePositions(initialPositions);
    }
  };

  const SNAP_DISTANCE = 20; // Fixed distance in pixels
  
  const checkCollision = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    
    // Check if tiles are close to being side by side
    const isHorizontalSnap = Math.abs(dx - TILE_SIZE) < SNAP_DISTANCE && dy < SNAP_DISTANCE;
    const isVerticalSnap = Math.abs(dy - TILE_SIZE) < SNAP_DISTANCE && dx < SNAP_DISTANCE;
    
    return {
      isNear: isHorizontalSnap || isVerticalSnap,
      direction: dy < dx ? 'horizontal' : 'vertical'
    };
  };

  const onTileMove = (id: string, newPosition: { x: number; y: number }) => {
    setTilePositions(prevPositions => {
      const updatedPositions = [...prevPositions];
      const movingTileIndex = updatedPositions.findIndex(tile => tile.id === id);
      
      if (movingTileIndex === -1) return prevPositions;

      let finalPosition = { ...newPosition };
      
      // Check for collisions with other tiles
      for (let i = 0; i < updatedPositions.length; i++) {
        if (i === movingTileIndex) continue;
        
        const collision = checkCollision(newPosition, updatedPositions[i].position);
        if (collision.isNear) {
          const staticTilePos = updatedPositions[i].position;
          
          if (collision.direction === 'horizontal') {
            finalPosition.y = staticTilePos.y;
            // Snap to left or right
            finalPosition.x = newPosition.x > staticTilePos.x ? 
              staticTilePos.x + TILE_SIZE : 
              staticTilePos.x - TILE_SIZE;
          } else {
            finalPosition.x = staticTilePos.x;
            // Snap to top or bottom
            finalPosition.y = newPosition.y > staticTilePos.y ? 
              staticTilePos.y + TILE_SIZE : 
              staticTilePos.y - TILE_SIZE;
          }
          break;
        }
      }

      // Update the moving tile's position
      updatedPositions[movingTileIndex] = {
        ...updatedPositions[movingTileIndex],
        position: finalPosition
      };

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
