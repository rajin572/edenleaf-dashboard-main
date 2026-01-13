import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../field";
import { Input } from "../../input";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Textarea } from "../../textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../select";
import { Checkbox } from "../../checkbox";
import { Switch } from "../../switch";
import { CalendarIcon, ChevronDownIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { MultiSelect } from "./MultiSelect";
import { FileUpload } from "./FileUpload";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = {
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
};

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean;
  controlFirst?: boolean;
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
    >[0]["field"] & {
      "aria-invalid": boolean;
      id: string;
    }
  ) => ReactNode;
};

export type FormControlFunc<
  ExtraProps extends Record<string, unknown> = Record<never, never>
> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps
) => ReactNode;

export function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal,
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel className=" text-sm font-medium" htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        );
        const control = children({
          ...field,
          id: field.name,
          "aria-invalid": fieldState.invalid,
        });
        const errorElem = fieldState.invalid && (
          <FieldError errors={[fieldState.error]} />
        );

        return (
          <Field
            data-invalid={fieldState.invalid}
            orientation={horizontal ? "horizontal" : undefined}
          >
            {controlFirst ? (
              <>
                {control}
                <FieldContent>
                  {labelElement}
                  {errorElem}
                </FieldContent>
              </>
            ) : (
              <>
                <FieldContent>{labelElement}</FieldContent>
                {control}
                {errorElem}
              </>
            )}
          </Field>
        );
      }}
    />
  );
}

export const FormInput: FormControlFunc<{
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}> = (props) => {
  const { prefix, suffix, inputClassName, placeholder, disabled, type, ...restProps } = props;

  return (
    <FormBase {...restProps}>
      {(field) => (
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center pointer-events-none">
              {prefix}
            </div>
          )}
          <Input
            className={cn(
              "border-[#E5E5E5]! bg-[#F5F5F5]! outline-none! shadow-none! ring-0! text-base! py-5!",
              prefix && "pl-10",
              suffix && "pr-10",
              inputClassName
            )}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};

export const FormTextarea: FormControlFunc<{ prefix?: ReactNode; suffix?: ReactNode; inputClassName?: string }> = (props) => {
  const { prefix, suffix, inputClassName, ...restProps } = props;

  return (
    <FormBase {...restProps}>
      {(field) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-3 flex items-start pointer-events-none">
              {prefix}
            </div>
          )}
          <Textarea
            className={cn(
              "placeholder:text-base-color/50! bg-primary-color! border! border-base-color/30! focus:border-base-color/70! outline-none! shadow! ring-0! text-base! py-2! min-h-20",
              prefix && "pl-10",
              suffix && "pr-10",
              inputClassName
            )}
            {...field}
          />
          {suffix && (
            <div className="absolute right-3 top-3 flex items-start">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};

export const FormPassword: FormControlFunc<{ prefix?: ReactNode; placeholder?: string; inputClassName?: string }> = (props) => {
  const { prefix, placeholder, inputClassName, ...restProps } = props;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <FormBase {...restProps}>
      {(field) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {prefix}
            </div>
          )}
          <Input
            className={cn(
              "placeholder:text-base-color/50! bg-primary-color! border! border-base-color/30! focus:border-base-color/70! outline-none! shadow! ring-0! text-base! py-2!",
              prefix && "pl-10",
              "pr-10", // Always add right padding for eye icon
              inputClassName
            )}
            type={isPasswordVisible ? "text" : "password"}
            placeholder={placeholder}
            {...field}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-color"
            onClick={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      )}
    </FormBase>
  );
};

export const FormSelect: FormControlFunc<{
  children: ReactNode;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}> = ({ children, placeholder = "Select an option", prefix, suffix, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {prefix}
            </div>
          )}
          <Select {...field} onValueChange={onChange}>
            <SelectTrigger
              className={cn(
                "w-full bg-primary-color! border! border-base-color/30! focus:border-base-color/70! outline-none! shadow! ring-0! text-base! py-5!",
                prefix && "pl-10",
                suffix && "pr-10"
              )}
              aria-invalid={field["aria-invalid"]}
              id={field.id}
              onBlur={onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>{children}</SelectContent>
          </Select>
          {suffix && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};

// FormMultiSelect component following FormBase pattern
export const FormMultiSelect: FormControlFunc<{
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}> = ({ options, placeholder = "Select items...", prefix, suffix, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, value, ...field }) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {prefix}
            </div>
          )}
          <MultiSelect
            {...field}
            className={cn(
              prefix && "pl-10",
              suffix && "pr-10"
            )}
            options={options}
            placeholder={placeholder}
            value={value || []}
            onChange={onChange}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};



