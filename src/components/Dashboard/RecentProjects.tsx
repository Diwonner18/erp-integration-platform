
import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';

const RecentProjects = () => {
  const recentProjects: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento':
        return 'bg-green-100 text-green-800';
      case 'Aguardando Aprovação':
        return 'bg-yellow-100 text-yellow-800';
      case 'Planejamento':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold font-title text-foreground">Projetos Recentes</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {recentProjects.map((project) => (
          <div key={project.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">{project.title}</h4>
                
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <User className="w-4 h-4 mr-2" />
                  {project.client}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {project.location}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(project.date).toLocaleDateString('pt-BR')}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-2">Progresso:</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
