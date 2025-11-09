import React from 'react';
import { Server, Cpu, Zap } from 'lucide-react';

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
  const Icon = icons[type];
  return <Icon className="w-5 h-5" />;
};