type ObstacleType = 'WALL' | 'HOLE';

export type ObstacleHitEvent = {
  obstacle: ObstacleType;
}