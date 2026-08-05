import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const STEPS = 4;
const SEEN_KEY = 'nyumba_onboarded';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Returning visitors who've already seen this skip straight to search —
    // onboarding is a first-visit story, not a gate every time.
    if (typeof window !== 'undefined' && localStorage.getItem(SEEN_KEY)) {
      router.replace('/search');
      return;
    }
    setReady(true);
  }, [router]);

  function finish() {
    if (typeof window !== 'undefined') localStorage.setItem(SEEN_KEY, '1');
    router.push(role === 'landlord' ? '/landlord/login' : '/search');
  }

  if (!ready) return null;

  return (
    <div className="page">
      <div className="dots">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span key={i} className={i === step ? 'active' : i < step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 && (
        <Screen dark>
          <div className="villain">
            <i className="ti ti-phone-off" />
          </div>
          <h1>You call about a house.<br />A stranger answers.</h1>
          <p>He's never lived there. He's never met the owner. He just wants 10% of your rent to let you in.</p>
          <Nav onNext={() => setStep(1)} label="Continue" />
        </Screen>
      )}

      {step === 1 && (
        <Screen dark>
          <div className="hero-mark"><span className="dot" /></div>
          <h1>No broker.<br />Just home.</h1>
          <p>Nyumba connects you straight to the landlord. Verified listings, direct contact, zero fees — always.</p>
          <Nav onNext={() => setStep(2)} label="Continue" />
        </Screen>
      )}

      {step === 2 && (
        <Screen>
          <h1>Three steps. That's it.</h1>
          <div className="path">
            <PathStep n="1" title="Search free" body="Browse verified listings by area, price, and amenities." />
            <PathStep n="2" title="Contact direct" body="Message or call the landlord yourself. No middleman." />
            <PathStep n="3" title="Move in" body="Agree terms directly. You keep the money a broker would have taken." />
          </div>
          <Nav onNext={() => setStep(3)} label="Continue" />
        </Screen>
      )}

      {step === 3 && (
        <Screen>
          <h1>What brings you here?</h1>
          <div className="roles">
            <button className={role === 'tenant' ? 'role active' : 'role'} onClick={() => setRole('tenant')}>
              <i className="ti ti-home-search" />
              <div className="role-title">I need a house</div>
              <div className="role-sub">Search verified listings, zero broker fees</div>
            </button>
            <button className={role === 'landlord' ? 'role active' : 'role'} onClick={() => setRole('landlord')}>
              <i className="ti ti-building-estate" />
              <div className="role-title">I have a house</div>
              <div className="role-sub">List for free, keep 100% of your rent</div>
            </button>
          </div>
          <Nav onNext={finish} label="Get started" disabled={!role} />
        </Screen>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f4f2ee;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
        }
        .dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 18px 0 0;
        }
        .dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d8d2c2;
        }
        .dots span.active {
          background: #1b4332;
          width: 16px;
          border-radius: 100px;
        }
        .dots span.done {
          background: #b8ae95;
        }
        .villain {
          font-size: 40px;
          color: #d85a30;
          margin-bottom: 8px;
        }
        .hero-mark {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(59, 162, 106, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .hero-mark .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3ba26a;
        }
        .path {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 24px;
          width: 100%;
        }
        .roles {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
          width: 100%;
        }
        .role {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 4px;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1.5px solid #e7e3d9;
          background: #fff;
          cursor: pointer;
        }
        .role i {
          font-size: 20px;
          color: #1b4332;
          margin-bottom: 2px;
        }
        .role-title {
          font-size: 14px;
          font-weight: 700;
          color: #0d2018;
        }
        .role-sub {
          font-size: 12px;
          color: #8a8474;
        }
        .role.active {
          border-color: #1b4332;
          background: #e3efe6;
        }
      `}</style>
    </div>
  );
}

function Screen({ children, dark }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '32px 28px',
      background: dark ? '#0d2018' : 'transparent',
      color: dark ? '#f4f2ee' : '#0d2018',
      margin: dark ? '18px 0 0' : 0,
      borderRadius: dark ? '0' : '0',
    }}>
      <div style={{ maxWidth: 340, width: '100%' }}>{children}</div>
      <style jsx>{`
        h1 { font-size: 24px; font-weight: 700; line-height: 1.3; margin: 6px 0 12px; }
        p { font-size: 14px; line-height: 1.6; opacity: 0.75; }
      `}</style>
    </div>
  );
}

function PathStep({ n, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 14, textAlign: 'left', alignItems: 'flex-start' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: '#1b4332', color: '#fff',
        fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{n}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0d2018' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6b6558', marginTop: 3, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

function Nav({ onNext, label, disabled }) {
  return (
    <button
      onClick={onNext}
      disabled={disabled}
      style={{
        marginTop: 28,
        width: '100%',
        background: disabled ? '#d8d2c2' : '#e8a33d',
        color: disabled ? '#a39c89' : '#29200a',
        border: 'none',
        padding: '13px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}