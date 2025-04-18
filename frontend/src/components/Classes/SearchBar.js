import React from 'react';
import { FaSearch } from 'react-icons/fa';
import '../../css/Classes/SearchBar.css';

const SearchBar = ({ search, setSearch }) => {
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    return (
        <div className="search-container">
            <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm theo tên, mã hoặc mô tả ..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>
        </div>
    );
};

export default SearchBar;