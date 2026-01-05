import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ProsConsList({ pros, cons }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card bg-green-50 border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 text-success mr-2" />
          Pros
        </h3>
        <div className="space-y-4">
          {pros && pros.length > 0 ? (
            pros.map((pro, index) => (
              <div key={index} className="border-l-4 border-success pl-4">
                <p className="font-semibold text-gray-900">{pro.point}</p>
                <p className="text-sm text-gray-600 mt-1">{pro.evidence}</p>
                {pro.mentions && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mentioned by {pro.mentions} users
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No pros data available</p>
          )}
        </div>
      </div>

      <div className="card bg-red-50 border-2 border-red-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-6 h-6 text-danger mr-2" />
          Cons
        </h3>
        <div className="space-y-4">
          {cons && cons.length > 0 ? (
            cons.map((con, index) => (
              <div key={index} className="border-l-4 border-danger pl-4">
                <p className="font-semibold text-gray-900">{con.point}</p>
                <p className="text-sm text-gray-600 mt-1">{con.evidence}</p>
                {con.mentions && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mentioned by {con.mentions} users
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No cons data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
