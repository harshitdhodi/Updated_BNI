import React from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
const MemberImageModal = ({ isOpen, closeModal, bannerImg, profileImg }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Member Image Modal"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center space-x-8">
          <div>
            <img
              src={`/api/image/download/${bannerImg}`}
              alt="Banner Image"
              className="max-w-full h-auto"
            />
            <p className="text-center">Banner Image</p>
          </div>
          <div>
            <img
              src={`/api/image/download/${profileImg}`}
              alt="Profile Image"
              className="max-w-full h-auto"
            />
            <p className="text-center">Profile Image</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

MemberImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  bannerImg: PropTypes.string.isRequired,
  profileImg: PropTypes.string.isRequired,
};

export default MemberImageModal;
