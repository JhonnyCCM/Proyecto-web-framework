import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

// --- Interfaces para los datos del panel ---
export interface ScheduleItem {
  title: string;
  category: string;
  time: string;
  type: 'marketing' | 'planning' | 'design' | 'management';
}

export interface LearningCard {
  hours: string;
  subject: string;
  type: 'marketing' | 'design' | 'sales';
}

export interface ChartData {
  day: string;
  uiDesign: number;
  digitalMarketing: number;
}

export interface Assignment {
  id: number;
  name: string;
  category: string;
  total: string;
  score: string;
  status: 'completed' | 'progress';
  type: 'marketing' | 'design' | 'business';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  getSchedule(): Observable<ScheduleItem[]> {
    const scheduleData: ScheduleItem[] = [
      { title: "Social Media Marketing", category: "Digimar", time: "12:00 PM", type: "marketing" },
      { title: "Campaign Planning", category: "Digimar", time: "12:00 PM", type: "planning" },
      { title: "Figma para UI/UX", category: "UI/UX Design", time: "06:00 PM", type: "design" },
      { title: "Account Management", category: "Sales & BD", time: "09:00 PM", type: "management" },
    ];
    return of(scheduleData);
  }

  getLearningCards(): Observable<LearningCard[]> {
    const learningData: LearningCard[] = [
      { hours: "100 hrs", subject: "Digital Marketing", type: "marketing" },
      { hours: "120 hrs", subject: "UI/UX Design", type: "design" },
      { hours: "104 hrs", subject: "Sales & BD", type: "sales" },
    ];
    return of(learningData);
  }

  getHoursChartData(): Observable<ChartData[]> {
    const chartData: ChartData[] = [
      { day: "Lun", uiDesign: 4, digitalMarketing: 2 },
      { day: "Mar", uiDesign: 3, digitalMarketing: 3 },
      { day: "Mié", uiDesign: 5, digitalMarketing: 2 },
      { day: "Jue", uiDesign: 6, digitalMarketing: 1 },
      { day: "Vie", uiDesign: 4, digitalMarketing: 3 },
      { day: "Sáb", uiDesign: 2, digitalMarketing: 4 },
      { day: "Dom", uiDesign: 3, digitalMarketing: 5 },
    ];
    return of(chartData);
  }

  getAssignments(): Observable<Assignment[]> {
    const assignmentsData: Assignment[] = [
      { id: 1, name: "Targeting Audience", category: "Digital Marketing", total: "12/12", score: "100/100", status: "completed", type: "marketing" },
      { id: 2, name: "User Persona Research", category: "UI/UX Design", total: "12/12", score: "90/100", status: "completed", type: "design" },
      { id: 3, name: "Key Metrics & Strategies", category: "Sales & Business Development", total: "4/12", score: "40/100", status: "progress", type: "business" },
    ];
    return of(assignmentsData);
  }
}
