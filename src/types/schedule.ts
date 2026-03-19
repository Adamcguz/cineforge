export interface ShootDay {
  id: string;
  label: string;
  date?: string; // ISO date string
  sceneIds: string[];
}

export interface ScheduleData {
  shootDays: ShootDay[];
}
