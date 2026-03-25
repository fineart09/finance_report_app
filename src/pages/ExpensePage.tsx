import { useEffect, useState } from 'react';
import { mockExpenseCatalogApi, type ExpenseCatalogItem } from '../api/mockExpenseCatalogApi';
import './ExpensePage.css';

export default function ExpensePage() {
  const [rows, setRows] = useState<ExpenseCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpenseCode, setNewExpenseCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [formError, setFormError] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadExpenses = async () => {
      try {
        const data = await mockExpenseCatalogApi.getExpenseCatalog();
        if (isMounted) {
          setRows(data);
          setErrorMessage('');
        }
      } catch {
        if (isMounted) {
          setRows([]);
          setErrorMessage('Cannot load expense catalog data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadExpenses();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setNewExpenseCode('');
    setNewDescription('');
    setNewCategory('');
    setFormError('');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleCreateMasterExpense = () => {
    const expenseCode = newExpenseCode.trim();
    const description = newDescription.trim();
    const category = newCategory.trim();

    if (expenseCode === '' || description === '' || category === '') {
      setFormError('Please fill all fields.');
      return;
    }

    const hasDuplicateCode = rows.some((row) => row.expenseCode.toLowerCase() === expenseCode.toLowerCase());
    if (hasDuplicateCode) {
      setFormError('Expense code already exists. Please use another code.');
      return;
    }

    const nextId = rows.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;
    const newItem: ExpenseCatalogItem = {
      id: nextId,
      expenseCode,
      description,
      category,
    };

    setRows((currentRows) => [...currentRows, newItem]);
    setIsModalOpen(false);
    resetForm();
  };

  const normalizedSearchText = searchText.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    if (normalizedSearchText === '') {
      return true;
    }

    return (
      row.expenseCode.toLowerCase().includes(normalizedSearchText) ||
      row.description.toLowerCase().includes(normalizedSearchText) ||
      row.category.toLowerCase().includes(normalizedSearchText)
    );
  });

  return (
    <div className="page-card expense-list-page">
      <div className="expense-list-header">
        <h1 className="expense-list-title">Expense</h1>
        <button type="button" className="create-new-button" onClick={handleOpenModal}>
          Create New
        </button>
      </div>

      {errorMessage ? <p className="expense-list-message error">{errorMessage}</p> : null}

      {isLoading ? <p className="expense-list-message">Loading expense catalog...</p> : null}

      {!isLoading && !errorMessage ? (
        <>
          <div className="expense-search-bar">
            <label className="expense-search-label" htmlFor="expense-search-input">
              Search
            </label>
            <input
              id="expense-search-input"
              type="text"
              className="expense-search-input"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search like: code, description, category"
              aria-label="Search expense catalog"
            />
          </div>

          <div className="expense-list-table-wrapper" role="region" aria-label="Expense catalog table">
            <table className="expense-list-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Expense Code</th>
                  <th>Description</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state-cell">
                      No expense catalog data found. Click Create New to add one.
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state-cell">
                      No matching result.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.expenseCode}</td>
                      <td>{row.description}</td>
                      <td>{row.category}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {isModalOpen ? (
        <div className="expense-modal-overlay" role="presentation" onClick={handleCloseModal}>
          <div
            className="expense-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create master expense"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="expense-modal-title">Create Master Expense</h2>

            <label className="expense-modal-label" htmlFor="expense-code-input">
              Expense Code
            </label>
            <input
              id="expense-code-input"
              className="expense-modal-input"
              type="text"
              value={newExpenseCode}
              onChange={(event) => setNewExpenseCode(event.target.value)}
              placeholder="EXP-021"
            />

            <label className="expense-modal-label" htmlFor="expense-description-input">
              Description
            </label>
            <input
              id="expense-description-input"
              className="expense-modal-input"
              type="text"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Example description"
            />

            <label className="expense-modal-label" htmlFor="expense-category-input">
              Category
            </label>
            <input
              id="expense-category-input"
              className="expense-modal-input"
              type="text"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Category"
            />

            {formError ? <p className="expense-modal-error">{formError}</p> : null}

            <div className="expense-modal-actions">
              <button type="button" className="expense-modal-button secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="button" className="expense-modal-button primary" onClick={handleCreateMasterExpense}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
