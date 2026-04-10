
export interface Task {
  id: string;
  text: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  completed: boolean;
  notes?: string;
}
