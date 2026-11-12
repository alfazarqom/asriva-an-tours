import React from 'react';
import { AppNotification } from '../../types/travel';
import { ModalDialog } from '../ui/ModalDialog';

export interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  open,
  onClose,
  notifications
}) => (
  <ModalDialog open={open} title="Notifikasi & Pembaruan" onClose={onClose}>
    <div className="space-y-2.5">
      {notifications.map((n) => (
        <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-900">{n.title}</span>
            <span className="text-[10px] text-slate-400">{n.time}</span>
          </div>
          <p className="text-slate-600">{n.message}</p>
        </div>
      ))}
    </div>
  </ModalDialog>
);
