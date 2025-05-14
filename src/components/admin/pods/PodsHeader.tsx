
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { User } from "@/types/user";

interface PodsHeaderProps {
  user: User | null;
}

export const PodsHeader: React.FC<PodsHeaderProps> = ({ user }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pods</h1>
        <p className="text-muted-foreground">Gestiona los contenedores desplegados</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-right">
          <div className="text-muted-foreground">Saldo</div>
          <div className="font-semibold">
            {typeof user?.balance === 'number' && user?.balance === Infinity ? '∞ €' : `${user?.balance?.toFixed(2) || 0} €`}
          </div>
        </div>
        
        <Link to="/admin/pods/deploy">
          <Button className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>Deploy</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
