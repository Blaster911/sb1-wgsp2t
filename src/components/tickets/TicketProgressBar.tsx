import React from 'react';
import { Check, Timer, Wrench, PackageSearch, UserCheck, FlagTriangleRight } from 'lucide-react';
import { TicketStatus } from '../../types/ticket';

interface TicketProgressBarProps {
  currentStatus: TicketStatus;
}

const steps: { 
  status: TicketStatus; 
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { 
    status: 'reception', 
    label: 'Réception', 
    icon: Timer,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    status: 'diagnostic', 
    label: 'Diagnostic', 
    icon: Wrench,
    color: 'from-purple-500 to-purple-600'
  },
  { 
    status: 'waiting_client', 
    label: 'Validation client', 
    icon: UserCheck,
    color: 'from-yellow-500 to-yellow-600'
  },
  { 
    status: 'waiting_parts', 
    label: 'Commande pièces', 
    icon: PackageSearch,
    color: 'from-orange-500 to-orange-600'
  },
  { 
    status: 'completed', 
    label: 'Terminé', 
    icon: FlagTriangleRight,
    color: 'from-green-500 to-green-600'
  }
];

export function TicketProgressBar({ currentStatus }: TicketProgressBarProps) {
  const currentStep = steps.findIndex(step => step.status === currentStatus);

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between px-8 py-4">
        <div className="absolute left-[44px] right-[44px] top-[38px] h-[2px] bg-gray-200" />
        <div 
          className="absolute left-[44px] top-[38px] h-[2px] bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-500"
          style={{ 
            width: currentStep === 0 
              ? '0%' 
              : `calc(${(currentStep / (steps.length - 1)) * 100}% - ${currentStep === steps.length - 1 ? '0px' : '0px'})`
          }} 
        />

        <div className="relative flex justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div 
                key={step.status}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`
                    w-11 h-11 rounded-xl
                    flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg shadow-blue-500/20' 
                      : 'bg-white border-2 border-gray-200'
                    }
                    ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                    group
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}

                  <div className="absolute -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap">
                      {step.label}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>
                </div>

                <span className={`
                  mt-3 text-xs font-medium transition-colors duration-300 whitespace-nowrap
                  ${isCompleted ? 'text-blue-600' : isCurrent ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>

                {isCurrent && (
                  <div className="flex gap-1 mt-2">
                    <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse delay-75" />
                    <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse delay-150" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}