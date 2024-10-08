export interface Todo {
  id: string;
  text: string;
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
}
