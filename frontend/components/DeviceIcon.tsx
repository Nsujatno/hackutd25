import React from 'react';
import { Server, Cpu, Zap, AlertTriangle } from 'lucide-react';

export type DeviceType = 'H100' | 'Server' | 'PDU' | 'Switch' | 'Cable';

interface DeviceIconProps {
  type: DeviceType;
}

export const DeviceIcon: React.FC<DeviceIconProps> = ({ type }) => {
  const icons = {
    H100: Cpu,
    Server: Server,
    PDU: Zap,
    Switch: Server,
    Cable: Zap
  };

  const Icon = icons[type] ?? AlertTriangle;

  return <Icon className="w-5 h-5" />;
};
