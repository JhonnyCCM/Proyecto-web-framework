import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:MM
  duration: number; // en minutos
  type: 'courses' | 'assignments' | 'exams' | 'meetings';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.createInitialData();
      const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
      this.eventsSubject.next(events);
    }
  }

  private createInitialData(): void {
    const existingEvents = localStorage.getItem("calendarEvents");
    if (existingEvents) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const initialEvents: CalendarEvent[] = [
      { id: `evt_${Date.now()}`, title: "Clase de UI/UX Design", date: todayStr, time: "10:00", duration: 90, type: 'courses' },
      { id: `evt_${Date.now() + 1}`, title: "Entrega de Proyecto", date: todayStr, time: "18:00", duration: 30, type: 'assignments' },
    ];
    localStorage.setItem("calendarEvents", JSON.stringify(initialEvents));
  }

  addEvent(eventData: Omit<CalendarEvent, 'id'>): void {
    const events = this.eventsSubject.value;
    const newEvent: CalendarEvent = {
      id: `evt_${Date.now()}`,
      ...eventData
    };
    const updatedEvents = [...events, newEvent];
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    this.eventsSubject.next(updatedEvents);
  }

  updateEvent(eventId: string, updatedData: Partial<CalendarEvent>): void {
    let events = this.eventsSubject.value;
    events = events.map(event => 
      event.id === eventId ? { ...event, ...updatedData } : event
    );
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    this.eventsSubject.next(events);
  }

  deleteEvent(eventId: string): void {
    let events = this.eventsSubject.value;
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    this.eventsSubject.next(events);
  }
}
