import { useEffect, useState } from 'react';
import { mockExpenseCatalogApi, type ExpenseCatalogItem } from '../api/mockExpenseCatalogApi';
import { mockPartnerCatalogApi, type PartnerCatalogItem } from '../api/mockPartnerCatalogApi';
import { mockUserCatalogApi, type UserCatalogItem } from '../api/mockUserCatalogApi';
import { mockExpenseStageApi } from '../api/mockExpenseStageApi';
import { storageConfig } from '../config/storageConfig';
import { saveAttachmentsLocally } from '../utils/localAttachmentStorage';
import './CreateExpensePage.css';

const wbsOptions = ['WBS-1001', 'WBS-1002', 'WBS-1003'];

type ExpenseRow = {
  id: number;
  partner: string;
  description: string;
  wbs: string;
  value: string;
  requestBy: string;
  attachmentFile: File | null;
  attachmentName: string;
  attachmentSavedPath: string;
  isSaved: boolean;
};

type EditableTextField = 'partner' | 'description' | 'wbs' | 'value' | 'requestBy';

function createEmptyRow(id: number): ExpenseRow {
  return {
    id,
    partner: '',
    description: '',
    wbs: '',
    value: '',
    requestBy: '',
    attachmentFile: null,
    attachmentName: '',
    attachmentSavedPath: '',
    isSaved: false,
  };
}

function TrashIcon() {
  return (
    <svg className="trash-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
    </svg>
  );
}

