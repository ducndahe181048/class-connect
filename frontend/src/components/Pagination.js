import React from 'react';
import '../css/Pagination.css';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        onPageChange(page);
    };

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            if (currentPage <= 3) {
                endPage = maxPagesToShow;
            } else if (currentPage > totalPages - 2) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="pagination-container">
            <button
                className="pagination-button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
            >
                Trang Trước
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    className={`pagination-button ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
                    onClick={() => page !== '...' && handlePageClick(page)}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}

            <button
                className="pagination-button"
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                Trang Sau
            </button>
        </div>
    );
};

export default Pagination;