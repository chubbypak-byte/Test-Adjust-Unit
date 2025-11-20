import React, { useState, useMemo } from 'react';
import { Upload, FileSpreadsheet, Activity, AlertCircle, CheckCircle, Calendar, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseExcel } from './utils/excelParser';
import { analyzeMeterData } from './services/geminiService';
import DataChart from './components/DataChart';
import { AnalysisResult, ChartDataPoint } from './types';

const App: React.FC = () => {
  // State Inputs
  const [elecFile, setElecFile] = useState<File | null>(null);
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [cause, setCause] = useState('');
  const [discoveryDate, setDiscoveryDate] = useState('');
  const [fixDate, setFixDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // State Data & UI
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'elec' | 'prod') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'elec') setElecFile(e.target.files[0]);
      else setProdFile(e.target.files[0]);
    }
  };

  const prepareChartData = (elecData: any[], prodData: any[]): ChartDataPoint[] => {
    // Simple merge logic based on assuming index alignment or simple date matching for demo
    // In production, sophisticated date parsing/matching is needed.
    const maxLength = Math.min(elecData.length, prodData.length);
    const merged: ChartDataPoint[] = [];
    
    for(let i=0; i<maxLength; i++) {
      // Try to find common keys for date, usage, production
      const eItem = elecData[i];
      const pItem = prodData[i];
      
      // Heuristic to find value columns
      const dateKey = Object.keys(eItem).find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('month')) || Object.keys(eItem)[0];
      const usageKey = Object.keys(eItem).find(k => typeof eItem[k] === 'number') || Object.keys(eItem)[1];
      const prodKey = Object.keys(pItem).find(k => typeof pItem[k] === 'number') || Object.keys(pItem)[1];

      merged.push({
        month: String(eItem[dateKey]),
        usage: Number(eItem[usageKey]) || 0,
        production: Number(pItem[prodKey]) || 0
      });
    }
    return merged;
  };

  const handleAnalyze = async () => {
    if (!elecFile || !prodFile || !cause || !discoveryDate) {
      setError("กรุณากรอกข้อมูลและอัปโหลดไฟล์ให้ครบถ้วน");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const elecData = await parseExcel(elecFile);
      const prodData = await parseExcel(prodFile);
      
      // Prepare chart data for visualization immediately
      const mergedChartData = prepareChartData(elecData, prodData);
      setChartData(mergedChartData);

      const analysis = await analyzeMeterData({
        cause,
        discoveryDate,
        fixDate,
        additionalInfo,
        electricityData: elecData,
        productionData: prodData
      });

      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Meter Detective AI</h1>
            <p className="text-xs text-slate-500">ระบบวิเคราะห์ความผิดปกติมิเตอร์ไฟฟ้าอัจฉริยะ</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Data Upload Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                นำเข้าข้อมูล
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">1. ไฟล์สถิติการใช้ไฟฟ้า (Excel)</label>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileChange(e, 'elec')} className="hidden" id="elec-file" />
                    <label htmlFor="elec-file" className={`flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${elecFile ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-300 hover:border-blue-400 text-slate-500'}`}>
                      {elecFile ? <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> {elecFile.name}</span> : <span className="flex items-center"><Upload className="w-4 h-4 mr-2"/> เลือกไฟล์...</span>}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">2. ข้อมูลผลผลิต (Excel)</label>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileChange(e, 'prod')} className="hidden" id="prod-file" />
                    <label htmlFor="prod-file" className={`flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${prodFile ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-300 hover:border-blue-400 text-slate-500'}`}>
                       {prodFile ? <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> {prodFile.name}</span> : <span className="flex items-center"><Upload className="w-4 h-4 mr-2"/> เลือกไฟล์...</span>}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Details Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                รายละเอียดการตรวจสอบ
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สาเหตุการชำรุด</label>
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    rows={2}
                    placeholder="เช่น เฟืองไม่หมุน, ขดลวดไหม้..."
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ตรวจพบ</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={discoveryDate}
                      onChange={(e) => setDiscoveryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่แก้ไข</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={fixDate}
                      onChange={(e) => setFixDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ข้อมูลเพิ่มเติม (ถ้ามี)</label>
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    rows={2}
                    placeholder="ข้อมูลสภาพแวดล้อม หรือประวัติการซ่อม..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full mt-4 py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all
                    ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
                  `}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      กำลังวิเคราะห์ข้อมูล...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 mr-2" />
                      เริ่มการวิเคราะห์
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Chart Section */}
            {chartData.length > 0 ? (
              <DataChart data={chartData} failureStartMonth={result?.failureStartMonth} />
            ) : (
              <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Activity className="w-16 h-16 mb-4 opacity-20" />
                <p>อัปโหลดไฟล์เพื่อดูแผนภูมิข้อมูล</p>
              </div>
            )}

            {/* Analysis Result Section */}
            {result && (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4">
                  <h2 className="text-white font-bold text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    ผลการวิเคราะห์โดย AI
                  </h2>
                </div>
                <div className="p-6">
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-red-600 text-xs font-bold uppercase tracking-wider">คาดว่าเริ่มชำรุดเดือน</p>
                      <p className="text-2xl font-bold text-red-800 mt-1">{result.failureStartMonth}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">ความแม่นยำของการวิเคราะห์</p>
                      <div className="flex items-baseline mt-1">
                        <p className="text-2xl font-bold text-blue-800">{result.confidenceScore}%</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">ลักษณะความผิดปกติ</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{result.anomalyType}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                      บทสรุป
                    </h3>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  {/* Reasoning Bullet Points */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                      <Search className="w-4 h-4 mr-2 text-indigo-500" />
                      เหตุผลประกอบการวิเคราะห์
                    </h3>
                    <ul className="space-y-3">
                      {result.reasoning.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-slate-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
