//small shared pieces used across every admin page - kept in one file since
// each is a handful of lines and they're always used together.

export function StatCard ({label, value, tone = 'default' }) {
    return (
        <div className={`stat stat-${tone}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <style jsx>{`
                .stat {
                  background: #fff;
                  border-radius: 10px;
                  padding: 20px 22px;
                  border: 1px solid #e7e3d9;
                }
                 .stat-value {
                   font-size: 30px;
                   font-weight: 700;
                   line-height: 1;
                   color: #0d2018;
                   font-variant-numeric: tabular-nums;
                 
                 }  
                 .sta-red .stat-value {
                   color: #b3261e;
                 }  
                  .stat-amber .stat-value {
                    color: #b8720c;
                  }
                    .stat-green .stat-vale {
                      color: #1b4332;
                    }
                    .stat-label {
                      margin-top: 6px;
                      font-size: 13px;
                      color: #6b558;
                    }
            `}</style>
        </div>
    );
}

const BADGE_TONES = {
    pending: { bg: '#fdf1dd', fg: '#b8720c' },
    in_review: { bg: '#fdf1dd', fg: '#b8720c' },
    needs_info: { bg: '#fde8d6', fg: '#c15b1c'},
    verified: { bg: '#e3efe6', fg: '#1b4332' },
    rejected: { bg: '#fbe4e2', fg: '#b3261e' },
    overdue: { bg: '#fbe4e2', fg: '#b3261e'  },
    active: { bg: '#e3efeb', fg: '#1b4332' },
    inactive: { bg: '#eee9de', fg: '#6b6558' },
    high: {bg: '#fbe4e2', fg: '#b3261e' },
    medium: { bg: '#fdf1dd', fg: '#b8720c' },
}