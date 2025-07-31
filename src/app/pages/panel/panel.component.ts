import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DashboardService, ScheduleItem, LearningCard, ChartData, Assignment } from '../../services/dashboard.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {
  schedule$!: Observable<ScheduleItem[]>;
  learningCards$!: Observable<LearningCard[]>;
  chartData$!: Observable<ChartData[]>;
  assignments$!: Observable<Assignment[]>;

  progressPercentage = 65;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.schedule$ = this.dashboardService.getSchedule();
    this.learningCards$ = this.dashboardService.getLearningCards();
    this.chartData$ = this.dashboardService.getHoursChartData();
    this.assignments$ = this.dashboardService.getAssignments();
  }

  getScheduleIcon(type: string): string {
    const icons: { [key: string]: string } = {
      marketing: "📱", planning: "📋", design: "🎨", management: "💼", sales: "💼"
    };
    return icons[type] || "📚";
  }

  getAssignmentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      marketing: "🎯", design: "🎨", business: "📊",
    };
    return icons[type] || "📚";
  }
}
