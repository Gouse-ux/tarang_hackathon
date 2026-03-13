import { Trash2, BrainCircuit, Eye, Calendar } from 'lucide-react';

const ResourceTable = ({ resources, onDelete, onAnalyze, onView }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          Usage History Audit
        </h3>
        <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
          {resources.length} Records
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6">Block Name</th>
              <th className="py-4 px-6 text-center">Occupancy</th>
              <th className="py-4 px-6 text-center">Electricity</th>
              <th className="py-4 px-6 text-center">Study Room</th>
              <th className="py-4 px-6 text-center">Library</th>
              <th className="py-4 px-6">Created Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {resources.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-20 text-center text-slate-400 font-medium">
                  No resource records found. Enter data above to start monitoring.
                </td>
              </tr>
            ) : (
              resources.map((res) => (
                <tr key={res._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 leading-tight">{res.blockName}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{res.occupiedRooms} / {res.totalRooms} Rooms</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${res.occupancyPercentage > 90 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {res.occupancyPercentage.toFixed(1)}%
                      </span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${res.occupancyPercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${res.occupancyPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-slate-700">{res.electricityConsumption}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase tracking-wider">kWh</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-slate-700">{res.studyRoomUsage}%</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-slate-700">{res.libraryUsage}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(res.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onView(res)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onAnalyze(res._id)}
                        className={`p-2 rounded-lg transition-all ${res.aiRecommendation ? 'text-primary-600 bg-primary-50' : 'text-slate-400 hover:text-accent-600 hover:bg-accent-50'}`}
                        title={res.aiRecommendation ? "AI Analysis Ready" : "Run AI Optimization"}
                      >
                        <BrainCircuit size={18} className={!res.aiRecommendation ? "animate-pulse" : ""} />
                      </button>
                      <button 
                        onClick={() => onDelete(res._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceTable;
