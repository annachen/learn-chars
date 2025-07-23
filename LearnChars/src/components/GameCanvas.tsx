import React from 'react';
import { StyleSheet, View, LayoutChangeEvent, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CharacterTile } from './CharacterTile';
import { SnapGuide } from './SnapGuide';

type Direction = 'left' | 'right' | 'top' | 'bottom';

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
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
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

  const SNAP_DISTANCE = 40; // Increased distance to show guide earlier
  const [snapGuide, setSnapGuide] = React.useState<{
    position: { x: number; y: number };
    direction: 'left' | 'right' | 'top' | 'bottom';
  } | null>(null);
  
  const checkCollision = (movingTile: { x: number; y: number }, staticTile: { x: number; y: number }) => {
    const dx = movingTile.x - staticTile.x;
    const dy = movingTile.y - staticTile.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // First, check if we're closer to horizontal or vertical alignment
    const isHorizontalPreferred = absDy < SNAP_DISTANCE;
    const isVerticalPreferred = absDx < SNAP_DISTANCE;
    
    if (!isHorizontalPreferred && !isVerticalPreferred) {
      return {
        isNear: false,
        direction: null,
        distance: Infinity
      };
    }

    // Then determine which side we're closest to
    if (isHorizontalPreferred) {
      // We're already horizontally aligned, check if we're near left or right
      const leftDist = Math.abs(dx + TILE_SIZE);
      const rightDist = Math.abs(dx - TILE_SIZE);
      
      if (leftDist < rightDist && leftDist < SNAP_DISTANCE) {
        return {
          isNear: true,
          direction: 'left' as Direction,
          distance: leftDist
        };
      } else if (rightDist < SNAP_DISTANCE) {
        return {
          isNear: true,
          direction: 'right' as Direction,
          distance: rightDist
        };
      }
    } else if (isVerticalPreferred) {
      // We're already vertically aligned, check if we're near top or bottom
      const topDist = Math.abs(dy + TILE_SIZE);
      const bottomDist = Math.abs(dy - TILE_SIZE);
      
      if (topDist < bottomDist && topDist < SNAP_DISTANCE) {
        return {
          isNear: true,
          direction: 'top' as Direction,
          distance: topDist
        };
      } else if (bottomDist < SNAP_DISTANCE) {
        return {
          isNear: true,
          direction: 'bottom' as Direction,
          distance: bottomDist
        };
      }
    }

    return {
      isNear: false,
      direction: null,
      distance: Infinity
    };
  };

  const onTileMove = (id: string, newPosition: { x: number; y: number }) => {
    setTilePositions(prevPositions => {
      const updatedPositions = [...prevPositions];
      const movingTileIndex = updatedPositions.findIndex(tile => tile.id === id);
      
      if (movingTileIndex === -1) return prevPositions;

      let finalPosition = { ...newPosition };
      
      let bestSnap = { distance: Infinity, targetId: '', direction: null as any, position: { x: 0, y: 0 } };
      
      // Check for collisions with other tiles
      for (let i = 0; i < updatedPositions.length; i++) {
        if (i === movingTileIndex) continue;
        
        const collision = checkCollision(newPosition, updatedPositions[i].position);
        if (collision.isNear && collision.distance < bestSnap.distance) {
          const staticTilePos = updatedPositions[i].position;
          bestSnap = {
            distance: collision.distance,
            targetId: updatedPositions[i].id,
            direction: collision.direction,
            position: staticTilePos
          };
          
          const snapPosition = {
            x: staticTilePos.x,
            y: staticTilePos.y
          };

          // Calculate snap position based on direction
          switch (collision.direction) {
            case 'left':
              snapPosition.x -= TILE_SIZE;
              finalPosition.y = staticTilePos.y;
              break;
            case 'right':
              snapPosition.x += TILE_SIZE;
              finalPosition.y = staticTilePos.y;
              break;
            case 'top':
              snapPosition.y -= TILE_SIZE;
              finalPosition.x = staticTilePos.x;
              break;
            case 'bottom':
              snapPosition.y += TILE_SIZE;
              finalPosition.x = staticTilePos.x;
              break;
          }
          
          finalPosition.x = snapPosition.x;
          finalPosition.y = snapPosition.y;
          
          // Update snap guide if direction is valid
          if (collision.direction) {
            setSnapGuide({
              direction: collision.direction,
              position: staticTilePos
            });
          } else {
            setSnapGuide(null);
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
            onDragStart={() => setActiveId(tile.id)}
            onDragEnd={() => {
              setActiveId(null);
              setSnapGuide(null);
            }}
          />
        ))}
        {snapGuide && (
          <SnapGuide
            direction={snapGuide.direction}
            position={snapGuide.position}
          />
        )}
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
