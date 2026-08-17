import ActionButtons from "../../../components/tools/ActionButton";

export const tableActionMap = {
    3: (row, onEdit, onActivate, onDelete, onNext) => ( // Session
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
            onActivate={() => onActivate(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Delete />
            <ActionButtons.Activate />
            <ActionButtons.Next />
        </ActionButtons>
    ),
    4: (row, onEdit, onActivate, onDelete, onNext) => ( // School
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    5: (row, onEdit, onActivate, onDelete, onNext) => ( // Departments
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    ),
    6: (row, onEdit, onActivate, onDelete, onNext) => ( // Subject
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    7: (row, onEdit, onActivate, onDelete, onNext) => ( // Account
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    8: (row, onEdit, onActivate, onDelete, onNext) => ( // Pension
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    9: (row, onEdit, onActivate, onDelete, onNext) => ( // Class
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    ),
    10: (row, onEdit, onActivate, onDelete, onNext) => ( // Grades
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    ),
    11: (row, onEdit, onActivate, onDelete, onNext) => ( // Role
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    ),
    12: (row, onEdit, onActivate, onDelete, onNext) => ( // Levels
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    ),
    13: (row, onEdit, onActivate, onDelete, onNext) => ( // Nature of Employment
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    14: (row, onEdit, onActivate, onDelete, onNext) => ( // Timing
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    15: (row, onEdit, onActivate, onDelete, onNext) => ( // Banks
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    16: (row, onEdit, onActivate, onDelete, onNext) => ( // Reason for Leaving
        <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onActivate={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => {}}
        >
            <ActionButtons.Edit />
            <ActionButtons.Activate />
            <ActionButtons.Delete />
        </ActionButtons>
    ),
    17: (row, onEdit, onActivate, onDelete, onNext) => ( // Reason for Leaving
        <ActionButtons
            row={row}
            isApprove={row?.is_approved ?? 0}
            onEdit={() => onEdit(row)}
            onApprove={() => onActivate(row)}
            onDelete={() => onDelete(row)}
            onNext={() => onNext(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Approve />
            <ActionButtons.Delete />
            <ActionButtons.Next />
        </ActionButtons>
    ),
   
};