import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="border-b border-neutral-800 p-4 bg-neutral-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Yindee Frame Customizer</h1>
          <span className="text-xs bg-neutral-800 px-3 py-1 rounded-full text-neutral-400">4x6&quot; Edition</span>
        </div>
      </header>
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex items-center justify-center bg-neutral-900 rounded-2xl border border-neutral-800 p-4 min-h-[400px]">
          Preview Zone
        </div>
        <div className="lg:col-span-4 bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
          Sidebar Zone
        </div>
      </div>
    </main>
  );
}
