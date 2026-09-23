"use client";
import { useEffect, useState } from "react";
import ExcelImportButton from "@/components/ExcelImportButton";

type ReportRow = {
  date: string;
  employeeId: string;
  employeeName: string;
  hours: number;
  events: number;
};

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 13);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function ReportView() {
  const [range, setRange] = useState(defaultRange());
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ from: range.from, to: range.to });
    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalHours = rows.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 mb-6 border border-line bg-white p-5">
        <div>
          <label className="block text-xs text-ink/50 mb-1">Từ ngày</label>
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="focus-ring border border-line px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Đến ngày</label>
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="focus-ring border border-line px-3 py-2 text-sm" />
        </div>
        <button onClick={load} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors">
          Xem báo cáo
        </button>
        <a
          href={`/api/reports/export?from=${range.from}&to=${range.to}`}
          className="focus-ring border border-line bg-white px-4 py-2 text-sm hover:bg-paper transition-colors"
        >
          Xuất Excel
        </a>
        <ExcelImportButton endpoint="/api/attendance/import" label="Nhập chấm công từ Excel" />
        <div className="ml-auto text-right">
          <p className="text-xs text-ink/50">Tổng số giờ trong kỳ</p>
          <p className="font-display text-2xl text-brand">{totalHours.toFixed(1)}h</p>
        </div>
      </div>

      <div className="border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Ngày</th>
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium">Số lượt chấm công</th>
              <th className="px-4 py-3 font-medium">Số giờ làm việc</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-ink/40">Đang tải…</td></tr>
            )}
            {!loading && rows.map((r) => (
              <tr key={`${r.employeeId}_${r.date}`} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink/70">{new Date(r.date).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 text-ink">{r.employeeName}</td>
                <td className="px-4 py-3 text-ink/70">{r.events}</td>
                <td className="px-4 py-3 text-ink">{r.hours.toFixed(2)}h</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-ink/40">Không có dữ liệu trong khoảng thời gian này.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
