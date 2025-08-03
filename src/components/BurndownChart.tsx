import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus, Calendar, Target, AlertTriangle } from 'lucide-react';
import type { BurndownPoint, ProjectMetrics } from '../types';

interface BurndownChartProps {
  burndownData: BurndownPoint[];
  projectMetrics: ProjectMetrics;
  sprintName?: string;
  className?: string;
}

export function BurndownChart({ 
  burndownData, 
  projectMetrics, 
  sprintName = "Current Sprint",
  className = "" 
}: BurndownChartProps) {
  const { chartData, maxValue, projectedEndDate, isOnTrack } = useMemo(() => {
    if (!burndownData.length) {
      return { chartData: [], maxValue: 0, projectedEndDate: null, isOnTrack: true };
    }

    const max = Math.max(...burndownData.flatMap(d => [d.remainingWork, d.idealWork, d.actualWork]));
    
    // Calculate projected end date based on current velocity
    const recentPoints = burndownData.slice(-3);
    const avgVelocity = recentPoints.length > 1 
      ? recentPoints.reduce((sum, point, index) => {
          if (index === 0) return 0;
          return sum + (recentPoints[index - 1].remainingWork - point.remainingWork);
        }, 0) / (recentPoints.length - 1)
      : 0;

    const lastPoint = burndownData[burndownData.length - 1];
    const daysToComplete = avgVelocity > 0 ? Math.ceil(lastPoint.remainingWork / avgVelocity) : null;
    const projected = daysToComplete 
      ? new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    const onTrack = lastPoint.remainingWork <= lastPoint.idealWork * 1.1; // 10% tolerance

    return {
      chartData: burndownData,
      maxValue: max * 1.1, // Add 10% padding
      projectedEndDate: projected,
      isOnTrack: onTrack
    };
  }, [burndownData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTrendIcon = () => {
    if (chartData.length < 2) return <Minus className="h-4 w-4 text-gray-500" />;
    
    const recent = chartData.slice(-2);
    const trend = recent[1].remainingWork - recent[0].remainingWork;
    
    if (trend < -1) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (trend > 1) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getHealthColor = () => {
    if (isOnTrack) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!chartData.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Burndown Data</h3>
          <p className="text-gray-600">Start tracking tasks to see your burndown chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-purple-600" />
            <span>{sprintName} Burndown</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Task completion progress over time</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${getHealthColor()}`}>
          {isOnTrack ? (
            <Target className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isOnTrack ? 'On Track' : 'At Risk'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart lines */}
          {chartData.length > 1 && (
            <>
              {/* Ideal line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 380 + 10;
                  const y = 190 - (point.idealWork / maxValue) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Actual line */}
              <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                points={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 380 + 10;
                  const y = 190 - (point.remainingWork / maxValue) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 380 + 10;
                const y = 190 - (point.remainingWork / maxValue) * 180;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#8b5cf6"
                    stroke="#fff"
                    strokeWidth="2"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${formatDate(point.date)}: ${point.remainingWork} tasks remaining`}</title>
                  </circle>
                );
              })}
            </>
          )}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-lg p-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-purple-600"></div>
              <span className="text-gray-600">Actual</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-600 border-dashed border"></div>
              <span className="text-gray-600">Ideal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tasks Remaining</span>
            {getTrendIcon()}
          </div>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {chartData[chartData.length - 1]?.remainingWork || 0}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-sm text-gray-600">Completion</span>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {Math.round(((projectMetrics.totalTasks - (chartData[chartData.length - 1]?.remainingWork || 0)) / projectMetrics.totalTasks) * 100)}%
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-sm text-gray-600">Velocity</span>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {projectMetrics.velocity}
          </p>
          <span className="text-xs text-gray-500">tasks/day</span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-sm text-gray-600">Projected End</span>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {projectedEndDate ? formatDate(projectedEndDate) : 'TBD'}
          </p>
        </div>
      </div>

      {/* Risk Factors */}
      {projectMetrics.riskFactors.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Active Risk Factors</span>
          </div>
          <div className="space-y-1">
            {projectMetrics.riskFactors.slice(0, 2).map((risk) => (
              <p key={risk.id} className="text-xs text-yellow-700">
                • {risk.description}
              </p>
            ))}
            {projectMetrics.riskFactors.length > 2 && (
              <p className="text-xs text-yellow-600 font-medium">
                +{projectMetrics.riskFactors.length - 2} more risks
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}