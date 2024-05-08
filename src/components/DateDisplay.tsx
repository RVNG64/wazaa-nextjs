import React from 'react';
import { motion } from 'framer-motion';

const DateDisplay = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
  const isSameDate = startDate === endDate;

  return (
    <motion.div
      className="map-date-display"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isSameDate ? (
        <h2>Le {startDate}</h2> // Affiche "Le ..." si les dates sont identiques
      ) : (
        <h2>Du {startDate} au {endDate}</h2> // Sinon, affiche "Du ... au ..."
      )}
    </motion.div>
  );
}

export default DateDisplay;
