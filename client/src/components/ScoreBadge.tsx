import React from 'react';
import { ScoreBadgeProps } from '../types';

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, label, size = 'md' }) => {
  const getScoreLevel = (score: number) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getScoreClasses = (level: string, size: string) => {
    const baseClasses = 'score-badge';
    const sizeClasses = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-2',
      lg: 'text-base px-4 py-3'
    };
    
    const levelClasses = {
      high: 'score-high',
      medium: 'score-medium',
      low: 'score-low'
    };

    return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses]} ${levelClasses[level as keyof typeof levelClasses]}`;
  };

  const scoreLevel = getScoreLevel(score);
  const classes = getScoreClasses(scoreLevel, size);

  return (
    <div className={classes}>
      {typeof score === 'number' ? `${score}/100` : label}
    </div>
  );
};

export default ScoreBadge;
