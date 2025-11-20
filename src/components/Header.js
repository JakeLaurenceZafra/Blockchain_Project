import React from 'react';

const Header = ({ onFilterChange, currentFilter }) => {
  const filters = ['all', 'To-Do', 'Reminder', 'Work', 'School'];

  return (
    <header>
      <div className="header_main">
        <h1>My Notes</h1>
        <div className="filter_section">
          <label className="filter_label">Filter by Tag:</label>
          <div className="filter_buttons">
            {filters.map(filter => (
              <button
                key={filter}
                className={`filter_btn ${currentFilter === filter ? 'active' : ''}`}
                onClick={() => onFilterChange(filter)}
                data-filter={filter}
              >
                {filter === 'all' ? 'All' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
