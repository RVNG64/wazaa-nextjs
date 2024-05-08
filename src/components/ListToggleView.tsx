import React, { useState } from 'react';

interface ListViewToggleProps {
  onToggle: (isListView: boolean) => void;
}

const ListViewToggle: React.FC<ListViewToggleProps> = ({ onToggle }) => {
  const [isListView, setIsListView] = useState(false);

  return (
    <div className="list-view-toggle">
      <button
        className={`list-view-toggle-segment ${!isListView ? 'active' : ''}`}
        onClick={() => {
          setIsListView(false);
          onToggle(false);
        }}
      >
        {/* <FontAwesomeIcon icon={faMap} /> */}
        Carte
      </button>
      <button
        className={`list-view-toggle-segment ${isListView ? 'active' : ''}`}
        onClick={() => {
          setIsListView(true);
          onToggle(true);
        }}
      >
        {/* <FontAwesomeIcon icon={faList} /> */}
        Liste
      </button>
    </div>
  );
};

export default ListViewToggle;
