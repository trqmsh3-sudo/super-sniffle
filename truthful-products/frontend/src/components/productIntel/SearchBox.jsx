import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBox({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for any product..."
          className="input-field pr-16 text-xl py-5 shadow-lg"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary hover:bg-primary-dark text-navy rounded-lg disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md hover:shadow-lg"
        >
          <Search size={24} />
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-navy-light text-sm mb-2">Try searching for:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => setQuery('Best Noise Cancelling Headphones')}
            className="px-4 py-2 bg-gray-100 hover:bg-primary/10 text-navy-light rounded-lg text-sm transition-colors"
          >
            Best Noise Cancelling Headphones
          </button>
          <button 
            onClick={() => setQuery('Is the Dyson V15 worth it?')}
            className="px-4 py-2 bg-gray-100 hover:bg-primary/10 text-navy-light rounded-lg text-sm transition-colors"
          >
            Is the Dyson V15 worth it?
          </button>
          <button 
            onClick={() => setQuery('Weber Spirit II E-310')}
            className="px-4 py-2 bg-gray-100 hover:bg-primary/10 text-navy-light rounded-lg text-sm transition-colors"
          >
            Weber Spirit II E-310
          </button>
        </div>
      </div>
    </div>
  );
}
