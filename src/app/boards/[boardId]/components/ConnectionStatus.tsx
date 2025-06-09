"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, AlertCircle, CheckCircle } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting?: boolean;
  onlineCount?: number;
  className?: string;
}

const statusVariants = {
  connected: {
    scale: 1,
    opacity: 1,
    backgroundColor: "#10b981",
    borderColor: "#10b981",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  disconnected: {
    scale: [1, 1.1, 1],
    opacity: 1,
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
    transition: {
      scale: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  },
  connecting: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const iconVariants = {
  connected: {
    rotate: 0,
    scale: 1,
    transition: { duration: 0.3 }
  },
  disconnected: {
    rotate: [0, -10, 10, 0],
    scale: 1,
    transition: {
      rotate: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  },
  connecting: {
    rotate: 360,
    scale: 1,
    transition: {
      rotate: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }
};

const pulseVariants = {
  connected: {
    scale: [1, 1.4, 1],
    opacity: [0.8, 0, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut"
    }
  },
  disconnected: {
    scale: 1,
    opacity: 0
  },
  connecting: {
    scale: [1, 1.2, 1],
    opacity: [0.6, 0, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
};

export default function ConnectionStatus({
  isConnected,
  isConnecting = false,
  onlineCount = 0,
  className = ""
}: ConnectionStatusProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastConnectionTime, setLastConnectionTime] = useState<Date | null>(null);

  // Track connection changes
  useEffect(() => {
    if (isConnected && !isConnecting) {
      setLastConnectionTime(new Date());
    }
  }, [isConnected, isConnecting]);

  const getStatus = () => {
    if (isConnecting) return "connecting";
    if (isConnected) return "connected";
    return "disconnected";
  };

  const getStatusText = () => {
    if (isConnecting) return "Đang kết nối...";
    if (isConnected) return "Đã kết nối";
    return "Mất kết nối";
  };

  const getStatusIcon = () => {
    if (isConnecting) return AlertCircle;
    if (isConnected) return CheckCircle;
    return WifiOff;
  };

  const status = getStatus();
  const StatusIcon = getStatusIcon();

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border-2 cursor-pointer select-none"
        variants={statusVariants}
        animate={status}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Pulse effect background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-current"
          variants={pulseVariants}
          animate={status}
        />

        {/* Status icon */}
        <motion.div variants={iconVariants} animate={status}>
          <StatusIcon className="w-3 h-3 text-white" />
        </motion.div>

        {/* Status text */}
        <span className="text-xs font-medium text-white">
          {getStatusText()}
        </span>

        {/* Online count (only when connected) */}
        <AnimatePresence>
          {isConnected && onlineCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1"
            >
              <span className="text-white/80">•</span>
              <span className="text-xs font-medium text-white">
                {onlineCount} online
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detailed tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-gray-700 max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-400" : "bg-red-400"
                    }`}
                    animate={isConnected ? {
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Trạng thái kết nối
                </div>
                <div className="text-gray-300">
                  {isConnecting && "Đang thiết lập kết nối real-time..."}
                  {isConnected && !isConnecting && "Kết nối real-time đang hoạt động"}
                  {!isConnected && !isConnecting && "Mất kết nối real-time"}
                </div>
                {isConnected && onlineCount > 0 && (
                  <div className="text-gray-300">
                    {onlineCount} thành viên đang online
                  </div>
                )}
                {lastConnectionTime && isConnected && (
                  <div className="text-gray-400 text-[10px]">
                    Kết nối lần cuối: {lastConnectionTime.toLocaleTimeString('vi-VN')}
                  </div>
                )}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 