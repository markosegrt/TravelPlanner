import { useState } from 'react';
import { AccessLevel } from '../../models/enums';
import type { ShareResponse } from '../../models/Share';
import { shareService } from '../../services/shareService';
import { tripService } from '../../services/tripService';
import axios from 'axios';

export function ShareSection({ tripId, tripName }: {
  tripId: number;
  tripName: string;
}) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.View);
  const [share, setShare] = useState<ShareResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setShare(null);
    try {
      const result = await shareService.createShare(tripId, { accessLevel });
      setShare(result);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to generate share link.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!share) return;
    navigator.clipboard.writeText(share.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setError('');
    try {
      await tripService.downloadPdf(tripId, tripName);
    } catch {
      setError('Failed to download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {error && <div className="alert alert-error">{error}</div>}

      {/* SHARE */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-2)' }}>Share this plan</h3>
        <p className="text-muted mb-4" style={{ fontSize: 'var(--font-size-sm)' }}>
          Generate a QR code and link to share this trip with others.
        </p>

        <div className="form-group">
          <label className="form-label">Access level</label>
          <div className="flex gap-3">
            <label className="flex gap-2" style={{ alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="access"
                checked={accessLevel === AccessLevel.View}
                onChange={() => setAccessLevel(AccessLevel.View)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span>View only</span>
            </label>
            <label className="flex gap-2" style={{ alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="access"
                checked={accessLevel === AccessLevel.Edit}
                onChange={() => setAccessLevel(AccessLevel.Edit)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span>Can edit</span>
            </label>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate share link'}
        </button>

        {share && (
          <div className="mt-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <div className="flex gap-4" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* QR slika */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={`data:image/png;base64,${share.qrCodeBase64}`}
                  alt="Share QR code"
                  style={{ width: 160, height: 160, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                />
                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}>
                  {accessLevel === AccessLevel.Edit ? 'Edit access' : 'View access'}
                </p>
              </div>

              {/* Link */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="form-label">Share link</label>
                <div className="flex gap-2 mt-4" style={{ marginTop: 'var(--space-2)' }}>
                  <input className="form-input" value={share.shareUrl} readOnly style={{ flex: 1, fontSize: 'var(--font-size-sm)' }} />
                  <button className="btn btn-outline btn-sm" onClick={handleCopy}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXPORT */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-2)' }}>Export</h3>
        <p className="text-muted mb-4" style={{ fontSize: 'var(--font-size-sm)' }}>
          Download a PDF report of this trip plan.
        </p>
        <button className="btn btn-accent" onClick={handleDownloadPdf} disabled={downloading}>
          {downloading ? 'Preparing PDF...' : '↓ Download PDF report'}
        </button>
      </div>
    </div>
  );
}