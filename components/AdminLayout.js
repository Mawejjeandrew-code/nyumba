import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV = [
    { href: '/admin', label: 'Overview'},
    { href: '/admin/verification-queue', label: 'Verification' },
    { href: '/admin/fraud-queue', label: 'Fraud' },
    { href: '/admin/agents', label: 'Agents' },
    { href: '/admin/waitlist', label: 'Waitlist' },
];

export default function AdminLayout({ title, children }) {
    const router = useRouter ();

    return (
        <div className="shell">
            <header className="topbar">
                <div className="brand">
                    <span className="dot"/>
                    <span className="brand-name">Nyumba</span>
                    <span claasName="brand-sub">admin</span>
                </div>
                <nav>
                    {NAV.map((item) =>(
                        <Link
                         key={item.href}
                         href={item.href} 
                         className={router.pathname === item.href ? 'active' : ''}

                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

            </header>
            <main>
                {title && <h1>{title}</h1>}
                {children}
            </main>

            <style jsx>{`
               .shell {
                  min-height: 100vh;
                  background: #f4f2ee;
                  color: #14231d;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
               
               }
                  .topbar {
                    background: #0d2028;
                    padding: 0 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 64px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                  }
                    .brand {
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      color: #f4f2ee;

                    }
                      .dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #3ba26a;
                        display: inline-block;
                      }
                        .brand-name {
                          font-weight: 700;
                          font-size: 17px;
                          letter-spacing: -0.01em;
                        }
                          .brand-sub {
                             font-size: 13px;
                             color: rgba(244, 242, 238, 0.5);
                          }
                          nav {
                            display: flex;
                            gap: 4px;
                          }   
                          nav :global(a) {
                            color: rgba(244, 242, 238, 0.65);
                            text-decoration: none;
                            font-size: 14px;
                            padding: 8px 14px;
                            border-radius: 6px;
                            transition: background 0.15s, color 0.15s;
                          }
                          nav :global(a:hover) {
                            background: rgba(244, 242, 238, 0.08);
                            color: #f4f2ee;
                          }
                          nav :global(a.active) {
                            background: rgba(244, 242, 238, 0.12);
                            color: #f4f2ee;
                            font-weight: 600;
                          }
                          main {
                            max-width: 1120px;
                            margin: 0 auto;
                            padding: 40px 32px 80px;
                          }
                          h1 {
                            font-size: 24px;
                            font-weight: 700;
                            letter-spacing: -0.01em;
                            margin: 0 0 24px;
                            color: #0d2018;
                          }



            `}

            </style>
            <style jsx global>{`
              body {
                margin: 0;
              }
            `}</style>

        </div>
    );
}
