import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Activity, AlertCircle, CheckCircle, Calendar, Search, Zap } from 'lucide-react';
import { parseExcel } from './utils/excelParser';
import { analyzeMeterData } from './services/geminiService';
import { AnalysisResult } from './types';

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
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'elec' | 'prod') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'elec') setElecFile(e.target.files[0]);
      else setProdFile(e.target.files[0]);
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sarabun">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg sticky top-0 z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/30">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Meter Detective AI <span className="text-blue-400 text-sm font-normal ml-2">Powered by Gemini 3.0</span></h1>
              <p className="text-xs text-slate-300">ระบบวิเคราะห์ความผิดปกติมิเตอร์ไฟฟ้าสำหรับผู้เชี่ยวชาญ</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Data Upload Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                นำเข้าข้อมูล (Excel)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">1. ไฟล์สถิติการใช้ไฟฟ้า</label>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileChange(e, 'elec')} className="hidden" id="elec-file" />
                    <label htmlFor="elec-file" className={`flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${elecFile ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500'}`}>
                      {elecFile ? <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> {elecFile.name}</span> : <span className="flex items-center"><Upload className="w-4 h-4 mr-2"/> อัปโหลดไฟล์</span>}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">2. ข้อมูลผลผลิต</label>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileChange(e, 'prod')} className="hidden" id="prod-file" />
                    <label htmlFor="prod-file" className={`flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${prodFile ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500'}`}>
                       {prodFile ? <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> {prodFile.name}</span> : <span className="flex items-center"><Upload className="w-4 h-4 mr-2"/> อัปโหลดไฟล์</span>}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Details Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                พารามิเตอร์การวิเคราะห์
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สาเหตุการชำรุด</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" 
                    placeholder="เช่น เฟืองไม่หมุน, ขดลวดไหม้, หน้าจอไม่ติด"
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ตรวจพบ</label>
                    <input 
                      type="date" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={discoveryDate}
                      onChange={(e) => setDiscoveryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่แก้ไขเสร็จ</label>
                    <input 
                      type="date" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={fixDate}
                      onChange={(e) => setFixDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ข้อมูลเพิ่มเติม</label>
                  <textarea 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    rows={3}
                    placeholder="เช่น สภาพแวดล้อม, การเปลี่ยนแปลงเครื่องจักร..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full mt-2 py-3.5 px-4 rounded-lg text-white font-semibold flex items-center justify-center shadow-lg transition-all transform active:scale-95
                    ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'}
                  `}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      กำลังวิเคราะห์ข้อมูลด้วย AI...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2 fill-current" />
                      เริ่มการวิเคราะห์
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-start animate-pulse">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Welcome / Empty State */}
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <Activity className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">พร้อมสำหรับการวิเคราะห์</h3>
                <p className="max-w-md mt-2 text-sm">
                  กรุณาอัปโหลดไฟล์ Excel ข้อมูลการใช้ไฟฟ้าและผลผลิต จากนั้นระบุรายละเอียดความผิดปกติ เพื่อให้ AI ประมวลผลหาระยะเวลาที่เริ่มชำรุด
                </p>
              </div>
            )}

            {/* Analysis Result Section */}
            {result && (
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
                <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-white font-bold text-xl flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-green-400" />
                    ผลการวิเคราะห์
                  </h2>
                  <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-600">
                    AI Confidence: {result.confidenceScore}%
                  </span>
                </div>
                
                <div className="p-8">
                  
                  {/* Primary Answer */}
                  <div className="mb-8 text-center">
                    <p className="text-slate-500 font-medium text-sm uppercase tracking-widest mb-2">มิเตอร์เริ่มชำรุด/ผิดปกติตั้งแต่</p>
                    <div className="inline-block bg-red-50 border-2 border-red-100 px-8 py-4 rounded-2xl">
                      <p className="text-4xl font-extrabold text-red-600">
                        {result.failureStartMonth}
                      </p>
                    </div>
                    <p className="mt-4 text-slate-600 italic">"{result.summary}"</p>
                  </div>

                  <div className="border-t border-slate-100 my-6"></div>

                  {/* Reasoning Bullet Points */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                      <Search className="w-5 h-5 mr-2 text-blue-600" />
                      เหตุผลประกอบการวิเคราะห์
                    </h3>
                    <div className="space-y-4">
                      {result.reasoning.map((point, index) => (
                        <div key={index} className="flex items-start bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md shadow-blue-200">
                            {index + 1}
                          </div>
                          <p className="text-slate-700 text-base leading-relaxed mt-0.5">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Anomaly Type Badge */}
                  <div className="mt-8 flex justify-end">
                    <div className="flex items-center text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
                      <span>รูปแบบความผิดปกติ:</span>
                      <span className="ml-2 font-semibold text-slate-700">{result.anomalyType}</span>
                    </div>
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