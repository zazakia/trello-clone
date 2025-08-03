import type { 
  Project, 
  ProjectMetrics, 
  BurndownPoint, 
  RiskFactor, 
  Card,
  Milestone
} from '../types';

export class ProjectAnalyticsService {
  private static instance: ProjectAnalyticsService;

  static getInstance(): ProjectAnalyticsService {
    if (!ProjectAnalyticsService.instance) {
      ProjectAnalyticsService.instance = new ProjectAnalyticsService();
    }
    return ProjectAnalyticsService.instance;
  }

  /**
   * Calculate comprehensive project metrics
   */
  calculateProjectMetrics(project: Project): ProjectMetrics {
    try {
      const allCards = this.getAllCardsFromProject(project);
      const completedCards = allCards.filter(card => this.isCardCompleted(card, project));
      const overdueCards = allCards.filter(card => this.isCardOverdue(card));
      
      const totalHours = (project.timeEntries || []).reduce((sum, entry) => sum + ((entry.duration || 0) / 60), 0);
      const budgetUtilization = project.budget ? (project.actualCost || 0) / project.budget * 100 : 0;
    
      return {
        totalTasks: allCards.length,
        completedTasks: completedCards.length,
        overdueTasks: overdueCards.length,
        totalHours,
        budgetUtilization,
        schedulePerformanceIndex: this.calculateSPI(project),
        costPerformanceIndex: this.calculateCPI(project),
        velocity: this.calculateVelocity(project),
        burndownData: this.generateBurndownData(project),
        riskFactors: this.identifyRiskFactors(project)
      };
    } catch (error) {
      console.warn('Error calculating project metrics:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        totalHours: 0,
        budgetUtilization: 0,
        schedulePerformanceIndex: 1,
        costPerformanceIndex: 1,
        velocity: 0,
        burndownData: [],
        riskFactors: []
      };
    }
  }

  /**
   * Generate burndown chart data
   */
  generateBurndownData(project: Project): BurndownPoint[] {
    try {
      if (!project.startDate || !project.endDate) {
        return [];
      }
      
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalTasks = this.getAllCardsFromProject(project).length;
    
    const burndownData: BurndownPoint[] = [];
    
    // Generate daily data points
    for (let day = 0; day <= Math.min(totalDays, 30); day++) { // Limit to 30 days for demo
      const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Calculate ideal work remaining (linear burndown)
      const idealWork = totalTasks * (1 - day / totalDays);
      
      // Calculate actual work remaining (mock realistic progress)
      const progressFactor = this.getProgressFactor(day, totalDays);
      const actualWork = Math.max(0, totalTasks * (1 - progressFactor));
      
      burndownData.push({
        date: dateString,
        remainingWork: Math.round(actualWork),
        idealWork: Math.round(idealWork),
        actualWork: Math.round(totalTasks - actualWork)
      });
    }
    
      return burndownData;
    } catch (error) {
      console.warn('Error generating burndown data:', error);
      return [];
    }
  }

  /**
   * Calculate Schedule Performance Index (SPI)
   */
  private calculateSPI(project: Project): number {
    try {
      if (!project.startDate || !project.endDate) {
        return 1;
      }
      
      const totalDuration = new Date(project.endDate).getTime() - new Date(project.startDate).getTime();
      const elapsedTime = Date.now() - new Date(project.startDate).getTime();
      const plannedProgress = Math.min(elapsedTime / totalDuration, 1);
      const actualProgress = (project.completionPercentage || 0) / 100;
      
      return plannedProgress > 0 ? actualProgress / plannedProgress : 1;
    } catch (error) {
      console.warn('Error calculating SPI:', error);
      return 1;
    }
  }

  /**
   * Calculate Cost Performance Index (CPI)
   */
  private calculateCPI(project: Project): number {
    try {
      if (!project.budget || !project.actualCost) return 1;
      
      const earnedValue = project.budget * ((project.completionPercentage || 0) / 100);
      return project.actualCost > 0 ? earnedValue / project.actualCost : 1;
    } catch (error) {
      console.warn('Error calculating CPI:', error);
      return 1;
    }
  }

  /**
   * Calculate team velocity
   */
  private calculateVelocity(project: Project): number {
    try {
      if (!project.startDate) {
        return 0;
      }
      
      // Mock calculation - in real app, this would use historical sprint data
      const allCards = this.getAllCardsFromProject(project);
      const completedCards = allCards.filter(card => this.isCardCompleted(card, project));
      const projectDuration = (Date.now() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24);
      const sprintsElapsed = Math.max(1, Math.floor(projectDuration / 14)); // 2-week sprints
      
      return Math.round(completedCards.length / sprintsElapsed);
    } catch (error) {
      console.warn('Error calculating velocity:', error);
      return 0;
    }
  }

