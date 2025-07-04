import React from "react";
const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
}) => {
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  return (
    <div className="d-flex justify-content-between align-items-center px-3 py-3 bg-white">
      <div>
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)} of{" "}
        {totalPages * itemsPerPage} results
      </div>

      <div>
        <select
          className="form-control"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          style={{ padding: "5px", fontSize: "14px" }}
        >
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={500}>500</option>
        </select>
      </div>

      <nav>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="fa fa-angle-left fa-lg" />
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(1)}>
              1
            </button>
          </li>
          {currentPage > 4 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (number) =>
                number > 1 &&
                number < totalPages &&
                Math.abs(number - currentPage) <= 2
            )
            .map((number) => (
              <li
                key={number}
                className={`page-item ${
                  currentPage === number ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              </li>
            ))}
          {currentPage < totalPages - 3 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}
          {totalPages > 1 && (
            <li
              className={`page-item ${
                currentPage === totalPages ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          )}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <i className="fa fa-angle-right fa-lg" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
