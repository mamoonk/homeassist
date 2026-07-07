import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Select, Slider, Toggle } from '../SettingsControls';
import type { ClockDisplayType, DialStyle } from '../../../types';

const DIAL_OPTIONS = [
  { value: '1', label: '1 Classic' },
  { value: '2', label: '2 Minimal' },
  { value: '3', label: '3 Navy & Gold' },
  { value: '4', label: '4 Warm Brass' },
  { value: '5', label: '5 High Contrast' },
  { value: '6', label: '6 Neon Cyber ✨' },
  { value: '7', label: '7 Emerald' },
  { value: '8', label: '8 Rose Gold' },
  { value: '9', label: '9 Midnight OLED ✨' },
  { value: '10', label: '10 Sunset Glow ✨' },
  { value: '11', label: '11 Deep Ocean' },
  { value: '12', label: '12 Retro Diner' },
  { value: '13', label: '13 Museum Dot (Movado-inspired)' },
  { value: '14', label: '14 Diver (Rolex-inspired)' },
  { value: '15', label: '15 Seamaster (Omega-inspired)' },
  { value: '16', label: '16 Ceramic (Rado-inspired)' },
  { value: '17', label: '17 Dress Silver (Patek-inspired)' },
  { value: '18', label: '18 Racing (TAG-inspired)' },
];

export function ClockWidgetSection() {
  const displayType = useSettingsStore((s) => s.clockWidgetDisplayType);
  const showHourNumbers = useSettingsStore((s) => s.clockWidgetShowHourNumbers);
  const dialStyle = useSettingsStore((s) => s.clockWidgetDialStyle);
  const digitalScale = useSettingsStore((s) => s.clockDigitalScale);
  const analogDigitalScale = useSettingsStore((s) => s.clockAnalogDigitalScale);
  const analogDialScale = useSettingsStore((s) => s.clockAnalogDialScale);
  const scaleLinked = useSettingsStore((s) => s.clockAnalogScaleLinked);
  const worldClocksEnabled = useSettingsStore((s) => s.worldClocksEnabled);
  const barDisplayType = useSettingsStore((s) => s.clockDisplayType);
  const update = useSettingsStore((s) => s.update);

  const anyDigitalDisplay = displayType === 'digital' || (worldClocksEnabled && barDisplayType === 'digital');

  return (
    <SettingsCard title="Clock widget">
      <Field label="Display">
        <Select
          value={displayType}
          onChange={(v) => update({ clockWidgetDisplayType: v as ClockDisplayType })}
          options={[
            { value: 'digital', label: 'Digital' },
            { value: 'analog', label: 'Analog' },
          ]}
        />
      </Field>
      <Field
        label={`Digital clock scale (${digitalScale.toFixed(1)}×)`}
        hint={
          anyDigitalDisplay
            ? 'Flip-clock size in digital mode — clock widget and world clocks bar.'
            : '⚠ No effect right now: the clock widget (and world clocks bar) are set to Analog. Switch a Display to Digital to see this scale.'
        }
      >
        <Slider
          value={digitalScale}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(v) => update({ clockDigitalScale: v })}
          format={(v) => `${v.toFixed(1)}×`}
        />
      </Field>
      <Toggle
        checked={scaleLinked}
        onChange={(v) =>
          update(
            v
              ? { clockAnalogScaleLinked: true, clockAnalogDigitalScale: analogDialScale }
              : { clockAnalogScaleLinked: false },
          )
        }
        label="Scale analog dial and its digital time together"
      />
      {scaleLinked ? (
        <Field
          label={`Analog clock scale (${analogDialScale.toFixed(1)}×)`}
          hint="Scales the dial and the digital time below it together — clock widget and world clocks bar."
        >
          <Slider
            value={analogDialScale}
            min={0.5}
            max={3}
            step={0.1}
            onChange={(v) => update({ clockAnalogDialScale: v, clockAnalogDigitalScale: v })}
            format={(v) => `${v.toFixed(1)}×`}
          />
        </Field>
      ) : (
        <>
          <Field
            label={`Analog dial scale (${analogDialScale.toFixed(1)}×)`}
            hint="Size of the analog dial — clock widget and world clocks bar."
          >
            <Slider
              value={analogDialScale}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(v) => update({ clockAnalogDialScale: v })}
              format={(v) => `${v.toFixed(1)}×`}
            />
          </Field>
          <Field
            label={`Digital time under analog dials (${analogDigitalScale.toFixed(1)}×)`}
            hint="Flip-clock size below analog dials — clock widget and world clocks bar."
          >
            <Slider
              value={analogDigitalScale}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(v) => update({ clockAnalogDigitalScale: v })}
              format={(v) => `${v.toFixed(1)}×`}
            />
          </Field>
        </>
      )}
      {displayType === 'analog' && (
        <>
          <Field label="Dial style">
            <Select
              value={String(dialStyle)}
              onChange={(v) => update({ clockWidgetDialStyle: Number(v) as DialStyle })}
              options={DIAL_OPTIONS}
            />
          </Field>
          <Toggle
            checked={showHourNumbers}
            onChange={(v) => update({ clockWidgetShowHourNumbers: v })}
            label="Show hour numbers"
          />
        </>
      )}
    </SettingsCard>
  );
}
