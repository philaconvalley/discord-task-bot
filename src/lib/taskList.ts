import type { Task } from '../repositories/taskRepository';

export const MAX_MESSAGE_LENGTH = 2000;

export function formatTaskLine(task: Task): string {
  return `#${task.id} [${task.status}] "${task.description}" — <@${task.assigneeId}>, due ${task.dueDate}`;
}

export function omittedTasksLine(count: number): string {
  return `…and ${count} more. Filter by assignee or status to see them.`;
}

/**
 * Formats tasks into one message that stays at or under `limit` characters.
 * When tasks do not fit, the last line says how many were left out.
 */
export function formatTaskList(tasks: Task[], limit: number = MAX_MESSAGE_LENGTH): string {
  const lines = tasks.map(formatTaskLine);
  let body = '';
  let shown = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const remainingAfter = lines.length - index - 1;
    const footer = remainingAfter > 0 ? `\n${omittedTasksLine(remainingAfter)}` : '';
    const next = body ? `${body}\n${lines[index]}` : lines[index];

    if (next.length + footer.length > limit) {
      break;
    }

    body = next;
    shown += 1;
  }

  const omitted = tasks.length - shown;
  if (omitted === 0) {
    return body;
  }
  return body ? `${body}\n${omittedTasksLine(omitted)}` : omittedTasksLine(omitted);
}