export const FormCheckbox: FormControlFunc = (props) => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => (
        <Checkbox
          className="border-secondary-color bg-base-color/5"
          {...field}
          checked={value}
          onCheckedChange={onChange}
        />
      )}
    </FormBase>
  );
};

export const FormSwitch: FormControlFunc = (props) => {
  return (
    <FormBase {...props} horizontal>
      {({ onChange, value, ...field }) => (
        <Switch
          className="data-[state=checked]:bg-secondary-color"
          {...field}
          checked={value}
          onCheckedChange={onChange}
        />
      )}
    </FormBase>
  );
};

// FormUpload component that integrates FileUpload
export const FormUpload: FormControlFunc<{
  maxFiles?: number;
  accept?: string;
}> = ({ maxFiles = 5, accept = "image/*", ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, value, ...field }) => (
        <FileUpload
          {...field}
          maxFiles={maxFiles}
          accept={accept}
          value={value || []}
          onChange={onChange}
        />
      )}
    </FormBase>
  );
};

const CalendarDropdown = ({
  value,
  onChange,
  options,
}: {
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  options?: { value: number; label: string; disabled: boolean }[];
  [key: string]: unknown;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = options?.find((o) => String(o.value) === String(value))?.label ?? String(value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 h-7 px-2 text-sm rounded-md hover:bg-accent"
      >
        {currentLabel}
        <ChevronDownIcon className="size-3 opacity-50" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 min-w-20 bg-popover border border-border rounded-md shadow-md overflow-y-auto"
          style={{ maxHeight: "200px" }}
          onWheel={(e) => e.stopPropagation()}
        >
          {options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              className={cn(
                "w-full text-left px-3 py-1.5 text-sm hover:bg-accent cursor-pointer disabled:opacity-40 disabled:cursor-default",
                String(opt.value) === String(value) && "bg-accent font-medium"
              )}
              onClick={() => {
                onChange?.({ target: { value: String(opt.value) } } as React.ChangeEvent<HTMLSelectElement>);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FormDatePicker: FormControlFunc<{
  placeholder?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  formatString?: string;
  startMonth?: Date;
  endMonth?: Date;
}> = ({
  placeholder = "Pick a date",
  disablePast = false,
  disableFuture = false,
  formatString = "PPP",
  startMonth,
  endMonth,
  ...props
}) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const defaultStart = disablePast
      ? new Date(today.getFullYear(), 0, 1)
      : new Date(1900, 0, 1);

    const defaultEnd = disableFuture
      ? new Date(today.getFullYear(), today.getMonth() + 1, 0)
      : new Date(today.getFullYear() + 20, 11, 31);

    const disabledDates = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      if (disablePast && d < today) return true;
      if (disableFuture && d > today) return true;
      return false;
    };

    return (
      <FormBase {...props}>
        {({ onChange, value, id, "aria-invalid": ariaInvalid }) => (
          <Popover>
            <PopoverTrigger asChild>
              <button
                id={id}
                type="button"
                aria-invalid={ariaInvalid}
                className={cn(
                  "w-full h-9 flex items-center gap-2 px-3 py-2 text-base rounded-md border border-base-color/30 bg-primary-color shadow text-left",
                  "focus:outline-none focus:border-base-color/70",
                  "aria-invalid:border-destructive",
                  !value && "text-base-color/50"
                )}
              >
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                {value ? format(value as Date, formatString) : placeholder}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value as Date | undefined}
                onSelect={onChange}
                captionLayout="dropdown"
                startMonth={startMonth ?? defaultStart}
                endMonth={endMonth ?? defaultEnd}
                components={{ Dropdown: CalendarDropdown }}
                disabled={disablePast || disableFuture ? disabledDates : undefined}
              />
            </PopoverContent>
          </Popover>
        )}
      </FormBase>
    );
  };