  /**
   * Identify project risk factors
   */
  private identifyRiskFactors(project: Project): RiskFactor[] {
    const risks: RiskFactor[] = [];
    const metrics = {
      spi: this.calculateSPI(project),
      budgetUtilization: project.budget ? (project.actualCost || 0) / project.budget * 100 : 0,
      completionRate: project.completionPercentage
    };

    // Schedule risk
    if (metrics.spi < 0.8) {
      risks.push({
        id: 'schedule-delay',
        type: 'schedule',
        severity: metrics.spi < 0.6 ? 'critical' : 'high',
        description: 'Project is significantly behind schedule',
        impact: 'Delivery date may be missed, affecting client satisfaction',
        identifiedDate: new Date().toISOString()
      });
    }

    // Budget risk
    if (metrics.budgetUtilization > 80) {
      risks.push({
        id: 'budget-overrun',
        type: 'budget',
        severity: metrics.budgetUtilization > 100 ? 'critical' : 'medium',
        description: 'Budget utilization is high',
        impact: 'Project may exceed allocated budget',
        identifiedDate: new Date().toISOString()
      });
    }

    // Quality risk (mock)
    const overdueCount = this.getAllCardsFromProject(project).filter(card => this.isCardOverdue(card)).length;
    if (overdueCount > 5) {
      risks.push({
        id: 'quality-concerns',
        type: 'quality',
        severity: 'medium',
        description: `${overdueCount} tasks are overdue`,
        impact: 'Quality may be compromised due to time pressure',
        identifiedDate: new Date().toISOString()
      });
    }

    return risks;
  }

  /**
   * Calculate project health score
   */
  calculateHealthScore(project: Project): number {
    try {
      const metrics = this.calculateProjectMetrics(project);
      let score = 100;

    // Deduct points for poor performance
    if (metrics.schedulePerformanceIndex < 1) {
      score -= (1 - metrics.schedulePerformanceIndex) * 30;
    }
    
    if (metrics.costPerformanceIndex < 1) {
      score -= (1 - metrics.costPerformanceIndex) * 25;
    }
    
    if (metrics.overdueTasks > 0) {
      score -= Math.min(metrics.overdueTasks * 2, 20);
    }
    
    // Factor in risks
    const criticalRisks = metrics.riskFactors.filter(r => r.severity === 'critical').length;
    const highRisks = metrics.riskFactors.filter(r => r.severity === 'high').length;
    
      score -= criticalRisks * 15 + highRisks * 10;
      
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      console.warn('Error calculating health score:', error);
      return 75; // Default reasonable score
    }
  }

  /**
   * Calculate completion percentage for projects without this property
   */
  calculateCompletionPercentage(project: Project): number {
    const allCards = this.getAllCardsFromProject(project);
    if (allCards.length === 0) return 0;
    
    const completedCards = allCards.filter(card => this.isCardCompleted(card, project));
    return Math.round((completedCards.length / allCards.length) * 100);
  }

  /**
   * Get all cards from a project
   */
  private getAllCardsFromProject(project: Project): Card[] {
    return project.lists?.flatMap(list => list.cards || []) || [];
  }

  /**
   * Check if a card is completed
   */
  private isCardCompleted(card: Card, project: Project): boolean {
    // In a real app, this would check if the card is in a "Done" list
    // For now, we'll use a simple heuristic
    const doneList = project.lists?.find(list => 
      list.title.toLowerCase().includes('done') || 
      list.title.toLowerCase().includes('complete')
    );
    return doneList?.cards?.some(c => c.id === card.id) || false;
  }

  /**
   * Check if a card is overdue
   */
  private isCardOverdue(card: Card): boolean {
    if (!card.reminder_date) return false;
    return new Date(card.reminder_date) < new Date();
  }

  /**
   * Get progress factor for burndown calculation
   */
  private getProgressFactor(day: number, totalDays: number): number {
    // Simulate realistic progress with some variation
    const idealProgress = day / totalDays;
    const variation = Math.sin(day * 0.3) * 0.1; // Add some realistic ups and downs
    return Math.max(0, Math.min(1, idealProgress + variation));
  }

  /**
   * Calculate milestone completion rate
   */
  calculateMilestoneProgress(milestones: Milestone[] = []): { completed: number; total: number; percentage: number } {
    const completed = milestones.filter(m => m.completed).length;
    const total = milestones.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }

  /**
   * Generate project timeline data
   */
  generateTimelineData(project: Project) {
    try {
      const startDate = project.startDate || new Date().toISOString();
      
      return {
        phases: [
          { name: 'Planning', startDate, duration: 7, completed: true },
          { name: 'Development', startDate, duration: 30, completed: false },
          { name: 'Testing', startDate, duration: 10, completed: false },
          { name: 'Deployment', startDate, duration: 3, completed: false }
        ],
        milestones: (project.milestones || []).map(m => ({
          ...m,
          isOverdue: !m.completed && new Date(m.dueDate) < new Date()
        }))
      };
    } catch (error) {
      console.warn('Error generating timeline data:', error);
      return {
        phases: [],
        milestones: []
      };
    }
  }

  /**
   * Calculate team utilization
   */
  calculateTeamUtilization(project: Project): Array<{
    member: string;
    utilization: number;
    hoursLogged: number;
    efficiency: number;
  }> {
    const teamMembers = project.teamMembers || [];
    const timeEntries = project.timeEntries || [];
    
    if (teamMembers.length === 0) {
      // Return mock data for demonstration
      return [
        { member: 'Project Manager', utilization: 85, hoursLogged: 160, efficiency: 92 },
        { member: 'Senior Developer', utilization: 95, hoursLogged: 180, efficiency: 88 },
        { member: 'UI/UX Designer', utilization: 70, hoursLogged: 120, efficiency: 95 }
      ];
    }
    
    return teamMembers.map(member => {
      const memberEntries = timeEntries.filter(entry => entry.userId === member.id);
      const hoursLogged = memberEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const utilization = member.workloadPercentage || 0;
      const efficiency = hoursLogged > 0 ? Math.min(100, (utilization / 100) * 100) : 0;
      
      return {
        member: member.name,
        utilization,
        hoursLogged,
        efficiency
      };
    });
  }
}

export const projectAnalyticsService = ProjectAnalyticsService.getInstance();