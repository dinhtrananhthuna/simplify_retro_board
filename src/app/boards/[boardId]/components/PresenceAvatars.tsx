"use client";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export default function PresenceAvatars({ 
  members, 
  maxVisible = 5, 
  className = "" 
}: PresenceAvatarsProps) {
  const visibleMembers = useMemo(() => members.slice(0, maxVisible), [members, maxVisible]);
  const extraCount = members.length > maxVisible ? members.length - maxVisible : 0;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Member Avatars */}
        <div className="flex items-center -space-x-2">
          {visibleMembers.map((member, index) => (
            <div
              key={member.email}
              style={{ zIndex: visibleMembers.length - index }}
              className="relative"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="w-8 h-8 shadow-sm transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-md">
                      <AvatarFallback className={`font-bold text-xs text-white ${
                        member.role === "owner"
                          ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                          : member.online
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : "bg-gradient-to-br from-gray-500 to-gray-700"
                      }`}>
                        {member.email?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Online/Offline Indicator */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        member.online ? "bg-green-500 online-indicator" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        member.online ? "bg-green-400 shadow-sm shadow-green-400/50" : "bg-gray-500"
                      }`} />
                      <span className="font-semibold text-white truncate">
                        {member.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === "owner" 
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" 
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {member.role === "owner" ? "👑 Owner" : "👤 Member"}
                      </span>
                      <span className={`text-xs font-medium ${
                        member.online ? "text-green-300" : "text-gray-400"
                      }`}>
                        {member.online ? "🟢 Online" : "⚫ Offline"}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}

          {/* Extra Members Count */}
          {extraCount > 0 && (
            <div
              style={{ zIndex: 0 }}
              className="relative"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                  >
                    <span className="text-xs font-semibold text-gray-700">
                      +{extraCount}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="min-w-[200px]">
                    <div className="font-semibold mb-3 text-white border-b border-gray-600 pb-2">
                      +{extraCount} thành viên khác
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {members.slice(maxVisible).map((member) => (
                        <div key={member.email} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              member.online ? "bg-green-400 shadow-sm shadow-green-400/50" : "bg-gray-500"
                            }`} />
                            <span className="text-white text-sm truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              member.role === "owner" 
                                ? "bg-yellow-500/20 text-yellow-300" 
                                : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {member.role === "owner" ? "👑" : "👤"}
                            </span>
                            <span className={`text-xs ${
                              member.online ? "text-green-300" : "text-gray-400"
                            }`}>
                              {member.online ? "🟢" : "⚫"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
} 