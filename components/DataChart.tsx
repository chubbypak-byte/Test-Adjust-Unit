import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartDataPoint } from '../types';

interface DataChartProps {
  data: ChartDataPoint[];
  failureStartMonth?: string;
}

const DataChart: React.FC<DataChartProps> = ({ data, failureStartMonth }) => {
  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">แผนภูมิเปรียบเทียบการใช้ไฟฟ้า vs ผลผลิต</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="month" scale="point" padding={{ left: 10, right: 10 }} />
          <YAxis yAxisId="left" label={{ value: 'หน่วยไฟฟ้า (Unit)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'ผลผลิต (Qty)', angle: 90, position: 'insideRight' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Bar yAxisId="right" dataKey="production" name="ผลผลิต (Production)" barSize={20} fill="#cbd5e1" />
          <Line yAxisId="left" type="monotone" dataKey="usage" name="การใช้ไฟฟ้า (Usage)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          
          {failureStartMonth && (
             <ReferenceLine x={failureStartMonth} stroke="red" label="จุดเริ่มชำรุด" strokeDasharray="3 3" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;
