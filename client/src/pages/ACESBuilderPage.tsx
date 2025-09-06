import React from 'react';
import { ACESBuilder } from '../components/ACESBuilder';

export const ACESBuilderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <ACESBuilder />
      </div>
    </div>
  );
};