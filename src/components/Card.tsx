import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  const hoverStyles = hover
    ? 'transition-transform duration-300 hover:shadow-xl hover:-translate-y-1'
    : '';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-border dark:border-gray-700 ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};

