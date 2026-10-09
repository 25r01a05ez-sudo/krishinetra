import { SUPPORTED_CROPS } from '../../config';

/** Optional crop hint – only offers crops configured in src/config.js (SUPPORTED_CROPS). */
export default function CropSelect({ value, onChange, disabled }) {
  const hasCrops = SUPPORTED_CROPS.length > 0;
  return (
    <div>
      <label htmlFor="crop-select" className="label">
        Crop (optional)
      </label>
      <select
        id="crop-select"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || !hasCrops}
      >
        <option value="">{hasCrops ? 'Let the model decide' : 'No crops configured yet'}</option>
        {SUPPORTED_CROPS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      {!hasCrops && (
        <p className="mt-1.5 text-sm text-ink/60">
          The supported crop list is added once confirmed with the backend team (see <code>SUPPORTED_CROPS</code> in
          <code> src/config.js</code>).
        </p>
      )}
    </div>
  );
}
