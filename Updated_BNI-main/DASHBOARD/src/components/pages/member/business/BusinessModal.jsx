import React, { useEffect, useState } from "react";

import Modal from "react-modal";

// BusinessModal component
const BusinessModal = ({ business, onClose }) => {
  if (!business) {
    return null; // If business is null or undefined, do not render the modal
  }

  return (
    <Modal
      isOpen={!!business}
      onRequestClose={onClose}
      contentLabel="Business Details"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Business Details</h2>
        <p>
          <strong>ID:</strong> {business.id}
        </p>
        <p>
          <strong>Banner Image:</strong>
        </p>
        <img
          src={`/api/image/download/${business.bannerImg}`}
          alt="Banner"
          width="100"
          height="100"
        />
        <p>
          <strong>Profile Image:</strong>
        </p>
        <img
          src={`/api/image/download/${business.profileImg}`}
          alt="Profile"
          width="100"
          height="100"
        />
        <p>
          <strong>WhatsApp:</strong>{" "}
          <a
            href={business.contactLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </p>
        <p>
          <strong>Designation:</strong> {business.designation}
        </p>
        <p>
          <strong>About Company:</strong> {business.aboutCompany}
        </p>
        <p>
          <strong>Company Address:</strong> {business.companyAddress}
        </p>
        <p>
          <strong>Industry:</strong> {business.industryName}
        </p>
        <p>
          <strong>Catalog:</strong>{" "}
          {business.catalog ? (
            <a href={`/api/pdf/download/${business.catalog}`} download>
              Download Catalog
            </a>
          ) : (
            <span>No Catalog</span>
          )}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default BusinessModal;
