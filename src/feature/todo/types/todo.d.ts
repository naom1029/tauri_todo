export interface Todo {
  id: string;
  text: string;
  createdAt: Date;
  completedAt?: Date | null;
  reminderAt?: Date | null;
  deadlineAt?: Date | null;
}
