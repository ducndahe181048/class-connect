import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import '../css/SearchFilterBar.css';

const SearchFilterBar = ({ searchPlaceholder = 'Search...', searchValue = '', onSearchChange, filterOptions = [], selectedFilter = 'all', onFilterChange, filterPlaceholder = 'All Options' }) => {
    return (
        <div className="search-filter-row">
            <div className="search-container">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="filter-container">
                <div className="filter-dropdown">
                    <FaFilter className="filter-icon" />
                    <select
                        value={selectedFilter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="dropdown-select"
                    >
                        <option value="all">{filterPlaceholder}</option>
                        {filterOptions.map(option => (
                            <option key={option._id} value={option._id}>
                                {option.name || option.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SearchFilterBar;