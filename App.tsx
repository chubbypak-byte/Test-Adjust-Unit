import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Zap, 
  Calendar, 
  FileText, 
  ArrowRight,
  Cpu,
  BarChart3
} from 'lucide-react';
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
      setError("กรุณากรอกข้อมูลจำเป็น (*) ให้ครบถ้วน");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sarabun pb-12">
      
      {/* Minimal Modern Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Meter Detective</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">AI Statistical Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-slate-600 font-inter">Gemini 3.0 Pro</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: INPUT CONTROLS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section 1: Data Source */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">1</div>
                <h2 className="font-semibold text-slate-800">ข้อมูลดิบ (Excel)</h2>
              </div>
              
              <div className="space-y-3">
                {/* Elec File */}
                <div className="group">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">สถิติการใช้ไฟฟ้า *</label>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileChange(e, 'elec')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${elecFile ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50/50'}`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg ${elecFile ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <span className={`text-sm truncate font-medium ${elecFile ? 'text-green-800' : 'text-slate-500'}`}>
                          {elecFile ? elecFile.name : 'คลิกเพื่อเลือกไฟล์'}
                        </span>
                      </div>
                      {elecFile && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    </div>
                  </div>
                </div>

                {/* Prod File */}
                <div className="group">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">ข้อมูลผลผลิต *</label>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileChange(e, 'prod')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${prodFile ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50/50'}`}>
                       <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg ${prodFile ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className={`text-sm truncate font-medium ${prodFile ? 'text-green-800' : 'text-slate-500'}`}>
                          {prodFile ? prodFile.name : 'คลิกเพื่อเลือกไฟล์'}
                        </span>
                      </div>
                      {prodFile && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Context */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">2</div>
                <h2 className="font-semibold text-slate-800">ข้อมูลประกอบการวิเคราะห์</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">สาเหตุการชำรุด *</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all" 
                    placeholder="ระบุอาการ เช่น เฟืองรูด, หน้าจอดับ..."
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">วันที่ตรวจพบ *</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-600"
                        value={discoveryDate}
                        onChange={(e) => setDiscoveryDate(e.target.value)}
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">วันที่แก้ไขเสร็จ</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-600"
                        value={fixDate}
                        onChange={(e) => setFixDate(e.target.value)}
                      />
                       <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">ข้อมูลเพิ่มเติม (Optional)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all resize-none" 
                    rows={3}
                    placeholder="รายละเอียดสภาพแวดล้อม หรือข้อสังเกตอื่นๆ..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Action Button */}
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
                ${loading 
                  ? 'bg-slate-800 cursor-not-allowed opacity-80' 
                  : 'bg-slate-900 hover:bg-slate-800 hover:shadow-xl ring-4 ring-slate-100'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังประมวลผลด้วย AI...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>เริ่มการวิเคราะห์</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: OUTPUT */}
          <div className="lg:col-span-7 min-h-[500px]">
            
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">ยังไม่มีผลการวิเคราะห์</h3>
                <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                  กรุณาอัปโหลดไฟล์และกรอกข้อมูลทางด้านซ้าย เพื่อให้ AI เริ่มทำการวิเคราะห์
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                 <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                 </div>
                 <h3 className="text-lg font-semibold text-slate-800">AI กำลังคิดวิเคราะห์...</h3>
                 <p className="text-slate-500 text-sm mt-2">กำลังตรวจสอบความสัมพันธ์ระหว่างการใช้ไฟฟ้าและผลผลิต</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide border border-green-200">
                        Analysis Complete
                      </span>
                      <span className="text-slate-400 text-xs">
                        • {new Date().toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-slate-500 font-medium mb-2">มิเตอร์เริ่มมีความผิดปกติตั้งแต่</p>
                      <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 font-inter">
                        {result.failureStartMonth}
                      </h2>
                      <p className="text-lg text-slate-600 font-light italic max-w-2xl mx-auto">
                        "{result.summary}"
                      </p>
                    </div>

                    <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold text-slate-700">ระดับความเชื่อมั่น (AI Confidence)</span>
                        <span className="text-2xl font-bold text-indigo-600 font-inter">{result.confidenceScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${result.confidenceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasoning Cards */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    เหตุผลประกอบการวิเคราะห์
                  </h3>
                  <div className="grid gap-4">
                    {result.reasoning.map((reason, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:border-indigo-100 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-end items-center gap-2 text-sm text-slate-400 mt-8">
                  <span>รูปแบบความผิดปกติ:</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-medium font-inter">
                    {result.anomalyType}
                  </span>
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