import * as React from "react";
import Link from "next/link";
import { cn, initial } from "@/lib/utils";

/* ----------------------------- Button ----------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-400 text-amber-950 shadow-sm shadow-amber-200 hover:bg-amber-300",
  secondary:
    "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50",
  ghost: "text-amber-700 hover:bg-amber-100/70",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

function classesFor(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={classesFor(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
}) {
  return (
    <Link href={href} className={classesFor(variant, size, className)} {...props} />
  );
}

/* ----------------------------- Inputs ----------------------------- */

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-semibold text-stone-700", className)}
      {...props}
    />
  );
}

const fieldBase =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 transition focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(fieldBase, "min-h-28 resize-y", className)} {...props} />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(fieldBase, "appearance-none", className)} {...props} />;
});

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </div>
  );
}

/* ----------------------------- Badge ------------------------------ */

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------- Avatar ----------------------------- */

export function Avatar({
  name,
  image,
  size = 40,
  className,
}: {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={name ?? ""}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-amber-200 font-bold text-amber-800",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial(name)}
    </div>
  );
}

/* ----------------------------- Card ------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-stone-100 bg-white p-6 shadow-sm shadow-stone-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
