import { settingColour, colourText } from '../../utils/functions/settingColours';

export function ColourSwatch({ value }) {
  const colour = settingColour(value);
  return <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"><span aria-hidden="true" className="inline-block size-6 shrink-0 rounded-md border border-gray-400 shadow-sm dark:border-gray-500" style={{ backgroundColor: colour || '#64748b' }}/><span>{colour || (value ? 'Invalid colour' : 'Not set')}</span></span>;
}
export function SettingBadge({ colour, children }) {
  const safe = settingColour(colour);
  return <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/20 px-2.5 py-1 text-xs font-semibold dark:border-white/25" style={{ backgroundColor: safe || '#64748b', color: colourText(safe) }}>{children}</span>;
}
