import React from 'react';
import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

type ColorPalette = 'primary' | 'neutral' | 'success' | 'error' | 'warning';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Add custom CSS classes - e.g tailwind
   * Default: false
   */
  className?: string;
  disableShadow?: boolean;
  /**
   *  What kind of palette color to use.
   *  Default: 'brand'
   */
  color?: ColorPalette;

  /**
   * What variant to use.
   * Default: 'filled'
   */
  variant?: 'text' | 'outlined' | 'filled';
  /**
   * How large should the button be.
   * Default: 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Is button disabled.
   * Default: false
   */
  disabled?: boolean;
  /**
   * Optional left button icon
   */
  iconLeft?: React.ReactNode;
  /**
   * Optional right button icon
   */
  iconRight?: React.ReactNode;
  /**
   * Optional click handler
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Option button type
   */
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  /**
   * Optional Full width class
   * default: false
   */
  fullWidth?: boolean;
  /**
   * Optional is component loading?
   * default: false
   */
  isLoading?: boolean;
}

function createFilledClass(props: ButtonProps) {
  const { color, disableShadow } = props;
  return classNames(
    'font-semibold rounded outline-none focus:ring-2 active:ring ring-inset disabled:bg-gray-400 disabled:text-white',
    {
      ['shadow hover:shadow-md active:shadow-none']: !disableShadow,
      [`text-white font-semibold bg-sky-400 hover:bg-sky-500 focus:ring-sky-300 active:bg-brand-500`]: color === 'primary',
      [`text-white font-semibold hover:bg-red-600 bg-red-500 focus:ring-red-600 active:bg-red-600`]:
        color === 'error',
      [`text-white font-semibold bg-amber-400 focus:ring-amber-400 active:bg-amber-400`]:
        color === 'warning',
      [`text-white font-semibold hover:bg-green-600 bg-green-500 focus:ring-green-600 active:bg-green-600`]:
        color === 'success',
    }
  );
}

function createOutlineClass(props: ButtonProps) {
  const { color, disableShadow } = props;
  return classNames(
    'rounded font-semibold ring-2 ring-inset outline-none focus:ring-2 active:ring disabled:ring-gray-300 disabled:text-gray-400',
    {
      ['shadow hover:shadow-md active:shadow-none']: !disableShadow,
      ['text-sky-500 font-semibold ring-2 ring-sky-500 focus:ring-3 focus:ring-sky-500 active:ring-sky-100 active:bg-sky-100']:
        color === 'primary',
      ['text-red-400 font-semibold ring-red-400 focus:ring-red-300 active:ring-red-300']:
        color === 'error',
      ['text-amber-400 font-semibold ring-amber-400 focus:ring-amber-400 active:ring-amber-300']:
        color === 'warning',
      ['text-green-500 font-semibold ring-green-500 focus:ring-green-600 active:ring-green-400']:
        color === 'success',
    }
  );
}

function createTextClass(props: ButtonProps) {
  const { color = 'primary' } = props;
  return classNames(
    'bg-transparent font-medium underline-mt-2 active:underline active:underline-bold focus:underline focus:underline-bold hover:underline hover:underline-bold disabled:text-neutral-400',
    {
      [`text-sky-500 active:text-sky-600`]: color === 'primary',
      [`text-red-500 active:text-error-dark`]: color === 'error',
      [`text-amber-500 active:text-warning-dark`]: color === 'warning',
      [`text-green-500 active:text-success-dark`]: color === 'success'
    }
  );
}

function createVariantClass(props: ButtonProps): string {
  const { variant = 'filled'} = props;
  switch (variant) {
    case 'outlined':
      return createOutlineClass(props);
    case 'text':
      return createTextClass(props);
    case 'filled':
    default:
      return createFilledClass(props);
  }
}

/**
 * brand UI component for user interaction
 */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      fullWidth = false,
      size = 'medium',
      children,
      color,
      variant,
      iconLeft,
      iconRight,
      disableShadow,
      isLoading,
      ...rest
    } = props;
    // todo use memo, only recalculate if variant/color change
    const variantClass = createVariantClass(props);
    const buttonClasses = className
      ? `${variantClass} ${className}`
      : variantClass;
    return (
      <button
        ref={ref}
        type="button"
        className={classNames(
          `focus:outline-none text-base flex items-center justify-center transition focus:z-10 ${buttonClasses}`,
          {
            ['py-2.5 px-4']: size === 'small',
            ['py-3 px-5']: size === 'medium',
            ['py-4 px-8']: size === 'large',
            ['pointer-events-none']: rest.disabled,
            ['w-full']: fullWidth,
          }
        )}
        {...rest}
      >
        {iconLeft && (
          <span
            className={classNames('inline-flex mr-2', {
              ['text-secondary']: variant === 'text',
            })}
          >
            {iconLeft}
          </span>
        )}
        {children}
        {iconRight && (
          <span
            className={classNames('inline-flex ml-2', {
              ['text-secondary']: variant === 'text',
            })}
          >
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);