"use client";
import { Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Member {
  email: string;
  role: string;
  online?: boolean;
}

interface OnlineCounterProps {
  onlineCount: number;
  totalCount: number;
  members?: Member[];
  className?: string;
}

export default function OnlineCounter({
  onlineCount,
  totalCount,
  members = [],
  className = ""
}: OnlineCounterProps) {
  const onlineMembers = members.filter(m => m.online);
  const offlineMembers = members.filter(m => !m.online);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
              onlineCount > 0 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 text-green-700 hover:from-green-100 hover:to-emerald-100"
                : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 text-gray-600 hover:from-gray-100 hover:to-gray-200"
            } ${className}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">
              {onlineCount}/{totalCount}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="space-y-3 min-w-[280px] max-w-[350px]">
            <div className="font-bold text-center text-white border-b border-gray-600 pb-2">
              📋 Thành viên trong board ({totalCount})
            </div>
            
            {/* Online Members */}
            {onlineMembers.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold text-green-300 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm shadow-green-400/50"></div>
                  Đang online ({onlineMembers.length})
                </div>
                <div className="space-y-1.5 pl-4 max-h-[150px] overflow-y-auto">
                  {onlineMembers.map((member) => (
                    <div key={member.email} className="flex items-center justify-between group">
                      <span className="text-white text-sm truncate max-w-[180px]" title={member.email}>
                        {member.email}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === "owner" 
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" 
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {member.role === "owner" ? "👑 Owner" : "👤 Member"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Members */}
            {offlineMembers.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold text-gray-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  Offline ({offlineMembers.length})
                </div>
                <div className="space-y-1.5 pl-4 max-h-[120px] overflow-y-auto">
                  {offlineMembers.map((member) => (
                    <div key={member.email} className="flex items-center justify-between group opacity-70">
                      <span className="text-gray-300 text-sm truncate max-w-[180px]" title={member.email}>
                        {member.email}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === "owner" 
                          ? "bg-gray-600/30 text-gray-400 border border-gray-600/50" 
                          : "bg-gray-700/30 text-gray-500 border border-gray-700/50"
                      }`}>
                        {member.role === "owner" ? "👑 Owner" : "👤 Member"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {members.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <div className="text-sm">Không có thông tin thành viên</div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-gray-600 pt-2 mt-3">
              <div className="text-xs text-gray-300 text-center bg-gray-800/50 rounded-lg py-2 px-3">
                {onlineCount > 0 
                  ? `💡 ${onlineCount} người đang tham gia phiên làm việc`
                  : "😴 Không có ai đang online"
                }
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 