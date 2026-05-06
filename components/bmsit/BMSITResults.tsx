import React, { useState, useEffect } from 'react';
import { GraduationCap, TrendingUp, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { getBMSITSurveys, QUESTION_LABELS } from '../../lib/storage';

interface SurveyData {
  timestamp: string;
  answers: Record<number, number | string>;
}

interface BMSITResultsProps {
  onBack: () => void;
}


const BMSITResults: React.FC<BMSITResultsProps> = ({ onBack }) => {
  const [surveyData, setSurveyData] = useState<SurveyData[]>([]);
  const [averages, setAverages] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadSurveyData = async () => {
    // Load survey data from InsForge
      const data = await getBMSITSurveys();
      setSurveyData(data);
      
      // Calculate averages for scale questions (1-9)
      const scaleAnswers: Record<number, number[]> = {};
      
      data.forEach((survey: SurveyData) => {
        Object.keys(survey.answers).forEach((key) => {
          const questionId = parseInt(key);
          const answer = survey.answers[questionId];
          
          // Only include scale answers (numbers 1-5)
          if (questionId <= 9 && typeof answer === 'number') {
            if (!scaleAnswers[questionId]) {
              scaleAnswers[questionId] = [];
            }
            scaleAnswers[questionId].push(answer);
          }
        });
      });

      // Calculate averages
      const calculatedAverages: Record<number, number> = {};
      Object.keys(scaleAnswers).forEach((key) => {
        const questionId = parseInt(key);
        const answers = scaleAnswers[questionId];
        const avg = answers.reduce((sum, val) => sum + val, 0) / answers.length;
        calculatedAverages[questionId] = Math.round(avg * 100) / 100; // Round to 2 decimals
      });

      setAverages(calculatedAverages);
    };

    loadSurveyData();
  }, []);

  const getAverageRating = () => {
    const allAverages = Object.values(averages);
    if (allAverages.length === 0) return 0;
    const total = (allAverages as number[]).reduce((sum, val) => sum + val, 0);
    return Math.round((total / allAverages.length) * 100) / 100;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-2xl flex items-center justify-center">
                <GraduationCap size={32} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">BMSIT Survey Results</h1>
                <p className="text-slate-600 mt-1">Aggregated feedback from lecturers</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-slate-600 font-medium">Total Responses</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{surveyData.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-slate-600 font-medium">Average Rating</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {getAverageRating().toFixed(2)}
                <span className="text-lg text-slate-500">/5</span>
              </div>
            </div>
            <div className={`bg-gradient-to-br rounded-xl p-6 border ${
              getAverageRating() >= 4 ? 'from-green-50 to-emerald-50 border-green-100' :
              getAverageRating() >= 3 ? 'from-yellow-50 to-amber-50 border-yellow-100' :
              'from-red-50 to-rose-50 border-red-100'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className={`w-5 h-5 ${
                  getAverageRating() >= 4 ? 'text-green-600' :
                  getAverageRating() >= 3 ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <span className="text-slate-600 font-medium">Overall Status</span>
              </div>
              <div className={`text-2xl font-bold ${
                getAverageRating() >= 4 ? 'text-green-600' :
                getAverageRating() >= 3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getRatingLabel(getAverageRating())}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Question-wise Averages</h2>
          
          <div className="space-y-6">
            {Object.keys(QUESTION_LABELS).map((key) => {
              const questionId = parseInt(key);
              const avg = averages[questionId];
              
              if (!avg) return null;

              const percentage = (avg / 5) * 100;

              return (
                <div key={questionId} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {questionId}. {QUESTION_LABELS[questionId]}
                    </h3>
                    <div className={`px-4 py-1 rounded-full font-bold ${getRatingColor(avg)}`}>
                      {avg.toFixed(2)} / 5
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        avg >= 4 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        avg >= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(averages).length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg">No survey data available yet.</p>
              <p className="text-sm mt-2">Complete the survey to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMSITResults;

