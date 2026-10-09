import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Save, ScanLine, BookOpen, Check, SearchX } from 'lucide-react';
import PageHeader from '../components/cards/PageHeader';
import EmptyState from '../components/cards/EmptyState';
import ScanThumb from '../components/cards/ScanThumb';
import DemoTag from '../components/cards/DemoTag';
import ConfidenceMeter from '../components/diagnosis/ConfidenceMeter';
import SeverityPanel from '../components/diagnosis/SeverityPanel';
import AffectedRegions from '../components/diagnosis/AffectedRegions';
import GuidancePanel from '../components/diagnosis/GuidancePanel';
import { useApp } from '../context/AppContext';
import { useScans } from '../hooks/useScans';
import { useGuidance } from '../hooks/useGuidance';
import { getStatusMeta } from '../utils/status';
import { formatDateTime } from '../utils/format';
import { useT } from '../i18n';

export default function Results() {
  const { id } = useParams();
  const { currentScan, history, addScan } = useApp();
  // Only ask the server for history when this result is not the one we just produced
  const { scans } = useScans({ fetchServer: currentScan?.id !== id });
  const { t } = useT();

  const scan = currentScan?.id === id ? currentScan : scans.find((s) => s.id === id);

  // Only look up guidance when the result did not carry its own
  const needsLookup = !!scan && !scan.guidance && !!scan.disease && ['disease', 'uncertain'].includes(scan.status);
  const lookup = useGuidance(scan?.disease, { enabled: needsLookup });

  if (!scan) {
    return (
      <EmptyState
        icon={SearchX}
        title="We could not find this result"
        message="It may have been removed, or it was not saved on this device."
        action={
          <Link to="/diagnosis" className="btn-primary">
            {t('res.scanAnother')}
          </Link>
        }
      />
    );
  }

  const meta = getStatusMeta(scan.status);
  const StatusIcon = meta.icon;
  const saved = history.some((s) => s.id === scan.id);
  const imageUrl = scan.previewUrl || scan.thumbnail || null;
  const guidance = scan.guidance || lookup.data || null;
  const title =
    scan.disease || (scan.status === 'healthy' ? 'No disease detected' : scan.status === 'uncertain' ? 'Could not identify' : 'No label returned');

  return (
    <div>
      <PageHeader
        eyebrow={t('res.title')}
        title={title}
        subtitle={`Scanned ${formatDateTime(scan.createdAt)}${scan.crop ? ` · Crop: ${scan.crop}` : ''}`}
        actions={scan.isDemo ? <DemoTag /> : null}
      />

      {scan.isDemo && (
        <p className="mb-5 rounded-xl border border-gold/60 bg-yellow-50 px-4 py-3 text-base font-medium text-yellow-950" role="note">
          This is an illustrative demo result. It was NOT produced by the AI model.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left: image + status */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="card">
            {imageUrl ? (
              <img src={imageUrl} alt="Analysed crop leaf" className="max-h-[380px] w-full rounded-xl object-contain" />
            ) : (
              <div className="flex justify-center py-6">
                <ScanThumb src={null} className="h-28 w-28" />
              </div>
            )}
          </div>
          <div className={`rounded-2xl border p-5 ${meta.panel}`}>
            <div className="flex items-center gap-3">
              <StatusIcon size={30} className={meta.text} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-ink/60">Health status</p>
                <p className={`font-display text-xl font-bold ${meta.text}`}>{meta.label}</p>
              </div>
            </div>
            <p className="mt-3 text-base">{meta.explain}</p>
            {scan.statusText && scan.statusText.toLowerCase() !== scan.status && (
              <p className="mt-2 text-sm text-ink/60">Server status text: “{scan.statusText}”</p>
            )}
          </div>
        </motion.div>

        {/* Right: details */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-5">
          <div className="card space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink/60">Predicted label</h3>
              <p className="mt-1 font-display text-2xl font-bold">{scan.disease || 'No label returned'}</p>
            </div>
            <ConfidenceMeter confidence={scan.confidence} />
            <SeverityPanel severity={scan.severity} />
          </div>

          {(scan.regions?.length > 0 || scan.overlayUrl) && (
            <div className="card">
              <AffectedRegions imageUrl={imageUrl} regions={scan.regions} overlayUrl={scan.overlayUrl} />
            </div>
          )}

          <div className="card">
            <h3 className="mb-3 font-display text-xl font-bold">Recommended actions</h3>
            <GuidancePanel guidance={guidance} status={scan.status} loading={needsLookup && lookup.status === 'loading'} isDemo={scan.isDemo} />
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link to="/diagnosis" className="btn-primary">
          <ScanLine size={20} aria-hidden="true" /> {t('res.scanAnother')}
        </Link>
        <Link to={scan.disease ? `/guidance?q=${encodeURIComponent(scan.disease)}` : '/guidance'} className="btn-secondary">
          <BookOpen size={20} aria-hidden="true" /> {t('res.viewGuidance')}
        </Link>
        {saved ? (
          <span className="btn-secondary cursor-default border-green-300 bg-green-50 text-green-900">
            <Check size={20} aria-hidden="true" /> Saved on this device
          </span>
        ) : (
          <button type="button" className="btn-secondary" onClick={() => addScan(scan)}>
            <Save size={20} aria-hidden="true" /> {t('res.save')}
          </button>
        )}
        <Link to="/history" className="btn-secondary">
          <History size={20} aria-hidden="true" /> {t('res.viewHistory')}
        </Link>
      </div>
    </div>
  );
}
