import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getHeroBanner, updateHeroBanner } from '../services/firestoreService';

export default function HeroEditorView({ showToast }) {
  const [heroData, setHeroData] = useState({
    badge: 'Available for New Projects',
    headlinePart1: 'PLAN. BUILD.',
    headlinePart2: 'LAUNCH.',
    subcopy: 'We design and build websites and apps that are easy to use and built around your business goals.',
    primaryCtaText: 'EXPLORE SERVICES',
    primaryCtaLink: 'services',
    secondaryCtaText: 'VIEW OUR WORK',
    secondaryCtaLink: 'work',
    visibility: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHeroBanner();
        if (data) setHeroData(data);
      } catch (err) {
        console.error('Error loading hero banner:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHeroData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHeroBanner(heroData);
      showToast('Hero banner saved and published to live website!', 'success');
    } catch (err) {
      console.error('Error saving hero:', err);
      showToast(err.message || 'Failed to save hero banner.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="view-section" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading hero banner from Firestore...</p>
      </div>
    );
  }

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Website Hero &amp; Studio Banner</h1>
          <p className="page-header-subtitle">
            Configure the flagship headline, value proposition, and primary calls to action on the public homepage
          </p>
        </div>
        <div className="page-header-actions">
          <button 
            type="button" 
            className="btn btn-lime btn-sm"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>{saving ? 'Publishing...' : 'Publish to Live Website'}</span>
          </button>
        </div>
      </div>

      {/* Live Visual Preview */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Live Interactive Homepage Preview
        </div>
        <div className="hero-live-preview-box">
          <div className="preview-pill">
            <span className="pulse-dot" />
            <span>{heroData.badge || 'Available for New Projects'}</span>
          </div>

          <h2 className="preview-headline">
            {heroData.headlinePart1 || 'PLAN. BUILD.'}<br />
            <span style={{ color: 'var(--brand-lime)' }}>{heroData.headlinePart2 || 'LAUNCH.'}</span>
          </h2>

          <p className="preview-subcopy">
            {heroData.subcopy}
          </p>

          <div className="preview-cta-group">
            <span className="btn btn-lime btn-sm">
              <span>{heroData.primaryCtaText || 'EXPLORE SERVICES'}</span>
              <span>↗</span>
            </span>
            <span className="btn btn-outline btn-sm">
              <span>{heroData.secondaryCtaText || 'VIEW OUR WORK'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Hero Content Controls</h3>

        <div className="form-group">
          <label className="form-label" htmlFor="badge">Availability Status Badge</label>
          <input
            type="text"
            id="badge"
            name="badge"
            className="form-control"
            value={heroData.badge || ''}
            onChange={handleChange}
            placeholder="e.g. Available for New Projects"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="headlinePart1">Headline (Line 1)</label>
            <input
              type="text"
              id="headlinePart1"
              name="headlinePart1"
              className="form-control"
              value={heroData.headlinePart1 || ''}
              onChange={handleChange}
              placeholder="e.g. PLAN. BUILD."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="headlinePart2">Headline (Line 2 Highlighted)</label>
            <input
              type="text"
              id="headlinePart2"
              name="headlinePart2"
              className="form-control"
              value={heroData.headlinePart2 || ''}
              onChange={handleChange}
              placeholder="e.g. LAUNCH."
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="subcopy">Value Proposition Subcopy</label>
          <textarea
            id="subcopy"
            name="subcopy"
            className="form-control"
            rows="3"
            value={heroData.subcopy || ''}
            onChange={handleChange}
            placeholder="Subcopy narrative displayed below the headline..."
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="primaryCtaText">Primary CTA Button Label</label>
            <input
              type="text"
              id="primaryCtaText"
              name="primaryCtaText"
              className="form-control"
              value={heroData.primaryCtaText || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="primaryCtaLink">Primary CTA Route</label>
            <select
              id="primaryCtaLink"
              name="primaryCtaLink"
              className="form-control"
              value={heroData.primaryCtaLink || 'services'}
              onChange={handleChange}
            >
              <option value="services">Services Page (#/services)</option>
              <option value="work">Portfolio Work (#/work)</option>
              <option value="contact">Contact Form (#/contact)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="secondaryCtaText">Secondary CTA Button Label</label>
            <input
              type="text"
              id="secondaryCtaText"
              name="secondaryCtaText"
              className="form-control"
              value={heroData.secondaryCtaText || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="secondaryCtaLink">Secondary CTA Route</label>
            <select
              id="secondaryCtaLink"
              name="secondaryCtaLink"
              className="form-control"
              value={heroData.secondaryCtaLink || 'work'}
              onChange={handleChange}
            >
              <option value="work">Portfolio Work (#/work)</option>
              <option value="services">Services Page (#/services)</option>
              <option value="process">Process Timeline (#/process)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setHeroData({
                badge: 'Available for New Projects',
                headlinePart1: 'PLAN. BUILD.',
                headlinePart2: 'LAUNCH.',
                subcopy: 'We design and build websites and apps that are easy to use and built around your business goals.',
                primaryCtaText: 'EXPLORE SERVICES',
                primaryCtaLink: 'services',
                secondaryCtaText: 'VIEW OUR WORK',
                secondaryCtaLink: 'work',
                visibility: true
              });
            }}
          >
            Reset to Studio Defaults
          </button>
          <button
            type="submit"
            className="btn btn-lime btn-sm"
            disabled={saving}
          >
            <span>{saving ? 'Publishing...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
