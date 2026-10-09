import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Leaf, ScanLine, ShieldAlert, Sprout, Telescope } from 'lucide-react';
import HeroVisual from '../components/cards/HeroVisual';
import FeatureCard from '../components/cards/FeatureCard';
import {
  CAPABILITIES,
  FEATURES,
  HELPS,
  LIMITATIONS,
  STEPS,
  WHY_EARLY,
} from '../data/content';
import { TEAM } from '../config';
import { useT } from '../i18n';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' },
});

function Section({ id, eyebrow, title, subtitle, children, tinted = false }) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${tinted ? 'bg-mint/70' : ''}`}>
      <div className="container-page">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-ink/70">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  return (
    <div>
      <ol className="mx-auto flex max-w-4xl flex-col items-stretch gap-3 md:flex-row md:items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === active;
          return (
            <li key={s.title} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`flex min-h-[96px] w-full flex-1 items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  isActive ? 'border-forest bg-forest text-white shadow-lift' : 'border-forest/15 bg-white hover:border-forest/40 hover:shadow-soft'
                }`}
              >
                <span
                  className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? 'bg-white/15 text-gold' : 'bg-mint text-forest'
                  }`}
                >
                  <Icon size={28} aria-hidden="true" />
                </span>
                <span>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isActive ? 'text-green-200' : 'text-forest/70'}`}>
                    Step {i + 1}
                  </span>
                  <span className="block font-display text-xl font-bold">{s.title}</span>
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden shrink-0 text-forest/40 md:block" size={28} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
      <div className="mx-auto mt-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="card"
            aria-live="polite"
          >
            <p className="font-display text-xl font-bold">
              Step {active + 1} — {step.title}
            </p>
            <p className="mt-1 text-lg font-medium text-forest">{step.text}</p>
            <p className="mt-2 text-base text-ink/75">{step.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useT();
  return (
    <>
      {/* Hero */}
      <section className="leaf-pattern relative overflow-hidden">
        <div className="container-page grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.span {...fadeUp(0)} className="eyebrow mb-5">
              <Sprout size={14} aria-hidden="true" /> {TEAM.competition} · {TEAM.problemStatementId}
            </motion.span>
            <motion.h1 {...fadeUp(0.08)} className="text-4xl font-extrabold leading-[1.1] text-deep sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </motion.h1>
            <motion.p {...fadeUp(0.16)} className="mt-5 max-w-xl text-lg text-ink/75 sm:text-xl">
              {t('hero.subtitle')}
            </motion.p>
            <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/diagnosis" className="btn-primary text-lg">
                <ScanLine size={22} aria-hidden="true" /> {t('hero.primary')}
              </Link>
              <Link to="/dashboard" className="btn-secondary text-lg">
                {t('hero.secondary')} <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.p {...fadeUp(0.32)} className="mt-6 text-sm font-medium text-ink/60">
              {TEAM.tagline}
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* Key features */}
      <Section eyebrow="What KrishiNetra offers" title="Everything starts with one leaf photo" subtitle="Four simple tools to help you look after your crop.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how-it-works" tinted eyebrow="Simple by design" title="How KrishiNetra Works" subtitle="Three easy steps from the field to a result. Tap a step to read more.">
        <HowItWorks />
      </Section>

      {/* Why early detection */}
      <Section eyebrow="Why it matters" title="Why Early Detection Matters">
        <div className="grid gap-5 md:grid-cols-3">
          {WHY_EARLY.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <span className="font-display text-4xl font-extrabold text-fresh">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 text-xl font-bold">{w.title}</h3>
              <p className="mt-1.5 text-base text-ink/75">{w.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How helps farmers */}
      <Section tinted eyebrow="Built for farmers" title="How KrishiNetra Helps Farmers">
        <div className="grid gap-5 md:grid-cols-3">
          {HELPS.map((h, i) => (
            <FeatureCard key={h.title} {...h} index={i} />
          ))}
        </div>
      </Section>

      {/* Capabilities */}
      <Section eyebrow="Inside the platform" title="Platform Capabilities" subtitle="Some capabilities depend on the backend and are marked as planned until connected.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-soft">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-forest">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-base text-ink/70">{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Responsible AI */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-4xl rounded-3xl border border-gold/50 bg-gradient-to-br from-yellow-50 to-white p-6 shadow-soft sm:p-10">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold text-ink">
                <ShieldAlert size={26} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Responsible AI and Prediction Limitations</h2>
                <p className="mt-2 text-base text-ink/75">
                  KrishiNetra is a decision-support prototype. Please read these points before relying on any result.
                </p>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {LIMITATIONS.map((l) => (
                <li key={l} className="flex gap-2.5 text-base">
                  <Leaf size={18} className="mt-1 shrink-0 text-forest" aria-hidden="true" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-gradient-to-br from-deep via-forest to-deep py-16 text-white sm:py-20">
        <div className="container-page mx-auto max-w-3xl text-center">
          <Telescope className="mx-auto text-gold" size={36} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Smart Agriculture Vision</h2>
          <p className="mt-4 text-lg text-green-100">
            Our mission is to make crop health monitoring simpler, faster, more accessible and more useful for farmers —
            starting with leaf photographs today, and growing towards weather data and IoT sensors in the future.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/diagnosis" className="btn-gold text-lg">
              <ScanLine size={22} aria-hidden="true" /> {t('hero.primary')}
            </Link>
            <Link to="/about" className="btn border border-white/40 text-lg text-white hover:bg-white/10">
              About the project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
