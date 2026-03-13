import { BrainCircuit, Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react';

const ResourceInsights = ({ selectedResource, onAnalyze, analyzing }) => {
  if (!selectedResource) {
    return (
      <div className="card-container h-full flex flex-col items-center justify-center p-8 bg-slate-50 border-dashed border-2">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300 mb-4 border border-slate-100">
          <BrainCircuit size={32} />
        </div>
        <h4 className="text-slate-900 font-bold mb-1">No Block Selected</h4>
        <p className="text-slate-500 text-sm font-medium text-center">Select a block from the usage history to view AI optimization insights.</p>
      </div>
    );
  }

  const { blockName, occupancyPercentage, aiRecommendation } = selectedResource;

  return (
    <div className="card-container h-full flex flex-col p-8 relative overflow-hidden bg-white">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 p-32 bg-primary-500/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BrainCircuit className="text-primary-600" size={24} />
              AI Intelligence: {blockName}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Real-time resource allocation optimization.</p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${occupancyPercentage > 90 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {occupancyPercentage.toFixed(1)}% Usage
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {!aiRecommendation ? (
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary-500 mb-4 animate-bounce">
                <Lightbulb size={24} />
              </div>
              <h4 className="text-slate-900 font-bold mb-2">Ready for Analysis</h4>
              <p className="text-slate-500 text-sm font-medium mb-6 max-w-xs">The CampusGuardian model is ready to analyze this block's utilization patterns.</p>
              <button 
                onClick={() => onAnalyze(selectedResource._id)}
                disabled={analyzing}
                className="btn-primary w-full flex items-center justify-center gap-2 group"
              >
                {analyzing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Generate Optimization Insight
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 bg-white text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-emerald-900 font-bold text-sm mb-1 uppercase tracking-wider">Optimization Strategy</h4>
                  <div className="text-slate-700 text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                    {aiRecommendation}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                  <p className="text-xl font-extrabold text-slate-800">8.4<span className="text-sm font-semibold opacity-50">/10</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reliability</p>
                  <p className="text-xl font-extrabold text-slate-800">92%</p>
                </div>
              </div>

              <button 
                onClick={() => onAnalyze(selectedResource._id)}
                disabled={analyzing}
                className="w-full py-3 text-slate-500 hover:text-primary-600 font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-100 rounded-xl hover:bg-primary-50/30"
              >
                {analyzing ? "Re-running..." : "Refresh Intelligence"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceInsights;
