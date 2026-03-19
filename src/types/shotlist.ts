export const SHOT_TYPES = [
  'Wide', 'Medium', 'Close-Up', 'ECU', 'Insert',
  'POV', 'Two-Shot', 'OTS', 'Cutaway',
] as const;

export const SHOT_ANGLES = [
  'Eye Level', 'High', 'Low', 'Dutch',
  'Bird\'s Eye', 'Worm\'s Eye',
] as const;

export const SHOT_MOVEMENTS = [
  'Static', 'Pan', 'Tilt', 'Dolly', 'Tracking',
  'Handheld', 'Crane', 'Zoom',
] as const;

export type ShotType = typeof SHOT_TYPES[number];
export type ShotAngle = typeof SHOT_ANGLES[number];
export type ShotMovement = typeof SHOT_MOVEMENTS[number];

export interface Shot {
  id: string;
  number: string;
  type: ShotType;
  angle: ShotAngle;
  movement: ShotMovement;
  lens?: string;
  frame: string;
  notes?: string;
  completed: boolean;
}
