
import React from 'react';

export default function DiagnosticIndex() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Diagnostic Mode</h1>
        <p className="mb-4">
          If you're seeing this page, the application is successfully rendering in diagnostic mode.
        </p>
        <div className="p-3 bg-green-100 text-green-800 rounded">
          ✅ React rendering is working correctly
        </div>
      </div>
    </div>
  );
}
