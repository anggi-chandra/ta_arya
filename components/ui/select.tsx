import * as React from "react";
import { cn } from "@/lib/utils";

type SelectRootProps = {
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
} & React.OptionHTMLAttributes<HTMLOptionElement>;

type SelectContentProps = {
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

type SelectTriggerProps = React.HTMLAttributes<HTMLDivElement>;

type SelectValueProps = {
  placeholder?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

// Subkomponen hanya sebagai penanda dan kompatibilitas dengan API yang ada.
const SelectItem: React.FC<SelectItemProps> = ({ value, children, ...props }) => {
  // Ketika dirender langsung (di luar Select), jangan tampilkan apa pun.
  // Select akan memproses komponen ini menjadi <option>.
  return <option value={value} {...props}>{children}</option>;
};

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return <>{children}</>; // Hanya wadah untuk SelectItem
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className, ...props }) => {
  // Disembunyikan karena kita menggunakan native <select>.
  return (
    <div className={cn("hidden", className)} {...props}>
      {children}
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  // Tidak dirender; placeholder ditangani oleh <select> langsung.
  return null;
};

function collectOptions(children: React.ReactNode): React.ReactElement<"option">[] {
  const options: React.ReactElement<"option">[] = [];

  const walk = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!child) return;
      if (React.isValidElement(child)) {
        // Jika ini SelectItem, sudah berupa <option> karena implementasi di atas
        if (child.type === SelectItem || (child.type as any)?.name === "SelectItem") {
          options.push(child as React.ReactElement<"option">);
        }
        // Jika ini SelectContent, jelajahi anak-anaknya
        else if (child.type === SelectContent || (child.type as any)?.name === "SelectContent") {
          walk(child.props.children);
        }
        // Jelajahi anak-anak lain juga
        else if (child.props && child.props.children) {
          walk(child.props.children);
        }
      }
    });
  };

  walk(children);
  return options;
}

const Select = React.forwardRef<HTMLSelectElement, SelectRootProps>(
  ({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const options = collectOptions(children);

    return (
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {options.length === 0 ? (
          // Fallback: jika tidak ada SelectItem, tetap render children apa adanya
          React.Children.map(children, (child) => child as React.ReactElement)
        ) : (
          options
        )}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };