import type { ReactNode } from 'react';

type ModalBackdropProps = {
  children: ReactNode;
};

export function ModalBackdrop({ children }: ModalBackdropProps) {
  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
