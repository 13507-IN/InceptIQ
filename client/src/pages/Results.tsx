import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, AlertCircle } from "lucide-react";
import { apiService, downloadFile } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import ScoreBadge from "../components/ScoreBadge";

const Results: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (analysisId) fetchAnalysisData(analysisId);
  }, [analysisId]);

  const fetchAnalysisData = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiService.getAnalysis(id);
      // The API helper returns response.data (the server JSON). Server returns { success, data }
      // where `data` is the stored analysis object which itself often contains an `analysis` field
      // (the Detailed Analysis / AnalysisResult). Support both shapes:
      // - response = { success, data: { analysis: AnalysisResult, ... } }
      // - response = { success, data: AnalysisResult }
      // - response = AnalysisResult (older helper behavior)
      console.debug('Raw analysis response:', response);
      const resolved = response?.data?.analysis ?? response?.data ?? response ?? null;
      console.debug('Resolved analysisData to set:', resolved);
      setAnalysisData(resolved);
    } catch (err: any) {
      console.error("Failed to fetch analysis:", err);
      setError("Unable to load analysis data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysisId) return;
    try {
      setDownloadingPdf(true);
      await apiService.downloadReport(analysisId);
    } catch {
      alert("Failed to download PDF report.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-700 font-medium">Loading analysis results...</p>
        </div>
      </div>
    );

  if (error || !analysisData)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-lg text-gray-700">{error}</p>
      </div>
    );

  const { 
    overallScore, uniquenessScore, marketViabilityScore, competitionScore, 
    analysis, recommendations, risks, opportunities, keyMetrics 
  } = analysisData;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Startup Analysis Results</h1>
          <p className="text-gray-600">Analysis ID: {analysisId}</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Download className="h-5 w-5 mr-2" />
          {downloadingPdf ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-white shadow-md rounded-xl p-8 text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Viability Score</h2>
        <div className="text-6xl font-bold text-green-700">{overallScore ?? 0}</div>
        <p className="text-gray-500">out of 100</p>
      </div>

      {/* Score Breakdown */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Uniqueness", score: uniquenessScore },
          { label: "Market Viability", score: marketViabilityScore },
          { label: "Competition", score: competitionScore },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.label}</h3>
            <ScoreBadge score={item.score ?? 0} label={`${item.label} Score`} />
            <div className="mt-4">
              <ScoreChart score={item.score ?? 0} />
            </div>
          </div>
        ))}
      </div>

      {/* --- Uniqueness --- */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Uniqueness</h2>
        <p className="text-gray-700 mb-4">{analysis?.uniqueness?.summary}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
            <ul className="list-disc list-inside text-gray-600">
              {analysis?.uniqueness?.strengths?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-600 mb-2">Concerns</h4>
            <ul className="list-disc list-inside text-gray-600">
              {analysis?.uniqueness?.concerns?.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- Market Viability --- */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Market Viability</h2>
        <p className="text-gray-700 mb-4">{analysis?.marketViability?.summary}</p>
        <ul className="text-gray-700 space-y-2">
          <li><b>Market Size:</b> {analysis?.marketViability?.marketSize}</li>
          <li><b>Target Audience:</b> {analysis?.marketViability?.targetAudience}</li>
          <li><b>Trends:</b>
            <ul className="list-disc list-inside ml-5">
              {analysis?.marketViability?.trends?.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </li>
        </ul>
      </section>

      {/* --- Competition --- */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Competition</h2>
        <p className="text-gray-700 mb-4">{analysis?.competition?.summary}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Direct Competitors</h4>
            <ul className="list-disc list-inside text-gray-600">
              {analysis?.competition?.directCompetitors?.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Indirect Competitors</h4>
            <ul className="list-disc list-inside text-gray-600">
              {analysis?.competition?.indirectCompetitors?.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-green-700 mb-2">Competitive Advantage</h4>
          <p className="text-gray-700">{analysis?.competition?.competitiveAdvantage}</p>
        </div>
      </section>

      {/* --- Key Metrics --- */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Key Metrics</h2>
        <ul className="text-gray-700 space-y-2">
          <li><b>Funding Required:</b> {keyMetrics?.fundingRequired}</li>
          <li><b>Break-even Point:</b> {keyMetrics?.breakEvenPoint}</li>
          <li><b>Time to Market:</b> {keyMetrics?.timeToMarket}</li>
          <li><b>Scalability Rating:</b> {keyMetrics?.scalabilityRating}</li>
        </ul>
      </section>

      {/* --- Risks --- */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-red-700">Risks</h2>
        <div className="space-y-6">
          {risks?.map((r: any, i: number) => (
            <div key={i} className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900">{r.category}</h4>
              <p className="text-gray-700 mb-2">{r.description}</p>
              <p className="text-sm text-gray-600"><b>Severity:</b> {r.severity}</p>
              <p className="text-sm text-gray-600"><b>Mitigation:</b> {r.mitigation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Opportunities --- */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Opportunities</h2>
        <div className="space-y-6">
          {opportunities?.map((o: any, i: number) => (
            <div key={i} className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">{o.category}</h4>
              <p className="text-gray-700">{o.description}</p>
              <p className="text-sm text-gray-600"><b>Impact:</b> {o.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Recommendations --- */}
      <section className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-green-700">Recommendations</h2>
        <div className="space-y-6">
          {recommendations?.map((rec: any, i: number) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">{rec.category}</h4>
              <p className="text-gray-700 mb-2">{rec.action}</p>
              <p className="text-sm text-gray-600"><b>Priority:</b> {rec.priority}</p>
              <p className="text-sm text-gray-600"><b>Timeline:</b> {rec.timeline}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Results;
