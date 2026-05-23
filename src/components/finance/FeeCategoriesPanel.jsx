import { Banknote, Bus, Layers, RefreshCw } from 'lucide-react';
import { ETB } from './financeUi';
import { ui } from '../../theme/tokens';
import { useI18n } from '../../context/I18nContext';
import Button from '../ui/Button';

const FREQ_KEYS = {
  annual: 'finance.frequencyAnnual',
  term: 'finance.frequencyTerm',
  monthly: 'finance.frequencyMonthly',
  one_time: 'One-time',
};

export default function FeeCategoriesPanel({ categories, onRefresh, loading }) {
  const { t } = useI18n();

  if (!categories?.length) {
    return (
      <div className={`${ui.alertInfo} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <p className="font-bold">{t('finance.feeCategories')}</p>
          <p className="text-sm mt-1 opacity-90">Create categories below (Tuition, Transport, Meals…) before schedules and subscriptions.</p>
        </div>
      </div>
    );
  }

  const mandatory = categories.filter((c) => c.category_type === 'mandatory' || c.is_mandatory);
  const optional = categories.filter((c) => c.category_type !== 'mandatory' && !c.is_mandatory);

  const CategoryCard = ({ c }) => (
    <div
      key={c.id}
      className={`p-4 rounded-2xl border transition-colors ${
        c.category_type === 'mandatory' || c.is_mandatory
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30'
          : 'border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{c.name}</p>
          {c.code && <p className="text-[10px] font-mono text-slate-400">{c.code}</p>}
        </div>
        {(c.category_type === 'mandatory' || c.is_mandatory) ? (
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">{t('finance.mandatory')}</span>
        ) : (
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-600 text-white">{t('finance.optional')}</span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        {FREQ_KEYS[c.frequency] ? t(FREQ_KEYS[c.frequency]) : c.frequency}
        {c.default_amount != null && Number(c.default_amount) > 0 && (
          <> · default {ETB.format(Number(c.default_amount))}</>
        )}
      </p>
      {c.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{c.description}</p>}
      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-2">
        {c.active_subscribers ?? 0} students subscribed
      </p>
    </div>
  );

  return (
    <div className={`${ui.card} p-5 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="text-emerald-600" size={20} />
          <h3 className={ui.panelTitle}>{t('finance.feeCategories')} ({categories.length})</h3>
        </div>
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={loading}>
            <RefreshCw size={14} /> {t('common.refresh')}
          </Button>
        )}
      </div>

      {mandatory.length > 0 && (
        <div>
          <p className={`${ui.mutedXs} mb-2 flex items-center gap-1`}>
            <Banknote size={12} /> {t('finance.mandatory')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {mandatory.map((c) => <CategoryCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {optional.length > 0 && (
        <div>
          <p className={`${ui.mutedXs} mb-2 flex items-center gap-1`}>
            <Bus size={12} /> {t('finance.optional')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {optional.map((c) => <CategoryCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