export default function CreateExpensePage() {
  const [rows, setRows] = useState<ExpenseRow[]>([createEmptyRow(1)]);
  const [partnerCatalog, setPartnerCatalog] = useState<PartnerCatalogItem[]>([]);
  const [userCatalog, setUserCatalog] = useState<UserCatalogItem[]>([]);
  const [expenseCatalog, setExpenseCatalog] = useState<ExpenseCatalogItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const catalogRows = await mockExpenseCatalogApi.getExpenseCatalog();
        if (isMounted) {
          setExpenseCatalog(catalogRows);
        }
      } catch {
        if (isMounted) {
          setExpenseCatalog([]);
        }
      }
    };

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPartners = async () => {
      try {
        const partnerRows = await mockPartnerCatalogApi.getPartnerCatalog();
        if (isMounted) {
          setPartnerCatalog(partnerRows);
        }
      } catch {
        if (isMounted) {
          setPartnerCatalog([]);
        }
      }
    };

    void loadPartners();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const userRows = await mockUserCatalogApi.getUserCatalog();
        if (isMounted) {
          setUserCatalog(userRows);
        }
      } catch {
        if (isMounted) {
          setUserCatalog([]);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const descriptionOptions = expenseCatalog.map((item) => item.description);
  const partnerOptions = partnerCatalog.map((item) => item.partnerName);
  const requestByOptions = userCatalog.map((item) => `${item.fullName} (${item.role})`);

  const updateRow = (id: number, field: EditableTextField, value: string) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              isSaved: false,
            }
          : row,
      ),
    );
  };

  const handleAttachmentChange = (rowId: number, file: File | null) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              attachmentFile: file,
              attachmentName: file?.name ?? '',
              attachmentSavedPath: '',
              isSaved: false,
            }
          : row,
      ),
    );
  };

  const hasAnyData = (row: ExpenseRow) =>
    row.partner.trim() !== '' ||
    row.description.trim() !== '' ||
    row.wbs.trim() !== '' ||
    row.value.trim() !== '' ||
    row.requestBy.trim() !== '' ||
    row.attachmentFile !== null;

  const handleSave = async () => {
    const rowsToSave = rows.filter((row) => hasAnyData(row) && !row.isSaved);

    if (rowsToSave.length === 0) {
      setMessageType('error');
      setMessage('No new row to save.');
      return;
    }

    const hasIncompleteRows = rowsToSave.some(
      (row) =>
        row.partner.trim() === '' ||
        row.description.trim() === '' ||
        row.wbs.trim() === '' ||
        row.value.trim() === '' ||
        row.requestBy.trim() === '',
    );

    if (hasIncompleteRows) {
      setMessageType('error');
      setMessage('Please fill all fields before saving.');
      return;
    }

    const hasInvalidValue = rowsToSave.some((row) => Number(row.value) <= 0 || Number.isNaN(Number(row.value)));

    if (hasInvalidValue) {
      setMessageType('error');
      setMessage('Value must be a number greater than 0.');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');
      setMessageType('');

      const attachmentPathMap = await saveAttachmentsLocally(
        rowsToSave.map((row) => ({
          rowId: row.id,
          file: row.attachmentFile,
        })),
      );

      const result = await mockExpenseStageApi.stageExpenses(
        rowsToSave.map((row) => ({
          partner: row.partner,
          description: row.description,
          wbs: row.wbs,
          value: Number(row.value),
          requestBy: row.requestBy,
          attachmentPath: attachmentPathMap.get(row.id),
        })),
      );

      const savedIds = new Set(rowsToSave.map((row) => row.id));
      setRows((currentRows) => {
        const updatedRows = currentRows.map((row) =>
          savedIds.has(row.id)
            ? {
                ...row,
                attachmentFile: null,
                attachmentSavedPath: attachmentPathMap.get(row.id) ?? row.attachmentSavedPath,
                isSaved: true,
              }
            : row,
        );

        const maxId = updatedRows.reduce((max, row) => Math.max(max, row.id), 0);
        return [...updatedRows, createEmptyRow(maxId + 1)];
      });

      setMessageType('success');
      setMessage(
        `Staged ${result.stagedCount} row(s). Attachments are saved under ${storageConfig.attachmentBasePath}.`,
      );
    } catch {
      setMessageType('error');
      setMessage('Save failed while staging data or attachments. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRow = (rowId: number) => {
    const shouldDelete = window.confirm(`Delete row ${rowId}?`);
    if (!shouldDelete) {
      return;
    }

    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== rowId);
      if (nextRows.length === 0) {
        return [createEmptyRow(1)];
      }
      return nextRows;
    });
    setMessage('');
    setMessageType('');
  };

  return (
    <div className="page-card create-expense-page">
      <h1 className="create-expense-title">Create Expense</h1>

      <div className="create-expense-actions">
        <button type="button" className="save-button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {message ? <p className={`save-message ${messageType}`}>{message}</p> : null}

      <div className="expense-table-wrapper" role="region" aria-label="Expense input table">
        <table className="expense-table">
          <thead>
            <tr className="table-hints">
              <th>auto gen</th>
              <th>dropdown</th>
              <th>dropdown</th>
              <th>dropdown</th>
              <th>free text (int)</th>
              <th>by user login</th>
              <th>file/image</th>
              <th>action</th>
            </tr>
            <tr className="table-columns">
              <th>no</th>
              <th>partner</th>
              <th>description</th>
              <th>wbs</th>
              <th>value</th>
              <th>request by</th>
              <th>attachment</th>
              <th>delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.isSaved ? 'saved-row' : ''}>
                <td>{row.id}</td>
                <td>
                  <select
                    aria-label={`Partner row ${row.id}`}
                    value={row.partner}
                    onChange={(event) => updateRow(row.id, 'partner', event.target.value)}
                  >
                    <option value=""> </option>
                    {partnerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    aria-label={`Description row ${row.id}`}
                    value={row.description}
                    onChange={(event) => updateRow(row.id, 'description', event.target.value)}
                  >
                    <option value=""> </option>
                    {descriptionOptions.map((description) => (
                      <option key={description} value={description}>
                        {description}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select aria-label={`WBS row ${row.id}`} value={row.wbs} onChange={(event) => updateRow(row.id, 'wbs', event.target.value)}>
                    <option value=""> </option>
                    {wbsOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={row.value}
                    onChange={(event) => updateRow(row.id, 'value', event.target.value)}
                    aria-label={`Value row ${row.id}`}
                  />
                </td>
                <td>
                  <select
                    value={row.requestBy}
                    onChange={(event) => updateRow(row.id, 'requestBy', event.target.value)}
                    aria-label={`Request by row ${row.id}`}
                  >
                    <option value=""> </option>
                    {requestByOptions.map((userLabel) => (
                      <option key={userLabel} value={userLabel}>
                        {userLabel}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <label className="attachment-button" htmlFor={`attachment-${row.id}`}>
                    Attach
                  </label>
                  <input
                    id={`attachment-${row.id}`}
                    className="attachment-input"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      handleAttachmentChange(row.id, file);
                    }}
                  />
                  <p className="attachment-file-name">{row.attachmentName || 'No file selected'}</p>
                </td>
                <td className="row-action-cell">
                  <button
                    type="button"
                    className="row-delete-button"
                    onClick={() => handleDeleteRow(row.id)}
                    aria-label={`Delete row ${row.id}`}
                    title={`Delete row ${row.id}`}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
