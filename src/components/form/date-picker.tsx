import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
type PropsType = {
  id: string; name?: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption; value?: DateOption | null;
  label?: string; placeholder?: string;
  disabled?: boolean; required?: boolean; className?: string;
  "aria-invalid"?: boolean; "aria-describedby"?: string;
};
export default function DatePicker({ id, name, mode, onChange, label, defaultDate, value, placeholder, disabled=false, required=false, className='', ...aria }: PropsType) {
  const input = useRef<HTMLInputElement>(null);
  const picker = useRef<flatpickr.Instance | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(() => {
    if (!input.current) return;
    const instance = flatpickr(input.current, {
      mode: mode || "single", static: true, monthSelectorType: "static", dateFormat: "Y-m-d",
      onChange: (...args) => {
        const callbacks = Array.isArray(change.current) ? change.current : change.current ? [change.current] : [];
        callbacks.forEach(callback => callback(...args));
      },
    });
    picker.current = instance;
    return () => { instance.destroy(); picker.current = null; };
  }, [mode]);
  useEffect(() => {
    const next = value !== undefined ? value : defaultDate;
    if (next === null || next === '' || next === undefined) picker.current?.clear(false);
    else picker.current?.setDate(next, false);
  }, [value, defaultDate, mode]);
  return <div>{label && <Label htmlFor={id}>{label}</Label>}<div className="relative"><input ref={input} id={id} name={name} disabled={disabled} required={required} {...aria} placeholder={placeholder} className={'h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800 ' + className} /><span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><CalenderIcon className="size-6" aria-hidden="true" /></span></div></div>;
}
