import { Modal } from './Modal';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onCancel}>
      <p className="text-muted mb-4">{message}</p>
      <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}