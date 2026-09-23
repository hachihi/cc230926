import ReportView from "./ReportView";

export default function ReportsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Báo cáo chấm công</h1>
      <p className="text-ink/60 mb-6">Tổng hợp số giờ làm việc theo nhân viên và khoảng thời gian.</p>
      <ReportView />
    </div>
  );
}
