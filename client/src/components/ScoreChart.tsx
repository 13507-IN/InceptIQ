import React from 'react';

interface ScoreChartProps {
  score: number;
  maxScore?: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score, maxScore = 100 }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-success-500';
    if (score >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>0</span>
        <span>{maxScore}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-center mt-2">
        <span className="text-lg font-semibold text-gray-900">{score}</span>
        <span className="text-sm text-gray-500">/{maxScore}</span>
      </div>
    </div>
  );
};

export default ScoreChart;
