import React, { useState, useEffect } from 'react';
import { X, Plus, Building2, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const OnboardingAsksGives = ({ setIsOnBoarded }) => {
  const [asks, setAsks] = useState([]);
  const [gives, setGives] = useState([]);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [currentAsk, setCurrentAsk] = useState({ companyName: '' });
  const [currentGive, setCurrentGive] = useState({ companyName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [addingAsk, setAddingAsk] = useState(false);
  const [addingGive, setAddingGive] = useState(false);

  const isValid = asks.length >= 5 && gives.length >= 5;
  const location = useLocation();
  const navigate = useNavigate();
  // Extract ID from pathname like "/member/USER_ID/onboarding"
  const id = location.pathname.split('/')[2];

  const getCookie = React.useCallback((name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }, []);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      const toastId = toast.loading('Loading your profile...');
      try {
        const token = getCookie("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [asksResponse, givesResponse] = await Promise.all([
          axios.get(`/api/myAsk/getMyAsk?userId=${id}`, { headers, withCredentials: true }),
          axios.get(`/api/myGives/getMyGives?userId=${id}`, { headers, withCredentials: true })
        ]);

        const asksData = asksResponse.data.data || [];
        const givesData = givesResponse.data.data || [];
console.log("Fetched Asks:", asksData);
console.log("Fetched Gives:", givesData);

        if (asksData.length >= 5 && givesData.length >= 5) {
          toast.success('Profile already complete! Redirecting...', { id: toastId });
          Cookies.set('isOnBoarded', 'true'); // Update the cookie
          setIsOnBoarded(true); // Update the app's state
          navigate(`/member/${id}/dashboard`);
        } else {
          // The API returns _id, but the component uses 'id' for keys. Let's map it.
          setAsks(asksData.map(ask => ({ ...ask, id: ask._id })));
          setGives(givesData.map(give => ({ ...give, id: give._id })));
          toast.dismiss(toastId);
        }
      } catch (error) {
        toast.error('Could not load your data. Please try again.', { id: toastId });
        console.error("Failed to fetch onboarding data:", error);
      }
    };

    if (id) {
      fetchOnboardingData();
    }
  }, [id, navigate, getCookie, setIsOnBoarded]);

  // Add individual Ask to database
  const addAsk = async () => {
    if (!currentAsk.companyName.trim()) {
      setError('Company Name is required');
      return;
    }

    setAddingAsk(true);
    setError(null);

    try {
      const token = getCookie("token");
      const myAskData = {
        companyName: currentAsk.companyName.trim(),
      };

      await axios.post(
        `/api/myAsk/addMyAsk?user=${id}`,
        myAskData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Note: The component will re-fetch on next load, so this temporary state is fine.
      const newAsk = {
        ...myAskData,
        id: Date.now(),
      };
      
      setAsks(prevAsks => [...prevAsks, newAsk]);
      setCurrentAsk({ companyName: '' });
      toast.success('Ask added successfully!');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add ask. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to add ask');
    } finally {
      setAddingAsk(false);
    }
  };

  // Add individual Give to database
  const addGive = async () => {
    if (!currentGive.companyName.trim()) {
      setError('Company Name is required');
      return;
    }

    setAddingGive(true);
    setError(null);

    try {
      const token = getCookie("token");
      const myGiveData = {
        companyName: currentGive.companyName.trim(),
      };

      await axios.post(
        `/api/myGives/addMyGives?user=${id}`,
        myGiveData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Note: The component will re-fetch on next load, so this temporary state is fine.
      const newGive = {
        ...myGiveData,
        id: Date.now(),
      };

      setGives(prevGives => [...prevGives, newGive]);
      setCurrentGive({ companyName: '' });
      toast.success('Give added successfully!');
      
    } catch (err) {
        console.log(err);
      setError(err.response?.data?.message || 'Failed to add give. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to add give');
    } finally {
      setAddingGive(false);
    }
  };

  const removeAsk = (id) => {
    setAsks(asks.filter(ask => ask.id !== id));
  };

  const removeGive = (id) => {
    setGives(gives.filter(give => give.id !== id));
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = getCookie("token");
      await axios.put(
        `/api/member/updatememberById?id=${id}`,
        { isOnBoarded: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setSubmitSuccess(true);
      Cookies.set('isOnBoarded', 'true'); // Update the cookie
      setIsOnBoarded(true); // Update the app's state
      toast.success('Onboarding completed successfully!');
      setTimeout(() => {
        navigate(`/member/${id}/dashboard`);
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to complete onboarding. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-block bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            Welcome Onboarding
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Add at least 5 asks and 5 gives to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
            <span className="text-sm font-bold text-sky-600">
              {Math.min(100, Math.round(((asks.length + gives.length) / 10) * 100))}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, ((asks.length + gives.length) / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* My Asks Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Briefcase size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">My Asks</h2>
                    <p className="text-sky-100 text-sm">What you're looking for</p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full px-4 py-2 font-bold text-lg">
                  {asks.length}/5
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {asks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No asks added yet</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {asks.map((ask) => (
                    <div key={ask.id} className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex justify-between items-start hover:bg-sky-100 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={16} className="text-sky-600" />
                          <span className="font-semibold text-gray-800">{ask.companyName}</span>
                        </div>
                      </div>
                      <button onClick={() => removeAsk(ask.id)} className="text-red-500 hover:text-red-700 ml-3">
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => setShowAskModal(true)}
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-sky-500 hover:to-blue-600 transition shadow-md"
              >
                <Plus size={20} />
                Add Ask
              </button>
            </div>
          </div>

          {/* My Gives Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-cyan-400 to-sky-500 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">My Gives</h2>
                    <p className="text-cyan-100 text-sm">What you can offer</p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full px-4 py-2 font-bold text-lg">
                  {gives.length}/5
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {gives.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No gives added yet</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {gives.map((give) => (
                    <div key={give.id} className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex justify-between items-start hover:bg-cyan-100 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={16} className="text-cyan-600" />
                          <span className="font-semibold text-gray-800">{give.companyName}</span>
                        </div>
                      </div>
                      <button onClick={() => removeGive(give.id)} className="text-red-500 hover:text-red-700 ml-3">
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => setShowGiveModal(true)}
                className="w-full bg-gradient-to-r from-cyan-400 to-sky-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-sky-600 transition shadow-md"
              >
                <Plus size={20} />
                Add Give
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          {!isValid && (
            <p className="text-amber-600 mb-4 flex items-center justify-center gap-2">
              <AlertCircle size={20} />
              Please add at least 5 asks and 5 gives to continue
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting || submitSuccess}
            className={`px-12 py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${
              isValid && !submitSuccess
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 hover:shadow-2xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={24} />
                Profile Complete!
              </span>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              'Complete Onboarding'
            )}
          </button>
        </div>

        {/* Ask Modal */}
        <Modal show={showAskModal} onClose={() => setShowAskModal(false)} title="Add Your Ask">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={currentAsk.companyName}
                onChange={(e) => setCurrentAsk({ ...currentAsk, companyName: e.target.value })}
                placeholder="e.g., Google, Microsoft, Startup Inc."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-400 focus:outline-none transition"
                disabled={addingAsk}
              />
            </div>

            <button
              onClick={addAsk}
              disabled={!currentAsk.companyName.trim() || addingAsk}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-sky-500 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {addingAsk ? 'Adding...' : 'Add to My Asks'}
            </button>

            {asks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Added Asks ({asks.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {asks.map((ask) => (
                    <div key={ask.id} className="bg-sky-50 border border-sky-200 rounded p-3 text-sm">
                      <div className="font-semibold text-gray-800">{ask.companyName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Give Modal */}
        <Modal show={showGiveModal} onClose={() => setShowGiveModal(false)} title="Add Your Give">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={currentGive.companyName}
                onChange={(e) => setCurrentGive({ ...currentGive, companyName: e.target.value })}
                placeholder="e.g., Google, Microsoft, Startup Inc."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-400 focus:outline-none transition"
                disabled={addingGive}
              />
            </div>

            <button
              onClick={addGive}
              disabled={!currentGive.companyName.trim() || addingGive}
              className="w-full bg-gradient-to-r from-cyan-400 to-sky-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-500 hover:to-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {addingGive ? 'Adding...' : 'Add to My Gives'}
            </button>

            {gives.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Added Gives ({gives.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gives.map((give) => (
                    <div key={give.id} className="bg-cyan-50 border border-cyan-200 rounded p-3 text-sm">
                      <div className="font-semibold text-gray-800">{give.companyName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OnboardingAsksGives;