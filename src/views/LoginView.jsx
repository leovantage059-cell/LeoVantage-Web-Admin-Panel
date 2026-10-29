import React, { useState } from 'react';
import { useAuth, AUTHORIZED_SUPER_ADMINS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { ShieldCheck, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';

export default function LoginView() {
  const { loginWithGoogle, authError } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleGoogleSignIn = async () => {
    setLocalError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setLocalError(err.message || 'Google sign-in was cancelled or encountered an error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const errorMessage = localError || authError;

  return (
    <div className="auth-page-wrap">
      <div className="auth-backdrop" />

      {/* Top right theme toggle for login */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Logo variant="squircle" height={52} theme={theme} />
          </div>
          <h1 className="auth-title">LeoVantage Admin OS</h1>
          <p className="auth-subtitle">
            Sign in with Google to access studio operations, CRM &amp; analytics
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-red-bg)',
              border: '1px solid var(--status-red)',
              color: 'var(--status-red)',
              fontSize: '0.82rem',
              marginBottom: '20px',
              lineHeight: '1.4',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-lime"
            style={{
              width: '100%',
              padding: '12px 18px',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: 'var(--shadow-sm)'
            }}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
              />
            </svg>
            <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            {!loading && <ArrowRight size={15} style={{ marginLeft: '2px' }} />}
          </button>
        </div>

        {/* Authorized Accounts Box */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={14} color="var(--brand-lime)" />
            <span>Authorized Studio Accounts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {AUTHORIZED_SUPER_ADMINS.map((email) => (
              <div
                key={email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-card)',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {email}
                </span>
                <span className="badge badge-published" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                  Super Admin
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: '10px 0 0 0',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              lineHeight: '1.4'
            }}
          >
            Only designated studio Google accounts have verified cryptographic access to studio records, financials, and CRM data.
          </p>
        </div>
      </div>
    </div>
  );
}
