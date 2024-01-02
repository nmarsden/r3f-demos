type ObstacleType = 'WALL' | 'HOLE' | 'LAVA' | 'SPIKES';

export type ObstacleHitEvent = {
  obstacle: ObstacleType;
}