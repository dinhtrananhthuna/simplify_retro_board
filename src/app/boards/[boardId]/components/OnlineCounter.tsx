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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
              onlineCount > 0 
                ? "bg-white border-green-400 text-green-700 hover:bg-green-50"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            } ${className}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">
              {onlineCount}/{totalCount}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-sm">
          <div className="space-y-2">
            <div className="font-semibold text-center">
              Thành viên trong board ({totalCount})
            </div>
            
            {/* Online Members */}
            {onlineMembers.length > 0 && (
              <div>
                <div className="font-medium text-green-600 mb-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Đang online ({onlineMembers.length})
                </div>
                <div className="space-y-1 pl-3">
                  {onlineMembers.map((member) => (
                    <div key={member.email} className="flex items-center justify-between text-[11px]">
                      <span className="truncate max-w-[150px]" title={member.email}>
                        {member.email}
                      </span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                        member.role === "owner" 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {member.role === "owner" ? "Owner" : "Member"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Members */}
            {offlineMembers.length > 0 && (
              <div>
                <div className="font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Offline ({offlineMembers.length})
                </div>
                <div className="space-y-1 pl-3">
                  {offlineMembers.map((member) => (
                    <div key={member.email} className="flex items-center justify-between text-[11px] text-gray-600">
                      <span className="truncate max-w-[150px]" title={member.email}>
                        {member.email}
                      </span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                        member.role === "owner" 
                          ? "bg-gray-100 text-gray-600" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {member.role === "owner" ? "Owner" : "Member"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {members.length === 0 && (
              <div className="text-center text-gray-500 text-[11px] py-1">
                Không có thông tin thành viên
              </div>
            )}

            {/* Summary */}
            <div className="border-t pt-1 mt-2">
              <div className="text-[10px] text-gray-500 text-center">
                {onlineCount > 0 
                  ? `${onlineCount} người đang tham gia phiên làm việc`
                  : "Không có ai đang online"
                }
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 