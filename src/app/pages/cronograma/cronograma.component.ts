import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ScheduleService, CalendarEvent } from '../../services/schedule.service';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cronograma.component.html',
  styleUrls: ['./cronograma.component.css']
})
export class CronogramaComponent implements OnInit {
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  private allEvents: CalendarEvent[] = []; // Almacena la lista de eventos
  eventForm!: FormGroup;
  isModalOpen = false;
  editingEvent: CalendarEvent | null = null;

  constructor(
    private scheduleService: ScheduleService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    // Nos suscribimos a los eventos. Cada vez que cambien, se regenera el calendario.
    this.scheduleService.events$.subscribe(events => {
      this.allEvents = events;
      this.generateCalendar();
    });
  }

  generateCalendar(): void {
    const events = this.allEvents; // Usamos la lista de eventos guardada
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayEvents = events.filter(e => {
        // Comparamos solo año, mes y día para evitar problemas de zona horaria
        const eventDate = new Date(e.date);
        return eventDate.getUTCFullYear() === date.getUTCFullYear() &&
               eventDate.getUTCMonth() === date.getUTCMonth() &&
               eventDate.getUTCDate() === date.getUTCDate();
      });

      this.calendarDays.push({
        date: date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
    }
  }

  changeMonth(offset: number): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    // Simplemente regeneramos el calendario. La suscripción ya nos dio los eventos.
    this.generateCalendar();
  }

  initializeForm(event?: CalendarEvent): void {
    // Aseguramos que la fecha tenga el formato correcto YYYY-MM-DD
    const eventDate = event?.date ? new Date(event.date).toISOString().split('T')[0] : '';
    
    this.eventForm = this.fb.group({
      title: [event?.title || '', Validators.required],
      date: [eventDate, Validators.required],
      time: [event?.time || '09:00', Validators.required],
      duration: [event?.duration || 60, Validators.required],
      type: [event?.type || 'courses', Validators.required],
      description: [event?.description || '']
    });
  }

  openEventModal(day?: CalendarDay, event?: CalendarEvent): void {
    if (event) {
      this.editingEvent = event;
      this.initializeForm(event);
    } else {
      this.editingEvent = null;
      const initialDate = day ? day.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      this.initializeForm({ date: initialDate } as CalendarEvent);
    }
    this.isModalOpen = true;
  }

  closeEventModal(): void {
    this.isModalOpen = false;
  }

  onEventSubmit(): void {
    if (this.eventForm.invalid) return;

    if (this.editingEvent) {
      this.scheduleService.updateEvent(this.editingEvent.id, this.eventForm.value);
    } else {
      this.scheduleService.addEvent(this.eventForm.value);
    }
    this.closeEventModal();
  }

  onDeleteEvent(): void {
    if (this.editingEvent) {
      this.scheduleService.deleteEvent(this.editingEvent.id);
      this.closeEventModal();
    }
  }
}
