type ObstacleType = 'WALL' | 'HOLE' | 'LAVA';

export type ObstacleHitEvent = {
  obstacle: ObstacleType;
}