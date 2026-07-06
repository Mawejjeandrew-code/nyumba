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
};

export function Badge({ children, tone ='pending'}) {
    const t = BADGE_TONES[tone] || BADGE_TONES.pending;
    return (
        <span className="badge">
            {children}
            <style jsx>{`
               .badge {
                 dispaly: inline-block;
                 padding: 3px 10px;
                 border-radius: 100px;
                 font-size: 12px;
                 font-weight: 600;
                 text-transform: capitalize;
                 background: ${t.bg};
                 color: ${t.fg};
                 white-space: nowrap;
               }
            
            `}

            </style>
        </span>
    );
}

export function Button({ children, onClick, variant = 'default', disabled}) {
    return (
        <botton className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
            {children}
            <style jsx>{`
               .btn {
                 border: none;
                 border-radius: 7px;
                 padding: 7px 14px;
                 font-size: 13px;
                 font-weight: 600;
                 cursor: pointer;
                 transition: opacity 0.15s;

               }
               .btn:disabled {
                 opacity: 0.5;
                 cursor: not-allowed;
               }
               .btn:not(:disabled): hover {
                 opacity: 0.85;
               }
               .btn-default {
                 background: #eee9de;
                 color: #0d2018;
               }
               .btn-primary {
                 background: #1b4332;
                 color: #fff;
               }  
               .btn-danger {
                  background: #b3261e;
                  color: #fff;
               }  
               .btn-amber {
                 background: #e8a33d;
                 color: #29200a;
               }   
            `}

            </style>
        </botton>
    );
}
 
export function EmptyState({ children }) {
  return (
    <div className="empty">
      {children}
      <style jsx>{`
        .empty {
          padding: 48px 24px;
          text-align: center;
          color: #8a8474;
          font-size: 14px;
          background: #fff;
          border: 1px dashed #e0dbcd;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
 
export function Card({ children }) {
  return (
    <div className="card">
      {children}
      <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid #e7e3d9;
          border-radius: 10px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}