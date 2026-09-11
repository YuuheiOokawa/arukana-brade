import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function ConfirmDialog({ title, children, busy = false, onCancel, onConfirm }: {
  title: string; children: ReactNode; busy?: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="commerce-dialog" aria-labelledby={titleId}
    onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }}>
    <div className="commerce-dialog-heading"><span className="action-icon"><Icon name="shop"/></span>
      <h2 id={titleId}>{title}</h2></div>
    {children}
    <div className="commerce-dialog-actions">
      <button autoFocus disabled={busy} onClick={onCancel}>キャンセル</button>
      <button className="commerce-primary" disabled={busy} onClick={onConfirm}>{busy ? '購入処理中…' : '購入を確定'}</button>
    </div>
  </dialog>;
}
