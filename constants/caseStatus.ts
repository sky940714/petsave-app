export type CaseStatus = 'received' | 'dispatched' | 'acknowledged' | 'in_progress' | 'closed';

export const STATUS_LABELS: Record<CaseStatus, string> = {
  received: '受理',
  dispatched: '已派遣',
  acknowledged: '已確認',
  in_progress: '處理中',
  closed: '已結案',
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  received: '#C77B3F',
  dispatched: '#3E7CB1',
  acknowledged: '#5B8C5A',
  in_progress: '#B15B3E',
  closed: '#6B6B6B',
};

export const REPORT_REASONS = ['犬隻', '貓隻', '其他動物', '協尋', '其他'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
