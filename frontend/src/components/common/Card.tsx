import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-[#FEEAC9] ${
        hoverable ? 'hover:shadow-md hover:border-[#FDACAC] transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`px-5 py-4 border-b border-[#FEEAC9] ${className}`}>
    {children}
  </div>
);

export const CardBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`p-5 ${className}`}>{children}</div>;

export const CardFooter = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`px-5 py-4 border-t border-[#FEEAC9] bg-[#FEEAC9]/20 rounded-b-2xl ${className}`}>
    {children}
  </div>
);
