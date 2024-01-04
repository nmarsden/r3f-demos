type ObstacleType = 'WALL' | 'HOLE' | 'LAVA' | 'SPIKES' | 'FINISH';

export type ObstacleHitEvent = {
  obstacle: ObstacleType;
}