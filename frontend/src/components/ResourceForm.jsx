import { useState } from 'react';
import api from '../services/api';
import { Home, Zap, Droplets, BookOpen, Users, Utensils, Send, RotateCcw } from 'lucide-react';

const ResourceForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blockName: '',
    totalRooms: '',
    occupiedRooms: '',
    studyRoomUsage: '',
    libraryUsage: '',
    electricityConsumption: '',
    waterConsumption: '',
    messUtilization: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      blockName: '',
      totalRooms: '',
      occupiedRooms: '',
      studyRoomUsage: '',
      libraryUsage: '',
      electricityConsumption: '',
      waterConsumption: '',
      messUtilization: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/resources/add', formData);
      handleReset();
      if (onSuccess) onSuccess();
      alert('Resource data submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit resource data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-5">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Home size={20} className="text-primary-600" />
          Resource Data Entry
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">Manual audit of campus infrastructure metrics.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Block Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hostel Block Name</label>
            <div className="relative">
              <input
                type="text"
                name="blockName"
                value={formData.blockName}
                onChange={handleChange}
                placeholder="e.g. Block B, Emerald Hall"
                className="input-field pl-10"
                required
              />
              <Home className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Total Rooms</label>
            <input
              type="number"
              name="totalRooms"
              value={formData.totalRooms}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Occupied Rooms</label>
            <input
              type="number"
              name="occupiedRooms"
              value={formData.occupiedRooms}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Usage Percentages */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <BookOpen size={16} className="text-slate-400" />
              Study Room Usage (%)
            </label>
            <input
              type="number"
              name="studyRoomUsage"
              value={formData.studyRoomUsage}
              onChange={handleChange}
              min="0"
              max="100"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              Library Usage (%)
            </label>
            <input
              type="number"
              name="libraryUsage"
              value={formData.libraryUsage}
              onChange={handleChange}
              min="0"
              max="100"
              className="input-field"
              required
            />
          </div>

          {/* Consumption */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              Electricity (kWh)
            </label>
            <input
              type="number"
              name="electricityConsumption"
              value={formData.electricityConsumption}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Droplets size={16} className="text-blue-500" />
              Water (Liters)
            </label>
            <input
              type="number"
              name="waterConsumption"
              value={formData.waterConsumption}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Mess */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Utensils size={16} className="text-slate-400" />
              Mess Utilization (%)
            </label>
            <input
              type="number"
              name="messUtilization"
              value={formData.messUtilization}
              onChange={handleChange}
              min="0"
              max="100"
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={18} />
                Submit Resource Data
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
