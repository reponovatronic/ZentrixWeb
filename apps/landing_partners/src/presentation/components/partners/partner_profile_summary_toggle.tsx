import { useId } from "react";

type PartnerProfileSummaryToggleProps = {
  checked: boolean;
  title: string;
  description: string;
  onChange: (value: boolean) => void;
};

export function PartnerProfileSummaryToggle({
  checked,
  title,
  description,
  onChange,
}: PartnerProfileSummaryToggleProps) {
  const baseId = useId();
  return (
    <div className="pp-summary-toggle">
      <div className="pp-summary-toggle-copy">
        <p className="pp-summary-toggle-title" id={`${baseId}-t`}>
          {title}
        </p>
        <p className="pp-summary-toggle-desc" id={`${baseId}-d`}>
          {description}
        </p>
      </div>
      <button
        type="button"
        className="pp-switch"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${baseId}-t`}
        aria-describedby={`${baseId}-d`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
