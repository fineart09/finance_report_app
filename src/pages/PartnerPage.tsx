import { useEffect, useState } from 'react';
import { mockPartnerCatalogApi, type PartnerCatalogItem } from '../api/mockPartnerCatalogApi';
import './PartnerPage.css';

export default function PartnerPage() {
  const [rows, setRows] = useState<PartnerCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartnerCode, setNewPartnerCode] = useState('');
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState('');
  const [formError, setFormError] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPartners = async () => {
      try {
        const data = await mockPartnerCatalogApi.getPartnerCatalog();
        if (isMounted) {
          setRows(data);
          setErrorMessage('');
        }
      } catch {
        if (isMounted) {
          setRows([]);
          setErrorMessage('Cannot load partner catalog data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPartners();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setNewPartnerCode('');
    setNewPartnerName('');
    setNewPartnerType('');
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

  const handleCreatePartner = async () => {
    const partnerCode = newPartnerCode.trim();
    const partnerName = newPartnerName.trim();
    const partnerType = newPartnerType.trim();

    if (partnerCode === '' || partnerName === '' || partnerType === '') {
      setFormError('Please fill all fields.');
      return;
    }

    try {
      const newItem = await mockPartnerCatalogApi.createPartner({
        partnerCode,
        partnerName,
        partnerType,
      });

      setRows((currentRows) => [...currentRows, newItem]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cannot create partner.';
      setFormError(message);
    }
  };

  const normalizedSearchText = searchText.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    if (normalizedSearchText === '') {
      return true;
    }

    return (
      row.partnerCode.toLowerCase().includes(normalizedSearchText) ||
      row.partnerName.toLowerCase().includes(normalizedSearchText) ||
      row.partnerType.toLowerCase().includes(normalizedSearchText)
    );
  });

  return (
    <div className="page-card partner-list-page">
      <div className="partner-list-header">
        <h1 className="partner-list-title">Partner</h1>
        <button type="button" className="create-new-button" onClick={handleOpenModal}>
          Create New
        </button>
      </div>

      {errorMessage ? <p className="partner-list-message error">{errorMessage}</p> : null}

      {isLoading ? <p className="partner-list-message">Loading partner catalog...</p> : null}

      {!isLoading && !errorMessage ? (
        <>
          <div className="partner-search-bar">
            <label className="partner-search-label" htmlFor="partner-search-input">
              Search
            </label>
            <input
              id="partner-search-input"
              type="text"
              className="partner-search-input"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search like: code, name, type"
              aria-label="Search partner catalog"
            />
          </div>

          <div className="partner-list-table-wrapper" role="region" aria-label="Partner catalog table">
            <table className="partner-list-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Partner Code</th>
                  <th>Partner Name</th>
                  <th>Partner Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state-cell">
                      No partner catalog data found. Click Create New to add one.
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
                      <td>{row.partnerCode}</td>
                      <td>{row.partnerName}</td>
                      <td>{row.partnerType}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {isModalOpen ? (
        <div className="partner-modal-overlay" role="presentation" onClick={handleCloseModal}>
          <div
            className="partner-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create master partner"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="partner-modal-title">Create Master Partner</h2>

            <label className="partner-modal-label" htmlFor="partner-code-input">
              Partner Code
            </label>
            <input
              id="partner-code-input"
              className="partner-modal-input"
              type="text"
              value={newPartnerCode}
              onChange={(event) => setNewPartnerCode(event.target.value)}
              placeholder="PT-021"
            />

            <label className="partner-modal-label" htmlFor="partner-name-input">
              Partner Name
            </label>
            <input
              id="partner-name-input"
              className="partner-modal-input"
              type="text"
              value={newPartnerName}
              onChange={(event) => setNewPartnerName(event.target.value)}
              placeholder="Partner name"
            />

            <label className="partner-modal-label" htmlFor="partner-type-input">
              Partner Type
            </label>
            <input
              id="partner-type-input"
              className="partner-modal-input"
              type="text"
              value={newPartnerType}
              onChange={(event) => setNewPartnerType(event.target.value)}
              placeholder="Type"
            />

            {formError ? <p className="partner-modal-error">{formError}</p> : null}

            <div className="partner-modal-actions">
              <button type="button" className="partner-modal-button secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="button" className="partner-modal-button primary" onClick={handleCreatePartner}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
