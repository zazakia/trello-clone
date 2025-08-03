import { 
  Clock, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Star
} from 'lucide-react';
import type { KPIMetric, ProjectMetrics, Project } from '../types';

interface KPIDashboardProps {
  project: Project;
  metrics: ProjectMetrics;
  className?: string;
}

export function KPIDashboard({ project, metrics, className = "" }: KPIDashboardProps) {
  // Calculate KPI metrics
  const kpiMetrics: KPIMetric[] = [
    {
      id: 'schedule-performance',
      name: 'Schedule Performance',
      value: metrics.schedulePerformanceIndex,
      target: 1.0,
      unit: 'SPI',
      trend: metrics.schedulePerformanceIndex >= 1 ? 'up' : 'down',
      changePercentage: (metrics.schedulePerformanceIndex - 1) * 100,
      description: 'How well the project is adhering to the planned schedule',
      category: 'delivery'
    },
    {
      id: 'cost-performance',
      name: 'Cost Performance',
      value: metrics.costPerformanceIndex,
      target: 1.0,
      unit: 'CPI',
      trend: metrics.costPerformanceIndex >= 1 ? 'up' : 'down',
      changePercentage: (metrics.costPerformanceIndex - 1) * 100,
      description: 'Cost efficiency relative to planned budget',
      category: 'budget'
    },
    {
      id: 'budget-utilization',
      name: 'Budget Utilization',
      value: metrics.budgetUtilization,
      target: 100,
      unit: '%',
      trend: metrics.budgetUtilization <= 100 ? 'up' : 'down',
      changePercentage: metrics.budgetUtilization - 80, // Compare to 80% baseline
      description: 'Percentage of budget consumed',
      category: 'budget'
    },
    {
      id: 'completion-rate',
      name: 'Completion Rate',
      value: project.completionPercentage,
      target: 100,
      unit: '%',
      trend: 'up',
      changePercentage: 5, // Mock weekly change
      description: 'Overall project completion percentage',
      category: 'delivery'
    },
    {
      id: 'velocity',
      name: 'Team Velocity',
      value: metrics.velocity,
      target: 8,
      unit: 'tasks/sprint',
      trend: metrics.velocity >= 8 ? 'up' : 'down',
      changePercentage: ((metrics.velocity - 6) / 6) * 100, // Compare to baseline of 6
      description: 'Average tasks completed per sprint',
      category: 'team'
    },
    {
      id: 'health-score',
      name: 'Project Health',
      value: project.healthScore,
      target: 85,
      unit: '/100',
      trend: project.healthScore >= 85 ? 'up' : project.healthScore >= 70 ? 'stable' : 'down',
      changePercentage: project.healthScore - 75, // Compare to baseline of 75
      description: 'Overall project health score',
      category: 'quality'
    }
  ];

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'delivery':
        return <Target className="h-5 w-5" />;
      case 'budget':
        return <DollarSign className="h-5 w-5" />;
      case 'team':
        return <Users className="h-5 w-5" />;
      case 'quality':
        return <Star className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: string, size: string = "h-4 w-4") => {
    switch (trend) {
      case 'up':
        return <TrendingUp className={`${size} text-green-600`} />;
      case 'down':
        return <TrendingDown className={`${size} text-red-600`} />;
      default:
        return <BarChart3 className={`${size} text-gray-500`} />;
    }
  };

  const getMetricColor = (metric: KPIMetric) => {
    const isGood = metric.category === 'budget' 
      ? metric.value <= metric.target
      : metric.value >= metric.target * 0.8; // 80% of target is acceptable
    
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (project.priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const risksCount = metrics.riskFactors.filter(r => !r.resolvedDate).length;
  const criticalRisks = metrics.riskFactors.filter(r => r.severity === 'critical' && !r.resolvedDate).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
              {project.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Start:</span>
            <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">End:</span>
            <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium">${project.budget?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Team:</span>
            <span className="font-medium">{project.teamMembers.length} members</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {getMetricIcon(metric.category)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{metric.name}</h3>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${getMetricColor(metric)}`}>
                    {typeof metric.value === 'number' ? metric.value.toFixed(metric.unit === '%' ? 0 : 2) : metric.value}
                  </span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  metric.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">vs target</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-xl font-semibold text-gray-900">{metrics.completedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hours Logged</p>
              <p className="text-xl font-semibold text-gray-900">{Math.round(metrics.totalHours)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${criticalRisks > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`h-5 w-5 ${criticalRisks > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Risks</p>
              <p className="text-xl font-semibold text-gray-900">{risksCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Milestones</p>
              <p className="text-xl font-semibold text-gray-900">
                {project.milestones.filter(m => m.completed).length}/{project.milestones.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      {criticalRisks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-900">Critical Risks Detected</h3>
          </div>
          <div className="space-y-2">
            {metrics.riskFactors
              .filter(r => r.severity === 'critical' && !r.resolvedDate)
              .slice(0, 3)
              .map((risk) => (
                <div key={risk.id} className="text-sm text-red-800">
                  <strong>{risk.type.toUpperCase()}:</strong> {risk.description}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}