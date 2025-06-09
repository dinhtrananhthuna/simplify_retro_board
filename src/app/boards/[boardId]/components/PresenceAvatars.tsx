"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";


interface Member {
  email: string;
  role: string;
  online?: boolean;
}

interface PresenceAvatarsProps {
  members: Member[];
  maxVisible?: number;
  className?: string;
}

// Animation variants
const avatarVariants = {
  hidden: { 
    scale: 0,
    opacity: 0,
    rotateY: -180
  },
  visible: { 
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.6
    }
  },
  exit: { 
    scale: 0,
    opacity: 0,
    rotateY: 180,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const onlineIndicatorVariants = {
  offline: { 
    scale: 1,
    backgroundColor: "#9ca3af",
    boxShadow: "0 0 0 0 rgba(34, 197, 94, 0)"
  },
  online: { 
    scale: [1, 1.2, 1],
    backgroundColor: "#22c55e",
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0.7)",
      "0 0 0 8px rgba(34, 197, 94, 0)",
      "0 0 0 0 rgba(34, 197, 94, 0)"
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut"
    }
  }
};

const statusUpdateVariants = {
  initial: { scale: 1 },
  updated: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

export default function PresenceAvatars({ 
  members, 
  maxVisible = 5, 
  className = "" 
}: PresenceAvatarsProps) {
  const memberStatusHistoryRef = useRef<Record<string, boolean>>({});
  const [justUpdated, setJustUpdated] = useState<Record<string, boolean>>({});

  // Track status changes for animations
  useEffect(() => {
    const newHistory: Record<string, boolean> = {};
    const updates: Record<string, boolean> = {};
    const currentHistory = memberStatusHistoryRef.current;

    members.forEach(member => {
      const prevStatus = currentHistory[member.email];
      const currentStatus = member.online || false;
      
      newHistory[member.email] = currentStatus;
      
      // If status changed, trigger update animation
      if (prevStatus !== undefined && prevStatus !== currentStatus) {
        updates[member.email] = true;
      }
    });

    // Only update if there are actual changes
    const hasChanges = members.some(member => {
      const prevStatus = currentHistory[member.email];
      const currentStatus = member.online || false;
      return prevStatus !== currentStatus;
    });

    if (hasChanges) {
      memberStatusHistoryRef.current = newHistory;
      setJustUpdated(updates);

      // Clear update animations after delay
      if (Object.keys(updates).length > 0) {
        const timer = setTimeout(() => {
          setJustUpdated({});
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [members]);

  const visibleMembers = useMemo(() => members.slice(0, maxVisible), [members, maxVisible]);
  const extraMembers = useMemo(() => members.length > maxVisible ? members.slice(maxVisible) : [], [members, maxVisible]);

  return (
    <TooltipProvider>
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >


        {/* Member Avatars */}
        <div className="flex items-center -space-x-2">
          <AnimatePresence mode="popLayout">
            {visibleMembers.map((member, index) => (
              <motion.div
                key={member.email}
                variants={avatarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
                style={{ zIndex: visibleMembers.length - index }}
                className="relative"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="relative"
                      variants={statusUpdateVariants}
                      initial="initial"
                      animate={justUpdated[member.email] ? "updated" : "initial"}
                    >
                      <motion.div
                        whileHover={{ 
                          scale: 1.1,
                          zIndex: 50,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Avatar
                          className={`w-8 h-8 border-2 border-white shadow-md transition-all duration-300 ${
                            member.role === "owner"
                              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black ring-2 ring-yellow-300"
                              : member.online
                              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ring-2 ring-blue-300"
                              : "bg-gradient-to-br from-gray-400 to-gray-600 text-white ring-2 ring-gray-300"
                          }`}
                        >
                          <AvatarFallback className="font-semibold text-xs">
                            {member.email?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>

                      {/* Online/Offline Indicator */}
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                        variants={onlineIndicatorVariants}
                        animate={member.online ? "online" : "offline"}
                      />

                      {/* Owner Crown */}
                      {member.role === "owner" && (
                        <motion.div
                          className="absolute -top-1 -right-1 text-yellow-500"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            delay: index * 0.1 + 0.3,
                            type: "spring",
                            stiffness: 400
                          }}
                        >
                          <span className="text-xs">👑</span>
                        </motion.div>
                      )}

                      {/* Just joined indicator */}
                      {justUpdated[member.email] && member.online && (
                        <motion.div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.8 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="bg-green-500 text-white text-[8px] px-1 py-0.5 rounded-full font-medium">
                            Online
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-xs">
                    <div className="space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        {member.email}
                        {member.role === "owner" && <span className="text-yellow-500">👑</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={member.role === "owner" ? "text-yellow-600 font-bold" : "text-gray-600"}>
                          {member.role === "owner" ? "Owner" : "Member"}
                        </span>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <motion.div
                            className={`w-2 h-2 rounded-full ${member.online ? "bg-green-500" : "bg-gray-400"}`}
                            animate={member.online ? {
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1]
                            } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span className={member.online ? "text-green-600" : "text-gray-500"}>
                            {member.online ? "Đang online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}

            {/* Extra Members Count */}
            {extraMembers.length > 0 && (
              <motion.div
                key="extra-members"
                variants={avatarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ zIndex: 0 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ 
                        scale: 1.1,
                        zIndex: 50,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Avatar className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 text-white border-2 border-white shadow-md ring-2 ring-gray-400">
                        <AvatarFallback className="font-bold text-xs">
                          +{extraMembers.length}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-[300px]">
                    <div className="space-y-2">
                      <div className="font-semibold">Thành viên khác ({extraMembers.length}):</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {extraMembers.map((member) => (
                          <div key={member.email} className="flex items-center justify-between gap-2">
                            <span className="truncate">{member.email}</span>
                            <div className="flex items-center gap-1 text-[10px]">
                              {member.role === "owner" && <span className="text-yellow-500">👑</span>}
                              <span className={member.role === "owner" ? "text-yellow-600" : "text-gray-600"}>
                                {member.role === "owner" ? "Owner" : "Member"}
                              </span>
                              <motion.div
                                className={`w-1.5 h-1.5 rounded-full ml-1 ${member.online ? "bg-green-500" : "bg-gray-400"}`}
                                animate={member.online ? {
                                  scale: [1, 1.3, 1],
                                  opacity: [1, 0.7, 1]
                                } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </motion.div>
    </TooltipProvider>
  );
} 