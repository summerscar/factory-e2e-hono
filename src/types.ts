export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: string
}

export interface CreateTaskInput {
  title: string
}
