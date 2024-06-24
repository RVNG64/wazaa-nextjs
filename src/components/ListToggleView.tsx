import React, { useState, forwardRef } from 'react';

interface ListViewToggleProps {
  onToggle: (isListView: boolean) => void;
}

const ListViewToggle = forwardRef<HTMLDivElement, ListViewToggleProps>(({ onToggle }, ref) => {
  const [isListView, setIsListView] = useState(false);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsListView(prevState => {
      const newState = !prevState;
      onToggle(newState);
      return newState;
    });
  };

  return (
    <div className="list-view-toggle" ref={ref}>
      <button
        className={`list-view-toggle-segment ${!isListView ? 'active' : ''}`}
        onClick={(event) => handleClick(event)}
      >
        Carte
      </button>
      <button
        className={`list-view-toggle-segment ${isListView ? 'active' : ''}`}
        onClick={(event) => handleClick(event)}
      >
        Liste
      </button>
    </div>
  );
});

ListViewToggle.displayName = 'ListViewToggle';

export default ListViewToggle;
