export interface Todo {
  id: string;
  text: string;
  createdAt: Date;
  completedAt?: Date;
  reminderAt?: Date;
  deadlineAt?: Date;
}