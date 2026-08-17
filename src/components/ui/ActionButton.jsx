import React, { createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faCheck,
  faEye,
  faForward,
  faLegal,
  faPlus,
  faUnlock,
  faPrint,
  faThumbsDown,
  faThumbsUp,
  faTrash,
  faBookAtlas,
  faCloudArrowDown,
  faEnvelopeCircleCheck,
  faX,
  faShield,
  faForwardStep,
  faPhotoFilm
} from '@fortawesome/free-solid-svg-icons';

const ActionButtonsContext = createContext(undefined);

function useActionButtonsContext() {
  const context = useContext(ActionButtonsContext);
  // Returns an empty object if context is missing to prevent destructuring crashes
  if (!context) {
    // console.warn('ActionButtons components must be wrapped in <ActionButtons>');
  }
  return context || {};
}

// ----------------------------------------------------------------------
// Tailwind utility variables replacing CoreUI sizes, variants, and colors
// ----------------------------------------------------------------------
const baseBtn = 'inline-flex items-center justify-center p-1.5 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50';

const ghostDefault = `${baseBtn} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
const ghostSuccess = `${baseBtn} text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100`;
const ghostDanger = `${baseBtn} text-rose-600 hover:text-rose-700 hover:bg-rose-100`;

// ----------------------------------------------------------------------
// Main Wrapper Component
// ----------------------------------------------------------------------
export default function ActionButtons({ children, ...props }) {
  return (
    <div className="inline-flex items-center p-0 m-0 static z-[150]">
      <ActionButtonsContext.Provider value={{ ...props }}>
        {children}
      </ActionButtonsContext.Provider>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------
ActionButtons.Add = function ActionButtonsAdd() {
  const { onAdd } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onAdd && onAdd()}>
      <FontAwesomeIcon icon={faPlus} />
    </button>
  );
};

ActionButtons.Download = function ActionButtonsDownload() {
  const { onDownload } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onDownload && onDownload()}>
      <FontAwesomeIcon icon={faCloudArrowDown} />
    </button>
  );
};

ActionButtons.View = function ActionButtonsView() {
  const { onView } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onView && onView()}>
      <FontAwesomeIcon icon={faEye} />
    </button>
  );
};

ActionButtons.Email = function ActionButtonsEmail() {
  const { onEmail } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onEmail && onEmail()}>
      <FontAwesomeIcon icon={faEnvelopeCircleCheck} />
    </button>
  );
};

ActionButtons.Lock = function ActionButtonsLock() {
  const { onLock, lock } = useActionButtonsContext();
  // Safe check for both string '1' and number 1
  const isLocked = Number(lock) === 1;
  return (
    <button type="button" className={ghostDefault} onClick={() => onLock && onLock()}>
      <FontAwesomeIcon icon={isLocked ? faShield : faUnlock} />
    </button>
  );
};

ActionButtons.Edit = function ActionButtonsEdit() {
  const { onEdit } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onEdit && onEdit()}>
      <FontAwesomeIcon icon={faEdit} />
    </button>
  );
};

ActionButtons.Edit1 = function ActionButtonsEdit1() {
  const { onEdit1 } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onEdit1 && onEdit1()}>
      <FontAwesomeIcon icon={faBookAtlas} />
    </button>
  );
};

ActionButtons.EditPhoto = function ActionButtonsEditPhoto() {
  const { onEditPhoto } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onEditPhoto && onEditPhoto()}>
      <FontAwesomeIcon icon={faPhotoFilm} />
    </button>
  );
};

ActionButtons.Letter = function ActionButtonsLetter() {
  const { onLetter } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onLetter && onLetter()}>
      <FontAwesomeIcon icon={faLegal} />
    </button>
  );
};

ActionButtons.Print = function ActionButtonsPrint() {
  const { onPrint } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onPrint && onPrint()}>
      <FontAwesomeIcon icon={faPrint} />
    </button>
  );
};

ActionButtons.Approve = function ActionButtonsApprove() {
  const { onApprove, isApprove } = useActionButtonsContext();
  const isApproved = Number(isApprove) === 0;
  
  return (
    <button 
      type="button" 
      className={isApproved ? ghostSuccess : ghostDanger} 
      onClick={() => onApprove && onApprove()}
    >
      <FontAwesomeIcon icon={isApproved ? faCheck : faX} />
    </button>
  );
};

ActionButtons.Pop = function ActionButtonsPop() {
  const { pop } = useActionButtonsContext();
  return (
    <span className="inline-flex items-center justify-center rounded bg-blue-500 px-1.5 py-0.5 text-xs font-semibold text-white">
      {pop}
    </span>
  );
};

ActionButtons.Activate = function ActionButtonsActivate({ is_active }) {
  const { onActivate, is_active: passed_is_active = 0 } = useActionButtonsContext();
  
  // Checking both passed context and component props
  const final_is_active = parseInt(passed_is_active, 10) === 1 || parseInt(is_active, 10) === 1 ? 1 : 0;
  
  return (
    <button 
      type="button" 
      className={final_is_active === 0 ? ghostSuccess : ghostDanger} 
      onClick={() => onActivate && onActivate()}
    >
      <FontAwesomeIcon icon={final_is_active === 0 ? faThumbsUp : faThumbsDown} />
    </button>
  );
};

ActionButtons.Deactivate = function ActionButtonsDeactivate() {
  const { onActivate, is_active = 0 } = useActionButtonsContext();
  const isActive = Number(is_active) === 0;
  
  return (
    <button 
      type="button" 
      className={isActive ? ghostSuccess : ghostDanger} 
      onClick={() => onActivate && onActivate()}
    >
      <FontAwesomeIcon icon={isActive ? faThumbsUp : faThumbsDown} />
    </button>
  );
};

ActionButtons.Delete = function ActionButtonsDelete() {
  const { onDelete } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onDelete && onDelete()}>
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
};

ActionButtons.Next = function ActionButtonsNext() {
  const { onNext } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onNext && onNext()}>
      <FontAwesomeIcon icon={faForward} />
    </button>
  );
};

ActionButtons.Next1 = function ActionButtonsNext1() {
  const { onNext1 } = useActionButtonsContext();
  return (
    <button type="button" className={ghostDefault} onClick={() => onNext1 && onNext1()}>
      <FontAwesomeIcon icon={faForwardStep} />
    </button>
  );
};