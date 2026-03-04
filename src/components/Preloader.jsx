import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Preloader() {
  const [loading, setLoading] = useState(true)
  const [ldrsLoaded, setLdrsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    let importTimeout

    const loadLdrs = async () => {
      try {
        // Only load ldrs on client side
        if (typeof window !== 'undefined') {
          const { infinity } = await import('ldrs')
          if (!cancelled && infinity && typeof infinity.register === 'function') {
            infinity.register()
            setLdrsLoaded(true)
          }
        }
      } catch (err) {
        console.error('Failed to load ldrs:', err)
      }
    }

    // Load ldrs with timeout
    importTimeout = setTimeout(() => {
      loadLdrs()
    }, 100)

    // Set loading to false after 2 seconds (reduced from 3 for better UX)
    const loadingTimer = setTimeout(() => {
      if (!cancelled) {
        setLoading(false)
      }
    }, 2000)

    return () => {
      cancelled = true
      clearTimeout(importTimeout)
      clearTimeout(loadingTimer)
    }
  }, [])

  if (!loading) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.8, duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fdfcf8]"
      style={{ willChange: 'opacity' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center space-y-4"
        style={{ minWidth: '120px', minHeight: '120px' }}
      >
        {ldrsLoaded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* ldrs custom element */}
            <l-infinity
              size="45"
              stroke="3.5"
              strokeLength="0.15"
              bgOpacity="0.1"
              speed="1.3"
              color="#fbbf24"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-12 h-12 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin"
          />
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-yellow-400 text-sm font-medium"
        >
          Loading...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}