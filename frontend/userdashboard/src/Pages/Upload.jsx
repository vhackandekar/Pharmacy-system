import React from 'react';
import { Card } from '../Component/UI';

const UploadPage = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-black tracking-tight mb-8">Upload Prescription</h2>
      <Card>
        <p className="text-sm opacity-60">Upload your physical prescriptions here for AI analysis and automatic ordering.</p>
      </Card>
    </div>
  );
};

export default UploadPage;
