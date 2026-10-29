import { useEffect, useId, useRef, useState } from 'react';
import { Clock, ChevronRight, X } from 'lucide-react';

export default function WorkflowDrawer({ children, currentOwner, closed = false }) {
  const [isOpen, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = event => { if (event.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [isOpen]);

  const close = () => setOpen(false);
  const outsidePanel = event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  };

  return <div className="lg:hidden">
    <button ref={triggerRef} type="button" aria-haspopup="dialog" aria-controls={id} aria-expanded={isOpen}
      onClick={() => setOpen(true)}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
      <span className="flex min-w-0 items-center gap-2"><Clock size={18} className="shrink-0"/><span><strong className="block text-sm">Workflow Steps</strong><span className="mt-0.5 block text-xs">{closed ? 'Workflow closed' : `With ${currentOwner || 'current approver'}`}</span></span></span>
      <ChevronRight size={18} className="shrink-0"/>
    </button>
    <dialog ref={dialogRef} id={id} aria-modal="true" aria-labelledby={`${id}-title`}
      onClose={() => { setOpen(false); triggerRef.current?.focus(); }} onClick={outsidePanel}
      className="workflow-stage-drawer fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-80 max-w-[88vw] border-0 border-l border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold"><Clock size={18}/>Workflow Progress</h2>
          <button type="button" aria-label="Close workflow steps" onClick={close} className="flex size-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"><X size={20}/></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">{children}</div>
      </div>
    </dialog>
    <style>{`@keyframes workflow-stage-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } } @media (prefers-reduced-motion: no-preference) { .workflow-stage-drawer[open] { animation: workflow-stage-drawer-in 180ms ease-out; } }`}</style>
  </div>;
}
