import React from 'react';
import { Card } from '../Component/UI';

const HistoryPage = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-black tracking-tight mb-8">Order History</h2>
      <Card>
        <p className="text-sm opacity-60">Archive of your past pharmacy orders and medical transactions.</p>
      </Card>
    </div>
  );
};

export default HistoryPage;
