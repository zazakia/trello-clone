import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Users, 
  Download,
  RefreshCw
} from 'lucide-react';
import { KPIDashboard } from './KPIDashboard';
import { BurndownChart } from './BurndownChart';
import { projectAnalyticsService } from '../services/projectAnalyticsService';
import type { Project } from '../types';

interface ProjectAnalyticsDashboardProps {
  project: Project;
  onClose: () => void;
}

export function ProjectAnalyticsDashboard({ project, onClose }: ProjectAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'burndown' | 'timeline' | 'team'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  const metrics = useMemo(() => {
    return projectAnalyticsService.calculateProjectMetrics(project);
  }, [project]);

  const healthScore = useMemo(() => {
    return projectAnalyticsService.calculateHealthScore(project);
  }, [project]);

  const timelineData = useMemo(() => {
    return projectAnalyticsService.generateTimelineData(project);
  }, [project]);

  const teamUtilization = useMemo(() => {
    return projectAnalyticsService.calculateTeamUtilization(project);
  }, [project]);

  const milestoneProgress = useMemo(() => {
    return projectAnalyticsService.calculateMilestoneProgress(project.milestones || []);
  }, [project.milestones]);

  // Update project with calculated health score and default values
  const projectWithHealth: Project = {
    ...project,
    startDate: project.startDate || project.created_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: project.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: project.status || 'active',
    healthScore,
    completionPercentage: project.completionPercentage || 0,
    milestones: project.milestones || [],
    teamMembers: project.teamMembers || [],
    timeEntries: project.timeEntries || []
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'burndown', label: 'Burndown', icon: TrendingUp },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users }
  ];

  const handleExportData = () => {
    const data = {
      project: projectWithHealth,
      metrics,
      timelineData,
      teamUtilization,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Analytics</h2>
              <p className="text-gray-600">{project.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
            
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 px-6 py-3 border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'burndown' | 'timeline' | 'team')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <KPIDashboard project={projectWithHealth} metrics={metrics} />
          )}
          
          {activeTab === 'burndown' && (
            <div className="space-y-6">
              <BurndownChart 
                burndownData={metrics.burndownData}
                projectMetrics={metrics}
                sprintName="Current Sprint"
              />
              
              {/* Additional Burndown Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sprint Velocity</span>
                      <span className="font-semibold">{metrics.velocity} tasks/sprint</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Task Size</span>
                      <span className="font-semibold">
                        {metrics.totalTasks > 0 ? Math.round(metrics.totalHours / metrics.totalTasks) : 0}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold">
                        {metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Progress</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold">{milestoneProgress.completed}/{milestoneProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${milestoneProgress.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(milestoneProgress.percentage)}% of milestones completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>
                
                {/* Project Phases */}
                <div className="space-y-4">
                  {timelineData.phases.map((phase, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        phase.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{phase.name}</span>
                          <span className="text-sm text-gray-600">{phase.duration} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              phase.completed ? 'bg-green-500' : 'bg-purple-600'
                            }`}
                            style={{ width: phase.completed ? '100%' : '60%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Milestones */}
                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4">Upcoming Milestones</h4>
                  <div className="space-y-3">
                    {timelineData.milestones.slice(0, 5).map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            milestone.completed ? 'bg-green-500' : milestone.isOverdue ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <span className="font-medium text-gray-900">{milestone.title}</span>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                          {milestone.isOverdue && (
                            <div className="text-xs text-red-600">Overdue</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance</h3>
                
                <div className="space-y-4">
                  {teamUtilization.map((member, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{member.member}</span>
                        <span className="text-sm text-gray-600">{member.hoursLogged}h logged</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Utilization</span>
                          <span className="font-medium">{member.utilization}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              member.utilization > 90 ? 'bg-red-500' : 
                              member.utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(member.utilization, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Efficiency</span>
                          <span className="font-medium">{Math.round(member.efficiency)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}