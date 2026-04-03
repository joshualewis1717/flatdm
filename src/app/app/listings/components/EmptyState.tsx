'use client';
import React from 'react';

// generic empty state component, used when lists are empty e.g. when messages are empty, when listings is empty etc
type EmptyStateProps = {
  title: string;// main text that it should say
  description?: string;// optional secondary description e.g. tell user to add in information
  children?: React.ReactNode;// can be used to include icons or buttons
  fullHeight?: boolean;// should it be full height or not
};

export default function EmptyState({ title, description, children, fullHeight = false,}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center text-white/45
        ${fullHeight ? 'min-h-[60vh]' : 'py-20'}
      `}
    >
      {/* Custom content (icon, actions, etc.) */}
      {children && <div className="mb-5">{children}</div>}

      {/* Title */}
      <h2 className="text-[16px] font-medium text-white mb-1">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-[13px] text-white/45 max-w-[280px]">
          {description}
        </p>
      )}
    </div>
  );
}