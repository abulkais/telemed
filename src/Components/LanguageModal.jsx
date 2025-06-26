import React, { useContext, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LanguageModal = ({ show, onClose }) => {
  const { language, changeLanguage } = useContext(ThemeContext);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languages = [
    "Arabic", "Chinese", "German", "Turkish", "Russian", "Spanish", "French", "English"
  ];

  const handleSave = () => {
    changeLanguage(selectedLanguage);
    toast.success(`Language changed to ${selectedLanguage}`);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Change Language</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <select
              className="form-control"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LanguageModal;