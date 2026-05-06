import React, { useState, useEffect } from 'react';
import { Minus, TrendingUp, TrendingDown, Sparkles, BarChart3, Activity, PieChart, ArrowUpRight, Users, Star, AlertTriangle } from 'lucide-react';
import { getSurveyAnalytics, QUESTION_LABELS, SurveyAnalytics } from '../../lib/storage';

// --- SVG Chart Components ---

const MoodLineChart = ({ points }: { points: number[] }) => {
  const safePoints = points.length >= 2 ? points : [0, 0];
  const max = 5;
  const width = 300;
  const height = 100;

  const svgPoints = safePoints.map((val, idx) => {
    const x = (idx / (safePoints.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,${height} ${svgPoints} L${width},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#moodGradient)" />
      <polyline
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="3"
        points={svgPoints}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {safePoints.map((val, idx) => {
        const x = (idx / (safePoints.length - 1)) * width;
        const y = height - (val / max) * height;
        return <circle key={idx} cx={x} cy={y} r="4" fill="white" stroke="#8b5cf6" strokeWidth="2" />;
      })}
    </svg>
  );
};

const ScoreDonut = ({ score }: { score: number }) => {
  const filled = Math.max(0, Math.min(100, score));
  const empty = 100 - filled;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="50" cy="50" r="40"
          fill="transparent"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${filled} ${empty}`}
          strokeDashoffset="0"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold text-slate-700">{score}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
      </div>
    </div>
  );
};

// -----

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSurveyAnalytics().then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-slate-400 text-lg font-medium">Loading survey data from InsForge…</div>
      </div>
    );
  }

  const hasData = analytics && analytics.totalResponses > 0;
  const score = analytics?.overallHealthScore ?? 0;
  const avgRating = analytics?.averageRating ?? 0;
  const trend = analytics?.trend ?? 'stable';

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={14} />;
    if (trend === 'down') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-300 bg-emerald-500/20';
    if (trend === 'down') return 'text-red-300 bg-red-500/20';
    return 'text-emerald-300 bg-emerald-500/20';
  };
  const getTrendLabel = () => {
    if (trend === 'up') return 'Improving';
    if (trend === 'down') return 'Declining';
    return 'Stable';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getBarColor = (avg: number) => {
    if (avg >= 4) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (avg >= 3) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  const getRatingBadge = (avg: number) => {
    if (avg >= 4) return 'text-emerald-600 bg-emerald-50';
    if (avg >= 3) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  // Build per-question chart data (sorted by score for the bar chart)
  const questionEntries = Object.entries(analytics?.questionAverages ?? {})
    .map(([k, v]) => ({ id: parseInt(k), label: QUESTION_LABELS[parseInt(k)] ?? `Q${k}`, avg: v as number }))
    .sort((a, b) => b.avg - a.avg);

  // Trend line: per-question avg as a simple line across Q1–Q9
  const trendLinePoints = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(id => analytics?.questionAverages?.[id] ?? 0)
    .filter(v => v > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

      {/* Top Summary Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-96 h-96 bg-violet-500 opacity-20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              <Activity size={12} /> BMSIT Survey Pulse
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
              {hasData ? getScoreLabel(score) : 'No Data Yet'}
            </h2>
            <p className="text-slate-300 text-lg opacity-90 max-w-md font-medium">
              {hasData
                ? `Aggregated from ${analytics.totalResponses} lecturer ${analytics.totalResponses === 1 ? 'response' : 'responses'} stored in InsForge.`
                : 'Complete the BMSIT survey to see real analytics here.'}
            </p>
          </div>

          {hasData && (
            <div className="flex items-end gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
              <div className="text-6xl font-extrabold tracking-tighter">{score}</div>
              <div className="flex flex-col pb-2">
                <span className="text-sm font-bold opacity-60">OUT OF 100</span>
                <div className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg ${getTrendColor()}`}>
                  {getTrendIcon()} {getTrendLabel()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No survey responses yet</h3>
          <p className="text-slate-500">Submit the BMSIT Lecturer Survey to start seeing real analytics here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: KPIs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-slate-500 text-sm font-medium">Total Responses</span>
                </div>
                <div className="text-4xl font-extrabold text-blue-600">{analytics.totalResponses}</div>
                <div className="text-xs text-slate-400 mt-1">Stored in InsForge DB</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-violet-500" />
                  <span className="text-slate-500 text-sm font-medium">Avg Rating</span>
                </div>
                <div className="text-4xl font-extrabold text-violet-600">
                  {avgRating.toFixed(2)}<span className="text-lg text-slate-400">/5</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Across all scale questions</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-500 text-sm font-medium">Health Score</span>
                </div>
                <div className={`text-4xl font-extrabold ${score >= 60 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                  {score}
                </div>
                <div className="text-xs text-slate-400 mt-1">Scaled 0–100</div>
              </div>
            </div>

            {/* Per-question bar chart */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChart size={20} className="text-slate-400" /> Question-by-Question Averages
              </h3>
              <div className="space-y-4">
                {questionEntries.map(({ id, label, avg }) => (
                  <div key={id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-700">{id}. {label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRatingBadge(avg)}`}>
                        {avg.toFixed(2)} / 5
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getBarColor(avg)}`}
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top & Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.topQuestion && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-sm">
                    <ArrowUpRight size={16} /> Highest Rated
                  </div>
                  <div className="font-bold text-slate-800 mb-1">{analytics.topQuestion.label}</div>
                  <div className="text-2xl font-extrabold text-emerald-600">{analytics.topQuestion.avg.toFixed(2)} / 5</div>
                </div>
              )}
              {analytics.bottomQuestion && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2 text-red-500 font-bold text-sm">
                    <AlertTriangle size={16} /> Needs Attention
                  </div>
                  <div className="font-bold text-slate-800 mb-1">{analytics.bottomQuestion.label}</div>
                  <div className="text-2xl font-extrabold text-red-500">{analytics.bottomQuestion.avg.toFixed(2)} / 5</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Score Donut */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800 self-start">Overall Health</h3>
              <ScoreDonut score={score} />
              <p className="text-sm text-slate-500 text-center">
                {getScoreLabel(score)} — {trend === 'up' ? 'Scores are improving 📈' : trend === 'down' ? 'Scores are declining ⚠️' : 'Scores are stable'}
              </p>
            </div>

            {/* Trend line across questions */}
            {trendLinePoints.length >= 2 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                  Score Profile
                  <span className="text-xs font-bold bg-violet-50 text-violet-600 px-2 py-1 rounded-lg">Q1–Q9</span>
                </h3>
                <div className="h-32 w-full px-2">
                  <MoodLineChart points={trendLinePoints} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-4 px-2">
                  {trendLinePoints.map((_, i) => <span key={i}>Q{i + 1}</span>)}
                </div>
              </div>
            )}

            {/* Latest Feedback */}
            {analytics.latestFeedbacks.length > 0 && (
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-700 rounded-3xl p-6 text-white shadow-lg">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Sparkles size={16} /> Latest Feedback
                </h3>
                <div className="space-y-3">
                  {analytics.latestFeedbacks.slice(0, 2).map((fb, i) => (
                    <div key={i}>
                      <p className="text-sm opacity-90 leading-relaxed italic">"{fb.length > 120 ? fb.slice(0, 120) + '…' : fb}"</p>
                      {i < analytics.latestFeedbacks.slice(0, 2).length - 1 && <div className="h-px bg-white/20 mt-3" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;