import React from 'react';

const DataSources = () => {
  const sources = [
    { name: 'Amazon', color: '#FF9900' },
    { name: 'Reddit', color: '#FF4500' },
    { name: 'Walmart', color: '#0071CE' },
    { name: 'Best Buy', color: '#FFF200' },
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-center text-navy-light text-sm font-semibold mb-6 uppercase tracking-wider">
          Where We Get Our Data
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {sources.map((source) => (
            <div 
              key={source.name}
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <span className="text-navy-light font-medium text-lg">
                {source.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-navy-light text-sm mt-6 max-w-2xl mx-auto">
          We aggregate data from trusted sources to give you the complete picture
        </p>
      </div>
    </div>
  );
};

export default DataSources;
