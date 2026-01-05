import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="card text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-4">Analyzing Product...</h3>
        
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-gray-600">Searching Amazon reviews</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse delay-100"></div>
            <span className="text-gray-600">Checking Reddit discussions</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse delay-200"></div>
            <span className="text-gray-600">AI analysis in progress</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          This usually takes 10-20 seconds...
        </p>
      </div>
    </div>
  );
}
