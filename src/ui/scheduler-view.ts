import { ScheduleTask, GeoLocation, TaskCategory } from '../core/types';
import { Scheduler, DEFAULT_TASKS, CATEGORY_COLORS } from '../core/scheduler';
import { NormalizedTimeEngine } from '../core/engine';

export class SchedulerView {
  private tasks: ScheduleTask[] = [...DEFAULT_TASKS];
  private scheduler: Scheduler;

  constructor(
    private container: HTMLElement,
    private engine: NormalizedTimeEngine,
    private onTaskChange?: () => void
  ) {
    this.scheduler = new Scheduler(this.engine);
    this.setupModalListeners();
  }

  public render(currentDate: Date, location: GeoLocation): void {
    const resolved = this.scheduler.resolveScheduleForDate(this.tasks, currentDate, location);
    this.container.innerHTML = '';

    resolved.forEach((task) => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.style.setProperty('--task-color', task.color);

      card.innerHTML = `
        <div class="task-top">
          <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
          <span class="task-badge" style="color: ${task.color}; border: 1px solid ${task.color}40;">
            ${task.category.replace('_', ' ')}
          </span>
        </div>
        <div class="task-times">
          <div class="task-time-row">
            <span class="task-time-label">Virtual Circadian Block:</span>
            <span class="task-time-val virtual-val">${task.virtualTimeSpanStr}</span>
          </div>
          <div class="task-time-row">
            <span class="task-time-label">Real Civil Time:</span>
            <span class="task-time-val">${task.realTimeSpanStr} (${task.realDurationMinutes} min)</span>
          </div>
        </div>
        ${task.notes ? `<p class="task-notes">${this.escapeHtml(task.notes)}</p>` : ''}
      `;

      this.container.appendChild(card);
    });
  }

  public exportICalendar(currentDate: Date, location: GeoLocation): void {
    const resolved = this.scheduler.resolveScheduleForDate(this.tasks, currentDate, location);
    const icsString = this.scheduler.generateICalendar(resolved, location);

    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `OurHour_Circadian_Schedule_${location.name || 'Custom'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public addTask(task: Omit<ScheduleTask, 'id' | 'completed'>): void {
    const newTask: ScheduleTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false
    };
    this.tasks.push(newTask);
    if (this.onTaskChange) this.onTaskChange();
  }

  private setupModalListeners(): void {
    const modal = document.getElementById('task-modal');
    const openBtn = document.getElementById('btn-add-task');
    const closeBtn = document.getElementById('btn-close-modal');
    const form = document.getElementById('task-form') as HTMLFormElement | null;

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (form && modal) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = (document.getElementById('task-input-title') as HTMLInputElement).value;
        const category = (document.getElementById('task-input-category') as HTMLSelectElement).value as TaskCategory;
        const startStr = (document.getElementById('task-input-start') as HTMLInputElement).value;
        const endStr = (document.getElementById('task-input-end') as HTMLInputElement).value;
        const notes = (document.getElementById('task-input-notes') as HTMLInputElement).value;

        const parseVirtualTime = (str: string): number => {
          const [h, m] = str.split(':').map(Number);
          return h + (m || 0) / 60;
        };

        const vStart = parseVirtualTime(startStr);
        const vEnd = parseVirtualTime(endStr);

        this.addTask({
          title,
          category,
          virtualStart: vStart,
          virtualEnd: vEnd > vStart ? vEnd : vStart + 1,
          color: CATEGORY_COLORS[category] || '#64748B',
          notes
        });

        form.reset();
        modal.classList.remove('active');
      });
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
