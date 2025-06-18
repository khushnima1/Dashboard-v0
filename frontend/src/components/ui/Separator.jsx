import React from 'react';

const Separator = ({ orientation = 'horizontal', className = '' }) => {
  const baseStyles = 'bg-gray-200';
  const orientationStyles = orientation === 'vertical' 
    ? 'w-[1px] h-full' 
    : 'h-[1px] w-full';

  return (
    <div className={`${baseStyles} ${orientationStyles} ${className}`} />
  );
};

export default Separator; 