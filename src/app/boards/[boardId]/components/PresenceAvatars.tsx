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
                    <Avatar
                      className={`w-8 h-8 border-2 shadow-sm transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-md ${
                        member.role === "owner"
                          ? "bg-white border-yellow-400 ring-1 ring-yellow-300/50"
                          : member.online
                          ? "bg-white border-green-400 ring-1 ring-green-300/50"
                          : "bg-white border-gray-300 ring-1 ring-gray-200/50"
                      }`}
                    >
                      <AvatarFallback className={`font-bold text-xs ${
                        member.role === "owner"
                          ? "text-yellow-700"
                          : member.online
                          ? "text-green-700"
                          : "text-gray-600"
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
                <TooltipContent side="bottom" className="text-xs">
                  <div className="text-center">
                    <div className="font-semibold">{member.email}</div>
                    <div className="text-xs text-gray-400">
                      {member.role === "owner" ? "Owner" : "Member"} • {member.online ? "Online" : "Offline"}
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
                <TooltipContent side="bottom" className="text-xs">
                  <div>
                    <div className="font-semibold mb-1">
                      Còn {extraCount} thành viên khác
                    </div>
                    <div className="text-xs space-y-1">
                      {members.slice(maxVisible).map((member) => (
                        <div key={member.email} className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              member.online ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <span>{member.email}</span>
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