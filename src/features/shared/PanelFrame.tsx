import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

import { cx } from '../../lib/cx.ts'

type PanelFrameProps = PropsWithChildren<{
  title: string
  subtitle?: string
  kicker?: string | null
  tilt?: 'left' | 'none' | 'right'
  className?: string
}>

export function PanelFrame({
  title,
  subtitle,
  kicker = 'Planlegger',
  tilt = 'none',
  className,
  children,
}: PanelFrameProps) {
  const rotate = tilt === 'left' ? -0.7 : tilt === 'right' ? 0.7 : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, rotate }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={cx('paper-panel flex min-h-[18rem] flex-col gap-4 p-4 md:p-5', className)}
    >
      <header className="space-y-1">
        {kicker ? <p className="panel-kicker">{kicker}</p> : null}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="scribble-label text-[1.4rem] leading-none">{title}</h2>
            {subtitle ? (
              <p className="mt-2 max-w-[28ch] text-[0.98rem] text-[color:var(--foreground-soft)]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <span aria-hidden="true" className="scribble-mark">
            *
          </span>
        </div>
      </header>
      {children}
    </motion.section>
  )
}
